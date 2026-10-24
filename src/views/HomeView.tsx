import React from 'react';
import { GlobalGoldVisualizer } from '../components/GlobalGoldVisualizer';
import { Candle, SignalScoreBreakdown, RiskProfile, Position } from '../types';
import { SESSIONS_DATA, UPCOMING_ECONOMIC_EVENTS } from '../services/marketData';
import { ArrowUpRight, ArrowDownRight, Zap, Shield, Globe, Clock, ChevronRight, Activity } from 'lucide-react';

interface HomeViewProps {
  currentPrice: number;
  candles: Candle[];
  signal: SignalScoreBreakdown;
  riskProfile: RiskProfile;
  algoArmed: boolean;
  onQuickExecute: (direction: 'BUY' | 'SELL') => void;
  onNavigate: (tab: any) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentPrice,
  candles,
  signal,
  riskProfile,
  algoArmed,
  onQuickExecute,
  onNavigate,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#080808]">
      {/* 1. Global Gold Flow Hero Visualization (Compact Reduced Size on Home) */}
      <section className="relative">
        <GlobalGoldVisualizer
          currentPrice={currentPrice}
          activeSession="LONDON"
          defaultSizeMode="COMPACT"
        />
      </section>

      {/* 2. Real-Time Signal & Execution Action Banner */}
      <section className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-4 md:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Signal Score Badge */}
          <div className="flex items-center gap-3">
            <div
              className={`px-3.5 py-2 rounded-sm font-mono flex flex-col items-center justify-center border ${
                signal.direction === 'BUY'
                  ? 'bg-[#22c55e]/10 border-[#22c55e]/40 text-[#22c55e]'
                  : signal.direction === 'SELL'
                  ? 'bg-[#ef4444]/10 border-[#ef4444]/40 text-[#ef4444]'
                  : 'bg-[#151515] border-[#242424] text-[#888]'
              }`}
            >
              <span className="text-[9px] font-semibold tracking-widest uppercase">Algo Signal</span>
              <span className="text-xl font-bold tracking-wider">{signal.direction}</span>
            </div>

            <div className="font-mono">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-[#F5F5F5]">{signal.total}</span>
                <span className="text-xs text-[#858585]">/ 100</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider border ${
                    signal.conviction === 'HIGH CONVICTION' || signal.conviction === 'STRONG'
                      ? 'bg-[#C9A227]/15 border-[#C9A227]/40 text-[#E5C45A]'
                      : 'bg-[#151515] border-[#242424] text-[#aaa]'
                  }`}
                >
                  {signal.conviction}
                </span>
              </div>
              <div className="text-[11px] text-[#858585] mt-0.5 uppercase tracking-wider">
                1M MOMENTUM • BULLISH STRUCTURE • LIQUIDITY SWEPT • LONDON
              </div>
            </div>
          </div>

          <div className="hidden xl:block h-10 w-px bg-[#242424]" />

          {/* Reasoning Highlights */}
          <div className="hidden xl:flex flex-col text-xs font-mono text-[#858585] gap-1">
            <div className="flex items-center gap-2 text-[#F5F5F5]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5C45A]" />
              Asian Range High (${currentPrice > 0 ? (currentPrice * 0.9985).toFixed(2) : '—'}) swept &amp; defended
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
              Multi-Timeframe alignment (5 of 6 frames bullish)
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <button
            onClick={() => onNavigate('ALGO')}
            className="px-3.5 py-2.5 rounded-sm bg-[#111111] hover:bg-[#181818] border border-[#242424] text-xs font-mono text-[#aaa] hover:text-[#fff] transition-colors cursor-pointer uppercase tracking-wider"
          >
            Inspect Algo
          </button>

          <button
            onClick={() => onQuickExecute('BUY')}
            disabled={riskProfile.isLocked}
            className={`px-5 py-2.5 rounded-sm font-mono font-bold text-xs tracking-widest uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              riskProfile.isLocked
                ? 'bg-[#151515] text-[#555] border border-[#242424] cursor-not-allowed'
                : 'bg-green-600/15 border border-green-600/40 text-green-400 hover:bg-green-600/25'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            BUY QUICK
          </button>

          <button
            onClick={() => onQuickExecute('SELL')}
            disabled={riskProfile.isLocked}
            className={`px-5 py-2.5 rounded-sm font-mono font-bold text-xs tracking-widest uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              riskProfile.isLocked
                ? 'bg-[#151515] text-[#555] border border-[#242424] cursor-not-allowed'
                : 'bg-red-600/15 border border-red-600/40 text-red-400 hover:bg-red-600/25'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            SELL QUICK
          </button>
        </div>
      </section>

      {/* 3. Three-Column Quantitative Operational Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Column A: Global Market Sessions */}
        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
              <span className="text-[10px] font-mono text-[#E5C45A] uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#C9A227]" />
                GLOBAL MARKET SESSIONS
              </span>
              <button
                onClick={() => onNavigate('MARKET')}
                className="text-[10px] font-mono text-[#858585] hover:text-[#E5C45A] uppercase tracking-wider flex items-center cursor-pointer"
              >
                VIEW <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-[#181818] mt-2">
              {SESSIONS_DATA.map(s => (
                <div key={s.name} className="py-2.5 flex items-center justify-between text-xs font-mono">
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-[#F5F5F5]">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          s.status === 'ACTIVE' ? 'bg-[#E5C45A] animate-pulse' : 'bg-[#555]'
                        }`}
                      />
                      {s.name}
                    </div>
                    <div className="text-[10px] text-[#666] uppercase">{s.city}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-[#F5F5F5] font-semibold tabular-nums">
                      ${s.openPrice.toFixed(1)} - ${s.highPrice.toFixed(1)}
                    </div>
                    <div className="text-[10px] text-[#858585]">
                      VOL: {s.relativeVolume}x • {s.volatility}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#242424] text-[10px] font-mono text-[#858585] flex justify-between items-center uppercase tracking-wider">
            <span>ACTIVE WINDOW:</span>
            <span className="text-[#E5C45A] font-semibold">LONDON / NY OVERLAP</span>
          </div>
        </div>

        {/* Column B: Performance Metrics */}
        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
              <span className="text-[10px] font-mono text-[#E5C45A] uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#C9A227]" />
                TODAY'S PERFORMANCE
              </span>
              <button
                onClick={() => onNavigate('ANALYTICS')}
                className="text-[10px] font-mono text-[#858585] hover:text-[#E5C45A] uppercase tracking-wider flex items-center cursor-pointer"
              >
                REPORT <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3 font-mono">
              <div className="p-2.5 rounded-sm bg-[#111111] border border-[#242424]">
                <div className="text-[9px] uppercase tracking-widest text-[#858585]">NET P/L TODAY</div>
                <div className="text-base font-bold text-[#22c55e] tabular-nums mt-0.5">
                  +$184.20
                </div>
                <div className="text-[10px] text-[#22c55e]">+1.42% Daily</div>
              </div>

              <div className="p-2.5 rounded-sm bg-[#111111] border border-[#242424]">
                <div className="text-[9px] uppercase tracking-widest text-[#858585]">WIN RATE</div>
                <div className="text-base font-bold text-[#F5F5F5] tabular-nums mt-0.5">
                  68.4%
                </div>
                <div className="text-[10px] text-[#858585]">17W / 7L</div>
              </div>

              <div className="p-2.5 rounded-sm bg-[#111111] border border-[#242424]">
                <div className="text-[9px] uppercase tracking-widest text-[#858585]">PROFIT FACTOR</div>
                <div className="text-base font-bold text-[#E5C45A] tabular-nums mt-0.5">
                  1.91
                </div>
                <div className="text-[10px] text-[#858585]">Target: &gt;1.60</div>
              </div>

              <div className="p-2.5 rounded-sm bg-[#111111] border border-[#242424]">
                <div className="text-[9px] uppercase tracking-widest text-[#858585]">MAX DRAWDOWN</div>
                <div className="text-base font-bold text-[#F5F5F5] tabular-nums mt-0.5">
                  2.3%
                </div>
                <div className="text-[10px] text-[#22c55e]">Below 5% Cap</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#242424] text-[10px] font-mono text-[#858585] flex justify-between items-center uppercase tracking-wider">
            <span>TOTAL EXECUTIONS:</span>
            <span className="text-[#F5F5F5] font-semibold">24 TRADES</span>
          </div>
        </div>

        {/* Column C: Risk & Economic Event Watch */}
        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
              <span className="text-[10px] font-mono text-[#E5C45A] uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#C9A227]" />
                RISK ENGINE & NEWS
              </span>
              <button
                onClick={() => onNavigate('SETTINGS')}
                className="text-[10px] font-mono text-[#858585] hover:text-[#E5C45A] uppercase tracking-wider flex items-center cursor-pointer"
              >
                LOCKS <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-3 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded-sm bg-[#111111] border border-[#242424]">
                <span className="text-[#858585] text-[11px] uppercase">RISK PER TRADE:</span>
                <span className="font-semibold text-[#F5F5F5] text-[11px]">0.50% ($622.90)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-sm bg-[#111111] border border-[#242424]">
                <span className="text-[#858585] text-[11px] uppercase">SPREAD LOCK:</span>
                <span className="font-semibold text-[#22c55e] text-[11px]">PASS (0.12 &lt; 0.25)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-sm bg-[#111111] border border-[#242424]">
                <span className="text-[#858585] text-[11px] uppercase">NEWS LOCK:</span>
                <span className="font-semibold text-[#E5C45A] text-[11px]">MONITORING (CPI in 45m)</span>
              </div>
            </div>
          </div>

          {/* Upcoming High Impact Event */}
          <div className="mt-4 pt-3 border-t border-[#242424] text-[10px] font-mono text-[#858585] flex items-center justify-between uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-[#ef4444] font-semibold">
              <Clock className="w-3 h-3" /> US CORE CPI (MoM)
            </span>
            <span className="text-[#F5F5F5]">14:30 UTC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
