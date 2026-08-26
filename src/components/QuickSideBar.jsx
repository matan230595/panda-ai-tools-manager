import React, { useState } from 'react';
import { Mic, Plus, Download, Settings, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { toast } from 'sonner';

const EXPORT_ENTITIES = [
  'AiTool', 'ToolTask', 'Subscription', 'Reminder',
  'ToolLearningPlan', 'UserToolRating', 'Settings'
];

export default function QuickSideBar({ onVoiceSearch, onAddTool, onSettings }) {
  const [exporting, setExporting] = useState(false);

  const handleQuickBackup = async () => {
    setExporting(true);
    try {
      const user = await getCurrentUser();
      const data = { exportedAt: new Date().toISOString(), user: user.email, entities: {} };
      for (const entity of EXPORT_ENTITIES) {
        try {
          const records = await base44.entities[entity].filter({ created_by_id: user.id });
          data.entities[entity] = records.map((record) => {
            const sanitized = { ...record };
            if (entity === 'AiTool' && sanitized.userCredentials) {
              const { password, ...safeCredentials } = sanitized.userCredentials;
              sanitized.userCredentials = safeCredentials;
            }
            if (entity === 'Subscription') {
              delete sanitized.password;
              delete sanitized.apiKey;
            }
            if (entity === 'Settings') {
              Object.keys(sanitized).forEach((key) => {
                if (key.toLowerCase().includes('apikey')) delete sanitized[key];
              });
            }
            return sanitized;
          });
        } catch { data.entities[entity] = []; }
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `panda-ai-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('הגיבוי הורד בהצלחה');
    } catch {
      toast.error('שגיאה בגיבוי הנתונים');
    } finally {
      setExporting(false);
    }
  };

  const buttons = [
    { icon: Mic, label: 'חיפוש קולי', onClick: onVoiceSearch, color: 'text-cyan-400 hover:border-cyan-400/50' },
    { icon: Plus, label: 'הוסף כלי', onClick: onAddTool, color: 'text-blue-400 hover:border-blue-400/50' },
    { icon: Download, label: 'גיבוי מהיר', onClick: handleQuickBackup, color: 'text-emerald-400 hover:border-emerald-400/50', loading: exporting },
    { icon: Settings, label: 'הגדרות', onClick: onSettings, color: 'text-slate-300 hover:border-slate-400/50' },
  ];

  return (
    <div
      className="hidden md:flex fixed left-1.5 z-[90] flex-col gap-2 bottom-auto top-1/2 -translate-y-1/2"
      dir="rtl"
      aria-label="סרגל קיצורים צף"
    >
      {buttons.map((btn) => {
        const Icon = btn.loading ? Loader2 : btn.icon;
        return (
          <button
            key={btn.label}
            onClick={btn.onClick}
            title={btn.label}
            aria-label={btn.label}
            className={`group relative w-10 h-10 md:w-11 md:h-11 rounded-xl bg-[#1a202d]/85 backdrop-blur-xl border border-cyan-400/15 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg ${btn.color}`}
          >
            <Icon className={`w-4 h-4 md:w-5 md:h-5 ${btn.loading ? 'animate-spin' : ''}`} />
            <span className="absolute left-full ml-2 whitespace-nowrap rounded-lg bg-[#0e1118] px-2 py-1 text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-cyan-400/15 z-50">
              {btn.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}