import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ScrollFeed } from '@/components/ScrollFeed';
import { SavedView } from '@/components/SavedView';
import { ProfileView } from '@/components/ProfileView';
import { useSavedCards } from '@/hooks/useSavedCards';
import { useInfiniteContent, queryKeys } from '@/hooks/useContent';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'saved' | 'profile'>('feed');
  const { savedCardIds, toggleSave, savedCount, clearAll } = useSavedCards();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reportingIds, setReportingIds] = useState<Set<string>>(new Set());
  
  // Fetch posts with infinite scroll
  const { 
    data, 
    isLoading, 
    error, 
    fetchNextPage, 
    hasNextPage,
    isFetchingNextPage,
    refetch 
  } = useInfiniteContent({ limit: 10, sort: 'created_at', order: 'desc' });

  // Flatten all pages into a single array of cards
  const cards = data?.pages.flatMap(page => page.cards) || [];

  const handleRefresh = () => {
    refetch();
  };

  const handleReport = async (id: string) => {
    if (reportingIds.has(id)) return;

    setReportingIds(prev => new Set(prev).add(id));
    
    try {
      const result = await apiClient.reportPost(id);
      
      toast({
        title: result.corrected ? "Post Corrected ✨" : "Verification Complete ✅",
        description: result.message,
      });

      // Update the specific post in the query cache if it was corrected
      if (result.corrected) {
        queryClient.invalidateQueries({ queryKey: queryKeys.posts() });
      }
    } catch (error) {
      toast({
        title: "Report Failed",
        description: error instanceof Error ? error.message : "Failed to verify post",
        variant: "destructive",
      });
    } finally {
      setReportingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      <Header />

      {/* Main content area */}
      <main className="flex-1 pt-14 pb-24 overflow-hidden relative z-0">
        {activeTab === 'feed' && (
          <>
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading amazing content...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md px-4">
                  <p className="text-destructive mb-4">Failed to load content</p>
                  <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {!isLoading && !error && cards.length > 0 && (
              <ScrollFeed
                cards={cards}
                savedCardIds={savedCardIds}
                onSave={(id) => {
                  const card = cards.find(c => c.id === id);
                  if (card) toggleSave(card);
                }}
                onRefresh={handleRefresh}
                onLoadMore={fetchNextPage}
                isLoadingMore={isFetchingNextPage}
                hasMore={hasNextPage}
                onReport={handleReport}
                reportingIds={reportingIds}
              />
            )}

            {!isLoading && !error && cards.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No content available</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'saved' && (
          <SavedView
            onUnsave={toggleSave}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView savedCount={savedCount} onClearAll={clearAll} />
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        savedCount={savedCount}
      />
    </div>
  );
};

export default Index;
