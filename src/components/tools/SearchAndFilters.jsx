import React from 'react';
import { LayoutGrid, LayoutList, Columns3, Table, SquareKanban, ArrowUpDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SmartSearch from '@/components/search/SmartSearch';

export default function SearchAndFilters({ 
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

  const viewOptions = [
    { mode: 'grid', icon: LayoutGrid, label: 'רשת' },
    { mode: 'list', icon: LayoutList, label: 'רשימה' },
    { mode: 'compact', icon: Columns3, label: 'קומפקטי' },
    { mode: 'table', icon: Table, label: 'טבלה' },
    { mode: 'kanban', icon: SquareKanban, label: 'קאנבן' },
  ];

  return (
    <div className="relative z-20 bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-3xl p-3 sm:p-4 shadow-sm border border-gray-200 dark:border-slate-800 space-y-3" dir="rtl">
      <SmartSearch
        onSearch={onSearchChange}
        tools={tools}
        quickFilters={[...new Set(tools.flatMap((tool) => [(tool.customCategory || tool.category)?.replace(/_/g, ' '), ...(tool.tags || []).slice(0, 2)]).filter(Boolean))].slice(0, 6)}
      />

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="h-11 rounded-2xl text-sm w-[9.5rem] bg-gray-50 dark:bg-slate-950 border-gray-200 dark:border-slate-800">
              <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400 flex-shrink-0" />
              <SelectValue placeholder="מיין לפי" />
            </SelectTrigger>
            <SelectContent>{sortOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
          </Select>

          <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            <span className="font-bold text-gray-900 dark:text-white">{resultsCount}</span> כלים
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1 rounded-2xl bg-gray-100 dark:bg-slate-950 p-1 border border-gray-200 dark:border-slate-800">
          {viewOptions.map(({ mode, icon: ViewIcon, label }) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              title={label}
              aria-label={`תצוגת ${label}`}
              className={`flex items-center justify-center h-9 w-9 rounded-xl transition-all ${viewMode === mode ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
            >
              <ViewIcon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}