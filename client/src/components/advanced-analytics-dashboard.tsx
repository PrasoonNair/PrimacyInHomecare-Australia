import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, TrendingDown, DollarSign, Users, 
  BarChart3, PieChart, LineChart, Activity,
  Calendar, Target, Award, Brain, Zap, Bell
} from "lucide-react";
import { 
  LineChart as RechartsLineChart, Line, AreaChart, Area,
  BarChart, Bar, PieChart as RechartsPieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from "recharts";
import { formatAustralianCurrency } from "./australian-terminology";

export function AdvancedAnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [predictions, setPredictions] = useState<any>({});
  const [alerts, setAlerts] = useState<any[]>([]);

  // Simulated real-time data
  const revenueData = [
    { month: "Jan", actual: 285000, predicted: 290000, target: 280000 },
    { month: "Feb", actual: 298000, predicted: 295000, target: 290000 },
    { month: "Mar", actual: 312000, predicted: 310000, target: 300000 },
    { month: "Apr", actual: 328000, predicted: 325000, target: 310000 },
    { month: "May", actual: 345000, predicted: 340000, target: 320000 },
    { month: "Jun", actual: null, predicted: 355000, target: 330000 }
  ];

  const serviceUtilization = [
    { service: "Daily Living", hours: 1250, capacity: 1500, efficiency: 83 },
    { service: "Community Access", hours: 890, capacity: 1000, efficiency: 89 },
    { service: "Social Support", hours: 650, capacity: 800, efficiency: 81 },
    { service: "Transport", hours: 420, capacity: 500, efficiency: 84 },
    { service: "Respite", hours: 380, capacity: 400, efficiency: 95 }
  ];

  const participantGrowth = [
    { quarter: "Q1 2024", active: 180, new: 25, churned: 8 },
    { quarter: "Q2 2024", active: 197, new: 28, churned: 11 },
    { quarter: "Q3 2024", active: 215, new: 32, churned: 14 },
    { quarter: "Q4 2024", active: 238, new: 35, churned: 12 },
    { quarter: "Q1 2025", active: 261, new: 38, churned: 15 }
  ];

  const staffProductivity = [
    { name: "Support Workers", productivity: 87, satisfaction: 4.5, retention: 92 },
    { name: "Coordinators", productivity: 92, satisfaction: 4.3, retention: 88 },
    { name: "Admin Staff", productivity: 78, satisfaction: 4.1, retention: 85 },
    { name: "Management", productivity: 95, satisfaction: 4.6, retention: 95 }
  ];

  const COLORS = ['#5B2C91', '#00843D', '#FFD700', '#FF6B6B', '#4ECDC4'];

  useEffect(() => {
    // Simulate AI predictions
    setPredictions({
      revenueGrowth: 12.5,
      participantChurn: 5.2,
      staffTurnover: 8.1,
      budgetOverrun: 3.2,
      serviceGaps: 4,
      complianceRisk: "Low"
    });

    // Generate smart alerts
    setAlerts([
      {
        type: "warning",
        title: "Budget Alert",
        message: "3 participants approaching 80% budget utilization",
        action: "Review Plans"
      },
      {
        type: "success",
        title: "Efficiency Gain",
        message: "Service delivery efficiency up 8% this month",
        action: "View Report"
      },
      {
        type: "info",
        title: "Staff Availability",
        message: "5 support workers available for extra shifts next week",
        action: "Schedule"
      }
    ]);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header with AI Insights */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Advanced Analytics & AI Insights</h1>
            <p className="text-purple-100">Real-time performance monitoring with predictive analytics</p>
          </div>
          <Badge className="bg-white text-purple-600 px-3 py-1">
            <Brain className="mr-1 h-4 w-4" />
            AI Powered
          </Badge>
        </div>
      </div>

      {/* Key Performance Indicators with Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Monthly Revenue"
          value={formatAustralianCurrency(345000)}
          change={12.5}
          prediction="↑ $355k next month"
          icon={DollarSign}
          color="green"
        />
        <KPICard
          title="Active Participants"
          value="261"
          change={9.7}
          prediction="275 by month end"
          icon={Users}
          color="blue"
        />
        <KPICard
          title="Service Efficiency"
          value="87%"
          change={5.2}
          prediction="Target: 90%"
          icon={Activity}
          color="purple"
        />
        <KPICard
          title="Staff Utilization"
          value="89.7%"
          change={3.1}
          prediction="Optimal range"
          icon={Award}
          color="orange"
        />
      </div>

      {/* Smart Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Smart Alerts & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <Alert key={index} className={`border-${alert.type === 'warning' ? 'orange' : alert.type === 'success' ? 'green' : 'blue'}-300`}>
                <Zap className="h-4 w-4" />
                <AlertDescription className="flex justify-between items-center">
                  <div>
                    <strong>{alert.title}:</strong> {alert.message}
                  </div>
                  <Button size="sm" variant="outline">{alert.action}</Button>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="utilization">Service Utilization</TabsTrigger>
          <TabsTrigger value="growth">Participant Growth</TabsTrigger>
          <TabsTrigger value="productivity">Staff Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Revenue Trends & Predictions</CardTitle>
                <div className="flex space-x-2">
                  <Button size="sm" variant={selectedPeriod === "month" ? "default" : "outline"} onClick={() => setSelectedPeriod("month")}>Month</Button>
                  <Button size="sm" variant={selectedPeriod === "quarter" ? "default" : "outline"} onClick={() => setSelectedPeriod("quarter")}>Quarter</Button>
                  <Button size="sm" variant={selectedPeriod === "year" ? "default" : "outline"} onClick={() => setSelectedPeriod("year")}>Year</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip formatter={(value: any) => formatAustralianCurrency(value)} />
                  <Legend />
                  <Area type="monotone" dataKey="actual" stackId="1" stroke="#5B2C91" fill="#5B2C91" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="predicted" stackId="2" stroke="#00843D" fill="#00843D" fillOpacity={0.4} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="target" stroke="#FF6B6B" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">YTD Revenue</p>
                  <p className="text-2xl font-bold text-purple-600">{formatAustralianCurrency(1568000)}</p>
                  <p className="text-xs text-green-600">↑ 15.3% vs last year</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Projected Annual</p>
                  <p className="text-2xl font-bold text-green-600">{formatAustralianCurrency(3850000)}</p>
                  <p className="text-xs text-gray-500">Based on current growth</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Profit Margin</p>
                  <p className="text-2xl font-bold text-blue-600">18.5%</p>
                  <p className="text-xs text-green-600">↑ 2.1% improvement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utilization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Utilization & Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={serviceUtilization}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="service" />
                  <YAxis yAxisId="left" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Efficiency %', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="hours" fill="#5B2C91" />
                  <Bar yAxisId="left" dataKey="capacity" fill="#E0E0E0" />
                  <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#00843D" strokeWidth={3} />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Service Optimization Recommendations</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm">Respite services at 95% efficiency - Consider expanding capacity</span>
                    <Button size="sm">Expand</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm">Social Support underutilized - Launch promotion campaign</span>
                    <Button size="sm">Promote</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Participant Growth & Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Growth Trajectory</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={participantGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="quarter" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="active" stroke="#5B2C91" strokeWidth={3} />
                      <Line type="monotone" dataKey="new" stroke="#00843D" strokeWidth={2} />
                      <Line type="monotone" dataKey="churned" stroke="#FF6B6B" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Participant Segments</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: "Core Supports", value: 145 },
                          { name: "Capacity Building", value: 68 },
                          { name: "Capital Supports", value: 32 },
                          { name: "SIL", value: 16 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">AI Prediction</h4>
                <p className="text-sm text-gray-700">
                  Based on current trends, expecting <strong>285 active participants</strong> by end of Q2 2025.
                  Churn risk identified for 5 participants - recommend proactive engagement.
                </p>
                <Button size="sm" className="mt-2">View At-Risk Participants</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staffProductivity.map((group) => (
                  <div key={group.name} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">{group.name}</h4>
                      <div className="flex space-x-4 text-sm">
                        <span>Satisfaction: ⭐ {group.satisfaction}</span>
                        <span>Retention: {group.retention}%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Productivity</span>
                          <span>{group.productivity}%</span>
                        </div>
                        <Progress value={group.productivity} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Training ROI</h4>
                  <p className="text-2xl font-bold text-purple-600">312%</p>
                  <p className="text-xs text-gray-600">Productivity gain from recent training</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Overtime Reduction</h4>
                  <p className="text-2xl font-bold text-green-600">-28%</p>
                  <p className="text-xs text-gray-600">Through better roster optimization</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Predictive Analytics Panel */}
      <Card className="border-purple-300">
        <CardHeader className="bg-purple-50">
          <CardTitle className="flex items-center text-purple-800">
            <Brain className="mr-2 h-5 w-5" />
            AI-Powered Predictions & Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <PredictionCard
              label="Revenue Growth"
              value={`+${predictions.revenueGrowth}%`}
              confidence={92}
              trend="up"
            />
            <PredictionCard
              label="Participant Churn"
              value={`${predictions.participantChurn}%`}
              confidence={87}
              trend="stable"
            />
            <PredictionCard
              label="Staff Turnover"
              value={`${predictions.staffTurnover}%`}
              confidence={79}
              trend="down"
            />
            <PredictionCard
              label="Budget Overrun Risk"
              value={`${predictions.budgetOverrun}%`}
              confidence={95}
              trend="stable"
            />
            <PredictionCard
              label="Service Gaps"
              value={`${predictions.serviceGaps} areas`}
              confidence={88}
              trend="down"
            />
            <PredictionCard
              label="Compliance Risk"
              value={predictions.complianceRisk}
              confidence={94}
              trend="stable"
            />
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
            <h4 className="font-semibold mb-2">Strategic Recommendations</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Target className="h-4 w-4 mr-2 text-purple-600 mt-0.5" />
                <span>Focus on respite service expansion - 95% utilization indicates high demand</span>
              </li>
              <li className="flex items-start">
                <Target className="h-4 w-4 mr-2 text-purple-600 mt-0.5" />
                <span>Implement retention program for 5 at-risk participants identified by AI</span>
              </li>
              <li className="flex items-start">
                <Target className="h-4 w-4 mr-2 text-purple-600 mt-0.5" />
                <span>Optimize Wednesday afternoon shifts - 23% underutilization detected</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KPICard({ title, value, change, prediction, icon: Icon, color }: any) {
  const isPositive = change > 0;
  
  return (
    <Card className={`border-${color}-200 hover:shadow-lg transition-shadow`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className={`p-2 bg-${color}-100 rounded-lg`}>
            <Icon className={`h-5 w-5 text-${color}-600`} />
          </div>
          <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            {Math.abs(change)}%
          </div>
        </div>
        <h3 className="text-sm font-medium text-gray-600 mt-3">{title}</h3>
        <p className="text-2xl font-bold mt-1">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{prediction}</p>
      </CardContent>
    </Card>
  );
}

function PredictionCard({ label, value, confidence, trend }: any) {
  const getTrendIcon = () => {
    switch(trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="p-3 border rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium">{label}</span>
        {getTrendIcon()}
      </div>
      <p className="text-xl font-bold">{value}</p>
      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span>Confidence</span>
          <span>{confidence}%</span>
        </div>
        <Progress value={confidence} className="h-1" />
      </div>
    </div>
  );
}