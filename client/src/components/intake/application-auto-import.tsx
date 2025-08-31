import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Globe, 
  Download, 
  CheckCircle, 
  RefreshCw, 
  AlertCircle,
  Settings,
  Zap,
  Clock,
  Users,
  FileText,
  Filter,
  Play,
  Pause,
  Activity
} from 'lucide-react';

interface WebsiteApplication {
  id: string;
  websiteSource: string;
  applicantName: string;
  email: string;
  phone: string;
  position: string;
  submittedAt: string;
  status: 'pending_import' | 'imported' | 'screening' | 'processed' | 'failed';
  documents: Array<{
    name: string;
    type: string;
    url: string;
    size: number;
  }>;
  applicationData: Record<string, any>;
  autoImported: boolean;
  screeningStarted: boolean;
}

interface ImportConfiguration {
  enabled: boolean;
  websiteUrls: string[];
  autoScreening: boolean;
  notificationEmails: string[];
  filterCriteria: {
    requiredFields: string[];
    minimumDocuments: number;
    excludeKeywords: string[];
  };
}

export function ApplicationAutoImport() {
  const [showSettings, setShowSettings] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<WebsiteApplication | null>(null);
  const [showApplicationDetail, setShowApplicationDetail] = useState(false);
  const { toast } = useToast();

  // Fetch pending website applications
  const { data: applications = [] } = useQuery<WebsiteApplication[]>({
    queryKey: ['/api/intake/website-applications'],
    queryFn: () => apiRequest('/api/intake/website-applications'),
    refetchInterval: 30000 // Poll every 30 seconds for new applications
  });

  // Fetch import configuration
  const { data: config } = useQuery<ImportConfiguration>({
    queryKey: ['/api/intake/import-config'],
    queryFn: () => apiRequest('/api/intake/import-config')
  });

  // Import application mutation
  const importApplicationMutation = useMutation({
    mutationFn: (applicationId: string) =>
      apiRequest('/api/intake/import-application', {
        method: 'POST',
        body: JSON.stringify({ applicationId })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/intake/website-applications'] });
      toast({
        title: "Application Imported",
        description: "Application has been imported and screening started.",
      });
    }
  });

  // Bulk import mutation
  const bulkImportMutation = useMutation({
    mutationFn: (applicationIds: string[]) =>
      apiRequest('/api/intake/bulk-import', {
        method: 'POST',
        body: JSON.stringify({ applicationIds })
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/intake/website-applications'] });
      toast({
        title: "Bulk Import Complete",
        description: `${data.imported} applications imported successfully.`,
      });
    }
  });

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: (newConfig: Partial<ImportConfiguration>) =>
      apiRequest('/api/intake/update-import-config', {
        method: 'POST',
        body: JSON.stringify(newConfig)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/intake/import-config'] });
      toast({
        title: "Configuration Updated",
        description: "Auto-import settings have been saved.",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_import': return 'bg-yellow-100 text-yellow-800';
      case 'imported': return 'bg-blue-100 text-blue-800';
      case 'screening': return 'bg-purple-100 text-purple-800';
      case 'processed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingApplications = applications.filter(app => app.status === 'pending_import');
  const processingApplications = applications.filter(app => ['imported', 'screening'].includes(app.status));
  const completedApplications = applications.filter(app => app.status === 'processed');

  // Real-time notification effect
  useEffect(() => {
    const prevCount = localStorage.getItem('prevApplicationCount');
    const currentCount = pendingApplications.length.toString();
    
    if (prevCount && parseInt(prevCount) < pendingApplications.length) {
      toast({
        title: "New Application Received",
        description: `${pendingApplications.length - parseInt(prevCount)} new application(s) from website`,
      });
    }
    
    localStorage.setItem('prevApplicationCount', currentCount);
  }, [pendingApplications.length, toast]);

  return (
    <div className="space-y-6" data-testid="application-auto-import">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Website Application Auto-Import</span>
              <Badge variant={config?.enabled ? "default" : "secondary"}>
                {config?.enabled ? (
                  <>
                    <Activity className="h-3 w-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <Pause className="h-3 w-3 mr-1" />
                    Inactive
                  </>
                )}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                data-testid="button-settings"
              >
                <Settings className="h-3 w-3 mr-1" />
                Settings
              </Button>
              {pendingApplications.length > 0 && (
                <Button
                  size="sm"
                  onClick={() => bulkImportMutation.mutate(pendingApplications.map(app => app.id))}
                  disabled={bulkImportMutation.isPending}
                  data-testid="button-bulk-import"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Import All ({pendingApplications.length})
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg bg-yellow-50">
              <div className="text-2xl font-bold text-yellow-600">{pendingApplications.length}</div>
              <p className="text-sm text-gray-600">Pending Import</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-600">{processingApplications.length}</div>
              <p className="text-sm text-gray-600">Processing</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-600">{completedApplications.length}</div>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-purple-50">
              <div className="text-2xl font-bold text-purple-600">{applications.length}</div>
              <p className="text-sm text-gray-600">Total Today</p>
            </div>
          </div>

          {config?.enabled && (
            <Alert className="mt-4">
              <Zap className="h-4 w-4" />
              <AlertDescription>
                Auto-import is active for {config.websiteUrls.length} website(s). 
                {config.autoScreening && " Auto-screening is enabled."}
                New applications will be automatically imported every 5 minutes.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Website Applications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Website Applications</span>
            <Badge variant="outline">{applications.length} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Globe className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No website applications</p>
              <p className="text-sm">Applications from your website will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((application) => (
                <div 
                  key={application.id} 
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    application.status === 'pending_import' ? 'border-yellow-200 bg-yellow-50' : ''
                  }`}
                  onClick={() => {
                    setSelectedApplication(application);
                    setShowApplicationDetail(true);
                  }}
                  data-testid={`application-${application.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold">{application.applicantName}</h4>
                        <Badge className={getStatusColor(application.status)}>
                          {application.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {application.autoImported && (
                          <Badge variant="outline">
                            <Zap className="h-3 w-3 mr-1" />
                            Auto-Imported
                          </Badge>
                        )}
                        {application.screeningStarted && (
                          <Badge variant="secondary">
                            <Filter className="h-3 w-3 mr-1" />
                            Screening
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Position:</strong> {application.position}</p>
                        <p><strong>Email:</strong> {application.email}</p>
                        <p><strong>Source:</strong> {application.websiteSource}</p>
                        <p><strong>Submitted:</strong> {new Date(application.submittedAt).toLocaleString()}</p>
                        <p><strong>Documents:</strong> {application.documents.length} files</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {application.status === 'pending_import' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            importApplicationMutation.mutate(application.id);
                          }}
                          disabled={importApplicationMutation.isPending}
                          data-testid={`button-import-${application.id}`}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Import
                        </Button>
                      )}
                      
                      {application.status === 'screening' && (
                        <div className="flex items-center text-blue-600">
                          <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                          <span className="text-sm">Screening...</span>
                        </div>
                      )}
                      
                      {application.status === 'processed' && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Auto-Import Configuration</DialogTitle>
          </DialogHeader>
          
          {config && (
            <div className="space-y-6">
              {/* Enable/Disable */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(enabled) => updateConfigMutation.mutate({ enabled })}
                />
                <Label>Enable automatic application import</Label>
              </div>

              {/* Website URLs */}
              <div className="space-y-2">
                <Label>Monitor Website URLs</Label>
                <div className="space-y-2">
                  {config.websiteUrls.map((url, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input value={url} disabled className="flex-1" />
                      <Button size="sm" variant="outline">Remove</Button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline">Add Website</Button>
                </div>
              </div>

              {/* Auto-screening */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.autoScreening}
                  onCheckedChange={(autoScreening) => updateConfigMutation.mutate({ autoScreening })}
                />
                <Label>Automatically start screening for imported applications</Label>
              </div>

              {/* Filter Criteria */}
              <div className="space-y-4">
                <h4 className="font-semibold">Import Filters</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Minimum Documents Required</Label>
                    <Input 
                      type="number" 
                      value={config.filterCriteria.minimumDocuments}
                      onChange={(e) => updateConfigMutation.mutate({
                        filterCriteria: {
                          ...config.filterCriteria,
                          minimumDocuments: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label>Required Fields</Label>
                    <Input 
                      placeholder="email, phone, experience"
                      value={config.filterCriteria.requiredFields.join(', ')}
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="space-y-2">
                <Label>Notification Emails</Label>
                <Input 
                  placeholder="hr@company.com, manager@company.com"
                  value={config.notificationEmails.join(', ')}
                  disabled
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={() => {
                    updateConfigMutation.mutate(config);
                    setShowSettings(false);
                  }}
                  disabled={updateConfigMutation.isPending}
                >
                  Save Configuration
                </Button>
                <Button variant="outline" onClick={() => setShowSettings(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Application Detail Dialog */}
      <Dialog open={showApplicationDetail} onOpenChange={setShowApplicationDetail}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Application Details - {selectedApplication?.applicantName}</DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Applicant Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedApplication.applicantName}</p>
                    <p><strong>Email:</strong> {selectedApplication.email}</p>
                    <p><strong>Phone:</strong> {selectedApplication.phone}</p>
                    <p><strong>Position:</strong> {selectedApplication.position}</p>
                    <p><strong>Website:</strong> {selectedApplication.websiteSource}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Import Status</h4>
                  <div className="space-y-2">
                    <Badge className={getStatusColor(selectedApplication.status)}>
                      {selectedApplication.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <p className="text-sm text-gray-600">
                      Submitted: {new Date(selectedApplication.submittedAt).toLocaleString()}
                    </p>
                    {selectedApplication.autoImported && (
                      <p className="text-sm text-green-600">Automatically imported</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Documents ({selectedApplication.documents.length})</h4>
                <div className="space-y-2">
                  {selectedApplication.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{doc.name}</span>
                        <Badge variant="outline">{doc.type}</Badge>
                      </div>
                      <span className="text-xs text-gray-500">{(doc.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                {selectedApplication.status === 'pending_import' && (
                  <Button
                    onClick={() => {
                      importApplicationMutation.mutate(selectedApplication.id);
                      setShowApplicationDetail(false);
                    }}
                    disabled={importApplicationMutation.isPending}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Import Application
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowApplicationDetail(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}