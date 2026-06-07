import { useState, useEffect } from 'react';
import { HeaderStats } from '@/components/grimoire/header-stats';
import { LeftColumn } from '@/components/grimoire/left-column';
import { RightColumn } from '@/components/grimoire/right-column';
import { LoreSection } from '@/components/grimoire/lore-section';
import { LevelUpSection } from '@/components/grimoire/level-up-section';
import { Divider } from '@/components/grimoire/shared';
import conceptImg from '@/components/imgs/concept.png';
import { CharacterProvider, useCharacter } from '@/lib/character-context';

export default function Home() {
  const [characterId, setCharacterId] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let id = searchParams.get('id');
    
    if (!id) {
      // Gerar um ID aleatorio amigavel de 6 digitos
      id = Math.random().toString(36).substring(2, 8);
      const newUrl = `${window.location.pathname}?id=${id}`;
      window.history.replaceState({ path: newUrl }, '', newUrl);
    }
    setCharacterId(id);
  }, []);

  if (!characterId) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-primary text-sm tracking-widest uppercase">Inicializando Grimório...</span>
        </div>
      </div>
    );
  }

  return (
    <CharacterProvider characterId={characterId}>
      <GrimoireSheet />
    </CharacterProvider>
  );
}

function GrimoireSheet() {
  const { data, saveStatus, characterId } = useCharacter();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground relative overflow-hidden py-12 px-4 md:px-8 lg:px-12 selection:bg-primary/30">
      {/* Decorative noise overlay handled in index.css body::before */}
      
      {/* Outer grimoire frame */}
      <div className="max-w-[1360px] mx-auto relative z-10">
        
        {/* Subtle decorative corners for the whole page */}
        <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-primary/40" />
        <div className="absolute -top-4 -right-4 w-12 h-12 border-t-2 border-r-2 border-primary/40" />
        <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b-2 border-l-2 border-primary/40" />
        <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-primary/40" />

        {/* Auto-save & Status indicator */}
        <div className="absolute top-2 right-4 flex items-center gap-3 z-20">
          <span className="font-mono text-[9px] text-muted-foreground/60 tracking-wider">
            ID: <span className="text-primary/70 select-all">{characterId}</span>
          </span>
          {saveStatus === 'saving' && (
            <span className="text-primary animate-pulse text-[10px] font-mono tracking-widest uppercase">
              ✦ Salvando...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-emerald-400 text-[10px] font-mono tracking-widest uppercase">
              ✓ Salvo
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-400 text-[10px] font-mono tracking-widest uppercase">
              ⚠ Erro ao salvar
            </span>
          )}
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-primary/20 p-6 md:p-10 shadow-2xl">
          
          <HeaderStats />

          <div className="flex flex-col lg:flex-row mt-12 gap-8 lg:gap-0 items-stretch">
            <div className="w-full lg:w-[45%] flex flex-col">
              <LeftColumn />
            </div>
            
            <div className="w-full lg:w-[55%] flex flex-col">
              <RightColumn />
            </div>
          </div>

          {/* Lore separator */}
          <div className="mt-12">
            <Divider />
          </div>

          {/* Lore Section */}
          <LoreSection />

          {/* Level Up separator */}
          <div className="mt-12">
            <Divider />
          </div>

          {/* Level Up Section */}
          <LevelUpSection />
          
        </div>
      </div>

      {/* Floating page-flip button for Concept Art */}
      <button 
        onClick={() => setIsOverlayOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-card/90 backdrop-blur-md border-y-2 border-l-2 border-primary text-primary hover:text-foreground pl-4 pr-3 py-8 rounded-l-2xl transition-all duration-300 shadow-[0_0_25px_rgba(233,193,118,0.25)] hover:shadow-[0_0_35px_rgba(233,193,118,0.45)] hover:pl-6 group cursor-pointer flex flex-col items-center gap-2"
        title="Visualizar Concept Art"
      >
        <span className="font-mono text-[11px] font-bold tracking-widest uppercase [writing-mode:vertical-lr] text-primary group-hover:text-foreground transition-colors">Concept Art</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6 animate-pulse group-hover:translate-x-0.5 transition-transform mt-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Overlay Modal for Concept Art */}
      {isOverlayOpen && (
        <div 
          className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8 animate-fade-in"
          onClick={() => setIsOverlayOpen(false)}
        >
          <div 
            className="relative bg-card border-2 border-primary/30 p-3 shadow-[0_0_50px_rgba(233,193,118,0.3)] clip-notch max-w-[95vw] max-h-[95vh] md:max-w-[85vw] md:max-h-[90vh] flex items-center justify-center animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Corner decorations */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-primary" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-primary" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-primary" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-primary" />
            
            <img 
              src={conceptImg} 
              alt="Character Concept Art" 
              className="max-w-full max-h-[80vh] md:max-h-[85vh] object-contain border border-primary/20 bg-background shadow-inner" 
            />
            
            {/* Close button */}
            <button 
              onClick={() => setIsOverlayOpen(false)}
              className="absolute -top-4 -right-4 bg-background border border-primary text-primary hover:text-foreground w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-lg z-10 hover:shadow-primary/20"
              title="Fechar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
