/**
 * localStorage utility functions for DevDose
 * Handles saved cards persistence with error handling
 */

const SAVED_CARDS_KEY = 'devscroll_saved_cards';

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get saved card IDs from localStorage
 */
export function getSavedCards(): string[] {
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage is not available');
        return [];
    }

    try {
        const saved = localStorage.getItem(SAVED_CARDS_KEY);
        if (!saved) return [];

        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Error reading saved cards from localStorage:', error);
        return [];
    }
}

/**
 * Save card IDs to localStorage
 */
export function setSavedCards(ids: string[]): void {
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage is not available');
        return;
    }

    try {
        localStorage.setItem(SAVED_CARDS_KEY, JSON.stringify(ids));
    } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            console.error('localStorage quota exceeded');
            // Optionally notify user
        } else {
            console.error('Error saving cards to localStorage:', error);
        }
    }
}

/**
 * Add a card ID to saved cards
 */
export function addSavedCard(id: string): void {
    const saved = getSavedCards();
    if (!saved.includes(id)) {
        setSavedCards([...saved, id]);
    }
}

/**
 * Remove a card ID from saved cards
 */
export function removeSavedCard(id: string): void {
    const saved = getSavedCards();
    setSavedCards(saved.filter(cardId => cardId !== id));
}

/**
 * Clear all saved cards
 */
export function clearSavedCards(): void {
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage is not available');
        return;
    }

    try {
        localStorage.removeItem(SAVED_CARDS_KEY);
    } catch (error) {
        console.error('Error clearing saved cards:', error);
    }
}

/**
 * Toggle a card's saved status
 */
export function toggleSavedCard(id: string): boolean {
    const saved = getSavedCards();
    const isSaved = saved.includes(id);

    if (isSaved) {
        removeSavedCard(id);
    } else {
        addSavedCard(id);
    }

    return !isSaved;
}
