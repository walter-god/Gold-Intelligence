import React from 'react';
import { MarketDataStatus, MarketDataSource } from '../types';

interface FooterBarProps {
  algoArmed?: boolean;
  latency?: string;
  brokerName?: string;
  marketStatus?: MarketDataStatus;
  marketSource?: MarketDataSource;
  providerName?: string;
  lastUpdatedText?: string;
}

export const FooterBar: React.FC<FooterBarProps> = ({
  algoArmed = true,
  latency = '28ms',
  brokerName = 'MT5 RAW SPREAD',
  marketStatus = 'LIVE',
  marketSource = 'GLOBAL MARKET DATA',
  providerName = 'LBMA / Physical Gold Spot DMA',
  lastUpdatedText = 'Updated 15:21:03',
}) => {
  const isLive = marketStatus === 'LIVE';
  const isReconnecting = marketStatus === 'RECONNECTING';
  const isDelayed = marketStatus === 'DATA DELAYED';

  return (
    <footer className="h-8 border-t border-[#242424] bg-[#0a0a0a] flex items-center justify-between px-3 md:px-6 select-none z-30 shrink-0 font-mono text-[10px]">
      <div className="flex items-center gap-3 md:gap-6 uppercase tracking-wider">
        {/* Market Feed Status */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isLive
                ? 'bg-[#22c55e] animate-pulse'
                : isReconnecting
                ? 'bg-[#eab308] animate-ping'
                : isDelayed
                ? 'bg-[#f97316]'
                : 'bg-[#ef4444]'
            }`}
          />
          <span
            className={`font-semibold ${
              isLive
                ? 'text-[#22c55e]'
                : isReconnecting
                ? 'text-[#eab308]'
                : isDelayed
                ? 'text-[#f97316]'
                : 'text-[#ef4444]'
            }`}
          >
            {marketStatus}
          </span>
          <span className="text-[#444]">•</span>
          <span className="text-[#a3a3a3] lowercase tracking-normal">{lastUpdatedText}</span>
        </div>

        {/* Source */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="text-[#666]">Source:</span>
          <span className="text-[#E5C45A] font-semibold">{marketSource}</span>
        </div>

        {/* Provider */}
        <div className="hidden lg:flex items-center gap-1.5">
          <span className="text-[#666]">DMA Provider:</span>
          <span className="text-[#ccc]">{providerName}</span>
        </div>

        {/* Broker Connection */}
        <div className="hidden md:flex items-center gap-1.5">
          <span className="text-[#666]">Broker:</span>
          <span className="text-[#fff]">{brokerName}</span>
        </div>

        {/* Latency */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#666]">Latency:</span>
          <span className="text-[#22c55e] tabular-nums font-bold">{latency}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 uppercase tracking-widest text-[#777]">
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="text-[#555]">Algo:</span>
          <span className={algoArmed ? 'text-[#E5C45A] font-bold' : 'text-[#666]'}>
            {algoArmed ? 'ARMED' : 'STANDBY'}
          </span>
        </div>
        <span className="text-[#444] hidden sm:inline">|</span>
        <span className="text-[9px] text-[#555]">AUREX QUANTITATIVE CORE</span>
      </div>
    </footer>
  );
};
