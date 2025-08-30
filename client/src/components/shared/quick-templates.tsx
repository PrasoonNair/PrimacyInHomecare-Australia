import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, 
  Mail, 
  MessageSquare, 
  Calendar,
  Phone,
  UserPlus,
  ClipboardList,
  Star,
  Plus,
  Edit,
  Copy,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface QuickTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'note' | 'form' | 'letter' | 'report';
  category: 'participant' | 'staff' | 'compliance' | 'general';
  content: string;
  variables: string[];
  useCount: number;
  lastUsed: string;
  isFavorite: boolean;
  tags: string[];
}

export function QuickTemplates({ contextType = 'general' }: { contextType?: 'participant' | 'staff' | 'general' }) {
  const [selectedTemplate, setSelectedTemplate] = useState<QuickTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const { toast } = useToast();

  // Mock templates for demonstration
  const mockTemplates: QuickTemplate[] = [
    {
      id: 'template-1',
      name: 'Welcome Email for New Participants',
      type: 'email',
      category: 'participant',
      content: `Dear {{participant_name}},

Welcome to Primacy Care Australia! We're excited to work with you on your NDIS journey.

Your case manager {{case_manager_name}} will be in touch within 2 business days to schedule your initial meeting.

In the meantime, please prepare:
- Your NDIS plan
- Any medical reports
- List of current services

Best regards,
{{staff_name}}
Primacy Care Australia`,
      variables: ['participant_name', 'case_manager_name', 'staff_name'],
      useCount: 47,
      lastUsed: '2025-08-29',
      isFavorite: true,
      tags: ['onboarding', 'welcome', 'ndis']
    },
    {
      id: 'template-2',
      name: 'Service Cancellation SMS',
      type: 'sms',
      category: 'participant',
      content: `Hi {{participant_name}}, unfortunately we need to cancel your {{service_type}} session on {{date}} at {{time}}. {{reason}} We'll reschedule ASAP. Call {{phone}} for urgent needs. Thanks, {{organization}}`,
      variables: ['participant_name', 'service_type', 'date', 'time', 'reason', 'phone', 'organization'],
      useCount: 23,
      lastUsed: '2025-08-28',
      isFavorite: false,
      tags: ['cancellation', 'sms', 'rescheduling']
    },
    {
      id: 'template-3',
      name: 'Progress Note Template',
      type: 'note',
      category: 'participant',
      content: `Participant: {{participant_name}}
Date: {{date}}
Service: {{service_type}}
Duration: {{duration}}

Goals Addressed:
- {{goal_1}}
- {{goal_2}}

Activities Completed:
{{activities}}

Progress Observed:
{{progress_notes}}

Next Session Plan:
{{next_session_plan}}

Support Worker: {{staff_name}}`,
      variables: ['participant_name', 'date', 'service_type', 'duration', 'goal_1', 'goal_2', 'activities', 'progress_notes', 'next_session_plan', 'staff_name'],
      useCount: 156,
      lastUsed: '2025-08-30',
      isFavorite: true,
      tags: ['progress', 'notes', 'documentation']
    },
    {
      id: 'template-4',
      name: 'Staff Performance Review',
      type: 'form',
      category: 'staff',
      content: `Staff Performance Review

Employee: {{staff_name}}
Position: {{position}}
Review Period: {{review_period}}
Reviewer: {{reviewer_name}}

Key Performance Areas:
1. Service Quality: {{service_quality_rating}}/5
2. Documentation: {{documentation_rating}}/5
3. Team Collaboration: {{collaboration_rating}}/5
4. Professional Development: {{development_rating}}/5

Achievements:
{{achievements}}

Areas for Improvement:
{{improvement_areas}}

Goals for Next Period:
{{next_goals}}`,
      variables: ['staff_name', 'position', 'review_period', 'reviewer_name', 'service_quality_rating', 'documentation_rating', 'collaboration_rating', 'development_rating', 'achievements', 'improvement_areas', 'next_goals'],
      useCount: 12,
      lastUsed: '2025-08-25',
      isFavorite: false,
      tags: ['performance', 'review', 'hr']
    },
    {
      id: 'template-5',
      name: 'Incident Report',
      type: 'report',
      category: 'compliance',
      content: `INCIDENT REPORT

Date: {{incident_date}}
Time: {{incident_time}}
Location: {{location}}
Reported by: {{reporter_name}}

Incident Type: {{incident_type}}
Severity: {{severity}}

Persons Involved:
- Participant: {{participant_name}}
- Staff: {{staff_name}}
- Others: {{others}}

Description of Incident:
{{incident_description}}

Immediate Actions Taken:
{{immediate_actions}}

Injuries/Damage:
{{injuries_damage}}

Witnesses:
{{witnesses}}

Follow-up Required:
{{followup_required}}

Manager Notified: {{manager_notified}}
Family Notified: {{family_notified}}

Report Completed by: {{completed_by}}
Date Completed: {{completion_date}}`,
      variables: ['incident_date', 'incident_time', 'location', 'reporter_name', 'incident_type', 'severity', 'participant_name', 'staff_name', 'others', 'incident_description', 'immediate_actions', 'injuries_damage', 'witnesses', 'followup_required', 'manager_notified', 'family_notified', 'completed_by', 'completion_date'],
      useCount: 8,
      lastUsed: '2025-08-27',
      isFavorite: false,
      tags: ['incident', 'compliance', 'safety']
    }
  ];

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || template.type === filterType;
    const matchesContext = contextType === 'general' || template.category === contextType;
    
    return matchesSearch && matchesType && matchesContext;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'note': return <FileText className="h-4 w-4" />;
      case 'form': return <ClipboardList className="h-4 w-4" />;
      case 'letter': return <FileText className="h-4 w-4" />;
      case 'report': return <ClipboardList className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'sms': return 'bg-green-100 text-green-800';
      case 'note': return 'bg-purple-100 text-purple-800';
      case 'form': return 'bg-orange-100 text-orange-800';
      case 'letter': return 'bg-yellow-100 text-yellow-800';
      case 'report': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const useTemplate = (template: QuickTemplate) => {
    // This would typically open a form with the template content pre-filled
    toast({
      title: "Template Loaded",
      description: `${template.name} is ready for customization`,
    });
  };

  return (
    <div className="space-y-6" data-testid="quick-templates">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Quick Templates</h3>
          <p className="text-sm text-gray-600">Pre-built templates for common tasks and communications</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Template name" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="form">Form</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                </SelectContent>
              </Select>
              <Textarea 
                placeholder="Template content (use {{variable_name}} for dynamic content)"
                rows={10}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-template-search"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="note">Note</SelectItem>
            <SelectItem value="form">Form</SelectItem>
            <SelectItem value="letter">Letter</SelectItem>
            <SelectItem value="report">Report</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <div className={`p-2 rounded-lg ${getTypeColor(template.type)}`}>
                    {getTypeIcon(template.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {template.name}
                      </h3>
                      {template.isFavorite && (
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <Badge className={getTypeColor(template.type)} variant="outline">
                      {template.type}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-gray-600 line-clamp-3">
                  {template.content.substring(0, 120)}...
                </p>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {template.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.tags.length - 3}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Used {template.useCount} times</span>
                <span>Last: {template.lastUsed}</span>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => useTemplate(template)}
                >
                  Use Template
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">No templates found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or create a new template</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}