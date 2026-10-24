import React, { useState } from 'react';
import { ChartCanvas } from '../components/ChartCanvas';
import { Candle, Timeframe, LiquidityLevel } from '../types';
import { LIQUIDITY_LEVELS } from '../services/marketData';
import { Activity, Radio, Layers, Filter } from 'lucide-react';

interface MarketViewProps {
  candles: Candle[];
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  currentPrice: number;
}

export const MarketView: React.FC<MarketViewProps> = ({
  candles,
  timeframe,
  onTimeframeChange,
  currentPrice,
}) => {
  // Simulated Depth of Market (DOM)
  const bids = [
    { price: currentPrice - 0.05, size: 24.5, total: 24.5 },
    { price: currentPrice - 0.10, size: 48.0, total: 72.5 },
    { price: currentPrice - 0.15, size: 36.2, total: 108.7 },
    { price: currentPrice - 0.20, size: 65.4, total: 174.1 },
    { price: currentPrice - 0.25, size: 82.0, total: 256.1 },
    { price: currentPrice - 0.30, size: 110.5, total: 366.6 },
  ];

  const asks = [
    { price: currentPrice + 0.05, size: 18.2, total: 18.2 },
    { price: currentPrice + 0.10, size: 35.8, total: 54.0 },
    { price: currentPrice + 0.15, size: 52.4, total: 106.4 },
    { price: currentPrice + 0.20, size: 74.1, total: 180.5 },
    { price: currentPrice + 0.25, size: 95.0, total: 275.5 },
    { price: currentPrice + 0.30, size: 124.8, total: 400.3 },
  ];

  // Recent simulated ticks
  const recentTicks = [
    { time: '14:32:41', price: currentPrice, size: '4.2', side: 'BUY' },
    { time: '14:32:39', price: currentPrice - 0.02, size: '1.5', side: 'SELL' },
    { time: '14:32:37', price: currentPrice + 0.01, size: '8.0', side: 'BUY' },
    { time: '14:32:35', price: currentPrice, size: '2.4', side: 'BUY' },
    { time: '14:32:33', price: currentPrice - 0.04, size: '6.1', side: 'SELL' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-5 flex flex-col gap-4 bg-[#080808]">
      {/* Top Multi-Timeframe Status Strip */}
      <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#858585] uppercase tracking-widest font-bold">
            MTF BIAS MATRIX:
          </span>
          <div className="flex items-center gap-1.5">
            {['1M', '5M', '15M', '30M', '1H', '4H', '1D'].map(tf => (
              <span key={tf} className="px-2 py-0.5 rounded-sm bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-bold tracking-wider">
                {tf}: BULLISH
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-[#858585] text-[11px] uppercase tracking-wider">
          <span>SPREAD: <strong className="text-[#F5F5F5]">0.12 PTS</strong></span>
          <span>ATR (14): <strong className="text-[#F5F5F5]">0.84 PTS</strong></span>
          <span>SESSION: <strong className="text-[#E5C45A]">LONDON (VOLATILE)</strong></span>
        </div>
      </div>

      {/* Main Terminal Layout: Chart + Orderbook/Tape Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 min-h-[560px]">
        {/* Chart Column (3/4 width on desktop) */}
        <div className="xl:col-span-3 h-[520px] md:h-[600px] xl:h-full">
          <ChartCanvas
            candles={candles}
            timeframe={timeframe}
            onTimeframeChange={onTimeframeChange}
            currentPrice={currentPrice}
          />
        </div>

        {/* Level 2 Market Depth & Liquidity Sidebar (1/4 width) */}
        <div className="xl:col-span-1 flex flex-col gap-4 font-mono text-xs">
          {/* Depth of Market (DOM) */}
          <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-3 flex flex-col">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#242424]">
              <span className="text-[10px] uppercase tracking-widest text-[#E5C45A] font-bold flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-[#C9A227]" />
                ORDERBOOK / DEPTH (L2)
              </span>
              <span className="text-[9px] text-[#22c55e] bg-green-500/10 border border-green-500/30 px-1.5 py-0.2 rounded-sm uppercase tracking-wider font-semibold">
                LIVE OTC
              </span>
            </div>

            {/* Asks (Sells) */}
            <div className="space-y-1 mb-1.5">
              <div className="grid grid-cols-3 text-[9px] text-[#666] pb-1 uppercase tracking-wider">
                <span>PRICE</span>
                <span className="text-right">LOTS</span>
                <span className="text-right">TOTAL</span>
              </div>
              {asks.slice(0, 4).reverse().map((ask, i) => (
                <div key={i} className="grid grid-cols-3 text-[11px] py-0.5 text-right relative">
                  <span className="text-left text-[#ef4444] font-semibold">{ask.price.toFixed(2)}</span>
                  <span className="text-[#bbb]">{ask.size.toFixed(1)}</span>
                  <span className="text-[#666]">{ask.total.toFixed(1)}</span>
                </div>
              ))}
            </div>

            {/* Mid Spread Divider */}
            <div className="py-1 my-1 px-2 rounded-sm bg-[#111111] border border-[#242424] flex items-center justify-between text-[11px]">
              <span className="text-[#858585] uppercase tracking-wider text-[10px]">MID SPREAD</span>
              <span className="font-bold text-[#E5C45A]">${currentPrice.toFixed(2)}</span>
              <span className="text-[10px] text-[#858585]">0.12 pts</span>
            </div>

            {/* Bids (Buys) */}
            <div className="space-y-1 mt-1.5">
              {bids.slice(0, 4).map((bid, i) => (
                <div key={i} className="grid grid-cols-3 text-[11px] py-0.5 text-right relative">
                  <span className="text-left text-[#22c55e] font-semibold">{bid.price.toFixed(2)}</span>
                  <span className="text-[#bbb]">{bid.size.toFixed(1)}</span>
                  <span className="text-[#666]">{bid.total.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Time & Sales (Live Tape) */}
          <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#242424]">
              <span className="text-[10px] uppercase tracking-widest text-[#E5C45A] font-bold flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-[#C9A227]" />
                TIME &amp; SALES
              </span>
              <span className="text-[10px] text-[#858585] uppercase tracking-wider">100oz / LOT</span>
            </div>

            <div className="space-y-1.5 divide-y divide-[#181818]">
              {recentTicks.map((tick, i) => (
                <div key={i} className="pt-1.5 flex items-center justify-between text-[11px]">
                  <span className="text-[#666] text-[10px]">{tick.time}</span>
                  <span
                    className={`font-semibold ${
                      tick.side === 'BUY' ? 'text-[#22c55e]' : 'text-[#ef4444]'
                    }`}
                  >
                    ${tick.price.toFixed(2)}
                  </span>
                  <span className="text-[#F5F5F5]">{tick.size} lots</span>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Liquidity Levels */}
          <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-3">
            <div className="text-[10px] uppercase tracking-widest text-[#E5C45A] font-bold pb-2 mb-2 border-b border-[#242424] flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-[#C9A227]" />
              SESSION KEY LEVELS
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#ef4444]">PDH (Prev Day High)</span>
                <span className="font-semibold text-[#eee]">$2,496.40</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#22c55e]">PDL (Prev Day Low)</span>
                <span className="font-semibold text-[#eee]">$2,468.20</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#E5C45A]">Asian Range High</span>
                <span className="font-semibold text-[#eee]">$2,482.40 (Swept)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#858585]">Asian Range Low</span>
                <span className="font-semibold text-[#eee]">$2,474.80</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
