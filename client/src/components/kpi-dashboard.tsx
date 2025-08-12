import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUp, 
  ArrowDown, 
  Minus,
  RefreshCw,
  Download,
  BarChart3,
  Activity,
  Target,
  AlertCircle,
  CheckCircle
} from "lucide-react";

export interface KPIMetric {
  id: string;
  title: string;
  value: string | number;
  target?: string | number;
  unit?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  status?: "good" | "warning" | "critical";
  description?: string;
  category: string;
}

interface KPIDashboardProps {
  role: string;
  metrics?: KPIMetric[];
  title?: string;
  description?: string;
  refreshInterval?: number;
}

export function KPIDashboard({ 
  role, 
  metrics: propMetrics = [], 
  title = "KPI Dashboard",
  description = "Key performance indicators and metrics",
  refreshInterval = 30000 
}: KPIDashboardProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  // Fetch KPI data from API
  const { data: dashboardData, refetch, isLoading, error } = useQuery({
    queryKey: [`/api/dashboard/kpis/${role}`],
    refetchInterval: refreshInterval,
    retry: 2,
  });

  const metrics = dashboardData?.kpis || propMetrics;
  const summary = dashboardData?.summary || { total: 0, good: 0, warning: 0, critical: 0 };

  // Get unique categories from metrics
  const categories = [...new Set(metrics.map((m: KPIMetric) => m.category))];

  // Filter metrics by category
  const filteredMetrics = activeCategory === "all" 
    ? metrics 
    : metrics.filter((m: KPIMetric) => m.category === activeCategory);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "good":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "critical":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "good":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load KPIs</h3>
            <p className="text-gray-600 mb-4">
              There was an error loading the KPI dashboard data.
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total KPIs</p>
                <p className="text-2xl font-bold">{summary.total}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Good</p>
                <p className="text-2xl font-bold text-green-600">{summary.good}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warning</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.warning}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">{summary.critical}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMetrics.map((metric: KPIMetric) => (
                <Card key={metric.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(metric.status)}
                        <Badge 
                          variant="secondary" 
                          className={getStatusColor(metric.status)}
                        >
                          {metric.status}
                        </Badge>
                      </div>
                      {metric.trend && (
                        <div className="flex items-center gap-1 text-sm">
                          {getTrendIcon(metric.trend)}
                          {metric.trendValue && (
                            <span className={
                              metric.trend === "up" ? "text-green-600" : 
                              metric.trend === "down" ? "text-red-600" : 
                              "text-gray-600"
                            }>
                              {metric.trendValue}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                      {metric.title}
                    </h4>
                    
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-bold">
                        {metric.value}
                      </span>
                      {metric.unit && (
                        <span className="text-sm text-muted-foreground">
                          {metric.unit}
                        </span>
                      )}
                    </div>

                    {metric.target && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Target: {metric.target}{metric.unit}</span>
                          <span>{Math.round((Number(metric.value) / Number(metric.target)) * 100)}%</span>
                        </div>
                        <Progress 
                          value={(Number(metric.value) / Number(metric.target)) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}

                    {metric.description && (
                      <p className="text-xs text-muted-foreground">
                        {metric.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredMetrics.length === 0 && (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No KPIs Available</h3>
              <p className="text-gray-600">
                No key performance indicators are available for this category.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}