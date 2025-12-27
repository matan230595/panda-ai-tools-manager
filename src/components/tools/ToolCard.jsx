import React, { useState } from 'react';
import { 
  Star, ExternalLink, Edit, Trash2, Tag, TrendingUp, 
  Copy, Check, GripVertical, Eye, Share2 
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

export default function ToolCard({ 
  tool, 
  onEdit, 
  onDelete, 
  onToggleFavorite,
  onClick,
  isDragging = false,
  dragHandleProps = {}
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

  return (
    <div 
      className={`
        group relative glass-effect rounded-2xl p-5 
        transition-all duration-300 hover-lift cursor-pointer
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
        ${tool.isFavorite ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''}
      `}
      role="article"
      aria-label={`כרטיס כלי: ${tool.name}`}
      onClick={() => onClick?.(tool)}
    >
      {/* Drag Handle */}
      <div 
        {...dragHandleProps}
        className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        aria-label="גרור לסידור מחדש"
      >
        <GripVertical className="w-5 h-5 text-gray-400" />
      </div>

      {/* כוכב מועדפים */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(tool);
        }}
        className="absolute top-3 right-3 z-10 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label={tool.isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
      >
        <Star 
          className={`w-5 h-5 transition-all ${
            tool.isFavorite 
              ? 'fill-yellow-400 text-yellow-400 scale-110' 
              : 'text-gray-400 hover:text-yellow-400'
          }`}
        />
      </button>

      {/* תוכן הכרטיס */}
      <div className="space-y-4 mt-8">
        {/* לוגו ושם */}
        <div className="flex items-start gap-3">
          {tool.logo ? (
            <img 
              src={tool.logo} 
              alt={`${tool.name} logo`}
              className="w-12 h-12 rounded-xl object-cover shadow-md"
              loading="lazy"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">
                {tool.name.charAt(0)}
              </span>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
              {tool.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={categoryColors[tool.category]}>
                {tool.category.replace(/_/g, ' ')}
              </Badge>
              {tool.rating > 0 && (
                <div className="flex items-center gap-1 text-sm text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-medium">{tool.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* תיאור */}
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
          {tool.description || 'אין תיאור זמין'}
        </p>

        {/* תגיות */}
        {tool.tags && tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tool.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs bg-gray-50 dark:bg-gray-800"
              >
                <Tag className="w-3 h-3 ml-1" />
                {tag}
              </Badge>
            ))}
            {tool.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tool.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* מידע נוסף */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {/* תמחור */}
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${pricingColors[tool.pricing]}`} />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {tool.pricing}
              </span>
            </div>
            
            {/* פופולריות */}
            {tool.popularity > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {tool.popularity}/5
                </span>
              </div>
            )}
          </div>

          {/* כפתורי פעולה */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleVisit();
              }}
              className="h-8 px-3"
              aria-label={`בקר באתר ${tool.name}`}
            >
              <Eye className="w-4 h-4 ml-1" />
              <span className="text-xs">ביקור</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 px-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="sr-only">פתח תפריט</span>
                  ⋮
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onEdit(tool);
                }}>
                  <Edit className="w-4 h-4 ml-2" />
                  עריכה
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}>
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 ml-2 text-green-500" />
                      הועתק!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 ml-2" />
                      שיתוף
                    </>
                  )}
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

      {/* אפקט hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none" />
    </div>
  );
}