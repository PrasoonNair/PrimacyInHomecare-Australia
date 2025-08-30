import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Activity, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
  Zap,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  change: number;
  threshold: { warning: number; critical: number };
}

interface AlertItem {
  id: string;
  type: 'system' | 'business' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export function RealTimeMonitoring() {
  const [isConnected, setIsConnected] = useState(true);
  const [activeAlerts, setActiveAlerts] = useState<AlertItem[]>([]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate connection status
      setIsConnected(Math.random() > 0.1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['/api/operations/real-time-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/operations/real-time-metrics');
      if (!response.ok) throw new Error('Failed to fetch real-time metrics');
      return response.json();
    },
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  // Mock real-time metrics
  const mockMetrics: SystemMetric[] = [
    {
      id: 'active_users',
      name: 'Active Users',
      value: 89,
      unit: 'users',
      status: 'healthy',
      trend: 'up',
      change: 12,
      threshold: { warning: 150, critical: 200 }
    },
    {
      id: 'system_load',
      name: 'System Load',
      value: 67,
      unit: '%',
      status: 'warning',
      trend: 'up',
      change: 8,
      threshold: { warning: 70, critical: 90 }
    },
    {
      id: 'response_time',
      name: 'Avg Response Time',
      value: 245,
      unit: 'ms',
      status: 'healthy',
      trend: 'down',
      change: -15,
      threshold: { warning: 500, critical: 1000 }
    },
    {
      id: 'database_connections',
      name: 'DB Connections',
      value: 34,
      unit: 'conn',
      status: 'healthy',
      trend: 'stable',
      change: 0,
      threshold: { warning: 80, critical: 95 }
    },
    {
      id: 'error_rate',
      name: 'Error Rate',
      value: 0.2,
      unit: '%',
      status: 'healthy',
      trend: 'down',
      change: -0.1,
      threshold: { warning: 1, critical: 5 }
    },
    {
      id: 'api_requests',
      name: 'API Requests/min',
      value: 1247,
      unit: 'req',
      status: 'healthy',
      trend: 'up',
      change: 156,
      threshold: { warning: 2000, critical: 3000 }
    }
  ];

  const mockAlerts: AlertItem[] = [
    {
      id: 'alert-1',
      type: 'system',
      severity: 'medium',
      message: 'System load approaching warning threshold (67%)',
      timestamp: '2025-08-30T10:30:00Z',
      resolved: false
    },
    {
      id: 'alert-2',
      type: 'business',
      severity: 'low',
      message: 'Participant satisfaction score below target in NSW region',
      timestamp: '2025-08-30T09:15:00Z',
      resolved: false
    },
    {
      id: 'alert-3',
      type: 'system',
      severity: 'high',
      message: 'Database backup completed successfully',
      timestamp: '2025-08-30T02:00:00Z',
      resolved: true
    }
  ];

  // Mock performance data for charts
  const performanceData = [
    { time: '10:00', users: 45, load: 32, responseTime: 180 },
    { time: '10:05', users: 52, load: 38, responseTime: 195 },
    { time: '10:10', users: 67, load: 45, responseTime: 210 },
    { time: '10:15', users: 78, load: 56, responseTime: 225 },
    { time: '10:20', users: 85, load: 62, responseTime: 240 },
    { time: '10:25', users: 89, load: 67, responseTime: 245 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3" />;
      case 'down': return <TrendingDown className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-100 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="real-time-monitoring">
      {/* Header with Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Activity className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Real-Time Monitoring</h2>
            <p className="text-gray-600">Live system performance and operational metrics</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-600" />
                <Badge className="bg-red-100 text-red-800">Disconnected</Badge>
              </>
            )}
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Zap className="h-3 w-3 mr-1" />
            Live Data
          </Badge>
        </div>
      </div>

      {/* Real-Time Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockMetrics.map((metric) => (
          <Card key={metric.id} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">{metric.name}</h3>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getStatusColor(metric.status)}`}>
                  {getStatusIcon(metric.status)}
                </div>
              </div>
              
              <div className="flex items-baseline space-x-2 mb-2">
                <span className="text-2xl font-bold text-gray-900">
                  {metric.value.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">{metric.unit}</span>
                <div className={`flex items-center space-x-1 ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {getTrendIcon(metric.trend)}
                  <span className="text-xs">
                    {metric.change > 0 ? '+' : ''}{metric.change}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Warning: {metric.threshold.warning}</span>
                  <span>Critical: {metric.threshold.critical}</span>
                </div>
                <Progress 
                  value={(metric.value / metric.threshold.critical) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Active Users & System Load</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#3B82F6" name="Active Users" />
                <Line type="monotone" dataKey="load" stroke="#EF4444" name="System Load %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Response Time Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  fillOpacity={0.3}
                  name="Response Time (ms)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Active Alerts</span>
            </CardTitle>
            <Badge variant="outline">
              {mockAlerts.filter(alert => !alert.resolved).length} active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAlerts.filter(alert => !alert.resolved).map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                  alert.severity === 'critical' ? 'text-red-600' :
                  alert.severity === 'high' ? 'text-orange-600' :
                  alert.severity === 'medium' ? 'text-yellow-600' :
                  'text-blue-600'
                }`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge className={getSeverityColor(alert.severity)} variant="outline">
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {alert.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                
                <Button variant="ghost" size="sm">
                  Resolve
                </Button>
              </div>
            ))}
            
            {mockAlerts.filter(alert => !alert.resolved).length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p>No active alerts - all systems operating normally</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}