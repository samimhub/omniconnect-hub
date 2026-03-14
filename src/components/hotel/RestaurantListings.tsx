import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, MapPin, Star, Clock, Utensils, Heart, ArrowRight,
  Leaf, Flame, ChefHat, UtensilsCrossed
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRestaurants } from "@/hooks/useRestaurant";

const cuisineFilters = [
  { id: "all", name: "All", icon: Utensils },
  { id: "indian", name: "Indian", icon: Flame },
  { id: "chinese", name: "Chinese", icon: UtensilsCrossed },
  { id: "italian", name: "Italian", icon: ChefHat },
  { id: "veg", name: "Pure Veg", icon: Leaf },
];

const mockRestaurants = [
  {
    id: "1", name: "Spice Garden", cuisine: "North Indian • Mughlai",
    rating: 4.6, reviews: 1240, price: "₹800 for two", location: "Connaught Place, Delhi",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    timing: "11 AM - 11 PM", veg: false, popular: true, offer: "20% OFF",
  },
  {
    id: "2", name: "Green Leaf", cuisine: "Pure Vegetarian • South Indian",
    rating: 4.8, reviews: 890, price: "₹500 for two", location: "Indiranagar, Bengaluru",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400",
    timing: "8 AM - 10 PM", veg: true, popular: true, offer: "15% OFF",
  },
  {
    id: "3", name: "Dragon House", cuisine: "Chinese • Thai • Asian",
    rating: 4.4, reviews: 760, price: "₹1,200 for two", location: "Bandra, Mumbai",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400",
    timing: "12 PM - 11 PM", veg: false, popular: false, offer: "30% OFF",
  },
  {
    id: "4", name: "La Piazza", cuisine: "Italian • Continental",
    rating: 4.7, reviews: 1580, price: "₹1,500 for two", location: "Salt Lake, Kolkata",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
    timing: "11 AM - 11:30 PM", veg: false, popular: true, offer: "25% OFF",
  },
  {
    id: "5", name: "Tandoori Nights", cuisine: "North Indian • Kebabs",
    rating: 4.5, reviews: 2100, price: "₹900 for two", location: "Jubilee Hills, Hyderabad",
    image: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=400",
    timing: "12 PM - 12 AM", veg: false, popular: false, offer: "10% OFF",
  },
  {
    id: "6", name: "Sattvik Bhoj", cuisine: "Rajasthani • Gujarati Thali",
    rating: 4.9, reviews: 3200, price: "₹400 for two", location: "C-Scheme, Jaipur",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
    timing: "10 AM - 10 PM", veg: true, popular: true, offer: "Flat ₹100 OFF",
  },
];

export function RestaurantListings() {
  const [selectedCuisine, setSelectedCuisine] = useState("all");
  const [liked, setLiked] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const toggleLike = (id: string) => {
    setLiked((prev) => prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-10">
      {/* Search */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search restaurants, cuisines..." className="pl-10 h-12"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Location" className="pl-10 h-12" />
          </div>
        </div>
        <Button variant="hotel" className="w-full mt-4 h-12">
          <Search className="h-5 w-5 mr-2" />Search Restaurants
        </Button>
      </div>

      {/* Cuisine Filters */}
      <div className="flex flex-wrap gap-3">
        {cuisineFilters.map((c) => (
          <button key={c.id} onClick={() => setSelectedCuisine(c.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all font-medium",
              selectedCuisine === c.id
                ? "bg-hotel text-primary-foreground border-hotel shadow-hotel"
                : "bg-card border-border text-foreground hover:border-hotel/50"
            )}>
            <c.icon className="h-4 w-4" />
            <span className="text-sm">{c.name}</span>
          </button>
        ))}
      </div>

      {/* Restaurant Cards */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-foreground">Popular Restaurants</h2>
          <span className="text-sm text-muted-foreground">{mockRestaurants.length} restaurants</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockRestaurants.map((rest) => (
            <div key={rest.id}
              className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-hotel transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => navigate(`/restaurant-menu/${rest.id}`)}>
              <div className="relative h-48 overflow-hidden">
                <img src={rest.image} alt={rest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {rest.offer && (
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-hotel text-primary-foreground text-xs font-bold">
                    {rest.offer}
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  {rest.veg && (
                    <span className="px-2 py-1 rounded-full bg-ride/90 text-primary-foreground text-xs font-medium flex items-center gap-1">
                      <Leaf className="h-3 w-3" /> Pure Veg
                    </span>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); toggleLike(rest.id); }}
                    className="h-8 w-8 rounded-full bg-card/90 backdrop-blur flex items-center justify-center">
                    <Heart className={cn("h-4 w-4", liked.includes(rest.id) ? "fill-destructive text-destructive" : "text-foreground")} />
                  </button>
                </div>
                {rest.popular && (
                  <div className="absolute bottom-3 left-3 px-2 py-1 rounded-full bg-card/90 backdrop-blur text-foreground text-xs font-medium">
                    🔥 Popular
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-foreground text-lg">{rest.name}</h3>
                  <div className="flex items-center gap-1 bg-ride/10 px-2 py-0.5 rounded-full">
                    <Star className="h-3.5 w-3.5 text-ride fill-ride" />
                    <span className="text-sm font-bold text-ride">{rest.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{rest.cuisine}</p>
                <p className="text-xs text-muted-foreground mb-1">
                  <MapPin className="h-3 w-3 inline mr-1" />{rest.location}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{rest.timing}</span>
                  <span>•</span>
                  <span>{rest.reviews} reviews</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-sm font-semibold text-foreground">{rest.price}</span>
                  <Button variant="hotel" size="sm">
                    View Menu <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
