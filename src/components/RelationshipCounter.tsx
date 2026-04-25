"use client";

import { useEffect, useMemo, useState } from "react";

type RelationshipCounterProps = {
  targetDate: string;
};

function getDurationParts(targetDate: Date) {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  const totalSeconds = Math.max(Math.floor(diff / 1000), 0);

  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

export function RelationshipCounter({ targetDate }: RelationshipCounterProps) {
  const countdownTarget = useMemo(() => new Date(targetDate), [targetDate]);
  const [duration, setDuration] = useState(() => getDurationParts(countdownTarget));

  useEffect(() => {
    const timer = setInterval(() => {
      setDuration(getDurationParts(countdownTarget));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdownTarget]);

  const items = [
    { label: "Days", value: duration.days },
    { label: "Hours", value: duration.hours },
    { label: "Minutes", value: duration.minutes },
    { label: "Seconds", value: duration.seconds },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="luxury-card rounded-[1.35rem] border border-rose-200/90 bg-white/84 p-5 text-center shadow-md backdrop-blur-sm sm:p-6"
        >
          <p className="text-3xl font-bold text-rose-700">{item.value}</p>
          <p className="text-sm tracking-wide text-rose-500">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
