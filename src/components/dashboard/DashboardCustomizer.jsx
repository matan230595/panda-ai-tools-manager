import React, { useState, useEffect, useCallback } from 'react';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';

const STORAGE_KEY = 'dashboard-widgets-visibility';

export const DASHBOARD_WIDGETS = [
  { id: 'stats', label: 'כרטיסי סטטיסטיקה' },
  { id: 'optimization', label: 'אופטימיזציית עלויות' },
  { id: 'alerts', label: 'התראות מנויים' },
  { id: 'renewals', label: 'חידושים קרובים' },
  { id: 'charts', label: 'גרפים (קטגוריות ועלויות)' },
  { id: 'knowledge', label: 'מפת ידע ותחזוקה' },
  { id: 'roi', label: 'ROI ורווחיות' },
  { id: 'recommendations', label: 'המלצות ולוח שנה' },
  { id: 'highlighted', label: 'כלים בולטים' },
];

export function useDashboardWidgets() {
  const [visible, setVisible] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const initial = {};
      DASHBOARD_WIDGETS.forEach((w) => { initial[w.id] = saved[w.id] !== false; });
      return initial;
    } catch {
      const initial = {};
      DASHBOARD_WIDGETS.forEach((w) => { initial[w.id] = true; });
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visible));
  }, [visible]);

  const toggle = useCallback((id) => {
    setVisible((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return { visible, toggle };
}

export default function DashboardCustomizer({ visible, toggle }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="w-4 h-4 ml-1.5" />
          התאמה אישית
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56" dir="rtl">
        <DropdownMenuLabel>בחר מה להציג בדשבורד</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {DASHBOARD_WIDGETS.map((w) => (
          <DropdownMenuCheckboxItem
            key={w.id}
            checked={visible[w.id]}
            onCheckedChange={() => toggle(w.id)}
            onSelect={(e) => e.preventDefault()}
          >
            {w.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}