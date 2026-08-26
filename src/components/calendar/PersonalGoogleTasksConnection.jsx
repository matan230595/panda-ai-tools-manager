import React, { useEffect, useState } from 'react';
import { CheckSquare, Link2, Loader2, Unplug } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

const CONNECTOR_ID = '6a8ea70f39dbfd8eb27f4dbc';

export default function PersonalGoogleTasksConnection() {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  const checkConnection = async () => {
    setLoading(true);
    try {
      await base44.functions.invoke('syncGoogleTasks', { action: 'status' });
      setConnected(true);
    } catch {
      setConnected(false);
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
  };

  return <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4" dir="rtl">
    <div className="flex items-start gap-3">
      <CheckSquare className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold text-slate-900 dark:text-white">Google Tasks אישי</h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">כל משימה חדשה או מעודכנת תסתנכרן לרשימת המשימות האישית שלך.</p>
      </div>
    </div>
    <div className="mt-3">
      {loading ? <Loader2 className="h-4 w-4 animate-spin text-cyan-300" aria-label="בודק חיבור ל-Google Tasks" /> : connected ? <Button variant="outline" size="sm" onClick={disconnect}><Unplug className="ms-1 h-4 w-4" /> Google Tasks מחובר</Button> : <Button size="sm" onClick={connect}><Link2 className="ms-1 h-4 w-4" /> חבר Google Tasks</Button>}
    </div>
  </div>;
}