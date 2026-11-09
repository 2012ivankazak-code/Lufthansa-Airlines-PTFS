import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPointerFine, setIsPointerFine] = useState(false);

  useEffect(() => {
    // Only activate custom cursor on fine pointer devices (desktop mouse, trackpad)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    setIsPointerFine(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsPointerFine(e.matches);
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Check if target is interactive
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest('a, button, input, select, textarea, [role="button"], label, .cursor-pointer')
        );
        setIsHovered(isInteractive);
      }
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (!isPointerFine || !isVisible) {
    return null;
  }

  // Squish calculation when pressed: "проминается"
  let transformScale = 'scale(1)';
  if (isPressed) {
    // Tactile squish: slightly flattened vertically and compressed
    transformScale = 'scale(0.68, 0.62)';
  } else if (isHovered) {
    // Subtle expand when hovering clickable targets
    transformScale = 'scale(1.25)';
  }

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: 'transform 0.04s linear',
      }}
      aria-hidden="true"
    >
      <div
        className="w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-white transition-all duration-150 ease-out flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.4)]"
        style={{
          transform: transformScale,
          backgroundColor: isPressed
            ? 'rgba(255, 255, 255, 0.45)'
            : isHovered
            ? 'rgba(255, 204, 0, 0.25)'
            : 'rgba(255, 255, 255, 0.12)',
          borderColor: isHovered ? '#FFCC00' : 'rgba(255, 255, 255, 0.95)',
        }}
      >
        {/* Subtle center core */}
        <div
          className={`rounded-full transition-all duration-150 ${
            isPressed
              ? 'w-2 h-2 bg-white'
              : isHovered
              ? 'w-1 h-1 bg-[#FFCC00]'
              : 'w-1 h-1 bg-white/80'
          }`}
        />
      </div>
    </div>
  );
};
