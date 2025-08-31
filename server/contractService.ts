import { DrizzleStorage } from './storage';

interface ContractData {
  applicantId: string;
  applicantName: string;
  position: string;
  department: string;
  employmentType: 'full_time' | 'part_time' | 'casual' | 'contract';
  startDate: string;
  salary: string;
  probationPeriod: number;
  workLocation: string;
  reportingManager: string;
  schacsLevel: string;
  allowances?: string[];
  benefits?: string[];
  specialConditions?: string;
  templateId: string;
}

interface ContractTemplate {
  id: string;
  name: string;
  type: string;
  template: string;
  variables: string[];
  isDefault: boolean;
}

interface GeneratedContract {
  id: string;
  applicantId: string;
  templateId: string;
  content: string;
  status: 'draft' | 'sent' | 'signed' | 'executed';
  generatedAt: string;
  sentAt?: string;
  signedAt?: string;
  esignatureEnvelopeId?: string;
}

export class ContractService {
  private storage: DrizzleStorage;

  constructor() {
    this.storage = new DrizzleStorage();
  }

  async generateContract(contractData: ContractData): Promise<GeneratedContract> {
    try {
      // Get the template
      const template = await this.getTemplate(contractData.templateId);
      if (!template) {
        throw new Error('Contract template not found');
      }

      // Generate contract content by replacing template variables
      let contractContent = template.template;
      
      // Replace standard variables
      const variables = {
        applicantName: contractData.applicantName,
        position: contractData.position,
        department: this.formatDepartment(contractData.department),
        employmentType: this.formatEmploymentType(contractData.employmentType),
        startDate: this.formatDate(contractData.startDate),
        salary: this.formatSalary(contractData.salary),
        probationPeriod: contractData.probationPeriod.toString(),
        workLocation: contractData.workLocation,
        reportingManager: contractData.reportingManager,
        schacsLevel: this.formatSchacsLevel(contractData.schacsLevel),
        specialConditions: contractData.specialConditions || 'None',
        generatedDate: this.formatDate(new Date().toISOString()),
        companyName: 'Primacy Care Australia',
        abn: '12 345 678 901', // Replace with actual ABN
        address: '123 Care Street, Sydney NSW 2000', // Replace with actual address
      };

      // Replace all variables in the template
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        contractContent = contractContent.replace(regex, value);
      });

      // Create contract record
      const contract: GeneratedContract = {
        id: this.generateId(),
        applicantId: contractData.applicantId,
        templateId: contractData.templateId,
        content: contractContent,
        status: 'draft',
        generatedAt: new Date().toISOString(),
      };

      // Save to database (mock implementation)
      await this.saveContract(contract);

