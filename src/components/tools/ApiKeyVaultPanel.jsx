import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Key, Plus, Trash2, Eye, EyeOff, CheckCircle2, XCircle, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ApiKeyVaultPanel() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [reveal, setReveal] = useState({});
  const [form, setForm] = useState({ toolId: '', provider: '', apiKey: '', label: '', expiresAt: '' });
  const [toolsMap, setToolsMap] = useState({});

  const { data: keys = [], isLoading } = useQuery({
    queryKey: ['apiKeyVault'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.ApiKeyVault.filter({ created_by_id: user.id }, '-updated_date');
    },
  });

  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.AiTool.filter({ created_by_id: user.id });
    },
  });

  React.useEffect(() => {
    const map = {};
    tools.forEach(t => { map[t.id] = t.name; });
    setToolsMap(map);
  }, [tools]);

  const handleAdd = async () => {
    if (!form.provider || !form.apiKey) return;
    const tool = tools.find(t => t.id === form.toolId);
    await base44.entities.ApiKeyVault.create({
      ...form,
      toolName: tool?.name || '',
    });
    queryClient.invalidateQueries(['apiKeyVault']);
    setShowAdd(false);
    setForm({ toolId: '', provider: '', apiKey: '', label: '', expiresAt: '' });
  };

  const handleDelete = async (id) => {
    await base44.entities.ApiKeyVault.delete(id);
    queryClient.invalidateQueries(['apiKeyVault']);
  };

  const maskKey = (key) => key ? `${key.slice(0, 4)}••••••••${key.slice(-4)}` : '';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-white">כספת מפתחות API</h3>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)} className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/30">
          <Plus className="w-4 h-4 ml-1" /> מפתח חדש
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-cyan-400" /></div>
      ) : keys.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">
          <Key className="w-8 h-8 mx-auto mb-2 opacity-40" />
          אין מפתחות שמורים. הוסף מפתח API לאחסון מאובטח.
        </div>
      ) : (
        <div className="space-y-2">
          {keys.map((key) => {
            const isExpired = key.expiresAt && new Date(key.expiresAt) < new Date();
            const isExpiring = key.expiresAt && new Date(key.expiresAt) < new Date(Date.now() + 7 * 86400000);
            return (
              <div key={key.id} className="rounded-xl border border-white/10 bg-[#1a202d]/80 p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-sm text-white">{key.provider}</span>
                    {key.verificationStatus === 'valid' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {key.verificationStatus === 'invalid' && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                  </div>
                  <button onClick={() => handleDelete(key.id)} className="text-slate-500 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {key.toolName && <div className="text-xs text-slate-400 mb-1">{key.toolName}</div>}
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs text-slate-300 bg-black/30 rounded px-2 py-1 font-mono">
                    {reveal[key.id] ? key.apiKey : maskKey(key.apiKey)}
                  </code>
                  <button onClick={() => setReveal(s => ({ ...s, [key.id]: !s[key.id] }))} className="text-slate-400 hover:text-white">
                    {reveal[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {key.expiresAt && (
                  <div className={`text-[10px] mt-1 ${isExpired ? 'text-red-400' : isExpiring ? 'text-amber-400' : 'text-slate-500'}`}>
                    תפוגה: {key.expiresAt} {isExpired ? '(פג תוקף)' : isExpiring ? '(בקרוב)' : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-[#0f172a] border-cyan-400/20">
          <DialogHeader><DialogTitle className="text-white">הוסף מפתח API</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <select
              value={form.toolId}
              onChange={(e) => setForm({ ...form, toolId: e.target.value })}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white"
            >
              <option value="">בחר כלי...</option>
              {tools.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <Input placeholder="ספק (OpenAI, Google...)" value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            <Input placeholder="מפתח API" value={form.apiKey} onChange={e => setForm({ ...form, apiKey: e.target.value })} className="bg-white/5 border-white/10 text-white font-mono" />
            <Input placeholder="תווית (אופציונלי)" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            <Input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            <Button onClick={handleAdd} className="w-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">שמור מפתח</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}