import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const NetworkBackground = () => {
  // Smoothed pointer tracking for subtle parallax
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const x = useSpring(targetX, { stiffness: 40, damping: 12 });
  const y = useSpring(targetY, { stiffness: 40, damping: 12 });
  const xBottom = useTransform(x, (v) => v * -0.8);
  const yBottom = useTransform(y, (v) => v * -0.9);

  // Raw pointer tracking for the small ripple follower
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const cursorX = useSpring(rawX, { stiffness: 120, damping: 18 });
  const cursorY = useSpring(rawY, { stiffness: 120, damping: 18 });

  useEffect(() => {
    const handlePointerMove = (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 60; // larger range for visible parallax
      const ny = (e.clientY / window.innerHeight - 0.5) * 60;
      targetX.set(nx);
      targetY.set(ny);
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    // Initialize to center to avoid jump on first move
    if (typeof window !== 'undefined') {
      rawX.set(window.innerWidth / 2);
      rawY.set(window.innerHeight / 2);
    }
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [targetX, targetY, rawX, rawY]);

  return (
    <>
      {/* Background layer */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-50 pointer-events-none z-0">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-slate-100" />

      {/* Top-left wavy ribbon */}
      <motion.svg
        className="absolute -top-32 -left-24 w-[38rem] h-[38rem] text-orange-300/50"
        viewBox="0 0 600 600"
        animate={{ rotate: [0, 4, -4, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        style={{ x, y }}
      >
        <defs>
          <linearGradient id="waveTop" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(249,115,22,0.45)" />
            <stop offset="50%" stopColor="rgba(251,146,60,0.4)" />
            <stop offset="100%" stopColor="rgba(253,186,116,0.35)" />
          </linearGradient>
        </defs>
        <motion.path
          d="M80 250Q160 180 250 210T430 200Q520 220 560 160T600 60L600 0L0 0L0 300Q60 320 80 250Z"
          fill="url(#waveTop)"
          animate={{ d: [
            'M80 250Q160 180 250 210T430 200Q520 220 560 160T600 60L600 0L0 0L0 300Q60 320 80 250Z',
            'M60 260Q150 210 240 230T420 210Q510 200 560 150T590 70L600 0L0 0L0 280Q80 330 60 260Z',
            'M80 250Q160 180 250 210T430 200Q520 220 560 160T600 60L600 0L0 0L0 300Q60 320 80 250Z'
          ] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.svg>

      {/* Bottom-right wavy ribbon */}
      <motion.svg
        className="absolute -bottom-40 -right-32 w-[42rem] h-[42rem] text-orange-200/45"
        viewBox="0 0 600 600"
        animate={{ rotate: [0, -6, 6, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{ x: xBottom, y: yBottom }}
      >
        <defs>
          <linearGradient id="waveBottom" x1="0%" x2="100%" y1="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(254,215,170,0.4)" />
            <stop offset="50%" stopColor="rgba(248,180,107,0.42)" />
            <stop offset="100%" stopColor="rgba(248,113,113,0.35)" />
          </linearGradient>
        </defs>
        <motion.path
          d="M0 340Q70 360 140 330T300 320Q420 320 480 360T600 420L600 600L0 600Z"
          fill="url(#waveBottom)"
          animate={{ d: [
            'M0 340Q70 360 140 330T300 320Q420 320 480 360T600 420L600 600L0 600Z',
            'M0 360Q80 380 150 340T310 330Q430 320 480 350T600 410L600 600L0 600Z',
            'M0 340Q70 360 140 330T300 320Q420 320 480 360T600 420L600 600L0 600Z'
          ] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.svg>


      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }}
      />
      </div>

      {/* Cursor-following bubble - outside background container */}
      <motion.div
        className="fixed w-28 h-28 rounded-full pointer-events-none z-50"
        style={{ x: cursorX, y: cursorY }}
      >
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-orange-300/50 via-orange-200/40 to-transparent blur-2xl"
          animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.6, 0.85, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Frosted glass bubble */}
        <motion.div
          className="absolute inset-0 w-28 h-28 -translate-x-1/2 -translate-y-1/2 rounded-full backdrop-blur-lg bg-gradient-to-br from-white/40 via-orange-100/30 to-white/20 border border-white/60 shadow-xl shadow-orange-300/40"
          animate={{ scale: [0.85, 1.1, 0.85], opacity: [0.65, 0.9, 0.65] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Inner shine */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 via-transparent to-transparent" />
        </motion.div>

        {/* Ripple rings */}
        <motion.div
          className="absolute inset-0 w-28 h-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-orange-400/50"
          animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.9, 0, 0.9] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
        />
      </motion.div>
    </>
  );
};