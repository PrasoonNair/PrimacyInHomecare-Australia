import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface NdisPlanScannerProps {
  participantId?: string;
  onScanComplete?: (planData: any) => void;
}

interface ProcessingStep {
  step: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  message: string;
}

interface ExtractedPlanData {
  participantInfo: {
    firstName: string;
    lastName: string;
    ndisNumber: string;
    dateOfBirth: string;
    primaryDisability?: string;
  };
  planDetails: {
    planNumber: string;
    startDate: string;
    endDate: string;
    totalBudget: number;
    planManagementType: string;
  };
  goals: Array<{
    id: string;
    category: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High';
    targetDate?: string;
    estimatedCost?: number;
  }>;
  budgetBreakdown: {
    coreSupports: number;
    capacityBuilding: number;
    capitalSupports: number;
  };
}

export function NdisPlanScanner({ participantId, onScanComplete }: NdisPlanScannerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedPlanData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const initializeProcessingSteps = () => {
    setProcessingSteps([
      { step: 'upload', status: 'pending', message: 'Uploading document...' },
      { step: 'ocr', status: 'pending', message: 'Scanning document with OCR...' },
      { step: 'extract', status: 'pending', message: 'Extracting plan information...' },
      { step: 'goals', status: 'pending', message: 'Analyzing goals and objectives...' },
      { step: 'validate', status: 'pending', message: 'Validating extracted data...' },
      { step: 'save', status: 'pending', message: 'Saving plan data...' }
    ]);
  };

  const updateStep = (stepName: string, status: ProcessingStep['status'], message?: string) => {
    setProcessingSteps(prev => prev.map(step => 
      step.step === stepName 
        ? { ...step, status, message: message || step.message }
        : step
    ));
  };

  const scanPlanMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      initializeProcessingSteps();
      
      // Step 1: Upload
      updateStep('upload', 'processing');
      setProgress(10);
      
      const uploadResponse = await fetch('/api/ndis-plans/upload-scan', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }
      
      const uploadResult = await uploadResponse.json();
      updateStep('upload', 'complete');
      setProgress(20);
      
      // Step 2: OCR Processing
      updateStep('ocr', 'processing');
      const ocrResponse = await apiRequest('/api/ndis-plans/ocr-scan', {
        method: 'POST',
        body: JSON.stringify({ fileUrl: uploadResult.fileUrl })
      });
      updateStep('ocr', 'complete');
      setProgress(40);
      
      // Step 3: Extract Plan Information
      updateStep('extract', 'processing');
      const extractResponse = await apiRequest('/api/ndis-plans/extract-plan-data', {
        method: 'POST',
        body: JSON.stringify({ 
          ocrText: ocrResponse.extractedText,
          participantId 
        })
      });
      updateStep('extract', 'complete');
      setProgress(60);
      
      // Step 4: Analyze Goals
      updateStep('goals', 'processing');
      const goalsResponse = await apiRequest('/api/ndis-plans/analyze-goals', {
        method: 'POST',
        body: JSON.stringify({ 
          planText: ocrResponse.extractedText,
          planData: extractResponse.planData 
        })
      });
      updateStep('goals', 'complete');
      setProgress(80);
      
      // Step 5: Validate Data
      updateStep('validate', 'processing');
      const validationResponse = await apiRequest('/api/ndis-plans/validate-data', {
        method: 'POST',
        body: JSON.stringify({
          planData: extractResponse.planData,
          goals: goalsResponse.goals,
          participantId
        })
      });
      updateStep('validate', 'complete');
      setProgress(90);
      
      // Step 6: Save Complete Plan
      updateStep('save', 'processing');
      const saveResponse = await apiRequest('/api/ndis-plans/save-complete', {
        method: 'POST',
        body: JSON.stringify({
          participantId,
          planData: validationResponse.validatedPlanData,
          goals: validationResponse.validatedGoals,
          fileUrl: uploadResult.fileUrl
        })
      });
      updateStep('save', 'complete');
      setProgress(100);
      
      return {
        planData: validationResponse.validatedPlanData,
        goals: validationResponse.validatedGoals,
        planId: saveResponse.planId
      };
    },
    onSuccess: (data) => {
      setExtractedData(data.planData);
      toast({
        title: "NDIS Plan Scanned Successfully",
        description: `Extracted ${data.goals?.length || 0} goals and complete plan information.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ndis-plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/participants'] });
      onScanComplete?.(data);
    },
    onError: (error) => {
      setError(error.message);
      toast({
        title: "Scan Failed",
        description: error.message,
        variant: "destructive",
      });
      // Mark current processing step as error
      setProcessingSteps(prev => prev.map(step => 
        step.status === 'processing' 
          ? { ...step, status: 'error', message: error.message }
          : step
      ));
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        'application/pdf', 
        'image/jpeg', 
        'image/jpg',
        'image/png', 
        'image/tiff',
        'image/tif'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, JPEG, PNG, or TIFF file.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (20MB limit for plan documents)
      if (selectedFile.size > 20 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 20MB.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setExtractedData(null);
      setProgress(0);
      setProcessingSteps([]);
    }
  };

  const handleScan = () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    if (participantId) {
      formData.append('participantId', participantId);
    }
    
    scanPlanMutation.mutate(formData);
  };

  const resetScanner = () => {
    setFile(null);
    setExtractedData(null);
    setProgress(0);
    setProcessingSteps([]);
    setError(null);
    setIsProcessing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="w-full max-w-4xl" data-testid="ndis-plan-scanner">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <i className="fas fa-brain text-blue-600 text-xl"></i>
          </div>
          AI-Powered NDIS Plan Scanner
        </CardTitle>
        <CardDescription>
          Upload an NDIS plan document for intelligent OCR scanning, automated data extraction, and goal analysis using advanced AI processing.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* File Upload Section */}
        <div className="space-y-3">
          <Label htmlFor="plan-scanner-file" className="text-base font-medium">
            Select NDIS Plan Document
          </Label>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <i className="fas fa-file-upload text-blue-600 text-2xl"></i>
              </div>
              
              {!file ? (
                <div>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drag & drop or click to upload
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    PDF, JPEG, PNG, or TIFF files (max 20MB)
                  </p>
                  <Input
                    id="plan-scanner-file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif"
                    onChange={handleFileChange}
                    disabled={isProcessing}
                    className="hidden"
                    data-testid="input-plan-scanner-file"
                  />
                  <label htmlFor="plan-scanner-file">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>
                        <i className="fas fa-folder-open mr-2"></i>
                        Choose File
                      </span>
                    </Button>
                  </label>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-lg border max-w-md mx-auto">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-file-alt text-blue-600 text-2xl"></i>
                    <div className="text-left flex-1">
                      <p className="font-medium text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split('/')[1].toUpperCase()}
                      </p>
                    </div>
                    {!isProcessing && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={resetScanner}
                        data-testid="button-remove-file"
                      >
                        <i className="fas fa-times text-gray-400"></i>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Processing Progress */}
        {isProcessing && (
          <div className="space-y-4 bg-blue-50 p-6 rounded-lg border">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-blue-900">Processing NDIS Plan</h3>
              <span className="text-sm font-medium text-blue-700">{progress}%</span>
            </div>
            
            <Progress value={progress} className="h-3" />
            
            <div className="grid gap-3">
              {processingSteps.map((step, index) => (
                <div key={step.step} className="flex items-center gap-3 p-3 bg-white rounded-md">
                  <div className="flex-shrink-0">
                    {step.status === 'complete' && (
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-check text-green-600 text-xs"></i>
                      </div>
                    )}
                    {step.status === 'processing' && (
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-spinner fa-spin text-blue-600 text-xs"></i>
                      </div>
                    )}
                    {step.status === 'error' && (
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-exclamation-triangle text-red-600 text-xs"></i>
                      </div>
                    )}
                    {step.status === 'pending' && (
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-circle text-gray-400 text-xs"></i>
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium">{step.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && !isProcessing && (
          <Alert variant="destructive">
            <i className="fas fa-exclamation-triangle"></i>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Processing Failed</p>
                <p>{error}</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Extracted Data Preview */}
        {extractedData && !isProcessing && (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <i className="fas fa-check-circle text-green-600"></i>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium text-green-800">Plan scanned and processed successfully!</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Participant:</span> {extractedData.participantInfo?.firstName} {extractedData.participantInfo?.lastName}
                    </div>
                    <div>
                      <span className="font-medium">NDIS Number:</span> {extractedData.participantInfo?.ndisNumber}
                    </div>
                    <div>
                      <span className="font-medium">Plan Budget:</span> {formatCurrency(extractedData.planDetails?.totalBudget || 0)}
                    </div>
                    <div>
                      <span className="font-medium">Goals Found:</span> {extractedData.goals?.length || 0}
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Quick Goals Preview */}
            {extractedData.goals && extractedData.goals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Extracted Goals Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {extractedData.goals.slice(0, 3).map((goal, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium line-clamp-2">{goal.description}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {goal.category}
                              </Badge>
                              <Badge 
                                variant={goal.priority === 'High' ? 'destructive' : goal.priority === 'Medium' ? 'default' : 'outline'} 
                                className="text-xs"
                              >
                                {goal.priority}
                              </Badge>
                            </div>
                          </div>
                          {goal.estimatedCost && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-green-600">
                                {formatCurrency(goal.estimatedCost)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {extractedData.goals.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{extractedData.goals.length - 3} more goals extracted
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={handleScan} 
            disabled={!file || isProcessing}
            className="flex-1"
            data-testid="button-scan-plan"
          >
            {isProcessing ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Processing...
              </>
            ) : (
              <>
                <i className="fas fa-brain mr-2"></i>
                Scan & Extract Plan Data
              </>
            )}
          </Button>
          
          {extractedData && !isProcessing && (
            <Button 
              variant="outline" 
              onClick={resetScanner}
              data-testid="button-scan-another"
            >
              <i className="fas fa-plus mr-2"></i>
              Scan Another
            </Button>
          )}
        </div>

        {/* Features List */}
        <div className="text-xs text-gray-600 bg-gray-50 p-4 rounded-lg space-y-2">
          <p className="font-medium text-gray-800">Advanced AI Processing Features:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            <div>• OCR text extraction from documents and images</div>
            <div>• Intelligent NDIS plan structure recognition</div>
            <div>• Automated goal and objective identification</div>
            <div>• Budget category classification and mapping</div>
            <div>• Participant information extraction</div>
            <div>• Plan validity and compliance checking</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}