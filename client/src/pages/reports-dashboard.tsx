import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import ReportTemplates from "@/components/reports/report-templates";
import {
  BarChart3,
  FileText,
  Download,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Shield,
  Clock,
  Target,
  AlertTriangle,
  PieChart,
  LineChart,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: any;
  roles: string[];
  frequency: string[];
  formats: string[];
  dataPoints: string[];
  parameters?: string[];
}

const availableReports: ReportDefinition[] = [
  // Executive Reports
  {
    id: "business-performance",
    title: "Business Performance Dashboard",
    description: "Comprehensive overview of business metrics, revenue, and KPIs",
    category: "Executive",
    icon: BarChart3,
    roles: ["super-admin", "ceo", "general-manager"],
    frequency: ["daily", "weekly", "monthly", "quarterly"],
    formats: ["pdf", "excel", "dashboard"],
    dataPoints: ["revenue", "expenses", "participant-count", "staff-utilization", "compliance-score"],
    parameters: ["date-range", "department"]
  },
  {
    id: "financial-summary",
    title: "Financial Summary Report",
    description: "Revenue, expenses, profit margins, and budget variance analysis",
    category: "Executive",
    icon: DollarSign,
    roles: ["super-admin", "ceo", "general-manager", "finance-manager"],
    frequency: ["weekly", "monthly", "quarterly"],
    formats: ["pdf", "excel"],
    dataPoints: ["revenue", "expenses", "profit-margin", "budget-variance", "cash-flow"],
    parameters: ["date-range", "cost-center"]
  },
  {
    id: "compliance-audit",
    title: "Compliance Audit Report",
    description: "NDIS compliance status, audit findings, and corrective actions",
    category: "Executive",
    icon: Shield,
    roles: ["super-admin", "ceo", "general-manager", "quality-manager"],
    frequency: ["monthly", "quarterly"],
    formats: ["pdf", "excel"],
    dataPoints: ["compliance-score", "audit-findings", "corrective-actions", "risk-level"],
    parameters: ["date-range", "audit-type"]
  },

  // Intake Reports
  {
    id: "referral-processing",
    title: "Referral Processing Report",
    description: "Referral volumes, conversion rates, and processing times",
    category: "Intake",
    icon: Users,
    roles: ["intake-coordinator", "intake-manager", "general-manager"],
    frequency: ["daily", "weekly", "monthly"],
    formats: ["pdf", "excel", "dashboard"],
    dataPoints: ["referral-count", "conversion-rate", "processing-time", "source-analysis"],
    parameters: ["date-range", "referral-source", "status"]
  },
  {
    id: "intake-conversion",
    title: "Intake Conversion Analysis",
    description: "Analysis of referral to participant conversion rates and bottlenecks",
    category: "Intake",
    icon: TrendingUp,
    roles: ["intake-coordinator", "intake-manager"],
    frequency: ["weekly", "monthly"],
    formats: ["pdf", "excel"],
    dataPoints: ["conversion-rate", "drop-off-points", "time-to-conversion", "quality-score"],
    parameters: ["date-range", "intake-stage"]
  },
  {
    id: "document-verification",
    title: "Document Verification Report",
    description: "Document processing status, verification rates, and compliance",
    category: "Intake",
    icon: FileText,
    roles: ["intake-coordinator", "intake-manager"],
    frequency: ["daily", "weekly"],
    formats: ["pdf", "excel"],
    dataPoints: ["documents-processed", "verification-rate", "processing-time", "rejection-reasons"],
    parameters: ["date-range", "document-type"]
  },

  // Finance Reports
  {
    id: "invoice-aging",
    title: "Invoice Aging Report",
    description: "Outstanding invoices analysis and payment tracking",
    category: "Finance",
    icon: DollarSign,
    roles: ["finance-manager", "finance-officer-billing"],
    frequency: ["daily", "weekly", "monthly"],
    formats: ["pdf", "excel"],
    dataPoints: ["outstanding-amount", "aging-buckets", "payment-trends", "collection-rate"],
    parameters: ["date-range", "participant-id", "aging-period"]
  },
  {
    id: "travel-calculation",
    title: "Travel Calculation Report",
    description: "Provider travel costs, billing analysis, and compliance verification",
    category: "Finance",
    icon: Activity,
    roles: ["finance-manager", "finance-officer-billing", "finance-officer-payroll"],
    frequency: ["daily", "weekly", "monthly"],
    formats: ["pdf", "excel"],
    dataPoints: ["travel-costs", "billing-rates", "compliance-score", "geographic-analysis"],
    parameters: ["date-range", "staff-id", "geographic-area"]
  },
  {
    id: "payroll-summary",
    title: "Payroll Summary Report",
    description: "Staff payroll analysis, SCHADS compliance, and cost analysis",
    category: "Finance",
    icon: Users,
    roles: ["finance-manager", "finance-officer-payroll", "hr-manager"],
    frequency: ["weekly", "monthly"],
    formats: ["pdf", "excel"],
    dataPoints: ["total-payroll", "overtime-hours", "schads-compliance", "cost-per-service"],
    parameters: ["date-range", "department", "staff-classification"]
  },
  {
    id: "budget-variance",
    title: "Budget Variance Report",
    description: "Budget vs actual analysis across departments and services",
    category: "Finance",
    icon: PieChart,
    roles: ["finance-manager", "general-manager"],
    frequency: ["monthly", "quarterly"],
    formats: ["pdf", "excel"],
    dataPoints: ["budget-variance", "cost-trends", "forecast-accuracy", "department-performance"],
    parameters: ["date-range", "department", "budget-category"]
  },

  // HR Reports
  {
    id: "recruitment-pipeline",
    title: "Recruitment Pipeline Report",
    description: "Hiring progress, candidate analysis, and time-to-fill metrics",
    category: "HR",
    icon: Users,
    roles: ["hr-manager", "hr-recruiter"],
    frequency: ["weekly", "monthly"],
    formats: ["pdf", "excel", "dashboard"],
    dataPoints: ["candidates-count", "time-to-fill", "source-effectiveness", "conversion-rates"],
    parameters: ["date-range", "position-type", "recruitment-stage"]
  },
  {
    id: "staff-performance",
    title: "Staff Performance Report",
    description: "Individual and team performance metrics, training completion",
    category: "HR",
    icon: TrendingUp,
    roles: ["hr-manager", "general-manager"],
    frequency: ["monthly", "quarterly"],
    formats: ["pdf", "excel"],
    dataPoints: ["performance-scores", "training-completion", "goal-achievement", "feedback-ratings"],
    parameters: ["date-range", "department", "staff-id"]
  },
  {
    id: "staff-utilization",
    title: "Staff Utilization Report",
    description: "Staff availability, scheduling efficiency, and capacity analysis",
    category: "HR",
    icon: Clock,
    roles: ["hr-manager", "service-delivery-manager"],
    frequency: ["daily", "weekly", "monthly"],
    formats: ["pdf", "excel"],
    dataPoints: ["utilization-rate", "availability-hours", "overtime-analysis", "capacity-planning"],
    parameters: ["date-range", "department", "shift-type"]
  },
  {
    id: "training-compliance",
    title: "Training Compliance Report",
    description: "Training requirements, completion rates, and certification tracking",
    category: "HR",
    icon: Target,
    roles: ["hr-manager", "quality-manager"],
    frequency: ["monthly", "quarterly"],
    formats: ["pdf", "excel"],
    dataPoints: ["completion-rates", "overdue-training", "certification-status", "compliance-score"],
    parameters: ["date-range", "training-type", "department"]
  },

  // Service Delivery Reports
  {
    id: "service-delivery-performance",
    title: "Service Delivery Performance",
    description: "Service quality metrics, delivery efficiency, and participant satisfaction",
    category: "Service Delivery",
    icon: Activity,
    roles: ["service-delivery-manager", "service-delivery-coordinator"],
    frequency: ["daily", "weekly", "monthly"],
    formats: ["pdf", "excel", "dashboard"],
    dataPoints: ["delivery-rate", "quality-scores", "participant-satisfaction", "efficiency-metrics"],
    parameters: ["date-range", "service-type", "staff-id"]
  },
  {
    id: "participant-goals",
    title: "Participant Goals Progress",
    description: "Goal achievement tracking, progress analysis, and outcome measurement",
    category: "Service Delivery",
    icon: Target,
    roles: ["service-delivery-manager", "service-delivery-coordinator", "support-worker"],
    frequency: ["weekly", "monthly"],
    formats: ["pdf", "excel"],
    dataPoints: ["goal-achievement", "progress-rate", "outcome-metrics", "milestone-tracking"],
    parameters: ["date-range", "participant-id", "goal-category"]
  },
  {
    id: "service-agreements",
    title: "Service Agreements Report",
    description: "Agreement compliance, service delivery against plans, and variations",
    category: "Service Delivery",
    icon: FileText,
    roles: ["service-delivery-manager", "service-delivery-coordinator"],
    frequency: ["weekly", "monthly"],
    formats: ["pdf", "excel"],
    dataPoints: ["agreement-compliance", "service-variations", "plan-utilization", "budget-tracking"],
    parameters: ["date-range", "agreement-type", "participant-id"]
  },

  // Quality Reports
  {
    id: "incident-analysis",
    title: "Incident Analysis Report",
    description: "Incident trends, root cause analysis, and prevention measures",
    category: "Quality",
    icon: AlertTriangle,
    roles: ["quality-manager", "general-manager"],
    frequency: ["weekly", "monthly", "quarterly"],
    formats: ["pdf", "excel"],
    dataPoints: ["incident-count", "severity-analysis", "root-causes", "prevention-effectiveness"],
    parameters: ["date-range", "incident-type", "severity-level"]
  },
  {
    id: "quality-metrics",
    title: "Quality Metrics Dashboard",
    description: "Quality indicators, audit scores, and improvement tracking",
    category: "Quality",
    icon: Shield,
    roles: ["quality-manager", "general-manager"],
    frequency: ["daily", "weekly", "monthly"],
    formats: ["pdf", "excel", "dashboard"],
    dataPoints: ["quality-scores", "audit-results", "improvement-trends", "compliance-rates"],
    parameters: ["date-range", "quality-domain", "audit-type"]
  },

  // Support Worker Reports
  {
    id: "personal-shift-summary",
    title: "Personal Shift Summary",
    description: "Individual shift reports, hours worked, and participant interactions",
    category: "Personal",
    icon: Clock,
    roles: ["support-worker"],
    frequency: ["daily", "weekly", "monthly"],
    formats: ["pdf"],
    dataPoints: ["hours-worked", "participants-served", "tasks-completed", "notes-summary"],
    parameters: ["date-range", "shift-type"]
  },
  {
    id: "participant-interaction-log",
    title: "Participant Interaction Log",
    description: "Detailed log of participant interactions and progress notes",
    category: "Personal",
    icon: Users,
    roles: ["support-worker"],
    frequency: ["daily", "weekly"],
    formats: ["pdf"],
    dataPoints: ["interaction-count", "progress-notes", "goal-activities", "observations"],
    parameters: ["date-range", "participant-id"]
  }
];

