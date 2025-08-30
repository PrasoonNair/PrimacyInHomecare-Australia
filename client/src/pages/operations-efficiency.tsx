import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { OperationsEfficiencyDashboard } from '@/components/shared/operations-efficiency-dashboard';
import { RoleEfficiencyTools } from '@/components/shared/role-efficiency-tools';
import { PredictiveAnalytics } from '@/components/shared/predictive-analytics';
import { WorkflowAutomationBuilder } from '@/components/shared/workflow-automation-builder';
import { RealTimeMonitoring } from '@/components/shared/real-time-monitoring';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function OperationsEfficiencyPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Performance</TabsTrigger>
          <TabsTrigger value="tools">Efficiency Tools</TabsTrigger>
          <TabsTrigger value="predictive">AI Insights</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="monitoring">Live Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <OperationsEfficiencyDashboard />
        </TabsContent>

        <TabsContent value="tools">
          <RoleEfficiencyTools userRole={user?.role || 'all'} />
        </TabsContent>

        <TabsContent value="predictive">
          <PredictiveAnalytics />
        </TabsContent>

        <TabsContent value="automation">
          <WorkflowAutomationBuilder />
        </TabsContent>

        <TabsContent value="monitoring">
          <RealTimeMonitoring />
        </TabsContent>
      </Tabs>
    </div>
  );
}