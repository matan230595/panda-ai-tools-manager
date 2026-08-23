import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Calendar, Loader2 } from 'lucide-react';

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const HOURS = [6, 9, 12, 15, 18, 21];

export default function UsageHeatMap() {
  const { data: tools = [], isLoading } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.AiTool.filter({ created_by_id: user.id });
    },
  });

  const heatData = useMemo(() => {
    const grid = {};
    DAYS.forEach((d, di) => HOURS.forEach(h => { grid[`${di}_${h}`] = 0; }));

    tools.forEach(tool => {
      const ts = tool.usageStats?.lastUsedDate || tool.lastUsed;
      if (!ts) return;
      const date = new Date(ts);
      const day = date.getDay();
      const hour = date.getHours();
      const closestHour = HOURS.reduce((prev, curr) =>
        Math.abs(curr - hour) < Math.abs(prev - hour) ? curr : prev
      );
      const key = `${day}_${closestHour}`;
      if (grid[key] !== undefined) grid[key]++;
    });

    const max = Math.max(1, ...Object.values(grid));
    return { grid, max };
  }, [tools]);

  const topTools = useMemo(() =>
    [...tools].sort((a, b) => (b.usageStats?.timesUsed || 0) - (a.usageStats?.timesUsed || 0)).slice(0, 5),
    [tools]
  );

  const getIntensity = (val) => {
    if (val === 0) return 'bg-white/[0.02]';
    const ratio = val / heatData.max;
    if (ratio > 0.75) return 'bg-cyan-400/80';
    if (ratio > 0.5) return 'bg-cyan-400/60';
    if (ratio > 0.25) return 'bg-cyan-400/40';
    return 'bg-cyan-400/20';
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-cyan-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-cyan-400" />
        <h3 className="font-semibold text-white">מפת חום פעילות</h3>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[360px]">
          <div className="grid gap-1" style={{ gridTemplateColumns: `40px repeat(${HOURS.length}, 1fr)` }}>
            <div />
            {HOURS.map(h => <div key={h} className="text-[10px] text-slate-500 text-center">{h}:00</div>)}
            {DAYS.map((day, di) => (
              <React.Fragment key={di}>
                <div className="text-[10px] text-slate-400 flex items-center">{day}</div>
                {HOURS.map(h => {
                  const val = heatData.grid[`${di}_${h}`] || 0;
                  return (
                    <div
                      key={`${di}_${h}`}
                      className={`aspect-square rounded ${getIntensity(val)} transition-all hover:ring-1 hover:ring-cyan-400/40`}
                      title={`${day} ${h}:00 — ${val} פעילויות`}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-xs text-slate-400 mb-2">הכלים הכי פעילים</h4>
        <div className="space-y-1.5">
          {topTools.map((tool, i) => (
            <div key={tool.id} className="flex items-center gap-2 text-xs">
              <span className="w-4 text-slate-500">{i + 1}</span>
              <span className="flex-1 text-white truncate">{tool.name}</span>
              <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400/60 rounded-full" style={{ width: `${Math.min(100, (tool.usageStats?.timesUsed || 0) * 10)}%` }} />
              </div>
              <span className="text-slate-400 w-8 text-left">{tool.usageStats?.timesUsed || 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}