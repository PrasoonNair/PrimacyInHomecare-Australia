import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ParticipantForm from "@/components/forms/participant-form";
import type { Participant } from "@shared/schema";

export default function Participants() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: participants, isLoading: participantsLoading } = useQuery({
    queryKey: ["/api/participants"],
    enabled: isAuthenticated,
    retry: false,
  });

  const deleteParticipantMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/participants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/participants"] });
      toast({
        title: "Success",
        description: "Participant deactivated successfully",
      });
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
        description: "Failed to deactivate participant",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const filteredParticipants = participants?.filter((participant: Participant) =>
    `${participant.firstName} ${participant.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.ndisNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEditParticipant = (participant: Participant) => {
    setEditingParticipant(participant);
    setIsFormOpen(true);
  };

  const handleDeleteParticipant = (id: string) => {
    if (confirm("Are you sure you want to deactivate this participant?")) {
      deleteParticipantMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingParticipant(null);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <Header title="Participants" subtitle="Manage participant profiles and information" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Input
                type="text"
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80"
                data-testid="input-search-participants"
              />
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-blue-700" data-testid="button-add-participant">
                  <i className="fas fa-user-plus mr-2"></i>
                  Add New Participant
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingParticipant ? "Edit Participant" : "Add New Participant"}
                  </DialogTitle>
                </DialogHeader>
                <ParticipantForm 
                  participant={editingParticipant} 
                  onClose={handleFormClose}
                />
              </DialogContent>
            </Dialog>
          </div>

          {participantsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredParticipants.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <i className="fas fa-users text-gray-400 text-4xl mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No participants found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? "No participants match your search criteria." : "Get started by adding your first participant."}
                </p>
                {!searchTerm && (
                  <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-blue-700" data-testid="button-add-first-participant">
                        <i className="fas fa-user-plus mr-2"></i>
                        Add First Participant
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Participant</DialogTitle>
                      </DialogHeader>
                      <ParticipantForm onClose={handleFormClose} />
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredParticipants.map((participant: Participant) => (
                <Card key={participant.id} className="hover:shadow-md transition-shadow" data-testid={`card-participant-${participant.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {participant.profileImageUrl ? (
                          <img 
                            src={participant.profileImageUrl} 
                            alt={`${participant.firstName} ${participant.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                            data-testid={`img-participant-${participant.id}`}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <i className="fas fa-user text-gray-400"></i>
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg" data-testid={`text-participant-name-${participant.id}`}>
                            {participant.firstName} {participant.lastName}
                          </CardTitle>
                          <p className="text-sm text-gray-600" data-testid={`text-ndis-number-${participant.id}`}>
                            NDIS: {participant.ndisNumber}
                          </p>
                        </div>
                      </div>
                      <Badge variant={participant.isActive ? "default" : "secondary"}>
                        {participant.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {participant.primaryDisability && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Primary Disability:</strong> {participant.primaryDisability}
                      </p>
                    )}
                    {participant.phone && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Phone:</strong> {participant.phone}
                      </p>
                    )}
                    {participant.email && (
                      <p className="text-sm text-gray-600 mb-4">
                        <strong>Email:</strong> {participant.email}
                      </p>
                    )}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditParticipant(participant)}
                        data-testid={`button-edit-participant-${participant.id}`}
                      >
                        <i className="fas fa-edit mr-1"></i>
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteParticipant(participant.id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={deleteParticipantMutation.isPending}
                        data-testid={`button-delete-participant-${participant.id}`}
                      >
                        <i className="fas fa-trash mr-1"></i>
                        Deactivate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
