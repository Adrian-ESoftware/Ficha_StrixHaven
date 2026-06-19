"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";

interface DiceContextType {
    rollDice: (notation: string) => Promise<DiceResult | null>;
    rollDualidade: () => Promise<DualidadeResult | null>;
    themeColor: string;
    updateThemeColor: (color: string) => void;
    isReady: boolean;
}

export interface DiceResult {
    value: number | null;
    rolls: Array<{
        sides: number;
        value: number;
        rollId: string;
        groupId: number;
        valid?: boolean;
        type?: string;
    }>;
    notation: string;
    rawResults: unknown[];
}

export interface DualidadeResult {
    blue: number;
    red: number;
}

const DiceContext = createContext<DiceContextType | null>(null);

export function useDice() {
    const context = useContext(DiceContext);
    if (!context) {
        throw new Error("useDice must be used within a DiceProvider");
    }
    return context;
}

const DEFAULT_THEME_COLOR = "#E9C176";

export function DiceProvider({ children }: { children: React.ReactNode }) {
    const [diceBox, setDiceBox] = useState<any>(null);
    const [parser, setParser] = useState<any>(null);
    const [themeColor, setThemeColor] = useState<string>(DEFAULT_THEME_COLOR);
    const [isReady, setIsReady] = useState(false);
    const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        let mounted = true;

        async function initDice() {
            try {
                const DiceBoxModule = await import("@3d-dice/dice-box");
                const ParserModule = await import("@3d-dice/dice-parser-interface");

                const DiceBox = DiceBoxModule.default || DiceBoxModule;
                const DiceParser = ParserModule.default || ParserModule;

                const savedColor = localStorage.getItem("diceThemeColor") || DEFAULT_THEME_COLOR;
                setThemeColor(savedColor);

                const newDiceBox = new DiceBox("#dice-box-container", {
                    assetPath: "/assets/dice-box/",
                    theme: "default",
                    themeColor: savedColor,
                    scale: 5,
                });

                await newDiceBox.init();

                const newParser = new DiceParser();

                if (mounted) {
                    setDiceBox(newDiceBox);
                    setParser(newParser);
                    setIsReady(true);
                }
            } catch (error) {
                console.error("Failed to initialize dice system:", error);
            }
        }

        initDice();

        return () => {
            mounted = false;
            if (clearTimerRef.current) {
                clearTimeout(clearTimerRef.current);
            }
        };
    }, []);

    const rollDice = async (notation: string): Promise<DiceResult | null> => {
        if (!diceBox || !parser) {
            console.warn("Dice system not initialized");
            return null;
        }

        if (clearTimerRef.current) {
            clearTimeout(clearTimerRef.current);
            clearTimerRef.current = null;
        }

        try {
            const parsedNotation = parser.parseNotation(notation);

            let results = await diceBox.roll(parsedNotation);

            let rerolls = parser.handleRerolls(results);
            while (rerolls && rerolls.length > 0) {
                const rerollResults = await diceBox.add(rerolls);
                results = [...results, ...rerollResults];
                rerolls = parser.handleRerolls(results);
            }

            const finalResults = parser.parseFinalResults(results);

            if (finalResults && (finalResults.value === null || typeof finalResults.value !== 'number' || isNaN(finalResults.value))) {
                if (finalResults.rolls && Array.isArray(finalResults.rolls)) {
                    finalResults.value = finalResults.rolls
                        .filter((r: any) => r.valid !== false && typeof r.value === 'number')
                        .reduce((sum: number, r: any) => sum + r.value, 0);
                } else {
                    finalResults.value = 0;
                }
            }

            clearTimerRef.current = setTimeout(() => {
                if (diceBox && typeof diceBox.clear === 'function') {
                    diceBox.clear();
                }
            }, 5000);

            return {
                value: finalResults.value,
                rolls: finalResults.rolls || [],
                notation,
                rawResults: results,
            };
        } catch (error) {
            console.error("Roll error:", error);
            throw error;
        }
    };

    const updateThemeColor = (color: string) => {
        setThemeColor(color);
        localStorage.setItem("diceThemeColor", color);
        if (diceBox && typeof diceBox.updateConfig === 'function') {
            diceBox.updateConfig({ themeColor: color });
        }
    };

    const rollDualidade = async (): Promise<DualidadeResult | null> => {
        if (!diceBox || !parser) {
            console.warn("Dice system not initialized");
            return null;
        }

        if (clearTimerRef.current) {
            clearTimeout(clearTimerRef.current);
            clearTimerRef.current = null;
        }

        try {
            const dieGroup = parser.parseNotation("2d12");

            const allResults = await diceBox.roll(dieGroup, { themeColor: "#8b5cf6" });

            const finalResults = parser.parseFinalResults(allResults);

            let blueValue = 0;
            let redValue = 0;

            if (finalResults?.rolls && Array.isArray(finalResults.rolls)) {
                const validRolls = finalResults.rolls.filter(
                    (r: any) => r.valid !== false && typeof r.value === 'number'
                );
                blueValue = validRolls[0]?.value ?? 0;
                redValue = validRolls[1]?.value ?? 0;
            }

            clearTimerRef.current = setTimeout(() => {
                if (diceBox && typeof diceBox.clear === 'function') {
                    diceBox.clear();
                }
            }, 8000);

            return { blue: blueValue, red: redValue };
        } catch (error) {
            console.error("Dualidade roll error:", error);
            throw error;
        }
    };

    return (
        <DiceContext.Provider value={{ rollDice, rollDualidade, themeColor, updateThemeColor, isReady }}>
            <div
                id="dice-box-container"
                className="fixed inset-0 pointer-events-none z-[9999] w-screen h-screen overflow-hidden"
            />
            {children}
        </DiceContext.Provider>
    );
}
