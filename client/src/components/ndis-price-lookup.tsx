import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Calculator, MapPin, Clock, DollarSign } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface NdisSupportCategory {
  id: string;
  categoryNumber: string;
  name: string;
  description: string;
  budgetType: string;
  isFlexible: boolean;
}

interface NdisSupportItem {
  id: string;
  supportCode: string;
  name: string;
  description: string;
  categoryId: string;
  unitType: string;
  supportType: string;
  registrationGroup: string;
  minimumCancellationNotice?: number;
  pricing: NdisPricing[];
}

interface NdisPricing {
  id: string;
  supportItemId: string;
  geographicArea: string;
  priceLimit: string;
  currency: string;
  effectiveDate: string;
}

interface PriceGuideData {
  categories: NdisSupportCategory[];
  items: NdisSupportItem[];
}

interface NdisPriceLookupProps {
  onSelectItem?: (item: NdisSupportItem, pricing: NdisPricing) => void;
  selectedGeographicArea?: string;
}

export function NdisPriceLookup({ onSelectItem, selectedGeographicArea = "metropolitan" }: NdisPriceLookupProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [geographicArea, setGeographicArea] = useState(selectedGeographicArea);
  const [selectedItem, setSelectedItem] = useState<NdisSupportItem | null>(null);

  const { data: priceGuideData, isLoading } = useQuery<PriceGuideData>({
    queryKey: ["/api/ndis/price-guide", geographicArea],
    enabled: true,
  });

  const filteredItems = priceGuideData?.items.filter((item) => {
    const matchesSearch = searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supportCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) || [];

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(parseFloat(amount));
  };

  const formatGeographicArea = (area: string) => {
    return area.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getBudgetTypeColor = (budgetType: string) => {
    switch (budgetType) {
      case "core_supports": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "capacity_building": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "capital_supports": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getPricingForArea = (item: NdisSupportItem) => {
    return item.pricing.find(p => p.geographicArea === geographicArea);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="ndis-price-lookup">
      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search" data-testid="label-search">Search Support Items</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by name, code, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label data-testid="label-category">Support Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory} data-testid="select-category">
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {priceGuideData?.categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.categoryNumber}. {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label data-testid="label-geographic-area">Geographic Area</Label>
          <Select value={geographicArea} onValueChange={setGeographicArea} data-testid="select-geographic-area">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metropolitan">Metropolitan</SelectItem>
              <SelectItem value="regional">Regional</SelectItem>
              <SelectItem value="remote">Remote (+40%)</SelectItem>
              <SelectItem value="very_remote">Very Remote (+50%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold" data-testid="text-results-count">
            {filteredItems.length} Support Items Found
          </h3>
          <Badge variant="outline" data-testid="badge-geographic-area">
            <MapPin className="w-3 h-3 mr-1" />
            {formatGeographicArea(geographicArea)}
          </Badge>
        </div>

        <div className="grid gap-4">
          {filteredItems.map((item) => {
            const pricing = getPricingForArea(item);
            const category = priceGuideData?.categories.find(c => c.id === item.categoryId);
            
            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow" data-testid={`card-support-item-${item.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg" data-testid={`text-item-name-${item.id}`}>
                        {item.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" data-testid={`badge-support-code-${item.id}`}>
                          {item.supportCode}
                        </Badge>
                        <Badge 
                          className={getBudgetTypeColor(category?.budgetType || "")}
                          data-testid={`badge-budget-type-${item.id}`}
                        >
                          {category?.budgetType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                        <span data-testid={`text-unit-type-${item.id}`}>
                          per {item.unitType}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {pricing ? (
                        <div className="space-y-1">
                          <div className="text-2xl font-bold text-primary" data-testid={`text-price-${item.id}`}>
                            {formatCurrency(pricing.priceLimit)}
                          </div>
                          <div className="text-xs text-muted-foreground" data-testid={`text-price-per-unit-${item.id}`}>
                            per {item.unitType}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground" data-testid={`text-no-pricing-${item.id}`}>
                          No pricing for this area
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription data-testid={`text-description-${item.id}`}>
                    {item.description}
                  </CardDescription>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1" data-testid={`text-registration-group-${item.id}`}>
                        <Badge variant="secondary">{item.registrationGroup}</Badge>
                      </span>
                      {item.minimumCancellationNotice && (
                        <span className="flex items-center gap-1" data-testid={`text-cancellation-notice-${item.id}`}>
                          <Clock className="w-3 h-3" />
                          {item.minimumCancellationNotice / 24}d notice
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)} data-testid={`button-view-details-${item.id}`}>
                            <Calculator className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle data-testid="text-modal-title">{item.name}</DialogTitle>
                            <DialogDescription data-testid="text-modal-description">
                              Detailed pricing information for {formatGeographicArea(geographicArea)} areas
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Support Code</Label>
                                <p className="text-sm font-mono" data-testid="text-modal-support-code">{item.supportCode}</p>
                              </div>
                              <div>
                                <Label>Unit Type</Label>
                                <p className="text-sm" data-testid="text-modal-unit-type">{item.unitType}</p>
                              </div>
                              <div>
                                <Label>Support Type</Label>
                                <p className="text-sm" data-testid="text-modal-support-type">{item.supportType}</p>
                              </div>
                              <div>
                                <Label>Registration Group</Label>
                                <p className="text-sm" data-testid="text-modal-registration-group">{item.registrationGroup}</p>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div>
                              <Label>Pricing by Geographic Area</Label>
                              <div className="mt-2 space-y-2">
                                {item.pricing.map((price) => (
                                  <div 
                                    key={price.id} 
                                    className={`flex justify-between p-2 rounded border ${
                                      price.geographicArea === geographicArea ? 'bg-primary/10 border-primary' : ''
                                    }`}
                                    data-testid={`pricing-row-${price.geographicArea}`}
                                  >
                                    <span>{formatGeographicArea(price.geographicArea)}</span>
                                    <span className="font-semibold">{formatCurrency(price.priceLimit)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {onSelectItem && pricing && (
                        <Button 
                          size="sm" 
                          onClick={() => onSelectItem(item, pricing)}
                          data-testid={`button-select-item-${item.id}`}
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Select Item
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8" data-testid="text-no-results">
            <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No support items found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or category filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}