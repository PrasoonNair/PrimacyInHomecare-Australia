import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
// Sidebar and Header are provided by AppLayout wrapper
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Invoice } from "@shared/schema";

export default function Financials() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["/api/invoices"],
    enabled: isAuthenticated,
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const filteredInvoices = invoices?.filter((invoice: Invoice) =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "overdue":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(parseFloat(amount));
  };

  // Calculate summary statistics
  const totalPending = filteredInvoices
    .filter((invoice: Invoice) => invoice.status === "pending")
    .reduce((sum: number, invoice: Invoice) => sum + parseFloat(invoice.total || "0"), 0);

  const totalPaid = filteredInvoices
    .filter((invoice: Invoice) => invoice.status === "paid")
    .reduce((sum: number, invoice: Invoice) => sum + parseFloat(invoice.total || "0"), 0);

  const totalOverdue = filteredInvoices
    .filter((invoice: Invoice) => invoice.status === "overdue")
    .reduce((sum: number, invoice: Invoice) => sum + parseFloat(invoice.total || "0"), 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <i className="fas fa-clock text-primary text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Invoices</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-pending-total">
                      {formatCurrency(totalPending.toString())}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <i className="fas fa-check-circle text-secondary text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Paid Invoices</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-paid-total">
                      {formatCurrency(totalPaid.toString())}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100">
                    <i className="fas fa-exclamation-triangle text-error text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Overdue Invoices</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-overdue-total">
                      {formatCurrency(totalOverdue.toString())}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <Input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80"
              data-testid="input-search-invoices"
            />
            <Button className="bg-primary hover:bg-blue-700" data-testid="button-create-invoice">
              <i className="fas fa-file-invoice-dollar mr-2"></i>
              Create Invoice
            </Button>
          </div>

          {invoicesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredInvoices.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <i className="fas fa-file-invoice-dollar text-gray-400 text-4xl mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? "No invoices match your search criteria." : "Get started by creating your first invoice."}
                </p>
                {!searchTerm && (
                  <Button className="bg-primary hover:bg-blue-700" data-testid="button-create-first-invoice">
                    <i className="fas fa-file-invoice-dollar mr-2"></i>
                    Create First Invoice
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice: Invoice) => (
                <Card key={invoice.id} className="hover:shadow-md transition-shadow" data-testid={`card-invoice-${invoice.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900" data-testid={`text-invoice-number-${invoice.id}`}>
                            Invoice #{invoice.invoiceNumber}
                          </h3>
                          <Badge variant={getStatusColor(invoice.status as string)}>
                            {invoice.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700">Issue Date</p>
                            <p className="text-gray-600">{new Date(invoice.issueDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Due Date</p>
                            <p className="text-gray-600">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Subtotal</p>
                            <p className="text-gray-600">{formatCurrency(invoice.subtotal)}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Total (inc. GST)</p>
                            <p className="text-lg font-semibold text-primary" data-testid={`text-invoice-total-${invoice.id}`}>
                              {formatCurrency(invoice.total)}
                            </p>
                          </div>
                        </div>

                        {invoice.notes && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700">Notes</p>
                            <p className="text-sm text-gray-600">{invoice.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 ml-6">
                        <Button variant="outline" size="sm" data-testid={`button-view-invoice-${invoice.id}`}>
                          <i className="fas fa-eye mr-1"></i>
                          View
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`button-edit-invoice-${invoice.id}`}>
                          <i className="fas fa-edit mr-1"></i>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`button-download-invoice-${invoice.id}`}>
                          <i className="fas fa-download mr-1"></i>
                          PDF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
    </div>
  );
}
