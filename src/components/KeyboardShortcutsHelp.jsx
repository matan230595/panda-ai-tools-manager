import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { KEYBOARD_SHORTCUTS } from '@/components/hooks/useKeyboardShortcuts';

export default function KeyboardShortcutsHelp({ open, onOpenChange }) {
  const grouped = KEYBOARD_SHORTCUTS.reduce((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s);
    return acc;
  }, {});

  const CATEGORY_ICONS = {
    'ניווט': '🧭',
    'חיפוש': '🔍',
    'עזרה': '❓',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#1a202d]/95 border-cyan-400/20 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            <span>⌨️</span> קיצורי מקלדת
          </DialogTitle>
          <p className="text-slate-400 text-sm">
            נווט במהירות ברחבי המערכת בלי לגעת בעכבר
          </p>
        </DialogHeader>

        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
          {Object.entries(grouped).map(([category, shortcuts]) => (
            <div key={category}>
              <h3 className="font-semibold text-sm text-cyan-400 mb-3 flex items-center gap-2">
                <span>{CATEGORY_ICONS[category]}</span>
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#0b0d12]/60 border border-cyan-400/5"
                  >
                    <span className="text-sm text-slate-300">{s.description}</span>
                    <div className="flex gap-1">
                      {s.keys.map((key, i) => (
                        <React.Fragment key={i}>
                          <kbd className="px-2.5 py-1 bg-[#0b0d12] rounded-md border border-cyan-400/30 text-xs font-medium text-cyan-300 shadow-[0_0_8px_-2px_rgba(0,212,255,0.3)]">
                            {key}
                          </kbd>
                          {i < s.keys.length - 1 && <span className="text-slate-500 self-center">+</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}