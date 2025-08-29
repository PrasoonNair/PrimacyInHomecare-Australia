import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Home, Calendar, Heart, Phone, DollarSign, 
  Users, Target, FileText, Map, HelpCircle,
  MessageSquare, Clock, CheckCircle, AlertCircle
} from "lucide-react";
import { formatAustralianDate, formatAustralianCurrency } from "./australian-terminology";

/**
 * Participant-friendly dashboard with Easy Read options
 * Large touch targets, simple language, visual icons
 */
export function ParticipantFriendlyDashboard({ participant }: { participant: any }) {
  const [easyReadMode, setEasyReadMode] = useState(true);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "extra-large">("large");

  const getFontSizeClass = () => {
    switch(fontSize) {
      case "large": return "text-lg";
      case "extra-large": return "text-xl";
      default: return "text-base";
    }
  };

  return (
    <div className={`space-y-6 ${getFontSizeClass()}`}>
      {/* Accessibility Controls */}
      <Card className="border-2 border-purple-300">
        <CardHeader className="bg-purple-50">
          <CardTitle className="flex items-center text-purple-800">
            <HelpCircle className="mr-2 h-6 w-6" />
            Accessibility Options
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              variant={easyReadMode ? "default" : "outline"}
              onClick={() => setEasyReadMode(!easyReadMode)}
              className="min-h-[48px]"
            >
              {easyReadMode ? "✓ Easy Read On" : "Easy Read Off"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                if (fontSize === "normal") setFontSize("large");
                else if (fontSize === "large") setFontSize("extra-large");
                else setFontSize("normal");
              }}
              className="min-h-[48px]"
            >
              Text Size: {fontSize.replace("-", " ")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-h-[48px]"
            >
              🔊 Read Aloud
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Welcome Message - Easy Read */}
      <Card className="border-2 border-green-300 bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white rounded-full">
              <Home className="h-8 w-8 text-purple-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">
                {easyReadMode ? "Hello!" : `G'day ${participant?.name || "there"}!`}
              </h1>
              <p className="text-gray-700 mt-2">
                {easyReadMode 
                  ? "This is your NDIS page. You can see your plan here."
                  : "Welcome to your NDIS participant portal. Everything you need is right here."}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Today is {formatAustralianDate(new Date())}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My NDIS Plan - Visual Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BigIconCard
          icon={DollarSign}
          title={easyReadMode ? "My Money" : "NDIS Budget"}
          value={formatAustralianCurrency(45000)}
          subtitle={easyReadMode ? "Money left to use" : "Remaining in plan"}
          color="green"
          progress={65}
        />
        <BigIconCard
          icon={Calendar}
          title={easyReadMode ? "Plan Time" : "Plan Duration"}
          value="8 months"
          subtitle={easyReadMode ? "Time left" : "Until next review"}
          color="blue"
          progress={33}
        />
      </div>

      {/* My Goals - Visual Cards */}
      <Card className="border-2 border-purple-300">
        <CardHeader className="bg-purple-50">
          <CardTitle className="flex items-center text-purple-800">
            <Target className="mr-2 h-6 w-6" />
            {easyReadMode ? "My Goals" : "NDIS Plan Goals"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <GoalCard
              icon="🏠"
              goal={easyReadMode ? "Live on my own" : "Independent living"}
              progress={60}
              status="working"
              easyRead={easyReadMode}
            />
            <GoalCard
              icon="💼"
              goal={easyReadMode ? "Get a job" : "Employment pathway"}
              progress={40}
              status="working"
              easyRead={easyReadMode}
            />
            <GoalCard
              icon="🚌"
              goal={easyReadMode ? "Use the bus" : "Public transport training"}
              progress={100}
              status="done"
              easyRead={easyReadMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* My Support Team - Photos and Contact */}
      <Card className="border-2 border-blue-300">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center text-blue-800">
            <Users className="mr-2 h-6 w-6" />
            {easyReadMode ? "My Helpers" : "Support Team"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SupportPersonCard
              name="Sarah"
              role={easyReadMode ? "Main Helper" : "Support Coordinator"}
              phone="0400 123 456"
              nextVisit="Tomorrow 10am"
              photo="👩"
            />
            <SupportPersonCard
              name="James"
              role={easyReadMode ? "Daily Helper" : "Support Worker"}
              phone="0400 234 567"
              nextVisit="Monday 2pm"
              photo="👨"
            />
            <SupportPersonCard
              name="Dr. Smith"
              role={easyReadMode ? "Doctor" : "GP"}
              phone="(02) 9876 5432"
              nextVisit="Next month"
              photo="👨‍⚕️"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions - Large Touch Targets */}
      <Card className="border-2 border-orange-300">
        <CardHeader className="bg-orange-50">
          <CardTitle className="flex items-center text-orange-800">
            <Heart className="mr-2 h-6 w-6" />
            {easyReadMode ? "Things I Can Do" : "Quick Actions"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionButton
              icon={Calendar}
              label={easyReadMode ? "See Calendar" : "View Schedule"}
              color="blue"
            />
            <QuickActionButton
              icon={MessageSquare}
              label={easyReadMode ? "Send Message" : "Contact Support"}
              color="green"
            />
            <QuickActionButton
              icon={FileText}
              label={easyReadMode ? "My Papers" : "Documents"}
              color="purple"
            />
            <QuickActionButton
              icon={Phone}
              label={easyReadMode ? "Call for Help" : "Emergency"}
              color="red"
              emergency
            />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact - Always Visible */}
      <Alert className="border-2 border-red-400 bg-red-50">
        <Phone className="h-5 w-5 text-red-600" />
        <AlertDescription className="text-lg">
          <strong>{easyReadMode ? "Need Help Now?" : "Emergency Support"}</strong>
          <br />
          {easyReadMode ? "Call: 000 (Emergency)" : "Emergency: 000"}
          <br />
          {easyReadMode ? "Call: 1800 800 110 (NDIS)" : "NDIS Hotline: 1800 800 110"}
        </AlertDescription>
      </Alert>
    </div>
  );
}

