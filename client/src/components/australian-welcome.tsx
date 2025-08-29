import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, Users, Heart, Shield, Phone, 
  Calendar, Clock, DollarSign, FileText, Award
} from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";

/**
 * Australian-specific welcome component with NDIS branding
 * Includes Indigenous acknowledgment and local time/date formatting
 */
export function AustralianWelcome({ user }: { user: any }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Australian-style greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("G'day");
    } else if (hour < 17) {
      setGreeting("Good arvo");
    } else {
      setGreeting("Good evening");
    }

    return () => clearInterval(timer);
  }, []);

  // Format date in Australian format (DD/MM/YYYY)
  const formatAustralianDate = (date: Date) => {
    return format(date, "dd/MM/yyyy");
  };

  // Format time with option for 24-hour
  const formatAustralianTime = (date: Date, use24Hour: boolean = false) => {
    return format(date, use24Hour ? "HH:mm" : "h:mm a");
  };

  return (
    <div className="space-y-4">
      {/* Indigenous Acknowledgment */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <MapPin className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-orange-900 font-medium">
                Acknowledgment of Country
              </p>
              <p className="text-xs text-orange-800 mt-1">
                We acknowledge the Traditional Custodians of the land on which we work and live. 
                We pay our respects to Elders past, present and emerging.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalised Welcome */}
      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-300">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-purple-900">
                {greeting}, {user?.name || "Mate"}! 👋
              </h2>
              <p className="text-purple-700 mt-1">
                Welcome to Primacy Care Australia
              </p>
              <div className="flex items-center space-x-4 mt-3 text-sm text-purple-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatAustralianDate(currentTime)}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatAustralianTime(currentTime)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-purple-600 text-white">
                NDIS Registered Provider
              </Badge>
              <p className="text-xs text-purple-600 mt-2">
                Provider No: 4050123456
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions - Australian Context */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <QuickActionCard
          icon={Users}
          title="Participants"
          description="Manage NDIS participants"
          color="blue"
          action="View All"
        />
        <QuickActionCard
          icon={FileText}
          title="Service Agreements"
          description="Active agreements"
          color="green"
          action="Manage"
        />
        <QuickActionCard
          icon={DollarSign}
          title="NDIS Claims"
          description="Submit to NDIA"
          color="purple"
          action="Process"
        />
        <QuickActionCard
          icon={Phone}
          title="Support Line"
          description="1800 800 110"
          color="orange"
          action="Contact"
        />
      </div>

      {/* NDIS Categories Quick Reference */}
      <Card>
        <CardContent className="pt-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center">
            <Shield className="h-4 w-4 mr-2 text-purple-600" />
            NDIS Support Categories
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { code: "01", name: "Assistance with Daily Life", color: "blue" },
              { code: "02", name: "Transport", color: "green" },
              { code: "03", name: "Community Participation", color: "purple" },
              { code: "04", name: "Consumables", color: "orange" },
              { code: "06", name: "Social & Recreation", color: "pink" },
              { code: "07", name: "Support Coordination", color: "indigo" },
              { code: "08", name: "Improved Living", color: "red" },
              { code: "09", name: "Life Skills", color: "yellow" }
            ].map((category) => (
              <div 
                key={category.code}
                className={`p-2 rounded-lg border bg-${category.color}-50 border-${category.color}-200`}
              >
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {category.code}
                  </Badge>
                  <span className="text-xs font-medium">{category.name}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickActionCard({ 
  icon: Icon, 
  title, 
  description, 
  color, 
  action 
}: {
  icon: any;
  title: string;
  description: string;
  color: string;
  action: string;
}) {
  return (
    <Card className={`border-${color}-200 hover:shadow-lg transition-shadow cursor-pointer`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className={`p-2 bg-${color}-100 rounded-lg inline-block`}>
            <Icon className={`h-5 w-5 text-${color}-600`} />
          </div>
          <Button size="sm" variant="ghost" className="text-xs">
            {action}
          </Button>
        </div>
        <h4 className="font-semibold mt-3">{title}</h4>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}