import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Lightbulb, 
  TrendingUp, 
  Clock, 
  Users, 
  Target,
  CheckCircle,
  ArrowRight,
  X,
  Sparkles,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface SmartSuggestion {
  id: string;
  type: 'efficiency' | 'automation' | 'workflow' | 'compliance' | 'cost_saving';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  timeToImplement: string;
  potentialSavings: string;
  confidence: number;
  category: string;
  actionable: boolean;
  steps: string[];
  relatedEntities: string[];
}

export function SmartSuggestions({ contextType = 'dashboard' }: { contextType?: 'dashboard' | 'participant' | 'staff' | 'workflow' }) {
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['/api/suggestions/smart', contextType],
    queryFn: async () => {
      const response = await fetch(`/api/suggestions/smart?context=${contextType}`);
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      return response.json();
    }
  });

  // Mock intelligent suggestions for demonstration
  const mockSuggestions: SmartSuggestion[] = [
    {
      id: 'suggest-1',
      type: 'automation',
      title: 'Automate Weekly Progress Reports',
      description: 'Based on your current workflow, automating progress report generation could save 3.5 hours per week',
      impact: 'high',
      effort: 'low',
      timeToImplement: '2 hours',
      potentialSavings: '3.5 hours/week',
      confidence: 92,
      category: 'Documentation',
      actionable: true,
      steps: [
        'Set up automated data collection from service notes',
        'Create progress report template',
        'Configure weekly email delivery',
        'Test automation with pilot group'
      ],
      relatedEntities: ['Sarah Thompson', 'Mike Johnson', 'Progress Reports']
    },
    {
      id: 'suggest-2',
      type: 'efficiency',
      title: 'Optimize Service Scheduling',
      description: 'AI analysis shows you can reduce travel time by 25% with smarter route planning',
      impact: 'high',
      effort: 'medium',
      timeToImplement: '1 day',
      potentialSavings: '$2,400/month',
      confidence: 87,
      category: 'Service Delivery',
      actionable: true,
      steps: [
        'Enable location-based service clustering',
        'Implement intelligent route optimization',
        'Set up automatic schedule suggestions',
        'Train staff on new scheduling features'
      ],
      relatedEntities: ['Service Routes', 'Support Workers', 'Travel Costs']
    },
    {
      id: 'suggest-3',
      type: 'workflow',
      title: 'Streamline NDIS Plan Reviews',
      description: 'Create automated reminder system for upcoming plan reviews to prevent delays',
      impact: 'medium',
      effort: 'low',
      timeToImplement: '1 hour',
      potentialSavings: '2 hours/week',
      confidence: 95,
      category: 'Compliance',
      actionable: true,
      steps: [
        'Set up automated calendar reminders',
        'Create plan review checklist template',
        'Configure email notifications for participants',
        'Implement review status tracking'
      ],
      relatedEntities: ['NDIS Plans', 'Case Managers', 'Review Calendar']
    },
    {
      id: 'suggest-4',
      type: 'cost_saving',
      title: 'Bulk Purchase Coordination',
      description: 'Coordinate equipment purchases across participants to achieve volume discounts',
      impact: 'medium',
      effort: 'medium',
      timeToImplement: '3 hours',
      potentialSavings: '$1,800/quarter',
      confidence: 78,
      category: 'Procurement',
      actionable: true,
      steps: [
        'Analyze common equipment requests',
        'Identify bulk purchase opportunities',
        'Set up vendor coordination system',
        'Implement approval workflow for bulk orders'
      ],
      relatedEntities: ['Equipment Orders', 'Suppliers', 'Budget Management']
    },
    {
      id: 'suggest-5',
      type: 'compliance',
      title: 'Automated Certification Tracking',
      description: 'Set up automated alerts for staff certification renewals to maintain compliance',
      impact: 'high',
      effort: 'low',
      timeToImplement: '30 minutes',
      potentialSavings: 'Risk reduction',
      confidence: 98,
      category: 'HR & Compliance',
      actionable: true,
      steps: [
        'Upload current certification data',
        'Set up renewal reminder schedule',
        'Configure escalation for overdue renewals',
        'Create compliance dashboard'
      ],
      relatedEntities: ['Staff Certifications', 'HR Team', 'Compliance Records']
    }
  ];

  const activeSuggestions = (suggestions || mockSuggestions).filter(
    suggestion => !dismissedSuggestions.has(suggestion.id)
  );

  const dismissSuggestion = (suggestionId: string) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'automation': return <Zap className="h-4 w-4" />;
      case 'efficiency': return <TrendingUp className="h-4 w-4" />;
      case 'workflow': return <Target className="h-4 w-4" />;
      case 'compliance': return <CheckCircle className="h-4 w-4" />;
      case 'cost_saving': return <Clock className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-100 rounded animate-pulse" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (activeSuggestions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Sparkles className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500">No smart suggestions available at the moment</p>
          <p className="text-sm text-gray-400">Check back later for AI-powered recommendations</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" data-testid="smart-suggestions">
      <div className="flex items-center space-x-2">
        <Lightbulb className="h-5 w-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-gray-900">Smart Suggestions</h3>
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
          <Sparkles className="h-3 w-3 mr-1" />
          AI-Powered
        </Badge>
      </div>

      <div className="space-y-4">
        {activeSuggestions.slice(0, 5).map((suggestion) => (
          <Card key={suggestion.id} className="relative overflow-hidden border-l-4 border-l-yellow-400">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    {getTypeIcon(suggestion.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <CardTitle className="text-base">{suggestion.title}</CardTitle>
                      <Badge className={getImpactColor(suggestion.impact)} variant="outline">
                        {suggestion.impact} impact
                      </Badge>
                      <Badge className={getEffortColor(suggestion.effort)} variant="outline">
                        {suggestion.effort} effort
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {suggestion.timeToImplement}
                      </span>
                      <span className="flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {suggestion.potentialSavings}
                      </span>
                      <span>
                        Confidence: {suggestion.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissSuggestion(suggestion.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Confidence Score</span>
                  <span>{suggestion.confidence}%</span>
                </div>
                <Progress value={suggestion.confidence} className="h-2" />
              </div>
              
              {suggestion.actionable && (
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Implementation Steps:</h4>
                    <div className="space-y-1">
                      {suggestion.steps.slice(0, 3).map((step, index) => (
                        <div key={index} className="flex items-start space-x-2 text-xs text-gray-600">
                          <span className="flex-shrink-0 w-4 h-4 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                      {suggestion.steps.length > 3 && (
                        <div className="text-xs text-gray-500 ml-6">
                          +{suggestion.steps.length - 3} more steps
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button size="sm" className="flex-1">
                      <ArrowRight className="h-3 w-3 mr-1" />
                      Implement Now
                    </Button>
                    <Button variant="outline" size="sm">
                      Learn More
                    </Button>
                  </div>
                </div>
              )}
              
              {suggestion.relatedEntities.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="text-xs text-gray-500 mb-1">Related to:</div>
                  <div className="flex flex-wrap gap-1">
                    {suggestion.relatedEntities.slice(0, 3).map((entity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {entity}
                      </Badge>
                    ))}
                    {suggestion.relatedEntities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{suggestion.relatedEntities.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}