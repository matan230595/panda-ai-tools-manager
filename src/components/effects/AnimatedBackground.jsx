import React from 'react';

export default function AnimatedBackground({ variant = 'default' }) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      {/* רקע כהה עמוק */}
      <div className="absolute inset-0 bg-[#0b0d12]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0d12] via-[#0e1118] to-[#12161f]" />

      {/* רשת איזומטרית תלת-מימדית */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(52,152,219,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,152,219,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* פרספקטיבה אופקית — רשת מתכנסת */}
      <div
        className="absolute bottom-0 inset-x-0 h-[50vh] opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          transform: 'perspective(400px) rotateX(60deg)',
          transformOrigin: 'bottom',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1), transparent 80%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1), transparent 80%)',
        }}
      />

      {/* זוהר אמרלד עדין */}
      <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] rounded-full bg-cyan-500/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[35rem] h-[35rem] rounded-full bg-blue-600/5 blur-[120px]" />

      {/* קו אופק זוהר */}
      <div className="absolute bottom-[50%] inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
    </div>
  );
}