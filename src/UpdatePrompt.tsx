import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Shows a small banner when a new version of the app has been downloaded
 * by the service worker. Tapping "Aktualisieren" activates it and reloads.
 */
function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      // Installed PWAs often stay open for days, so look for a new version
      // whenever the app comes back to the foreground.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && navigator.onLine && !registration.installing) {
          void registration.update();
        }
      });
    },
  });

  const handleUpdate = () => {
    // The plugin only reloads for pages that were already controlled when they
    // loaded, so also reload ourselves once the new version takes over.
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
    void updateServiceWorker(true);
  };

  if (!needRefresh) return null;

  return (
    <div className="update-toast" role="status" aria-live="polite">
      <span className="update-toast-text">Neue Version verfügbar</span>
      <div className="update-toast-actions">
        <button className="update-toast-later" onClick={() => setNeedRefresh(false)}>
          Später
        </button>
        <button className="update-toast-reload" onClick={handleUpdate}>
          Aktualisieren
        </button>
      </div>
    </div>
  );
}

export default UpdatePrompt;
