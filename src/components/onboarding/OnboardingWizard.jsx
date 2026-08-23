import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Rocket, Brain, Calendar, Shield, CheckCircle2,
  ChevronLeft, ChevronRight, X, Zap, Target, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'onboarding_completed_v1';

const STEPS = [
  {
    id: 'welcome',
    icon: Rocket,
    title: 'ברוכים הבאים ל-AI Tools Manager',
    subtitle: 'מערכת ניהול מקיפה לכלי ה-AI שלך',
    description: 'כאן תוכל לנהל, להשוות, ולייעל את כל כלי ה-AI שלך במקום אחד. בואו נתחיל!',
    gradient: 'from-blue-600 via-cyan-500 to-blue-400',
    accent: '#3b82f6',
  },
  {
    id: 'tools',
    icon: Sparkles,
    title: 'ניהול כלים',
    subtitle: 'ארגן את כל כלי ה-AI שלך',
    description: 'הוסף כלים, קטלג אותם לפי קטגוריות, סמן מועדפים, ועקוב אחר הסטטוס של כל כלי בלוח קאנבן ויזואלי.',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    accent: '#3b82f6',
  },
  {
    id: 'tasks',
    icon: Target,
    title: 'משימות ותזכורות',
    subtitle: 'לעולם לא תשכח משימה חשובה',
    description: 'צור משימות לכל כלי, קבע תזכורות, וצפה בכל הדדליינים על לוח שנה ויזואלי מרוכז.',
    gradient: 'from-emerald-500 via-green-500 to-lime-500',
    accent: '#10b981',
  },
  {
    id: 'learning',
    icon: Brain,
    title: 'תוכניות למידה',
    subtitle: 'התקדם בלמידה של כל כלי',
    description: 'בנה תוכניות למידה מובנות עם שלבים, עקוב אחר ההתקדמות, והשלם את ההכשרה שלך בצורה מסודרת.',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    accent: '#f59e0b',
  },
  {
    id: 'roi',
    icon: TrendingUp,
    title: 'ניתוח ROI ותובנות',
    subtitle: 'קבל החלטות מבוססות נתונים',
    description: 'עקוב אחר עלויות, חיסכון בזמן, והחזר השקעה לכל כלי. קבל תובנות חכמות והמלצות מהמערכת.',
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
      colors: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'],
    });
    setVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
    onComplete?.();
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  if (!visible) return null;

  const step = STEPS[currentStep];
  const StepIcon = step.icon;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        dir="rtl"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={handleSkip}
        />

        {/* Floating background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.id}
              className="absolute rounded-full blur-3xl opacity-20"
              style={{
                width: 200 + i * 40,
                height: 200 + i * 40,
                background: `linear-gradient(135deg, ${s.accent}, transparent)`,
                top: `${10 + i * 12}%`,
                left: `${5 + (i % 3) * 30}%`,
              }}
              animate={{
                x: [0, 30, 0],
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Card */}
        <motion.div
          key={step.id}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-lg"
        >
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-white/20">
            {/* Gradient header */}
            <div className={`relative h-40 bg-gradient-to-br ${step.gradient} overflow-hidden`}>
              {/* Animated grid pattern */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                  backgroundSize: '20px 20px',
                }}
              />
              {/* Floating icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl">
                  <StepIcon className="w-10 h-10 text-white" />
                </div>
              </motion.div>

              {/* Close button */}
              <button
                onClick={handleSkip}
                className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="דלג"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              {/* Step counter */}
              <div className="absolute top-3 right-4 text-white text-sm font-medium">
                {currentStep + 1} / {STEPS.length}
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-gray-100 dark:bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                className={`h-full bg-gradient-to-r ${step.gradient}`}
              />
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 text-center">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-1"
              >
                {step.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3"
              >
                {step.subtitle}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed"
              >
                {step.description}
              </motion.p>

              {/* Step dots */}
              <div className="flex items-center justify-center gap-2 mt-6">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentStep
                        ? 'w-8 bg-indigo-600'
                        : i < currentStep
                        ? 'w-2 bg-indigo-400'
                        : 'w-2 bg-gray-300 dark:bg-slate-700'
                    }`}
                    aria-label={`שלב ${i + 1}`}
                  />
                ))}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between gap-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="text-sm"
                >
                  <ChevronRight className="w-4 h-4 ml-1" />
                  הקודם
                </Button>

                <Button variant="ghost" onClick={handleSkip} className="text-xs text-gray-400">
                  דלג
                </Button>

                <Button
                  onClick={nextStep}
                  className={`bg-gradient-to-r ${step.gradient} text-white shadow-lg`}
                >
                  {currentStep === STEPS.length - 1 ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 ml-1" />
                      בואו נתחיל!
                    </>
                  ) : (
                    <>
                      הבא
                      <ChevronLeft className="w-4 h-4 mr-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}