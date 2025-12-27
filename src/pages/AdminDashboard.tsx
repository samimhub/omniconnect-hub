import { useState, useEffect } from "react";
import { 
  Users, UserCheck, Building2, Hotel, Plane, Car, Wallet, 
  Settings, BarChart3, Bell, Shield, FileText, Gift, 
  TrendingUp, TrendingDown, DollarSign, Activity, Eye, 
  CheckCircle, XCircle, Clock, Search, Filter, MoreVertical,
  Plus, Download, Upload, Edit, Trash2, Ban, UserPlus,
  Stethoscope, BedDouble, MapPin, CreditCard, Receipt,
  PieChart, Calendar, AlertTriangle, ChevronRight, Menu,
  X, LogOut, Home, Layers, MessageSquare, HelpCircle,
  Crown, Star, Percent, Zap, Award, Target, ArrowUpRight,
  ArrowDownRight, RefreshCw, IndianRupee
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
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
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { useAdminSubscriptions } from "@/hooks/useAdminSubscriptions";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Mock Data
const dashboardStats = {
  totalUsers: 12584,
  totalAgents: 342,
  totalBookings: 8956,
  totalRevenue: 2458960,
  pendingVerifications: 156,
  pendingWithdrawals: 89,
  activeHospitals: 234,
  activeHotels: 189,
  activeTravelPackages: 67,
  activeDrivers: 456,
  todayBookings: 127,
  monthlyGrowth: 23.5,
};

const recentUsers = [
  { id: 1, name: "Rahul Sharma", email: "rahul@email.com", phone: "+91 98765 43210", status: "verified", membership: "Gold", joinDate: "2024-01-15", avatar: "" },
  { id: 2, name: "Priya Patel", email: "priya@email.com", phone: "+91 87654 32109", status: "pending", membership: "Metal", joinDate: "2024-01-14", avatar: "" },
  { id: 3, name: "Amit Kumar", email: "amit@email.com", phone: "+91 76543 21098", status: "verified", membership: "Platinum", joinDate: "2024-01-13", avatar: "" },
  { id: 4, name: "Sneha Gupta", email: "sneha@email.com", phone: "+91 65432 10987", status: "rejected", membership: "Silver", joinDate: "2024-01-12", avatar: "" },
  { id: 5, name: "Vikram Singh", email: "vikram@email.com", phone: "+91 54321 09876", status: "pending", membership: "Gold", joinDate: "2024-01-11", avatar: "" },
];

const recentAgents = [
  { id: 1, name: "Agent Rajesh", email: "rajesh@agent.com", phone: "+91 98765 11111", status: "active", totalEarnings: 45600, totalBookings: 234, rating: 4.8 },
  { id: 2, name: "Agent Meera", email: "meera@agent.com", phone: "+91 98765 22222", status: "active", totalEarnings: 38900, totalBookings: 189, rating: 4.6 },
  { id: 3, name: "Agent Suresh", email: "suresh@agent.com", phone: "+91 98765 33333", status: "suspended", totalEarnings: 12300, totalBookings: 67, rating: 3.9 },
  { id: 4, name: "Agent Kavita", email: "kavita@agent.com", phone: "+91 98765 44444", status: "pending", totalEarnings: 0, totalBookings: 0, rating: 0 },
];

const withdrawalRequests = [
  { id: 1, user: "Agent Rajesh", type: "Agent", amount: 5600, method: "Bank Transfer", status: "pending", date: "2024-01-15" },
  { id: 2, user: "Rahul Sharma", type: "User", amount: 1200, method: "UPI", status: "pending", date: "2024-01-14" },
  { id: 3, user: "Agent Meera", type: "Agent", amount: 8900, method: "Bank Transfer", status: "approved", date: "2024-01-13" },
  { id: 4, user: "Priya Patel", type: "User", amount: 450, method: "UPI", status: "rejected", date: "2024-01-12" },
];

const hospitals = [
  { id: 1, name: "Apollo Hospital", location: "Mumbai", doctors: 45, appointments: 1234, commission: 5, status: "active" },
  { id: 2, name: "Fortis Healthcare", location: "Delhi", doctors: 38, appointments: 987, commission: 4.5, status: "active" },
  { id: 3, name: "Max Hospital", location: "Bangalore", doctors: 52, appointments: 1567, commission: 5, status: "active" },
  { id: 4, name: "Medanta", location: "Gurugram", doctors: 67, appointments: 2134, commission: 6, status: "pending" },
];

const hotels = [
  { id: 1, name: "Taj Palace", location: "Mumbai", rooms: 250, bookings: 456, rating: 4.9, status: "active" },
  { id: 2, name: "The Oberoi", location: "Delhi", rooms: 180, bookings: 389, rating: 4.8, status: "active" },
  { id: 3, name: "ITC Grand", location: "Kolkata", rooms: 320, bookings: 567, rating: 4.7, status: "active" },
  { id: 4, name: "Leela Palace", location: "Bangalore", rooms: 200, bookings: 423, rating: 4.8, status: "pending" },
];

const travelPackages = [
  { id: 1, name: "Goa Beach Getaway", duration: "5D/4N", price: 25000, bookings: 89, status: "active" },
  { id: 2, name: "Kashmir Paradise", duration: "7D/6N", price: 45000, bookings: 67, status: "active" },
  { id: 3, name: "Kerala Backwaters", duration: "4D/3N", price: 18000, bookings: 123, status: "active" },
  { id: 4, name: "Rajasthan Heritage", duration: "6D/5N", price: 35000, bookings: 45, status: "draft" },
];

// Membership Plans Data
const membershipPlans = [
  {
    id: 1,
    name: "Metal",
    icon: Shield,
    color: "bg-zinc-500",
    textColor: "text-zinc-400",
    monthlyPrice: 199,
    yearlyPrice: 1999,
    discount: 16,
    modules: ["Hospital"],
    features: [
      "Hospital appointment booking",
      "Basic cashback (2%)",
      "Email support",
      "Appointment history",
    ],
    subscribers: 3245,
    revenue: 646855,
    status: "active",
  },
  {
    id: 2,
    name: "Silver",
    icon: Star,
    color: "bg-slate-400",
    textColor: "text-slate-300",
    monthlyPrice: 399,
    yearlyPrice: 3999,
    discount: 17,
    modules: ["Hospital", "Hotel"],
    features: [
      "All Metal features",
      "Hotel room booking",
      "Enhanced cashback (4%)",
      "Priority support",
      "Exclusive hotel deals",
    ],
    subscribers: 4567,
    revenue: 1822233,
    status: "active",
  },
  {
    id: 3,
    name: "Gold",
    icon: Crown,
    color: "bg-amber-500",
    textColor: "text-amber-400",
    monthlyPrice: 699,
    yearlyPrice: 6999,
    discount: 17,
    modules: ["Hospital", "Hotel", "Travel"],
    features: [
      "All Silver features",
      "Travel package booking",
      "Premium cashback (6%)",
      "24/7 phone support",
      "Early access to deals",
      "Free travel insurance",
    ],
    subscribers: 3890,
    revenue: 2721110,
    status: "active",
    popular: true,
  },
  {
    id: 4,
    name: "Platinum",
    icon: Award,
    color: "bg-gradient-to-r from-primary to-purple-500",
    textColor: "text-primary",
    monthlyPrice: 1299,
    yearlyPrice: 12999,
    discount: 17,
    modules: ["Hospital", "Hotel", "Travel", "Ride"],
    features: [
      "All Gold features",
      "Ride booking service",
      "Maximum cashback (10%)",
      "Personal account manager",
      "VIP lounge access",
      "Concierge services",
      "Family benefits",
    ],
    subscribers: 1456,
    revenue: 1891944,
    status: "active",
  },
];

const membershipSubscribers = [
  { id: 1, user: "Rahul Sharma", plan: "Gold", startDate: "2024-01-01", expiryDate: "2025-01-01", status: "active", amount: 6999 },
  { id: 2, user: "Priya Patel", plan: "Silver", startDate: "2024-02-15", expiryDate: "2025-02-15", status: "active", amount: 3999 },
  { id: 3, user: "Amit Kumar", plan: "Platinum", startDate: "2023-12-01", expiryDate: "2024-12-01", status: "expiring", amount: 12999 },
  { id: 4, user: "Sneha Gupta", plan: "Metal", startDate: "2024-01-20", expiryDate: "2024-07-20", status: "expired", amount: 1999 },
  { id: 5, user: "Vikram Singh", plan: "Gold", startDate: "2024-03-01", expiryDate: "2025-03-01", status: "active", amount: 6999 },
];

// Reports & Analytics Data
const revenueData = [
  { month: "Jan", hospital: 245000, hotel: 189000, travel: 156000, ride: 89000 },
  { month: "Feb", hospital: 278000, hotel: 215000, travel: 178000, ride: 102000 },
  { month: "Mar", hospital: 312000, hotel: 245000, travel: 198000, ride: 118000 },
  { month: "Apr", hospital: 298000, hotel: 267000, travel: 223000, ride: 134000 },
  { month: "May", hospital: 356000, hotel: 298000, travel: 256000, ride: 156000 },
  { month: "Jun", hospital: 389000, hotel: 334000, travel: 289000, ride: 178000 },
];

const userGrowthData = [
  { month: "Jan", users: 8500, agents: 245 },
  { month: "Feb", users: 9200, agents: 267 },
  { month: "Mar", users: 10100, agents: 289 },
  { month: "Apr", users: 10800, agents: 312 },
  { month: "May", users: 11600, agents: 328 },
  { month: "Jun", users: 12584, agents: 342 },
];

const bookingTrendsData = [
  { month: "Jan", bookings: 1234 },
  { month: "Feb", bookings: 1456 },
  { month: "Mar", bookings: 1678 },
  { month: "Apr", bookings: 1523 },
  { month: "May", bookings: 1890 },
  { month: "Jun", bookings: 2175 },
];

const moduleRevenueShare = [
  { name: "Hospital", value: 35, color: "#14b8a6" },
  { name: "Hotel", value: 28, color: "#f59e0b" },
  { name: "Travel", value: 22, color: "#0ea5e9" },
  { name: "Ride", value: 15, color: "#10b981" },
];

const membershipDistribution = [
  { name: "Metal", value: 3245, color: "#71717a" },
  { name: "Silver", value: 4567, color: "#94a3b8" },
  { name: "Gold", value: 3890, color: "#f59e0b" },
  { name: "Platinum", value: 1456, color: "#8b5cf6" },
];

const drivers = [
  { id: 1, name: "Driver Raju", vehicle: "Swift Dzire", rides: 567, rating: 4.7, earnings: 34500, status: "online" },
  { id: 2, name: "Driver Mohan", vehicle: "Innova", rides: 423, rating: 4.5, earnings: 45600, status: "offline" },
  { id: 3, name: "Driver Sunil", vehicle: "Ertiga", rides: 389, rating: 4.8, earnings: 38900, status: "online" },
  { id: 4, name: "Driver Kiran", vehicle: "Sedan", rides: 234, rating: 4.2, earnings: 23400, status: "suspended" },
];

const sidebarItems = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "users", label: "User Management", icon: Users },
  { id: "agents", label: "Agent Management", icon: UserCheck },
  { id: "hospitals", label: "Hospital Management", icon: Building2 },
  { id: "hotels", label: "Hotel Management", icon: Hotel },
  { id: "travel", label: "Travel Management", icon: Plane },
  { id: "rides", label: "Ride Management", icon: Car },
  { id: "wallet", label: "Wallet & Payments", icon: Wallet },
  { id: "memberships", label: "Memberships", icon: CreditCard },
  { id: "reports", label: "Reports & Analytics", icon: BarChart3 },
  { id: "cms", label: "CMS & Content", icon: FileText },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Fetch real subscription data
  const { subscriptions: realSubscriptions, stats: subStats, isLoading: subLoading } = useAdminSubscriptions();

  const adminName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Admin";

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
    const variants: Record<string, string> = {
      verified: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      online: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      draft: "bg-slate-500/20 text-slate-400 border-slate-500/30",
      offline: "bg-slate-500/20 text-slate-400 border-slate-500/30",
      rejected: "bg-red-500/20 text-red-400 border-red-500/30",
      suspended: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return variants[status] || variants.pending;
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendUp, color }: any) => (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                {trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
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
          title="Total Users" 
          value={dashboardStats.totalUsers.toLocaleString()} 
          icon={Users} 
          trend="+12.5% this month"
          trendUp={true}
          color="bg-primary/20 text-primary"
        />
        <StatCard 
          title="Total Agents" 
          value={dashboardStats.totalAgents.toLocaleString()} 
          icon={UserCheck} 
          trend="+8.3% this month"
          trendUp={true}
          color="bg-emerald-500/20 text-emerald-400"
        />
        <StatCard 
          title="Total Bookings" 
          value={dashboardStats.totalBookings.toLocaleString()} 
          icon={Activity} 
          trend="+23.5% this month"
          trendUp={true}
          color="bg-sky-500/20 text-sky-400"
        />
        <StatCard 
          title="Total Revenue" 
          value={`₹${(dashboardStats.totalRevenue / 100000).toFixed(1)}L`} 
          icon={DollarSign} 
          trend="+18.2% this month"
          trendUp={true}
          color="bg-amber-500/20 text-amber-400"
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Pending Verifications" 
          value={dashboardStats.pendingVerifications} 
          icon={Clock} 
          color="bg-orange-500/20 text-orange-400"
        />
        <StatCard 
          title="Pending Withdrawals" 
          value={dashboardStats.pendingWithdrawals} 
          icon={Wallet} 
          color="bg-purple-500/20 text-purple-400"
        />
        <StatCard 
          title="Today's Bookings" 
          value={dashboardStats.todayBookings} 
          icon={Calendar} 
          color="bg-teal-500/20 text-teal-400"
        />
        <StatCard 
          title="Active Services" 
          value={dashboardStats.activeHospitals + dashboardStats.activeHotels + dashboardStats.activeTravelPackages} 
          icon={Layers} 
          color="bg-pink-500/20 text-pink-400"
        />
      </div>

      {/* Module Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-hospital/10 to-hospital/5 border-hospital/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-hospital/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-hospital" />
              </div>
              <span className="font-semibold">Hospital Module</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Hospitals</span>
                <span className="font-medium">{dashboardStats.activeHospitals}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Appointments</span>
                <span className="font-medium">5,922</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-hotel/10 to-hotel/5 border-hotel/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-hotel/20 flex items-center justify-center">
                <Hotel className="w-5 h-5 text-hotel" />
              </div>
              <span className="font-semibold">Hotel Module</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Hotels</span>
                <span className="font-medium">{dashboardStats.activeHotels}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Bookings</span>
                <span className="font-medium">1,835</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-travel/10 to-travel/5 border-travel/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-travel/20 flex items-center justify-center">
                <Plane className="w-5 h-5 text-travel" />
              </div>
              <span className="font-semibold">Travel Module</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Packages</span>
                <span className="font-medium">{dashboardStats.activeTravelPackages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Bookings</span>
                <span className="font-medium">324</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-ride/10 to-ride/5 border-ride/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-ride/20 flex items-center justify-center">
                <Car className="w-5 h-5 text-ride" />
              </div>
              <span className="font-semibold">Ride Module</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Drivers</span>
                <span className="font-medium">{dashboardStats.activeDrivers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Rides</span>
                <span className="font-medium">875</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Pending Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Users</CardTitle>
              <CardDescription>Newly registered users</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveSection("users")}>
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.slice(0, 4).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Badge className={getStatusBadge(user.status)}>{user.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Withdrawals */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Pending Withdrawals</CardTitle>
              <CardDescription>Requires your approval</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveSection("wallet")}>
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {withdrawalRequests.filter(w => w.status === "pending").map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{request.user}</p>
                      <p className="text-xs text-muted-foreground">{request.method} • {request.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-amber-400">₹{request.amount.toLocaleString()}</p>
                    <div className="flex gap-1 mt-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-emerald-400 hover:text-emerald-300">
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-red-400 hover:text-red-300">
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search users..." className="pl-10 bg-muted/30" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-40 bg-muted/30">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-40 bg-muted/30">
              <SelectValue placeholder="Membership" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="metal">Metal</SelectItem>
              <SelectItem value="silver">Silver</SelectItem>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="platinum">Platinum</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button className="gap-2">
            <UserPlus className="w-4 h-4" /> Add User
          </Button>
        </div>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Membership</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentUsers.map((user) => (
              <TableRow key={user.id} className="border-border/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/20 text-primary text-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.phone}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    user.membership === "Platinum" ? "border-primary text-primary" :
                    user.membership === "Gold" ? "border-amber-400 text-amber-400" :
                    user.membership === "Silver" ? "border-slate-400 text-slate-400" :
                    "border-zinc-500 text-zinc-400"
                  }>
                    {user.membership}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadge(user.status)}>{user.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.joinDate}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="w-4 h-4" />
                    </Button>
                    {user.status === "pending" && (
                      <>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-400">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400">
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400">
                      <Ban className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const renderAgentManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search agents..." className="pl-10 bg-muted/30" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-40 bg-muted/30">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button className="gap-2">
            <UserPlus className="w-4 h-4" /> Add Agent
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Agents" value={dashboardStats.totalAgents} icon={UserCheck} color="bg-primary/20 text-primary" />
        <StatCard title="Active Agents" value="298" icon={Activity} color="bg-emerald-500/20 text-emerald-400" />
        <StatCard title="Pending Approval" value="24" icon={Clock} color="bg-amber-500/20 text-amber-400" />
        <StatCard title="Total Commission Paid" value="₹4.5L" icon={DollarSign} color="bg-purple-500/20 text-purple-400" />
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead>Agent</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Total Bookings</TableHead>
              <TableHead>Earnings</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentAgents.map((agent) => (
              <TableRow key={agent.id} className="border-border/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-sm">
                        {agent.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-sm text-muted-foreground">{agent.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{agent.phone}</TableCell>
                <TableCell className="font-medium">{agent.totalBookings}</TableCell>
                <TableCell className="font-medium text-emerald-400">₹{agent.totalEarnings.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-amber-400">★</span>
                    <span>{agent.rating || "N/A"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadge(agent.status)}>{agent.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400">
                      <Ban className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const renderHospitalManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search hospitals..." className="pl-10 bg-muted/30" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-40 bg-muted/30">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="mumbai">Mumbai</SelectItem>
              <SelectItem value="delhi">Delhi</SelectItem>
              <SelectItem value="bangalore">Bangalore</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Stethoscope className="w-4 h-4" /> Add Doctor
          </Button>
          <Button className="gap-2 bg-hospital hover:bg-hospital/90">
            <Plus className="w-4 h-4" /> Add Hospital
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Hospitals" value={dashboardStats.activeHospitals} icon={Building2} color="bg-hospital/20 text-hospital" />
        <StatCard title="Total Doctors" value="892" icon={Stethoscope} color="bg-teal-500/20 text-teal-400" />
        <StatCard title="Today's Appointments" value="67" icon={Calendar} color="bg-sky-500/20 text-sky-400" />
        <StatCard title="Revenue Generated" value="₹8.9L" icon={DollarSign} color="bg-emerald-500/20 text-emerald-400" />
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead>Hospital</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Doctors</TableHead>
              <TableHead>Appointments</TableHead>
              <TableHead>Commission %</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hospitals.map((hospital) => (
              <TableRow key={hospital.id} className="border-border/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-hospital/20 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-hospital" />
                    </div>
                    <span className="font-medium">{hospital.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {hospital.location}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{hospital.doctors}</TableCell>
                <TableCell className="font-medium">{hospital.appointments.toLocaleString()}</TableCell>
                <TableCell className="font-medium text-emerald-400">{hospital.commission}%</TableCell>
                <TableCell>
                  <Badge className={getStatusBadge(hospital.status)}>{hospital.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const renderHotelManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search hotels..." className="pl-10 bg-muted/30" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <BedDouble className="w-4 h-4" /> Add Room
          </Button>
          <Button className="gap-2 bg-hotel hover:bg-hotel/90 text-hotel-foreground">
            <Plus className="w-4 h-4" /> Add Hotel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Hotels" value={dashboardStats.activeHotels} icon={Hotel} color="bg-hotel/20 text-hotel" />
        <StatCard title="Total Rooms" value="2,450" icon={BedDouble} color="bg-amber-500/20 text-amber-400" />
        <StatCard title="Today's Bookings" value="34" icon={Calendar} color="bg-sky-500/20 text-sky-400" />
        <StatCard title="Revenue Generated" value="₹12.3L" icon={DollarSign} color="bg-emerald-500/20 text-emerald-400" />
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead>Hotel</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Rooms</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hotels.map((hotel) => (
              <TableRow key={hotel.id} className="border-border/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-hotel/20 flex items-center justify-center">
                      <Hotel className="w-5 h-5 text-hotel" />
                    </div>
                    <span className="font-medium">{hotel.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {hotel.location}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{hotel.rooms}</TableCell>
                <TableCell className="font-medium">{hotel.bookings}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-amber-400">★</span>
                    <span>{hotel.rating}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadge(hotel.status)}>{hotel.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const renderTravelManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search packages..." className="pl-10 bg-muted/30" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileText className="w-4 h-4" /> Add Itinerary
          </Button>
          <Button className="gap-2 bg-travel hover:bg-travel/90">
            <Plus className="w-4 h-4" /> Add Package
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Active Packages" value={dashboardStats.activeTravelPackages} icon={Plane} color="bg-travel/20 text-travel" />
        <StatCard title="Total Bookings" value="324" icon={Receipt} color="bg-purple-500/20 text-purple-400" />
        <StatCard title="This Month" value="45" icon={Calendar} color="bg-sky-500/20 text-sky-400" />
        <StatCard title="Revenue Generated" value="₹28.5L" icon={DollarSign} color="bg-emerald-500/20 text-emerald-400" />
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead>Package</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {travelPackages.map((pkg) => (
              <TableRow key={pkg.id} className="border-border/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-travel/20 flex items-center justify-center">
                      <Plane className="w-5 h-5 text-travel" />
                    </div>
                    <span className="font-medium">{pkg.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{pkg.duration}</TableCell>
                <TableCell className="font-medium">₹{pkg.price.toLocaleString()}</TableCell>
                <TableCell className="font-medium">{pkg.bookings}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadge(pkg.status)}>{pkg.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const renderRideManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search drivers..." className="pl-10 bg-muted/30" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-40 bg-muted/30">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="gap-2 bg-ride hover:bg-ride/90">
          <Plus className="w-4 h-4" /> Add Driver
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Drivers" value={dashboardStats.activeDrivers} icon={Car} color="bg-ride/20 text-ride" />
        <StatCard title="Online Now" value="234" icon={Activity} color="bg-emerald-500/20 text-emerald-400" />
        <StatCard title="Today's Rides" value="89" icon={Calendar} color="bg-sky-500/20 text-sky-400" />
        <StatCard title="Revenue Generated" value="₹5.6L" icon={DollarSign} color="bg-amber-500/20 text-amber-400" />
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead>Driver</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Total Rides</TableHead>
              <TableHead>Earnings</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow key={driver.id} className="border-border/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-ride/20 text-ride text-sm">
                        {driver.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{driver.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{driver.vehicle}</TableCell>
                <TableCell className="font-medium">{driver.rides}</TableCell>
                <TableCell className="font-medium text-emerald-400">₹{driver.earnings.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-amber-400">★</span>
                    <span>{driver.rating}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadge(driver.status)}>{driver.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400">
                      <Ban className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const renderWalletManagement = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Wallet Balance" value="₹45.6L" icon={Wallet} color="bg-primary/20 text-primary" />
        <StatCard title="Pending Withdrawals" value="₹2.3L" icon={Clock} color="bg-amber-500/20 text-amber-400" />
        <StatCard title="Total Commissions" value="₹12.8L" icon={DollarSign} color="bg-emerald-500/20 text-emerald-400" />
        <StatCard title="Referral Payouts" value="₹3.2L" icon={Gift} color="bg-purple-500/20 text-purple-400" />
      </div>

      <Tabs defaultValue="withdrawals" className="w-full">
        <TabsList className="bg-muted/30 border border-border/50">
          <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
          <TabsTrigger value="commissions">Commission Settings</TabsTrigger>
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="withdrawals" className="mt-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawalRequests.map((request) => (
                  <TableRow key={request.id} className="border-border/30">
                    <TableCell className="font-medium">{request.user}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.type}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-amber-400">₹{request.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{request.method}</TableCell>
                    <TableCell className="text-muted-foreground">{request.date}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(request.status)}>{request.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {request.status === "pending" && (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" className="h-8 gap-1 bg-emerald-500 hover:bg-emerald-600">
                            <CheckCircle className="w-4 h-4" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" className="h-8 gap-1">
                            <XCircle className="w-4 h-4" /> Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-hospital" />
                  Hospital Commission
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">User Commission</span>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="3" className="w-20 h-8 bg-muted/30" />
                    <span>%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Agent Commission</span>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="5" className="w-20 h-8 bg-muted/30" />
                    <span>%</span>
                  </div>
                </div>
                <Button size="sm" className="w-full">Save Changes</Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Hotel className="w-5 h-5 text-hotel" />
                  Hotel Commission
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">User Commission</span>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="4" className="w-20 h-8 bg-muted/30" />
                    <span>%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Agent Commission</span>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="6" className="w-20 h-8 bg-muted/30" />
                    <span>%</span>
                  </div>
                </div>
                <Button size="sm" className="w-full">Save Changes</Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plane className="w-5 h-5 text-travel" />
                  Travel Commission
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">User Commission</span>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="2" className="w-20 h-8 bg-muted/30" />
                    <span>%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Agent Commission</span>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="4" className="w-20 h-8 bg-muted/30" />
                    <span>%</span>
                  </div>
                </div>
                <Button size="sm" className="w-full">Save Changes</Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car className="w-5 h-5 text-ride" />
                  Ride Commission
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">User Cashback</span>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="5" className="w-20 h-8 bg-muted/30" />
                    <span>%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Driver Commission</span>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="15" className="w-20 h-8 bg-muted/30" />
                    <span>%</span>
                  </div>
                </div>
                <Button size="sm" className="w-full">Save Changes</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-8 text-center">
            <Receipt className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Transaction History</h3>
            <p className="text-muted-foreground">All platform transactions will appear here</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">General Settings</CardTitle>
            <CardDescription>Configure platform-wide settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Maintenance Mode</p>
                <p className="text-sm text-muted-foreground">Disable access for all users</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Registrations</p>
                <p className="text-sm text-muted-foreground">Allow new user sign-ups</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Send system email alerts</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Security Settings</CardTitle>
            <CardDescription>Manage security options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Auth</p>
                <p className="text-sm text-muted-foreground">Require 2FA for admins</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Session Timeout</p>
                <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
              </div>
              <Select defaultValue="30">
                <SelectTrigger className="w-32 bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 mins</SelectItem>
                  <SelectItem value="30">30 mins</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Login Alerts</p>
                <p className="text-sm text-muted-foreground">Email on new login</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Referral Settings</CardTitle>
            <CardDescription>Configure referral rewards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Signup Bonus (Coins)</span>
              <Input type="number" defaultValue="100" className="w-24 h-8 bg-muted/30" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Referral Bonus (Coins)</span>
              <Input type="number" defaultValue="50" className="w-24 h-8 bg-muted/30" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Coin to INR Rate</span>
              <Input type="number" defaultValue="0.10" className="w-24 h-8 bg-muted/30" />
            </div>
            <Button size="sm" className="w-full">Save Changes</Button>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">API & Integrations</CardTitle>
            <CardDescription>Manage third-party services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <span>Payment Gateway</span>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400">Connected</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <span>SMS Service</span>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400">Connected</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <span>Email Service</span>
              </div>
              <Badge className="bg-amber-500/20 text-amber-400">Configure</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMemberships = () => {
    // Use real stats if available, otherwise fallback to mock
    const totalSubscribers = subStats?.totalSubscribers || 0;
    const totalRevenue = subStats?.totalRevenue || 0;
    const avgRevenue = totalSubscribers > 0 ? Math.round(totalRevenue / totalSubscribers) : 0;

    return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Subscribers" 
          value={totalSubscribers > 0 ? totalSubscribers.toLocaleString() : "0"} 
          icon={Users} 
          trend={totalSubscribers > 0 ? "From Razorpay" : "No subscribers yet"}
          trendUp={totalSubscribers > 0}
          color="bg-primary/20 text-primary"
        />
        <StatCard 
          title="Total Revenue" 
          value={totalRevenue > 0 ? `₹${(totalRevenue / 100).toLocaleString()}` : "₹0"} 
          icon={IndianRupee} 
          trend={totalRevenue > 0 ? "From subscriptions" : "No revenue yet"}
          trendUp={totalRevenue > 0}
          color="bg-emerald-500/20 text-emerald-400"
        />
        <StatCard 
          title="Renewal Rate" 
          value="87.5%" 
          icon={RefreshCw} 
          trend="+3.2% this month"
          trendUp={true}
          color="bg-sky-500/20 text-sky-400"
        />
        <StatCard 
          title="Avg. Revenue/User" 
          value={avgRevenue > 0 ? `₹${avgRevenue}` : "₹0"} 
          icon={Target} 
          trend={avgRevenue > 0 ? "Per subscriber" : "No data"}
          trendUp={avgRevenue > 0}
          color="bg-amber-500/20 text-amber-400"
        />
      </div>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="bg-muted/30 border border-border/50">
          <TabsTrigger value="plans">Membership Plans</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="discounts">Discounts & Offers</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Manage Plans</h3>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Create New Plan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {membershipPlans.map((plan) => (
              <Card key={plan.id} className={`bg-card/50 backdrop-blur-sm border-border/50 relative overflow-hidden ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                {plan.popular && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-xl ${plan.color} flex items-center justify-center mb-3`}>
                    <plan.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">₹{plan.monthlyPrice}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ₹{plan.yearlyPrice}/year <Badge variant="outline" className="ml-1 text-emerald-400 border-emerald-400/30">Save {plan.discount}%</Badge>
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Modules Access:</p>
                    <div className="flex flex-wrap gap-1">
                      {plan.modules.map((module) => (
                        <Badge key={module} variant="outline" className="text-xs">
                          {module}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    {plan.features.slice(0, 4).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 4 && (
                      <p className="text-xs text-primary cursor-pointer">+{plan.features.length - 4} more features</p>
                    )}
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{plan.subscribers.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Subscribers</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-400">₹{(plan.revenue / 100000).toFixed(1)}L</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="px-2">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subscribers" className="mt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
            <div className="flex gap-3">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search subscribers..." className="pl-10 bg-muted/30" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40 bg-muted/30">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="metal">Metal</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-40 bg-muted/30">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Show real subscriptions first, then mock data */}
                {realSubscriptions.length > 0 ? (
                  realSubscriptions.map((sub) => (
                    <TableRow key={sub.id} className="border-border/30">
                      <TableCell className="font-medium">User {sub.user_id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          sub.plan_name === "Platinum" ? "border-primary text-primary" :
                          sub.plan_name === "Gold" ? "border-amber-400 text-amber-400" :
                          sub.plan_name === "Silver" ? "border-slate-400 text-slate-400" :
                          "border-zinc-500 text-zinc-400"
                        }>
                          {sub.plan_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(sub.start_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(sub.end_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">₹{sub.plan_price.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={
                          sub.status === "active" ? "bg-emerald-500/20 text-emerald-400" :
                          sub.status === "expiring" ? "bg-amber-500/20 text-amber-400" :
                          "bg-red-500/20 text-red-400"
                        }>
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  membershipSubscribers.map((sub) => (
                    <TableRow key={sub.id} className="border-border/30">
                      <TableCell className="font-medium">{sub.user}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          sub.plan === "Platinum" ? "border-primary text-primary" :
                          sub.plan === "Gold" ? "border-amber-400 text-amber-400" :
                          sub.plan === "Silver" ? "border-slate-400 text-slate-400" :
                          "border-zinc-500 text-zinc-400"
                        }>
                          {sub.plan}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{sub.startDate}</TableCell>
                      <TableCell className="text-muted-foreground">{sub.expiryDate}</TableCell>
                      <TableCell className="font-medium">₹{sub.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={
                          sub.status === "active" ? "bg-emerald-500/20 text-emerald-400" :
                          sub.status === "expiring" ? "bg-amber-500/20 text-amber-400" :
                          "bg-red-500/20 text-red-400"
                        }>
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="w-4 h-4" />
                          </Button>
                          {sub.status === "expiring" && (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-400">
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="discounts" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Active Discounts & Offers</h3>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Create Offer
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-500/20 text-emerald-400">Active</Badge>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg">New Year Special</CardTitle>
                <CardDescription>Get 25% off on yearly plans</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10">
                  <Percent className="w-8 h-8 text-emerald-400" />
                  <div>
                    <p className="text-2xl font-bold text-emerald-400">25% OFF</p>
                    <p className="text-xs text-muted-foreground">On all yearly plans</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Code</p>
                    <p className="font-mono font-medium">NEWYEAR25</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Usage</p>
                    <p className="font-medium">234 / 500</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Start Date</p>
                    <p className="font-medium">Jan 1, 2024</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End Date</p>
                    <p className="font-medium">Jan 31, 2024</p>
                  </div>
                </div>
                <Progress value={46.8} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">46.8% of limit used</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-500/20 text-emerald-400">Active</Badge>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg">Referral Bonus</CardTitle>
                <CardDescription>Extra discount for referrals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
                  <Gift className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-primary">₹200 OFF</p>
                    <p className="text-xs text-muted-foreground">First month free</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Code</p>
                    <p className="font-mono font-medium">REF200</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Usage</p>
                    <p className="font-medium">1,234 / ∞</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Start Date</p>
                    <p className="font-medium">Always</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End Date</p>
                    <p className="font-medium">No Expiry</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-amber-500/20 text-amber-400">Scheduled</Badge>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg">Upgrade Offer</CardTitle>
                <CardDescription>Upgrade to higher plans</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10">
                  <Zap className="w-8 h-8 text-amber-400" />
                  <div>
                    <p className="text-2xl font-bold text-amber-400">30% OFF</p>
                    <p className="text-xs text-muted-foreground">On plan upgrades</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Code</p>
                    <p className="font-mono font-medium">UPGRADE30</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Usage</p>
                    <p className="font-medium">0 / 200</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Start Date</p>
                    <p className="font-medium">Feb 1, 2024</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End Date</p>
                    <p className="font-medium">Feb 14, 2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    );
  };

  const renderReports = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-2xl font-bold">₹24.58L</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-emerald-400">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+18.2% vs last month</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
                <p className="text-2xl font-bold">8,956</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-emerald-400">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+23.5% vs last month</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-sky-500/20 flex items-center justify-center">
                <Activity className="w-7 h-7 text-sky-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Users</p>
                <p className="text-2xl font-bold">12,584</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-emerald-400">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+12.5% vs last month</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Users className="w-7 h-7 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg. Order Value</p>
                <p className="text-2xl font-bold">₹2,745</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-red-400">
                  <ArrowDownRight className="w-4 h-4" />
                  <span>-3.2% vs last month</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                <Receipt className="w-7 h-7 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Revenue Trend</CardTitle>
              <CardDescription>Module-wise revenue over time</CardDescription>
            </div>
            <Select defaultValue="6m">
              <SelectTrigger className="w-28 bg-muted/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="1m">1 Month</SelectItem>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="hospitalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="hotelGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="travelGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="rideGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="hospital" name="Hospital" stroke="#14b8a6" fill="url(#hospitalGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="hotel" name="Hotel" stroke="#f59e0b" fill="url(#hotelGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="travel" name="Travel" stroke="#0ea5e9" fill="url(#travelGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="ride" name="Ride" stroke="#10b981" fill="url(#rideGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">User & Agent Growth</CardTitle>
              <CardDescription>Monthly registration trends</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" /> Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="users" name="Users" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))' }} />
                  <Line type="monotone" dataKey="agents" name="Agents" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Trends */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Booking Trends</CardTitle>
            <CardDescription>Monthly booking volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Distribution */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Distribution</CardTitle>
            <CardDescription>By service module</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={moduleRevenueShare}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {moduleRevenueShare.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value}%`, '']}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {moduleRevenueShare.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Membership Distribution */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Membership Distribution</CardTitle>
            <CardDescription>By plan type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={membershipDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {membershipDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {membershipDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}: {item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Performance Table */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Module Performance</CardTitle>
            <CardDescription>Detailed metrics by service</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" /> Download Report
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead>Module</TableHead>
                <TableHead>Total Bookings</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Growth</TableHead>
                <TableHead>Avg. Value</TableHead>
                <TableHead>Satisfaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-border/30">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-hospital/20 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-hospital" />
                    </div>
                    <span className="font-medium">Hospital</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">5,922</TableCell>
                <TableCell className="font-medium text-emerald-400">₹18.78L</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>+24.5%</span>
                  </div>
                </TableCell>
                <TableCell>₹3,172</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-amber-400">★</span> 4.7
                  </div>
                </TableCell>
              </TableRow>
              <TableRow className="border-border/30">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-hotel/20 flex items-center justify-center">
                      <Hotel className="w-4 h-4 text-hotel" />
                    </div>
                    <span className="font-medium">Hotel</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">1,835</TableCell>
                <TableCell className="font-medium text-emerald-400">₹15.48L</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>+18.2%</span>
                  </div>
                </TableCell>
                <TableCell>₹8,437</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-amber-400">★</span> 4.8
                  </div>
                </TableCell>
              </TableRow>
              <TableRow className="border-border/30">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-travel/20 flex items-center justify-center">
                      <Plane className="w-4 h-4 text-travel" />
                    </div>
                    <span className="font-medium">Travel</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">324</TableCell>
                <TableCell className="font-medium text-emerald-400">₹13.00L</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>+31.8%</span>
                  </div>
                </TableCell>
                <TableCell>₹40,123</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-amber-400">★</span> 4.6
                  </div>
                </TableCell>
              </TableRow>
              <TableRow className="border-border/30">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-ride/20 flex items-center justify-center">
                      <Car className="w-4 h-4 text-ride" />
                    </div>
                    <span className="font-medium">Ride</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">875</TableCell>
                <TableCell className="font-medium text-emerald-400">₹7.77L</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-red-400">
                    <TrendingDown className="w-4 h-4" />
                    <span>-5.3%</span>
                  </div>
                </TableCell>
                <TableCell>₹888</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-amber-400">★</span> 4.5
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "overview": return renderOverview();
      case "users": return renderUserManagement();
      case "agents": return renderAgentManagement();
      case "hospitals": return renderHospitalManagement();
      case "hotels": return renderHotelManagement();
      case "travel": return renderTravelManagement();
      case "rides": return renderRideManagement();
      case "wallet": return renderWalletManagement();
      case "memberships": return renderMemberships();
      case "reports": return renderReports();
      case "settings": return renderSettings();
      default: return (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-12 text-center">
          <Layers className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-medium mb-2">{sidebarItems.find(i => i.id === activeSection)?.label}</h3>
          <p className="text-muted-foreground">This section is under development</p>
        </Card>
      );
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                {sidebarOpen && <span className="font-bold text-lg">Admin Panel</span>}
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
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
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
              <p className="text-sm text-muted-foreground">Manage your platform efficiently</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  className="pl-10 w-64 bg-muted/30" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">12</span>
              </Button>
              <Separator orientation="vertical" className="h-8" />
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {adminName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{adminName}</p>
                  <p className="text-xs text-muted-foreground">Super Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
