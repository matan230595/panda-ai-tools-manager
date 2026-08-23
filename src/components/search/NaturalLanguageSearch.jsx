import React, { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Search, Loader2, Sparkles, Wrench } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ToolLogo from '@/components/ToolLogo';

export default function NaturalLanguageSearch({ onToolClick }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.AiTool.filter({ created_by_id: user.id });
    },
  });

  const handleSearch = useCallback(async () => {
    if (!query.trim() || tools.length === 0) return;
    setLoading(true);
    setResults(null);
    try {
      const toolCatalog = tools.map(t => ({
        id: t.id, name: t.name, category: t.category, pricing: t.pricing,
        description: t.description, features: (t.features || []).slice(0, 5),
        tags: t.tags, rating: t.rating, masteryLevel: t.masteryLevel,
      }));
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `אתה מנוע חיפוש לקטלוג כלי AI. המשתמש מחפש: "${query}". החזר את מזהי הכלים הרלוונטיים בלבד מתוך הקטלוג. קטלוג: ${JSON.stringify(toolCatalog)}. החזר רק מערך של מזהי ID.`,
        response_json_schema: {
          type: 'object',
          properties: { toolIds: { type: 'array', items: { type: 'string' } }, reasoning: { type: 'string' } },
        },
      });
      const matched = (res.toolIds || []).map(id => tools.find(t => t.id === id)).filter(Boolean);
      setResults({ tools: matched, reasoning: res.reasoning });
    } catch (e) {
      console.error('NL search failed:', e);
    } finally {
      setLoading(false);
    }
  }, [query, tools]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="תאר מה אתה מחפש בשפה טבעית... לדוגמה: כלי חינמי ליצירת תמונות"
            className="pr-9 bg-white/[0.03] border-cyan-400/20 text-white placeholder:text-slate-500"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/30 transition-all disabled:opacity-40 flex items-center gap-1.5"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          חפש
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          מנתח את הקטלוג שלך...
        </div>
      )}

      {results && (
        <div className="space-y-2">
          {results.reasoning && (
            <div className="text-xs text-slate-400 bg-white/[0.03] rounded-lg p-2 border border-white/5">
              {results.reasoning}
            </div>
          )}
          {results.tools.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">לא נמצאו כלים תואמים</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {results.tools.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => onToolClick?.(tool)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#1a202d]/80 p-2.5 cursor-pointer hover:border-cyan-400/30 transition-all"
                >
                  <ToolLogo tool={tool} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-white truncate">{tool.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{tool.category}</div>
                  </div>
                  <Wrench className="w-3.5 h-3.5 text-slate-600" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}