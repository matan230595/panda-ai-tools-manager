import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, Sparkles, MessageSquare, BarChart3, BellRing, GraduationCap,
  DollarSign, Users, Cable, CalendarDays, Settings, Target, TrendingUp,
  ChevronLeft, ChevronRight, X, CheckCircle2, Zap, Brain, Shield, Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'onboarding_completed_v2';

const STEPS = [
  {
    id: 'welcome',
    icon: Rocket,
    title: 'ברוכים הבאים ל-AI Tools Manager',
    subtitle: 'מערכת ניהול מקיפה לכלי ה-AI שלך',
    description: 'כאן תוכל לנהל, להשוות, ולייעל את כל כלי ה-AI שלך במקום אחד. בואו נכיר את היכולות של המערכת.',
    gradient: 'from-blue-600 via-cyan-500 to-blue-400',
    accent: '#3b82f6',
  },
  {
    id: 'dashboard',
    icon: Target,
    title: 'דשבורד מרכזי',
    subtitle: 'תמונת מצב מלאה במבט אחד',
    description: 'הדשבורד מציג סטטיסטיקות מפתח, כלים פעילים, התראות דחופות, וסיכום עלויות. כל מה שצריך כדי להתחיל את היום.',
    gradient: 'from-blue-600 via-cyan-500 to-teal-400',
    accent: '#3b82f6',
  },
  {
    id: 'tools',
    icon: Sparkles,
    title: 'ניהול כלים',
    subtitle: 'ארגן את כל כלי ה-AI שלך',
    description: 'הוסף כלים, קטלג אותם לפי קטגוריות, סמן מועדפים, ועקוב אחר הסטטוס של כל כלי. תוכל לראות פרטים מלאים, השוואות, והמלצות חכמות. ניתן להשתמש בתצוגת רשת, רשימה, טבלה, או קאנבן.',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    accent: '#06b6d4',
  },
  {
    id: 'assistant',
    icon: MessageSquare,
    title: 'סוכן AI חכם',
    subtitle: 'עוזר אישי לניהול הכלים',
    description: 'שוחח עם הסוכן החכם כדי לקבל המלצות, לשאול שאלות על כלים, ולבצע פעולות במהירות. הסוכן לומד את ההעדפות שלך ומתאים את התשובות בהתאם.',
    gradient: 'from-teal-500 via-cyan-500 to-blue-500',
    accent: '#14b8a6',
  },
  {
    id: 'learning',
    icon: GraduationCap,
    title: 'תוכניות למידה',
    subtitle: 'התקדם בלמידה של כל כלי',
    description: 'בנה תוכניות למידה מובנות עם שלבים ברורים, עקוב אחר ההתקדמות, והשלם את ההכשרה שלך. כל כלי מקבל רמת שליטה (מתחיל, בינוני, מומחה) ועדיפות למידה. ייצא דוחות PDF או Google Sheets.',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    accent: '#f59e0b',
  },
  {
    id: 'roi',
    icon: TrendingUp,
    title: 'ניתוח ROI ותובנות',
    subtitle: 'קבל החלטות מבוססות נתונים',
    description: 'עקוב אחר עלויות, חיסכון בזמן, והחזר השקעה לכל כלי. קבל תובנות חכמות, המלצות לאופטימיזציה, ודוחות שבועיים. המערכת מזהה כלים יקרים מדי ומציעה חלופות.',
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    accent: '#10b981',
  },
  {
    id: 'calendar',
    icon: CalendarDays,
    title: 'לוח שנה מאוחד',
    subtitle: 'כל המשימות והתזכורות במקום אחד',
    description: 'צפה בכל המשימות, תזכורות, ומועדי חידוש מנויים על לוח שנה ויזואלי מרוכז. סנכרן עם Google Calendar, קבל תזכורות באימייל, ואל תפספס שום דדליין.',
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    accent: '#6366f1',
  },
  {
    id: 'integrations',
    icon: Cable,
    title: 'אינטגרציות',
    subtitle: 'חבר את המערכת לשירותים החיצוניים',
    description: 'חבר את המערכת ל-Google Calendar, Google Drive, Google Sheets, ועוד. סנכרן מסמכי הדרכה, ייצא נתונים, ואוטומט תהליכים חוזרים.',
    gradient: 'from-indigo-500 via-blue-500 to-cyan-500',
    accent: '#6366f1',
  },
  {
    id: 'shortcuts',
    icon: Zap,
    title: 'קיצורי מקלדת',
    subtitle: 'עבוד מהר יותר עם קיצורי דרך',
    description: 'השתמש ב-Alt + 1-8 למעבר מהיר בין טאבים, Ctrl + K לחיפוש גלובלי, ו-? לעזרה. כל הקיצורים מוצגים בלחיצה על סמל המקלדת בסרגל העליון.',
    gradient: 'from-yellow-500 via-amber-500 to-orange-500',
    accent: '#eab308',
  },
  {
    id: 'done',
    icon: CheckCircle2,
    title: 'מוכן להתחיל!',
    subtitle: 'הכל מוגדר ומוכן',
    description: 'סיימנו! כעת תוכל לנהל את כלי ה-AI שלך ביעילות. תוכל לפתוח את האשף שוב מהגדרות המערכת בכל עת.',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    accent: '#06b6d4',
  },
];

