import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  Calendar, 
  CheckCircle,
  AlertCircle,
  Download,
  Trash2,
  RefreshCw,
  DollarSign,
  Users,
  Building,
  Eye
} from 'lucide-react';

interface PriceGuideDocument {
  id: string;
  documentType: 'schads' | 'ndis';
  title: string;
  version: string;
  effectiveDate: string;
  uploadDate: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  isActive: boolean;
  uploadedBy: string;
  description?: string;
  ratesExtracted?: boolean;
  extractedRatesCount?: number;
}

export function PriceGuideManager() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<'schads' | 'ndis'>('schads');
  const [version, setVersion] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Fetch price guide documents
  const { data: priceGuides = [], refetch } = useQuery<PriceGuideDocument[]>({
    queryKey: ['/api/price-guides'],
    queryFn: () => apiRequest('/api/price-guides')
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setUploading(true);
      return apiRequest('/api/price-guides/upload', {
        method: 'POST',
        body: formData
      });
    },
    onSuccess: (data) => {
      setUploading(false);
      setSelectedFile(null);
      setVersion('');
      setEffectiveDate('');
      setDescription('');
      queryClient.invalidateQueries({ queryKey: ['/api/price-guides'] });
      toast({
        title: "Upload Successful",
        description: `${documentType.toUpperCase()} price guide uploaded successfully. ${data.ratesExtracted ? `${data.extractedRatesCount} rates extracted.` : 'Manual rate extraction required.'}`,
      });
    },
    onError: (error) => {
      setUploading(false);
      toast({
        title: "Upload Failed",
        description: "Failed to upload price guide document. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Activate document mutation
  const activateMutation = useMutation({
    mutationFn: (documentId: string) =>
      apiRequest(`/api/price-guides/${documentId}/activate`, {
        method: 'POST'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/price-guides'] });
      toast({
        title: "Document Activated",
        description: "Price guide is now active and rates have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Activation Failed",
        description: "Failed to activate price guide document.",
        variant: "destructive"
      });
    }
  });

  // Extract rates mutation
  const extractRatesMutation = useMutation({
    mutationFn: (documentId: string) =>
      apiRequest(`/api/price-guides/${documentId}/extract-rates`, {
        method: 'POST'
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/price-guides'] });
      toast({
        title: "Rates Extracted",
        description: `Successfully extracted ${data.extractedRatesCount} rates from the document.`,
      });
    },
    onError: () => {
      toast({
        title: "Extraction Failed",
        description: "Failed to extract rates from the document.",
        variant: "destructive"
      });
    }
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: (documentId: string) =>
      apiRequest(`/api/price-guides/${documentId}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/price-guides'] });
      toast({
        title: "Document Deleted",
        description: "Price guide document has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete price guide document.",
        variant: "destructive"
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload PDF or Excel files only.",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 50MB.",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !version || !effectiveDate) {
      toast({
        title: "Missing Information",
        description: "Please select a file, enter version, and set effective date.",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('documentType', documentType);
    formData.append('version', version);
    formData.append('effectiveDate', effectiveDate);
    formData.append('description', description);

    uploadMutation.mutate(formData);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const schadGuides = priceGuides.filter(guide => guide.documentType === 'schads');
  const ndisGuides = priceGuides.filter(guide => guide.documentType === 'ndis');

  return (
    <div className="space-y-6" data-testid="price-guide-manager">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>SCHADS & NDIS Price Guide Management</span>
            <Badge variant="outline">Master Documents</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Upload and manage master copies of SCHADS Award and NDIS Price Guide documents. 
              The system will automatically extract rates and update calculations when documents are activated.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload New Price Guide</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="document-type">Document Type</Label>
              <Select value={documentType} onValueChange={(value: 'schads' | 'ndis') => setDocumentType(value)}>
                <SelectTrigger data-testid="select-document-type">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="schads">SCHADS Award Rates</SelectItem>
                  <SelectItem value="ndis">NDIS Price Guide</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="e.g., 2024.1, v3.2"
                data-testid="input-version"
              />
            </div>

            <div>
              <Label htmlFor="effective-date">Effective Date</Label>
              <Input
                id="effective-date"
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                data-testid="input-effective-date"
              />
            </div>

            <div>
              <Label htmlFor="file-upload">Select File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,.xlsx,.xls"
                onChange={handleFileSelect}
                data-testid="input-file-upload"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description of changes or notes"
              data-testid="input-description"
            />
          </div>

          {selectedFile && (
            <div className="p-4 bg-blue-50 rounded border">
              <h4 className="font-semibold mb-2">Selected File</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><strong>Name:</strong> {selectedFile.name}</p>
                <p><strong>Size:</strong> {formatFileSize(selectedFile.size)}</p>
                <p><strong>Type:</strong> {selectedFile.type}</p>
                <p><strong>Last Modified:</strong> {new Date(selectedFile.lastModified).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          <Button 
            onClick={handleUpload}
            disabled={uploading || !selectedFile || !version || !effectiveDate}
            className="w-full"
            data-testid="button-upload"
          >
            {uploading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Uploading & Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Price Guide
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SCHADS Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>SCHADS Award Documents</span>
              <Badge variant="secondary">{schadGuides.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schadGuides.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No SCHADS documents uploaded</p>
                  <p className="text-sm">Upload award documents to manage staff rates</p>
                </div>
              ) : (
                schadGuides.map(guide => (
                  <div key={guide.id} className="border rounded p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{guide.title}</h4>
                        <p className="text-sm text-gray-600">Version {guide.version}</p>
                      </div>
                      {guide.isActive && (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><strong>Effective:</strong> {new Date(guide.effectiveDate).toLocaleDateString()}</p>
                      <p><strong>Uploaded:</strong> {new Date(guide.uploadDate).toLocaleDateString()}</p>
                      <p><strong>File Size:</strong> {formatFileSize(guide.fileSize)}</p>
                      <p><strong>Rates Extracted:</strong> {guide.ratesExtracted ? `${guide.extractedRatesCount} rates` : 'Manual required'}</p>
                    </div>

                    {guide.description && (
                      <p className="text-sm text-gray-600 italic">{guide.description}</p>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" variant="outline" asChild>
                        <a href={guide.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </a>
                      </Button>

                      <Button size="sm" variant="outline" asChild>
                        <a href={guide.fileUrl} download={guide.fileName}>
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </a>
                      </Button>

                      {!guide.ratesExtracted && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => extractRatesMutation.mutate(guide.id)}
                          disabled={extractRatesMutation.isPending}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Extract Rates
                        </Button>
                      )}

                      {!guide.isActive && (
                        <Button
                          size="sm"
                          onClick={() => activateMutation.mutate(guide.id)}
                          disabled={activateMutation.isPending}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Activate
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(guide.id)}
                        disabled={deleteMutation.isPending || guide.isActive}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* NDIS Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>NDIS Price Guide Documents</span>
              <Badge variant="secondary">{ndisGuides.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ndisGuides.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No NDIS documents uploaded</p>
                  <p className="text-sm">Upload price guides to manage service rates</p>
                </div>
              ) : (
                ndisGuides.map(guide => (
                  <div key={guide.id} className="border rounded p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{guide.title}</h4>
                        <p className="text-sm text-gray-600">Version {guide.version}</p>
                      </div>
                      {guide.isActive && (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><strong>Effective:</strong> {new Date(guide.effectiveDate).toLocaleDateString()}</p>
                      <p><strong>Uploaded:</strong> {new Date(guide.uploadDate).toLocaleDateString()}</p>
                      <p><strong>File Size:</strong> {formatFileSize(guide.fileSize)}</p>
                      <p><strong>Rates Extracted:</strong> {guide.ratesExtracted ? `${guide.extractedRatesCount} rates` : 'Manual required'}</p>
                    </div>

                    {guide.description && (
                      <p className="text-sm text-gray-600 italic">{guide.description}</p>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" variant="outline" asChild>
                        <a href={guide.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </a>
                      </Button>

                      <Button size="sm" variant="outline" asChild>
                        <a href={guide.fileUrl} download={guide.fileName}>
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </a>
                      </Button>

                      {!guide.ratesExtracted && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => extractRatesMutation.mutate(guide.id)}
                          disabled={extractRatesMutation.isPending}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Extract Rates
                        </Button>
                      )}

                      {!guide.isActive && (
                        <Button
                          size="sm"
                          onClick={() => activateMutation.mutate(guide.id)}
                          disabled={activateMutation.isPending}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Activate
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(guide.id)}
                        disabled={deleteMutation.isPending || guide.isActive}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Price Guide Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{schadGuides.length}</div>
              <div className="text-sm text-gray-600">SCHADS Documents</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{ndisGuides.length}</div>
              <div className="text-sm text-gray-600">NDIS Documents</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {priceGuides.filter(g => g.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active Documents</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {priceGuides.reduce((sum, g) => sum + (g.extractedRatesCount || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Rates</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}