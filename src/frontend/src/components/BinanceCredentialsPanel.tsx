import { useState } from 'react';
import { useHasBinanceCredentials, useAddOrUpdateBinanceCredentials, useRemoveBinanceCredentials, useTestBinanceConnection } from '../hooks/useBinanceFuturesMonitor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Key, Trash2, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function BinanceCredentialsPanel() {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  const { data: hasCredentials, isLoading: checkingCredentials } = useHasBinanceCredentials();
  const addOrUpdateMutation = useAddOrUpdateBinanceCredentials();
  const removeMutation = useRemoveBinanceCredentials();
  const testMutation = useTestBinanceConnection();

  const handleSave = async () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      toast.error('Please enter both API Key and API Secret');
      return;
    }

    try {
      await addOrUpdateMutation.mutateAsync({ apiKey: apiKey.trim(), apiSecret: apiSecret.trim() });
      toast.success('Credentials saved successfully');
      setApiKey('');
      setApiSecret('');
      setShowSecret(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save credentials');
    }
  };

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove your Binance credentials?')) {
      return;
    }

    try {
      await removeMutation.mutateAsync();
      toast.success('Credentials removed successfully');
      setApiKey('');
      setApiSecret('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove credentials');
    }
  };

  const handleTest = async () => {
    try {
      await testMutation.mutateAsync();
      toast.success('Connection successful');
    } catch (error: any) {
      const message = error.message || 'Connection failed';
      toast.error(message.includes('No Binance credentials') ? 'Please save your credentials first' : 'Connection failed - please check your credentials');
    }
  };

  const isLoading = addOrUpdateMutation.isPending || removeMutation.isPending || testMutation.isPending;

  return (
    <Card className="terminal-panel border-neon-yellow/30 bg-card/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-neon-yellow" />
            <CardTitle className="text-neon-yellow">Binance API Credentials</CardTitle>
          </div>
          {!checkingCredentials && hasCredentials && (
            <div className="flex items-center gap-2 text-xs text-neon-green">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configured</span>
            </div>
          )}
        </div>
        <CardDescription>
          Configure your Binance Futures API credentials to monitor your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-neon-yellow/30 bg-neon-yellow/5">
          <Shield className="h-4 w-4 text-neon-yellow" />
          <AlertDescription className="text-xs text-muted-foreground">
            <strong className="text-neon-yellow">Security Notice:</strong> Use read-only API keys when possible. 
            Your credentials are stored securely in your personal canister storage and never exposed in logs or network requests.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-sm font-medium">API Key</Label>
            <Input
              id="apiKey"
              type="text"
              placeholder="Enter your Binance API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isLoading}
              className="terminal-input font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiSecret" className="text-sm font-medium">API Secret</Label>
            <Input
              id="apiSecret"
              type={showSecret ? 'text' : 'password'}
              placeholder="Enter your Binance API Secret"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              disabled={isLoading}
              className="terminal-input font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showSecret ? 'Hide' : 'Show'} secret
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            onClick={handleSave}
            disabled={isLoading || !apiKey.trim() || !apiSecret.trim()}
            className="bg-neon-yellow/20 text-neon-yellow hover:bg-neon-yellow/30 border border-neon-yellow/50"
          >
            {addOrUpdateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Key className="w-4 h-4 mr-2" />
                Save Credentials
              </>
            )}
          </Button>

          <Button
            onClick={handleTest}
            disabled={isLoading || !hasCredentials}
            variant="outline"
            className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
          >
            {testMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>

          {hasCredentials && (
            <Button
              onClick={handleRemove}
              disabled={isLoading}
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              {removeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </>
              )}
            </Button>
          )}
        </div>

        {testMutation.isSuccess && (
          <Alert className="border-neon-green/30 bg-neon-green/5">
            <CheckCircle2 className="h-4 w-4 text-neon-green" />
            <AlertDescription className="text-sm text-neon-green">
              Connection successful! Your credentials are working correctly.
            </AlertDescription>
          </Alert>
        )}

        {testMutation.isError && (
          <Alert className="border-destructive/30 bg-destructive/5">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-sm text-destructive">
              Connection failed. Please verify your credentials and API permissions.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
