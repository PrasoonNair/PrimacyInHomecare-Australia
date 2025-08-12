import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, User, MapPin, FileText, Users, Bell, Activity } from "lucide-react";
import type { Participant, Staff } from "@shared/schema";

const incidentSchema = z.object({
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  severity: z.string().min(1, "Severity is required"),
  participantId: z.string().optional(),
  participantName: z.string().min(1, "Participant name is required"),
  ndisNumber: z.string().optional(),
  incidentDate: z.string().min(1, "Incident date is required"),
  incidentTime: z.string().min(1, "Incident time is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(10, "Please provide a detailed description"),
  immediateAction: z.string().min(10, "Please describe immediate actions taken"),
  reportedBy: z.string().min(1, "Reporter name is required"),
  reportedByRole: z.string().min(1, "Reporter role is required"),
  witnessNames: z.string().optional(),
  staffInvolved: z.string().optional(),
  injuryType: z.string().optional(),
  bodyPartAffected: z.string().optional(),
  medicalTreatment: z.string().optional(),
  hospitalAttendance: z.boolean().default(false),
  policeNotified: z.boolean().default(false),
  familyNotified: z.boolean().default(false),
  ndisNotified: z.boolean().default(false),
  worksafeNotified: z.boolean().default(false),
  riskRating: z.string().optional(),
  likelihoodRecurrence: z.string().optional(),
  correctiveActions: z.string().optional(),
  preventativeMeasures: z.string().optional(),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

interface IncidentReportFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function IncidentReportForm({ onSuccess, onCancel }: IncidentReportFormProps) {
  const [currentTab, setCurrentTab] = useState("basic");
  
  const { data: participants = [] } = useQuery<Participant[]>({
    queryKey: ["/api/participants"],
  });

  const { data: staff = [] } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      incidentDate: new Date().toISOString().split("T")[0],
      incidentTime: new Date().toTimeString().slice(0, 5),
      hospitalAttendance: false,
      policeNotified: false,
      familyNotified: false,
      ndisNotified: false,
      worksafeNotified: false,
    },
  });

  const reportIncident = useMutation({
    mutationFn: async (data: IncidentFormData) => {
      return await apiRequest("/api/incidents", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      onSuccess();
    },
  });

  const onSubmit = (data: IncidentFormData) => {
    reportIncident.mutate(data);
  };

  const selectedCategory = watch("category");
  const selectedSeverity = watch("severity");

  // NDIS Reportable Categories
  const categories = [
    { value: "death", label: "Death of a participant" },
    { value: "serious_injury", label: "Serious injury of a participant" },
    { value: "abuse_neglect", label: "Abuse or neglect of a participant" },
    { value: "unlawful_contact", label: "Unlawful sexual or physical contact" },
    { value: "restrictive_practice", label: "Unauthorized use of restrictive practice" },
    { value: "other", label: "Other incident" },
  ];

  const severityLevels = [
    { value: "critical", label: "Critical - Immediate action required" },
    { value: "high", label: "High - Urgent attention needed" },
    { value: "medium", label: "Medium - Standard priority" },
    { value: "low", label: "Low - Minor incident" },
  ];

  const shouldNotifyNDIS = ["death", "serious_injury", "abuse_neglect", "unlawful_contact", "restrictive_practice"].includes(selectedCategory);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Incident Details</TabsTrigger>
          <TabsTrigger value="medical">Medical/Injury</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Incident Classification
              </CardTitle>
              <CardDescription>Categorize the incident according to NDIS reporting standards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category*</Label>
                  <Select onValueChange={(value) => setValue("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="severity">Severity Level*</Label>
                  <Select onValueChange={(value) => setValue("severity", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      {severityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.severity && (
                    <p className="text-sm text-red-600 mt-1">{errors.severity.message}</p>
                  )}
                </div>
              </div>

              {shouldNotifyNDIS && (
                <Alert className="bg-purple-50 border-purple-200">
                  <AlertTriangle className="h-4 w-4 text-purple-600" />
                  <AlertDescription className="text-purple-800">
                    This category of incident must be reported to the NDIS Commission within 24 hours.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Participant Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="participantId">Select Participant</Label>
                <Select onValueChange={(value) => {
                  setValue("participantId", value);
                  const participant = participants.find(p => p.id === value);
                  if (participant) {
                    setValue("participantName", participant.name);
                    setValue("ndisNumber", participant.ndisNumber || "");
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select participant" />
                  </SelectTrigger>
                  <SelectContent>
                    {participants.map((participant) => (
                      <SelectItem key={participant.id} value={participant.id}>
                        {participant.name} - {participant.ndisNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="participantName">Participant Name*</Label>
                  <Input {...register("participantName")} />
                  {errors.participantName && (
                    <p className="text-sm text-red-600 mt-1">{errors.participantName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="ndisNumber">NDIS Number</Label>
                  <Input {...register("ndisNumber")} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Incident Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="incidentDate">Date of Incident*</Label>
                  <Input type="date" {...register("incidentDate")} />
                  {errors.incidentDate && (
                    <p className="text-sm text-red-600 mt-1">{errors.incidentDate.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="incidentTime">Time of Incident*</Label>
                  <Input type="time" {...register("incidentTime")} />
                  {errors.incidentTime && (
                    <p className="text-sm text-red-600 mt-1">{errors.incidentTime.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location*</Label>
                <Input {...register("location")} placeholder="Where did the incident occur?" />
                {errors.location && (
                  <p className="text-sm text-red-600 mt-1">{errors.location.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description of Incident*</Label>
                <Textarea 
                  {...register("description")} 
                  rows={4}
                  placeholder="Provide a detailed description of what happened..."
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="immediateAction">Immediate Actions Taken*</Label>
                <Textarea 
                  {...register("immediateAction")} 
                  rows={3}
                  placeholder="Describe the immediate actions taken to address the incident..."
                />
                {errors.immediateAction && (
                  <p className="text-sm text-red-600 mt-1">{errors.immediateAction.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                People Involved
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reportedBy">Reported By*</Label>
                  <Input {...register("reportedBy")} />
                  {errors.reportedBy && (
                    <p className="text-sm text-red-600 mt-1">{errors.reportedBy.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="reportedByRole">Reporter's Role*</Label>
                  <Input {...register("reportedByRole")} placeholder="e.g., Support Worker, Team Leader" />
                  {errors.reportedByRole && (
                    <p className="text-sm text-red-600 mt-1">{errors.reportedByRole.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="witnessNames">Witnesses</Label>
                <Textarea 
                  {...register("witnessNames")} 
                  rows={2}
                  placeholder="List names and contact details of any witnesses..."
                />
              </div>

              <div>
                <Label htmlFor="staffInvolved">Staff Involved</Label>
                <Textarea 
                  {...register("staffInvolved")} 
                  rows={2}
                  placeholder="List all staff members involved in the incident..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Injury/Medical Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="injuryType">Type of Injury</Label>
                  <Input {...register("injuryType")} placeholder="e.g., Bruise, Cut, Fracture" />
                </div>
                <div>
                  <Label htmlFor="bodyPartAffected">Body Part Affected</Label>
                  <Input {...register("bodyPartAffected")} placeholder="e.g., Head, Arm, Leg" />
                </div>
              </div>

              <div>
                <Label htmlFor="medicalTreatment">Medical Treatment Provided</Label>
                <Textarea 
                  {...register("medicalTreatment")} 
                  rows={3}
                  placeholder="Describe any medical treatment provided..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hospitalAttendance"
                  onCheckedChange={(checked) => setValue("hospitalAttendance", checked as boolean)}
                />
                <Label htmlFor="hospitalAttendance">Hospital attendance required</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="riskRating">Risk Rating</Label>
                  <Select onValueChange={(value) => setValue("riskRating", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="likelihoodRecurrence">Likelihood of Recurrence</Label>
                  <Select onValueChange={(value) => setValue("likelihoodRecurrence", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select likelihood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unlikely">Unlikely</SelectItem>
                      <SelectItem value="possible">Possible</SelectItem>
                      <SelectItem value="likely">Likely</SelectItem>
                      <SelectItem value="almost_certain">Almost Certain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="correctiveActions">Corrective Actions</Label>
                <Textarea 
                  {...register("correctiveActions")} 
                  rows={3}
                  placeholder="Describe corrective actions to address the incident..."
                />
              </div>

              <div>
                <Label htmlFor="preventativeMeasures">Preventative Measures</Label>
                <Textarea 
                  {...register("preventativeMeasures")} 
                  rows={3}
                  placeholder="Describe measures to prevent recurrence..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Requirements
              </CardTitle>
              <CardDescription>
                Indicate which authorities have been or need to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="policeNotified"
                    onCheckedChange={(checked) => setValue("policeNotified", checked as boolean)}
                  />
                  <Label htmlFor="policeNotified">Police notified</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="familyNotified"
                    onCheckedChange={(checked) => setValue("familyNotified", checked as boolean)}
                  />
                  <Label htmlFor="familyNotified">Family/Guardian notified</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="ndisNotified"
                    checked={shouldNotifyNDIS}
                    onCheckedChange={(checked) => setValue("ndisNotified", checked as boolean)}
                  />
                  <Label htmlFor="ndisNotified">NDIS Commission notified</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="worksafeNotified"
                    onCheckedChange={(checked) => setValue("worksafeNotified", checked as boolean)}
                  />
                  <Label htmlFor="worksafeNotified">WorkSafe notified</Label>
                </div>
              </div>

              {shouldNotifyNDIS && (
                <Alert className="bg-purple-50 border-purple-200">
                  <AlertTriangle className="h-4 w-4 text-purple-600" />
                  <AlertDescription className="text-purple-800">
                    <strong>NDIS Reporting Required:</strong> This incident must be reported to the NDIS Quality and Safeguards Commission within 24 hours. 
                    The system will automatically generate the required notification.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={reportIncident.isPending}>
          {reportIncident.isPending ? "Submitting..." : "Submit Incident Report"}
        </Button>
      </div>
    </form>
  );
}