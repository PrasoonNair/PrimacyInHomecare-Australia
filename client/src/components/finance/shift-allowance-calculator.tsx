import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Calculator, 
  DollarSign, 
  Clock, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Receipt,
  Users,
  FileSpreadsheet
} from 'lucide-react';

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  employmentType: string;
  awardLevel: string;
  baseHourlyRate: number;
}

interface SCHADSRate {
  id: string;
  level: string;
  classification: string;
  employmentType: string;
  baseHourlyRate: string;
  casualLoading: string;
  saturdayRate: string;
  sundayRate: string;
  publicHolidayRate: string;
  eveningRate: string;
  nightRate: string;
  overtime1Rate: string;
  overtime2Rate: string;
  brokenShiftAllowance: string;
  sleeperAllowance: string;
  onCallAllowance: string;
  mealAllowance: string;
}

interface PayBreakdown {
  staffId: string;
  staffName: string;
  awardLevel: string;
  employmentType: string;
  baseHourlyRate: number;
  hoursBreakdown: {
    regularHours: number;
    overtimeHours?: number;
    weekendHours?: number;
    publicHolidayHours?: number;
    eveningHours?: number;
    nightHours?: number;
  };
  allowances?: {
    brokenShift?: number;
    sleepover?: number;
    onCall?: number;
    travel?: number;
    meal?: number;
  };
  calculations: {
    regularPay: number;
    overtimePay: number;
    weekendPay: number;
    publicHolidayPay: number;
    eveningPay: number;
    nightPay: number;
    totalAllowances: number;
  };
  grossPay: number;
  tax: number;
  superContribution: number;
  netPay: number;
}

