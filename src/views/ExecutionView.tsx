import React, { useState } from 'react';
import { RiskProfile, OrderTicket } from '../types';
import { RiskEngine } from '../services/algorithmEngine';
import { ArrowUpRight, ArrowDownRight, Shield, Settings2, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';

interface ExecutionViewProps {
  currentPrice: number;
  riskProfile: RiskProfile;
  onExecuteOrder: (ticket: OrderTicket) => void;
}

export const ExecutionView: React.FC<ExecutionViewProps> = ({
  currentPrice,
  riskProfile,
  onExecuteOrder,
}) => {
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [riskPercent, setRiskPercent] = useState<number>(0.5);
  const [slPoints, setSlPoints] = useState<number>(12.4);
  const [tpPoints, setTpPoints] = useState<number>(24.8);
  const [trailingStop, setTrailingStop] = useState<boolean>(true);
  const [candleCloseExit, setCandleCloseExit] = useState<boolean>(false);
  const [mode, setMode] = useState<'MANUAL' | 'SEMI-AUTO' | 'AUTO'>('MANUAL');
  const [oneClickTrading, setOneClickTrading] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Auto-calculated lot size from risk % and SL distance
  const calculatedLotSize = RiskEngine.calculateLotSize(riskProfile.equity, riskPercent, slPoints);

  // Prices
  const slPrice = direction === 'BUY' ? currentPrice - slPoints : currentPrice + slPoints;
  const tpPrice = direction === 'BUY' ? currentPrice + tpPoints : currentPrice - tpPoints;

  // Expected Loss & Gain (100 oz per lot: 1 pt = $100 on 1 lot)
  const estimatedLoss = Math.round(calculatedLotSize * slPoints * 100 * 100) / 100;
  const estimatedGain = Math.round(calculatedLotSize * tpPoints * 100 * 100) / 100;
  const requiredMargin = Math.round((currentPrice * calculatedLotSize * 100) / 100); // 1:100 leverage
  const riskRewardRatio = (tpPoints / slPoints).toFixed(2);

  const handleOrderSubmit = () => {
    if (riskProfile.isLocked) return;

    if (!oneClickTrading) {
      setShowConfirmModal(true);
    } else {
      finalizeExecution();
    }
  };

  const finalizeExecution = () => {
    onExecuteOrder({
      direction,
      sizeLots: calculatedLotSize,
      riskPercent,
      entryPrice: currentPrice,
      slPoints,
      tpPoints,
      mode,
      candleCloseExit,
    });
    setShowConfirmModal(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6 bg-[#080808]">
      {/* Risk Lock Alert if active */}
      {riskProfile.isLocked && (
        <div className="bg-[#ef4444]/15 border border-[#ef4444]/40 rounded-sm p-4 flex items-center justify-between font-mono text-xs text-[#ef4444]">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5" />
            <div>
              <span className="font-bold uppercase tracking-wider">EXECUTION LOCKED:</span>{' '}
              {riskProfile.lockedReason || 'Risk policy threshold violation active.'}
            </div>
          </div>
          <span className="text-[10px] bg-[#ef4444]/20 px-2 py-1 rounded-sm uppercase tracking-wider">
            Trading Blocked
          </span>
        </div>
      )}

      {/* Main Execution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
        {/* Left 2 Cols: Order Ticket Configuration */}
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#242424] rounded-sm p-5 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Header: Modes */}
            <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#858585] uppercase tracking-widest">
                  EXECUTION MODE
                </span>
                <span className="text-[10px] text-[#C9A227] px-2 py-0.5 rounded-sm bg-[#C9A227]/10 border border-[#C9A227]/30 font-bold uppercase tracking-wider">
                  {mode}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-[#111111] p-1 rounded-sm border border-[#242424]">
                {(['MANUAL', 'SEMI-AUTO', 'AUTO'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-3 py-1 rounded-sm text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                      mode === m
                        ? 'bg-[#C9A227] text-black font-bold'
                        : 'text-[#888] hover:text-[#eee]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Direction Selector: BUY vs SELL */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setDirection('BUY')}
                className={`py-3.5 rounded-sm border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  direction === 'BUY'
                    ? 'bg-green-600/15 border-green-500 text-green-400'
                    : 'bg-[#111111] border-[#242424] text-[#888] hover:border-[#333]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-sm md:text-base font-bold uppercase tracking-wider">
                  <ArrowUpRight className="w-4 h-4" /> BUY XAUUSD
                </div>
                <div className="text-xs opacity-90 tabular-nums">ASK: ${(currentPrice + 0.06).toFixed(2)}</div>
              </button>

              <button
                onClick={() => setDirection('SELL')}
                className={`py-3.5 rounded-sm border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  direction === 'SELL'
                    ? 'bg-red-600/15 border-red-500 text-red-400'
                    : 'bg-[#111111] border-[#242424] text-[#888] hover:border-[#333]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-sm md:text-base font-bold uppercase tracking-wider">
                  <ArrowDownRight className="w-4 h-4" /> SELL XAUUSD
                </div>
                <div className="text-xs opacity-90 tabular-nums">BID: ${(currentPrice - 0.06).toFixed(2)}</div>
              </button>
            </div>

            {/* Risk % & Lot Sizing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#111111] p-3 rounded-sm border border-[#242424] space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[10px] text-[#858585] uppercase tracking-widest">Risk Allocation</span>
                  <span className="text-[#E5C45A] font-bold">{riskPercent.toFixed(2)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  {[0.25, 0.5, 0.75, 1.0].map(val => (
                    <button
                      key={val}
                      onClick={() => setRiskPercent(val)}
                      className={`flex-1 py-1 rounded-sm text-xs border cursor-pointer ${
                        riskPercent === val
                          ? 'bg-[#C9A227] text-black font-bold border-[#C9A227]'
                          : 'bg-[#151515] border-[#242424] text-[#888] hover:text-[#eee]'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
                <div className="text-[9px] text-[#666] uppercase tracking-wider">
                  Max Allowed Risk: {riskProfile.riskPerTradePercent}% per rule.
                </div>
              </div>

              {/* Calculated Lots */}
              <div className="bg-[#111111] p-3 rounded-sm border border-[#242424] space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[10px] text-[#858585] uppercase tracking-widest">Computed Quantity</span>
                  <span className="text-[#22c55e] font-bold">{calculatedLotSize} LOTS</span>
                </div>
                <div className="text-xs text-[#F5F5F5] font-semibold">
                  {(calculatedLotSize * 100).toFixed(0)} TROY OUNCES
                </div>
                <div className="text-[9px] text-[#666] uppercase tracking-wider">
                  Constrained to ${estimatedLoss.toFixed(2)} risk.
                </div>
              </div>
            </div>

            {/* Stop Loss & Take Profit Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* SL */}
              <div className="bg-[#111111] p-3 rounded-sm border border-[#242424] space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[10px] text-[#ef4444] font-semibold uppercase tracking-widest">STOP LOSS (PTS)</span>
                  <span className="text-[#eee] font-bold">{slPoints.toFixed(1)} PTS</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="0.5"
                    value={slPoints}
                    onChange={e => setSlPoints(parseFloat(e.target.value))}
                    className="w-full accent-[#ef4444]"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#858585]">
                  <span>Trigger Price:</span>
                  <span className="text-[#ef4444] font-bold">${slPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* TP */}
              <div className="bg-[#111111] p-3 rounded-sm border border-[#242424] space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[10px] text-[#22c55e] font-semibold uppercase tracking-widest">TAKE PROFIT (PTS)</span>
                  <span className="text-[#eee] font-bold">{tpPoints.toFixed(1)} PTS</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="1"
                    value={tpPoints}
                    onChange={e => setTpPoints(parseFloat(e.target.value))}
                    className="w-full accent-[#22c55e]"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#858585]">
                  <span>Target Price:</span>
                  <span className="text-[#22c55e] font-bold">${tpPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Advanced Exit Options */}
            <div className="p-3 rounded-sm bg-[#111111] border border-[#242424] flex flex-wrap items-center justify-between gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trailingStop}
                  onChange={e => setTrailingStop(e.target.checked)}
                  className="accent-[#C9A227]"
                />
                <span className="text-[#eee]">Dynamic Trailing Stop (1.5x ATR)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={candleCloseExit}
                  onChange={e => setCandleCloseExit(e.target.checked)}
                  className="accent-[#C9A227]"
                />
                <span className="text-[#eee]">1M Candle Close Exit</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={oneClickTrading}
                  onChange={e => setOneClickTrading(e.target.checked)}
                  className="accent-[#C9A227]"
                />
                <span className="text-[#E5C45A] font-semibold">One-Click Execution</span>
              </label>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="mt-6 pt-4 border-t border-[#242424]">
            <button
              onClick={handleOrderSubmit}
              disabled={riskProfile.isLocked}
              className={`w-full py-4 rounded-sm font-mono text-xs md:text-sm font-bold tracking-widest uppercase transition-all cursor-pointer ${
                riskProfile.isLocked
                  ? 'bg-[#151515] text-[#555] border border-[#242424] cursor-not-allowed'
                  : 'bg-[#C9A227] hover:bg-[#E5C45A] text-black'
              }`}
            >
              CONFIRM &amp; EXECUTE {direction} ({calculatedLotSize} LOTS)
            </button>
          </div>
        </div>

        {/* Right 1 Col: Institutional Execution Clearance & Pre-Trade Preview */}
        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-3 border-b border-[#242424] flex items-center justify-between">
              <span className="text-[10px] text-[#858585] uppercase tracking-widest font-bold">
                PRE-TRADE CLEARANCE
              </span>
              <span className="text-[10px] text-[#22c55e] flex items-center gap-1 uppercase tracking-wider font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#181818]">
                <span className="text-[#858585]">Risk / Reward Ratio:</span>
                <span className="font-bold text-[#E5C45A]">1 : {riskRewardRatio}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#181818]">
                <span className="text-[#858585]">Estimated Loss:</span>
                <span className="font-bold text-[#ef4444]">-${estimatedLoss.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#181818]">
                <span className="text-[#858585]">Estimated Gain:</span>
                <span className="font-bold text-[#22c55e]">+$${estimatedGain.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#181818]">
                <span className="text-[#858585]">Margin Required:</span>
                <span className="font-semibold text-[#eee]">${requiredMargin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#181818]">
                <span className="text-[#858585]">Raw ECN Spread:</span>
                <span className="font-semibold text-[#eee]">0.12 pts ($12/lot)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#181818]">
                <span className="text-[#858585]">Slippage Tolerance:</span>
                <span className="font-semibold text-[#eee]">0.08 pts max</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#858585]">Bridge Latency:</span>
                <span className="font-semibold text-[#22c55e]">42ms (MT5 Direct)</span>
              </div>
            </div>
          </div>

          {/* Institutional Trade Guard Verification Box */}
          <div className="mt-6 p-4 border-l-2 border-[#C9A227] bg-[#111111] rounded-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#E5C45A] font-bold uppercase tracking-widest">
                Institutional Risk Guard
              </span>
              <span className="px-2 py-0.5 bg-green-900/30 text-green-500 border border-green-500/30 rounded-[2px] text-[8px] tracking-widest font-bold uppercase">
                Armed
              </span>
            </div>
            <p className="text-[10px] text-[#858585] leading-relaxed">
              All 8 risk locks verified. Order will be routed directly through FIX 4.4 bridge with sub-millisecond execution.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal if One-Click is disabled */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono">
          <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
              <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider">CONFIRM EXECUTION TICKET</span>
              <span className="text-[9px] text-[#C9A227] px-2 py-0.5 rounded-sm bg-[#C9A227]/10 uppercase tracking-widest font-bold border border-[#C9A227]/30">
                SAFETY VALIDATION
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#858585]">Symbol:</span>
                <span className="font-bold text-[#F5F5F5]">XAUUSD (GOLD SPOT)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#858585]">Action:</span>
                <span className={`font-bold ${direction === 'BUY' ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                  {direction} {calculatedLotSize} LOTS
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#858585]">Entry Reference:</span>
                <span className="font-bold text-[#F5F5F5]">${currentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#858585]">Stop Loss:</span>
                <span className="font-bold text-[#ef4444]">${slPrice.toFixed(2)} (-${estimatedLoss})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#858585]">Take Profit:</span>
                <span className="font-bold text-[#22c55e]">${tpPrice.toFixed(2)} (+${estimatedGain})</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-[#242424]">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-sm bg-[#151515] hover:bg-[#202020] border border-[#242424] text-xs text-[#aaa] font-bold uppercase tracking-wider cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={finalizeExecution}
                className={`flex-1 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider cursor-pointer ${
                  direction === 'BUY' ? 'bg-green-600 hover:bg-green-500 text-black' : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                CONFIRM &amp; SEND
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
