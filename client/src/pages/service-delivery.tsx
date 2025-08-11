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
import { insertShiftSchema, insertStaffAvailabilitySchema, type Shift, type StaffAvailability, type Staff, type Participant } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, ClockIcon, UserCheckIcon, AlertCircleIcon, MapPinIcon, UsersIcon } from "lucide-react";
import { format } from "date-fns";

export default function ServiceDelivery() {
  const [activeTab, setActiveTab] = useState("shifts");
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: shifts = [], isLoading: shiftsLoading } = useQuery<Shift[]>({
    queryKey: ["/api/shifts"],
  });

  const { data: availability = [], isLoading: availabilityLoading } = useQuery<StaffAvailability[]>({
    queryKey: ["/api/staff-availability"],
  });

  const { data: staff = [] } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const { data: participants = [] } = useQuery<Participant[]>({
    queryKey: ["/api/participants"],
  });

  const shiftForm = useForm({
    resolver: zodResolver(insertShiftSchema),
    defaultValues: {
      shiftType: "regular",
      status: "scheduled",
      isUrgent: false,
    },
  });

  const availabilityForm = useForm({
    resolver: zodResolver(insertStaffAvailabilitySchema),
    defaultValues: {
      isAvailable: true,
      maxHoursPerDay: 8,
    },
  });

  const createShiftMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create shift");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      setShiftDialogOpen(false);
      shiftForm.reset();
      toast({
        title: "Success",
        description: "Shift created successfully",
      });
    },
  });

  const createAvailabilityMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/staff-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create availability record");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-availability"] });
      setAvailabilityDialogOpen(false);
      availabilityForm.reset();
      toast({
        title: "Success",
        description: "Availability record created successfully",
      });
    },
  });

  const getShiftStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in_progress": return "secondary";
      case "confirmed": return "outline";
      case "scheduled": return "outline";
      case "cancelled": return "destructive";
      case "no_show": return "destructive";
      default: return "outline";
    }
  };

  const getShiftTypeColor = (type: string) => {
    switch (type) {
      case "emergency": return "destructive";
      case "cover": return "secondary";
      case "overnight": return "outline";
      case "regular": return "default";
      default: return "outline";
    }
  };

  const getDayName = (dayNumber: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayNumber] || "Unknown";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Service Delivery</h1>
          <p className="text-muted-foreground">
            Staff allocation, shift management, and service operations
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="shifts" data-testid="tab-shifts">Shift Management</TabsTrigger>
            <TabsTrigger value="allocation" data-testid="tab-allocation">Staff Allocation</TabsTrigger>
            <TabsTrigger value="availability" data-testid="tab-availability">Availability</TabsTrigger>
          </TabsList>

          <TabsContent value="shifts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Shift Management</h2>
              <Dialog open={shiftDialogOpen} onOpenChange={setShiftDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-shift">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Create Shift
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Shift</DialogTitle>
                  </DialogHeader>
                  <Form {...shiftForm}>
                    <form onSubmit={shiftForm.handleSubmit((data) => createShiftMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={shiftForm.control}
                        name="participantId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Participant</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-participant">
                                  <SelectValue placeholder="Select participant" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {participants?.map((participant) => (
                                  <SelectItem key={participant.id} value={participant.id}>
                                    {participant.firstName} {participant.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={shiftForm.control}
                        name="assignedStaffId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assigned Staff</FormLabel>
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
                        control={shiftForm.control}
                        name="shiftDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shift Date</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" data-testid="input-shift-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={shiftForm.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
                              <FormControl>
                                <Input {...field} type="time" data-testid="input-start-time" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={shiftForm.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time</FormLabel>
                              <FormControl>
                                <Input {...field} type="time" data-testid="input-end-time" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={shiftForm.control}
                        name="shiftType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shift Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-shift-type">
                                  <SelectValue placeholder="Select shift type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="regular">Regular</SelectItem>
                                <SelectItem value="cover">Cover Shift</SelectItem>
                                <SelectItem value="emergency">Emergency</SelectItem>
                                <SelectItem value="overnight">Overnight</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={shiftForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-location" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={shiftForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={3} data-testid="textarea-notes" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" disabled={createShiftMutation.isPending} data-testid="button-submit-shift">
                        {createShiftMutation.isPending ? "Creating..." : "Create Shift"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {shiftsLoading ? (
                <div className="text-center py-8" data-testid="loading-shifts">Loading shifts...</div>
              ) : shifts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="empty-shifts">
                  No shifts found. Create your first shift to get started.
                </div>
              ) : (
                shifts.map((shift) => (
                  <Card key={shift.id} data-testid={`shift-card-${shift.id}`}>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {shift.shiftDate ? format(new Date(shift.shiftDate), "EEEE, MMM dd") : "Unknown Date"}
                          </CardTitle>
                          <CardDescription>
                            {shift.startTime} - {shift.endTime} 
                            {shift.duration && ` (${Math.floor(shift.duration / 60)}h ${shift.duration % 60}m)`}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={getShiftTypeColor(shift.shiftType || "regular")}>
                            {shift.shiftType}
                          </Badge>
                          <Badge variant={getShiftStatusColor(shift.status || "scheduled")}>
                            {shift.status}
                          </Badge>
                          {shift.isUrgent && (
                            <Badge variant="destructive">Urgent</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <UsersIcon className="h-4 w-4 text-muted-foreground" />
                            <span>Participant ID: {shift.participantId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <UserCheckIcon className="h-4 w-4 text-muted-foreground" />
                            <span>Staff ID: {shift.assignedStaffId || "Unassigned"}</span>
                          </div>
                        </div>
                        
                        {shift.location && (
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                            <span>{shift.location}</span>
                          </div>
                        )}

                        {shift.clockInTime && shift.clockOutTime && (
                          <div className="p-3 bg-muted/50 rounded">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Clock In:</span>
                                <span className="ml-2">{format(new Date(shift.clockInTime), "HH:mm")}</span>
                              </div>
                              <div>
                                <span className="font-medium">Clock Out:</span>
                                <span className="ml-2">{format(new Date(shift.clockOutTime), "HH:mm")}</span>
                              </div>
                            </div>
                            {shift.actualDuration && (
                              <div className="mt-2">
                                <span className="font-medium">Actual Duration:</span>
                                <span className="ml-2">{Math.floor(shift.actualDuration / 60)}h {shift.actualDuration % 60}m</span>
                              </div>
                            )}
                          </div>
                        )}

                        {shift.notes && (
                          <div className="mt-3 p-3 bg-muted/50 rounded">
                            <p className="text-sm">{shift.notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="allocation" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Staff Allocation</h2>
              <Button data-testid="button-auto-allocate">
                <UserCheckIcon className="mr-2 h-4 w-4" />
                Auto Allocate
              </Button>
            </div>

            <div className="grid gap-6">
              <Card data-testid="allocation-summary">
                <CardHeader>
                  <CardTitle>Allocation Summary</CardTitle>
                  <CardDescription>Overview of staff allocation and coverage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {shifts.filter(s => s.status === "confirmed").length}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">Confirmed</div>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {shifts.filter(s => s.status === "scheduled" && !s.assignedStaffId).length}
                      </div>
                      <div className="text-sm text-yellow-600 dark:text-yellow-400">Unassigned</div>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {shifts.filter(s => s.isUrgent).length}
                      </div>
                      <div className="text-sm text-red-600 dark:text-red-400">Urgent</div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {shifts.filter(s => s.shiftType === "cover").length}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Cover Shifts</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Unassigned Shifts */}
              <Card data-testid="unassigned-shifts">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircleIcon className="h-5 w-5 text-orange-500" />
                    Unassigned Shifts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {shifts.filter(s => !s.assignedStaffId).length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">All shifts are assigned!</p>
                  ) : (
                    <div className="space-y-2">
                      {shifts.filter(s => !s.assignedStaffId).map((shift) => (
                        <div key={shift.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium">
                              {shift.shiftDate ? format(new Date(shift.shiftDate), "MMM dd") : "Unknown Date"} • 
                              {shift.startTime} - {shift.endTime}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Participant ID: {shift.participantId}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={getShiftTypeColor(shift.shiftType || "regular")}>
                              {shift.shiftType}
                            </Badge>
                            {shift.isUrgent && <Badge variant="destructive">Urgent</Badge>}
                            <Button size="sm" variant="outline" data-testid={`assign-shift-${shift.id}`}>
                              Assign Staff
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Staff Availability</h2>
              <Dialog open={availabilityDialogOpen} onOpenChange={setAvailabilityDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-availability">
                    <ClockIcon className="mr-2 h-4 w-4" />
                    Add Availability
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Staff Availability</DialogTitle>
                  </DialogHeader>
                  <Form {...availabilityForm}>
                    <form onSubmit={availabilityForm.handleSubmit((data) => createAvailabilityMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={availabilityForm.control}
                        name="staffId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Staff Member</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-staff-availability">
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
                        control={availabilityForm.control}
                        name="dayOfWeek"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Day of Week</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger data-testid="select-day">
                                  <SelectValue placeholder="Select day" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="0">Sunday</SelectItem>
                                <SelectItem value="1">Monday</SelectItem>
                                <SelectItem value="2">Tuesday</SelectItem>
                                <SelectItem value="3">Wednesday</SelectItem>
                                <SelectItem value="4">Thursday</SelectItem>
                                <SelectItem value="5">Friday</SelectItem>
                                <SelectItem value="6">Saturday</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={availabilityForm.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
                              <FormControl>
                                <Input {...field} type="time" data-testid="input-avail-start" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={availabilityForm.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time</FormLabel>
                              <FormControl>
                                <Input {...field} type="time" data-testid="input-avail-end" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={availabilityForm.control}
                        name="maxHoursPerDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Hours Per Day</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="1" max="24" data-testid="input-max-hours" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={availabilityForm.control}
                        name="effectiveFrom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Effective From</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" data-testid="input-effective-from" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" disabled={createAvailabilityMutation.isPending} data-testid="button-submit-availability">
                        {createAvailabilityMutation.isPending ? "Adding..." : "Add Availability"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {availabilityLoading ? (
                <div className="text-center py-8" data-testid="loading-availability">Loading availability...</div>
              ) : availability.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="empty-availability">
                  No availability records found. Add staff availability to get started.
                </div>
              ) : (
                availability.map((avail) => (
                  <Card key={avail.id} data-testid={`availability-card-${avail.id}`}>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {getDayName(avail.dayOfWeek || 0)}
                          </CardTitle>
                          <CardDescription>
                            {avail.startTime} - {avail.endTime}
                          </CardDescription>
                        </div>
                        <Badge variant={avail.isAvailable ? "default" : "destructive"}>
                          {avail.isAvailable ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Staff ID:</span>
                          <span className="ml-2">{avail.staffId}</span>
                        </div>
                        <div>
                          <span className="font-medium">Max Hours:</span>
                          <span className="ml-2">{avail.maxHoursPerDay} hours/day</span>
                        </div>
                        {avail.preferredRegions && avail.preferredRegions.length > 0 && (
                          <div>
                            <span className="font-medium">Preferred Regions:</span>
                            <span className="ml-2">{avail.preferredRegions.join(", ")}</span>
                          </div>
                        )}
                        {avail.effectiveFrom && (
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <span>Effective from: {format(new Date(avail.effectiveFrom), "MMM dd, yyyy")}</span>
                          </div>
                        )}
                        {avail.notes && (
                          <div className="mt-3 p-3 bg-muted/50 rounded">
                            <p className="text-sm">{avail.notes}</p>
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