import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Download,
  Eye,
  Crown,
  Shield,
  UserCog,
  Loader2,
  RefreshCw,
  Ban,
} from "lucide-react";
import { format } from "date-fns";
import { useAdminUsers, AdminUser } from "@/hooks/useAdminUsers";
import { UserDetailsDialog } from "./UserDetailsDialog";

export function AdminUserManagement() {
  const {
    users,
    isLoading,
    refetch,
    updateRole,
    banUser,
    unbanUser,
    deleteUser,
  } = useAdminUsers();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [membershipFilter, setMembershipFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery);

    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "admin" && user.roles.includes("admin")) ||
      (roleFilter === "agent" && user.roles.includes("agent")) ||
      (roleFilter === "user" && !user.roles.includes("admin") && !user.roles.includes("agent"));

    const matchesMembership =
      membershipFilter === "all" ||
      (membershipFilter === "none" && !user.subscription) ||
      user.subscription?.plan_name?.toLowerCase() === membershipFilter.toLowerCase();

    return matchesSearch && matchesRole && matchesMembership;
  });

  const getRoleBadges = (roles: string[]) => {
    if (roles.includes("admin")) {
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
          <Shield className="w-3 h-3 mr-1" />
          Admin
        </Badge>
      );
    }
    if (roles.includes("agent")) {
      return (
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          <UserCog className="w-3 h-3 mr-1" />
          Agent
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
        User
      </Badge>
    );
  };

  const getMembershipBadge = (subscription: AdminUser["subscription"]) => {
    if (!subscription) {
      return <span className="text-muted-foreground">-</span>;
    }

    const colors: Record<string, string> = {
      Platinum: "border-primary text-primary",
      Gold: "border-amber-400 text-amber-400",
      Silver: "border-slate-400 text-slate-400",
      Metal: "border-zinc-500 text-zinc-400",
    };

    return (
      <Badge variant="outline" className={colors[subscription.plan_name] || ""}>
        <Crown className="w-3 h-3 mr-1" />
        {subscription.plan_name}
      </Badge>
    );
  };

  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10 bg-muted/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40 bg-muted/30">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="agent">Agent</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Select value={membershipFilter} onValueChange={setMembershipFilter}>
            <SelectTrigger className="w-40 bg-muted/30">
              <SelectValue placeholder="Membership" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="none">No Plan</SelectItem>
              <SelectItem value="Metal">Metal</SelectItem>
              <SelectItem value="Silver">Silver</SelectItem>
              <SelectItem value="Gold">Gold</SelectItem>
              <SelectItem value="Platinum">Platinum</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/50">
          <div className="text-sm text-muted-foreground">Total Users</div>
          <div className="text-2xl font-bold">{users.length}</div>
        </Card>
        <Card className="p-4 bg-card/50">
          <div className="text-sm text-muted-foreground">Admins</div>
          <div className="text-2xl font-bold text-red-400">
            {users.filter((u) => u.roles.includes("admin")).length}
          </div>
        </Card>
        <Card className="p-4 bg-card/50">
          <div className="text-sm text-muted-foreground">Agents</div>
          <div className="text-2xl font-bold text-blue-400">
            {users.filter((u) => u.roles.includes("agent")).length}
          </div>
        </Card>
        <Card className="p-4 bg-card/50">
          <div className="text-sm text-muted-foreground">With Membership</div>
          <div className="text-2xl font-bold text-amber-400">
            {users.filter((u) => u.subscription).length}
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const isBanned =
                    user.banned_until && new Date(user.banned_until) > new Date();

                  return (
                    <TableRow key={user.id} className="border-border/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary/20 text-primary text-sm">
                              {user.full_name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase() || user.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.full_name || "No name"}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.phone || "-"}
                      </TableCell>
                      <TableCell>{getRoleBadges(user.roles)}</TableCell>
                      <TableCell>{getMembershipBadge(user.subscription)}</TableCell>
                      <TableCell>
                        {isBanned ? (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            <Ban className="w-3 h-3 mr-1" />
                            Banned
                          </Badge>
                        ) : user.email_confirmed_at ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(user.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* User Details Dialog */}
      <UserDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        user={selectedUser}
        onUpdateRole={updateRole}
        onBanUser={banUser}
        onUnbanUser={unbanUser}
        onDeleteUser={deleteUser}
      />
    </div>
  );
}
