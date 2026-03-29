"use client";

import { useState, useEffect } from "react";

export function Countdown() {
  const target = new Date("2026-09-01T00:00:00").getTime();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const boxes = [
    { value: d, label: "jours" },
    { value: h, label: "heures" },
    { value: m, label: "minutes" },
    { value: s, label: "secondes" },
  ];

  return (
    <div className="flex gap-3 sm:gap-4 justify-center">
      {boxes.map((b) => (
        <div
          key={b.label}
          className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 min-w-[70px] text-center"
        >
          <p className="text-2xl sm:text-3xl font-bold font-mono text-white">
            {b.value}
          </p>
          <p className="text-xs text-white/70 mt-0.5">{b.label}</p>
        </div>
      ))}
    </div>
  );
}
