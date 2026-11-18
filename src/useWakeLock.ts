import { useEffect, useState } from 'react';

const STORAGE_KEY = 'knitting-keep-screen-on';

/**
 * Keeps the screen awake via the Screen Wake Lock API while `enabled` is true.
 * The browser releases the lock whenever the page is hidden (tab switch,
 * screen off, app in background), so it is re-acquired once the page becomes
 * visible again. The user's choice is persisted in localStorage.
 */
export function useWakeLock() {
  const isSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

  const [enabled, setEnabled] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  );
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  useEffect(() => {
    if (!isSupported || !enabled) return;

    let sentinel: WakeLockSentinel | null = null;
    let pending = false;
    let cancelled = false;

    const handleRelease = () => {
      sentinel = null;
    };

    const acquire = async () => {
      if (cancelled || pending || sentinel || document.visibilityState !== 'visible') return;
      pending = true;
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (cancelled) {
          await lock.release();
          return;
        }
        sentinel = lock;
        lock.addEventListener('release', handleRelease);
        setHasError(false);
      } catch {
        // e.g. denied by battery saver or the page is not visible
        if (!cancelled) setHasError(true);
      } finally {
        pending = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void acquire();
    };

    void acquire();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (sentinel) {
        sentinel.removeEventListener('release', handleRelease);
        void sentinel.release();
        sentinel = null;
      }
      setHasError(false);
    };
  }, [enabled, isSupported]);

  return { isSupported, enabled, setEnabled, hasError };
}
