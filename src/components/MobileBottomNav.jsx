import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Sparkles, MessageSquare, BellRing, GraduationCap, LayoutGrid } from 'lucide-react';

export const SWIPE_TABS = [
  { id: 'dashboard', label: 'דשבורד', icon: LayoutDashboard },
  { id: 'tools', label: 'כלים', icon: Sparkles },
  { id: 'assistant', label: 'סוכן', icon: MessageSquare },
  { id: 'reminders', label: 'התראות', icon: BellRing },
  { id: 'learning', label: 'למידה', icon: GraduationCap },
];

export default function MobileBottomNav({ activeTab, onTabChange, onMore, swipeProgress = 0 }) {
  const activeIndex = SWIPE_TABS.findIndex(t => t.id === activeTab);
  const slot = 100 / (SWIPE_TABS.length + 1); // 5 טאבים + כפתור "עוד"

  return (
    <motion.nav
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="mobile-bottom-nav"
      dir="rtl"
      aria-label="ניווט מובייל"
      role="tablist"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* אינדיקטור רקע זז */}
      <motion.div
        className="absolute top-0 h-0.5 bg-cyan-400 rounded-full"
        style={{ filter: 'drop-shadow(0 0 4px rgba(0,212,255,0.8))' }}
        animate={{ right: `calc(${activeIndex * slot}% + 1.5%)`, width: '12%' }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      />

      {/* אינדיקטור החלקה חי */}
      {Math.abs(swipeProgress) > 0.02 && (
        <div
          className="absolute top-0 h-0.5 bg-cyan-300 rounded-full pointer-events-none"
          style={{
            [swipeProgress < 0 ? 'right' : 'left']: 0,
            width: `${Math.abs(swipeProgress) * 45}%`,
            filter: 'drop-shadow(0 0 6px rgba(0,212,255,0.9))',
            transition: 'opacity 0.12s ease-out',
          }}
        />
      )}

      {SWIPE_TABS.map((item) => {
        const Icon = item.icon;
        const active = activeTab === item.id;
        return (
          <motion.button
            key={item.id}
            role="tab"
            aria-selected={active}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(8);
              onTabChange(item.id);
            }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full touch-manipulation"
          >
            <motion.div
              animate={active ? { y: -2 } : { y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Icon
                className={`w-5 h-5 transition-colors duration-300 ${active ? 'text-cyan-400' : 'text-slate-500'}`}
                style={active ? { filter: 'drop-shadow(0 0 6px rgba(0,212,255,0.6))' } : {}}
              />
            </motion.div>
            <span className={`text-[10px] font-medium transition-colors ${active ? 'text-cyan-400' : 'text-slate-500'}`}>
              {item.label}
            </span>
            {active && (
              <motion.div
                layoutId="nav-dot"
                className="absolute bottom-1 w-1 h-1 rounded-full bg-cyan-400"
                style={{ filter: 'drop-shadow(0 0 3px rgba(0,212,255,0.8))' }}
              />
            )}
          </motion.button>
        );
      })}

      {/* כפתור "עוד" — פותח את כל הטאבים */}
      <motion.button
        role="button"
        aria-label="עוד טאבים"
        onClick={() => {
          if (navigator.vibrate) navigator.vibrate(8);
          onMore?.();
        }}
        whileTap={{ scale: 0.85 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full touch-manipulation"
      >
        <LayoutGrid className="w-5 h-5 text-slate-500" />
        <span className="text-[10px] font-medium text-slate-500">עוד</span>
      </motion.button>
    </motion.nav>
  );
}