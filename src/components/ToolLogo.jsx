import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function ToolLogo({ tool, size = 'md' }) {
  const [imgError, setImgError] = useState(false);
  
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };
  
  // נסה לשאוב לוגו מכמה מקורות
  const getLogoUrl = () => {
    if (tool.logo && !imgError) return tool.logo;
    
    // אם יש URL, נסה clearbit או google favicon
    if (tool.url) {
      try {
        const domain = new URL(tool.url).hostname;
        // Clearbit Logo API (בחינם)
        return `https://logo.clearbit.com/${domain}`;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const logoUrl = getLogoUrl();

  // אם יש URL תמונה, נסה להציג
  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl}
        alt={tool.name}
        className={`${sizes[size]} rounded-lg object-cover bg-white`}
        onError={() => setImgError(true)}
      />
    );
  }

  // אחרת - הצג את האות הראשונה
  return (
    <div className={`${sizes[size]} rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg`}>
      {tool.name?.charAt(0) || '?'}
    </div>
  );
}