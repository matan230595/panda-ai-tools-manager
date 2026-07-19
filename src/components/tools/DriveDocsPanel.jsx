import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FolderOpen as DriveIcon, Search, FileText, ExternalLink, Loader2, Plus, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function DriveDocsPanel({ tool }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadContent, setUploadContent] = useState('');

  const { data: driveFiles = [], isLoading: searching, refetch } = useQuery({
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
      if (existing.some((d) => d.fileId === file.id)) {
        throw new Error('המסמך כבר מקושר לכלי זה');
      }
      const updated = [...existing, {
        fileId: file.id,
        name: file.name,
        mimeType: file.mimeType,
        iconLink: file.iconLink,
        webViewLink: file.webViewLink,
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

  const uploadDoc = useMutation({
    mutationFn: async () => {
      if (!uploadName.trim() || !uploadContent.trim()) throw new Error('נא למלא שם ותוכן');
      const res = await base44.functions.invoke('manageDriveDocs', {
        action: 'upload',
        fileName: `${uploadName}.md`,
        mimeType: 'text/markdown',
        content: uploadContent,
        folderName: 'AI Tools Manager',
      });
      const file = res.data?.file;
      if (!file) throw new Error('העלאה נכשלה');
      const existing = tool.driveDocs || [];
      const updated = [...existing, {
        fileId: file.id,
        name: file.name,
        mimeType: file.mimeType,
        iconLink: file.iconLink,
        webViewLink: file.webViewLink,
      }];
      return base44.entities.AiTool.update(tool.id, { driveDocs: updated });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      toast.success('המסמך נוצר וקושר בהצלחה!');
      setUploadName('');
      setUploadContent('');
    },
    onError: (err) => toast.error(err.message),
  });

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
              {doc.iconLink ? (
                <img src={doc.iconLink} alt="" className="w-6 h-6 flex-shrink-0" />
              ) : (
                <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{doc.name}</div>
                <div className="text-xs text-gray-400 truncate">{doc.mimeType}</div>
              </div>
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

      {/* Search & link from Drive */}
      <div className="border-t pt-4">
        <Button variant="outline" size="sm" onClick={() => setShowSearch(!showSearch)} className="gap-2">
          <Search className="w-4 h-4" />
          {showSearch ? 'סגור חיפוש' : 'חפש מסמך ב-Drive'}
        </Button>

        {showSearch && (
          <div className="mt-3 space-y-3">
            <Input
              placeholder="חפש לפי שם קובץ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              dir="rtl"
            />
            {searching && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              </div>
            )}
            {!searching && searchQuery && driveFiles.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-4">לא נמצאו קבצים</p>
            )}
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

      {/* Upload new document */}
      <div className="border-t pt-4">
        <Button variant="outline" size="sm" onClick={() => document.getElementById('upload-form-' + tool.id)?.classList.toggle('hidden')} className="gap-2">
          <Upload className="w-4 h-4" />
          צור מסמך הדרכה חדש
        </Button>
        <div id={'upload-form-' + tool.id} className="hidden mt-3 space-y-2">
          <Input placeholder="שם המסמך" value={uploadName} onChange={(e) => setUploadName(e.target.value)} dir="rtl" />
          <textarea
            className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm"
            rows={4}
            placeholder="תוכן המסמך..."
            value={uploadContent}
            onChange={(e) => setUploadContent(e.target.value)}
            dir="rtl"
          />
          <Button size="sm" onClick={() => uploadDoc.mutate()} disabled={uploadDoc.isPending} className="gap-2">
            {uploadDoc.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            שמור וקשר
          </Button>
        </div>
      </div>
    </div>
  );
}