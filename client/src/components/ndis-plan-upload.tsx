import { useState } from "react";
import { Upload, FileText, Check, AlertCircle, Loader2, User, Calendar, DollarSign, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface ExtractedPlanData {
  participant: {
    firstName: string;
    lastName: string;
    ndisNumber: string;
    dateOfBirth: string;
    phone?: string;
    email?: string;
    address?: string;
    primaryDisability?: string;
    communicationNeeds?: string;
  };
  plan: {
    planNumber: string;
    startDate: string;
    endDate: string;
    totalBudget: string;
    planManagementType: string;
  };
  goals: Array<{
    category: string;
    description: string;
    priority: string;
    targetDate?: string;
  }>;
  fundingBreakdown: {
    coreSupports: string;
    capacityBuilding: string;
    capitalSupports: string;
  };
}

interface NdisPlanUploadProps {
  onDataExtracted?: (data: ExtractedPlanData) => void;
  participantId?: string;
}

export function NdisPlanUpload({ onDataExtracted, participantId }: NdisPlanUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedPlanData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setExtractedData(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProcessing(false);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      if (participantId) {
        formData.append('participantId', participantId);
      }

      const response = await fetch('/api/ndis-plans/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      setUploading(false);
      setProcessing(true);

      // Process and extract data
      const result = await response.json();
      
      if (result.extractedData) {
        setExtractedData(result.extractedData);
        if (onDataExtracted) {
          onDataExtracted(result.extractedData);
        }
        toast({
          title: "Success",
          description: "NDIS plan uploaded and data extracted successfully",
        });
      } else {
        throw new Error('Failed to extract data from plan');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      toast({
        title: "Error",
        description: "Failed to process NDIS plan",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload NDIS Plan</CardTitle>
          <CardDescription>
            Upload a participant's NDIS plan PDF to automatically extract and pre-populate their information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!file ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PDF files only (max 10MB)
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="plan-upload"
              />
              <label htmlFor="plan-upload">
                <Button variant="outline" className="mt-4" asChild>
                  <span>Select NDIS Plan PDF</span>
                </Button>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {!uploading && !processing && !extractedData && (
                  <Button onClick={handleUpload} className="bg-blue-600 hover:bg-blue-700">
                    Upload & Process
                  </Button>
                )}
              </div>

              {(uploading || processing) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{uploading ? 'Uploading...' : 'Processing plan...'}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                  {processing && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Extracting participant information and goals...</span>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {extractedData && (
                <div className="space-y-4">
                  <Alert className="bg-green-50 border-green-200">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Data successfully extracted from NDIS plan
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-4">
                    {/* Participant Information */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <User className="h-5 w-5 text-blue-500" />
                          <CardTitle className="text-lg">Participant Information</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Name:</span>
                            <p className="font-medium">
                              {extractedData.participant.firstName} {extractedData.participant.lastName}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">NDIS Number:</span>
                            <p className="font-medium">{extractedData.participant.ndisNumber}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Date of Birth:</span>
                            <p className="font-medium">
                              {format(new Date(extractedData.participant.dateOfBirth), 'dd/MM/yyyy')}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Primary Disability:</span>
                            <p className="font-medium">{extractedData.participant.primaryDisability || 'Not specified'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Plan Details */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5 text-green-500" />
                          <CardTitle className="text-lg">Plan Details</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Plan Number:</span>
                            <p className="font-medium">{extractedData.plan.planNumber}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Total Budget:</span>
                            <p className="font-medium text-green-600">
                              {formatCurrency(extractedData.plan.totalBudget)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Start Date:</span>
                            <p className="font-medium">
                              {format(new Date(extractedData.plan.startDate), 'dd/MM/yyyy')}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">End Date:</span>
                            <p className="font-medium">
                              {format(new Date(extractedData.plan.endDate), 'dd/MM/yyyy')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Funding Breakdown */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-5 w-5 text-yellow-500" />
                          <CardTitle className="text-lg">Funding Breakdown</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Core Supports</span>
                            <Badge variant="outline">
                              {formatCurrency(extractedData.fundingBreakdown.coreSupports)}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Capacity Building</span>
                            <Badge variant="outline">
                              {formatCurrency(extractedData.fundingBreakdown.capacityBuilding)}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Capital Supports</span>
                            <Badge variant="outline">
                              {formatCurrency(extractedData.fundingBreakdown.capitalSupports)}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Goals */}
                    {extractedData.goals.length > 0 && (
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center space-x-2">
                            <Target className="h-5 w-5 text-purple-500" />
                            <CardTitle className="text-lg">Participant Goals</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {extractedData.goals.map((goal, index) => (
                              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{goal.description}</p>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Badge variant="secondary" className="text-xs">
                                        {goal.category}
                                      </Badge>
                                      <Badge 
                                        variant={goal.priority === 'High' ? 'destructive' : 'outline'} 
                                        className="text-xs"
                                      >
                                        {goal.priority} Priority
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFile(null);
                        setExtractedData(null);
                        setUploadProgress(0);
                      }}
                    >
                      Upload Another Plan
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Check className="h-4 w-4 mr-2" />
                      Use This Data
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}