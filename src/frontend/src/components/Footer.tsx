import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30 backdrop-blur-xl mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            © 2025. Construído com <Heart className="w-4 h-4 text-neon-pink fill-neon-pink animate-pulse" /> usando{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-cyan hover:text-neon-blue transition-colors"
            >
              caffeine.ai
            </a>
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse shadow-neon-green-sm"></span>
              Dados em Tempo Real Ativos
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
