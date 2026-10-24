import React from 'react';
import { Bot, AlertOctagon, RefreshCw, AlertTriangle, Radio } from 'lucide-react';
import { MarketDataStatus, MarketDataSource } from '../types';

interface HeaderTopBarProps {
  currentPrice: number;
  bid: number;
  ask: number;
  spread: number;
  marketStatus: MarketDataStatus;
  marketSource: MarketDataSource;
  lastUpdatedText: string;
  latencyMs: number;
  dailyChange: number;
  dailyChangePercent: number;
  algoArmed: boolean;
  onToggleAlgo: () => void;
  onEmergencyKillSwitch: () => void;
  onOpenAiAnalyst: () => void;
  riskLocked: boolean;
  equity?: number;
  onReconnect?: () => void;
  onOpenCinematicExhibition?: () => void;
}

export const HeaderTopBar: React.FC<HeaderTopBarProps> = ({
  currentPrice,
  bid,
  ask,
  spread,
  marketStatus = 'LIVE',
  marketSource = 'GLOBAL MARKET DATA',
  lastUpdatedText,
  latencyMs,
  dailyChangePercent,
  algoArmed,
  onToggleAlgo,
  onEmergencyKillSwitch,
  onOpenAiAnalyst,
  equity = 124580.0,
  onReconnect,
  onOpenCinematicExhibition,
}) => {
  const isLive = marketStatus === 'LIVE';
  const isReconnecting = marketStatus === 'RECONNECTING';
  const isDelayed = marketStatus === 'DATA DELAYED';
  const isOffline = marketStatus === 'OFFLINE';
  const isConnecting = marketStatus === 'CONNECTING';

  return (
    <header className="w-full h-16 border-b border-[#242424] flex items-center justify-between px-3 md:px-6 bg-[#0a0a0a] z-30 select-none">
      {/* Brand & Market Status Feed */}
      <div className="flex items-center gap-2 md:gap-5">
        <div className="flex flex-col">
          <span className="text-sm md:text-base font-bold tracking-widest text-[#E5C45A] uppercase font-mono">
            AUREX <span className="text-[#858585] font-light hidden sm:inline">// INSTITUTIONAL DESK</span>
          </span>
          {/* Source Indicator: GLOBAL MARKET DATA vs BROKER EXECUTION DATA */}
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#858585]">
            <Radio className="w-2.5 h-2.5 text-[#C9A227]" />
            <span className="uppercase tracking-wider font-semibold text-[#aaa]">{marketSource}</span>
            <span className="text-[#555]">•</span>
            <span className="text-[#22c55e] tabular-nums">{latencyMs}ms</span>
          </div>
        </div>

        {/* Live Stream Status Pill */}
        <div
          onClick={onReconnect}
          title={isLive ? 'Connected to live XAUUSD stream' : 'Click to reconnect'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border font-mono text-[10px] tracking-wider uppercase cursor-pointer transition-colors ${
            isLive
              ? 'bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]'
              : isReconnecting
              ? 'bg-[#eab308]/10 border-[#eab308]/30 text-[#eab308]'
              : isDelayed
              ? 'bg-[#f97316]/10 border-[#f97316]/30 text-[#f97316]'
              : isConnecting
              ? 'bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#3b82f6]'
              : 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]'
          }`}
        >
          {isLive && (
            <>
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              <span className="font-bold">● LIVE</span>
            </>
          )}
          {isReconnecting && (
            <>
              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
              <span className="font-bold">↻ RECONNECTING</span>
            </>
          )}
          {isDelayed && (
            <>
              <AlertTriangle className="w-2.5 h-2.5 text-[#f97316]" />
              <span className="font-bold">⚠ DATA DELAYED</span>
            </>
          )}
          {isConnecting && (
            <>
              <span className="w-2 h-2 rounded-full bg-[#3b82f6] animate-ping" />
              <span className="font-bold">CONNECTING...</span>
            </>
          )}
          {isOffline && (
            <>
              <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
              <span className="font-bold">○ OFFLINE</span>
            </>
          )}
        </div>
      </div>

      {/* Center: Authoritative Live XAUUSD Market Quote (Bid / Ask / Spread / Timestamp) */}
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="flex flex-col items-center sm:items-end font-mono">
          {/* Header Row: Symbol + Updated Timestamp */}
          <div className="flex items-center gap-2 text-[10px] text-[#858585] uppercase tracking-wider">
            <span className="font-bold text-[#E5C45A]">XAUUSD SPOT</span>
            <span>•</span>
            <span className="text-[#a3a3a3] font-mono">{lastUpdatedText}</span>
          </div>

          {/* Bid / Ask Price Display */}
          {currentPrice > 0 ? (
            <div className="flex items-baseline gap-2.5 mt-0.5">
              {/* Bid */}
              <div className="flex items-baseline gap-1">
                <span className="text-[9px] text-[#858585] uppercase tracking-wider">BID</span>
                <span className="text-base sm:text-lg font-bold text-[#F5F5F5] tabular-nums tracking-tight">
                  {bid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <span className="text-[#444] text-xs font-light">/</span>

              {/* Ask */}
              <div className="flex items-baseline gap-1">
                <span className="text-[9px] text-[#858585] uppercase tracking-wider">ASK</span>
                <span className="text-base sm:text-lg font-bold text-[#F5F5F5] tabular-nums tracking-tight">
                  {ask.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Spread & 24h change */}
              <div className="hidden lg:flex items-center gap-1.5 ml-1 pl-2 border-l border-[#242424] text-[11px]">
                <span className="text-[#858585] text-[9px] uppercase">SPR:</span>
                <span className="text-[#E5C45A] font-semibold">{spread.toFixed(2)}</span>
                <span
                  className={`font-semibold tabular-nums ml-1 ${
                    dailyChangePercent >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'
                  }`}
                >
                  {dailyChangePercent >= 0 ? '+' : ''}
                  {dailyChangePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-base font-bold text-[#888] tracking-widest">— — —</span>
              <span className="text-[10px] text-[#f59e0b] uppercase font-semibold">⚠ CONNECTING TO MARKET</span>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-[#242424] hidden md:block" />

        {/* Account Equity */}
        <div className="hidden xl:flex flex-col items-end">
          <span className="text-[9px] text-[#858585] uppercase tracking-widest font-mono">
            Account Equity
          </span>
          <span className="font-mono text-base font-medium leading-none text-[#F5F5F5] tabular-nums mt-0.5">
            ${equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="h-8 w-px bg-[#242424] hidden xl:block" />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* 3D Gold Exhibition Switch */}
          {onOpenCinematicExhibition && (
            <button
              onClick={onOpenCinematicExhibition}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#E5C45A]/15 border border-[#E5C45A] text-xs font-mono font-bold text-[#E5C45A] hover:bg-[#E5C45A]/25 transition-all cursor-pointer shadow-[0_0_10px_rgba(229,196,90,0.25)]"
              title="Launch 3D Photorealistic Gold Bar Exhibition"
            >
              <span className="w-2 h-2 rounded-full bg-[#E5C45A] animate-pulse" />
              <span>3D GOLD</span>
            </button>
          )}

          {/* AI Analyst */}
          <button
            onClick={onOpenAiAnalyst}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-[#111111] border border-[#242424] hover:border-[#C9A227] text-xs font-mono text-[#e5e5e5] hover:text-[#E5C45A] transition-colors cursor-pointer"
            title="Open Institutional AI Market Analyst"
          >
            <Bot className="w-3.5 h-3.5 text-[#C9A227]" />
            <span className="hidden sm:inline">AI ANALYST</span>
          </button>

          {/* Master Algo Armed Switch */}
          <button
            onClick={onToggleAlgo}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border ${
              algoArmed
                ? 'bg-[#C9A227]/10 border-[#C9A227] text-[#E5C45A]'
                : 'bg-[#151515] border-[#242424] text-[#777] hover:text-[#aaa]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                algoArmed ? 'bg-[#E5C45A] animate-pulse' : 'bg-[#555]'
              }`}
            />
            <span className="hidden sm:inline">{algoArmed ? 'ALGO ARMED' : 'ALGO OFF'}</span>
          </button>

          {/* Emergency Kill Switch */}
          <button
            onClick={onEmergencyKillSwitch}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-[#ef4444]/10 border border-[#ef4444]/30 hover:bg-[#ef4444]/20 text-[#ef4444] text-xs font-mono font-bold tracking-wider transition-all cursor-pointer"
            title="Emergency Kill Switch"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">KILL SWITCH</span>
          </button>
        </div>

        {/* Desk Profile Badge */}
        <div className="w-8 h-8 rounded-full border border-[#C9A227] flex items-center justify-center text-[10px] font-bold text-[#E5C45A] font-mono shrink-0">
          JD
        </div>
      </div>
    </header>
  );
};
