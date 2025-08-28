import { XeroClient, TokenSet } from 'xero-node';
import { db } from './db';
import { 
  xeroConfig, 
  xeroInvoiceSync, 
  xeroContactSync, 
  xeroBankReconciliation,
  xeroSyncLog,
  invoices,
  participants,
  staff,
  type Invoice
} from '@shared/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';
import cron from 'node-cron';

// Xero OAuth2 configuration
const XERO_CLIENT_ID = process.env.XERO_CLIENT_ID || '';
const XERO_CLIENT_SECRET = process.env.XERO_CLIENT_SECRET || '';
const XERO_REDIRECT_URI = process.env.XERO_REDIRECT_URI || 'http://localhost:5000/api/xero/callback';
const XERO_SCOPES = 'openid profile email accounting.transactions accounting.contacts accounting.settings offline_access';

export class XeroService {
  private xeroClient: XeroClient;
  
  constructor() {
    this.xeroClient = new XeroClient({
      clientId: XERO_CLIENT_ID,
      clientSecret: XERO_CLIENT_SECRET,
      redirectUris: [XERO_REDIRECT_URI],
      scopes: XERO_SCOPES.split(' ')
    });
  }

  // OAuth2 Flow
  async getAuthorizationUrl(): Promise<string> {
    return this.xeroClient.buildConsentUrl();
  }

  async handleCallback(code: string): Promise<TokenSet> {
    const tokenSet = await this.xeroClient.apiCallback(code);
    await this.saveTokens(tokenSet);
    return tokenSet;
  }

  private async saveTokens(tokenSet: TokenSet) {
    try {
      const tenants = await this.xeroClient.updateTenants();
      
      for (const tenant of tenants) {
        const existing = await db.select()
          .from(xeroConfig)
          .where(eq(xeroConfig.tenantId, tenant.tenantId))
          .limit(1);

        const configData = {
          organizationId: tenant.tenantId,
          tenantId: tenant.tenantId,
          tenantName: tenant.tenantName,
          tenantType: tenant.tenantType,
          accessToken: tokenSet.access_token,
          refreshToken: tokenSet.refresh_token,
          tokenExpiresAt: new Date(Date.now() + (tokenSet.expires_in || 1800) * 1000),
          scopes: XERO_SCOPES.split(' '),
          isActive: true,
        };

        if (existing.length > 0) {
          await db.update(xeroConfig)
            .set({
              ...configData,
              updatedAt: new Date()
            })
            .where(eq(xeroConfig.id, existing[0].id));
        } else {
          await db.insert(xeroConfig).values(configData);
        }
      }
    } catch (error) {
      console.error('Error saving Xero tokens:', error);
      throw error;
    }
  }

  private async refreshAccessToken(): Promise<void> {
    const configs = await db.select()
      .from(xeroConfig)
      .where(eq(xeroConfig.isActive, true))
      .limit(1);

    if (configs.length === 0) {
      throw new Error('No active Xero configuration found');
    }

    const config = configs[0];
    
    if (!config.refreshToken) {
      throw new Error('No refresh token available');
    }

    const tokenSet = await this.xeroClient.refreshToken();
    await this.saveTokens(tokenSet);
  }

  private async ensureValidToken(): Promise<void> {
    const configs = await db.select()
      .from(xeroConfig)
      .where(eq(xeroConfig.isActive, true))
      .limit(1);

    if (configs.length === 0) {
      throw new Error('No active Xero configuration found');
    }

    const config = configs[0];
    
    if (!config.tokenExpiresAt || config.tokenExpiresAt < new Date()) {
      await this.refreshAccessToken();
    } else if (config.accessToken) {
      this.xeroClient.setTokenSet({
        access_token: config.accessToken,
        refresh_token: config.refreshToken || '',
        expires_in: Math.floor((config.tokenExpiresAt.getTime() - Date.now()) / 1000)
      });
    }
  }

