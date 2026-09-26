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
    sm: { width: 32, height: 32, rx: 'rounded-lg' },
    md: { width: 40, height: 40, rx: 'rounded-xl' },
    lg: { width: 56, height: 56, rx: 'rounded-2xl' },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Dynamic Emblem */}
      <div
        className={`relative flex items-center justify-center p-1 bg-[#111827] border border-[#1F293D] shadow-lg shadow-[#10B981]/10 ${iconDimensions.rx} group-hover:border-[#10B981]/50 transition-all duration-300`}
        style={{ width: iconDimensions.width, height: iconDimensions.height }}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="logoBarG1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="logoBarG2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#0891B2" />
            </linearGradient>
            <linearGradient id="logoBarG3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
            <filter id="logoNodeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Stepped Algorithm Bars */}
          <rect x="8" y="34" width="12" height="22" rx="3" fill="url(#logoBarG1)" />
          <rect x="26" y="22" width="12" height="34" rx="3" fill="url(#logoBarG2)" />
          <rect x="44" y="10" width="12" height="46" rx="3" fill="url(#logoBarG3)" />

          {/* Time-Travel Interpolation Path */}
          <path
            d="M14 34 C 20 20, 32 18, 50 10"
            stroke="#F8FAFC"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="2 3"
            opacity="0.85"
          />

          {/* Stepper Nodes */}
          <circle cx="14" cy="34" r="3.5" fill="#FFFFFF" filter="url(#logoNodeGlow)" />
          <circle cx="32" cy="22" r="3.5" fill="#FFFFFF" filter="url(#logoNodeGlow)" />
          <circle
            cx="50"
            cy="10"
            r="4.5"
            fill="#38BDF8"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            filter="url(#logoNodeGlow)"
          />

          {/* Micro forward arrow */}
          <path
            d="M48 24 L56 24 L56 16"
            fill="none"
            stroke="#FDE047"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
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
