import React from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-indigo-600 hover:text-indigo-700">
          <ArrowRight className="w-4 h-4 rotate-180" />
          חזרה לעמוד הבית
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 space-y-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">הצהרת פרטיות</h1>
            <p className="text-gray-600 dark:text-gray-400">עדכון אחרון: {new Date().toLocaleDateString('he-IL')}</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">1. המידע שאנחנו אוספים</h2>
            <p className="text-gray-700 dark:text-gray-300">
              אנחנו אוספים מידע שאתה מספק לנו ישירות, כולל:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mr-4">
              <li>שם המשתמש ואימייל</li>
              <li>הגדרות ועדפות המערכת</li>
              <li>הכלים ש-AI שהנך משתמש בהם</li>
              <li>מנויים וקנייות</li>
              <li>תיעוד שיחות ועוד</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">2. כיצד אנו משתמשים במידע שלך</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mr-4">
              <li>לספק ולשפר את השירות שלנו</li>
              <li>לתמוך בך ולהשיב לשאלות</li>
              <li>לשלוח עדכונים וחדשות (רק אם הסכמת)</li>
              <li>לאנליזה ולשיפור חווית המשתמש</li>
              <li>להתאם לחוקים ולוויסות</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">3. אבטחת המידע</h2>
            <p className="text-gray-700 dark:text-gray-300">
              אנחנו משתמשים בתקנות אבטחה מתקדמות כדי להגן על המידע שלך, כולל הצפנה, firewall, וגישה מוגבלת.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">4. קובצי Cookie</h2>
            <p className="text-gray-700 dark:text-gray-300">
              אנחנו משתמשים בקובצי cookie כדי לשפר את חווית השימוש שלך, לזכור העדפות, ולנתח שימוש.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">5. שיתוף מידע עם צדדים שלישיים</h2>
            <p className="text-gray-700 dark:text-gray-300">
              אנחנו לא משתפים את המידע שלך עם צדדים שלישיים למטרות שיווקיות, אלא רק כאשר נדרש בחוק.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">6. זכויותיך</h2>
            <p className="text-gray-700 dark:text-gray-300">
              יש לך את הזכות לגשת, לערוך, ולמחוק את המידע האישי שלך בכל עת. צור קשר אתנו לביצוע בקשות אלה.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">7. צור קשר</h2>
            <p className="text-gray-700 dark:text-gray-300">
              אם יש לך שאלות או חששות בנוגע להצהרת הפרטיות הזו, אתה מוזמן ליצור איתנו קשר:
            </p>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                <a href="mailto:privacy@pandavoice.com" className="text-indigo-600 hover:underline">
                  privacy@pandavoice.com
                </a>
              </div>
            </div>
          </section>

          <div className="border-t pt-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              כל הזכויות שמורות ל<span className="text-xl">🐼</span> פנדה סוכנות דיגיטל
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}