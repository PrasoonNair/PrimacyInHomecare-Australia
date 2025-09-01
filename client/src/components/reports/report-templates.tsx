import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
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
  FileText
} from "lucide-react";

interface ReportTemplateProps {
  role: string;
  onSelectTemplate: (templateId: string) => void;
}

const reportTemplates = {
  'super-admin': [
    {
      id: 'executive-overview',
      title: 'Executive Overview',
      description: 'Comprehensive business performance dashboard',
      icon: BarChart3,
      frequency: 'Daily',
      estimatedTime: '5 min'
    },
    {
      id: 'financial-analysis',
      title: 'Financial Analysis',
      description: 'Revenue, expenses, and profitability metrics',
      icon: DollarSign,
      frequency: 'Weekly',
      estimatedTime: '10 min'
    },
    {
      id: 'compliance-summary',
      title: 'Compliance Summary',
      description: 'NDIS compliance status and audit results',
      icon: Shield,
      frequency: 'Monthly',
      estimatedTime: '15 min'
    }
  ],
  'finance-manager': [
    {
      id: 'invoice-aging',
      title: 'Invoice Aging Report',
      description: 'Outstanding invoices and payment tracking',
      icon: DollarSign,
      frequency: 'Daily',
      estimatedTime: '3 min'
    },
    {
      id: 'travel-costs',
      title: 'Travel Cost Analysis',
      description: 'Provider travel calculations and compliance',
      icon: Activity,
      frequency: 'Weekly',
      estimatedTime: '8 min'
    },
    {
      id: 'payroll-summary',
      title: 'Payroll Summary',
      description: 'Staff payroll and SCHADS compliance',
      icon: Users,
      frequency: 'Bi-weekly',
      estimatedTime: '12 min'
    }
  ],
  'hr-manager': [
    {
      id: 'recruitment-pipeline',
      title: 'Recruitment Pipeline',
      description: 'Hiring progress and candidate analysis',
      icon: Users,
      frequency: 'Weekly',
      estimatedTime: '7 min'
    },
    {
      id: 'staff-performance',
      title: 'Staff Performance',
      description: 'Team performance and training metrics',
      icon: TrendingUp,
      frequency: 'Monthly',
      estimatedTime: '15 min'
    },
    {
      id: 'staff-utilization',
      title: 'Staff Utilization',
      description: 'Capacity planning and availability analysis',
      icon: Clock,
      frequency: 'Weekly',
      estimatedTime: '5 min'
    }
  ],
  'support-worker': [
    {
      id: 'shift-summary',
      title: 'Shift Summary',
      description: 'Personal shift hours and activities',
      icon: Clock,
      frequency: 'Daily',
      estimatedTime: '2 min'
    },
    {
      id: 'participant-interactions',
      title: 'Participant Interactions',
      description: 'Client interaction logs and progress notes',
      icon: Users,
      frequency: 'Weekly',
      estimatedTime: '5 min'
    }
  ]
};

export default function ReportTemplates({ role, onSelectTemplate }: ReportTemplateProps) {
  const templates = reportTemplates[role as keyof typeof reportTemplates] || [];

  if (templates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Report Templates</CardTitle>
          <CardDescription>
            No predefined report templates are available for your role.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Quick Report Templates</h3>
        <p className="text-sm text-gray-600">Pre-configured reports for your role</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const IconComponent = template.icon;
          return (
            <Card 
              key={template.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelectTemplate(template.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <IconComponent className="h-5 w-5 text-blue-600" />
                  {template.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {template.frequency}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {template.estimatedTime}
                    </Badge>
                  </div>
                  <Button size="sm" variant="ghost">
                    Generate
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}