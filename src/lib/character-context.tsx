import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';

// ─── Character Data Shape ─────────────────────────────────────────────────────

export interface CharacterData {
  // Header
  name: string;
  pronouns: string;
  heritage: string;
  subclass: string;
  level: string;
  stats: {
    agility: string;
    strength: string;
    finesse: string;
    instinct: string;
    presence: string;
    knowledge: string;
  };
  evasion: string;
  armor: string;
  armorPoints: boolean[];

  // Left Column — Damage & Health
  hp: boolean[];
  stress: boolean[];
  hope: boolean[];
  minorDmg: string;
  majorDmg: string;

  // Left Column — Class Features (markdown)
  features: string;

  // Left Column — Experiences
  experiences: { text: string; active: boolean }[];

  // Left Column — Gold
  handfuls: boolean[];
  bags: boolean[];
  chest: boolean;

  // Right Column — Weapons
  proficiency: boolean[];
  primaryWeapon: { name: string; trait: string; damage: string; feature: string };
  secondaryWeapon: { name: string; trait: string; damage: string; feature: string };

  // Right Column — Armor
  activeArmor: { name: string; thresholds: string; score: string; feature: string };

  // Right Column — Inventory
  inventory: string[];
  invWeapon1: { name: string; trait: string; damage: string; feature: string; isPrimary: boolean; isSecondary: boolean };
  invWeapon2: { name: string; trait: string; damage: string; feature: string; isPrimary: boolean; isSecondary: boolean };

  // Lore (markdown)
  lore: string;

  // Level Up checkboxes
  levelUpChecks: Record<string, boolean[]>;
}

// ─── Default Data ─────────────────────────────────────────────────────────────

const PLACEHOLDER_FEATURES = `## Prestidigitação

Você pode realizar efeitos mágicos sutis e inofensivos à vontade. Por exemplo, você pode mudar a cor de um objeto, criar um odor, acender uma vela, fazer um objeto minúsculo flutuar, iluminar uma sala ou consertar um pequeno objeto.

## Padrões Estranhos

Escolha um número entre 1 e 12. Quando você rolar esse número em um Dado de Dualidade, ganhe uma Esperança ou limpe um Estresse. Você pode mudar este número quando realizar um descanso longo.`;

const PLACEHOLDER_LORE = `## Origem

Nascida nas florestas prateadas de Mirethil, Elara sempre teve uma ligação profunda com as forças arcanas que permeiam o mundo. Seus olhos cor de âmbar pareciam enxergar além do véu da realidade desde tenra idade.

## A Torre Alta

Aos doze anos, foi aceita como aprendiz na prestigiosa Torre Alta, onde passou anos devorando tomos antigos e dominando as artes da Evocação. Seu dom para manipular energias elementares era incomum até mesmo entre os elfos mais talentosos.

## O Exílio

Um experimento mal sucedido com o *Grimório das Eras Perdidas* deixou marcas invisíveis em sua alma — e a obrigou a abandonar a Torre antes de completar seus estudos. Agora vaga pelo mundo, buscando respostas para as questões que nenhum mestre ousou responder.

> *"O conhecimento sem fronteiras é o único caminho verdadeiro."*
`;

export const DEFAULT_CHARACTER: CharacterData = {
  name: "Elara",
  pronouns: "Ela/Dela",
  heritage: "Elfo",
  subclass: "Escola de Evocação",
  level: "1",
  stats: { agility: "+0", strength: "-1", finesse: "+1", instinct: "+2", presence: "+0", knowledge: "+3" },
  evasion: "11",
  armor: "+0",
  armorPoints: [false, false, false, false, false, false],

  hp: Array(10).fill(false),
  stress: Array(10).fill(false),
  hope: [false, false, false, false, false, false],
  minorDmg: "7",
  majorDmg: "14",

  features: PLACEHOLDER_FEATURES,

  experiences: [
    { text: "Aprendiz da Torre Alta", active: false },
    { text: "Sobrevivente das Ruas", active: false },
    { text: "", active: false },
    { text: "", active: false },
  ],

  handfuls: Array(10).fill(false),
  bags: Array(8).fill(false),
  chest: false,

  proficiency: [true, false, false, false, false, false],
  primaryWeapon: { name: "Cajado Arcano", trait: "Agilidade/Magia", damage: "d8 Mágico", feature: "Alcance: Longo" },
  secondaryWeapon: { name: "Lâmina Rúnica", trait: "Finesse/Corpo a Corpo", damage: "d6 Físico", feature: "Combate Próximo" },

  activeArmor: { name: "Manto do Conjurador", thresholds: "1", score: "+1", feature: "Leve" },

  inventory: ["Bolsa de componentes de feitiço", "Frasco de bebida anã", "Mapa antigo", "", "", ""],
  invWeapon1: { name: "", trait: "", damage: "", feature: "", isPrimary: false, isSecondary: false },
  invWeapon2: { name: "", trait: "", damage: "", feature: "", isPrimary: false, isSecondary: false },

  lore: PLACEHOLDER_LORE,

  levelUpChecks: {},
};

