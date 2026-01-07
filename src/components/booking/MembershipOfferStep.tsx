import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRazorpay } from "@/hooks/useRazorpay";
import { toast } from "sonner";
import {
  Crown,
  Star,
  Zap,
  Diamond,
  Check,
  ArrowRight,
  Loader2,
  Sparkles,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  discount_percentage: number;
  validity_days: number;
  modules: string[];
  features: string[];
  is_popular: boolean;
}

interface MembershipOfferStepProps {
  bookingAmount: number;
  onSkip: () => void;
  onMembershipPurchased: (discountPercentage: number, planName: string) => void;
  isProcessing: boolean;
}

const planIcons: Record<string, any> = {
  Metal: Zap,
  Silver: Star,
  Gold: Crown,
  Platinum: Diamond,
};

const planColors: Record<string, string> = {
  Metal: "from-slate-400 to-slate-600",
  Silver: "from-gray-300 to-gray-500",
  Gold: "from-amber-400 to-amber-600",
  Platinum: "from-violet-400 to-indigo-600",
};

export function MembershipOfferStep({
  bookingAmount,
  onSkip,
  onMembershipPurchased,
  isProcessing,
}: MembershipOfferStepProps) {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const { user } = useAuth();
  const { initiatePayment, isLoading: isPaymentLoading } = useRazorpay();

  useEffect(() => {
    fetchPlans();
    if (user) {
      checkActiveSubscription();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("membership_plans")
        .select("*")
        .eq("is_active", true)
        .order("price_monthly", { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (err) {
      console.error("Error fetching plans:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkActiveSubscription = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gte("end_date", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setActiveSubscription(data);
      }
    } catch (err) {
      console.error("Error checking subscription:", err);
    }
  };

  const calculateSavings = (plan: MembershipPlan) => {
    return Math.round((bookingAmount * plan.discount_percentage) / 100);
  };

  const calculateDiscountedPrice = (plan: MembershipPlan) => {
    return bookingAmount - calculateSavings(plan);
  };

  const handlePurchaseMembership = async (plan: MembershipPlan) => {
    if (!user) {
      toast.error("Please login to purchase membership");
      return;
    }

    setSelectedPlan(plan);
    setIsPurchasing(true);

    initiatePayment({
      amount: plan.price_monthly,
      name: "CareSync Membership",
      description: `${plan.name} Plan - Monthly Subscription`,
      prefill: {
        name: user?.email?.split("@")[0] || "",
        email: user?.email || "",
      },
      notes: {
        plan_name: plan.name,
        plan_id: plan.id,
      },
      onSuccess: async (response) => {
        try {
          // Save subscription
          const { data, error } = await supabase.functions.invoke("save-subscription", {
            body: {
              plan_name: plan.name,
              plan_price: plan.price_monthly,
              billing_cycle: "monthly",
              discount_percentage: plan.discount_percentage,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
            },
          });

          if (error || !data?.success) {
            throw error || new Error("Failed to save subscription");
          }

          toast.success(`${plan.name} membership activated! Your discount is now applied.`);
          onMembershipPurchased(plan.discount_percentage, plan.name);
        } catch (err) {
          console.error("Error saving subscription:", err);
          toast.error("Payment successful but failed to activate membership. Contact support.");
        }
        setIsPurchasing(false);
      },
      onError: (error) => {
        console.error("Payment failed:", error);
        toast.error(error.message || "Payment failed. Please try again.");
        setIsPurchasing(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user already has active subscription, show that
  if (activeSubscription) {
    const plan = plans.find((p) => p.name === activeSubscription.plan_name);
    const discount = plan?.discount_percentage || activeSubscription.discount_percentage || 0;
    
    return (
      <div className="space-y-6">
        <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-3">
            <Check className="h-4 w-4" />
            Active Membership
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            You have {activeSubscription.plan_name} Plan!
          </h3>
          <p className="text-muted-foreground mb-4">
            Enjoy <span className="text-primary font-semibold">{discount}% off</span> on this booking
          </p>
          
          <div className="p-4 rounded-lg bg-background/50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Original Price</span>
              <span className="line-through text-muted-foreground">₹{bookingAmount}</span>
            </div>
            <div className="flex justify-between text-sm text-primary">
              <span>Membership Discount ({discount}%)</span>
              <span>- ₹{Math.round((bookingAmount * discount) / 100)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>You Pay</span>
              <span className="text-primary">₹{bookingAmount - Math.round((bookingAmount * discount) / 100)}</span>
            </div>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={() => onMembershipPurchased(discount, activeSubscription.plan_name)}
        >
          Continue with Discount
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
          <Sparkles className="h-4 w-4" />
          Special Offer
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Save on This Booking!
        </h3>
        <p className="text-muted-foreground text-sm">
          Get a membership and save up to 20% on this and future bookings
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-2 gap-3">
        {plans.map((plan) => {
          const Icon = planIcons[plan.name] || Crown;
          const savings = calculateSavings(plan);
          const isSelected = selectedPlan?.id === plan.id;

          return (
            <Card
              key={plan.id}
              className={cn(
                "cursor-pointer transition-all relative overflow-hidden",
                isSelected
                  ? "ring-2 ring-primary border-primary"
                  : "hover:border-primary/50",
                plan.is_popular && "border-primary/50"
              )}
              onClick={() => setSelectedPlan(plan)}
            >
              {plan.is_popular && (
                <div className="absolute top-0 right-0 px-2 py-0.5 text-[10px] font-medium bg-primary text-primary-foreground rounded-bl">
                  Popular
                </div>
              )}
              <CardContent className="p-4">
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br mb-3",
                    planColors[plan.name]
                  )}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>

                <h4 className="font-semibold text-foreground">{plan.name}</h4>
                <p className="text-xs text-muted-foreground mb-2">₹{plan.price_monthly}/month</p>

                <div className="flex items-center gap-1 text-primary mb-2">
                  <Percent className="h-3 w-3" />
                  <span className="text-sm font-semibold">{plan.discount_percentage}% off</span>
                </div>

                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
                  Save ₹{savings}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Plan Summary */}
      {selectedPlan && (
        <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Booking Amount</span>
            <span className="text-muted-foreground">₹{bookingAmount}</span>
          </div>
          <div className="flex items-center justify-between text-primary">
            <span className="text-sm font-medium">{selectedPlan.name} Discount ({selectedPlan.discount_percentage}%)</span>
            <span>- ₹{calculateSavings(selectedPlan)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Membership Price</span>
            <span>+ ₹{selectedPlan.price_monthly}</span>
          </div>
          <div className="border-t pt-3 flex items-center justify-between font-semibold">
            <span>Total Today</span>
            <span className="text-lg">
              ₹{calculateDiscountedPrice(selectedPlan) + selectedPlan.price_monthly}
            </span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Plus enjoy {selectedPlan.discount_percentage}% off on all future bookings!
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <Button
          className="w-full"
          onClick={() => selectedPlan && handlePurchaseMembership(selectedPlan)}
          disabled={!selectedPlan || isPurchasing || isPaymentLoading}
        >
          {isPurchasing || isPaymentLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : selectedPlan ? (
            <>
              Get {selectedPlan.name} & Save ₹{calculateSavings(selectedPlan)}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            "Select a Plan"
          )}
        </Button>

        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={onSkip}
          disabled={isPurchasing || isPaymentLoading || isProcessing}
        >
          Continue without membership (Pay ₹{bookingAmount})
        </Button>
      </div>
    </div>
  );
}
