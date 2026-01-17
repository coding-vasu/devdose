import { Code2 } from 'lucide-react';

export function Header() {
  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Skip to main content
      </a>

      <header
        role="banner"
        className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-2xl border-b border-border/30 shadow-lg"
      >
        <div className="flex items-center justify-center h-14 px-4 max-w-md mx-auto">
          <div className="flex items-center gap-2" aria-label="DevDose">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">DevDose</span>
          </div>
        </div>
      </header>
    </>
  );
}
