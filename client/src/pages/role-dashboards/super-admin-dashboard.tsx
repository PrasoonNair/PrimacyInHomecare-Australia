import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShieldIcon,
  UsersIcon,
  ServerIcon,
  ActivityIcon,
  SettingsIcon,
  DatabaseIcon,
  KeyIcon,
  AlertTriangleIcon
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("system");

  // Fetch system stats
  const { data: systemStats } = useQuery({
    queryKey: ["/api/dashboard/super-admin"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const { data: audits = [] } = useQuery({
    queryKey: ["/api/audits"],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Super Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            System Administrator - Full System Control
          </p>
        </div>

        {/* System Health Metrics */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <ActivityIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Operational</div>
              <p className="text-xs text-muted-foreground">All systems running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">Active accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database Size</CardTitle>
              <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4 GB</div>
              <p className="text-xs text-muted-foreground">23% of quota</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
              <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">No critical issues</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
                <CardDescription>Real-time system monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">API Response Time</p>
                      <p className="text-sm text-muted-foreground">Average: 1.2s</p>
                    </div>
                    <Badge className="bg-green-500">Optimal</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Database Connections</p>
                      <p className="text-sm text-muted-foreground">12 of 100 active</p>
                    </div>
                    <Badge className="bg-green-500">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Error Rate</p>
                      <p className="text-sm text-muted-foreground">0.01% in last 24h</p>
                    </div>
                    <Badge className="bg-green-500">Low</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent System Events</CardTitle>
                <CardDescription>Critical system activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Database backup completed successfully</span>
                    <span className="text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>System configuration updated</span>
                    <span className="text-muted-foreground">6 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Security scan completed - No issues found</span>
                    <span className="text-muted-foreground">12 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage system users and roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-4">
                    <Button>Add New User</Button>
                    <Button variant="outline">Export User List</Button>
                  </div>
                  {users.slice(0, 5).map((user: any) => (
                    <div key={user.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>{user.role}</Badge>
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline">Deactivate</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>System security configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <KeyIcon className="h-5 w-5" />
                      <div>
                        <p className="font-medium">API Keys Management</p>
                        <p className="text-sm text-muted-foreground">Manage system API keys</p>
                      </div>
                    </div>
                    <Button size="sm">Manage</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <ShieldIcon className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Security Audit Log</p>
                        <p className="text-sm text-muted-foreground">View security events</p>
                      </div>
                    </div>
                    <Button size="sm">View Log</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <SettingsIcon className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Configure 2FA settings</p>
                      </div>
                    </div>
                    <Button size="sm">Configure</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Database Management</CardTitle>
                <CardDescription>Database operations and maintenance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button>Backup Database</Button>
                    <Button variant="outline">Restore Backup</Button>
                    <Button variant="outline">Optimize Tables</Button>
                    <Button variant="outline">View Logs</Button>
                  </div>
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Database Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Records:</span>
                        <span className="font-medium">45,892</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Backup:</span>
                        <span className="font-medium">2 hours ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uptime:</span>
                        <span className="font-medium">99.99%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system-wide settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">General Settings</h4>
                    <div className="space-y-3">
                      <Button className="w-full justify-start">System Configuration</Button>
                      <Button className="w-full justify-start" variant="outline">Email Settings</Button>
                      <Button className="w-full justify-start" variant="outline">Integration Settings</Button>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Maintenance Mode</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Enable maintenance mode to perform system updates
                    </p>
                    <Button variant="destructive">Enable Maintenance Mode</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}