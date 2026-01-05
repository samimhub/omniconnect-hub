import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CalendarClock, XCircle, Loader2 } from "lucide-react";
import { format, addDays, isBefore, startOfToday } from "date-fns";

interface Appointment {
  id: string;
  doctor_name: string;
  hospital_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
}

interface AppointmentActionsProps {
  appointment: Appointment;
  onUpdate: () => void;
}

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM",
  "04:30 PM", "05:00 PM"
];

export const AppointmentActions = ({ appointment, onUpdate }: AppointmentActionsProps) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");

  const canModify = appointment.status === "confirmed" || appointment.status === "pending";

  const handleCancel = async () => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", appointment.id);

      if (error) throw error;

      toast.success("Appointment cancelled successfully");
      onUpdate();
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      toast.error("Failed to cancel appointment");
    } finally {
      setIsProcessing(false);
      setShowCancelDialog(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select a new date and time");
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("appointments")
        .update({
          appointment_date: format(selectedDate, "yyyy-MM-dd"),
          appointment_time: selectedTime,
          status: "confirmed"
        })
        .eq("id", appointment.id);

      if (error) throw error;

      toast.success("Appointment rescheduled successfully");
      onUpdate();
    } catch (error) {
      console.error("Failed to reschedule appointment:", error);
      toast.error("Failed to reschedule appointment");
    } finally {
      setIsProcessing(false);
      setShowRescheduleDialog(false);
      setSelectedDate(undefined);
      setSelectedTime("");
    }
  };

  if (!canModify) {
    return null;
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowRescheduleDialog(true)}
          className="text-module-hospital hover:text-module-hospital"
        >
          <CalendarClock className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCancelDialog(true)}
          className="text-destructive hover:text-destructive"
        >
          <XCircle className="w-4 h-4" />
        </Button>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your appointment with{" "}
              <strong>{appointment.doctor_name}</strong> at{" "}
              <strong>{appointment.hospital_name}</strong> on{" "}
              <strong>{format(new Date(appointment.appointment_date), "MMMM d, yyyy")}</strong> at{" "}
              <strong>{appointment.appointment_time}</strong>?
              <br /><br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isProcessing}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Appointment"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reschedule Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Select a new date and time for your appointment with {appointment.doctor_name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-medium mb-2">Select Date</p>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => isBefore(date, startOfToday()) || isBefore(addDays(new Date(), 90), date)}
                className="rounded-md border"
              />
            </div>
            
            {selectedDate && (
              <div>
                <p className="text-sm font-medium mb-2">Select Time</p>
                <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                      className="text-xs"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRescheduleDialog(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleReschedule} disabled={isProcessing || !selectedDate || !selectedTime}>
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rescheduling...
                </>
              ) : (
                "Confirm Reschedule"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
