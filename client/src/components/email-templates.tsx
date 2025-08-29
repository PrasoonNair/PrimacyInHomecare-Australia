import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, Send, Save, Eye, Edit, Copy, 
  UserPlus, Calendar, DollarSign, FileText,
  Heart, AlertCircle, CheckCircle, Clock
} from "lucide-react";

export function EmailTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState("welcome");
  const [isEditing, setIsEditing] = useState(false);
  const [emailContent, setEmailContent] = useState("");
  const { toast } = useToast();

  const templates = [
    {
      id: "welcome",
      name: "Welcome Email",
      icon: UserPlus,
      category: "Onboarding",
      subject: "Welcome to Primacy Care Australia",
      variables: ["[Name]", "[NDIS Number]", "[Start Date]"],
      content: `Dear [Name],

Welcome to Primacy Care Australia! We're delighted to have you join our community.

Your NDIS Number: [NDIS Number]
Service Start Date: [Start Date]

Our team is here to support you every step of the way. Your Support Coordinator will contact you within 24 hours to discuss your goals and service preferences.

Important Information:
• Emergency Contact: 000
• NDIS Hotline: 1800 800 110
• Our Office: (02) 9876 5432

We look forward to working with you to achieve your goals.

Warm regards,
Primacy Care Australia Team`
    },
    {
      id: "agreement",
      name: "Service Agreement",
      icon: FileText,
      category: "Documentation",
      subject: "Your Service Agreement is Ready for Review",
      variables: ["[Name]", "[Agreement Link]", "[Expiry Date]"],
      content: `Hi [Name],

Your Service Agreement is ready for review and signing.

Please click the link below to review and digitally sign your agreement:
[Agreement Link]

This link will expire on [Expiry Date].

If you have any questions about the agreement, please don't hesitate to contact your Support Coordinator.

Best regards,
Primacy Care Australia`
    },
    {
      id: "appointment",
      name: "Appointment Reminder",
      icon: Calendar,
      category: "Scheduling",
      subject: "Appointment Reminder - [Date] at [Time]",
      variables: ["[Name]", "[Date]", "[Time]", "[Location]", "[Service]"],
      content: `Hello [Name],

This is a friendly reminder about your upcoming appointment:

Date: [Date]
Time: [Time]
Location: [Location]
Service: [Service]

Please arrive 10 minutes early to complete any necessary paperwork.

If you need to reschedule, please call us at least 24 hours in advance at (02) 9876 5432.

See you soon!
Primacy Care Australia`
    },
    {
      id: "birthday",
      name: "Birthday Greeting",
      icon: Heart,
      category: "Engagement",
      subject: "Happy Birthday from Primacy Care Australia!",
      variables: ["[Name]"],
      content: `Dear [Name],

🎉 Happy Birthday! 🎂

On behalf of everyone at Primacy Care Australia, we wish you a wonderful day filled with joy and celebration.

Thank you for being part of our community. We're honored to support you in achieving your goals.

Have a fantastic day!

Warmest wishes,
Your Primacy Care Australia Family`
    },
    {
      id: "invoice",
      name: "Invoice Notification",
      icon: DollarSign,
      category: "Financial",
      subject: "Invoice #[Invoice Number] - [Month] Services",
      variables: ["[Name]", "[Invoice Number]", "[Amount]", "[Due Date]", "[Month]"],
      content: `Dear [Name],

Your invoice for [Month] services is now available.

Invoice Details:
• Invoice Number: #[Invoice Number]
• Amount: [Amount]
• Due Date: [Due Date]

You can view and download your invoice by logging into your participant portal.

Payment Methods:
• Direct Debit (automatic)
• BPAY
• Credit Card
• Bank Transfer

If you have any questions about your invoice, please contact our Finance team at finance@primacycare.com.au

Thank you,
Primacy Care Australia Finance Team`
    },
    {
      id: "expiry",
      name: "Document Expiry Alert",
      icon: AlertCircle,
      category: "Compliance",
      subject: "Important: Document Expiring Soon",
      variables: ["[Name]", "[Document]", "[Expiry Date]"],
      content: `Hi [Name],

This is an important reminder that your [Document] will expire on [Expiry Date].

To ensure continuous service delivery, please provide an updated document as soon as possible.

You can upload the new document through:
• Your participant portal
• Email to documents@primacycare.com.au
• In person at our office

If you need assistance obtaining a renewal, please contact your Support Coordinator.

Thank you for your prompt attention to this matter.

Regards,
Primacy Care Australia Compliance Team`
    }
  ];

  const handleSendEmail = () => {
    toast({
      title: "Email Sent",
      description: "Template email has been sent successfully",
    });
  };

  const handleSaveTemplate = () => {
    setIsEditing(false);
    toast({
      title: "Template Saved",
      description: "Email template has been updated",
    });
  };

  const currentTemplate = templates.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      {/* Template Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Email Template Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <Button
                  key={template.id}
                  variant={selectedTemplate === template.id ? "default" : "outline"}
                  className="h-20 flex flex-col items-center justify-center space-y-1"
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    setEmailContent(template.content);
                    setIsEditing(false);
                  }}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{template.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {template.category}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Template Editor */}
      {currentTemplate && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                {currentTemplate.name}
              </CardTitle>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="mr-1 h-4 w-4" />
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(emailContent);
                    toast({
                      title: "Copied",
                      description: "Template copied to clipboard",
                    });
                  }}
                >
                  <Copy className="mr-1 h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Subject Line */}
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={currentTemplate.subject}
                  readOnly={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>

              {/* Variables */}
              <div>
                <label className="text-sm font-medium">Available Variables</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentTemplate.variables.map((variable) => (
                    <Badge key={variable} variant="outline">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Email Content */}
              <div>
                <label className="text-sm font-medium">Email Content</label>
                <Textarea
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  readOnly={!isEditing}
                  className={`min-h-[300px] font-mono text-sm ${!isEditing ? "bg-gray-50" : ""}`}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <div className="space-x-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Participants</SelectItem>
                      <SelectItem value="active">Active Only</SelectItem>
                      <SelectItem value="new">New This Month</SelectItem>
                      <SelectItem value="custom">Custom Selection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-x-2">
                  {isEditing ? (
                    <Button onClick={handleSaveTemplate}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Template
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                      <Button onClick={handleSendEmail}>
                        <Send className="mr-2 h-4 w-4" />
                        Send Email
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Sends */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Email Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { template: "Welcome Email", sent: "2 hours ago", recipients: 3, status: "delivered" },
              { template: "Appointment Reminder", sent: "Yesterday", recipients: 45, status: "delivered" },
              { template: "Invoice Notification", sent: "3 days ago", recipients: 127, status: "delivered" },
              { template: "Birthday Greeting", sent: "1 week ago", recipients: 8, status: "delivered" }
            ].map((campaign, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">{campaign.template}</p>
                    <p className="text-sm text-gray-600">{campaign.recipients} recipients</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-green-600">
                    {campaign.status}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">{campaign.sent}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}