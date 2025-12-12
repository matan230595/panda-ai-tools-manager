import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ToolForm({ tool, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    category: 'אחר',
    pricing: 'חינם',
    features: [],
    integrations: [],
    tags: [],
    rating: 0,
    popularity: 3,
    isFavorite: false,
    logo: '',
    screenshots: [],
    videoDemo: '',
    notes: '',
    ...tool
  });

  const [newFeature, setNewFeature] = useState('');
  const [newIntegration, setNewIntegration] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isAutofilling, setIsAutofilling] = useState(false);

  const categories = [
    'עיבוד_שפה', 'יצירת_תמונות', 'וידאו', 'קוד', 'עיצוב', 
    'מחקר', 'פרודוקטיביות', 'אוטומציה', 'אנליטיקה', 'שיווק', 'אחר'
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addArrayItem = (field, value, setter) => {
    if (!value.trim()) return;
    handleChange(field, [...(formData[field] || []), value.trim()]);
    setter('');
  };

  const removeArrayItem = (field, index) => {
    handleChange(field, formData[field].filter((_, i) => i !== index));
  };

  const handleAutofill = async () => {
    if (!formData.name && !formData.url) {
      toast.error('הזן לפחות שם או URL של הכלי');
      return;
    }

    setIsAutofilling(true);
    
    try {
      const prompt = `
אתה עוזר AI שמספק מידע מדויק ומובנה על כלי AI.
${formData.name ? `שם הכלי: ${formData.name}` : ''}
${formData.url ? `URL: ${formData.url}` : ''}

ספק מידע מפורט בפורמט JSON עם השדות הבאים:
- name: שם מלא של הכלי
- description: תיאור מפורט (2-3 משפטים)
- category: אחת מהקטגוריות הבאות: עיבוד_שפה, יצירת_תמונות, וידאו, קוד, עיצוב, מחקר, פרודוקטיביות, אוטומציה, אנליטיקה, שיווק, אחר
- pricing: חינם / בתשלום / פרימיום / פרימיום_מוגבל
- features: מערך של 3-5 תכונות עיקריות
- integrations: מערך של אינטגרציות זמינות
- tags: מערך של 3-7 תגיות רלוונטיות בעברית
- rating: דירוג משוער (0-5)
- popularity: רמת פופולריות (1-5)
- logo: URL ללוגו (אם ידוע)

השב רק בפורמט JSON תקין, ללא טקסט נוסף.
      `;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            pricing: { type: 'string' },
            features: { type: 'array', items: { type: 'string' } },
            integrations: { type: 'array', items: { type: 'string' } },
            tags: { type: 'array', items: { type: 'string' } },
            rating: { type: 'number' },
            popularity: { type: 'number' },
            logo: { type: 'string' }
          }
        }
      });

      setFormData(prev => ({
        ...prev,
        ...response,
        url: prev.url || response.url || prev.url
      }));

      toast.success('המידע מולא בהצלחה! 🎉');
    } catch (error) {
      console.error('שגיאה במילוי אוטומטי:', error);
      toast.error('שגיאה במילוי אוטומטי. אנא בדוק את הגדרות ה-API.');
    } finally {
      setIsAutofilling(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.url) {
      toast.error('שם ו-URL הם שדות חובה');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl my-8 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold gradient-text">
            {tool ? 'עריכת כלי' : 'הוספת כלי חדש'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="סגור"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* שורה ראשונה: שם ו-URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">שם הכלי *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="לדוגמה: ChatGPT"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">כתובת URL *</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => handleChange('url', e.target.value)}
                placeholder="https://example.com"
                required
              />
            </div>
          </div>

          {/* כפתור מילוי אוטומטי */}
          <Button
            type="button"
            onClick={handleAutofill}
            disabled={isAutofilling || (!formData.name && !formData.url)}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            {isAutofilling ? (
              <>
                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                ממלא אוטומטית...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 ml-2" />
                מלא אוטומטית עם AI
              </>
            )}
          </Button>

          {/* תיאור */}
          <div className="space-y-2">
            <Label htmlFor="description">תיאור</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="תאר את הכלי במספר משפטים..."
              rows={3}
            />
          </div>

          {/* קטגוריה ותמחור */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">קטגוריה</Label>
              <Select value={formData.category} onValueChange={(val) => handleChange('category', val)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricing">תמחור</Label>
              <Select value={formData.pricing} onValueChange={(val) => handleChange('pricing', val)}>
                <SelectTrigger id="pricing">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="חינם">חינם</SelectItem>
                  <SelectItem value="בתשלום">בתשלום</SelectItem>
                  <SelectItem value="פרימיום">פרימיום</SelectItem>
                  <SelectItem value="פרימיום_מוגבל">פרימיום מוגבל</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* דירוג ופופולריות */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">דירוג (0-5)</Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => handleChange('rating', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="popularity">פופולריות (1-5)</Label>
              <Input
                id="popularity"
                type="number"
                min="1"
                max="5"
                value={formData.popularity}
                onChange={(e) => handleChange('popularity', parseInt(e.target.value) || 3)}
              />
            </div>
          </div>

          {/* תכונות */}
          <div className="space-y-2">
            <Label>תכונות עיקריות</Label>
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="הוסף תכונה..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('features', newFeature, setNewFeature))}
              />
              <Button type="button" onClick={() => addArrayItem('features', newFeature, setNewFeature)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.features?.map((feature, index) => (
                <Badge key={index} variant="secondary" className="pr-1">
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeArrayItem('features', index)}
                    className="mr-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* אינטגרציות */}
          <div className="space-y-2">
            <Label>אינטגרציות</Label>
            <div className="flex gap-2">
              <Input
                value={newIntegration}
                onChange={(e) => setNewIntegration(e.target.value)}
                placeholder="הוסף אינטגרציה..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('integrations', newIntegration, setNewIntegration))}
              />
              <Button type="button" onClick={() => addArrayItem('integrations', newIntegration, setNewIntegration)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.integrations?.map((integration, index) => (
                <Badge key={index} variant="outline" className="pr-1">
                  {integration}
                  <button
                    type="button"
                    onClick={() => removeArrayItem('integrations', index)}
                    className="mr-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* תגיות */}
          <div className="space-y-2">
            <Label>תגיות</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="הוסף תגית..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('tags', newTag, setNewTag))}
              />
              <Button type="button" onClick={() => addArrayItem('tags', newTag, setNewTag)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags?.map((tag, index) => (
                <Badge key={index} className="pr-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeArrayItem('tags', index)}
                    className="mr-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* הערות */}
          <div className="space-y-2">
            <Label htmlFor="notes">הערות פרטיות</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="הערות שיעזרו לך..."
              rows={2}
            />
          </div>

          {/* כפתורי פעולה */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="submit" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600">
              {tool ? 'שמור שינויים' : 'הוסף כלי'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              ביטול
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}