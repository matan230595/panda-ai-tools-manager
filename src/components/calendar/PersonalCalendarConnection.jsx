import React, { useEffect, useState } from 'react';
import { CalendarCheck, Link2, Loader2, Unplug } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

const CONNECTOR_ID = '6a8e697708e1076300e61a70';

export default function PersonalCalendarConnection({ onConnectionChange }) {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  const checkConnection = async () => {
    setLoading(true);
    try {
      await Promise.race([
        base44.functions.invoke('syncGoogleCalendar', { action: 'status' }),
        new Promise((_, reject) => window.setTimeout(() => reject(new Error('Connection check timed out')), 4000)),
      ]);
      setConnected(true);
      onConnectionChange?.(true);
    } catch {
      setConnected(false);
      onConnectionChange?.(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    base44.auth.isAuthenticated().then((authenticated) => {
      if (authenticated) checkConnection();
      else setLoading(false);
    });
  }, []);

  const connect = async () => {
    const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
    const popup = window.open(url, '_blank');
    const timer = window.setInterval(() => {
      if (!popup || popup.closed) {
        window.clearInterval(timer);
        checkConnection();
      }
    }, 500);
  };

  const disconnect = async () => {
    await base44.connectors.disconnectAppUser(CONNECTOR_ID);
    setConnected(false);
    onConnectionChange?.(false);
  };

  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4" dir="rtl">
      <div className="flex items-start gap-3">
        <CalendarCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-slate-900 dark:text-white">Google Calendar אישי</h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">זמני התרגול והמשימות שלך יסונכרנו ליומן הפרטי שלך בלבד.</p>
        </div>
      </div>
      <div className="mt-3">
        {loading ? <Loader2 className="h-4 w-4 animate-spin text-cyan-300" aria-label="בודק חיבור ליומן" /> : connected ? (
          <Button variant="outline" size="sm" onClick={disconnect} aria-label="ניתוק היומן האישי">
            <Unplug className="ms-1 h-4 w-4" /> היומן מחובר
          </Button>
        ) : (
          <Button size="sm" onClick={connect} aria-label="חיבור היומן האישי ל-Google Calendar">
            <Link2 className="ms-1 h-4 w-4" /> חבר יומן אישי
          </Button>
        )}
      </div>
    </div>
  );
}