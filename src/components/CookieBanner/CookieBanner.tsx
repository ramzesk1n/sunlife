import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = 'sunlife_cookie_consent';

function getStoredConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookieConsent;
  } catch {
    return null;
  }
}

function saveConsent(consent: CookieConsent) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      setVisible(true);
    } else {
      setConsent(stored);
    }
  }, []);

  const acceptAll = useCallback(() => {
    const all = { necessary: true, analytics: true, marketing: true };
    saveConsent(all);
    setConsent(all);
    setVisible(false);
  }, []);

  const acceptNecessaryOnly = useCallback(() => {
    const necessaryOnly = { necessary: true, analytics: false, marketing: false };
    saveConsent(necessaryOnly);
    setConsent(necessaryOnly);
    setVisible(false);
  }, []);

  const saveCustom = useCallback(() => {
    saveConsent(consent);
    setVisible(false);
  }, [consent]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto glass rounded-2xl border border-gold-primary/20 shadow-glass p-5 md:p-6">
        {!showSettings ? (
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <p className="text-text-dark text-base leading-relaxed">
                Мы используем файлы cookie, чтобы сайт работал корректно и мы могли анализировать посещаемость. Вы можете принять все cookie или настроить их по категориям. Подробнее — в{' '}
                <Link to="/privacy#cookies" className="text-gold-primary hover:underline" target="_blank">
                  Политике cookie
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                type="button"
                onClick={acceptNecessaryOnly}
                className="px-4 py-2.5 rounded-xl border border-gold-primary/40 text-gold-dark font-display text-sm uppercase tracking-wider hover:bg-gold-primary/10 transition-colors"
              >
                Только необходимые
              </button>
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="px-4 py-2.5 rounded-xl border border-gold-primary/40 text-gold-dark font-display text-sm uppercase tracking-wider hover:bg-gold-primary/10 transition-colors"
              >
                Настроить
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="px-4 py-2.5 rounded-xl bg-gold-primary text-cream font-display text-sm uppercase tracking-wider hover:bg-gold-dark transition-colors"
              >
                Принять все
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-display text-lg text-gold-dark uppercase tracking-wider">
              Настройки cookie
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gold-pale/50">
                <div>
                  <p className="font-display font-semibold text-text-dark text-sm uppercase tracking-wider">
                    Технические (функциональные)
                  </p>
                  <p className="text-text-muted text-sm">
                    Необходимы для корректной работы Сайта. Не могут быть отключены.
                  </p>
                </div>
                <div className="w-11 h-6 rounded-full bg-gold-primary/30 flex items-center px-0.5 cursor-not-allowed opacity-60">
                  <div className="w-5 h-5 rounded-full bg-gold-primary translate-x-5" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-gold-pale/50">
                <div>
                  <p className="font-display font-semibold text-text-dark text-sm uppercase tracking-wider">
                    Аналитические
                  </p>
                  <p className="text-text-muted text-sm">
                    Используются для сбора статистики посещений и поведения пользователей.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConsent((prev) => ({ ...prev, analytics: !prev.analytics }))}
                  className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${
                    consent.analytics ? 'bg-gold-primary' : 'bg-gold-primary/30'
                  }`}
                  aria-label="Переключить аналитические cookie"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-cream transition-transform ${
                      consent.analytics ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-gold-pale/50">
                <div>
                  <p className="font-display font-semibold text-text-dark text-sm uppercase tracking-wider">
                    Маркетинговые
                  </p>
                  <p className="text-text-muted text-sm">
                    Используются для показа релевантной рекламы.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConsent((prev) => ({ ...prev, marketing: !prev.marketing }))}
                  className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${
                    consent.marketing ? 'bg-gold-primary' : 'bg-gold-primary/30'
                  }`}
                  aria-label="Переключить маркетинговые cookie"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-cream transition-transform ${
                      consent.marketing ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="px-4 py-2.5 rounded-xl border border-gold-primary/40 text-gold-dark font-display text-sm uppercase tracking-wider hover:bg-gold-primary/10 transition-colors"
              >
                Назад
              </button>
              <button
                type="button"
                onClick={saveCustom}
                className="px-4 py-2.5 rounded-xl bg-gold-primary text-cream font-display text-sm uppercase tracking-wider hover:bg-gold-dark transition-colors"
              >
                Сохранить настройки
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { getStoredConsent };
export type { CookieConsent };
