import React, { useState } from 'react';
import { Plus, Sparkles, MessageSquare, X } from 'lucide-react';

export default function QuickAddFAB({ onAddTool, onStartChat }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden fixed bottom-24 right-4 z-[95] flex flex-col items-center gap-2" dir="rtl">
      {open && (
        <div className="flex flex-col gap-2 mb-2 animate-slide-in w-[200px]">
          <button
            onClick={() => { onAddTool(); setOpen(false); }}
            className="flex items-center gap-3 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-gray-200 dark:border-slate-700 px-4 py-3 text-right active:scale-95 transition-all min-h-[48px]"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">כלי חדש</span>
          </button>
          <button
            onClick={() => { onStartChat(); setOpen(false); }}
            className="flex items-center gap-3 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-gray-200 dark:border-slate-700 px-4 py-3 text-right active:scale-95 transition-all min-h-[48px]"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white flex-shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">שיחה חדשה</span>
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all active:scale-90 ${open ? 'bg-rose-500 rotate-45' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}
        aria-label={open ? 'סגור תפריט' : 'פעולה מהירה'}
      >
        {open ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>
    </div>
  );
}