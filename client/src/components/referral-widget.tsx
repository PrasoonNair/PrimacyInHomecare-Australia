import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Send, User, Phone, Mail, FileText, Shield } from "lucide-react";

/**
 * Embeddable Referral Widget for External Websites
 * Can be embedded using iframe or JavaScript snippet
 */
export function ReferralWidget() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Participant Information
    participantFirstName: "",
    participantLastName: "",
    participantDOB: "",
    participantNDISNumber: "",
    participantPhone: "",
    participantEmail: "",
    participantAddress: "",
    participantSuburb: "",
    participantState: "",
    participantPostcode: "",
    
    // Referrer Information
    referrerName: "",
    referrerOrganization: "",
    referrerRole: "",
    referrerPhone: "",
    referrerEmail: "",
    referralSource: "",
    
    // Support Needs
    primaryDisability: "",
    supportNeeds: "",
    urgency: "standard",
    additionalInfo: "",
    
    // Consent
    consentGiven: false,
    privacyAccepted: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Get the API endpoint from the parent domain or use default
      const apiEndpoint = window.location.hostname === "localhost" 
        ? "http://localhost:5000/api/public/referral"
        : `${window.location.protocol}//${window.location.hostname}/api/public/referral`;

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Widget-Source": window.location.hostname
        },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
          source: "external_widget"
        })
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      console.error("Error submitting referral:", error);
      alert("There was an error submitting the referral. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-green-800">Referral Submitted Successfully!</h2>
            <p className="text-gray-600">
              Thank you for your referral. Our intake team will review the information and contact you within 24-48 hours.
            </p>
            <p className="text-sm text-gray-500">
              Reference Number: <span className="font-mono font-bold">REF-{Date.now()}</span>
            </p>
            <Button onClick={() => {
              setSubmitted(false);
              setFormData({
                participantFirstName: "",
                participantLastName: "",
                participantDOB: "",
                participantNDISNumber: "",
                participantPhone: "",
                participantEmail: "",
                participantAddress: "",
                participantSuburb: "",
                participantState: "",
                participantPostcode: "",
                referrerName: "",
                referrerOrganization: "",
                referrerRole: "",
                referrerPhone: "",
                referrerEmail: "",
                referralSource: "",
                primaryDisability: "",
                supportNeeds: "",
                urgency: "standard",
                additionalInfo: "",
                consentGiven: false,
                privacyAccepted: false
              });
            }}>
              Submit Another Referral
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardTitle className="text-2xl flex items-center">
          <Shield className="mr-2 h-6 w-6" />
          NDIS Service Referral Form
        </CardTitle>
        <p className="text-blue-100 text-sm mt-2">
          Primacy Care Australia - Quality NDIS Services
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Participant Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center">
              <User className="mr-2 h-5 w-5 text-blue-600" />
              Participant Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="participantFirstName">First Name *</Label>
                <Input
                  id="participantFirstName"
                  required
                  value={formData.participantFirstName}
                  onChange={(e) => setFormData({...formData, participantFirstName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="participantLastName">Last Name *</Label>
                <Input
                  id="participantLastName"
                  required
                  value={formData.participantLastName}
                  onChange={(e) => setFormData({...formData, participantLastName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="participantDOB">Date of Birth *</Label>
                <Input
                  id="participantDOB"
                  type="date"
                  required
                  value={formData.participantDOB}
                  onChange={(e) => setFormData({...formData, participantDOB: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="participantNDISNumber">NDIS Number</Label>
                <Input
                  id="participantNDISNumber"
                  placeholder="4301234567"
                  value={formData.participantNDISNumber}
                  onChange={(e) => setFormData({...formData, participantNDISNumber: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="participantPhone">Phone Number *</Label>
                <Input
                  id="participantPhone"
                  type="tel"
                  required
                  value={formData.participantPhone}
                  onChange={(e) => setFormData({...formData, participantPhone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="participantEmail">Email</Label>
                <Input
                  id="participantEmail"
                  type="email"
                  value={formData.participantEmail}
                  onChange={(e) => setFormData({...formData, participantEmail: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="participantAddress">Street Address *</Label>
                <Input
                  id="participantAddress"
                  required
                  value={formData.participantAddress}
                  onChange={(e) => setFormData({...formData, participantAddress: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="participantSuburb">Suburb *</Label>
                  <Input
                    id="participantSuburb"
                    required
                    value={formData.participantSuburb}
                    onChange={(e) => setFormData({...formData, participantSuburb: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="participantState">State *</Label>
                  <Select 
                    value={formData.participantState}
                    onValueChange={(value) => setFormData({...formData, participantState: value})}
                    required
                  >
                    <SelectTrigger id="participantState">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NSW">NSW</SelectItem>
                      <SelectItem value="VIC">VIC</SelectItem>
                      <SelectItem value="QLD">QLD</SelectItem>
                      <SelectItem value="WA">WA</SelectItem>
                      <SelectItem value="SA">SA</SelectItem>
                      <SelectItem value="TAS">TAS</SelectItem>
                      <SelectItem value="ACT">ACT</SelectItem>
                      <SelectItem value="NT">NT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="participantPostcode">Postcode *</Label>
                  <Input
                    id="participantPostcode"
                    required
                    maxLength={4}
                    value={formData.participantPostcode}
                    onChange={(e) => setFormData({...formData, participantPostcode: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Referrer Information */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-lg flex items-center">
              <Phone className="mr-2 h-5 w-5 text-blue-600" />
              Referrer Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="referrerName">Your Name *</Label>
                <Input
                  id="referrerName"
                  required
                  value={formData.referrerName}
                  onChange={(e) => setFormData({...formData, referrerName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="referrerOrganization">Organization</Label>
                <Input
                  id="referrerOrganization"
                  value={formData.referrerOrganization}
                  onChange={(e) => setFormData({...formData, referrerOrganization: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="referrerRole">Your Role</Label>
                <Input
                  id="referrerRole"
                  placeholder="e.g., Support Coordinator, Family Member"
                  value={formData.referrerRole}
                  onChange={(e) => setFormData({...formData, referrerRole: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="referralSource">Referral Source *</Label>
                <Select 
                  value={formData.referralSource}
                  onValueChange={(value) => setFormData({...formData, referralSource: value})}
                  required
                >
                  <SelectTrigger id="referralSource">
                    <SelectValue placeholder="How did you hear about us?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ndis_portal">NDIS Portal</SelectItem>
                    <SelectItem value="healthcare_provider">Healthcare Provider</SelectItem>
                    <SelectItem value="support_coordinator">Support Coordinator</SelectItem>
                    <SelectItem value="family_friend">Family/Friend</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="referrerPhone">Contact Phone *</Label>
                <Input
                  id="referrerPhone"
                  type="tel"
                  required
                  value={formData.referrerPhone}
                  onChange={(e) => setFormData({...formData, referrerPhone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="referrerEmail">Contact Email *</Label>
                <Input
                  id="referrerEmail"
                  type="email"
                  required
                  value={formData.referrerEmail}
                  onChange={(e) => setFormData({...formData, referrerEmail: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Support Needs */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-lg flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-600" />
              Support Requirements
            </h3>
            
            <div>
              <Label htmlFor="primaryDisability">Primary Disability/Condition *</Label>
              <Input
                id="primaryDisability"
                required
                placeholder="e.g., Autism, Physical Disability, Psychosocial"
                value={formData.primaryDisability}
                onChange={(e) => setFormData({...formData, primaryDisability: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="supportNeeds">Support Needs *</Label>
              <Textarea
                id="supportNeeds"
                required
                rows={4}
                placeholder="Please describe the support needs and services required..."
                value={formData.supportNeeds}
                onChange={(e) => setFormData({...formData, supportNeeds: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select 
                value={formData.urgency}
                onValueChange={(value) => setFormData({...formData, urgency: value})}
              >
                <SelectTrigger id="urgency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (1-2 weeks)</SelectItem>
                  <SelectItem value="priority">Priority (3-5 days)</SelectItem>
                  <SelectItem value="urgent">Urgent (24-48 hours)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                rows={3}
                placeholder="Any other relevant information..."
                value={formData.additionalInfo}
                onChange={(e) => setFormData({...formData, additionalInfo: e.target.value})}
              />
            </div>
          </div>

          {/* Consent */}
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="consent"
                  required
                  checked={formData.consentGiven}
                  onChange={(e) => setFormData({...formData, consentGiven: e.target.checked})}
                  className="mt-1"
                />
                <Label htmlFor="consent" className="text-sm font-normal">
                  I confirm that I have the participant's consent to make this referral and share their information with Primacy Care Australia for the purpose of NDIS service provision. *
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="privacy"
                  required
                  checked={formData.privacyAccepted}
                  onChange={(e) => setFormData({...formData, privacyAccepted: e.target.checked})}
                  className="mt-1"
                />
                <Label htmlFor="privacy" className="text-sm font-normal">
                  I have read and accept the Privacy Policy and understand how the information will be used. *
                </Label>
              </div>
            </div>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your information is secure and will only be used for service provision purposes in accordance with NDIS guidelines and privacy laws.
            </AlertDescription>
          </Alert>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
            disabled={submitting}
          >
            <Send className="mr-2 h-5 w-5" />
            {submitting ? "Submitting..." : "Submit Referral"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}