import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { 
  Clock, MapPin, Camera, Mic, CheckCircle, 
  Navigation, Phone, FileText, Battery, Wifi,
  WifiOff, Upload, User, Calendar, DollarSign
} from "lucide-react";
import { formatAustralianTime, formatAustralianDate } from "./australian-terminology";

/**
 * Mobile-optimized interface for Support Workers in the field
 * Large buttons, offline capability, quick actions
 */
export function MobileSupportWorker({ worker }: { worker: any }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [isClocked, setIsClocked] = useState(false);
  const [location, setLocation] = useState<string>("");
  const [quickNote, setQuickNote] = useState("");

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    // Get battery status if available
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }
    
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
      });
    }
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleClockIn = () => {
    setIsClocked(true);
    setCurrentShift({
      participant: "John Smith",
      service: "Community Access",
      startTime: new Date(),
      location: location || "Sydney NSW"
    });
  };

  const handleClockOut = () => {
    setIsClocked(false);
    // Save shift data
    alert("Shift ended. Time logged: 3.5 hours");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Status Bar */}
      <div className="bg-purple-600 text-white p-3 sticky top-0 z-50">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-3">
            {isOnline ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <WifiOff className="h-4 w-4 text-yellow-300" />
            )}
            <span>{isOnline ? "Online" : "Offline Mode"}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Battery className="h-4 w-4" />
            <span>{batteryLevel}%</span>
            <span>{formatAustralianTime(new Date(), true)}</span>
          </div>
        </div>
      </div>

      {/* Worker Header */}
      <Card className="m-4 border-2 border-purple-300">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">G'day, {worker?.name || "Support Worker"}!</h2>
              <p className="text-gray-600">{formatAustralianDate(new Date())}</p>
            </div>
            <Badge className="bg-green-600 text-white">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Clock In/Out - Primary Action */}
      <div className="px-4 mb-6">
        {!isClocked ? (
          <Button 
            size="lg"
            className="w-full h-20 text-xl bg-green-600 hover:bg-green-700"
            onClick={handleClockIn}
          >
            <Clock className="mr-3 h-8 w-8" />
            Clock In
          </Button>
        ) : (
          <div className="space-y-3">
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertDescription>
                <strong>Shift Active</strong><br />
                Started: {currentShift?.startTime && formatAustralianTime(currentShift.startTime)}<br />
                Participant: {currentShift?.participant}<br />
                Service: {currentShift?.service}
              </AlertDescription>
            </Alert>
            <Button 
              size="lg"
              variant="destructive"
              className="w-full h-16 text-lg"
              onClick={handleClockOut}
            >
              <Clock className="mr-3 h-6 w-6" />
              Clock Out
            </Button>
          </div>
        )}
      </div>

      {/* Today's Shifts */}
      <Card className="mx-4 mb-6 border-2">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Today's Shifts
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <ShiftCard
            time="9:00 AM - 12:00 PM"
            participant="John Smith"
            service="Community Access"
            location="Parramatta"
            status="completed"
          />
          <ShiftCard
            time="2:00 PM - 5:00 PM"
            participant="Mary Johnson"
            service="Daily Living Support"
            location="Blacktown"
            status="current"
          />
          <ShiftCard
            time="6:00 PM - 8:00 PM"
            participant="David Lee"
            service="Social Support"
            location="Castle Hill"
            status="upcoming"
          />
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <div className="px-4 mb-6">
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <QuickActionCard
            icon={FileText}
            label="Progress Note"
            color="blue"
            badge={isClocked ? "Active" : null}
          />
          <QuickActionCard
            icon={Camera}
            label="Take Photo"
            color="green"
            badge="2 pending"
          />
          <QuickActionCard
            icon={Navigation}
            label="Get Directions"
            color="purple"
          />
          <QuickActionCard
            icon={Phone}
            label="Emergency"
            color="red"
            emergency
          />
        </div>
      </div>

      {/* Quick Progress Note */}
      {isClocked && (
        <Card className="mx-4 mb-6 border-2 border-orange-300">
          <CardHeader className="bg-orange-50">
            <CardTitle className="text-lg">Quick Progress Note</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Textarea
              placeholder="Type your note here... (auto-saves)"
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              className="min-h-[100px] text-lg"
            />
            <div className="flex space-x-2 mt-3">
              <Button size="lg" className="flex-1">
                <Mic className="mr-2 h-5 w-5" />
                Voice Note
              </Button>
              <Button size="lg" variant="outline" className="flex-1">
                <Camera className="mr-2 h-5 w-5" />
                Add Photo
              </Button>
            </div>
            {!isOnline && (
              <Alert className="mt-3">
                <WifiOff className="h-4 w-4" />
                <AlertDescription>
                  Offline mode - Will sync when connection restored
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Kilometer Tracker */}
      <Card className="mx-4 mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Travel Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold">23.5 km</p>
              <p className="text-sm text-gray-600">Today's travel</p>
            </div>
            <Button size="lg" variant="outline">
              Start Trip
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200">
        <div className="grid grid-cols-4 h-16">
          <BottomNavItem icon={Calendar} label="Shifts" active />
          <BottomNavItem icon={User} label="Participants" />
          <BottomNavItem icon={FileText} label="Notes" badge="3" />
          <BottomNavItem icon={DollarSign} label="Pay" />
        </div>
      </div>
    </div>
  );
}

function ShiftCard({ time, participant, service, location, status }: any) {
  const getStatusColor = () => {
    switch(status) {
      case "completed": return "bg-gray-100 border-gray-300";
      case "current": return "bg-green-50 border-green-400";
      case "upcoming": return "bg-blue-50 border-blue-300";
      default: return "";
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getStatusColor()}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">{time}</p>
          <p className="text-lg font-bold mt-1">{participant}</p>
          <p className="text-gray-600">{service}</p>
          <p className="text-sm text-gray-500 flex items-center mt-1">
            <MapPin className="h-3 w-3 mr-1" />
            {location}
          </p>
        </div>
        <Badge variant={status === "current" ? "default" : "outline"}>
          {status}
        </Badge>
      </div>
      {status === "upcoming" && (
        <Button size="sm" className="w-full mt-3">
          View Details
        </Button>
      )}
    </div>
  );
}

function QuickActionCard({ icon: Icon, label, color, badge, emergency = false }: any) {
  return (
    <Button
      size="lg"
      variant={emergency ? "destructive" : "outline"}
      className={`h-24 flex flex-col items-center justify-center relative ${
        emergency ? "" : `border-${color}-300 hover:bg-${color}-50`
      }`}
    >
      <Icon className={`h-8 w-8 mb-2 ${emergency ? "" : `text-${color}-600`}`} />
      <span className="text-sm font-medium">{label}</span>
      {badge && (
        <Badge 
          className="absolute top-2 right-2" 
          variant={emergency ? "destructive" : "default"}
        >
          {badge}
        </Badge>
      )}
    </Button>
  );
}

function BottomNavItem({ icon: Icon, label, active = false, badge }: any) {
  return (
    <button 
      className={`flex flex-col items-center justify-center relative ${
        active ? "text-purple-600" : "text-gray-500"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs mt-1">{label}</span>
      {badge && (
        <Badge className="absolute top-1 right-4 h-5 w-5 p-0 flex items-center justify-center">
          {badge}
        </Badge>
      )}
    </button>
  );
}