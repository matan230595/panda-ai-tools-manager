import React from 'react';
import { Search, Filter, X, Grid3x3, List, LayoutGrid, LayoutList, Columns3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import SmartSearch from '@/components/search/SmartSearch';

export default function SearchAndFilters({ 
  searchTerm, 
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedPricing,
  onPricingChange,
  selectedRating,
  onRatingChange,
  showFavoritesOnly,
  onToggleFavorites,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  resultsCount,
  onClearFilters
}) {
  const categories = [
    { value: 'all', label: 'כל הקטגוריות' },
    { value: 'עיבוד_שפה', label: 'עיבוד שפה' },
    { value: 'יצירת_תמונות', label: 'יצירת תמונות' },
    { value: 'וידאו', label: 'וידאו' },
    { value: 'קוד', label: 'קוד' },
    { value: 'עיצוב', label: 'עיצוב' },
    { value: 'מחקר', label: 'מחקר' },
    { value: 'פרודוקטיביות', label: 'פרודוקטיביות' },
    { value: 'אוטומציה', label: 'אוטומציה' },
    { value: 'אנליטיקה', label: 'אנליטיקה' },
    { value: 'שיווק', label: 'שיווק' },
    { value: 'אחר', label: 'אחר' },
  ];

  const pricingOptions = [
    { value: 'all', label: 'כל התמחורים' },
    { value: 'חינם', label: 'חינם' },
    { value: 'בתשלום', label: 'בתשלום' },
    { value: 'פרימיום', label: 'פרימיום' },
    { value: 'פרימיום_מוגבל', label: 'פרימיום מוגבל' },
  ];

  const sortOptions = [
    { value: 'updated', label: 'עדכון אחרון' },
    { value: 'created', label: 'תאריך יצירה' },
    { value: 'name', label: 'שם (א-ת)' },
    { value: 'rating', label: 'דירוג גבוה' },
    { value: 'popularity', label: 'פופולריות' },
    { value: 'usage', label: 'תדירות שימוש' },
    { value: 'cost', label: 'עלות' },
  ];

  const hasActiveFilters = 
    selectedCategory !== 'all' || 
    selectedPricing !== 'all' || 
    selectedRating > 0 || 
    showFavoritesOnly ||
    searchTerm.length > 0;

  return (
    <div className="glass-effect rounded-2xl md:rounded-3xl p-4 md:p-6 space-y-3 md:space-y-4 shadow-lg md:shadow-xl border border-indigo-100 dark:border-indigo-900">
      {/* חיפוש חכם ומועדפים */}
      <div className="flex gap-2 md:gap-3">
        <div className="flex-1">
          <SmartSearch onSearch={onSearchChange} tools={[]} />
        </div>
        <Button
          variant={showFavoritesOnly ? 'default' : 'outline'}
          onClick={onToggleFavorites}
          size="sm"
          className="md:size-lg shadow-md hover:shadow-lg transition-shadow flex-shrink-0"
        >
          <span className="text-lg md:text-xl">⭐</span>
          <span className="hidden sm:inline mr-2 text-xs md:text-sm">{showFavoritesOnly ? 'הכל' : 'מועד'}</span>
        </Button>
      </div>

      {/* פילטרים - מתאים למובייל */}
      <div className="flex items-center gap-2 md:gap-3 flex-wrap overflow-x-auto pb-2 md:pb-0">
        {/* קטגוריה */}
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="h-9 md:h-11 bg-white dark:bg-gray-800 shadow-sm text-sm flex-shrink-0">
            <SelectValue placeholder="קטגוריה" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* תמחור */}
        <Select value={selectedPricing} onValueChange={onPricingChange}>
          <SelectTrigger className="h-9 md:h-11 bg-white dark:bg-gray-800 shadow-sm text-sm flex-shrink-0">
            <SelectValue placeholder="תמחור" />
          </SelectTrigger>
          <SelectContent>
            {pricingOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* דירוג */}
        <Select value={selectedRating.toString()} onValueChange={(val) => onRatingChange(Number(val))}>
          <SelectTrigger className="h-9 md:h-11 bg-white dark:bg-gray-800 shadow-sm text-sm flex-shrink-0">
            <SelectValue placeholder="דירוג" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">כל הדירוגים</SelectItem>
            <SelectItem value="3">3+ כוכבים</SelectItem>
            <SelectItem value="4">4+ כוכבים</SelectItem>
            <SelectItem value="4.5">4.5+ כוכבים</SelectItem>
          </SelectContent>
        </Select>

        {/* מיון */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[150px] h-11 bg-white dark:bg-gray-800 shadow-sm">
            <SelectValue placeholder="מיין" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* תצוגה */}
         <div className="flex items-center gap-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-1 shadow-inner mr-auto group" title="בחר מצב תצוגה (Alt+V)">
           <Button
             size="sm"
             variant={viewMode === 'grid' ? 'default' : 'ghost'}
             onClick={() => onViewModeChange('grid')}
             className="h-10 px-2 flex items-center gap-1 text-xs"
             aria-label="גריד (3 עמודות)"
             title="גריד: 3 עמודות"
           >
             <LayoutGrid className="w-4 h-4" />
             <span className="hidden md:inline">גריד</span>
           </Button>
           <Button
             size="sm"
             variant={viewMode === 'list' ? 'default' : 'ghost'}
             onClick={() => onViewModeChange('list')}
             className="h-10 px-2 flex items-center gap-1 text-xs"
             aria-label="רשימה"
             title="רשימה: רך קומפקטי"
           >
             <LayoutList className="w-4 h-4" />
             <span className="hidden md:inline">רשימה</span>
           </Button>
           <Button
             size="sm"
             variant={viewMode === 'compact' ? 'default' : 'ghost'}
             onClick={() => onViewModeChange('compact')}
             className="h-10 px-2 flex items-center gap-1 text-xs"
             aria-label="צפוף (4 עמודות)"
             title="צפוף: 4 עמודות"
           >
             <Columns3 className="w-4 h-4" />
             <span className="hidden md:inline">צפוף</span>
           </Button>
           <Button
             size="sm"
             variant={viewMode === 'table' ? 'default' : 'ghost'}
             onClick={() => onViewModeChange('table')}
             className="h-10 px-2 flex items-center gap-1 text-xs"
             aria-label="טבלה"
             title="טבלה: תצוגה עתירת נתונים"
           >
             📊
             <span className="hidden md:inline">טבלה</span>
           </Button>
           <Button
             size="sm"
             variant={viewMode === 'kanban' ? 'default' : 'ghost'}
             onClick={() => onViewModeChange('kanban')}
             className="h-10 px-2 flex items-center gap-1 text-xs"
             aria-label="קאנבן"
             title="קאנבן: לפי קטגוריה"
           >
             🗂️
             <span className="hidden md:inline">קאנבן</span>
           </Button>
         </div>
      </div>

      {/* פילטרים פעילים ומונה תוצאות */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <Badge variant="outline" className="text-base px-4 py-1.5">
          {resultsCount} כלים נמצאו
        </Badge>
        {(selectedCategory !== 'all' || selectedPricing !== 'all' || selectedRating > 0 || showFavoritesOnly) && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <X className="w-4 h-4 ml-2" />
            נקה פילטרים
          </Button>
        )}
      </div>
    </div>
  );
}