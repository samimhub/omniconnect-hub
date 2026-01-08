import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useRazorpay } from "@/hooks/useRazorpay";
import { toast } from "sonner";
import {
  Crown,
  Star,
  Zap,
  Diamond,
  ArrowRight,
  Loader2,
  ArrowUpCircle,
  Calendar,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";

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

interface CurrentSubscription {
  id: string;
  plan_name: string;
  plan_price: number;
  billing_cycle: string;
  end_date: string;
  discount_percentage: number | null;
}

interface UpgradeMembershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSubscription: CurrentSubscription;
  userId: string;
  onUpgradeComplete: () => void;
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

const planRanking: Record<string, number> = {
  Metal: 1,
  Silver: 2,
  Gold: 3,
  Platinum: 4,
};

export function UpgradeMembershipDialog({
  open,
  onOpenChange,
  currentSubscription,
  userId,
  onUpgradeComplete,
}: UpgradeMembershipDialogProps) {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { initiatePayment, isLoading: isPaymentLoading } = useRazorpay();

  useEffect(() => {
    if (open) {
      fetchPlans();
    }
  }, [open]);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("membership_plans")
        .select("*")
        .eq("is_active", true)
        .order("price_monthly", { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (err) {
      console.error("Error fetching plans:", err);
      toast.error("Failed to load plans");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter to only show plans higher than current
  const availableUpgrades = useMemo(() => {
    const currentRank = planRanking[currentSubscription.plan_name] || 0;
    return plans.filter((plan) => (planRanking[plan.name] || 0) > currentRank);
  }, [plans, currentSubscription.plan_name]);

  // Calculate pro-rated pricing
  const calculateProRatedPrice = (newPlan: MembershipPlan) => {
    const endDate = new Date(currentSubscription.end_date);
    const today = new Date();
    const remainingDays = Math.max(0, differenceInDays(endDate, today));

    // Calculate daily rate of current plan
    const currentDailyRate = currentSubscription.plan_price / 30;
    const creditFromCurrent = Math.round(currentDailyRate * remainingDays);

    // New plan price
    const newPlanPrice = newPlan.price_monthly;

    // Pro-rated upgrade price
    const upgradePrice = Math.max(0, newPlanPrice - creditFromCurrent);

    return {
      remainingDays,
      creditFromCurrent,
      newPlanPrice,
      upgradePrice,
      discountGain: newPlan.discount_percentage - (currentSubscription.discount_percentage || 0),
    };
  };

  const handleUpgrade = async (plan: MembershipPlan) => {
    if (!userId) {
      toast.error("Please login to upgrade");
      return;
    }

    setSelectedPlan(plan);
    setIsUpgrading(true);

    const { upgradePrice, remainingDays } = calculateProRatedPrice(plan);

    // If upgrade price is 0 or very low, process directly
    if (upgradePrice <= 0) {
      try {
        await processUpgrade(plan, null, null, remainingDays);
        toast.success(`Upgraded to ${plan.name} plan!`);
        onOpenChange(false);
        onUpgradeComplete();
      } catch (err) {
        console.error("Upgrade failed:", err);
        toast.error("Failed to upgrade. Please try again.");
      } finally {
        setIsUpgrading(false);
      }
      return;
    }

    initiatePayment({
      amount: upgradePrice,
      name: "CareSync Membership Upgrade",
      description: `Upgrade to ${plan.name} Plan (Pro-rated)`,
      prefill: {
        name: "",
        email: "",
      },
      notes: {
        plan_name: plan.name,
        plan_id: plan.id,
        upgrade_from: currentSubscription.plan_name,
      },
      onSuccess: async (response) => {
        try {
          await processUpgrade(
            plan,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            remainingDays
          );
          toast.success(`Successfully upgraded to ${plan.name}!`);
          onOpenChange(false);
          onUpgradeComplete();
        } catch (err) {
          console.error("Error processing upgrade:", err);
          toast.error("Payment successful but upgrade failed. Contact support.");
        }
        setIsUpgrading(false);
      },
      onError: (error) => {
        console.error("Payment failed:", error);
        toast.error(error.message || "Payment failed. Please try again.");
        setIsUpgrading(false);
      },
    });
  };

  const processUpgrade = async (
    plan: MembershipPlan,
    orderId: string | null,
    paymentId: string | null,
    remainingDays: number
  ) => {
    // Deactivate current subscription
    await supabase
      .from("subscriptions")
      .update({ status: "upgraded" })
      .eq("id", currentSubscription.id);

    // Create new subscription with same end date to maintain continuity
    const endDate = new Date(currentSubscription.end_date);
    
    const { error } = await supabase.from("subscriptions").insert({
      user_id: userId,
      plan_name: plan.name,
      plan_price: plan.price_monthly,
      billing_cycle: "monthly",
      discount_percentage: plan.discount_percentage,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      status: "active",
      start_date: new Date().toISOString(),
      end_date: endDate.toISOString(),
    });

    if (error) throw error;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-primary" />
            Upgrade Your Membership
          </DialogTitle>
          <DialogDescription>
            Get more discounts by upgrading to a higher plan. You'll only pay the
            difference for your remaining days.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : availableUpgrades.length === 0 ? (
          <div className="text-center py-8">
            <Diamond className="h-12 w-12 mx-auto text-primary/50 mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              You're on the highest plan!
            </h3>
            <p className="text-muted-foreground text-sm">
              You already have the best membership tier with maximum discounts.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current Plan Info */}
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Current Plan</span>
                <Badge variant="outline">{currentSubscription.plan_name}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  {currentSubscription.discount_percentage || 0}% discount
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Expires: {new Date(currentSubscription.end_date).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Available Upgrades */}
            <div className="space-y-3">
              {availableUpgrades.map((plan) => {
                const Icon = planIcons[plan.name] || Crown;
                const pricing = calculateProRatedPrice(plan);
                const isSelected = selectedPlan?.id === plan.id;

                return (
                  <Card
                    key={plan.id}
                    className={cn(
                      "cursor-pointer transition-all",
                      isSelected
                        ? "ring-2 ring-primary border-primary"
                        : "hover:border-primary/50",
                      plan.is_popular && "border-primary/30"
                    )}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br shrink-0",
                            planColors[plan.name]
                          )}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">
                              {plan.name}
                            </h4>
                            {plan.is_popular && (
                              <Badge className="bg-primary/10 text-primary border-0 text-xs">
                                Popular
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-sm mb-2">
                            <span className="flex items-center gap-1 text-primary font-medium">
                              <Percent className="h-3 w-3" />
                              {plan.discount_percentage}% off
                            </span>
                            <span className="text-muted-foreground">
                              +{pricing.discountGain}% more savings
                            </span>
                          </div>

                          <div className="p-2 rounded bg-muted/50 text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                New plan price
                              </span>
                              <span>₹{plan.price_monthly}</span>
                            </div>
                            <div className="flex justify-between text-primary">
                              <span>Credit from current ({pricing.remainingDays} days)</span>
                              <span>- ₹{pricing.creditFromCurrent}</span>
                            </div>
                            <div className="flex justify-between font-semibold pt-1 border-t">
                              <span>Pay Today</span>
                              <span className="text-primary">
                                {pricing.upgradePrice <= 0
                                  ? "FREE"
                                  : `₹${pricing.upgradePrice}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Upgrade Button */}
            <Button
              className="w-full"
              onClick={() => selectedPlan && handleUpgrade(selectedPlan)}
              disabled={!selectedPlan || isUpgrading || isPaymentLoading}
            >
              {isUpgrading || isPaymentLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : selectedPlan ? (
                <>
                  Upgrade to {selectedPlan.name}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                "Select a Plan to Upgrade"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
