import React, { useRef, useState } from 'react';

/**
 * כרטיס סטטיסטיקה תלת-ממדי עם אפקט הטיה (tilt) לפי תנועת העכבר,
 * זוהר גרדיאנטי ואנימציית כניסה. עיצוב בלבד — ללא לוגיקה עסקית.
 */
export default function Stat3DCard({ title, value, icon, gradient, subtitle, delay = 0 }) {
  const ref = useRef(null);
  const [transform, setTransform] = useState('');
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width;
    const py = y / rect.height;
    const rotateY = (px - 0.5) * 14;
    const rotateX = (0.5 - py) * 14;
    setTransform(`perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`);
    setGlowPos({ x: px * 100, y: py * 100 });
  };

  const handleLeave = () => {
    setTransform('perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)');
    setGlowPos({ x: 50, y: 50 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        transform,
        transitionProperty: 'transform',
        transitionDuration: '150ms',
        transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)',
        animation: `fadeSlideIn 0.5s cubic-bezier(0.4,0,0.2,1) ${delay}ms both`,
      }}
      className="relative overflow-hidden rounded-2xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-4 shadow-lg will-change-transform group"
    >
      {/* זוהר עוקב עכבר */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(220px circle at ${glowPos.x}% ${glowPos.y}%, rgba(255,255,255,0.35), transparent 60%)`,
        }}
      />
      {/* פס גרדיאנט עליון */}
      <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${gradient}`} />

      <div
        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-3 shadow-md`}
        style={{ transform: 'translateZ(40px)' }}
      >
        {icon}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1" style={{ transform: 'translateZ(25px)' }}>
        {title}
      </p>
      <p
        className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-none"
        style={{ transform: 'translateZ(35px)' }}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5" style={{ transform: 'translateZ(20px)' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}