function BigIconCard({ icon: Icon, title, value, subtitle, color, progress }: any) {
  return (
    <Card className={`border-2 border-${color}-300 hover:shadow-lg transition-shadow`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className={`p-4 bg-${color}-100 rounded-xl`}>
            <Icon className={`h-10 w-10 text-${color}-600`} />
          </div>
          <Badge variant="outline" className="text-lg">Active</Badge>
        </div>
        <h3 className="text-xl font-bold mt-4">{title}</h3>
        <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        <p className="text-gray-600 mt-1">{subtitle}</p>
        <Progress value={progress} className="mt-4 h-3" />
      </CardContent>
    </Card>
  );
}

function GoalCard({ icon, goal, progress, status, easyRead }: any) {
  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
      <div className="text-4xl">{icon}</div>
      <div className="flex-1">
        <h4 className="font-semibold text-lg">{goal}</h4>
        <Progress value={progress} className="mt-2 h-3" />
        <p className="text-sm text-gray-600 mt-1">
          {easyRead 
            ? (status === "done" ? "✓ Finished!" : `${progress}% done`)
            : `Progress: ${progress}%`}
        </p>
      </div>
      {status === "done" && (
        <CheckCircle className="h-8 w-8 text-green-600" />
      )}
    </div>
  );
}

function SupportPersonCard({ name, role, phone, nextVisit, photo }: any) {
  return (
    <Card className="border-2 hover:shadow-lg transition-shadow">
      <CardContent className="pt-4 text-center">
        <div className="text-5xl mb-3">{photo}</div>
        <h4 className="font-bold text-lg">{name}</h4>
        <p className="text-gray-600">{role}</p>
        <Button 
          className="mt-3 w-full min-h-[48px]" 
          size="lg"
          variant="outline"
        >
          <Phone className="mr-2 h-5 w-5" />
          {phone}
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          Next: {nextVisit}
        </p>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({ icon: Icon, label, color, emergency = false }: any) {
  return (
    <Button
      size="lg"
      variant={emergency ? "destructive" : "outline"}
      className={`h-24 flex flex-col items-center justify-center space-y-2 ${
        emergency ? "" : `hover:bg-${color}-50 border-${color}-300`
      }`}
    >
      <Icon className={`h-8 w-8 ${emergency ? "" : `text-${color}-600`}`} />
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
}