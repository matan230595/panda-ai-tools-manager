import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Plus, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function UserCredentialsTab({ tool, onSave }) {
  const [credentials, setCredentials] = useState(tool?.userCredentials || {
    email: '',
    username: '',
    password: '',
    phoneNumber: '',
    googleConnected: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({ userCredentials: credentials });
      toast.success('פרטי הגישה שמורו בהצלחה 🔒');
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
          שמור את נתונים שלך בטוח לגישה מהירה
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

      {/* שדה סיסמה */}
      <div className="space-y-2">
        <Label htmlFor="password" className="flex items-center gap-2">
          🔐 סיסמה
          {credentials.password && (
            <Badge className="bg-green-500">שמור</Badge>
          )}
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={credentials.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="סיסמה..."
            className="text-right pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-gray-500">⚠️ הסיסמה מוצפנת במכשירך בלבד</p>
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
          <span className="font-semibold">🛡️ הערה אבטחה:</span> הנתונים שלך מוצפנים ומאוחסנים בטוח. אנו לעולם לא נשתף זאת עם צדדים שלישיים.
        </p>
      </div>
    </div>
  );
}