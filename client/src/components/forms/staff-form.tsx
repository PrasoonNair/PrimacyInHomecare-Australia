import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { insertStaffSchema, type InsertStaff, type Staff } from "@shared/schema";
import { User, Mail, Phone, MapPin, Briefcase, Calendar, DollarSign, Award } from "lucide-react";

interface StaffFormProps {
  staff?: Staff | null;
  onClose: () => void;
}

export default function StaffForm({ staff, onClose }: StaffFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InsertStaff>({
    resolver: zodResolver(insertStaffSchema),
    defaultValues: {
      firstName: staff?.firstName || "",
      lastName: staff?.lastName || "",
      email: staff?.email || "",
      phone: staff?.phone || "",
      address: staff?.address || "",
      dateOfBirth: staff?.dateOfBirth || "",
      position: staff?.position || "",
      department: staff?.department || "",
      qualifications: staff?.qualifications || "",
      startDate: staff?.startDate || new Date().toISOString().split('T')[0],
      schacsLevel: staff?.schacsLevel || "",
      hourlyRate: staff?.hourlyRate || "",
      emergencyContact: staff?.emergencyContact || "",
      isActive: staff?.isActive ?? true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertStaff) => {
      const response = await apiRequest("/api/staff", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Staff member created successfully",
      });
      onClose();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create staff member",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertStaff) => {
      const response = await apiRequest(`/api/staff/${staff!.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Staff member updated successfully",
      });
      onClose();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update staff member",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: InsertStaff) => {
    setIsSubmitting(true);
    try {
      if (staff) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="John" data-testid="input-staff-firstName" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Doe" data-testid="input-staff-lastName" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input {...field} type="date" data-testid="input-staff-dateOfBirth" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contact Information
          </h3>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="john.doe@example.com" data-testid="input-staff-email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="0400 000 000" data-testid="input-staff-phone" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="123 Main St, Sydney NSW 2000" data-testid="input-staff-address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emergencyContact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Contact</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Jane Doe - 0400 000 001" data-testid="input-staff-emergencyContact" />
                </FormControl>
                <FormDescription>Name and phone number of emergency contact</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Employment Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Employment Information
          </h3>

          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Support Worker" data-testid="input-staff-position" />
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-staff-department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="intake">Intake</SelectItem>
                    <SelectItem value="hr-recruitment">HR & Recruitment</SelectItem>
                    <SelectItem value="finance">Finance & Awards</SelectItem>
                    <SelectItem value="service-delivery">Service Delivery</SelectItem>
                    <SelectItem value="compliance-quality">Compliance & Quality</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date *</FormLabel>
                <FormControl>
                  <Input {...field} type="date" data-testid="input-staff-startDate" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Qualifications & Awards */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award className="w-5 h-5" />
            Qualifications & Awards
          </h3>

          <FormField
            control={form.control}
            name="qualifications"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Qualifications</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Certificate IV in Disability Support" data-testid="input-staff-qualifications" />
                </FormControl>
                <FormDescription>Relevant certifications and qualifications</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="schacsLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SCHADS Award Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-staff-schacsLevel">
                      <SelectValue placeholder="Select SCHADS level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="level1">Level 1 - Support Worker</SelectItem>
                    <SelectItem value="level2">Level 2 - Senior Support Worker</SelectItem>
                    <SelectItem value="level3">Level 3 - Team Leader</SelectItem>
                    <SelectItem value="level4">Level 4 - Coordinator</SelectItem>
                    <SelectItem value="level5">Level 5 - Manager</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>SCHADS Award classification level</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hourlyRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hourly Rate</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input {...field} className="pl-9" placeholder="32.50" data-testid="input-staff-hourlyRate" />
                  </div>
                </FormControl>
                <FormDescription>Base hourly rate (AUD)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Status */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="checkbox-staff-isActive"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Active Staff Member</FormLabel>
                <FormDescription>
                  Uncheck this box to deactivate the staff member
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
            data-testid="button-submit-staff"
          >
            {isSubmitting || createMutation.isPending || updateMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                {staff ? "Updating..." : "Creating..."}
              </>
            ) : (
              staff ? "Update Staff Member" : "Create Staff Member"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}