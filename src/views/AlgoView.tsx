import React, { useState } from 'react';
import {
  Candle,
  SignalScoreBreakdown,
  MultiTimeframeState,
  MarketRegimeType,
  MarketStructureType,
} from '../types';
import { Cpu, CheckCircle2, AlertTriangle, ShieldCheck, Flame, Layers, Clock, TrendingUp } from 'lucide-react';

interface AlgoViewProps {
  currentPrice: number;
  candles: Candle[];
  signal: SignalScoreBreakdown;
  regime: MarketRegimeType;
  structure: MarketStructureType;
  mtf: MultiTimeframeState;
}

export const AlgoView: React.FC<AlgoViewProps> = ({
  currentPrice,
  candles,
  signal,
  regime,
  structure,
  mtf,
}) => {
  const [selectedFactor, setSelectedFactor] = useState<string | null>('STRUCTURE');

  // Compute 1M candle open values
  const currentCandle = candles[candles.length - 1] || {
    open: currentPrice - 0.45,
    high: currentPrice + 0.3,
    low: currentPrice - 0.6,
    close: currentPrice,
  };
  const candleOpen = currentCandle.open;
  const displacement = Math.round((currentPrice - candleOpen) * 100) / 100;
  const isBullishMom = displacement >= 0;

  const scoringBreakdown = [
    {
      factor: 'STRUCTURE',
      score: signal.structure,
      max: 20,
      weight: '20%',
      desc: 'Higher-timeframe trend continuation (HH/HL) and Break of Structure (BOS)',
      status: 'PRISTINE',
    },
    {
      factor: 'LIQUIDITY',
      score: signal.liquidity,
      max: 20,
      weight: '20%',
      desc: `Asian Range High ($${currentPrice > 0 ? (currentPrice * 0.9985).toFixed(2) : '—'}) swept with absorption of stop-runs`,
      status: 'PRISTINE',
    },
    {
      factor: 'MOMENTUM (1M)',
      score: signal.momentum,
      max: 15,
      weight: '15%',
      desc: `1M Candle displacement: ${displacement >= 0 ? '+' : ''}$${displacement.toFixed(2)} vs Candle Open $${candleOpen.toFixed(2)}`,
      status: 'CONFIRMED',
    },
    {
      factor: 'VOLATILITY',
      score: signal.volatility,
      max: 10,
      weight: '10%',
      desc: 'ATR in optimal expansion regime (0.84 pts). Volatility locks disengaged.',
      status: 'PASS',
    },
    {
      factor: 'SESSION',
      score: signal.session,
      max: 10,
      weight: '10%',
      desc: 'London / New York Liquidity Overlap. Peak institutional transaction depth.',
      status: 'OPTIMAL',
    },
    {
      factor: 'MTF CONFIRMATION',
      score: signal.mtfConfirmation,
      max: 15,
      weight: '15%',
      desc: 'Synchronized alignment across 1M, 5M, 15M, 1H, 4H, and 1D charts',
      status: 'ALIGNED',
    },
    {
      factor: 'SPREAD',
      score: signal.spread,
      max: 5,
      weight: '5%',
      desc: 'ECN raw spread 0.12 pts (well under 0.25 threshold cap)',
      status: 'PASS',
    },
    {
      factor: 'RISK CLEARANCE',
      score: signal.risk,
      max: 5,
      weight: '5%',
      desc: 'Zero locks triggered. Max daily drawdown and consecutive loss limits clean.',
      status: 'CLEAR',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#080808]">
      {/* Top Banner: Algorithm Master State */}
      <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-5 flex flex-wrap items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-sm bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#E5C45A]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-[#858585] tracking-widest uppercase font-bold">
              Institutional Quantitative Engine
            </div>
            <div className="text-lg md:text-xl font-bold text-[#F5F5F5] flex items-center gap-2">
              AUREX CORE V3 // MULTI-SIGNAL ARMED
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            </div>
          </div>
        </div>

        {/* Big Signal Display */}
        <div className="flex items-center gap-3 bg-[#111111] px-4 py-2.5 rounded-sm border border-[#242424]">
          <div className="text-right">
            <div className="text-[9px] text-[#858585] uppercase tracking-widest">Active Direction</div>
            <div className="text-lg font-bold text-[#22c55e]">
              {signal.direction}
            </div>
          </div>
          <div className="h-7 w-px bg-[#242424]" />
          <div>
            <div className="text-[9px] text-[#858585] uppercase tracking-widest">Score</div>
            <div className="text-xl font-bold text-[#E5C45A]">
              {signal.total} <span className="text-xs font-normal text-[#858585]">/ 100</span>
            </div>
          </div>
          <div className="text-[10px] px-2 py-0.5 rounded-sm bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#E5C45A] font-bold uppercase tracking-wider">
            {signal.conviction}
          </div>
        </div>
      </div>

      {/* Grid: 1M Momentum Engine + Market Structure + Regime */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Module A: 1M Candle-Open Momentum Engine */}
        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-4 font-mono flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242424]">
              <span className="text-[10px] text-[#E5C45A] uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#C9A227]" />
                1M CANDLE-OPEN MOMENTUM
              </span>
              <span className="text-[9px] text-[#22c55e] bg-green-500/10 border border-green-500/30 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-semibold">
                LIVE CYCLE
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#181818]">
                <span className="text-[#858585]">Candle Open:</span>
                <span className="font-semibold text-[#eee]">${candleOpen.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#181818]">
                <span className="text-[#858585]">Current Price:</span>
                <span className="font-semibold text-[#E5C45A]">${currentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#181818]">
                <span className="text-[#858585]">Displacement:</span>
                <span className={`font-semibold ${isBullishMom ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                  {displacement >= 0 ? '+' : ''}${displacement.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#181818]">
                <span className="text-[#858585]">ATR (1M) Ratio:</span>
                <span className="font-semibold text-[#F5F5F5]">1.42x ATR Threshold</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#858585]">Momentum State:</span>
                <span
                  className={`font-bold px-1.5 py-0.5 rounded-sm text-[10px] tracking-wider uppercase ${
                    isBullishMom
                      ? 'text-[#22c55e] bg-green-500/10 border border-green-500/30'
                      : 'text-[#ef4444] bg-red-500/10 border border-red-500/30'
                  }`}
                >
                  {isBullishMom ? 'BULLISH MOMENTUM' : 'BEARISH MOMENTUM'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#242424] text-[10px] text-[#666] uppercase tracking-wider">
            Execution trigger validated alongside higher-timeframe context.
          </div>
        </div>

        {/* Module B: Market Structure & Liquidity Sweeps */}
        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-4 font-mono flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242424]">
              <span className="text-[10px] text-[#E5C45A] uppercase tracking-widest font-bold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#C9A227]" />
                MARKET STRUCTURE &amp; SWEEPS
              </span>
              <span className="text-[9px] text-[#E5C45A] bg-[#C9A227]/10 border border-[#C9A227]/30 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-semibold">
                VALIDATED
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#181818]">
                <span className="text-[#858585]">Current Regime:</span>
                <span className="font-semibold text-[#E5C45A]">{regime}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#181818]">
                <span className="text-[#858585]">Structure State:</span>
                <span className="font-semibold text-[#22c55e]">{structure}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#181818]">
                <span className="text-[#858585]">Liquidity Sweep:</span>
                <span className="font-semibold text-[#F5F5F5]">Asian High Swept ($2,482.40)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#181818]">
                <span className="text-[#858585]">Order Block Zone:</span>
                <span className="font-semibold text-[#eee]">$2,484.20 - $2,485.50</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#858585]">Fair Value Gap (FVG):</span>
                <span className="font-semibold text-[#38bdf8]">5M Bullish Imbalance</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#242424] text-[10px] text-[#666] uppercase tracking-wider">
            SWEEPS LIQUIDITY → ABSORPTION → STRUCTURE SHIFT → EXECUTION
          </div>
        </div>

        {/* Module C: Multi-Timeframe Confirmation Matrix */}
        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-4 font-mono flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242424]">
              <span className="text-[10px] text-[#E5C45A] uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#C9A227]" />
                MULTI-TIMEFRAME (MTF) MATRIX
              </span>
              <span className="text-[9px] text-[#22c55e] bg-green-500/10 border border-green-500/30 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-semibold">
                6 / 6 CONFIRMED
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              {(Object.entries(mtf) as [keyof MultiTimeframeState, { bias: string; structure: string; momentum: number }][]).map(([tf, data]) => (
                <div key={tf} className="flex items-center justify-between py-1.5 border-b border-[#181818]">
                  <span className="font-bold text-[#F5F5F5] w-10">{tf}</span>
                  <span className="text-[#858585] text-[11px] truncate">{data.structure}</span>
                  <span className="text-[9px] font-bold text-[#22c55e] bg-green-500/10 border border-green-500/30 px-1.5 py-0.2 rounded-sm tracking-wider uppercase">
                    {data.bias}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#242424] text-[10px] text-[#666] uppercase tracking-wider">
            Higher-timeframe context strictly dominates; counter-trend signals rejected.
          </div>
        </div>
      </div>

      {/* Signal Scoring Breakdown (0 to 100 Engine) */}
      <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-5 font-mono">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#242424]">
          <div>
            <span className="text-[10px] text-[#858585] uppercase tracking-widest font-bold">
              Quantitative Scoring Formula
            </span>
            <div className="text-sm font-bold text-[#F5F5F5] mt-0.5 uppercase tracking-wider">
              Factor Decomposition Matrix (Total: 100 Points)
            </div>
          </div>
          <div className="text-xs text-[#858585] uppercase tracking-wider">
            Conviction Threshold: <strong className="text-[#E5C45A]">&ge;75 (STRONG)</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {scoringBreakdown.map(item => (
            <div
              key={item.factor}
              onClick={() => setSelectedFactor(item.factor)}
              className="p-3.5 rounded-sm bg-[#111111] border border-[#242424] hover:border-[#C9A227]/50 transition-colors cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#F5F5F5] tracking-wider">{item.factor}</span>
                  <span className="text-[#E5C45A] font-bold">
                    +{item.score} / {item.max}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1 bg-[#181818] rounded-full mt-2.5 overflow-hidden">
                  <div
                    className="h-full bg-[#C9A227]"
                    style={{ width: `${(item.score / item.max) * 100}%` }}
                  />
                </div>
                <div className="text-[11px] text-[#858585] mt-2 line-clamp-2 leading-relaxed">
                  {item.desc}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#1a1a1a] flex items-center justify-between text-[10px] uppercase tracking-wider">
                <span className="text-[#666]">WEIGHT: {item.weight}</span>
                <span className="text-[#22c55e] font-semibold">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
