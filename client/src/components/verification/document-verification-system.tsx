import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Scan, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  Clock,
  Shield,
  Database,
  Search,
  AlertCircle,
  Upload,
  Download,
  RefreshCw
} from 'lucide-react';

interface VerificationResult {
  id: string;
  documentId: string;
  documentType: string;
  applicantName: string;
  uploadedAt: string;
  verificationStatus: 'pending' | 'processing' | 'verified' | 'discrepancy_found' | 'failed';
  ocrConfidence: number;
  extractedData: Record<string, any>;
  crossReferenceResults: Array<{
    department: string;
    field: string;
    documentValue: string;
    systemValue: string;
    match: boolean;
    confidence: number;
  }>;
  discrepancies: Array<{
    field: string;
    documentValue: string;
    systemValue: string;
    severity: 'low' | 'medium' | 'high';
    department: string;
  }>;
  alertsGenerated: boolean;
}

interface DocumentUpload {
  id: string;
  fileName: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  size: number;
  verificationStatus: string;
}

export function DocumentVerificationSystem() {
  const [selectedVerification, setSelectedVerification] = useState<VerificationResult | null>(null);
  const [showVerificationDetail, setShowVerificationDetail] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const { toast } = useToast();

  // Fetch verification results
  const { data: verifications = [] } = useQuery<VerificationResult[]>({
    queryKey: ['/api/verification/results'],
    queryFn: () => apiRequest('/api/verification/results')
  });

  // Fetch recent uploads
  const { data: uploads = [] } = useQuery<DocumentUpload[]>({
    queryKey: ['/api/verification/uploads'],
    queryFn: () => apiRequest('/api/verification/uploads')
  });

  // Upload and verify document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: (formData: FormData) =>
      apiRequest('/api/verification/upload-document', {
        method: 'POST',
        body: formData
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/verification/uploads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/verification/results'] });
      setUploadingFiles([]);
      toast({
        title: "Document Uploaded",
        description: "Document uploaded successfully and verification started.",
      });
    }
  });

  // Reprocess verification mutation
  const reprocessVerificationMutation = useMutation({
    mutationFn: (verificationId: string) =>
      apiRequest(`/api/verification/reprocess/${verificationId}`, {
        method: 'POST'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/verification/results'] });
      toast({
        title: "Reprocessing Started",
        description: "Document verification has been restarted.",
      });
    }
  });

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    setUploadingFiles(fileArray);
    
    fileArray.forEach(file => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', getDocumentType(file.name));
      uploadDocumentMutation.mutate(formData);
    });
  };

  const getDocumentType = (fileName: string): string => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.includes('resume') || lowerName.includes('cv')) return 'resume';
    if (lowerName.includes('license') || lowerName.includes('licence')) return 'drivers_license';
    if (lowerName.includes('ndis') || lowerName.includes('screening')) return 'ndis_screening';
    if (lowerName.includes('certificate') || lowerName.includes('qualification')) return 'qualification';
    return 'other';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'discrepancy_found': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const pendingVerifications = verifications.filter(v => v.verificationStatus === 'pending' || v.verificationStatus === 'processing');
  const discrepancyCount = verifications.filter(v => v.verificationStatus === 'discrepancy_found').length;
  const verifiedCount = verifications.filter(v => v.verificationStatus === 'verified').length;

  return (
    <div className="space-y-6" data-testid="document-verification-system">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Scan className="h-5 w-5" />
            <span>Document Verification & Cross-Reference System</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-600">{pendingVerifications.length}</div>
              <p className="text-sm text-gray-600">Processing</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-600">{verifiedCount}</div>
              <p className="text-sm text-gray-600">Verified</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-red-50">
              <div className="text-2xl font-bold text-red-600">{discrepancyCount}</div>
              <p className="text-sm text-gray-600">Discrepancies</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-purple-50">
              <div className="text-2xl font-bold text-purple-600">{verifications.length}</div>
              <p className="text-sm text-gray-600">Total Processed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Documents for Verification</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-semibold text-gray-700 mb-2">
              Upload Documents for Automatic Verification
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports: PDF, JPG, PNG files (Resume, License, Certificates, NDIS Screening)
            </p>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="document-upload"
            />
            <label htmlFor="document-upload">
              <Button
                disabled={uploadDocumentMutation.isPending}
                className="cursor-pointer"
                asChild
                data-testid="button-upload-documents"
              >
                <span>
                  {uploadDocumentMutation.isPending ? 'Uploading...' : 'Choose Files'}
                </span>
              </Button>
            </label>
            
            {uploadingFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadingFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <Alert className="mt-4">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Documents are automatically scanned using OCR technology and cross-referenced against existing department data. 
              Discrepancies trigger immediate alerts to relevant departments.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Verification Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Verification Results</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/verification/results'] })}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {verifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Scan className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No verification results yet</p>
              <p className="text-sm">Upload documents to begin verification process</p>
            </div>
          ) : (
            <div className="space-y-3">
              {verifications.map((verification) => (
                <div 
                  key={verification.id} 
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    verification.verificationStatus === 'discrepancy_found' ? 'border-red-200 bg-red-50' : ''
                  }`}
                  onClick={() => {
                    setSelectedVerification(verification);
                    setShowVerificationDetail(true);
                  }}
                  data-testid={`verification-${verification.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <h4 className="font-semibold">{verification.applicantName}</h4>
                        <Badge className={getStatusColor(verification.verificationStatus)}>
                          {verification.verificationStatus.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {verification.verificationStatus === 'discrepancy_found' && (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {verification.discrepancies.length} Issues
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Document Type:</strong> {verification.documentType}</p>
                        <p><strong>OCR Confidence:</strong> {verification.ocrConfidence}%</p>
                        <p><strong>Processed:</strong> {new Date(verification.uploadedAt).toLocaleString()}</p>
                        
                        {verification.discrepancies.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium text-red-600">Discrepancies Found:</p>
                            <div className="space-y-1">
                              {verification.discrepancies.slice(0, 2).map((disc, index) => (
                                <div key={index} className="text-xs bg-red-100 p-2 rounded">
                                  <span className={`font-medium ${getSeverityColor(disc.severity)}`}>
                                    {disc.field}:
                                  </span> {disc.documentValue} ≠ {disc.systemValue}
                                </div>
                              ))}
                              {verification.discrepancies.length > 2 && (
                                <p className="text-xs text-gray-500">
                                  +{verification.discrepancies.length - 2} more discrepancies
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {verification.verificationStatus === 'processing' && (
                        <div className="flex items-center text-blue-600">
                          <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                          <span className="text-sm">Processing...</span>
                        </div>
                      )}
                      
                      {verification.verificationStatus === 'failed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            reprocessVerificationMutation.mutate(verification.id);
                          }}
                          data-testid={`button-reprocess-${verification.id}`}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Retry
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVerification(verification);
                          setShowVerificationDetail(true);
                        }}
                        data-testid={`button-view-${verification.id}`}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                  
                  {verification.verificationStatus === 'processing' && (
                    <div className="mt-3">
                      <Progress value={75} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        OCR extraction and cross-reference in progress...
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Detail Dialog */}
      <Dialog open={showVerificationDetail} onOpenChange={setShowVerificationDetail}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Verification Details - {selectedVerification?.applicantName}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedVerification && (
            <div className="space-y-6">
              {/* Status and Summary */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Verification Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className={getStatusColor(selectedVerification.verificationStatus)}>
                      {selectedVerification.verificationStatus.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-2">
                      OCR Confidence: {selectedVerification.ocrConfidence}%
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Cross-Reference Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Verified:</span> {selectedVerification.crossReferenceResults.filter(r => r.match).length}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Discrepancies:</span> {selectedVerification.discrepancies.length}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Alerts Generated:</span> {selectedVerification.alertsGenerated ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Extracted Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Extracted Data (OCR)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedVerification.extractedData).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <p className="text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/_/g, ' ')}:
                        </p>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cross-Reference Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Department Cross-Reference</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedVerification.crossReferenceResults.map((result, index) => (
                      <div 
                        key={index} 
                        className={`p-3 border rounded-lg ${
                          result.match ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant="outline">{result.department}</Badge>
                              <Badge variant={result.match ? "default" : "destructive"}>
                                {result.match ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                                {result.match ? 'Match' : 'Mismatch'}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium">{result.field}</p>
                            <div className="text-xs text-gray-600 mt-1">
                              <p><strong>Document:</strong> {result.documentValue}</p>
                              <p><strong>System:</strong> {result.systemValue}</p>
                              <p><strong>Confidence:</strong> {result.confidence}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Discrepancies and Actions */}
              {selectedVerification.discrepancies.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600">
                      <AlertTriangle className="h-5 w-5 inline mr-2" />
                      Discrepancies Requiring Attention
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedVerification.discrepancies.map((disc, index) => (
                        <Alert key={index} className="border-red-200">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{disc.field}</span>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline">{disc.department}</Badge>
                                  <Badge variant={disc.severity === 'high' ? 'destructive' : 'secondary'}>
                                    {disc.severity.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-sm">
                                <p><strong>Document shows:</strong> {disc.documentValue}</p>
                                <p><strong>System has:</strong> {disc.systemValue}</p>
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowVerificationDetail(false)}>
                  Close
                </Button>
                {selectedVerification.verificationStatus === 'failed' && (
                  <Button
                    onClick={() => {
                      reprocessVerificationMutation.mutate(selectedVerification.id);
                      setShowVerificationDetail(false);
                    }}
                    data-testid="button-reprocess-verification"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reprocess Verification
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}