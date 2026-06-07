import { useCharacter } from '@/lib/character-context';
import { InputLine, StatShield } from './shared';
import perfilImg from '@/components/imgs/perfil.png';

export function HeaderStats() {
  const { data, update, updateNested } = useCharacter();

  const toggleArmorPoint = (index: number) => {
    const newArmorPoints = [...data.armorPoints];
    newArmorPoints[index] = !newArmorPoints[index];
    update("armorPoints", newArmorPoints);
  };

  return (
    <div className="w-full mb-10 flex flex-col gap-8">
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row gap-6 border-b border-primary pb-8 border-opacity-30 items-center md:items-stretch">
        
        {/* LARGE PORTRAIT */}
        <div className="relative w-36 h-36 shrink-0 border-2 border-primary/30 rounded-xl overflow-hidden group shadow-[0_0_20px_rgba(233,193,118,0.2)] hover:border-primary/80 transition-all duration-500 bg-card">
          <img 
            src={perfilImg} 
            alt="Avatar de Elara" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent opacity-85" />
          {/* Inner decorative frame line */}
          <div className="absolute inset-1.5 border border-primary/20 pointer-events-none group-hover:border-primary/40 transition-colors duration-500 rounded-lg" />
        </div>

        {/* CHARACTER DETAILS */}
        <div className="flex-grow flex flex-col justify-between gap-4 w-full">
          
          {/* TOP ROW: NAME & LEVEL */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-primary/10 pb-4">
            <div className="flex flex-col justify-end w-full sm:w-auto">
              <InputLine label="Nome" value={data.name} onChange={(v: string) => update("name", v)} className="w-full sm:w-64 font-serif text-lg font-bold" />
              <div className="font-mono text-[9px] tracking-widest text-primary mt-1.5 uppercase">Códice & Esplendor</div>
            </div>
            
            {/* LEVEL (aligned right on desktop) */}
            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
              <div className="font-mono text-[10px] tracking-widest text-primary uppercase">Nível</div>
              <div className="relative w-16 h-16 border-2 border-primary clip-shield flex items-center justify-center bg-card shadow-[0_0_15px_rgba(233,193,118,0.2)]">
                <input 
                  type="text"
                  value={data.level}
                  onChange={(e) => update("level", e.target.value)}
                  className="w-full text-center bg-transparent text-primary font-mono text-3xl font-bold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* BOTTOM ROW: PRONOUNS, HERITAGE, SUBCLASS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <InputLine label="Pronomes" value={data.pronouns} onChange={(v: string) => update("pronouns", v)} />
            <InputLine label="Herança" value={data.heritage} onChange={(v: string) => update("heritage", v)} />
            <InputLine label="Subclasse" value={data.subclass} onChange={(v: string) => update("subclass", v)} />
          </div>

        </div>
      </div>

      {/* CORE STATS, EVASION, ARMOR & ARMOR POINTS */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start w-full justify-between">
        
        {/* EVASION, ARMOR & ARMOR POINTS */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 md:shrink-0">
          
          {/* EVASION */}
          <div className="flex flex-col items-center group relative">
            <div className="text-primary font-mono text-[11px] font-bold tracking-widest uppercase mb-2">Evasão</div>
            <div className="w-20 h-24 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center bg-card group-hover:border-primary transition-colors">
                <input 
                  type="text"
                  value={data.evasion}
                  onChange={(e) => update("evasion", e.target.value)}
                  className="w-full text-center bg-transparent text-foreground font-mono text-2xl focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-3 flex flex-col items-center gap-0.5">
              <div className="text-muted-foreground font-mono text-[9px] uppercase tracking-wider">Começa em 11</div>
            </div>
          </div>

          {/* ARMOR SCORE */}
          <div className="flex flex-col items-center group relative">
            <div className="text-primary font-mono text-[11px] font-bold tracking-widest uppercase mb-2">Armadura</div>
            <div className="w-20 h-24 flex items-center justify-center">
              <div className="w-16 h-16 clip-shield border border-primary/30 flex items-center justify-center bg-card group-hover:border-primary transition-colors">
                <input 
                  type="text"
                  value={data.armor}
                  onChange={(e) => update("armor", e.target.value)}
                  className="w-full text-center bg-transparent text-foreground font-mono text-2xl focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-3 flex flex-col items-center gap-0.5">
              <div className="text-muted-foreground font-mono text-[9px] uppercase tracking-wider">&nbsp;</div>
            </div>
          </div>

          {/* ARMOR POINTS */}
          <div className="flex flex-col items-center group relative">
            <div className="text-primary font-mono text-[11px] font-bold tracking-widest uppercase mb-2 text-center">Pts. Armadura</div>
            <div className="w-20 h-24 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-1.5 p-2 border border-primary/30 rounded bg-card group-hover:border-primary transition-colors">
                {data.armorPoints.map((active, i) => (
                  <button 
                    key={i} 
                    onClick={() => toggleArmorPoint(i)}
                    className={`w-5 h-5 flex items-center justify-center transition-all ${active ? 'text-primary drop-shadow-[0_0_5px_rgba(233,193,118,0.8)]' : 'text-primary/30 hover:text-primary/60'}`}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                      <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 flex flex-col items-center gap-0.5">
              <div className="text-muted-foreground font-mono text-[9px] uppercase tracking-wider">&nbsp;</div>
            </div>
          </div>

        </div>

        {/* VERTICAL DIVIDER */}
        <div className="hidden md:block self-stretch w-[1px] bg-primary/20 mx-4 md:mx-6" />

        {/* 6 STAT SHIELDS */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-8 flex-1 justify-items-center">
          <StatShield label="Agilidade" value={data.stats.agility} onChange={(v: string) => updateNested("stats", { agility: v })} subLabels={["Correr", "Saltar", "Manobrar"]} />
          <StatShield label="Força" value={data.stats.strength} onChange={(v: string) => updateNested("stats", { strength: v })} subLabels={["Levantar", "Quebrar", "Agarrar"]} />
          <StatShield label="Finesse" value={data.stats.finesse} onChange={(v: string) => updateNested("stats", { finesse: v })} subLabels={["Controlar", "Ocultar", "Oficiar"]} />
          <StatShield label="Instinto" value={data.stats.instinct} onChange={(v: string) => updateNested("stats", { instinct: v })} subLabels={["Perceber", "Sentir", "Navegar"]} />
          <StatShield label="Presença" value={data.stats.presence} onChange={(v: string) => updateNested("stats", { presence: v })} subLabels={["Cativar", "Atuar", "Enganar"]} />
          <StatShield label="Conhecimento" value={data.stats.knowledge} onChange={(v: string) => updateNested("stats", { knowledge: v })} subLabels={["Recordar", "Analisar", "Compreender"]} />
        </div>

      </div>
    </div>
  );
}
