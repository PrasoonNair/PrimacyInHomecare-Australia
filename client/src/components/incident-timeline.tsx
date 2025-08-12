import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, User, Clock, AlertTriangle, CheckCircle, XCircle, TrendingUp, MessageSquare, Upload } from "lucide-react";
import type { IncidentTimelineEntry } from "@shared/schema";

interface IncidentTimelineProps {
  incidentId: string;
}

export default function IncidentTimeline({ incidentId }: IncidentTimelineProps) {
  const { data: timeline = [], isLoading } = useQuery<IncidentTimelineEntry[]>({
    queryKey: [`/api/incidents/${incidentId}/timeline`],
  });

  const getActionIcon = (action: string) => {
    if (action.includes("approval")) {
      if (action.includes("approved")) return <CheckCircle className="h-4 w-4 text-green-600" />;
      if (action.includes("rejected")) return <XCircle className="h-4 w-4 text-red-600" />;
      if (action.includes("escalated")) return <TrendingUp className="h-4 w-4 text-orange-600" />;
      if (action.includes("request_info")) return <MessageSquare className="h-4 w-4 text-blue-600" />;
    }
    
    switch (action) {
      case "incident_reported":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "document_uploaded":
        return <Upload className="h-4 w-4 text-blue-600" />;
      case "status_changed":
        return <Clock className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("approval")) {
      if (action.includes("approved")) return "bg-green-100 text-green-800";
      if (action.includes("rejected")) return "bg-red-100 text-red-800";
      if (action.includes("escalated")) return "bg-orange-100 text-orange-800";
      if (action.includes("request_info")) return "bg-blue-100 text-blue-800";
    }
    
    switch (action) {
      case "incident_reported":
        return "bg-red-100 text-red-800";
      case "document_uploaded":
        return "bg-blue-100 text-blue-800";
      case "status_changed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatAction = (action: string) => {
    return action
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading timeline...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Incident Timeline</CardTitle>
        <CardDescription>
          Complete history of all actions taken for this incident
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {timeline.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No timeline entries yet</p>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              <div className="space-y-4">
                {timeline.map((entry, index) => (
                  <div key={entry.id} className="relative flex gap-4" data-testid={`timeline-entry-${index}`}>
                    {/* Timeline dot */}
                    <div className="relative z-10 flex items-center justify-center w-10 h-10 bg-white border-2 border-gray-300 rounded-full">
                      {getActionIcon(entry.action)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pb-4">
                      <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <Badge className={getActionColor(entry.action)}>
                            {formatAction(entry.action)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2">{entry.description}</p>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <User className="h-3 w-3" />
                          <span>{entry.performedBy}</span>
                          <span>•</span>
                          <span>{entry.performedByRole}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}