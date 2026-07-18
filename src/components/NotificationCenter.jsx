import React, { useState } from 'react';
import { Bell, Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function NotificationCenter({ notifications = [], onMarkAsRead, onClearAll, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((item) => !item.read).length;

  const typeIcons = {
    info: { icon: Info, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
    success: { icon: CheckCircle, color: 'text-green-600 bg-green-50 dark:bg-green-950/40' },
    warning: { icon: AlertTriangle, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40' },
    error: { icon: AlertCircle, color: 'text-red-600 bg-red-50 dark:bg-red-950/40' },
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={`relative rounded-2xl min-h-[48px] px-4 ${className}`}>
          <Bell className="w-5 h-5 ml-2" />
          התראות
          {unreadCount > 0 && <Badge className="absolute -top-2 -right-2 h-6 min-w-6 rounded-full px-1 bg-red-500 text-white">{unreadCount > 9 ? '9+' : unreadCount}</Badge>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(94vw,28rem)] p-0 rounded-3xl" align="end">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3">
          <h3 className="font-bold text-lg">התראות מערכת</h3>
          {notifications.length > 0 && <Button variant="ghost" size="sm" onClick={onClearAll}>נקה הכל</Button>}
        </div>
        <ScrollArea className="h-[26rem]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-gray-500">
              <Bell className="w-12 h-12 mb-3 opacity-50" />
              <p>אין התראות חדשות כרגע</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {notifications.map((notification) => {
                const typeConfig = typeIcons[notification.type] || typeIcons.info;
                const Icon = typeConfig.icon;
                return (
                  <button
                    key={notification.id}
                    onClick={() => !notification.read && onMarkAsRead(notification.id)}
                    className={`w-full text-right rounded-2xl border p-3 transition-all ${notification.read ? 'bg-gray-50 dark:bg-gray-900/70 opacity-70 border-gray-200 dark:border-gray-800' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-indigo-200 hover:shadow-sm'}`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${typeConfig.color}`}><Icon className="w-5 h-5" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm">{notification.title}</h4>
                          {!notification.read && <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />}
                        </div>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 leading-6">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{new Date(notification.timestamp).toLocaleDateString('he-IL', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}