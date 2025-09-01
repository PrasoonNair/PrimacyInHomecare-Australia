import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Star, 
  CheckCircle,
  AlertCircle,
  Send,
  FileText,
  Heart,
  Users,
  Target,
  TrendingUp
} from 'lucide-react';

interface ClientExitSurveyFormProps {
  participantId?: string;
  onComplete?: () => void;
}

interface SurveyFormData {
  overallSatisfaction: number;
  serviceQualityRating: number;
  staffProfessionalismRating: number;
  communicationRating: number;
  valueForMoneyRating: number;
  goalAchievementRating: number;
  wouldRecommendService: boolean;
  reasonForLeaving: string;
  improvementSuggestions: string;
  additionalComments: string;
  completedBy: string;
  experienceCategories: string[];
}

const RATING_QUESTIONS = [
  { 
    key: 'overallSatisfaction', 
    label: 'Overall service satisfaction', 
    description: 'How satisfied were you with our overall service delivery?',
    icon: Heart
  },
  { 
    key: 'serviceQualityRating', 
    label: 'Quality of support services', 
    description: 'Rate the quality and effectiveness of support provided',
    icon: Star
  },
  { 
    key: 'staffProfessionalismRating', 
    label: 'Staff professionalism & care', 
    description: 'How professional and caring were our support workers?',
    icon: Users
  },
  { 
    key: 'communicationRating', 
    label: 'Communication & coordination', 
    description: 'Rate our communication and service coordination',
    icon: MessageSquare
  },
  { 
    key: 'valueForMoneyRating', 
    label: 'Value for money', 
    description: 'Rate the value provided relative to NDIS funding used',
    icon: TrendingUp
  },
  { 
    key: 'goalAchievementRating', 
    label: 'Goal achievement & outcomes', 
    description: 'How well did we help you achieve your NDIS goals?',
    icon: Target
  }
];

const LEAVING_REASONS = [
  'NDIS plan ended',
  'Moving to different location',
  'Changing to different provider',
  'Service no longer needed',
  'Dissatisfied with service quality',
  'Cost or funding concerns',
  'Staff turnover issues',
  'Communication problems',
  'Scheduling difficulties',
  'Personal circumstances changed',
  'Other (please specify)'
];

const EXPERIENCE_CATEGORIES = [
  'Goal Planning & Review',
  'Service Coordination',
  'Support Worker Quality',
  'Communication & Updates',
  'Flexibility & Responsiveness',
  'Cultural Sensitivity',
  'Family Involvement',
  'Progress Tracking',
  'Administrative Processes',
  'Complaint Handling'
];

