import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useBinanceFuturesMonitor';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const saveMutation = useSaveCallerUserProfile();

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      await saveMutation.mutateAsync({
        name: name.trim(),
        email: email.trim() || undefined,
        preferences: undefined,
      });
      toast.success('Profile created successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create profile');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md border-neon-cyan/30 bg-card">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
              <User className="w-5 h-5 text-neon-cyan" />
            </div>
            <DialogTitle className="text-neon-cyan">Welcome!</DialogTitle>
          </div>
          <DialogDescription>
            Please set up your profile to continue. This is a one-time setup.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saveMutation.isPending}
              className="terminal-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={saveMutation.isPending}
              className="terminal-input"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending || !name.trim()}
            className="w-full bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30 border border-neon-cyan/50"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Profile...
              </>
            ) : (
              'Create Profile'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
