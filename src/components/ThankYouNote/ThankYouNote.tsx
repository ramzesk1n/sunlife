import { useEffect, useState } from 'react';

interface ThankYouNoteProps {
  title?: string;
  subtitle?: string;
  /** How long the note stays visible before fading out (ms) */
  duration?: number;
  /** Called after the fade-out completes */
  onDone: () => void;
}

/**
 * Auto-dismissing thank-you message shown after successful form submit.
 * Appears with fade-in-up animation, fades out after `duration`, then calls onDone.
 */
export default function ThankYouNote({
  title = 'Спасибо! Ваша заявка получена!',
  subtitle = 'Мы свяжемся с вами в ближайшее время.',
  duration = 3000,
  onDone,
}: ThankYouNoteProps) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setLeaving(true), duration);
    const doneTimer = window.setTimeout(onDone, duration + 350);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [duration, onDone]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`glass rounded-2xl p-8 text-center transition-all duration-300 ${
        leaving ? 'opacity-0 -translate-y-2 scale-95' : 'animate-fade-in-up'
      }`}
    >
      <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-3">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="font-display text-2xl text-gold-primary-80 mb-2 uppercase tracking-wider">
        {title}
      </p>
      <p className="text-text-muted text-base">{subtitle}</p>
    </div>
  );
}
