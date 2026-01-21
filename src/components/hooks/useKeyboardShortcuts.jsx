import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Hook לניהול קיצורי מקלדת
 */
export function useKeyboardShortcuts(settings, callbacks) {
  const {
    onTabChange,
    onSearch,
    onHelp,
  } = callbacks || {};

  useEffect(() => {
    if (!settings?.enableKeyboardShortcuts) return;

    const handleKeyPress = (e) => {
      // Alt + מספר למעבר בין טאבים
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        const tabMap = {
          '1': 'tools',
          '2': 'assistant',
          '3': 'subscriptions',
          '4': 'stats',
          '5': 'insights',
          '6': 'settings',
        };

        if (tabMap[e.key]) {
          onTabChange?.(tabMap[e.key]);
          e.preventDefault();
          return;
        }
      }

      // Ctrl + K - חיפוש מהיר
      if (e.ctrlKey && e.key === 'k' && !e.shiftKey && !e.altKey) {
        onSearch?.();
        e.preventDefault();
        return;
      }

      // ? - הצג עזרת קיצורי מקלדת
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        const target = e.target;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          onHelp?.();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [settings?.enableKeyboardShortcuts, onTabChange, onSearch, onHelp]);
}

/**
 * קיצורי מקלדת זמינים
 */
export const KEYBOARD_SHORTCUTS = [
  {
    keys: ['Alt', '1'],
    description: 'עבור לכלים',
    category: 'ניווט',
  },
  {
    keys: ['Alt', '2'],
    description: 'עבור לעוזר AI',
    category: 'ניווט',
  },
  {
    keys: ['Alt', '3'],
    description: 'עבור למנויים',
    category: 'ניווט',
  },
  {
    keys: ['Alt', '4'],
    description: 'עבור לסטטיסטיקות',
    category: 'ניווט',
  },
  {
    keys: ['Alt', '5'],
    description: 'עבור לתובנות',
    category: 'ניווט',
  },
  {
    keys: ['Alt', '6'],
    description: 'עבור להגדרות',
    category: 'ניווט',
  },
  {
    keys: ['Ctrl', 'K'],
    description: 'חיפוש מהיר',
    category: 'חיפוש',
  },
  {
    keys: ['?'],
    description: 'הצג עזרה',
    category: 'עזרה',
  },
];