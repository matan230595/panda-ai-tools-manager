import React from 'react';
import { ShieldCheck, KeyRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

/**
 * סעיף "יש לי מנוי פעיל" + פרטי גישה מאובטחים לכלי.
 */
export default function CredentialsSection({ hasSubscription, credentials, onToggleSubscription, onCredentialChange }) {
  const cred = credentials || {};

  return (
    <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <div>
            <Label htmlFor="hasSubscription" className="text-sm font-semibold cursor-pointer">יש לי מנוי פעיל</Label>
            <p className="text-xs text-gray-500 dark:text-gray-400">שמור פרטי חשבון שאינם סודיים</p>
          </div>
        </div>
        <Switch
          id="hasSubscription"
          checked={!!hasSubscription}
          onCheckedChange={onToggleSubscription}
        />
      </div>

      {hasSubscription && (
        <div className="space-y-4 pt-2 border-t border-indigo-200/60 dark:border-indigo-900/60">
          <div className="flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300">
            <KeyRound className="w-3.5 h-3.5" />
            <span>מטעמי אבטחה, אין לשמור כאן סיסמאות או מפתחות API</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cred-email">אימייל לכלי</Label>
              <Input
                id="cred-email"
                type="email"
                value={cred.email || ''}
                onChange={(e) => onCredentialChange('email', e.target.value)}
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cred-username">שם משתמש</Label>
              <Input
                id="cred-username"
                value={cred.username || ''}
                onChange={(e) => onCredentialChange('username', e.target.value)}
                placeholder="שם המשתמש שלך"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cred-phone">מספר טלפון</Label>
              <Input
                id="cred-phone"
                type="tel"
                value={cred.phoneNumber || ''}
                onChange={(e) => onCredentialChange('phoneNumber', e.target.value)}
                placeholder="050-0000000"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="cred-google" className="text-sm cursor-pointer">חשבון Google מחובר</Label>
            <Switch
              id="cred-google"
              checked={!!cred.googleConnected}
              onCheckedChange={(val) => onCredentialChange('googleConnected', val)}
            />
          </div>
        </div>
      )}
    </div>
  );
}