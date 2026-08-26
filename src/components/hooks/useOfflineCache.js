import { useState, useEffect, useCallback } from 'react';

const CACHE_PREFIX = 'panda_offline_';
const CACHE_TIMESTAMP_KEY = 'panda_offline_timestamps';
const MAX_CACHE_AGE = 1000 * 60 * 60 * 24 * 7; // 7 ימים

function getTimestamps() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_TIMESTAMP_KEY) || '{}');
  } catch { return {}; }
}

function setTimestamp(key) {
  const ts = getTimestamps();
  ts[key] = Date.now();
  localStorage.setItem(CACHE_TIMESTAMP_KEY, JSON.stringify(ts));
}

/**
 * שמירת נתונים במטמון מקומי לגישה לא-מקוונת.
 * משמש כשכבת מטמון מעל React Query — שומר את התוצאה האחרונה
 * ומציג אותה מיידית כשאין חיבור לאינטרנט או כשהשאילתה נכשלת.
 */
export function saveToCache(key, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
    setTimestamp(key);
  } catch (e) {
    console.warn('Failed to cache data for', key, e);
  }
}

export function loadFromCache(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const ts = getTimestamps();
    const age = ts[key] ? Date.now() - ts[key] : Infinity;
    if (age > MAX_CACHE_AGE) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return isOnline;
}

/**
 * Hook שמחזיר נתונים מהמטמון המקומי כשאין חיבור לאינטרנט.
 * משתלב עם React Query — כשהשאילתה מצליחה, שומר את הנתונים.
 * כשהיא נכשלת או שאין רשת, מחזיר את המטמון האחרון.
 */
export function useOfflineCache(queryKey, queryData, isLoading, isError) {
  const isOnline = useOnlineStatus();
  const cacheKey = Array.isArray(queryKey) ? queryKey.join('_') : String(queryKey);

  useEffect(() => {
    if (queryData && !isLoading && !isError) {
      saveToCache(cacheKey, queryData);
    }
  }, [cacheKey, queryData, isLoading, isError]);

  const cachedData = loadFromCache(cacheKey);

  // כשאין רשת או שהשאילתה נכשלה — הצג מטמון
  if ((!isOnline || isError) && cachedData && !queryData) {
    return { data: cachedData, fromCache: true, isOnline };
  }

  return { data: queryData, fromCache: false, isOnline };
}