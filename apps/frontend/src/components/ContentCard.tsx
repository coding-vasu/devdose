import { ContentCard, CardType } from '@/types/content';
import { Heart, ExternalLink, Zap, AlertCircle, Lightbulb, Rocket, Wrench, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CodeBlock } from '@/components/CodeBlock';

interface CardContentProps {
  card: ContentCard;
  isSaved: boolean;
  onSave: (id: string) => void;
  onReport?: (id: string) => void;
  isReporting?: boolean;
}

const cardTypeConfig: Record<CardType, {
  icon: React.ReactNode;
  label: string;
  badgeClass: string;
  glowClass: string;
  accentColor: string;
}> = {
  'quick-tip': {
    icon: <Zap className="w-4 h-4" />,
    label: 'Quick Tip',
    badgeClass: 'badge-tip',
    glowClass: 'glow-tip',
    accentColor: 'from-tip-primary to-tip-secondary',
  },
  'common-mistake': {
    icon: <AlertCircle className="w-4 h-4" />,
    label: 'Common Mistake',
    badgeClass: 'badge-mistake',
    glowClass: 'glow-mistake',
    accentColor: 'from-mistake-wrong to-mistake-right',
  },
  'did-you-know': {
    icon: <Lightbulb className="w-4 h-4" />,
    label: 'Did You Know?',
    badgeClass: 'badge-didyouknow',
    glowClass: 'glow-didyouknow',
    accentColor: 'from-didyouknow-primary to-didyouknow-secondary',
  },
  'quick-win': {
    icon: <Rocket className="w-4 h-4" />,
    label: 'Quick Win',
    badgeClass: 'badge-quickwin',
    glowClass: 'glow-quickwin',
    accentColor: 'from-quickwin-primary to-quickwin-secondary',
  },
  'under-the-hood': {
    icon: <Wrench className="w-4 h-4" />,
    label: 'Under the Hood',
    badgeClass: 'badge-underthehood',
    glowClass: 'glow-underthehood',
    accentColor: 'from-underthehood-primary to-underthehood-secondary',
  },
};

const difficultyColors = {
  beginner: 'bg-quickwin-primary/20 text-quickwin-primary border-quickwin-primary/30',
  intermediate: 'bg-tip-primary/20 text-tip-primary border-tip-primary/30',
  advanced: 'bg-didyouknow-primary/20 text-didyouknow-primary border-didyouknow-primary/30',
};

export function ContentCardComponent({ card, isSaved, onSave, onReport, isReporting }: CardContentProps) {
  const config = cardTypeConfig[card.type];

  return (
    <div className="h-full w-full flex flex-col animate-fade-in bg-background">
      {/* Card Container - Full Screen */}
      <div
        role="article"
        aria-label={`${config.label}: ${card.title}`}
        className="flex-1 flex flex-col overflow-y-auto hide-scrollbar relative"
      >
        {/* Animated Gradient Orbs Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={cn(
            "absolute top-20 -left-20 w-72 h-72 rounded-full blur-3xl opacity-20 animate-float",
            config.accentColor
          )} />
          <div className={cn(
            "absolute bottom-40 -right-20 w-96 h-96 rounded-full blur-3xl opacity-15 animate-float-delayed",
            config.accentColor
          )} />
        </div>

        {/* Header - Badges, Difficulty, Stats - Glassmorphism */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 pt-6 pb-4 bg-background/60 backdrop-blur-xl border-b border-border/20">
          <div className="flex items-center gap-3">
            {/* Card Type Badge */}
            <span className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white",
              config.badgeClass
            )}>
              {config.icon}
              {config.label}
            </span>

            {/* Difficulty Badge - Enhanced with Gradient */}
            <span className={cn(
              "px-4 py-2 rounded-full text-xs font-bold capitalize border-2",
              "bg-gradient-to-r shadow-md",
              card.difficulty === 'beginner' && "from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/40",
              card.difficulty === 'intermediate' && "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/40",
              card.difficulty === 'advanced' && "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/40"
            )}>
              {card.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSave(card.id)}
              className={cn(
                "p-2 rounded-full transition-all duration-300 group/save",
                "bg-background/40 hover:bg-tip-primary/20 border border-border/20 hover:border-tip-primary/40",
                isSaved && "bg-tip-primary/10 border-tip-primary/30"
              )}
              title={isSaved ? "Unsave Card" : "Save Card"}
            >
              <Heart 
                className={cn(
                  "w-5 h-5 transition-all duration-300",
                  isSaved ? "text-tip-primary animate-heart-pop" : "text-muted-foreground group-hover/save:text-tip-primary"
                )} 
                fill={isSaved ? "currentColor" : "none"}
              />
            </button>

            <button
              onClick={() => onReport?.(card.id)}
              disabled={isReporting}
              className={cn(
                "p-2 rounded-full transition-all duration-300 group/report",
                "bg-background/40 hover:bg-mistake-wrong/20 border border-border/20 hover:border-mistake-wrong/40",
                isReporting && "animate-pulse cursor-not-allowed opacity-70"
              )}
              title="Report Incorrect Content"
            >
              <AlertTriangle className={cn(
                "w-5 h-5 transition-colors duration-300",
                isReporting ? "text-mistake-wrong animate-spin" : "text-muted-foreground group-hover/report:text-mistake-wrong"
              )} />
            </button>
          </div>
        </div>

        {/* Title - Gradient Text with Better Spacing */}
        <h2 className="px-6 text-3xl font-bold mb-8 leading-tight tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
          {card.title}
        </h2>

        {/* Code Snippet - Enhanced with Multi-Layered Glow */}
        {card.codeSnippet && (
          <div className="px-6 mb-6 relative z-10">
            <div className="relative group">
              {/* Triple-layered glow effect */}
              {/* Outer halo - largest, softest */}
              <div className={cn(
                "absolute -inset-4 rounded-3xl blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700",
                config.accentColor
              )} />
              {/* Mid glow - medium size */}
              <div className={cn(
                "absolute -inset-2 rounded-2xl blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-500",
                config.accentColor
              )} />
              {/* Inner glow - tightest, strongest */}
              <div className={cn(
                "absolute -inset-1 rounded-xl blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-300",
                config.accentColor
              )} />

              {/* Code block with shadow */}
              <div className="relative shadow-2xl">
                <CodeBlock code={card.codeSnippet} language={card.language || 'javascript'} />
              </div>
            </div>
          </div>
        )}

        {/* Explanation with Lightbulb Emoji */}
        <div className="px-6 mb-6 relative z-10">
          <div className="flex gap-4 p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
            {/* Lightbulb Emoji with floating animation */}
            <div className="flex-shrink-0 text-2xl animate-float-gentle">
              💡
            </div>

            {/* Explanation Text */}
            <p className="text-muted-foreground text-base leading-relaxed flex-1">
              {card.explanation}
            </p>
          </div>
        </div>

        {/* Tags and Source - Enhanced with Hover States */}
        <div className="px-6 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            {card.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-2 bg-primary/10 backdrop-blur-sm rounded-xl text-xs font-semibold text-primary border border-primary/30 hover:border-primary/50 hover:bg-primary/15 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-200 cursor-default transition-bounce"
              >
                #{tag}
              </span>
            ))}

            {/* Source Link - Inline with tags */}
            <a
              href={card.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Read more about ${card.title} on ${card.sourceName}`}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors rounded-xl hover:bg-primary/10 border border-transparent hover:border-primary/30"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{card.sourceName}</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
