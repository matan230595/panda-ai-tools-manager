import React, { useState } from 'react';
import { Eye, EyeOff, Save, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function UserCredentialsTab({ tool, onUpdate }) {
  const [hasUser, setHasUser] = useState(tool.userCredentials?.hasUser ?? false);
  const [credentials, setCredentials] = useState(tool.userCredentials || {
    hasUser: false,
    email: '',
    username: '',
    password: '',
    phone: '',
    googleAccount: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      toast.success('הועתק ללוח');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('שגיאה בהעתקה');
    }
  };

  const handleSave = () => {
    onUpdate({ ...tool, userCredentials: credentials });
    setIsEditing(false);
    toast.success('פרטי הגישה נשמרו בהצלחה ✅');
  };

  const credentialFields = [
    { key: 'email', label: 'אימייל', type: 'email' },
    { key: 'username', label: 'שם משתמש', type: 'text' },
    { key: 'password', label: 'סיסמה', type: 'password' },
    { key: 'phone', label: 'מספר טלפון', type: 'tel' },
    { key: 'googleAccount', label: 'חשבון Google מקושר', type: 'email' }
  ];

  if (!hasUser && !isEditing) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="text-center space-y-3">
            <div className="text-4xl">👤</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {tool.userCredentials?.hasUser ? 'יש לך משתמש בכלי זה' : 'סמן כי יש לך משתמש בכלי זה'}
            </p>
            <Button onClick={() => {
              setHasUser(true);
              setIsEditing(true);
            }} size="sm" className="mt-2">
              + הוסף משתמש
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            👤 פרטי גישה
            {hasUser && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">פעיל</span>}
          </CardTitle>
          <CardDescription>
            {isEditing ? 'עדכן את פרטי הגישה שלך' : 'הצג/עדכן פרטי גישה'}
          </CardDescription>
        </div>
        {!isEditing && hasUser && (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            עריכה
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-3">
              {credentialFields.map(field => (
                <div key={field.key} className="space-y-1">
                  <Label htmlFor={field.key} className="text-xs">
                    {field.label}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id={field.key}
                      type={field.type === 'password' && !showPassword ? 'password' : 'text'}
                      value={credentials[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={`הזן ${field.label.toLowerCase()}`}
                      className="flex-1 text-sm h-8"
                    />
                    {field.key === 'password' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowPassword(!showPassword)}
                        className="px-2"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                ביטול
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
              >
                <Save className="w-4 h-4 ml-1" />
                שמור
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {credentialFields.map(field => {
              const value = credentials[field.key];
              if (!value) return null;
              
              return (
                <div key={field.key} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{field.label}</p>
                    <p className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate">
                      {field.key === 'password' ? '••••••••' : value}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(value, field.key)}
                    className="ml-2 flex-shrink-0"
                  >
                    {copied === field.key ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}