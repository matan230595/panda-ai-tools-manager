import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AIAutoComplete({ toolName, onComplete }) {
  const [loading, setLoading] = useState(false);
  
  const handleAutoComplete = async () => {
    if (!toolName || toolName.length < 2) {
      toast.error('הכנס לפחות 2 תווים של שם כלי');
      return;
    }

    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `כלי AI בשם "${toolName}" - הנתוני הבאים דרוש:
1. כתובת אתר (URL מלאה)
2. תיאור קצר (עד 100 תווים)
3. קטגוריה (בחר מ: עיבוד_שפה, יצירת_תמונות, וידאו, קוד, עיצוב, מחקר, פרודוקטיביות, אוטומציה, אנליטיקה, שיווק)
4. מחיר משוער (בדולרים, 0 אם חינמי)

תשובה בפורמט JSON בלבד, ללא טקסט נוסף:
{
  "url": "...",
  "description": "...",
  "category": "...",
  "priceUSD": ...
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            priceUSD: { type: 'number' }
          }
        }
      });

      onComplete({
        url: result.url || '',
        description: result.description || '',
        category: result.category || 'אחר',
        priceUSD: result.priceUSD || 0
      });

      toast.success('✨ פרטים הושלמו בהצלחה! הערוך אם יש צורך');
    } catch (error) {
      toast.error('שגיאה בהשלמה אוטומטית. נסה להזין ידנית');
      console.error('AutoComplete error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAutoComplete}
      disabled={loading || !toolName}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {loading ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          מחפש...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          השלם אוטומטית
        </>
      )}
    </Button>
  );
}