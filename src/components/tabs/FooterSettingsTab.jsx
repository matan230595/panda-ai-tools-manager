import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FooterSettingsTab({ settings }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    aboutTitle: settings?.footerContent?.aboutTitle || 'אודותינו',
    aboutText: settings?.footerContent?.aboutText || 'AI Tools Manager - פתרון מתקדם לניהול כלי AI שלך.',
    linksTitle: settings?.footerContent?.linksTitle || 'קישורים',
    links: settings?.footerContent?.links || [
      { label: 'עמוד הבית', url: '/' },
      { label: 'הצהרת פרטיות', url: '/privacy' },
      { label: 'תנאי שימוש', url: '/terms' },
      { label: 'נגישות', url: '/accessibility' }
    ],
    supportTitle: settings?.footerContent?.supportTitle || 'תמיכה',
    supportLinks: settings?.footerContent?.supportLinks || [
      { label: 'צור קשר', url: '/contact' },
      { label: 'תמיכה טכנית', url: 'mailto:support@pandavoice.com' },
      { label: 'קול קטגוריה', url: 'tel:+972503000000' }
    ],
    socialTitle: settings?.footerContent?.socialTitle || 'עקוב אחרינו',
    socialLinks: settings?.footerContent?.socialLinks || [
      { label: 'Twitter', url: '#' },
      { label: 'LinkedIn', url: '#' },
      { label: 'Facebook', url: '#' }
    ],
    copyrightText: settings?.footerContent?.copyrightText || 'כל הזכויות שמורות ©'
  });

  const updateSettings = useMutation({
    mutationFn: (data) => base44.entities.Settings.update(settings.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['settings']);
      toast.success('הגדרות Footer נשמרו בהצלחה! ✅');
    },
    onError: () => toast.error('שגיאה בשמירת ההגדרות'),
  });

  const handleSave = () => {
    updateSettings.mutate({ footerContent: formData });
  };

  const updateLinksArray = (field, index, key, value) => {
    const newArray = [...formData[field]];
    newArray[index] = { ...newArray[index], [key]: value };
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addLink = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], { label: '', url: '' }]
    }));
  };

  const removeLink = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">⚙️ הגדרות Footer</h2>
        <p className="text-gray-600 dark:text-gray-400">שלוט בכל התוכן, המלל והקישורים של Footer</p>
      </div>

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle>סעיף אודותינו</CardTitle>
          <CardDescription>הגדר את כותרת והתיאור של סעיף אודותינו</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>כותרת סעיף</Label>
            <Input
              value={formData.aboutTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, aboutTitle: e.target.value }))}
              placeholder="אודותינו"
            />
          </div>
          <div>
            <Label>טקסט תיאור</Label>
            <Textarea
              value={formData.aboutText}
              onChange={(e) => setFormData(prev => ({ ...prev, aboutText: e.target.value }))}
              placeholder="הזן תיאור..."
              className="min-h-24"
            />
          </div>
        </CardContent>
      </Card>

      {/* Links Section */}
      <Card>
        <CardHeader>
          <CardTitle>סעיף קישורים</CardTitle>
          <CardDescription>ערוך את קישורי Footer הראשיים</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>כותרת סעיף</Label>
            <Input
              value={formData.linksTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, linksTitle: e.target.value }))}
              placeholder="קישורים"
            />
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">קישורים:</h4>
            {formData.links.map((link, idx) => (
              <div key={idx} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-xs">תווית</Label>
                  <Input
                    value={link.label}
                    onChange={(e) => updateLinksArray('links', idx, 'label', e.target.value)}
                    placeholder="תווית קישור"
                    size="sm"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">כתובת URL</Label>
                  <Input
                    value={link.url}
                    onChange={(e) => updateLinksArray('links', idx, 'url', e.target.value)}
                    placeholder="https://..."
                    size="sm"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLink('links', idx)}
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addLink('links')}
              className="w-full"
            >
              <Plus className="w-4 h-4 ml-2" />
              הוסף קישור
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Support Section */}
      <Card>
        <CardHeader>
          <CardTitle>סעיף תמיכה</CardTitle>
          <CardDescription>ערוך את קישורי התמיכה</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>כותרת סעיף</Label>
            <Input
              value={formData.supportTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, supportTitle: e.target.value }))}
              placeholder="תמיכה"
            />
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">קישורי תמיכה:</h4>
            {formData.supportLinks.map((link, idx) => (
              <div key={idx} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-xs">תווית</Label>
                  <Input
                    value={link.label}
                    onChange={(e) => updateLinksArray('supportLinks', idx, 'label', e.target.value)}
                    placeholder="תווית"
                    size="sm"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">כתובת</Label>
                  <Input
                    value={link.url}
                    onChange={(e) => updateLinksArray('supportLinks', idx, 'url', e.target.value)}
                    placeholder="https://... או mailto:..."
                    size="sm"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLink('supportLinks', idx)}
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addLink('supportLinks')}
              className="w-full"
            >
              <Plus className="w-4 h-4 ml-2" />
              הוסף קישור
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Social Section */}
      <Card>
        <CardHeader>
          <CardTitle>סעיף מדיה חברתית</CardTitle>
          <CardDescription>ערוך את קישורי המדיה החברתית</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>כותרת סעיף</Label>
            <Input
              value={formData.socialTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, socialTitle: e.target.value }))}
              placeholder="עקוב אחרינו"
            />
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">קישורים חברתיים:</h4>
            {formData.socialLinks.map((link, idx) => (
              <div key={idx} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-xs">תווית</Label>
                  <Input
                    value={link.label}
                    onChange={(e) => updateLinksArray('socialLinks', idx, 'label', e.target.value)}
                    placeholder="Facebook, Twitter וכו'"
                    size="sm"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">כתובת URL</Label>
                  <Input
                    value={link.url}
                    onChange={(e) => updateLinksArray('socialLinks', idx, 'url', e.target.value)}
                    placeholder="https://..."
                    size="sm"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLink('socialLinks', idx)}
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addLink('socialLinks')}
              className="w-full"
            >
              <Plus className="w-4 h-4 ml-2" />
              הוסף קישור
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Copyright Section */}
      <Card>
        <CardHeader>
          <CardTitle>טקסט זכויות יוצרים</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={formData.copyrightText}
            onChange={(e) => setFormData(prev => ({ ...prev, copyrightText: e.target.value }))}
            placeholder="כל הזכויות שמורות ©"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-gradient-to-r from-indigo-500 to-purple-600"
          size="lg"
        >
          <Save className="w-5 h-5 ml-2" />
          שמור הגדרות
        </Button>
      </div>
    </div>
  );
}