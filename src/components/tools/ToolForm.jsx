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
    detailedDescription: '',
    category: 'אחר',
    pricing: 'חינם',
    subscriptionType: 'חינמי',
    subscriptionPlans: [],
    priceUSD: 0,
    priceILS: 0,
    features: [],
    integrations: [],
    tags: [],
    rating: 0,
    popularity: 3,
    isFavorite: false,
    hasSubscription: false,
    logo: '',
    screenshots: [],
    videoDemo: '',
    useCases: [],
    prosAndCons: { pros: [], cons: [] },
    targetAudience: '',
    languagesSupported: [],
    platforms: [],
    notes: '',
    timeSavingsHours: 0,
    directRevenue: 0,
    roiPercentage: 0,
    roiDisplay: '',
    aiGenerated: false,
    ...tool
  });

  const [newFeature, setNewFeature] = useState('');
  const [newIntegration, setNewIntegration] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [isAutoFetchingMeta, setIsAutoFetchingMeta] = useState(false);

  const categories = [
    'עיבוד_שפה', 'יצירת_תמונות', 'וידאו', 'קוד', 'עיצוב', 
    'מחקר', 'פרודוקטיביות', 'אוטומציה', 'אנליטיקה', 'שיווק', 'כתיבה',
    'אודיו', 'נתונים', 'חינוך', 'אחר'
  ];

  // חישוב אוטומטי של המחיר בשקלים
  useEffect(() => {
    const calculateILS = async () => {
      if (formData.priceUSD > 0) {
        try {
          const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
          const data = await response.json();
          const ilsRate = data.rates.ILS;
          handleChange('priceILS', Math.round(formData.priceUSD * ilsRate));
        } catch (error) {
          handleChange('priceILS', Math.round(formData.priceUSD * 3.7));
        }
      }
    };
    calculateILS();
  }, [formData.priceUSD]);

  // חילוץ Meta Data מ-URL (לוגו, תיאור)
  useEffect(() => {
    const extractMetadata = async () => {
      if (!formData.url || formData.logo || isAutoFetchingMeta) return;

      setIsAutoFetchingMeta(true);
      try {
        const url = new URL(formData.url);
        const domain = url.hostname;
        
        // נסה לחלץ לוגו מ-favicon
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        
        // נסה לקבל OG image ותיאור
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(formData.url)}`);
        const data = await response.json();
        
        if (data.contents) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(data.contents, 'text/html');
          
          // חלץ OG image
          const ogImage = doc.querySelector('meta[property="og:image"]')?.content;
          if (ogImage && !formData.logo) {
            handleChange('logo', ogImage);
          }
          
          // חלץ תיאור אם לא קיים
          if (!formData.description) {
            const ogDescription = doc.querySelector('meta[property="og:description"]')?.content ||
                                 doc.querySelector('meta[name="description"]')?.content;
            if (ogDescription) {
              handleChange('description', ogDescription.substring(0, 200));
            }
          }
        }
        
        // תמיד הוסף favicon כגיבוי
        if (!formData.logo) {
          handleChange('logo', faviconUrl);
        }
      } catch (error) {
        console.log('שגיאה בחילוץ metadata:', error);
      } finally {
        setIsAutoFetchingMeta(false);
      }
    };

    const debounce = setTimeout(extractMetadata, 800);
    return () => clearTimeout(debounce);
  }, [formData.url]);

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
אתה עוזר AI מומחה לכלי בינה מלאכותית. תפקידך לספק מידע מקצועי, מפורט ומדויק בעברית.
${formData.name ? `שם הכלי: ${formData.name}` : ''}
${formData.url ? `URL: ${formData.url}` : ''}

🔍 **חקור את הכלי ביסודיות** - גש לאתר הרשמי, קרא דוחות, ביקורות, דפי מחירים ותיעוד.

📋 **ספק JSON מלא עם השדות הבאים:**

**מידע בסיסי:**
- name: שם מלא בעברית (תרגם אם באנגלית)
- description: תיאור קצר ותמציתי (1-2 משפטים)
- detailedDescription: תיאור מקיף ומפורט (4-6 פסקאות) כולל:
  * מהו הכלי ומה הוא עושה בדיוק
  * למי הוא מיועד (קהל יעד)
  * דוגמאות קונקרטיות לשימוש
  * מה ייחודי בו לעומת מתחרים
  * המלצות מקצועיות מתי להשתמש בו
- category: עיבוד_שפה / יצירת_תמונות / וידאו / קוד / עיצוב / מחקר / פרודוקטיביות / אוטומציה / אנליטיקה / שיווק / כתיבה / אודיו / נתונים / חינוך / אחר

**תמחור ומנויים:**
- pricing: חינם / בתשלום / פרימיום / פרימיום_מוגבל
- subscriptionType: חינמי / פרימיום / גולד (בהתאם למחיר)
- subscriptionPlans: מערך של תוכניות מנוי עם:
  * name (שם התוכנית)
  * priceUSD (מחיר חודשי בדולר)
  * features (תכונות ספציפיות לתוכנית זו)
  * limits (מגבלות שימוש)
- priceUSD: מחיר בסיסי בדולר (0 אם חינמי לחלוטין)

**תכונות ומאפיינים:**
- features: 5-8 תכונות מרכזיות בעברית
- integrations: אינטגרציות זמינות (Google, Slack, API וכו')
- tags: 6-10 תגיות חיפוש רלוונטיות
- prosAndCons: אובייקט עם pros (יתרונות) ו-cons (חסרונות) - מערכים של 3-5 נקודות כל אחד
- targetAudience: תיאור קהל היעד (למשל: "מעצבים, משווקים דיגיטליים, יזמים")
- languagesSupported: מערך של שפות (עברית, אנגלית, ערבית וכו')
- platforms: מערך פלטפורמות (Web, iOS, Android, Desktop, Chrome Extension)

**דירוגים:**
- rating: דירוג (0-5) מבוסס על ביקורות אמיתיות
- popularity: פופולריות (1-5)

**מדיה:**
- logo: URL מדויק ללוגו הרשמי
- useCases: 3-4 דוגמאות שימוש מפורטות, כל אחת עם title ו-description ברור

**חשוב:** כל הטקסטים בעברית תקנית ומקצועית. חקור לעומק ואל תמציא מידע!
      `;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            detailedDescription: { type: 'string' },
            category: { type: 'string' },
            pricing: { type: 'string' },
            subscriptionType: { type: 'string' },
            subscriptionPlans: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  priceUSD: { type: 'number' },
                  features: { type: 'array', items: { type: 'string' } },
                  limits: { type: 'string' }
                }
              }
            },
            priceUSD: { type: 'number' },
            features: { type: 'array', items: { type: 'string' } },
            integrations: { type: 'array', items: { type: 'string' } },
            tags: { type: 'array', items: { type: 'string' } },
            prosAndCons: {
              type: 'object',
              properties: {
                pros: { type: 'array', items: { type: 'string' } },
                cons: { type: 'array', items: { type: 'string' } }
              }
            },
            targetAudience: { type: 'string' },
            languagesSupported: { type: 'array', items: { type: 'string' } },
            platforms: { type: 'array', items: { type: 'string' } },
            rating: { type: 'number' },
            popularity: { type: 'number' },
            logo: { type: 'string' },
            useCases: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setFormData(prev => ({
        ...prev,
        ...response,
        url: prev.url || response.url || prev.url,
        aiGenerated: true
      }));

      toast.success('המידע מולא בהצלחה עם תרגום אוטומטי! 🎉');
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

    const monthlyValue = (formData.directRevenue || 0) + ((formData.timeSavingsHours || 0) * 100);
    const monthlyCost = formData.priceILS || 0;
    const roiPercentage = monthlyCost > 0 ? (((monthlyValue - monthlyCost) / monthlyCost) * 100) : (monthlyValue > 0 ? 100 : 0);

    onSave({
      ...formData,
      roiPercentage: Math.round(roiPercentage),
      roiDisplay: `ערך חודשי משוער ₪${monthlyValue} מול עלות ₪${monthlyCost}`,
      usageStats: {
        ...(formData.usageStats || {}),
        totalCostPerMonth: monthlyCost,
        roi: `ROI משוער: ${Math.round(roiPercentage)}%`,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-0 md:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-none md:rounded-2xl shadow-2xl w-full h-full md:h-auto md:max-w-3xl md:max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="text-xl md:text-2xl font-bold gradient-text">
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
        <div className="p-4 md:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
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
              <Label htmlFor="url">כתובת URL * {isAutoFetchingMeta && <span className="text-xs text-indigo-500 ml-1">⏳ חילוץ metadata...</span>}</Label>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              type="button"
              onClick={handleAutofill}
              disabled={isAutofilling || (!formData.name && !formData.url)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              {isAutofilling ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ממלא אוטומטית...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 ml-2" />
                  מלא אוטומטית עם AI
                </>
              )}
            </Button>

            {formData.logo && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <img src={formData.logo} alt="logo" className="w-8 h-8 rounded object-contain" />
                <span className="text-xs text-green-700 dark:text-green-300">✓ לוגו חולץ אוטומטית</span>
              </div>
            )}
          </div>

          {/* תיאור קצר */}
          <div className="space-y-2">
            <Label htmlFor="description">תיאור קצר</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="תיאור תמציתי (1-2 משפטים)..."
              rows={2}
            />
          </div>

          {/* תיאור מפורט */}
          <div className="space-y-2">
            <Label htmlFor="detailedDescription">תיאור מפורט</Label>
            <Textarea
              id="detailedDescription"
              value={formData.detailedDescription}
              onChange={(e) => handleChange('detailedDescription', e.target.value)}
              placeholder="תיאור מקיף עם דוגמאות שימוש, קהל יעד, יתרונות והמלצות..."
              rows={6}
              className="font-mono text-sm"
            />
          </div>

          {/* קטגוריה, תמחור וסוג מנוי */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="subscriptionType">סוג מנוי</Label>
              <Select value={formData.subscriptionType} onValueChange={(val) => handleChange('subscriptionType', val)}>
                <SelectTrigger id="subscriptionType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="חינמי">חינמי</SelectItem>
                  <SelectItem value="פרימיום">פרימיום</SelectItem>
                  <SelectItem value="גולד">גולד</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* מחירים */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceUSD">מחיר חודשי ($)</Label>
              <Input
                id="priceUSD"
                type="number"
                min="0"
                step="0.01"
                value={formData.priceUSD}
                onChange={(e) => handleChange('priceUSD', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceILS">מחיר בשקלים (₪) - מחושב אוטומטית</Label>
              <Input
                id="priceILS"
                type="number"
                value={formData.priceILS}
                disabled
                className="bg-gray-100 dark:bg-gray-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeSavingsHours">חיסכון זמן חודשי (שעות)</Label>
              <Input
                id="timeSavingsHours"
                type="number"
                min="0"
                step="0.5"
                value={formData.timeSavingsHours || 0}
                onChange={(e) => handleChange('timeSavingsHours', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="directRevenue">הכנסה ישירה חודשית (₪)</Label>
              <Input
                id="directRevenue"
                type="number"
                min="0"
                step="1"
                value={formData.directRevenue || 0}
                onChange={(e) => handleChange('directRevenue', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roiPercentage">ROI משוער</Label>
              <Input
                id="roiPercentage"
                type="text"
                value={`${formData.roiPercentage || 0}%`}
                disabled
                className="bg-gray-100 dark:bg-gray-800"
              />
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

        </div>
        
        {/* כפתורי פעולה */}
        <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 sticky bottom-0 bg-white dark:bg-gray-900">
          <Button type="button" onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 h-12">
            {tool ? 'שמור שינויים' : 'הוסף כלי'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12">
            ביטול
          </Button>
        </div>
      </div>
    </div>
  );
}