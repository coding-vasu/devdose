import { Home, Bookmark, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: 'feed' | 'saved' | 'profile';
  onTabChange: (tab: 'feed' | 'saved' | 'profile') => void;
  savedCount?: number;
}

export function BottomNav({ activeTab, onTabChange, savedCount = 0 }: BottomNavProps) {
  const tabs = [
    { id: 'feed' as const, icon: Home, label: 'Feed' },
    { id: 'saved' as const, icon: Bookmark, label: 'Saved' },
    { id: 'profile' as const, icon: User, label: 'Profile' },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 pb-8 px-4 pointer-events-none"
    >
      {/* Compact floating pill container */}
      <div className="max-w-[240px] mx-auto pointer-events-auto">
        <div className="relative rounded-full bg-card/90 backdrop-blur-2xl border border-border/50 shadow-2xl overflow-hidden glass-enhanced">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-accent/3 pointer-events-none" />

          <div className="relative flex items-center justify-around px-3 py-3">
            {tabs.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                aria-label={id === 'saved' && savedCount > 0 ? `${label} (${savedCount} items)` : label}
                aria-current={activeTab === id ? 'page' : undefined}
                className={cn(
                  "relative p-3 rounded-full transition-all duration-300 transition-bounce",
                  "hover:bg-foreground/5 active:scale-95",
                  activeTab === id
                    ? "text-foreground bg-foreground/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Top bar indicator for active item */}
                {activeTab === id && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-primary rounded-full animate-scale-in" />
                )}

                <Icon className={cn(
                  "w-5 h-5 transition-all duration-300",
                  activeTab === id && "scale-110"
                )} />

                {/* Saved count badge */}
                {id === 'saved' && savedCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] flex items-center justify-center text-[9px] font-bold bg-primary text-primary-foreground rounded-full px-1 shadow-lg">
                    {savedCount > 99 ? '99+' : savedCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
