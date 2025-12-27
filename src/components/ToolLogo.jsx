import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function ToolLogo({ tool, size = 'md' }) {
  const [imgError, setImgError] = useState(false);
  
  const sizes = {
    sm: 'w-10 h-10 text-base',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl',
  };
  
  // נסה לשאוב לוגו מכמה מקורות
  const getLogoUrl = () => {
    if (tool.logo && !imgError) return tool.logo;
    
    // אם יש URL, נסה clearbit
    if (tool.url) {
      try {
        const domain = new URL(tool.url).hostname.replace('www.', '');
        return `https://logo.clearbit.com/${domain}`;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const logoUrl = getLogoUrl();

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
  ];
  const colorClass = colorClasses[initial.charCodeAt(0) % colorClasses.length];

  // אם יש URL תמונה, נסה להציג
  if (logoUrl && !imgError) {
    return (
      <div className={`${sizes[size]} rounded-xl overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-800`}>
        <img
          src={logoUrl}
          alt={tool.name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
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