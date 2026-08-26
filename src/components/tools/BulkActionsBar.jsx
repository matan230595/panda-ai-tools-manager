import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Trash2, FolderInput, X, CheckSquare, Star, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function BulkActionsBar({
  selectedIds,
  tools,
  onClear,
  onSelectAll,
  totalTools,
}) {
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [targetCategory, setTargetCategory] = useState('');

  const allCategories = [...new Set(tools.map((t) => t.customCategory || t.category).filter(Boolean))].sort();

  const bulkDelete = useMutation({
    mutationFn: async (ids) => {
      await base44.entities.AiTool.deleteMany({ id: { $in: ids } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      toast.success(`${selectedIds.length} כלים נמחקו בהצלחה`);
      onClear();
      setShowDeleteConfirm(false);
    },
    onError: () => toast.error('שגיאה במחיקה מרוכזת'),
  });

  const bulkMoveCategory = useMutation({
    mutationFn: async ({ ids, category }) => {
      await base44.entities.AiTool.updateMany({ id: { $in: ids } }, { $set: { category } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      toast.success(`${selectedIds.length} כלים הועברו לקטגוריה`);
      onClear();
      setTargetCategory('');
    },
    onError: () => toast.error('שגיאה בהעברת הכלים'),
  });

  const bulkFavorite = useMutation({
    mutationFn: async ({ ids, favorite }) => {
      await base44.entities.AiTool.updateMany({ id: { $in: ids } }, { $set: { isFavorite: favorite } });
    },
    onSuccess: (_, { favorite }) => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      toast.success(`${selectedIds.length} כלים ${favorite ? 'סומנו כמועדפים' : 'הוסרו ממועדפים'}`);
      onClear();
    },
    onError: () => toast.error('שגיאה בעדכון מועדפים'),
  });

  const bulkMarkLearned = useMutation({
    mutationFn: (ids) => base44.entities.AiTool.updateMany({ id: { $in: ids } }, { $set: { masteryLevel: 'מומחה' } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      toast.success(`${selectedIds.length} כלים סומנו כנלמדו`);
      onClear();
    },
    onError: () => toast.error('שגיאה בסימון הכלים כנלמדו'),
  });

  return (
    <>
      <div className="grid grid-cols-2 items-center gap-2 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/80 dark:bg-indigo-950/40 p-3 animate-slide-in sm:flex" dir="rtl" aria-live="polite">
        <CheckSquare className="w-5 h-5 text-indigo-600 flex-shrink-0" />
        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300 flex-1 pr-1">
          נבחרו {selectedIds.length} מתוך {totalTools} כלים
        </span>

        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          aria-label="בחירת כל הכלים המסוננים"
          onClick={onSelectAll}
        >
          בחר הכל
        </Button>

        {/* העברה לקטגוריה */}
        <div className="flex items-center gap-1">
          <FolderInput className="w-4 h-4 text-indigo-500" aria-hidden="true" />
          <Select value={targetCategory} onValueChange={(v) => {
            setTargetCategory(v);
            bulkMoveCategory.mutate({ ids: selectedIds, category: v });
          }}>
            <SelectTrigger className="h-10 w-full text-xs sm:w-36" aria-label="העברת הכלים הנבחרים לקטגוריה">
              <SelectValue placeholder="העבר לקטגוריה..." />
            </SelectTrigger>
            <SelectContent>
              {allCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat.replace(/_/g, ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* מועדפים */}
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          aria-label="הוספת הכלים הנבחרים למועדפים"
          onClick={() => bulkFavorite.mutate({ ids: selectedIds, favorite: true })}
        >
          <Star className="w-3.5 h-3.5 ml-1" />
          הוסף למועדפים
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          aria-label="סימון הכלים הנבחרים כנלמדו"
          onClick={() => bulkMarkLearned.mutate(selectedIds)}
          disabled={selectedIds.length === 0 || bulkMarkLearned.isPending}
        >
          <GraduationCap className="w-3.5 h-3.5 ml-1" />
          סמן כנלמד
        </Button>

        {/* מחיקה */}
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-red-600"
          aria-label="מחיקת הכלים הנבחרים"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 className="w-3.5 h-3.5 ml-1" />
          מחק
        </Button>

        <Button variant="ghost" size="sm" className="text-xs" aria-label="ביטול בחירה מרובה" onClick={onClear}>
          <X className="w-3.5 h-3.5 ml-1" />
          ביטול
        </Button>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקה מרוכזת</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק {selectedIds.length} כלים? פעולה זו אינה הפיכה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bulkDelete.mutate(selectedIds)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              מחק {selectedIds.length} כלים
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}