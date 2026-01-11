import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingDialog } from "@/components/hospital/BookingDialog";
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Calendar,
  Stethoscope,
  Heart,
  Brain,
  Bone,
  Eye,
  Baby,
  Activity,
  Building2,
  Users,
  Award,
  Shield,
  Ambulance,
  Bed,
  ChevronLeft,
  Loader2,
  Wifi,
  Car,
  Coffee,
  Syringe,
  Pill,
  TestTube,
  Thermometer,
} from "lucide-react";
import { useHospitals, Doctor } from "@/hooks/useHospitals";

const departmentIcons: Record<string, any> = {
  Cardiology: Heart,
  Neurology: Brain,
  Orthopedic: Bone,
  Orthopedics: Bone,
  Ophthalmology: Eye,
  Pediatrics: Baby,
  Emergency: Activity,
  General: Stethoscope,
  Oncology: Activity,
  Gynecology: Users,
  Dermatology: Users,
  Urology: Users,
};

const facilityIcons: Record<string, any> = {
  "Emergency Care": Ambulance,
  "ICU": Activity,
  "Operation Theaters": Syringe,
  "Pharmacy": Pill,
  "Diagnostic Labs": TestTube,
  "Blood Bank": Heart,
  "Cafeteria": Coffee,
  "Parking": Car,
  "WiFi": Wifi,
  "Helipad": Building2,
};

export default function HospitalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getHospitalDetails } = useHospitals();
  const [hospital, setHospital] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    const loadHospital = async () => {
      if (!id) return;
      setIsLoading(true);
      const data = await getHospitalDetails(id);
      setHospital(data);
      setIsLoading(false);
    };
    loadHospital();
  }, [id, getHospitalDetails]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16 container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-hospital" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16 container mx-auto px-4">
          <div className="text-center py-20">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-4">Hospital Not Found</h1>
            <p className="text-muted-foreground mb-6">The hospital you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/hospital")}>Back to Hospitals</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        {/* Back Button */}
        <div className="container mx-auto px-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/hospital")}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Hospitals
          </Button>
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-8">
          <div className="relative rounded-3xl overflow-hidden h-64 md:h-96">
            <img
              src={hospital.image_url || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800"}
              alt={hospital.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <Badge className="bg-hospital text-white mb-3">
                {hospital.opening_hours || "Open 24/7"}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {hospital.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{hospital.address}, {hospital.city}, {hospital.state}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{hospital.rating || 0}</span>
                  <span className="text-sm">({hospital.reviews_count || 0} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Info */}
        <section className="container mx-auto px-4 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-hospital/10">
                <Phone className="h-5 w-5 text-hospital" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium text-foreground text-sm">{hospital.phone || "N/A"}</p>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-hospital/10">
                <Clock className="h-5 w-5 text-hospital" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hours</p>
                <p className="font-medium text-foreground text-sm">{hospital.opening_hours || "24/7"}</p>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-hospital/10">
                <Bed className="h-5 w-5 text-hospital" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Beds</p>
                <p className="font-medium text-foreground text-sm">{hospital.beds_count || 0}+</p>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-hospital/10">
                <Award className="h-5 w-5 text-hospital" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Est.</p>
                <p className="font-medium text-foreground text-sm">{hospital.established_year || "N/A"}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="container mx-auto px-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start mb-6 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
              <TabsTrigger value="doctors" className="rounded-lg">Doctors ({hospital.doctors?.length || 0})</TabsTrigger>
              <TabsTrigger value="departments" className="rounded-lg">Departments ({hospital.departments?.length || 0})</TabsTrigger>
              <TabsTrigger value="facilities" className="rounded-lg">Facilities</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {hospital.description || `${hospital.name} is a leading healthcare facility located in ${hospital.city}, ${hospital.state}. We are committed to providing excellent healthcare services to our community.`}
                </p>
              </div>

              {hospital.accreditations && hospital.accreditations.length > 0 && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Accreditations</h2>
                  <div className="flex flex-wrap gap-3">
                    {hospital.accreditations.map((acc: string) => (
                      <div
                        key={acc}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-hospital/10"
                      >
                        <Shield className="h-4 w-4 text-hospital" />
                        <span className="font-medium text-hospital">{acc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hospital.services && hospital.services.length > 0 && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Services</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hospital.services.map((service: any) => (
                      <div key={service.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Stethoscope className="h-5 w-5 text-hospital mt-0.5" />
                        <div>
                          <h3 className="font-medium text-foreground">{service.name}</h3>
                          {service.description && (
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                          )}
                          {service.price && (
                            <p className="text-sm font-medium text-hospital mt-1">₹{service.price}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Doctors Tab */}
            <TabsContent value="doctors" className="space-y-4">
              {hospital.doctors && hospital.doctors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hospital.doctors.map((doctor: Doctor) => (
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
                          {doctor.available_days?.slice(0, 3).join(", ") || "Mon-Sat"}
                        </span>
                      </div>

                      <Button
                        variant="hospital"
                        className="w-full"
                        onClick={() => handleBookAppointment(doctor)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No doctors available at this hospital yet.</p>
                </div>
              )}
            </TabsContent>

            {/* Departments Tab */}
            <TabsContent value="departments" className="space-y-4">
              {hospital.departments && hospital.departments.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {hospital.departments.map((dept: any) => {
                    const Icon = departmentIcons[dept.name] || Stethoscope;
                    return (
                      <div
                        key={dept.id}
                        className="bg-card rounded-xl border border-border p-5 flex flex-col items-center text-center hover:border-hospital/50 transition-colors cursor-pointer"
                      >
                        <div className="p-4 rounded-full bg-hospital/10 mb-3">
                          <Icon className="h-6 w-6 text-hospital" />
                        </div>
                        <h3 className="font-medium text-foreground">{dept.name}</h3>
                        {dept.description && (
                          <p className="text-xs text-muted-foreground mt-1">{dept.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No departments listed yet.</p>
                </div>
              )}
            </TabsContent>

            {/* Facilities Tab */}
            <TabsContent value="facilities" className="space-y-4">
              {hospital.facilities && hospital.facilities.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {hospital.facilities.map((facility: string) => {
                    const Icon = facilityIcons[facility] || Thermometer;
                    return (
                      <div
                        key={facility}
                        className="bg-card rounded-xl border border-border p-5 flex flex-col items-center text-center hover:border-hospital/50 transition-colors"
                      >
                        <div className="p-4 rounded-full bg-hospital/10 mb-3">
                          <Icon className="h-6 w-6 text-hospital" />
                        </div>
                        <h3 className="font-medium text-foreground">{facility}</h3>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No facilities listed yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
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
        hospital={{
          name: hospital.name,
          address: `${hospital.address}, ${hospital.city}`,
        }}
      />
    </div>
  );
}
