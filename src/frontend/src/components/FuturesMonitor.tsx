import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useBinanceFuturesMonitor';
import BinanceCredentialsPanel from './BinanceCredentialsPanel';
import FuturesDashboard from './FuturesDashboard';
import ProfileSetupModal from './ProfileSetupModal';
import { AlertCircle, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function FuturesMonitor() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  // Show loading state while checking authentication
  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="w-20 h-20 rounded-full bg-neon-yellow/10 border-2 border-neon-yellow/30 flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10 text-neon-yellow" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-neon-yellow">Authentication Required</h2>
            <p className="text-muted-foreground">
              Please log in with Internet Identity to access the Futures Monitor.
            </p>
          </div>
          <Alert className="border-neon-yellow/30 bg-neon-yellow/5">
            <AlertCircle className="h-4 w-4 text-neon-yellow" />
            <AlertDescription className="text-sm text-muted-foreground">
              Your Binance API credentials are stored securely in your personal canister storage.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Show profile setup modal if user doesn't have a profile
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="space-y-6">
      {showProfileSetup && <ProfileSetupModal />}
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neon-yellow">Futures Monitor</h2>
            <p className="text-sm text-muted-foreground">Monitor your Binance USD-M Perpetual Futures account</p>
          </div>
        </div>

        <BinanceCredentialsPanel />
        <FuturesDashboard />
      </div>
    </div>
  );
}
