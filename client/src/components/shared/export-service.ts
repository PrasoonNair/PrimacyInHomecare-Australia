import { toast } from '@/hooks/use-toast';

interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  items: string[];
  itemType: 'staff' | 'participants';
  data: any[];
}

export class ExportService {
  static async exportData({ format, items, itemType, data }: ExportOptions) {
    try {
      // Filter data to only selected items
      const filteredData = data.filter(item => items.includes(item.id));
      
      switch (format) {
        case 'csv':
          return await this.exportToCSV(filteredData, itemType);
        case 'excel':
          return await this.exportToExcel(filteredData, itemType);
        case 'pdf':
          return await this.exportToPDF(filteredData, itemType);
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }

  private static async exportToCSV(data: any[], itemType: string) {
    if (data.length === 0) {
      throw new Error('No data to export');
    }

    const headers = this.getHeaders(itemType);
    const csvContent = this.convertToCSV(data, headers, itemType);
    
    this.downloadFile(csvContent, `${itemType}_export_${Date.now()}.csv`, 'text/csv');
    return true;
  }

  private static async exportToExcel(data: any[], itemType: string) {
    // For now, we'll export as CSV and suggest Excel format
    // In a real implementation, you'd use a library like xlsx
    const headers = this.getHeaders(itemType);
    const csvContent = this.convertToCSV(data, headers, itemType);
    
    this.downloadFile(csvContent, `${itemType}_export_${Date.now()}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return true;
  }

  private static async exportToPDF(data: any[], itemType: string) {
    // Generate a simple HTML report and convert to PDF
    const htmlContent = this.generateHTMLReport(data, itemType);
    
    // In a real implementation, you'd use a PDF library like jsPDF or send to server
    // For now, we'll create a printable HTML page
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
    
    return true;
  }

  private static getHeaders(itemType: string): string[] {
    if (itemType === 'staff') {
      return [
        'ID', 'Name', 'Email', 'Phone', 'Role', 'Department', 
        'Status', 'Join Date', 'Location', 'Rating'
      ];
    } else {
      return [
        'ID', 'Name', 'Email', 'Phone', 'NDIS Number', 'Date of Birth',
        'Status', 'State', 'City', 'Plan Status', 'Total Budget', 
        'Used Budget', 'Risk Level', 'Primary Support'
      ];
    }
  }

  private static convertToCSV(data: any[], headers: string[], itemType: string): string {
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(item => {
      if (itemType === 'staff') {
        return [
          this.escapeCsvField(item.id),
          this.escapeCsvField(item.name),
          this.escapeCsvField(item.email),
          this.escapeCsvField(item.phone || ''),
          this.escapeCsvField(item.role),
          this.escapeCsvField(item.department),
          this.escapeCsvField(item.status),
          this.escapeCsvField(item.joinDate || ''),
          this.escapeCsvField(item.location || ''),
          this.escapeCsvField(item.rating?.toString() || '')
        ].join(',');
      } else {
        return [
          this.escapeCsvField(item.id),
          this.escapeCsvField(item.name),
          this.escapeCsvField(item.email),
          this.escapeCsvField(item.phone || ''),
          this.escapeCsvField(item.ndisNumber),
          this.escapeCsvField(item.dateOfBirth || ''),
          this.escapeCsvField(item.status),
          this.escapeCsvField(item.state || ''),
          this.escapeCsvField(item.city || ''),
          this.escapeCsvField(item.planStatus || ''),
          this.escapeCsvField(item.totalBudget?.toString() || ''),
          this.escapeCsvField(item.usedBudget?.toString() || ''),
          this.escapeCsvField(item.riskLevel || ''),
          this.escapeCsvField(item.primarySupport || '')
        ].join(',');
      }
    });

    return [csvHeaders, ...csvRows].join('\n');
  }

  private static escapeCsvField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  private static generateHTMLReport(data: any[], itemType: string): string {
    const title = `${itemType.charAt(0).toUpperCase()}${itemType.slice(1)} Report`;
    const headers = this.getHeaders(itemType);
    
    const tableRows = data.map(item => {
      const values = itemType === 'staff' 
        ? [item.id, item.name, item.email, item.phone || '', item.role, item.department, 
           item.status, item.joinDate || '', item.location || '', item.rating || '']
        : [item.id, item.name, item.email, item.phone || '', item.ndisNumber, 
           item.dateOfBirth || '', item.status, item.state || '', item.city || '',
           item.planStatus || '', item.totalBudget || '', item.usedBudget || '',
           item.riskLevel || '', item.primarySupport || ''];
      
      return `<tr>${values.map(val => `<td>${val}</td>`).join('')}</tr>`;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #5B2C91; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .meta { text-align: center; color: #666; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>Primacy Care Australia CMS</h1>
        <h2>${title}</h2>
        <div class="meta">
          Generated on ${new Date().toLocaleString()} | ${data.length} records
        </div>
        <table>
          <thead>
            <tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;
  }

  private static downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  }

  static async bulkEmail(items: string[], subject: string, message: string, itemType: string) {
    try {
      const response = await fetch('/api/bulk-operations/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          subject,
          message,
          itemType
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send emails');
      }

      return await response.json();
    } catch (error) {
      console.error('Bulk email error:', error);
      throw error;
    }
  }

  static async bulkStatusUpdate(items: string[], status: string, itemType: string) {
    try {
      const response = await fetch('/api/bulk-operations/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          status,
          itemType
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      return await response.json();
    } catch (error) {
      console.error('Bulk status update error:', error);
      throw error;
    }
  }

  static async bulkDelete(items: string[], itemType: string) {
    try {
      const response = await fetch('/api/bulk-operations/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          itemType
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete items');
      }

      return await response.json();
    } catch (error) {
      console.error('Bulk delete error:', error);
      throw error;
    }
  }
}