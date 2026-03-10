import React, { useState } from 'react';
import { 
  Star, ExternalLink, Edit, Trash2, Tag, TrendingUp, 
  Copy, Check, GripVertical, Eye, Share2, BarChart3, DollarSign, Package, MessageCircle,
  MessageSquare
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
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

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
  const [copied, setCopied] = useState(false);

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

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?tool=${tool.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('הקישור הועתק ללוח');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('שגיאה בהעתקת הקישור');
    }
  };

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
      className={`
        group relative glass-effect rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5
        transition-all duration-300 hover-lift cursor-pointer
        border border-gray-200 dark:border-gray-700 
        shadow-md dark:shadow-lg hover:shadow-lg dark:hover:shadow-xl
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
        ${tool.isFavorite ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''}
        ${onToggleSelect && isSelected ? 'ring-2 ring-indigo-500' : ''}
      `}
      role="article"
      aria-label={`כרטיס כלי: ${tool.name}`}
      onClick={() => {
        base44.functions.invoke('trackToolUsage', { toolId: tool.id, actionType: 'click' }).catch(() => {});
        onClick?.(tool);
      }}
    >
      {/* Drag Handle */}
      <div 
        {...dragHandleProps}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing md:flex hidden"
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
      <div className={`space-y-2 sm:space-y-3 md:space-y-4 ${onToggleSelect ? 'mt-8 sm:mt-8' : 'mt-5 sm:mt-6'}`}>
        {/* לוגו ושם */}
        <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
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
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm sm:text-base md:text-lg text-gray-900 dark:text-white truncate leading-tight">
              {tool.name}
            </h3>
            <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
              <Badge className={`${categoryColors[tool.category]} text-xs`}>
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
        <p className="text-xs sm:text-xs md:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 md:line-clamp-3 leading-tight sm:leading-relaxed">
          {tool.description || 'אין תיאור זמין'}
        </p>

        {/* הערות אישיות */}
        {tool.personalNotes && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-md sm:rounded-lg p-1.5 sm:p-2 md:p-3">
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
        <div className="flex items-center justify-between pt-1.5 sm:pt-2 md:pt-3 border-t border-gray-200 dark:border-gray-700 gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
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
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
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
            
            {/* כפתור העתקת קישור */}
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              className="h-8 sm:h-9 md:h-10 w-8 sm:w-9 md:w-10 p-0 touch-target"
              title={copied ? 'הועתק!' : 'העתק קישור'}
            >
              {copied ? (
                <Check className="w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5 text-green-500" />
              ) : (
                <Copy className="w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5" />
              )}
            </Button>

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

      {/* אפקט hover - לא מסתיר תוכן */}
      {/* אפקט hover הוסר כדי להימנע מהסתרת תוכן */}
    </div>
  );
}