import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  Clock, 
  Users, 
  DollarSign, 
  Target, 
  Zap,
  BarChart3,
  Activity,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EfficiencyMetric {
  id: string;
  title: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  priority: 'high' | 'medium' | 'low';
  description: string;
}

interface RoleEfficiency {
  role: string;
  department: string;
  metrics: EfficiencyMetric[];
  overallScore: number;
  recommendations: string[];
}

export function OperationsEfficiencyDashboard() {
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const { data: efficiencyData, isLoading } = useQuery({
    queryKey: ['/api/operations/efficiency', selectedRole],
    queryFn: async () => {
      const response = await fetch(`/api/operations/efficiency?role=${selectedRole}`);
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-100 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const mockEfficiencyData: RoleEfficiency[] = [
    {
      role: 'Support Worker',
      department: 'Service Delivery',
      overallScore: 87,
      metrics: [
        {
          id: 'service-completion',
          title: 'Service Completion Rate',
          value: 94,
          target: 95,
          unit: '%',
          trend: 'up',
          change: 2.1,
          priority: 'high',
          description: 'Percentage of scheduled services completed successfully'
        },
        {
          id: 'response-time',
          title: 'Avg Response Time',
          value: 8,
          target: 10,
          unit: 'min',
          trend: 'down',
          change: -1.5,
          priority: 'high',
          description: 'Average time to respond to participant requests'
        },
        {
          id: 'documentation',
          title: 'Progress Notes Completion',
          value: 89,
          target: 100,
          unit: '%',
          trend: 'up',
          change: 5.2,
          priority: 'medium',
          description: 'Timely completion of progress documentation'
        },
        {
          id: 'utilization',
          title: 'Time Utilization',
          value: 82,
          target: 85,
          unit: '%',
          trend: 'stable',
          change: 0.3,
          priority: 'medium',
          description: 'Productive time vs. total scheduled time'
        }
      ],
      recommendations: [
        'Focus on completing progress notes within 24 hours of service delivery',
        'Use mobile app for real-time documentation during visits',
        'Schedule buffer time between services for better time management'
      ]
    },
    {
      role: 'Case Manager',
      department: 'Service Delivery',
      overallScore: 91,
      metrics: [
        {
          id: 'plan-reviews',
          title: 'Plan Review Efficiency',
          value: 12,
          target: 15,
          unit: 'days',
          trend: 'down',
          change: -2.3,
          priority: 'high',
          description: 'Average time to complete NDIS plan reviews'
        },
        {
          id: 'participant-satisfaction',
          title: 'Participant Satisfaction',
          value: 4.6,
          target: 4.5,
          unit: '/5',
          trend: 'up',
          change: 0.2,
          priority: 'high',
          description: 'Average participant satisfaction rating'
        },
        {
          id: 'goal-achievement',
          title: 'Goal Achievement Rate',
          value: 78,
          target: 80,
          unit: '%',
          trend: 'up',
          change: 3.1,
          priority: 'high',
          description: 'Percentage of participant goals achieved on time'
        },
        {
          id: 'caseload-efficiency',
          title: 'Caseload Management',
          value: 24,
          target: 25,
          unit: 'participants',
          trend: 'stable',
          change: 0.5,
          priority: 'medium',
          description: 'Optimal caseload size for quality service delivery'
        }
      ],
      recommendations: [
        'Implement automated goal tracking to improve achievement rates',
        'Use bulk communication tools for routine participant updates',
        'Schedule quarterly review check-ins proactively'
      ]
    },
    {
      role: 'Support Coordinator',
      department: 'Service Delivery',
      overallScore: 85,
      metrics: [
        {
          id: 'coordination-efficiency',
          title: 'Service Coordination',
          value: 88,
          target: 90,
          unit: '%',
          trend: 'up',
          change: 1.8,
          priority: 'high',
          description: 'Successful coordination of multi-service plans'
        },
        {
          id: 'provider-response',
          title: 'Provider Response Time',
          value: 48,
          target: 24,
          unit: 'hours',
          trend: 'down',
          change: -6.2,
          priority: 'medium',
          description: 'Time for service providers to respond to coordination requests'
        },
        {
          id: 'budget-optimization',
          title: 'Budget Utilization',
          value: 92,
          target: 95,
          unit: '%',
          trend: 'up',
          change: 2.7,
          priority: 'high',
          description: 'Optimal use of participant NDIS funding'
        }
      ],
      recommendations: [
        'Establish preferred provider networks for faster response times',
        'Use automated budget tracking and alert systems',
        'Implement provider performance scorecards'
      ]
    },
    {
      role: 'Finance Officer',
      department: 'Finance',
      overallScore: 93,
      metrics: [
        {
          id: 'invoice-processing',
          title: 'Invoice Processing Time',
          value: 2.1,
          target: 3.0,
          unit: 'days',
          trend: 'down',
          change: -0.8,
          priority: 'high',
          description: 'Average time to process and approve invoices'
        },
        {
          id: 'payment-accuracy',
          title: 'Payment Accuracy',
          value: 99.2,
          target: 99.0,
          unit: '%',
          trend: 'stable',
          change: 0.1,
          priority: 'high',
          description: 'Accuracy of NDIS payments and billing'
        },
        {
          id: 'reconciliation',
          title: 'Monthly Reconciliation',
          value: 5,
          target: 7,
          unit: 'days',
          trend: 'down',
          change: -1.2,
          priority: 'medium',
          description: 'Time to complete monthly financial reconciliation'
        }
      ],
      recommendations: [
        'Continue leveraging automated invoice processing',
        'Implement real-time payment tracking dashboard',
        'Set up automated reconciliation alerts for discrepancies'
      ]
    }
  ];

  const getMetricIcon = (metric: EfficiencyMetric) => {
    if (metric.value >= metric.target) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (metric.value >= metric.target * 0.8) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    } else if (trend === 'down') {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    }
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getProgressColor = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const filteredData = selectedRole === 'all' ? mockEfficiencyData : 
    mockEfficiencyData.filter(role => role.role.toLowerCase().includes(selectedRole.toLowerCase()));

  return (
    <div className="space-y-6" data-testid="operations-efficiency-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Operations Efficiency Dashboard</h2>
          <p className="text-gray-600">Real-time operational performance across all roles</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Live Data
          </Badge>
        </div>
      </div>

      <Tabs value={selectedRole} onValueChange={setSelectedRole}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Roles</TabsTrigger>
          <TabsTrigger value="support">Support Workers</TabsTrigger>
          <TabsTrigger value="case">Case Managers</TabsTrigger>
          <TabsTrigger value="coordinator">Coordinators</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedRole} className="space-y-6">
          {/* Overall Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Efficiency</p>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round(filteredData.reduce((sum, role) => sum + role.overallScore, 0) / filteredData.length)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Roles Monitored</p>
                    <p className="text-2xl font-bold text-blue-600">{filteredData.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Metrics Tracked</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {filteredData.reduce((sum, role) => sum + role.metrics.length, 0)}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Optimization Score</p>
                    <p className="text-2xl font-bold text-orange-600">A+</p>
                  </div>
                  <Zap className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Role-Specific Efficiency Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredData.map((roleData) => (
              <Card key={roleData.role} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{roleData.role}</CardTitle>
                      <p className="text-sm text-gray-600">{roleData.department}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {roleData.overallScore}%
                      </div>
                      <p className="text-xs text-gray-500">Overall Score</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="space-y-3">
                    {roleData.metrics.map((metric) => (
                      <div key={metric.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getMetricIcon(metric)}
                            <span className="text-sm font-medium">{metric.title}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getTrendIcon(metric.trend, metric.change)}
                            <span className={`text-sm font-medium ${
                              metric.trend === 'up' ? 'text-green-600' : 
                              metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {metric.value}{metric.unit}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={(metric.value / metric.target) * 100} 
                            className="flex-1 h-2"
                          />
                          <span className="text-xs text-gray-500 min-w-fit">
                            Target: {metric.target}{metric.unit}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-600">{metric.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recommendations */}
                  <div className="pt-3 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Efficiency Recommendations
                    </h4>
                    <div className="space-y-1">
                      {roleData.recommendations.slice(0, 2).map((rec, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <Target className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-600">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* System-Wide Efficiency Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>System-Wide Efficiency Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-green-800">Top Performers</h4>
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Finance team exceeding all targets</li>
                    <li>• Case managers improving goal achievement</li>
                    <li>• Support workers reducing response times</li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-800">Improvement Areas</h4>
                  </div>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Provider response time coordination</li>
                    <li>• Progress note completion rates</li>
                    <li>• Time utilization optimization</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-blue-800">Automation Opportunities</h4>
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Automated goal tracking systems</li>
                    <li>• Real-time documentation tools</li>
                    <li>• Predictive scheduling optimization</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}