import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Upload, X, Save, Image } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BrandingTab({ settings }) {
  const queryClient = useQueryClient();
  const [appName, setAppName] = useState(settings?.appName || 'AI Tools Manager');
  const [logoUrl, setLogoUrl] = useState(settings?.userLogo || '');
  const [previewUrl, setPreviewUrl] = useState(settings?.userLogo || '');
  const [isUploading, setIsUploading] = useState(false);

  const updateSettings = useMutation({
    mutationFn: (data) => base44.entities.Settings.update(settings.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['settings']);
      toast.success('הברנדינג עודכן בהצלחה! 🎨');
      // עדכן favicon
      updateFavicon(logoUrl);
    },
    onError: () => toast.error('שגיאה בעדכון הברנדינג'),
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadedFile = await base44.integrations.Core.UploadFile({ file });
      setLogoUrl(uploadedFile.file_url);
      setPreviewUrl(uploadedFile.file_url);
      toast.success('הלוגו הועלה בהצלחה! ✅');
    } catch (error) {
      toast.error('שגיאה בהעלאת הלוגו');
    } finally {
      setIsUploading(false);
    }
  };

  const updateFavicon = (url) => {
    if (!url) return;
    
    // עדכן favicon
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = url;
  };

  const handleSave = () => {
    updateSettings.mutate({
      userLogo: logoUrl,
      appName: appName,
    });
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    setPreviewUrl('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">🎨 ברנדינג</h1>
        <p className="text-gray-600 dark:text-gray-400">התאם את מראה האפליקציה שלך</p>
      </div>

      {/* שם האפליקציה */}
      <Card className="glass-effect border-indigo-200 dark:border-indigo-800">
        <CardHeader>
          <CardTitle>שם האפליקציה</CardTitle>
          <CardDescription>שנה את שם האפליקציה המוצג בכל המערכת</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>שם</Label>
            <Input
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="AI Tools Manager"
              className="text-lg"
            />
          </div>
          <p className="text-sm text-gray-500">זה ישנה את השם בכל המערכת</p>
        </CardContent>
      </Card>

      {/* לוגו */}
      <Card className="glass-effect border-indigo-200 dark:border-indigo-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            לוגו אישי
          </CardTitle>
          <CardDescription>העלה לוגו זה יופיע בכל המערכת וביצור הפייביקון</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* תצוגה מקדימה */}
          {previewUrl ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-48 h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                <img src={previewUrl} alt="Logo preview" className="w-full h-full object-contain p-4" />
              </div>
              <Button
                variant="outline"
                onClick={handleRemoveLogo}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 ml-2" />
                הסר לוגו
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full gap-4 py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl">
              <Image className="w-12 h-12 text-gray-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">לא עלה לוגו עדיין</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, SVG (עד 10MB)</p>
              </div>
            </div>
          )}

          {/* העלאה */}
          <div className="space-y-3">
            <Label className="block">
              <div className="flex items-center justify-center w-full gap-2 px-4 py-3 bg-indigo-50 dark:bg-indigo-950 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  {isUploading ? 'מעלה...' : 'בחר לוגו'}
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={isUploading}
                className="hidden"
              />
            </Label>
          </div>

          {/* URL ישיר */}
          <div className="space-y-2">
            <Label>או הדבק URL ישירות</Label>
            <Input
              value={logoUrl}
              onChange={(e) => {
                setLogoUrl(e.target.value);
                setPreviewUrl(e.target.value);
              }}
              placeholder="https://..."
              type="url"
              className="font-mono text-sm"
            />
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 טיפ: השתמש בתמונה רבועית עם רקע שקוף (PNG) לתוצאות הטובות ביותר
          </p>
        </CardContent>
      </Card>

      {/* כפתור שמור */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-8"
        >
          <Save className="w-4 h-4 ml-2" />
          {updateSettings.isPending ? 'שומר...' : 'שמור שינויים'}
        </Button>
      </div>

      {/* תצוגה מקדימה גלובלית */}
      <Card className="glass-effect border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <CardHeader>
          <CardTitle className="text-base">👀 תצוגה מקדימה</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-700 rounded-lg">
            {logoUrl && (
              <img src={logoUrl} alt="App logo" className="w-10 h-10 object-contain" />
            )}
            <span className="font-semibold text-gray-900 dark:text-white">{appName}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            ככה יופיע הלוגו והשם בכל המערכת
          </p>
        </CardContent>
      </Card>
    </div>
  );
}