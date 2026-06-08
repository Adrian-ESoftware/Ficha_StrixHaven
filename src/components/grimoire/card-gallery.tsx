import { useRef, useState } from 'react';
import { useCharacter } from '@/lib/character-context';

type CardSlot = {
  id: string;
  label?: string;
};

const ancestrySlots: CardSlot[] = [
  { id: 'ancestry-1' },
  { id: 'ancestry-2' },
];

const subclassSlots: CardSlot[] = [
  { id: 'subclass-foundation', label: 'Fundação' },
  { id: 'subclass-specialization', label: 'Especialização' },
  { id: 'subclass-mastery', label: 'Maestria' },
];

const loadoutSlots = Array.from({ length: 5 }, (_, index) => ({ id: `loadout-${index + 1}` }));
const vaultSlots = Array.from({ length: 5 }, (_, index) => ({ id: `vault-${index + 1}` }));

function EmptyCardMark() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="h-16 w-16 text-primary/60" aria-hidden="true">
      <path d="M18 48 43 23M25 52l-8-8 26-26 8 8-26 26Z" stroke="currentColor" strokeWidth="2.5" />
      <path d="m38 14 12 12M43 12l9 9M19 39l7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M13 18c8-7 18-7 25 0-8 0-13 4-15 11-1-5-4-8-10-11Z" fill="currentColor" opacity=".45" />
    </svg>
  );
}

