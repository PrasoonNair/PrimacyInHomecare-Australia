import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  GraduationCap, 
  PlayCircle, 
  CheckCircle, 
  Clock, 
  FileText,
  Award,
  Calendar,
  Book,
  Video,
  Target,
  Users
} from 'lucide-react';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'document' | 'assessment' | 'interactive';
  duration: number; // minutes
  mandatory: boolean;
  category: 'onboarding' | 'ndis_compliance' | 'safety' | 'professional_development';
  prerequisites: string[];
  completionRate: number;
  dueDate?: string;
}

interface UserProgress {
  moduleId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  progress: number;
  completedAt?: string;
  score?: number;
  timeSpent: number;
}

interface TrainingPathway {
  id: string;
  name: string;
  description: string;
  modules: string[];
  estimatedDuration: number;
  category: string;
  mandatory: boolean;
}

export function StaffTrainingModules({ staffId, isApplicant = false }: { staffId?: string; isApplicant?: boolean }) {
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [showModuleDetail, setShowModuleDetail] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { toast } = useToast();

  // Fetch training modules
  const { data: modules = [] } = useQuery<TrainingModule[]>({
    queryKey: ['/api/training/modules'],
    queryFn: () => apiRequest('/api/training/modules')
  });

  // Fetch user progress
  const { data: userProgress = [] } = useQuery<UserProgress[]>({
    queryKey: ['/api/training/progress', staffId],
    queryFn: () => apiRequest(`/api/training/progress/${staffId || 'current'}`),
    enabled: !!staffId || isApplicant
  });

  // Fetch training pathways
  const { data: pathways = [] } = useQuery<TrainingPathway[]>({
    queryKey: ['/api/training/pathways'],
    queryFn: () => apiRequest('/api/training/pathways')
  });

  // Start module mutation
  const startModuleMutation = useMutation({
    mutationFn: (moduleId: string) =>
      apiRequest('/api/training/start-module', {
        method: 'POST',
        body: JSON.stringify({ moduleId, staffId: staffId || 'current' })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/training/progress'] });
      toast({
        title: "Module Started",
        description: "Training module has been started successfully.",
      });
    }
  });

  // Complete module mutation
  const completeModuleMutation = useMutation({
    mutationFn: ({ moduleId, score }: { moduleId: string; score?: number }) =>
      apiRequest('/api/training/complete-module', {
        method: 'POST',
        body: JSON.stringify({ moduleId, staffId: staffId || 'current', score })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/training/progress'] });
      toast({
        title: "Module Completed",
        description: "Congratulations! You have completed the training module.",
      });
    }
  });

  const getModuleProgress = (moduleId: string): UserProgress | undefined => {
    return userProgress.find(p => p.moduleId === moduleId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <PlayCircle className="h-4 w-4 text-blue-600" />;
      case 'overdue': return <Clock className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'assessment': return <Target className="h-4 w-4" />;
      case 'interactive': return <Users className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredModules = modules.filter(module => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'mandatory') return module.mandatory;
    return module.category === activeCategory;
  });

  const overallProgress = userProgress.length > 0 
    ? Math.round((userProgress.filter(p => p.status === 'completed').length / userProgress.length) * 100)
    : 0;

  const mandatoryProgress = userProgress.length > 0
    ? Math.round((userProgress.filter(p => {
        const module = modules.find(m => m.id === p.moduleId);
        return module?.mandatory && p.status === 'completed';
      }).length / modules.filter(m => m.mandatory).length) * 100)
    : 0;

  return (
    <div className="space-y-6" data-testid="staff-training-modules">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5" />
            <span>{isApplicant ? 'Onboarding Training' : 'Staff Training & Development'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-600">{overallProgress}%</div>
              <p className="text-sm text-gray-600">Overall Progress</p>
              <Progress value={overallProgress} className="mt-2" />
            </div>
            <div className="text-center p-4 border rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-600">{mandatoryProgress}%</div>
              <p className="text-sm text-gray-600">Mandatory Training</p>
              <Progress value={mandatoryProgress} className="mt-2" />
            </div>
            <div className="text-center p-4 border rounded-lg bg-purple-50">
              <div className="text-2xl font-bold text-purple-600">
                {userProgress.filter(p => p.status === 'completed').length}
              </div>
              <p className="text-sm text-gray-600">Modules Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All Modules</TabsTrigger>
          <TabsTrigger value="mandatory">Mandatory</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="ndis_compliance">NDIS Compliance</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
          <TabsTrigger value="professional_development">Development</TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="space-y-4">
          {/* Training Pathways */}
          {activeCategory === 'all' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Book className="h-5 w-5" />
                  <span>Recommended Learning Pathways</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pathways.map((pathway) => (
                    <div key={pathway.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{pathway.name}</h4>
                        {pathway.mandatory && (
                          <Badge variant="destructive">Mandatory</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{pathway.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          {pathway.modules.length} modules • {pathway.estimatedDuration} min
                        </span>
                        <Button size="sm" variant="outline">
                          Start Pathway
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Training Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModules.map((module) => {
              const progress = getModuleProgress(module.id);
              const isCompleted = progress?.status === 'completed';
              const isInProgress = progress?.status === 'in_progress';
              const isOverdue = progress?.status === 'overdue';

              return (
                <Card 
                  key={module.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isCompleted ? 'border-green-200 bg-green-50' : 
                    isOverdue ? 'border-red-200 bg-red-50' : ''
                  }`}
                  onClick={() => {
                    setSelectedModule(module);
                    setShowModuleDetail(true);
                  }}
                  data-testid={`module-${module.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(module.type)}
                        <span className="text-sm text-gray-500 capitalize">{module.type}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(progress?.status || 'not_started')}
                        {module.mandatory && (
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {module.description}
                    </p>
                    
                    {progress && progress.progress > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{progress.progress}%</span>
                        </div>
                        <Progress value={progress.progress} />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {module.duration} min
                      </span>
                      {progress?.score && (
                        <span className="flex items-center">
                          <Award className="h-3 w-3 mr-1" />
                          {progress.score}%
                        </span>
                      )}
                    </div>

                    {module.dueDate && (
                      <div className="flex items-center text-sm text-orange-600 mb-3">
                        <Calendar className="h-3 w-3 mr-1" />
                        Due: {new Date(module.dueDate).toLocaleDateString()}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {!progress || progress.status === 'not_started' ? (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            startModuleMutation.mutate(module.id);
                          }}
                          disabled={startModuleMutation.isPending}
                          data-testid={`button-start-${module.id}`}
                        >
                          <PlayCircle className="h-3 w-3 mr-1" />
                          Start
                        </Button>
                      ) : progress.status === 'in_progress' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Continue module logic
                          }}
                        >
                          Continue
                        </Button>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredModules.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <GraduationCap className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No training modules found for this category</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Module Detail Dialog */}
      <Dialog open={showModuleDetail} onOpenChange={setShowModuleDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedModule && getTypeIcon(selectedModule.type)}
              <span>{selectedModule?.title}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedModule && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {selectedModule.duration} minutes
                </span>
                <span className="capitalize">{selectedModule.type}</span>
                {selectedModule.mandatory && (
                  <Badge variant="destructive">Mandatory</Badge>
                )}
              </div>

              <p className="text-gray-700">{selectedModule.description}</p>

              {selectedModule.prerequisites.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Prerequisites:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {selectedModule.prerequisites.map((prereq, index) => (
                      <li key={index}>{prereq}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">What you'll learn:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• NDIS Quality and Safeguards standards</li>
                  <li>• Person-centered support approaches</li>
                  <li>• Risk assessment and management</li>
                  <li>• Documentation and reporting requirements</li>
                </ul>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={() => {
                    startModuleMutation.mutate(selectedModule.id);
                    setShowModuleDetail(false);
                  }}
                  disabled={startModuleMutation.isPending}
                  data-testid="button-start-module"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Module
                </Button>
                <Button variant="outline" onClick={() => setShowModuleDetail(false)}>
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