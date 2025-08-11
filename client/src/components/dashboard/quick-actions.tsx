import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function QuickActions() {
  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-800">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        <Link href="/participants">
          <Button 
            className="w-full flex items-center justify-center px-4 py-3 bg-ndis-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
            data-testid="button-add-participant"
          >
            <i className="fas fa-user-plus mr-2"></i>
            Add New Participant
          </Button>
        </Link>
        
        <Link href="/services">
          <Button 
            className="w-full flex items-center justify-center px-4 py-3 bg-ndis-secondary text-white rounded-lg hover:bg-green-700 transition-colors"
            data-testid="button-book-service"
          >
            <i className="fas fa-calendar-plus mr-2"></i>
            Book Service
          </Button>
        </Link>
        
        <Link href="/progress-notes">
          <Button 
            className="w-full flex items-center justify-center px-4 py-3 bg-ndis-accent text-white rounded-lg hover:bg-orange-600 transition-colors"
            data-testid="button-add-progress-note"
          >
            <i className="fas fa-edit mr-2"></i>
            Add Progress Note
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
