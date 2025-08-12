import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  AlertCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  FileTextIcon
} from "lucide-react";
import { 
  calculateComplianceScore, 
  getRoleEfficiencyMetrics,
  getRoleComplianceChecks,
  type ComplianceCheck 
} from "@/lib/ndis-compliance";

interface ComplianceDashboardProps {
  role: string;
  checks?: ComplianceCheck[];
}

export function ComplianceDashboard({ role, checks = [] }: ComplianceDashboardProps) {
  const efficiencyMetrics = getRoleEfficiencyMetrics(role);
  const roleChecks = getRoleComplianceChecks(role);
  const complianceScore = calculateComplianceScore(checks);

  const getScoreColor = (score: number) => {
    if (score >= 95) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'non_compliant':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircleIcon className="h-4 w-4 text-orange-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Overall Compliance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5" />
            NDIS Compliance Overview
          </CardTitle>
          <CardDescription>Real-time compliance monitoring and workflow validation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Overall Compliance</p>
              <p className={`text-4xl font-bold ${getScoreColor(complianceScore)}`}>
                {complianceScore}%
              </p>
              <Progress value={complianceScore} className="mt-2" />
            </div>
            
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Critical Issues</p>
              <p className="text-2xl font-bold text-red-600">
                {checks.filter(c => c.severity === 'critical' && c.status === 'non_compliant').length}
              </p>
              <p className="text-xs">Require immediate action</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Pending Reviews</p>
              <p className="text-2xl font-bold text-yellow-600">
                {checks.filter(c => c.status === 'pending' || c.status === 'review').length}
              </p>
              <p className="text-xs">Awaiting verification</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-Specific Workflow Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Compliance Checks</CardTitle>
          <CardDescription>Role-specific NDIS compliance requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {roleChecks.map((check: any) => (
              <div key={check.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{check.name}</span>
                  </div>
                  <Badge variant="outline">{check.frequency}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{check.description}</p>
                {check.timeLimit && (
                  <div className="flex items-center gap-1 text-xs text-orange-600">
                    <ClockIcon className="h-3 w-3" />
                    <span>Time limit: {check.timeLimit.replace('_', ' ')}</span>
                  </div>
                )}
                {check.mandatoryFields && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {check.mandatoryFields.map((field: string) => (
                      <Badge key={field} variant="secondary" className="text-xs">
                        {field.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Efficiency Metrics */}
      {Object.keys(efficiencyMetrics).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Efficiency Metrics</CardTitle>
            <CardDescription>Performance against NDIS service delivery targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(efficiencyMetrics).map(([key, metric]: [string, any]) => (
                <div key={key} className="p-3 border rounded-lg">
                  <p className="text-sm font-medium mb-1">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {metric.target}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {metric.unit === 'percent' ? '%' : metric.unit}
                    </span>
                  </div>
                  {metric.threshold && (
                    <p className="text-xs text-muted-foreground">
                      Target: {metric.threshold} {metric.target} {metric.unit}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Status Details */}
      {checks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Compliance Status Details</CardTitle>
            <CardDescription>Individual compliance check results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {checks.map((check) => (
                <div key={check.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <p className="font-medium text-sm">{check.name}</p>
                      <p className="text-xs text-muted-foreground">{check.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={check.severity === 'critical' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {check.severity}
                    </Badge>
                    <Badge 
                      variant={check.status === 'compliant' ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      {check.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            {checks.some(c => c.status === 'non_compliant') && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm font-medium text-red-800 mb-2">
                  Action Required for Non-Compliant Items
                </p>
                <Button size="sm" variant="destructive">
                  Generate Compliance Report
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}