      return contract;
    } catch (error) {
      console.error('Error generating contract:', error);
      throw new Error('Failed to generate contract');
    }
  }

  async sendForSignature(contractId: string): Promise<{ success: boolean; envelopeId?: string }> {
    try {
      const contract = await this.getContract(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      // Integration with DocuSign or similar e-signature service
      // This is a placeholder implementation
      const envelopeId = await this.createDocuSignEnvelope(contract);
      
      // Update contract status
      await this.updateContractStatus(contractId, 'sent', {
        sentAt: new Date().toISOString(),
        esignatureEnvelopeId: envelopeId
      });

      return {
        success: true,
        envelopeId: envelopeId
      };
    } catch (error) {
      console.error('Error sending contract for signature:', error);
      throw new Error('Failed to send contract for signature');
    }
  }

  private async getTemplate(templateId: string): Promise<ContractTemplate | null> {
    // Mock implementation - replace with actual database query
    const templates: ContractTemplate[] = [
      {
        id: 'full_time_template',
        name: 'Full-Time Employment Contract',
        type: 'full_time',
        template: this.getFullTimeTemplate(),
        variables: ['applicantName', 'position', 'department', 'startDate', 'salary', 'probationPeriod'],
        isDefault: true
      },
      {
        id: 'part_time_template',
        name: 'Part-Time Employment Contract',
        type: 'part_time',
        template: this.getPartTimeTemplate(),
        variables: ['applicantName', 'position', 'department', 'startDate', 'salary', 'probationPeriod'],
        isDefault: false
      },
      {
        id: 'casual_template',
        name: 'Casual Employment Contract',
        type: 'casual',
        template: this.getCasualTemplate(),
        variables: ['applicantName', 'position', 'department', 'startDate', 'hourlyRate'],
        isDefault: false
      }
    ];

    return templates.find(t => t.id === templateId) || null;
  }

  private getFullTimeTemplate(): string {
    return `
EMPLOYMENT AGREEMENT

Between: {{companyName}} (ABN: {{abn}})
Address: {{address}}

And: {{applicantName}}

This Employment Agreement is made on {{generatedDate}}.

1. POSITION AND COMMENCEMENT
1.1 The Employee will be employed as {{position}} in the {{department}} department.
1.2 Employment will commence on {{startDate}}.
1.3 The Employee's employment is subject to a probationary period of {{probationPeriod}} months.

2. REMUNERATION
2.1 The Employee's annual salary is {{salary}} (inclusive of superannuation).
2.2 The Employee is classified at {{schacsLevel}} under the SCHADS Award.
2.3 Salary will be paid fortnightly into the Employee's nominated bank account.

3. HOURS OF WORK
3.1 The Employee will work {{employmentType}} hours as required by the Company.
3.2 Standard working hours are 38 hours per week, Monday to Friday.

4. WORKPLACE LOCATION
4.1 The Employee's principal place of work will be {{workLocation}}.
4.2 The Employee may be required to work at other locations as directed.

5. REPORTING
5.1 The Employee will report to {{reportingManager}}.

6. SPECIAL CONDITIONS
{{specialConditions}}

7. GENERAL TERMS
7.1 This agreement is subject to the Fair Work Act 2009 and applicable awards.
7.2 The Employee must maintain current NDIS Worker Screening and Working with Children Check.
7.3 The Employee agrees to maintain confidentiality of all participant information.

Employee Signature: ___________________ Date: ___________

{{applicantName}}

Employer Signature: ___________________ Date: ___________

{{reportingManager}}, {{companyName}}
    `.trim();
  }

  private getPartTimeTemplate(): string {
    return `
PART-TIME EMPLOYMENT AGREEMENT

Between: {{companyName}} (ABN: {{abn}})
Address: {{address}}

And: {{applicantName}}

This Part-Time Employment Agreement is made on {{generatedDate}}.

1. POSITION AND COMMENCEMENT
1.1 The Employee will be employed part-time as {{position}} in the {{department}} department.
1.2 Employment will commence on {{startDate}}.
1.3 The Employee's employment is subject to a probationary period of {{probationPeriod}} months.

2. REMUNERATION
2.1 The Employee's annual salary is {{salary}} (pro-rata, inclusive of superannuation).
2.2 The Employee is classified at {{schacsLevel}} under the SCHADS Award.
2.3 Salary will be paid fortnightly into the Employee's nominated bank account.

3. HOURS OF WORK
3.1 The Employee will work part-time hours as agreed between the parties.
3.2 Hours may vary by agreement and operational requirements.

4. WORKPLACE LOCATION
4.1 The Employee's principal place of work will be {{workLocation}}.

5. REPORTING
5.1 The Employee will report to {{reportingManager}}.

6. SPECIAL CONDITIONS
{{specialConditions}}

Employee Signature: ___________________ Date: ___________

Employer Signature: ___________________ Date: ___________
    `.trim();
  }

  private getCasualTemplate(): string {
    return `
CASUAL EMPLOYMENT AGREEMENT

Between: {{companyName}} (ABN: {{abn}})
And: {{applicantName}}

This Casual Employment Agreement is made on {{generatedDate}}.

1. NATURE OF EMPLOYMENT
1.1 The Employee is engaged as a casual {{position}} in the {{department}} department.
1.2 Engagement will commence on {{startDate}}.

2. REMUNERATION
2.1 The Employee will be paid an hourly rate as per {{schacsLevel}} under the SCHADS Award.
2.2 Casual loading of 25% applies to all hours worked.

3. HOURS OF WORK
3.1 Hours of work will be as offered and accepted from time to time.
3.2 No guarantee of minimum hours is provided.

Employee Signature: ___________________ Date: ___________

Employer Signature: ___________________ Date: ___________
    `.trim();
  }

  private formatDepartment(department: string): string {
    const departmentMap: Record<string, string> = {
      'intake': 'Intake',
      'service_delivery': 'Service Delivery',
      'hr_recruitment': 'HR & Recruitment',
      'finance_awards': 'Finance & Awards',
      'compliance_quality': 'Compliance & Quality'
    };
    return departmentMap[department] || department;
  }

  private formatEmploymentType(type: string): string {
    const typeMap: Record<string, string> = {
      'full_time': 'full-time',
      'part_time': 'part-time',
      'casual': 'casual',
      'contract': 'contract'
    };
    return typeMap[type] || type;
  }

  private formatSchacsLevel(level: string): string {
    const levelMap: Record<string, string> = {
      'level_1': 'SCHADS Level 1 - Entry Support Worker',
      'level_2': 'SCHADS Level 2 - Support Worker',
      'level_3': 'SCHADS Level 3 - Senior Support Worker',
      'level_4': 'SCHADS Level 4 - Coordinator',
      'level_5': 'SCHADS Level 5 - Senior Coordinator',
      'level_6': 'SCHADS Level 6 - Manager'
    };
    return levelMap[level] || level;
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  private formatSalary(salary: string): string {
    // Remove non-numeric characters and format as currency
    const numericSalary = salary.replace(/[^\d]/g, '');
    const amount = parseInt(numericSalary);
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  private generateId(): string {
    return 'contract_' + Math.random().toString(36).substr(2, 9);
  }

  private async saveContract(contract: GeneratedContract): Promise<void> {
    // Mock implementation - replace with actual database save
    console.log('Saving contract:', contract.id);
  }

  private async getContract(contractId: string): Promise<GeneratedContract | null> {
    // Mock implementation - replace with actual database query
    return null;
  }

  private async updateContractStatus(
    contractId: string, 
    status: string, 
    updates: Partial<GeneratedContract>
  ): Promise<void> {
    // Mock implementation - replace with actual database update
    console.log('Updating contract status:', contractId, status);
  }

  private async createDocuSignEnvelope(contract: GeneratedContract): Promise<string> {
    // Mock implementation for DocuSign integration
    // In real implementation, this would:
    // 1. Create a DocuSign envelope
    // 2. Add the contract document
    // 3. Add recipient (employee) for signature
    // 4. Send the envelope
    // 5. Return the envelope ID
    
    console.log('Creating DocuSign envelope for contract:', contract.id);
    return 'envelope_' + Math.random().toString(36).substr(2, 9);
  }
}