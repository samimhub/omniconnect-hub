import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useRazorpay } from "@/hooks/useRazorpay";
import { supabase } from "@/integrations/supabase/client";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  CreditCard,
  CheckCircle,
  Star,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: any;
  hospital: any;
}

const timeSlots = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
];

type BookingStep = "datetime" | "confirm" | "payment" | "success";
type PaymentMethod = "online" | "hospital";

export function BookingDialog({
  open,
  onOpenChange,
  doctor,
  hospital,
}: BookingDialogProps) {
  const [step, setStep] = useState<BookingStep>("datetime");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("online");
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { initiatePayment, isLoading: isPaymentLoading } = useRazorpay();

  const handleClose = () => {
    setStep("datetime");
    setSelectedDate(undefined);
    setSelectedTime("");
    setPaymentMethod("online");
    setIsProcessing(false);
    onOpenChange(false);
  };

  const handleContinue = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to book an appointment",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast({
        title: "Select Date & Time",
        description: "Please select a date and time slot",
        variant: "destructive",
      });
      return;
    }

    setStep("confirm");
  };

  const saveAppointment = async (paymentId?: string, orderId?: string) => {
    if (!user || !selectedDate) return;

    const { error } = await supabase.from("appointments").insert({
      user_id: user.id,
      doctor_name: doctor.name,
      doctor_specialty: doctor.specialty,
      doctor_image: doctor.image,
      hospital_name: hospital.name,
      hospital_location: hospital.location || hospital.address,
      appointment_date: format(selectedDate, "yyyy-MM-dd"),
      appointment_time: selectedTime,
      consultation_fee: doctor.fee,
      payment_method: paymentMethod,
      payment_status: paymentMethod === "online" ? "paid" : "pending",
      razorpay_payment_id: paymentId || null,
      razorpay_order_id: orderId || null,
      status: "confirmed",
    });

    if (error) {
      console.error("Failed to save appointment:", error);
      throw error;
    }
  };

  const handlePayOnline = async () => {
    setIsProcessing(true);
    
    initiatePayment({
      amount: doctor.fee,
      name: `Consultation with ${doctor.name}`,
      description: `Appointment at ${hospital.name} on ${selectedDate ? format(selectedDate, "MMM d, yyyy") : ""} at ${selectedTime}`,
      prefill: {
        name: user?.email?.split("@")[0] || "",
        email: user?.email || "",
      },
      notes: {
        doctor_id: doctor.id?.toString() || "",
        hospital_id: hospital.id?.toString() || "",
        appointment_date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
        appointment_time: selectedTime,
      },
      onSuccess: async (response) => {
        console.log("Payment successful:", response);
        try {
          await saveAppointment(response.razorpay_payment_id, response.razorpay_order_id);
          setStep("success");
          toast({
            title: "Payment Successful!",
            description: `Your appointment with ${doctor.name} has been confirmed.`,
          });
        } catch (error) {
          toast({
            title: "Booking Error",
            description: "Payment was successful but failed to save appointment. Please contact support.",
            variant: "destructive",
          });
        }
        setIsProcessing(false);
      },
      onError: (error) => {
        console.error("Payment failed:", error);
        setIsProcessing(false);
        toast({
          title: "Payment Failed",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const handlePayAtHospital = async () => {
    setIsProcessing(true);
    try {
      await saveAppointment();
      setStep("success");
      toast({
        title: "Appointment Booked!",
        description: `Your appointment with ${doctor.name} has been confirmed. Please pay at the hospital.`,
      });
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmBooking = () => {
    if (paymentMethod === "online") {
      handlePayOnline();
    } else {
      handlePayAtHospital();
    }
  };

  if (!doctor || !hospital) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "datetime" && "Book Appointment"}
            {step === "confirm" && "Confirm Booking"}
            {step === "success" && "Booking Confirmed!"}
          </DialogTitle>
        </DialogHeader>

        {/* Doctor Info - Always Visible */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 mb-4">
          <img
            src={doctor.image}
            alt={doctor.name}
            className="w-14 h-14 rounded-xl object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{doctor.name}</h3>
            <p className="text-sm text-hospital">{doctor.specialty}</p>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{hospital.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10">
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium">{doctor.rating}</span>
          </div>
        </div>

        {/* Step 1: Date & Time Selection */}
        {step === "datetime" && (
          <div className="space-y-6">
            {/* Date Selection */}
            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-hospital" />
                Select Date
              </h4>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                className="rounded-xl border p-3"
              />
            </div>

            {/* Time Selection */}
            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-hospital" />
                Select Time
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                      "px-3 py-2 text-sm rounded-lg border transition-all",
                      selectedTime === time
                        ? "bg-hospital text-white border-hospital"
                        : "bg-background border-border hover:border-hospital/50"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="hospital"
              className="w-full"
              onClick={handleContinue}
              disabled={!selectedDate || !selectedTime}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Confirmation */}
        {step === "confirm" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-hospital" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium text-foreground">
                      {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : ""}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-hospital" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium text-foreground">{selectedTime}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-hospital" />
                  <div>
                    <p className="text-sm text-muted-foreground">Consultation Fee</p>
                    <p className="font-medium text-foreground">₹{doctor.fee}</p>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Select Payment Method</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod("online")}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all text-left",
                      paymentMethod === "online"
                        ? "border-hospital bg-hospital/5"
                        : "border-border hover:border-hospital/50"
                    )}
                  >
                    <CreditCard className={cn(
                      "h-5 w-5 mb-2",
                      paymentMethod === "online" ? "text-hospital" : "text-muted-foreground"
                    )} />
                    <p className="font-medium text-sm">Pay Online</p>
                    <p className="text-xs text-muted-foreground">Pay now via Razorpay</p>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("hospital")}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all text-left",
                      paymentMethod === "hospital"
                        ? "border-hospital bg-hospital/5"
                        : "border-border hover:border-hospital/50"
                    )}
                  >
                    <MapPin className={cn(
                      "h-5 w-5 mb-2",
                      paymentMethod === "hospital" ? "text-hospital" : "text-muted-foreground"
                    )} />
                    <p className="font-medium text-sm">Pay at Hospital</p>
                    <p className="text-xs text-muted-foreground">Pay when you visit</p>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("datetime")}
                disabled={isProcessing || isPaymentLoading}
              >
                Back
              </Button>
              <Button
                variant="hospital"
                className="flex-1"
                onClick={handleConfirmBooking}
                disabled={isProcessing || isPaymentLoading}
              >
                {isProcessing || isPaymentLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : paymentMethod === "online" ? (
                  `Pay ₹${doctor.fee}`
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <div className="space-y-6 text-center py-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-green-500/10">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Appointment Confirmed!
              </h3>
              <p className="text-muted-foreground">
                Your appointment has been successfully booked.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 text-left space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-hospital" />
                <span className="text-sm">{doctor.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-hospital" />
                <span className="text-sm">
                  {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : ""} at {selectedTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-hospital" />
                <span className="text-sm">{hospital.name}</span>
              </div>
            </div>

            <Button variant="hospital" className="w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}