import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, Settings, Play, Pause, CheckCircle, 
  AlertTriangle, Clock, RefreshCw, Bot,
  Mail, MessageSquare, Phone, FileText,
  DollarSign, Users, Calendar, Shield
} from "lucide-react";

export function SmartAutomationHub() {
  const [automations, setAutomations] = useState<any[]>([]);
  const [runningTasks, setRunningTasks] = useState<any[]>([]);
  const [automationStats, setAutomationStats] = useState<any>({});

  useEffect(() => {
    // Initialize automations
    setAutomations([
      {
        id: 1,
        name: "NDIS Claim Auto-Submission",
        description: "Automatically submit claims to NDIS portal daily",
        category: "Financial",
        status: "active",
        schedule: "Daily at 9:00 PM",
        lastRun: "2 hours ago",
        successRate: 98.5,
        timeSaved: "8 hours/week",
        enabled: true
      },
      {
        id: 2,
        name: "Participant Birthday Greetings",
        description: "Send personalized birthday messages to participants",
        category: "Communication",
        status: "active",
        schedule: "Daily at 9:00 AM",
        lastRun: "Yesterday",
        successRate: 100,
        timeSaved: "2 hours/month",
        enabled: true
      },
      {
        id: 3,
        name: "Staff Shift Reminders",
        description: "Send SMS reminders 2 hours before shift starts",
        category: "Scheduling",
        status: "active",
        schedule: "Continuous",
        lastRun: "30 mins ago",
        successRate: 99.2,
        timeSaved: "5 hours/week",
        enabled: true
      },
      {
        id: 4,
        name: "Budget Threshold Alerts",
        description: "Alert when participant budget reaches 80% utilization",
        category: "Financial",
        status: "active",
        schedule: "Real-time",
        lastRun: "1 hour ago",
        successRate: 100,
        timeSaved: "4 hours/week",
        enabled: true
      },
      {
        id: 5,
        name: "Document Expiry Notifications",
        description: "Notify 30 days before certifications expire",
        category: "Compliance",
        status: "active",
        schedule: "Weekly",
        lastRun: "3 days ago",
        successRate: 100,
        timeSaved: "3 hours/week",
        enabled: true
      },
      {
        id: 6,
        name: "Invoice Generation",
        description: "Auto-generate invoices from completed services",
        category: "Financial",
        status: "paused",
        schedule: "End of month",
        lastRun: "Last month",
        successRate: 96.8,
        timeSaved: "12 hours/month",
        enabled: false
      }
    ]);

    // Simulated running tasks
    setRunningTasks([
      {
        id: 1,
        task: "Processing NDIS claims batch",
        progress: 65,
        eta: "5 mins",
        items: "23/35 claims"
      },
      {
        id: 2,
        task: "Syncing with Xero",
        progress: 89,
        eta: "1 min",
        items: "178/200 transactions"
      }
    ]);

    // Statistics
    setAutomationStats({
      totalAutomations: 24,
      activeAutomations: 18,
      tasksToday: 156,
      timeSavedThisWeek: 47,
      successRate: 97.8,
      costSavings: 4250
    });
  }, []);

  const toggleAutomation = (id: number) => {
    setAutomations(prev => prev.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled, status: !a.enabled ? 'active' : 'paused' } : a
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Smart Automation Hub</h1>
            <p className="text-indigo-100">Intelligent workflow automation saving you {automationStats.timeSavedThisWeek} hours this week</p>
          </div>
          <Badge className="bg-white text-indigo-600 px-3 py-1">
            <Bot className="mr-1 h-4 w-4" />
            AI Powered
          </Badge>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <StatCard
          icon={Zap}
          label="Active Automations"
          value={automationStats.activeAutomations}
          total={automationStats.totalAutomations}
          color="purple"
        />
        <StatCard
          icon={Play}
          label="Tasks Today"
          value={automationStats.tasksToday}
          color="green"
        />
        <StatCard
          icon={Clock}
          label="Time Saved"
          value={`${automationStats.timeSavedThisWeek}h`}
          subtitle="This week"
          color="blue"
        />
        <StatCard
          icon={CheckCircle}
          label="Success Rate"
          value={`${automationStats.successRate}%`}
          color="emerald"
        />
        <StatCard
          icon={DollarSign}
          label="Cost Savings"
          value={`$${automationStats.costSavings}`}
          subtitle="This month"
          color="yellow"
        />
        <StatCard
          icon={RefreshCw}
          label="Running Now"
          value={runningTasks.length}
          color="orange"
        />
      </div>

      {/* Running Tasks */}
      {runningTasks.length > 0 && (
        <Card className="border-green-300">
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center text-green-800">
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              Currently Running
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {runningTasks.map((task) => (
                <div key={task.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{task.task}</span>
                    <Badge variant="outline">{task.eta} remaining</Badge>
                  </div>
                  <Progress value={task.progress} className="h-2 mb-1" />
                  <p className="text-xs text-gray-600">{task.items}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Automation Management */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Automations</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {automations.map((automation) => (
              <AutomationCard
                key={automation.id}
                automation={automation}
                onToggle={() => toggleAutomation(automation.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {automations.filter(a => a.category === "Financial").map((automation) => (
              <AutomationCard
                key={automation.id}
                automation={automation}
                onToggle={() => toggleAutomation(automation.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {automations.filter(a => a.category === "Communication").map((automation) => (
              <AutomationCard
                key={automation.id}
                automation={automation}
                onToggle={() => toggleAutomation(automation.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create New Automation */}
      <Card className="border-purple-300">
        <CardHeader className="bg-purple-50">
          <CardTitle className="text-purple-800">Create Custom Automation</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AutomationTemplate
              icon={Mail}
              title="Email Campaign"
              description="Automated email sequences"
            />
            <AutomationTemplate
              icon={MessageSquare}
              title="SMS Notifications"
              description="Bulk SMS messaging"
            />
            <AutomationTemplate
              icon={FileText}
              title="Report Generation"
              description="Scheduled reports"
            />
            <AutomationTemplate
              icon={Users}
              title="Staff Onboarding"
              description="New hire workflow"
            />
            <AutomationTemplate
              icon={Calendar}
              title="Appointment Booking"
              description="Auto-scheduling"
            />
            <AutomationTemplate
              icon={Shield}
              title="Compliance Checks"
              description="Regular audits"
            />
            <AutomationTemplate
              icon={DollarSign}
              title="Payment Processing"
              description="Auto reconciliation"
            />
            <AutomationTemplate
              icon={Bot}
              title="Custom Workflow"
              description="Build your own"
            />
          </div>
        </CardContent>
      </Card>

      {/* Automation Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert className="border-green-300 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <strong>Top Performer:</strong> NDIS Claim Auto-Submission has saved 32 hours this month with 98.5% success rate
              </AlertDescription>
            </Alert>
            
            <Alert className="border-blue-300 bg-blue-50">
              <Zap className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <strong>Optimization Opportunity:</strong> Enable Invoice Generation automation to save additional 12 hours monthly
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold mb-2">Most Used</h4>
                <p className="text-2xl font-bold text-purple-600">Staff Reminders</p>
                <p className="text-xs text-gray-600">423 executions this week</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold mb-2">Biggest Time Saver</h4>
                <p className="text-2xl font-bold text-green-600">Invoice Generation</p>
                <p className="text-xs text-gray-600">12 hours/month saved</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">Most Reliable</h4>
                <p className="text-2xl font-bold text-blue-600">Budget Alerts</p>
                <p className="text-xs text-gray-600">100% success rate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, total, subtitle, color }: any) {
  return (
    <Card className={`border-${color}-200`}>
      <CardContent className="pt-4">
        <div className={`p-2 bg-${color}-100 rounded-lg inline-block mb-2`}>
          <Icon className={`h-5 w-5 text-${color}-600`} />
        </div>
        <p className="text-xs text-gray-600">{label}</p>
        <p className="text-2xl font-bold">
          {value}
          {total && <span className="text-sm text-gray-500">/{total}</span>}
        </p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function AutomationCard({ automation, onToggle }: any) {
  const getCategoryIcon = () => {
    switch(automation.category) {
      case "Financial": return <DollarSign className="h-4 w-4" />;
      case "Communication": return <MessageSquare className="h-4 w-4" />;
      case "Scheduling": return <Calendar className="h-4 w-4" />;
      case "Compliance": return <Shield className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <Card className={`${automation.enabled ? 'border-green-300' : 'border-gray-300'}`}>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${automation.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
              {getCategoryIcon()}
            </div>
            <div>
              <h3 className="font-semibold">{automation.name}</h3>
              <p className="text-sm text-gray-600">{automation.description}</p>
            </div>
          </div>
          <Switch
            checked={automation.enabled}
            onCheckedChange={onToggle}
          />
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Schedule:</span>
            <span>{automation.schedule}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last run:</span>
            <span>{automation.lastRun}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Success rate:</span>
            <Badge variant="outline" className="text-xs">
              {automation.successRate}%
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Time saved:</span>
            <span className="text-green-600 font-medium">{automation.timeSaved}</span>
          </div>
        </div>

        <div className="flex space-x-2 mt-3">
          <Button size="sm" variant="outline" className="flex-1">
            <Settings className="mr-1 h-3 w-3" />
            Configure
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Play className="mr-1 h-3 w-3" />
            Run Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AutomationTemplate({ icon: Icon, title, description }: any) {
  return (
    <Button
      variant="outline"
      className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50"
    >
      <Icon className="h-6 w-6 text-purple-600" />
      <div className="text-center">
        <p className="text-xs font-semibold">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </Button>
  );
}