  // Invoice Syncing
  async syncInvoiceToXero(invoiceId: string): Promise<void> {
    await this.ensureValidToken();
    
    const syncLogId = await this.createSyncLog('invoices', 'to_xero');
    
    try {
      // Get invoice from database
      const [invoice] = await db.select()
        .from(invoices)
        .where(eq(invoices.id, invoiceId))
        .limit(1);

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Get or create Xero contact
      const xeroContactId = await this.ensureXeroContact(invoice.participantId);

      // Create Xero invoice object
      const xeroInvoice = {
        type: 'ACCREC' as any,
        contact: { contactID: xeroContactId },
        lineItems: [{
          description: `NDIS Services - Invoice ${invoice.invoiceNumber}`,
          quantity: 1,
          unitAmount: parseFloat(invoice.total || '0'),
          accountCode: '200', // Default sales account
          taxType: 'EXEMPTEXPORT' as any // Tax exempt for NDIS
        }],
        date: invoice.issueDate ? new Date(invoice.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        reference: invoice.invoiceNumber,
        status: 'AUTHORISED' as any,
        currencyCode: 'AUD' as any
      };

      // Get active tenant
      const tenants = await this.xeroClient.updateTenants();
      if (tenants.length === 0) {
        throw new Error('No Xero tenants available');
      }

      // Create invoice in Xero
      const response = await this.xeroClient.accountingApi.createInvoices(
        tenants[0].tenantId,
        { invoices: [xeroInvoice] }
      );

      if (response.body.invoices && response.body.invoices.length > 0) {
        const createdInvoice = response.body.invoices[0];
        
        // Save sync record
        await db.insert(xeroInvoiceSync).values({
          invoiceId: invoiceId,
          xeroInvoiceId: createdInvoice.invoiceID,
          xeroInvoiceNumber: createdInvoice.invoiceNumber,
          syncStatus: 'synced',
          syncDirection: 'to_xero',
          lastSyncedAt: new Date(),
          xeroStatus: createdInvoice.status,
          xeroTotal: createdInvoice.total?.toString(),
          xeroCurrencyCode: createdInvoice.currencyCode,
          xeroReference: createdInvoice.reference,
          xeroUrl: `https://go.xero.com/AccountsReceivable/View.aspx?InvoiceID=${createdInvoice.invoiceID}`
        });

        await this.completeSyncLog(syncLogId, 'completed', 1, 1, 0);
      }
    } catch (error) {
      console.error('Error syncing invoice to Xero:', error);
      
      // Log error in sync record
      await db.insert(xeroInvoiceSync).values({
        invoiceId: invoiceId,
        syncStatus: 'error',
        syncDirection: 'to_xero',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorDetails: { error: error instanceof Error ? error.stack : error }
      });

      await this.completeSyncLog(syncLogId, 'failed', 1, 0, 1, [error instanceof Error ? error.message : 'Unknown error']);
      throw error;
    }
  }

  private async ensureXeroContact(participantId: string | null): Promise<string> {
    if (!participantId) {
      throw new Error('Participant ID is required');
    }

    // Check if contact already synced
    const [existingSync] = await db.select()
      .from(xeroContactSync)
      .where(eq(xeroContactSync.participantId, participantId))
      .limit(1);

    if (existingSync && existingSync.xeroContactId) {
      return existingSync.xeroContactId;
    }

    // Get participant details
    const [participant] = await db.select()
      .from(participants)
      .where(eq(participants.id, participantId))
      .limit(1);

    if (!participant) {
      throw new Error('Participant not found');
    }

    // Create contact in Xero
    const xeroContact = {
      name: `${participant.firstName} ${participant.lastName}`,
      firstName: participant.firstName,
      lastName: participant.lastName,
      emailAddress: participant.email || undefined,
      phones: participant.phone ? [{
        phoneType: 'DEFAULT' as any,
        phoneNumber: participant.phone,
        phoneAreaCode: '',
        phoneCountryCode: ''
      }] : undefined,
      isCustomer: true
    };

    const tenants = await this.xeroClient.updateTenants();
    const response = await this.xeroClient.accountingApi.createContacts(
      tenants[0].tenantId,
      { contacts: [xeroContact] }
    );

    if (response.body.contacts && response.body.contacts.length > 0) {
      const createdContact = response.body.contacts[0];
      
      // Save sync record
      await db.insert(xeroContactSync).values({
        participantId: participantId,
        xeroContactId: createdContact.contactID!,
        xeroContactName: createdContact.name,
        xeroContactNumber: createdContact.contactNumber,
        xeroEmail: createdContact.emailAddress,
        syncStatus: 'synced',
        syncDirection: 'to_xero',
        lastSyncedAt: new Date(),
        contactType: 'participant',
        isCustomer: true
      });

      return createdContact.contactID!;
    }

    throw new Error('Failed to create contact in Xero');
  }

  // Bank Reconciliation
  async fetchBankTransactions(): Promise<void> {
    await this.ensureValidToken();
    
    const syncLogId = await this.createSyncLog('bank_transactions', 'from_xero');
    let successCount = 0;
    let errorCount = 0;

    try {
      const tenants = await this.xeroClient.updateTenants();
      if (tenants.length === 0) {
        throw new Error('No Xero tenants available');
      }

      // Get bank accounts
      const accountsResponse = await this.xeroClient.accountingApi.getAccounts(
        tenants[0].tenantId,
        undefined,
        'Type=="BANK"'
      );

      if (!accountsResponse.body.accounts) {
        return;
      }

      for (const account of accountsResponse.body.accounts) {
        if (!account.accountID) continue;

        // Get bank transactions for this account
        const transactionsResponse = await this.xeroClient.accountingApi.getBankTransactions(
          tenants[0].tenantId,
          undefined,
          `BankAccount.AccountID=Guid("${account.accountID}")`,
          'Date DESC'
        );

        if (!transactionsResponse.body.bankTransactions) continue;

        for (const transaction of transactionsResponse.body.bankTransactions) {
          try {
            // Check if transaction already exists
            const existing = await db.select()
              .from(xeroBankReconciliation)
              .where(eq(xeroBankReconciliation.xeroBankTransactionId, transaction.bankTransactionID!))
              .limit(1);

            if (existing.length === 0) {
              // Save new transaction
              await db.insert(xeroBankReconciliation).values({
                xeroAccountId: account.accountID,
                xeroAccountName: account.name,
                xeroBankTransactionId: transaction.bankTransactionID,
                transactionDate: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                reference: transaction.reference || '',
                description: transaction.lineItems?.[0]?.description || '',
                amount: transaction.total?.toString() || '0',
                reconciliationStatus: transaction.isReconciled ? 'reconciled' : 'unreconciled'
              });
              successCount++;
            }
          } catch (error) {
            console.error('Error processing bank transaction:', error);
            errorCount++;
          }
        }
      }

      await this.completeSyncLog(syncLogId, 'completed', successCount + errorCount, successCount, errorCount);
    } catch (error) {
      console.error('Error fetching bank transactions:', error);
      await this.completeSyncLog(syncLogId, 'failed', 0, 0, 0, [error instanceof Error ? error.message : 'Unknown error']);
      throw error;
    }
  }

  async autoReconcileTransactions(): Promise<void> {
    // Get unreconciled transactions
    const unreconciled = await db.select()
      .from(xeroBankReconciliation)
      .where(eq(xeroBankReconciliation.reconciliationStatus, 'unreconciled'));

    for (const transaction of unreconciled) {
      try {
        // Try to match with invoice by amount and date
        const matchingInvoices = await db.select()
          .from(invoices)
          .where(
            and(
              eq(invoices.total, transaction.amount),
              // Add date matching logic here if needed
            )
          );

        if (matchingInvoices.length === 1) {
          // High confidence match
          await db.update(xeroBankReconciliation)
            .set({
              matchedInvoiceId: matchingInvoices[0].id,
              matchConfidence: 90,
              matchMethod: 'auto',
              reconciliationStatus: 'reconciled',
              reconciledAt: new Date(),
              updatedAt: new Date()
            })
            .where(eq(xeroBankReconciliation.id, transaction.id));

          // Update invoice status
          await db.update(invoices)
            .set({
              status: 'paid',
              paidDate: transaction.transactionDate,
              updatedAt: new Date()
            })
            .where(eq(invoices.id, matchingInvoices[0].id));
        }
      } catch (error) {
        console.error('Error auto-reconciling transaction:', error);
      }
    }
  }

  // Sync Management
  private async createSyncLog(syncType: string, syncDirection: string): Promise<string> {
    const [log] = await db.insert(xeroSyncLog)
      .values({
        syncType,
        syncDirection,
        status: 'running',
        startedAt: new Date()
      })
      .returning({ id: xeroSyncLog.id });
    
    return log.id;
  }

  private async completeSyncLog(
    logId: string, 
    status: string, 
    totalRecords: number,
    successfulRecords: number,
    failedRecords: number,
    errors?: string[]
  ): Promise<void> {
    await db.update(xeroSyncLog)
      .set({
        status,
        completedAt: new Date(),
        totalRecords,
        successfulRecords,
        failedRecords,
        errors: errors ? { errors } : null
      })
      .where(eq(xeroSyncLog.id, logId));
  }

  // Scheduled Sync Tasks
  setupScheduledSync(): void {
    // Sync invoices every hour
    cron.schedule('0 * * * *', async () => {
      console.log('Running scheduled invoice sync...');
      await this.syncPendingInvoices();
    });

    // Fetch bank transactions daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('Running scheduled bank transaction fetch...');
      await this.fetchBankTransactions();
      await this.autoReconcileTransactions();
    });
  }

  private async syncPendingInvoices(): Promise<void> {
    const pendingInvoices = await db.select()
      .from(invoices)
      .where(
        and(
          eq(invoices.status, 'sent'),
          isNull(invoices.xeroSyncId)
        )
      );

    for (const invoice of pendingInvoices) {
      try {
        await this.syncInvoiceToXero(invoice.id);
      } catch (error) {
        console.error(`Failed to sync invoice ${invoice.id}:`, error);
      }
    }
  }

  // Get sync status
  async getSyncStatus(): Promise<any> {
    const [config] = await db.select()
      .from(xeroConfig)
      .where(eq(xeroConfig.isActive, true))
      .limit(1);

    const recentLogs = await db.select()
      .from(xeroSyncLog)
      .orderBy(desc(xeroSyncLog.createdAt))
      .limit(10);

    return {
      connected: !!config,
      lastSynced: config?.lastSyncedAt,
      syncEnabled: config?.syncEnabled,
      recentSyncs: recentLogs
    };
  }
}

// Initialize service
export const xeroService = new XeroService();