import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  CreditCard, 
  Wallet, 
  Gift, 
  Calendar,
  Building2,
  Hotel,
  Plane,
  Car,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Download,
  Eye,
  Star,
  MapPin,
  Phone,
  Mail,
  Shield,
  Crown
} from "lucide-react";

// Mock user data - replace with real data from backend
const mockUser = {
  name: "Rahul Sharma",
  email: "rahul.sharma@email.com",
  phone: "+91 98765 43210",
  avatar: null,
  verified: true,
  aadhaarVerified: true,
  joinedDate: "2024-01-15",
  referralCode: "RAHUL2024",
  referralEarnings: 1250,
};

const mockMembership = {
  plan: "Gold",
  status: "active",
  startDate: "2024-01-15",
  expiryDate: "2025-01-15",
  modules: ["Hospital", "Hotel"],
};

const mockWallet = {
  balance: 2450,
  pendingWithdrawal: 500,
  totalEarned: 5200,
  referralCoins: 125,
};

const mockHospitalBookings = [
  { id: "H001", hospital: "Apollo Hospital", doctor: "Dr. Sharma", date: "2024-12-20", time: "10:00 AM", status: "confirmed", amount: 500 },
  { id: "H002", hospital: "Max Healthcare", doctor: "Dr. Patel", date: "2024-12-18", time: "2:30 PM", status: "completed", amount: 750 },
  { id: "H003", hospital: "Fortis Hospital", doctor: "Dr. Singh", date: "2024-12-15", time: "11:00 AM", status: "cancelled", amount: 600 },
];

const mockHotelBookings = [
  { id: "HT001", hotel: "Taj Palace", location: "New Delhi", checkIn: "2024-12-25", checkOut: "2024-12-28", rooms: 1, status: "confirmed", amount: 15000 },
  { id: "HT002", hotel: "Oberoi Mumbai", location: "Mumbai", checkIn: "2024-11-10", checkOut: "2024-11-12", rooms: 2, status: "completed", amount: 28000 },
];

const mockTravelBookings = [
  { id: "T001", type: "Flight", from: "Delhi", to: "Mumbai", date: "2024-12-30", passengers: 2, status: "confirmed", amount: 8500 },
  { id: "T002", type: "Package", destination: "Goa", startDate: "2025-01-05", endDate: "2025-01-10", travelers: 4, status: "pending", amount: 45000 },
];

