import { useEffect, useRef, useState } from 'react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toast: ToastItem;
  onRemove: (id: string) => void;
}

const icons = {
  success: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

const styles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-gold-pale border-gold-primary/20 text-gold-dark',
};

export default function Toast({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const removeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const enterTimer = requestAnimationFrame(() => setIsVisible(true));
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      removeTimeoutRef.current = setTimeout(() => onRemove(toast.id), 300);
    }, 4000);

    return () => {
      cancelAnimationFrame(enterTimer);
      clearTimeout(removeTimer);
      if (removeTimeoutRef.current !== undefined) clearTimeout(removeTimeoutRef.current);
    };
  }, [toast.id, onRemove]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-gold min-w-[280px] max-w-md pointer-events-auto transition-all duration-300 ease-out ${styles[toast.type]} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      role="alert"
    >
      <span className="flex-shrink-0">{icons[toast.type]}</span>
      <span className="text-sm font-light">{toast.message}</span>
      <button
        type="button"
        onClick={() => {
          setIsVisible(false);
          removeTimeoutRef.current = setTimeout(() => onRemove(toast.id), 300);
        }}
        className="ml-auto flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
        aria-label="Закрыть"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
