import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  UserMinus, 
  FileText, 
  Calendar, 
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Building,
  Shield,
  Key,
  Award,
  MessageSquare,
  TrendingDown,
  Download,
  Send
} from 'lucide-react';

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  employmentType: string;
  department: string;
  position: string;
  startDate: string;
  status: string;
}

interface OffboardingCase {
  id: string;
  staffId: string;
  staffName: string;
  department: string;
  position: string;
  resignationDate: string;
  lastWorkingDay: string;
  resignationReason: string;
  resignationType: string; // voluntary, involuntary, retirement, redundancy
  noticePeriod: number;
  exitSurveyCompleted: boolean;
  offboardingStatus: string; // initiated, in_progress, completed
  assignedHR: string;
  completionPercentage: number;
  createdAt: string;
}

interface ExitSurveyResponse {
  id: string;
  staffId: string;
  overallSatisfaction: number;
  reasonForLeaving: string;
  workEnvironmentRating: number;
  managementRating: number;
  careerDevelopmentRating: number;
  compensationRating: number;
  workLifeBalanceRating: number;
  wouldRecommendCompany: boolean;
  improvementSuggestions: string;
  additionalComments: string;
  submittedAt: string;
}

interface OffboardingTask {
  id: string;
  category: string;
  task: string;
  assignedTo: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

export function StaffOffboarding() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [showNewOffboardingForm, setShowNewOffboardingForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState<string>('');
  const { toast } = useToast();

  // Fetch staff members
  const { data: staff = [] } = useQuery<StaffMember[]>({
    queryKey: ['/api/staff'],
    queryFn: () => apiRequest('/api/staff')
  });

  // Fetch offboarding cases
  const { data: offboardingCases = [] } = useQuery<OffboardingCase[]>({
    queryKey: ['/api/hr/offboarding-cases'],
    queryFn: () => apiRequest('/api/hr/offboarding-cases')
  });

  // Fetch exit surveys
  const { data: exitSurveys = [] } = useQuery<ExitSurveyResponse[]>({
    queryKey: ['/api/hr/exit-surveys'],
    queryFn: () => apiRequest('/api/hr/exit-surveys')
  });

  // Fetch offboarding tasks
  const { data: offboardingTasks = [] } = useQuery<OffboardingTask[]>({
    queryKey: ['/api/hr/offboarding-tasks', selectedCase],
    queryFn: () => apiRequest(`/api/hr/offboarding-tasks/${selectedCase}`),
    enabled: !!selectedCase
  });

  // Create offboarding case mutation
  const createOffboardingMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest('/api/hr/offboarding-cases', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/offboarding-cases'] });
      setShowNewOffboardingForm(false);
      toast({
        title: "Offboarding Initiated",
        description: "Staff offboarding process has been started successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initiate offboarding process.",
        variant: "destructive"
      });
    }
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: ({ taskId, notes }: { taskId: string; notes?: string }) =>
      apiRequest(`/api/hr/offboarding-tasks/${taskId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ notes })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/offboarding-tasks', selectedCase] });
      queryClient.invalidateQueries({ queryKey: ['/api/hr/offboarding-cases'] });
      toast({
        title: "Task Completed",
        description: "Offboarding task has been marked as completed.",
      });
    }
  });

  // Send exit survey mutation
  const sendExitSurveyMutation = useMutation({
    mutationFn: (staffId: string) =>
      apiRequest(`/api/hr/exit-surveys/${staffId}/send`, {
        method: 'POST'
      }),
    onSuccess: () => {
      toast({
        title: "Exit Survey Sent",
        description: "Exit survey invitation has been sent to the staff member.",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'initiated': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResignationTypeColor = (type: string) => {
    switch (type) {
      case 'voluntary': return 'bg-green-100 text-green-800';
      case 'involuntary': return 'bg-red-100 text-red-800';
      case 'retirement': return 'bg-purple-100 text-purple-800';
      case 'redundancy': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeStaff = staff.filter(s => s.status === 'active');
  const activeOffboardingCases = offboardingCases.filter(c => c.offboardingStatus !== 'completed');
  const completedOffboardingCases = offboardingCases.filter(c => c.offboardingStatus === 'completed');

  return (
    <div className="space-y-6" data-testid="staff-offboarding">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserMinus className="h-5 w-5" />
            <span>Staff Offboarding & Exit Management</span>
            <Badge variant="outline">HR Module</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Comprehensive staff offboarding system with exit surveys, resignation processing, 
              and knowledge transfer workflows to ensure smooth transitions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="offboarding" data-testid="tab-offboarding">Active Cases</TabsTrigger>
          <TabsTrigger value="surveys" data-testid="tab-surveys">Exit Surveys</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{activeOffboardingCases.length}</p>
                    <p className="text-sm text-gray-600">Active Cases</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{completedOffboardingCases.length}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{exitSurveys.length}</p>
                    <p className="text-sm text-gray-600">Exit Surveys</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {exitSurveys.length > 0 ? 
                        Math.round(exitSurveys.reduce((sum, s) => sum + s.overallSatisfaction, 0) / exitSurveys.length * 10) / 10 
                        : 0}
                    </p>
                    <p className="text-sm text-gray-600">Avg Satisfaction</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Offboarding Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeOffboardingCases.slice(0, 5).map(case_ => (
                  <div key={case_.id} className="flex justify-between items-center p-4 border rounded">
                    <div>
                      <h4 className="font-semibold">{case_.staffName}</h4>
                      <p className="text-sm text-gray-600">{case_.department} • {case_.position}</p>
                      <p className="text-sm text-gray-500">Last working day: {new Date(case_.lastWorkingDay).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(case_.offboardingStatus)}>
                        {case_.offboardingStatus.replace('_', ' ')}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">{case_.completionPercentage}% complete</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => setShowNewOffboardingForm(true)}
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  data-testid="button-new-offboarding"
                >
                  <UserMinus className="h-6 w-6" />
                  <span>Initiate Offboarding</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                >
                  <MessageSquare className="h-6 w-6" />
                  <span>Send Exit Survey</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                >
                  <Download className="h-6 w-6" />
                  <span>Generate Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Cases Tab */}
        <TabsContent value="offboarding" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Active Offboarding Cases</h2>
            <Button 
              onClick={() => setShowNewOffboardingForm(true)}
              data-testid="button-new-case"
            >
              <UserMinus className="h-4 w-4 mr-2" />
              New Offboarding
            </Button>
          </div>

          <div className="grid gap-4">
            {activeOffboardingCases.map(case_ => (
              <Card key={case_.id} className="cursor-pointer hover:shadow-md transition-shadow" 
                    onClick={() => setSelectedCase(case_.id)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{case_.staffName}</CardTitle>
                      <p className="text-sm text-gray-600">{case_.department} • {case_.position}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={getStatusColor(case_.offboardingStatus)}>
                        {case_.offboardingStatus.replace('_', ' ')}
                      </Badge>
                      <Badge className={getResignationTypeColor(case_.resignationType)}>
                        {case_.resignationType}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Resignation Date:</span>
                      <p>{new Date(case_.resignationDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Last Working Day:</span>
                      <p>{new Date(case_.lastWorkingDay).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Notice Period:</span>
                      <p>{case_.noticePeriod} weeks</p>
                    </div>
                    <div>
                      <span className="font-medium">Progress:</span>
                      <p>{case_.completionPercentage}% complete</p>
                    </div>
                  </div>
                  
                  {case_.resignationReason && (
                    <div className="mt-4">
                      <span className="font-medium">Reason:</span>
                      <p className="text-sm text-gray-600">{case_.resignationReason}</p>
                    </div>
                  )}

                  <div className="mt-4 flex space-x-2">
                    <Button size="sm" variant="outline">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      View Tasks
                    </Button>
                    {!case_.exitSurveyCompleted && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          sendExitSurveyMutation.mutate(case_.staffId);
                        }}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Send Exit Survey
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Exit Surveys Tab */}
        <TabsContent value="surveys" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Exit Survey Responses</h2>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>

          <div className="grid gap-4">
            {exitSurveys.map(survey => (
              <Card key={survey.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Exit Survey Response</CardTitle>
                      <p className="text-sm text-gray-600">
                        Staff ID: {survey.staffId} • Submitted: {new Date(survey.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">
                      Overall: {survey.overallSatisfaction}/5
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Work Environment:</span>
                        <p>{survey.workEnvironmentRating}/5</p>
                      </div>
                      <div>
                        <span className="font-medium">Management:</span>
                        <p>{survey.managementRating}/5</p>
                      </div>
                      <div>
                        <span className="font-medium">Career Development:</span>
                        <p>{survey.careerDevelopmentRating}/5</p>
                      </div>
                      <div>
                        <span className="font-medium">Compensation:</span>
                        <p>{survey.compensationRating}/5</p>
                      </div>
                      <div>
                        <span className="font-medium">Work-Life Balance:</span>
                        <p>{survey.workLifeBalanceRating}/5</p>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium">Reason for Leaving:</span>
                      <p className="text-sm text-gray-600 mt-1">{survey.reasonForLeaving}</p>
                    </div>

                    {survey.improvementSuggestions && (
                      <div>
                        <span className="font-medium">Improvement Suggestions:</span>
                        <p className="text-sm text-gray-600 mt-1">{survey.improvementSuggestions}</p>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-sm">
                      <span className="font-medium">Would recommend company:</span>
                      <Badge variant={survey.wouldRecommendCompany ? "default" : "destructive"}>
                        {survey.wouldRecommendCompany ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-2xl font-semibold">Exit Analytics & Insights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resignation Reasons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Career Growth', 'Better Compensation', 'Work-Life Balance', 'Management Issues', 'Other'].map(reason => {
                    const count = exitSurveys.filter(s => s.reasonForLeaving.includes(reason)).length;
                    const percentage = exitSurveys.length > 0 ? (count / exitSurveys.length * 100).toFixed(1) : 0;
                    return (
                      <div key={reason} className="flex justify-between items-center">
                        <span className="text-sm">{reason}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{count}</span>
                          <span className="text-xs text-gray-500">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Satisfaction Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'Overall', key: 'overallSatisfaction' },
                    { label: 'Work Environment', key: 'workEnvironmentRating' },
                    { label: 'Management', key: 'managementRating' },
                    { label: 'Career Development', key: 'careerDevelopmentRating' },
                    { label: 'Compensation', key: 'compensationRating' }
                  ].map(item => {
                    const avg = exitSurveys.length > 0 ? 
                      (exitSurveys.reduce((sum, s) => sum + s[item.key as keyof ExitSurveyResponse], 0) / exitSurveys.length).toFixed(1) 
                      : 0;
                    return (
                      <div key={item.key} className="flex justify-between items-center">
                        <span className="text-sm">{item.label}</span>
                        <Badge variant="outline">{avg}/5</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Turnover by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['HR', 'Finance', 'Service Delivery', 'Compliance', 'Intake'].map(dept => {
                    const count = offboardingCases.filter(c => c.department === dept).length;
                    return (
                      <div key={dept} className="flex justify-between items-center">
                        <span className="text-sm">{dept}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Offboarding Form Modal would go here */}
      {showNewOffboardingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Initiate Staff Offboarding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="staff-select">Staff Member</Label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeStaff.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName} - {member.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="resignation-date">Resignation Date</Label>
                  <Input type="date" id="resignation-date" />
                </div>
                <div>
                  <Label htmlFor="last-working-day">Last Working Day</Label>
                  <Input type="date" id="last-working-day" />
                </div>
              </div>

              <div>
                <Label htmlFor="resignation-type">Resignation Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="voluntary">Voluntary</SelectItem>
                    <SelectItem value="involuntary">Involuntary</SelectItem>
                    <SelectItem value="retirement">Retirement</SelectItem>
                    <SelectItem value="redundancy">Redundancy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="resignation-reason">Reason for Leaving</Label>
                <Textarea 
                  id="resignation-reason" 
                  placeholder="Enter reason for resignation"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewOffboardingForm(false)}
                >
                  Cancel
                </Button>
                <Button>
                  Initiate Offboarding
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}