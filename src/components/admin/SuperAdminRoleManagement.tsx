import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Shield, 
  Crown, 
  UserCheck, 
  Users, 
  Eye,
  Plus,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
import { useAdminUsers, AdminUser } from "@/hooks/useAdminUsers";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ROLE_CONFIG = {
  super_admin: { 
    label: "Super Admin", 
    icon: Crown, 
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    description: "Full system access, can manage all roles"
  },
  admin: { 
    label: "Admin", 
    icon: Shield, 
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    description: "Platform management, can manage supervisors and below"
  },
  supervisor: { 
    label: "Supervisor", 
    icon: ShieldCheck, 
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    description: "Team oversight, can manage agents and users"
  },
  agent: { 
    label: "Agent", 
    icon: UserCheck, 
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    description: "Earn commission on bookings"
  },
  user: { 
    label: "User", 
    icon: Users, 
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    description: "Standard user access"
  },
};

const ROLE_HIERARCHY = ['super_admin', 'admin', 'supervisor', 'agent', 'user'];

interface CreateUserFormData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: string;
}

export function SuperAdminRoleManagement() {
  const { users, isLoading, refetch, updateRole } = useAdminUsers();
  const { isSuperAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [confirmRoleChange, setConfirmRoleChange] = useState<{
    userId: string;
    role: string;
    action: 'add' | 'remove';
  } | null>(null);
  
  const [createFormData, setCreateFormData] = useState<CreateUserFormData>({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    role: "user",
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter);
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const config = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG];
    if (!config) return null;
    const Icon = config.icon;
    return (
      <Badge key={role} variant="outline" className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getHighestRole = (roles: string[]): string => {
    for (const role of ROLE_HIERARCHY) {
      if (roles.includes(role)) return role;
    }
    return 'user';
  };

  const handleRoleChange = async (userId: string, role: string, action: 'add' | 'remove') => {
    // For sensitive roles, require confirmation
    if (['super_admin', 'admin'].includes(role)) {
      setConfirmRoleChange({ userId, role, action });
      return;
    }
    
    await executeRoleChange(userId, role, action);
  };

  const executeRoleChange = async (userId: string, role: string, action: 'add' | 'remove') => {
    const result = await updateRole(userId, role, action);
    if (result.success) {
      setConfirmRoleChange(null);
      setIsRoleDialogOpen(false);
    }
  };

  const handleCreateUser = async () => {
    if (!createFormData.email || !createFormData.password || !createFormData.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (createFormData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: {
          action: "create_user_with_role",
          email: createFormData.email,
          password: createFormData.password,
          fullName: createFormData.fullName,
          phone: createFormData.phone,
          role: createFormData.role,
        },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || "Failed to create user");
      }

      toast.success(`${ROLE_CONFIG[createFormData.role as keyof typeof ROLE_CONFIG]?.label || 'User'} created successfully`);
      setIsCreateDialogOpen(false);
      setCreateFormData({ email: "", password: "", fullName: "", phone: "", role: "user" });
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  // Role statistics
  const roleStats = ROLE_HIERARCHY.reduce((acc, role) => {
    acc[role] = users.filter(u => u.roles.includes(role)).length;
    return acc;
  }, {} as Record<string, number>);

  if (!isSuperAdmin) {
    return (
      <Card className="bg-card/50">
        <CardContent className="p-12 text-center">
          <ShieldAlert className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Super Admin Access Required</h3>
          <p className="text-muted-foreground">
            Only Super Admins can access role management features.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {ROLE_HIERARCHY.map(role => {
          const config = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG];
          const Icon = config.icon;
          return (
            <Card key={role} className="bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{roleStats[role] || 0}</p>
                    <p className="text-xs text-muted-foreground">{config.label}s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions Bar */}
      <Card className="bg-card/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {ROLE_HIERARCHY.map(role => (
                    <SelectItem key={role} value={role}>
                      {ROLE_CONFIG[role as keyof typeof ROLE_CONFIG].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                      Create a new user with a specific role. Super Admin only.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        placeholder="user@example.com"
                        value={createFormData.email}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Password *</Label>
                      <Input
                        type="password"
                        placeholder="Min 6 characters"
                        value={createFormData.password}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, password: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        placeholder="John Doe"
                        value={createFormData.fullName}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        placeholder="+91 XXXXX XXXXX"
                        value={createFormData.phone}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role *</Label>
                      <Select 
                        value={createFormData.role} 
                        onValueChange={(value) => setCreateFormData(prev => ({ ...prev, role: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_HIERARCHY.map(role => {
                            const config = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG];
                            return (
                              <SelectItem key={role} value={role}>
                                <div className="flex items-center gap-2">
                                  <config.icon className="w-4 h-4" />
                                  {config.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {ROLE_CONFIG[createFormData.role as keyof typeof ROLE_CONFIG]?.description}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateUser} disabled={isCreating}>
                      {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Create User
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>
            Manage user roles and permissions. Click on a user to modify their roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Highest Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.full_name || "No name"}</div>
                      <div className="text-xs text-muted-foreground">{user.phone || "No phone"}</div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? (
                          user.roles.map(role => getRoleBadge(role))
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">No roles</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(getHighestRole(user.roles))}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsRoleDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Role Management Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage User Roles</DialogTitle>
            <DialogDescription>
              {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                {ROLE_HIERARCHY.map(role => {
                  const config = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG];
                  const Icon = config.icon;
                  const hasRole = selectedUser.roles.includes(role);
                  
                  return (
                    <div 
                      key={role}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        hasRole ? 'bg-primary/10 border-primary/30' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{config.label}</p>
                          <p className="text-xs text-muted-foreground">{config.description}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={hasRole ? "destructive" : "default"}
                        onClick={() => handleRoleChange(
                          selectedUser.id, 
                          role, 
                          hasRole ? 'remove' : 'add'
                        )}
                      >
                        {hasRole ? 'Remove' : 'Add'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for sensitive roles */}
      <AlertDialog open={!!confirmRoleChange} onOpenChange={() => setConfirmRoleChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmRoleChange?.action === 'add' 
                ? `Are you sure you want to grant ${ROLE_CONFIG[confirmRoleChange?.role as keyof typeof ROLE_CONFIG]?.label} privileges to this user? This gives them elevated system access.`
                : `Are you sure you want to remove ${ROLE_CONFIG[confirmRoleChange?.role as keyof typeof ROLE_CONFIG]?.label} privileges from this user?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmRoleChange) {
                  executeRoleChange(
                    confirmRoleChange.userId,
                    confirmRoleChange.role,
                    confirmRoleChange.action
                  );
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}