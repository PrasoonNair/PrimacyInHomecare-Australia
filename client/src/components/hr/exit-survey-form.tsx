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
  FileText
} from 'lucide-react';

interface ExitSurveyFormProps {
  staffId?: string;
  onComplete?: () => void;
}

interface SurveyFormData {
  overallSatisfaction: number;
  reasonForLeaving: string;
  workEnvironmentRating: number;
  managementRating: number;
  careerDevelopmentRating: number;
  compensationRating: number;
  workLifeBalanceRating: number;
  wouldRecommendCompany: boolean;
  improvementSuggestions: string;
  additionalComments: string;
  feedbackCategories: string[];
}

const RATING_QUESTIONS = [
  { key: 'overallSatisfaction', label: 'Overall job satisfaction', description: 'How satisfied were you with your overall experience?' },
  { key: 'workEnvironmentRating', label: 'Work environment', description: 'Rate the physical and cultural work environment' },
  { key: 'managementRating', label: 'Management support', description: 'How supportive was your direct manager?' },
  { key: 'careerDevelopmentRating', label: 'Career development', description: 'Rate opportunities for growth and development' },
  { key: 'compensationRating', label: 'Compensation & benefits', description: 'How competitive was your compensation package?' },
  { key: 'workLifeBalanceRating', label: 'Work-life balance', description: 'Rate your ability to balance work and personal life' }
];

const LEAVING_REASONS = [
  'Better career opportunity',
  'Higher compensation elsewhere',
  'Poor work-life balance',
  'Lack of career advancement',
  'Management or leadership issues',
  'Company culture concerns',
  'Insufficient training or support',
  'Job role mismatch',
  'Personal/family reasons',
  'Relocation',
  'Retirement',
  'Other'
];

const IMPROVEMENT_CATEGORIES = [
  'Communication',
  'Training & Development',
  'Recognition & Rewards',
  'Work Environment',
  'Management Practices',
  'Company Policies',
  'Technology & Tools',
  'Team Collaboration',
  'Workload Management',
  'Compensation & Benefits'
];

export function ExitSurveyForm({ staffId, onComplete }: ExitSurveyFormProps) {
  const [formData, setFormData] = useState<SurveyFormData>({
    overallSatisfaction: 0,
    reasonForLeaving: '',
    workEnvironmentRating: 0,
    managementRating: 0,
    careerDevelopmentRating: 0,
    compensationRating: 0,
    workLifeBalanceRating: 0,
    wouldRecommendCompany: false,
    improvementSuggestions: '',
    additionalComments: '',
    feedbackCategories: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Submit survey mutation
  const submitSurveyMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest('/api/hr/exit-surveys', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({
        title: "Survey Submitted",
        description: "Thank you for your feedback. Your responses have been recorded.",
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
      feedbackCategories: checked
        ? [...prev.feedbackCategories, category]
        : prev.feedbackCategories.filter(c => c !== category)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitSurveyMutation.mutateAsync({
        staffId,
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
    <div className="max-w-4xl mx-auto space-y-6" data-testid="exit-survey-form">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Exit Survey</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Your feedback is valuable to us. This survey is confidential and will help us improve our workplace. 
              Please take a few minutes to share your honest thoughts and experiences.
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
                  {step === 1 ? 'General' : step === 2 ? 'Detailed Ratings' : 'Additional Feedback'}
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
            <CardTitle>General Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-semibold">Overall job satisfaction</Label>
              <p className="text-sm text-gray-600 mb-3">How satisfied were you with your overall experience at Primacy Care Australia?</p>
              <StarRating
                value={formData.overallSatisfaction}
                onChange={(value) => handleRatingChange('overallSatisfaction', value)}
                label="overall satisfaction"
              />
            </div>

            <div>
              <Label htmlFor="reason-leaving" className="text-base font-semibold">Primary reason for leaving</Label>
              <p className="text-sm text-gray-600 mb-3">What was the main factor in your decision to leave?</p>
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
              <Label className="text-base font-semibold">Would you recommend Primacy Care Australia as a place to work?</Label>
              <RadioGroup
                value={formData.wouldRecommendCompany.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, wouldRecommendCompany: value === 'true' }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="recommend-yes" />
                  <Label htmlFor="recommend-yes">Yes, I would recommend this company</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="recommend-no" />
                  <Label htmlFor="recommend-no">No, I would not recommend this company</Label>
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
            <CardTitle>Detailed Experience Ratings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {RATING_QUESTIONS.slice(1).map(question => (
              <div key={question.key}>
                <Label className="text-base font-semibold">{question.label}</Label>
                <p className="text-sm text-gray-600 mb-3">{question.description}</p>
                <StarRating
                  value={formData[question.key as keyof SurveyFormData] as number}
                  onChange={(value) => handleRatingChange(question.key, value)}
                  label={question.label}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Additional Feedback */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-semibold">Areas for improvement</Label>
              <p className="text-sm text-gray-600 mb-3">Which areas do you think the company should focus on improving? (Select all that apply)</p>
              <div className="grid grid-cols-2 gap-3">
                {IMPROVEMENT_CATEGORIES.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={formData.feedbackCategories.includes(category)}
                      onCheckedChange={(checked) => handleCategoryToggle(category, !!checked)}
                    />
                    <Label htmlFor={`category-${category}`} className="text-sm">{category}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="improvement-suggestions" className="text-base font-semibold">Specific improvement suggestions</Label>
              <p className="text-sm text-gray-600 mb-3">What specific changes would you suggest to improve the work experience?</p>
              <Textarea
                id="improvement-suggestions"
                value={formData.improvementSuggestions}
                onChange={(e) => setFormData(prev => ({ ...prev, improvementSuggestions: e.target.value }))}
                placeholder="Share your suggestions for improvement..."
                rows={4}
                data-testid="textarea-suggestions"
              />
            </div>

            <div>
              <Label htmlFor="additional-comments" className="text-base font-semibold">Additional comments</Label>
              <p className="text-sm text-gray-600 mb-3">Is there anything else you'd like to share about your experience?</p>
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
    </div>
  );
}