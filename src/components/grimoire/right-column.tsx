import { useState } from 'react';
import { SectionHeader, Divider, InputLine, Diamond, Circle } from './shared';

export function RightColumn() {
  const [proficiency, setProficiency] = useState([true, false, false, false, false, false]);
  
  const [primaryWeapon, setPrimaryWeapon] = useState({ name: "Cajado Arcano", trait: "Agilidade/Magia", damage: "d8 Mágico", feature: "Alcance: Longo" });
  const [secondaryWeapon, setSecondaryWeapon] = useState({ name: "Lâmina Rúnica", trait: "Finesse/Corpo a Corpo", damage: "d6 Físico", feature: "Combate Próximo" });
  
  const [armor, setArmor] = useState({ name: "Manto do Conjurador", thresholds: "1", score: "+1", feature: "Leve" });

  const [inventory, setInventory] = useState(["Bolsa de componentes de feitiço", "Frasco de bebida anã", "Mapa antigo", "", "", ""]);
  
  const [invWeapon1, setInvWeapon1] = useState({ name: "", trait: "", damage: "", feature: "", isPrimary: false, isSecondary: false });
  const [invWeapon2, setInvWeapon2] = useState({ name: "", trait: "", damage: "", feature: "", isPrimary: false, isSecondary: false });

  const updateArray = (arr: any[], setArr: any, index: number, val: any) => {
    const newArr = [...arr];
    newArr[index] = val;
    setArr(newArr);
  };

  const WeaponBlock = ({ weapon, setWeapon, title }: any) => (
    <div className="bg-background border border-primary/20 p-5 relative mb-6">
      <div className="absolute -top-3 left-4 bg-card px-2 font-mono text-xs text-primary tracking-widest">{title}</div>
      <div className="flex flex-col gap-4 mt-2">
        <InputLine label="Nome" value={weapon.name} onChange={(v: string) => setWeapon({...weapon, name: v})} />
        <div className="flex gap-4">
          <InputLine label="Atributo & Alcance" value={weapon.trait} onChange={(v: string) => setWeapon({...weapon, trait: v})} className="flex-1" />
          <InputLine label="Dados & Tipo de Dano" value={weapon.damage} onChange={(v: string) => setWeapon({...weapon, damage: v})} className="flex-1" />
        </div>
        <InputLine label="Característica" value={weapon.feature} onChange={(v: string) => setWeapon({...weapon, feature: v})} />
      </div>
    </div>
  );

  const InvWeaponBlock = ({ weapon, setWeapon }: any) => (
    <div className="bg-background border border-primary/20 p-5 relative mb-6 mt-4">
      <div className="absolute -top-3 left-4 bg-card px-2 font-mono text-xs text-primary tracking-widest flex items-center gap-2">
        <span>ARMA DO INVENTÁRIO</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3 text-primary"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>
      </div>
      <div className="absolute -top-3 right-4 bg-card px-2 flex gap-4">
        <label className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground cursor-pointer">
          <Diamond checked={weapon.isPrimary} onChange={(v: boolean) => setWeapon({...weapon, isPrimary: v})} className="w-2.5 h-2.5" />
          PRIMÁRIA
        </label>
        <label className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground cursor-pointer">
          <Diamond checked={weapon.isSecondary} onChange={(v: boolean) => setWeapon({...weapon, isSecondary: v})} className="w-2.5 h-2.5" />
          SECUNDÁRIA
        </label>
      </div>
      
      <div className="flex flex-col gap-4 mt-2">
        <InputLine label="Nome" value={weapon.name} onChange={(v: string) => setWeapon({...weapon, name: v})} />
        <div className="flex gap-4">
          <InputLine label="Atributo & Alcance" value={weapon.trait} onChange={(v: string) => setWeapon({...weapon, trait: v})} className="flex-1" />
          <InputLine label="Dados & Tipo de Dano" value={weapon.damage} onChange={(v: string) => setWeapon({...weapon, damage: v})} className="flex-1" />
        </div>
        <InputLine label="Característica" value={weapon.feature} onChange={(v: string) => setWeapon({...weapon, feature: v})} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 w-full pl-0 md:pl-6 border-l-0 md:border-l border-primary/20 h-full flex-1">
      
      {/* ACTIVE WEAPONS */}
      <section className="bg-card p-6 border border-primary/30 clip-notch shadow-lg">
        <div className="flex justify-between items-end mb-2">
          <SectionHeader>Armas Ativas</SectionHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] text-primary tracking-widest uppercase mr-2">Proficiência</span>
            {proficiency.map((val, i) => (
              <Circle key={i} size={3} checked={val} onChange={() => {
                const p = [...proficiency];
                p[i] = !p[i];
                setProficiency(p);
              }} />
            ))}
          </div>
        </div>
        <Divider />
        
        <WeaponBlock title="PRIMÁRIA" weapon={primaryWeapon} setWeapon={setPrimaryWeapon} />
        <WeaponBlock title="SECUNDÁRIA" weapon={secondaryWeapon} setWeapon={setSecondaryWeapon} />
      </section>

      {/* ACTIVE ARMOR */}
      <section className="bg-card p-6 border border-primary/30 clip-notch shadow-lg">
        <SectionHeader>Armadura Ativa</SectionHeader>
        <Divider />
        
        <div className="bg-background border border-primary/20 p-5 relative mb-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <InputLine label="Nome" value={armor.name} onChange={(v: string) => setArmor({...armor, name: v})} className="flex-[2] min-w-[150px]" />
              <div className="flex gap-4 flex-1">
                <InputLine label="Limiares Base" value={armor.thresholds} onChange={(v: string) => setArmor({...armor, thresholds: v})} className="flex-1 min-w-[80px]" center />
                <InputLine label="Valor Base" value={armor.score} onChange={(v: string) => setArmor({...armor, score: v})} className="flex-1 min-w-[80px]" center />
              </div>
            </div>
            <InputLine label="Característica" value={armor.feature} onChange={(v: string) => setArmor({...armor, feature: v})} />
          </div>
        </div>
      </section>

      {/* INVENTORY */}
      <section className="bg-card p-6 border border-primary/30 clip-notch shadow-lg flex-1 flex flex-col">
        <SectionHeader>Inventário</SectionHeader>
        <Divider />
        
        <div className="flex flex-col gap-3 mb-8">
          {inventory.map((item, i) => (
            <InputLine key={i} value={item} onChange={(v: string) => updateArray(inventory, setInventory, i, v)} placeholder={`Item ${i+1}`} />
          ))}
        </div>

        <InvWeaponBlock weapon={invWeapon1} setWeapon={setInvWeapon1} />
        <InvWeaponBlock weapon={invWeapon2} setWeapon={setInvWeapon2} />
        
      </section>

    </div>
  );
}
