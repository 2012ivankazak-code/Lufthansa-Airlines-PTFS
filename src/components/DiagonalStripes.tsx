import React, { useEffect, useState, useMemo } from 'react';

interface Stripe {
  id: number;
  baseOffset: number; // base Y percentage or pixels
  speed: number;
  width: string;
}

export const DiagonalStripes: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(900);

  // Generate diagonal stripes across the screen
  const stripes: Stripe[] = useMemo(() => {
    const list: Stripe[] = [];
    const count = 16;
    const spacing = 160; // pixels
    for (let i = -4; i < count + 6; i++) {
      list.push({
        id: i,
        baseOffset: i * spacing,
        speed: 0.28,
        width: i % 3 === 0 ? '2px' : '1px',
      });
    }
    return list;
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };
    handleResize();

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const centerY = viewportHeight / 2;
  const loopSpan = stripes.length * 160;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Ambient background dark gradients (no yellow decoration on left) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#071d66] via-[#030e33] to-[#020b27] opacity-90" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#05164D]/40 rounded-full blur-[140px] pointer-events-none" />

      {/* Diagonal stripes container with rotation and safe edge fade */}
      <div
        className="absolute inset-[-60%] w-[220%] h-[220%] pointer-events-none"
        style={{
          transform: 'rotate(-28deg)',
          transformOrigin: 'center center',
          maskImage: 'linear-gradient(to right, transparent 0%, transparent 4%, black 8%, black 92%, transparent 96%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 4%, black 8%, black 92%, transparent 96%, transparent 100%)',
        }}
      >
        {stripes.map((stripe) => {
          // Calculate relative position based on scroll with parallax
          const rawY = stripe.baseOffset - (scrollY * stripe.speed);
          // Modulo within screen wrap range
          const modY = ((rawY % loopSpan) + loopSpan) % loopSpan - 200;
          
          // Distance to viewport center in this rotated system
          const distToCenter = Math.abs(modY - centerY);
          const maxGlowDist = 140;
          const proximity = Math.max(0, 1 - distToCenter / maxGlowDist);
          const isCentered = proximity > 0.45;

          return (
            <div
              key={stripe.id}
              className="absolute left-0 right-0 transition-[opacity,box-shadow,background-color] duration-300 ease-out"
              style={{
                top: `${modY}px`,
                height: isCentered ? '3px' : stripe.width,
                backgroundColor: isCentered
                  ? `rgba(255, 204, 0, ${0.4 + proximity * 0.6})`
                  : 'rgba(255, 255, 255, 0.035)',
                boxShadow: isCentered
                  ? `0 0 ${15 + proximity * 30}px rgba(255, 204, 0, ${0.5 + proximity * 0.45}), 0 0 ${40 + proximity * 40}px rgba(5, 22, 77, 0.8)`
                  : 'none',
                opacity: isCentered ? 1 : 0.45,
                background: isCentered
                  ? `linear-gradient(90deg, rgba(255,204,0,0) 0%, rgba(255,204,0,${0.3 + proximity * 0.7}) 25%, #FFCC00 50%, rgba(255,204,0,${0.3 + proximity * 0.7}) 75%, rgba(255,204,0,0) 100%)`
                  : undefined,
              }}
            />
          );
        })}
      </div>

      {/* Subtle fine grid overlay for aviation HUD precision */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
};
