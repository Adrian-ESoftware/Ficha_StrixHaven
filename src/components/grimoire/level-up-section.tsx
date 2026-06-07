import { useState } from 'react';
import { SectionHeader, Divider } from './shared';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CheckOption {
  id: string;
  label: string;
  boxes: number; // how many checkbox slots this option has
}

interface Tier {
  tier: number;
  levels: string;
  levelUpText: string;
  chooseText: string;
  options: CheckOption[];
  footerText: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const TIERS: Tier[] = [
  {
    tier: 2,
    levels: '2–4',
    levelUpText:
      'No nível 2, ganhe uma Experiência adicional com +2 e receba um bônus de +1 à sua Proficiência.',
    chooseText: 'Escolha duas opções da lista abaixo e marque-as.',
    options: [
      { id: 't2-traits', label: 'Ganhe +1 em dois atributos não marcados e marque-os.', boxes: 3 },
      { id: 't2-hp', label: 'Ganhe permanentemente um espaço de Ponto de Vida.', boxes: 2 },
      { id: 't2-stress', label: 'Ganhe permanentemente um espaço de Estresse.', boxes: 2 },
      { id: 't2-exp', label: 'Ganhe permanentemente +1 em duas Experiências.', boxes: 1 },
      { id: 't2-domain', label: 'Escolha uma carta de domínio do seu nível ou inferior de um domínio que você tenha acesso (até nível 4).', boxes: 1 },
      { id: 't2-evasion', label: 'Ganhe permanentemente +1 na sua Evasão.', boxes: 1 },
    ],
    footerText:
      'Atualize seu nível e ajuste seus limiares de dano. Pegue uma carta de domínio do seu nível ou inferior de um domínio que você tenha acesso.',
  },
  {
    tier: 3,
    levels: '5–7',
    levelUpText:
      'No nível 5, ganhe uma Experiência adicional com +2 e limpe todas as marcas nos atributos. Em seguida, receba +1 à sua Proficiência.',
    chooseText:
      'Escolha duas opções da lista abaixo ou de qualquer nível anterior e marque-as.',
    options: [
      { id: 't3-traits', label: 'Ganhe +1 em dois atributos não marcados e marque-os.', boxes: 3 },
      { id: 't3-hp', label: 'Ganhe permanentemente um espaço de Ponto de Vida.', boxes: 2 },
      { id: 't3-stress', label: 'Ganhe permanentemente um espaço de Estresse.', boxes: 2 },
      { id: 't3-exp', label: 'Ganhe permanentemente +1 em duas Experiências.', boxes: 1 },
      { id: 't3-domain', label: 'Escolha uma carta de domínio do seu nível ou inferior de um domínio que você tenha acesso (até nível 7).', boxes: 1 },
      { id: 't3-evasion', label: 'Ganhe permanentemente +1 na sua Evasão.', boxes: 1 },
      { id: 't3-subclass', label: 'Pegue uma carta de subclasse avançada. Então risque a opção de multiclasse desta tier.', boxes: 1 },
      { id: 't3-prof', label: 'Aumente sua Proficiência em +1.', boxes: 2 },
      { id: 't3-multi', label: 'Multiclasse: Escolha uma classe adicional, então risque um "Subclasse Avançada" não usado e a outra opção de multiclasse nesta ficha.', boxes: 2 },
    ],
    footerText:
      'Atualize seu nível e ajuste seus limiares de dano. Pegue uma carta de domínio do seu nível ou inferior de um domínio que você tenha acesso.',
  },
  {
    tier: 4,
    levels: '8–10',
    levelUpText:
      'No nível 8, ganhe uma Experiência adicional com +2 e limpe todas as marcas nos atributos. Em seguida, receba +1 à sua Proficiência.',
    chooseText:
      'Escolha duas opções da lista abaixo ou de qualquer nível anterior e marque-as.',
    options: [
      { id: 't4-traits', label: 'Ganhe +1 em dois atributos não marcados e marque-os.', boxes: 3 },
      { id: 't4-hp', label: 'Ganhe permanentemente um espaço de Ponto de Vida.', boxes: 2 },
      { id: 't4-stress', label: 'Ganhe permanentemente um espaço de Estresse.', boxes: 2 },
      { id: 't4-exp', label: 'Ganhe permanentemente +1 em duas Experiências.', boxes: 1 },
      { id: 't4-domain', label: 'Escolha uma carta de domínio do seu nível ou inferior de um domínio que você tenha acesso.', boxes: 1 },
      { id: 't4-evasion', label: 'Ganhe permanentemente +1 na sua Evasão.', boxes: 1 },
      { id: 't4-subclass', label: 'Pegue uma carta de subclasse avançada. Então risque a opção de multiclasse desta tier.', boxes: 1 },
      { id: 't4-prof', label: 'Aumente sua Proficiência em +1.', boxes: 2 },
      { id: 't4-multi', label: 'Multiclasse: Escolha uma classe adicional, então risque um "Subclasse Avançada" não usado e a outra opção de multiclasse nesta ficha.', boxes: 2 },
    ],
    footerText:
      'Atualize seu nível e ajuste seus limiares de dano. Pegue uma carta de domínio do seu nível ou inferior de um domínio que você tenha acesso.',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function CheckboxGroup({ count, optionId, checked, onToggle }: {
  count: number;
  optionId: string;
  checked: boolean[];
  onToggle: (i: number) => void;
}) {
  return (
    <div className="flex gap-1 flex-shrink-0 mt-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onToggle(i)}
          aria-label={`Marcar opção ${optionId} ${i + 1}`}
          className={[
            'w-3.5 h-3.5 border transition-all duration-200',
            checked[i]
              ? 'bg-primary border-primary shadow-[0_0_6px_rgba(233,193,118,0.6)]'
              : 'bg-transparent border-primary/40 hover:border-primary/70',
          ].join(' ')}
        />
      ))}
    </div>
  );
}

