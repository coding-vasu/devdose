import { ContentCard } from '@/types/content';
import { useSavedCards } from '@/hooks/useSavedCards';
import { Heart, ExternalLink, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { ContentCardComponent } from './ContentCard';

interface SavedViewProps {
  cards: ContentCard[];
  savedCardIds: Set<string>;
  onUnsave: (id: string) => void;
}

const cardTypeColors = {
  'quick-tip': 'from-tip-primary to-tip-secondary',
  'common-mistake': 'from-mistake-wrong to-mistake-right',
  'did-you-know': 'from-didyouknow-primary to-didyouknow-secondary',
  'quick-win': 'from-quickwin-primary to-quickwin-secondary',
  'under-the-hood': 'from-underthehood-primary to-underthehood-secondary',
};

export function SavedView({ onUnsave }: { onUnsave: (id: string) => void }) {
  const { savedCards, toggleSave, savedCardIds } = useSavedCards();
  const [selectedCard, setSelectedCard] = useState<ContentCard | null>(null);

  if (savedCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
          <Heart className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">No saved cards yet</h2>
        <p className="text-muted-foreground text-sm">
          Tap the heart on any card to save it here for later reference.
        </p>
      </div>
    );
  }

  return (
    <div
      id="main-content"
      role="main"
      aria-label="Saved cards"
      className="h-full overflow-y-auto pb-24 pt-4 px-4"
    >
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2">Saved Cards</h1>
        <p className="text-muted-foreground text-sm mb-6">
          {savedCards.length} card{savedCards.length !== 1 ? 's' : ''} saved
        </p>

        <div className="grid gap-4">
          {savedCards.map((card, index) => (
            <div
              key={card.id}
              className="group relative bg-card rounded-xl border border-border/50 overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className="cursor-pointer"
                onClick={() => setSelectedCard(card)}
              >
                {/* Accent bar */}
                <div className={cn(
                  "absolute top-0 left-0 w-1 h-full bg-gradient-to-b",
                  cardTypeColors[card.type]
                )} />

              <div className="p-4 pl-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {card.type.replace('-', ' ')}
                    </span>
                    <h3 className="text-base font-semibold text-foreground mt-1 leading-tight">
                      {card.title}
                    </h3>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnsave(card.id);
                    }}
                    aria-label={`Remove ${card.title} from saved items`}
                    className="flex items-center justify-center p-2 min-w-[44px] min-h-[44px] rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100 relative z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-secondary rounded text-xs font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Source link */}
                <a
                  href={card.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  {card.sourceName}
                </a>
              </div>
            </div>
            </div>
          ))}
        </div>
      </div>

      <Drawer open={!!selectedCard} onOpenChange={(open) => !open && setSelectedCard(null)}>
        <DrawerContent className="h-[90vh]">
          <div className="mx-auto w-full max-w-md h-full overflow-hidden flex flex-col">
            <DrawerHeader className="sr-only">
              <DrawerTitle>{selectedCard?.title}</DrawerTitle>
              <DrawerDescription>Full content of the saved card</DrawerDescription>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto pt-2">
              {selectedCard && (
                <ContentCardComponent
                  card={selectedCard}
                  isSaved={savedCardIds.has(selectedCard.id)}
                  onSave={() => toggleSave(selectedCard)}
                />
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
