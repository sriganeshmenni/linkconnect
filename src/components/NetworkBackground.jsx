import React from 'react';
import { motion } from 'framer-motion';

export const NetworkBackground = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-50">
      
      {/* 1. Base Gradient Layer - Clean and Bright */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-slate-100" />

      {/* 2. Abstract Geometric Accents (The "Professional" touch) */}
      {/* Top Right - Soft Orange Glow */}
      <motion.div
        className="absolute -top-[10%] -right-[5%] w-[40rem] h-[40rem] rounded-full bg-gradient-to-br from-orange-200/40 to-amber-100/40 blur-[100px]"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Bottom Left - Subtle Cool Tone for Contrast */}
      <motion.div
        className="absolute -bottom-[10%] -left-[10%] w-[45rem] h-[45rem] rounded-full bg-gradient-to-tr from-slate-200/50 to-orange-100/30 blur-[120px]"
        animate={{
          scale: [1, 1.2, 1],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* 3. Subtle Grid Pattern Overlay (Optional, adds texture like Linear/Vercel) */}
      <div 
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }}
      />

    </div>
  );
};