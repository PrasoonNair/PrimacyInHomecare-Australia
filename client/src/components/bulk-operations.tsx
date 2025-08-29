import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, FileSpreadsheet, Users, Mail, 
  MessageSquare, DollarSign, Calendar, FileText,
  CheckCircle, AlertTriangle, Download, Send
} from "lucide-react";

export function BulkOperations() {
  const [selectedOperation, setSelectedOperation] = useState("import");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const operations = [
    { id: "import", label: "Bulk Import", icon: Upload, color: "blue" },
    { id: "invoice", label: "Generate Invoices", icon: DollarSign, color: "green" },
    { id: "sms", label: "Send SMS", icon: MessageSquare, color: "purple" },
    { id: "email", label: "Email Campaign", icon: Mail, color: "orange" },
    { id: "shift", label: "Assign Shifts", icon: Calendar, color: "pink" },
    { id: "document", label: "Upload Documents", icon: FileText, color: "indigo" },
    { id: "status", label: "Update Status", icon: CheckCircle, color: "teal" },
    { id: "payment", label: "Process Payments", icon: DollarSign, color: "yellow" }
  ];

  const handleBulkOperation = async () => {
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Bulk Operation Complete",
        description: `Successfully processed ${selectedItems.length} items`,
      });
      setSelectedItems([]);
    }, 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle CSV/Excel file upload
      const reader = new FileReader();
      reader.onload = (e) => {
        // Parse CSV/Excel data
        toast({
          title: "File Uploaded",
          description: `Processing ${file.name}...`,
        });
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Operation Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Operations Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {operations.map((op) => {
              const Icon = op.icon;
              return (
                <Button
                  key={op.id}
                  variant={selectedOperation === op.id ? "default" : "outline"}
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setSelectedOperation(op.id)}
                >
                  <Icon className={`h-6 w-6 text-${op.color}-600`} />
                  <span className="text-xs">{op.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Import Operations */}
      {selectedOperation === "import" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileSpreadsheet className="mr-2 h-5 w-5" />
              Bulk Import Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Drop CSV or Excel file here, or click to browse
                </p>
                <Input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="bulk-upload"
                />
                <label htmlFor="bulk-upload">
                  <Button as="span" variant="outline" className="cursor-pointer">
                    Choose File
                  </Button>
                </label>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Download our <a href="#" className="text-blue-600 underline">template file</a> to ensure proper formatting
                </AlertDescription>
              </Alert>

              <div className="flex justify-between items-center">
                <Badge variant="outline">
                  Supported: CSV, Excel (XLSX, XLS)
                </Badge>
                <Button disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Import Data"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Generation */}
      {selectedOperation === "invoice" && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Invoice Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Period</label>
                  <Select defaultValue="month">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Service Type</label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      <SelectItem value="daily">Daily Living</SelectItem>
                      <SelectItem value="community">Community Access</SelectItem>
                      <SelectItem value="respite">Respite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Select Participants</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {["John Smith", "Mary Johnson", "David Lee", "Sarah Brown", "Michael Chen"].map((name) => (
                    <div key={name} className="flex items-center space-x-2">
                      <Checkbox 
                        checked={selectedItems.includes(name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedItems([...selectedItems, name]);
                          } else {
                            setSelectedItems(selectedItems.filter(i => i !== name));
                          }
                        }}
                      />
                      <label className="text-sm">{name}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {selectedItems.length} participants selected
                </span>
                <div className="space-x-2">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button 
                    onClick={handleBulkOperation}
                    disabled={selectedItems.length === 0 || isProcessing}
                  >
                    {isProcessing ? "Generating..." : "Generate Invoices"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SMS Campaign */}
      {selectedOperation === "sms" && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk SMS Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Message Template</label>
                <Select defaultValue="reminder">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reminder">Appointment Reminder</SelectItem>
                    <SelectItem value="shift">Shift Notification</SelectItem>
                    <SelectItem value="birthday">Birthday Greeting</SelectItem>
                    <SelectItem value="update">Service Update</SelectItem>
                    <SelectItem value="custom">Custom Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Message Preview</label>
                <div className="border rounded-lg p-3 bg-gray-50">
                  <p className="text-sm">
                    Hi [Name], this is a reminder about your appointment tomorrow at [Time]. 
                    Reply YES to confirm or call 1800 800 110 to reschedule.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Recipients ({selectedItems.length})</label>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Select All Staff</Button>
                  <Button variant="outline" size="sm">Select All Participants</Button>
                  <Button variant="outline" size="sm">Custom Selection</Button>
                </div>
              </div>

              <Alert className="border-blue-300 bg-blue-50">
                <MessageSquare className="h-4 w-4" />
                <AlertDescription>
                  SMS credits available: 2,450 | Cost per SMS: $0.08
                </AlertDescription>
              </Alert>

              <div className="flex justify-between items-center">
                <Badge variant="outline">
                  Total cost: ${(selectedItems.length * 0.08).toFixed(2)}
                </Badge>
                <Button 
                  onClick={handleBulkOperation}
                  disabled={selectedItems.length === 0 || isProcessing}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isProcessing ? "Sending..." : "Send SMS Campaign"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Updates */}
      {selectedOperation === "status" && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Status Update</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Update Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">Service Status</SelectItem>
                      <SelectItem value="plan">Plan Status</SelectItem>
                      <SelectItem value="participant">Participant Status</SelectItem>
                      <SelectItem value="staff">Staff Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">New Status</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-yellow-50">
                <h4 className="font-medium mb-2 text-yellow-800">
                  Warning: This action will update {selectedItems.length || 0} records
                </h4>
                <p className="text-sm text-yellow-700">
                  Please review your selection carefully before proceeding.
                </p>
              </div>

              <div className="flex justify-between items-center">
                <Checkbox>
                  <span className="ml-2 text-sm">Send notifications to affected users</span>
                </Checkbox>
                <Button 
                  variant="destructive"
                  onClick={handleBulkOperation}
                  disabled={selectedItems.length === 0 || isProcessing}
                >
                  {isProcessing ? "Updating..." : "Update All Selected"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}