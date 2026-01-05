import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Plus, Minus } from 'lucide-react';
import { useRazorpay } from '@/hooks/useRazorpay';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletId: string | null;
  userId: string;
  userEmail?: string;
  userName?: string;
  onSuccess: () => void;
}

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

export const AddMoneyDialog = ({
  open,
  onOpenChange,
  walletId,
  userId,
  userEmail,
  userName,
  onSuccess,
}: AddMoneyDialogProps) => {
  const [amount, setAmount] = useState<number>(500);
  const { initiatePayment, isLoading } = useRazorpay();

  const handleAmountChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      setAmount(num);
    } else if (value === '') {
      setAmount(0);
    }
  };

  const handleAddMoney = async () => {
    if (amount < 10) {
      toast.error('Minimum amount is ₹10');
      return;
    }

    if (!walletId) {
      toast.error('Wallet not found. Please refresh the page.');
      return;
    }

    initiatePayment({
      amount,
      name: 'Wallet Top-up',
      description: `Add ₹${amount} to wallet`,
      prefill: {
        email: userEmail,
        name: userName,
      },
      notes: {
        type: 'wallet_topup',
        wallet_id: walletId,
        user_id: userId,
      },
      onSuccess: async (response) => {
        try {
          // Insert completed transaction
          const { error } = await supabase.from('wallet_transactions').insert({
            user_id: userId,
            wallet_id: walletId,
            type: 'credit',
            amount: amount,
            description: 'Wallet top-up via Razorpay',
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            status: 'completed',
          });

          if (error) throw error;

          toast.success(`₹${amount} added to wallet successfully!`);
          onSuccess();
          onOpenChange(false);
          setAmount(500);
        } catch (err) {
          console.error('Failed to record transaction:', err);
          toast.error('Payment successful but failed to update wallet. Please contact support.');
        }
      },
      onError: (error) => {
        toast.error(error.message || 'Payment failed');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Add Money to Wallet
          </DialogTitle>
          <DialogDescription>
            Top-up your wallet balance using Razorpay
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Enter Amount (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
              <Input
                id="amount"
                type="number"
                min={10}
                value={amount || ''}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="pl-8 text-xl font-bold"
                placeholder="0"
              />
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <Label>Quick Select</Label>
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant={amount === quickAmount ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAmount(quickAmount)}
                  className="flex-1 min-w-[60px]"
                >
                  ₹{quickAmount}
                </Button>
              ))}
            </div>
          </div>

          {/* Increment/Decrement */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setAmount(Math.max(10, amount - 100))}
              disabled={amount <= 10}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-2xl font-bold text-primary min-w-[120px] text-center">
              ₹{amount.toLocaleString()}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setAmount(amount + 100)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMoney}
              disabled={isLoading || amount < 10}
              className="flex-1"
            >
              {isLoading ? 'Processing...' : `Pay ₹${amount}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
