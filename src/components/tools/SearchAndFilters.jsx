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
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  resultsCount,
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
    <div className="glass-effect rounded-lg p-2 shadow-md border border-indigo-100 dark:border-indigo-900">
      <div className="flex items-center gap-1 flex-nowrap overflow-x-auto pb-1">
        {/* חיפוש */}
        <div className="flex-1 min-w-0">
          <SmartSearch onSearch={onSearchChange} tools={[]} />
        </div>

        {/* כפתור מועדפים */}
        <Button variant={showFavoritesOnly ? 'default' : 'outline'} onClick={onToggleFavorites} size="sm" className="h-7 w-7 flex-shrink-0 p-0" title="מועדפים">⭐</Button>

        {/* פילטרים */}
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="h-7 text-xs w-24 flex-shrink-0"><SelectValue placeholder="קטגוריה" /></SelectTrigger>
          <SelectContent>{categories.map((cat) => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}</SelectContent>
        </Select>

        <Select value={selectedPricing} onValueChange={onPricingChange}>
          <SelectTrigger className="h-7 text-xs w-20 flex-shrink-0"><SelectValue placeholder="תמחור" /></SelectTrigger>
          <SelectContent>{pricingOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
        </Select>

        <Select value={selectedRating.toString()} onValueChange={(val) => onRatingChange(Number(val))}>
          <SelectTrigger className="h-7 text-xs w-16 flex-shrink-0"><SelectValue placeholder="⭐" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="0">כל</SelectItem>
            <SelectItem value="3">3+</SelectItem>
            <SelectItem value="4">4+</SelectItem>
            <SelectItem value="4.5">4.5+</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-7 text-xs w-20 flex-shrink-0"><SelectValue placeholder="מיין" /></SelectTrigger>
          <SelectContent>{sortOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
        </Select>

        {/* כפתורי תצוגה */}
        <div className="hidden sm:flex gap-0.5 flex-shrink-0">
          {[['grid', LayoutGrid], ['list', LayoutList], ['compact', Columns3]].map(([mode, Icon]) => (
            <Button key={mode} size="sm" variant={viewMode === mode ? 'default' : 'ghost'} onClick={() => onViewModeChange(mode)} className="h-7 w-7 p-0" title={mode}>
              <Icon className="w-3 h-3" />
            </Button>
          ))}
          <Button size="sm" variant={viewMode === 'table' ? 'default' : 'ghost'} onClick={() => onViewModeChange('table')} className="h-7 w-7 p-0" title="טבלה">📊</Button>
          <Button size="sm" variant={viewMode === 'kanban' ? 'default' : 'ghost'} onClick={() => onViewModeChange('kanban')} className="h-7 w-7 p-0" title="קאנבן">🗂️</Button>
        </div>

        {/* תוצאות ופילטר נקה */}
        <Badge variant="outline" className="text-xs px-1.5 py-0 flex-shrink-0 text-nowrap">{resultsCount}</Badge>
        {(selectedCategory !== 'all' || selectedPricing !== 'all' || selectedRating > 0 || showFavoritesOnly) && (
          <Button variant="ghost" onClick={onClearFilters} className="h-7 px-1.5 text-xs text-red-600 flex-shrink-0">
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}