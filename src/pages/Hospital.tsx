import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { BookingDialog } from "@/components/hospital/BookingDialog";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  MapPin, 
  Stethoscope, 
  Calendar,
  Clock,
  Star,
  Building2,
  Heart,
  Brain,
  Bone,
  Eye,
  Baby,
  Activity,
  Globe,
  Map,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHospitals, Hospital as HospitalType, Doctor } from "@/hooks/useHospitals";

const countries = [
  { id: "india", name: "India" },
  { id: "usa", name: "United States" },
  { id: "uk", name: "United Kingdom" },
  { id: "uae", name: "UAE" },
  { id: "singapore", name: "Singapore" },
];

const statesByCountry: Record<string, { id: string; name: string }[]> = {
  india: [
    { id: "maharashtra", name: "Maharashtra" },
    { id: "delhi", name: "Delhi" },
    { id: "karnataka", name: "Karnataka" },
    { id: "tamil-nadu", name: "Tamil Nadu" },
    { id: "gujarat", name: "Gujarat" },
  ],
  usa: [
    { id: "california", name: "California" },
    { id: "new-york", name: "New York" },
    { id: "texas", name: "Texas" },
    { id: "florida", name: "Florida" },
  ],
  uk: [
    { id: "england", name: "England" },
    { id: "scotland", name: "Scotland" },
    { id: "wales", name: "Wales" },
  ],
  uae: [
    { id: "dubai", name: "Dubai" },
    { id: "abu-dhabi", name: "Abu Dhabi" },
    { id: "sharjah", name: "Sharjah" },
  ],
  singapore: [
    { id: "central", name: "Central Region" },
    { id: "east", name: "East Region" },
    { id: "west", name: "West Region" },
  ],
};

const areasByState: Record<string, { id: string; name: string }[]> = {
  maharashtra: [
    { id: "mumbai", name: "Mumbai" },
    { id: "pune", name: "Pune" },
    { id: "nagpur", name: "Nagpur" },
    { id: "thane", name: "Thane" },
  ],
  delhi: [
    { id: "south-delhi", name: "South Delhi" },
    { id: "north-delhi", name: "North Delhi" },
    { id: "central-delhi", name: "Central Delhi" },
    { id: "east-delhi", name: "East Delhi" },
  ],
  karnataka: [
    { id: "bangalore", name: "Bangalore" },
    { id: "mysore", name: "Mysore" },
    { id: "mangalore", name: "Mangalore" },
  ],
  "tamil-nadu": [
    { id: "chennai", name: "Chennai" },
    { id: "coimbatore", name: "Coimbatore" },
    { id: "madurai", name: "Madurai" },
  ],
  gujarat: [
    { id: "ahmedabad", name: "Ahmedabad" },
    { id: "surat", name: "Surat" },
    { id: "vadodara", name: "Vadodara" },
  ],
  california: [
    { id: "los-angeles", name: "Los Angeles" },
    { id: "san-francisco", name: "San Francisco" },
    { id: "san-diego", name: "San Diego" },
  ],
  "new-york": [
    { id: "manhattan", name: "Manhattan" },
    { id: "brooklyn", name: "Brooklyn" },
    { id: "queens", name: "Queens" },
  ],
  texas: [
    { id: "houston", name: "Houston" },
    { id: "dallas", name: "Dallas" },
    { id: "austin", name: "Austin" },
  ],
  florida: [
    { id: "miami", name: "Miami" },
    { id: "orlando", name: "Orlando" },
    { id: "tampa", name: "Tampa" },
  ],
  england: [
    { id: "london", name: "London" },
    { id: "manchester", name: "Manchester" },
    { id: "birmingham", name: "Birmingham" },
  ],
  scotland: [
    { id: "edinburgh", name: "Edinburgh" },
    { id: "glasgow", name: "Glasgow" },
  ],
  wales: [
    { id: "cardiff", name: "Cardiff" },
    { id: "swansea", name: "Swansea" },
  ],
  dubai: [
    { id: "downtown", name: "Downtown Dubai" },
    { id: "marina", name: "Dubai Marina" },
    { id: "deira", name: "Deira" },
  ],
  "abu-dhabi": [
    { id: "al-ain", name: "Al Ain" },
    { id: "khalifa-city", name: "Khalifa City" },
  ],
  sharjah: [
    { id: "al-majaz", name: "Al Majaz" },
    { id: "al-nahda", name: "Al Nahda" },
  ],
  central: [
    { id: "orchard", name: "Orchard" },
    { id: "marina-bay", name: "Marina Bay" },
  ],
  east: [
    { id: "tampines", name: "Tampines" },
    { id: "bedok", name: "Bedok" },
  ],
  west: [
    { id: "jurong", name: "Jurong" },
    { id: "clementi", name: "Clementi" },
  ],
};

