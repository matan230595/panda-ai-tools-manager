import { useRef, useEffect, useCallback } from 'react';

/**
 * זיהוי החלקה אופקית למעבר בין טאבים במובייל.
 * משדר navigator.vibrate קל (10ms) למשוב הפטי בעת מעבר.
 *
 * @param {Function} onSwipeLeft  - נקראת כשהמשתמש מחליק שמאלה (← הטאב הבא ב-RTL)
 * @param {Function} onSwipeRight - נקראת כשהמשתמש מחליק ימינה (→ הטאב הקודם ב-RTL)
 * @param {Object} options
 *   - threshold: מינימום מרחק כדי להחשיב החלקה (px, ברירת מחדל 60)
 *   - maxDuration: מקסימום זמן מגע (ms, ברירת מחדל 600)
 *   - velocityThreshold: מהירות מינימלית (px/ms, ברירת מחדל 0.3)
 */
export function useSwipeNavigation(onSwipeLeft, onSwipeRight, options = {}) {
  const { threshold = 60, maxDuration = 600, velocityThreshold = 0.3 } = options;
  const touch = useRef({ x: 0, y: 0, t: 0, active: false, identifier: null });
  const callbacks = useRef({ onSwipeLeft, onSwipeRight });

  useEffect(() => {
    callbacks.current = { onSwipeLeft, onSwipeRight };
  });

  const onTouchStart = useCallback((e) => {
    // רק מגע אחד
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    touch.current = {
      x: t.clientX,
      y: t.clientY,
      t: Date.now(),
      active: true,
      identifier: t.identifier,
    };
  }, []);

  const onTouchEnd = useCallback((e) => {
    const tc = touch.current;
    if (!tc.active) return;
    // מצא את המגע שהסתיים
    const ended = Array.from(e.changedTouches).find(t => t.identifier === tc.identifier);
    if (!ended) return;

    const dx = ended.clientX - tc.x;
    const dy = ended.clientY - tc.y;
    const dt = Date.now() - tc.t;

    touch.current.active = false;
    touch.current.identifier = null;

    // בדיקת תקפות
    if (dt > maxDuration) return;
    // חייבת להיות החלקה אופקית יותר מאנכית
    if (Math.abs(dx) < Math.abs(dy)) return;
    if (Math.abs(dx) < threshold) return;

    const velocity = Math.abs(dx) / dt;
    if (velocity < velocityThreshold) return;

    // ב-RTL: החלקה שמאלה = הטאב הבא; ימינה = הקודם
    if (dx < 0) {
      callbacks.current.onSwipeLeft?.();
      if (navigator.vibrate) navigator.vibrate(10);
    } else {
      callbacks.current.onSwipeRight?.();
      if (navigator.vibrate) navigator.vibrate(10);
    }
  }, [threshold, maxDuration, velocityThreshold]);

  useEffect(() => {
    const el = document.getElementById('main-content');
    if (!el) return;

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [onTouchStart, onTouchEnd]);
}