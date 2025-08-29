import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, Send, User, Phone, Mail, Briefcase, 
  Award, MapPin, Calendar, Upload, Heart
} from "lucide-react";

/**
 * Embeddable Careers/Recruitment Widget for External Websites
 * Can be embedded to receive job applications directly into HR system
 */
export function CareersWidget() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    suburb: "",
    state: "",
    postcode: "",
    
    // Professional Information
    positionApplying: "",
    employmentType: "",
    availability: "",
    expectedSalary: "",
    
    // Qualifications
    highestQualification: "",
    ndisWorkerScreening: "",
    ndisScreeningExpiry: "",
    firstAidCertificate: "",
    driversLicense: "",
    ownVehicle: "",
    
    // Experience
    yearsExperience: "",
    previousRole: "",
    previousEmployer: "",
    specializations: "",
    
    // Additional Information
    languages: "",
    preferredLocations: "",
    shiftPreferences: "",
    coverLetter: "",
    resumeUrl: "",
    
    // References
    referee1Name: "",
    referee1Phone: "",
    referee1Relationship: "",
    referee2Name: "",
    referee2Phone: "",
    referee2Relationship: "",
    
    // Consent
    rightToWork: false,
    backgroundCheck: false,
    privacyConsent: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const apiEndpoint = window.location.hostname === "localhost" 
        ? "http://localhost:5000/api/public/careers"
        : `${window.location.protocol}//${window.location.hostname}/api/public/careers`;

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Widget-Source": window.location.hostname
        },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
          source: "careers_widget"
        })
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("There was an error submitting your application. Please try again.");
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
            <h2 className="text-2xl font-bold text-green-800">Application Submitted Successfully!</h2>
            <p className="text-gray-600">
              Thank you for your interest in joining Primacy Care Australia. Our HR team will review your application and contact you within 3-5 business days.
            </p>
            <p className="text-sm text-gray-500">
              Application ID: <span className="font-mono font-bold">APP-{Date.now()}</span>
            </p>
            <div className="pt-4">
              <Button onClick={() => {
                setSubmitted(false);
                // Reset form
                setFormData({
                  firstName: "",
                  lastName: "",
                  email: "",
                  phone: "",
                  address: "",
                  suburb: "",
                  state: "",
                  postcode: "",
                  positionApplying: "",
                  employmentType: "",
                  availability: "",
                  expectedSalary: "",
                  highestQualification: "",
                  ndisWorkerScreening: "",
                  ndisScreeningExpiry: "",
                  firstAidCertificate: "",
                  driversLicense: "",
                  ownVehicle: "",
                  yearsExperience: "",
                  previousRole: "",
                  previousEmployer: "",
                  specializations: "",
                  languages: "",
                  preferredLocations: "",
                  shiftPreferences: "",
                  coverLetter: "",
                  resumeUrl: "",
                  referee1Name: "",
                  referee1Phone: "",
                  referee1Relationship: "",
                  referee2Name: "",
                  referee2Phone: "",
                  referee2Relationship: "",
                  rightToWork: false,
                  backgroundCheck: false,
                  privacyConsent: false
                });
              }}>
                Apply for Another Position
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <CardTitle className="text-2xl flex items-center">
          <Heart className="mr-2 h-6 w-6" />
          Join Our Team - Primacy Care Australia
        </CardTitle>
        <p className="text-purple-100 text-sm mt-2">
          Make a difference in the lives of NDIS participants
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Position Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center">
              <Briefcase className="mr-2 h-5 w-5 text-purple-600" />
              Position Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="positionApplying">Position Applying For *</Label>
                <Select 
                  value={formData.positionApplying}
                  onValueChange={(value) => setFormData({...formData, positionApplying: value})}
                  required
                >
                  <SelectTrigger id="positionApplying">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="support_worker">Support Worker</SelectItem>
                    <SelectItem value="team_leader">Team Leader</SelectItem>
                    <SelectItem value="support_coordinator">Support Coordinator</SelectItem>
                    <SelectItem value="allied_health">Allied Health Assistant</SelectItem>
                    <SelectItem value="nurse">Registered Nurse</SelectItem>
                    <SelectItem value="admin">Administration Officer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="employmentType">Employment Type *</Label>
                <Select 
                  value={formData.employmentType}
                  onValueChange={(value) => setFormData({...formData, employmentType: value})}
                  required
                >
                  <SelectTrigger id="employmentType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="availability">Availability to Start *</Label>
                <Select 
                  value={formData.availability}
                  onValueChange={(value) => setFormData({...formData, availability: value})}
                  required
                >
                  <SelectTrigger id="availability">
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="1_week">1 Week</SelectItem>
                    <SelectItem value="2_weeks">2 Weeks</SelectItem>
                    <SelectItem value="1_month">1 Month</SelectItem>
                    <SelectItem value="negotiable">Negotiable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expectedSalary">Expected Salary (per hour)</Label>
                <Input
                  id="expectedSalary"
                  placeholder="$35-40"
                  value={formData.expectedSalary}
                  onChange={(e) => setFormData({...formData, expectedSalary: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-lg flex items-center">
              <User className="mr-2 h-5 w-5 text-purple-600" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="suburb">Suburb *</Label>
                  <Input
                    id="suburb"
                    required
                    value={formData.suburb}
                    onChange={(e) => setFormData({...formData, suburb: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Select 
                    value={formData.state}
                    onValueChange={(value) => setFormData({...formData, state: value})}
                    required
                  >
                    <SelectTrigger id="state">
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
                  <Label htmlFor="postcode">Postcode *</Label>
                  <Input
                    id="postcode"
                    required
                    maxLength={4}
                    value={formData.postcode}
                    onChange={(e) => setFormData({...formData, postcode: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Qualifications & Compliance */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-lg flex items-center">
              <Award className="mr-2 h-5 w-5 text-purple-600" />
              Qualifications & Compliance
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="highestQualification">Highest Qualification *</Label>
                <Select 
                  value={formData.highestQualification}
                  onValueChange={(value) => setFormData({...formData, highestQualification: value})}
                  required
                >
                  <SelectTrigger id="highestQualification">
                    <SelectValue placeholder="Select qualification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="certificate_iii">Certificate III</SelectItem>
                    <SelectItem value="certificate_iv">Certificate IV</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="bachelor">Bachelor Degree</SelectItem>
                    <SelectItem value="masters">Masters Degree</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="yearsExperience">Years of Experience *</Label>
                <Select 
                  value={formData.yearsExperience}
                  onValueChange={(value) => setFormData({...formData, yearsExperience: value})}
                  required
                >
                  <SelectTrigger id="yearsExperience">
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">Less than 1 year</SelectItem>
                    <SelectItem value="1-3">1-3 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="5-10">5-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ndisWorkerScreening">NDIS Worker Screening Check *</Label>
                <Select 
                  value={formData.ndisWorkerScreening}
                  onValueChange={(value) => setFormData({...formData, ndisWorkerScreening: value})}
                  required
                >
                  <SelectTrigger id="ndisWorkerScreening">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current - Valid</SelectItem>
                    <SelectItem value="pending">Application Pending</SelectItem>
                    <SelectItem value="expired">Expired - Will Renew</SelectItem>
                    <SelectItem value="none">Not Yet Applied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ndisScreeningExpiry">NDIS Check Expiry Date</Label>
                <Input
                  id="ndisScreeningExpiry"
                  type="date"
                  value={formData.ndisScreeningExpiry}
                  onChange={(e) => setFormData({...formData, ndisScreeningExpiry: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="firstAidCertificate">First Aid Certificate *</Label>
                <Select 
                  value={formData.firstAidCertificate}
                  onValueChange={(value) => setFormData({...formData, firstAidCertificate: value})}
                  required
                >
                  <SelectTrigger id="firstAidCertificate">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="willing">Willing to Obtain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="driversLicense">Driver's License *</Label>
                <Select 
                  value={formData.driversLicense}
                  onValueChange={(value) => setFormData({...formData, driversLicense: value})}
                  required
                >
                  <SelectTrigger id="driversLicense">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full License</SelectItem>
                    <SelectItem value="provisional">Provisional</SelectItem>
                    <SelectItem value="learner">Learner</SelectItem>
                    <SelectItem value="none">No License</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ownVehicle">Own Vehicle *</Label>
                <Select 
                  value={formData.ownVehicle}
                  onValueChange={(value) => setFormData({...formData, ownVehicle: value})}
                  required
                >
                  <SelectTrigger id="ownVehicle">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="languages">Languages Spoken</Label>
                <Input
                  id="languages"
                  placeholder="e.g., English, Mandarin, Arabic"
                  value={formData.languages}
                  onChange={(e) => setFormData({...formData, languages: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Work Preferences */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-lg flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-purple-600" />
              Work Preferences
            </h3>
            
            <div>
              <Label htmlFor="preferredLocations">Preferred Work Locations</Label>
              <Input
                id="preferredLocations"
                placeholder="e.g., Western Sydney, Parramatta, Blacktown"
                value={formData.preferredLocations}
                onChange={(e) => setFormData({...formData, preferredLocations: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="shiftPreferences">Shift Preferences</Label>
              <Textarea
                id="shiftPreferences"
                rows={2}
                placeholder="e.g., Weekdays only, Morning shifts preferred, Available weekends"
                value={formData.shiftPreferences}
                onChange={(e) => setFormData({...formData, shiftPreferences: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="specializations">Areas of Specialization</Label>
              <Textarea
                id="specializations"
                rows={2}
                placeholder="e.g., Autism support, Complex care, Dementia care, Mental health"
                value={formData.specializations}
                onChange={(e) => setFormData({...formData, specializations: e.target.value})}
              />
            </div>
          </div>

          {/* Cover Letter */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-lg flex items-center">
              <Mail className="mr-2 h-5 w-5 text-purple-600" />
              Cover Letter
            </h3>
            
            <div>
              <Label htmlFor="coverLetter">Why do you want to work with Primacy Care? *</Label>
              <Textarea
                id="coverLetter"
                required
                rows={5}
                placeholder="Tell us about yourself and why you're interested in joining our team..."
                value={formData.coverLetter}
                onChange={(e) => setFormData({...formData, coverLetter: e.target.value})}
              />
            </div>
          </div>

          {/* References */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-lg flex items-center">
              <Phone className="mr-2 h-5 w-5 text-purple-600" />
              References
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Reference 1</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="referee1Name">Name</Label>
                    <Input
                      id="referee1Name"
                      value={formData.referee1Name}
                      onChange={(e) => setFormData({...formData, referee1Name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="referee1Phone">Phone</Label>
                    <Input
                      id="referee1Phone"
                      type="tel"
                      value={formData.referee1Phone}
                      onChange={(e) => setFormData({...formData, referee1Phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="referee1Relationship">Relationship</Label>
                    <Input
                      id="referee1Relationship"
                      placeholder="e.g., Previous Manager"
                      value={formData.referee1Relationship}
                      onChange={(e) => setFormData({...formData, referee1Relationship: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Reference 2</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="referee2Name">Name</Label>
                    <Input
                      id="referee2Name"
                      value={formData.referee2Name}
                      onChange={(e) => setFormData({...formData, referee2Name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="referee2Phone">Phone</Label>
                    <Input
                      id="referee2Phone"
                      type="tel"
                      value={formData.referee2Phone}
                      onChange={(e) => setFormData({...formData, referee2Phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="referee2Relationship">Relationship</Label>
                    <Input
                      id="referee2Relationship"
                      placeholder="e.g., Colleague"
                      value={formData.referee2Relationship}
                      onChange={(e) => setFormData({...formData, referee2Relationship: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Consent */}
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="rightToWork"
                  required
                  checked={formData.rightToWork}
                  onChange={(e) => setFormData({...formData, rightToWork: e.target.checked})}
                  className="mt-1"
                />
                <Label htmlFor="rightToWork" className="text-sm font-normal">
                  I confirm that I have the legal right to work in Australia. *
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="backgroundCheck"
                  required
                  checked={formData.backgroundCheck}
                  onChange={(e) => setFormData({...formData, backgroundCheck: e.target.checked})}
                  className="mt-1"
                />
                <Label htmlFor="backgroundCheck" className="text-sm font-normal">
                  I consent to background checks including NDIS Worker Screening, police check, and reference checks. *
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="privacyConsent"
                  required
                  checked={formData.privacyConsent}
                  onChange={(e) => setFormData({...formData, privacyConsent: e.target.checked})}
                  className="mt-1"
                />
                <Label htmlFor="privacyConsent" className="text-sm font-normal">
                  I have read and accept the Privacy Policy and consent to my information being processed for recruitment purposes. *
                </Label>
              </div>
            </div>
          </div>

          <Alert>
            <Heart className="h-4 w-4" />
            <AlertDescription>
              Primacy Care Australia is an equal opportunity employer committed to building a diverse and inclusive team.
            </AlertDescription>
          </Alert>

          <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700"
            size="lg"
            disabled={submitting}
          >
            <Send className="mr-2 h-5 w-5" />
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}