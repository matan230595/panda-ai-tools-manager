import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Download, Upload, Database, Loader2, CheckCircle2 } from 'lucide-react';

const ENTITIES = ['AiTool', 'ToolTask', 'Subscription', 'Reminder', 'ToolLearningPlan', 'UserToolRating'];

const sanitizeRecord = (entity, record) => {
  const sanitized = { ...record };
  if (entity === 'AiTool' && sanitized.userCredentials) {
    const { password, ...safeCredentials } = sanitized.userCredentials;
    sanitized.userCredentials = safeCredentials;
  }
  if (entity === 'Subscription') {
    delete sanitized.password;
    delete sanitized.apiKey;
  }
  return sanitized;
};

export default function BackupRestore() {
  const queryClient = useQueryClient();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileRef = React.useRef(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const user = await getCurrentUser();
      const data = { exportedAt: new Date().toISOString(), user: user.email, entities: {} };
      for (const entity of ENTITIES) {
        try {
          const records = await base44.entities[entity].filter({ created_by_id: user.id });
          data.entities[entity] = records.map(record => sanitizeRecord(entity, record));
        } catch (e) { data.entities[entity] = []; }
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `panda-ai-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally { setExporting(false); }
  };

  const handleImport = async (file) => {
    setImporting(true);
    setImportResult(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = {};
      for (const entity of ENTITIES) {
        const records = data.entities?.[entity] || [];
        let created = 0;
        for (const record of records) {
          const { id, created_date, updated_date, created_by_id, ...rest } = sanitizeRecord(entity, record);
          try {
            await base44.entities[entity].create(rest);
            created++;
          } catch (e) { /* skip */ }
        }
        result[entity] = created;
      }
      setImportResult(result);
      ENTITIES.forEach(e => queryClient.invalidateQueries({ queryKey: [e] }));
    } finally { setImporting(false); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Database className="w-5 h-5 text-cyan-400" />
        <h3 className="font-semibold text-white">גיבוי ושחזור</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-4 text-center hover:bg-cyan-500/20 transition-all disabled:opacity-40"
        >
          {exporting ? <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-cyan-400" /> : <Download className="w-6 h-6 mx-auto mb-2 text-cyan-400" />}
          <div className="text-sm font-medium text-white">ייצוא גיבוי</div>
          <div className="text-[10px] text-slate-400">הורד את כל הנתונים לקובץ JSON</div>
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-center hover:bg-emerald-500/20 transition-all disabled:opacity-40"
        >
          {importing ? <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-emerald-400" /> : <Upload className="w-6 h-6 mx-auto mb-2 text-emerald-400" />}
          <div className="text-sm font-medium text-white">שחזור מקובץ</div>
          <div className="text-[10px] text-slate-400">העלה קובץ גיבוי לשחזור</div>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport(f); e.target.value = ''; }}
        />
      </div>

      {importResult && (
        <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/5 p-3 space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-1">
            <CheckCircle2 className="w-4 h-4" /> השחזור הושלם
          </div>
          {Object.entries(importResult).map(([entity, count]) => (
            <div key={entity} className="text-xs text-slate-400">{entity}: {count} רשומות</div>
          ))}
        </div>
      )}
    </div>
  );
}