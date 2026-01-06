import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Banknote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WithdrawMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletId: string;
  userId: string;
  balance: number;
  onSuccess: () => void;
}

export const WithdrawMoneyDialog = ({
  open,
  onOpenChange,
  walletId,
  userId,
  balance,
  onSuccess,
}: WithdrawMoneyDialogProps) => {
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const withdrawAmount = parseInt(amount);
    if (isNaN(withdrawAmount) || withdrawAmount < 100) {
      toast.error("Minimum withdrawal amount is ₹100");
      return;
    }

    if (withdrawAmount > balance) {
      toast.error("Insufficient balance");
      return;
    }

    if (!bankName.trim() || !accountNumber.trim() || !ifscCode.trim() || !accountHolderName.trim()) {
      toast.error("Please fill all bank details");
      return;
    }

    // Validate IFSC code format
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) {
      toast.error("Invalid IFSC code format");
      return;
    }

    setIsLoading(true);

    try {
      // Create withdrawal request
      const { error } = await supabase.from("withdrawal_requests").insert({
        user_id: userId,
        wallet_id: walletId,
        amount: withdrawAmount,
        bank_name: bankName.trim(),
        account_number: accountNumber.trim(),
        ifsc_code: ifscCode.toUpperCase().trim(),
        account_holder_name: accountHolderName.trim(),
      });

      if (error) throw error;

      // Create a pending debit transaction
      await supabase.from("wallet_transactions").insert({
        user_id: userId,
        wallet_id: walletId,
        type: "debit",
        amount: withdrawAmount,
        description: "Withdrawal request - pending approval",
        status: "pending",
      });

      toast.success("Withdrawal request submitted! It will be processed within 24-48 hours.");
      onOpenChange(false);
      resetForm();
      onSuccess();
    } catch (err) {
      console.error("Withdrawal error:", err);
      toast.error("Failed to submit withdrawal request");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setBankName("");
    setAccountNumber("");
    setIfscCode("");
    setAccountHolderName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" />
            Withdraw Money
          </DialogTitle>
          <DialogDescription>
            Available balance: ₹{balance.toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount (min ₹100)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={100}
              max={balance}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountHolderName">Account Holder Name</Label>
            <Input
              id="accountHolderName"
              type="text"
              placeholder="As per bank records"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              type="text"
              placeholder="e.g., State Bank of India"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              type="text"
              placeholder="Enter account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ifscCode">IFSC Code</Label>
            <Input
              id="ifscCode"
              type="text"
              placeholder="e.g., SBIN0001234"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
              maxLength={11}
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
