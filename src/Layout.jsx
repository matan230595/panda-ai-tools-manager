import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function Layout({ currentPageName, children }) {
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
      // עדכן favicon
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

  return (
    <div className="flex flex-col min-h-screen" dir="rtl">
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div>
              <h3 className="font-bold mb-4">אודותינו</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI Tools Manager - פתרון מתקדם לניהול כלי AI שלך.
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-bold mb-4">קישורים</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="text-indigo-600 hover:underline">
                    עמוד הבית
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-indigo-600 hover:underline">
                    הצהרת פרטיות
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-indigo-600 hover:underline">
                    תנאי שימוש
                  </Link>
                </li>
                <li>
                  <Link to="/accessibility" className="text-indigo-600 hover:underline">
                    נגישות
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold mb-4">תמיכה</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/contact" className="text-indigo-600 hover:underline">
                    צור קשר
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@pandavoice.com" className="text-indigo-600 hover:underline">
                    תמיכה טכנית
                  </a>
                </li>
                <li>
                  <a href="tel:+972503000000" className="text-indigo-600 hover:underline">
                    קול קטגוריה
                  </a>
                </li>
              </ul>
            </div>

            {/* Follow Us */}
            <div>
              <h3 className="font-bold mb-4">עקוב אחרינו</h3>
              <div className="flex gap-4 text-sm">
                <a href="#" className="text-indigo-600 hover:underline">Twitter</a>
                <a href="#" className="text-indigo-600 hover:underline">LinkedIn</a>
                <a href="#" className="text-indigo-600 hover:underline">Facebook</a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-center gap-2 mb-3">
              {userLogo && (
                <img src={userLogo} alt="Logo" className="h-6 w-6 object-contain" />
              )}
              <span className="font-semibold">{appName}</span>
            </div>
            <p>
              כל הזכויות שמורות © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}