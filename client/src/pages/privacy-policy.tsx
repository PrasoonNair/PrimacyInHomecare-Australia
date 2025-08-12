import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Lock, Eye, Users, Database, AlertCircle, FileText, Globe } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-600" />
          Privacy Policy
        </h1>
        <p className="text-gray-600 mt-2">
          Last updated: January 2025 | Compliant with Privacy Act 1988 (Australian Privacy Principles)
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6">
          {/* APP 1: Open and Transparent Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Our Commitment to Privacy (APP 1)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Primacy Care Australia is committed to protecting the privacy of personal information in accordance with the Privacy Act 1988 and the Australian Privacy Principles (APPs).
              </p>
              <p>
                This policy explains how we collect, use, disclose, and protect your personal information, particularly health information related to NDIS services.
              </p>
            </CardContent>
          </Card>

          {/* APP 3-4: Collection of Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Information We Collect (APP 3-4)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Personal Information:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Name, date of birth, contact details</li>
                  <li>NDIS participant number and plan details</li>
                  <li>Health and disability information</li>
                  <li>Cultural background and communication needs</li>
                  <li>Emergency contact information</li>
                  <li>Financial information for billing purposes</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How We Collect:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Directly from you or your authorized representative</li>
                  <li>From healthcare providers with your consent</li>
                  <li>From the NDIS with appropriate authorization</li>
                  <li>Through our service delivery activities</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* APP 5: Notification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Notification of Collection (APP 5)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                When we collect your personal information, we will notify you of:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Our identity and contact details</li>
                <li>The purposes for collection</li>
                <li>The main consequences if information is not provided</li>
                <li>Any third parties to whom we may disclose</li>
                <li>Your rights to access and correct information</li>
                <li>How to make a complaint</li>
              </ul>
            </CardContent>
          </Card>

          {/* APP 6: Use and Disclosure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                How We Use Your Information (APP 6)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Primary Purposes:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Providing NDIS services and support</li>
                  <li>Managing your NDIS plan and goals</li>
                  <li>Coordinating with healthcare providers</li>
                  <li>Billing and payment processing</li>
                  <li>Quality assurance and service improvement</li>
                  <li>Meeting legal and regulatory requirements</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Disclosure:</h3>
                <p>We may disclose your information to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>The NDIA for plan management and compliance</li>
                  <li>Healthcare providers involved in your care</li>
                  <li>Emergency services when necessary</li>
                  <li>Government agencies as required by law</li>
                  <li>Service providers with your consent</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* APP 11: Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security of Your Information (APP 11)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We protect your personal information through:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Encrypted data storage and transmission</li>
                <li>Role-based access controls</li>
                <li>Regular security audits and updates</li>
                <li>Staff training on privacy and confidentiality</li>
                <li>Secure disposal of information no longer needed</li>
                <li>Incident response and breach notification procedures</li>
              </ul>
              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <p className="text-sm">
                  <strong>Data Retention:</strong> We retain personal information for a minimum of 7 years as required by healthcare regulations, or longer if required by law.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* APP 12-13: Access and Correction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Your Rights (APP 12-13)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Access to Your Information:</h3>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Request access to your personal information</li>
                  <li>Receive a copy in your preferred format</li>
                  <li>Understand how your information is used</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Correction of Information:</h3>
                <p>You may request corrections if information is:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Inaccurate or out of date</li>
                  <li>Incomplete or misleading</li>
                  <li>Not relevant to current purposes</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* APP 8: Cross-border Disclosure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                International Data Transfers (APP 8)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We store all personal information within Australia. Any cross-border disclosure would only occur with your explicit consent and appropriate safeguards.
              </p>
            </CardContent>
          </Card>

          {/* AI and Automated Processing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                AI and Automated Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We use AI technology (Claude AI) to assist with:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Extracting goals from NDIS plans</li>
                <li>Suggesting service matches</li>
                <li>Improving service delivery</li>
              </ul>
              <div className="bg-yellow-50 p-4 rounded-lg mt-4">
                <p className="text-sm">
                  <strong>Important:</strong> All AI-generated suggestions are reviewed by qualified staff. You can opt-out of AI processing at any time.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Complaints and Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Complaints and Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Making a Complaint:</h3>
                <p>If you have concerns about privacy, you can:</p>
                <ol className="list-decimal pl-6 mt-2 space-y-1">
                  <li>Contact our Privacy Officer</li>
                  <li>Submit a written complaint</li>
                  <li>If unresolved, contact the Office of the Australian Information Commissioner (OAIC)</li>
                </ol>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Contact Details:</h3>
                <p><strong>Privacy Officer</strong></p>
                <p>Primacy Care Australia</p>
                <p>Email: privacy@primacycare.com.au</p>
                <p>Phone: 1300 XXX XXX</p>
                <div className="mt-4">
                  <p><strong>OAIC</strong></p>
                  <p>Web: www.oaic.gov.au</p>
                  <p>Phone: 1300 363 992</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consumer Data Right */}
          <Card>
            <CardHeader>
              <CardTitle>Consumer Data Right (CDR)</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Under the Consumer Data Right, you may be entitled to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Access your data in a machine-readable format</li>
                <li>Direct us to share your data with accredited third parties</li>
                <li>Delete certain data upon request</li>
              </ul>
              <p className="mt-4 text-sm text-gray-600">
                Note: CDR implementation is being progressively rolled out. Contact us for current availability.
              </p>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}