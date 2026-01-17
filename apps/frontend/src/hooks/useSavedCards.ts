import { useState, useCallback, useEffect, useMemo } from 'react';
import { getSavedCards, setSavedCards as saveToLocalStorage } from '@/lib/localStorage';
import { useToast } from '@/hooks/use-toast';
import { ContentCard } from '@/types/content';

export function useSavedCards() {
  const { toast } = useToast();

  // Initialize from localStorage
  const [savedCards, setSavedCards] = useState<ContentCard[]>(() => {
    const saved = getSavedCards();
    return Array.isArray(saved) && saved.length > 0 && typeof saved[0] !== 'string' 
      ? (saved as unknown as ContentCard[]) 
      : [];
  });

  // Sync to localStorage whenever savedCards changes
  useEffect(() => {
    saveToLocalStorage(savedCards as ContentCard[]);
  }, [savedCards]);

  const savedCardIds = useMemo(() => new Set(savedCards.map(c => c.id)), [savedCards]);

  const toggleSave = useCallback((cardOrId: ContentCard | string) => {
    setSavedCards(prev => {
      const id = typeof cardOrId === 'string' ? cardOrId : cardOrId.id;
      const isCurrentlySaved = prev.some(c => c.id === id);
      
      if (isCurrentlySaved) {
        toast({
          title: "Card removed",
          description: "Card removed from saved items",
        });
        return prev.filter(c => c.id !== id);
      } else if (typeof cardOrId !== 'string') {
        toast({
          title: "Card saved",
          description: "Card added to your saved collection",
        });
        return [...prev, cardOrId];
      }
      return prev;
    });
  }, [toast]);

  const isSaved = useCallback((id: string) => {
    return savedCardIds.has(id);
  }, [savedCardIds]);

  const clearAll = useCallback(() => {
    setSavedCards([]);
    toast({
      title: "All cards cleared",
      description: "Your saved collection has been cleared",
    });
  }, [toast]);

  return {
    savedCards,
    savedCardIds,
    toggleSave,
    isSaved,
    savedCount: savedCards.length,
    clearAll,
  };
}
