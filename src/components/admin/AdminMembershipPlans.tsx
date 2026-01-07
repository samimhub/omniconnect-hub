import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useMembershipPlans } from "@/hooks/useMembershipPlans";
import { toast } from "sonner";
import {
  Crown,
  Star,
  Zap,
  Diamond,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  MoreVertical,
  Percent,
  Calendar,
  Loader2,
} from "lucide-react";

const planIcons: Record<string, any> = {
  Metal: Zap,
  Silver: Star,
  Gold: Crown,
  Platinum: Diamond,
};

const planColors: Record<string, string> = {
  Metal: "bg-zinc-500",
  Silver: "bg-slate-400",
  Gold: "bg-amber-500",
  Platinum: "bg-gradient-to-r from-primary to-purple-500",
};

interface PlanFormData {
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  discount_percentage: number;
  validity_days: number;
  modules: string[];
  features: string[];
  is_active: boolean;
  is_popular: boolean;
}

const defaultFormData: PlanFormData = {
  name: "",
  description: "",
  price_monthly: 0,
  price_yearly: 0,
  discount_percentage: 0,
  validity_days: 30,
  modules: [],
  features: [],
  is_active: true,
  is_popular: false,
};

export function AdminMembershipPlans() {
  const { plans, isLoading, updatePlan, createPlan, deletePlan } = useMembershipPlans();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);

  const allModules = ["Hospital", "Hotel", "Travel", "Ride"];

  const handleEdit = (plan: any) => {
    setEditingPlan(plan.id);
    setFormData({
      name: plan.name,
      description: plan.description || "",
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      discount_percentage: plan.discount_percentage,
      validity_days: plan.validity_days,
      modules: plan.modules || [],
      features: plan.features || [],
      is_active: plan.is_active,
      is_popular: plan.is_popular,
    });
    setEditDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingPlan(null);
    setFormData(defaultFormData);
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (editingPlan) {
        const result = await updatePlan(editingPlan, formData);
        if (result.success) {
          toast.success("Plan updated successfully");
          setEditDialogOpen(false);
        } else {
          toast.error(result.error || "Failed to update plan");
        }
      } else {
        const result = await createPlan(formData);
        if (result.success) {
          toast.success("Plan created successfully");
          setEditDialogOpen(false);
        } else {
          toast.error(result.error || "Failed to create plan");
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    
    const result = await deletePlan(id);
    if (result.success) {
      toast.success("Plan deleted successfully");
    } else {
      toast.error(result.error || "Failed to delete plan");
    }
  };

  const toggleModule = (module: string) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.includes(module)
        ? prev.modules.filter((m) => m !== module)
        : [...prev.modules, module],
    }));
  };

  const handleFeaturesChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      features: value.split("\n").filter((f) => f.trim()),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Manage Membership Plans</h3>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="w-4 h-4" /> Create New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const Icon = planIcons[plan.name] || Crown;
          return (
            <Card
              key={plan.id}
              className={`bg-card/50 backdrop-blur-sm border-border/50 relative overflow-hidden ${
                plan.is_popular ? "ring-2 ring-primary" : ""
              } ${!plan.is_active ? "opacity-60" : ""}`}
            >
              {plan.is_popular && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-primary text-primary-foreground">Popular</Badge>
                </div>
              )}
              {!plan.is_active && (
                <div className="absolute top-3 left-3">
                  <Badge variant="outline" className="border-red-400 text-red-400">Inactive</Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <div
                  className={`w-12 h-12 rounded-xl ${
                    planColors[plan.name] || "bg-primary"
                  } flex items-center justify-center mb-3`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold">₹{plan.price_monthly}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  ₹{plan.price_yearly}/year
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{plan.discount_percentage}% booking discount</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{plan.validity_days} days validity</span>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Modules:</p>
                  <div className="flex flex-wrap gap-1">
                    {plan.modules?.map((module) => (
                      <Badge key={module} variant="outline" className="text-xs">
                        {module}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  {plan.features?.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-muted-foreground text-xs">{feature}</span>
                    </div>
                  ))}
                  {(plan.features?.length || 0) > 3 && (
                    <p className="text-xs text-primary">+{plan.features!.length - 3} more</p>
                  )}
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(plan)}
                  >
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                    onClick={() => handleDelete(plan.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "Edit Membership Plan" : "Create New Plan"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Gold"
                />
              </div>
              <div className="space-y-2">
                <Label>Discount %</Label>
                <Input
                  type="number"
                  value={formData.discount_percentage}
                  onChange={(e) =>
                    setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })
                  }
                  placeholder="e.g., 15"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Short description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monthly Price (₹)</Label>
                <Input
                  type="number"
                  value={formData.price_monthly}
                  onChange={(e) =>
                    setFormData({ ...formData, price_monthly: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Yearly Price (₹)</Label>
                <Input
                  type="number"
                  value={formData.price_yearly}
                  onChange={(e) =>
                    setFormData({ ...formData, price_yearly: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Validity (Days)</Label>
              <Input
                type="number"
                value={formData.validity_days}
                onChange={(e) =>
                  setFormData({ ...formData, validity_days: parseInt(e.target.value) || 30 })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Modules Access</Label>
              <div className="flex flex-wrap gap-2">
                {allModules.map((module) => (
                  <Badge
                    key={module}
                    variant={formData.modules.includes(module) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleModule(module)}
                  >
                    {module}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Features (one per line)</Label>
              <Textarea
                value={formData.features.join("\n")}
                onChange={(e) => handleFeaturesChange(e.target.value)}
                placeholder="Feature 1
Feature 2
Feature 3"
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_popular}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
                />
                <Label>Mark as Popular</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
