import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Heart, Cpu, Layers, Sliders } from 'lucide-react';
import { StepDSALogo } from '../brand/StepDSALogo';
import { allModules } from '../../modules/registry';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const totalModules = allModules.length;
  const totalDomains = new Set(allModules.map((m) => m.category)).size;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl rounded-2xl bg-[#111827] border border-[#1F293D] shadow-2xl p-6 text-slate-200"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1F2937] transition-colors cursor-pointer"
              aria-label="Close About Modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official StepDSA Logo & Title */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="p-2 rounded-xl bg-[#0B0F19] border border-[#1F293D] shadow-inner">
                <StepDSALogo size="md" showText={false} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>About Step</span>
                  <span className="text-[#10B981] -ml-1.5">DSA</span>
                  <span>Platform</span>
                </h2>
                <span className="text-[11px] font-mono text-[#10B981]">
                  Version 2.0 · {totalModules} Interactive Modules · {totalDomains} CS Domains · Open Source (MIT)
                </span>
              </div>
            </div>

            {/* Body Content */}
            <div className="space-y-4 text-xs leading-relaxed text-slate-300">
              <p>
                <strong>StepDSA</strong> was engineered to rethink how students, software engineers, and competitive programmers master Data Structures & Algorithms. Instead of passive video animations or static textbook diagrams, StepDSA provides a deterministic, VisuAlgo-inspired interactive debugger.
              </p>

              <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1F293D] space-y-2.5">
                <h3 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" /> The Triad Architecture
                </h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <Cpu className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Deterministic Time-Travel Engine:</strong> Instant backward/forward scrubbing across every CPU line, pointer mutation, and recursive call stack frame with 0ms lag.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#06B6D4] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">5-Language Synchronized Dock:</strong> Live line highlighting across Pseudocode, Python, C++, TypeScript, and Java alongside a plain-English intuition note for every step.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sliders className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Edge-Case Sandbox & Local CLI:</strong> Stress-test algorithms with custom inputs or run <code className="text-emerald-300 font-mono">npx stepdsa run</code> locally on your own code.
                    </span>
                  </li>
                </ul>
              </div>

              <p>
                Built by <strong>Thanh Nguyen</strong> (
                <a
                  href="https://github.com/RealThanhNguyxn"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#10B981] hover:underline font-semibold"
                >
                  @RealThanhNguyxn
                </a>
                ) under the <strong>ThanhNguyxnOrg</strong> organization.
              </p>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-[#1F293D] flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> for computer science learners
              </span>
              <a
                href="https://github.com/ThanhNguyxnOrg/StepDSA"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981] hover:text-[#0B0F19] font-bold transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>GitHub Repo</span>
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
