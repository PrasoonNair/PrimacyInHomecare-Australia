import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Clock, 
  Calendar, 
  CheckSquare, 
  TrendingUp,
  Users,
  Target,
  Zap,
  AlertCircle,
  BarChart3,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ProductivityWidget {
  id: string;
  type: 'time_tracker' | 'task_counter' | 'efficiency_meter' | 'quick_stats' | 'upcoming_events' | 'performance_gauge';
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { direction: 'up' | 'down' | 'stable'; percentage: number };
  actionable?: boolean;
  refreshInterval?: number;
}

export function ProductivityWidgets({ layout = 'grid' }: { layout?: 'grid' | 'horizontal' }) {
  const [timeSpent, setTimeSpent] = useState(0);

  const { data: widgetData, isLoading } = useQuery({
    queryKey: ['/api/productivity/widgets'],
    queryFn: async () => {
      const response = await fetch('/api/productivity/widgets');
      if (!response.ok) throw new Error('Failed to fetch widget data');
      return response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Mock productivity data for demonstration
  const mockWidgets: ProductivityWidget[] = [
    {
      id: 'time-today',
      type: 'time_tracker',
      title: 'Time Today',
      value: '6h 45m',
      subtitle: 'Productive hours',
      trend: { direction: 'up', percentage: 12 },
      actionable: true
    },
    {
      id: 'tasks-completed',
      type: 'task_counter',
      title: 'Tasks Completed',
      value: 12,
      subtitle: 'Today',
      trend: { direction: 'up', percentage: 8 },
      actionable: false
    },
    {
      id: 'efficiency-score',
      type: 'efficiency_meter',
      title: 'Efficiency Score',
      value: '87%',
      subtitle: 'Above average',
      trend: { direction: 'up', percentage: 5 },
      actionable: true
    },
    {
      id: 'participants-seen',
      type: 'quick_stats',
      title: 'Participants Seen',
      value: 8,
      subtitle: 'This week',
      trend: { direction: 'stable', percentage: 0 },
      actionable: false
    },
    {
      id: 'upcoming-appointments',
      type: 'upcoming_events',
      title: 'Next Appointment',
      value: '2:30 PM',
      subtitle: 'Sarah Thompson',
      actionable: true
    },
    {
      id: 'performance-gauge',
      type: 'performance_gauge',
      title: 'Weekly Goal',
      value: '73%',
      subtitle: '22/30 sessions',
      trend: { direction: 'up', percentage: 15 },
      actionable: true
    }
  ];

  const widgets = widgetData || mockWidgets;

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />;
      case 'stable': return <Activity className="h-3 w-3 text-gray-600" />;
      default: return null;
    }
  };

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'time_tracker': return <Clock className="h-4 w-4" />;
      case 'task_counter': return <CheckSquare className="h-4 w-4" />;
      case 'efficiency_meter': return <Zap className="h-4 w-4" />;
      case 'quick_stats': return <Users className="h-4 w-4" />;
      case 'upcoming_events': return <Calendar className="h-4 w-4" />;
      case 'performance_gauge': return <Target className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getWidgetColor = (type: string) => {
    switch (type) {
      case 'time_tracker': return 'bg-blue-100 text-blue-600';
      case 'task_counter': return 'bg-green-100 text-green-600';
      case 'efficiency_meter': return 'bg-purple-100 text-purple-600';
      case 'quick_stats': return 'bg-orange-100 text-orange-600';
      case 'upcoming_events': return 'bg-yellow-100 text-yellow-600';
      case 'performance_gauge': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'flex space-x-4 overflow-x-auto'}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded animate-pulse min-w-[200px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="productivity-widgets">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Productivity Dashboard</h3>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          <Activity className="h-3 w-3 mr-1" />
          Live
        </Badge>
      </div>

      <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'flex space-x-4 overflow-x-auto pb-2'}>
        {widgets.map((widget) => (
          <Card 
            key={widget.id} 
            className={`hover:shadow-md transition-shadow ${layout === 'horizontal' ? 'min-w-[200px]' : ''}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${getWidgetColor(widget.type)}`}>
                  {getWidgetIcon(widget.type)}
                </div>
                {widget.trend && (
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(widget.trend.direction)}
                    <span className={`text-xs font-medium ${
                      widget.trend.direction === 'up' ? 'text-green-600' :
                      widget.trend.direction === 'down' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {widget.trend.percentage > 0 && widget.trend.direction !== 'stable' ? `${widget.trend.percentage}%` : ''}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-700">{widget.title}</h4>
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-bold text-gray-900">{widget.value}</span>
                  {widget.subtitle && (
                    <span className="text-xs text-gray-500">{widget.subtitle}</span>
                  )}
                </div>
              </div>
              
              {widget.type === 'performance_gauge' && typeof widget.value === 'string' && widget.value.includes('%') && (
                <div className="mt-3">
                  <Progress 
                    value={parseInt(widget.value.replace('%', ''))} 
                    className="h-2"
                  />
                </div>
              )}
              
              {widget.actionable && (
                <div className="mt-3">
                  <Button size="sm" variant="outline" className="w-full">
                    {widget.type === 'time_tracker' && 'View Timesheet'}
                    {widget.type === 'efficiency_meter' && 'View Details'}
                    {widget.type === 'upcoming_events' && 'View Calendar'}
                    {widget.type === 'performance_gauge' && 'View Progress'}
                    {!['time_tracker', 'efficiency_meter', 'upcoming_events', 'performance_gauge'].includes(widget.type) && 'View More'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions Row */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" size="sm" className="justify-start">
              <Clock className="h-4 w-4 mr-2" />
              Start Timer
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <CheckSquare className="h-4 w-4 mr-2" />
              Add Task
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Today's Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">6h 45m</div>
              <div className="text-xs text-gray-600">Active Time</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">12</div>
              <div className="text-xs text-gray-600">Tasks Done</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">8</div>
              <div className="text-xs text-gray-600">Participants</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">3</div>
              <div className="text-xs text-gray-600">Meetings</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}