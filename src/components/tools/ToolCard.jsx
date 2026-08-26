import React, { useState, useRef, useMemo, memo } from 'react';
import {
  Star, ExternalLink, Edit, Trash2, Tag, Flame,
  GripVertical, Package, MoreHorizontal, Check, Copy, Share2, Link2, GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import ShareLinkDialog from '@/components/sharing/ShareLinkDialog';
import { getContrastText } from '@/utils/contrast';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const CATEGORY_BAR_COLORS = {
  'עיבוד_שפה': 'from-blue-500 to-blue-400',
  'יצירת_תמונות': 'from-purple-500 to-fuchsia-400',
  'וידאו': 'from-pink-500 to-rose-400',
  'קוד': 'from-green-500 to-emerald-400',
  'עיצוב': 'from-orange-500 to-amber-400',
  'מחקר': 'from-cyan-500 to-sky-400',
  'פרודוקטיביות': 'from-indigo-500 to-violet-400',
  'אוטומציה': 'from-yellow-500 to-amber-400',
  'אנליטיקה': 'from-teal-500 to-cyan-400',
  'שיווק': 'from-rose-500 to-pink-400',
  'אחר': 'from-gray-400 to-gray-300',
};

const PRICING_COLORS = {
  'חינם': '#10b981',
  'בתשלום': '#3b82f6',
  'פרימיום': '#a855f7',
  'פרימיום_מוגבל': '#f97316',
};

function ToolCard({
  tool,
  onEdit,
  onDelete,
  onToggleFavorite,
  onClick,
  isDragging = false,
  dragHandleProps = {},
  isSelected = false,
  onToggleSelect,
  fieldVisibility = {}
}) {
  const show = (field) => fieldVisibility[field] !== false;
  const [showQuickActions, setShowQuickActions] = useState(false);
  const longPressTimer = useRef(null);
  const longPressTriggered = useRef(false);
  const navigate = useNavigate();

  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, active: false, gx: 50, gy: 50 });
  const isTouch = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px), (pointer: coarse)').matches, []);

  const rafRef = useRef(null);
  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el || isDragging || isTouch) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const ry = (px - 0.5) * 16;
      const rx = (0.5 - py) * 16;
      setTilt({ rx, ry, active: true, gx: px * 100, gy: py * 100 });
    });
  };

  const resetTilt = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setTilt({ rx: 0, ry: 0, active: false, gx: 50, gy: 50 });
  };

  const handleVisit = () => {
    window.open(tool.url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = (e) => {
    e?.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(tool.url || window.location.href);
      toast.success('הקישור הועתק');
    }
  };

  const handleQuickFavorite = (e) => {
    e?.stopPropagation();
    onToggleFavorite(tool);
    toast.success(tool.isFavorite ? 'הוסר ממועדפים' : 'נוסף למועדפים');
  };

  const startLongPress = (e) => {
    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      if (!longPressTriggered.current) {
        longPressTriggered.current = true;
        setShowQuickActions(true);
        // רטט אם נתמך
        if (navigator.vibrate) navigator.vibrate(50);
      }
    }, 500);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchMove = () => cancelLongPress();

  const handleTouchEnd = () => {
    cancelLongPress();
    // אם הלחיצה הארוכה הופעלה, נמנע את הקליק הרגיל
    if (longPressTriggered.current) {
      setTimeout(() => { longPressTriggered.current = false; }, 300);
    }
  };

  const FavoriteButton = ({ className = '' }) => (
    <button
      onClick={(e) => { e.stopPropagation(); onToggleFavorite(tool); }}
      className={`flex items-center justify-center transition-transform active:scale-90 hover:scale-110 ${className}`}
      aria-label={tool.isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
    >
      <Star className={`w-5 h-5 transition-all ${tool.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500 hover:text-yellow-400'}`} />
    </button>
  );

  return (
    <div
      className="h-full py-1 md:py-2 md:[perspective:1600px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
    >
      <div
        ref={cardRef}
        className={`
        group relative flex flex-col rounded-2xl p-4 sm:p-4 md:p-5 h-full antialiased cursor-pointer overflow-hidden
        bg-[#1a202d]/90 md:bg-[#1a202d]/70 md:backdrop-blur-xl
        border border-cyan-400/15
        transition-[transform,box-shadow,border-color] duration-200 ease-out will-change-transform
        active:scale-[0.98] md:active:scale-100
        hover:border-cyan-400/40
        ${tilt.active
          ? 'shadow-[0_50px_80px_-25px_rgba(0,212,255,0.25),0_25px_40px_-20px_rgba(52,152,219,0.15)]'
          : 'shadow-[0_8px_24px_-12px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_36px_-16px_rgba(0,212,255,0.15)]'}
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
        ${tool.isFavorite ? 'ring-1 ring-yellow-400/60 shadow-[0_0_24px_-4px_rgba(250,204,21,0.3)]' : ''}
        ${onToggleSelect && isSelected ? 'ring-1 ring-cyan-400' : ''}
        `}
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) ${tilt.active ? 'scale(1.03)' : 'scale(1)'}`,
          transformStyle: 'preserve-3d',
        }}
        dir="rtl"
        role="article"
        aria-label={`כרטיס כלי: ${tool.name}`}
        onClick={(e) => {
          if (longPressTriggered.current) { e.preventDefault(); e.stopPropagation(); return; }
          onClick?.(tool);
        }}
        onTouchStart={startLongPress}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={cancelLongPress}
      >
        {/* פס עליון זוהר בצבע הקטגוריה */}
        <div className={`absolute top-0 inset-x-0 h-0.5 bg-gradient-to-l ${CATEGORY_BAR_COLORS[tool.category] || CATEGORY_BAR_COLORS['אחר']} opacity-80`} />

        {/* השתקפות זכוכית דינמית */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
          style={{
            opacity: tilt.active ? 0.15 : 0,
            background: `radial-gradient(420px circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.5), transparent 45%)`,
          }}
        />

        {/* זוהר ציאני דינמי */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500"
          style={{
            opacity: tilt.active ? 0.5 : 0,
            background: `radial-gradient(300px circle at ${tilt.gx}% ${tilt.gy}%, rgba(0,212,255,0.1), transparent 60%)`,
          }}
        />

        {/* תאורה סביבתית עדינה במעבר עכבר */}
        <div className="tool-card-ambient rounded-2xl" />

        {/* Drag Handle - desktop only */}
        <div
          {...dragHandleProps}
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hidden md:flex [transform:translateZ(50px)] z-20"
          aria-label="גרור לסידור מחדש"
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>

        {/* checkbox - visible in compare mode */}
        {onToggleSelect && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSelect(tool); }}
            className={`absolute top-4 right-4 z-20 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all [transform:translateZ(50px)] ${
              isSelected ? 'bg-indigo-500 border-indigo-600' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
            }`}
            aria-label={`${isSelected ? 'בטל בחירה' : 'בחר'} ${tool.name}`}
          >
            {isSelected && <Check className="w-4 h-4 text-white" />}
          </button>
        )}

        {/* כותרת: לוגו + שם + מועדפים */}
        <div className="flex items-start gap-3 mb-3 md:mb-4 [transform:translateZ(35px)]">
          {/* לוגו */}
          <div
            className="relative flex-shrink-0"
            style={{ transform: 'translateZ(45px)' }}
          >
            {tool.logo ? (
              <>
                <img
                  src={tool.logo}
                  alt={`${tool.name} logo`}
                  className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl object-cover shadow-[0_0_20px_-4px_rgba(0,212,255,0.3)] ring-1 ring-cyan-400/20"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl bg-blue-600 items-center justify-center shadow-[0_0_20px_-4px_rgba(37,99,235,0.5)] ring-1 ring-cyan-400/20" style={{ display: 'none' }}>
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                </div>
              </>
            ) : (
              <div className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_0_20px_-4px_rgba(37,99,235,0.5)] ring-1 ring-cyan-400/20">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 text-right">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-base md:text-lg text-white leading-snug line-clamp-2 break-words">
                {tool.name}
              </h3>
              {/* מועדפים */}
              <div className="md:absolute md:top-3 md:left-3 md:[transform:translateZ(55px)] md:z-20 md:w-9 md:h-9 md:rounded-xl md:bg-white/5 md:flex md:items-center md:justify-center md:hover:scale-110 flex-shrink-0">
                <FavoriteButton className="w-9 h-9 md:w-5 md:h-5" />
              </div>
            </div>
            {/* Badge קטגוריה */}
            {show('category') && (
              <span className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-cyan-300 bg-cyan-400/10 border border-cyan-400/20 max-w-full truncate">
                {tool.category?.replace(/_/g, ' ')}
              </span>
            )}

            {/* דירוג כוכבים */}
            {show('rating') && tool.rating > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                        i < Math.round(tool.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs md:text-sm font-bold text-slate-200">{tool.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* תוכן */}
        <div className="relative flex flex-col flex-1 [transform:translateZ(25px)]">
          {/* תיאור */}
          {show('description') && (
            <p className="text-[13px] sm:text-sm text-slate-400 line-clamp-3 leading-relaxed text-right break-words mb-3">
              {tool.description || 'אין תיאור זמין'}
            </p>
          )}

          {/* תגיות */}
          {show('tags') && tool.tags && tool.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tool.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs text-slate-300 bg-white/5 border border-cyan-400/15"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
              {tool.tags.length > 3 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs text-slate-500 border border-cyan-400/15">
                  +{tool.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* פס תמחור + פופולריות */}
          <div className="flex items-center justify-between gap-2 mb-3 mt-auto">
            {show('popularity') && tool.popularity >= 4 && (
              <div className="inline-flex items-center gap-1.5 text-xs md:text-sm text-slate-400">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>פופולרי מאוד</span>
              </div>
            )}
            {show('pricing') && (
              <span
                className="mr-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: PRICING_COLORS[tool.pricing] || '#6b7280', color: getContrastText(PRICING_COLORS[tool.pricing] || '#6b7280') }}
              >
                {tool.pricing?.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          {/* כפתורי פעולה */}
          <div className="flex items-center gap-2 [transform:translateZ(30px)]">
            <Button
              onClick={(e) => { e.stopPropagation(); handleVisit(); }}
              className="flex-1 h-10 sm:h-11 rounded-xl bg-blue-600 text-white border border-cyan-400/20 hover:bg-blue-500 hover:shadow-[0_0_16px_-4px_rgba(37,99,235,0.5)] font-semibold text-sm"
              aria-label={`בקר באתר ${tool.name}`}
            >
              בקר באתר
            </Button>

            <div onClick={(e) => e.stopPropagation()} className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-white/5 border border-cyan-400/15 flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0">
              <ShareLinkDialog tool={tool} iconOnly />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 w-10 sm:h-11 sm:w-11 p-0 rounded-xl bg-white/5 border border-cyan-400/15 hover:bg-white/10 text-slate-300 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                  title="עוד אפשרויות"
                >
                  <span className="sr-only">פתח תפריט</span>
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 text-sm">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleQuickFavorite(e); }}>
                  <Star className={`w-4 h-4 ml-2 ${tool.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  {tool.isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCopyLink(e); }}>
                  <Link2 className="w-4 h-4 ml-2" />
                  העתק קישור
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/tool-mastery/${tool.id}`); }}>
                  <GraduationCap className="w-4 h-4 ml-2" />
                  סיכום מיומנות
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(tool); }}>
                  <Edit className="w-4 h-4 ml-2" />
                  עריכה
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleVisit(); }}>
                  <ExternalLink className="w-4 h-4 ml-2" />
                  פתח באתר
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onDelete(tool); }}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  מחיקה
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* תפריט פעולות מהירות בלחיצה ארוכה (מובייל) */}
      <Drawer open={showQuickActions} onOpenChange={setShowQuickActions}>
        <DrawerContent className="rounded-t-2xl bg-[#0e1118] border-t border-cyan-400/20" dir="rtl">
          <DrawerHeader>
            <DrawerTitle className="text-right">פעולות מהירות — {tool.name}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-between rounded-2xl min-h-[54px]"
              onClick={(e) => { handleQuickFavorite(e); setShowQuickActions(false); }}
            >
              <span>{tool.isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}</span>
              <Star className={`w-5 h-5 ${tool.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between rounded-2xl min-h-[54px]"
              onClick={(e) => { handleCopyLink(e); setShowQuickActions(false); }}
            >
              <span>העתק קישור</span>
              <Copy className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between rounded-2xl min-h-[54px]"
              onClick={() => { setShowQuickActions(false); navigate(`/tool-mastery/${tool.id}`); }}
            >
              <span>סיכום מיומנות</span>
              <GraduationCap className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between rounded-2xl min-h-[54px]"
              onClick={() => { setShowQuickActions(false); setTimeout(() => onEdit(tool), 200); }}
            >
              <span>עריכה</span>
              <Edit className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between rounded-2xl min-h-[54px]"
              onClick={() => { setShowQuickActions(false); setTimeout(() => handleVisit(), 200); }}
            >
              <span>פתח באתר</span>
              <ExternalLink className="w-5 h-5" />
            </Button>
            <Button
              variant="destructive"
              className="w-full justify-between rounded-2xl min-h-[54px]"
              onClick={() => { setShowQuickActions(false); setTimeout(() => onDelete(tool), 200); }}
            >
              <span>מחיקה</span>
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export default memo(ToolCard);