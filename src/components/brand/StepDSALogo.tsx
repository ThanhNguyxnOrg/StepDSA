import React from 'react';

interface StepDSALogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const StepDSALogo: React.FC<StepDSALogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: { width: 34, height: 34 },
    md: { width: 44, height: 44 },
    lg: { width: 64, height: 64 },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brandkit Emblem: Stepped Pillars + Forward Chevron + Connected Graph Nodes */}
      <div
        className="relative flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform duration-300 shrink-0"
        style={{ width: iconDimensions.width, height: iconDimensions.height }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id="compBar1" x1="0" y1="52" x2="0" y2="96" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="compBar2" x1="0" y1="32" x2="0" y2="96" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#0D9488" />
            </linearGradient>
            <linearGradient id="compChev" x1="50" y1="18" x2="86" y2="82" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="compNodes" x1="45" y1="4" x2="95" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <filter id="nodeGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Stepped Pillar 1 (Short - Cyber Emerald) */}
          <rect x="4" y="52" width="16" height="44" rx="5" fill="url(#compBar1)" />

          {/* Stepped Pillar 2 (Medium - Vibrant Teal) */}
          <rect x="26" y="32" width="16" height="64" rx="5" fill="url(#compBar2)" />

          {/* Forward Execution Chevron (Step / Time-Travel - Electric Cyan) */}
          <path
            d="M 50 18 L 76 50 L 50 82"
            stroke="url(#compChev)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Connected Graph/Tree Vertices (Floating Algorithmic Network) */}
          <path
            d="M 48 20 L 70 14 L 92 6"
            stroke="url(#compNodes)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <circle cx="48" cy="20" r="5.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.8" filter="url(#nodeGlowFilter)" />
          <circle cx="70" cy="14" r="6" fill="#06B6D4" stroke="#FFFFFF" strokeWidth="1.8" filter="url(#nodeGlowFilter)" />
          <circle cx="92" cy="6" r="6.5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2" filter="url(#nodeGlowFilter)" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left select-none">
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Step<span className="text-[#10B981]">DSA</span>
          </span>
          <span className="text-[10px] text-[#9CA3AF] -mt-1 font-mono tracking-wider font-semibold">
            TIME-TRAVEL ENGINE
          </span>
        </div>
      )}
    </div>
  );
};
