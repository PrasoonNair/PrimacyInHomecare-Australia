import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Staff } from "@shared/schema";

export default function StaffManagement() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: staff, isLoading: staffLoading } = useQuery({
    queryKey: ["/api/staff"],
    enabled: isAuthenticated,
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const filteredStaff = staff?.filter((member: Staff) =>
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(parseFloat(amount));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <Header title="Staff Management" subtitle="Manage staff members and their assignments" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <Input
              type="text"
              placeholder="Search staff members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80"
              data-testid="input-search-staff"
            />
            <Button className="bg-primary hover:bg-blue-700" data-testid="button-add-staff">
              <i className="fas fa-user-plus mr-2"></i>
              Add Staff Member
            </Button>
          </div>

          {staffLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredStaff.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <i className="fas fa-user-tie text-gray-400 text-4xl mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? "No staff members match your search criteria." : "Get started by adding your first staff member."}
                </p>
                {!searchTerm && (
                  <Button className="bg-primary hover:bg-blue-700" data-testid="button-add-first-staff">
                    <i className="fas fa-user-plus mr-2"></i>
                    Add First Staff Member
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStaff.map((member: Staff) => (
                <Card key={member.id} className="hover:shadow-md transition-shadow" data-testid={`card-staff-${member.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg" data-testid={`text-staff-name-${member.id}`}>
                          {member.firstName} {member.lastName}
                        </CardTitle>
                        {member.position && (
                          <p className="text-sm text-gray-600" data-testid={`text-staff-position-${member.id}`}>
                            {member.position}
                          </p>
                        )}
                      </div>
                      <Badge variant={member.isActive ? "default" : "secondary"}>
                        {member.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {member.employeeId && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Employee ID:</strong> {member.employeeId}
                      </p>
                    )}
                    {member.email && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Email:</strong> {member.email}
                      </p>
                    )}
                    {member.phone && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Phone:</strong> {member.phone}
                      </p>
                    )}
                    {member.hourlyRate && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Hourly Rate:</strong> {formatCurrency(member.hourlyRate)}
                      </p>
                    )}
                    {member.qualifications && (
                      <p className="text-sm text-gray-600 mb-4">
                        <strong>Qualifications:</strong> {member.qualifications}
                      </p>
                    )}
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" data-testid={`button-edit-staff-${member.id}`}>
                        <i className="fas fa-edit mr-1"></i>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" data-testid={`button-schedule-staff-${member.id}`}>
                        <i className="fas fa-calendar mr-1"></i>
                        Schedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