export default function OnboardingWizard({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      setVisible(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#6366f1'],
    });
    setVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  const next = () => currentStep < STEPS.length - 1 ? setCurrentStep(s => s + 1) : handleComplete();
  const prev = () => currentStep > 0 && setCurrentStep(s => s - 1);

  if (!visible) return null;

  const step = STEPS[currentStep];
  const StepIcon = step.icon;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto pb-24 md:pb-4"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleSkip} />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative w-full max-w-lg max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-cyan-400/20 bg-[#1a202d]/95 backdrop-blur-2xl shadow-[0_0_60px_-10px_rgba(0,212,255,0.25)]"
          >
            {/* כותרת עם גרדיאנט */}
            <div className={`relative h-32 bg-gradient-to-br ${step.gradient} flex items-center justify-center`}>
              <button
                onClick={handleSkip}
                className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
                aria-label="סגור"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute top-3 right-4 text-white/80 text-sm font-medium">
                {currentStep + 1} / {STEPS.length}
              </div>
              <motion.div
                key={step.id}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <StepIcon className="w-8 h-8 text-white" />
              </motion.div>
            </div>

            {/* תוכן */}
            <div className="p-6 text-center">
              <motion.h2
                key={`title-${step.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-bold text-white mb-1"
              >
                {step.title}
              </motion.h2>
              <p className="text-sm text-cyan-400 mb-3">{step.subtitle}</p>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">{step.description}</p>

              {/* נקודות התקדמות */}
              <div className="flex items-center justify-center gap-1.5 mb-6">
                {STEPS.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentStep(i)}
                    className={`h-1.5 rounded-full transition-all ${i === currentStep ? 'w-8 bg-cyan-400' : i < currentStep ? 'w-4 bg-cyan-400/50' : 'w-4 bg-white/10'}`}
                    aria-label={`שלב ${i + 1}`}
                  />
                ))}
              </div>

              {/* כפתורים */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={prev}
                  disabled={currentStep === 0}
                  className="text-sm text-slate-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronRight className="w-4 h-4" />
                  הקודם
                </button>

                <Button
                  onClick={next}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 min-h-[44px]"
                >
                  {currentStep === STEPS.length - 1 ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      בואו נתחיל
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      הבא
                      <ChevronLeft className="w-4 h-4" />
                    </span>
                  )}
                </Button>

                <button
                  onClick={handleSkip}
                  className="text-sm text-slate-500 hover:text-white transition-colors"
                >
                  דלג
                </button>
              </div>
            </div>

            {/* פס התקדמות תחתון */}
            <div className="h-1 bg-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}