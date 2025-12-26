import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, Crown, Star, Zap, Diamond, ArrowRight, Gift, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { RazorpayButton } from "@/components/payment/RazorpayButton";
import { toast } from "sonner";

const plans = [
  {
    id: "metal",
    name: "Metal",
    icon: Zap,
    price: "₹299",
    period: "/month",
    yearlyPrice: "₹2,999",
    yearlyPeriod: "/year",
    savings: "Save ₹589",
    description: "Perfect for healthcare needs",
    color: "from-slate-400 to-slate-600",
    borderColor: "border-slate-400",
    shadowColor: "shadow-slate-500/20",
    modules: ["Hospital"],
    features: [
      "Hospital appointments",
      "Doctor consultations",
      "5% cashback on bookings",
      "Receipt management",
      "Email support",
      "Basic health records",
    ],
    popular: false,
  },
  {
    id: "silver",
    name: "Silver",
    icon: Star,
    price: "₹499",
    period: "/month",
    yearlyPrice: "₹4,999",
    yearlyPeriod: "/year",
    savings: "Save ₹989",
    description: "Healthcare + Hotel access",
    color: "from-gray-300 to-gray-500",
    borderColor: "border-gray-400",
    shadowColor: "shadow-gray-400/20",
    modules: ["Hospital", "Hotel"],
    features: [
      "All Metal features",
      "Hotel bookings",
      "Room services",
      "8% cashback on bookings",
      "Priority support",
      "Exclusive hotel deals",
    ],
    popular: false,
  },
  {
    id: "gold",
    name: "Gold",
    icon: Crown,
    price: "₹799",
    period: "/month",
    yearlyPrice: "₹7,999",
    yearlyPeriod: "/year",
    savings: "Save ₹1,589",
    description: "Most popular choice",
    color: "from-amber-400 to-amber-600",
    borderColor: "border-amber-400",
    shadowColor: "shadow-amber-500/30",
    modules: ["Hospital", "Hotel", "Travel"],
    features: [
      "All Silver features",
      "Travel packages",
      "Flight & train booking",
      "12% cashback on bookings",
      "24/7 phone support",
      "Free cancellation",
    ],
    popular: true,
  },
  {
    id: "platinum",
    name: "Platinum",
    icon: Diamond,
    price: "₹1,299",
    period: "/month",
    yearlyPrice: "₹12,999",
    yearlyPeriod: "/year",
    savings: "Save ₹2,589",
    description: "Complete access to everything",
    color: "from-violet-400 to-indigo-600",
    borderColor: "border-violet-400",
    shadowColor: "shadow-violet-500/30",
    modules: ["Hospital", "Hotel", "Travel", "Ride"],
    features: [
      "All Gold features",
      "Ride booking",
      "Live ride tracking",
      "15% cashback on bookings",
      "Dedicated account manager",
      "VIP lounge access",
    ],
    popular: false,
  },
];

const faqs = [
  {
    question: "Can I upgrade my plan anytime?",
    answer: "Yes! You can upgrade your membership plan at any time. The difference will be prorated and charged accordingly.",
  },
  {
    question: "What happens when my membership expires?",
    answer: "You'll receive reminder emails before expiry. After expiration, you'll have limited access until you renew.",
  },
  {
    question: "Is there a refund policy?",
    answer: "Yes, we offer a 7-day money-back guarantee for all new memberships. Contact support for assistance.",
  },
  {
    question: "Can I share my membership with family?",
    answer: "Memberships are individual. However, you can earn referral rewards when family members sign up!",
  },
];

export default function Membership() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handlePaymentSuccess = (planName: string) => {
    toast.success(`Successfully subscribed to ${planName} plan!`);
  };

  const getPrice = (plan: typeof plans[0]) => {
    if (billingCycle === 'yearly') {
      return parseInt(plan.yearlyPrice.replace(/[^\d]/g, ''));
    }
    return parseInt(plan.price.replace(/[^\d]/g, ''));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-hotel/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <Crown className="h-4 w-4" />
                <span className="text-sm font-medium">Membership Plans</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Unlock Premium Benefits
                <span className="block text-gradient">Choose Your Plan</span>
              </h1>
              
              <p className="text-lg text-muted-foreground">
                Get exclusive access to healthcare, hotels, travel, and rides. 
                Earn cashback, rewards, and enjoy priority support.
              </p>
            </div>
          </div>
        </section>

        {/* Plans Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan, index) => (
                <div
                  key={plan.id}
                  className={cn(
                    "relative p-6 rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-2 animate-slide-up",
                    plan.popular
                      ? "border-primary shadow-xl shadow-primary/20 scale-105 z-10"
                      : "border-border hover:border-primary/50 hover:shadow-lg",
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 rounded-full bg-gradient-hero text-primary-foreground text-xs font-semibold whitespace-nowrap">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6 pt-2">
                    <div
                      className={cn(
                        "h-16 w-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br",
                        plan.color
                      )}
                    >
                      <plan.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>

                  {/* Yearly Option */}
                  <div className="text-center mb-6 p-3 rounded-lg bg-secondary/50">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{plan.yearlyPrice}</span>
                      <span className="text-muted-foreground">{plan.yearlyPeriod}</span>
                    </p>
                    <p className="text-xs text-primary font-medium">{plan.savings}</p>
                  </div>

                  {/* Modules Access */}
                  <div className="mb-6">
                    <p className="text-xs font-medium text-muted-foreground mb-2">ACCESS TO:</p>
                    <div className="flex flex-wrap gap-1">
                      {plan.modules.map((module) => (
                        <span
                          key={module}
                          className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            module === "Hospital" && "bg-hospital/10 text-hospital",
                            module === "Hotel" && "bg-hotel/10 text-hotel",
                            module === "Travel" && "bg-travel/10 text-travel",
                            module === "Ride" && "bg-ride/10 text-ride"
                          )}
                        >
                          {module}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <RazorpayButton
                    amount={getPrice(plan)}
                    name="CareSync Membership"
                    description={`${plan.name} Plan - ${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} Subscription`}
                    onSuccess={() => handlePaymentSuccess(plan.name)}
                    className={cn(
                      "w-full",
                      plan.popular && "bg-gradient-hero hover:opacity-90"
                    )}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    Subscribe Now
                  </RazorpayButton>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Why Get a Membership?
              </h2>
              <p className="text-muted-foreground">
                Unlock exclusive benefits and save more on every booking
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Wallet className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Cashback Rewards</h3>
                <p className="text-muted-foreground">
                  Earn up to 15% cashback on every booking. Money goes directly to your wallet.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="h-16 w-16 rounded-2xl bg-hotel/10 flex items-center justify-center mx-auto mb-4">
                  <Gift className="h-8 w-8 text-hotel" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Exclusive Offers</h3>
                <p className="text-muted-foreground">
                  Access member-only deals and discounts across all our partner services.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="h-16 w-16 rounded-2xl bg-travel/10 flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-travel" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Priority Support</h3>
                <p className="text-muted-foreground">
                  Get faster responses and dedicated support based on your membership tier.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl border border-border bg-card"
                >
                  <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
