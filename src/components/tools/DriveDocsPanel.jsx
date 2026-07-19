import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FolderOpen as DriveIcon, Search, FileText, ExternalLink, Loader2, Plus, X, Upload, Pencil, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function DriveDocsPanel({ tool }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createContent, setCreateContent] = useState('');
  const [editingDoc, setEditingDoc] = useState(null);
  const [editContent, setEditContent] = useState('');

  // List files inside the tool's Drive folder
  const { data: toolDocs = [], isLoading: loadingToolDocs, refetch: refetchToolDocs } = useQuery({
    queryKey: ['toolDriveDocs', tool.id],
    queryFn: async () => {
      const res = await base44.functions.invoke('manageDriveDocs', { action: 'listToolDocs', toolName: tool.name });
      return res.data?.files || [];
    },
  });

  // Global search in Drive
  const { data: driveFiles = [], isLoading: searching } = useQuery({
    queryKey: ['driveDocs', searchQuery],
    queryFn: async () => {
      const res = await base44.functions.invoke('manageDriveDocs', { action: 'list', query: searchQuery });
      return res.data?.files || [];
    },
    enabled: showSearch && searchQuery.length > 0,
  });

  const linkDoc = useMutation({
    mutationFn: async (file) => {
      const existing = tool.driveDocs || [];
      if (existing.some((d) => d.fileId === file.id)) throw new Error('המסמך כבר מקושר לכלי זה');
      const updated = [...existing, {
        fileId: file.id, name: file.name, mimeType: file.mimeType, iconLink: file.iconLink, webViewLink: file.webViewLink,
      }];
      return base44.entities.AiTool.update(tool.id, { driveDocs: updated });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      toast.success('המסמך קושר בהצלחה!');
    },
    onError: (err) => toast.error(err.message),
  });

  const unlinkDoc = useMutation({
    mutationFn: async (fileId) => {
      const updated = (tool.driveDocs || []).filter((d) => d.fileId !== fileId);
      return base44.entities.AiTool.update(tool.id, { driveDocs: updated });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      toast.success('המסמך הוסר');
    },
  });

  const createDoc = useMutation({
    mutationFn: async () => {
      if (!createName.trim()) throw new Error('נא למלא שם מסמך');
      const res = await base44.functions.invoke('manageDriveDocs', {
        action: 'createDoc',
        toolName: tool.name,
        docName: createName,
        content: createContent,
      });
      const file = res.data?.file;
      if (!file) throw new Error('יצירת המסמך נכשלה');
      const existing = tool.driveDocs || [];
      const updated = [...existing, {
        fileId: file.id, name: file.name, mimeType: file.mimeType, iconLink: file.iconLink, webViewLink: file.webViewLink,
      }];
      return base44.entities.AiTool.update(tool.id, { driveDocs: updated });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      queryClient.invalidateQueries({ queryKey: ['toolDriveDocs', tool.id] });
      toast.success('המסמך נוצר ונשמר בתיקיית הכלי!');
      setCreateName('');
      setCreateContent('');
    },
    onError: (err) => toast.error(err.message),
  });

  const startEdit = useMutation({
    mutationFn: async (doc) => {
      const res = await base44.functions.invoke('manageDriveDocs', { action: 'getDocContent', fileId: doc.fileId });
      return { doc, content: res.data?.content || '' };
    },
    onSuccess: (data) => {
      setEditingDoc(data.doc);
      setEditContent(data.content);
    },
    onError: (err) => toast.error('טעינת התוכן נכשלה: ' + err.message),
  });

  const saveEdit = useMutation({
    mutationFn: async () => {
      await base44.functions.invoke('manageDriveDocs', {
        action: 'updateDocContent',
        fileId: editingDoc.fileId,
        content: editContent,
      });
    },
    onSuccess: () => {
      toast.success('המסמך עודכן בהצלחה!');
      setEditingDoc(null);
      setEditContent('');
    },
    onError: (err) => toast.error('השמירה נכשלה: ' + err.message),
  });

  const isGoogleDoc = (mimeType) => mimeType === 'application/vnd.google-apps.document';
  const docs = tool.driveDocs || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DriveIcon className="w-5 h-5 text-indigo-500" />
          <h3 className="font-semibold">מסמכי הדרכה מ-Google Drive</h3>
        </div>
        <span className="text-xs text-gray-500">{docs.length} מסמכים מקושרים</span>
      </div>

      <div className="text-xs text-gray-400 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg p-2">
        📁 תיקייה ראשית: <strong>AI Tools Manager</strong> → תת-תיקייה: <strong>{tool.name}</strong>
      </div>

      {/* Linked documents */}
      <div className="space-y-2">
        {docs.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            אין מסמכים מקושרים עדיין
          </div>
        ) : (
          docs.map((doc) => (
            <div key={doc.fileId} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-slate-700">
              {doc.iconLink ? <img src={doc.iconLink} alt="" className="w-6 h-6 flex-shrink-0" /> : <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{doc.name}</div>
                <div className="text-xs text-gray-400 truncate">{isGoogleDoc(doc.mimeType) ? 'Google Doc (ניתן לעריכה)' : doc.mimeType}</div>
              </div>
              {isGoogleDoc(doc.mimeType) && (
                <button onClick={() => startEdit.mutate(doc)} disabled={startEdit.isPending} className="p-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/20" aria-label="ערוך מסמך">
                  {startEdit.isPending && editingDoc?.fileId === doc.fileId ? <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> : <Pencil className="w-4 h-4 text-indigo-500" />}
                </button>
              )}
              {doc.webViewLink && (
                <a href={doc.webViewLink} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
                  <ExternalLink className="w-4 h-4 text-indigo-500" />
                </a>
              )}
              <button onClick={() => unlinkDoc.mutate(doc.fileId)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20" aria-label="הסר קישור">
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* In-system editor */}
      {editingDoc && (
        <div className="border-2 border-indigo-300 dark:border-indigo-700 rounded-xl p-4 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Pencil className="w-4 h-4 text-indigo-500" />
              עריכת: {editingDoc.name}
            </h4>
            <button onClick={() => { setEditingDoc(null); setEditContent(''); }} className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
              <X className="w-4 h-4" />
            </button>
          </div>
          <textarea
            className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm font-mono"
            rows={10}
            placeholder="תוכן המסמך..."
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            dir="rtl"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => saveEdit.mutate()} disabled={saveEdit.isPending} className="gap-2">
              {saveEdit.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              שמור שינויים
            </Button>
            {editingDoc.webViewLink && (
              <Button variant="outline" size="sm" onClick={() => window.open(editingDoc.webViewLink, '_blank')} className="gap-2">
                <ExternalLink className="w-4 h-4" />
                פתח ב-Google Docs
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Search & link from Drive */}
      <div className="border-t pt-4">
        <Button variant="outline" size="sm" onClick={() => setShowSearch(!showSearch)} className="gap-2">
          <Search className="w-4 h-4" />
          {showSearch ? 'סגור חיפוש' : 'חפש מסמך קיים ב-Drive'}
        </Button>
        {showSearch && (
          <div className="mt-3 space-y-3">
            <Input placeholder="חפש לפי שם קובץ..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} dir="rtl" />
            {searching && <div className="flex items-center justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-indigo-500" /></div>}
            {!searching && searchQuery && driveFiles.length === 0 && <p className="text-center text-sm text-gray-400 py-4">לא נמצאו קבצים</p>}
            {!searching && driveFiles.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {driveFiles.map((file) => {
                  const alreadyLinked = docs.some((d) => d.fileId === file.id);
                  return (
                    <div key={file.id} className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 dark:border-slate-700">
                      {file.iconLink ? <img src={file.iconLink} alt="" className="w-5 h-5 flex-shrink-0" /> : <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                      <span className="flex-1 text-sm truncate">{file.name}</span>
                      <Button size="sm" variant={alreadyLinked ? 'secondary' : 'default'} disabled={alreadyLinked} onClick={() => linkDoc.mutate(file)} className="h-7 text-xs">
                        {alreadyLinked ? 'מקושר' : 'קשר'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create new Google Doc */}
      <div className="border-t pt-4">
        <Button variant="outline" size="sm" onClick={() => document.getElementById('create-form-' + tool.id)?.classList.toggle('hidden')} className="gap-2">
          <Plus className="w-4 h-4" />
          צור מסמך הדרכה חדש (Google Doc)
        </Button>
        <div id={'create-form-' + tool.id} className="hidden mt-3 space-y-2">
          <Input placeholder="שם המסמך" value={createName} onChange={(e) => setCreateName(e.target.value)} dir="rtl" />
          <textarea
            className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm"
            rows={6}
            placeholder="תוכן המסמך (ניתן לערוך מאוחר יותר)..."
            value={createContent}
            onChange={(e) => setCreateContent(e.target.value)}
            dir="rtl"
          />
          <Button size="sm" onClick={() => createDoc.mutate()} disabled={createDoc.isPending} className="gap-2">
            {createDoc.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            צור וקשר
          </Button>
        </div>
      </div>
    </div>
  );
}