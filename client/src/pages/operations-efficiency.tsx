import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { OperationsEfficiencyDashboard } from '@/components/shared/operations-efficiency-dashboard';
import { RoleEfficiencyTools } from '@/components/shared/role-efficiency-tools';
import { PredictiveAnalytics } from '@/components/shared/predictive-analytics';
import { WorkflowAutomationBuilder } from '@/components/shared/workflow-automation-builder';
import { RealTimeMonitoring } from '@/components/shared/real-time-monitoring';
import { AdvancedSearch } from '@/components/shared/advanced-search';
import { SmartSuggestions } from '@/components/shared/smart-suggestions';
import { QuickTemplates } from '@/components/shared/quick-templates';
import { ProductivityWidgets } from '@/components/shared/productivity-widgets';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function OperationsEfficiencyPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs defaultValue="dashboard" className="space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-8 min-w-[800px]">
            <TabsTrigger value="dashboard">Performance</TabsTrigger>
            <TabsTrigger value="tools">Efficiency Tools</TabsTrigger>
            <TabsTrigger value="predictive">AI Insights</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="monitoring">Live Monitor</TabsTrigger>
            <TabsTrigger value="search">Smart Search</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="productivity">Productivity</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard">
          <div className="space-y-6">
            <OperationsEfficiencyDashboard />
            <SmartSuggestions contextType="dashboard" />
          </div>
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

        <TabsContent value="search">
          <AdvancedSearch />
        </TabsContent>

        <TabsContent value="templates">
          <QuickTemplates contextType="general" />
        </TabsContent>

        <TabsContent value="productivity">
          <div className="space-y-6">
            <ProductivityWidgets layout="grid" />
            <SmartSuggestions contextType="dashboard" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}