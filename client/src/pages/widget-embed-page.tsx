import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Code, Copy, CheckCircle, Globe, Send, Users, 
  Briefcase, ExternalLink, Shield, Zap
} from "lucide-react";
import { ReferralWidget } from "@/components/referral-widget";
import { CareersWidget } from "@/components/careers-widget";
import { useToast } from "@/hooks/use-toast";

export function WidgetEmbedPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();
  
  const baseUrl = window.location.origin;

  const copyToClipboard = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(type);
    toast({
      title: "Code Copied!",
      description: "The embed code has been copied to your clipboard.",
    });
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const referralIframeCode = `<iframe 
  src="${baseUrl}/widget/referral" 
  width="100%" 
  height="1200" 
  frameborder="0"
  style="border: none; max-width: 800px;">
</iframe>`;

  const careersIframeCode = `<iframe 
  src="${baseUrl}/widget/careers" 
  width="100%" 
  height="1500" 
  frameborder="0"
  style="border: none; max-width: 800px;">
</iframe>`;

  const referralScriptCode = `<!-- Primacy Care Referral Widget -->
<div id="primacy-referral-widget"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${baseUrl}/widget/referral';
    iframe.style.width = '100%';
    iframe.style.height = '1200px';
    iframe.style.border = 'none';
    iframe.style.maxWidth = '800px';
    document.getElementById('primacy-referral-widget').appendChild(iframe);
  })();
</script>`;

  const careersScriptCode = `<!-- Primacy Care Careers Widget -->
<div id="primacy-careers-widget"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${baseUrl}/widget/careers';
    iframe.style.width = '100%';
    iframe.style.height = '1500px';
    iframe.style.border = 'none';
    iframe.style.maxWidth = '800px';
    document.getElementById('primacy-careers-widget').appendChild(iframe);
  })();
</script>`;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Website Integration Widgets</h1>
        <p className="text-indigo-100">
          Embed these widgets on your website to receive referrals and job applications directly into your CMS
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Zap className="mr-2 h-4 w-4 text-yellow-500" />
              Instant Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">
              Data flows directly into your Intake and HR departments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Shield className="mr-2 h-4 w-4 text-green-500" />
              NDIS Compliant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">
              Secure forms with privacy consent and data protection
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Globe className="mr-2 h-4 w-4 text-blue-500" />
              Works Anywhere
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">
              Compatible with any website platform or CMS
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Widget Tabs */}
      <Tabs defaultValue="referral" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="referral">
            <Users className="mr-2 h-4 w-4" />
            Referral Widget
          </TabsTrigger>
          <TabsTrigger value="careers">
            <Briefcase className="mr-2 h-4 w-4" />
            Careers Widget
          </TabsTrigger>
        </TabsList>

        {/* Referral Widget Tab */}
        <TabsContent value="referral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Referral Intake Widget</CardTitle>
              <p className="text-sm text-gray-600">
                Allow healthcare providers, support coordinators, and families to refer participants directly from your website
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preview */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  Preview
                  <Badge variant="outline" className="ml-2">Live Demo</Badge>
                </h3>
                <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                  <ReferralWidget />
                </div>
              </div>

              {/* Embed Options */}
              <div className="space-y-4">
                <h3 className="font-semibold">Embed Options</h3>
                
                {/* Option 1: IFrame */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Option 1: Simple IFrame</Label>
                    <Button
                      size="sm"
                      variant={copiedCode === "referral-iframe" ? "default" : "outline"}
                      onClick={() => copyToClipboard(referralIframeCode, "referral-iframe")}
                    >
                      {copiedCode === "referral-iframe" ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={referralIframeCode}
                    readOnly
                    className="font-mono text-xs"
                    rows={5}
                  />
                </div>

                {/* Option 2: JavaScript */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Option 2: JavaScript Embed</Label>
                    <Button
                      size="sm"
                      variant={copiedCode === "referral-script" ? "default" : "outline"}
                      onClick={() => copyToClipboard(referralScriptCode, "referral-script")}
                    >
                      {copiedCode === "referral-script" ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={referralScriptCode}
                    readOnly
                    className="font-mono text-xs"
                    rows={8}
                  />
                </div>

                {/* Direct Link */}
                <div className="space-y-2">
                  <Label>Direct Link</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={`${baseUrl}/widget/referral`}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`${baseUrl}/widget/referral`, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Features */}
              <Alert>
                <Send className="h-4 w-4" />
                <AlertDescription>
                  <strong>Widget Features:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• NDIS eligibility pre-screening</li>
                    <li>• Automatic priority assignment</li>
                    <li>• Email notifications to intake team</li>
                    <li>• Reference number generation</li>
                    <li>• Mobile responsive design</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Careers Widget Tab */}
        <TabsContent value="careers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Careers Application Widget</CardTitle>
              <p className="text-sm text-gray-600">
                Receive job applications directly into your HR department with automatic NDIS screening verification
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preview */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  Preview
                  <Badge variant="outline" className="ml-2">Live Demo</Badge>
                </h3>
                <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                  <CareersWidget />
                </div>
              </div>

              {/* Embed Options */}
              <div className="space-y-4">
                <h3 className="font-semibold">Embed Options</h3>
                
                {/* Option 1: IFrame */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Option 1: Simple IFrame</Label>
                    <Button
                      size="sm"
                      variant={copiedCode === "careers-iframe" ? "default" : "outline"}
                      onClick={() => copyToClipboard(careersIframeCode, "careers-iframe")}
                    >
                      {copiedCode === "careers-iframe" ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={careersIframeCode}
                    readOnly
                    className="font-mono text-xs"
                    rows={5}
                  />
                </div>

                {/* Option 2: JavaScript */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Option 2: JavaScript Embed</Label>
                    <Button
                      size="sm"
                      variant={copiedCode === "careers-script" ? "default" : "outline"}
                      onClick={() => copyToClipboard(careersScriptCode, "careers-script")}
                    >
                      {copiedCode === "careers-script" ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={careersScriptCode}
                    readOnly
                    className="font-mono text-xs"
                    rows={8}
                  />
                </div>

                {/* Direct Link */}
                <div className="space-y-2">
                  <Label>Direct Link</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={`${baseUrl}/widget/careers`}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`${baseUrl}/widget/careers`, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Features */}
              <Alert>
                <Briefcase className="h-4 w-4" />
                <AlertDescription>
                  <strong>Widget Features:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• NDIS worker screening status capture</li>
                    <li>• Qualification verification fields</li>
                    <li>• Reference collection</li>
                    <li>• Fast-track for compliant workers</li>
                    <li>• Direct HR pipeline integration</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Implementation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">For WordPress Sites</h4>
              <ol className="text-sm space-y-1 text-gray-600">
                <li>1. Go to Pages → Add New</li>
                <li>2. Switch to HTML/Text editor</li>
                <li>3. Paste the embed code</li>
                <li>4. Publish the page</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2">For Wix/Squarespace</h4>
              <ol className="text-sm space-y-1 text-gray-600">
                <li>1. Add an HTML embed element</li>
                <li>2. Paste the iframe code</li>
                <li>3. Adjust height if needed</li>
                <li>4. Save and publish</li>
              </ol>
            </div>
          </div>

          <Alert>
            <Code className="h-4 w-4" />
            <AlertDescription>
              <strong>Technical Notes:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Widgets are mobile responsive</li>
                <li>• CORS is enabled for all domains</li>
                <li>• Data is sent via secure HTTPS</li>
                <li>• No jQuery or dependencies required</li>
                <li>• Works with all modern browsers</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg bg-gray-50">
              <p className="font-mono text-sm text-blue-600">POST /api/public/referral</p>
              <p className="text-xs text-gray-600 mt-1">
                Receives referral submissions from external websites
              </p>
            </div>
            <div className="p-3 border rounded-lg bg-gray-50">
              <p className="font-mono text-sm text-purple-600">POST /api/public/careers</p>
              <p className="text-xs text-gray-600 mt-1">
                Receives job applications from careers widget
              </p>
            </div>
            <div className="p-3 border rounded-lg bg-gray-50">
              <p className="font-mono text-sm text-green-600">GET /api/public/widget-config</p>
              <p className="text-xs text-gray-600 mt-1">
                Returns widget configuration and embed codes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}