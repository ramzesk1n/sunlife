import { useCallback } from 'react';

/**
 * Russian phone number mask hook
 * Formats input as +7 (XXX) XXX-XX-XX
 */
export function usePhoneMask() {
  const formatPhone = useCallback((value: string): string => {
    // Remove all non-digit characters except +
    let digits = value.replace(/[^\d+]/g, '');

    // Ensure starts with +7
    if (digits.startsWith('8')) {
      digits = '+7' + digits.slice(1);
    } else if (!digits.startsWith('+')) {
      digits = '+7' + digits;
    } else if (digits.startsWith('+') && !digits.startsWith('+7')) {
      digits = '+7' + digits.slice(1).replace(/\D/g, '');
    }

    // Extract digits after +7
    const afterPlus = digits.slice(2).replace(/\D/g, '');

    // Build formatted string
    let result = '+7';
    if (afterPlus.length > 0) {
      result += ' (' + afterPlus.slice(0, 3);
    }
    if (afterPlus.length >= 3) {
      result += ') ' + afterPlus.slice(3, 6);
    }
    if (afterPlus.length >= 6) {
      result += '-' + afterPlus.slice(6, 8);
    }
    if (afterPlus.length >= 8) {
      result += '-' + afterPlus.slice(8, 10);
    }

    return result;
  }, []);

  const handlePhoneChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) => {
    const rawValue = e.target.value;
    const formatted = formatPhone(rawValue);
    onChange(formatted);
  }, [formatPhone]);

  return { formatPhone, handlePhoneChange };
}

/**
 * Get today's date in YYYY-MM-DD format for date input min attribute
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}
