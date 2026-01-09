import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Mail,
  Phone,
  Calendar,
  Shield,
  Crown,
  Ban,
  Trash2,
  UserCog,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  UserX,
} from "lucide-react";
import { format } from "date-fns";
import { AdminUser } from "@/hooks/useAdminUsers";

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onUpdateRole: (userId: string, role: string, action: "add" | "remove") => Promise<any>;
  onBanUser: (userId: string, duration: string) => Promise<any>;
  onUnbanUser: (userId: string) => Promise<any>;
  onDeleteUser: (userId: string) => Promise<any>;
}

export function UserDetailsDialog({
  open,
  onOpenChange,
  user,
  onUpdateRole,
  onBanUser,
  onUnbanUser,
  onDeleteUser,
}: UserDetailsDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [banDuration, setBanDuration] = useState("7");

  if (!user) return null;

  const handleRoleChange = async (role: string, action: "add" | "remove") => {
    setIsUpdating(true);
    await onUpdateRole(user.id, role, action);
    setIsUpdating(false);
  };

  const handleBan = async () => {
    setIsUpdating(true);
    await onBanUser(user.id, banDuration);
    setShowBanDialog(false);
    setIsUpdating(false);
  };

  const handleUnban = async () => {
    setIsUpdating(true);
    await onUnbanUser(user.id);
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    setIsUpdating(true);
    await onDeleteUser(user.id);
    setShowDeleteDialog(false);
    onOpenChange(false);
    setIsUpdating(false);
  };

  const isBanned = user.banned_until && new Date(user.banned_until) > new Date();
  const isAdmin = user.roles.includes("admin");
  const isAgent = user.roles.includes("agent");

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "agent":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-green-500/20 text-green-400 border-green-500/30";
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" />
              User Details
            </DialogTitle>
            <DialogDescription>
              View and manage user account settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* User Info Header */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/20 text-primary text-xl">
                  {user.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase() ||
                    user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{user.full_name || "No name"}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {user.phone}
                  </div>
                )}
              </div>
              {isBanned && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  <Ban className="h-3 w-3 mr-1" />
                  Banned
                </Badge>
              )}
            </div>

            <Separator />

            {/* Roles Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  User Roles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <Badge key={role} className={getRoleBadgeColor(role)}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No roles assigned</span>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Manage Roles</p>
                  <div className="flex flex-wrap gap-2">
                    {!isAdmin ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRoleChange("admin", "add")}
                        disabled={isUpdating}
                        className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                      >
                        {isUpdating ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <ShieldCheck className="h-3 w-3 mr-1" />
                        )}
                        Make Admin
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRoleChange("admin", "remove")}
                        disabled={isUpdating}
                        className="text-muted-foreground"
                      >
                        {isUpdating ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <ShieldAlert className="h-3 w-3 mr-1" />
                        )}
                        Remove Admin
                      </Button>
                    )}

                    {!isAgent ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRoleChange("agent", "add")}
                        disabled={isUpdating}
                        className="text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                      >
                        {isUpdating ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <UserCog className="h-3 w-3 mr-1" />
                        )}
                        Make Agent
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRoleChange("agent", "remove")}
                        disabled={isUpdating}
                        className="text-muted-foreground"
                      >
                        {isUpdating ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <UserX className="h-3 w-3 mr-1" />
                        )}
                        Remove Agent
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joined</span>
                  <span>{format(new Date(user.created_at), "PPP")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Sign In</span>
                  <span>
                    {user.last_sign_in_at
                      ? format(new Date(user.last_sign_in_at), "PPP p")
                      : "Never"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email Verified</span>
                  <span className="flex items-center gap-1">
                    {user.email_confirmed_at ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-400" />
                        Yes
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 text-red-400" />
                        No
                      </>
                    )}
                  </span>
                </div>
                {user.referral_code && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Referral Code</span>
                    <span className="font-mono">{user.referral_code}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Membership */}
            {user.subscription && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-400" />
                    Membership
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <Badge variant="outline" className="border-amber-400 text-amber-400">
                      {user.subscription.plan_name}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="capitalize">{user.subscription.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expires</span>
                    <span>{format(new Date(user.subscription.end_date), "PPP")}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {isBanned ? (
                <Button
                  variant="outline"
                  onClick={handleUnban}
                  disabled={isUpdating}
                  className="text-green-400 border-green-500/30 hover:bg-green-500/10"
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Unban User
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowBanDialog(true)}
                  disabled={isUpdating}
                  className="text-orange-400 border-orange-500/30 hover:bg-orange-500/10"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Ban User
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isUpdating}
                className="text-red-400 border-red-500/30 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ban Confirmation Dialog */}
      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban User</AlertDialogTitle>
            <AlertDialogDescription>
              This will prevent the user from signing in. Choose ban duration:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Select value={banDuration} onValueChange={setBanDuration}>
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Day</SelectItem>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
              <SelectItem value="permanent">Permanent</SelectItem>
            </SelectContent>
          </Select>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBan} className="bg-orange-500 hover:bg-orange-600">
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ban User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user's
              account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
