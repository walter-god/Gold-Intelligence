import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  RotateCcw,
  Zap,
  TrendingUp,
  TrendingDown,
  Shield,
  Activity,
  Globe,
  Radio,
  Maximize2,
} from 'lucide-react';
import { EXPLODED_LAYERS, ExplodedLayerData } from './GoldBarObject';
import { MarketQuote } from '../../types';

interface GoldMarketHUDProps {
  quote: MarketQuote | null;
  currentPrice: number;
  bid: number;
  ask: number;
  spread: number;
  isExploded: boolean;
  onToggleExploded: () => void;
  selectedLayerId: string | null;
  onSelectLayer: (layerId: string | null) => void;
  onOpenTradingTerminal: () => void;
  onQuickTrade: (direction: 'BUY' | 'SELL') => void;
}

export const GoldMarketHUD: React.FC<GoldMarketHUDProps> = ({
  quote,
  currentPrice,
  bid,
  ask,
  spread,
  isExploded,
  onToggleExploded,
  selectedLayerId,
  onSelectLayer,
  onOpenTradingTerminal,
  onQuickTrade,
}) => {
  const [activePin, setActivePin] = useState<string | null>(null);

  const isBullish = (quote?.change24h || 0) >= 0;
  const formattedPrice = currentPrice > 0 ? currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
  const changePercentText = quote ? `${isBullish ? '+' : ''}${quote.changePercent24h.toFixed(2)}%` : '—';
  const changePointsText = quote ? `${isBullish ? '+' : ''}${quote.change24h.toFixed(2)} pts` : '—';

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 sm:p-8 md:p-10 font-mono select-none">
      {/* 1. Top Bar: Asset Classification & State */}
      <div className="flex items-start justify-between w-full">
        {/* Top Left: Editorial Asset Specs */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#E5C45A] font-bold tracking-[0.25em] uppercase">
              PHYSICAL BULLION TO SPOT
            </span>
            <span className="px-1.5 py-0.5 rounded-xs bg-[#C9A227]/15 border border-[#C9A227]/40 text-[#E5C45A] text-[9px] font-bold tracking-wider">
              LBMA 999.9
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F5F5] uppercase">
            XAUUSD <span className="text-[#858585] font-normal text-sm sm:text-base">/ GOLD SPOT</span>
          </h1>
          <div className="text-[11px] text-[#737373] tracking-wider hidden sm:block">
            400 OZ GOOD DELIVERY EQUIVALENT • LONDON OTC DIRECT MARKET ACCESS
          </div>
        </motion.div>

        {/* Top Right: Status & Interactive Controls */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex items-center gap-2 sm:gap-3 pointer-events-auto"
        >
          {/* Exploded View Toggle Button */}
          <button
            onClick={onToggleExploded}
            className={`px-3 sm:px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider cursor-pointer border transition-all flex items-center gap-2 ${
              isExploded
                ? 'bg-[#E5C45A] text-[#080808] border-[#E5C45A] shadow-[0_0_16px_rgba(229,196,90,0.4)]'
                : 'bg-[#111111]/80 backdrop-blur-md border-[#2b2b2b] text-[#E5C45A] hover:border-[#E5C45A]/50 hover:bg-[#181818]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isExploded ? 'ASSEMBLE INGOT' : 'EXPLODED VIEW'}</span>
          </button>

          {/* Quick Terminal Launch Button */}
          <button
            onClick={onOpenTradingTerminal}
            className="px-3 sm:px-4 py-2 rounded-sm bg-[#111111]/80 backdrop-blur-md border border-[#2b2b2b] hover:border-[#383838] text-xs font-bold text-[#F5F5F5] uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#E5C45A]" />
            <span className="hidden sm:inline">INSTITUTIONAL</span> TERMINAL
          </button>
        </motion.div>
      </div>

      {/* 2. Middle Layer: Flanking Telemetry Pins (Left & Right of Gold Bar) */}
      <div className="flex-1 flex items-center justify-between w-full pointer-events-none py-6">
        {/* Left Side: Macro & Fundamental Gold Flow */}
        <div className="hidden lg:flex flex-col gap-5 max-w-xs pointer-events-auto">
          {/* Pin 1: Spot Discovery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="group p-3 rounded-sm bg-[#0d0d0d]/70 backdrop-blur-md border border-[#222] hover:border-[#E5C45A]/40 transition-all cursor-default"
          >
            <div className="flex items-center justify-between text-[10px] text-[#858585] uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-[#E5C45A]" />
                BENCHMARK SPOT
              </span>
              <span className="text-[#22c55e]">DMA FEED</span>
            </div>
            <div className="text-sm font-bold text-[#F5F5F5] mt-1">LBMA LONDON OTC</div>
            <div className="text-[10px] text-[#737373] mt-0.5">
              Refined Swiss Bars • T+2 Interbank Clearing
            </div>
          </motion.div>

          {/* Pin 2: Volatility & Regime */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="group p-3 rounded-sm bg-[#0d0d0d]/70 backdrop-blur-md border border-[#222] hover:border-[#E5C45A]/40 transition-all cursor-default"
          >
            <div className="flex items-center justify-between text-[10px] text-[#858585] uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-[#E5C45A]" />
                ATR VOLATILITY
              </span>
              <span className="text-[#E5C45A]">NORMAL</span>
            </div>
            <div className="text-sm font-bold text-[#F5F5F5] mt-1">8.85 PTS / 15M</div>
            <div className="text-[10px] text-[#737373] mt-0.5">
              Current Session: London / NY Overlap
            </div>
          </motion.div>
        </div>

        {/* Center Overlay if Exploded View is Active: Exploded Layers Interactive Selector */}
        <AnimatePresence>
          {isExploded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="pointer-events-auto bg-[#0a0a0a]/85 backdrop-blur-xl border border-[#262626] rounded-sm p-4 w-full max-w-sm mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-2.5"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#222]">
                <div className="text-[10px] text-[#E5C45A] font-bold tracking-widest uppercase flex items-center gap-1.5">
                  <Layers className="w-3 h-3" />
                  ARCHITECTURAL DECONSTRUCTION
                </div>
                <span className="text-[9px] text-[#737373]">5 TIERS</span>
              </div>

              <div className="space-y-1.5">
                {EXPLODED_LAYERS.map((layer, idx) => {
                  const isSelected = selectedLayerId === layer.id;
                  return (
                    <button
                      key={layer.id}
                      onClick={() => onSelectLayer(isSelected ? null : layer.id)}
                      className={`w-full text-left p-2 rounded-xs border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#E5C45A]/15 border-[#E5C45A] text-[#F5F5F5]'
                          : 'bg-[#121212]/70 border-[#222] text-[#999] hover:text-[#eee] hover:border-[#333]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                          <span className="text-[10px] text-[#E5C45A] font-mono">0{idx + 1}</span>
                          <span>{layer.name}</span>
                        </div>
                        <div className="text-[10px] text-[#777] mt-0.5">{layer.tagline}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-[#E5C45A] block">{layer.metric}</span>
                        <span className="text-[9px] text-[#666] tracking-widest uppercase">{layer.metricLabel}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] text-[#666] text-center pt-1">
                Conceptual mapping of physical reserve custody converting to sub-millisecond spot liquidity.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Side: Smart Money Structure & Confluence */}
        <div className="hidden lg:flex flex-col gap-5 max-w-xs pointer-events-auto">
          {/* Pin 3: Liquidity Depth */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="group p-3 rounded-sm bg-[#0d0d0d]/70 backdrop-blur-md border border-[#222] hover:border-[#E5C45A]/40 transition-all cursor-default"
          >
            <div className="flex items-center justify-between text-[10px] text-[#858585] uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-[#22c55e]" />
                GLOBAL LIQUIDITY
              </span>
              <span className="text-[#E5C45A]">$2.4B DEPTH</span>
            </div>
            <div className="text-sm font-bold text-[#F5F5F5] mt-1">INTERBANK ECN TIER-1</div>
            <div className="text-[10px] text-[#737373] mt-0.5">
              Spread: {spread.toFixed(2)} pts • 18ms Latency
            </div>
          </motion.div>

          {/* Pin 4: Structure & Bias */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="group p-3 rounded-sm bg-[#0d0d0d]/70 backdrop-blur-md border border-[#222] hover:border-[#E5C45A]/40 transition-all cursor-default"
          >
            <div className="flex items-center justify-between text-[10px] text-[#858585] uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-[#E5C45A]" />
                MARKET STRUCTURE
              </span>
              <span className="text-[#22c55e]">BULLISH BOS</span>
            </div>
            <div className="text-sm font-bold text-[#F5F5F5] mt-1">ASIAN HIGH SWEPT</div>
            <div className="text-[10px] text-[#737373] mt-0.5">
              Confluence Score: 94 / 100 • Pristine
            </div>
          </motion.div>
        </div>
      </div>

      {/* 3. Bottom Bar: Real-Time Authoritative Price Readout & Quick Trading */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1a1a1a]/80">
        {/* Bottom Left: Live Authoritative Price Hero */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex items-baseline gap-3 sm:gap-4 pointer-events-auto"
        >
          <div className="flex flex-col">
            <span className="text-[10px] text-[#858585] uppercase tracking-widest font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              SPOT PRICE
            </span>
            <div className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#F5F5F5] font-mono-numbers flex items-center gap-1">
              <span className="text-[#E5C45A] font-light text-2xl sm:text-3xl">$</span>
              <span>{formattedPrice}</span>
            </div>
          </div>

          <div className="flex flex-col pb-1">
            <div
              className={`flex items-center gap-1 text-xs sm:text-sm font-bold ${
                isBullish ? 'text-[#22c55e]' : 'text-[#ef4444]'
              }`}
            >
              {isBullish ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{changePercentText}</span>
              <span className="text-[#858585] text-xs font-normal">({changePointsText})</span>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-[#737373] mt-1">
              <span>BID: <strong className="text-[#eee]">{bid > 0 ? bid.toFixed(2) : '—'}</strong></span>
              <span>ASK: <strong className="text-[#eee]">{ask > 0 ? ask.toFixed(2) : '—'}</strong></span>
              <span>SPREAD: <strong className="text-[#E5C45A]">{spread.toFixed(2)}</strong></span>
            </div>
          </div>
        </motion.div>

        {/* Bottom Right: High-Precision Direct Execution Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex items-center gap-2 sm:gap-3 pointer-events-auto"
        >
          {/* Quick Buy / Sell Direct Market Access */}
          <div className="flex items-center bg-[#111111]/80 backdrop-blur-md border border-[#262626] rounded-sm p-1 gap-1">
            <button
              onClick={() => onQuickTrade('BUY')}
              className="px-4 py-2 rounded-xs bg-[#22c55e]/15 hover:bg-[#22c55e]/25 border border-[#22c55e]/40 text-[#22c55e] text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <span>BUY</span>
              <span className="text-[10px] opacity-75">{ask > 0 ? ask.toFixed(2) : ''}</span>
            </button>
            <button
              onClick={() => onQuickTrade('SELL')}
              className="px-4 py-2 rounded-xs bg-[#ef4444]/15 hover:bg-[#ef4444]/25 border border-[#ef4444]/40 text-[#ef4444] text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <span>SELL</span>
              <span className="text-[10px] opacity-75">{bid > 0 ? bid.toFixed(2) : ''}</span>
            </button>
          </div>

          {/* Full Terminal Access */}
          <button
            onClick={onOpenTradingTerminal}
            className="px-4 py-2.5 rounded-sm bg-[#E5C45A] hover:bg-[#f3d36b] text-[#080808] text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shadow-[0_0_15px_rgba(229,196,90,0.3)] flex items-center gap-2"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>TRADE DESK</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};
