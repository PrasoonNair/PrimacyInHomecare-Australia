import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Participant } from "@shared/schema";

export default function RecentParticipants() {
  const { data: participants, isLoading } = useQuery<Participant[]>({
    queryKey: ["/api/participants"],
    retry: false,
  });

  const recentParticipants = participants?.slice(0, 3) || [];

  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
        <CardHeader className="px-6 py-4 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-800">Recent Participants</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">Recent Participants</CardTitle>
          <Link href="/participants">
            <Button variant="ghost" className="text-ndis-primary hover:text-blue-700 text-sm font-medium" data-testid="button-view-all-participants">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {recentParticipants.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-users text-gray-400 text-3xl mb-4"></i>
            <p className="text-gray-600">No participants found</p>
            <Link href="/participants">
              <Button className="mt-4 bg-ndis-primary hover:bg-blue-700" data-testid="button-add-first-participant">
                Add First Participant
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentParticipants.map((participant: Participant) => (
              <div 
                key={participant.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                data-testid={`card-recent-participant-${participant.id}`}
              >
                <div className="flex items-center space-x-4">
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
                    <p className="font-medium text-gray-900" data-testid={`text-participant-name-${participant.id}`}>
                      {participant.firstName} {participant.lastName}
                    </p>
                    <p className="text-sm text-gray-600" data-testid={`text-participant-ndis-${participant.id}`}>
                      NDIS: {participant.ndisNumber}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={participant.isActive ? "default" : "secondary"}>
                    {participant.isActive ? "Active Plan" : "Inactive"}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">
                    Updated: {new Date(participant.updatedAt!).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
