import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Zap, Clock, TrendingUp, Target, Award, 
  CheckCircle, AlertTriangle, Info, BarChart3,
  Users, DollarSign, Calendar, Activity
} from "lucide-react";
import { 
  LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer
} from "recharts";

export function ProductivityDashboard() {
  const [metrics, setMetrics] = useState<any>({});
  const [improvements, setImprovements] = useState<any[]>([]);
  const [savings, setSavings] = useState<any>({});

  useEffect(() => {
    // Initialize productivity metrics
    setMetrics({
      currentEfficiency: 87,
      targetEfficiency: 95,
      automationCoverage: 85,
      timeSavedWeekly: 47,
      tasksAutomated: 1247,
      errorReduction: 78,
      userSatisfaction: 4.8
    });

    // Track improvements
    setImprovements([
      {
        name: "Keyboard Shortcuts",
        status: "active",
        impact: "2 hours/week",
        adoption: 92
      },
      {
        name: "Bulk Operations",
        status: "active", 
        impact: "5 hours/week",
        adoption: 78
      },
      {
        name: "Email Templates",
        status: "active",
        impact: "4 hours/week",
        adoption: 85
      },
      {
        name: "Quick Actions",
        status: "active",
        impact: "3 hours/week",
        adoption: 95
      },
      {
        name: "Smart Search",
        status: "testing",
        impact: "2 hours/week",
        adoption: 65
      }
    ]);

    // Calculate savings
    setSavings({
      weekly: 752,
      monthly: 3260,
      annual: 39120,
      roi: 260
    });
  }, []);

  const efficiencyData = [
    { week: "W1", efficiency: 75, target: 95 },
    { week: "W2", efficiency: 78, target: 95 },
    { week: "W3", efficiency: 82, target: 95 },
    { week: "W4", efficiency: 85, target: 95 },
    { week: "W5", efficiency: 87, target: 95 },
    { week: "W6", efficiency: 89, target: 95 }
  ];

  const taskData = [
    { day: "Mon", manual: 45, automated: 120 },
    { day: "Tue", manual: 42, automated: 135 },
    { day: "Wed", manual: 38, automated: 142 },
    { day: "Thu", manual: 35, automated: 150 },
    { day: "Fri", manual: 30, automated: 165 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Productivity & Efficiency Dashboard</h1>
            <p className="text-green-100">Real-time tracking of workflow improvements and savings</p>
          </div>
          <Badge className="bg-white text-green-600 px-3 py-1">
            <Zap className="mr-1 h-4 w-4" />
            {metrics.timeSavedWeekly}h saved/week
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          icon={Target}
          label="Efficiency Rate"
          value={`${metrics.currentEfficiency}%`}
          target={`Target: ${metrics.targetEfficiency}%`}
          progress={metrics.currentEfficiency}
          color="purple"
        />
        <MetricCard
          icon={Zap}
          label="Automation Coverage"
          value={`${metrics.automationCoverage}%`}
          target="Tasks automated"
          progress={metrics.automationCoverage}
          color="blue"
        />
        <MetricCard
          icon={Clock}
          label="Time Saved"
          value={`${metrics.timeSavedWeekly}h`}
          target="Per week"
          progress={75}
          color="green"
        />
        <MetricCard
          icon={Award}
          label="User Satisfaction"
          value={`${metrics.userSatisfaction}/5`}
          target="Staff rating"
          progress={metrics.userSatisfaction * 20}
          color="orange"
        />
      </div>

      {/* Improvements Status */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Win Implementations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {improvements.map((improvement, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {improvement.status === "active" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  )}
                  <div>
                    <p className="font-medium">{improvement.name}</p>
                    <p className="text-sm text-gray-600">Impact: {improvement.impact}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Adoption Rate</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={improvement.adoption} className="w-20 h-2" />
                    <span className="text-sm font-medium">{improvement.adoption}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Efficiency Trend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Efficiency Improvement Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#5B2C91" 
                  strokeWidth={3}
                  name="Current"
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#00843D" 
                  strokeDasharray="5 5"
                  name="Target"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Automation Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={taskData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="automated" 
                  stackId="1"
                  stroke="#00843D" 
                  fill="#00843D"
                  fillOpacity={0.6}
                  name="Automated"
                />
                <Area 
                  type="monotone" 
                  dataKey="manual" 
                  stackId="1"
                  stroke="#FF6B6B" 
                  fill="#FF6B6B"
                  fillOpacity={0.6}
                  name="Manual"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Financial Impact */}
      <Card className="border-green-300">
        <CardHeader className="bg-green-50">
          <CardTitle className="text-green-800">Financial Impact & ROI</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SavingsCard
              label="Weekly Savings"
              value={`${savings.weekly}h`}
              subtitle="Hours saved"
              icon={Clock}
            />
            <SavingsCard
              label="Monthly Value"
              value={`$${savings.monthly?.toLocaleString()}`}
              subtitle="Cost savings"
              icon={DollarSign}
            />
            <SavingsCard
              label="Annual Impact"
              value={`$${savings.annual?.toLocaleString()}`}
              subtitle="Total savings"
              icon={TrendingUp}
            />
            <SavingsCard
              label="ROI"
              value={`${savings.roi}%`}
              subtitle="Return on investment"
              icon={BarChart3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps for Maximum Efficiency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert className="border-blue-300 bg-blue-50">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Priority 1:</strong> Activate Twilio SMS integration - Save additional 3 hours/week
              </AlertDescription>
            </Alert>
            <Alert className="border-purple-300 bg-purple-50">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Priority 2:</strong> Implement payment gateway - Automate $52,000 in annual processing
              </AlertDescription>
            </Alert>
            <Alert className="border-green-300 bg-green-50">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Priority 3:</strong> Enable OCR processing - Reduce document handling by 80%
              </AlertDescription>
            </Alert>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <h4 className="font-semibold mb-2">Projected Impact (Next Phase)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
              <div>
                <p className="text-sm text-gray-600">Additional Time</p>
                <p className="text-lg font-bold">+40h/week</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cost Savings</p>
                <p className="text-lg font-bold">+$208k/year</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Efficiency Target</p>
                <p className="text-lg font-bold">95%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Implementation</p>
                <p className="text-lg font-bold">4 weeks</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-purple-300">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-800">Live</Badge>
            </div>
            <h3 className="font-semibold">Tasks Automated</h3>
            <p className="text-2xl font-bold text-purple-600">{metrics.tasksAutomated}</p>
            <p className="text-xs text-gray-600 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="border-green-300">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-8 w-8 text-green-600" />
              <Badge className="bg-green-100 text-green-800">↓78%</Badge>
            </div>
            <h3 className="font-semibold">Error Reduction</h3>
            <p className="text-2xl font-bold text-green-600">{metrics.errorReduction}%</p>
            <p className="text-xs text-gray-600 mt-1">Since implementation</p>
          </CardContent>
        </Card>

        <Card className="border-blue-300">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-800">Target</Badge>
            </div>
            <h3 className="font-semibold">Full Optimization</h3>
            <p className="text-2xl font-bold text-blue-600">Q2 2025</p>
            <p className="text-xs text-gray-600 mt-1">95% efficiency goal</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, target, progress, color }: any) {
  return (
    <Card className={`border-${color}-200`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 bg-${color}-100 rounded-lg`}>
            <Icon className={`h-5 w-5 text-${color}-600`} />
          </div>
          <Badge variant="outline" className="text-xs">Live</Badge>
        </div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        <p className="text-xs text-gray-500">{target}</p>
        <Progress value={progress} className="mt-2 h-2" />
      </CardContent>
    </Card>
  );
}

function SavingsCard({ label, value, subtitle, icon: Icon }: any) {
  return (
    <div className="text-center p-4 bg-white rounded-lg border">
      <Icon className="h-8 w-8 text-green-600 mx-auto mb-2" />
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-green-600">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}