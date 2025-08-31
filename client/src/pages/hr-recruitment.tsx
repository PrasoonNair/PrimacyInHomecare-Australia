import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Briefcase, Users, Calendar, UserCheck, 
  GraduationCap, DollarSign, Award, Clock,
  FileText, UserPlus, CalendarDays, CheckCircle,
  XCircle, AlertCircle, TrendingUp, BookOpen,
  ClipboardCheck, Shield, Mail, Phone, Send
} from "lucide-react";
import { ContractGenerator } from '@/components/hr/contract-generator';
import { ContractNotifications, DepartmentNotificationSummary } from '@/components/hr/contract-notifications';
import { ContractSigningDemo } from '@/components/hr/contract-signing-demo';
import { format } from "date-fns";

// Form schemas
const jobPostingSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  department: z.string().min(1, "Department is required"),
  location: z.string().min(1, "Location is required"),
  employmentType: z.enum(["full_time", "part_time", "casual", "contract"]),
  salaryRange: z.string().optional(),
  description: z.string().min(1, "Job description is required"),
  requirements: z.string().min(1, "Requirements are required"),
  status: z.enum(["draft", "active", "closed"])
});

const jobApplicationSchema = z.object({
  jobPostingId: z.string().min(1, "Job posting is required"),
  applicantName: z.string().min(1, "Applicant name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  resumeUrl: z.string().optional(),
  coverLetter: z.string().optional(),
  status: z.enum(["new", "screening", "interview", "reference_check", "offer", "hired", "rejected"])
});

const interviewScheduleSchema = z.object({
  applicationId: z.string().min(1, "Application is required"),
  interviewType: z.enum(["phone", "video", "in_person", "assessment"]),
  scheduledAt: z.string().min(1, "Interview date/time is required"),
  duration: z.number().min(15).max(480),
  location: z.string().optional(),
  interviewerIds: z.array(z.string()).optional(),
  notes: z.string().optional()
});

const staffLeaveSchema = z.object({
  staffId: z.string().min(1, "Staff member is required"),
  leaveType: z.enum(["annual", "personal", "long_service", "unpaid", "parental", "compassionate"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected", "cancelled"])
});

const staffTrainingSchema = z.object({
  staffId: z.string().min(1, "Staff member is required"),
  trainingType: z.enum(["mandatory", "professional_development", "certification", "safety", "ndis_specific"]),
  trainingName: z.string().min(1, "Training name is required"),
  provider: z.string().optional(),
  completedDate: z.string().optional(),
  expiryDate: z.string().optional(),
  certificateNumber: z.string().optional(),
  status: z.enum(["scheduled", "in_progress", "completed", "expired"])
});

const schacsAwardRateSchema = z.object({
  classification: z.string().min(1, "Classification is required"),
  level: z.string().min(1, "Level is required"),
  payPoint: z.number().min(1).max(10),
  hourlyRate: z.number().min(0),
  weekendRate: z.number().min(0),
  publicHolidayRate: z.number().min(0),
  nightShiftAllowance: z.number().min(0),
  effectiveFrom: z.string().min(1, "Effective date is required"),
  effectiveTo: z.string().optional()
});

type JobPosting = z.infer<typeof jobPostingSchema> & { id: string; createdAt: string };
type JobApplication = z.infer<typeof jobApplicationSchema> & { id: string; createdAt: string };
type InterviewSchedule = z.infer<typeof interviewScheduleSchema> & { id: string; createdAt: string };
type StaffLeave = z.infer<typeof staffLeaveSchema> & { id: string; createdAt: string };
type StaffTraining = z.infer<typeof staffTrainingSchema> & { id: string; createdAt: string };
type SchacsAwardRate = z.infer<typeof schacsAwardRateSchema> & { id: string; createdAt: string };

export default function HRRecruitment() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("recruitment");
  const [selectedJobPosting, setSelectedJobPosting] = useState<JobPosting | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);

  // Queries
  const { data: jobPostings = [] } = useQuery<JobPosting[]>({
    queryKey: ["/api/job-postings"]
  });

  const { data: jobApplications = [] } = useQuery<JobApplication[]>({
    queryKey: ["/api/job-applications"]
  });

  const { data: interviewSchedules = [] } = useQuery<InterviewSchedule[]>({
    queryKey: ["/api/interview-schedules"]
  });

  const { data: staffLeave = [] } = useQuery<StaffLeave[]>({
    queryKey: ["/api/staff-leave"]
  });

  const { data: staffTraining = [] } = useQuery<StaffTraining[]>({
    queryKey: ["/api/staff-training"]
  });

  const { data: schacsRates = [] } = useQuery<SchacsAwardRate[]>({
    queryKey: ["/api/schads-award-rates"]
  });

  const { data: staff = [] } = useQuery<any[]>({
    queryKey: ["/api/staff"]
  });

  // Job Posting Form
  const JobPostingForm = ({ posting }: { posting?: JobPosting }) => {
    const form = useForm<z.infer<typeof jobPostingSchema>>({
      resolver: zodResolver(jobPostingSchema),
      defaultValues: posting || {
        title: "",
        department: "",
        location: "",
        employmentType: "full_time",
        description: "",
        requirements: "",
        status: "draft"
      }
    });

    const createMutation = useMutation({
      mutationFn: (data: z.infer<typeof jobPostingSchema>) => 
        apiRequest("/api/job-postings", "POST", data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/job-postings"] });
        toast({ title: "Job posting created successfully" });
        form.reset();
      },
      onError: () => {
        toast({ title: "Failed to create job posting", variant: "destructive" });
      }
    });

    const onSubmit = (data: z.infer<typeof jobPostingSchema>) => {
      createMutation.mutate(data);
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Support Worker Level 2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Service Delivery" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Melbourne, VIC" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="salaryRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary Range (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., $65,000 - $75,000" />
                </FormControl>
                <FormDescription>Based on SCHADS Award Level 2.3</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Description</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={4} placeholder="Describe the role and responsibilities..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requirements"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Requirements</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} placeholder="List key requirements and qualifications..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Job Posting"}
          </Button>
        </form>
      </Form>
    );
  };

  // Application Form
  const ApplicationForm = () => {
    const form = useForm<z.infer<typeof jobApplicationSchema>>({
      resolver: zodResolver(jobApplicationSchema),
      defaultValues: {
        status: "new"
      }
    });

    const createMutation = useMutation({
      mutationFn: (data: z.infer<typeof jobApplicationSchema>) => 
        apiRequest("/api/job-applications", "POST", data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/job-applications"] });
        toast({ title: "Application recorded successfully" });
        form.reset();
      },
      onError: () => {
        toast({ title: "Failed to record application", variant: "destructive" });
      }
    });

    const onSubmit = (data: z.infer<typeof jobApplicationSchema>) => {
      createMutation.mutate(data);
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="jobPostingId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Posting</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job posting" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {jobPostings.filter(jp => jp.status === "active").map((posting) => (
                      <SelectItem key={posting.id} value={posting.id}>
                        {posting.title} - {posting.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="applicantName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Applicant Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Full name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="applicant@email.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="0400 000 000" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="coverLetter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Letter (Optional)</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} placeholder="Applicant's cover letter..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Application Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="reference_check">Reference Check</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Recording..." : "Record Application"}
          </Button>
        </form>
      </Form>
    );
  };

  // Leave Form
  const LeaveForm = () => {
    const form = useForm<z.infer<typeof staffLeaveSchema>>({
      resolver: zodResolver(staffLeaveSchema),
      defaultValues: {
        status: "pending"
      }
    });

    const createMutation = useMutation({
      mutationFn: (data: z.infer<typeof staffLeaveSchema>) => 
        apiRequest("/api/staff-leave", "POST", data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/staff-leave"] });
        toast({ title: "Leave request created successfully" });
        form.reset();
      },
      onError: () => {
        toast({ title: "Failed to create leave request", variant: "destructive" });
      }
    });

    const onSubmit = (data: z.infer<typeof staffLeaveSchema>) => {
      createMutation.mutate(data);
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="staffId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Staff Member</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {staff.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName} - {member.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="leaveType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Leave Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="annual">Annual Leave</SelectItem>
                    <SelectItem value="personal">Personal/Sick Leave</SelectItem>
                    <SelectItem value="long_service">Long Service Leave</SelectItem>
                    <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    <SelectItem value="parental">Parental Leave</SelectItem>
                    <SelectItem value="compassionate">Compassionate Leave</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason (Optional)</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} placeholder="Brief reason for leave..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Submit Leave Request"}
          </Button>
        </form>
      </Form>
    );
  };

  // Training Form
  const TrainingForm = () => {
    const form = useForm<z.infer<typeof staffTrainingSchema>>({
      resolver: zodResolver(staffTrainingSchema),
      defaultValues: {
        status: "scheduled"
      }
    });

    const createMutation = useMutation({
      mutationFn: (data: z.infer<typeof staffTrainingSchema>) => 
        apiRequest("/api/staff-training", "POST", data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/staff-training"] });
        toast({ title: "Training record created successfully" });
        form.reset();
      },
      onError: () => {
        toast({ title: "Failed to create training record", variant: "destructive" });
      }
    });

    const onSubmit = (data: z.infer<typeof staffTrainingSchema>) => {
      createMutation.mutate(data);
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="staffId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Staff Member</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {staff.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="trainingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Training Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select training type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="mandatory">Mandatory Compliance</SelectItem>
                    <SelectItem value="professional_development">Professional Development</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                    <SelectItem value="safety">WHS/Safety</SelectItem>
                    <SelectItem value="ndis_specific">NDIS Specific</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="trainingName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Training Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., NDIS Worker Orientation Module" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="provider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Training Provider (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., NDIS Quality and Safeguards Commission" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="completedDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Completed Date (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="certificateNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certificate Number (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Certificate or completion ID" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Training Record"}
          </Button>
        </form>
      </Form>
    );
  };

  // SCHADS Award Rate Form
  const SchacsRateForm = () => {
    const form = useForm<z.infer<typeof schacsAwardRateSchema>>({
      resolver: zodResolver(schacsAwardRateSchema),
      defaultValues: {
        payPoint: 1
      }
    });

    const createMutation = useMutation({
      mutationFn: (data: z.infer<typeof schacsAwardRateSchema>) => 
        apiRequest("/api/schads-award-rates", "POST", data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/schads-award-rates"] });
        toast({ title: "SCHADS rate created successfully" });
        form.reset();
      },
      onError: () => {
        toast({ title: "Failed to create SCHADS rate", variant: "destructive" });
      }
    });

    const onSubmit = (data: z.infer<typeof schacsAwardRateSchema>) => {
      createMutation.mutate(data);
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="classification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classification</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Social and Community Services Employee" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Level 2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="payPoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pay Point</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="1" max="10" onChange={e => field.onChange(parseInt(e.target.value))} />
                </FormControl>
                <FormDescription>Pay point within the level (1-10)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="hourlyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Hourly Rate ($)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.01" min="0" onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weekendRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weekend Rate ($)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.01" min="0" onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormDescription>Saturday/Sunday rate</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="publicHolidayRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Public Holiday Rate ($)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.01" min="0" onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nightShiftAllowance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Night Shift Allowance ($)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.01" min="0" onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormDescription>Per hour allowance</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="effectiveFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Effective From</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="effectiveTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Effective To (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create SCHADS Rate"}
          </Button>
        </form>
      </Form>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          HR & Recruitment Management
        </h1>
        <p className="text-gray-600 mt-2">
          Comprehensive workforce management with NDIS compliance and SCHADS award integration
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="schads">SCHADS</TabsTrigger>
        </TabsList>

        <TabsContent value="recruitment" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Postings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {jobPostings.filter(jp => jp.status === "active").length}
                </div>
                <p className="text-sm text-gray-600">Open positions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {jobApplications.length}
                </div>
                <p className="text-sm text-gray-600">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interviews Scheduled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {interviewSchedules.length}
                </div>
                <p className="text-sm text-gray-600">This week</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Job Posting</CardTitle>
                <CardDescription>Post a new position with NDIS requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <JobPostingForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Job Postings</CardTitle>
                <CardDescription>Current open positions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {jobPostings.map((posting) => (
                      <div key={posting.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{posting.title}</h4>
                            <p className="text-sm text-gray-600">{posting.department} • {posting.location}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant={posting.employmentType === "full_time" ? "default" : "secondary"}>
                                {posting.employmentType.replace("_", " ")}
                              </Badge>
                              <Badge variant={
                                posting.status === "active" ? "default" : 
                                posting.status === "closed" ? "destructive" : "secondary"
                              }>
                                {posting.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {jobApplications.filter(app => app.jobPostingId === posting.id).length} applications
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Record Application</CardTitle>
                <CardDescription>Track new job applications</CardDescription>
              </CardHeader>
              <CardContent>
                <ApplicationForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Pipeline</CardTitle>
                <CardDescription>Track applications through stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="font-medium">New</span>
                    <Badge>{jobApplications.filter(a => a.status === "new").length}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                    <span className="font-medium">Screening</span>
                    <Badge>{jobApplications.filter(a => a.status === "screening").length}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                    <span className="font-medium">Interview</span>
                    <Badge>{jobApplications.filter(a => a.status === "interview").length}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="font-medium">Offer</span>
                    <Badge>{jobApplications.filter(a => a.status === "offer").length}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Hired</span>
                    <Badge variant="success">{jobApplications.filter(a => a.status === "hired").length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Latest job applications received</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {jobApplications.slice(0, 10).map((application) => (
                    <div key={application.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{application.applicantName}</h4>
                          <div className="flex gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {application.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {application.phone}
                            </span>
                          </div>
                        </div>
                        <Badge variant={
                          application.status === "hired" ? "success" :
                          application.status === "rejected" ? "destructive" :
                          "default"
                        }>
                          {application.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ready for Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {jobApplications.filter(a => a.status === "offer" || a.status === "hired").length}
                </div>
                <p className="text-sm text-gray-600">Applicants ready</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contracts Generated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">8</div>
                <p className="text-sm text-gray-600">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Awaiting Signature</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">3</div>
                <p className="text-sm text-gray-600">Contracts sent</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Contract Generation
                </CardTitle>
                <CardDescription>Generate employment contracts for successful applicants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Select an applicant who has completed interviews and reference checks to generate their employment contract automatically.
                  </div>
                  
                  <div className="space-y-3">
                    {jobApplications
                      .filter(app => app.status === "offer" || app.status === "hired")
                      .slice(0, 5)
                      .map((application) => (
                      <div key={application.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{application.applicantName}</h4>
                            <p className="text-sm text-gray-600">
                              Applied for position • Status: {application.status}
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            className="flex items-center gap-2"
                            data-testid={`button-generate-contract-${application.id}`}
                          >
                            <Send className="h-3 w-3" />
                            Generate Contract
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {jobApplications.filter(app => app.status === "offer" || app.status === "hired").length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No applicants ready for contract generation</p>
                      <p className="text-sm">Move applicants to "Offer" status after interviews and reference checks</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contract Templates</CardTitle>
                <CardDescription>Available employment contract templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border rounded p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Full-Time Employment</h4>
                        <p className="text-sm text-gray-600">38 hours/week, SCHADS Level 2-6</p>
                      </div>
                      <Badge variant="default">Default</Badge>
                    </div>
                  </div>
                  <div className="border rounded p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Part-Time Employment</h4>
                        <p className="text-sm text-gray-600">Flexible hours, pro-rata benefits</p>
                      </div>
                      <Badge variant="secondary">Available</Badge>
                    </div>
                  </div>
                  <div className="border rounded p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Casual Employment</h4>
                        <p className="text-sm text-gray-600">25% casual loading, no leave entitlements</p>
                      </div>
                      <Badge variant="secondary">Available</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Contract Status Tracker</CardTitle>
              <CardDescription>Track contract generation and signature status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg bg-blue-50">
                    <div className="text-2xl font-bold text-blue-600">5</div>
                    <p className="text-sm text-gray-600">Draft</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-yellow-50">
                    <div className="text-2xl font-bold text-yellow-600">3</div>
                    <p className="text-sm text-gray-600">Sent for Signature</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-green-50">
                    <div className="text-2xl font-bold text-green-600">12</div>
                    <p className="text-sm text-gray-600">Signed</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-gray-50">
                    <div className="text-2xl font-bold text-gray-600">15</div>
                    <p className="text-sm text-gray-600">Active</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Recent Contract Activity</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Sarah Johnson - Full-Time Support Worker</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-600 text-white">Signed & Processed</Badge>
                        <span className="text-xs text-gray-500">2 hours ago</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">Michael Chen - Part-Time Coordinator</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Sent</Badge>
                        <span className="text-xs text-gray-500">1 day ago</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Emma Davis - Casual Support Worker</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Draft</Badge>
                        <span className="text-xs text-gray-500">3 days ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContractSigningDemo />
            <DepartmentNotificationSummary />
          </div>
          
          <ContractNotifications department="HR" />
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">New Starters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {jobApplications.filter(a => a.status === "hired").length}
                </div>
                <p className="text-sm text-gray-600">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Onboarding Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">12</div>
                <p className="text-sm text-gray-600">Pending completion</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Compliance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">98%</div>
                <p className="text-sm text-gray-600">NDIS requirements met</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>NDIS Onboarding Checklist</CardTitle>
              <CardDescription>Essential requirements for new NDIS workers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>NDIS Worker Screening Check</span>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>NDIS Worker Orientation Module</span>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span>First Aid & CPR Certification</span>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span>Manual Handling Training</span>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span>Medication Administration Training</span>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span>Code of Conduct Agreement</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pending Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {staffLeave.filter(l => l.status === "pending").length}
                </div>
                <p className="text-sm text-gray-600">Awaiting approval</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">On Leave Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">3</div>
                <p className="text-sm text-gray-600">Staff members</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Annual Leave Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">152</div>
                <p className="text-sm text-gray-600">Days available (avg)</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sick Leave YTD</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">48</div>
                <p className="text-sm text-gray-600">Days taken</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit Leave Request</CardTitle>
                <CardDescription>Record staff leave applications</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaveForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Leave Requests</CardTitle>
                <CardDescription>Latest leave applications</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {staffLeave.map((leave) => (
                      <div key={leave.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {leave.leaveType.replace("_", " ").charAt(0).toUpperCase() + 
                               leave.leaveType.replace("_", " ").slice(1)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {leave.startDate} to {leave.endDate}
                            </p>
                          </div>
                          <Badge variant={
                            leave.status === "approved" ? "success" :
                            leave.status === "rejected" ? "destructive" :
                            leave.status === "pending" ? "warning" :
                            "secondary"
                          }>
                            {leave.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scheduled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {staffTraining.filter(t => t.status === "scheduled").length}
                </div>
                <p className="text-sm text-gray-600">Upcoming training</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {staffTraining.filter(t => t.status === "in_progress").length}
                </div>
                <p className="text-sm text-gray-600">Currently training</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {staffTraining.filter(t => t.status === "completed").length}
                </div>
                <p className="text-sm text-gray-600">This quarter</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expiring Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {staffTraining.filter(t => t.status === "expired").length}
                </div>
                <p className="text-sm text-gray-600">Need renewal</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Record Training</CardTitle>
                <CardDescription>Track staff training and certifications</CardDescription>
              </CardHeader>
              <CardContent>
                <TrainingForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mandatory NDIS Training</CardTitle>
                <CardDescription>Required training for all NDIS workers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">NDIS Worker Orientation</p>
                        <p className="text-sm text-gray-600">Online module - 90 minutes</p>
                      </div>
                      <Badge variant="success">Mandatory</Badge>
                    </div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Code of Conduct</p>
                        <p className="text-sm text-gray-600">Annual refresher required</p>
                      </div>
                      <Badge variant="success">Mandatory</Badge>
                    </div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Infection Control</p>
                        <p className="text-sm text-gray-600">COVID-19 protocols included</p>
                      </div>
                      <Badge variant="success">Mandatory</Badge>
                    </div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Manual Handling</p>
                        <p className="text-sm text-gray-600">Safe work practices</p>
                      </div>
                      <Badge>Recommended</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SCHADS Award Compliance</CardTitle>
              <CardDescription>
                Social, Community, Home Care and Disability Services Industry Award rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Current Award Rate</AlertTitle>
                <AlertDescription>
                  Effective from 1 July 2024 - Minimum wage increase of 3.75% applied
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configure SCHADS Rates</CardTitle>
                <CardDescription>Set award rates and allowances</CardDescription>
              </CardHeader>
              <CardContent>
                <SchacsRateForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current SCHADS Rates</CardTitle>
                <CardDescription>Active award classifications and rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {schacsRates.map((rate) => (
                      <div key={rate.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{rate.classification}</p>
                            <p className="text-sm text-gray-600">
                              {rate.level} - Pay Point {rate.payPoint}
                            </p>
                            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                              <div>
                                <span className="text-gray-500">Base:</span> ${rate.hourlyRate.toFixed(2)}/hr
                              </div>
                              <div>
                                <span className="text-gray-500">Weekend:</span> ${rate.weekendRate.toFixed(2)}/hr
                              </div>
                              <div>
                                <span className="text-gray-500">Public Holiday:</span> ${rate.publicHolidayRate.toFixed(2)}/hr
                              </div>
                              <div>
                                <span className="text-gray-500">Night Shift:</span> +${rate.nightShiftAllowance.toFixed(2)}/hr
                              </div>
                            </div>
                          </div>
                          <Badge variant="default">
                            Active
                          </Badge>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Effective: {rate.effectiveFrom}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>SCHADS Penalty Rates & Allowances</CardTitle>
              <CardDescription>Standard penalty rates and allowances under the award</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="font-semibold mb-2">Saturday Rates</h4>
                  <p className="text-2xl font-bold text-blue-600">150%</p>
                  <p className="text-sm text-gray-600">1.5x ordinary rate</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold mb-2">Sunday Rates</h4>
                  <p className="text-2xl font-bold text-green-600">200%</p>
                  <p className="text-sm text-gray-600">2x ordinary rate</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold mb-2">Public Holiday</h4>
                  <p className="text-2xl font-bold text-purple-600">250%</p>
                  <p className="text-sm text-gray-600">2.5x ordinary rate</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold mb-2">Broken Shift</h4>
                  <p className="text-2xl font-bold text-yellow-600">+$2.59</p>
                  <p className="text-sm text-gray-600">Per shift allowance</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold mb-2">Sleep Over</h4>
                  <p className="text-2xl font-bold text-red-600">$68.51</p>
                  <p className="text-sm text-gray-600">Per night</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold mb-2">On Call</h4>
                  <p className="text-2xl font-bold text-gray-600">$32.46</p>
                  <p className="text-sm text-gray-600">Per 24 hour period</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}