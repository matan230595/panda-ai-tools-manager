import React, { useState } from 'react';

export default function ToolLogo({ tool, size = 'md' }) {
  const [currentSource, setCurrentSource] = useState(0);
  const [error, setError] = useState(false);
  
  const sizes = {
    sm: 'w-10 h-10 text-base',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl',
  };
  
  // מקורות לוגו מרובים - fallback cascade
  const logoSources = React.useMemo(() => {
    const sources = [];
    
    // נסה קודם את ה-logo שהוגדר
    if (tool.logo) sources.push(tool.logo);
    
    // אם יש URL, נסה מספר מקורות
    if (tool.url) {
      try {
        const urlObj = new URL(tool.url);
        const domain = urlObj.hostname.replace('www.', '');
        
        // Google Favicon API - הכי אמין
        sources.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
        
        // Favicon ישיר מהאתר
        sources.push(`${urlObj.protocol}//${urlObj.hostname}/favicon.ico`);
        
        // Apple Touch Icon
        sources.push(`${urlObj.protocol}//${urlObj.hostname}/apple-touch-icon.png`);
        
        // Clearbit
        sources.push(`https://logo.clearbit.com/${domain}`);
      } catch (e) {
        // אם ה-URL לא תקין, התעלם
      }
    }
    
    return sources;
  }, [tool.logo, tool.url]);

  const logoUrl = logoSources[currentSource];

  // צבעי fallback מגוונים
  const initial = tool.name?.charAt(0)?.toUpperCase() || '?';
  const colorClasses = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
    'from-green-500 to-green-600',
    'from-yellow-500 to-yellow-600',
    'from-red-500 to-red-600',
    'from-indigo-500 to-indigo-600',
    'from-teal-500 to-teal-600',
    'from-orange-500 to-orange-600',
    'from-cyan-500 to-cyan-600',
  ];
  const colorClass = colorClasses[initial.charCodeAt(0) % colorClasses.length];

  // אם יש URL תמונה ועדיין לא הייתה שגיאה סופית
  if (logoUrl && !error) {
    return (
      <div className={`${sizes[size]} rounded-xl overflow-hidden flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700`}>
        <img
          src={logoUrl}
          alt={tool.name}
          className="w-full h-full object-contain p-1"
          onError={() => {
            // נסה את המקור הבא
            if (currentSource < logoSources.length - 1) {
              setCurrentSource(currentSource + 1);
            } else {
              // אין עוד מקורות, עבור ל-fallback
              setError(true);
            }
          }}
        />
      </div>
    );
  }

  // Fallback - אייקון צבעוני עם התו הראשון
  return (
    <div className={`${sizes[size]} bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white dark:ring-gray-800`}>
      <span className="drop-shadow-md">{initial}</span>
    </div>
  );
}