function CardSlotView({ slot, onZoom }: { slot: CardSlot; onZoom: (image: string, title: string) => void }) {
  const { data, update, canEdit } = useCharacter();
  const inputRef = useRef<HTMLInputElement>(null);
  const image = data.cardGallery?.[slot.id];

  const selectCard = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        update('cardGallery', { ...data.cardGallery, [slot.id]: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const removeCard = () => {
    const nextGallery = { ...data.cardGallery };
    delete nextGallery[slot.id];
    update('cardGallery', nextGallery);
  };

  return (
    <div className="flex min-w-0 flex-col items-center gap-2">
      {slot.label && (
        <span className="font-serif text-sm font-bold tracking-wide text-primary/90 md:text-base">{slot.label}</span>
      )}
      <div className="group relative aspect-[5/7] w-full max-w-[150px]">
        <button
          type="button"
          disabled={!image && !canEdit}
          onClick={() => image ? onZoom(image, slot.label || 'Carta') : inputRef.current?.click()}
          className="h-full w-full overflow-hidden border border-primary/35 bg-background/45 shadow-[inset_0_0_25px_rgba(0,0,0,0.45),0_8px_18px_rgba(0,0,0,0.25)] transition-all enabled:hover:-translate-y-1 enabled:hover:border-primary/80 enabled:hover:shadow-[0_0_22px_rgba(233,193,118,0.22)] disabled:cursor-default"
          title={image ? 'Ampliar carta' : canEdit ? 'Selecionar imagem da carta' : 'Desbloqueie a edição para adicionar uma carta'}
        >
          {image ? (
            <img src={image} alt={slot.label || 'Carta'} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          ) : (
            <span className="flex h-full w-full flex-col items-center justify-center gap-3 text-primary/45">
              <EmptyCardMark />
              <span className="font-mono text-[8px] uppercase tracking-[0.2em]">Adicionar carta</span>
            </span>
          )}
        </button>
        {image && canEdit && (
          <div className="absolute -right-2 -top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-primary bg-background text-xs text-primary shadow-lg"
              title="Trocar carta"
            >
              ↻
            </button>
            <button
              type="button"
              onClick={removeCard}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-red-400/70 bg-background text-xs text-red-300 shadow-lg"
              title="Remover carta"
            >
              ×
            </button>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            selectCard(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </div>
    </div>
  );
}

function CardSection({ title, slots, onZoom, className = '' }: { title: string; slots: CardSlot[]; onZoom: (image: string, title: string) => void; className?: string }) {
  return (
    <section className={`relative border border-primary/25 bg-background/25 px-5 pb-5 pt-8 shadow-[inset_0_0_30px_rgba(0,0,0,0.2)] backdrop-blur-sm ${className}`}>
      <div className="absolute left-0 top-0 h-3 w-3 border-l border-t border-primary/70" />
      <div className="absolute right-0 top-0 h-3 w-3 border-r border-t border-primary/70" />
      <div className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-primary/70" />
      <div className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-primary/70" />
      <h3 className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 border border-primary/35 bg-card/95 px-5 py-1 font-serif text-xl font-bold tracking-wider text-primary shadow-[0_0_16px_rgba(233,193,118,0.15)]">
        {title}
      </h3>
      <div className={`grid gap-4 ${slots.length === 2 ? 'grid-cols-2' : slots.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-5'}`}>
        {slots.map((slot) => <CardSlotView key={slot.id} slot={slot} onZoom={onZoom} />)}
      </div>
    </section>
  );
}

export function CardGallery({ onClose }: { onClose: () => void }) {
  const { data, canEdit } = useCharacter();
  const [zoomedCard, setZoomedCard] = useState<{ image: string; title: string } | null>(null);
  const [zoom, setZoom] = useState(1);

  const openZoom = (image: string, title: string) => {
    setZoom(1);
    setZoomedCard({ image, title });
  };

  const changeZoom = (amount: number) => {
    setZoom((current) => Math.min(3, Math.max(0.5, Number((current + amount).toFixed(1)))));
  };

  return (
    <div className="relative max-h-[95vh] w-full max-w-[1450px] overflow-y-auto border border-primary/40 bg-card/80 p-6 text-foreground shadow-[0_0_60px_rgba(233,193,118,0.22)] backdrop-blur-xl md:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(233,193,118,0.12),transparent_45%)]" />
      <div className="relative">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Personagem: {data.name}</p>
            <h2 className="mt-1 font-serif text-3xl font-bold tracking-wider text-primary">Galeria de Cartas</h2>
          </div>
          <p className="max-w-sm font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {canEdit ? 'Clique em um espaço para adicionar a imagem de uma carta.' : 'Desbloqueie a edição para adicionar ou remover cartas.'}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
          <CardSection title="Ancestralidade" slots={ancestrySlots} onZoom={openZoom} />
          <CardSection title="Subclasse" slots={subclassSlots} onZoom={openZoom} />
        </div>

        <CardSection title="Loadout" slots={loadoutSlots} onZoom={openZoom} className="mt-10" />
        <CardSection title="Cofre" slots={vaultSlots} onZoom={openZoom} className="mt-10" />
      </div>

      <button
        type="button"
        onClick={onClose}
        className="fixed right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-primary bg-background/95 text-primary shadow-lg transition-colors hover:text-foreground"
        title="Fechar"
      >
        ×
      </button>

      {zoomedCard && (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center overflow-hidden bg-background/90 p-6 backdrop-blur-xl"
          onClick={() => setZoomedCard(null)}
          onWheel={(event) => {
            event.preventDefault();
            changeZoom(event.deltaY < 0 ? 0.1 : -0.1);
          }}
        >
          <div className="absolute left-1/2 top-5 z-30 flex -translate-x-1/2 items-center gap-2 border border-primary/35 bg-card/95 p-2 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => changeZoom(-0.1)} className="h-9 w-9 border border-primary/30 text-primary hover:bg-primary/10">−</button>
            <button type="button" onClick={() => setZoom(1)} className="min-w-16 h-9 border border-primary/30 px-3 font-mono text-xs text-primary hover:bg-primary/10">{Math.round(zoom * 100)}%</button>
            <button type="button" onClick={() => changeZoom(0.1)} className="h-9 w-9 border border-primary/30 text-primary hover:bg-primary/10">+</button>
            <button type="button" onClick={() => setZoomedCard(null)} className="ml-2 h-9 w-9 border border-primary/30 text-primary hover:bg-primary/10">×</button>
          </div>
          <img
            src={zoomedCard.image}
            alt={zoomedCard.title}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[80vh] max-w-[85vw] object-contain shadow-[0_0_45px_rgba(233,193,118,0.25)] transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          />
        </div>
      )}
    </div>
  );
}
