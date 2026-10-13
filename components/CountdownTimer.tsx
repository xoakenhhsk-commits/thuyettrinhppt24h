'use client';

import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface CountdownTimerProps {
  initialMinutes?: number;
  createdAt?: string;
  onExpire?: () => void;
}

export function CountdownTimer({
  initialMinutes = 30,
  createdAt,
  onExpire
}: CountdownTimerProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(initialMinutes * 60);

  useEffect(() => {
    setMounted(true);
    if (createdAt) {
      const createdTime = new Date(createdAt).getTime();
      const expiresAt = createdTime + initialMinutes * 60 * 1000;
      const diff = Math.floor((expiresAt - Date.now()) / 1000);
      setTimeLeft(diff > 0 ? diff : 0);
    }
  }, [createdAt, initialMinutes]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 300; // Dưới 5 phút

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all ${
        isUrgent
          ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
          : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
      }`}
    >
      {isUrgent ? (
        <AlertTriangle className="w-4 h-4 text-rose-600" />
      ) : (
        <Clock className="w-4 h-4 text-amber-600" />
      )}
      <span>Hạn thanh toán:</span>
      <span className="font-mono text-base font-bold tracking-wider">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
