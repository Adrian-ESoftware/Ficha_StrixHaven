import { useCharacter, type HakiData } from '@/lib/character-context';
import { SectionHeader } from './shared';

const PATHS = [
  { value: 'observation' as const, label: 'Observação' },
  { value: 'armament' as const, label: 'Armamento' },
  { value: 'akuma-no-mi' as const, label: 'Akuma no Mi' },
];

const ABILITIES = [
  {
    key: 'observation' as keyof HakiData,
    title: 'Haki de Observação',
    color: 'text-sky-400',
    border: 'border-sky-400/30',
    bg: 'bg-sky-400/5',
    levels: [
      {
        label: 'Fundamentação — Sentir a Presença',
        desc: 'Vantagem em Testes de Instinto para detectar criaturas invisíveis, ocultas ou camufladas. Uma vez por cena, gaste uma Esperança para perguntar ao Mestre quantas presenças relevantes você sente dentro do alcance Longe e qual parece ser a mais perigosa.',
      },
      {
        label: 'Avançado — Ver o Futuro',
        desc: 'Uma vez por cena, ao ser alvo de um ataque ou efeito hostil, marque uma Fadiga para ver breves segundos no futuro. Você ganha vantagem no teste de Evasão ou teste de reação contra esse efeito.',
      },
      {
        label: 'Maestria — Além do Futuro Imediato',
        desc: 'Uma vez por sessão, descreva como visualizou o resultado de uma escolha ou evento próximo. O Mestre deve revelar a consequência mais provável dessa escolha se ela for realizada nos próximos minutos.',
      },
    ],
  },
  {
    key: 'armament' as keyof HakiData,
    title: 'Haki de Armamento',
    color: 'text-red-400',
    border: 'border-red-400/30',
    bg: 'bg-red-400/5',
    levels: [
      {
        label: 'Fundamentação — Golpe Infundido',
        desc: 'Ao fazer um ataque Corpo a Corpo desarmado ou com arma física, marque uma Fadiga para infundir o ataque com Haki. O ataque adiciona +2 à rolagem de dano, ignora resistência física comum e afeta corpos de Logia normalmente.',
      },
      {
        label: 'Avançado — Guarda Endurecida',
        desc: 'Ao sofrer dano físico, marque uma Fadiga para endurecer sua pele, arma ou armadura. Role sua Proficiência e reduza o dano sofrido pelo resultado rolado.',
      },
      {
        label: 'Maestria — Destruição Interna',
        desc: 'Uma vez por descanso longo, ao obter sucesso em um ataque infundido com Haki de Armamento, gaste 2 de Esperança para projetar o Haki no interior do alvo. O ataque causa d12 de dano físico adicional usando sua Proficiência e ignora resistência física comum.',
      },
    ],
  },
  {
    key: 'conquerors' as keyof HakiData,
    title: 'Haki do Conquistador',
    color: 'text-amber-400',
    border: 'border-amber-400/30',
    bg: 'bg-amber-400/5',
    note: 'Disponível apenas no Patamar 4',
    levels: [
      {
        label: 'Fundamentação — Presença Soberana',
        desc: 'Uma vez por cena, faça um Teste de Presença contra todos os lacaios ou NPCs comuns dentro do alcance Próximo. Em caso de sucesso, eles ficam temporariamente Vulneráveis ou fogem da cena, à escolha do Mestre.',
      },
      {
        label: 'Avançado — Choque de Vontades',
        desc: 'Ao confrontar um adversário formidável, marque uma Fadiga para impor desvantagem ao próximo teste de ação ou ataque dele antes do fim da próxima rodada.',
      },
      {
        label: 'Maestria — Vontade Suprema',
        desc: 'Uma vez por descanso longo, faça um Teste de Presença contra todos os adversários dentro do alcance Próximo. Os alvos contra os quais obtiver sucesso sofrem d10 de dano mental usando sua Proficiência e ficam temporariamente Vulneráveis.',
      },
    ],
  },
];

