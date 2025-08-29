import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BulkOperations } from '../bulk-operations';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
    <Toaster />
  </QueryClientProvider>
);

describe('BulkOperations Component', () => {
  describe('Unit Tests', () => {
    it('renders all operation buttons', () => {
      render(
        <TestWrapper>
          <BulkOperations />
        </TestWrapper>
      );
      
      expect(screen.getByText('Bulk Import')).toBeInTheDocument();
      expect(screen.getByText('Generate Invoices')).toBeInTheDocument();
      expect(screen.getByText('Send SMS')).toBeInTheDocument();
      expect(screen.getByText('Email Campaign')).toBeInTheDocument();
    });

    it('switches between operation types when buttons are clicked', () => {
      render(
        <TestWrapper>
          <BulkOperations />
        </TestWrapper>
      );
      
      const invoiceButton = screen.getByText('Generate Invoices');
      fireEvent.click(invoiceButton);
      
      expect(screen.getByText('Bulk Invoice Generation')).toBeInTheDocument();
    });

    it('handles file upload for bulk import', () => {
      render(
        <TestWrapper>
          <BulkOperations />
        </TestWrapper>
      );
      
      const file = new File(['test data'], 'test.csv', { type: 'text/csv' });
      const input = screen.getByLabelText(/choose file/i);
      
      fireEvent.change(input, { target: { files: [file] } });
      
      // File upload handler should be triggered
      expect(input.files[0]).toBe(file);
    });

    it('validates selected items before processing', async () => {
      render(
        <TestWrapper>
          <BulkOperations />
        </TestWrapper>
      );
      
      // Switch to invoice generation
      fireEvent.click(screen.getByText('Generate Invoices'));
      
      // Try to generate without selecting items
      const generateButton = screen.getByText('Generate Invoices', { selector: 'button' });
      
      expect(generateButton).toBeDisabled();
    });
  });

  describe('Integration Tests', () => {
    it('integrates with toast notifications on successful operation', async () => {
      render(
        <TestWrapper>
          <BulkOperations />
        </TestWrapper>
      );
      
      // Switch to invoice generation
      fireEvent.click(screen.getByText('Generate Invoices'));
      
      // Select participants
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      
      // Generate invoices
      const generateButton = screen.getByText('Generate Invoices', { selector: 'button:not(:disabled)' });
      fireEvent.click(generateButton);
      
      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/successfully processed/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('handles SMS campaign with template selection', () => {
      render(
        <TestWrapper>
          <BulkOperations />
        </TestWrapper>
      );
      
      // Switch to SMS
      fireEvent.click(screen.getByText('Send SMS'));
      
      expect(screen.getByText('Bulk SMS Campaign')).toBeInTheDocument();
      expect(screen.getByText(/SMS credits available/i)).toBeInTheDocument();
    });
  });
});