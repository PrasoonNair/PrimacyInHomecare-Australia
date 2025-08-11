import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStaffSchema, insertStaffQualificationSchema, insertPerformanceReviewSchema, type Staff, type StaffQualification, type PerformanceReview } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { UserPlusIcon, AwardIcon, FileTextIcon, CalendarIcon, StarIcon, AlertTriangleIcon } from "lucide-react";
import { format } from "date-fns";

export default function HRRecruitment() {
  const [activeTab, setActiveTab] = useState("staff");
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [qualificationDialogOpen, setQualificationDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: staff = [], isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const { data: qualifications = [], isLoading: qualificationsLoading } = useQuery<StaffQualification[]>({
    queryKey: ["/api/staff-qualifications"],
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<PerformanceReview[]>({
    queryKey: ["/api/performance-reviews"],
  });

  const staffForm = useForm({
    resolver: zodResolver(insertStaffSchema),
    defaultValues: {
      position: "Support Worker",
      isActive: true,
    },
  });

  const qualificationForm = useForm({
    resolver: zodResolver(insertStaffQualificationSchema),
    defaultValues: {
      status: "current",
    },
  });

  const reviewForm = useForm({
    resolver: zodResolver(insertPerformanceReviewSchema),
    defaultValues: {
      reviewDate: new Date().toISOString().split('T')[0],
      status: "draft",
    },
  });

  const createStaffMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create staff member");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      setStaffDialogOpen(false);
      staffForm.reset();
      toast({
        title: "Success",
        description: "Staff member added successfully",
      });
    },
  });

  const createQualificationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/staff-qualifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to add qualification");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-qualifications"] });
      setQualificationDialogOpen(false);
      qualificationForm.reset();
      toast({
        title: "Success",
        description: "Qualification added successfully",
      });
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/performance-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create review");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/performance-reviews"] });
      setReviewDialogOpen(false);
      reviewForm.reset();
      toast({
        title: "Success",
        description: "Performance review created successfully",
      });
    },
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "current": return "default";
      case "completed": return "default";
      case "expired": return "destructive";
      case "pending_renewal": return "secondary";
      case "draft": return "outline";
      default: return "outline";
    }
  };

  const renderStarRating = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${i < rating ? "text-yellow-500 fill-current" : "text-muted-foreground"}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">HR & Recruitment</h1>
          <p className="text-muted-foreground">
            Manage staff hiring, qualifications, and performance reviews
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="staff" data-testid="tab-staff">Staff Management</TabsTrigger>
            <TabsTrigger value="qualifications" data-testid="tab-qualifications">Qualifications</TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews">Performance Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="staff" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Staff Management</h2>
              <Dialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-staff">
                    <UserPlusIcon className="mr-2 h-4 w-4" />
                    Add Staff Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add New Staff Member</DialogTitle>
                  </DialogHeader>
                  <Form {...staffForm}>
                    <form onSubmit={staffForm.handleSubmit((data) => createStaffMutation.mutate(data))} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={staffForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-first-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={staffForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-last-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={staffForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={staffForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} type="tel" data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={staffForm.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-position" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={staffForm.control}
                        name="employeeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employee ID</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="EMP001" data-testid="input-employee-id" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={staffForm.control}
                        name="hourlyRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hourly Rate ($)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" step="0.01" data-testid="input-hourly-rate" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={staffForm.control}
                        name="qualifications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Qualifications</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={3} data-testid="textarea-qualifications" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" disabled={createStaffMutation.isPending} data-testid="button-submit-staff">
                        {createStaffMutation.isPending ? "Adding..." : "Add Staff Member"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {staffLoading ? (
                <div className="text-center py-8" data-testid="loading-staff">Loading staff...</div>
              ) : staff.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="empty-staff">
                  No staff members found. Add your first staff member to get started.
                </div>
              ) : (
                staff.map((member) => (
                  <Card key={member.id} data-testid={`staff-card-${member.id}`}>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{member.firstName} {member.lastName}</CardTitle>
                          <CardDescription>{member.position}</CardDescription>
                        </div>
                        <Badge variant={member.isActive ? "default" : "destructive"}>
                          {member.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium">Employee ID:</span>
                            <span className="ml-2">{member.employeeId || "N/A"}</span>
                          </div>
                          <div>
                            <span className="font-medium">Hourly Rate:</span>
                            <span className="ml-2">${member.hourlyRate || "0.00"}</span>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Email:</span>
                          <span className="ml-2">{member.email}</span>
                        </div>
                        {member.phone && (
                          <div>
                            <span className="font-medium">Phone:</span>
                            <span className="ml-2">{member.phone}</span>
                          </div>
                        )}
                        {member.qualifications && (
                          <div className="mt-3 p-3 bg-muted/50 rounded">
                            <p className="text-sm font-medium mb-1">Qualifications:</p>
                            <p className="text-sm">{member.qualifications}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="qualifications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Staff Qualifications</h2>
              <Dialog open={qualificationDialogOpen} onOpenChange={setQualificationDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-qualification">
                    <AwardIcon className="mr-2 h-4 w-4" />
                    Add Qualification
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Staff Qualification</DialogTitle>
                  </DialogHeader>
                  <Form {...qualificationForm}>
                    <form onSubmit={qualificationForm.handleSubmit((data) => createQualificationMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={qualificationForm.control}
                        name="staffId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Staff Member</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-staff">
                                  <SelectValue placeholder="Select staff member" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {staff?.map((member) => (
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
                        control={qualificationForm.control}
                        name="qualificationType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Qualification Type</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., First Aid, Cert III" data-testid="input-qualification-type" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={qualificationForm.control}
                        name="qualificationName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Qualification Name</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-qualification-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={qualificationForm.control}
                        name="issuingBody"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Issuing Body</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-issuing-body" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={qualificationForm.control}
                          name="dateObtained"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date Obtained</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" data-testid="input-date-obtained" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={qualificationForm.control}
                          name="expiryDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expiry Date</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" data-testid="input-expiry-date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={createQualificationMutation.isPending} data-testid="button-submit-qualification">
                        {createQualificationMutation.isPending ? "Adding..." : "Add Qualification"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {qualificationsLoading ? (
                <div className="text-center py-8" data-testid="loading-qualifications">Loading qualifications...</div>
              ) : qualifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="empty-qualifications">
                  No qualifications found. Add your first qualification to get started.
                </div>
              ) : (
                qualifications.map((qualification) => (
                  <Card key={qualification.id} data-testid={`qualification-card-${qualification.id}`}>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{qualification.qualificationName}</CardTitle>
                          <CardDescription>{qualification.qualificationType}</CardDescription>
                        </div>
                        <Badge variant={getStatusBadgeColor(qualification.status || "current")}>
                          {qualification.status?.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {qualification.issuingBody && (
                          <div>
                            <span className="font-medium">Issuing Body:</span>
                            <span className="ml-2">{qualification.issuingBody}</span>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          {qualification.dateObtained && (
                            <div>
                              <span className="font-medium">Obtained:</span>
                              <span className="ml-2">{format(new Date(qualification.dateObtained), "MMM dd, yyyy")}</span>
                            </div>
                          )}
                          {qualification.expiryDate && (
                            <div className="flex items-center gap-2">
                              {new Date(qualification.expiryDate) < new Date() && (
                                <AlertTriangleIcon className="h-4 w-4 text-red-500" />
                              )}
                              <span className="font-medium">Expires:</span>
                              <span className={new Date(qualification.expiryDate) < new Date() ? "text-red-500" : ""}>
                                {format(new Date(qualification.expiryDate), "MMM dd, yyyy")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Performance Reviews</h2>
              <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-review">
                    <FileTextIcon className="mr-2 h-4 w-4" />
                    New Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create Performance Review</DialogTitle>
                  </DialogHeader>
                  <Form {...reviewForm}>
                    <form onSubmit={reviewForm.handleSubmit((data) => createReviewMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={reviewForm.control}
                        name="staffId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Staff Member</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-staff-review">
                                  <SelectValue placeholder="Select staff member" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {staff?.map((member) => (
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

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={reviewForm.control}
                          name="reviewPeriodStart"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Period Start</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" data-testid="input-period-start" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={reviewForm.control}
                          name="reviewPeriodEnd"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Period End</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" data-testid="input-period-end" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={reviewForm.control}
                        name="overallRating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Overall Rating (1-5)</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger data-testid="select-rating">
                                  <SelectValue placeholder="Select rating" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">1 - Needs Improvement</SelectItem>
                                <SelectItem value="2">2 - Below Expectations</SelectItem>
                                <SelectItem value="3">3 - Meets Expectations</SelectItem>
                                <SelectItem value="4">4 - Exceeds Expectations</SelectItem>
                                <SelectItem value="5">5 - Outstanding</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={reviewForm.control}
                        name="achievements"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Achievements</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={3} data-testid="textarea-achievements" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={reviewForm.control}
                        name="areasForImprovement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Areas for Improvement</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={3} data-testid="textarea-improvement" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" disabled={createReviewMutation.isPending} data-testid="button-submit-review">
                        {createReviewMutation.isPending ? "Creating..." : "Create Review"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {reviewsLoading ? (
                <div className="text-center py-8" data-testid="loading-reviews">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="empty-reviews">
                  No performance reviews found. Create your first review to get started.
                </div>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id} data-testid={`review-card-${review.id}`}>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Performance Review</CardTitle>
                          <CardDescription>
                            {review.reviewPeriodStart ? format(new Date(review.reviewPeriodStart), "MMM dd, yyyy") : "N/A"} - 
                            {review.reviewPeriodEnd ? format(new Date(review.reviewPeriodEnd), "MMM dd, yyyy") : "N/A"}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {review.overallRating && (
                            <div className="flex items-center gap-1">
                              {renderStarRating(review.overallRating)}
                            </div>
                          )}
                          <Badge variant={getStatusBadgeColor(review.status || "draft")}>
                            {review.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {review.achievements && (
                          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded">
                            <p className="text-sm font-medium mb-1 text-green-800 dark:text-green-200">Achievements:</p>
                            <p className="text-sm text-green-700 dark:text-green-300">{review.achievements}</p>
                          </div>
                        )}
                        {review.areasForImprovement && (
                          <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded">
                            <p className="text-sm font-medium mb-1 text-orange-800 dark:text-orange-200">Areas for Improvement:</p>
                            <p className="text-sm text-orange-700 dark:text-orange-300">{review.areasForImprovement}</p>
                          </div>
                        )}
                        {review.nextReviewDate && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarIcon className="h-4 w-4" />
                            <span>Next Review: {format(new Date(review.nextReviewDate), "MMM dd, yyyy")}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}