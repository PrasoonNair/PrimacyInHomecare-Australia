import { useParams } from 'wouter';
import { ExitSurveyForm } from '@/components/hr/exit-survey-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Building2, 
  Shield,
  CheckCircle
} from 'lucide-react';

export default function ExitSurveyPage() {
  const { invitationId } = useParams();

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
                  <p className="text-sm text-gray-600">Exit Survey</p>
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
                and will help us improve our workplace for current and future employees. This survey 
                is confidential and will take approximately 10-15 minutes to complete.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Survey Form */}
        <ExitSurveyForm 
          staffId={invitationId || 'anonymous'} 
          onComplete={() => {
            // Show completion message
            window.location.href = '/exit-survey/complete';
          }}
        />

        {/* Footer */}
        <Card className="mt-8">
          <CardContent className="text-center py-6">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>
                This survey is protected by privacy legislation. Your responses will be used 
                to improve workplace conditions and will remain confidential.
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
            Your exit survey has been submitted successfully. We appreciate you taking the time 
            to share your thoughts and experiences with us.
          </p>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Your feedback will be reviewed by our HR team and used to improve our workplace 
              environment for all employees.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}