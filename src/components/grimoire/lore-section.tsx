import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { SectionHeader, Divider } from './shared';
import { useCharacter } from '@/lib/character-context';

export function LoreSection() {
  const { data, update } = useCharacter();
  const [isPreview, setIsPreview] = useState(true);

  return (
    <section className="w-full mt-12">
      {/* Section title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <SectionHeader>
            Lore de{' '}
            <span className="text-foreground/80">{data.name || 'Personagem'}</span>
          </SectionHeader>
          <p className="font-sans text-xs text-muted-foreground italic mt-1">
            Histórico, motivações e segredos do personagem — suporta formatação Markdown.
          </p>
        </div>

        {/* Edit / Preview toggle */}
        <div className="flex items-center bg-card border border-primary/20 rounded-sm overflow-hidden">
          <button
            onClick={() => setIsPreview(false)}
            className={`px-4 py-1.5 font-mono text-[10px] tracking-widest uppercase transition-all ${
              !isPreview
                ? 'bg-primary text-background shadow-[0_0_10px_rgba(233,193,118,0.3)]'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            Editar
          </button>
          <button
            onClick={() => setIsPreview(true)}
            className={`px-4 py-1.5 font-mono text-[10px] tracking-widest uppercase transition-all ${
              isPreview
                ? 'bg-primary text-background shadow-[0_0_10px_rgba(233,193,118,0.3)]'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            Visualizar
          </button>
        </div>
      </div>

      <Divider />

      {/* Editor / Preview area */}
      <div className="bg-card border border-primary/20 relative mt-4 clip-notch shadow-lg h-[450px] flex flex-col">

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/50" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/50" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary/50" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/50" />

        {!isPreview ? (
          /* ── EDITOR MODE ── */
          <div className="relative flex-1 flex flex-col min-h-0">
            {/* Markdown hint bar */}
            <div className="flex items-center gap-3 px-5 py-2 border-b border-primary/10 bg-background/30 shrink-0">
              {['**negrito**', '*itálico*', '## Título', '> Citação', '- Lista'].map((hint) => (
                <span
                  key={hint}
                  className="font-mono text-[9px] text-primary/50 tracking-wide select-none"
                >
                  {hint}
                </span>
              ))}
            </div>
            <textarea
              value={data.lore}
              onChange={(e) => update("lore", e.target.value)}
              placeholder="Escreva o lore do personagem aqui... (suporte a Markdown)"
              className={[
                'w-full flex-1 bg-transparent text-foreground font-sans text-sm leading-relaxed',
                'focus:outline-none resize-none p-6 overflow-y-auto',
                'placeholder:text-muted-foreground/30',
              ].join(' ')}
              spellCheck
            />
            {/* Character count */}
            <div className="absolute bottom-3 right-5 font-mono text-[9px] text-muted-foreground/40 select-none bg-card/85 px-1.5 py-0.5 rounded">
              {data.lore.length} caracteres
            </div>
          </div>
        ) : (
          /* ── PREVIEW MODE ── */
          <div className="p-6 flex-1 overflow-y-auto min-h-0">
            {data.lore.trim() ? (
              <div
                className={[
                  'prose prose-invert max-w-none',
                  // Primary-gold tinted headings
                  'prose-headings:font-serif prose-headings:text-primary prose-headings:tracking-wide',
                  // Body text
                  'prose-p:text-foreground/90 prose-p:leading-relaxed',
                  // Bold & italic
                  'prose-strong:text-primary/90 prose-em:text-foreground/70',
                  // Blockquote
                  'prose-blockquote:border-l-primary/50 prose-blockquote:text-muted-foreground prose-blockquote:italic',
                  // Code
                  'prose-code:text-primary prose-code:bg-primary/10 prose-code:rounded prose-code:px-1',
                  // Lists
                  'prose-ul:text-foreground/85 prose-ol:text-foreground/85',
                  // hr
                  'prose-hr:border-primary/20',
                ].join(' ')}
              >
                <ReactMarkdown>{data.lore}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-muted-foreground/40 italic font-sans text-sm text-center pt-16">
                Nada escrito ainda. Alterne para o modo <strong>Editar</strong> para começar.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