const categories = [
  { id: "all", name: "All", icon: Stethoscope },
  { id: "cardiology", name: "Cardiology", icon: Heart },
  { id: "neurology", name: "Neurology", icon: Brain },
  { id: "orthopedic", name: "Orthopedic", icon: Bone },
  { id: "ophthalmology", name: "Ophthalmology", icon: Eye },
  { id: "pediatrics", name: "Pediatrics", icon: Baby },
  { id: "emergency", name: "Emergency", icon: Activity },
];

export default function Hospital() {
  const navigate = useNavigate();
  const { hospitals, doctors, isLoading, fetchHospitals, fetchDoctors } = useHospitals();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<HospitalType | null>(null);

  const availableStates = selectedCountry ? statesByCountry[selectedCountry] || [] : [];
  const availableAreas = selectedState ? areasByState[selectedState] || [] : [];

  // Initial load only
  useEffect(() => {
    fetchHospitals();
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search and filter handler
  const applyFilters = useCallback(() => {
    const filters: { city?: string; search?: string; specialty?: string } = {};
    
    if (selectedArea) {
      const area = availableAreas.find(a => a.id === selectedArea);
      if (area) filters.city = area.name;
    }
    
    if (searchQuery) {
      filters.search = searchQuery;
    }

    fetchHospitals(filters);
    
    const doctorFilters: { specialty?: string; search?: string } = {};
    if (selectedCategory && selectedCategory !== "all") {
      doctorFilters.specialty = selectedCategory;
    }
    if (searchQuery) {
      doctorFilters.search = searchQuery;
    }
    fetchDoctors(doctorFilters);
  }, [selectedArea, searchQuery, selectedCategory, fetchHospitals, fetchDoctors, availableAreas]);

  // Apply filters when category changes
  useEffect(() => {
    if (selectedCategory) {
      applyFilters();
    }
  }, [selectedCategory, applyFilters]);

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    setSelectedState("");
    setSelectedArea("");
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedArea("");
  };

  const handleViewHospital = (hospitalId: string) => {
    navigate(`/hospital/${hospitalId}`);
  };

  const handleBookDoctor = (doctor: Doctor, hospital?: HospitalType) => {
    setSelectedDoctor(doctor);
    setSelectedHospital(hospital || null);
    setBookingOpen(true);
  };

  const handleSearch = () => {
    applyFilters();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-hospital/10 to-hospital/5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-hospital/20 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-hospital/10 text-hospital mb-6">
                <Stethoscope className="h-4 w-4" />
                <span className="text-sm font-medium">Hospital Management</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Find the Best Healthcare
                <span className="block text-hospital">Near You</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8">
                Book appointments with top doctors, find nearby hospitals, and earn cashback on every consultation.
              </p>

              {/* Location Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                  <Select value={selectedCountry} onValueChange={handleCountryChange}>
                    <SelectTrigger className="pl-10 h-12">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <Map className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                  <Select 
                    value={selectedState} 
                    onValueChange={handleStateChange}
                    disabled={!selectedCountry}
                  >
                    <SelectTrigger className="pl-10 h-12">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStates.map((state) => (
                        <SelectItem key={state.id} value={state.id}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                  <Select 
                    value={selectedArea} 
                    onValueChange={setSelectedArea}
                    disabled={!selectedState}
                  >
                    <SelectTrigger className="pl-10 h-12">
                      <SelectValue placeholder="Select Area" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAreas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search doctors, hospitals, specialties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 text-base"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button variant="hospital" size="lg" className="h-14 px-8" onClick={handleSearch}>
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-semibold text-foreground mb-6">Browse by Specialty</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 rounded-xl border whitespace-nowrap transition-all",
                    selectedCategory === category.id
                      ? "bg-hospital text-white border-hospital shadow-hospital"
                      : "bg-card border-border text-foreground hover:border-hospital/50"
                  )}
                >
                  <category.icon className="h-5 w-5" />
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Hospitals */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {hospitals.length > 0 ? `${hospitals.length} Hospitals Found` : 'Nearby Hospitals'}
              </h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-hospital" />
              </div>
            ) : hospitals.length === 0 ? (
              <div className="text-center py-20">
                <Building2 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No hospitals found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-hospital transition-all hover:-translate-y-1"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={hospital.image_url || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400"}
                        alt={hospital.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-hospital text-white text-sm font-medium">
                        {hospital.opening_hours || "Open 24/7"}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {hospital.name}
                      </h3>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                        <MapPin className="h-4 w-4" />
                        <span>{hospital.address}, {hospital.city}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium text-foreground">{hospital.rating || 0}</span>
                        </div>
                        <span className="text-muted-foreground text-sm">
                          ({hospital.reviews_count || 0} reviews)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(hospital.facilities || []).slice(0, 3).map((facility) => (
                          <span
                            key={facility}
                            className="px-2 py-1 rounded-full bg-hospital/10 text-hospital text-xs font-medium"
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                      <Button 
                        variant="hospital" 
                        className="w-full"
                        onClick={() => handleViewHospital(hospital.id)}
                      >
                        <Building2 className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Top Doctors */}
        <section className="py-12 bg-hospital/5">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Top Rated Doctors</h2>
            </div>

            {doctors.length === 0 ? (
              <div className="text-center py-12">
                <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No doctors found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.slice(0, 6).map((doctor) => (
                  <div
                    key={doctor.id}
                    className="bg-card rounded-2xl border border-border p-5 hover:shadow-hospital transition-all hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={doctor.image_url || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200"}
                        alt={doctor.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{doctor.name}</h3>
                        <p className="text-sm text-hospital">{doctor.specialty}</p>
                        <p className="text-xs text-muted-foreground">{doctor.qualification}</p>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium text-foreground">{doctor.rating || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-muted-foreground">{doctor.experience_years || 0} years exp.</span>
                      <span className="font-semibold text-foreground">₹{doctor.consultation_fee}</span>
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded-lg bg-hospital/10 mb-4">
                      <Clock className="h-4 w-4 text-hospital" />
                      <span className="text-sm text-hospital font-medium">
                        Available: {doctor.available_days?.slice(0, 3).join(", ") || "Mon-Sat"}
                      </span>
                    </div>

                    <Button
                      variant="hospital"
                      className="w-full"
                      onClick={() => handleBookDoctor(doctor)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Appointment
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Booking Dialog */}
      <BookingDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        doctor={selectedDoctor ? {
          name: selectedDoctor.name,
          specialty: selectedDoctor.specialty,
          fee: selectedDoctor.consultation_fee,
          image: selectedDoctor.image_url,
        } : undefined}
        hospital={selectedHospital ? {
          name: selectedHospital.name,
          address: `${selectedHospital.address}, ${selectedHospital.city}`,
        } : { name: "Hospital", address: "" }}
      />
    </div>
  );
}
