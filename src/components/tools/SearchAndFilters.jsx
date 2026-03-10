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
    <div className="glass-effect rounded-xl md:rounded-2xl p-2.5 md:p-3 space-y-2 shadow-md border border-indigo-100 dark:border-indigo-900">
      {/* חיפוש ומועדפים */}
      <div className="flex gap-1.5 md:gap-2">
        <div className="flex-1">
          <SmartSearch onSearch={onSearchChange} tools={[]} />
        </div>
        <Button variant={showFavoritesOnly ? 'default' : 'outline'} onClick={onToggleFavorites} size="sm" className="h-9 w-9 flex-shrink-0" title="מועדפים">
          ⭐
        </Button>
      </div>

      {/* פילטרים */}
      <div className="flex items-center gap-1 md:gap-2 flex-wrap overflow-x-auto">
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="h-8 text-xs flex-shrink-0">
            <SelectValue placeholder="קטגוריה" />
          </SelectTrigger>
          <SelectContent>{categories.map((cat) => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}</SelectContent>
        </Select>

        <Select value={selectedPricing} onValueChange={onPricingChange}>
          <SelectTrigger className="h-8 text-xs flex-shrink-0">
            <SelectValue placeholder="תמחור" />
          </SelectTrigger>
          <SelectContent>{pricingOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
        </Select>

        <Select value={selectedRating.toString()} onValueChange={(val) => onRatingChange(Number(val))}>
          <SelectTrigger className="h-8 text-xs flex-shrink-0">
            <SelectValue placeholder="דירוג" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">כל הדירוגים</SelectItem>
            <SelectItem value="3">3+</SelectItem>
            <SelectItem value="4">4+</SelectItem>
            <SelectItem value="4.5">4.5+</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-8 text-xs flex-shrink-0">
            <SelectValue placeholder="מיין" />
          </SelectTrigger>
          <SelectContent>{sortOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
        </Select>

        <div className="hidden sm:flex items-center gap-0.5 ml-auto flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded p-0.5">
          {[['grid', 'גריד', LayoutGrid], ['list', 'רשימה', LayoutList], ['compact', 'צפוף', Columns3], ['table', '📊', null], ['kanban', '🗂️', null]].map(([mode, label, Icon]) => (
            <Button key={mode} size="sm" variant={viewMode === mode ? 'default' : 'ghost'} onClick={() => onViewModeChange(mode)} className="h-7 px-1.5 text-xs">
              {Icon ? <Icon className="w-3 h-3" /> : label}
              <span className="hidden md:inline ml-1">{Icon ? label : ''}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* תוצאות ופילטרים פעילים */}
      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-gray-200 dark:border-gray-700">
        <Badge variant="outline" className="text-xs px-2 py-0.5">{resultsCount} כלים</Badge>
        {(selectedCategory !== 'all' || selectedPricing !== 'all' || selectedRating > 0 || showFavoritesOnly) && (
          <Button variant="ghost" onClick={onClearFilters} className="h-7 text-xs text-red-600">
            <X className="w-3 h-3 ml-1" />
            נקה
          </Button>
        )}
      </div>
    </div>
  );
}