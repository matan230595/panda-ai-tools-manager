import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * שומר ומשחזר מצב פילטרים/חיפוש/תצוגה ב-URL (query params).
 * מאפשר רענון ושיתוף קישור עם שמירת אותה תצוגה.
 *
 * @param {Object} defaults - ערכי ברירת מחדל לכל פרמטר
 * @param {Object} serializers - אופציונלי: { key: { parse, stringify } } לפרמטרים מורכבים
 */
export default function useUrlFilters(defaults, serializers = {}) {
  const readFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const key of Object.keys(defaults)) {
      const raw = params.get(key);
      if (raw === null) {
        result[key] = defaults[key];
        continue;
      }
      const serializer = serializers[key];
      if (serializer?.parse) {
        try {
          result[key] = serializer.parse(raw);
        } catch {
          result[key] = defaults[key];
        }
      } else if (typeof defaults[key] === 'number') {
        const n = Number(raw);
        result[key] = Number.isNaN(n) ? defaults[key] : n;
      } else if (typeof defaults[key] === 'boolean') {
        result[key] = raw === 'true';
      } else {
        result[key] = raw;
      }
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [values, setValues] = useState(readFromUrl);
  const isFirst = useRef(true);

  // כתיבה ל-URL כשמצב משתנה (ללא היסטוריה מיותרת)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    for (const key of Object.keys(defaults)) {
      const value = values[key];
      const serializer = serializers[key];
      const isDefault = serializer?.isDefault
        ? serializer.isDefault(value)
        : JSON.stringify(value) === JSON.stringify(defaults[key]);

      if (isDefault) {
        params.delete(key);
      } else {
        params.set(key, serializer?.stringify ? serializer.stringify(value) : String(value));
      }
    }
    const query = params.toString();
    const newUrl = `${window.location.pathname}${query ? `?${query}` : ''}`;
    if (isFirst.current) {
      isFirst.current = false;
      window.history.replaceState(null, '', newUrl);
    } else {
      window.history.replaceState(null, '', newUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  // עדכון מצב מתי שה-URL משתנה (כפתורי חזרה/קדימה בדפדפן)
  useEffect(() => {
    const handlePopState = () => setValues(readFromUrl());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readFromUrl]);

  const setValue = useCallback((key, val) => {
    setValues(prev => ({
      ...prev,
      [key]: typeof val === 'function' ? val(prev[key]) : val,
    }));
  }, []);

  return [values, setValue, setValues];
}