import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Users,
  DollarSign,
  Calendar,
  FileText
} from 'lucide-react';

interface DepartmentNotification {
  id: string;
  department: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionRequired: string;
  isRead: boolean;
  createdAt: string;
}

export function ContractNotifications({ department }: { department?: string }) {
  const { toast } = useToast();

  const { data: notifications = [] } = useQuery<DepartmentNotification[]>({
    queryKey: ['/api/department-notifications', department],
    queryFn: () => apiRequest(`/api/department-notifications${department ? `?department=${department}` : ''}`)
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => 
      apiRequest(`/api/department-notifications/${notificationId}/read`, {
        method: 'PATCH'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/department-notifications'] });
      toast({
        title: "Notification marked as read",
        description: "The notification has been updated.",
      });
    }
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDepartmentIcon = (dept: string) => {
    switch (dept) {
      case 'Finance': return <DollarSign className="h-4 w-4" />;
      case 'Service Delivery': return <Calendar className="h-4 w-4" />;
      case 'HR': return <Users className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Card data-testid="contract-notifications">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Contract & Onboarding Notifications</span>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} unread</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No notifications at this time</p>
            <p className="text-sm">Contract notifications will appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`border rounded-lg p-4 ${!notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getDepartmentIcon(notification.department)}
                        <span className="font-medium text-sm">{notification.department}</span>
                        <Badge 
                          variant="outline" 
                          className={getPriorityColor(notification.priority)}
                        >
                          {notification.priority}
                        </Badge>
                        {!notification.isRead && (
                          <Badge variant="secondary">New</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">
                        {notification.message}
                      </p>
                      
                      <div className="bg-white p-3 rounded border-l-4 border-blue-500 mb-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Action Required:</span>
                        </div>
                        <p className="text-sm text-blue-700">{notification.actionRequired}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex flex-col space-y-2">
                      {!notification.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={markAsReadMutation.isPending}
                          data-testid={`button-mark-read-${notification.id}`}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export function DepartmentNotificationSummary() {
  const { data: allNotifications = [] } = useQuery<DepartmentNotification[]>({
    queryKey: ['/api/department-notifications'],
    queryFn: () => apiRequest('/api/department-notifications')
  });

  const departmentCounts = allNotifications.reduce((acc, notification) => {
    if (!notification.isRead) {
      acc[notification.department] = (acc[notification.department] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card data-testid="department-notification-summary">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Department Notification Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(departmentCounts).map(([department, count]) => (
            <div key={department} className="text-center p-3 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {getDepartmentIcon(department)}
              </div>
              <div className="text-2xl font-bold text-red-600">{count}</div>
              <p className="text-sm text-gray-600">{department}</p>
            </div>
          ))}
          
          {Object.keys(departmentCounts).length === 0 && (
            <div className="col-span-full text-center py-4 text-gray-500">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p>All departments up to date!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  function getDepartmentIcon(dept: string) {
    switch (dept) {
      case 'Finance': return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'Service Delivery': return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'HR': return <Users className="h-5 w-5 text-purple-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  }
}