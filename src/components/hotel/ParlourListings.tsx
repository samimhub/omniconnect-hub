import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, MapPin, Star, Clock, Heart, Scissors, Sparkles, Eye, Palette
} from "lucide-react";
import { cn } from "@/lib/utils";

const serviceTypes = [
  { id: "all", name: "All Services", icon: Sparkles },
  { id: "hair", name: "Hair", icon: Scissors },
  { id: "makeup", name: "Makeup", icon: Palette },
  { id: "skincare", name: "Skincare", icon: Eye },
];

const parlours = [
  {
    id: 1, name: "Lakme Salon", type: "Premium Salon",
    rating: 4.7, reviews: 3200, priceRange: "₹500 - ₹5,000", location: "Linking Road, Mumbai",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400",
    timing: "10 AM - 9 PM", offer: "30% OFF Bridal",
    services: ["Hair Styling", "Keratin", "Facial", "Bridal Makeup"],
    gender: "Unisex",
  },
  {
    id: 2, name: "Jawed Habib", type: "Hair Studio",
    rating: 4.5, reviews: 4500, priceRange: "₹300 - ₹3,000", location: "Rajouri Garden, Delhi",
    image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400",
    timing: "10 AM - 8:30 PM", offer: "Flat 20% OFF",
    services: ["Hair Cut", "Hair Color", "Smoothening", "Hair Spa"],
    gender: "Unisex",
  },
  {
    id: 3, name: "VLCC Wellness", type: "Beauty & Wellness",
    rating: 4.6, reviews: 2800, priceRange: "₹800 - ₹8,000", location: "MG Road, Bengaluru",
    image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400",
    timing: "9 AM - 8 PM", offer: "Free Consultation",
    services: ["Skin Treatment", "Body Shaping", "Laser", "Derma Facial"],
    gender: "Women",
  },
  {
    id: 4, name: "Looks Salon", type: "Premium Unisex",
    rating: 4.4, reviews: 1900, priceRange: "₹400 - ₹4,000", location: "Park Street, Kolkata",
    image: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=400",
    timing: "10 AM - 9 PM", offer: "Combo Save 25%",
    services: ["Hair Care", "Nail Art", "Waxing", "Threading"],
    gender: "Unisex",
  },
  {
    id: 5, name: "Naturals Salon", type: "Beauty Salon",
    rating: 4.3, reviews: 2100, priceRange: "₹250 - ₹2,500", location: "Anna Nagar, Chennai",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400",
    timing: "9:30 AM - 8:30 PM", offer: "₹200 OFF First Visit",
    services: ["Haircut", "Facial", "Mehendi", "Makeup"],
    gender: "Women",
  },
  {
    id: 6, name: "The Man Company Studio", type: "Men's Grooming",
    rating: 4.8, reviews: 1450, priceRange: "₹400 - ₹3,500", location: "Banjara Hills, Hyderabad",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400",
    timing: "10 AM - 9 PM", offer: "Beard Trim Free",
    services: ["Beard Styling", "Hair Cut", "Face Treatment", "Head Massage"],
    gender: "Men",
  },
];

export function ParlourListings() {
  const [selectedType, setSelectedType] = useState("all");
  const [liked, setLiked] = useState<number[]>([]);

  return (
    <div className="space-y-10">
      {/* Search */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search salons, parlours..." className="pl-10 h-12" />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Location" className="pl-10 h-12" />
          </div>
        </div>
        <Button variant="hotel" className="w-full mt-4 h-12">
          <Search className="h-5 w-5 mr-2" />Find Parlours
        </Button>
      </div>

      {/* Service Filters */}
      <div className="flex flex-wrap gap-3">
        {serviceTypes.map((t) => (
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

      {/* Parlour Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parlours.map((p) => (
          <div key={p.id}
            className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-hotel transition-all duration-300 hover:-translate-y-1">
            <div className="relative h-48 overflow-hidden">
              <img src={p.image} alt={p.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-hotel text-primary-foreground text-xs font-bold">
                {p.offer}
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                <span className="px-2 py-1 rounded-full bg-card/90 backdrop-blur text-foreground text-xs font-medium">
                  {p.gender}
                </span>
                <button onClick={() => setLiked(prev => prev.includes(p.id) ? prev.filter(l => l !== p.id) : [...prev, p.id])}
                  className="h-8 w-8 rounded-full bg-card/90 backdrop-blur flex items-center justify-center">
                  <Heart className={cn("h-4 w-4", liked.includes(p.id) ? "fill-destructive text-destructive" : "text-foreground")} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{p.name}</h3>
                  <p className="text-xs text-hotel font-medium">{p.type}</p>
                </div>
                <div className="flex items-center gap-1 bg-hotel/10 px-2 py-0.5 rounded-full">
                  <Star className="h-3.5 w-3.5 text-hotel fill-hotel" />
                  <span className="text-sm font-bold text-hotel">{p.rating}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                <MapPin className="h-3 w-3 inline mr-1" />{p.location}
              </p>
              <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                <Clock className="h-3 w-3" />{p.timing} • {p.reviews} reviews
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.services.map((s) => (
                  <span key={s} className="px-2 py-1 rounded-full bg-hotel/10 text-hotel text-xs font-medium">{s}</span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-sm font-semibold text-foreground">{p.priceRange}</span>
                <Button variant="hotel" size="sm">Book Now</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
