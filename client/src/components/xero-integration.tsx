import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  ArrowUpDown, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Link, 
  Unlink,
  FileText,
  DollarSign,
  Clock,
  AlertCircle
} from 'lucide-react';

export function XeroIntegration() {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  // Get Xero connection status
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/xero/status'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Connect to Xero
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await apiRequest('/api/xero/connect');
      if (response.authUrl) {
        window.location.href = response.authUrl;
      }
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Failed to initiate Xero connection',
        variant: 'destructive',
      });
      setIsConnecting(false);
    }
  };

  // Fetch bank transactions
  const fetchTransactionsMutation = useMutation({
    mutationFn: () => apiRequest('/api/xero/fetch-transactions', { method: 'POST' }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Bank transactions fetched successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/xero/status'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to fetch bank transactions',
        variant: 'destructive',
      });
    },
  });

  // Auto-reconcile transactions
  const autoReconcileMutation = useMutation({
    mutationFn: () => apiRequest('/api/xero/auto-reconcile', { method: 'POST' }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Transactions reconciled successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/xero/status'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to reconcile transactions',
        variant: 'destructive',
      });
    },
  });

  // Check for connection success/error from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const xeroStatus = params.get('xero');
    
    if (xeroStatus === 'connected') {
      toast({
        title: 'Success',
        description: 'Successfully connected to Xero',
      });
      // Clear the URL param
      window.history.replaceState({}, document.title, window.location.pathname);
      queryClient.invalidateQueries({ queryKey: ['/api/xero/status'] });
    } else if (xeroStatus === 'error') {
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to Xero. Please try again.',
        variant: 'destructive',
      });
      // Clear the URL param
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  if (statusLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2">Loading Xero status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="xero-integration-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Xero Integration</span>
          {status?.connected ? (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-4 w-4 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="secondary">
              <XCircle className="h-4 w-4 mr-1" />
              Not Connected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Manage your Xero accounting integration for automated invoicing and reconciliation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!status?.connected ? (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connect to Xero to enable automated invoice syncing, payment reconciliation, and financial reporting.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              className="w-full"
              data-testid="button-connect-xero"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Link className="mr-2 h-4 w-4" />
                  Connect to Xero
                </>
              )}
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="status" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="sync">Sync Settings</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="status" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-4 rounded-lg border p-4">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Last Sync</p>
                    <p className="text-2xl font-bold">
                      {status.lastSynced 
                        ? new Date(status.lastSynced).toLocaleString() 
                        : 'Never'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 rounded-lg border p-4">
                  <DollarSign className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Sync Status</p>
                    <p className="text-2xl font-bold">
                      {status.syncEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => fetchTransactionsMutation.mutate()}
                  disabled={fetchTransactionsMutation.isPending}
                  variant="outline"
                  data-testid="button-fetch-transactions"
                >
                  {fetchTransactionsMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      Fetch Transactions
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={() => autoReconcileMutation.mutate()}
                  disabled={autoReconcileMutation.isPending}
                  variant="outline"
                  data-testid="button-auto-reconcile"
                >
                  {autoReconcileMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Reconciling...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Auto-Reconcile
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="sync" className="space-y-4">
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Automatic sync runs every hour for invoices and daily at 2 AM for bank transactions.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>Invoice Sync</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>Payment Sync</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>Contact Sync</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>Auto-Reconciliation</span>
                  <Badge variant="secondary">Manual</Badge>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              {status.recentSyncs && status.recentSyncs.length > 0 ? (
                <div className="space-y-2">
                  {status.recentSyncs.map((sync: any) => (
                    <div key={sync.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <div>
                          {sync.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : sync.status === 'failed' ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{sync.syncType}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(sync.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {sync.successfulRecords}/{sync.totalRecords} synced
                        </p>
                        {sync.failedRecords > 0 && (
                          <p className="text-xs text-red-500">
                            {sync.failedRecords} failed
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    No sync history available yet.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}