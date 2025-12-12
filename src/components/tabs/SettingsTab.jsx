import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Key, Palette, Download, Trash2, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
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

export default function SettingsTab({ settings }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    geminiApiKey: settings?.geminiApiKey || '',
    theme: settings?.theme || 'light',
    language: settings?.language || 'he',
    viewMode: settings?.viewMode || 'grid',
    sortBy: settings?.sortBy || 'updated',
    enableNotifications: settings?.enableNotifications ?? true,
    enableKeyboardShortcuts: settings?.enableKeyboardShortcuts ?? true,
  });
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const updateSettings = useMutation({
    mutationFn: (data) => base44.entities.Settings.update(settings.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['settings']);
      toast.success('ההגדרות נשמרו בהצלחה! ✅');
    },
    onError: () => toast.error('שגיאה בשמירת ההגדרות'),
  });

  const handleSave = () => {
    updateSettings.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExportAll = async () => {
    try {
      const tools = await base44.entities.AiTool.list();
      const conversations = await base44.entities.Conversation.list();
      
      const exportData = {
        tools,
        conversations,
        settings: formData,
        exportDate: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-tools-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      toast.success('גיבוי מלא יוצא בהצלחה! 💾');
    } catch (error) {
      toast.error('שגיאה בייצוא הנתונים');
    }
  };

  const handleResetAll = async () => {
    try {
      const tools = await base44.entities.AiTool.list();
      for (const tool of tools) {
        await base44.entities.AiTool.delete(tool.id);
      }

      const conversations = await base44.entities.Conversation.list();
      for (const conv of conversations) {
        await base44.entities.Conversation.delete(conv.id);
      }

      queryClient.invalidateQueries();
      toast.success('כל הנתונים נמחקו בהצלחה');
      setShowResetDialog(false);
    } catch (error) {
      toast.error('שגיאה באיפוס הנתונים');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
          הגדרות
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          התאם את המערכת לצרכים שלך
        </p>
      </div>

      <div className="glass-effect rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Key className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">מפתחות API</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">הגדר מפתחות לשירותי AI</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="geminiApiKey">מפתח Gemini API</Label>
            <div className="flex gap-2">
              <Input
                id="geminiApiKey"
                type={showApiKey ? 'text' : 'password'}
                value={formData.geminiApiKey}
                onChange={(e) => handleChange('geminiApiKey', e.target.value)}
                placeholder="הזן את מפתח ה-API שלך..."
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? '🙈' : '👁️'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              נדרש לתכונת מילוי אוטומטי ועוזר AI. קבל מפתח ב-
              <a 
                href="https://makersuite.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="glass-effect rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">העדפות ממשק</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">התאם את חווית המשתמש</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="theme">ערכת נושא</Label>
            <Select value={formData.theme} onValueChange={(val) => handleChange('theme', val)}>
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">בהיר</SelectItem>
                <SelectItem value="dark">כהה</SelectItem>
                <SelectItem value="auto">אוטומטי</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="viewMode">תצוגת כלים</Label>
            <Select value={formData.viewMode} onValueChange={(val) => handleChange('viewMode', val)}>
              <SelectTrigger id="viewMode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">רשת</SelectItem>
                <SelectItem value="list">רשימה</SelectItem>
                <SelectItem value="compact">צפוף</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortBy">מיון ברירת מחדל</Label>
            <Select value={formData.sortBy} onValueChange={(val) => handleChange('sortBy', val)}>
              <SelectTrigger id="sortBy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">עדכון אחרון</SelectItem>
                <SelectItem value="created">תאריך יצירה</SelectItem>
                <SelectItem value="name">שם (א-ת)</SelectItem>
                <SelectItem value="rating">דירוג גבוה</SelectItem>
                <SelectItem value="popularity">פופולריות</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">התראות</Label>
              <Switch
                id="notifications"
                checked={formData.enableNotifications}
                onCheckedChange={(val) => handleChange('enableNotifications', val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="keyboard">קיצורי מקלדת</Label>
              <Switch
                id="keyboard"
                checked={formData.enableKeyboardShortcuts}
                onCheckedChange={(val) => handleChange('enableKeyboardShortcuts', val)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-effect rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">ניהול נתונים</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">גיבוי ושחזור מידע</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={handleExportAll}
            className="h-auto py-4 flex-col gap-2"
          >
            <Download className="w-5 h-5" />
            <div>
              <div className="font-medium">ייצא גיבוי מלא</div>
              <div className="text-xs text-gray-500">כולל כלים, שיחות והגדרות</div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowResetDialog(true)}
            className="h-auto py-4 flex-col gap-2 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            <Trash2 className="w-5 h-5" />
            <div>
              <div className="font-medium">איפוס מלא</div>
              <div className="text-xs">מחיקת כל הנתונים</div>
            </div>
          </Button>
        </div>
      </div>

      {formData.enableKeyboardShortcuts && (
        <div className="glass-effect rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
            קיצורי מקלדת זמינים
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm">כלי AI</span>
              <kbd className="px-3 py-1 bg-white dark:bg-gray-700 rounded border text-xs">Alt + 1</kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm">עוזר AI</span>
              <kbd className="px-3 py-1 bg-white dark:bg-gray-700 rounded border text-xs">Alt + 2</kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm">סטטיסטיקות</span>
              <kbd className="px-3 py-1 bg-white dark:bg-gray-700 rounded border text-xs">Alt + 3</kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm">הגדרות</span>
              <kbd className="px-3 py-1 bg-white dark:bg-gray-700 rounded border text-xs">Alt + 4</kbd>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-8"
        >
          <Save className="w-5 h-5 ml-2" />
          שמור הגדרות
        </Button>
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ אזהרה: איפוס מלא</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>פעולה זו תמחק לצמיתות את כל הנתונים במערכת.</p>
              <p className="font-bold text-red-600 dark:text-red-400">
                לא ניתן לבטל פעולה זו!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetAll}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              כן, אפס הכל
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}