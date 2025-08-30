import React from 'react';
import { Link } from 'wouter';
import { 
  Calendar, 
  FileText, 
  Phone, 
  Mail, 
  DollarSign, 
  ClipboardCheck, 
  UserCheck, 
  Star,
  Clock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WorkflowActionButtonsProps {
  itemId: string;
  itemType: 'staff' | 'participant';
  itemData: any;
  compact?: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  description: string;
  badge?: string;
  external?: boolean;
}

export function WorkflowActionButtons({ itemId, itemType, itemData, compact = false }: WorkflowActionButtonsProps) {
  
  const getStaffActions = (staffData: any): QuickAction[] => [
    {
      id: 'schedule',
      label: 'Schedule',
      icon: <Calendar className="h-4 w-4" />,
      href: `/calendar-shifts?staff=${itemId}`,
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      description: 'View and manage shift schedule',
      badge: staffData.upcomingShifts ? `${staffData.upcomingShifts}` : undefined
    },
    {
      id: 'participants',
      label: 'Participants',
      icon: <UserCheck className="h-4 w-4" />,
      href: `/participants?assignedTo=${itemId}`,
      color: 'bg-green-50 text-green-700 hover:bg-green-100',
      description: 'View assigned participants',
      badge: staffData.currentParticipants ? `${staffData.currentParticipants}` : undefined
    },
    {
      id: 'performance',
      label: 'Review',
      icon: <Star className="h-4 w-4" />,
      href: `/staff/${itemId}/performance`,
      color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
      description: 'Performance review and goals'
    },
    {
      id: 'training',
      label: 'Training',
      icon: <ClipboardCheck className="h-4 w-4" />,
      href: `/staff/${itemId}/training`,
      color: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
      description: 'Training records and certifications',
      badge: staffData.expiringCerts ? 'Due' : undefined
    },
    {
      id: 'payroll',
      label: 'Payroll',
      icon: <DollarSign className="h-4 w-4" />,
      href: `/finance-awards?staff=${itemId}`,
      color: 'bg-orange-50 text-orange-700 hover:bg-orange-100',
      description: 'Payroll and SCHADS awards'
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: <Phone className="h-4 w-4" />,
      href: `tel:${staffData.phone}`,
      color: 'bg-gray-50 text-gray-700 hover:bg-gray-100',
      description: 'Call staff member',
      external: true
    }
  ];

  const getParticipantActions = (participantData: any): QuickAction[] => [
    {
      id: 'plan',
      label: 'NDIS Plan',
      icon: <FileText className="h-4 w-4" />,
      href: `/participants/${itemId}/plan`,
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      description: 'View and manage NDIS plan',
      badge: participantData.planStatus === 'active' ? 'Active' : participantData.planStatus
    },
    {
      id: 'services',
      label: 'Services',
      icon: <ClipboardCheck className="h-4 w-4" />,
      href: `/services?participant=${itemId}`,
      color: 'bg-green-50 text-green-700 hover:bg-green-100',
      description: 'Service delivery and progress',
      badge: participantData.activeServices ? `${participantData.activeServices}` : undefined
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: <Star className="h-4 w-4" />,
      href: `/participants/${itemId}/goals`,
      color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
      description: 'Goals and progress tracking',
      badge: participantData.completedGoals && participantData.goals 
        ? `${participantData.completedGoals}/${participantData.goals}` 
        : undefined
    },
    {
      id: 'support-worker',
      label: 'Support Worker',
      icon: <UserCheck className="h-4 w-4" />,
      href: `/participants/${itemId}/support-worker`,
      color: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
      description: 'Assign or change support worker',
      badge: participantData.primarySupport ? 'Assigned' : 'Needed'
    },
    {
      id: 'budget',
      label: 'Budget',
      icon: <DollarSign className="h-4 w-4" />,
      href: `/participants/${itemId}/budget`,
      color: 'bg-orange-50 text-orange-700 hover:bg-orange-100',
      description: 'Budget tracking and invoicing',
      badge: participantData.budgetUsagePercentage > 80 ? 'High' : undefined
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: <Calendar className="h-4 w-4" />,
      href: `/calendar-shifts?participant=${itemId}`,
      color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
      description: 'Service schedule and appointments',
      badge: participantData.upcomingServices ? `${participantData.upcomingServices}` : undefined
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: <Phone className="h-4 w-4" />,
      href: `tel:${participantData.phone}`,
      color: 'bg-gray-50 text-gray-700 hover:bg-gray-100',
      description: 'Call participant',
      external: true
    }
  ];

  const actions = itemType === 'staff' ? getStaffActions(itemData) : getParticipantActions(itemData);

  if (compact) {
    return (
      <div className="flex items-center space-x-1" data-testid={`workflow-actions-compact-${itemId}`}>
        {actions.slice(0, 3).map((action) => (
          <TooltipProvider key={action.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                {action.external ? (
                  <a href={action.href} className="inline-flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 ${action.color}`}
                      data-testid={`button-${action.id}-${itemId}`}
                    >
                      {action.icon}
                    </Button>
                  </a>
                ) : (
                  <Link href={action.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 ${action.color}`}
                      data-testid={`button-${action.id}-${itemId}`}
                    >
                      {action.icon}
                    </Button>
                  </Link>
                )}
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-medium">{action.label}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                  {action.badge && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        
        {actions.length > 3 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`/${itemType}/${itemId}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 bg-gray-50 text-gray-700 hover:bg-gray-100"
                    data-testid={`button-more-${itemId}`}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>View all actions</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2" data-testid={`workflow-actions-full-${itemId}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Quick Actions</h4>
        <Badge variant="outline" className="text-xs">
          {actions.length} available
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <div key={action.id} className="relative">
            {action.external ? (
              <a href={action.href} className="block">
                <Button
                  variant="outline"
                  size="sm"
                  className={`w-full justify-start ${action.color} border-0`}
                  data-testid={`button-${action.id}-${itemId}`}
                >
                  <div className="flex items-center space-x-2 w-full">
                    {action.icon}
                    <span className="text-xs font-medium truncate">{action.label}</span>
                    <ExternalLink className="h-3 w-3 ml-auto flex-shrink-0" />
                  </div>
                </Button>
              </a>
            ) : (
              <Link href={action.href}>
                <Button
                  variant="outline"
                  size="sm"
                  className={`w-full justify-start ${action.color} border-0`}
                  data-testid={`button-${action.id}-${itemId}`}
                >
                  <div className="flex items-center space-x-2 w-full">
                    {action.icon}
                    <span className="text-xs font-medium truncate">{action.label}</span>
                    {action.badge && (
                      <Badge variant="secondary" className="ml-auto text-xs px-1 py-0">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                </Button>
              </Link>
            )}
          </div>
        ))}
      </div>
      
      <div className="pt-2 border-t">
        <Link href={`/${itemType}/${itemId}`}>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            data-testid={`button-view-full-${itemId}`}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            View Full Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}