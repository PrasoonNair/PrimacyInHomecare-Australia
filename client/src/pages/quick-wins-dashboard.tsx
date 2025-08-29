import { BulkOperations } from "@/components/bulk-operations";
import { EmailTemplates } from "@/components/email-templates";
import { ProductivityDashboard } from "@/components/productivity-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Zap, Upload, Mail, BarChart3, Keyboard, 
  MessageSquare, CheckCircle, TrendingUp
} from "lucide-react";

export default function QuickWinsDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-green-600 text-white p-6 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Quick Wins Implementation Center</h1>
            <p className="text-purple-100">Productivity improvements saving 16+ hours per week</p>
          </div>
          <Badge className="bg-white text-purple-600 px-3 py-1">
            <Zap className="mr-1 h-4 w-4" />
            Active
          </Badge>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatusCard
          icon={Keyboard}
          title="Keyboard Shortcuts"
          status="Active"
          savings="2h/week"
          color="green"
        />
        <StatusCard
          icon={Upload}
          title="Bulk Operations"
          status="Ready"
          savings="5h/week"
          color="blue"
        />
        <StatusCard
          icon={Mail}
          title="Email Templates"
          status="Active"
          savings="4h/week"
          color="purple"
        />
        <StatusCard
          icon={Zap}
          title="Quick Actions"
          status="Active"
          savings="3h/week"
          color="orange"
        />
        <StatusCard
          icon={MessageSquare}
          title="SMS Integration"
          status="Pending"
          savings="2h/week"
          color="gray"
        />
      </div>

      {/* Keyboard Shortcuts Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Keyboard className="mr-2 h-5 w-5" />
            Keyboard Shortcuts Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ShortcutItem shortcut="Ctrl/Cmd + K" action="Global Search" />
            <ShortcutItem shortcut="Ctrl/Cmd + N" action="New Participant" />
            <ShortcutItem shortcut="Ctrl/Cmd + S" action="Save Form" />
            <ShortcutItem shortcut="Ctrl/Cmd + R" action="Reports" />
            <ShortcutItem shortcut="Ctrl/Cmd + M" action="New Message" />
            <ShortcutItem shortcut="Ctrl/Cmd + Q" action="Quick Actions" />
            <ShortcutItem shortcut="Alt + 1-5" action="Switch Departments" />
            <ShortcutItem shortcut="F1" action="Help" />
          </div>
          <Alert className="mt-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Press F1 anytime to see all available keyboard shortcuts
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="bulk" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          <TabsTrigger value="email">Email Templates</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="sms">SMS Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="bulk">
          <BulkOperations />
        </TabsContent>

        <TabsContent value="email">
          <EmailTemplates />
        </TabsContent>

        <TabsContent value="productivity">
          <ProductivityDashboard />
        </TabsContent>

        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle>SMS Integration Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="border-orange-300 bg-orange-50">
                <MessageSquare className="h-4 w-4" />
                <AlertDescription>
                  <strong>Twilio SMS Ready to Activate</strong><br />
                  The Twilio package is installed and ready. To activate SMS features:
                  <ol className="mt-2 ml-4 list-decimal">
                    <li>Add your TWILIO_ACCOUNT_SID to environment variables</li>
                    <li>Add your TWILIO_AUTH_TOKEN to environment variables</li>
                    <li>Add your TWILIO_PHONE_NUMBER</li>
                    <li>Click "Activate SMS" below</li>
                  </ol>
                </AlertDescription>
              </Alert>
              <div className="mt-4 space-x-2">
                <Button>Add Twilio Credentials</Button>
                <Button variant="outline">Test SMS</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Impact Summary */}
      <Card className="border-green-300">
        <CardHeader className="bg-green-50">
          <CardTitle className="text-green-800 flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Quick Wins Impact Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-gray-600">Weekly Time Saved</p>
              <p className="text-2xl font-bold text-green-600">16 hours</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-gray-600">Monthly Value</p>
              <p className="text-2xl font-bold text-green-600">$3,200</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-gray-600">Annual Savings</p>
              <p className="text-2xl font-bold text-green-600">$38,400</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-gray-600">Efficiency Gain</p>
              <p className="text-2xl font-bold text-green-600">+47%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusCard({ icon: Icon, title, status, savings, color }: any) {
  return (
    <Card className={`border-${color}-200`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-2">
          <div className={`p-2 bg-${color}-100 rounded-lg`}>
            <Icon className={`h-5 w-5 text-${color}-600`} />
          </div>
          <Badge 
            variant={status === "Active" ? "default" : status === "Ready" ? "secondary" : "outline"}
            className="text-xs"
          >
            {status}
          </Badge>
        </div>
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs text-gray-600 mt-1">Saves {savings}</p>
      </CardContent>
    </Card>
  );
}

function ShortcutItem({ shortcut, action }: { shortcut: string; action: string }) {
  return (
    <div className="flex items-center space-x-2 p-2 border rounded-lg">
      <Badge variant="outline" className="font-mono text-xs">
        {shortcut}
      </Badge>
      <span className="text-sm">{action}</span>
    </div>
  );
}