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
  Gift,
  KeyRound
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type AuthMode = "login" | "signup" | "forgot" | "reset" | "admin-setup" | "2fa";

// Only user and agent roles are available for public signup
// Admin, Supervisor, Super Admin can only be assigned by Super Admin
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
];

export default function Auth() {
  const [searchParams] = useSearchParams();
  const referralCodeFromUrl = searchParams.get("ref");
  const modeFromUrl = searchParams.get("mode");
  
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setupKey, setSetupKey] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [pendingUser, setPendingUser] = useState<{ id: string; email: string } | null>(null);
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

  // Set mode based on URL params
  useEffect(() => {
    if (modeFromUrl === "reset") {
      setMode("reset");
    } else if (referralCodeFromUrl) {
      setMode("signup");
      setFormData(prev => ({ ...prev, referralCode: referralCodeFromUrl }));
    }
  }, [referralCodeFromUrl, modeFromUrl]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const from = (location.state as { from?: string })?.from || getDashboardPath();
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location.state, getDashboardPath]);

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    try {
      // Use secure edge function for password reset
      const { data, error } = await supabase.functions.invoke("reset-super-admin-password", {
        body: { email: formData.email, action: "send_reset_link" },
      });

      if (error) {
        toast.error(error.message || "Failed to send reset email");
      } else if (data?.success) {
        toast.success(data.message || "Password reset link sent to your email!");
        setMode("login");
      } else {
        toast.error(data?.error || "Failed to send reset email");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      toast.error("Failed to send reset email");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        toast.error(error.message || "Failed to update password");
      } else {
        toast.success("Password updated successfully! Please sign in.");
        setNewPassword("");
        setConfirmPassword("");
        setMode("login");
        // Sign out to ensure clean state
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error("Password update error:", err);
      toast.error("Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminSetup = async () => {
    if (!formData.email.trim()) {
      toast.error("Please enter Super Admin email");
      return;
    }
    if (!setupKey.trim()) {
      toast.error("Please enter the setup key");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("reset-super-admin-password", {
        body: { 
          email: formData.email, 
          action: "direct_password_set",
          newPassword: newPassword,
          setupKey: setupKey
        },
      });

      if (error) {
        toast.error(error.message || "Failed to setup Super Admin");
      } else if (data?.success) {
        toast.success(data.message || "Super Admin configured successfully!");
        setNewPassword("");
        setConfirmPassword("");
        setSetupKey("");
        setMode("login");
      } else {
        toast.error(data?.error || "Failed to setup Super Admin");
      }
    } catch (err) {
      console.error("Admin setup error:", err);
      toast.error("Failed to setup Super Admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handle2FAVerification = async () => {
    if (!pendingUser || otpCode.length !== 6) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("two-factor-auth", {
        body: { 
          action: "verify_otp",
          userId: pendingUser.id,
          otp: otpCode
        },
      });

      if (error || !data?.success) {
        toast.error(data?.error || error?.message || "Invalid verification code");
        return;
      }

      toast.success("Verification successful!");
      setPendingUser(null);
      setOtpCode("");
      // Navigation will happen via useEffect when auth state updates
    } catch (err) {
      console.error("2FA verification error:", err);
      toast.error("Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (!pendingUser) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("two-factor-auth", {
        body: { 
          action: "resend_otp",
          userId: pendingUser.id,
          email: pendingUser.email
        },
      });

      if (error || !data?.success) {
        toast.error(data?.error || "Failed to resend code");
        return;
      }

      toast.success("New verification code sent to your email");
    } catch (err) {
      console.error("Resend OTP error:", err);
      toast.error("Failed to resend code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "forgot") {
      await handleForgotPassword();
      return;
    }

    if (mode === "reset") {
      await handleResetPassword();
      return;
    }

    if (mode === "admin-setup") {
      await handleAdminSetup();
      return;
    }

    if (mode === "2fa") {
      await handle2FAVerification();
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const { data: authData, error } = await signIn(formData.email, formData.password);
        if (error) {
          toast.error(error.message || "Failed to sign in");
        } else if (authData?.user) {
          // Check if user requires 2FA
          const { data: twoFAData } = await supabase.functions.invoke("two-factor-auth", {
            body: { 
              action: "send_otp",
              userId: authData.user.id,
              email: authData.user.email
            },
          });

          if (twoFAData?.requires2FA) {
            // User is admin/super_admin - show 2FA screen
            setPendingUser({ id: authData.user.id, email: authData.user.email! });
            setMode("2fa");
            toast.info("Verification code sent to your email");
          } else {
            toast.success("Signed in successfully!");
            // Navigation will happen via useEffect
          }
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
              {mode === "login" ? "Welcome back" : mode === "forgot" ? "Reset Password" : mode === "reset" ? "Set New Password" : mode === "admin-setup" ? "Super Admin Setup" : mode === "2fa" ? "Two-Factor Authentication" : "Create your account"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "login" 
                ? "Sign in to access your account and services" 
                : mode === "forgot"
                ? "Enter your email to receive a password reset link"
                : mode === "reset"
                ? "Enter your new password below"
                : mode === "admin-setup"
                ? "Configure Super Admin credentials securely"
                : mode === "2fa"
                ? `Enter the 6-digit code sent to ${pendingUser?.email}`
                : "Join 50,000+ users enjoying our services"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 2FA OTP Input */}
            {mode === "2fa" && (
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 rounded-full bg-primary/10">
                    <KeyRound className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="flex justify-center">
                  <InputOTP 
                    maxLength={6} 
                    value={otpCode}
                    onChange={setOtpCode}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Code expires in 5 minutes
                </p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isSubmitting}
                  className="w-full text-center text-sm text-primary hover:underline disabled:opacity-50"
                >
                  Didn't receive code? Resend
                </button>
              </div>
            )}

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

            {/* Email - not shown for reset mode */}
            {(mode !== "reset") && (
              <div className="space-y-2">
                <Label htmlFor="email">{mode === "admin-setup" ? "Super Admin Email" : "Email Address"}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={mode === "admin-setup" ? "super.admin@example.com" : "Enter your email"}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            {/* Setup Key - Admin setup only */}
            {mode === "admin-setup" && (
              <div className="space-y-2">
                <Label htmlFor="setupKey">Setup Key</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="setupKey"
                    type="password"
                    placeholder="Enter setup key"
                    value={setupKey}
                    onChange={(e) => setSetupKey(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">Contact your system administrator for the setup key</p>
              </div>
            )}

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

            {/* Password fields for reset and admin-setup mode */}
            {(mode === "reset" || mode === "admin-setup") && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{mode === "admin-setup" ? "Password" : "New Password"}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password (min 8 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={8}
                    />
                  </div>
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>
              </>
            )}

            {/* Password field - for login and signup only */}
            {(mode === "login" || mode === "signup") && (
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
            )}

            {/* Forgot Password Link - Login mode only */}
            {mode === "login" && (
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setMode("admin-setup")}
                  className="text-sm text-muted-foreground hover:text-primary hover:underline"
                >
                  Super Admin Setup
                </button>
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              variant="hero" 
              className="w-full" 
              size="lg"
              disabled={isSubmitting || (mode === "2fa" && otpCode.length !== 6)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {mode === "login" ? "Signing In..." : mode === "forgot" ? "Sending..." : mode === "reset" ? "Updating Password..." : mode === "admin-setup" ? "Setting Up..." : mode === "2fa" ? "Verifying..." : "Creating Account..."}
                </>
              ) : (
                mode === "login" ? "Sign In" : mode === "forgot" ? "Send Reset Link" : mode === "reset" ? "Update Password" : mode === "admin-setup" ? "Setup Super Admin" : mode === "2fa" ? "Verify Code" : "Create Account"
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
            ) : mode === "forgot" || mode === "reset" || mode === "admin-setup" || mode === "2fa" ? (
              <>
                {mode === "admin-setup" ? "Already have credentials?" : mode === "2fa" ? "Wrong account?" : "Remember your password?"}{" "}
                <button
                  onClick={() => {
                    setMode("login");
                    setPendingUser(null);
                    setOtpCode("");
                  }}
                  className="text-primary font-medium hover:underline"
                >
                  {mode === "2fa" ? "Back to login" : "Sign in"}
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
