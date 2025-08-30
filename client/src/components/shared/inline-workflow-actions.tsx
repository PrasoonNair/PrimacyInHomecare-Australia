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
  ExternalLink,
  Plus,
  Edit,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface InlineWorkflowActionsProps {
  itemId: string;
  itemType: 'staff' | 'participant';
  context: 'list' | 'grid' | 'card';
  itemData: any;
}

interface WorkflowAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  priority: 'high' | 'medium' | 'low';
  actionType: 'navigate' | 'external' | 'modal';
  badge?: string;
  color: string;
}

export function InlineWorkflowActions({ itemId, itemType, context, itemData }: InlineWorkflowActionsProps) {
  
  const getStaffWorkflowActions = (data: any): WorkflowAction[] => {
    const actions: WorkflowAction[] = [];
    
    // High priority actions based on staff status and current needs
    if (data.status === 'active') {
      actions.push({
        id: 'quick-schedule',
        label: 'Schedule',
        icon: <Calendar className="h-4 w-4" />,
        href: `/calendar-shifts?staff=${itemId}&action=schedule`,
        priority: 'high',
        actionType: 'navigate',
        color: 'text-blue-600 hover:text-blue-700',
        badge: data.upcomingShifts ? `${data.upcomingShifts}` : undefined
      });
    }
    
    if (data.currentParticipants > 0) {
      actions.push({
        id: 'view-participants',
        label: 'Participants',
        icon: <UserCheck className="h-4 w-4" />,
        href: `/participants?assignedTo=${itemId}`,
        priority: 'high',
        actionType: 'navigate',
        color: 'text-green-600 hover:text-green-700',
        badge: `${data.currentParticipants}`
      });
    }
    
    // Medium priority actions
    if (data.expiringCerts) {
      actions.push({
        id: 'update-training',
        label: 'Training Due',
        icon: <ClipboardCheck className="h-4 w-4" />,
        href: `/staff/${itemId}/training?action=renew`,
        priority: 'medium',
        actionType: 'navigate',
        color: 'text-orange-600 hover:text-orange-700',
        badge: 'Due'
      });
    }
    
    // Contact action (always available)
    if (data.phone) {
      actions.push({
        id: 'contact',
        label: 'Call',
        icon: <Phone className="h-4 w-4" />,
        href: `tel:${data.phone}`,
        priority: 'low',
        actionType: 'external',
        color: 'text-gray-600 hover:text-gray-700'
      });
    }
    
    return actions;
  };

  const getParticipantWorkflowActions = (data: any): WorkflowAction[] => {
    const actions: WorkflowAction[] = [];
    
    // High priority actions based on participant status and needs
    if (data.planStatus === 'active' && data.budgetUsagePercentage > 80) {
      actions.push({
        id: 'budget-review',
        label: 'Budget Alert',
        icon: <DollarSign className="h-4 w-4" />,
        href: `/participants/${itemId}/budget?action=review`,
        priority: 'high',
        actionType: 'navigate',
        color: 'text-red-600 hover:text-red-700',
        badge: `${Math.round(data.budgetUsagePercentage)}%`
      });
    }
    
    if (!data.primarySupport) {
      actions.push({
        id: 'assign-worker',
        label: 'Assign Worker',
        icon: <UserCheck className="h-4 w-4" />,
        href: `/participants/${itemId}/support-worker?action=assign`,
        priority: 'high',
        actionType: 'navigate',
        color: 'text-orange-600 hover:text-orange-700',
        badge: 'Needed'
      });
    }
    
    // Medium priority actions
    if (data.goals && data.completedGoals < data.goals) {
      actions.push({
        id: 'update-goals',
        label: 'Goals',
        icon: <Star className="h-4 w-4" />,
        href: `/participants/${itemId}/goals?action=update`,
        priority: 'medium',
        actionType: 'navigate',
        color: 'text-yellow-600 hover:text-yellow-700',
        badge: `${data.completedGoals}/${data.goals}`
      });
    }
    
    if (data.planStatus === 'active') {
      actions.push({
        id: 'schedule-service',
        label: 'Schedule',
        icon: <Calendar className="h-4 w-4" />,
        href: `/calendar-shifts?participant=${itemId}&action=schedule`,
        priority: 'medium',
        actionType: 'navigate',
        color: 'text-blue-600 hover:text-blue-700'
      });
    }
    
    // Contact action (always available)
    if (data.phone) {
      actions.push({
        id: 'contact',
        label: 'Call',
        icon: <Phone className="h-4 w-4" />,
        href: `tel:${data.phone}`,
        priority: 'low',
        actionType: 'external',
        color: 'text-gray-600 hover:text-gray-700'
      });
    }
    
    return actions;
  };

  const actions = itemType === 'staff' 
    ? getStaffWorkflowActions(itemData) 
    : getParticipantWorkflowActions(itemData);

  // Filter actions based on context and priority
  const getVisibleActions = () => {
    switch (context) {
      case 'list':
        return actions.filter(a => a.priority === 'high').slice(0, 2);
      case 'grid':
        return actions.filter(a => ['high', 'medium'].includes(a.priority)).slice(0, 3);
      case 'card':
        return actions.slice(0, 4);
      default:
        return actions.slice(0, 2);
    }
  };

  const visibleActions = getVisibleActions();

  if (visibleActions.length === 0) {
    return null;
  }

  const renderAction = (action: WorkflowAction) => {
    const content = (
      <Button
        variant="ghost"
        size="sm"
        className={`h-7 px-2 ${action.color} text-xs`}
        data-testid={`inline-action-${action.id}-${itemId}`}
      >
        {action.icon}
        <span className="ml-1">{action.label}</span>
        {action.badge && (
          <Badge variant="secondary" className="ml-1 text-xs px-1 py-0 h-4">
            {action.badge}
          </Badge>
        )}
        {action.actionType === 'external' && (
          <ExternalLink className="h-3 w-3 ml-1" />
        )}
      </Button>
    );

    if (action.actionType === 'external') {
      return (
        <a key={action.id} href={action.href}>
          {content}
        </a>
      );
    }

    return (
      <Link key={action.id} href={action.href}>
        {content}
      </Link>
    );
  };

  if (context === 'list') {
    return (
      <div className="flex items-center space-x-1" data-testid={`inline-workflow-${itemId}`}>
        {visibleActions.map(renderAction)}
      </div>
    );
  }

  return (
    <div className="space-y-1" data-testid={`inline-workflow-${itemId}`}>
      <div className="flex flex-wrap gap-1">
        {visibleActions.map(renderAction)}
      </div>
      
      {actions.length > visibleActions.length && (
        <Link href={`/${itemType}/${itemId}`}>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
            data-testid={`more-actions-${itemId}`}
          >
            <Plus className="h-3 w-3 mr-1" />
            {actions.length - visibleActions.length} more
          </Button>
        </Link>
      )}
    </div>
  );
}