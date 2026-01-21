import React, { useState, useEffect } from 'react';

export default function ToolLogo({ tool, size = 'md' }) {
  const [imgError, setImgError] = useState(true); // מתחיל עם fallback
  const [logoUrl, setLogoUrl] = useState(null);
  
  const sizes = {
    sm: 'w-10 h-10 text-base',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl',
  };
  
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

  useEffect(() => {
    // ניסיון לטעון לוגו
    const tryLoadLogo = async () => {
      // 1. נסה לוגו ישיר
      if (tool.logo) {
        const img = new Image();
        img.onload = () => {
          setLogoUrl(tool.logo);
          setImgError(false);
        };
        img.onerror = () => tryFaviconFallback();
        img.src = tool.logo;
      } else {
        tryFaviconFallback();
      }
    };

    const tryFaviconFallback = () => {
      if (tool.url) {
        try {
          const urlObj = new URL(tool.url);
          const domain = urlObj.hostname.replace('www.', '');
          const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
          
          const img = new Image();
          img.onload = () => {
            setLogoUrl(faviconUrl);
            setImgError(false);
          };
          img.onerror = () => {
            // שומר על fallback
            setImgError(true);
          };
          img.src = faviconUrl;
        } catch (e) {
          // שומר על fallback
          setImgError(true);
        }
      }
    };

    tryLoadLogo();
  }, [tool.logo, tool.url]);

  // תמיד מציג את ה-fallback אם אין לוגו תקין
  if (imgError || !logoUrl) {
    return (
      <div className={`${sizes[size]} bg-gradient-to-br ${colorClass} rounded-lg flex items-center justify-center text-white font-bold shadow-lg transition-all duration-200 hover:shadow-xl`}>
        <span className="drop-shadow-lg">{initial}</span>
      </div>
    );
  }

  // מציג תמונה רק אם נטענה בהצלחה
  return (
    <div className={`${sizes[size]} rounded-lg overflow-hidden flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md transition-shadow duration-200 hover:shadow-lg`}>
      <img
        src={logoUrl}
        alt={tool.name}
        className="w-full h-full object-contain p-1"
        onError={() => setImgError(true)}
      />
    </div>
  );
}