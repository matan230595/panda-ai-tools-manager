import React from 'react';
import { Sparkles, MessageSquare, Settings, BarChart3 } from 'lucide-react';

export default function TabNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'tools', label: 'כלי AI שלי', icon: Sparkles, gradient: 'from-indigo-500 to-purple-500' },
    { id: 'assistant', label: 'עוזר AI', icon: MessageSquare, gradient: 'from-pink-500 to-rose-500' },
    { id: 'stats', label: 'סטטיסטיקות', icon: BarChart3, gradient: 'from-green-500 to-emerald-500' },
    { id: 'settings', label: 'הגדרות', icon: Settings, gradient: 'from-orange-500 to-amber-500' },
  ];

  return (
    <>
      {/* Desktop & Tablet - Top Navigation */}
      <div className="hidden md:block sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">AI Tools Manager</h1>
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
                    <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'animate-pulse' : ''}`} />
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
                  <Icon className={`w-6 h-6 relative z-10 ${isActive ? `bg-gradient-to-br ${tab.gradient} bg-clip-text text-transparent` : 'text-gray-600 dark:text-gray-400'}`} />
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold gradient-text">AI Tools Manager</h1>
          </div>
        </div>
      </div>
    </>
  );
}