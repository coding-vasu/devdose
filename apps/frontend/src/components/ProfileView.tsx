import { Eye, Heart, ExternalLink, Flame, Code2, FileCode, GitBranch, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserStats } from '@/types/content';

interface ProfileViewProps {
  savedCount: number;
  onClearAll?: () => void;
}

export function ProfileView({ savedCount, onClearAll }: ProfileViewProps) {
  // Mock stats for prototype
  const stats: UserStats = {
    cardsViewed: 127,
    cardsSaved: savedCount,
    deepDives: 23,
    streakDays: 5,
    topTags: ['JavaScript', 'React', 'CSS'],
  };

  const interests = [
    { id: 'javascript', label: 'JavaScript', icon: FileCode, active: true },
    { id: 'react', label: 'React', icon: Code2, active: true },
    { id: 'css', label: 'CSS', icon: Palette, active: true },
    { id: 'git', label: 'Git', icon: GitBranch, active: false },
  ];

  return (
    <div className="h-full overflow-y-auto pb-24 pt-4 px-4">
      <div className="max-w-md mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">D</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Developer</h1>
          <p className="text-muted-foreground text-sm mt-1">Learning one scroll at a time</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-tip-primary/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-tip-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.cardsViewed}</p>
                <p className="text-xs text-muted-foreground">Cards viewed</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.cardsSaved}</p>
                <p className="text-xs text-muted-foreground">Cards saved</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-didyouknow-primary/20 flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-didyouknow-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.deepDives}</p>
                <p className="text-xs text-muted-foreground">Deep dives</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-underthehood-primary/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-underthehood-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.streakDays}</p>
                <p className="text-xs text-muted-foreground">Day streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Topics */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Top Topics</h2>
          <div className="flex flex-wrap gap-2">
            {stats.topTags.map((tag, index) => (
              <span
                key={tag}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium",
                  index === 0 && "bg-gradient-to-r from-primary to-accent text-white",
                  index === 1 && "bg-secondary text-foreground",
                  index === 2 && "bg-secondary text-muted-foreground",
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Interests</h2>
          <div className="grid grid-cols-2 gap-3">
            {interests.map(({ id, label, icon: Icon, active }) => (
              <button
                key={id}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border transition-all",
                  active
                    ? "bg-primary/10 border-primary/50 text-foreground"
                    : "bg-card border-border/50 text-muted-foreground hover:border-border"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Tap to toggle interests (visual prototype)
          </p>
        </div>

        {/* Clear saved cards */}
        {savedCount > 0 && onClearAll && (
          <div className="mb-8">
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to clear all ${savedCount} saved cards? This action cannot be undone.`)) {
                  onClearAll();
                }
              }}
              className="w-full px-4 py-3 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl font-medium transition-colors"
              aria-label="Clear all saved cards"
            >
              Clear All Saved Cards ({savedCount})
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pb-8">
          <p className="text-xs text-muted-foreground">
            DevDose v1.0 Prototype
          </p>
        </div>
      </div>
    </div>
  );
}