export function HakiSection() {
  const { data, update, updateNested } = useCharacter();
  const haki = data.haki;

  const adjustWillPoints = (delta: number) => {
    const next = Math.max(0, haki.willPoints + delta);
    const spent = countSpent();
    if (delta < 0 && spent > next) return;
    updateNested('haki', { willPoints: next });
  };

  const countSpent = () => {
    let count = 0;
    for (const ab of ABILITIES) {
      const arr = haki[ab.key] as boolean[];
      if (Array.isArray(arr)) count += arr.filter(Boolean).length;
    }
    return count;
  };

  const toggleAbility = (key: keyof HakiData, index: number) => {
    const arr = [...(haki[key] as boolean[])];
    if (!arr[index]) {
      if (countSpent() >= haki.willPoints) return;
    }
    arr[index] = !arr[index];
    updateNested('haki', { [key]: arr });
  };

  const setMainPath = (path: 'observation' | 'armament' | 'akuma-no-mi') => {
    updateNested('haki', { mainPath: haki.mainPath === path ? undefined : path });
  };

  return (
    <div className="w-full mt-12">
      <SectionHeader>Sistema Universal de Haki</SectionHeader>
      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Pontos de Vontade</p>

      <p className="font-mono text-[10px] text-muted-foreground tracking-wide leading-relaxed mt-4 max-w-4xl">
        O Haki é uma força espiritual presente em todos os seres vivos. Neste sistema, ele faz parte de uma progressão paralela chamada <span className="text-primary">Pontos de Vontade</span>, compartilhada com Akuma no Mi. Cada habilidade marcada custa 1 Ponto de Vontade.
      </p>

      {/* Will Points Counter & Main Path */}
      <div className="flex flex-wrap items-start gap-8 mt-6 p-4 border border-primary/15 bg-primary/[0.02]">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Pontos de Vontade</span>
          <button
            type="button"
            onClick={() => adjustWillPoints(-1)}
            disabled={haki.willPoints <= 0}
            className="w-7 h-7 border border-primary/30 text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 flex items-center justify-center text-sm"
          >
            −
          </button>
          <span className="font-mono text-xl font-bold text-primary min-w-[2ch] text-center">{haki.willPoints}</span>
          <button
            type="button"
            onClick={() => adjustWillPoints(1)}
            className="w-7 h-7 border border-primary/30 text-primary hover:bg-primary/10 transition-colors flex items-center justify-center text-sm"
          >
            +
          </button>
          <span className="font-mono text-[10px] text-muted-foreground">
            ({countSpent()} gasto{countSpent() !== 1 ? 's' : ''})
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Caminho Principal</span>
          <div className="flex gap-1">
            {PATHS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setMainPath(p.value)}
                className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider border transition-colors ${
                  haki.mainPath === p.value
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-primary/20 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Abilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {ABILITIES.map((ab) => {
          const levels = haki[ab.key] as boolean[];
          return (
            <div key={ab.key} className={`border ${ab.border} ${ab.bg} p-4`}>
              <h3 className={`font-serif text-sm font-bold tracking-wider ${ab.color} mb-1`}>{ab.title}</h3>
              {ab.note && (
                <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-3">{ab.note}</p>
              )}
              <div className="space-y-3 mt-3">
                {ab.levels.map((level, i) => (
                  <label
                    key={i}
                    className={`flex items-start gap-3 cursor-pointer group ${!haki.willPoints && !levels[i] ? 'opacity-50' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={levels[i]}
                      onChange={() => toggleAbility(ab.key, i)}
                      disabled={!levels[i] && countSpent() >= haki.willPoints}
                      className="mt-0.5 shrink-0 accent-primary"
                    />
                    <div className="min-w-0">
                      <span className={`font-mono text-[11px] uppercase tracking-wider block ${ab.color} group-hover:brightness-125 transition-all`}>
                        {level.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground leading-relaxed block mt-0.5">
                        {level.desc}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tier progression reference */}
      <div className="mt-6 border border-primary/10 bg-background/30 p-4">
        <h4 className="font-mono text-[10px] text-primary uppercase tracking-widest mb-3">Progressão por Patamar</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[10px] font-mono text-muted-foreground leading-relaxed">
          <div>
            <span className="text-primary font-bold block mb-1">2º Patamar (Níveis 2–4)</span>
            No nível 2, receba 1 Ponto de Vontade.<br />
            • Fund. de Observação, Armamento ou Akuma no Mi<br />
            • Ou guarde o ponto para depois
          </div>
          <div>
            <span className="text-primary font-bold block mb-1">3º Patamar (Níveis 5–7)</span>
            No nível 5, receba 1 Ponto de Vontade.<br />
            • Avance o Caminho Principal para Avançado<br />
            • Ou Fund. de um segundo caminho<br />
            • Ou Crescimento da Akuma no Mi
          </div>
          <div>
            <span className="text-primary font-bold block mb-1">4º Patamar (Níveis 8–10)</span>
            No nível 8, receba 1 Ponto de Vontade.<br />
            • Avance o Caminho Principal para Maestria<br />
            • Ou Haki do Conquistador — Fundamentação<br />
            • Ou Avançado / Maestria do Conquistador
          </div>
        </div>
      </div>

      {/* Rules reference */}
      <div className="mt-3 border border-primary/10 bg-background/30 p-4">
        <h4 className="font-mono text-[10px] text-primary uppercase tracking-widest mb-2">Regras Universais</h4>
        <ul className="text-[10px] font-mono text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
          <li>Ativar qualquer habilidade de Haki consome pelo menos 1 de Fadiga, 1 de Esperança ou exige um teste bem-sucedido.</li>
          <li>O Haki de Armamento permite atingir o corpo físico real de usuários de Akuma no Mi do tipo Logia.</li>
          <li>O Haki do Conquistador só pode ser comprado no Patamar 4 e exige aprovação do Mestre e do grupo.</li>
          <li>O Caminho Principal pode alcançar Maestria antes dos demais. Caminhos secundários exigem treinamento adicional.</li>
        </ul>
      </div>
    </div>
  );
}
