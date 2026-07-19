import React, { useRef, useState } from 'react';
import { 
  Star, ExternalLink, Edit, Trash2, Tag, TrendingUp, 
  GripVertical, Eye, Package, MessageSquare, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  onToggleSelect
}) {

  const categoryColors = {
    'עיבוד_שפה': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'יצירת_תמונות': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'וידאו': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    'קוד': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'עיצוב': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'מחקר': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    'פרודוקטיביות': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    'אוטומציה': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'אנליטיקה': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    'שיווק': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
    'אחר': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };

  const pricingColors = {
    'חינם': 'bg-green-500',
    'בתשלום': 'bg-blue-500',
    'פרימיום': 'bg-purple-500',
    'פרימיום_מוגבל': 'bg-orange-500',
  };

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

  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, active: false });

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el || isDragging) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    // נטייה עדינה (~6 מעלות) לתחושת עומק תלת-ממדית
    const ry = (px - 0.5) * 12;
    const rx = (0.5 - py) * 12;
    setTilt({ rx, ry, active: true });
  };

  const resetTilt = () => setTilt({ rx: 0, ry: 0, active: false });

  const handleVisit = () => {
    window.open(tool.url, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsAppShare = () => {
    const text = `${tool.name}\n${tool.description}\n${tool.url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="h-full [perspective:1200px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
    >
      <div 
        ref={cardRef}
        className={`
          group relative flex flex-col glass-effect rounded-2xl p-4 sm:p-5 h-full overflow-hidden antialiased
          transition-transform duration-200 ease-out cursor-pointer will-change-transform
          border border-gray-200 dark:border-gray-700 
          shadow-md dark:shadow-lg hover:shadow-2xl dark:hover:shadow-[0_25px_50px_rgba(0,0,0,0.55)]
          ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
          ${tool.isFavorite ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''}
          ${onToggleSelect && isSelected ? 'ring-2 ring-indigo-500' : ''}
          hover:border-indigo-300 dark:hover:border-indigo-700
        `}
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) ${tilt.active ? 'scale(1.02)' : 'scale(1)'}`,
          transformStyle: 'preserve-3d',
        }}
        dir="rtl"
        role="article"
        aria-label={`כרטיס כלי: ${tool.name}`}
        onClick={() => {
          onClick?.(tool);
        }}
      >
        {/* פס צבע קטגוריה עליון */}
        <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-l ${categoryBarColors[tool.category] || categoryBarColors['אחר']}`} />

        {/* זוהר עדין ב-hover */}
        <div className="absolute -top-24 -left-20 w-48 h-48 rounded-full bg-indigo-400/0 group-hover:bg-indigo-400/20 blur-3xl transition-all duration-500 pointer-events-none" />

        {/* השתקפות זכוכית עדינה שמופיעה ב-hover */}
        <div className={`absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-tl from-white/0 via-white/0 to-white/40 dark:to-white/10 transition-opacity duration-300 ${tilt.active ? 'opacity-100' : 'opacity-0'}`} />

        {/* Drag Handle */}
        <div 
          {...dragHandleProps}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing md:flex hidden [transform:translateZ(40px)]"
          aria-label="גרור לסידור מחדש"
        >
          <GripVertical className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
        </div>

        {/* checkbox - visible in compare mode */}
        {onToggleSelect && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(tool);
            }}
            className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
              isSelected 
                ? 'bg-indigo-500 border-indigo-600' 
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
            }`}
            aria-label={`${isSelected ? 'בטל בחירה' : 'בחר'} ${tool.name}`}
          >
            {isSelected && <Check className="w-4 h-4 text-white" />}
          </button>
        )}

        {/* כוכב מועדפים */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(tool);
          }}
          className={`absolute top-2 left-2 sm:top-3 sm:left-3 z-10 p-2 sm:p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-target ${onToggleSelect ? 'top-10 sm:top-12' : ''}`}
          aria-label={tool.isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
        >
          <Star 
            className={`w-4 sm:w-5 h-4 sm:h-5 transition-all ${
              tool.isFavorite 
                ? 'fill-yellow-400 text-yellow-400 scale-110' 
                : 'text-gray-400 hover:text-yellow-400'
            }`}
          />
        </button>

        {/* תוכן הכרטיס */}
        <div className={`relative flex flex-col flex-1 space-y-3 sm:space-y-4 [transform:translateZ(30px)] ${onToggleSelect ? 'mt-9' : 'mt-6'}`}>
          {/* לוגו ושם */}
          <div className="flex items-start gap-3">
            {tool.logo ? (
              <img 
                src={tool.logo} 
                alt={`${tool.name} logo`}
                className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl object-cover shadow-sm md:shadow-md flex-shrink-0"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm md:shadow-md flex-shrink-0" style={tool.logo ? {display: 'none'} : {}}>
              <Package className="w-4 sm:w-4.5 md:w-5 h-4 sm:h-4.5 md:h-5 text-white" />
            </div>
          
            <div className="flex-1 min-w-0 text-right">
              <h3 className="font-bold text-base md:text-lg text-gray-900 dark:text-white leading-tight line-clamp-2 break-words">
                {tool.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <Badge className={`${categoryColors[tool.category]} text-xs max-w-full truncate`}>
                  {tool.category.replace(/_/g, ' ')}
                </Badge>
                {tool.rating > 0 && (
                  <div className="flex items-center gap-0.5 text-xs sm:text-sm text-amber-500">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                    <span className="font-medium">{tool.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* תיאור */}
          <p className="flex-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed text-right break-words">
            {tool.description || 'אין תיאור זמין'}
          </p>

          {/* הערות אישיות */}
          {tool.personalNotes && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md sm:rounded-lg p-1.5 sm:p-2 md:p-3 text-right">
              <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-1 sm:line-clamp-2">
                <span className="font-semibold">הערות:</span> {tool.personalNotes}
              </p>
            </div>
          )}

          {/* תגיות */}
          {tool.tags && tool.tags.length > 0 && (
            <div className="flex flex-wrap gap-0.5 sm:gap-1 md:gap-1.5">
              {tool.tags.slice(0, 2).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs bg-gray-50 dark:bg-gray-800"
                >
                  <Tag className="w-2.5 h-2.5 ml-0.5 md:ml-1" />
                  {tag}
                </Badge>
              ))}
              {tool.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{tool.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* מידע נוסף */}
          <div className="flex items-center justify-between pt-3 mt-auto border-t border-gray-200 dark:border-gray-700 gap-2" dir="rtl">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1 overflow-hidden">
              {/* תמחור */}
              <div className="flex items-center gap-0.5">
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${pricingColors[tool.pricing]} flex-shrink-0`} />
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {tool.pricing}
                </span>
              </div>

              {/* פופולריות */}
              {tool.popularity > 0 && (
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-green-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {tool.popularity}/5
                  </span>
                </div>
              )}
            </div>

            {/* כפתורי פעולה */}
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0 overflow-x-auto scrollbar-hide pb-1 max-w-full">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleVisit();
                }}
                className="h-8 sm:h-9 md:h-10 w-8 sm:w-9 md:w-10 p-0 touch-target"
                aria-label={`בקר באתר ${tool.name}`}
                title="בקר באתר"
              >
                <Eye className="w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5" />
              </Button>
              
              <div onClick={(e) => e.stopPropagation()}>
                <ShareLinkDialog tool={tool} iconOnly />
              </div>

              {/* כפתור שיתוף ב-WhatsApp */}
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleWhatsAppShare();
                }}
                className="h-8 sm:h-9 md:h-10 w-8 sm:w-9 md:w-10 p-0 touch-target text-green-600 dark:text-green-400"
                title="שתף בוואטסאפ"
              >
                <MessageSquare className="w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 sm:h-9 md:h-10 w-8 sm:w-9 md:w-10 p-0 touch-target"
                    onClick={(e) => e.stopPropagation()}
                    title="עוד אפשרויות"
                  >
                    <span className="sr-only">פתח תפריט</span>
                    <span className="text-base sm:text-lg">⋮</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 sm:w-44 md:w-48 text-sm">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onEdit(tool);
                  }}>
                    <Edit className="w-4 h-4 ml-2" />
                    עריכה
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleVisit();
                  }}>
                    <ExternalLink className="w-4 h-4 ml-2" />
                    פתח באתר
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(tool);
                    }}
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
    </div>
  );
}