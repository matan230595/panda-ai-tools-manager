import React, { useRef, useEffect } from 'react';

export default function AnimatedBackground({ variant = 'default' }) {
  const layer1 = useRef(null);

  useEffect(() => {
    // דלג על פרלקסה במובייל — ביצועים
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (isMobile) return;

    let raf;
    const handleScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (layer1.current) layer1.current.style.transform = `translate3d(0, ${y * 0.15}px, 0)`;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => { window.removeEventListener('scroll', handleScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      {/* רקע כהה עמוק */}
      <div className="absolute inset-0 bg-[#0b0d12]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0d12] via-[#0e1118] to-[#12161f]" />

      {/* שכבת רשת — סטטית במובייל, פרלקסה בדסקטופ */}
      <div
        ref={layer1}
        className="absolute inset-0 opacity-[0.05] md:opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(52,152,219,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,152,219,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          willChange: 'transform',
        }}
      />

      {/* כדורי זוהר — מופחתים במובייל */}
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] rounded-full bg-cyan-500/5 blur-[120px] hidden md:block" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35rem] h-[35rem] rounded-full bg-blue-600/5 blur-[120px] hidden md:block" />
      </div>

      {/* קו אופק זוהר */}
      <div className="absolute bottom-[50%] inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
    </div>
  );
}