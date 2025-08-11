import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertProgressNoteSchema, type InsertProgressNote } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface ProgressNoteFormProps {
  onClose: () => void;
}

export default function ProgressNoteForm({ onClose }: ProgressNoteFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: participants } = useQuery({
    queryKey: ["/api/participants"],
    retry: false,
  });

  const { data: services } = useQuery({
    queryKey: ["/api/services"],
    retry: false,
  });

  const { data: staff } = useQuery({
    queryKey: ["/api/staff"],
    retry: false,
  });

  const form = useForm<InsertProgressNote>({
    resolver: zodResolver(insertProgressNoteSchema),
    defaultValues: {
      goalProgress: "",
      activities: "",
      outcomes: "",
      concerns: "",
      nextSteps: "",
      participantFeedback: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertProgressNote) => {
      const response = await apiRequest("POST", "/api/progress-notes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress-notes"] });
      toast({
        title: "Success",
        description: "Progress note created successfully",
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
        description: "Failed to create progress note",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: InsertProgressNote) => {
    setIsSubmitting(true);
    try {
      createMutation.mutate(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="participantId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Participant *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-participant">
                    <SelectValue placeholder="Select participant" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {participants?.map((participant: any) => (
                    <SelectItem key={participant.id} value={participant.id}>
                      {participant.firstName} {participant.lastName} - {participant.ndisNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="serviceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Related Service</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger data-testid="select-service">
                      <SelectValue placeholder="Select service (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {services?.map((service: any) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.serviceName} - {new Date(service.scheduledDate).toLocaleDateString()}
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
            name="staffId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Staff Member *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-staff">
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {staff?.map((member: any) => (
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
        </div>

        <FormField
          control={form.control}
          name="goalProgress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal Progress</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  rows={4} 
                  placeholder="Describe the participant's progress towards their goals..."
                  data-testid="textarea-goal-progress"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="activities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Activities Undertaken</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  rows={4} 
                  placeholder="Detail the activities that took place during this session..."
                  data-testid="textarea-activities"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="outcomes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Outcomes Achieved</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  rows={3} 
                  placeholder="Describe the outcomes and achievements from this session..."
                  data-testid="textarea-outcomes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="concerns"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Concerns or Issues</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  rows={3} 
                  placeholder="Note any concerns or issues that arose..."
                  data-testid="textarea-concerns"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nextSteps"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Next Steps</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  rows={3} 
                  placeholder="Outline the next steps and future planning..."
                  data-testid="textarea-next-steps"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="participantFeedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Participant Feedback</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  rows={3} 
                  placeholder="Record any feedback provided by the participant..."
                  data-testid="textarea-participant-feedback"
                />
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
            disabled={isSubmitting || createMutation.isPending}
            className="bg-ndis-primary hover:bg-blue-700"
            data-testid="button-save-note"
          >
            {isSubmitting || createMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Saving...
              </>
            ) : (
              "Save Progress Note"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
