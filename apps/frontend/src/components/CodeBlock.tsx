import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Copy, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CodeBlockProps {
    code: string;
    language?: string;
    showLineNumbers?: boolean;
    variant?: 'correct' | 'incorrect' | 'neutral';
}


// Language display mapping
const languageLabels: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    jsx: 'React',
    tsx: 'React',
    css: 'CSS',
    html: 'HTML',
    bash: 'Terminal',
    json: 'JSON',
};

// Custom syntax highlighting theme - Enhanced Premium Dark
const customTheme = {
    'code[class*="language-"]': {
        color: '#F0F6FC',
        background: 'transparent',
        fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', monospace",
        fontSize: '0.875rem',
        textAlign: 'left',
        whiteSpace: 'pre',
        wordSpacing: 'normal',
        wordBreak: 'normal',
        wordWrap: 'normal',
        lineHeight: '1.7',
        tabSize: 4,
        hyphens: 'none',
    },
    'pre[class*="language-"]': {
        color: '#F0F6FC',
        background: 'transparent',
        fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', monospace",
        fontSize: '0.875rem',
        textAlign: 'left',
        whiteSpace: 'pre',
        wordSpacing: 'normal',
        wordBreak: 'normal',
        wordWrap: 'normal',
        lineHeight: '1.7',
        tabSize: 4,
        hyphens: 'none',
        padding: '1.5rem',
        margin: 0,
        overflow: 'auto',
    },
    'comment': { color: '#7C8B9F', fontStyle: 'italic', opacity: 0.9 },
    'prolog': { color: '#7C8B9F' },
    'doctype': { color: '#7C8B9F' },
    'cdata': { color: '#7C8B9F' },
    'punctuation': { color: '#B4BCC8' },
    'property': { color: '#79C0FF', fontWeight: 500 },
    'tag': { color: '#FF7B72', fontWeight: 500 },
    'boolean': { color: '#D2A8FF' },
    'number': { color: '#FFA657' },
    'constant': { color: '#D2A8FF' },
    'symbol': { color: '#D2A8FF' },
    'deleted': { color: '#FF7B72', background: 'rgba(255, 123, 114, 0.1)' },
    'selector': { color: '#7EE787', fontWeight: 500 },
    'attr-name': { color: '#79C0FF' },
    'string': { color: '#A5D6FF' },
    'char': { color: '#A5D6FF' },
    'builtin': { color: '#FFA657' },
    'inserted': { color: '#7EE787', background: 'rgba(126, 231, 135, 0.1)' },
    'operator': { color: '#FF7B72' },
    'entity': { color: '#FFA657', cursor: 'help' },
    'url': { color: '#A5D6FF', textDecoration: 'underline' },
    'variable': { color: '#FFA657' },
    'atrule': { color: '#D2A8FF' },
    'attr-value': { color: '#A5D6FF' },
    'function': { color: '#D2A8FF', fontWeight: 500 },
    'class-name': { color: '#FFA657', fontWeight: 500 },
    'keyword': { color: '#FF7B72', fontWeight: 500 },
    'regex': { color: '#7EE787' },
    'important': { color: '#FFA657', fontWeight: 'bold' },
    'bold': { fontWeight: 'bold' },
    'italic': { fontStyle: 'italic' },
};

