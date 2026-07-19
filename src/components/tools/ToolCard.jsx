import React, { useRef, useState } from 'react';
import {
  Star, ExternalLink, Edit, Trash2, Tag, Flame,
  GripVertical, Package, MoreHorizontal, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import ShareLinkDialog from '@/components/sharing/ShareLinkDialog';

export default function ToolCard({
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

  const categoryBarColors = {
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

  const pricingColors = {
    'חינם': 'bg-green-500',
    'בתשלום': 'bg-blue-500',
    'פרימיום': 'bg-purple-500',
    'פרימיום_מוגבל': 'bg-orange-500',
  };

  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, active: false, gx: 50, gy: 50 });

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el || isDragging) return;
    // בטל אפקט 3D במסכים קטנים / מגע - גורם לחיתוך הכרטיסים בנייד
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px), (pointer: coarse)').matches) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const ry = (px - 0.5) * 14;
    const rx = (0.5 - py) * 14;
    setTilt({ rx, ry, active: true, gx: px * 100, gy: py * 100 });
  };

  const resetTilt = () => setTilt({ rx: 0, ry: 0, active: false, gx: 50, gy: 50 });

  const handleVisit = () => {
    window.open(tool.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="h-full md:[perspective:1400px] py-2"
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
    >
      <div
        ref={cardRef}
        className={`
          group relative flex flex-col rounded-[26px] p-5 h-full antialiased cursor-pointer
          bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl
          border border-white/60 dark:border-white/10
          transition-[transform,box-shadow] duration-200 ease-out will-change-transform
          ${tilt.active
            ? 'shadow-[0_40px_70px_-20px_rgba(79,70,229,0.45)]'
            : 'shadow-[0_20px_40px_-24px_rgba(0,0,0,0.35)]'}
          ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
          ${tool.isFavorite ? 'ring-2 ring-yellow-400/70' : ''}
          ${onToggleSelect && isSelected ? 'ring-2 ring-indigo-500' : ''}
        `}
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) ${tilt.active ? 'scale(1.02)' : 'scale(1)'}`,
          transformStyle: 'preserve-3d',
        }}
        dir="rtl"
        role="article"
        aria-label={`כרטיס כלי: ${tool.name}`}
        onClick={() => onClick?.(tool)}
      >
        {/* השתקפות זכוכית דינמית שעוקבת אחרי העכבר */}
        <div
          className="absolute inset-0 rounded-[26px] pointer-events-none transition-opacity duration-300"
          style={{
            opacity: tilt.active ? 1 : 0,
            background: `radial-gradient(420px circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.55), transparent 45%)`,
          }}
        />

        {/* Drag Handle */}
        <div
          {...dragHandleProps}
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing md:flex hidden [transform:translateZ(50px)] z-20"
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

        {/* כותרת: לוגו צף + שם */}
        <div className="flex items-start gap-3 mb-4 [transform:translateZ(35px)]">
          {/* לוגו צף עם עומק */}
          <div
            className="relative flex-shrink-0"
            style={{ transform: 'translateZ(45px)' }}
          >
            {tool.logo ? (
              <>
                <img
                  src={tool.logo}
                  alt={`${tool.name} logo`}
                  className="w-16 h-16 rounded-2xl object-cover shadow-[0_16px_30px_-8px_rgba(79,70,229,0.6)] ring-1 ring-white/60"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 items-center justify-center shadow-[0_16px_30px_-8px_rgba(79,70,229,0.6)] ring-1 ring-white/60" style={{ display: 'none' }}>
                  <Package className="w-7 h-7 text-white" />
                </div>
              </>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_16px_30px_-8px_rgba(79,70,229,0.6)] ring-1 ring-white/60">
                <Package className="w-7 h-7 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 text-right">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white leading-tight line-clamp-2 break-words">
              {tool.name}
            </h3>
            {/* Badge קטגוריה */}
            {show('category') && (
              <span className="inline-flex items-center mt-1.5 px-3 py-1 rounded-full text-xs font-medium text-sky-700 bg-sky-100 border border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800 max-w-full truncate">
                {tool.category.replace(/_/g, ' ')}
              </span>
            )}

            {/* דירוג כוכבים */}
            {show('rating') && tool.rating > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(tool.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{tool.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* כוכב מועדפים צף */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(tool); }}
          className="absolute top-3 left-3 z-20 [transform:translateZ(55px)] w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center transition-transform hover:scale-110"
          aria-label={tool.isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
        >
          <Star className={`w-5 h-5 transition-all ${tool.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`} />
        </button>

        {/* תוכן */}
        <div className="relative flex flex-col flex-1 [transform:translateZ(25px)]">
          {/* תיאור */}
          {show('description') && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed text-right break-words mb-4">
              {tool.description || 'אין תיאור זמין'}
            </p>
          )}

          {/* תגיות עם מסגרת גרדיאנט */}
          {show('tags') && tool.tags && tool.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tool.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-transparent [background:linear-gradient(white,white)_padding-box,linear-gradient(to_left,#818cf8,#c084fc)_border-box] dark:[background:linear-gradient(#1f2937,#1f2937)_padding-box,linear-gradient(to_left,#818cf8,#c084fc)_border-box]"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
              {tool.tags.length > 3 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs text-gray-500 border border-gray-200 dark:border-gray-700">
                  +{tool.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* פס תמחור + פופולריות */}
          <div className="flex items-center justify-between gap-2 mb-3 mt-auto">
            {show('popularity') && tool.popularity >= 4 && (
              <div className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>פופולרי מאוד</span>
              </div>
            )}
            {show('pricing') && (
              <span className={`mr-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white ${pricingColors[tool.pricing] || 'bg-gray-500'}`}>
                {tool.pricing?.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          {/* כפתורי פעולה */}
          <div className="flex items-center gap-2 [transform:translateZ(30px)]">
            <Button
              onClick={(e) => { e.stopPropagation(); handleVisit(); }}
              className="flex-1 h-11 rounded-2xl bg-white/80 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-white hover:shadow-md font-semibold"
              variant="ghost"
              aria-label={`בקר באתר ${tool.name}`}
            >
              בקר באתר
            </Button>

            <div onClick={(e) => e.stopPropagation()} className="h-11 w-11 rounded-2xl bg-white/80 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center hover:bg-white transition-colors">
              <ShareLinkDialog tool={tool} iconOnly />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-11 w-11 p-0 rounded-2xl bg-white/80 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-white"
                  onClick={(e) => e.stopPropagation()}
                  title="עוד אפשרויות"
                >
                  <span className="sr-only">פתח תפריט</span>
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-sm">
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
    </div>
  );
}