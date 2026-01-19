import { useState, useEffect, useCallback } from "react";
import { 
  Users, UserCheck, Eye, Search, Filter, RefreshCw,
  LogOut, Home, BarChart3, Bell, Settings, Menu, X,
  TrendingUp, Activity, Calendar, CheckCircle, Clock,
  XCircle, MessageSquare, Shield, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  roles: string[];
  created_at: string;
  last_sign_in_at: string | null;
  status: "active" | "inactive";
}

interface TeamStats {
  totalAgents: number;
  totalUsers: number;
  activeToday: number;
  pendingTasks: number;
}

const sidebarItems = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "agents", label: "My Agents", icon: UserCheck },
  { id: "users", label: "Users", icon: Users },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const SupervisorDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<TeamStats>({
    totalAgents: 0,
    totalUsers: 0,
    activeToday: 0,
    pendingTasks: 0,
  });
  
  const { user, signOut, role } = useAuth();
  const navigate = useNavigate();

  const supervisorName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Supervisor";

  const fetchTeamData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: { action: "list_users" },
      });

      if (error || !data?.success) {
        throw error || new Error(data?.error || "Failed to fetch team data");
      }

      // Filter to show only agents and users (supervisors can manage these)
      const filteredMembers = data.data.users.filter((u: any) => 
        u.roles.some((r: string) => ["agent", "user"].includes(r))
      );

      setTeamMembers(filteredMembers.map((u: any) => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        phone: u.phone,
        roles: u.roles,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        status: u.last_sign_in_at && 
          new Date(u.last_sign_in_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
          ? "active" : "inactive",
      })));

      // Calculate stats
      const agents = filteredMembers.filter((u: any) => u.roles.includes("agent"));
      const users = filteredMembers.filter((u: any) => u.roles.includes("user") && !u.roles.includes("agent"));
      const activeToday = filteredMembers.filter((u: any) => 
        u.last_sign_in_at && new Date(u.last_sign_in_at).toDateString() === new Date().toDateString()
      );

      setStats({
        totalAgents: agents.length,
        totalUsers: users.length,
        activeToday: activeToday.length,
        pendingTasks: Math.floor(Math.random() * 20), // Placeholder
      });

    } catch (err: any) {
      console.error("Error fetching team data:", err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Active</Badge>;
    }
    return <Badge variant="outline" className="bg-slate-500/20 text-slate-400 border-slate-500/30">Inactive</Badge>;
  };

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes("agent")) {
      return <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Agent</Badge>;
    }
    return <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">User</Badge>;
  };

  const filteredTeamMembers = teamMembers.filter(member => {
    const matchesSearch = 
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const agents = filteredTeamMembers.filter(m => m.roles.includes("agent"));
  const users = filteredTeamMembers.filter(m => m.roles.includes("user") && !m.roles.includes("agent"));

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-2 text-sm text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <span>{trend}</span>
              </div>
            )}
          </div>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
            <Icon className="w-7 h-7" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="My Agents" 
          value={stats.totalAgents} 
          icon={UserCheck} 
          color="bg-emerald-500/20 text-emerald-400"
          trend="+2 this week"
        />
        <StatCard 
          title="Users" 
          value={stats.totalUsers} 
          icon={Users} 
          color="bg-blue-500/20 text-blue-400"
          trend="+5 this week"
        />
        <StatCard 
          title="Active Today" 
          value={stats.activeToday} 
          icon={Activity} 
          color="bg-amber-500/20 text-amber-400"
        />
        <StatCard 
          title="Pending Tasks" 
          value={stats.pendingTasks} 
          icon={Clock} 
          color="bg-purple-500/20 text-purple-400"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/50 cursor-pointer hover:border-primary/50 transition-all" onClick={() => setActiveSection("agents")}>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold">Manage Agents</p>
                <p className="text-sm text-muted-foreground">View and manage your agents</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="bg-card/50 cursor-pointer hover:border-primary/50 transition-all" onClick={() => setActiveSection("users")}>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold">View Users</p>
                <p className="text-sm text-muted-foreground">Browse registered users</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="bg-card/50 cursor-pointer hover:border-primary/50 transition-all" onClick={() => setActiveSection("reports")}>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="font-semibold">View Reports</p>
                <p className="text-sm text-muted-foreground">Team performance stats</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle>Recent Team Activity</CardTitle>
          <CardDescription>Latest activity from your team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agents.slice(0, 5).map((agent) => (
              <div key={agent.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-emerald-500/20 text-emerald-400">
                      {(agent.full_name || agent.email).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{agent.full_name || agent.email}</p>
                    <p className="text-sm text-muted-foreground">{agent.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(agent.status)}
                  <span className="text-sm text-muted-foreground">
                    {agent.last_sign_in_at 
                      ? new Date(agent.last_sign_in_at).toLocaleDateString()
                      : "Never"}
                  </span>
                </div>
              </div>
            ))}
            {agents.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No agents found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAgentManagement = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-card/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" onClick={fetchTeamData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Agents Table */}
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle>My Agents ({agents.length})</CardTitle>
          <CardDescription>Agents under your supervision</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-sm">
                          {(agent.full_name || agent.email).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{agent.full_name || "No name"}</p>
                        <p className="text-xs text-muted-foreground">{agent.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p>{agent.phone || "No phone"}</p>
                  </TableCell>
                  <TableCell>{getStatusBadge(agent.status)}</TableCell>
                  <TableCell>
                    {agent.last_sign_in_at 
                      ? new Date(agent.last_sign_in_at).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    {new Date(agent.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {agents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No agents found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-card/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" onClick={fetchTeamData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
          <CardDescription>Registered platform users</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className="bg-blue-500/20 text-blue-400 text-sm">
                          {(user.full_name || user.email).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name || "No name"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p>{user.phone || "No phone"}</p>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    {user.last_sign_in_at 
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
            <CardDescription>Overview of your team's metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-border/50">
              <span className="text-muted-foreground">Total Team Members</span>
              <span className="font-semibold">{stats.totalAgents + stats.totalUsers}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border/50">
              <span className="text-muted-foreground">Active Agents</span>
              <span className="font-semibold">{agents.filter(a => a.status === "active").length}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border/50">
              <span className="text-muted-foreground">Active Users</span>
              <span className="font-semibold">{users.filter(u => u.status === "active").length}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-muted-foreground">Team Activity Rate</span>
              <span className="font-semibold text-emerald-400">
                {teamMembers.length > 0 
                  ? Math.round((teamMembers.filter(m => m.status === "active").length / teamMembers.length) * 100)
                  : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>This week's highlights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="font-semibold text-emerald-400">{stats.activeToday}</p>
                <p className="text-sm text-muted-foreground">Active today</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Clock className="w-8 h-8 text-amber-400" />
              <div>
                <p className="font-semibold text-amber-400">{stats.pendingTasks}</p>
                <p className="text-sm text-muted-foreground">Pending tasks</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Activity className="w-8 h-8 text-blue-400" />
              <div>
                <p className="font-semibold text-blue-400">{teamMembers.length}</p>
                <p className="text-sm text-muted-foreground">Total team size</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSettings = () => (
    <Card className="bg-card/50">
      <CardHeader>
        <CardTitle>Supervisor Settings</CardTitle>
        <CardDescription>Manage your supervisor preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium">Notification Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive email updates about team activity</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Daily Reports</p>
                <p className="text-sm text-muted-foreground">Get daily summary of team performance</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "overview": return renderOverview();
      case "agents": return renderAgentManagement();
      case "users": return renderUserManagement();
      case "reports": return renderReports();
      case "settings": return renderSettings();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-card/95 backdrop-blur-xl border-r border-border/50 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                {sidebarOpen && <span className="font-bold text-lg">Supervisor</span>}
              </Link>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="h-8 w-8 p-0">
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  activeSection === item.id 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' 
                    : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-border/50">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-red-400 transition-all"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{sidebarItems.find(i => i.id === activeSection)?.label}</h1>
              <p className="text-sm text-muted-foreground">Manage your team effectively</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full text-[10px] flex items-center justify-center text-white">3</span>
              </Button>
              <Separator orientation="vertical" className="h-8" />
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-orange-500/20 text-orange-400">
                    {supervisorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{supervisorName}</p>
                  <p className="text-xs text-muted-foreground">Supervisor</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </main>
    </div>
  );
};

export default SupervisorDashboard;