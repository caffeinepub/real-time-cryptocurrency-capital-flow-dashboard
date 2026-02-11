/**
 * Error Boundary for Order Flow Monitor
 * Catches runtime errors and displays a user-friendly fallback UI with retry action
 */

import { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class OrderFlowErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('OrderFlowMonitor error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-6 p-6">
          <Card className="terminal-panel border-neon-pink/30">
            <CardHeader>
              <CardTitle className="text-neon-pink flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Erro no Monitor de Fluxo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-neon-pink/30 bg-neon-pink/5">
                <AlertTriangle className="h-4 w-4 text-neon-pink" />
                <AlertDescription className="text-sm">
                  Ocorreu um erro ao processar os dados do monitor de fluxo de ordens.
                  Isso pode acontecer devido a dados malformados ou problemas de conexão com a API.
                </AlertDescription>
              </Alert>

              {this.state.error && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={this.handleReset}
                  className="bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30 border border-neon-cyan/50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-neon-yellow/30 text-neon-yellow hover:bg-neon-yellow/10"
                >
                  Recarregar Página
                </Button>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  <strong>Dicas de solução:</strong>
                </p>
                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1 mt-2">
                  <li>Verifique sua conexão com a internet</li>
                  <li>Tente alternar entre os mercados Spot e Futuros</li>
                  <li>Limpe o cache do navegador e recarregue a página</li>
                  <li>Se o problema persistir, aguarde alguns minutos e tente novamente</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
