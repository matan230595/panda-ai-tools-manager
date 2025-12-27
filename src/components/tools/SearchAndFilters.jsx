import React from 'react';
import { Search, Filter, X, Grid3x3, List, LayoutGrid } from 'lucide-react';
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
  ];

  const hasActiveFilters = 
    selectedCategory !== 'all' || 
    selectedPricing !== 'all' || 
    selectedRating > 0 || 
    showFavoritesOnly ||
    searchTerm.length > 0;

  return (
    <div className="space-y-3 md:space-y-4">
      {/* חיפוש ומועדפים */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="חפש כלי..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-10 h-10 md:h-12 bg-white dark:bg-gray-800 text-sm md:text-base"
          />
        </div>
        <Button
          variant={showFavoritesOnly ? 'default' : 'outline'}
          onClick={onToggleFavorites}
          className="h-10 md:h-12 w-10 md:w-auto md:px-6 p-0 md:gap-2"
        >
          ⭐
          <span className="hidden md:inline">{showFavoritesOnly ? 'כל הכלים' : 'מועדפים'}</span>
        </Button>
      </div>

      {/* פילטרים - גלילה אופקית במובייל */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        {/* קטגוריה */}
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[140px] h-9 bg-white dark:bg-gray-800 text-sm flex-shrink-0">
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
          <SelectTrigger className="w-[120px] h-9 bg-white dark:bg-gray-800 text-sm flex-shrink-0">
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
          <SelectTrigger className="w-[110px] h-9 bg-white dark:bg-gray-800 text-sm flex-shrink-0">
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
          <SelectTrigger className="w-[130px] h-9 bg-white dark:bg-gray-800 text-sm flex-shrink-0">
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
        <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 flex-shrink-0 mr-auto">
          <Button
            size="sm"
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            onClick={() => onViewModeChange('grid')}
            className="h-8 w-8 p-0"
            aria-label="רשת"
          >
            <Grid3x3 className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            onClick={() => onViewModeChange('list')}
            className="h-8 w-8 p-0"
            aria-label="רשימה"
          >
            <List className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'compact' ? 'default' : 'ghost'}
            onClick={() => onViewModeChange('compact')}
            className="h-8 w-8 p-0"
            aria-label="צפוף"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            onClick={() => onViewModeChange('table')}
            className="h-8 w-8 p-0"
            aria-label="טבלה"
          >
            📊
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'kanban' ? 'default' : 'ghost'}
            onClick={() => onViewModeChange('kanban')}
            className="h-8 w-8 p-0"
            aria-label="קאנבן"
          >
            🗂️
          </Button>
        </div>
      </div>

      {/* פילטרים פעילים ומונה תוצאות */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {resultsCount} כלים
        </span>
        {(selectedCategory !== 'all' || selectedPricing !== 'all' || selectedRating > 0 || showFavoritesOnly) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 h-8"
          >
            <X className="w-3 h-3 ml-1" />
            נקה
          </Button>
        )}
      </div>
    </div>
  );
}