function TierCard({ tier }: { tier: Tier }) {
  const TIER_COLORS = {
    2: 'from-primary/5 to-transparent border-primary/25',
    3: 'from-amber-500/8 to-transparent border-amber-400/30',
    4: 'from-orange-500/8 to-transparent border-orange-400/30',
  } as const;

  const TIER_LABEL_COLORS = {
    2: 'text-primary border-primary/40 bg-primary/10',
    3: 'text-amber-300 border-amber-400/40 bg-amber-400/10',
    4: 'text-orange-300 border-orange-400/40 bg-orange-400/10',
  } as const;

  const colorClass = TIER_COLORS[tier.tier as keyof typeof TIER_COLORS];
  const labelColor = TIER_LABEL_COLORS[tier.tier as keyof typeof TIER_LABEL_COLORS];

  // State: for each option, an array of booleans (one per checkbox box)
  const [checked, setChecked] = useState<Record<string, boolean[]>>(() =>
    Object.fromEntries(tier.options.map((o) => [o.id, Array(o.boxes).fill(false)]))
  );

  const toggle = (optionId: string, boxIndex: number) => {
    setChecked((prev) => {
      const arr = [...prev[optionId]];
      arr[boxIndex] = !arr[boxIndex];
      return { ...prev, [optionId]: arr };
    });
  };

  return (
    <div className={`flex flex-col bg-gradient-to-b ${colorClass} border rounded-sm p-5 gap-4`}>

      {/* Tier badge + level range */}
      <div className="flex items-center justify-between">
        <span className={`font-mono text-[10px] tracking-[0.2em] uppercase border px-2 py-0.5 ${labelColor}`}>
          Tier {tier.tier}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground tracking-widest">
          Níveis {tier.levels}
        </span>
      </div>

      {/* Level-up text (bold header box) */}
      <div className="bg-background/40 border border-primary/10 p-3 text-center">
        <p className="font-sans text-xs text-foreground/90 leading-snug">
          {tier.levelUpText}
        </p>
      </div>

      {/* Choose instruction */}
      <p className="font-mono text-[10px] text-muted-foreground tracking-wide leading-snug">
        {tier.chooseText}
      </p>

      {/* Options list */}
      <ul className="flex flex-col gap-3 flex-1">
        {tier.options.map((opt) => (
          <li key={opt.id} className="flex items-start gap-2">
            <CheckboxGroup
              count={opt.boxes}
              optionId={opt.id}
              checked={checked[opt.id]}
              onToggle={(i) => toggle(opt.id, i)}
            />
            <span className="font-sans text-[11px] text-foreground/80 leading-snug">
              {opt.label}
            </span>
          </li>
        ))}
      </ul>

      {/* Footer text */}
      <div className="border-t border-primary/10 pt-3 mt-auto">
        <p className="font-sans text-[10px] text-muted-foreground/70 italic leading-snug text-center">
          {tier.footerText}
        </p>
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function LevelUpSection() {
  return (
    <section className="w-full mt-12">
      <div className="mb-4">
        <SectionHeader>Progressão de Nível</SectionHeader>
        <p className="font-sans text-xs text-muted-foreground italic mt-1">
          Ao subir de nível, aplique as melhorias da sua tier atual e marque as opções escolhidas.
        </p>
      </div>

      <Divider />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {TIERS.map((tier) => (
          <TierCard key={tier.tier} tier={tier} />
        ))}
      </div>
    </section>
  );
}