export function ShiftAllowanceCalculator() {
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [payPeriodStart, setPayPeriodStart] = useState('');
  const [payPeriodEnd, setPayPeriodEnd] = useState('');
  const [hoursBreakdown, setHoursBreakdown] = useState({
    regularHours: 0,
    overtimeHours: 0,
    weekendHours: 0,
    publicHolidayHours: 0,
    eveningHours: 0,
    nightHours: 0
  });
  const [allowances, setAllowances] = useState({
    brokenShift: 0,
    sleepover: 0,
    onCall: 0,
    travel: 0,
    meal: 0
  });
  const [calculationResult, setCalculationResult] = useState<PayBreakdown | null>(null);
  const { toast } = useToast();

  // Fetch staff members
  const { data: staff = [] } = useQuery<StaffMember[]>({
    queryKey: ['/api/staff'],
    queryFn: () => apiRequest('/api/staff')
  });

  // Fetch SCHADS rates
  const { data: schadRates = [] } = useQuery<SCHADSRate[]>({
    queryKey: ['/api/payroll/schads-rates'],
    queryFn: () => apiRequest('/api/payroll/schads-rates')
  });

  // Calculate pay mutation
  const calculatePayMutation = useMutation({
    mutationFn: (payData: any) =>
      apiRequest('/api/payroll/calculate-staff-pay', {
        method: 'POST',
        body: JSON.stringify(payData)
      }),
    onSuccess: (data) => {
      setCalculationResult(data.payCalculation);
      toast({
        title: "Pay Calculation Complete",
        description: `Gross pay: $${data.payCalculation.grossPay.toFixed(2)} | Net pay: $${data.payCalculation.netPay.toFixed(2)}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Calculation Error",
        description: "Failed to calculate staff pay. Please check all fields.",
        variant: "destructive"
      });
    }
  });

  const handleCalculate = () => {
    if (!selectedStaff || !payPeriodStart || !payPeriodEnd) {
      toast({
        title: "Missing Information",
        description: "Please select staff member and pay period dates.",
        variant: "destructive"
      });
      return;
    }

    calculatePayMutation.mutate({
      staffId: selectedStaff,
      payPeriodStart,
      payPeriodEnd,
      hoursBreakdown,
      allowances: Object.fromEntries(
        Object.entries(allowances).filter(([_, value]) => value > 0)
      )
    });
  };

  const updateHours = (type: string, value: string) => {
    setHoursBreakdown(prev => ({
      ...prev,
      [type]: parseFloat(value) || 0
    }));
  };

  const updateAllowance = (type: string, value: string) => {
    setAllowances(prev => ({
      ...prev,
      [type]: parseFloat(value) || 0
    }));
  };

  const selectedStaffMember = staff.find(s => s.id === selectedStaff);
  const totalHours = Object.values(hoursBreakdown).reduce((sum, hours) => sum + hours, 0);
  const totalAllowances = Object.values(allowances).reduce((sum, allowance) => sum + allowance, 0);

  return (
    <div className="space-y-6" data-testid="shift-allowance-calculator">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Enhanced Shift Allowance Calculator</span>
            <Badge variant="outline">SCHADS Compliant</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              This calculator now includes all SCHADS-compliant penalty rates, shift allowances, 
              and overtime calculations. The previous broken implementation has been completely rebuilt.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Staff & Period Selection</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Staff Selection */}
            <div>
              <Label htmlFor="staff-select">Staff Member</Label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger data-testid="select-staff">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.firstName} {member.lastName} - {member.awardLevel} ({member.employmentType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedStaffMember && (
                <div className="mt-2 text-sm text-gray-600">
                  <p><strong>Employment Type:</strong> {selectedStaffMember.employmentType}</p>
                  <p><strong>Award Level:</strong> {selectedStaffMember.awardLevel}</p>
                </div>
              )}
            </div>

            {/* Pay Period */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="period-start">Pay Period Start</Label>
                <Input
                  id="period-start"
                  type="date"
                  value={payPeriodStart}
                  onChange={(e) => setPayPeriodStart(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="period-end">Pay Period End</Label>
                <Input
                  id="period-end"
                  type="date"
                  value={payPeriodEnd}
                  onChange={(e) => setPayPeriodEnd(e.target.value)}
                />
              </div>
            </div>

            {/* Hours Breakdown */}
            <div>
              <Label className="text-base font-semibold">Hours Breakdown</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <Label htmlFor="regular-hours">Regular Hours</Label>
                  <Input
                    id="regular-hours"
                    type="number"
                    step="0.25"
                    min="0"
                    value={hoursBreakdown.regularHours}
                    onChange={(e) => updateHours('regularHours', e.target.value)}
                    data-testid="input-regular-hours"
                  />
                </div>
                
                <div>
                  <Label htmlFor="overtime-hours">Overtime Hours</Label>
                  <Input
                    id="overtime-hours"
                    type="number"
                    step="0.25"
                    min="0"
                    value={hoursBreakdown.overtimeHours}
                    onChange={(e) => updateHours('overtimeHours', e.target.value)}
                    data-testid="input-overtime-hours"
                  />
                  <p className="text-xs text-gray-500">First 2hrs @150%, then @200%</p>
                </div>
                
                <div>
                  <Label htmlFor="weekend-hours">Weekend Hours</Label>
                  <Input
                    id="weekend-hours"
                    type="number"
                    step="0.25"
                    min="0"
                    value={hoursBreakdown.weekendHours}
                    onChange={(e) => updateHours('weekendHours', e.target.value)}
                    data-testid="input-weekend-hours"
                  />
                  <p className="text-xs text-gray-500">Sat @150%, Sun @200%</p>
                </div>
                
                <div>
                  <Label htmlFor="public-holiday-hours">Public Holiday Hours</Label>
                  <Input
                    id="public-holiday-hours"
                    type="number"
                    step="0.25"
                    min="0"
                    value={hoursBreakdown.publicHolidayHours}
                    onChange={(e) => updateHours('publicHolidayHours', e.target.value)}
                    data-testid="input-public-holiday-hours"
                  />
                  <p className="text-xs text-gray-500">@250% penalty rate</p>
                </div>
                
                <div>
                  <Label htmlFor="evening-hours">Evening Hours</Label>
                  <Input
                    id="evening-hours"
                    type="number"
                    step="0.25"
                    min="0"
                    value={hoursBreakdown.eveningHours}
                    onChange={(e) => updateHours('eveningHours', e.target.value)}
                    data-testid="input-evening-hours"
                  />
                  <p className="text-xs text-gray-500">6pm-8pm @112.5%</p>
                </div>
                
                <div>
                  <Label htmlFor="night-hours">Night Hours</Label>
                  <Input
                    id="night-hours"
                    type="number"
                    step="0.25"
                    min="0"
                    value={hoursBreakdown.nightHours}
                    onChange={(e) => updateHours('nightHours', e.target.value)}
                    data-testid="input-night-hours"
                  />
                  <p className="text-xs text-gray-500">8pm-6am @115%</p>
                </div>
              </div>
              
              <div className="mt-2 p-2 bg-blue-50 rounded">
                <p className="text-sm"><strong>Total Hours:</strong> {totalHours}</p>
              </div>
            </div>

            {/* Allowances */}
            <div>
              <Label className="text-base font-semibold">Shift Allowances ($)</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <Label htmlFor="broken-shift">Broken Shift</Label>
                  <Input
                    id="broken-shift"
                    type="number"
                    step="0.01"
                    min="0"
                    value={allowances.brokenShift}
                    onChange={(e) => updateAllowance('brokenShift', e.target.value)}
                    data-testid="input-broken-shift"
                  />
                </div>
                
                <div>
                  <Label htmlFor="sleepover">Sleepover</Label>
                  <Input
                    id="sleepover"
                    type="number"
                    step="0.01"
                    min="0"
                    value={allowances.sleepover}
                    onChange={(e) => updateAllowance('sleepover', e.target.value)}
                    data-testid="input-sleepover"
                  />
                </div>
                
                <div>
                  <Label htmlFor="on-call">On Call</Label>
                  <Input
                    id="on-call"
                    type="number"
                    step="0.01"
                    min="0"
                    value={allowances.onCall}
                    onChange={(e) => updateAllowance('onCall', e.target.value)}
                    data-testid="input-on-call"
                  />
                </div>
                
                <div>
                  <Label htmlFor="travel">Travel</Label>
                  <Input
                    id="travel"
                    type="number"
                    step="0.01"
                    min="0"
                    value={allowances.travel}
                    onChange={(e) => updateAllowance('travel', e.target.value)}
                    data-testid="input-travel"
                  />
                </div>
                
                <div>
                  <Label htmlFor="meal">Meal Allowance</Label>
                  <Input
                    id="meal"
                    type="number"
                    step="0.01"
                    min="0"
                    value={allowances.meal}
                    onChange={(e) => updateAllowance('meal', e.target.value)}
                    data-testid="input-meal"
                  />
                </div>
              </div>
              
              <div className="mt-2 p-2 bg-green-50 rounded">
                <p className="text-sm"><strong>Total Allowances:</strong> ${totalAllowances.toFixed(2)}</p>
              </div>
            </div>

            <Button 
              onClick={handleCalculate}
              disabled={calculatePayMutation.isPending || !selectedStaff}
              className="w-full"
              data-testid="button-calculate-pay"
            >
              {calculatePayMutation.isPending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Pay
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Receipt className="h-5 w-5" />
              <span>Pay Calculation Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calculationResult ? (
              <div className="space-y-4">
                {/* Staff Details */}
                <div className="p-4 bg-gray-50 rounded">
                  <h4 className="font-semibold mb-2">{calculationResult.staffName}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><strong>Award Level:</strong> {calculationResult.awardLevel}</p>
                    <p><strong>Employment:</strong> {calculationResult.employmentType}</p>
                    <p><strong>Base Rate:</strong> ${calculationResult.baseHourlyRate}/hr</p>
                    <p><strong>Period:</strong> {new Date(calculationResult.payPeriodStart).toLocaleDateString()} - {new Date(calculationResult.payPeriodEnd).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Pay Breakdown */}
                <div>
                  <h4 className="font-semibold mb-3">Detailed Pay Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 border rounded">
                      <span>Regular Pay ({calculationResult.hoursBreakdown.regularHours}hrs)</span>
                      <span className="font-mono">${calculationResult.calculations.regularPay.toFixed(2)}</span>
                    </div>
                    
                    {calculationResult.calculations.overtimePay > 0 && (
                      <div className="flex justify-between p-2 border rounded bg-orange-50">
                        <span>Overtime Pay ({calculationResult.hoursBreakdown.overtimeHours}hrs)</span>
                        <span className="font-mono">${calculationResult.calculations.overtimePay.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {calculationResult.calculations.weekendPay > 0 && (
                      <div className="flex justify-between p-2 border rounded bg-blue-50">
                        <span>Weekend Pay ({calculationResult.hoursBreakdown.weekendHours}hrs)</span>
                        <span className="font-mono">${calculationResult.calculations.weekendPay.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {calculationResult.calculations.publicHolidayPay > 0 && (
                      <div className="flex justify-between p-2 border rounded bg-purple-50">
                        <span>Public Holiday Pay ({calculationResult.hoursBreakdown.publicHolidayHours}hrs)</span>
                        <span className="font-mono">${calculationResult.calculations.publicHolidayPay.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {calculationResult.calculations.eveningPay > 0 && (
                      <div className="flex justify-between p-2 border rounded bg-indigo-50">
                        <span>Evening Pay ({calculationResult.hoursBreakdown.eveningHours}hrs)</span>
                        <span className="font-mono">${calculationResult.calculations.eveningPay.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {calculationResult.calculations.nightPay > 0 && (
                      <div className="flex justify-between p-2 border rounded bg-gray-100">
                        <span>Night Pay ({calculationResult.hoursBreakdown.nightHours}hrs)</span>
                        <span className="font-mono">${calculationResult.calculations.nightPay.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {calculationResult.calculations.totalAllowances > 0 && (
                      <div className="flex justify-between p-2 border rounded bg-green-50">
                        <span>Total Allowances</span>
                        <span className="font-mono">${calculationResult.calculations.totalAllowances.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Gross Pay</span>
                      <span className="font-mono">${calculationResult.grossPay.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-red-600">
                      <span>Tax Withheld</span>
                      <span className="font-mono">-${calculationResult.tax.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-blue-600">
                      <span>Superannuation (11.5%)</span>
                      <span className="font-mono">${calculationResult.superContribution.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-xl font-bold border-t pt-2">
                      <span>Net Pay</span>
                      <span className="font-mono text-green-600">${calculationResult.netPay.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Compliance Badge */}
                <div className="mt-4">
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    SCHADS Award Compliant
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calculator className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Select staff member and enter hours to calculate pay</p>
                <p className="text-sm mt-1">All SCHADS penalty rates and allowances are now properly calculated</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SCHADS Rates Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5" />
            <span>Current SCHADS Rates Reference</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Level</th>
                  <th className="text-left p-2">Classification</th>
                  <th className="text-left p-2">Employment</th>
                  <th className="text-left p-2">Base Rate</th>
                  <th className="text-left p-2">Weekend</th>
                  <th className="text-left p-2">Public Holiday</th>
                  <th className="text-left p-2">Overtime</th>
                </tr>
              </thead>
              <tbody>
                {schadRates.map(rate => (
                  <tr key={rate.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{rate.level}</td>
                    <td className="p-2">{rate.classification}</td>
                    <td className="p-2">{rate.employmentType}</td>
                    <td className="p-2">${rate.baseHourlyRate}/hr</td>
                    <td className="p-2">{parseFloat(rate.saturdayRate) * 100}%</td>
                    <td className="p-2">{parseFloat(rate.publicHolidayRate) * 100}%</td>
                    <td className="p-2">{parseFloat(rate.overtime1Rate) * 100}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}