import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Sparkles, MessageSquare, Settings, BarChart3, TrendingUp, DollarSign } from 'lucide-react';

export default function TabNavigation({ activeTab, onTabChange }) {
  const [userLogo, setUserLogo] = useState('');
  const [appName, setAppName] = useState('AI Tools Manager');

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      try {
        const user = await getCurrentUser();
        const list = await base44.entities.Settings.filter({ created_by: user.email });
        return list[0] || null;
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
    { id: 'assistant', label: 'עוזר', icon: MessageSquare, gradient: 'from-fuchsia-500 to-purple-500' },
    { id: 'dashboard', label: 'דשבורד', icon: BarChart3, gradient: 'from-blue-500 to-cyan-500' },
    { id: 'subscriptions-mgmt', label: 'מנויים', icon: DollarSign, gradient: 'from-green-500 to-emerald-500' },
    { id: 'budget', label: 'תקציב', icon: '💰', gradient: 'from-green-500 to-emerald-500' },
    { id: 'reminders', label: 'תזכורות', icon: '⏰', gradient: 'from-orange-500 to-red-500' },
    { id: 'templates', label: 'תבניות', icon: '📦', gradient: 'from-purple-500 to-pink-500' },
    { id: 'insights', label: 'תובנות', icon: '🧠', gradient: 'from-cyan-500 to-blue-500' },
    { id: 'integrations', label: 'אינטגרציות', icon: '🔗', gradient: 'from-teal-500 to-green-500' },
    { id: 'collaboration', label: 'צוות', icon: TrendingUp, gradient: 'from-teal-500 to-cyan-500' },
    { id: 'settings', label: 'הגדרות', icon: Settings, gradient: 'from-gray-500 to-slate-500' },
  ];

  return (
    <>
      {/* Desktop & Tablet - Top Navigation */}
      <div className="hidden md:block sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between py-3 gap-4 h-auto">
            {/* Logo & App Name - Right Side */}
            <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
                {userLogo ? (
                  <img src={userLogo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                )}
              </div>
              <div className="min-w-0 text-right hidden sm:block">
                <h1 className="text-base font-bold gradient-text truncate">{appName}</h1>
              </div>
            </div>

            {/* Tabs - Center */}
            <nav className="flex gap-1 flex-1 justify-start overflow-x-auto scrollbar-hide px-1" role="tablist">
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
                      relative flex items-center gap-1.5 px-3 lg:px-4 py-2.5 rounded-lg font-medium text-sm
                      transition-all duration-300 ease-out whitespace-nowrap
                      ${isActive 
                        ? 'text-white shadow-md' 
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
                     <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-lg opacity-100`} />
                    )}
                    {typeof tab.icon === 'string' ? (
                     <span className="text-base relative z-10">{tab.icon}</span>
                    ) : (
                     <Icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 relative z-10 ${isActive ? 'animate-pulse' : ''}`} />
                    )}
                    <span className="relative z-10 hidden lg:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Empty spacer */}
            <div className="w-10 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Mobile - Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 safe-area-bottom" dir="rtl">
        <nav className="flex items-center h-16 px-1 overflow-x-auto scrollbar-hide" role="tablist">
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
                className="min-w-[72px] flex flex-col items-center justify-center gap-0.5 py-1 relative touch-target"
              >
                <div className={`
                  relative flex items-center justify-center w-10 h-10 rounded-2xl
                  transition-all duration-300
                  ${isActive ? 'scale-110' : 'scale-90 opacity-60'}
                `}>
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${tab.gradient} rounded-2xl opacity-20 animate-pulse`} />
                  )}
                  {typeof tab.icon === 'string' ? (
                    <span className="text-xl relative z-10">{tab.icon}</span>
                  ) : (
                    <Icon className={`w-5 h-5 relative z-10 ${isActive ? `bg-gradient-to-br ${tab.gradient} bg-clip-text text-transparent` : 'text-gray-600 dark:text-gray-400'}`} />
                  )}
                </div>
                <span className={`text-xs font-medium transition-all duration-300 line-clamp-1 ${isActive ? `bg-gradient-to-br ${tab.gradient} bg-clip-text text-transparent` : 'text-gray-600 dark:text-gray-400'}`}>
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
      <div className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-2.5" dir="rtl">
        <div className="flex items-center gap-2 sm:gap-3 justify-between">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
            {userLogo ? (
              <img src={userLogo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Sparkles className="w-5 sm:w-6 h-5 sm:h-6 text-indigo-500" />
            )}
          </div>
          <div className="flex-1 min-w-0 text-right">
            <h1 className="text-base sm:text-lg font-bold gradient-text truncate">{appName}</h1>
          </div>
        </div>
      </div>
    </>
  );
}