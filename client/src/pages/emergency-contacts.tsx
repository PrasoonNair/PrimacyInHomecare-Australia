import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Clock, User, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  role: string;
  available: string;
}

export default function EmergencyContacts() {
  const { user } = useAuth();

  const { data: contacts = [], isLoading } = useQuery<EmergencyContact[]>({
    queryKey: ["/api/emergency-contacts"],
  });

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Emergency Contacts</h1>
            <p className="text-gray-600">Loading emergency contacts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Emergency Contacts</h1>
          <p className="text-gray-600">Important contact numbers for emergency situations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {contact.name}
                </CardTitle>
                <Badge 
                  variant={contact.available === '24/7' ? 'default' : 'secondary'}
                  className="flex items-center gap-1"
                >
                  <Clock className="h-3 w-3" />
                  {contact.available}
                </Badge>
              </div>
              <CardDescription>{contact.role}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Phone className="h-5 w-5 text-green-600" />
                  {contact.phone}
                </div>
                <Button
                  onClick={() => handleCall(contact.phone)}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid={`call-${contact.id}`}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Emergency Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-700">
          <ul className="space-y-2">
            <li>• For life-threatening emergencies, call 000 immediately</li>
            <li>• Contact the On-Call Manager for participant-related incidents</li>
            <li>• Document all emergency situations in the incident reporting system</li>
            <li>• Follow your training protocols for specific emergency types</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}