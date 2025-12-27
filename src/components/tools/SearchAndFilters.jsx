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
      {/* שורה ראשונה: חיפוש ומועדפים */}
      <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="חפש כלי לפי שם, תיאור או תגיות..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-10 h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            aria-label="חיפוש כלים"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="נקה חיפוש"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Button
          variant={showFavoritesOnly ? 'default' : 'outline'}
          onClick={onToggleFavorites}
          className="h-11 px-6"
          aria-pressed={showFavoritesOnly}
          aria-label="הצג רק מועדפים"
        >
          ⭐ {showFavoritesOnly ? 'כל הכלים' : 'מועדפים בלבד'}
        </Button>
      </div>

      {/* שורה שנייה: פילטרים */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {/* קטגוריה */}
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full sm:w-[180px] h-9 md:h-10 bg-white dark:bg-gray-800 text-sm">
            <Filter className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
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

        <div className="flex-1" />

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

      {/* מידע על תוצאות ואפשרות לנקות */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900">
              {resultsCount} תוצאות
            </Badge>
            {searchTerm && (
              <Badge variant="outline">חיפוש: {searchTerm}</Badge>
            )}
            {selectedCategory !== 'all' && (
              <Badge variant="outline">
                {categories.find(c => c.value === selectedCategory)?.label}
              </Badge>
            )}
            {selectedPricing !== 'all' && (
              <Badge variant="outline">{selectedPricing}</Badge>
            )}
            {selectedRating > 0 && (
              <Badge variant="outline">⭐ {selectedRating}+</Badge>
            )}
            {showFavoritesOnly && (
              <Badge variant="outline">מועדפים בלבד</Badge>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearFilters}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700"
          >
            <X className="w-4 h-4 ml-1" />
            נקה הכל
          </Button>
        </div>
      )}
    </div>
  );
}