export function ClientExitSurveyForm({ participantId, onComplete }: ClientExitSurveyFormProps) {
  const [formData, setFormData] = useState<SurveyFormData>({
    overallSatisfaction: 0,
    serviceQualityRating: 0,
    staffProfessionalismRating: 0,
    communicationRating: 0,
    valueForMoneyRating: 0,
    goalAchievementRating: 0,
    wouldRecommendService: false,
    reasonForLeaving: '',
    improvementSuggestions: '',
    additionalComments: '',
    completedBy: 'participant',
    experienceCategories: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Submit survey mutation
  const submitSurveyMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest('/api/participants/exit-surveys', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({
        title: "Survey Submitted",
        description: "Thank you for your feedback. Your responses help us improve our services.",
      });
      if (onComplete) onComplete();
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your survey. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleRatingChange = (key: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCategoryToggle = (category: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      experienceCategories: checked
        ? [...prev.experienceCategories, category]
        : prev.experienceCategories.filter(c => c !== category)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitSurveyMutation.mutateAsync({
        participantId,
        ...formData,
        submittedAt: new Date().toISOString()
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return formData.overallSatisfaction > 0 && formData.reasonForLeaving;
      case 2:
        return RATING_QUESTIONS.slice(1).every(q => formData[q.key as keyof SurveyFormData] > 0);
      case 3:
        return true; // Optional step
      default:
        return false;
    }
  };

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (value: number) => void; label: string }) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1 transition-colors ${
              star <= value ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
            }`}
            data-testid={`star-${label.toLowerCase().replace(/\s+/g, '-')}-${star}`}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {value > 0 ? `${value}/5` : 'Not rated'}
        </span>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="client-exit-survey">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Client Exit Survey</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Your feedback about your experience with Primacy Care Australia is important to us. 
              This survey helps us improve our services for all NDIS participants. Your responses are confidential 
              and will be used to enhance our service delivery.
            </AlertDescription>
          </Alert>

          {/* Progress indicator */}
          <div className="mt-6 flex items-center space-x-4">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step ? <CheckCircle className="h-4 w-4" /> : step}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {step === 1 ? 'General Feedback' : step === 2 ? 'Service Ratings' : 'Additional Comments'}
                </span>
                {step < 3 && <div className="w-8 h-px bg-gray-300 mx-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: General Questions */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>General Service Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-semibold">Overall service satisfaction</Label>
              <p className="text-sm text-gray-600 mb-3">How satisfied were you with our overall service delivery?</p>
              <StarRating
                value={formData.overallSatisfaction}
                onChange={(value) => handleRatingChange('overallSatisfaction', value)}
                label="overall satisfaction"
              />
            </div>

            <div>
              <Label htmlFor="reason-leaving" className="text-base font-semibold">Primary reason for leaving our service</Label>
              <p className="text-sm text-gray-600 mb-3">What was the main reason for ending your service with us?</p>
              <Select value={formData.reasonForLeaving} onValueChange={(value) => setFormData(prev => ({ ...prev, reasonForLeaving: value }))}>
                <SelectTrigger data-testid="select-leaving-reason">
                  <SelectValue placeholder="Select primary reason" />
                </SelectTrigger>
                <SelectContent>
                  {LEAVING_REASONS.map(reason => (
                    <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-semibold">Would you recommend our services to other NDIS participants?</Label>
              <RadioGroup
                value={formData.wouldRecommendService.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, wouldRecommendService: value === 'true' }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="recommend-yes" />
                  <Label htmlFor="recommend-yes">Yes, I would recommend Primacy Care Australia</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="recommend-no" />
                  <Label htmlFor="recommend-no">No, I would not recommend our services</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-semibold">Who is completing this survey?</Label>
              <RadioGroup
                value={formData.completedBy}
                onValueChange={(value) => setFormData(prev => ({ ...prev, completedBy: value }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="participant" id="completed-participant" />
                  <Label htmlFor="completed-participant">Participant</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="guardian" id="completed-guardian" />
                  <Label htmlFor="completed-guardian">Guardian/Family Member</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advocate" id="completed-advocate" />
                  <Label htmlFor="completed-advocate">Advocate/Support Person</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Detailed Ratings */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Service Ratings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {RATING_QUESTIONS.slice(1).map(question => {
              const Icon = question.icon;
              return (
                <div key={question.key} className="border-b pb-6 last:border-b-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon className="h-5 w-5 text-blue-600" />
                    <Label className="text-base font-semibold">{question.label}</Label>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{question.description}</p>
                  <StarRating
                    value={formData[question.key as keyof SurveyFormData] as number}
                    onChange={(value) => handleRatingChange(question.key, value)}
                    label={question.label}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Additional Feedback */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Feedback & Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-semibold">Service areas for improvement</Label>
              <p className="text-sm text-gray-600 mb-3">Which areas do you think we should focus on improving? (Select all that apply)</p>
              <div className="grid grid-cols-2 gap-3">
                {EXPERIENCE_CATEGORIES.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={formData.experienceCategories.includes(category)}
                      onCheckedChange={(checked) => handleCategoryToggle(category, !!checked)}
                    />
                    <Label htmlFor={`category-${category}`} className="text-sm">{category}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="improvement-suggestions" className="text-base font-semibold">Specific improvement suggestions</Label>
              <p className="text-sm text-gray-600 mb-3">What specific changes would improve our services for future participants?</p>
              <Textarea
                id="improvement-suggestions"
                value={formData.improvementSuggestions}
                onChange={(e) => setFormData(prev => ({ ...prev, improvementSuggestions: e.target.value }))}
                placeholder="Share your suggestions for service improvements..."
                rows={4}
                data-testid="textarea-suggestions"
              />
            </div>

            <div>
              <Label htmlFor="additional-comments" className="text-base font-semibold">Additional comments</Label>
              <p className="text-sm text-gray-600 mb-3">Is there anything else you'd like to share about your experience with our services?</p>
              <Textarea
                id="additional-comments"
                value={formData.additionalComments}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalComments: e.target.value }))}
                placeholder="Any other feedback or comments..."
                rows={4}
                data-testid="textarea-comments"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>

        <div className="flex space-x-2">
          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!isStepComplete(currentStep)}
              data-testid="button-next"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || submitSurveyMutation.isPending}
              data-testid="button-submit-survey"
            >
              {isSubmitting ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Survey
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Thank you message */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-center space-x-2 text-blue-800">
            <Heart className="h-4 w-4" />
            <span className="text-sm font-medium">
              Thank you for helping us improve our NDIS services. Your feedback makes a difference for future participants.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}