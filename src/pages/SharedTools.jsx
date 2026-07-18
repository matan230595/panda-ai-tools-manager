import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Loader2, Lock, ExternalLink, Pencil, Share2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ToolForm from '@/components/tools/ToolForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function SharedTools() {
  const { token } = useParams();
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState('checking');
  const [editingTool, setEditingTool] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then((isAuthenticated) => {
      setAuthState(isAuthenticated ? 'authenticated' : 'unauthenticated');
    });
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['shared-tools', token],
    enabled: authState === 'authenticated' && !!token,
    queryFn: async () => {
      const links = await base44.entities.ShareLink.filter({ token, isActive: true });
      const shareLink = links[0];

      if (!shareLink) {
        throw new Error('not_found');
      }

      const loadedTools = await Promise.all(
        (shareLink.toolIds || []).map(async (toolId) => {
          try {
            return await base44.entities.AiTool.get(toolId);
          } catch {
            return null;
          }
        })
      );

      return {
        shareLink,
        tools: loadedTools.filter(Boolean),
      };
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => base44.entities.AiTool.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-tools', token] });
      toast.success('השינויים נשמרו');
      setEditingTool(null);
    },
    onError: () => toast.error('לא הצלחתי לשמור שינויים'),
  });

  if (authState === 'checking' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (authState !== 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-950 dark:via-slate-950 dark:to-indigo-950">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
              <Lock className="w-7 h-7" />
            </div>
            <CardTitle>הקישור הזה זמין למשתמשים מחוברים בלבד</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="w-full">
              התחבר כדי לצפות
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !data?.shareLink) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-950 dark:via-slate-950 dark:to-indigo-950">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
              <Share2 className="w-7 h-7" />
            </div>
            <CardTitle>הקישור הזה לא זמין</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            ייתכן שהקישור בוטל או שאינו קיים יותר.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-950 dark:via-slate-950 dark:to-indigo-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-3 text-right">
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <Badge variant="outline">{data.shareLink.permission === 'edit' ? 'צפייה ועריכה' : 'צפייה בלבד'}</Badge>
            <Badge>{data.shareLink.targetType === 'tool' ? 'כלי בודד' : 'רשימה משותפת'}</Badge>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold gradient-text">{data.shareLink.title || 'כלים משותפים'}</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            הקישור הזה פתוח רק למשתמשים שמחוברים למערכת.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.tools.map((tool) => (
            <Card key={tool.id} className="border border-indigo-100 dark:border-indigo-900/60">
              <CardHeader className="space-y-3">
                <div className="flex items-start gap-3">
                  {tool.logo ? (
                    <img src={tool.logo} alt={tool.name} className="w-12 h-12 rounded-xl object-contain border bg-white" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {tool.name?.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg truncate">{tool.name}</CardTitle>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tool.category && <Badge variant="secondary">{tool.category.replace(/_/g, ' ')}</Badge>}
                      {typeof tool.roiPercentage === 'number' && <Badge variant="outline">ROI {tool.roiPercentage}%</Badge>}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">{tool.description || 'אין תיאור זמין'}</p>
                {tool.notes && (
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 px-3 py-2 text-sm">
                    <span className="font-medium">הערה:</span> {tool.notes}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => window.open(tool.url, '_blank', 'noopener,noreferrer')}>
                    <ExternalLink className="w-4 h-4 ml-2" />
                    פתח אתר
                  </Button>
                  {data.shareLink.permission === 'edit' && (
                    <Button className="flex-1" onClick={() => setEditingTool(tool)}>
                      <Pencil className="w-4 h-4 ml-2" />
                      ערוך
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {editingTool && (
        <ToolForm
          tool={editingTool}
          onClose={() => setEditingTool(null)}
          onSave={(payload) => updateMutation.mutate({ id: editingTool.id, payload })}
        />
      )}
    </div>
  );
}