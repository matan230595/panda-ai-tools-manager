import React, { useEffect, useMemo, useState } from 'react';
import { X, Sparkles, Loader2, Plus, AlertCircle, Info } from 'lucide-react';
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
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import CredentialsSection from '@/components/tools/form/CredentialsSection';
import ArrayInputField from '@/components/tools/form/ArrayInputField';

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
    userCredentials: { email: '', username: '', password: '', phoneNumber: '', googleConnected: false },
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

  const [newCustomCategory, setNewCustomCategory] = useState('');
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [isAutoFetchingMeta, setIsAutoFetchingMeta] = useState(false);
  const [autofillError, setAutofillError] = useState('');

  const hasApiConfigured = useMemo(() => {
    return !![
      'geminiApiKey',
      'groqApiKey',
      'mistralApiKey',
      'cohereApiKey',
      'huggingfaceApiKey',
      'togetherApiKey',
      'claudeApiKey',
      'openaiApiKey',
      'ollamaEndpoint',
      'localaiBudget'
    ].some((key) => String(formData[key] || '').trim());
  }, [formData]);

  const categories = [
    'עיבוד_שפה', 'יצירת_תמונות', 'וידאו', 'קוד', 'עיצוב', 
    'מחקר', 'פרודוקטיביות', 'אוטומציה', 'אנליטיקה', 'שיווק', 'כתיבה',
    'אודיו', 'נתונים', 'חינוך', 'אחר'
  ];
  const validCategories = new Set(categories);

  const customCategories = useMemo(() => {
    return Array.isArray(tool?.availableCustomCategories) ? tool.availableCustomCategories : [];
  }, [tool]);

  const categoryOptions = useMemo(() => {
    return [...new Set([...categories, ...customCategories, formData.customCategory].filter(Boolean))];
  }, [categories, customCategories, formData.customCategory]);

  // חישוב אוטומטי של המחיר בשקלים
  useEffect(() => {
    const usd = Number(formData.priceUSD) || 0;
    if (usd <= 0) {
      handleChange('priceILS', 0);
      return;
    }

    // עדכון מיידי לפי שער ברירת מחדל כדי שהשדה תמיד יתעדכן
    const FALLBACK_RATE = 3.7;
    handleChange('priceILS', Math.round(usd * FALLBACK_RATE));

    // ניסיון לשפר לפי שער חי (לא חוסם, נכשל בשקט)
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        const ilsRate = data?.rates?.ILS;
        if (!cancelled && ilsRate) {
          handleChange('priceILS', Math.round(usd * ilsRate));
        }
      } catch {
        // נשארים עם שער ברירת המחדל
      }
    })();

    return () => { cancelled = true; };
  }, [formData.priceUSD]);

  // חילוץ Meta Data מ-URL (לוגו, תיאור)
  useEffect(() => {
    const extractMetadata = async () => {
      if (!formData.url || formData.logo || isAutoFetchingMeta) return;

      setIsAutoFetchingMeta(true);
      try {
        const url = new URL(formData.url);
        const domain = url.hostname;
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

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

  const handleCredentialChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      userCredentials: { ...(prev.userCredentials || {}), [field]: value },
    }));
  };

  const addArrayItem = (field, value) => {
    handleChange(field, [...(formData[field] || []), value]);
  };

  const removeArrayItem = (field, index) => {
    handleChange(field, formData[field].filter((_, i) => i !== index));
  };

  const handleAutofill = async () => {
    if (!formData.name && !formData.url) {
      toast.error('הזן לפחות שם או URL של הכלי');
      return;
    }

    setAutofillError('');
    setIsAutofilling(true);
    
    try {
      const prompt = `
אתה עוזר AI מומחה לכלי בינה מלאכותית. תפקידך לספק מידע מקצועי, מפורט ומדויק בעברית.
${formData.name ? `שם הכלי: ${formData.name}` : ''}
${formData.url ? `URL: ${formData.url}` : ''}

🔍 **חקור את הכלי ביסודיות** - גש לאתר הרשמי, קרא דוחות, ביקורות, דפי מחירים ותיעוד.

📋 **ספק JSON מלא עם השדות הבאים:**

**מידע בסיסי:**
- url: כתובת האתר הרשמית המלאה של הכלי (homepage מדויקת, https מלא)
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
            url: { type: 'string' },
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
        url: response.url || prev.url,
        popularity: Math.max(1, Math.min(5, Math.round(Number(response.popularity || prev.popularity || 3)))),
        rating: Number(response.rating || prev.rating || 0),
        aiGenerated: true
      }));

      toast.success('המידע מולא בהצלחה עם תרגום אוטומטי! 🎉');
    } catch (error) {
      console.error('שגיאה במילוי אוטומטי:', error);
      const integrationLimitReached = error?.status === 402 || error?.data?.extra_data?.reason === 'integration_credits_limit_reached';
      const message = integrationLimitReached
        ? 'נגמרו קרדיטי האינטגרציות של החשבון, לכן המילוי האוטומטי חסום כרגע.'
        : 'המילוי האוטומטי נכשל. בדוק שהוגדר מפתח API פעיל בהגדרות.';
      setAutofillError(message);
      toast.error(message);
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

    const validCategories = new Set(categories);
    const validPricing = new Set(['חינם', 'בתשלום', 'פרימיום', 'פרימיום_מוגבל']);
    const validSubscriptionTypes = new Set(['חינמי', 'פרימיום', 'גולד']);
    const normalizedUrl = formData.url.startsWith('http') ? formData.url : `https://${formData.url}`;
    const monthlyValue = (formData.directRevenue || 0) + ((formData.timeSavingsHours || 0) * 100);
    const monthlyCost = Number(formData.priceILS || 0);
    const roiPercentage = monthlyCost > 0 ? (((monthlyValue - monthlyCost) / monthlyCost) * 100) : (monthlyValue > 0 ? 100 : 0);

    const normalizedCategory = String(formData.customCategory || formData.category || 'אחר').trim();

    const sanitizedPayload = {
      name: formData.name.trim(),
      url: normalizedUrl.trim(),
      description: String(formData.description || ''),
      detailedDescription: String(formData.detailedDescription || ''),
      category: normalizedCategory || (validCategories.has(formData.category) ? formData.category : 'אחר'),
      customCategory: validCategories.has(normalizedCategory) ? '' : normalizedCategory,
      pricing: validPricing.has(formData.pricing) ? formData.pricing : 'חינם',
      subscriptionType: validSubscriptionTypes.has(formData.subscriptionType) ? formData.subscriptionType : 'חינמי',
      subscriptionPlans: Array.isArray(formData.subscriptionPlans) ? formData.subscriptionPlans.map((plan) => ({
        name: String(plan?.name || ''),
        priceUSD: Number(plan?.priceUSD || 0),
        priceILS: Number(plan?.priceILS || 0),
        features: Array.isArray(plan?.features) ? plan.features.filter(Boolean).map(String) : [],
        limits: String(plan?.limits || ''),
      })).filter((plan) => plan.name) : [],
      priceUSD: Number(formData.priceUSD || 0),
      priceILS: monthlyCost,
      timeSavingsHours: Number(formData.timeSavingsHours || 0),
      directRevenue: Number(formData.directRevenue || 0),
      roiPercentage: Math.round(roiPercentage),
      roiDisplay: `ערך חודשי משוער ₪${monthlyValue} מול עלות ₪${monthlyCost}`,
      features: Array.isArray(formData.features) ? formData.features.filter(Boolean).map(String) : [],
      integrations: Array.isArray(formData.integrations) ? formData.integrations.filter(Boolean).map(String) : [],
      tags: Array.isArray(formData.tags) ? formData.tags.filter(Boolean).map(String) : [],
      rating: Number(formData.rating || 0),
      popularity: Math.max(1, Math.min(5, Math.round(Number(formData.popularity || 3)))),
      isFavorite: !!formData.isFavorite,
      hasSubscription: !!formData.hasSubscription,
      userCredentials: formData.hasSubscription ? {
        email: String(formData.userCredentials?.email || ''),
        username: String(formData.userCredentials?.username || ''),
        password: String(formData.userCredentials?.password || ''),
        phoneNumber: String(formData.userCredentials?.phoneNumber || ''),
        googleConnected: !!formData.userCredentials?.googleConnected,
      } : { email: '', username: '', password: '', phoneNumber: '', googleConnected: false },
      logo: String(formData.logo || ''),
      screenshots: Array.isArray(formData.screenshots) ? formData.screenshots.filter(Boolean).map(String) : [],
      videoDemo: String(formData.videoDemo || ''),
      useCases: Array.isArray(formData.useCases) ? formData.useCases.map((item) => ({
        title: String(item?.title || ''),
        description: String(item?.description || ''),
      })).filter((item) => item.title) : [],
      prosAndCons: {
        pros: Array.isArray(formData.prosAndCons?.pros) ? formData.prosAndCons.pros.filter(Boolean).map(String) : [],
        cons: Array.isArray(formData.prosAndCons?.cons) ? formData.prosAndCons.cons.filter(Boolean).map(String) : [],
      },
      targetAudience: String(formData.targetAudience || ''),
      languagesSupported: Array.isArray(formData.languagesSupported) ? formData.languagesSupported.filter(Boolean).map(String) : [],
      platforms: Array.isArray(formData.platforms) ? formData.platforms.filter(Boolean).map(String) : [],
      notes: String(formData.notes || ''),
      personalNotes: String(formData.personalNotes || formData.notes || ''),
      aiGenerated: !!formData.aiGenerated,
      usageStats: {
        ...(formData.usageStats || {}),
        totalCostPerMonth: monthlyCost,
        roi: `ROI משוער: ${Math.round(roiPercentage)}%`,
      },
    };

    onSave(sanitizedPayload);
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

          {/* רמז חכם: זוהה לינק — אפשר לנתח אוטומטית */}
          {formData.url && !formData.aiGenerated && (
            <button
              type="button"
              onClick={handleAutofill}
              disabled={isAutofilling}
              className="w-full flex items-center gap-3 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/30 px-4 py-3 text-right hover:shadow-md transition-all disabled:opacity-60"
            >
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-indigo-800 dark:text-indigo-200">זוהה לינק — נתח אותו אוטומטית</span>
                <span className="block text-xs text-indigo-600/80 dark:text-indigo-300/70 truncate">ה-AI ימלא שם, תיאור, קטגוריה, מחירים ותכונות מתוך העמוד</span>
              </span>
            </button>
          )}

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

          {autofillError && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>{autofillError}</div>
            </div>
          )}

          {!hasApiConfigured && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>לא זוהה שום מפתח או endpoint מוגדר בטופס הזה, לכן המילוי האוטומטי עלול להיכשל.</div>
            </div>
          )}

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
              <Select value={formData.customCategory || formData.category} onValueChange={(val) => {
                handleChange('category', val);
                handleChange('customCategory', validCategories.has(val) ? '' : val);
              }}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  value={newCustomCategory}
                  onChange={(e) => setNewCustomCategory(e.target.value)}
                  placeholder="צור קטגוריה משלך"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = newCustomCategory.trim();
                      if (!value) return;
                      handleChange('category', value);
                      handleChange('customCategory', value);
                      setNewCustomCategory('');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const value = newCustomCategory.trim();
                    if (!value) return;
                    handleChange('category', value);
                    handleChange('customCategory', value);
                    setNewCustomCategory('');
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
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
          <ArrayInputField
            label="תכונות עיקריות"
            placeholder="הוסף תכונה..."
            items={formData.features}
            onAdd={(val) => addArrayItem('features', val)}
            onRemove={(index) => removeArrayItem('features', index)}
          />

          {/* אינטגרציות */}
          <ArrayInputField
            label="אינטגרציות"
            placeholder="הוסף אינטגרציה..."
            items={formData.integrations}
            onAdd={(val) => addArrayItem('integrations', val)}
            onRemove={(index) => removeArrayItem('integrations', index)}
            badgeVariant="outline"
          />

          {/* תגיות */}
          <ArrayInputField
            label="תגיות"
            placeholder="הוסף תגית..."
            items={formData.tags}
            onAdd={(val) => addArrayItem('tags', val)}
            onRemove={(index) => removeArrayItem('tags', index)}
            badgeClassName="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
          />

          {/* יש לי מנוי פעיל + פרטי גישה מוצפנים */}
          <CredentialsSection
            hasSubscription={formData.hasSubscription}
            credentials={formData.userCredentials}
            onToggleSubscription={(val) => handleChange('hasSubscription', val)}
            onCredentialChange={handleCredentialChange}
          />

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