import React from 'react';

export default function AnimatedBackground({ variant = 'default' }) {
  if (variant === 'minimal') {
    return (
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-[30rem] h-[30rem] rounded-full bg-gradient-to-br from-indigo-400/10 to-purple-400/5 blur-3xl" />
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      {/* רשת נקודות עדינה - סטטית */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.015]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(99 102 241) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* כתם רקע אחד סטטי במקום 4 אנימציות כבדות */}
      <div className="absolute -top-20 -right-20 w-[40rem] h-[40rem] rounded-full bg-gradient-to-br from-indigo-400/8 via-purple-400/5 to-transparent blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-[35rem] h-[35rem] rounded-full bg-gradient-to-br from-emerald-400/6 to-transparent blur-3xl" />
    </div>
  );
}