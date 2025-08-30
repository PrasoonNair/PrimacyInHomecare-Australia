import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  Brain, 
  AlertTriangle, 
  Users, 
  DollarSign, 
  Calendar,
  Target,
  Zap,
  Activity,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface PredictiveInsight {
  id: string;
  title: string;
  type: 'demand_forecast' | 'churn_prediction' | 'burnout_detection' | 'budget_optimization' | 'service_gap';
  severity: 'high' | 'medium' | 'low';
  confidence: number;
  impact: string;
  timeline: string;
  recommendations: string[];
  data: any[];
}

export function PredictiveAnalytics() {
  const [selectedInsight, setSelectedInsight] = useState<string>('demand');

  const { data: insights, isLoading } = useQuery({
    queryKey: ['/api/operations/predictive-analytics'],
    queryFn: async () => {
      const response = await fetch('/api/operations/predictive-analytics');
      if (!response.ok) throw new Error('Failed to fetch predictive analytics');
      return response.json();
    }
  });

  // Mock predictive insights for demonstration
  const mockInsights: PredictiveInsight[] = [
    {
      id: 'demand_forecast',
      title: 'Service Demand Forecast',
      type: 'demand_forecast',
      severity: 'medium',
      confidence: 89,
      impact: '23% increase in service requests expected',
      timeline: 'Next 30 days',
      recommendations: [
        'Recruit 3 additional support workers',
        'Increase weekend service capacity by 15%',
        'Implement waitlist management system'
      ],
      data: [
        { week: 'Week 1', current: 145, predicted: 168, capacity: 160 },
        { week: 'Week 2', current: 152, predicted: 175, capacity: 160 },
        { week: 'Week 3', current: 148, predicted: 182, capacity: 160 },
        { week: 'Week 4', current: 156, predicted: 178, capacity: 160 }
      ]
    },
    {
      id: 'churn_prediction',
      title: 'Participant Churn Risk',
      type: 'churn_prediction',
      severity: 'high',
      confidence: 94,
      impact: '8 participants at high risk of leaving',
      timeline: 'Next 60 days',
      recommendations: [
        'Schedule immediate satisfaction surveys',
        'Assign dedicated case manager for high-risk participants',
        'Implement retention intervention program'
      ],
      data: [
        { name: 'Low Risk', value: 87, color: '#10B981' },
        { name: 'Medium Risk', value: 12, color: '#F59E0B' },
        { name: 'High Risk', value: 8, color: '#EF4444' }
      ]
    },
    {
      id: 'burnout_detection',
      title: 'Staff Burnout Detection',
      type: 'burnout_detection',
      severity: 'high',
      confidence: 91,
      impact: '5 staff members showing burnout indicators',
      timeline: 'Immediate attention needed',
      recommendations: [
        'Reduce caseload for affected staff by 20%',
        'Schedule mandatory wellness check-ins',
        'Implement workload redistribution plan'
      ],
      data: [
        { staff: 'Sarah M.', workload: 145, satisfaction: 62, risk: 'High' },
        { staff: 'Mike K.', workload: 138, satisfaction: 58, risk: 'High' },
        { staff: 'Lisa R.', workload: 142, satisfaction: 65, risk: 'Medium' },
        { staff: 'David L.', workload: 135, satisfaction: 68, risk: 'Medium' }
      ]
    },
    {
      id: 'budget_optimization',
      title: 'Budget Optimization Opportunities',
      type: 'budget_optimization',
      severity: 'medium',
      confidence: 87,
      impact: '$24,000 potential annual savings',
      timeline: 'Implementation in 30 days',
      recommendations: [
        'Optimize service scheduling to reduce travel time',
        'Consolidate administrative tasks',
        'Implement bulk purchasing for supplies'
      ],
      data: [
        { category: 'Travel Costs', current: 15600, optimized: 12400, savings: 3200 },
        { category: 'Admin Time', current: 28000, optimized: 21000, savings: 7000 },
        { category: 'Supplies', current: 18000, optimized: 14200, savings: 3800 }
      ]
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'demand_forecast': return <TrendingUp className="h-5 w-5" />;
      case 'churn_prediction': return <Users className="h-5 w-5" />;
      case 'burnout_detection': return <AlertTriangle className="h-5 w-5" />;
      case 'budget_optimization': return <DollarSign className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-100 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="predictive-analytics">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-6 w-6 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Predictive Analytics</h2>
            <p className="text-gray-600">AI-powered insights for proactive decision making</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            <Activity className="h-3 w-3 mr-1" />
            Real-time ML
          </Badge>
        </div>
      </div>

      <Tabs value={selectedInsight} onValueChange={setSelectedInsight}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demand">Demand Forecast</TabsTrigger>
          <TabsTrigger value="churn">Churn Risk</TabsTrigger>
          <TabsTrigger value="burnout">Burnout Detection</TabsTrigger>
          <TabsTrigger value="budget">Budget Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="demand" className="space-y-4">
          {mockInsights.filter(i => i.type === 'demand_forecast').map(insight => (
            <Card key={insight.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getInsightIcon(insight.type)}
                    <CardTitle>{insight.title}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(insight.severity)} variant="outline">
                      {insight.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{insight.confidence}% confidence</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Key Insights</h4>
                      <p className="text-sm text-gray-600 mb-1">{insight.impact}</p>
                      <p className="text-sm text-gray-500">Timeline: {insight.timeline}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recommended Actions</h4>
                      <ul className="space-y-1">
                        {insight.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Target className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Demand vs Capacity Forecast</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={insight.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="current" stroke="#3B82F6" name="Current" />
                        <Line type="monotone" dataKey="predicted" stroke="#EF4444" name="Predicted" />
                        <Line type="monotone" dataKey="capacity" stroke="#10B981" name="Capacity" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="churn" className="space-y-4">
          {mockInsights.filter(i => i.type === 'churn_prediction').map(insight => (
            <Card key={insight.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getInsightIcon(insight.type)}
                    <CardTitle>{insight.title}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(insight.severity)} variant="outline">
                      {insight.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{insight.confidence}% confidence</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Risk Analysis</h4>
                      <p className="text-sm text-gray-600 mb-1">{insight.impact}</p>
                      <p className="text-sm text-gray-500">Timeline: {insight.timeline}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Intervention Plan</h4>
                      <ul className="space-y-1">
                        {insight.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Target className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Participant Risk Distribution</h4>
                    <div className="space-y-3">
                      {insight.data.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-medium">{item.name}</span>
                          </div>
                          <span className="text-sm text-gray-600">{item.value} participants</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="burnout" className="space-y-4">
          {mockInsights.filter(i => i.type === 'burnout_detection').map(insight => (
            <Card key={insight.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getInsightIcon(insight.type)}
                    <CardTitle>{insight.title}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(insight.severity)} variant="outline">
                      {insight.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{insight.confidence}% confidence</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Wellness Alert</h4>
                      <p className="text-sm text-gray-600 mb-1">{insight.impact}</p>
                      <p className="text-sm text-gray-500">Timeline: {insight.timeline}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Wellness Plan</h4>
                      <ul className="space-y-1">
                        {insight.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Target className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Staff Wellness Indicators</h4>
                    <div className="space-y-3">
                      {insight.data.map((staff: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{staff.staff}</span>
                            <Badge 
                              className={
                                staff.risk === 'High' ? 'bg-red-100 text-red-800' :
                                staff.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }
                              variant="outline"
                            >
                              {staff.risk} Risk
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>Workload: {staff.workload}%</div>
                            <div>Satisfaction: {staff.satisfaction}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          {mockInsights.filter(i => i.type === 'budget_optimization').map(insight => (
            <Card key={insight.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getInsightIcon(insight.type)}
                    <CardTitle>{insight.title}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(insight.severity)} variant="outline">
                      {insight.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{insight.confidence}% confidence</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Optimization Potential</h4>
                      <p className="text-sm text-gray-600 mb-1">{insight.impact}</p>
                      <p className="text-sm text-gray-500">Timeline: {insight.timeline}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Implementation Steps</h4>
                      <ul className="space-y-1">
                        {insight.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Target className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Cost Optimization Analysis</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={insight.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="current" fill="#EF4444" name="Current Cost" />
                        <Bar dataKey="optimized" fill="#10B981" name="Optimized Cost" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}