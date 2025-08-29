import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  MapPin, Clock, CheckCircle, XCircle, Camera, 
  Navigation, User, Calendar, FileText, AlertTriangle,
  Smartphone, Shield, Activity
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MobileCheckInProps {
  shiftId: string;
  participantName: string;
  serviceType: string;
  scheduledTime: string;
  duration: number;
  address: string;
}

export function MobileCheckIn({
  shiftId,
  participantName,
  serviceType,
  scheduledTime,
  duration,
  address
}: MobileCheckInProps) {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = useState<string>("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [notes, setNotes] = useState("");
  const [incidents, setIncidents] = useState("");
  const { toast } = useToast();

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position);
          setLocationError("");
        },
        (error) => {
          setLocationError("Unable to get location. Please enable GPS.");
          console.error("Location error:", error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser");
    }
  }, []);

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/shifts/check-in", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      setIsCheckedIn(true);
      toast({
        title: "Checked In Successfully",
        description: "Your shift has started. Stay safe!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
    },
    onError: (error) => {
      toast({
        title: "Check-in Failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    }
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/shifts/check-out", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast({
        title: "Checked Out Successfully",
        description: "Thank you for your service today!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
    },
    onError: (error) => {
      toast({
        title: "Check-out Failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    }
  });

  const handleCheckIn = () => {
    if (!location) {
      toast({
        title: "Location Required",
        description: "Please enable GPS to check in.",
        variant: "destructive"
      });
      return;
    }

    checkInMutation.mutate({
      shiftId,
      checkInTime: new Date().toISOString(),
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy
    });
  };

  const handleCheckOut = () => {
    if (!location) {
      toast({
        title: "Location Required",
        description: "Please enable GPS to check out.",
        variant: "destructive"
      });
      return;
    }

    checkOutMutation.mutate({
      shiftId,
      checkOutTime: new Date().toISOString(),
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      notes,
      incidents: incidents || null
    });
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      {/* Shift Details Card */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardTitle className="flex items-center justify-between">
            <span>Shift Details</span>
            <Badge variant="secondary" className="bg-white text-blue-600">
              {isCheckedIn ? "Active" : "Scheduled"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Participant</p>
              <p className="font-semibold">{participantName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Activity className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Service Type</p>
              <p className="font-semibold">{serviceType}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Scheduled Time</p>
              <p className="font-semibold">{scheduledTime} ({duration} hours)</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-semibold">{address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GPS Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Navigation className={`h-5 w-5 ${location ? "text-green-500" : "text-gray-400"}`} />
              <span className="text-sm font-medium">GPS Status</span>
            </div>
            {location ? (
              <Badge variant="outline" className="text-green-600">
                <CheckCircle className="mr-1 h-3 w-3" />
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-600">
                <XCircle className="mr-1 h-3 w-3" />
                {locationError || "Inactive"}
              </Badge>
            )}
          </div>
          {location && (
            <p className="text-xs text-gray-500 mt-2">
              Accuracy: ±{Math.round(location.coords.accuracy)}m
            </p>
          )}
        </CardContent>
      </Card>

      {/* Check In/Out Actions */}
      {!isCheckedIn ? (
        <Card>
          <CardHeader>
            <CardTitle>Ready to Start?</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
              onClick={handleCheckIn}
              disabled={!location || checkInMutation.isPending}
            >
              <Clock className="mr-2 h-5 w-5" />
              {checkInMutation.isPending ? "Checking In..." : "Check In"}
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Your location will be recorded for compliance
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Shift</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notes">Shift Notes</Label>
              <Textarea
                id="notes"
                placeholder="Describe the activities and support provided..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="incidents">Incidents or Concerns</Label>
              <Textarea
                id="incidents"
                placeholder="Report any incidents, injuries, or concerns..."
                value={incidents}
                onChange={(e) => setIncidents(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>

            {incidents && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  An incident report will be created and sent to management
                </AlertDescription>
              </Alert>
            )}

            <Button 
              className="w-full bg-red-600 hover:bg-red-700"
              size="lg"
              onClick={handleCheckOut}
              disabled={!location || checkOutMutation.isPending || !notes}
            >
              <Clock className="mr-2 h-5 w-5" />
              {checkOutMutation.isPending ? "Checking Out..." : "Check Out"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              <Camera className="mr-2 h-4 w-4" />
              Add Photo
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              View Care Plan
            </Button>
            <Button variant="outline" size="sm">
              <Shield className="mr-2 h-4 w-4" />
              Emergency
            </Button>
            <Button variant="outline" size="sm">
              <Smartphone className="mr-2 h-4 w-4" />
              Call Support
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Safety Reminder */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Remember to follow all safety protocols and PPE requirements. 
          Contact your supervisor immediately if you feel unsafe.
        </AlertDescription>
      </Alert>
    </div>
  );
}