import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const testUsers = [
  { id: "test-super-admin", name: "Sarah Admin", role: "Super Admin", email: "admin@primacycare.test" },
  { id: "test-ceo", name: "Michael Thompson", role: "CEO", email: "ceo@primacycare.test" },
  { id: "test-general-manager", name: "Jennifer Williams", role: "General Manager", email: "gm@primacycare.test" },
  { id: "test-intake-coordinator", name: "David Chen", role: "Intake Coordinator", email: "intake.coord@primacycare.test" },
  { id: "test-intake-manager", name: "Lisa Martinez", role: "Intake Manager", email: "intake.mgr@primacycare.test" },
  { id: "test-finance-billing", name: "Robert Johnson", role: "Finance Officer - Billing", email: "billing@primacycare.test" },
  { id: "test-finance-payroll", name: "Emma Davis", role: "Finance Officer - Payroll", email: "payroll@primacycare.test" },
  { id: "test-finance-manager", name: "James Anderson", role: "Finance Manager", email: "finance.mgr@primacycare.test" },
  { id: "test-hr-manager", name: "Patricia Brown", role: "HR Manager", email: "hr.mgr@primacycare.test" },
  { id: "test-hr-recruiter", name: "Andrew Taylor", role: "HR Recruiter", email: "recruiter@primacycare.test" },
  { id: "test-service-manager", name: "Maria Garcia", role: "Service Delivery Manager", email: "service.mgr@primacycare.test" },
  { id: "test-service-allocation", name: "Kevin Lee", role: "Service Delivery - Allocation", email: "allocation@primacycare.test" },
  { id: "test-service-coordinator", name: "Sophie Wilson", role: "Service Delivery Coordinator", email: "coordinator@primacycare.test" },
  { id: "test-quality-manager", name: "Daniel Moore", role: "Quality Manager", email: "quality@primacycare.test" },
  { id: "test-support-worker", name: "Emily Jackson", role: "Support Worker", email: "support@primacycare.test" },
];

export function TestUserSelector() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUserSwitch = async (userId: string, role: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role })
      });
      
      if (response.ok) {
        toast({
          title: "Switching user...",
          description: `Logging in as ${role}`,
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast({
          title: "Error",
          description: "Failed to switch user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to switch user",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-900 border-yellow-300"
          disabled={isLoading}
        >
          <UserCircle className="h-4 w-4 mr-2" />
          {isLoading ? "Switching..." : "Test Users"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 max-h-96 overflow-y-auto">
        <DropdownMenuLabel>Switch Test User</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {testUsers.map((user) => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => handleUserSwitch(user.id, user.role)}
            className="cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs text-gray-500">{user.role}</span>
              <span className="text-xs text-gray-400">{user.email}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}