import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * רשימת הטאבים הניתנים לניווט במקלדת (מסודרת מימין לשמאל ב-RTL)
 */
export const KEYBOARD_TAB_ORDER = [
  'dashboard',
  'tools',
  'assistant',
  'subscriptions',
  'stats',
  'insights',
  'reminders',
  'learning',
  'budget',
  'integrations',
  'collaboration',
  'settings',
];

/**
 * Hook לניהול קיצורי מקלדת גלובליים
 *
 * ניווט טאבים:
 *   Alt+1..9,0   — קפיצה ישירה לטאב לפי מספר
 *   Alt+→ / Alt+← — טאב הבא / הקודם (ב-RTL: חץ שמאלה = קדימה)
 *   J / K        — טאב הבא / הקודם (סגנון Vim, ללא Alt)
 *
 * חיפוש:
 *   Ctrl+K / Cmd+K — פתח חיפוש מהיר
 *   /              — התמקד בשורת החיפוש בתוך טאב פעיל
 *
 * עזרה:
 *   ?   — הצג מסך עזרת קיצורים
 *   Esc — סגור מודאלים / חיפוש
 */
export function useKeyboardShortcuts(settings, callbacks) {
  const { onTabChange, onSearch, onHelp, onClose } = callbacks || {};

  useEffect(() => {
    if (!settings?.enableKeyboardShortcuts) return;

    const handleKeyPress = (e) => {
      const target = e.target;
      const inField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // === Esc — סגירה גלובלית (עובד גם בתוך שדות) ===
      if (e.key === 'Escape') {
        onClose?.();
        return;
      }

      // === Ctrl/Cmd + K — חיפוש מהיר (עובד גם בתוך שדות) ===
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onSearch?.();
        return;
      }

      // מכאן ואילך — לא בתוך שדות קלט
      if (inField) return;

      // === Alt + מספר — קפיצה ישירה לטאב ===
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        const numKey = e.key;
        if (numKey >= '0' && numKey <= '9') {
          const idx = numKey === '0' ? 9 : parseInt(numKey, 10) - 1;
          const tab = KEYBOARD_TAB_ORDER[idx];
          if (tab) {
            onTabChange?.(tab);
            e.preventDefault();
            toast.success(`עברת ל: ${tabLabel(tab)}`, { duration: 1200 });
          }
          return;
        }

        // === Alt + חצים — ניווט טאבים ===
        // ב-RTL: חץ שמאלה = הטאב הבא, חץ ימינה = הקודם
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          const forward = e.key === 'ArrowLeft';
          moveTab(forward ? 1 : -1, onTabChange);
          return;
        }
      }

      // === J / K — ניווט טאבים בסגנון Vim ===
      if (!e.ctrlKey && !e.altKey && !e.shiftKey) {
        if (e.key === 'j' || e.key === 'J') {
          moveTab(1, onTabChange);
          return;
        }
        if (e.key === 'k' || e.key === 'K') {
          moveTab(-1, onTabChange);
          return;
        }

        // === / — התמקד בחיפוש ===
        if (e.key === '/') {
          e.preventDefault();
          onSearch?.();
          return;
        }

        // === ? — עזרה ===
        if (e.key === '?') {
          e.preventDefault();
          onHelp?.();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [settings?.enableKeyboardShortcuts, onTabChange, onSearch, onHelp, onClose]);
}

function moveTab(delta, onTabChange) {
  // קורא את הטאב הפעיל הנוכחי מה-DOM
  const activeEl = document.querySelector('[data-active-tab]');
  const currentTab = activeEl?.getAttribute('data-active-tab') || 'tools';
  const currentIdx = KEYBOARD_TAB_ORDER.indexOf(currentTab);
  if (currentIdx === -1) return;
  const nextIdx = (currentIdx + delta + KEYBOARD_TAB_ORDER.length) % KEYBOARD_TAB_ORDER.length;
  const nextTab = KEYBOARD_TAB_ORDER[nextIdx];
  onTabChange?.(nextTab);
  toast.success(`עברת ל: ${tabLabel(nextTab)}`, { duration: 1200 });
}

function tabLabel(tabId) {
  const labels = {
    dashboard: 'דשבורד',
    tools: 'כלים',
    assistant: 'סוכן AI',
    subscriptions: 'מנויים',
    stats: 'סטטיסטיקות',
    insights: 'תובנות',
    reminders: 'התראות',
    learning: 'למידה',
    budget: 'תקציב',
    integrations: 'אינטגרציות',
    collaboration: 'שיתוף',
    settings: 'הגדרות',
  };
  return labels[tabId] || tabId;
}

/**
 * קיצורי מקלדת זמינים — לתצוגה במסך העזרה
 */
export const KEYBOARD_SHORTCUTS = [
  { keys: ['Alt', '1'], description: 'עבור לדשבורד', category: 'ניווט' },
  { keys: ['Alt', '2'], description: 'עבור לכלים', category: 'ניווט' },
  { keys: ['Alt', '3'], description: 'עבור לעוזר AI', category: 'ניווט' },
  { keys: ['Alt', '4'], description: 'עבור למנויים', category: 'ניווט' },
  { keys: ['Alt', '5'], description: 'עבור לסטטיסטיקות', category: 'ניווט' },
  { keys: ['Alt', '6'], description: 'עבור לתובנות', category: 'ניווט' },
  { keys: ['Alt', '7'], description: 'עבור להתראות', category: 'ניווט' },
  { keys: ['Alt', '8'], description: 'עבור ללמידה', category: 'ניווט' },
  { keys: ['Alt', '9'], description: 'עבור לתקציב', category: 'ניווט' },
  { keys: ['Alt', '0'], description: 'עבור להגדרות', category: 'ניווט' },
  { keys: ['Alt', '←'], description: 'הטאב הבא (RTL)', category: 'ניווט' },
  { keys: ['Alt', '→'], description: 'הטאב הקודם (RTL)', category: 'ניווט' },
  { keys: ['J'], description: 'טאב הבא (Vim)', category: 'ניווט' },
  { keys: ['K'], description: 'טאב הקודם (Vim)', category: 'ניווט' },
  { keys: ['Ctrl', 'K'], description: 'חיפוש מהיר', category: 'חיפוש' },
  { keys: ['/'], description: 'פתח חיפוש', category: 'חיפוש' },
  { keys: ['?'], description: 'הצג עזרת קיצורים', category: 'עזרה' },
  { keys: ['Esc'], description: 'סגור מודאל / חיפוש', category: 'עזרה' },
];