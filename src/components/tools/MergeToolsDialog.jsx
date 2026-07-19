import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeftRight, Loader2 } from 'lucide-react';

/**
 * Lets the user reconcile the two differing descriptions before merging.
 * options: 'primary' | 'duplicate' | 'both' | 'custom'
 */
export default function MergeToolsDialog({ primary, duplicate, onConfirm, onCancel, isMerging }) {
  const primaryDesc = primary?.description || '';
  const duplicateDesc = duplicate?.description || '';
  const bothDesc = [primaryDesc, duplicateDesc].filter(Boolean).join('\n\n');

  const [choice, setChoice] = useState('both');
  const [customText, setCustomText] = useState(bothDesc);

  const resolvedDescription =
    choice === 'primary' ? primaryDesc :
    choice === 'duplicate' ? duplicateDesc :
    choice === 'both' ? bothDesc :
    customText;

  const OptionCard = ({ value, title, text }) => (
    <button
      type="button"
      onClick={() => setChoice(value)}
      className={`w-full text-right rounded-xl border p-3 transition-all ${
        choice === value
          ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-50/60 dark:bg-indigo-950/30'
          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
      }`}
    >
      <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">{title}</div>
      <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 whitespace-pre-wrap">
        {text || 'ללא תיאור'}
      </div>
    </button>
  );

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="flex items-center gap-2 justify-start">
            <ArrowLeftRight className="w-5 h-5 text-indigo-500" />
            מיזוג "{duplicate?.name}" לתוך "{primary?.name}"
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600 dark:text-gray-400 text-right">
          לכל כלי הסבר מעט שונה. בחר איזה תיאור לשמור לכלי המאוחד:
        </p>

        <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pt-1">
          <OptionCard value="both" title="אחד את שני התיאורים (מומלץ)" text={bothDesc} />
          <OptionCard value="primary" title={`תיאור של ${primary?.name}`} text={primaryDesc} />
          <OptionCard value="duplicate" title={`תיאור של ${duplicate?.name}`} text={duplicateDesc} />

          <button
            type="button"
            onClick={() => setChoice('custom')}
            className={`w-full text-right rounded-xl border p-3 transition-all ${
              choice === 'custom'
                ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-50/60 dark:bg-indigo-950/30'
                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
            }`}
          >
            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">כתיבה ידנית</div>
          </button>
          {choice === 'custom' && (
            <div className="space-y-1.5">
              <Label className="text-xs">תיאור מותאם</Label>
              <Textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={5}
                className="text-sm"
              />
            </div>
          )}
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-2.5 text-xs text-gray-500">
          שאר המידע (תגיות, תכונות, אינטגרציות, נתוני שימוש) יאוחד אוטומטית משני הכלים.
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isMerging}>ביטול</Button>
          <Button onClick={() => onConfirm(resolvedDescription)} disabled={isMerging}>
            {isMerging ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <ArrowLeftRight className="w-4 h-4 ml-2" />}
            אחד כלים
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}