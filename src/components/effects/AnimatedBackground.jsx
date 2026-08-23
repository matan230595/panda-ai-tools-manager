import React from 'react';

export default function AnimatedBackground({ variant = 'default' }) {
  if (variant === 'minimal') {
    return (
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-[30rem] h-[30rem] rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/10 blur-3xl animate-aurora" />
        <div className="absolute -bottom-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-pink-400/15 to-orange-300/10 blur-3xl animate-aurora" style={{ animationDelay: '-7s' }} />
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      {/* רשת נקודות עדינה */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(99 102 241) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* אורות אורורה זוהרים */}
      <div className="absolute top-[-10%] right-[-5%] w-[35rem] h-[35rem] rounded-full bg-gradient-to-br from-indigo-400/25 via-purple-400/15 to-transparent blur-[100px] animate-aurora" />
      <div className="absolute top-[30%] left-[-10%] w-[32rem] h-[32rem] rounded-full bg-gradient-to-br from-pink-400/20 via-rose-300/10 to-transparent blur-[100px] animate-aurora" style={{ animationDelay: '-5s' }} />
      <div className="absolute bottom-[-15%] right-[20%] w-[30rem] h-[30rem] rounded-full bg-gradient-to-br from-amber-300/15 via-orange-300/10 to-transparent blur-[100px] animate-aurora" style={{ animationDelay: '-12s' }} />
      <div className="absolute bottom-[10%] left-[10%] w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-emerald-400/12 via-cyan-300/8 to-transparent blur-[100px] animate-aurora" style={{ animationDelay: '-3s' }} />

      {/* גרדיאנט מסגרת עליון */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />
    </div>
  );
}