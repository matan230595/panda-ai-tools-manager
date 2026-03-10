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
  tools = [],
}) {
  const sortOptions = [
    { value: 'updated', label: 'עדכון אחרון' },
    { value: 'created', label: 'תאריך יצירה' },
    { value: 'name', label: 'שם (א-ת)' },
    { value: 'rating', label: 'דירוג גבוה' },
    { value: 'popularity', label: 'פופולריות' },
    { value: 'usage', label: 'תדירות שימוש' },
    { value: 'cost', label: 'עלות' },
  ];

  return (
    <div className="glass-effect rounded-lg p-2 shadow-md border border-indigo-100 dark:border-indigo-900">
      <div className="flex items-center gap-1 flex-nowrap overflow-x-auto pb-1">
        <div className="flex-1 min-w-0">
          <SmartSearch onSearch={onSearchChange} tools={tools} />
        </div>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-7 text-xs w-20 flex-shrink-0"><SelectValue placeholder="מיין" /></SelectTrigger>
          <SelectContent>{sortOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
        </Select>

        <div className="hidden sm:flex gap-0.5 flex-shrink-0">
          {[['grid', LayoutGrid], ['list', LayoutList], ['compact', Columns3]].map(([mode, Icon]) => (
            <Button key={mode} size="sm" variant={viewMode === mode ? 'default' : 'ghost'} onClick={() => onViewModeChange(mode)} className="h-7 w-7 p-0" title={mode}>
              <Icon className="w-3 h-3" />
            </Button>
          ))}
          <Button size="sm" variant={viewMode === 'table' ? 'default' : 'ghost'} onClick={() => onViewModeChange('table')} className="h-7 w-7 p-0" title="טבלה">📊</Button>
          <Button size="sm" variant={viewMode === 'kanban' ? 'default' : 'ghost'} onClick={() => onViewModeChange('kanban')} className="h-7 w-7 p-0" title="קאנבן">🗂️</Button>
        </div>

        <Badge variant="outline" className="text-xs px-1.5 py-0 flex-shrink-0 text-nowrap">{resultsCount}</Badge>
      </div>
    </div>
  );
}