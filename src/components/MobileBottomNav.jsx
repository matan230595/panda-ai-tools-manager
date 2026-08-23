import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Sparkles, MessageSquare, BellRing, GraduationCap } from 'lucide-react';

export const SWIPE_TABS = [
  { id: 'dashboard', label: 'דשבורד', icon: LayoutDashboard },
  { id: 'tools', label: 'כלים', icon: Sparkles },
  { id: 'assistant', label: 'סוכן', icon: MessageSquare },
  { id: 'reminders', label: 'התראות', icon: BellRing },
  { id: 'learning', label: 'למידה', icon: GraduationCap },
];

export default function MobileBottomNav({ activeTab, onTabChange }) {
  const activeIndex = SWIPE_TABS.findIndex(t => t.id === activeTab);

  return (
    <motion.nav
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="mobile-bottom-nav"
      dir="rtl"
      aria-label="ניווט מובייל"
      role="tablist"
    >
      {/* אינדיקטור רקע זז */}
      <motion.div
        className="absolute top-0 h-0.5 bg-cyan-400 rounded-full"
        style={{ filter: 'drop-shadow(0 0 4px rgba(0,212,255,0.8))' }}
        animate={{
          right: `calc(${activeIndex * 20}% + 2%)`,
          width: '16%',
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      />
      {SWIPE_TABS.map((item, idx) => {
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
            <span
              className={`text-[10px] font-medium transition-colors ${active ? 'text-cyan-400' : 'text-slate-500'}`}
            >
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
    </motion.nav>
  );
}