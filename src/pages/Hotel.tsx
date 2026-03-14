import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Star, Building2, Utensils, Dumbbell, Scissors, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";
import { HotelListings } from "@/components/hotel/HotelListings";
import { RestaurantListings } from "@/components/hotel/RestaurantListings";
import { GymListings } from "@/components/hotel/GymListings";
import { ParlourListings } from "@/components/hotel/ParlourListings";
import { SpaListings } from "@/components/hotel/SpaListings";

const categories = [
  { id: "hotels", name: "Hotels", icon: Building2, description: "Luxury stays & resorts" },
  { id: "restaurants", name: "Restaurants", icon: Utensils, description: "Dine-in & delivery" },
  { id: "gym", name: "Gym", icon: Dumbbell, description: "Fitness & wellness" },
  { id: "parlour", name: "Parlour", icon: Scissors, description: "Beauty & grooming" },
  { id: "spa", name: "Spa", icon: Droplets, description: "Relaxation & therapy" },
];

export default function Hotel() {
  const [activeCategory, setActiveCategory] = useState("hotels");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative py-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-hotel/10 to-hotel/5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-hotel/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-hotel/10 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-hotel/10 text-hotel mb-6">
                <Star className="h-4 w-4" />
                <span className="text-sm font-medium">Hotel & Lifestyle Services</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Hotels, Dining &
                <span className="block text-hotel">Lifestyle Services</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8">
                Book hotels, order food, find fitness centers, beauty salons & spa experiences — all in one place.
              </p>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-3 mt-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all duration-300",
                    activeCategory === cat.id
                      ? "bg-hotel text-primary-foreground border-hotel shadow-hotel scale-[1.02]"
                      : "bg-card border-border text-foreground hover:border-hotel/50 hover:bg-hotel/5"
                  )}
                >
                  <cat.icon className="h-5 w-5" />
                  <div className="text-left">
                    <span className="text-sm font-semibold block">{cat.name}</span>
                    <span className={cn(
                      "text-xs",
                      activeCategory === cat.id ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}>{cat.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Content based on active tab */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {activeCategory === "hotels" && <HotelListings />}
            {activeCategory === "restaurants" && <RestaurantListings />}
            {activeCategory === "gym" && <GymListings />}
            {activeCategory === "parlour" && <ParlourListings />}
            {activeCategory === "spa" && <SpaListings />}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
