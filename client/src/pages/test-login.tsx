import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation } from "wouter";
import { Shield, User, Briefcase, Heart, Calculator, Users, ClipboardCheck, Sparkles } from "lucide-react";

// Test users data matching the backend
const testUsers = [
  {
    id: "test-super-admin",
    email: "admin@primacycare.test",
    name: "Sarah Admin",
    role: "Super Admin",
    department: "Administration",
    icon: Shield,
    description: "Full system access and configuration"
  },
  {
    id: "test-ceo",
    email: "ceo@primacycare.test",
    name: "Michael Thompson",
    role: "CEO",
    department: "Executive",
    icon: Briefcase,
    description: "Executive oversight and strategic planning"
  },
  {
    id: "test-general-manager",
    email: "gm@primacycare.test",
    name: "Jennifer Williams",
    role: "General Manager",
    department: "Management",
    icon: Briefcase,
    description: "Operational management and coordination"
  },
  {
    id: "test-intake-coordinator",
    email: "intake.coord@primacycare.test",
    name: "David Chen",
    role: "Intake Coordinator",
    department: "Intake",
    icon: ClipboardCheck,
    description: "Participant intake and assessment"
  },
  {
    id: "test-intake-manager",
    email: "intake.mgr@primacycare.test",
    name: "Lisa Martinez",
    role: "Intake Manager",
    department: "Intake",
    icon: ClipboardCheck,
    description: "Intake department management"
  },
  {
    id: "test-finance-billing",
    email: "billing@primacycare.test",
    name: "Robert Johnson",
    role: "Finance Officer - Billing",
    department: "Finance",
    icon: Calculator,
    description: "Invoice and billing management"
  },
  {
    id: "test-finance-payroll",
    email: "payroll@primacycare.test",
    name: "Emma Davis",
    role: "Finance Officer - Payroll",
    department: "Finance",
    icon: Calculator,
    description: "Payroll and SCHADS compliance"
  },
  {
    id: "test-finance-manager",
    email: "finance.mgr@primacycare.test",
    name: "James Anderson",
    role: "Finance Manager",
    department: "Finance",
    icon: Calculator,
    description: "Financial oversight and reporting"
  },
  {
    id: "test-hr-manager",
    email: "hr.mgr@primacycare.test",
    name: "Patricia Brown",
    role: "HR Manager",
    department: "HR & Recruitment",
    icon: Users,
    description: "Human resources management"
  },
  {
    id: "test-hr-recruiter",
    email: "recruiter@primacycare.test",
    name: "Andrew Taylor",
    role: "HR Recruiter",
    department: "HR & Recruitment",
    icon: Users,
    description: "Staff recruitment and onboarding"
  },
  {
    id: "test-service-manager",
    email: "service.mgr@primacycare.test",
    name: "Maria Garcia",
    role: "Service Delivery Manager",
    department: "Service Delivery",
    icon: Heart,
    description: "Service delivery oversight"
  },
  {
    id: "test-service-allocation",
    email: "allocation@primacycare.test",
    name: "Kevin Lee",
    role: "Service Delivery - Allocation",
    department: "Service Delivery",
    icon: Heart,
    description: "Staff allocation and scheduling"
  },
  {
    id: "test-service-coordinator",
    email: "coordinator@primacycare.test",
    name: "Sophie Wilson",
    role: "Service Delivery Coordinator",
    department: "Service Delivery",
    icon: Heart,
    description: "Service coordination and support"
  },
  {
    id: "test-quality-manager",
    email: "quality@primacycare.test",
    name: "Daniel Moore",
    role: "Quality Manager",
    department: "Compliance & Quality",
    icon: Sparkles,
    description: "Quality assurance and compliance"
  },
  {
    id: "test-support-worker",
    email: "support@primacycare.test",
    name: "Emily Jackson",
    role: "Support Worker",
    department: "Service Delivery",
    icon: Heart,
    description: "Direct participant support"
  }
];

export default function TestLogin() {
  const [selectedUser, setSelectedUser] = useState(testUsers[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleTestLogin = async () => {
    setIsLoading(true);
    const user = testUsers.find(u => u.id === selectedUser);
    
    if (user) {
      try {
        // Store test user in session
        const response = await fetch('/api/test-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, role: user.role })
        });
        
        if (response.ok) {
          // Redirect to dashboard
          window.location.href = '/';
        } else {
          console.error('Test login failed');
        }
      } catch (error) {
        console.error('Error during test login:', error);
      }
    }
    
    setIsLoading(false);
  };

  const groupedUsers = testUsers.reduce((acc, user) => {
    if (!acc[user.department]) {
      acc[user.department] = [];
    }
    acc[user.department].push(user);
    return acc;
  }, {} as Record<string, typeof testUsers>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl">Test Login - Role Selection</CardTitle>
          <CardDescription>
            Select a test role to explore the system with role-specific permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              <strong>Testing Mode:</strong> This is a development environment. Select any role to test the system's features and permissions.
            </AlertDescription>
          </Alert>

          <ScrollArea className="h-[400px] pr-4">
            <RadioGroup value={selectedUser} onValueChange={setSelectedUser}>
              {Object.entries(groupedUsers).map(([department, users]) => (
                <div key={department} className="mb-6">
                  <h3 className="font-semibold text-sm text-gray-600 mb-3">{department}</h3>
                  <div className="space-y-2">
                    {users.map((user) => {
                      const Icon = user.icon;
                      return (
                        <Label
                          key={user.id}
                          htmlFor={user.id}
                          className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors
                            ${selectedUser === user.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}`}
                        >
                          <RadioGroupItem value={user.id} id={user.id} className="mt-1" />
                          <Icon className="h-5 w-5 text-gray-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-600">{user.role}</div>
                            <div className="text-xs text-gray-500 mt-1">{user.description}</div>
                            <div className="text-xs text-gray-400 mt-1">Test email: {user.email}</div>
                          </div>
                        </Label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </RadioGroup>
          </ScrollArea>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              Selected: <strong>{testUsers.find(u => u.id === selectedUser)?.role}</strong>
            </div>
            <Button 
              onClick={handleTestLogin} 
              disabled={isLoading}
              className="min-w-[150px]"
            >
              {isLoading ? "Logging in..." : "Login as Test User"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}