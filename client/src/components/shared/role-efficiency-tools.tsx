import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  Clock, 
  CheckSquare, 
  BarChart3, 
  Zap, 
  Target, 
  Users,
  FileText,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  MessageSquare,
  Settings,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EfficiencyTool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  timeSaving: string;
  priority: 'high' | 'medium' | 'low';
  category: 'automation' | 'communication' | 'planning' | 'reporting';
  roles: string[];
}

interface RoleProfile {
  role: string;
  department: string;
  currentEfficiency: number;
  potentialGains: number;
  keyMetrics: string[];
  recommendedTools: string[];
}

export function RoleEfficiencyTools({ userRole }: { userRole: string }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const efficiencyTools: EfficiencyTool[] = [
    // Automation Tools
    {
      id: 'bulk-scheduling',
      title: 'Bulk Shift Scheduling',
      description: 'Schedule multiple staff shifts and participant services simultaneously',
      icon: <Calendar className="h-5 w-5" />,
      href: '/calendar-shifts?mode=bulk',
      timeSaving: '60% faster scheduling',
      priority: 'high',
      category: 'automation',
      roles: ['Service Delivery Manager', 'Support Coordinator', 'Case Manager']
    },
    {
      id: 'auto-invoicing',
      title: 'Automated Invoicing',
      description: 'Generate and send invoices automatically based on completed services',
      icon: <DollarSign className="h-5 w-5" />,
      href: '/automation?feature=invoicing',
      timeSaving: '80% faster billing',
      priority: 'high',
      category: 'automation',
      roles: ['Finance Officer', 'Finance Manager']
    },
    {
      id: 'goal-tracking',
      title: 'Automated Goal Tracking',
      description: 'Real-time progress tracking with automated milestone updates',
      icon: <Target className="h-5 w-5" />,
      href: '/automation?feature=goals',
      timeSaving: '50% faster reviews',
      priority: 'high',
      category: 'automation',
      roles: ['Case Manager', 'Support Coordinator']
    },
    {
      id: 'compliance-alerts',
      title: 'Compliance Monitoring',
      description: 'Automated alerts for certification renewals and compliance deadlines',
      icon: <CheckSquare className="h-5 w-5" />,
      href: '/compliance-quality?mode=automated',
      timeSaving: '90% error reduction',
      priority: 'high',
      category: 'automation',
      roles: ['Quality Manager', 'HR Manager', 'All Staff']
    },

    // Communication Tools
    {
      id: 'bulk-messaging',
      title: 'Bulk Communication',
      description: 'Send updates to multiple participants or staff simultaneously',
      icon: <MessageSquare className="h-5 w-5" />,
      href: '/participant-directory?action=bulk-email',
      timeSaving: '75% faster communication',
      priority: 'high',
      category: 'communication',
      roles: ['Case Manager', 'Support Coordinator', 'HR Manager']
    },
    {
      id: 'mobile-notes',
      title: 'Mobile Progress Notes',
      description: 'Complete progress documentation on mobile during service delivery',
      icon: <FileText className="h-5 w-5" />,
      href: '/progress-notes?mode=mobile',
      timeSaving: '40% time reduction',
      priority: 'medium',
      category: 'communication',
      roles: ['Support Worker', 'Case Manager']
    },
    {
      id: 'video-consultations',
      title: 'Video Consultations',
      description: 'Conduct remote participant meetings and team consultations',
      icon: <Phone className="h-5 w-5" />,
      href: '/participants?mode=video-consult',
      timeSaving: '30% travel reduction',
      priority: 'medium',
      category: 'communication',
      roles: ['Case Manager', 'Support Coordinator', 'Support Worker']
    },

    // Planning Tools
    {
      id: 'predictive-scheduling',
      title: 'AI Scheduling Assistant',
      description: 'Optimize staff allocation based on participant needs and availability',
      icon: <Zap className="h-5 w-5" />,
      href: '/service-delivery?mode=ai-scheduling',
      timeSaving: '45% better utilization',
      priority: 'high',
      category: 'planning',
      roles: ['Service Delivery Manager', 'Support Coordinator']
    },
    {
      id: 'budget-forecasting',
      title: 'Budget Forecasting',
      description: 'Predict NDIS budget utilization and identify optimization opportunities',
      icon: <TrendingUp className="h-5 w-5" />,
      href: '/financials?mode=forecasting',
      timeSaving: '35% budget optimization',
      priority: 'medium',
      category: 'planning',
      roles: ['Finance Manager', 'Case Manager', 'Support Coordinator']
    },
    {
      id: 'capacity-planning',
      title: 'Staff Capacity Planning',
      description: 'Optimize staff workloads and identify capacity gaps',
      icon: <Users className="h-5 w-5" />,
      href: '/staff-directory?mode=capacity',
      timeSaving: '25% efficiency gain',
      priority: 'medium',
      category: 'planning',
      roles: ['HR Manager', 'Service Delivery Manager']
    },

    // Reporting Tools
    {
      id: 'real-time-dashboards',
      title: 'Real-time KPI Dashboards',
      description: 'Monitor key performance indicators with live data updates',
      icon: <BarChart3 className="h-5 w-5" />,
      href: '/dashboard?mode=real-time',
      timeSaving: '60% faster insights',
      priority: 'high',
      category: 'reporting',
      roles: ['All Managers', 'CEO', 'General Manager']
    },
    {
      id: 'automated-reports',
      title: 'Automated Reporting',
      description: 'Generate and distribute regular reports automatically',
      icon: <FileText className="h-5 w-5" />,
      href: '/reports?mode=automated',
      timeSaving: '70% time savings',
      priority: 'medium',
      category: 'reporting',
      roles: ['Quality Manager', 'Finance Manager', 'All Managers']
    }
  ];

  const roleProfiles: RoleProfile[] = [
    {
      role: 'Support Worker',
      department: 'Service Delivery',
      currentEfficiency: 82,
      potentialGains: 15,
      keyMetrics: ['Service completion rate', 'Documentation time', 'Travel efficiency'],
      recommendedTools: ['mobile-notes', 'video-consultations', 'goal-tracking']
    },
    {
      role: 'Case Manager',
      department: 'Service Delivery',
      currentEfficiency: 88,
      potentialGains: 12,
      keyMetrics: ['Plan review time', 'Goal achievement', 'Participant satisfaction'],
      recommendedTools: ['goal-tracking', 'bulk-messaging', 'budget-forecasting']
    },
    {
      role: 'Support Coordinator',
      department: 'Service Delivery',
      currentEfficiency: 85,
      potentialGains: 18,
      keyMetrics: ['Coordination efficiency', 'Provider response time', 'Budget utilization'],
      recommendedTools: ['predictive-scheduling', 'bulk-scheduling', 'automated-reports']
    },
    {
      role: 'Finance Officer',
      department: 'Finance',
      currentEfficiency: 93,
      potentialGains: 8,
      keyMetrics: ['Invoice processing time', 'Payment accuracy', 'Reconciliation speed'],
      recommendedTools: ['auto-invoicing', 'automated-reports', 'budget-forecasting']
    }
  ];

  const getFilteredTools = () => {
    let filtered = efficiencyTools;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }
    
    // Prioritize tools relevant to user's role
    if (userRole && userRole !== 'all') {
      filtered = filtered.sort((a, b) => {
        const aRelevant = a.roles.some(role => role.toLowerCase().includes(userRole.toLowerCase()));
        const bRelevant = b.roles.some(role => role.toLowerCase().includes(userRole.toLowerCase()));
        
        if (aRelevant && !bRelevant) return -1;
        if (!aRelevant && bRelevant) return 1;
        
        // Then sort by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    }
    
    return filtered;
  };

  const getUserRoleProfile = (): RoleProfile | undefined => {
    return roleProfiles.find(profile => 
      profile.role.toLowerCase().includes(userRole?.toLowerCase() || '')
    );
  };

  const filteredTools = getFilteredTools();
  const roleProfile = getUserRoleProfile();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'automation': return <Zap className="h-4 w-4" />;
      case 'communication': return <MessageSquare className="h-4 w-4" />;
      case 'planning': return <Calendar className="h-4 w-4" />;
      case 'reporting': return <BarChart3 className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6" data-testid="role-efficiency-tools">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Efficiency Tools</h2>
          <p className="text-gray-600">
            Optimize your workflow with role-specific efficiency tools
          </p>
        </div>
      </div>

      {/* Role Profile Summary */}
      {roleProfile && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{roleProfile.role}</h3>
                <p className="text-sm text-gray-600">{roleProfile.department}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {roleProfile.currentEfficiency}%
                </div>
                <p className="text-xs text-gray-500">Current Efficiency</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Key Metrics</h4>
                <div className="space-y-1">
                  {roleProfile.keyMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Target className="h-3 w-3 text-blue-500" />
                      <span className="text-xs text-gray-600">{metric}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Potential Gains</h4>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-lg font-semibold text-green-600">
                    +{roleProfile.potentialGains}%
                  </span>
                  <span className="text-xs text-gray-500">efficiency improvement</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recommended Tools</h4>
                <div className="flex flex-wrap gap-1">
                  {roleProfile.recommendedTools.slice(0, 3).map((toolId, index) => {
                    const tool = efficiencyTools.find(t => t.id === toolId);
                    return tool ? (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tool.title}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Tools</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => {
              const isRecommended = roleProfile?.recommendedTools.includes(tool.id);
              
              return (
                <Card 
                  key={tool.id} 
                  className={`hover:shadow-md transition-shadow cursor-pointer ${
                    isRecommended ? 'ring-2 ring-blue-200 bg-blue-50' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          isRecommended ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {tool.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base">{tool.title}</CardTitle>
                          {isRecommended && (
                            <Badge className="mt-1 bg-blue-100 text-blue-800 text-xs">
                              Recommended
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-1">
                        <Badge className={getPriorityColor(tool.priority)} variant="outline">
                          {tool.priority}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          {getCategoryIcon(tool.category)}
                          <span className="text-xs text-gray-500 capitalize">{tool.category}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600">
                          {tool.timeSaving}
                        </span>
                        <Clock className="h-4 w-4 text-green-500" />
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Relevant for:</p>
                        <div className="flex flex-wrap gap-1">
                          {tool.roles.slice(0, 2).map((role, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                          {tool.roles.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{tool.roles.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Link href={tool.href}>
                        <Button className="w-full" size="sm">
                          Use Tool
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}