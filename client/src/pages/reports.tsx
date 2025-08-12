import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
// Sidebar and Header are provided by AppLayout wrapper
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Reports() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedReport, setSelectedReport] = useState("");
  const [dateRange, setDateRange] = useState("");

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

  const reportTypes = [
    {
      id: "participant-summary",
      name: "Participant Summary Report",
      description: "Comprehensive overview of all participants and their current status",
      icon: "fas fa-users"
    },
    {
      id: "service-delivery",
      name: "Service Delivery Report",
      description: "Detailed breakdown of services delivered and outcomes achieved",
      icon: "fas fa-chart-line"
    },
    {
      id: "financial-summary",
      name: "Financial Summary Report",
      description: "Revenue, expenses, and budget utilization across all participants",
      icon: "fas fa-dollar-sign"
    },
    {
      id: "ndis-compliance",
      name: "NDIS Compliance Report",
      description: "Compliance status and audit trail for NDIS reporting requirements",
      icon: "fas fa-shield-alt"
    },
    {
      id: "staff-utilization",
      name: "Staff Utilization Report",
      description: "Staff workload, capacity, and service delivery efficiency",
      icon: "fas fa-user-clock"
    },
    {
      id: "plan-review",
      name: "Plan Review Report",
      description: "Plans due for review and budget expenditure analysis",
      icon: "fas fa-file-alt"
    }
  ];

  const handleGenerateReport = () => {
    if (!selectedReport) {
      toast({
        title: "Error",
        description: "Please select a report type",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Report Generation Started",
      description: "Your report is being generated. This may take a few moments.",
    });

    // TODO: Implement actual report generation
    setTimeout(() => {
      toast({
        title: "Report Ready",
        description: "Your report has been generated and is ready for download.",
      });
    }, 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
      {/* Report Generation Section */}
      <Card className="mb-8">
            <CardHeader>
              <CardTitle>Generate Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Type
                  </label>
                  <Select value={selectedReport} onValueChange={setSelectedReport}>
                    <SelectTrigger data-testid="select-report-type">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((report) => (
                        <SelectItem key={report.id} value={report.id}>
                          {report.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger data-testid="select-date-range">
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last-7-days">Last 7 days</SelectItem>
                      <SelectItem value="last-30-days">Last 30 days</SelectItem>
                      <SelectItem value="last-3-months">Last 3 months</SelectItem>
                      <SelectItem value="last-6-months">Last 6 months</SelectItem>
                      <SelectItem value="last-12-months">Last 12 months</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={handleGenerateReport}
                    className="bg-primary hover:bg-blue-700 w-full"
                    data-testid="button-generate-report"
                  >
                    <i className="fas fa-chart-bar mr-2"></i>
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Reports */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportTypes.map((report) => (
                <Card 
                  key={report.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedReport === report.id ? 'ring-2 ring-primary bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                  data-testid={`card-report-${report.id}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <i className={`${report.icon} text-primary text-lg`}></i>
                      </div>
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Stats Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary" data-testid="text-total-participants">
                    127
                  </div>
                  <p className="text-sm text-gray-600">Total Participants</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary" data-testid="text-active-plans">
                    112
                  </div>
                  <p className="text-sm text-gray-600">Active Plans</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent" data-testid="text-monthly-revenue">
                    $245,890
                  </div>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600" data-testid="text-compliance-score">
                    98.5%
                  </div>
                  <p className="text-sm text-gray-600">Compliance Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
    </div>
  );
}
