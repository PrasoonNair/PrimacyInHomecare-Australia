import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertRoleSchema, insertUserRoleSchema, type Role, type Permission, type User } from "@shared/schema";
import { 
  Users, 
  Shield, 
  Plus, 
  Settings, 
  UserPlus, 
  Trash2, 
  Edit, 
  Crown,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  FileText,
  BarChart3,
  Database
} from "lucide-react";

const roleFormSchema = insertRoleSchema.extend({
  departments: z.array(z.string()).min(1, "At least one department is required"),
  permissionIds: z.array(z.string()).min(1, "At least one permission is required")
});

type RoleFormData = z.infer<typeof roleFormSchema>;

const DEPARTMENTS = [
  { value: "intake", label: "Intake", description: "Referrals & onboarding" },
  { value: "hr_recruitment", label: "HR & Recruitment", description: "Staff management" },
  { value: "finance", label: "Finance & Awards", description: "SCHADS compliance" },
  { value: "service_delivery", label: "Service Delivery", description: "Operations & allocation" },
  { value: "compliance_quality", label: "Compliance & Quality", description: "Quality assurance" }
];

const ROLE_TYPES = [
  { value: "super_admin", label: "Super Admin", icon: Crown, description: "Full system access" },
  { value: "admin", label: "Admin", icon: Shield, description: "Administrative access" },
  { value: "manager", label: "Manager", icon: Users, description: "Department management" },
  { value: "supervisor", label: "Supervisor", icon: Eye, description: "Team supervision" },
  { value: "staff", label: "Staff", icon: UserPlus, description: "Standard access" },
  { value: "support", label: "Support", icon: Settings, description: "Support functions" },
  { value: "readonly", label: "Read Only", icon: Lock, description: "View only access" }
];

const PERMISSION_CATEGORIES = {
  "Basic Operations": ["create", "read", "update", "delete"],
  "Administrative": ["approve", "manage_users", "system_settings", "admin_tools"],
  "Data & Reports": ["view_reports", "export_data"],
  "Specialized Access": ["financial_access", "clinical_access"]
};

