import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useCharacter, type CardData } from '@/lib/character-context';
import { IconPicker, renderLucideIcon } from './icon-picker';

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

// ─── Card Slot View (DnD) ───────────────────────────────────────────────────────

function CardSlotView({
  slot,
  onOpenDetail,
  onEdit,
}: {
  slot: CardSlot;
  onOpenDetail: (card: CardData, slotId: string) => void;
  onEdit: (slotId: string) => void;
}) {
  const { data, canEdit, update } = useCharacter();
  const card = data.cards?.[slot.id];

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: slot.id,
    disabled: !canEdit,
  });

  const { setNodeRef: setDraggableRef, attributes, listeners, isDragging, transform } = useDraggable({
    id: slot.id,
    disabled: !card || !canEdit,
  });

  const handleClick = () => {
    if (card) {
      onOpenDetail(card, slot.id);
    } else if (canEdit) {
      onEdit(slot.id);
    }
  };

  const dragStyle = card && canEdit
    ? {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.3 : undefined,
      }
    : undefined;

  return (
    <div className="flex min-w-0 flex-col items-center gap-2">
      {slot.label && (
        <span className="font-serif text-sm font-bold tracking-wide text-primary/90 md:text-base">{slot.label}</span>
      )}
      <div
        ref={setDroppableRef}
        className={`group relative aspect-[5/7] w-full max-w-[150px] transition-all duration-200 ${
          isOver && canEdit
            ? 'scale-105 ring-2 ring-primary ring-offset-2 ring-offset-card shadow-[0_0_18px_rgba(233,193,118,0.4)]'
            : ''
        }`}
      >
        <button
          ref={(node) => { if (card && canEdit) setDraggableRef(node); }}
          {...(card && canEdit ? { ...attributes, ...listeners } : {})}
          style={dragStyle}
          type="button"
          disabled={!card && !canEdit}
          onClick={handleClick}
          className={`h-full w-full overflow-hidden border border-primary/35 bg-background/45 shadow-[inset_0_0_25px_rgba(0,0,0,0.45),0_8px_18px_rgba(0,0,0,0.25)] transition-all enabled:hover:-translate-y-1 enabled:hover:border-primary/80 enabled:hover:shadow-[0_0_22px_rgba(233,193,118,0.22)] disabled:cursor-default ${
            card && canEdit ? 'cursor-grab touch-none' : ''
          }`}
          title={card ? card.name : canEdit ? 'Adicionar carta' : 'Espaço vazio'}
        >
          {card ? (
            <span className="flex h-full w-full flex-col items-center justify-center gap-2 p-2">
              {renderLucideIcon(card.icon, 'w-8 h-8 text-primary')}
              <span className="font-serif text-xs font-bold text-primary/90 text-center leading-tight line-clamp-2">
                {card.name}
              </span>
            </span>
          ) : (
            <span className="flex h-full w-full flex-col items-center justify-center gap-3 text-primary/45">
              <EmptyCardMark />
              <span className="font-mono text-[8px] uppercase tracking-[0.2em]">Adicionar carta</span>
            </span>
          )}
        </button>

        {card && canEdit && !isDragging && (
          <div className="absolute -right-2 -top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); onEdit(slot.id); }}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-primary bg-background text-xs text-primary shadow-lg"
              title="Editar carta"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                const next = { ...data.cards };
                delete next[slot.id];
                update('cards', next);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-red-400/70 bg-background text-xs text-red-300 shadow-lg"
              title="Remover carta"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Card Editor Modal ─────────────────────────────────────────────────────────

function CardEditor({
  slotId,
  onClose,
}: {
  slotId: string;
  onClose: () => void;
}) {
  const { data, update } = useCharacter();
  const existing = data.cards?.[slotId];
  const [icon, setIcon] = useState(existing?.icon || '');
  const [name, setName] = useState(existing?.name || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [domain, setDomain] = useState(existing?.domain || '');
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  const handleSave = () => {
    if (!name.trim() || !description.trim()) return;
    const card: CardData = { icon, name: name.trim(), description: description.trim() };
    if (domain.trim()) card.domain = domain.trim();
    update('cards', { ...data.cards, [slotId]: card });
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-background/85 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-card border border-primary/30 shadow-2xl w-full max-w-md"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-primary/20 px-4 py-3">
            <h3 className="font-serif text-primary text-sm font-bold tracking-widest uppercase">
              {existing ? 'Editar Carta' : 'Nova Carta'}
            </h3>
            <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-muted-foreground mb-1 uppercase tracking-wider">Ícone</label>
              <button
                type="button"
                onClick={() => setIsIconPickerOpen(true)}
                className="w-full flex items-center gap-3 border border-primary/30 bg-background px-3 py-2 text-foreground hover:border-primary/60 transition-colors"
              >
                {icon ? (
                  <>
                    {renderLucideIcon(icon, 'w-5 h-5 text-primary')}
                    <span className="text-xs font-mono">{icon}</span>
                  </>
                ) : (
                  <span className="text-xs font-mono text-muted-foreground">Clique para escolher um ícone</span>
                )}
              </button>
            </div>

            <div>
              <label htmlFor="card-name" className="block text-[10px] font-mono text-muted-foreground mb-1 uppercase tracking-wider">Nome *</label>
              <input
                id="card-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full bg-background border border-primary/30 px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary"
                placeholder="Nome da carta"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="card-desc" className="block text-[10px] font-mono text-muted-foreground mb-1 uppercase tracking-wider">Descrição *</label>
              <textarea
                id="card-desc"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                className="w-full bg-background border border-primary/30 px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary resize-none"
                placeholder="Descrição da carta"
              />
            </div>

            <div>
              <label htmlFor="card-domain" className="block text-[10px] font-mono text-muted-foreground mb-1 uppercase tracking-wider">Domínio</label>
              <input
                id="card-domain"
                type="text"
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                className="w-full bg-background border border-primary/30 px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary"
                placeholder="Ex: Arcana, Natural, Divina"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-primary/20 px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!name.trim() || !description.trim()}
              className="border border-primary bg-primary/10 px-4 py-2 text-xs font-mono uppercase text-primary hover:bg-primary/20 transition-colors disabled:opacity-40"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>

      <IconPicker
        isOpen={isIconPickerOpen}
        selected={icon}
        onSelect={(iconName) => {
          setIcon(iconName);
          setIsIconPickerOpen(false);
        }}
        onClose={() => setIsIconPickerOpen(false)}
      />
    </>
  );
}

// ─── Card Detail Overlay ───────────────────────────────────────────────────────

function CardDetail({
  card,
  slotId,
  canEdit,
  onEdit,
  onDelete,
  onClose,
}: {
  card: CardData;
  slotId: string;
  canEdit: boolean;
  onEdit: (slotId: string) => void;
  onDelete: (slotId: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-background/90 backdrop-blur-md z-[55] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-card border border-primary/40 p-8 shadow-[0_0_50px_rgba(233,193,118,0.3)] max-w-sm w-full flex flex-col items-center text-center"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-background border border-primary text-primary hover:text-foreground w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-lg z-10"
          title="Fechar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-4">
          {renderLucideIcon(card.icon, 'w-12 h-12 text-primary')}
        </div>

        <h2 className="font-serif text-primary text-xl font-bold tracking-wider mb-1">{card.name}</h2>

        {card.domain && (
          <span className="inline-block border border-primary/30 bg-primary/5 px-3 py-0.5 text-[10px] font-mono text-primary uppercase tracking-wider mb-4">
            {card.domain}
          </span>
        )}

        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
          {card.description}
        </p>

        {canEdit && (
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => { onClose(); onEdit(slotId); }}
              className="border border-primary bg-primary/10 px-4 py-2 text-xs font-mono uppercase text-primary hover:bg-primary/20 transition-colors"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => { onDelete(slotId); onClose(); }}
              className="border border-red-400/40 px-4 py-2 text-xs font-mono uppercase text-red-400 hover:bg-red-400/10 transition-colors"
            >
              Excluir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Card Section Wrapper ──────────────────────────────────────────────────────

function CardSection({
  title,
  slots,
  onOpenDetail,
  onEditSlot,
  className = '',
}: {
  title: string;
  slots: CardSlot[];
  onOpenDetail: (card: CardData, slotId: string) => void;
  onEditSlot: (slotId: string) => void;
  className?: string;
}) {
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
        {slots.map((slot) => (
          <CardSlotView key={slot.id} slot={slot} onOpenDetail={onOpenDetail} onEdit={onEditSlot} />
        ))}
      </div>
    </section>
  );
}

// ─── Drag Overlay Card ──────────────────────────────────────────────────────────

function DragOverlayCard({ card }: { card: CardData }) {
  return (
    <div className="aspect-[5/7] w-[150px] border-2 border-primary bg-card/95 shadow-[0_0_30px_rgba(233,193,118,0.35)] flex flex-col items-center justify-center gap-2 p-2 backdrop-blur-sm">
      {renderLucideIcon(card.icon, 'w-8 h-8 text-primary')}
      <span className="font-serif text-xs font-bold text-primary/90 text-center leading-tight line-clamp-2">
        {card.name}
      </span>
    </div>
  );
}

// ─── Main Card Gallery Export ──────────────────────────────────────────────────

export function CardGallery({ onClose }: { onClose: () => void }) {
  const { data, canEdit, update } = useCharacter();
  const [detailCard, setDetailCard] = useState<{ card: CardData; slotId: string } | null>(null);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [activeDrag, setActiveDrag] = useState<{ slotId: string; card: CardData } | null>(null);

  const handleOpenDetail = (card: CardData, slotId: string) => {
    setDetailCard({ card, slotId });
  };

  const handleEdit = (slotId: string) => {
    setDetailCard(null);
    setEditingSlotId(slotId);
  };

  const handleDelete = (slotId: string) => {
    const next = { ...data.cards };
    delete next[slotId];
    update('cards', next);
    setDetailCard(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = String(event.active.id);
    const card = data.cards[activeId];
    if (card) {
      setActiveDrag({ slotId: activeId, card });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDrag(null);

    const { active, over } = event;
    if (!canEdit || !over || active.id === over.id) return;

    const sourceId = String(active.id);
    const targetId = String(over.id);

    const sourceCard = data.cards[sourceId];
    if (!sourceCard) return;

    const targetCard = data.cards[targetId];

    const nextCards = { ...data.cards };

    if (targetCard) {
      nextCards[sourceId] = targetCard;
    } else {
      delete nextCards[sourceId];
    }
    nextCards[targetId] = sourceCard;

    update('cards', nextCards);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="relative max-h-[95vh] w-full max-w-[1450px] overflow-y-auto border border-primary/40 bg-card/80 p-6 text-foreground shadow-[0_0_60px_rgba(233,193,118,0.22)] backdrop-blur-xl md:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(233,193,118,0.12),transparent_45%)]" />
        <div className="relative">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Personagem: {data.name}</p>
              <h2 className="mt-1 font-serif text-3xl font-bold tracking-wider text-primary">Galeria de Cartas</h2>
            </div>
            <p className="max-w-sm font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {canEdit
                ? 'Arraste cartas entre espaços para reorganizar.'
                : 'Desbloqueie a edição para adicionar ou remover cartas.'}
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
            <CardSection title="Ancestralidade" slots={ancestrySlots} onOpenDetail={handleOpenDetail} onEditSlot={handleEdit} />
            <CardSection title="Subclasse" slots={subclassSlots} onOpenDetail={handleOpenDetail} onEditSlot={handleEdit} />
          </div>

          <CardSection title="Loadout" slots={loadoutSlots} onOpenDetail={handleOpenDetail} onEditSlot={handleEdit} className="mt-10" />
          <CardSection title="Cofre" slots={vaultSlots} onOpenDetail={handleOpenDetail} onEditSlot={handleEdit} className="mt-10" />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-primary bg-background/95 text-primary shadow-lg transition-colors hover:text-foreground"
          title="Fechar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {detailCard && (
          <CardDetail
            card={detailCard.card}
            slotId={detailCard.slotId}
            canEdit={canEdit}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClose={() => setDetailCard(null)}
          />
        )}

        {editingSlotId && (
          <CardEditor
            slotId={editingSlotId}
            onClose={() => setEditingSlotId(null)}
          />
        )}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDrag ? <DragOverlayCard card={activeDrag.card} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
