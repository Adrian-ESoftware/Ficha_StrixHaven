declare module "@3d-dice/dice-box" {
    interface DiceBoxOptions {
        assetPath: string;
        theme?: string;
        themeColor?: string;
        scale?: number;
    }

    interface DiceBoxRollOptions {
        theme?: string;
        themeColor?: string;
        newStartPoint?: boolean;
    }

    interface DiceBoxDie {
        sides: number;
        value: number;
        rollId: string;
        groupId: number;
        valid?: boolean;
        type?: string;
        status?: string;
    }

    interface DiceBoxResult {
        value: number | null;
        rolls: DiceBoxDie[];
        success?: number | null;
        total?: number;
    }

    class DiceBox {
        constructor(selector: string, options: DiceBoxOptions);
        init(): Promise<void>;
        roll(notation: unknown[], options?: DiceBoxRollOptions): Promise<unknown[]>;
        add(notation: unknown[], options?: DiceBoxRollOptions): Promise<unknown[]>;
        clear(): void;
        updateConfig(config: Partial<DiceBoxOptions>): void;
    }

    export default DiceBox;
}

declare module "@3d-dice/dice-parser-interface" {
    interface ParserOptions {
        targetRollsCritSuccess?: boolean;
        targetRollsCritFailure?: boolean;
        targetRollsCrit?: boolean;
    }

    interface DieGroup {
        qty: number;
        sides: number | string;
        mods: unknown[];
    }

    class ParserInterface {
        parsedNotation: unknown;
        finalResults: unknown;
        rollsAsFloats: number[];
        dieGroups: DieGroup[];

        constructor(options?: ParserOptions);
        parseNotation(notation: string): DieGroup[];
        handleRerolls(rollResults: unknown[]): unknown[] | null;
        parseFinalResults(rollResults: unknown[]): DiceBoxResultExport;
    }

    export default ParserInterface;
}

interface DiceBoxResultExport {
    value: number | null;
    rolls: Array<{
        sides: number;
        value: number;
        rollId: string;
        groupId: number;
        valid?: boolean;
        type?: string;
    }>;
    success?: number | null;
}