const mockRideBookings = [
  { id: "R001", from: "Home", to: "Airport", date: "2024-12-20", time: "6:00 AM", vehicle: "Sedan", status: "completed", amount: 850, driver: "Rajesh K." },
  { id: "R002", from: "Office", to: "Mall", date: "2024-12-19", time: "5:30 PM", vehicle: "Hatchback", status: "completed", amount: 320, driver: "Amit S." },
];

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
    confirmed: { variant: "default", icon: <CheckCircle className="w-3 h-3" /> },
    completed: { variant: "secondary", icon: <CheckCircle className="w-3 h-3" /> },
    pending: { variant: "outline", icon: <Clock className="w-3 h-3" /> },
    cancelled: { variant: "destructive", icon: <XCircle className="w-3 h-3" /> },
  };
  
  const { variant, icon } = config[status] || { variant: "outline", icon: <AlertCircle className="w-3 h-3" /> };
  
  return (
    <Badge variant={variant} className="flex items-center gap-1 capitalize">
      {icon}
      {status}
    </Badge>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">My Dashboard</h1>
            <p className="text-muted-foreground">Manage your bookings, membership, and account</p>
          </div>

          {/* User Profile Card */}
          <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  {mockUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                
                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-foreground">{mockUser.name}</h2>
                    {mockUser.verified && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {mockUser.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {mockUser.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Member since {new Date(mockUser.joinedDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Membership Badge */}
                <div className="flex flex-col items-center gap-2">
                  <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-400" />
                      <span className="font-bold text-amber-400">{mockMembership.plan} Member</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Expires: {new Date(mockMembership.expiryDate).toLocaleDateString()}
                  </span>
                </div>

                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Wallet Balance</p>
                    <p className="text-xl font-bold text-foreground">₹{mockWallet.balance.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-module-hospital/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-module-hospital/20 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-module-hospital" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Referral Coins</p>
                    <p className="text-xl font-bold text-foreground">{mockWallet.referralCoins}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-module-hotel/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-module-hotel/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-module-hotel" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Bookings</p>
                    <p className="text-xl font-bold text-foreground">
                      {mockHospitalBookings.length + mockHotelBookings.length + mockTravelBookings.length + mockRideBookings.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-module-travel/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-module-travel/20 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-module-travel" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Earned</p>
                    <p className="text-xl font-bold text-foreground">₹{mockWallet.totalEarned.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Different Sections */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2 h-auto p-1 bg-muted/50">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Overview
              </TabsTrigger>
              <TabsTrigger value="hospital" className="data-[state=active]:bg-module-hospital data-[state=active]:text-white">
                <Building2 className="w-4 h-4 mr-1 hidden sm:inline" />
                Hospital
              </TabsTrigger>
              <TabsTrigger value="hotel" className="data-[state=active]:bg-module-hotel data-[state=active]:text-white">
                <Hotel className="w-4 h-4 mr-1 hidden sm:inline" />
                Hotel
              </TabsTrigger>
              <TabsTrigger value="travel" className="data-[state=active]:bg-module-travel data-[state=active]:text-white">
                <Plane className="w-4 h-4 mr-1 hidden sm:inline" />
                Travel
              </TabsTrigger>
              <TabsTrigger value="ride" className="data-[state=active]:bg-module-ride data-[state=active]:text-white">
                <Car className="w-4 h-4 mr-1 hidden sm:inline" />
                Ride
              </TabsTrigger>
              <TabsTrigger value="wallet" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Wallet
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Recent Hospital Bookings */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Building2 className="w-5 h-5 text-module-hospital" />
                      Recent Hospital Appointments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockHospitalBookings.slice(0, 2).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-foreground">{booking.hospital}</p>
                          <p className="text-sm text-muted-foreground">{booking.doctor} • {booking.date}</p>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>
                    ))}
                    <Button variant="ghost" className="w-full" onClick={() => setActiveTab("hospital")}>
                      View All Hospital Bookings
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Hotel Bookings */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Hotel className="w-5 h-5 text-module-hotel" />
                      Recent Hotel Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockHotelBookings.slice(0, 2).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-foreground">{booking.hotel}</p>
                          <p className="text-sm text-muted-foreground">{booking.location} • {booking.checkIn}</p>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>
                    ))}
                    <Button variant="ghost" className="w-full" onClick={() => setActiveTab("hotel")}>
                      View All Hotel Bookings
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Travel Bookings */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Plane className="w-5 h-5 text-module-travel" />
                      Recent Travel Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockTravelBookings.slice(0, 2).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-foreground">{booking.type}: {booking.type === 'Flight' ? `${booking.from} → ${booking.to}` : booking.destination}</p>
                          <p className="text-sm text-muted-foreground">{booking.date || booking.startDate}</p>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>
                    ))}
                    <Button variant="ghost" className="w-full" onClick={() => setActiveTab("travel")}>
                      View All Travel Bookings
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Rides */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Car className="w-5 h-5 text-module-ride" />
                      Recent Rides
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockRideBookings.slice(0, 2).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-foreground">{booking.from} → {booking.to}</p>
                          <p className="text-sm text-muted-foreground">{booking.date} • {booking.driver}</p>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>
                    ))}
                    <Button variant="ghost" className="w-full" onClick={() => setActiveTab("ride")}>
                      View All Rides
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Referral Section */}
              <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">Refer & Earn</h3>
                      <p className="text-muted-foreground">Share your referral code and earn coins on every successful signup!</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="px-4 py-2 rounded-lg bg-background border border-border font-mono text-lg">
                        {mockUser.referralCode}
                      </div>
                      <Button>Copy Code</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Hospital Bookings Tab */}
            <TabsContent value="hospital">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-module-hospital" />
                    Hospital Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">ID</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Hospital</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Doctor</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date & Time</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Amount</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockHospitalBookings.map((booking) => (
                          <tr key={booking.id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="py-3 px-4 font-mono text-sm">{booking.id}</td>
                            <td className="py-3 px-4">{booking.hospital}</td>
                            <td className="py-3 px-4">{booking.doctor}</td>
                            <td className="py-3 px-4">{booking.date} • {booking.time}</td>
                            <td className="py-3 px-4">₹{booking.amount}</td>
                            <td className="py-3 px-4"><StatusBadge status={booking.status} /></td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Hotel Bookings Tab */}
            <TabsContent value="hotel">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hotel className="w-5 h-5 text-module-hotel" />
                    Hotel Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">ID</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Hotel</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Location</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Check-in/out</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Rooms</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Amount</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockHotelBookings.map((booking) => (
                          <tr key={booking.id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="py-3 px-4 font-mono text-sm">{booking.id}</td>
                            <td className="py-3 px-4">{booking.hotel}</td>
                            <td className="py-3 px-4">{booking.location}</td>
                            <td className="py-3 px-4">{booking.checkIn} - {booking.checkOut}</td>
                            <td className="py-3 px-4">{booking.rooms}</td>
                            <td className="py-3 px-4">₹{booking.amount.toLocaleString()}</td>
                            <td className="py-3 px-4"><StatusBadge status={booking.status} /></td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Travel Bookings Tab */}
            <TabsContent value="travel">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="w-5 h-5 text-module-travel" />
                    Travel Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">ID</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Type</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Details</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Travelers</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Amount</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockTravelBookings.map((booking) => (
                          <tr key={booking.id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="py-3 px-4 font-mono text-sm">{booking.id}</td>
                            <td className="py-3 px-4">
                              <Badge variant="outline">{booking.type}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              {booking.type === 'Flight' ? `${booking.from} → ${booking.to}` : booking.destination}
                            </td>
                            <td className="py-3 px-4">{booking.date || `${booking.startDate} - ${booking.endDate}`}</td>
                            <td className="py-3 px-4">{booking.passengers || booking.travelers}</td>
                            <td className="py-3 px-4">₹{booking.amount.toLocaleString()}</td>
                            <td className="py-3 px-4"><StatusBadge status={booking.status} /></td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Ride History Tab */}
            <TabsContent value="ride">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-module-ride" />
                    Ride History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">ID</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Route</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date & Time</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Vehicle</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Driver</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Fare</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockRideBookings.map((booking) => (
                          <tr key={booking.id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="py-3 px-4 font-mono text-sm">{booking.id}</td>
                            <td className="py-3 px-4">{booking.from} → {booking.to}</td>
                            <td className="py-3 px-4">{booking.date} • {booking.time}</td>
                            <td className="py-3 px-4">{booking.vehicle}</td>
                            <td className="py-3 px-4">{booking.driver}</td>
                            <td className="py-3 px-4">₹{booking.amount}</td>
                            <td className="py-3 px-4"><StatusBadge status={booking.status} /></td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="sm"><Star className="w-4 h-4" /></Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wallet Tab */}
            <TabsContent value="wallet">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="w-5 h-5" />
                      Wallet Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-sm text-muted-foreground">Available Balance</p>
                        <p className="text-2xl font-bold text-primary">₹{mockWallet.balance.toLocaleString()}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Pending Withdrawal</p>
                        <p className="text-2xl font-bold text-foreground">₹{mockWallet.pendingWithdrawal}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Total Earned</p>
                        <p className="text-2xl font-bold text-foreground">₹{mockWallet.totalEarned.toLocaleString()}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Referral Coins</p>
                        <p className="text-2xl font-bold text-foreground">{mockWallet.referralCoins}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button className="flex-1">Withdraw Money</Button>
                      <Button variant="outline" className="flex-1">Add Money</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      Referral Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                      <p className="text-sm text-muted-foreground mb-1">Total Referral Earnings</p>
                      <p className="text-3xl font-bold text-primary">₹{mockUser.referralEarnings.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Your Referral Code</p>
                      <p className="font-mono font-bold text-lg">{mockUser.referralCode}</p>
                    </div>
                    <Button className="w-full" variant="outline">
                      Share & Earn More
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
