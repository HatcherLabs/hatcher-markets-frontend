'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  endTime: string;
}

export default function CountdownTimer({ endTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    function update() {
      const now = Date.now();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        setIsUrgent(false);
        return;
      }

      setIsUrgent(diff < 3600000); // < 1 hour

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);

      const parts: string[] = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      parts.push(`${minutes}m`);

      setTimeLeft(parts.join(' '));
    }

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (timeLeft === 'Expired') {
    return <span className="text-gray-400">Expired</span>;
  }

  return (
    <span className={isUrgent ? 'text-red-400 font-semibold animate-pulse' : 'text-emerald-400'}>
      {timeLeft} remaining
    </span>
  );
}