export default function ReportsDashboard() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<ReportDefinition | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [reportParameters, setReportParameters] = useState<Record<string, string>>({});
  const [generatingReport, setGeneratingReport] = useState(false);

  const { data: reportHistory = [] } = useQuery<any[]>({
    queryKey: ["/api/reports/history"],
  });

  // Filter reports based on user role
  const userReports = availableReports.filter(report => 
    report.roles.includes(user?.role || "") || report.roles.includes("all")
  );

  // Get unique categories for filtering
  const uniqueCategories = userReports.map(report => report.category);
  const categories = ["all", ...Array.from(new Set(uniqueCategories))];

  // Filter reports by selected category
  const filteredReports = selectedCategory === "all" 
    ? userReports 
    : userReports.filter(report => report.category === selectedCategory);

  const handleGenerateReport = async (format: string) => {
    if (!selectedReport) return;

    setGeneratingReport(true);
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: selectedReport.id,
          format,
          dateRange,
          parameters: reportParameters
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedReport.title}-${format}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setGeneratingReport(false);
    }
  };

  const getIconComponent = (IconComponent: any) => {
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
          <p className="text-gray-600">Generate and manage reports for your role</p>
        </div>
        <Badge variant="outline" className="capitalize">
          {user?.role?.replace('-', ' ')} Role
        </Badge>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-6 w-full">
          {categories.map((category) => (
            <TabsTrigger 
              key={category} 
              value={category} 
              className="capitalize"
              data-testid={`tab-${category}`}
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-6">
          {/* Quick Report Templates */}
          {selectedCategory === "all" && (
            <ReportTemplates 
              role={user?.role || ""} 
              onSelectTemplate={(templateId) => {
                // Handle template selection
                console.log("Selected template:", templateId);
              }} 
            />
          )}

          {/* Report Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <Card 
                key={report.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedReport?.id === report.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedReport(report)}
                data-testid={`report-card-${report.id}`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getIconComponent(report.icon)}
                    {report.title}
                  </CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Available Formats:</Label>
                      <div className="flex gap-1 mt-1">
                        {report.formats.map((format) => (
                          <Badge key={format} variant="secondary" className="text-xs">
                            {format.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Frequency:</Label>
                      <div className="flex gap-1 mt-1">
                        {report.frequency.map((freq) => (
                          <Badge key={freq} variant="outline" className="text-xs">
                            {freq}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Report Generation Panel */}
          {selectedReport && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getIconComponent(selectedReport.icon)}
                  Generate {selectedReport.title}
                </CardTitle>
                <CardDescription>
                  Configure parameters and generate your report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Range Selection */}
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <DatePickerWithRange 
                    date={dateRange} 
                    setDate={setDateRange}
                    className="w-full"
                  />
                </div>

                {/* Dynamic Parameters */}
                {selectedReport.parameters && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedReport.parameters.map((param) => (
                      <div key={param} className="space-y-2">
                        <Label className="capitalize">{param.replace('-', ' ')}</Label>
                        {param.includes('id') ? (
                          <Input
                            placeholder={`Enter ${param.replace('-', ' ')}`}
                            value={reportParameters[param] || ''}
                            onChange={(e) => setReportParameters(prev => ({
                              ...prev,
                              [param]: e.target.value
                            }))}
                            data-testid={`input-${param}`}
                          />
                        ) : (
                          <Select 
                            value={reportParameters[param] || ''} 
                            onValueChange={(value) => setReportParameters(prev => ({
                              ...prev,
                              [param]: value
                            }))}
                          >
                            <SelectTrigger data-testid={`select-${param}`}>
                              <SelectValue placeholder={`Select ${param.replace('-', ' ')}`} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="option1">Option 1</SelectItem>
                              <SelectItem value="option2">Option 2</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Format Selection and Generate Buttons */}
                <div className="flex flex-wrap gap-3">
                  {selectedReport.formats.map((format) => (
                    <Button
                      key={format}
                      onClick={() => handleGenerateReport(format)}
                      disabled={generatingReport}
                      className="flex items-center gap-2"
                      data-testid={`generate-${format}`}
                    >
                      <Download className="h-4 w-4" />
                      {generatingReport ? 'Generating...' : `Generate ${format.toUpperCase()}`}
                    </Button>
                  ))}
                </div>

                {/* Data Points Preview */}
                <div className="space-y-2">
                  <Label>Report will include:</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.dataPoints.map((point) => (
                      <Badge key={point} variant="outline" className="text-xs">
                        {point.replace('-', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Reports */}
          {reportHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Your recently generated reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportHistory.length > 0 ? reportHistory.slice(0, 5).map((report, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{report.title}</div>
                        <div className="text-sm text-gray-500">
                          Generated {report.createdAt ? format(new Date(report.createdAt), 'MMM dd, yyyy') : 'Recently'}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No recent reports found</p>
                      <p className="text-sm">Generate your first report to see it here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}