// ─── Save Status ──────────────────────────────────────────────────────────────

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ─── Context ──────────────────────────────────────────────────────────────────

interface CharacterContextType {
  data: CharacterData;
  update: <K extends keyof CharacterData>(key: K, value: CharacterData[K]) => void;
  updateNested: <K extends keyof CharacterData>(key: K, partial: Partial<CharacterData[K]>) => void;
  saveStatus: SaveStatus;
  characterId: string;
}

const CharacterContext = createContext<CharacterContextType | null>(null);

export function useCharacter() {
  const ctx = useContext(CharacterContext);
  if (!ctx) throw new Error('useCharacter must be used within a CharacterProvider');
  return ctx;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function apiSave(id: string, data: CharacterData): Promise<boolean> {
  try {
    const res = await fetch('/api/save', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, data }),
    });
    if (!res.ok) {
      console.error('Failed to save character:', await readApiError(res));
    }
    return res.ok;
  } catch (error) {
    console.error('Failed to save character:', error);
    return false;
  }
}

async function apiLoad(id: string): Promise<CharacterData | null> {
  try {
    const res = await fetch(`/api/load?id=${encodeURIComponent(id)}`);
    if (res.status === 404) return null;
    if (!res.ok) {
      console.error('Failed to load character:', await readApiError(res));
      return null;
    }
    const json = await res.json();
    return json as CharacterData;
  } catch (error) {
    console.error('Failed to load character:', error);
    return null;
  }
}

async function readApiError(res: Response): Promise<string> {
  try {
    const body = await res.json() as { error?: string; message?: string };
    return [body.error, body.message].filter(Boolean).join(': ') || `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface CharacterProviderProps {
  characterId: string;
  children: ReactNode;
}

export function CharacterProvider({ characterId, children }: CharacterProviderProps) {
  const [data, setData] = useState<CharacterData>(DEFAULT_CHARACTER);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [loaded, setLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  // Load on mount
  useEffect(() => {
    let cancelled = false;
    apiLoad(characterId).then((loaded_data) => {
      if (cancelled) return;
      if (loaded_data) {
        // Merge with defaults so new fields are filled in
        setData({ ...DEFAULT_CHARACTER, ...loaded_data });
      }
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [characterId]);

  // Auto-save with debounce (2s after last change)
  const triggerSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      const ok = await apiSave(characterId, dataRef.current);
      setSaveStatus(ok ? 'saved' : 'error');
      // Reset to idle after 3s
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 2000);
  }, [characterId]);

  const update = useCallback(<K extends keyof CharacterData>(key: K, value: CharacterData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    triggerSave();
  }, [triggerSave]);

  const updateNested = useCallback(<K extends keyof CharacterData>(key: K, partial: Partial<CharacterData[K]>) => {
    setData((prev) => ({
      ...prev,
      [key]: typeof prev[key] === 'object' && !Array.isArray(prev[key])
        ? { ...(prev[key] as object), ...partial }
        : partial,
    }));
    triggerSave();
  }, [triggerSave]);

  if (!loaded) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-primary text-sm tracking-widest uppercase">Carregando Grimório...</span>
        </div>
      </div>
    );
  }

  return (
    <CharacterContext.Provider value={{ data, update, updateNested, saveStatus, characterId }}>
      {children}
    </CharacterContext.Provider>
  );
}
