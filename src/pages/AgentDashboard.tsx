import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Users, Wallet, TrendingUp, Calendar, FileText, 
  Download, Clock, CheckCircle, XCircle, IndianRupee,
  Hospital, Hotel, Plane, Car, ArrowUpRight, ArrowDownRight,
  Plus, Eye, Upload, Bell, Settings, LogOut, Home,
  Target, Award, UserPlus, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock Agent Data
const agentData = {
  name: "Rahul Sharma",
  agentId: "AGT-2024-001",
  phone: "+91 98765 43210",
  email: "rahul.agent@multiserve.com",
  joinDate: "2024-01-15",
  status: "Active",
  tier: "Gold",
  profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
};

const stats = {
  totalEarnings: 45680,
  thisMonthEarnings: 12450,
  pendingCommission: 3200,
  totalBookings: 156,
  thisMonthBookings: 28,
  activeUsers: 45,
  referralEarnings: 5600,
  walletBalance: 18750,
};

const recentBookings = [
  { id: "BK-001", user: "Amit Kumar", type: "Hospital", service: "Dr. Sharma - Cardiology", amount: 1500, commission: 150, status: "Completed", date: "2024-12-24" },
  { id: "BK-002", user: "Priya Singh", type: "Hotel", service: "Hotel Taj - Deluxe Room", amount: 8500, commission: 425, status: "Confirmed", date: "2024-12-23" },
  { id: "BK-003", user: "Raj Patel", type: "Travel", service: "Goa Package - 3N/4D", amount: 25000, commission: 1250, status: "Pending", date: "2024-12-22" },
  { id: "BK-004", user: "Sneha Gupta", type: "Ride", service: "Airport Transfer", amount: 800, commission: 40, status: "Completed", date: "2024-12-21" },
  { id: "BK-005", user: "Vikram Rao", type: "Hospital", service: "Dr. Mehta - Orthopedic", amount: 2000, commission: 200, status: "Receipt Pending", date: "2024-12-20" },
];

const pendingReceipts = [
  { id: "RCP-001", user: "Vikram Rao", hospital: "City Hospital", doctor: "Dr. Mehta", date: "2024-12-20", amount: 2000 },
  { id: "RCP-002", user: "Neha Sharma", hospital: "Apollo", doctor: "Dr. Gupta", date: "2024-12-19", amount: 1800 },
  { id: "RCP-003", user: "Karan Singh", hospital: "Max Healthcare", doctor: "Dr. Reddy", date: "2024-12-18", amount: 2500 },
];

const withdrawalHistory = [
  { id: "WD-001", amount: 5000, status: "Completed", date: "2024-12-20", method: "Bank Transfer" },
  { id: "WD-002", amount: 3000, status: "Processing", date: "2024-12-22", method: "UPI" },
  { id: "WD-003", amount: 7500, status: "Completed", date: "2024-12-15", method: "Bank Transfer" },
];

const referrals = [
  { id: "REF-001", name: "Sanjay Kumar", phone: "+91 87654 32109", status: "Active", bookings: 5, earned: 500, date: "2024-12-10" },
  { id: "REF-002", name: "Meera Patel", phone: "+91 76543 21098", status: "Active", bookings: 3, earned: 300, date: "2024-12-08" },
  { id: "REF-003", name: "Arun Singh", phone: "+91 65432 10987", status: "Pending", bookings: 0, earned: 0, date: "2024-12-23" },
];

const commissionRates = [
  { module: "Hospital", icon: Hospital, rate: "10%", color: "text-hospital" },
  { module: "Hotel", icon: Hotel, rate: "5%", color: "text-hotel" },
  { module: "Travel", icon: Plane, rate: "5%", color: "text-travel" },
  { module: "Ride", icon: Car, rate: "5%", color: "text-ride" },
];

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    "Completed": "bg-green-500/20 text-green-400 border-green-500/30",
    "Confirmed": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "Pending": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "Receipt Pending": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "Processing": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "Active": "bg-green-500/20 text-green-400 border-green-500/30",
    "Cancelled": "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return styles[status] || "bg-muted text-muted-foreground";
};

const getModuleIcon = (type: string) => {
  const icons: Record<string, any> = {
    "Hospital": Hospital,
    "Hotel": Hotel,
    "Travel": Plane,
    "Ride": Car,
  };
  return icons[type] || FileText;
};

const getModuleColor = (type: string) => {
  const colors: Record<string, string> = {
    "Hospital": "text-hospital",
    "Hotel": "text-hotel",
    "Travel": "text-travel",
    "Ride": "text-ride",
  };
  return colors[type] || "text-primary";
};

const AgentDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card/50 backdrop-blur-xl">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b border-border px-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-display font-bold text-lg">Agent Portal</span>
          </div>

          {/* Agent Info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <img 
                src={agentData.profileImage} 
                alt={agentData.name}
                className="w-12 h-12 rounded-full border-2 border-primary"
              />
              <div>
                <p className="font-semibold text-sm">{agentData.name}</p>
                <p className="text-xs text-muted-foreground">{agentData.agentId}</p>
                <Badge className="mt-1 bg-hotel/20 text-hotel border-hotel/30 text-xs">
                  {agentData.tier} Agent
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <Button 
              variant={activeTab === "overview" ? "secondary" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("overview")}
            >
              <TrendingUp className="mr-2 h-4 w-4" /> Overview
            </Button>
            <Button 
              variant={activeTab === "bookings" ? "secondary" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("bookings")}
            >
              <Calendar className="mr-2 h-4 w-4" /> My Bookings
            </Button>
            <Button 
              variant={activeTab === "receipts" ? "secondary" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("receipts")}
            >
              <Upload className="mr-2 h-4 w-4" /> Upload Receipts
            </Button>
            <Button 
              variant={activeTab === "wallet" ? "secondary" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("wallet")}
            >
              <Wallet className="mr-2 h-4 w-4" /> Wallet
            </Button>
            <Button 
              variant={activeTab === "referrals" ? "secondary" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("referrals")}
            >
              <UserPlus className="mr-2 h-4 w-4" /> Referrals
            </Button>
            <Button 
              variant={activeTab === "commission" ? "secondary" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("commission")}
            >
              <Target className="mr-2 h-4 w-4" /> Commission Rates
            </Button>
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-border space-y-2">
            <Link to="/">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="mr-2 h-4 w-4" /> Back to Home
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">
              Welcome back, {agentData.name.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's your performance overview
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            <Button className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" /> New Booking
            </Button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                      <p className="text-2xl font-bold mt-1 flex items-center">
                        <IndianRupee className="h-5 w-5" />
                        {stats.totalEarnings.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-400 flex items-center mt-1">
                        <ArrowUpRight className="h-3 w-3 mr-1" /> +12% from last month
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-hotel/10 to-hotel/5 border-hotel/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">This Month</p>
                      <p className="text-2xl font-bold mt-1 flex items-center">
                        <IndianRupee className="h-5 w-5" />
                        {stats.thisMonthEarnings.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-400 flex items-center mt-1">
                        <ArrowUpRight className="h-3 w-3 mr-1" /> +8% from last month
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-hotel/20 flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-hotel" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-travel/10 to-travel/5 border-travel/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Bookings</p>
                      <p className="text-2xl font-bold mt-1">{stats.totalBookings}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.thisMonthBookings} this month
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-travel/20 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-travel" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-ride/10 to-ride/5 border-ride/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Users</p>
                      <p className="text-2xl font-bold mt-1">{stats.activeUsers}</p>
                      <p className="text-xs text-green-400 flex items-center mt-1">
                        <ArrowUpRight className="h-3 w-3 mr-1" /> +5 new this week
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-ride/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-ride" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance & Recent */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monthly Target */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Target</CardTitle>
                  <CardDescription>Your progress this month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Bookings</span>
                      <span>{stats.thisMonthBookings}/50</span>
                    </div>
                    <Progress value={(stats.thisMonthBookings / 50) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Earnings</span>
                      <span>₹{stats.thisMonthEarnings.toLocaleString()}/₹20,000</span>
                    </div>
                    <Progress value={(stats.thisMonthEarnings / 20000) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>New Users</span>
                      <span>8/15</span>
                    </div>
                    <Progress value={(8 / 15) * 100} className="h-2" />
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">Reach targets to unlock</p>
                    <Badge className="mt-2 bg-gradient-primary text-white">Platinum Agent Status</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Bookings */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Recent Bookings</CardTitle>
                    <CardDescription>Your latest booking activity</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("bookings")}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBookings.slice(0, 4).map((booking) => {
                      const Icon = getModuleIcon(booking.type);
                      return (
                        <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-lg bg-background flex items-center justify-center ${getModuleColor(booking.type)}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{booking.user}</p>
                              <p className="text-xs text-muted-foreground">{booking.service}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm text-green-400">+₹{booking.commission}</p>
                            <Badge variant="outline" className={`text-xs ${getStatusBadge(booking.status)}`}>
                              {booking.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="cursor-pointer hover:border-hospital/50 transition-colors group" onClick={() => setActiveTab("bookings")}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-hospital/10 flex items-center justify-center group-hover:bg-hospital/20 transition-colors">
                    <Hospital className="h-5 w-5 text-hospital" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Book Hospital</p>
                    <p className="text-xs text-muted-foreground">Earn 10%</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-hotel/50 transition-colors group">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-hotel/10 flex items-center justify-center group-hover:bg-hotel/20 transition-colors">
                    <Hotel className="h-5 w-5 text-hotel" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Book Hotel</p>
                    <p className="text-xs text-muted-foreground">Earn 5%</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-travel/50 transition-colors group">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-travel/10 flex items-center justify-center group-hover:bg-travel/20 transition-colors">
                    <Plane className="h-5 w-5 text-travel" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Book Travel</p>
                    <p className="text-xs text-muted-foreground">Earn 5%</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-ride/50 transition-colors group">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-ride/10 flex items-center justify-center group-hover:bg-ride/20 transition-colors">
                    <Car className="h-5 w-5 text-ride" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Book Ride</p>
                    <p className="text-xs text-muted-foreground">Earn 5%</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>Complete list of bookings you've made for users</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBookings.map((booking) => {
                      const Icon = getModuleIcon(booking.type);
                      return (
                        <TableRow key={booking.id}>
                          <TableCell className="font-mono text-sm">{booking.id}</TableCell>
                          <TableCell>{booking.user}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${getModuleColor(booking.type)}`} />
                              {booking.type}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{booking.service}</TableCell>
                          <TableCell>₹{booking.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-green-400 font-medium">+₹{booking.commission}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadge(booking.status)}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{booking.date}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Receipts Tab */}
        {activeTab === "receipts" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Receipt Uploads</CardTitle>
                <CardDescription>Upload final consultation receipts to release commission</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Hospital</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingReceipts.map((receipt) => (
                      <TableRow key={receipt.id}>
                        <TableCell className="font-mono text-sm">{receipt.id}</TableCell>
                        <TableCell>{receipt.user}</TableCell>
                        <TableCell>{receipt.hospital}</TableCell>
                        <TableCell>{receipt.doctor}</TableCell>
                        <TableCell>{receipt.date}</TableCell>
                        <TableCell>₹{receipt.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button size="sm" className="bg-hospital hover:bg-hospital/90">
                            <Upload className="mr-2 h-4 w-4" /> Upload Receipt
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Wallet Tab */}
        {activeTab === "wallet" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-3xl font-bold mt-2 flex items-center">
                    <IndianRupee className="h-6 w-6" />
                    {stats.walletBalance.toLocaleString()}
                  </p>
                  <Button className="mt-4 w-full bg-gradient-primary">Withdraw Now</Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Pending Commission</p>
                  <p className="text-3xl font-bold mt-2 flex items-center text-yellow-400">
                    <IndianRupee className="h-6 w-6" />
                    {stats.pendingCommission.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">Awaiting receipt verification</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Referral Earnings</p>
                  <p className="text-3xl font-bold mt-2 flex items-center text-green-400">
                    <IndianRupee className="h-6 w-6" />
                    {stats.referralEarnings.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">From {referrals.length} referrals</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Withdrawal History</CardTitle>
                <CardDescription>Your past withdrawal requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawalHistory.map((withdrawal) => (
                      <TableRow key={withdrawal.id}>
                        <TableCell className="font-mono text-sm">{withdrawal.id}</TableCell>
                        <TableCell className="font-medium">₹{withdrawal.amount.toLocaleString()}</TableCell>
                        <TableCell>{withdrawal.method}</TableCell>
                        <TableCell>{withdrawal.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadge(withdrawal.status)}>
                            {withdrawal.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === "referrals" && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-primary/10 via-hotel/10 to-travel/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Your Referral Code</h3>
                    <p className="text-3xl font-mono font-bold mt-2 text-primary">RAHUL2024</p>
                    <p className="text-sm text-muted-foreground mt-2">Share this code to earn ₹100 per referral</p>
                  </div>
                  <Button className="bg-gradient-primary">
                    <UserPlus className="mr-2 h-4 w-4" /> Invite Users
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>My Referrals</CardTitle>
                <CardDescription>Users who joined using your referral code</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>You Earned</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((referral) => (
                      <TableRow key={referral.id}>
                        <TableCell className="font-medium">{referral.name}</TableCell>
                        <TableCell>{referral.phone}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadge(referral.status)}>
                            {referral.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{referral.bookings}</TableCell>
                        <TableCell className="text-green-400 font-medium">₹{referral.earned}</TableCell>
                        <TableCell>{referral.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Commission Rates Tab */}
        {activeTab === "commission" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Commission Structure</CardTitle>
                <CardDescription>Your earning rates for each module</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {commissionRates.map((item) => (
                    <Card key={item.module} className="bg-muted/30">
                      <CardContent className="p-6 text-center">
                        <div className={`h-16 w-16 mx-auto rounded-full bg-background flex items-center justify-center ${item.color}`}>
                          <item.icon className="h-8 w-8" />
                        </div>
                        <h3 className="font-semibold mt-4">{item.module}</h3>
                        <p className={`text-3xl font-bold mt-2 ${item.color}`}>{item.rate}</p>
                        <p className="text-xs text-muted-foreground mt-2">Commission per booking</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How to Earn More</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                  <Award className="h-6 w-6 text-hotel mt-1" />
                  <div>
                    <h4 className="font-semibold">Upgrade to Platinum Agent</h4>
                    <p className="text-sm text-muted-foreground">Complete 50 bookings/month and earn +2% extra on all commissions</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                  <UserPlus className="h-6 w-6 text-travel mt-1" />
                  <div>
                    <h4 className="font-semibold">Refer More Users</h4>
                    <p className="text-sm text-muted-foreground">Earn ₹100 for each new user + 10% of their first booking commission</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                  <Target className="h-6 w-6 text-ride mt-1" />
                  <div>
                    <h4 className="font-semibold">Hit Monthly Targets</h4>
                    <p className="text-sm text-muted-foreground">Get bonus rewards when you achieve your monthly booking targets</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default AgentDashboard;
