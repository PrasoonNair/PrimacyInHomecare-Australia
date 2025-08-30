import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Play, 
  Pause, 
  Plus, 
  Settings, 
  Clock, 
  Users, 
  Mail, 
  FileText,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Edit,
  Trash2,
  Copy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  title: string;
  description: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'participant' | 'staff' | 'finance' | 'compliance';
  status: 'active' | 'inactive' | 'draft';
  steps: WorkflowStep[];
  triggers: string[];
  lastModified: string;
  runs: number;
  successRate: number;
}

export function WorkflowAutomationBuilder() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTemplate | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const { toast } = useToast();

  // Mock workflow templates
  const mockWorkflows: WorkflowTemplate[] = [
    {
      id: 'new-participant-onboarding',
      name: 'New Participant Onboarding',
      description: 'Automated workflow for new participant intake and setup',
      category: 'participant',
      status: 'active',
      triggers: ['participant_created', 'ndis_plan_uploaded'],
      lastModified: '2024-08-30',
      runs: 247,
      successRate: 94,
      steps: [
        {
          id: 'trigger-1',
          type: 'trigger',
          title: 'New Participant Created',
          description: 'Triggered when a new participant is added to the system',
          config: { event: 'participant_created' },
          position: { x: 50, y: 50 }
        },
        {
          id: 'action-1',
          type: 'action',
          title: 'Send Welcome Email',
          description: 'Send welcome email with intake forms',
          config: { template: 'welcome_participant', delay: 0 },
          position: { x: 50, y: 150 }
        },
        {
          id: 'action-2',
          type: 'action',
          title: 'Assign Case Manager',
          description: 'Auto-assign case manager based on location and specialization',
          config: { assignment_rule: 'auto_location_specialty' },
          position: { x: 50, y: 250 }
        },
        {
          id: 'delay-1',
          type: 'delay',
          title: 'Wait 2 Days',
          description: 'Wait for participant response',
          config: { duration: 2, unit: 'days' },
          position: { x: 50, y: 350 }
        },
        {
          id: 'condition-1',
          type: 'condition',
          title: 'Forms Completed?',
          description: 'Check if intake forms are completed',
          config: { field: 'intake_forms_completed', operator: 'equals', value: true },
          position: { x: 50, y: 450 }
        }
      ]
    },
    {
      id: 'staff-certification-renewal',
      name: 'Staff Certification Renewal',
      description: 'Automated reminders and tracking for staff certification renewals',
      category: 'staff',
      status: 'active',
      triggers: ['certification_expiry_30_days'],
      lastModified: '2024-08-28',
      runs: 89,
      successRate: 98,
      steps: [
        {
          id: 'trigger-1',
          type: 'trigger',
          title: 'Certification Expiring',
          description: 'Triggered 30 days before certification expires',
          config: { event: 'certification_expiry_30_days' },
          position: { x: 50, y: 50 }
        },
        {
          id: 'action-1',
          type: 'action',
          title: 'Send Renewal Reminder',
          description: 'Email staff member about upcoming renewal',
          config: { template: 'certification_renewal_reminder' },
          position: { x: 50, y: 150 }
        },
        {
          id: 'delay-1',
          type: 'delay',
          title: 'Wait 1 Week',
          description: 'Wait for staff action',
          config: { duration: 1, unit: 'weeks' },
          position: { x: 50, y: 250 }
        },
        {
          id: 'condition-1',
          type: 'condition',
          title: 'Renewed?',
          description: 'Check if certification was renewed',
          config: { field: 'certification_renewed', operator: 'equals', value: true },
          position: { x: 50, y: 350 }
        }
      ]
    },
    {
      id: 'invoice-processing',
      name: 'Automated Invoice Processing',
      description: 'Generate and process invoices for completed services',
      category: 'finance',
      status: 'active',
      triggers: ['service_completed', 'month_end'],
      lastModified: '2024-08-29',
      runs: 432,
      successRate: 99,
      steps: [
        {
          id: 'trigger-1',
          type: 'trigger',
          title: 'Service Completed',
          description: 'Triggered when a service is marked as completed',
          config: { event: 'service_completed' },
          position: { x: 50, y: 50 }
        },
        {
          id: 'action-1',
          type: 'action',
          title: 'Generate Invoice',
          description: 'Create invoice based on service details',
          config: { template: 'service_invoice' },
          position: { x: 50, y: 150 }
        },
        {
          id: 'action-2',
          type: 'action',
          title: 'Send to NDIA',
          description: 'Submit invoice to NDIA portal',
          config: { endpoint: 'ndia_invoice_submission' },
          position: { x: 50, y: 250 }
        }
      ]
    }
  ];

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'trigger': return <Play className="h-4 w-4" />;
      case 'condition': return <AlertTriangle className="h-4 w-4" />;
      case 'action': return <CheckCircle className="h-4 w-4" />;
      case 'delay': return <Clock className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'participant': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-purple-100 text-purple-800';
      case 'finance': return 'bg-green-100 text-green-800';
      case 'compliance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6" data-testid="workflow-automation-builder">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workflow Automation</h2>
          <p className="text-gray-600">Build and manage automated workflows for operational efficiency</p>
        </div>
        
        <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Workflow Builder</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-gray-600">Visual workflow builder interface would be implemented here with drag-and-drop functionality.</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workflow Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockWorkflows.map((workflow) => (
          <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                  <p className="text-sm text-gray-600">{workflow.description}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Badge className={getStatusColor(workflow.status)} variant="outline">
                    {workflow.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getCategoryColor(workflow.category)} variant="outline">
                  {workflow.category}
                </Badge>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{workflow.runs} runs</span>
                  <span>{workflow.successRate}% success</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Workflow Steps</h4>
                <div className="space-y-2">
                  {workflow.steps.slice(0, 3).map((step, index) => (
                    <div key={step.id} className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2 flex-1">
                        {getStepIcon(step.type)}
                        <span className="text-sm text-gray-600 truncate">{step.title}</span>
                      </div>
                      {index < workflow.steps.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                  ))}
                  {workflow.steps.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{workflow.steps.length - 3} more steps
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Triggers</h4>
                <div className="flex flex-wrap gap-1">
                  {workflow.triggers.map((trigger, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {trigger.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-gray-500">
                  Modified: {workflow.lastModified}
                </span>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Switch 
                    checked={workflow.status === 'active'}
                    size="sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workflow Analytics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-blue-700">Active Workflows</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">2,847</div>
              <div className="text-sm text-green-700">Total Executions</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">96.4%</div>
              <div className="text-sm text-purple-700">Success Rate</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">47hrs</div>
              <div className="text-sm text-orange-700">Weekly Time Saved</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}