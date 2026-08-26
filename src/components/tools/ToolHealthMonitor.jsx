import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Activity, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Globe, Clock3 } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CFG = {
  active: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'פעיל' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'אזהרה' },
  down: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'לא זמין' },
  no_url: { icon: Globe, color: 'text-slate-500', bg: 'bg-slate-500/10', label: 'ללא כתובת' },
  invalid_url: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'כתובת לא תקינה' },
  timeout: { icon: Clock3, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'תם הזמן' },
};

export default function ToolHealthMonitor() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.AiTool.filter({ created_by_id: user.id });
    },
  });

  const runCheck = async () => {
    setLoading(true);
    setResults(null);
    try {
      const res = await base44.functions.invoke('checkToolHealth', {});
      setResults(res.data);
    } catch (e) {
      console.error('Health check failed:', e);
      toast.error(e?.response?.data?.error || 'בדיקת זמינות הכלים נכשלה');
    } finally {
      setLoading(false);
    }
  };

  const counts = results?.results?.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-white">ניטור בריאות כלים</h3>
        </div>
        <button
          onClick={runCheck}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/30 transition-all text-xs flex items-center gap-1.5 disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'בודק...' : 'הרץ בדיקה'}
        </button>
      </div>

      {results && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(STATUS_CFG).map(([key, cfg]) => (
              <div key={key} className={`rounded-lg ${cfg.bg} p-2.5 text-center`}>
                <cfg.icon className={`w-4 h-4 mx-auto mb-1 ${cfg.color}`} />
                <div className="text-lg font-bold text-white">{counts[key] || 0}</div>
                <div className="text-[10px] text-slate-400">{cfg.label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {results.results?.map((r) => {
              const cfg = STATUS_CFG[r.status] || STATUS_CFG.no_url;
              return (
                <div key={r.toolId} className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2">
                  <cfg.icon className={`w-4 h-4 flex-shrink-0 ${cfg.color}`} />
                  <span className="text-sm text-white truncate flex-1">{r.toolName}</span>
                  <span className="text-[10px] text-slate-500">{cfg.label}</span>
                  {r.statusCode && <span className="text-[10px] text-slate-600">{r.statusCode}</span>}
                </div>
              );
            })}
          </div>
        </>
      )}

      {!results && !loading && (
        <div className="text-center py-8 text-slate-500 text-sm">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
          לחץ על "הרץ בדיקה" כדי לבדוק את זמינות כתובות ה-URL של כל הכלים
        </div>
      )}
    </div>
  );
}