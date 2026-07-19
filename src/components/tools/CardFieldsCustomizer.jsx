import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { CARD_FIELDS, useCardFieldConfig } from '@/components/hooks/useCardFieldConfig';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SlidersHorizontal, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

/**
 * פאנל להתאמה אישית של אילו שדות מוצגים בכרטיס הכלי.
 * שומר ל-FieldConfig המשויך למשתמש.
 */
export default function CardFieldsCustomizer() {
  const queryClient = useQueryClient();
  const { visibility, configs } = useCardFieldConfig();
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState(null);
  const [saving, setSaving] = useState(false);

  const state = local || visibility;

  const handleOpen = (isOpen) => {
    setOpen(isOpen);
    if (isOpen) setLocal({ ...visibility });
  };

  const toggle = (fieldName) => {
    setLocal((prev) => ({ ...(prev || visibility), [fieldName]: !(prev || visibility)[fieldName] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = await getCurrentUser();
      for (const field of CARD_FIELDS) {
        const existing = configs.find((c) => c.fieldName === field.fieldName);
        const payload = {
          fieldName: field.fieldName,
          fieldLabel: field.fieldLabel,
          fieldType: field.fieldType,
          isVisible: state[field.fieldName] !== false,
        };
        if (existing) {
          await base44.entities.FieldConfig.update(existing.id, payload);
        } else {
          await base44.entities.FieldConfig.create(payload);
        }
      }
      queryClient.invalidateQueries(['fieldConfigs']);
      toast.success('תצוגת הכרטיסים עודכנה');
      setOpen(false);
    } catch {
      toast.error('שגיאה בשמירת ההגדרות');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="w-4 h-4 ml-1.5" />
          התאם כרטיסים
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>התאמת שדות הכרטיס</DialogTitle>
        </DialogHeader>
        <div className="space-y-1 py-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">בחר אילו שדות יוצגו בכרטיסי הכלים</p>
          {CARD_FIELDS.map((field) => (
            <div key={field.fieldName} className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <Label htmlFor={`field-${field.fieldName}`} className="cursor-pointer">{field.fieldLabel}</Label>
              <Switch
                id={`field-${field.fieldName}`}
                checked={state[field.fieldName] !== false}
                onCheckedChange={() => toggle(field.fieldName)}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-indigo-500 to-purple-600">
            {saving && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
            שמור
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}