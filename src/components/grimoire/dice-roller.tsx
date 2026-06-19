"use client";

import { useState, useRef, useEffect, type KeyboardEvent, type FormEvent } from "react";
import { Dices, Send, X, Loader2 } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useDice, type DiceResult, type DualidadeResult } from "@/lib/dice-context";

interface HistoryEntry {
    id: string;
    notation: string;
    result: DiceResult | null;
    dualidade?: DualidadeResult | null;
    error?: string;
    timestamp: number;
}

export function DiceRollerFAB() {
    const { isReady } = useDice();
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-card/90 backdrop-blur-md border-2 border-primary text-primary hover:text-foreground hover:bg-card transition-all duration-300 shadow-[0_0_25px_rgba(233,193,118,0.25)] hover:shadow-[0_0_35px_rgba(233,193,118,0.45)] flex items-center justify-center cursor-pointer group"
                    title="Rolar Dados"
                >
                    <Dices className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                side="top"
                align="end"
                sideOffset={12}
                className="w-80 p-0 border border-primary/40 bg-card/95 backdrop-blur-md shadow-[0_0_40px_rgba(233,193,118,0.2)]"
            >
                <DiceRollerChat onClose={() => setOpen(false)} isReady={isReady} />
            </PopoverContent>
        </Popover>
    );
}

function DiceRollerChat({ onClose, isReady }: { onClose: () => void; isReady: boolean }) {
    const { rollDice, rollDualidade } = useDice();
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [input, setInput] = useState("");
    const [isRolling, setIsRolling] = useState(false);
    const [isDualidadeRolling, setIsDualidadeRolling] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const historyEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleRoll = async (e?: FormEvent) => {
        e?.preventDefault();
        const notation = input.trim();
        if (!notation || isRolling) return;

        setInput("");
        setIsRolling(true);

        const entryId = Math.random().toString(36).substring(2, 8);
        setHistory((prev) => [
            ...prev,
            { id: entryId, notation, result: null, timestamp: Date.now() },
        ]);

        try {
            const result = await rollDice(notation);
            setHistory((prev) =>
                prev.map((entry) =>
                    entry.id === entryId ? { ...entry, result } : entry
                )
            );
        } catch (error) {
            setHistory((prev) =>
                prev.map((entry) =>
                    entry.id === entryId
                        ? { ...entry, error: "Erro ao rolar dados" }
                        : entry
                )
            );
        } finally {
            setIsRolling(false);
            inputRef.current?.focus();
        }
    };

    const handleRollDualidade = async () => {
        if (!isReady || isDualidadeRolling) return;

        setIsDualidadeRolling(true);

        const entryId = Math.random().toString(36).substring(2, 8);
        setHistory((prev) => [
            ...prev,
            { id: entryId, notation: "Dualidade d12", result: null, timestamp: Date.now() },
        ]);

        try {
            const result = await rollDualidade();
            setHistory((prev) =>
                prev.map((entry) =>
                    entry.id === entryId ? { ...entry, dualidade: result } : entry
                )
            );
        } catch (error) {
            setHistory((prev) =>
                prev.map((entry) =>
                    entry.id === entryId
                        ? { ...entry, error: "Erro ao rolar Dualidade" }
                        : entry
                )
            );
        } finally {
            setIsDualidadeRolling(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleRoll();
        }
    };

    return (
        <div className="flex flex-col max-h-[500px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary/20 shrink-0">
                <div className="flex items-center gap-2">
                    <Dices className="w-4 h-4 text-primary" />
                    <h3 className="font-serif text-primary text-sm font-bold tracking-widest uppercase">
                        Rolar Dados
                    </h3>
                </div>
                <button
                    onClick={onClose}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* History */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-[100px] max-h-[350px]">
                {history.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Dices className="w-8 h-8 text-primary/30 mb-3" />
                        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                            {isReady
                                ? 'Digite uma notação para rolar'
                                : 'Inicializando dados...'}
                        </p>
                        <p className="font-mono text-[9px] text-muted-foreground/60 mt-1">
                            Ex: 1d20+5, 3d6, 2d20kh1+1d4
                        </p>
                    </div>
                )}

                {history.map((entry) => (
                    <HistoryBubble key={entry.id} entry={entry} />
                ))}

                {(isRolling || isDualidadeRolling) && (
                    <div className="flex items-center gap-2 py-2">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        <span className="font-mono text-[10px] text-primary tracking-widest uppercase">
                            {isDualidadeRolling ? 'Rolando Dualidade...' : 'Rolando...'}
                        </span>
                    </div>
                )}

                <div ref={historyEndRef} />
            </div>

            {/* Dualidade Button */}
            <div className="px-3 pt-2 shrink-0">
                <button
                    type="button"
                    onClick={handleRollDualidade}
                    disabled={!isReady || isDualidadeRolling || isRolling}
                    className="w-full flex items-center justify-center gap-2 py-2 border border-primary/30 bg-background/40 hover:bg-background/60 hover:border-primary/60 transition-colors disabled:opacity-30 cursor-pointer group"
                >
                    <div className="flex items-center gap-0.5">
                        <span className="w-3 h-3 rounded-sm bg-[#3b82f6] shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
                        <span className="w-3 h-3 rounded-sm bg-[#ef4444] shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                    </div>
                    <span className="font-mono text-[10px] text-primary/80 tracking-widest uppercase group-hover:text-primary transition-colors">
                        Rolar Dualidade
                    </span>
                    {isDualidadeRolling && (
                        <Loader2 className="w-3 h-3 text-primary animate-spin" />
                    )}
                </button>
            </div>

            {/* Input */}
            <form
                onSubmit={handleRoll}
                className="flex items-center gap-2 px-3 py-3 border-t border-primary/20 shrink-0"
            >
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!isReady || isRolling || isDualidadeRolling}
                    placeholder="1d20+5..."
                    className="flex-1 min-w-0 bg-background/50 border border-primary/20 px-3 py-1.5 text-foreground font-mono text-sm focus:outline-none focus:border-primary placeholder:text-muted-foreground/50 disabled:opacity-40"
                    autoComplete="off"
                />
                <button
                    type="submit"
                    disabled={!isReady || isRolling || isDualidadeRolling || !input.trim()}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-primary bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-30 cursor-pointer"
                >
                    {isRolling ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <Send className="w-3.5 h-3.5" />
                    )}
                </button>
            </form>
        </div>
    );
}

