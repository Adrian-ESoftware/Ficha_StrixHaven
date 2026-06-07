import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { SectionHeader, Divider, Diamond, Circle, InputLine } from './shared';

const PLACEHOLDER_FEATURES = `## Prestidigitação

Você pode realizar efeitos mágicos sutis e inofensivos à vontade. Por exemplo, você pode mudar a cor de um objeto, criar um odor, acender uma vela, fazer um objeto minúsculo flutuar, iluminar uma sala ou consertar um pequeno objeto.

## Padrões Estranhos

Escolha um número entre 1 e 12. Quando você rolar esse número em um Dado de Dualidade, ganhe uma Esperança ou limpe um Estresse. Você pode mudar este número quando realizar um descanso longo.`;

export function LeftColumn() {
  const [hp, setHp] = useState(Array(10).fill(false));
  const [stress, setStress] = useState(Array(10).fill(false));
  const [hope, setHope] = useState([false, false, false, false, false, false]);
  
  const [minorDmg, setMinorDmg] = useState("7");
  const [majorDmg, setMajorDmg] = useState("14");
  
  const [features, setFeatures] = useState(PLACEHOLDER_FEATURES);
  const [isPreviewFeatures, setIsPreviewFeatures] = useState(true);

  const [experiences, setExperiences] = useState([
    { text: "Aprendiz da Torre Alta", active: false },
    { text: "Sobrevivente das Ruas", active: false },
    { text: "", active: false },
    { text: "", active: false },
  ]);

  const [handfuls, setHandfuls] = useState(Array(10).fill(false));
  const [bags, setBags] = useState(Array(8).fill(false));
  const [chest, setChest] = useState(false);

  const toggleArrayItem = (arr: boolean[], setArr: any, index: number) => {
    const newArr = [...arr];
    newArr[index] = !newArr[index];
    setArr(newArr);
  };

  const updateExperience = (index: number, text: string) => {
    const newExp = [...experiences];
    newExp[index].text = text;
    setExperiences(newExp);
  };

  const toggleExperience = (index: number) => {
    const newExp = [...experiences];
    newExp[index].active = !newExp[index].active;
    setExperiences(newExp);
  };

  return (
    <div className="flex flex-col gap-8 w-full pr-0 md:pr-6 h-full flex-1">
      
      {/* DAMAGE & HEALTH */}
      <section className="bg-card p-6 border border-primary/30 clip-notch shadow-lg relative">
        <SectionHeader>Dano & Vida</SectionHeader>
        <Divider />
        <p className="font-sans text-xs text-muted-foreground italic mb-6">Adicione seu nível atual aos seus limiares de dano.</p>

        <div className="flex justify-between items-center mb-8 gap-4 bg-background/20 p-3 rounded-lg border border-primary/10">
          {/* DANO LEVE 1 PV */}
          <div className="flex flex-col items-center flex-1">
            <span className="font-mono text-[10px] text-primary tracking-widest uppercase text-center font-bold">Dano Leve</span>
            <span className="font-mono text-[9px] text-muted-foreground mt-0.5">1 PV</span>
          </div>

          {/* BOX DE VALOR 1 */}
          <div className="w-16 h-12 bg-background border border-primary/20 flex items-center justify-center rounded">
            <input 
              type="text" 
              value={minorDmg} 
              onChange={(e) => setMinorDmg(e.target.value)} 
              className="w-full text-center bg-transparent text-foreground font-mono text-xl font-bold focus:outline-none" 
            />
          </div>

          {/* DANO MAIOR 2 PV */}
          <div className="flex flex-col items-center flex-1">
            <span className="font-mono text-[10px] text-primary tracking-widest uppercase text-center font-bold">Dano Maior</span>
            <span className="font-mono text-[9px] text-muted-foreground mt-0.5">2 PV</span>
          </div>

          {/* BOX DE VALOR 2 */}
          <div className="w-16 h-12 bg-background border border-primary/20 flex items-center justify-center rounded">
            <input 
              type="text" 
              value={majorDmg} 
              onChange={(e) => setMajorDmg(e.target.value)} 
              className="w-full text-center bg-transparent text-foreground font-mono text-xl font-bold focus:outline-none" 
            />
          </div>

          {/* DANO GRAVE 3 PV */}
          <div className="flex flex-col items-center flex-1">
            <span className="font-mono text-[10px] text-primary tracking-widest uppercase text-center font-bold">Dano Grave</span>
            <span className="font-mono text-[9px] text-muted-foreground mt-0.5">3 PV</span>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-6">
            <div className="font-mono text-primary text-sm tracking-widest w-16">PV</div>
            <div className="flex gap-4">
              {hp.map((val, i) => (
                <Diamond 
                  key={`hp-${i}`} 
                  checked={val} 
                  onChange={() => toggleArrayItem(hp, setHp, i)} 
                  isCrimson={true} 
                  className={i >= 5 ? "opacity-50" : ""} 
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="font-mono text-primary text-sm tracking-widest w-16">ESTRESSE</div>
            <div className="flex gap-4">
              {stress.map((val, i) => (
                <Diamond 
                  key={`stress-${i}`} 
                  checked={val} 
                  onChange={() => toggleArrayItem(stress, setStress, i)} 
                  isCrimson={true} 
                  className={i >= 6 ? "opacity-50" : ""} 
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOPE */}
      <section className="bg-card p-6 border border-primary/30 clip-notch shadow-lg relative">
        <SectionHeader>Esperança</SectionHeader>
        <Divider />
        <p className="font-sans text-xs text-muted-foreground italic mb-6">Gaste uma Esperança para usar uma experiência ou ajudar um aliado.</p>
        
        <div className="flex gap-5 mb-8">
          {hope.map((val, i) => (
            <Diamond key={`hope-${i}`} checked={val} onChange={() => toggleArrayItem(hope, setHope, i)} className="w-5 h-5" />
          ))}
        </div>

        <div className="bg-background border border-primary/20 p-4 relative">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary" />
          <h3 className="font-serif text-primary font-bold mb-1">Desta Vez Não</h3>
          <p className="font-sans text-sm italic text-foreground/80">Gaste 3 de Esperança para forçar um adversário dentro do alcance Longo a rolar novamente um ataque ou dado de dano.</p>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="bg-card p-6 border border-primary/30 clip-notch shadow-lg">
        <SectionHeader>Experiência</SectionHeader>
        <Divider />
        <div className="flex flex-col gap-4">
          {experiences.map((exp, i) => (
            <div key={i} className="flex items-end gap-4">
              <Diamond checked={exp.active} onChange={() => toggleExperience(i)} className="mb-1" />
              <InputLine value={exp.text} onChange={(v: string) => updateExperience(i, v)} placeholder="Escreva uma experiência..." className="flex-1" />
            </div>
          ))}
        </div>
      </section>

      {/* GOLD */}
      <section className="bg-card p-6 border border-primary/30 clip-notch shadow-lg">
        <SectionHeader>Ouro</SectionHeader>
        <Divider />
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <div className="font-mono text-[10px] text-primary tracking-widest uppercase w-20">Punhados</div>
            <div className="flex flex-wrap gap-2">
              {handfuls.map((val, i) => <Circle key={`h-${i}`} size={3} checked={val} onChange={() => toggleArrayItem(handfuls, setHandfuls, i)} />)}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="font-mono text-[10px] text-primary tracking-widest uppercase w-20">Sacos</div>
            <div className="flex flex-wrap gap-2.5">
              {bags.map((val, i) => <Circle key={`b-${i}`} size={4} checked={val} onChange={() => toggleArrayItem(bags, setBags, i)} />)}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="font-mono text-[10px] text-primary tracking-widest uppercase w-20">Baú</div>
            <Circle size={6} checked={chest} onChange={() => setChest(!chest)} />
          </div>
        </div>
      </section>

      {/* CLASS FEATURE */}
      <section className="bg-card p-6 border border-primary/30 clip-notch shadow-lg relative flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader>Habilidade de Classe</SectionHeader>

          {/* Edit / Preview toggle */}
          <div className="flex items-center bg-card border border-primary/20 rounded-sm overflow-hidden">
            <button
              onClick={() => setIsPreviewFeatures(false)}
              className={`px-4 py-1.5 font-mono text-[10px] tracking-widest uppercase transition-all ${
                !isPreviewFeatures
                  ? 'bg-primary text-background shadow-[0_0_10px_rgba(233,193,118,0.3)]'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Editar
            </button>
            <button
              onClick={() => setIsPreviewFeatures(true)}
              className={`px-4 py-1.5 font-mono text-[10px] tracking-widest uppercase transition-all ${
                isPreviewFeatures
                  ? 'bg-primary text-background shadow-[0_0_10px_rgba(233,193,118,0.3)]'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Visualizar
            </button>
          </div>
        </div>

        <Divider />

        <div className="bg-background/25 border border-primary/20 relative mt-4 clip-notch shadow-inner flex-1 min-h-[180px] flex flex-col">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/40" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/40" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary/40" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/40" />

          {!isPreviewFeatures ? (
            /* ── EDITOR MODE ── */
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="Escreva as habilidades de classe aqui... (suporte a Markdown)"
              className={[
                'w-full flex-1 bg-transparent text-foreground font-sans text-sm leading-relaxed',
                'focus:outline-none resize-none p-4 overflow-y-auto',
                'placeholder:text-muted-foreground/30',
              ].join(' ')}
              spellCheck
            />
          ) : (
            /* ── PREVIEW MODE ── */
            <div className="p-4 flex-1 overflow-y-auto min-h-0">
              {features.trim() ? (
                <div
                  className={[
                    'prose prose-invert max-w-none',
                    'prose-headings:font-serif prose-headings:text-primary prose-headings:tracking-wide prose-headings:mb-2 prose-headings:mt-6 first:prose-headings:mt-0',
                    'prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:mb-4',
                    'prose-strong:text-primary/90 prose-em:text-foreground/70',
                    'prose-blockquote:border-l-primary/50 prose-blockquote:text-muted-foreground prose-blockquote:italic',
                    'prose-code:text-primary prose-code:bg-primary/10 prose-code:rounded prose-code:px-1',
                    'prose-ul:text-foreground/85 prose-ol:text-foreground/85',
                  ].join(' ')}
                >
                  <ReactMarkdown>{features}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground/40 italic font-sans text-sm text-center pt-8">
                  Nenhuma habilidade escrita ainda. Alterne para o modo <strong>Editar</strong> para começar.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
