import React, { useEffect, useRef, useState } from 'react';
import { Candle, Timeframe, LiquidityLevel } from '../types';
import { LIQUIDITY_LEVELS } from '../services/marketData';

interface ChartCanvasProps {
  candles: Candle[];
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  currentPrice: number;
}

export const ChartCanvas: React.FC<ChartCanvasProps> = ({
  candles,
  timeframe,
  onTimeframeChange,
  currentPrice,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Layer toggles
  const [showStructure, setShowStructure] = useState(true);
  const [showLiquidity, setShowLiquidity] = useState(true);
  const [showSessions, setShowSessions] = useState(true);
  const [showIndicators, setShowIndicators] = useState(true);

  // Hover crosshair state
  const [hoverData, setHoverData] = useState<{ candle: Candle | null; x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.parentElement?.clientWidth || 800;
    const height = canvas.parentElement?.clientHeight || 500;
    canvas.width = width;
    canvas.height = height;

    const paddingRight = 75;
    const paddingBottom = 28;
    const paddingTop = 20;
    const chartWidth = width - paddingRight;
    const chartHeight = height - paddingBottom - paddingTop;
    const volumeHeight = chartHeight * 0.18;
    const priceChartHeight = chartHeight - volumeHeight;

    ctx.clearRect(0, 0, width, height);

    // Visible candles slice
    const visibleCandles = candles.slice(-50);
    const n = visibleCandles.length;
    if (n === 0) return;

    // Determine min/max price
    let minPrice = Math.min(...visibleCandles.map(c => c.low));
    let maxPrice = Math.max(...visibleCandles.map(c => c.high));

    // Pad price bounds
    const pricePadding = (maxPrice - minPrice) * 0.08 || 2;
    minPrice -= pricePadding;
    maxPrice += pricePadding;
    const priceRange = maxPrice - minPrice;

    // Max volume
    const maxVolume = Math.max(...visibleCandles.map(c => c.volume)) * 1.25 || 1000;

    // Helpers
    const candleWidth = Math.max(3, (chartWidth / n) * 0.7);
    const getX = (index: number) => (index + 0.5) * (chartWidth / n);
    const getY = (price: number) => paddingTop + priceChartHeight - ((price - minPrice) / priceRange) * priceChartHeight;
    const getVolY = (vol: number) => paddingTop + priceChartHeight + volumeHeight - (vol / maxVolume) * volumeHeight;

    // 1. Grid Lines (Horizontal Price Steps)
    ctx.strokeStyle = '#181818';
    ctx.lineWidth = 1;
    const steps = 6;
    for (let i = 0; i <= steps; i++) {
      const p = minPrice + (priceRange * i) / steps;
      const y = getY(p);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Right Axis Price Label
      ctx.fillStyle = '#666666';
      ctx.font = '10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(p.toFixed(2), chartWidth + 8, y + 3);
    }

    // 2. Shaded Session Ranges (Asian & London range boxes)
    if (showSessions && n > 25) {
      // Asian Range Box (approx. first 18 candles)
      const asianStartIndex = 0;
      const asianEndIndex = Math.min(18, n - 1);
      const asianCandles = visibleCandles.slice(asianStartIndex, asianEndIndex);
      if (asianCandles.length > 0) {
        const aHigh = Math.max(...asianCandles.map(c => c.high));
        const aLow = Math.min(...asianCandles.map(c => c.low));
        const x1 = getX(asianStartIndex) - candleWidth / 2;
        const x2 = getX(asianEndIndex) + candleWidth / 2;
        const yTop = getY(aHigh);
        const yBottom = getY(aLow);

        ctx.fillStyle = 'rgba(201, 162, 39, 0.04)';
        ctx.fillRect(x1, yTop, x2 - x1, yBottom - yTop);
        ctx.strokeStyle = 'rgba(201, 162, 39, 0.2)';
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(x1, yTop, x2 - x1, yBottom - yTop);
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(201, 162, 39, 0.6)';
        ctx.font = '9px "IBM Plex Mono", monospace';
        ctx.fillText('ASIAN RANGE', x1 + 4, yTop - 4);
      }
    }

    // 3. Liquidity Zones & Levels (PDH, PDL, PDC, FVG, Order Block)
    if (showLiquidity) {
      LIQUIDITY_LEVELS.forEach(level => {
        if (level.price >= minPrice && level.price <= maxPrice) {
          const y = getY(level.price);

          ctx.beginPath();
          ctx.setLineDash(level.type === 'zone' ? [2, 2] : [4, 4]);
          ctx.strokeStyle =
            level.label === 'PDH' || level.label === 'LONDON_HIGH'
              ? 'rgba(239, 68, 68, 0.4)'
              : level.label === 'PDL'
              ? 'rgba(34, 197, 94, 0.4)'
              : 'rgba(201, 162, 39, 0.4)';
          ctx.moveTo(0, y);
          ctx.lineTo(chartWidth, y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Tag on right margin
          ctx.fillStyle =
            level.label === 'PDH' || level.label === 'LONDON_HIGH'
              ? '#ef4444'
              : level.label === 'PDL'
              ? '#22c55e'
              : '#E5C45A';
          ctx.font = '9px "IBM Plex Mono", monospace';
          ctx.fillText(`${level.label} ${level.price.toFixed(1)}`, chartWidth + 6, y - 2);

          // Swept indicator if applicable
          if (level.swept) {
            ctx.fillStyle = 'rgba(229, 196, 90, 0.8)';
            ctx.fillText('✓ SWEPT', chartWidth - 55, y - 3);
          }
        }
      });
    }

    // 4. Indicators: VWAP & EMA20 / EMA50
    if (showIndicators) {
      // VWAP Line (Golden)
      ctx.beginPath();
      ctx.strokeStyle = '#C9A227';
      ctx.lineWidth = 1.5;
      visibleCandles.forEach((c, i) => {
        if (c.vwap) {
          const x = getX(i);
          const y = getY(c.vwap);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // EMA20 Line (Soft Cyan/Teal)
      ctx.beginPath();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      visibleCandles.forEach((c, i) => {
        if (c.ema20) {
          const x = getX(i);
          const y = getY(c.ema20);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // 5. Volume Bars (Bottom Sub-panel)
    visibleCandles.forEach((c, i) => {
      const x = getX(i);
      const isUp = c.close >= c.open;
      const volY = getVolY(c.volume);
      const volH = paddingTop + priceChartHeight + volumeHeight - volY;

      ctx.fillStyle = isUp ? 'rgba(34, 197, 94, 0.22)' : 'rgba(239, 68, 68, 0.22)';
      ctx.fillRect(x - candleWidth / 2, volY, candleWidth, volH);
    });

    // 6. Candlesticks (Wick + Body)
    visibleCandles.forEach((c, i) => {
      const x = getX(i);
      const isUp = c.close >= c.open;
      const yHigh = getY(c.high);
      const yLow = getY(c.low);
      const yOpen = getY(c.open);
      const yClose = getY(c.close);

      // Wick
      ctx.beginPath();
      ctx.strokeStyle = isUp ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 1.2;
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      // Body
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(1.5, Math.abs(yClose - yOpen));
      ctx.fillStyle = isUp ? '#16a34a' : '#dc2626';
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    });

    // 7. Market Structure: BOS & CHoCH Markers
    if (showStructure && n > 20) {
      const swingIndex = Math.floor(n * 0.75);
      const swingCandle = visibleCandles[swingIndex];
      const x = getX(swingIndex);
      const y = getY(swingCandle.high);

      // BOS Tag
      ctx.strokeStyle = 'rgba(229, 196, 90, 0.6)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(x - 20, y);
      ctx.lineTo(chartWidth - 40, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#E5C45A';
      ctx.font = 'bold 9px "IBM Plex Mono", monospace';
      ctx.fillText('BOS ↗', x + 5, y - 4);
    }

    // 8. Current Price Horizontal Marker (Solid Gold Badge on Right Axis)
    const currentY = getY(currentPrice);
    ctx.strokeStyle = '#E5C45A';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    ctx.moveTo(0, currentY);
    ctx.lineTo(chartWidth, currentY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price Badge
    ctx.fillStyle = '#C9A227';
    ctx.fillRect(chartWidth + 2, currentY - 8, paddingRight - 4, 16);
    ctx.fillStyle = '#080808';
    ctx.font = 'bold 10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(currentPrice.toFixed(2), chartWidth + 6, currentY + 3);

    // 9. Interactive Crosshair Hover
    if (hoverData && hoverData.candle) {
      const { x, y } = hoverData;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.setLineDash([2, 2]);
      // Vertical
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height - paddingBottom);
      ctx.stroke();
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [candles, timeframe, showStructure, showLiquidity, showSessions, showIndicators, hoverData, currentPrice]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = canvas.width;
    const paddingRight = 75;
    const chartWidth = width - paddingRight;

    if (x >= 0 && x <= chartWidth) {
      const visibleCandles = candles.slice(-50);
      const index = Math.floor((x / chartWidth) * visibleCandles.length);
      const candle = visibleCandles[Math.max(0, Math.min(visibleCandles.length - 1, index))];
      setHoverData({ candle, x, y });
    } else {
      setHoverData(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col bg-[#0d0d0d] rounded-xl border border-[#242424] overflow-hidden">
      {/* Top Chart Header / Controls */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2 border-b border-[#242424] bg-[#111111]/80 text-xs font-mono">
        {/* Left: Timeframe Selector */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-bold text-[#E5C45A] mr-2">XAUUSD</span>
          {(['1M', '5M', '15M', '30M', '1H', '4H', '1D'] as Timeframe[]).map(tf => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                timeframe === tf
                  ? 'bg-[#C9A227] text-[#080808] font-bold shadow-[0_0_8px_rgba(201,162,39,0.3)]'
                  : 'text-[#858585] hover:text-[#F5F5F5] hover:bg-[#181818]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Center: Live Hover Candle Readout */}
        <div className="hidden md:flex items-center gap-3 text-[11px] text-[#858585]">
          {hoverData?.candle ? (
            <>
              <span>O: <strong className="text-[#F5F5F5]">{hoverData.candle.open.toFixed(2)}</strong></span>
              <span>H: <strong className="text-[#F5F5F5]">{hoverData.candle.high.toFixed(2)}</strong></span>
              <span>L: <strong className="text-[#F5F5F5]">{hoverData.candle.low.toFixed(2)}</strong></span>
              <span>C: <strong className="text-[#F5F5F5]">{hoverData.candle.close.toFixed(2)}</strong></span>
              <span>VOL: <strong className="text-[#F5F5F5]">{hoverData.candle.volume}</strong></span>
            </>
          ) : (
            <span>GOLD SPOT • PRECISION 0.01 • INSTITUTIONAL DEPTH</span>
          )}
        </div>

        {/* Right: Layer Filters (Clean Annotations) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowStructure(!showStructure)}
            className={`px-2 py-0.5 rounded text-[10px] uppercase border cursor-pointer ${
              showStructure ? 'border-[#C9A227]/60 text-[#E5C45A] bg-[#C9A227]/10' : 'border-[#242424] text-[#555]'
            }`}
          >
            STRUCTURE
          </button>
          <button
            onClick={() => setShowLiquidity(!showLiquidity)}
            className={`px-2 py-0.5 rounded text-[10px] uppercase border cursor-pointer ${
              showLiquidity ? 'border-[#C9A227]/60 text-[#E5C45A] bg-[#C9A227]/10' : 'border-[#242424] text-[#555]'
            }`}
          >
            LIQUIDITY
          </button>
          <button
            onClick={() => setShowSessions(!showSessions)}
            className={`px-2 py-0.5 rounded text-[10px] uppercase border cursor-pointer ${
              showSessions ? 'border-[#C9A227]/60 text-[#E5C45A] bg-[#C9A227]/10' : 'border-[#242424] text-[#555]'
            }`}
          >
            SESSIONS
          </button>
          <button
            onClick={() => setShowIndicators(!showIndicators)}
            className={`px-2 py-0.5 rounded text-[10px] uppercase border cursor-pointer ${
              showIndicators ? 'border-[#C9A227]/60 text-[#E5C45A] bg-[#C9A227]/10' : 'border-[#242424] text-[#555]'
            }`}
          >
            VWAP/EMA
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 w-full relative min-h-[380px]">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full cursor-crosshair block"
        />
      </div>

      {/* Bottom Chart Footer Legend */}
      <div className="px-3 py-1.5 border-t border-[#181818] bg-[#0c0c0c] flex items-center justify-between text-[10px] font-mono text-[#777]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-[#C9A227]" /> VWAP
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-[#38bdf8]" /> EMA(20)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-[#ef4444] border-dashed" /> PDH / SESSIONS
          </span>
        </div>
        <div>
          FEED: LIVE XAUUSD DMA • TRUE MARKET DATA STREAM • DYNAMIC SPREAD
        </div>
      </div>
    </div>
  );
};
