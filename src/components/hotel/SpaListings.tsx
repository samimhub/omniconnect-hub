import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, MapPin, Star, Clock, Heart, Droplets, Flower2, Sun, Wind
} from "lucide-react";
import { cn } from "@/lib/utils";

const spaTypes = [
  { id: "all", name: "All Spas", icon: Droplets },
  { id: "ayurveda", name: "Ayurveda", icon: Flower2 },
  { id: "thai", name: "Thai Spa", icon: Sun },
  { id: "aromatherapy", name: "Aromatherapy", icon: Wind },
];

const spas = [
  {
    id: 1, name: "O2 Spa", type: "Luxury Day Spa",
    rating: 4.8, reviews: 2800, price: "₹1,500 onwards", location: "Bandra, Mumbai",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400",
    timing: "10 AM - 10 PM", offer: "Couples 40% OFF",
    therapies: ["Swedish Massage", "Hot Stone", "Deep Tissue", "Aromatherapy"],
    duration: "60-120 min",
  },
  {
    id: 2, name: "Kairali Ayurvedic Spa", type: "Ayurveda Centre",
    rating: 4.9, reviews: 1900, price: "₹2,000 onwards", location: "Alappuzha, Kerala",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbec6f?w=400",
    timing: "8 AM - 7 PM", offer: "Free Consultation",
    therapies: ["Abhyanga", "Shirodhara", "Panchakarma", "Udvartana"],
    duration: "90-180 min",
  },
  {
    id: 3, name: "Thai Orchid Spa", type: "Thai Spa",
    rating: 4.7, reviews: 1560, price: "₹1,800 onwards", location: "Indiranagar, Bengaluru",
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400",
    timing: "11 AM - 9 PM", offer: "30% OFF Weekdays",
    therapies: ["Thai Massage", "Foot Reflexology", "Herbal Compress", "Body Scrub"],
    duration: "60-90 min",
  },
  {
    id: 4, name: "Tattva Spa", type: "Wellness Spa",
    rating: 4.6, reviews: 3400, price: "₹1,200 onwards", location: "DLF Phase 5, Gurgaon",
    image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=400",
    timing: "9 AM - 9 PM", offer: "Membership 25% OFF",
    therapies: ["Indian Head Massage", "Balinese", "Lomi Lomi", "Couple Spa"],
    duration: "45-120 min",
  },
  {
    id: 5, name: "Sohum Spa", type: "Luxury Spa",
    rating: 4.8, reviews: 980, price: "₹3,000 onwards", location: "Camac Street, Kolkata",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400",
    timing: "10 AM - 8 PM", offer: "50% OFF First Visit",
    therapies: ["Signature Massage", "Gold Facial", "Body Wrap", "Hydrotherapy"],
    duration: "90-150 min",
  },
  {
    id: 6, name: "Niraamaya Retreats", type: "Retreat Spa",
    rating: 4.9, reviews: 750, price: "₹5,000 onwards", location: "Kovalam, Kerala",
    image: "https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=400",
    timing: "7 AM - 8 PM", offer: "Stay + Spa Package",
    therapies: ["Ayurveda Detox", "Yoga & Spa", "Wellness Package", "Rejuvenation"],
    duration: "120-240 min",
  },
];

export function SpaListings() {
  const [selectedType, setSelectedType] = useState("all");
  const [liked, setLiked] = useState<number[]>([]);

  return (
    <div className="space-y-10">
      {/* Search */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search spas, wellness centers..." className="pl-10 h-12" />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Location" className="pl-10 h-12" />
          </div>
        </div>
        <Button variant="hotel" className="w-full mt-4 h-12">
          <Search className="h-5 w-5 mr-2" />Find Spas
        </Button>
      </div>

      {/* Type Filters */}
      <div className="flex flex-wrap gap-3">
        {spaTypes.map((t) => (
          <button key={t.id} onClick={() => setSelectedType(t.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all font-medium",
              selectedType === t.id
                ? "bg-hotel text-primary-foreground border-hotel shadow-hotel"
                : "bg-card border-border text-foreground hover:border-hotel/50"
            )}>
            <t.icon className="h-4 w-4" />
            <span className="text-sm">{t.name}</span>
          </button>
        ))}
      </div>

      {/* Spa Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spas.map((spa) => (
          <div key={spa.id}
            className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-hotel transition-all duration-300 hover:-translate-y-1">
            <div className="relative h-48 overflow-hidden">
              <img src={spa.image} alt={spa.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-hotel text-primary-foreground text-xs font-bold">
                {spa.offer}
              </div>
              <button onClick={() => setLiked(p => p.includes(spa.id) ? p.filter(l => l !== spa.id) : [...p, spa.id])}
                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-card/90 backdrop-blur flex items-center justify-center">
                <Heart className={cn("h-4 w-4", liked.includes(spa.id) ? "fill-destructive text-destructive" : "text-foreground")} />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{spa.name}</h3>
                  <p className="text-xs text-hotel font-medium">{spa.type}</p>
                </div>
                <div className="flex items-center gap-1 bg-hotel/10 px-2 py-0.5 rounded-full">
                  <Star className="h-3.5 w-3.5 text-hotel fill-hotel" />
                  <span className="text-sm font-bold text-hotel">{spa.rating}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                <MapPin className="h-3 w-3 inline mr-1" />{spa.location}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{spa.timing}</span>
                <span>•</span>
                <span>{spa.duration}</span>
                <span>•</span>
                <span>{spa.reviews} reviews</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {spa.therapies.map((t) => (
                  <span key={t} className="px-2 py-1 rounded-full bg-hotel/10 text-hotel text-xs font-medium">{t}</span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-lg font-bold text-foreground">{spa.price}</span>
                <Button variant="hotel" size="sm">Book Session</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
