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
    sm: { width: 28, height: 28 },
    md: { width: 36, height: 36 },
    lg: { width: 48, height: 48 },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Monolithic Stepped Glyph: 3 Ascending Angular Pillars + Precision Negative Space */}
      <div
        className="relative flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shrink-0"
        style={{ width: iconDimensions.width, height: iconDimensions.height }}
      >
        <svg
          viewBox="0 0 54 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            <linearGradient id="glyphP1" x1="0" y1="30" x2="0" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="glyphP2" x1="18" y1="16" x2="18" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0891B2" />
            </linearGradient>
            <linearGradient id="glyphP3" x1="36" y1="2" x2="54" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>

          {/* Stepped Angular Pillars */}
          <path d="M 0 30 L 14 30 L 14 56 L 0 56 Z" fill="url(#glyphP1)" />
          <path d="M 18 16 L 32 16 L 32 56 L 18 56 Z" fill="url(#glyphP2)" />
          <path d="M 36 2 L 54 20 L 54 56 L 36 56 Z" fill="url(#glyphP3)" />

          {/* Diagonal Laser Cut / Trajectory */}
          <path
            d="M 0 28 L 18 14 L 36 0 L 54 18"
            stroke="#0B0F19"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 0 28 L 18 14 L 36 0 L 54 18"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left select-none">
          <span className="font-extrabold text-base sm:text-lg tracking-tight text-white leading-none">
            Step<span className="text-[#10B981]">DSA</span>
          </span>
          <span className="text-[9px] text-[#9CA3AF] mt-0.5 font-mono tracking-wider font-semibold">
            TIME-TRAVEL ENGINE
          </span>
        </div>
      )}
    </div>
  );
};
