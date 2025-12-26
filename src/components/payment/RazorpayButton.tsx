import { Button } from '@/components/ui/button';
import { useRazorpay } from '@/hooks/useRazorpay';
import { CreditCard, Loader2 } from 'lucide-react';

interface RazorpayButtonProps {
  amount: number;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  onSuccess?: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onError?: (error: Error) => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  children?: React.ReactNode;
}

export const RazorpayButton = ({
  amount,
  name,
  description,
  prefill,
  notes,
  onSuccess,
  onError,
  className,
  variant = 'default',
  children,
}: RazorpayButtonProps) => {
  const { initiatePayment, isLoading } = useRazorpay();

  const handleClick = () => {
    initiatePayment({
      amount,
      name,
      description,
      prefill,
      notes,
      onSuccess,
      onError,
    });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className={className}
      variant={variant}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          {children || `Pay ₹${amount}`}
        </>
      )}
    </Button>
  );
};
