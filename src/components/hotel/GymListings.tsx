import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, MapPin, Star, Clock, Dumbbell, Heart, Users,
  Zap, Timer, Trophy, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const gymTypes = [
  { id: "all", name: "All Gyms", icon: Dumbbell },
  { id: "crossfit", name: "CrossFit", icon: Zap },
  { id: "yoga", name: "Yoga", icon: Timer },
  { id: "martial", name: "Martial Arts", icon: Trophy },
];

const gyms = [
  {
    id: 1, name: "Gold's Gym Premium", type: "Full Service Gym",
    rating: 4.8, reviews: 2340, price: "₹2,500/mo", location: "Andheri West, Mumbai",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400",
    timing: "5 AM - 11 PM", members: 1200,
    features: ["Personal Training", "Cardio Zone", "Steam & Sauna", "CrossFit"],
    offer: "First Month Free",
  },
  {
    id: 2, name: "Cult.fit Studio", type: "Group Fitness",
    rating: 4.7, reviews: 3100, price: "₹1,800/mo", location: "HSR Layout, Bengaluru",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400",
    timing: "6 AM - 10 PM", members: 800,
    features: ["HIIT Classes", "Dance Fitness", "Yoga", "Boxing"],
    offer: "20% OFF Annual",
  },
  {
    id: 3, name: "Anytime Fitness", type: "24/7 Gym",
    rating: 4.5, reviews: 1890, price: "₹3,000/mo", location: "Connaught Place, Delhi",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400",
    timing: "24 Hours", members: 950,
    features: ["24/7 Access", "Personal Training", "Functional Training", "Supplements"],
    offer: "3 Months + 1 Free",
  },
  {
    id: 4, name: "Yoga House", type: "Yoga & Wellness",
    rating: 4.9, reviews: 1560, price: "₹1,200/mo", location: "Koregaon Park, Pune",
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400",
    timing: "6 AM - 8 PM", members: 400,
    features: ["Hatha Yoga", "Ashtanga", "Meditation", "Pranayama"],
    offer: "Free Trial Class",
  },
  {
    id: 5, name: "PowerHouse Gym", type: "Strength Training",
    rating: 4.6, reviews: 980, price: "₹2,000/mo", location: "Salt Lake, Kolkata",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400",
    timing: "5 AM - 11 PM", members: 650,
    features: ["Olympic Lifting", "Powerlifting", "Bodybuilding", "Supplements"],
    offer: "Flat 30% OFF",
  },
  {
    id: 6, name: "CrossFit Box", type: "CrossFit",
    rating: 4.7, reviews: 720, price: "₹3,500/mo", location: "Jubilee Hills, Hyderabad",
    image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400",
    timing: "6 AM - 9 PM", members: 300,
    features: ["WOD Classes", "Olympic Lifting", "Gymnastics", "Nutrition Coaching"],
    offer: "Free Week Trial",
  },
];

export function GymListings() {
  const [selectedType, setSelectedType] = useState("all");
  const [liked, setLiked] = useState<number[]>([]);

  return (
    <div className="space-y-10">
      {/* Search */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search gyms, fitness centers..." className="pl-10 h-12" />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Location" className="pl-10 h-12" />
          </div>
        </div>
        <Button variant="hotel" className="w-full mt-4 h-12">
          <Search className="h-5 w-5 mr-2" />Find Gyms
        </Button>
      </div>

      {/* Type Filters */}
      <div className="flex flex-wrap gap-3">
        {gymTypes.map((t) => (
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

      {/* Gym Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gyms.map((gym) => (
          <div key={gym.id}
            className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-hotel transition-all duration-300 hover:-translate-y-1">
            <div className="relative h-48 overflow-hidden">
              <img src={gym.image} alt={gym.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-hotel text-primary-foreground text-xs font-bold">
                {gym.offer}
              </div>
              <button onClick={() => setLiked(p => p.includes(gym.id) ? p.filter(l => l !== gym.id) : [...p, gym.id])}
                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-card/90 backdrop-blur flex items-center justify-center">
                <Heart className={cn("h-4 w-4", liked.includes(gym.id) ? "fill-destructive text-destructive" : "text-foreground")} />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{gym.name}</h3>
                  <p className="text-xs text-hotel font-medium">{gym.type}</p>
                </div>
                <div className="flex items-center gap-1 bg-hotel/10 px-2 py-0.5 rounded-full">
                  <Star className="h-3.5 w-3.5 text-hotel fill-hotel" />
                  <span className="text-sm font-bold text-hotel">{gym.rating}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                <MapPin className="h-3 w-3 inline mr-1" />{gym.location}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{gym.timing}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{gym.members} members</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {gym.features.map((f) => (
                  <span key={f} className="px-2 py-1 rounded-full bg-hotel/10 text-hotel text-xs font-medium">{f}</span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xl font-bold text-foreground">{gym.price}</span>
                <Button variant="hotel" size="sm">Join Now</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