export default function RoleManagement() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form setup
  const roleForm = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
      roleType: "staff",
      departments: [],
      permissionIds: []
    }
  });

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
    return null;
  }

  // Data fetching
  const { data: rolesWithPermissions = [], isLoading: rolesLoading } = useQuery<(Role & { permissions: Permission[] })[]>({
    queryKey: ["/api/roles-with-permissions"],
    retry: false,
  });

  const { data: permissions = [], isLoading: permissionsLoading } = useQuery<Permission[]>({
    queryKey: ["/api/permissions"],
    retry: false,
  });

  const { data: usersWithRoles = [], isLoading: usersLoading } = useQuery<(User & { roles: Role[] })[]>({
    queryKey: ["/api/users-with-roles"],
    retry: false,
  });

  // Mutations
  const createRoleMutation = useMutation({
    mutationFn: async (data: RoleFormData) => {
      const { permissionIds, ...roleData } = data;
      
      // Create the role first
      const role = await apiRequest(`/api/roles`, "POST", roleData);

      // Assign permissions to the role
      for (const permissionId of permissionIds) {
        await apiRequest(`/api/roles/${role.id}/permissions`, "POST", { permissionId });
      }

      return role;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles-with-permissions"] });
      toast({
        title: "Success",
        description: "Role created successfully",
      });
      setIsRoleFormOpen(false);
      roleForm.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive",
      });
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      return await apiRequest(`/api/users/${userId}/roles`, "POST", { roleId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users-with-roles"] });
      toast({
        title: "Success",
        description: "Role assigned successfully",
      });
      setIsAssignRoleOpen(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive",
      });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      return await apiRequest(`/api/roles/${roleId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles-with-permissions"] });
      toast({
        title: "Success",
        description: "Role deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive",
      });
    },
  });

  const handleCreateRole = (data: RoleFormData) => {
    createRoleMutation.mutate(data);
  };

  const handleAssignRole = (userId: string, roleId: string) => {
    assignRoleMutation.mutate({ userId, roleId });
  };

  const handleDeleteRole = (roleId: string) => {
    if (confirm("Are you sure you want to delete this role? This action cannot be undone.")) {
      deleteRoleMutation.mutate(roleId);
    }
  };

  const getRoleTypeIcon = (roleType: string) => {
    const type = ROLE_TYPES.find(t => t.value === roleType);
    return type ? type.icon : Shield;
  };

  const getRoleTypeBadgeColor = (roleType: string) => {
    switch (roleType) {
      case "super_admin": return "bg-gradient-to-r from-purple-500 to-purple-600 text-white";
      case "admin": return "bg-gradient-to-r from-red-500 to-red-600 text-white";
      case "manager": return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
      case "supervisor": return "bg-gradient-to-r from-green-500 to-green-600 text-white";
      case "staff": return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
      case "support": return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white";
      case "readonly": return "bg-gradient-to-r from-slate-500 to-slate-600 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  if (isLoading || rolesLoading || permissionsLoading || usersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading Role Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Role Management
              </h1>
              <p className="text-gray-600 mt-2">Create and manage user roles with department access and permissions</p>
            </div>
            <div className="flex gap-3">
              <Dialog open={isAssignRoleOpen} onOpenChange={setIsAssignRoleOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700" data-testid="button-assign-role">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Assign Role
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Assign Role to User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Select User</label>
                      <Select onValueChange={(userId) => {
                        const user = usersWithRoles.find(u => u.id === userId);
                        setSelectedUser(user || null);
                      }}>
                        <SelectTrigger data-testid="select-user">
                          <SelectValue placeholder="Choose a user" />
                        </SelectTrigger>
                        <SelectContent>
                          {usersWithRoles.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.firstName} {user.lastName} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedUser && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Select Role</label>
                        <div className="grid grid-cols-1 gap-2">
                          {rolesWithPermissions.map((role) => (
                            <div
                              key={role.id}
                              className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                              onClick={() => handleAssignRole(selectedUser.id, role.id)}
                              data-testid={`role-option-${role.id}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRoleTypeBadgeColor(role.roleType)}`}>
                                  {(() => {
                                    const Icon = getRoleTypeIcon(role.roleType);
                                    return <Icon className="w-4 h-4" />;
                                  })()}
                                </div>
                                <div>
                                  <p className="font-medium">{role.name}</p>
                                  <p className="text-sm text-gray-600">{role.description}</p>
                                </div>
                              </div>
                              <Badge className={getRoleTypeBadgeColor(role.roleType)}>
                                {role.roleType.replace('_', ' ')}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isRoleFormOpen} onOpenChange={setIsRoleFormOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" data-testid="button-create-role">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Role
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Role</DialogTitle>
                  </DialogHeader>
                  <Form {...roleForm}>
                    <form onSubmit={roleForm.handleSubmit(handleCreateRole)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Basic Information</h3>
                          
                          <FormField
                            control={roleForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Role Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="e.g., Department Manager" data-testid="input-role-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={roleForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea {...field} rows={3} placeholder="Describe this role's responsibilities..." data-testid="textarea-role-description" value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={roleForm.control}
                            name="roleType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Role Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-role-type">
                                      <SelectValue placeholder="Select role type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {ROLE_TYPES.map((type) => (
                                      <SelectItem key={type.value} value={type.value}>
                                        <div className="flex items-center gap-2">
                                          <type.icon className="w-4 h-4" />
                                          <div>
                                            <p className="font-medium">{type.label}</p>
                                            <p className="text-xs text-gray-500">{type.description}</p>
                                          </div>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Department Access */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Department Access</h3>
                          <FormField
                            control={roleForm.control}
                            name="departments"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Select Departments</FormLabel>
                                <div className="space-y-2">
                                  {DEPARTMENTS.map((dept) => (
                                    <div key={dept.value} className="flex items-center space-x-2 p-2 border rounded-lg">
                                      <Checkbox
                                        id={dept.value}
                                        checked={field.value.includes(dept.value)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            field.onChange([...field.value, dept.value]);
                                          } else {
                                            field.onChange(field.value.filter(v => v !== dept.value));
                                          }
                                        }}
                                        data-testid={`checkbox-dept-${dept.value}`}
                                      />
                                      <label htmlFor={dept.value} className="flex-1 cursor-pointer">
                                        <p className="font-medium">{dept.label}</p>
                                        <p className="text-sm text-gray-600">{dept.description}</p>
                                      </label>
                                    </div>
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Permissions */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Permissions</h3>
                        <FormField
                          control={roleForm.control}
                          name="permissionIds"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Select Permissions</FormLabel>
                              <div className="space-y-4">
                                {Object.entries(PERMISSION_CATEGORIES).map(([category, categoryPermissions]) => (
                                  <div key={category}>
                                    <h4 className="font-medium text-gray-700 mb-2">{category}</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                      {permissions
                                        .filter(p => categoryPermissions.includes(p.permissionType))
                                        .map((permission) => (
                                          <div key={permission.id} className="flex items-center space-x-2 p-2 border rounded">
                                            <Checkbox
                                              id={permission.id}
                                              checked={field.value.includes(permission.id)}
                                              onCheckedChange={(checked) => {
                                                if (checked) {
                                                  field.onChange([...field.value, permission.id]);
                                                } else {
                                                  field.onChange(field.value.filter(v => v !== permission.id));
                                                }
                                              }}
                                              data-testid={`checkbox-permission-${permission.id}`}
                                            />
                                            <label htmlFor={permission.id} className="text-sm cursor-pointer capitalize">
                                              {permission.name.replace('_', ' ')}
                                            </label>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button type="button" variant="outline" onClick={() => setIsRoleFormOpen(false)} data-testid="button-cancel">
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createRoleMutation.isPending}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                          data-testid="button-submit-role"
                        >
                          {createRoleMutation.isPending ? "Creating..." : "Create Role"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="roles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Role Management
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              User Assignments
            </TabsTrigger>
          </TabsList>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {rolesWithPermissions.map((role) => (
                <Card key={role.id} className="hover:shadow-lg transition-all duration-200" data-testid={`role-card-${role.id}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getRoleTypeBadgeColor(role.roleType)}`}>
                          {(() => {
                            const Icon = getRoleTypeIcon(role.roleType);
                            return <Icon className="w-5 h-5" />;
                          })()}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{role.name}</CardTitle>
                          <Badge className={`text-xs ${getRoleTypeBadgeColor(role.roleType)}`}>
                            {role.roleType.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => setSelectedRole(role)} data-testid={`button-edit-role-${role.id}`}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`button-delete-role-${role.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{role.description}</p>
                    
                    {role.departments && role.departments.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Departments:</p>
                        <div className="flex flex-wrap gap-1">
                          {role.departments.map((dept) => (
                            <Badge key={dept} variant="secondary" className="text-xs">
                              {DEPARTMENTS.find(d => d.value === dept)?.label || dept}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium mb-2">Permissions ({role.permissions.length}):</p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((permission) => (
                          <Badge key={permission.id} variant="outline" className="text-xs">
                            {permission.name.replace('_', ' ')}
                          </Badge>
                        ))}
                        {role.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {usersWithRoles.map((user) => (
                <Card key={user.id} className="hover:shadow-lg transition-all duration-200" data-testid={`user-card-${user.id}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {user.profileImageUrl ? (
                          <img 
                            src={user.profileImageUrl} 
                            alt={`${user.firstName} ${user.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg">{user.firstName} {user.lastName}</CardTitle>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Assigned Roles ({user.roles.length}):</p>
                      {user.roles.length > 0 ? (
                        <div className="space-y-2">
                          {user.roles.map((role) => (
                            <div key={role.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded flex items-center justify-center ${getRoleTypeBadgeColor(role.roleType)}`}>
                                  {(() => {
                                    const Icon = getRoleTypeIcon(role.roleType);
                                    return <Icon className="w-3 h-3" />;
                                  })()}
                                </div>
                                <span className="text-sm font-medium">{role.name}</span>
                              </div>
                              <Badge className={`text-xs ${getRoleTypeBadgeColor(role.roleType)}`}>
                                {role.roleType.replace('_', ' ')}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No roles assigned</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}