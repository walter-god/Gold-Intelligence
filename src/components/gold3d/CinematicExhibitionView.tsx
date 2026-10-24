import React, { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Activity,
  Globe,
  Radio,
  Zap,
  TrendingUp,
  Cpu,
  ChevronDown,
  ExternalLink,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { GoldScene } from './GoldScene';
import { GoldMarketHUD } from './GoldMarketHUD';
import { CinematicNavBar } from './CinematicNavBar';
import { GlobalGoldVisualizer } from '../GlobalGoldVisualizer';
import { ChartCanvas } from '../ChartCanvas';
import {
  Candle,
  MarketQuote,
  SignalResult,
  RiskProfile,
  Timeframe,
  OrderTicket,
  Position,
} from '../../types';

// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger);

interface CinematicExhibitionViewProps {
  quote: MarketQuote | null;
  currentPrice: number;
  bid: number;
  ask: number;
  spread: number;
  candles: Candle[];
  signal: SignalResult;
  riskProfile: RiskProfile;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  onSwitchToTerminal: () => void;
  onExecuteOrder: (ticket: OrderTicket) => void;
  positions: Position[];
}

export const CinematicExhibitionView: React.FC<CinematicExhibitionViewProps> = ({
  quote,
  currentPrice,
  bid,
  ask,
  spread,
  candles,
  signal,
  riskProfile,
  timeframe,
  onTimeframeChange,
  onSwitchToTerminal,
  onExecuteOrder,
  positions,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('asset');
  const [quickLots, setQuickLots] = useState<number>(1.0);
  const [lastTickBullish, setLastTickBullish] = useState<boolean | null>(null);

  // Monitor price changes to trigger 3D gold pulse
  const prevPriceRef = useRef<number>(currentPrice);
  useEffect(() => {
    if (prevPriceRef.current > 0 && currentPrice !== prevPriceRef.current) {
      setLastTickBullish(currentPrice >= prevPriceRef.current);
    }
    prevPriceRef.current = currentPrice;
  }, [currentPrice]);

  // Setup Lenis Smooth Scrolling and GSAP ScrollTrigger
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    // Synchronize Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Track active chapter for the top nav
    const sectionIds = ['asset', 'market', 'flow', 'structure', 'intelligence', 'execution'];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        ScrollTrigger.create({
          trigger: el,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActiveSection(id),
          onEnterBack: () => setActiveSection(id),
        });
      }
    });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickBuy = (dir: 'BUY' | 'SELL') => {
    onExecuteOrder({
      direction: dir,
      sizeLots: quickLots,
      riskPercent: 0.5,
      entryPrice: currentPrice,
      slPoints: 12.0,
      tpPoints: 24.0,
      mode: 'MANUAL',
      candleCloseExit: false,
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen bg-[#080808] text-[#F5F5F5] font-sans selection:bg-[#C9A227]/30 selection:text-[#E5C45A] overflow-x-hidden"
    >
      {/* 1. Fixed Luxury Top Navigation */}
      <CinematicNavBar
        quote={quote}
        currentPrice={currentPrice}
        activeSection={activeSection}
        onNavigateSection={scrollToSection}
        viewMode="3D_EXHIBITION"
        onToggleViewMode={(mode) => {
          if (mode === 'TRADING_TERMINAL') onSwitchToTerminal();
        }}
      />

      {/* 2. CHAPTER 01: THE ASSET (Hero 3D Gold Bar Centerpiece) */}
      <section
        id="asset"
        ref={heroSectionRef}
        className="relative w-full h-screen flex items-center justify-center pt-14 overflow-hidden"
      >
        {/* Interactive 3D Gold Bar Canvas */}
        <div className="absolute inset-0 w-full h-full">
          <GoldScene
            isExploded={isExploded}
            selectedLayerId={selectedLayerId}
            interactive={true}
            cameraDistance={6.8}
            lastTickBullish={lastTickBullish}
          />
        </div>

        {/* Floating Progressive Disclosure HUD */}
        <GoldMarketHUD
          quote={quote}
          currentPrice={currentPrice}
          bid={bid}
          ask={ask}
          spread={spread}
          isExploded={isExploded}
          onToggleExploded={() => setIsExploded(!isExploded)}
          selectedLayerId={selectedLayerId}
          onSelectLayer={setSelectedLayerId}
          onOpenTradingTerminal={onSwitchToTerminal}
          onQuickTrade={handleQuickBuy}
        />

        {/* Minimal Scroll Down Hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none opacity-60 text-[9px] font-mono tracking-[0.25em] text-[#858585] uppercase">
          <span>DISCOVER THE MARKET</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#E5C45A] animate-bounce" />
        </div>
      </section>

      {/* 3. CHAPTER 02: THE MARKET (Physical Gold → Electronic Spot Synthesis) */}
      <section
        id="market"
        className="relative w-full min-h-screen py-24 px-6 md:px-12 lg:px-20 border-t border-[#181818] flex flex-col justify-center max-w-7xl mx-auto"
      >
        <div className="flex flex-col space-y-4 mb-16">
          <div className="flex items-center gap-2 text-xs font-mono text-[#E5C45A] tracking-[0.25em] uppercase">
            <span>02 // THE MARKET</span>
            <span className="text-[#333]">|</span>
            <span className="text-[#888]">PHYSICAL BACKING TO SPOT DMA</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-[#F5F5F5] uppercase">
            HOW PHYSICAL BULLION BECOMES <strong className="font-bold text-[#E5C45A]">XAUUSD</strong>
          </h2>
          <p className="text-sm md:text-base text-[#888] max-w-3xl leading-relaxed font-sans">
            Unlike fiat currencies or paper derivatives, XAUUSD is structurally anchored in physical London Good Delivery bullion. Every spot tick is synthesized from deep interbank liquidity, Swiss refining hubs, and continuous OTC clearing.
          </p>
        </div>

        {/* 3-Column Architectural Spec Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
          {/* Card 1: The Bullion Standard */}
          <div className="bg-[#0c0c0c] border border-[#222] p-6 rounded-sm space-y-4 hover:border-[#E5C45A]/40 transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
              <span className="text-[10px] text-[#858585] uppercase tracking-widest font-bold">SPECIFICATION</span>
              <span className="px-2 py-0.5 rounded-xs bg-[#E5C45A]/10 text-[#E5C45A] text-[9px] font-bold">400 OZ / 1 KG</span>
            </div>
            <h3 className="text-lg font-bold text-[#eee]">LONDON GOOD DELIVERY</h3>
            <p className="text-xs text-[#777] leading-relaxed font-sans">
              Minimum 99.5% purity (typically refined to 99.99%). Stamped with melt assay, refinery mark, year of manufacture, and individual vault serial index.
            </p>
            <div className="pt-2 text-[11px] text-[#aaa] space-y-1">
              <div>• Central Bank Custody: Bank of England</div>
              <div>• Settlement Standard: T+2 Unallocated</div>
              <div>• Global Share: ~70% of OTC Turnover</div>
            </div>
          </div>

          {/* Card 2: Price Discovery Engine */}
          <div className="bg-[#0c0c0c] border border-[#222] p-6 rounded-sm space-y-4 hover:border-[#E5C45A]/40 transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
              <span className="text-[10px] text-[#858585] uppercase tracking-widest font-bold">CLEARING</span>
              <span className="px-2 py-0.5 rounded-xs bg-[#22c55e]/10 text-[#22c55e] text-[9px] font-bold">DMA STREAM</span>
            </div>
            <h3 className="text-lg font-bold text-[#eee]">LBMA GOLD PRICE AUCTIONS</h3>
            <p className="text-xs text-[#777] leading-relaxed font-sans">
              Operated twice daily (10:30 & 15:00 London time) by ICE Benchmark Administration. The electronic auction establishes the international spot benchmark for miners and central banks.
            </p>
            <div className="pt-2 text-[11px] text-[#aaa] space-y-1">
              <div>• Direct Market Access: Sub-20ms latency</div>
              <div>• Comex Arbitrage: Spot-to-Futures EFP</div>
              <div>• True Spread: 0.01 - 0.15 pts typical</div>
            </div>
          </div>

          {/* Card 3: Institutional Order Blocks */}
          <div className="bg-[#0c0c0c] border border-[#222] p-6 rounded-sm space-y-4 hover:border-[#E5C45A]/40 transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
              <span className="text-[10px] text-[#858585] uppercase tracking-widest font-bold">EXECUTION</span>
              <span className="px-2 py-0.5 rounded-xs bg-[#E5C45A]/10 text-[#E5C45A] text-[9px] font-bold">SMART MONEY</span>
            </div>
            <h3 className="text-lg font-bold text-[#eee]">INSTITUTIONAL LIQUIDITY</h3>
            <p className="text-xs text-[#777] leading-relaxed font-sans">
              Algorithmic execution matches high-frequency institutional flows against resting limit orders. Liquidity is continuously swept at previous day highs/lows and session extremes.
            </p>
            <div className="pt-2 text-[11px] text-[#aaa] space-y-1">
              <div>• Fair Value Gap (FVG) absorption</div>
              <div>• Stop-run liquidity pools defended</div>
              <div>• High-frequency tick matching engine</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CHAPTER 03: THE FLOW (Global Liquidity & Sovereign Vault Reserves) */}
      <section
        id="flow"
        className="relative w-full min-h-screen py-24 px-6 md:px-12 lg:px-20 border-t border-[#181818] flex flex-col justify-center max-w-7xl mx-auto"
      >
        <div className="flex flex-col space-y-4 mb-10">
          <div className="flex items-center gap-2 text-xs font-mono text-[#E5C45A] tracking-[0.25em] uppercase">
            <span>03 // THE FLOW</span>
            <span className="text-[#333]">|</span>
            <span className="text-[#888]">CROSS-BORDER PHYSICAL & SPOT CIRCUITS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-[#F5F5F5] uppercase">
            GLOBAL LIQUIDITY <strong className="font-bold text-[#E5C45A]">NETWORK</strong>
          </h2>
          <p className="text-sm md:text-base text-[#888] max-w-3xl leading-relaxed font-sans">
            Track real-time cross-border bullion flows, sovereign central bank reserves, and active liquidity corridors between London, New York, Zurich, Dubai, and Singapore.
          </p>
        </div>

        {/* Integrated Global Gold Visualizer Component */}
        <div className="w-full bg-[#0a0a0a] border border-[#222] rounded-sm p-4 overflow-hidden">
          <GlobalGoldVisualizer currentPrice={currentPrice} />
        </div>
      </section>

      {/* 5. CHAPTER 04: THE STRUCTURE (Smart Money Market Structure & Candlestick Feed) */}
      <section
        id="structure"
        className="relative w-full min-h-screen py-24 px-6 md:px-12 lg:px-20 border-t border-[#181818] flex flex-col justify-center max-w-7xl mx-auto"
      >
        <div className="flex flex-col space-y-4 mb-10">
          <div className="flex items-center gap-2 text-xs font-mono text-[#E5C45A] tracking-[0.25em] uppercase">
            <span>04 // THE STRUCTURE</span>
            <span className="text-[#333]">|</span>
            <span className="text-[#888]">ALGORITHMIC PRICE DISCOVERY MATRIX</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-[#F5F5F5] uppercase">
            MARKET STRUCTURE &amp; <strong className="font-bold text-[#E5C45A]">ORDER FLOW</strong>
          </h2>
          <p className="text-sm md:text-base text-[#888] max-w-3xl leading-relaxed font-sans">
            Real-time multi-timeframe candlestick feed with Fair Value Gaps (FVG), Break of Structure (BOS), and key liquidity levels calibrated directly to the live DMA stream.
          </p>
        </div>

        {/* Embedded Interactive Chart Component */}
        <div className="w-full h-[520px] bg-[#0a0a0a] border border-[#222] rounded-sm overflow-hidden flex flex-col">
          <ChartCanvas
            candles={candles}
            timeframe={timeframe}
            onTimeframeChange={onTimeframeChange}
            currentPrice={currentPrice}
            showIndicators={true}
          />
        </div>
      </section>

      {/* 6. CHAPTER 05: THE INTELLIGENCE (Algorithmic Confluence Engine) */}
      <section
        id="intelligence"
        className="relative w-full min-h-screen py-24 px-6 md:px-12 lg:px-20 border-t border-[#181818] flex flex-col justify-center max-w-7xl mx-auto"
      >
        <div className="flex flex-col space-y-4 mb-12">
          <div className="flex items-center gap-2 text-xs font-mono text-[#E5C45A] tracking-[0.25em] uppercase">
            <span>05 // THE INTELLIGENCE</span>
            <span className="text-[#333]">|</span>
            <span className="text-[#888]">AUREX QUANTITATIVE V3 SIGNAL ENGINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-[#F5F5F5] uppercase">
            CONFLUENCE <strong className="font-bold text-[#E5C45A]">RADAR</strong>
          </h2>
          <p className="text-sm md:text-base text-[#888] max-w-3xl leading-relaxed font-sans">
            Five weighted pillars synthesize every tick to calculate mathematical confluence before orders are routed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 font-mono">
          {/* Signal Score Block */}
          <div className="bg-[#0c0c0c] border border-[#222] p-6 rounded-sm flex flex-col justify-between">
            <span className="text-[10px] text-[#858585] uppercase tracking-widest font-bold">TOTAL CONFLUENCE</span>
            <div className="my-4">
              <div className="text-5xl font-black text-[#E5C45A]">{signal.score}</div>
              <div className="text-xs text-[#22c55e] font-bold mt-1">STATUS: {signal.regime}</div>
            </div>
            <span className="text-[10px] text-[#737373]">Threshold: ≥ 85 pts required for armed execution</span>
          </div>

          {/* Pillar 1: Liquidity */}
          <div className="bg-[#0c0c0c] border border-[#222] p-6 rounded-sm flex flex-col justify-between">
            <span className="text-[10px] text-[#858585] uppercase tracking-widest font-bold">LIQUIDITY SWEEP</span>
            <div className="my-4">
              <div className="text-3xl font-bold text-[#eee]">{signal.liquidity} <span className="text-xs text-[#666]">/ 20</span></div>
              <div className="text-xs text-[#22c55e] mt-1 font-bold">PRISTINE SWEEP</div>
            </div>
            <span className="text-[10px] text-[#737373]">Asian Range High swept with stop absorption</span>
          </div>

          {/* Pillar 2: Structure */}
          <div className="bg-[#0c0c0c] border border-[#222] p-6 rounded-sm flex flex-col justify-between">
            <span className="text-[10px] text-[#858585] uppercase tracking-widest font-bold">MARKET STRUCTURE</span>
            <div className="my-4">
              <div className="text-3xl font-bold text-[#eee]">{signal.structure} <span className="text-xs text-[#666]">/ 20</span></div>
              <div className="text-xs text-[#22c55e] mt-1 font-bold">BOS CONFIRMED</div>
            </div>
            <span className="text-[10px] text-[#737373]">15M Bullish Displacement above supply</span>
          </div>

          {/* Pillar 3: Multi-Timeframe Matrix */}
          <div className="bg-[#0c0c0c] border border-[#222] p-6 rounded-sm flex flex-col justify-between">
            <span className="text-[10px] text-[#858585] uppercase tracking-widest font-bold">MTF CONVERGENCE</span>
            <div className="my-4">
              <div className="text-3xl font-bold text-[#eee]">{signal.multiTimeframe} <span className="text-xs text-[#666]">/ 20</span></div>
              <div className="text-xs text-[#22c55e] mt-1 font-bold">100% BULLISH ALIGNED</div>
            </div>
            <span className="text-[10px] text-[#737373]">1M • 5M • 15M • 30M • 1H • 4H • 1D</span>
          </div>
        </div>
      </section>

      {/* 7. CHAPTER 06: THE EXECUTION (Institutional Execution & Active Terminal Launch) */}
      <section
        id="execution"
        className="relative w-full min-h-screen py-24 px-6 md:px-12 lg:px-20 border-t border-[#181818] flex flex-col justify-center max-w-7xl mx-auto"
      >
        <div className="flex flex-col space-y-4 mb-12">
          <div className="flex items-center gap-2 text-xs font-mono text-[#E5C45A] tracking-[0.25em] uppercase">
            <span>06 // THE EXECUTION</span>
            <span className="text-[#333]">|</span>
            <span className="text-[#888]">HIGH-PRECISION ORDER ROUTING</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-[#F5F5F5] uppercase">
            DIRECT TRADE <strong className="font-bold text-[#E5C45A]">EXECUTION</strong>
          </h2>
          <p className="text-sm md:text-base text-[#888] max-w-3xl leading-relaxed font-sans">
            Route institutional orders with exact position sizing, automated break-even rules, and trailing stops directly to your connected broker gateway.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
          {/* Quick DMA Execution Slip */}
          <div className="lg:col-span-2 bg-[#0c0c0c] border border-[#222] p-6 rounded-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1c1c1c]">
              <span className="text-xs font-bold text-[#E5C45A] uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4" />
                INSTANT DMA ORDER TICKET
              </span>
              <span className="text-xs text-[#888]">FEED: LIVE XAUUSD DMA</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-[#858585] uppercase tracking-widest font-bold block">SYMBOL</span>
                <span className="text-base font-bold text-[#F5F5F5]">XAUUSD</span>
              </div>
              <div>
                <span className="text-[10px] text-[#858585] uppercase tracking-widest font-bold block">CURRENT SPOT</span>
                <span className="text-base font-bold text-[#E5C45A]">${currentPrice > 0 ? currentPrice.toFixed(2) : '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#858585] uppercase tracking-widest font-bold block">LOT SIZE</span>
                <div className="flex items-center gap-2 mt-1">
                  {[0.5, 1.0, 2.0, 5.0].map((l) => (
                    <button
                      key={l}
                      onClick={() => setQuickLots(l)}
                      className={`px-2 py-0.5 rounded-xs border text-xs cursor-pointer font-bold ${
                        quickLots === l
                          ? 'bg-[#E5C45A] text-[#080808] border-[#E5C45A]'
                          : 'bg-[#181818] border-[#333] text-[#aaa]'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-[#858585] uppercase tracking-widest font-bold block">SPREAD</span>
                <span className="text-base font-bold text-[#22c55e]">{spread.toFixed(2)} pts</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => handleQuickBuy('BUY')}
                className="py-3.5 px-6 rounded-sm bg-[#22c55e]/15 hover:bg-[#22c55e]/25 border border-[#22c55e]/40 text-[#22c55e] text-sm font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center justify-between"
              >
                <span>EXECUTE BUY / LONG</span>
                <span className="text-xs font-mono">{ask > 0 ? `$${ask.toFixed(2)}` : ''}</span>
              </button>

              <button
                onClick={() => handleQuickBuy('SELL')}
                className="py-3.5 px-6 rounded-sm bg-[#ef4444]/15 hover:bg-[#ef4444]/25 border border-[#ef4444]/40 text-[#ef4444] text-sm font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center justify-between"
              >
                <span>EXECUTE SELL / SHORT</span>
                <span className="text-xs font-mono">{bid > 0 ? `$${bid.toFixed(2)}` : ''}</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#737373] pt-2 border-t border-[#181818]">
              <span>RISK CONTROL: Max 0.5% Equity Risk • Auto Stop Loss 12 pts</span>
              <span className="text-[#22c55e] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                HARD SPREAD LOCK: ARMED
              </span>
            </div>
          </div>

          {/* Terminal Launch Banner */}
          <div className="bg-[#0c0c0c] border border-[#222] p-6 rounded-sm flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] text-[#E5C45A] uppercase tracking-widest font-bold block">
                FULL WORKSTATION
              </span>
              <h3 className="text-xl font-bold text-[#eee] uppercase">INSTITUTIONAL TERMINAL</h3>
              <p className="text-xs text-[#888] leading-relaxed font-sans">
                Access deep multi-panel charts, quantitative backtester, trade journal, broker bridge settings, and positions reconciler.
              </p>
            </div>

            <div className="space-y-2 text-xs text-[#aaa]">
              <div className="flex items-center justify-between pb-1 border-b border-[#1c1c1c]">
                <span>Active Positions</span>
                <span className="font-bold text-[#E5C45A]">{positions.length}</span>
              </div>
              <div className="flex items-center justify-between pb-1 border-b border-[#1c1c1c]">
                <span>Reconciled Equity</span>
                <span className="font-bold text-[#eee]">${riskProfile.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Broker Gateway</span>
                <span className="font-bold text-[#22c55e]">ICMarkets Live08</span>
              </div>
            </div>

            <button
              onClick={onSwitchToTerminal}
              className="w-full py-3.5 px-4 rounded-sm bg-[#E5C45A] hover:bg-[#f3d36b] text-[#080808] font-bold text-xs uppercase tracking-wider cursor-pointer transition-all shadow-[0_0_20px_rgba(229,196,90,0.3)] flex items-center justify-center gap-2"
            >
              <span>OPEN INSTITUTIONAL TERMINAL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer Minimalist Identification */}
      <footer className="w-full py-8 px-6 md:px-12 border-t border-[#181818] text-xs font-mono text-[#666] flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-2">
          <span className="text-[#E5C45A] font-bold">AUREX GOLD INTELLIGENCE</span>
          <span>•</span>
          <span>INVESTMENT-GRADE PHYSICAL &amp; DMA SPOT TERMINAL</span>
        </div>
        <div>
          <span>LBMA GOOD DELIVERY ACCREDITED • PROTOCOL: FIX 4.4 / MT5</span>
        </div>
      </footer>
    </div>
  );
};
