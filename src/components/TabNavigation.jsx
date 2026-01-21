import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, MessageSquare, Settings, BarChart3 } from 'lucide-react';

export default function TabNavigation({ activeTab, onTabChange }) {
  const [userLogo, setUserLogo] = useState('');
  const [appName, setAppName] = useState('AI Tools Manager');

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      try {
        const list = await base44.entities.Settings.list();
        return list[0];
      } catch {
        return null;
      }
    },
  });

  useEffect(() => {
    if (settings?.userLogo) {
      setUserLogo(settings.userLogo);
    }
    if (settings?.appName) {
      setAppName(settings.appName);
    }
  }, [settings]);
  const tabs = [
    { id: 'tools', label: 'כלים', icon: Sparkles, gradient: 'from-indigo-500 to-purple-500' },
    { id: 'budget', label: 'תקציב', icon: '💰', gradient: 'from-green-500 to-emerald-500' },
    { id: 'reminders', label: 'תזכורות', icon: '⏰', gradient: 'from-orange-500 to-red-500' },
    { id: 'templates', label: 'תבניות', icon: '📦', gradient: 'from-purple-500 to-pink-500' },
    { id: 'insights', label: 'תובנות', icon: '🧠', gradient: 'from-cyan-500 to-blue-500' },
    { id: 'integrations', label: 'אינטגרציות', icon: '🔗', gradient: 'from-teal-500 to-green-500' },
    { id: 'settings', label: 'הגדרות', icon: Settings, gradient: 'from-gray-500 to-slate-500' },
  ];

  return (
    <>
      {/* Desktop & Tablet - Top Navigation */}
      <div className="hidden md:block sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg overflow-hidden">
                {userLogo ? (
                  <img src={userLogo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Sparkles className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">{appName}</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">מערכת ניהול כלי AI מתקדמת</p>
              </div>
            </div>
            
            <nav className="flex gap-2" role="tablist">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    role="tab"
                    aria-selected={isActive}
                    aria-label={tab.label}
                    className={`
                      relative flex items-center gap-2 px-6 py-3 rounded-xl font-medium
                      transition-all duration-300 ease-out
                      ${isActive 
                        ? 'text-white shadow-lg scale-105' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                    style={isActive ? {
                      background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                      '--tw-gradient-from': `var(--${tab.gradient.split(' ')[0].replace('from-', '')})`,
                      '--tw-gradient-to': `var(--${tab.gradient.split(' ')[1].replace('to-', '')})`
                    } : {}}
                  >
                    {isActive && (
                     <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-xl opacity-100`} />
                    )}
                    {typeof tab.icon === 'string' ? (
                     <span className="text-xl relative z-10">{tab.icon}</span>
                    ) : (
                     <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'animate-pulse' : ''}`} />
                    )}
                    <span className="relative z-10 hidden lg:inline">{tab.label}</span>
                    
                    {isActive && (
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-transparent via-white to-transparent rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile - Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 safe-area-bottom">
        <nav className="flex justify-around items-center h-16 px-2" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                role="tab"
                aria-selected={isActive}
                aria-label={tab.label}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-2 relative"
              >
                <div className={`
                  relative flex items-center justify-center w-12 h-12 rounded-2xl
                  transition-all duration-300
                  ${isActive ? 'scale-110' : 'scale-90 opacity-60'}
                `}>
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${tab.gradient} rounded-2xl opacity-20 animate-pulse`} />
                  )}
                  {typeof tab.icon === 'string' ? (
                    <span className="text-2xl relative z-10">{tab.icon}</span>
                  ) : (
                    <Icon className={`w-6 h-6 relative z-10 ${isActive ? `bg-gradient-to-br ${tab.gradient} bg-clip-text text-transparent` : 'text-gray-600 dark:text-gray-400'}`} />
                  )}
                </div>
                <span className={`text-xs font-medium transition-all duration-300 ${isActive ? `bg-gradient-to-br ${tab.gradient} bg-clip-text text-transparent` : 'text-gray-600 dark:text-gray-400'}`}>
                  {tab.label}
                </span>
                
                {isActive && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile - Header */}
      <div className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
            {userLogo ? (
              <img src={userLogo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Sparkles className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold gradient-text">{appName}</h1>
          </div>
        </div>
      </div>
    </>
  );
}