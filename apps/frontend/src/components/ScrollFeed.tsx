import { useRef, useState, useCallback, useEffect } from 'react';
import { ContentCard } from '@/types/content';
import { ContentCardComponent } from '@/components/ContentCard';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollFeedProps {
  cards: ContentCard[];
  savedCardIds: Set<string>;
  onSave: (id: string) => void;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onReport?: (id: string) => void;
  reportingIds?: Set<string>;
}

export function ScrollFeed({ cards, savedCardIds, onSave, onRefresh, onLoadMore, isLoadingMore, hasMore, onReport, reportingIds }: ScrollFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const touchStartY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  // Track current card index and trigger infinite scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const cardHeight = container.clientHeight;
    const newIndex = Math.round(container.scrollTop / cardHeight);

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < cards.length) {
      setCurrentIndex(newIndex);
      
      // Trigger infinite scroll when reaching the last 3 cards
      if (newIndex >= cards.length - 3 && hasMore && !isLoadingMore && onLoadMore) {
        onLoadMore();
      }
    }
  }, [currentIndex, cards.length, hasMore, isLoadingMore, onLoadMore]);

  // Pull to refresh
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop !== 0) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;

    if (diff > 0 && diff < 100) {
      setPullDistance(diff);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 60) {
      setIsRefreshing(true);
      onRefresh?.();

      // Simulate refresh delay
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 1000);
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, onRefresh]);

  // Debounced scroll handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const debouncedScroll = () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(handleScroll, 50);
    };

    container.addEventListener('scroll', debouncedScroll);
    return () => {
      container.removeEventListener('scroll', debouncedScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [handleScroll]);

  // Keyboard navigation
  useEffect(() => {
    const scrollToCard = (index: number) => {
      const container = containerRef.current;
      if (!container) return;

      const cardHeight = container.clientHeight;
      container.scrollTo({
        top: index * cardHeight,
        behavior: 'smooth'
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            scrollToCard(currentIndex - 1);
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < cards.length - 1) {
            scrollToCard(currentIndex + 1);
          }
          break;

        case 'Enter':
        case ' ':
          // Only trigger if body or main container is focused
          if (target === document.body || target.closest('#main-content')) {
            e.preventDefault();
            const currentCard = cards[currentIndex];
            if (currentCard) {
              onSave(currentCard.id);
            }
          }
          break;

        case 's':
        case 'S': {
          e.preventDefault();
          const currentCard = cards[currentIndex];
          if (currentCard) {
            onSave(currentCard.id);
          }
          break;
        }

        case '?':
          e.preventDefault();
          setShowShortcuts(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, cards, onSave]);

  return (
    <div
      id="main-content"
      role="main"
      aria-label="Content feed"
      className="relative h-full w-full overflow-hidden bg-background"
    >
      {/* Pull to refresh indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center z-10 transition-all duration-200",
          pullDistance > 0 || isRefreshing ? "opacity-100" : "opacity-0"
        )}
        style={{
          height: isRefreshing ? 60 : pullDistance,
          paddingTop: 16,
        }}
      >
        <RefreshCw
          className={cn(
            "w-6 h-6 text-primary transition-transform",
            isRefreshing && "animate-spin"
          )}
          style={{
            transform: !isRefreshing ? `rotate(${pullDistance * 3}deg)` : undefined
          }}
        />
      </div>

      {/* Scroll container */}
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-auto snap-feed hide-scrollbar"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
          transition: pullDistance === 0 ? 'transform 0.2s ease-out' : undefined,
        }}
      >
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={cn(
              "h-full w-full snap-card flex-shrink-0 transition-all duration-200",
              index === currentIndex && "ring-2 ring-primary/50 ring-inset"
            )}
            style={{ minHeight: '100%' }}
          >
            <ContentCardComponent
              card={card}
              isSaved={savedCardIds.has(card.id)}
              onSave={onSave}
              onReport={onReport}
              isReporting={reportingIds?.has(card.id)}
            />
          </div>
        ))}
        
        {/* Infinite scroll loading indicator */}
        {isLoadingMore && (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading more...</p>
            </div>
          </div>
        )}
        
        {/* End of content indicator */}
        {!hasMore && cards.length > 0 && !isLoadingMore && (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center px-4">
              <p className="text-muted-foreground mb-2">🎉 You've reached the end!</p>
              <p className="text-sm text-muted-foreground">Pull down to refresh for new content</p>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts modal */}
      <KeyboardShortcuts open={showShortcuts} onOpenChange={setShowShortcuts} />
    </div>
  );
}
