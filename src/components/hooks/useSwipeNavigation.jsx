import { useRef, useEffect, useCallback } from 'react';

const INTERACTIVE_SELECTORS = 'button, a, input, textarea, select, [role="button"], [data-swipe-ignore], [contenteditable="true"]';

/**
 * זיהוי החלקה אופקית למעבר חלק בין טאבים במובייל.
 *
 * תכונות:
 *  - משוב חזותי חי: onSwipeProgress(-1..1) בזמן ההחלקה
 *  - ניווט מעגלי (wrap) בין הטאב הראשון לאחרון
 *  - התעלמות מהחלקות שמתחילות על אלמנטים אינטראקטיביים
 *  - משוב הפטי (navigator.vibrate) בעת מעבר
 *
 * @param {Function} onSwipeLeft  - החלקה שמאלה (← הטאב הבא ב-RTL)
 * @param {Function} onSwipeRight - החלקה ימינה (→ הטאב הקודם ב-RTL)
 * @param {Object} options
 *   - threshold: מינימום מרחק (px, ברירת מחדל 50)
 *   - maxDuration: מקסימום זמן מגע (ms, ברירת מחדל 700)
 *   - velocityThreshold: מהירות מינימלית (px/ms, ברירת מחדל 0.25)
 *   - onSwipeProgress: קולבק חי עם ערך -1..1 במהלך ההחלקה
 */
export function useSwipeNavigation(onSwipeLeft, onSwipeRight, options = {}) {
  const {
    threshold = 50,
    maxDuration = 700,
    velocityThreshold = 0.25,
    onSwipeProgress,
  } = options;

  const touch = useRef({ x: 0, y: 0, t: 0, active: false, identifier: null });
  const callbacks = useRef({ onSwipeLeft, onSwipeRight, onSwipeProgress });

  useEffect(() => {
    callbacks.current = { onSwipeLeft, onSwipeRight, onSwipeProgress };
  });

  const onTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    // התעלם ממגע שמתחיל על אלמנט אינטראקטיבי
    if (t.target.closest?.(INTERACTIVE_SELECTORS)) return;
    touch.current = {
      x: t.clientX,
      y: t.clientY,
      t: Date.now(),
      active: true,
      identifier: t.identifier,
    };
  }, []);

  const onTouchMove = useCallback((e) => {
    const tc = touch.current;
    if (!tc.active) return;
    const t = Array.from(e.touches).find(t => t.identifier === tc.identifier);
    if (!t) return;
    const dx = t.clientX - tc.x;
    const dy = t.clientY - tc.y;
    // דווח רק החלקה אופקית
    if (Math.abs(dx) < Math.abs(dy)) return;
    const w = window.innerWidth || 375;
    const progress = Math.max(-1, Math.min(1, dx / (w * 0.35)));
    callbacks.current.onSwipeProgress?.(progress);
  }, []);

  const onTouchEnd = useCallback((e) => {
    const tc = touch.current;
    if (!tc.active) return;
    const ended = Array.from(e.changedTouches).find(t => t.identifier === tc.identifier);
    if (!ended) return;

    const dx = ended.clientX - tc.x;
    const dy = ended.clientY - tc.y;
    const dt = Date.now() - tc.t;

    touch.current.active = false;
    touch.current.identifier = null;
    callbacks.current.onSwipeProgress?.(0);

    if (dt > maxDuration) return;
    if (Math.abs(dx) < Math.abs(dy)) return;
    if (Math.abs(dx) < threshold) return;

    const velocity = Math.abs(dx) / dt;
    if (velocity < velocityThreshold) return;

    // ב-RTL: החלקה שמאלה = הטאב הבא; ימינה = הקודם
    if (dx < 0) {
      callbacks.current.onSwipeLeft?.();
      if (navigator.vibrate) navigator.vibrate(12);
    } else {
      callbacks.current.onSwipeRight?.();
      if (navigator.vibrate) navigator.vibrate(12);
    }
  }, [threshold, maxDuration, velocityThreshold]);

  useEffect(() => {
    const el = document.getElementById('main-content');
    if (!el) return;

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [onTouchStart, onTouchMove, onTouchEnd]);
}