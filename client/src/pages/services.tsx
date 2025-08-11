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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ServiceBookingForm from "@/components/forms/service-booking-form";
import type { Service } from "@shared/schema";

export default function Services() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

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

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/services"],
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

  const filteredServices = services?.filter((service: Service) =>
    service.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "default";
      case "in_progress":
        return "secondary";
      case "completed":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_progress":
        return "In Progress";
      case "scheduled":
        return "Scheduled";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(parseFloat(amount));
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <Header title="Service Bookings" subtitle="Manage service scheduling and delivery" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <Input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80"
              data-testid="input-search-services"
            />
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-blue-700" data-testid="button-add-service">
                  <i className="fas fa-calendar-plus mr-2"></i>
                  Book New Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Book New Service</DialogTitle>
                </DialogHeader>
                <ServiceBookingForm onClose={() => setIsFormOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {servicesLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <i className="fas fa-calendar-check text-gray-400 text-4xl mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? "No services match your search criteria." : "Get started by booking your first service."}
                </p>
                {!searchTerm && (
                  <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-blue-700" data-testid="button-book-first-service">
                        <i className="fas fa-calendar-plus mr-2"></i>
                        Book First Service
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Book New Service</DialogTitle>
                      </DialogHeader>
                      <ServiceBookingForm onClose={() => setIsFormOpen(false)} />
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredServices.map((service: Service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow" data-testid={`card-service-${service.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg" data-testid={`text-service-name-${service.id}`}>
                        {service.serviceName}
                      </CardTitle>
                      <Badge variant={getStatusColor(service.status as string)}>
                        {getStatusText(service.status as string)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 capitalize">
                      {service.serviceCategory?.replace('_', ' ')}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Scheduled Date & Time</p>
                        <p className="text-sm text-gray-600">
                          {new Date(service.scheduledDate).toLocaleString()}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Duration</p>
                          <p className="text-sm text-gray-600">
                            {formatDuration(service.duration)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Cost</p>
                          <p className="text-sm font-semibold text-primary">
                            {formatCurrency(service.totalCost)}
                          </p>
                        </div>
                      </div>

                      {service.location && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Location</p>
                          <p className="text-sm text-gray-600">{service.location}</p>
                        </div>
                      )}

                      {service.notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Notes</p>
                          <p className="text-sm text-gray-600">{service.notes}</p>
                        </div>
                      )}

                      <div className="flex space-x-2 mt-4">
                        <Button variant="outline" size="sm" data-testid={`button-edit-service-${service.id}`}>
                          <i className="fas fa-edit mr-1"></i>
                          Edit
                        </Button>
                        {service.status === "scheduled" && (
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" data-testid={`button-cancel-service-${service.id}`}>
                            <i className="fas fa-times mr-1"></i>
                            Cancel
                          </Button>
                        )}
                        {service.status === "in_progress" && (
                          <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700" data-testid={`button-complete-service-${service.id}`}>
                            <i className="fas fa-check mr-1"></i>
                            Complete
                          </Button>
                        )}
                      </div>
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