function HistoryBubble({ entry }: { entry: HistoryEntry }) {
    const formattedTime = new Date(entry.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="rounded bg-background/40 border border-primary/10 p-3">
            <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] text-primary/80 font-bold">
                    {entry.notation}
                </span>
                <span className="font-mono text-[8px] text-muted-foreground/60">
                    {formattedTime}
                </span>
            </div>

            {entry.error && (
                <span className="font-mono text-[11px] text-red-400">
                    {entry.error}
                </span>
            )}

            {entry.dualidade && (
                <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-sm bg-[#3b82f6] shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
                        <span className="font-serif text-primary text-xl font-bold">
                            {entry.dualidade.blue}
                        </span>
                        <span className="font-mono text-[9px] text-[#3b82f6]/70">d12</span>
                    </div>
                    <div className="w-px h-5 bg-primary/15" />
                    <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-sm bg-[#ef4444] shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                        <span className="font-serif text-primary text-xl font-bold">
                            {entry.dualidade.red}
                        </span>
                        <span className="font-mono text-[9px] text-[#ef4444]/70">d12</span>
                    </div>
                </div>
            )}

            {entry.result && (
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="font-serif text-primary text-xl font-bold">
                            {entry.result.value}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                            total
                        </span>
                    </div>

                    {entry.result.rolls &&
                        entry.result.rolls.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {entry.result.rolls.map((roll, i) => {
                                    if (roll.valid === false || roll.type === 'modifier') return null;
                                    return (
                                        <span
                                            key={roll.rollId || i}
                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-background/50 border border-primary/10 rounded font-mono text-[10px] text-muted-foreground"
                                        >
                                            <span className="text-primary/70">
                                                d{roll.sides}
                                            </span>
                                            <span className="text-foreground font-bold">
                                                {roll.value}
                                            </span>
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                </div>
            )}

            {!entry.result && !entry.error && !entry.dualidade && (
                <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse [animation-delay:150ms]" />
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse [animation-delay:300ms]" />
                </div>
            )}
        </div>
    );
}
