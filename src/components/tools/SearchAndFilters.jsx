import React from 'react';
import { LayoutGrid, LayoutList, Columns3, Table, SquareKanban, ArrowUpDown, GraduationCap, Zap } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  masteryFilter,
  onMasteryFilterChange,
  priorityFilter,
  onPriorityFilterChange,
}) {
  const sortOptions = [
    { value: 'updated', label: 'עדכון אחרון' },
    { value: 'created', label: 'תאריך יצירה' },
    { value: 'name', label: 'שם (א-ת)' },
    { value: 'rating', label: 'דירוג גבוה' },
    { value: 'popularity', label: 'פופולריות' },
    { value: 'usage', label: 'תדירות שימוש' },
    { value: 'cost', label: 'עלות' },
    { value: 'mastery', label: 'רמת שליטה' },
  ];

  const viewOptions = [
    { mode: 'grid', icon: LayoutGrid, label: 'רשת' },
    { mode: 'list', icon: LayoutList, label: 'רשימה' },
    { mode: 'compact', icon: Columns3, label: 'קומפקטי' },
    { mode: 'table', icon: Table, label: 'טבלה' },
    { mode: 'kanban', icon: SquareKanban, label: 'קאנבן' },
  ];

  const masteryOptions = [
    { value: 'all', label: 'כל הרמות' },
    { value: 'מתחיל', label: 'מתחיל' },
    { value: 'בינוני', label: 'בינוני' },
    { value: 'מומחה', label: 'מומחה' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'כל העדיפויות' },
    { value: 'דוחוף', label: 'דוחוף' },
    { value: 'חשוב', label: 'חשוב' },
    { value: 'רגיל שלי', label: 'רגיל' },
  ];

  return (
    <div className="sticky top-[68px] md:top-4 z-30 bg-[#1a202d]/60 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-cyan-400/15 space-y-3" dir="rtl">
      <SmartSearch
        searchTerm={searchTerm}
        onSearch={onSearchChange}
        tools={tools}
        quickFilters={[...new Set(tools.flatMap((tool) => [(tool.customCategory || tool.category)?.replace(/_/g, ' '), ...(tool.tags || []).slice(0, 2)]).filter(Boolean))].slice(0, 6)}
      />

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="h-10 rounded-xl text-sm w-[8.5rem] sm:w-[9.5rem] bg-white/5 border-cyan-400/15 text-slate-200 flex-shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-slate-500 flex-shrink-0" />
              <SelectValue placeholder="מיין לפי" />
            </SelectTrigger>
            <SelectContent>{sortOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
          </Select>

          {onMasteryFilterChange && (
            <Select value={masteryFilter || 'all'} onValueChange={onMasteryFilterChange}>
              <SelectTrigger className="h-10 rounded-xl text-sm w-[8rem] bg-white/5 border-cyan-400/15 text-slate-200 flex-shrink-0">
                <GraduationCap className="w-3.5 h-3.5 ml-1 text-slate-500 flex-shrink-0" />
                <SelectValue placeholder="רמת שליטה" />
              </SelectTrigger>
              <SelectContent>{masteryOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
            </Select>
          )}

          {onPriorityFilterChange && (
            <Select value={priorityFilter || 'all'} onValueChange={onPriorityFilterChange}>
              <SelectTrigger className="h-10 rounded-xl text-sm w-[8rem] bg-white/5 border-cyan-400/15 text-slate-200 flex-shrink-0">
                <Zap className="w-3.5 h-3.5 ml-1 text-slate-500 flex-shrink-0" />
                <SelectValue placeholder="עדיפות" />
              </SelectTrigger>
              <SelectContent>{priorityOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
            </Select>
          )}

          <span className="text-xs sm:text-sm text-slate-500 whitespace-nowrap truncate">
            <span className="font-bold text-cyan-300">{resultsCount}</span> כלים
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-cyan-400/15 flex-shrink-0">
          {viewOptions.map(({ mode, icon: ViewIcon, label }) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              title={label}
              aria-label={`תצוגת ${label}`}
              className={`flex items-center justify-center h-9 w-9 rounded-lg transition-all ${viewMode === mode ? 'bg-blue-600 text-white shadow-[0_0_12px_-2px_rgba(37,99,235,0.5)]' : 'text-slate-500 hover:text-cyan-300'}`}
            >
              <ViewIcon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}