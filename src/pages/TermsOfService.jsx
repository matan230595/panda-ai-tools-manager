import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-indigo-600 hover:text-indigo-700">
          <ArrowRight className="w-4 h-4 rotate-180" />
          חזרה לעמוד הבית
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 space-y-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">תנאי שימוש</h1>
            <p className="text-gray-600 dark:text-gray-400">עדכון אחרון: {new Date().toLocaleDateString('he-IL')}</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">1. קבלת התנאים</h2>
            <p className="text-gray-700 dark:text-gray-300">
              בשימוש ב-AI Tools Manager, אתה מסכים לכל התנאים המפורטים כאן. אם אתה לא מסכים לתנאים אלה, אנא אל תשתמש בשירות.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">2. רישיון שימוש</h2>
            <p className="text-gray-700 dark:text-gray-300">
              אנחנו מעניקים לך רישיון מוגבל, לא בלעדי, לא להעברה לשימוש האישי או העסקי שלך בתנאי שאתה מקבל את התנאים הללו.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">3. אישור המשתמש</h2>
            <p className="text-gray-700 dark:text-gray-300">
              אתה אחראי על שמירת סודיות הסיסמה שלך וקבול כל הפעילויות שמתרחשות תחת החשבון שלך.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">4. השימוש התקבל</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              אתה מסכים שלא תשתמש בשירות:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mr-4">
              <li>לכל מטרה בלתי חוקית או אסורה</li>
              <li>כדי לפגוע בזכויות של אחרים</li>
              <li>כדי להפיץ פוגעני, שנוא, או תוכן מטריד</li>
              <li>כדי לנסות לחדור לשרתים שלנו</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">5. בעלות על תוכן</h2>
            <p className="text-gray-700 dark:text-gray-300">
              אתה שומר את בעלות המלאה על כל התוכן שאתה משדר. אנחנו לא אחראים לתוכן שאתה משדר.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">6. הגבלת אחריות</h2>
            <p className="text-gray-700 dark:text-gray-300">
              השירות ניתן "כמות שהוא". אנחנו לא מתחייבים לשום דבר, כולל דיוק, זמינות, או כושר שימוש למטרה מסוימת.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">7. הגבלת אחריות כלכלית</h2>
            <p className="text-gray-700 dark:text-gray-300">
              בשום אופן לא נישא אחריות על נזקים עקיפים, מיוחדים, משניים, או נגררים הנובעים משימוש או חוסר יכולת לשימוש בשירות.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">8. ביטול חשבון</h2>
            <p className="text-gray-700 dark:text-gray-300">
              אנחנו זכאים לביטול חשבון בכל עת, בכל סיבה, בהודעה או ללא הודעה.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">9. שינויים לתנאים</h2>
            <p className="text-gray-700 dark:text-gray-300">
              אנחנו זכאים לשנות תנאים אלה בכל עת. השימוש המתמשך שלך בשירות מהווה קבול לשינויים.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">10. דין החלים</h2>
            <p className="text-gray-700 dark:text-gray-300">
              תנאים אלה כפופים לדינים של מדינת ישראל.
            </p>
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