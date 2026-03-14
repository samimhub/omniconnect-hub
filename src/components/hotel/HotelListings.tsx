import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, MapPin, Calendar, Users, Star, Wifi, Car, Utensils,
  Dumbbell, Waves, Coffee, SlidersHorizontal, Heart, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const amenities = [
  { id: "wifi", name: "Free WiFi", icon: Wifi },
  { id: "parking", name: "Parking", icon: Car },
  { id: "restaurant", name: "Restaurant", icon: Utensils },
  { id: "gym", name: "Gym", icon: Dumbbell },
  { id: "pool", name: "Pool", icon: Waves },
  { id: "breakfast", name: "Breakfast", icon: Coffee },
];

const featuredHotels = [
  {
    id: 1, name: "The Oberoi Grand", location: "Kolkata, West Bengal",
    rating: 4.9, reviews: 3456, price: "₹8,500", originalPrice: "₹12,000",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
    amenities: ["wifi", "parking", "restaurant", "gym", "pool"], discount: "29% OFF",
    type: "Luxury", rooms: 230,
  },
  {
    id: 2, name: "Taj Palace Hotel", location: "New Delhi",
    rating: 4.8, reviews: 2891, price: "₹12,000", originalPrice: "₹16,000",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400",
    amenities: ["wifi", "parking", "restaurant", "gym", "pool", "breakfast"], discount: "25% OFF",
    type: "5 Star", rooms: 402,
  },
  {
    id: 3, name: "ITC Maratha", location: "Mumbai, Maharashtra",
    rating: 4.7, reviews: 2134, price: "₹9,800", originalPrice: "₹13,500",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400",
    amenities: ["wifi", "parking", "restaurant", "gym", "breakfast"], discount: "27% OFF",
    type: "Premium", rooms: 385,
  },
  {
    id: 4, name: "The Leela Palace", location: "Bengaluru, Karnataka",
    rating: 4.9, reviews: 4012, price: "₹15,000", originalPrice: "₹20,000",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400",
    amenities: ["wifi", "parking", "restaurant", "gym", "pool", "breakfast"], discount: "25% OFF",
    type: "Ultra Luxury", rooms: 357,
  },
  {
    id: 5, name: "Radisson Blu", location: "Hyderabad, Telangana",
    rating: 4.5, reviews: 1876, price: "₹5,200", originalPrice: "₹7,500",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400",
    amenities: ["wifi", "parking", "restaurant", "gym"], discount: "31% OFF",
    type: "Business", rooms: 260,
  },
  {
    id: 6, name: "JW Marriott", location: "Pune, Maharashtra",
    rating: 4.6, reviews: 2340, price: "₹7,800", originalPrice: "₹10,500",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400",
    amenities: ["wifi", "parking", "restaurant", "pool", "breakfast"], discount: "26% OFF",
    type: "Luxury", rooms: 310,
  },
];

const popularDestinations = [
  { name: "Goa", hotels: 1250, image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=300" },
  { name: "Jaipur", hotels: 890, image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=300" },
  { name: "Kerala", hotels: 1100, image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=300" },
  { name: "Shimla", hotels: 650, image: "https://images.unsplash.com/photo-1597074866923-dc0589150358?w=300" },
];

export function HotelListings() {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [liked, setLiked] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const toggleLike = (id: number) => {
    setLiked((prev) => prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-10">
      {/* Search Bar */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Where to?"
              className="pl-10 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input type="date" className="pl-10 h-12" placeholder="Check-in" />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input type="date" className="pl-10 h-12" placeholder="Check-out" />
          </div>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="2 Guests, 1 Room" className="pl-10 h-12" />
          </div>
        </div>
        <Button variant="hotel" className="w-full mt-4 h-12">
          <Search className="h-5 w-5 mr-2" />
          Search Hotels
        </Button>
      </div>

      {/* Popular Destinations */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-foreground">Popular Destinations</h2>
          <Button variant="ghost" className="text-hotel gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {popularDestinations.map((dest) => (
            <div key={dest.name} className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer">
              <img src={dest.image} alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-xl font-bold text-primary-foreground">{dest.name}</h3>
                <p className="text-sm text-primary-foreground/80">{dest.hotels} hotels</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Amenity Filters */}
      <section className="py-5 px-5 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="h-5 w-5 text-hotel" />
          <h3 className="text-lg font-semibold text-foreground">Filter by Amenities</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {amenities.map((amenity) => (
            <button key={amenity.id} onClick={() => toggleAmenity(amenity.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border transition-all",
                selectedAmenities.includes(amenity.id)
                  ? "bg-hotel text-primary-foreground border-hotel shadow-hotel"
                  : "bg-background border-border text-foreground hover:border-hotel/50"
              )}>
              <amenity.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{amenity.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Hotel Cards */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-foreground">Featured Hotels</h2>
          <span className="text-sm text-muted-foreground">{featuredHotels.length} properties found</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredHotels.map((hotel) => (
            <div key={hotel.id}
              className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-hotel transition-all duration-300 hover:-translate-y-1">
              <div className="relative h-52 overflow-hidden">
                <img src={hotel.image} alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-hotel text-primary-foreground text-xs font-bold">
                  {hotel.discount}
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className="px-2 py-1 rounded-full bg-card/90 backdrop-blur text-foreground text-xs font-medium">
                    {hotel.type}
                  </span>
                  <button onClick={() => toggleLike(hotel.id)}
                    className="h-8 w-8 rounded-full bg-card/90 backdrop-blur flex items-center justify-center">
                    <Heart className={cn("h-4 w-4", liked.includes(hotel.id) ? "fill-destructive text-destructive" : "text-foreground")} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-foreground text-lg">{hotel.name}</h3>
                  <div className="flex items-center gap-1 bg-hotel/10 px-2 py-0.5 rounded-full">
                    <Star className="h-3.5 w-3.5 text-hotel fill-hotel" />
                    <span className="text-sm font-bold text-hotel">{hotel.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  <MapPin className="h-3 w-3 inline mr-1" />{hotel.location}
                </p>
                <p className="text-xs text-muted-foreground mb-3">{hotel.rooms} rooms • {hotel.reviews} reviews</p>
                <div className="flex gap-2 mb-4">
                  {hotel.amenities.slice(0, 4).map((a) => {
                    const am = amenities.find((x) => x.id === a);
                    return am ? (
                      <div key={a} className="h-8 w-8 rounded-lg bg-hotel/10 flex items-center justify-center" title={am.name}>
                        <am.icon className="h-4 w-4 text-hotel" />
                      </div>
                    ) : null;
                  })}
                  {hotel.amenities.length > 4 && (
                    <div className="h-8 w-8 rounded-lg bg-hotel/10 flex items-center justify-center text-hotel text-xs font-medium">
                      +{hotel.amenities.length - 4}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div>
                    <span className="text-xl font-bold text-foreground">{hotel.price}</span>
                    <span className="text-sm text-muted-foreground line-through ml-2">{hotel.originalPrice}</span>
                    <span className="text-xs text-muted-foreground block">per night</span>
                  </div>
                  <Button variant="hotel" size="sm">Book Now</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
