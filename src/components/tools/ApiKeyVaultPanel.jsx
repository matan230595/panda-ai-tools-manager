import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function ApiKeyVaultPanel() {
  return (
    <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-right" dir="rtl">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
        <div>
          <h3 className="font-semibold text-amber-200">אחסון מפתחות API הושבת זמנית</h3>
          <p className="mt-1 text-sm text-amber-100/80">
            מפתחות סודיים אינם נשמרים עוד ברשומות שנגישות לדפדפן. יש לנהל אותם דרך Secrets מאובטחים בצד השרת.
          </p>
        </div>
      </div>
    </div>
  );
}
