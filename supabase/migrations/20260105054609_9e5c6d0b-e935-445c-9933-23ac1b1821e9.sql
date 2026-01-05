-- Create wallets table for user wallet balance management
CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  referral_coins INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own wallet"
ON public.wallets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet"
ON public.wallets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet"
ON public.wallets
FOR UPDATE
USING (auth.uid() = user_id);

-- Create wallet_transactions table for tracking all transactions
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount INTEGER NOT NULL,
  description TEXT,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own transactions"
ON public.wallet_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
ON public.wallet_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Trigger to update wallet balance on transaction completion
CREATE OR REPLACE FUNCTION public.update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    IF NEW.type = 'credit' THEN
      UPDATE public.wallets 
      SET balance = balance + NEW.amount,
          total_earned = total_earned + NEW.amount,
          updated_at = now()
      WHERE id = NEW.wallet_id;
    ELSIF NEW.type = 'debit' THEN
      UPDATE public.wallets 
      SET balance = balance - NEW.amount,
          updated_at = now()
      WHERE id = NEW.wallet_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_wallet_transaction_update
  AFTER UPDATE ON public.wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_wallet_balance();

-- Also handle insert with completed status
CREATE OR REPLACE FUNCTION public.handle_wallet_transaction_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    IF NEW.type = 'credit' THEN
      UPDATE public.wallets 
      SET balance = balance + NEW.amount,
          total_earned = total_earned + NEW.amount,
          updated_at = now()
      WHERE id = NEW.wallet_id;
    ELSIF NEW.type = 'debit' THEN
      UPDATE public.wallets 
      SET balance = balance - NEW.amount,
          updated_at = now()
      WHERE id = NEW.wallet_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_wallet_transaction_insert
  AFTER INSERT ON public.wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_wallet_transaction_insert();

-- Trigger to update updated_at
CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();