import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
// Sidebar and Header are provided by AppLayout wrapper
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ProgressNoteForm from "@/components/forms/progress-note-form";
import type { ProgressNote } from "@shared/schema";

export default function ProgressNotes() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

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

  const { data: progressNotes, isLoading: notesLoading } = useQuery({
    queryKey: ["/api/progress-notes"],
    enabled: isAuthenticated,
    retry: false,
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

  const filteredNotes = progressNotes?.filter((note: ProgressNote) =>
    note.goalProgress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.activities?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div className="mb-6 flex items-center justify-between">
            <Input
              type="text"
              placeholder="Search progress notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80"
              data-testid="input-search-notes"
            />
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-blue-700" data-testid="button-add-note">
                  <i className="fas fa-edit mr-2"></i>
                  Add Progress Note
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Add Progress Note</DialogTitle>
                </DialogHeader>
                <ProgressNoteForm onClose={() => setIsFormOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {notesLoading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredNotes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <i className="fas fa-clipboard-list text-gray-400 text-4xl mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No progress notes found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? "No notes match your search criteria." : "Get started by adding your first progress note."}
                </p>
                {!searchTerm && (
                  <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-blue-700" data-testid="button-add-first-note">
                        <i className="fas fa-edit mr-2"></i>
                        Add First Progress Note
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Add Progress Note</DialogTitle>
                      </DialogHeader>
                      <ProgressNoteForm onClose={() => setIsFormOpen(false)} />
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredNotes.map((note: ProgressNote) => (
                <Card key={note.id} className="hover:shadow-md transition-shadow" data-testid={`card-note-${note.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Progress Note - {new Date(note.noteDate).toLocaleDateString()}
                      </CardTitle>
                      <Button variant="outline" size="sm" data-testid={`button-edit-note-${note.id}`}>
                        <i className="fas fa-edit mr-1"></i>
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {note.goalProgress && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Goal Progress</h4>
                          <p className="text-gray-700">{note.goalProgress}</p>
                        </div>
                      )}

                      {note.activities && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Activities</h4>
                          <p className="text-gray-700">{note.activities}</p>
                        </div>
                      )}

                      {note.outcomes && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Outcomes</h4>
                          <p className="text-gray-700">{note.outcomes}</p>
                        </div>
                      )}

                      {note.concerns && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Concerns</h4>
                          <p className="text-gray-700 text-red-600">{note.concerns}</p>
                        </div>
                      )}

                      {note.nextSteps && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
                          <p className="text-gray-700">{note.nextSteps}</p>
                        </div>
                      )}

                      {note.participantFeedback && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Participant Feedback</h4>
                          <p className="text-gray-700 italic">{note.participantFeedback}</p>
                        </div>
                      )}

                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                          Created: {new Date(note.createdAt!).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
    </div>
  );
}
