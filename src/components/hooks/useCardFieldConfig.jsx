import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';

// השדות בכרטיס שניתן להציג/להסתיר, בסדר ברירת המחדל
export const CARD_FIELDS = [
  { fieldName: 'description', fieldLabel: 'תיאור', fieldType: 'text' },
  { fieldName: 'rating', fieldLabel: 'דירוג כוכבים', fieldType: 'number' },
  { fieldName: 'category', fieldLabel: 'קטגוריה', fieldType: 'text' },
  { fieldName: 'tags', fieldLabel: 'תגיות', fieldType: 'array' },
  { fieldName: 'pricing', fieldLabel: 'תמחור', fieldType: 'text' },
  { fieldName: 'popularity', fieldLabel: 'סימון פופולרי', fieldType: 'number' },
];

/**
 * טוען את הגדרות התצוגה של שדות הכרטיס.
 * מחזיר מפה { fieldName: isVisible } — שדה חסר נחשב גלוי כברירת מחדל.
 */
export function useCardFieldConfig() {
  const { data: configs = [], ...rest } = useQuery({
    queryKey: ['fieldConfigs'],
    queryFn: async () => {
      try {
        const user = await getCurrentUser();
        return await base44.entities.FieldConfig.filter({ created_by_id: user.id });
      } catch {
        return [];
      }
    },
  });

  const visibility = {};
  for (const field of CARD_FIELDS) {
    const saved = configs.find((c) => c.fieldName === field.fieldName);
    visibility[field.fieldName] = saved ? saved.isVisible !== false : true;
  }

  return { visibility, configs, ...rest };
}