import React from 'react';
import { LayoutDashboard, Sparkles, MessageSquare, BellRing, GraduationCap } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'דשבורד', icon: LayoutDashboard },
  { id: 'tools', label: 'כלים', icon: Sparkles },
  { id: 'assistant', label: 'סוכן', icon: MessageSquare },
  { id: 'reminders', label: 'התראות', icon: BellRing },
  { id: 'learning', label: 'למידה', icon: GraduationCap },
];

export default function MobileBottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="mobile-bottom-nav" dir="rtl" aria-label="ניווט מובייל">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all active:scale-90"
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
          >
            <Icon
              className={`w-5 h-5 transition-all duration-300 ${active ? 'text-cyan-400 scale-110' : 'text-slate-500'}`}
              style={active ? { filter: 'drop-shadow(0 0 6px rgba(0,212,255,0.6))' } : {}}
            />
            <span className={`text-[10px] font-medium transition-colors ${active ? 'text-cyan-400' : 'text-slate-500'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}