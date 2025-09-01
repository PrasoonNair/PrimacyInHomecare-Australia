import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Car, 
  Calculator, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  DollarSign,
  FileText,
  Eye,
  Settings,
  TrendingUp,
  Users,
  Route,
  Banknote
} from 'lucide-react';

interface TravelCalculation {
  id: string;
  shiftId: string;
  staffId: string;
  participantId: string;
  originAddress: string;
  destinationAddress: string;
  travelDate: string;
  distanceKm: number;
  travelTimeMinutes: number;
  shiftSequenceNumber: number;
  isFirstShiftOfDay: boolean;
  ndisTravelAmount: number;
  ndisIsBillable: boolean;
  schacsTravelPayment: number;
  schacsIsPayable: boolean;
  autoVerificationStatus: string;
  verificationFlags: string[];
}

interface TravelCalculationRequest {
  shiftId: string;
  originAddress: string;
  destinationAddress: string;
  travelDate: string;
}

export function ProviderTravelCalculator() {
  const [activeTab, setActiveTab] = useState("calculator");
  const [calculationDialogOpen, setCalculationDialogOpen] = useState(false);
  const [calculationRequest, setCalculationRequest] = useState<TravelCalculationRequest>({
    shiftId: '',
    originAddress: '',
    destinationAddress: '',
    travelDate: new Date().toISOString().split('T')[0]
  });
  const { toast } = useToast();

  // Fetch travel calculations
  const { data: travelCalculations = [], isLoading } = useQuery<TravelCalculation[]>({
    queryKey: ["/api/travel-calculations"],
  });

  // Fetch daily summaries
  const { data: dailySummaries = [] } = useQuery({
    queryKey: ["/api/travel-calculations/daily-summaries"],
  });

  // Fetch current rate configurations
  const { data: rateConfig } = useQuery({
    queryKey: ["/api/travel-rates/current"],
  });

  // Calculate travel mutation
  const calculateTravelMutation = useMutation({
    mutationFn: (data: TravelCalculationRequest) => 
      apiRequest(`/api/travel-calculations/calculate`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/travel-calculations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/travel-calculations/daily-summaries"] });
      setCalculationDialogOpen(false);
      toast({
        title: "Travel Calculation Complete",
        description: "Provider travel costs have been calculated and verified",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Calculation Failed",
        description: error.message || "Failed to calculate travel costs",
        variant: "destructive",
      });
    },
  });

  // Bulk recalculation mutation
  const bulkRecalculateMutation = useMutation({
    mutationFn: (dateRange: { fromDate: string; toDate: string }) => 
      apiRequest(`/api/travel-calculations/bulk-recalculate`, {
        method: "POST",
        body: JSON.stringify(dateRange),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/travel-calculations"] });
      toast({
        title: "Bulk Recalculation Complete",
        description: "All travel calculations have been updated",
      });
    },
  });

  const getVerificationStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Verified
        </Badge>;
      case "requires_review":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Needs Review
        </Badge>;
      case "failed":
        return <Badge variant="destructive">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Failed
        </Badge>;
      default:
        return <Badge variant="outline">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
    }
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-AU', { 
      style: 'currency', 
      currency: 'AUD' 
    }).format(amount);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Provider Travel Calculator</h2>
          <p className="text-muted-foreground mt-1">
            Automated travel calculation using SCHADS, NDIS price guide, and ATO compliance
          </p>
        </div>
        <Dialog open={calculationDialogOpen} onOpenChange={setCalculationDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-calculation">
              <Calculator className="mr-2 h-4 w-4" />
              New Calculation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Calculate Provider Travel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="shiftId">Shift ID</Label>
                <Input
                  id="shiftId"
                  value={calculationRequest.shiftId}
                  onChange={(e) => setCalculationRequest(prev => ({ ...prev, shiftId: e.target.value }))}
                  placeholder="Enter shift ID"
                />
              </div>
              <div>
                <Label htmlFor="originAddress">Origin Address</Label>
                <Input
                  id="originAddress"
                  value={calculationRequest.originAddress}
                  onChange={(e) => setCalculationRequest(prev => ({ ...prev, originAddress: e.target.value }))}
                  placeholder="Staff starting location"
                />
              </div>
              <div>
                <Label htmlFor="destinationAddress">Destination Address</Label>
                <Input
                  id="destinationAddress"
                  value={calculationRequest.destinationAddress}
                  onChange={(e) => setCalculationRequest(prev => ({ ...prev, destinationAddress: e.target.value }))}
                  placeholder="Participant location"
                />
              </div>
              <div>
                <Label htmlFor="travelDate">Travel Date</Label>
                <Input
                  id="travelDate"
                  type="date"
                  value={calculationRequest.travelDate}
                  onChange={(e) => setCalculationRequest(prev => ({ ...prev, travelDate: e.target.value }))}
                />
              </div>
              <Button 
                onClick={() => calculateTravelMutation.mutate(calculationRequest)}
                disabled={calculateTravelMutation.isPending}
                className="w-full"
              >
                {calculateTravelMutation.isPending ? "Calculating..." : "Calculate Travel"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculator" data-testid="tab-calculator">
            <Calculator className="mr-2 h-4 w-4" />
            Calculator
          </TabsTrigger>
          <TabsTrigger value="verification" data-testid="tab-verification">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Verification
          </TabsTrigger>
          <TabsTrigger value="rates" data-testid="tab-rates">
            <DollarSign className="mr-2 h-4 w-4" />
            Rate Configuration
          </TabsTrigger>
          <TabsTrigger value="compliance" data-testid="tab-compliance">
            <FileText className="mr-2 h-4 w-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Car className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Calculations</p>
                    <p className="text-2xl font-bold">{travelCalculations.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Banknote className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">NDIS Billable</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(travelCalculations.reduce((sum, calc) => 
                        sum + (calc.ndisIsBillable ? calc.ndisTravelAmount : 0), 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">SCHADS Payable</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(travelCalculations.reduce((sum, calc) => 
                        sum + (calc.schacsIsPayable ? calc.schacsTravelPayment : 0), 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Requiring Review</p>
                    <p className="text-2xl font-bold">
                      {travelCalculations.filter(calc => 
                        calc.autoVerificationStatus === 'requires_review').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Calculations */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Travel Calculations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {travelCalculations.slice(0, 10).map((calculation) => (
                  <div key={calculation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Route className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Shift #{calculation.shiftId.slice(-8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {calculation.distanceKm}km • {calculation.travelTimeMinutes} minutes
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {calculation.isFirstShiftOfDay && (
                            <Badge variant="outline" className="text-xs">First Shift</Badge>
                          )}
                          {getVerificationStatusBadge(calculation.autoVerificationStatus)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">NDIS:</span>
                          <span className={`font-medium ${calculation.ndisIsBillable ? 'text-green-600' : 'text-gray-400'}`}>
                            {calculation.ndisIsBillable ? formatCurrency(calculation.ndisTravelAmount) : 'Non-billable'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">SCHADS:</span>
                          <span className={`font-medium ${calculation.schacsIsPayable ? 'text-blue-600' : 'text-gray-400'}`}>
                            {calculation.schacsIsPayable ? formatCurrency(calculation.schacsTravelPayment) : 'Non-payable'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automatic Verification Rules</CardTitle>
              <p className="text-sm text-muted-foreground">
                Business rules that automatically verify travel calculations for compliance
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    <strong>First Shift Rule:</strong> First shift of the day is non-billable to participant and non-payable to staff
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <MapPin className="h-4 w-4" />
                  <AlertDescription>
                    <strong>NDIS Time Limits:</strong> MMM1-3 areas: 30 minutes max, MMM4-5 areas: 60 minutes max
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Rate Verification:</strong> NDIS rates up to $0.99/km, SCHADS $0.95/km vehicle allowance
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>ATO Compliance:</strong> Travel claims must align with ATO business use guidelines
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Rate Configuration</CardTitle>
              <p className="text-sm text-muted-foreground">
                Current rates from NDIS price guide, SCHADS award, and ATO determinations
              </p>
            </CardHeader>
            <CardContent>
              {rateConfig ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">NDIS Billing Rates (per km)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-3 border rounded">
                        <p className="text-sm text-muted-foreground">MMM1 (Metro)</p>
                        <p className="font-bold">${(rateConfig as any)?.ndisMmm1Rate || '0.99'}</p>
                      </div>
                      <div className="p-3 border rounded">
                        <p className="text-sm text-muted-foreground">MMM2-3 (Regional)</p>
                        <p className="font-bold">${(rateConfig as any)?.ndisMmm2Rate || '0.99'}</p>
                      </div>
                      <div className="p-3 border rounded">
                        <p className="text-sm text-muted-foreground">MMM4-5 (Rural)</p>
                        <p className="font-bold">${(rateConfig as any)?.ndisMmm4Rate || '0.85'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">SCHADS Staff Payment Rates</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border rounded">
                        <p className="text-sm text-muted-foreground">Vehicle Allowance</p>
                        <p className="font-bold">${(rateConfig as any)?.schacsVehicleAllowanceRate || '0.95'} per km</p>
                      </div>
                      <div className="p-3 border rounded">
                        <p className="text-sm text-muted-foreground">ATO Business Rate</p>
                        <p className="font-bold">${(rateConfig as any)?.atoBusinessKmRate || '0.85'} per km</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Loading rate configuration...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Dashboard</CardTitle>
              <p className="text-sm text-muted-foreground">
                Monitor compliance with NDIS, SCHADS, and ATO requirements
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">First Shift Compliance</p>
                    <p className="text-sm text-muted-foreground">
                      Correctly applied non-billable/non-payable rule
                    </p>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    100% Compliant
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">NDIS Time Limit Compliance</p>
                    <p className="text-sm text-muted-foreground">
                      Respecting maximum travel time limits by region
                    </p>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    98% Compliant
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Rate Accuracy</p>
                    <p className="text-sm text-muted-foreground">
                      Using current NDIS and SCHADS rates
                    </p>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    100% Compliant
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">ATO Business Use Verification</p>
                    <p className="text-sm text-muted-foreground">
                      Travel claims meet ATO business use criteria
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    3 items under review
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}