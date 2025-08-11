import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Upload, RefreshCw, Calculator, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { NdisPriceLookup } from "@/components/ndis-price-lookup";

interface NdisSupportCategory {
  id: string;
  categoryNumber: string;
  name: string;
  description: string;
  budgetType: string;
  isFlexible: boolean;
}

interface PriceGuideStats {
  categories: NdisSupportCategory[];
  items: any[];
}

export default function PriceGuide() {
  const [selectedTab, setSelectedTab] = useState("lookup");

  const { data: stats, isLoading: statsLoading } = useQuery<PriceGuideStats>({
    queryKey: ["/api/ndis/price-guide"],
  });

  const { data: categories } = useQuery<NdisSupportCategory[]>({
    queryKey: ["/api/ndis/support-categories"],
  });

  const getBudgetTypeColor = (budgetType: string) => {
    switch (budgetType) {
      case "core_supports": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "capacity_building": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "capital_supports": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatBudgetType = (budgetType: string) => {
    return budgetType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="container mx-auto py-6 space-y-6" data-testid="page-price-guide">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            NDIS Price Guide
          </h1>
          <p className="text-muted-foreground" data-testid="text-page-description">
            Official 2024-25 NDIS support item pricing and lookup tool
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-refresh">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export Guide
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="card-total-categories">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Categories</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-categories">
              {statsLoading ? "..." : stats?.categories.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Official NDIS categories
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-items">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Items</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-items">
              {statsLoading ? "..." : stats?.items.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Available line items
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-core-supports">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Core Supports</CardTitle>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Core
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-core-supports-count">
              {statsLoading ? "..." : stats?.categories.filter(c => c.budgetType === "core_supports").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Daily living & transport
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-capacity-building">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity Building</CardTitle>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Capacity
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-capacity-building-count">
              {statsLoading ? "..." : stats?.categories.filter(c => c.budgetType === "capacity_building").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Skills & therapy
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4" data-testid="tabs-price-guide">
        <TabsList>
          <TabsTrigger value="lookup" data-testid="tab-lookup">Price Lookup</TabsTrigger>
          <TabsTrigger value="categories" data-testid="tab-categories">Categories</TabsTrigger>
          <TabsTrigger value="management" data-testid="tab-management">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="lookup" className="space-y-4" data-testid="tab-content-lookup">
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-lookup-title">Support Item Price Lookup</CardTitle>
              <CardDescription data-testid="text-lookup-description">
                Search and lookup current NDIS pricing for support items across all geographic areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NdisPriceLookup />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4" data-testid="tab-content-categories">
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-categories-title">NDIS Support Categories</CardTitle>
              <CardDescription data-testid="text-categories-description">
                Overview of all 15 official NDIS support categories for 2024-25
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories?.map((category) => (
                  <div 
                    key={category.id} 
                    className="border rounded-lg p-4 space-y-2"
                    data-testid={`category-card-${category.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg" data-testid={`category-name-${category.id}`}>
                          {category.categoryNumber}. {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground" data-testid={`category-description-${category.id}`}>
                          {category.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={getBudgetTypeColor(category.budgetType)}
                          data-testid={`category-budget-type-${category.id}`}
                        >
                          {formatBudgetType(category.budgetType)}
                        </Badge>
                        {category.isFlexible && (
                          <Badge variant="outline" data-testid={`category-flexible-${category.id}`}>
                            Flexible
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-4" data-testid="tab-content-management">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card data-testid="card-data-management">
              <CardHeader>
                <CardTitle data-testid="text-data-management-title">Data Management</CardTitle>
                <CardDescription data-testid="text-data-management-description">
                  Import and export NDIS pricing data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full" data-testid="button-import-data">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Updated Pricing
                </Button>
                <Button variant="outline" className="w-full" data-testid="button-export-data">
                  <Download className="w-4 h-4 mr-2" />
                  Export Current Data
                </Button>
                <Separator />
                <div className="text-sm text-muted-foreground">
                  <p>Last updated: July 1, 2024</p>
                  <p>Next review: July 1, 2025</p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-system-info">
              <CardHeader>
                <CardTitle data-testid="text-system-info-title">System Information</CardTitle>
                <CardDescription data-testid="text-system-info-description">
                  Current price guide configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>NDIS Year:</span>
                    <span className="font-medium">2024-25</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Geographic Areas:</span>
                    <span className="font-medium">4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Currency:</span>
                    <span className="font-medium">AUD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remote Loading:</span>
                    <span className="font-medium">+40%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Very Remote Loading:</span>
                    <span className="font-medium">+50%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}