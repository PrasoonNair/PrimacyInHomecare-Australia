import React from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, User, ClipboardCheck, DollarSign, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { WorkflowActionButtons } from '@/components/shared/workflow-action-buttons';

export default function StaffProfilePage() {
  const [, params] = useRoute('/staff/:id');
  const staffId = params?.id;

  const { data: staff, isLoading } = useQuery({
    queryKey: ['/api/staff', staffId],
    queryFn: async () => {
      const response = await fetch(`/api/staff/${staffId}`);
      if (!response.ok) throw new Error('Failed to fetch staff');
      return response.json();
    },
    enabled: !!staffId,
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

  if (!staff) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Staff Not Found</h1>
          <p className="text-gray-600 mt-2">The staff member you're looking for doesn't exist.</p>
          <Link href="/staff-directory">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Staff Directory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6" data-testid="staff-profile-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/staff-directory">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Directory
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900" data-testid="staff-name">
              {staff.name}
            </h1>
            <p className="text-gray-600">{staff.role} • {staff.department}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge className={staff.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
            {staff.status}
          </Badge>
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
                  <p className="text-gray-900">{staff.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900">{staff.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  <p className="text-gray-900">{staff.location || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Join Date</label>
                  <p className="text-gray-900">
                    {staff.joinDate ? new Date(staff.joinDate).toLocaleDateString() : 'Not available'}
                  </p>
                </div>
              </div>
              
              {staff.specializations && staff.specializations.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">Specializations</label>
                  <div className="flex flex-wrap gap-2">
                    {staff.specializations.map((spec: string, index: number) => (
                      <Badge key={index} variant="outline">{spec}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClipboardCheck className="h-5 w-5" />
                <span>Current Workload</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {staff.currentParticipants || 0}
                  </p>
                  <p className="text-sm text-gray-600">Current Participants</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {staff.maxCapacity || 0}
                  </p>
                  <p className="text-sm text-gray-600">Max Capacity</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {staff.rating?.toFixed(1) || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkflowActionButtons
                itemId={staff.id}
                itemType="staff"
                itemData={staff}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a href={`mailto:${staff.email}`} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="text-sm">{staff.email}</span>
              </a>
              
              {staff.phone && (
                <a href={`tel:${staff.phone}`} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{staff.phone}</span>
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}