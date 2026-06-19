import { useState, useMemo, type FormEvent } from 'react';
import * as LucideIcons from 'lucide-react';

const COMMON_ICONS = [
  'Sword', 'Shield', 'Skull', 'Heart', 'Sparkles', 'Flame', 'Zap', 'Star',
  'Moon', 'Sun', 'CloudRain', 'Wind', 'Mountain', 'TreePine', 'Leaf',
  'BookOpen', 'Scroll', 'Pen', 'Wand', 'Key', 'Lock', 'Gem', 'Crown',
  'Eye', 'Brain', 'Hand', 'Footprints', 'Swords', 'ShieldCheck', 'ShieldAlert',
  'Crosshair', 'Target', 'Award', 'Trophy', 'Medal', 'Ribbon', 'Badge',
  'Anchor', 'Ship', 'Compass', 'Map', 'Globe', 'Home', 'Castle', 'Tower',
  'Church', 'Store', 'Warehouse', 'Factory', 'Hammer', 'Wrench', 'Bolt',
  'Cog', 'Atom', 'Flask', 'TestTube', 'Microscope', 'Telescope',
  'Users', 'User', 'UserPlus', 'UserX', 'Baby', 'PersonStanding',
  'Music', 'Headphones', 'Mic', 'Radio', 'Tv', 'Monitor', 'Smartphone',
  'Camera', 'Image', 'Video', 'Film', 'Clapperboard',
  'ChessKing', 'ChessQueen', 'ChessRook', 'ChessBishop', 'ChessKnight', 'ChessPawn',
  'Dice1', 'Dice5', 'Dices', 'Gamepad', 'Joystick', 'Puzzle',
  'Bow', 'ArrowUp', 'Cross', 'Church', 'Prayer',
  'Ghost', 'Bat', 'Spider', 'Bug', 'Snail', 'Fish', 'Bird', 'Cat', 'Dog',
  'PawPrint', 'Bone', 'Apple', 'Carrot', 'Beef', 'Wine', 'Beer', 'Coffee',
  'Umbrella', 'Bike', 'Car', 'Truck', 'Plane', 'Rocket',
  'Cloud', 'CloudLightning', 'Snowflake', 'Waves', 'Droplet',
  'Fingerprint', 'Scan', 'Barcode', 'QrCode', 'Ticket', 'Receipt',
  'Banknote', 'Coins', 'Wallet', 'CreditCard', 'ShoppingCart', 'ShoppingBag',
  'Building', 'Building2', 'Factory', 'Ship', 'Anchor',
  'Armchair', 'Bed', 'Lamp', 'Lightbulb', 'Candle',
  'Clock', 'Hourglass', 'Calendar', 'AlarmClock',
  'Bell', 'BellRing', 'MessageCircle', 'MessageSquare', 'Mail', 'Phone',
  'Send', 'Share', 'Bookmark', 'Heart', 'ThumbsUp', 'ThumbsDown',
  'AlertTriangle', 'AlertCircle', 'AlertOctagon', 'Info', 'HelpCircle',
  'Check', 'CheckCircle', 'X', 'XCircle', 'Ban', 'CircleX',
  'Plus', 'Minus', 'Equal', 'Divide', 'Percent', 'Hash',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'ChevronUp', 'ChevronDown', 'ChevronLeft', 'ChevronRight',
  'RotateCw', 'RotateCcw', 'RefreshCw', 'Repeat', 'Shuffle',
  'Play', 'Pause', 'StopCircle', 'SkipForward', 'SkipBack',
  'Volume2', 'VolumeX', 'Mic', 'MicOff',
  'Wifi', 'Bluetooth', 'Battery', 'Plug', 'Usb', 'Printer',
  'Search', 'ZoomIn', 'ZoomOut', 'Eye', 'EyeOff',
  'Lock', 'Unlock', 'Key', 'FileKey',
  'Trash', 'Trash2', 'Archive', 'Folder', 'FolderOpen',
  'Copy', 'Clipboard', 'Scissors', 'Files', 'File',
  'Download', 'Upload', 'Cloud', 'Database', 'Server',
  'Code', 'Terminal', 'Braces', 'Binary', 'FileCode',
  'ChartBar', 'ChartLine', 'ChartPie', 'TrendingUp', 'TrendingDown',
  'Paintbrush', 'Palette', 'Pencil', 'Eraser', 'Ruler',
  'Shirt', 'Glasses', 'Watch', 'Ring', 'Necklace',
  'Backpack', 'Briefcase', 'Luggage', 'Package', 'Gift',
  'Cookie', 'Cake', 'Candy', 'Popcorn', 'Pizza',
  'Drum', 'Guitar', 'Piano', 'Speaker', 'Radio',
  'Tent', 'Torch', 'CookingPot', 'Utensils', 'Knife',
  'Shovel', 'Axe', 'Pickaxe', 'Drill', 'Screwdriver',
];

function renderLucideIcon(iconName: string, className?: string) {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
  if (!IconComponent) return <div className={className} />;
  return <IconComponent className={className} />;
}

export { renderLucideIcon };

export function IconPicker({
  isOpen,
  selected,
  onSelect,
  onClose,
}: {
  isOpen: boolean;
  selected: string;
  onSelect: (iconName: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');

  const filteredIcons = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return COMMON_ICONS;
    return COMMON_ICONS.filter((name) => name.toLowerCase().includes(q));
  }, [search]);

  const handleClear = () => {
    onSelect('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-background/85 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-primary/30 shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-primary/20 px-4 py-3">
          <h3 className="font-serif text-primary text-sm font-bold tracking-widest uppercase">Escolher Ícone</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-3 border-b border-primary/10">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar ícone..."
            autoFocus
            className="w-full bg-background border border-primary/20 px-3 py-2 text-foreground text-sm font-mono focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {selected && (
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Atual:</span>
              <span className="inline-flex items-center gap-1 text-primary">
                {renderLucideIcon(selected, 'w-5 h-5')}
                <span className="text-xs font-mono">{selected}</span>
              </span>
              <button
                type="button"
                onClick={handleClear}
                className="ml-auto text-[10px] font-mono text-red-400 hover:text-red-300 uppercase tracking-wider"
              >
                Limpar
              </button>
            </div>
          )}

          {filteredIcons.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">Nenhum ícone encontrado.</p>
          ) : (
            <div className="grid grid-cols-8 gap-1">
              {filteredIcons.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => onSelect(name)}
                  title={name}
                  className={`flex items-center justify-center w-10 h-10 rounded transition-all ${
                    name === selected
                      ? 'bg-primary/20 border border-primary text-primary shadow-[0_0_10px_rgba(233,193,118,0.3)]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-primary/10 border border-transparent'
                  }`}
                >
                  {renderLucideIcon(name, 'w-5 h-5')}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
