import { useParams, useLocation } from 'wouter';
import { ClientExitSurveyForm } from '@/components/participants/client-exit-survey';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Building2, 
  Shield,
  CheckCircle,
  Heart,
  Star
} from 'lucide-react';

export default function ClientExitSurveyPage() {
  const { invitationId } = useParams();
  const [location] = useLocation();

  // Check if this is the completion page
  const isCompletePage = location.includes('/complete');

  if (isCompletePage) {
    return <ExitSurveyComplete />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <CardTitle className="text-2xl">Primacy Care Australia</CardTitle>
                  <p className="text-sm text-gray-600">Client Exit Survey</p>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="mx-auto">
              <Shield className="h-3 w-3 mr-1" />
              Confidential Survey
            </Badge>
          </CardHeader>
          <CardContent>
            <Alert>
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>
                Thank you for taking the time to complete this exit survey. Your feedback is valuable 
                and will help us improve our NDIS services for current and future participants. 
                This survey is confidential and will take approximately 10-15 minutes to complete.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Survey Form */}
        <ClientExitSurveyForm 
          participantId={invitationId || 'anonymous'} 
          onComplete={() => {
            // Show completion message
            window.location.href = '/client-exit-survey/complete';
          }}
        />

        {/* Footer */}
        <Card className="mt-8">
          <CardContent className="text-center py-6">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>
                This survey is protected by privacy legislation. Your responses will be used 
                to improve our NDIS services and will remain confidential.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Exit Survey Completion Page
export function ExitSurveyComplete() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
      <Card className="max-w-2xl">
        <CardContent className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
          <CardTitle className="text-2xl mb-4">Thank You for Your Feedback</CardTitle>
          <p className="text-gray-600 mb-6">
            Your client exit survey has been submitted successfully. We appreciate you taking the time 
            to share your thoughts and experiences with Primacy Care Australia.
          </p>
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Heart className="h-5 w-5 text-blue-600" />
              <span className="text-blue-800 font-medium">Your feedback makes a difference</span>
            </div>
            <p className="text-sm text-blue-800">
              Your feedback will be reviewed by our service delivery team and used to improve our NDIS 
              services for all participants. We are committed to continuous improvement based on participant experiences.
            </p>
          </div>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Your voice matters</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Data secure & private</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}