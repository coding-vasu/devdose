import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface KeyboardShortcutsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcuts({ open, onOpenChange }: KeyboardShortcutsProps) {
    const shortcuts = [
        { key: '↑', description: 'Previous card' },
        { key: '↓', description: 'Next card' },
        { key: 'Enter', description: 'Save/unsave current card' },
        { key: 'Space', description: 'Save/unsave current card' },
        { key: 'S', description: 'Save/unsave current card' },
        { key: '?', description: 'Show this help' },
        { key: 'Esc', description: 'Close dialogs' },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                        Keyboard Shortcuts
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 py-4">
                    {shortcuts.map(({ key, description }) => (
                        <div key={key} className="flex items-center justify-between gap-4">
                            <kbd className="px-3 py-2 bg-secondary/80 backdrop-blur-sm rounded-lg text-sm font-semibold text-foreground border border-border/40 min-w-[80px] text-center">
                                {key}
                            </kbd>
                            <span className="text-sm text-muted-foreground flex-1">
                                {description}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-border/30">
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
                    >
                        Got it!
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
