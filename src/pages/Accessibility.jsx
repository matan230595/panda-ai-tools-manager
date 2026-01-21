import React, { useState } from 'react';
import { ArrowRight, Eye, Volume2, Keyboard, Type } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

export default function Accessibility() {
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  React.useEffect(() => {
    document.documentElement.style.fontSize = `${(fontSize / 100) * 16}px`;
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    if (reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [fontSize, highContrast, reducedMotion]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-indigo-600 hover:text-indigo-700">
          <ArrowRight className="w-4 h-4 rotate-180" />
          חזרה לעמוד הבית
        </Link>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">הצהרת נגישות</h1>
            <p className="text-gray-600 dark:text-gray-400">
              אנחנו מתחייבים לעשות את המערכת שלנו נגישה לכולם, כולל אנשים עם מוגבלויות.
            </p>
          </div>

          {/* Accessibility Controls */}
          <Card className="p-6 space-y-6">
            <h2 className="text-2xl font-bold">אפשרויות נגישות</h2>

            <div className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Type className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium">גודל טקסט ({fontSize}%)</span>
                </label>
                <Slider
                  value={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0])}
                  min={80}
                  max={150}
                  step={10}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <Eye className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium">ניגודיות גבוהה</span>
                </label>
                <button
                  onClick={() => setHighContrast(!highContrast)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    highContrast
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                  }`}
                >
                  {highContrast ? 'פעיל' : 'כבוי'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <Keyboard className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium">הפחתת תנועה</span>
                </label>
                <button
                  onClick={() => setReducedMotion(!reducedMotion)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    reducedMotion
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                  }`}
                >
                  {reducedMotion ? 'פעיל' : 'כבוי'}
                </button>
              </div>
            </div>
          </Card>

          {/* WCAG Compliance */}
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">ציות ל-WCAG 2.1</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold mb-1">ניווט מלא במקלדת</h4>
                  <p className="text-gray-600 dark:text-gray-400">ניתן להשתמש במערכת בעזרת מקלדת בלבד</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold mb-1">תמיכה בקוראי מסך</h4>
                  <p className="text-gray-600 dark:text-gray-400">ARIA labels וקוראי מסך מובילים נתמכים</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold mb-1">ניגודיות צבע</h4>
                  <p className="text-gray-600 dark:text-gray-400">כל הטקסט עומד בתקני ניגודיות WCAG AA</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold mb-1">רכיבים מתגובבים</h4>
                  <p className="text-gray-600 dark:text-gray-400">כל המערכת עובדת בכל גדלי המסך</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold mb-1">טקסט חלופי</h4>
                  <p className="text-gray-600 dark:text-gray-400">כל התמונות והלוגוהים כוללים תיאור טקסט</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Support */}
          <Card className="p-6 bg-indigo-50 dark:bg-indigo-900/20 space-y-4">
            <h3 className="text-xl font-bold">צריך עזרה בנגישות?</h3>
            <p className="text-gray-700 dark:text-gray-300">
              אם אתה חווה בעיות בנגישות של המערכת, אנא צור קשר איתנו. אנחנו כאן כדי לעזור.
            </p>
            <Link to="/contact">
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600">
                צור קשר עם טיים התמיכה
              </Button>
            </Link>
          </Card>

          <div className="border-t pt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              כל הזכויות שמורות ל<span className="text-xl">🐼</span> פנדה סוכנות דיגיטל
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}