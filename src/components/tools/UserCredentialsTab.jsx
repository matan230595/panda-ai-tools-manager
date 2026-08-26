import React, { useState } from 'react';
import { Lock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function UserCredentialsTab({ tool, onSave }) {
  const [credentials, setCredentials] = useState(tool?.userCredentials || {
    email: '',
    username: '',
    phoneNumber: '',
    googleConnected: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const safeCredentials = {
        email: credentials.email || '',
        username: credentials.username || '',
        phoneNumber: credentials.phoneNumber || '',
        googleConnected: !!credentials.googleConnected,
      };
      await onSave({ userCredentials: safeCredentials });
      toast.success('פרטי הגישה נשמרו בהצלחה 🔒');
    } catch (error) {
      toast.error('שגיאה בשמירת פרטי הגישה');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectGoogle = () => {
    toast.info('התחברות ל-Google - דורש ממשק OAuth (בקרוב)');
    setCredentials(prev => ({ ...prev, googleConnected: true }));
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* כותרת */}
      <div className="text-right">
        <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-600" />
          פרטי גישה
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          שמור את פרטי הזיהוי הלא־סודיים שלך לגישה מהירה
        </p>
      </div>

      {/* שדה אימייל */}
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          📧 אימייל
        </Label>
        <Input
          id="email"
          type="email"
          value={credentials.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="your@email.com"
          className="text-right"
        />
      </div>

      {/* שדה שם משתמש */}
      <div className="space-y-2">
        <Label htmlFor="username">👤 שם משתמש</Label>
        <Input
          id="username"
          type="text"
          value={credentials.username}
          onChange={(e) => handleChange('username', e.target.value)}
          placeholder="שם משתמש..."
          className="text-right"
        />
      </div>

      {/* שדה מספר טלפון */}
      <div className="space-y-2">
        <Label htmlFor="phone">📱 מספר טלפון</Label>
        <Input
          id="phone"
          type="tel"
          value={credentials.phoneNumber}
          onChange={(e) => handleChange('phoneNumber', e.target.value)}
          placeholder="+972-50-0000000"
          className="text-right"
        />
      </div>

      {/* חיבור Google */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-sm mb-1">🔗 חיבור Google</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              התחבר עם חשבון Google שלך להתחברות מיידית
            </p>
          </div>
          {credentials.googleConnected ? (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <span className="text-xs font-semibold">מחובר</span>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={handleConnectGoogle}
              className="bg-blue-500 hover:bg-blue-600"
            >
              התחבר
            </Button>
          )}
        </div>
      </div>

      {/* כפתורי פעולה */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600"
        >
          {isSaving ? 'שומר...' : '💾 שמור פרטים'}
        </Button>
      </div>

      {/* הערה אבטחה */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800 text-right">
        <p className="text-xs text-yellow-800 dark:text-yellow-200">
          <span className="font-semibold">🛡️ הערת אבטחה:</span> שמור כאן רק אימייל, שם משתמש וטלפון. סיסמאות ומפתחות API אינם נשמרים במסך זה.
        </p>
      </div>
    </div>
  );
}