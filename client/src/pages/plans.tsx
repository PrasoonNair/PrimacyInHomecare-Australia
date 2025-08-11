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
import type { NdisPlan } from "@shared/schema";

export default function Plans() {
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

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["/api/plans"],
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

  const filteredPlans = plans?.filter((plan: NdisPlan) =>
    plan.planNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "expired":
        return "destructive";
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

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
        <Header title="NDIS Plans" subtitle="Manage participant NDIS plans and budgets" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <Input
              type="text"
              placeholder="Search plans by plan number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80"
              data-testid="input-search-plans"
            />
            <Button className="bg-primary hover:bg-blue-700" data-testid="button-add-plan">
              <i className="fas fa-file-plus mr-2"></i>
              Add New Plan
            </Button>
          </div>

          {plansLoading ? (
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
          ) : filteredPlans.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <i className="fas fa-file-alt text-gray-400 text-4xl mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No NDIS plans found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? "No plans match your search criteria." : "Get started by adding your first NDIS plan."}
                </p>
                {!searchTerm && (
                  <Button className="bg-primary hover:bg-blue-700" data-testid="button-add-first-plan">
                    <i className="fas fa-file-plus mr-2"></i>
                    Add First Plan
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPlans.map((plan: NdisPlan) => (
                <Card key={plan.id} className="hover:shadow-md transition-shadow" data-testid={`card-plan-${plan.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg" data-testid={`text-plan-number-${plan.id}`}>
                        Plan #{plan.planNumber}
                      </CardTitle>
                      <Badge variant={getStatusColor(plan.status as string)}>
                        {plan.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Total Budget</p>
                        <p className="text-lg font-semibold text-primary" data-testid={`text-total-budget-${plan.id}`}>
                          {formatCurrency(plan.totalBudget)}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Core Supports</p>
                          <p className="text-secondary font-semibold">
                            {formatCurrency(plan.coreSupportsbudget)}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Capacity Building</p>
                          <p className="text-secondary font-semibold">
                            {formatCurrency(plan.capacityBuildingBudget)}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Capital Supports</p>
                          <p className="text-secondary font-semibold">
                            {formatCurrency(plan.capitalSupportsBudget)}
                          </p>
                        </div>
                      </div>

                      {plan.planManagerName && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Plan Manager</p>
                          <p className="text-sm text-gray-600">{plan.planManagerName}</p>
                        </div>
                      )}

                      {plan.reviewDate && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Review Date</p>
                          <p className="text-sm text-gray-600">
                            {new Date(plan.reviewDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      <div className="flex space-x-2 mt-4">
                        <Button variant="outline" size="sm" data-testid={`button-edit-plan-${plan.id}`}>
                          <i className="fas fa-edit mr-1"></i>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`button-view-plan-${plan.id}`}>
                          <i className="fas fa-eye mr-1"></i>
                          View Details
                        </Button>
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
