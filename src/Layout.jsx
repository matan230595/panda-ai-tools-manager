import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';

export default function Layout({ currentPageName, children }) {
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
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.userLogo;
    }
    if (settings?.appName) {
      setAppName(settings.appName);
      document.title = settings.appName;
    }
  }, [settings]);

  const footer = settings?.footerContent;

  const renderLink = (link) => {
    if (link.url.startsWith('/')) {
      return (
        <Link to={link.url} className="text-indigo-600 hover:underline">
          {link.label}
        </Link>
      );
    }
    return (
      <a href={link.url} className="text-indigo-600 hover:underline">
        {link.label}
      </a>
    );
  };

  return (
    <div className="flex flex-col min-h-screen" dir="rtl">
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
            {/* About */}
            <div>
              <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">{footer?.aboutTitle || 'אודותינו'}</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {footer?.aboutText || 'AI Tools Manager - פתרון מתקדם לניהול כלי AI שלך.'}
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">{footer?.linksTitle || 'קישורים'}</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                {(footer?.links || [
                  { label: 'עמוד הבית', url: '/' },
                  { label: 'הצהרת פרטיות', url: '/privacy' },
                  { label: 'תנאי שימוש', url: '/terms' },
                  { label: 'נגישות', url: '/accessibility' }
                ]).map((link, idx) => (
                  <li key={idx}>
                    {renderLink(link)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">{footer?.supportTitle || 'תמיכה'}</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                {(footer?.supportLinks || [
                  { label: 'צור קשר', url: '/contact' },
                  { label: 'תמיכה טכנית', url: 'mailto:support@pandavoice.com' },
                  { label: 'קול קטגוריה', url: 'tel:+972503000000' }
                ]).map((link, idx) => (
                  <li key={idx}>
                    {renderLink(link)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">{footer?.socialTitle || 'עקוב אחרינו'}</h3>
              <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm flex-wrap">
                {(footer?.socialLinks || [
                  { label: 'Twitter', url: '#' },
                  { label: 'LinkedIn', url: '#' },
                  { label: 'Facebook', url: '#' }
                ]).map((link, idx) => (
                  <div key={idx}>
                    {renderLink(link)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-4 sm:pt-6 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
              {userLogo && (
                <img src={userLogo} alt="Logo" className="h-5 sm:h-6 w-5 sm:w-6 object-contain" />
              )}
              <span className="font-semibold text-sm sm:text-base">{appName}</span>
            </div>
            <p>
              {footer?.copyrightText || 'כל הזכויות שמורות'} © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}