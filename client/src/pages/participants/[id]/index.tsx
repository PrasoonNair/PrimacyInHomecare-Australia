import React from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, User, FileText, DollarSign, Phone, Mail, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'wouter';
import { WorkflowActionButtons } from '@/components/shared/workflow-action-buttons';

export default function ParticipantProfilePage() {
  const [, params] = useRoute('/participants/:id');
  const participantId = params?.id;

  const { data: participant, isLoading } = useQuery({
    queryKey: ['/api/participants', participantId],
    queryFn: async () => {
      const response = await fetch(`/api/participants/${participantId}`);
      if (!response.ok) throw new Error('Failed to fetch participant');
      return response.json();
    },
    enabled: !!participantId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Participant Not Found</h1>
          <p className="text-gray-600 mt-2">The participant you're looking for doesn't exist.</p>
          <Link href="/participant-directory">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Participant Directory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateBudgetUsage = () => {
    if (!participant.totalBudget || !participant.usedBudget) return 0;
    return (participant.usedBudget / participant.totalBudget) * 100;
  };

  return (
    <div className="container mx-auto px-4 py-6" data-testid="participant-profile-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/participant-directory">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Directory
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900" data-testid="participant-name">
              {participant.name}
            </h1>
            <p className="text-gray-600">
              Age: {calculateAge(participant.dateOfBirth)} • NDIS: {participant.ndisNumber}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge className={participant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
            {participant.status}
          </Badge>
          {participant.planStatus && (
            <Badge variant="outline">
              Plan {participant.planStatus}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{participant.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900">{participant.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  <p className="text-gray-900">{participant.city}, {participant.state}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                  <p className="text-gray-900">
                    {new Date(participant.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
                {participant.primarySupport && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Primary Support</label>
                    <p className="text-gray-900">{participant.primarySupport}</p>
                  </div>
                )}
                {participant.communicationPreference && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Communication Preference</label>
                    <p className="text-gray-900">{participant.communicationPreference}</p>
                  </div>
                )}
              </div>
              
              {participant.disabilities && participant.disabilities.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">Disabilities</label>
                  <div className="flex flex-wrap gap-2">
                    {participant.disabilities.map((disability: string, index: number) => (
                      <Badge key={index} variant="outline">{disability}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* NDIS Plan Information */}
          {participant.planStatus && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>NDIS Plan</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {participant.planStartDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Plan Start Date</label>
                      <p className="text-gray-900">
                        {new Date(participant.planStartDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {participant.planEndDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Plan End Date</label>
                      <p className="text-gray-900">
                        {new Date(participant.planEndDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {participant.totalBudget && participant.usedBudget !== undefined && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-600">Budget Usage</label>
                      <span className="text-sm font-medium">{calculateBudgetUsage().toFixed(1)}%</span>
                    </div>
                    <Progress value={calculateBudgetUsage()} className="h-3" />
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>Used: {formatCurrency(participant.usedBudget)}</span>
                      <span>Total: {formatCurrency(participant.totalBudget)}</span>
                    </div>
                  </div>
                )}

                {participant.goals && participant.completedGoals !== undefined && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-600">Goal Progress</label>
                      <span className="text-sm font-medium">
                        {participant.completedGoals}/{participant.goals} completed
                      </span>
                    </div>
                    <Progress value={(participant.completedGoals / participant.goals) * 100} className="h-3" />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Workflow Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkflowActionButtons
                itemId={participant.id}
                itemType="participant"
                itemData={participant}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a href={`mailto:${participant.email}`} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="text-sm">{participant.email}</span>
              </a>
              
              {participant.phone && (
                <a href={`tel:${participant.phone}`} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{participant.phone}</span>
                </a>
              )}
            </CardContent>
          </Card>

          {participant.riskLevel && (
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge 
                  className={
                    participant.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                    participant.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }
                >
                  {participant.riskLevel.toUpperCase()} RISK
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}