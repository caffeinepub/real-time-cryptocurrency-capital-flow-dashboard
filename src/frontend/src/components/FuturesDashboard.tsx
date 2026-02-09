import { useState } from 'react';
import { useHasBinanceCredentials } from '../hooks/useBinanceFuturesMonitor';
import { useOpenFuturesPositions } from '../hooks/useOpenFuturesPositions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Wallet, TrendingUp, History, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OpenPositionsTable from './OpenPositionsTable';

export default function FuturesDashboard() {
  const { data: hasCredentials, isLoading: credentialsLoading } = useHasBinanceCredentials();
  const [enablePolling, setEnablePolling] = useState(true);
  
  const {
    data: positions,
    isLoading: positionsLoading,
    error: positionsError,
    refetch,
    isFetching,
  } = useOpenFuturesPositions(enablePolling);

  if (credentialsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hasCredentials) {
    return (
      <Alert className="border-neon-yellow/30 bg-neon-yellow/5">
        <AlertCircle className="h-4 w-4 text-neon-yellow" />
        <AlertDescription className="text-sm text-muted-foreground">
          Please configure your Binance API credentials above to view your account data.
        </AlertDescription>
      </Alert>
    );
  }

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neon-cyan">Account Overview</h3>
        <Button
          variant="outline"
          size="sm"
          className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
          onClick={handleRefresh}
          disabled={isFetching}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error Display */}
      {positionsError && (
        <Alert className="border-neon-red/30 bg-neon-red/5">
          <AlertCircle className="h-4 w-4 text-neon-red" />
          <AlertDescription className="text-sm text-neon-red">
            {positionsError instanceof Error ? positionsError.message : 'Failed to load positions'}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Assets/Balances Section */}
        <Card className="terminal-panel border-neon-cyan/30 bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-neon-cyan" />
              <CardTitle className="text-base text-neon-cyan">Assets & Balances</CardTitle>
            </div>
            <CardDescription className="text-xs">Your account balances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-center min-h-[120px] text-muted-foreground text-sm">
                <p>Coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Open Positions Section */}
        <Card className="terminal-panel border-neon-green/30 bg-card/50 md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-neon-green" />
              <CardTitle className="text-base text-neon-green">Open Positions</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Your active USD-M and COIN-M positions
              {enablePolling && ' • Auto-refreshing every 10s'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {positionsLoading ? (
              <div className="flex items-center justify-center min-h-[120px]">
                <div className="w-8 h-8 border-4 border-neon-green/30 border-t-neon-green rounded-full animate-spin"></div>
              </div>
            ) : positions ? (
              <OpenPositionsTable positions={positions} />
            ) : (
              <div className="flex items-center justify-center min-h-[120px] text-muted-foreground text-sm">
                <p>No data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Entries Section */}
      <Card className="terminal-panel border-neon-yellow/30 bg-card/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-neon-yellow" />
            <CardTitle className="text-base text-neon-yellow">Recent Entries</CardTitle>
          </div>
          <CardDescription className="text-xs">Your recent trades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-center min-h-[120px] text-muted-foreground text-sm">
              <p>Coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
