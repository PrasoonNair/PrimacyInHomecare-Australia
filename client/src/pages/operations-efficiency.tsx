import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { OperationsEfficiencyDashboard } from '@/components/shared/operations-efficiency-dashboard';
import { RoleEfficiencyTools } from '@/components/shared/role-efficiency-tools';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function OperationsEfficiencyPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Performance Dashboard</TabsTrigger>
          <TabsTrigger value="tools">Efficiency Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <OperationsEfficiencyDashboard />
        </TabsContent>

        <TabsContent value="tools">
          <RoleEfficiencyTools userRole={user?.role || 'all'} />
        </TabsContent>
      </Tabs>
    </div>
  );
}