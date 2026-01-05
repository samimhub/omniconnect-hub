import { useState, useEffect } from 'react';
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
import { User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currentName: string;
  currentPhone: string;
  onSuccess: () => void;
}

export const EditProfileDialog = ({
  open,
  onOpenChange,
  userId,
  currentName,
  currentPhone,
  onSuccess,
}: EditProfileDialogProps) => {
  const [fullName, setFullName] = useState(currentName);
  const [phone, setPhone] = useState(currentPhone);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFullName(currentName);
    setPhone(currentPhone);
  }, [currentName, currentPhone, open]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsLoading(true);

    try {
      // Update user metadata in auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
        },
      });

      if (authError) throw authError;

      // Update or insert profile in profiles table
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: fullName.trim(),
            phone: phone.trim(),
          })
          .eq('user_id', userId);

        if (profileError) throw profileError;
      } else {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            full_name: fullName.trim(),
            phone: phone.trim(),
          });

        if (insertError) throw insertError;
      }

      toast.success('Profile updated successfully');
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your personal information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
