import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Mail, 
  Lock, 
  User, 
  Phone,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  UserCheck,
  Shield,
  Users,
  Gift
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type AuthMode = "login" | "signup";

const roleOptions: { value: AppRole; label: string; description: string; icon: React.ReactNode }[] = [
  { 
    value: "user", 
    label: "User", 
    description: "Book services & earn rewards",
    icon: <Users className="h-5 w-5" />
  },
  { 
    value: "agent", 
    label: "Agent", 
    description: "Earn commission on bookings",
    icon: <UserCheck className="h-5 w-5" />
  },
  { 
    value: "admin", 
    label: "Admin", 
    description: "Manage the platform",
    icon: <Shield className="h-5 w-5" />
  },
];

export default function Auth() {
  const [searchParams] = useSearchParams();
  const referralCodeFromUrl = searchParams.get("ref");
  
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user" as AppRole,
    referralCode: referralCodeFromUrl || "",
  });

  const { signIn, signUp, isAuthenticated, isLoading, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Set signup mode if referral code is present
  useEffect(() => {
    if (referralCodeFromUrl) {
      setMode("signup");
      setFormData(prev => ({ ...prev, referralCode: referralCodeFromUrl }));
    }
  }, [referralCodeFromUrl]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const from = (location.state as { from?: string })?.from || getDashboardPath();
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location.state, getDashboardPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast.error(error.message || "Failed to sign in");
        } else {
          toast.success("Signed in successfully!");
          // Navigation will happen via useEffect
        }
      } else {
        // Validate fields
        if (!formData.name.trim()) {
          toast.error("Please enter your name");
          setIsSubmitting(false);
          return;
        }
        if (!formData.email.trim()) {
          toast.error("Please enter your email");
          setIsSubmitting(false);
          return;
        }
        if (formData.password.length < 6) {
          toast.error("Password must be at least 6 characters");
          setIsSubmitting(false);
          return;
        }

        const { data: signUpData, error } = await signUp(
          formData.email, 
          formData.password, 
          formData.name, 
          formData.phone,
          formData.role
        );
        
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in.");
          } else {
            toast.error(error.message || "Failed to create account");
          }
        } else {
          // Process referral if code was provided
          if (formData.referralCode && signUpData?.user?.id) {
            try {
              await supabase.functions.invoke("process-referral", {
                body: {
                  referral_code: formData.referralCode,
                  referee_user_id: signUpData.user.id,
                },
              });
              toast.success("Account created! You received 25 referral coins as a welcome bonus.");
            } catch (refErr) {
              console.error("Referral processing failed:", refErr);
              toast.success("Account created successfully! You can now sign in.");
            }
          } else {
            toast.success("Account created successfully! You can now sign in.");
          }
          setMode("login");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Back Link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-xl bg-gradient-hero flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">M</span>
            </div>
            <span className="text-xl font-bold text-foreground">MultiServe</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "login" 
                ? "Sign in to access your account and services" 
                : "Join 50,000+ users enjoying our services"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection - Signup only */}
            {mode === "signup" && (
              <div className="space-y-3">
                <Label>I want to join as</Label>
                <div className="grid grid-cols-3 gap-3">
                  {roleOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: option.value })}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all text-center",
                        formData.role === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className={cn(
                        "mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2",
                        formData.role === option.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {option.icon}
                      </div>
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Name - Signup only */}
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Phone - Signup only */}
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {/* Referral Code - Signup only */}
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                <div className="relative">
                  <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="referralCode"
                    type="text"
                    placeholder="Enter referral code"
                    value={formData.referralCode}
                    onChange={(e) =>
                      setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })
                    }
                    className="pl-10"
                    maxLength={8}
                  />
                </div>
                {formData.referralCode && (
                  <p className="text-xs text-green-500">You'll receive 25 bonus coins on signup!</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="pl-10 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              variant="hero" 
              className="w-full" 
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {mode === "login" ? "Signing In..." : "Creating Account..."}
                </>
              ) : (
                mode === "login" ? "Sign In" : "Create Account"
              )}
            </Button>
          </form>

          {/* Toggle Mode */}
          <p className="text-center text-muted-foreground mt-6">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-primary font-medium hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-hero relative overflow-hidden">
        {/* Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(0_0%_100%_/_0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(0_0%_100%_/_0.1)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-40 right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl animate-float" style={{ animationDelay: "3s" }} />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Your Services,<br />All in One Place
          </h2>
          <p className="text-lg text-white/80 max-w-md mb-8">
            Access healthcare, hotels, travel, and rides with a single account. 
            Earn rewards on every booking.
          </p>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            {[
              { label: "Hospital", color: "bg-hospital" },
              { label: "Hotel", color: "bg-hotel" },
              { label: "Travel", color: "bg-travel" },
              { label: "Ride", color: "bg-ride" },
            ].map((item) => (
              <div
                key={item.label}
                className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <div className={cn("h-8 w-8 rounded-lg mb-2", item.color)} />
                <p className="font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