export function CodeBlock({ code, language = 'javascript', showLineNumbers = true, variant = 'neutral' }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            toast({
                title: "Copied to clipboard",
                description: "Code snippet copied successfully",
            });

            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
            toast({
                title: "Copy failed",
                description: "Failed to copy code to clipboard",
                variant: "destructive",
            });
        }
    };

    const borderColor = variant === 'correct' ? 'border-l-green-500' : variant === 'incorrect' ? 'border-l-red-500' : '';
    const iconColor = variant === 'correct' ? 'text-green-500' : variant === 'incorrect' ? 'text-red-500' : '';

    return (
        <div className="relative group">
            {/* Animated gradient border container */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500 animate-gradient-x" />

            {/* Mac-style window container */}
            <div className="relative rounded-xl overflow-hidden border border-border/50 bg-gradient-to-b from-card/80 to-card/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)] transition-all duration-500 hover:-translate-y-1">
                {/* Window header with enhanced glassmorphism */}
                <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-secondary/60 via-secondary/50 to-secondary/60 backdrop-blur-xl border-b border-border/40 relative overflow-hidden">
                    {/* Subtle shimmer effect on header */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                    {/* Left section: Traffic lights and language badge */}
                    <div className="flex items-center gap-3 relative z-10">
                        {/* Traffic light controls with enhanced glow */}
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-[0_0_8px_rgba(239,68,68,0.4)] hover:shadow-[0_0_16px_rgba(239,68,68,0.8)] transition-all duration-300 cursor-pointer hover:scale-125 active:scale-110"
                                aria-label="Close"
                            />
                            <div
                                className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-[0_0_8px_rgba(234,179,8,0.4)] hover:shadow-[0_0_16px_rgba(234,179,8,0.8)] transition-all duration-300 cursor-pointer hover:scale-125 active:scale-110"
                                aria-label="Minimize"
                            />
                            <div
                                className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-[0_0_8px_rgba(34,197,94,0.4)] hover:shadow-[0_0_16px_rgba(34,197,94,0.8)] transition-all duration-300 cursor-pointer hover:scale-125 active:scale-110"
                                aria-label="Maximize"
                            />
                        </div>

                        {/* Language badge with shimmer */}
                        <div className="px-3 py-1 rounded-lg bg-gradient-to-r from-muted/60 to-muted/40 backdrop-blur-md text-xs font-semibold text-muted-foreground/90 tracking-wide border border-border/30 shadow-lg relative overflow-hidden group/badge">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/badge:translate-x-full transition-transform duration-700" />
                            <span className="relative z-10">{languageLabels[language] || language}</span>
                        </div>
                    </div>

                    {/* Copy button with enhanced animations */}
                    <button
                        onClick={handleCopy}
                        className={cn(
                            "relative p-2.5 rounded-lg transition-all duration-300 z-10",
                            "bg-gradient-to-br from-secondary/90 to-secondary/70 backdrop-blur-md",
                            "border border-border/40 shadow-lg",
                            "hover:shadow-xl hover:scale-110 hover:border-border/60",
                            "active:scale-95",
                            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
                            copied && "bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/40"
                        )}
                        aria-label={copied ? "Copied" : "Copy code to clipboard"}
                    >
                        <div className={cn(
                            "transition-all duration-300",
                            copied ? "scale-100 rotate-0" : "scale-100"
                        )}>
                            {copied ? (
                                <Check className="w-4 h-4 text-green-400 animate-scale-in" />
                            ) : (
                                <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
                            )}
                        </div>
                    </button>
                </div>



                {/* Code content with colored left border */}
                <div className={cn(
                    "relative bg-gradient-to-br from-[hsl(220,28%,8%)] via-[hsl(220,25%,6%)] to-[hsl(220,30%,4%)]",
                    "before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/20 before:to-transparent before:pointer-events-none",
                    variant !== 'neutral' && "border-l-4",
                    borderColor
                )}>
                    {/* Variant indicator icon */}
                    {variant !== 'neutral' && (
                        <div className={cn(
                            "absolute top-5 left-3 z-10 p-1.5 rounded-lg backdrop-blur-sm",
                            "bg-black/30 border shadow-lg",
                            variant === 'correct' ? "border-green-500/30 shadow-green-500/20" : "border-red-500/30 shadow-red-500/20",
                            iconColor
                        )}>
                            {variant === 'correct' ? (
                                <Check className="w-3.5 h-3.5 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                            ) : (
                                <X className="w-3.5 h-3.5 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                            )}
                        </div>
                    )}

                    <SyntaxHighlighter
                        language={language}
                        style={customTheme}
                        showLineNumbers={showLineNumbers}
                        customStyle={{
                            margin: 0,
                            padding: variant !== 'neutral' ? '1.5rem 1.5rem 1.5rem 3rem' : '1.5rem',
                            background: 'transparent',
                            fontSize: '0.875rem',
                            lineHeight: '1.7',
                            borderRadius: 0,
                        }}
                        lineNumberStyle={{
                            color: '#6B7C8F',
                            fontSize: '0.75rem',
                            paddingRight: '1.25rem',
                            userSelect: 'none',
                            minWidth: '2.75em',
                            opacity: 0.7,
                            fontWeight: 500,
                            transition: 'all 0.2s ease',
                        }}
                        wrapLines={true}
                        lineProps={(lineNumber) => ({
                            style: {
                                display: 'block',
                                width: '100%',
                            },
                            className: 'hover:bg-white/[0.02] transition-colors duration-150 px-2 -mx-2 rounded',
                        })}
                        codeTagProps={{
                            style: {
                                fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', monospace",
                                fontWeight: 450,
                                textShadow: '0 0 1px rgba(0,0,0,0.5)',
                                WebkitFontSmoothing: 'antialiased',
                                MozOsxFontSmoothing: 'grayscale',
                            },
                        }}
                    >
                        {code}
                    </SyntaxHighlighter>
                </div>
            </div>
        </div>
    );
}
