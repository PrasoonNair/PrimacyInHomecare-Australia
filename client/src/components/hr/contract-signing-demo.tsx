import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Send, 
  CheckCircle, 
  Clock,
  Users,
  DollarSign,
  Calendar,
  Bell
} from 'lucide-react';

export function ContractSigningDemo() {
  const [demoStep, setDemoStep] = useState<'ready' | 'sent' | 'signed' | 'processed'>('ready');
  const { toast } = useToast();

  // Simulate contract signing process
  const simulateSigningMutation = useMutation({
    mutationFn: async (step: string) => {
      // Simulate API calls for each step
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (step === 'signed') {
        // Simulate webhook call for signed contract
        return apiRequest('/api/hr/contracts/demo-contract-123/signature-webhook', {
          method: 'POST',
          body: JSON.stringify({
            status: 'completed',
            signedAt: new Date().toISOString(),
            signatureData: {
              employeeName: 'Sarah Johnson',
              signedDate: new Date().toISOString(),
              ipAddress: '192.168.1.100'
            }
          })
        });
      }
      
      return { success: true };
    },
    onSuccess: (data, step) => {
      setDemoStep(step as any);
      
      if (step === 'signed') {
        toast({
          title: "Contract Signed!",
          description: "Automatic notifications have been sent to all departments.",
        });
        
        // Invalidate notifications to show new ones
        queryClient.invalidateQueries({ queryKey: ['/api/department-notifications'] });
        
        // Move to processed step after a short delay
        setTimeout(() => {
          setDemoStep('processed');
          toast({
            title: "Onboarding Process Initiated",
            description: "HR, Finance, and Service Delivery teams have been notified.",
          });
        }, 2000);
      } else {
        toast({
          title: `Step ${step} completed`,
          description: "Contract process progressing smoothly.",
        });
      }
    }
  });

  const handleSimulateStep = (step: string) => {
    simulateSigningMutation.mutate(step);
  };

  const resetDemo = () => {
    setDemoStep('ready');
    toast({
      title: "Demo Reset",
      description: "Contract signing demonstration has been reset.",
    });
  };

  return (
    <Card data-testid="contract-signing-demo">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Contract Signing Demo</span>
          <Badge variant="outline">Demonstration</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600 mb-4">
          This demonstration shows the automatic workflow when a contract is signed by new staff.
        </div>

        {/* Contract Demo Info */}
        <div className="bg-blue-50 p-4 rounded-lg border">
          <h4 className="font-semibold text-blue-800 mb-2">Demo Contract: Sarah Johnson</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Position:</strong> Full-Time Support Worker</p>
            <p><strong>Department:</strong> Service Delivery</p>
            <p><strong>SCHADS Level:</strong> Level 2.3</p>
            <p><strong>Start Date:</strong> {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Process Steps */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${demoStep !== 'ready' ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Contract Generated & Sent</span>
            </div>
            {demoStep === 'ready' && (
              <Button
                size="sm"
                onClick={() => handleSimulateStep('sent')}
                disabled={simulateSigningMutation.isPending}
                data-testid="button-send-contract"
              >
                <Send className="h-3 w-3 mr-1" />
                Send Contract
              </Button>
            )}
            {demoStep !== 'ready' && <CheckCircle className="h-4 w-4 text-green-500" />}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${['signed', 'processed'].includes(demoStep) ? 'bg-green-500' : demoStep === 'sent' ? 'bg-yellow-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Employee Signs Contract</span>
            </div>
            {demoStep === 'sent' && (
              <Button
                size="sm"
                onClick={() => handleSimulateStep('signed')}
                disabled={simulateSigningMutation.isPending}
                data-testid="button-sign-contract"
              >
                <FileText className="h-3 w-3 mr-1" />
                {simulateSigningMutation.isPending ? 'Signing...' : 'Sign Contract'}
              </Button>
            )}
            {['signed', 'processed'].includes(demoStep) && <CheckCircle className="h-4 w-4 text-green-500" />}
            {demoStep === 'sent' && !simulateSigningMutation.isPending && <Clock className="h-4 w-4 text-yellow-500" />}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${demoStep === 'processed' ? 'bg-green-500' : demoStep === 'signed' ? 'bg-yellow-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Automatic Department Notifications</span>
            </div>
            {demoStep === 'processed' && <CheckCircle className="h-4 w-4 text-green-500" />}
            {demoStep === 'signed' && <Clock className="h-4 w-4 text-yellow-500 animate-spin" />}
          </div>
        </div>

        {/* Notifications Summary */}
        {['signed', 'processed'].includes(demoStep) && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Automatic Notifications Sent:
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-3 w-3 text-green-600" />
                <span><strong>Finance:</strong> Setup payroll and SCHADS classification</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-3 w-3 text-blue-600" />
                <span><strong>Service Delivery:</strong> Add to staff allocation and shift management</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-3 w-3 text-purple-600" />
                <span><strong>HR:</strong> Complete onboarding checklist and orientation</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 text-orange-600" />
                <span><strong>Compliance:</strong> Verify NDIS clearances and certifications</span>
              </div>
            </div>
          </div>
        )}

        {/* Demo Controls */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-xs text-gray-500">
            Status: <Badge variant={demoStep === 'processed' ? 'default' : 'secondary'}>{demoStep}</Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetDemo}
            disabled={simulateSigningMutation.isPending}
            data-testid="button-reset-demo"
          >
            Reset Demo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}