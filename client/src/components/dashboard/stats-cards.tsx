import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardStats {
  activeParticipants: number;
  servicesThisWeek: number;
  budgetUsedPercentage: number;
  plansExpiringSoon: number;
}

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const statsData = [
    {
      title: "Active Participants",
      value: stats?.activeParticipants || 0,
      icon: "fas fa-users",
      color: "bg-blue-100 text-ndis-primary",
      testId: "stat-active-participants"
    },
    {
      title: "Services This Week", 
      value: stats?.servicesThisWeek || 0,
      icon: "fas fa-calendar-check",
      color: "bg-green-100 text-ndis-secondary",
      testId: "stat-services-week"
    },
    {
      title: "Monthly Budget Used",
      value: `${stats?.budgetUsedPercentage || 0}%`,
      icon: "fas fa-dollar-sign", 
      color: "bg-orange-100 text-ndis-accent",
      testId: "stat-budget-used"
    },
    {
      title: "Plans Expiring Soon",
      value: stats?.plansExpiringSoon || 0,
      icon: "fas fa-exclamation-triangle",
      color: "bg-red-100 text-ndis-error",
      testId: "stat-plans-expiring"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gray-200 w-12 h-12"></div>
                <div className="ml-4">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat) => (
        <Card key={stat.title} className="bg-white rounded-lg shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.color}`}>
                <i className={`${stat.icon} text-xl`}></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p 
                  className="text-2xl font-bold text-gray-900" 
                  data-testid={stat.testId}
                >
                  {stat.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
