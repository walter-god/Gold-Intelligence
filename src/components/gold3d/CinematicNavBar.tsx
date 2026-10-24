import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Terminal, Layers, ArrowUpRight } from 'lucide-react';
import { MarketQuote } from '../../types';

interface CinematicNavBarProps {
  quote: MarketQuote | null;
  currentPrice: number;
  activeSection: string;
  onNavigateSection: (sectionId: string) => void;
  viewMode: '3D_EXHIBITION' | 'TRADING_TERMINAL';
  onToggleViewMode: (mode: '3D_EXHIBITION' | 'TRADING_TERMINAL') => void;
}

export const CinematicNavBar: React.FC<CinematicNavBarProps> = ({
  quote,
  currentPrice,
  activeSection,
  onNavigateSection,
  viewMode,
  onToggleViewMode,
}) => {
  const sections = [
    { id: 'asset', label: '01 ASSET' },
    { id: 'market', label: '02 MARKET' },
    { id: 'flow', label: '03 FLOW' },
    { id: 'structure', label: '04 STRUCTURE' },
    { id: 'intelligence', label: '05 INTELLIGENCE' },
    { id: 'execution', label: '06 EXECUTION' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#080808]/75 backdrop-blur-xl border-b border-[#1c1c1c] h-14 px-4 sm:px-8 flex items-center justify-between font-mono select-none">
      {/* Brand Identification */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-sm bg-[#E5C45A]/10 border border-[#E5C45A]/40 flex items-center justify-center text-[#E5C45A] shadow-[0_0_12px_rgba(229,196,90,0.2)]">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black tracking-[0.25em] text-[#F5F5F5] uppercase">AUREX</span>
            <span className="text-[10px] text-[#E5C45A] font-bold">//</span>
            <span className="text-[10px] text-[#858585] tracking-widest uppercase">GOLD INTELLIGENCE</span>
          </div>
        </div>
      </div>

      {/* Center Nav Sections (Editorial Chapter Links) */}
      <nav className="hidden md:flex items-center gap-1 lg:gap-2">
        {sections.map(sec => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => onNavigateSection(sec.id)}
              className={`px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer rounded-xs ${
                isActive
                  ? 'text-[#E5C45A] bg-[#E5C45A]/10 border-b-2 border-[#E5C45A]'
                  : 'text-[#858585] hover:text-[#d1d1d1]'
              }`}
            >
              {sec.label}
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Mode Toggle (3D Exhibition ⇄ Trading Terminal) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Market Quick Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-sm bg-[#111] border border-[#222] text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-[#858585] text-[10px] font-bold">XAUUSD:</span>
          <span className="text-[#E5C45A] font-bold font-mono">
            ${currentPrice > 0 ? currentPrice.toFixed(2) : '—'}
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-[#111111] p-0.5 rounded-sm border border-[#262626]">
          <button
            onClick={() => onToggleViewMode('3D_EXHIBITION')}
            className={`px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider cursor-pointer rounded-xs transition-all flex items-center gap-1.5 ${
              viewMode === '3D_EXHIBITION'
                ? 'bg-[#E5C45A] text-[#080808] font-black shadow-[0_0_10px_rgba(229,196,90,0.3)]'
                : 'text-[#858585] hover:text-[#eee]'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>3D EXHIBITION</span>
          </button>

          <button
            onClick={() => onToggleViewMode('TRADING_TERMINAL')}
            className={`px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider cursor-pointer rounded-xs transition-all flex items-center gap-1.5 ${
              viewMode === 'TRADING_TERMINAL'
                ? 'bg-[#E5C45A] text-[#080808] font-black shadow-[0_0_10px_rgba(229,196,90,0.3)]'
                : 'text-[#858585] hover:text-[#eee]'
            }`}
          >
            <Terminal className="w-3 h-3" />
            <span>TERMINAL</span>
          </button>
        </div>
      </div>
    </header>
  );
};
