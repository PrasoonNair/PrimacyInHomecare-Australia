import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertParticipantSchema, type InsertParticipant, type Participant } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface ParticipantFormProps {
  participant?: Participant | null;
  onClose: () => void;
}

export default function ParticipantForm({ participant, onClose }: ParticipantFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InsertParticipant>({
    resolver: zodResolver(insertParticipantSchema),
    defaultValues: {
      firstName: participant?.firstName || "",
      lastName: participant?.lastName || "",
      ndisNumber: participant?.ndisNumber || "",
      dateOfBirth: participant?.dateOfBirth || "",
      phone: participant?.phone || "",
      email: participant?.email || "",
      address: participant?.address || "",
      emergencyContact: participant?.emergencyContact || "",
      primaryDisability: participant?.primaryDisability || "",
      communicationNeeds: participant?.communicationNeeds || "",
      culturalBackground: participant?.culturalBackground || "",
      preferredLanguage: participant?.preferredLanguage || "English",
      profileImageUrl: participant?.profileImageUrl || "",
      isActive: participant?.isActive ?? true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertParticipant) => {
      const response = await apiRequest("POST", "/api/participants", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/participants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Participant created successfully",
      });
      onClose();
    },
    onError: (error) => {
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
        description: "Failed to create participant",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertParticipant) => {
      const response = await apiRequest("PUT", `/api/participants/${participant!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/participants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Participant updated successfully",
      });
      onClose();
    },
    onError: (error) => {
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
        description: "Failed to update participant",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: InsertParticipant) => {
    setIsSubmitting(true);
    try {
      if (participant) {
        updateMutation.mutate(data);
      } else {
        createMutation.mutate(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name *</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-first-name" />
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
                  <Input {...field} data-testid="input-last-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="ndisNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NDIS Number *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., 4300123456" data-testid="input-ndis-number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    value={field.value || ''} 
                    data-testid="input-date-of-birth" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferredLanguage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Language</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger data-testid="select-preferred-language">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Mandarin">Mandarin</SelectItem>
                    <SelectItem value="Arabic">Arabic</SelectItem>
                    <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                    <SelectItem value="Greek">Greek</SelectItem>
                    <SelectItem value="Italian">Italian</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    value={field.value || ''} 
                    type="tel" 
                    data-testid="input-phone" 
                  />
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
                  <Input 
                    {...field} 
                    value={field.value || ''} 
                    type="email" 
                    data-testid="input-email" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value || ''} rows={3} data-testid="textarea-address" />
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
                <Textarea {...field} value={field.value || ''} rows={2} data-testid="textarea-emergency-contact" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="primaryDisability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Disability</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} data-testid="input-primary-disability" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="communicationNeeds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Communication Needs</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value || ''} rows={2} data-testid="textarea-communication-needs" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="culturalBackground"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cultural Background</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} data-testid="input-cultural-background" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
            className="bg-ndis-primary hover:bg-blue-700"
            data-testid="button-save-participant"
          >
            {isSubmitting || createMutation.isPending || updateMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                {participant ? "Updating..." : "Creating..."}
              </>
            ) : (
              participant ? "Update Participant" : "Create Participant"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
