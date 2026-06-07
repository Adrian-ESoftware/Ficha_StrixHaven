import { useCharacter } from '@/lib/character-context';
import { SectionHeader, Divider, InputLine, Diamond, Circle } from './shared';

type Weapon = {
  name: string;
  trait: string;
  damage: string;
  feature: string;
};

type InventoryWeapon = Weapon & {
  isPrimary: boolean;
  isSecondary: boolean;
};

function WeaponBlock({
  weapon,
  onChange,
  title,
}: {
  weapon: Weapon;
  onChange: (partial: Partial<Weapon>) => void;
  title: string;
}) {
  return (
    <div className="bg-background border border-primary/20 p-5 relative mb-6">
      <div className="absolute -top-3 left-4 bg-card px-2 font-mono text-xs text-primary tracking-widest">{title}</div>
      <div className="flex flex-col gap-4 mt-2">
        <InputLine label="Nome" value={weapon.name} onChange={(value: string) => onChange({ name: value })} />
        <div className="flex gap-4">
          <InputLine label="Atributo & Alcance" value={weapon.trait} onChange={(value: string) => onChange({ trait: value })} className="flex-1" />
          <InputLine label="Dados & Tipo de Dano" value={weapon.damage} onChange={(value: string) => onChange({ damage: value })} className="flex-1" />
        </div>
        <InputLine label="Característica" value={weapon.feature} onChange={(value: string) => onChange({ feature: value })} />
      </div>
    </div>
  );
}

function InvWeaponBlock({
  weapon,
  onChange,
}: {
  weapon: InventoryWeapon;
  onChange: (partial: Partial<InventoryWeapon>) => void;
}) {
  return (
    <div className="bg-background border border-primary/20 p-5 relative mb-6 mt-4">
      <div className="absolute -top-3 left-4 bg-card px-2 font-mono text-xs text-primary tracking-widest flex items-center gap-2">
        <span>ARMA DO INVENTÁRIO</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3 text-primary"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>
      </div>
      <div className="absolute -top-3 right-4 bg-card px-2 flex gap-4">
        <label className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground cursor-pointer">
          <Diamond checked={weapon.isPrimary} onChange={(value: boolean) => onChange({ isPrimary: value })} className="w-2.5 h-2.5" />
          PRIMÁRIA
        </label>
        <label className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground cursor-pointer">
          <Diamond checked={weapon.isSecondary} onChange={(value: boolean) => onChange({ isSecondary: value })} className="w-2.5 h-2.5" />
          SECUNDÁRIA
        </label>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        <InputLine label="Nome" value={weapon.name} onChange={(value: string) => onChange({ name: value })} />
        <div className="flex gap-4">
          <InputLine label="Atributo & Alcance" value={weapon.trait} onChange={(value: string) => onChange({ trait: value })} className="flex-1" />
          <InputLine label="Dados & Tipo de Dano" value={weapon.damage} onChange={(value: string) => onChange({ damage: value })} className="flex-1" />
        </div>
        <InputLine label="Característica" value={weapon.feature} onChange={(value: string) => onChange({ feature: value })} />
      </div>
    </div>
  );
}

export function RightColumn() {
  const { data, update, updateNested } = useCharacter();

  const updateArray = (key: 'inventory' | 'proficiency', index: number, val: string | boolean) => {
    const newArr = [...data[key]];
    newArr[index] = val as never;
    if (key === 'inventory') {
      update('inventory', newArr as string[]);
    } else {
      update('proficiency', newArr as boolean[]);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full pl-0 md:pl-6 border-l-0 md:border-l border-primary/20 h-full flex-1">
      <section className="bg-card p-6 border border-primary/30 clip-notch shadow-lg">
        <div className="flex justify-between items-end mb-2">
          <SectionHeader>Armas Ativas</SectionHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] text-primary tracking-widest uppercase mr-2">Proficiência</span>
            {data.proficiency.map((val, i) => (
              <Circle key={i} size={3} checked={val} onChange={() => updateArray('proficiency', i, !val)} />
            ))}
          </div>
        </div>
        <Divider />

        <WeaponBlock title="PRIMÁRIA" weapon={data.primaryWeapon} onChange={(partial) => updateNested('primaryWeapon', partial)} />
        <WeaponBlock title="SECUNDÁRIA" weapon={data.secondaryWeapon} onChange={(partial) => updateNested('secondaryWeapon', partial)} />
      </section>

      <section className="bg-card p-6 border border-primary/30 clip-notch shadow-lg">
        <SectionHeader>Armadura Ativa</SectionHeader>
        <Divider />

        <div className="bg-background border border-primary/20 p-5 relative mb-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <InputLine label="Nome" value={data.activeArmor.name} onChange={(value: string) => updateNested('activeArmor', { name: value })} className="flex-[2] min-w-[150px]" />
              <div className="flex gap-4 flex-1">
                <InputLine label="Limiares Base" value={data.activeArmor.thresholds} onChange={(value: string) => updateNested('activeArmor', { thresholds: value })} className="flex-1 min-w-[80px]" center />
                <InputLine label="Valor Base" value={data.activeArmor.score} onChange={(value: string) => updateNested('activeArmor', { score: value })} className="flex-1 min-w-[80px]" center />
              </div>
            </div>
            <InputLine label="Característica" value={data.activeArmor.feature} onChange={(value: string) => updateNested('activeArmor', { feature: value })} />
          </div>
        </div>
      </section>

      <section className="bg-card p-6 border border-primary/30 clip-notch shadow-lg flex-1 flex flex-col">
        <SectionHeader>Inventário</SectionHeader>
        <Divider />

        <div className="flex flex-col gap-3 mb-8">
          {data.inventory.map((item, i) => (
            <InputLine key={i} value={item} onChange={(value: string) => updateArray('inventory', i, value)} placeholder={`Item ${i + 1}`} />
          ))}
        </div>

        <InvWeaponBlock weapon={data.invWeapon1} onChange={(partial) => updateNested('invWeapon1', partial)} />
        <InvWeaponBlock weapon={data.invWeapon2} onChange={(partial) => updateNested('invWeapon2', partial)} />
      </section>
    </div>
  );
}
