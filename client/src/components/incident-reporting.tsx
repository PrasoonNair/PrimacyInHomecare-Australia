import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  AlertTriangle, Shield, Phone, Clock, User, 
  MapPin, Camera, FileText, Send, AlertCircle,
  Heart, Activity, Users, Briefcase
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface IncidentReportingProps {
  participantId?: string;
  staffId?: string;
  shiftId?: string;
}

export function IncidentReporting({ participantId, staffId, shiftId }: IncidentReportingProps) {
  const [incidentType, setIncidentType] = useState("");
  const [severity, setSeverity] = useState("");
  const [injuryOccurred, setInjuryOccurred] = useState(false);
  const [medicalTreatment, setMedicalTreatment] = useState(false);
  const [policeInvolved, setPoliceInvolved] = useState(false);
  const [restrictivePractice, setRestrictivePractice] = useState(false);
  const [witnesses, setWitnesses] = useState<string[]>([]);
  const { toast } = useToast();

  // NDIS incident types
  const incidentTypes = [
    { value: "injury", label: "Injury to Participant", critical: true },
    { value: "medication", label: "Medication Error", critical: true },
    { value: "abuse", label: "Abuse/Neglect Allegation", critical: true },
    { value: "property", label: "Property Damage", critical: false },
    { value: "behaviour", label: "Behaviours of Concern", critical: false },
    { value: "restrictive", label: "Use of Restrictive Practice", critical: true },
    { value: "missing", label: "Missing Person", critical: true },
    { value: "death", label: "Death of Participant", critical: true },
    { value: "emergency", label: "Emergency Situation", critical: true },
    { value: "complaint", label: "Serious Complaint", critical: false },
    { value: "breach", label: "Privacy/Confidentiality Breach", critical: false },
    { value: "other", label: "Other Reportable Incident", critical: false }
  ];

  const submitIncidentMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/incidents", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: (data) => {
      toast({
        title: "Incident Reported",
        description: `Incident #${data.id} has been submitted. Management has been notified.`,
      });
      
      // Notify NDIS if critical
      if (data.notifyNdis) {
        toast({
          title: "NDIS Notification",
          description: "This incident will be reported to the NDIS Quality and Safeguards Commission within 24 hours.",
          variant: "destructive"
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Unable to submit incident report. Please contact management immediately.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const isCritical = incidentTypes.find(t => t.value === incidentType)?.critical;
    
    const incidentData = {
      participantId,
      staffId,
      shiftId,
      incidentType,
      severity,
      dateTime: formData.get("dateTime"),
      location: formData.get("location"),
      description: formData.get("description"),
      immediateAction: formData.get("immediateAction"),
      injuryOccurred,
      injuryDetails: injuryOccurred ? formData.get("injuryDetails") : null,
      medicalTreatment,
      medicalDetails: medicalTreatment ? formData.get("medicalDetails") : null,
      policeInvolved,
      policeDetails: policeInvolved ? formData.get("policeDetails") : null,
      restrictivePractice,
      restrictiveDetails: restrictivePractice ? formData.get("restrictiveDetails") : null,
      witnesses: witnesses.filter(w => w.trim()),
      reportedBy: formData.get("reportedBy"),
      contactNumber: formData.get("contactNumber"),
      notifyNdis: isCritical,
      notifyFamily: formData.get("notifyFamily") === "on",
      followUpRequired: formData.get("followUpRequired") === "on"
    };
    
    submitIncidentMutation.mutate(incidentData);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Critical Incident Warning */}
      <Alert className="border-red-500 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>For life-threatening emergencies, call 000 immediately.</strong>
          <br />
          Complete this form after ensuring participant safety.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Incident Classification */}
        <Card>
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center text-red-700">
              <AlertCircle className="mr-2 h-5 w-5" />
              Incident Classification
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label htmlFor="incidentType">Incident Type *</Label>
              <Select value={incidentType} onValueChange={setIncidentType} required>
                <SelectTrigger id="incidentType" className="mt-2">
                  <SelectValue placeholder="Select incident type" />
                </SelectTrigger>
                <SelectContent>
                  {incidentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        {type.label}
                        {type.critical && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            NDIS Reportable
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Severity Level *</Label>
              <RadioGroup value={severity} onValueChange={setSeverity} className="mt-2" required>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="minor" id="minor" />
                  <Label htmlFor="minor" className="font-normal">
                    Minor - No injury, minimal impact
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate" className="font-normal">
                    Moderate - Minor injury, some disruption
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="major" id="major" />
                  <Label htmlFor="major" className="font-normal">
                    Major - Significant injury, major disruption
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="critical" id="critical" />
                  <Label htmlFor="critical" className="font-normal">
                    Critical - Life-threatening, emergency response
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Incident Details */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateTime">Date & Time *</Label>
                <Input 
                  type="datetime-local" 
                  id="dateTime" 
                  name="dateTime"
                  defaultValue={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  required 
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input 
                  type="text" 
                  id="location" 
                  name="location"
                  placeholder="Where did the incident occur?"
                  required 
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description of Incident *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Provide a detailed description of what happened..."
                rows={5}
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="immediateAction">Immediate Action Taken *</Label>
              <Textarea
                id="immediateAction"
                name="immediateAction"
                placeholder="What actions were taken immediately after the incident?"
                rows={3}
                required
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="mr-2 h-5 w-5" />
              Medical Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="injuryOccurred" 
                checked={injuryOccurred}
                onCheckedChange={(checked) => setInjuryOccurred(checked as boolean)}
              />
              <Label htmlFor="injuryOccurred" className="font-normal">
                Injury occurred to participant or staff
              </Label>
            </div>

            {injuryOccurred && (
              <div>
                <Label htmlFor="injuryDetails">Injury Details</Label>
                <Textarea
                  id="injuryDetails"
                  name="injuryDetails"
                  placeholder="Describe the nature and extent of injuries..."
                  rows={3}
                  className="mt-2"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="medicalTreatment" 
                checked={medicalTreatment}
                onCheckedChange={(checked) => setMedicalTreatment(checked as boolean)}
              />
              <Label htmlFor="medicalTreatment" className="font-normal">
                Medical treatment required or provided
              </Label>
            </div>

            {medicalTreatment && (
              <div>
                <Label htmlFor="medicalDetails">Medical Treatment Details</Label>
                <Textarea
                  id="medicalDetails"
                  name="medicalDetails"
                  placeholder="Describe medical treatment provided or required..."
                  rows={3}
                  className="mt-2"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Authority Involvement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Authority Involvement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="policeInvolved" 
                checked={policeInvolved}
                onCheckedChange={(checked) => setPoliceInvolved(checked as boolean)}
              />
              <Label htmlFor="policeInvolved" className="font-normal">
                Police involved or notified
              </Label>
            </div>

            {policeInvolved && (
              <div>
                <Label htmlFor="policeDetails">Police Involvement Details</Label>
                <Input
                  id="policeDetails"
                  name="policeDetails"
                  placeholder="Event number, officer name, station..."
                  className="mt-2"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="restrictivePractice" 
                checked={restrictivePractice}
                onCheckedChange={(checked) => setRestrictivePractice(checked as boolean)}
              />
              <Label htmlFor="restrictivePractice" className="font-normal">
                Restrictive practice used (physical/chemical/environmental)
              </Label>
            </div>

            {restrictivePractice && (
              <Alert className="border-orange-500 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  Use of restrictive practice must be reported to NDIS within 5 business days
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Witnesses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Witnesses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Witness Names and Contact Numbers</Label>
              <div className="space-y-2 mt-2">
                {[0, 1, 2].map((index) => (
                  <Input
                    key={index}
                    placeholder={`Witness ${index + 1} - Name and Phone`}
                    onChange={(e) => {
                      const newWitnesses = [...witnesses];
                      newWitnesses[index] = e.target.value;
                      setWitnesses(newWitnesses);
                    }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reporter Information */}
        <Card>
          <CardHeader>
            <CardTitle>Reporter Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reportedBy">Your Name *</Label>
                <Input 
                  type="text" 
                  id="reportedBy" 
                  name="reportedBy"
                  required 
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input 
                  type="tel" 
                  id="contactNumber" 
                  name="contactNumber"
                  required 
                  className="mt-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="notifyFamily" name="notifyFamily" />
                <Label htmlFor="notifyFamily" className="font-normal">
                  Family/Guardian notification required
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="followUpRequired" name="followUpRequired" defaultChecked />
                <Label htmlFor="followUpRequired" className="font-normal">
                  Follow-up investigation required
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NDIS Reporting Notice */}
        {incidentType && incidentTypes.find(t => t.value === incidentType)?.critical && (
          <Alert className="border-blue-500 bg-blue-50">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>NDIS Quality and Safeguards Commission Notification</strong>
              <br />
              This incident type requires mandatory reporting to the NDIS Commission within:
              <ul className="list-disc list-inside mt-2">
                <li>24 hours for immediate notification</li>
                <li>5 business days for detailed report</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Actions */}
        <div className="flex justify-between items-center">
          <Button type="button" variant="outline">
            Save as Draft
          </Button>
          <div className="flex space-x-2">
            <Button type="button" variant="outline">
              <Camera className="mr-2 h-4 w-4" />
              Add Photos
            </Button>
            <Button 
              type="submit" 
              className="bg-red-600 hover:bg-red-700"
              disabled={submitIncidentMutation.isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              {submitIncidentMutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </div>
      </form>

      {/* Emergency Contacts */}
      <Card className="bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700">Emergency Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold">Emergency</p>
                <p className="text-2xl font-bold text-red-600">000</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-semibold">Manager On-Call</p>
                <p className="text-xl font-bold text-orange-600">0400 XXX XXX</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-semibold">NDIS Commission</p>
                <p className="text-xl font-bold text-blue-600">1800 035 544</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}