import React, { useMemo } from 'react';
import { AlertTriangle, ArrowLeftRight, Sparkles, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ToolLogo from '@/components/ToolLogo';

function textSimilarity(a = '', b = '') {
  const first = a.toLowerCase().trim();
  const second = b.toLowerCase().trim();
  if (!first || !second) return 0;
  if (first === second) return 1;
  const firstWords = new Set(first.split(/\s+/));
  const secondWords = new Set(second.split(/\s+/));
  const intersection = [...firstWords].filter((word) => secondWords.has(word)).length;
  const union = new Set([...firstWords, ...secondWords]).size || 1;
  return intersection / union;
}

function scorePair(tool, other) {
  const nameScore = textSimilarity(tool.name, other.name);
  const descriptionScore = textSimilarity(tool.description, other.description);
  const tagsScore = textSimilarity((tool.tags || []).join(' '), (other.tags || []).join(' '));
  const useCaseScore = textSimilarity(JSON.stringify(tool.useCases || []), JSON.stringify(other.useCases || []));
  const urlScore = tool.url && other.url && tool.url === other.url ? 1 : 0;
  return (nameScore * 0.4) + (descriptionScore * 0.25) + (tagsScore * 0.2) + (useCaseScore * 0.1) + (urlScore * 0.05);
}

export default function DuplicateDetectorDialog({ tools, onDelete, onMerge, onClose }) {
  const duplicateGroups = useMemo(() => {
    const groups = [];
    const seen = new Set();

    tools.forEach((tool) => {
      if (seen.has(tool.id)) return;

      const matches = tools
        .filter((other) => other.id !== tool.id && !seen.has(other.id))
        .map((other) => ({ other, score: scorePair(tool, other) }))
        .filter(({ score }) => score >= 0.55)
        .sort((a, b) => b.score - a.score);

      if (matches.length > 0) {
        const group = [tool, ...matches.map((item) => ({ ...item.other, duplicateScore: item.score }))];
        group.forEach((item) => seen.add(item.id));
        groups.push(group);
      }
    });

    return groups;
  }, [tools]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[88vh] overflow-hidden flex flex-col" onClick={(event) => event.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">מנקה כפילויות</h2>
              <p className="text-sm text-gray-500">{duplicateGroups.length} קבוצות עם חפיפה גבוהה</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>

        <div className="overflow-y-auto p-6 space-y-5">
          {duplicateGroups.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-green-500" />
              לא נמצאו כפילויות משמעותיות במערכת.
            </div>
          ) : (
            duplicateGroups.map((group, index) => {
              const primary = group[0];
              const duplicates = group.slice(1);

              return (
                <div key={primary.id} className="rounded-2xl border border-orange-200 dark:border-orange-800 p-5 bg-orange-50/50 dark:bg-orange-950/20">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-orange-500 text-white">קבוצה {index + 1}</Badge>
                    <div className="text-xs text-gray-500">הכלי הראשי נשמר, והאחרים מוצעים למיזוג או מחיקה</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-white dark:bg-gray-900 p-4 border">
                      <div className="text-xs font-semibold text-green-600 mb-3">כלי ראשי</div>
                      <div className="flex items-center gap-3">
                        <ToolLogo tool={primary} size="sm" />
                        <div>
                          <div className="font-semibold">{primary.name}</div>
                          <div className="text-xs text-gray-500">{primary.description || 'ללא תיאור'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {duplicates.map((tool) => (
                        <div key={tool.id} className="rounded-xl bg-white dark:bg-gray-900 p-4 border">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <ToolLogo tool={tool} size="sm" />
                              <div className="min-w-0">
                                <div className="font-semibold truncate">{tool.name}</div>
                                <div className="text-xs text-gray-500 line-clamp-2">{tool.description || 'ללא תיאור'}</div>
                              </div>
                            </div>
                            <Badge variant="outline">{Math.round((tool.duplicateScore || 0) * 100)}%</Badge>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" className="flex-1" onClick={() => onMerge?.(primary, tool)}>
                              <ArrowLeftRight className="w-4 h-4 ml-2" />
                              מזג לתוך הראשי
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => onDelete?.(tool)}>
                              <Trash2 className="w-4 h-4 ml-2" />
                              מחק
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}