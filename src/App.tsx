import React, { useState, useEffect } from 'react';
import { HeaderTopBar } from './components/HeaderTopBar';
import { LeftSidebar } from './components/LeftSidebar';
import { FooterBar } from './components/FooterBar';
import { HomeView } from './views/HomeView';
import { MarketView } from './views/MarketView';
import { AlgoView } from './views/AlgoView';
import { ExecutionView } from './views/ExecutionView';
import { PositionsView } from './views/PositionsView';
import { BacktestView } from './views/BacktestView';
import { AnalyticsView } from './views/AnalyticsView';
import { JournalView } from './views/JournalView';
import { BrokersView } from './views/BrokersView';
import { SettingsView } from './views/SettingsView';
import { AiAnalystModal } from './components/AiAnalystModal';
import { SignalEngine } from './services/algorithmEngine';
import { LiveMarketDataProvider, useLiveMarketData } from './context/LiveMarketDataContext';
import {
  NavigationTab,
  Timeframe,
  Position,
  OrderTicket,
  RiskProfile,
} from './types';

function TradingTerminal() {
  const {
    quote,
    currentPrice,
    bid,
    ask,
    spread,
    status: marketStatus,
    source: marketSource,
    candles,
    timeframe,
    latencyMs,
    lastUpdatedText,
    setTimeframe,
    setSource,
    reconnect,
  } = useLiveMarketData();

  const [currentTab, setCurrentTab] = useState<NavigationTab>('HOME');
  const [collapsedSidebar, setCollapsedSidebar] = useState<boolean>(false);
  const [algoArmed, setAlgoArmed] = useState<boolean>(true);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [killSwitchTriggered, setKillSwitchTriggered] = useState<boolean>(false);

  // Risk profile state
  const [riskProfile, setRiskProfile] = useState<RiskProfile>({
    equity: 124580.0,
    balance: 123840.0,
    riskPerTradePercent: 0.5,
    dailyLossLimitPercent: 2.0,
    maxDrawdownPercent: 5.0,
    maxOpenLots: 5.0,
    spreadLockThreshold: 0.25,
    newsLockEnabled: true,
    consecutiveLossLimit: 3,
    consecutiveLosses: 0,
    isLocked: false,
  });

  // Open Positions calibrated to the live price
  const [positions, setPositions] = useState<Position[]>([]);
  const [hasInitializedPosition, setHasInitializedPosition] = useState<boolean>(false);

  useEffect(() => {
    if (currentPrice > 0 && !hasInitializedPosition) {
      setHasInitializedPosition(true);
      const entry = Math.round((currentPrice - 2.80) * 100) / 100;
      setPositions([
        {
          id: 'POS-8841',
          symbol: 'XAUUSD',
          direction: 'BUY',
          sizeLots: 2.0,
          entryPrice: entry,
          stopLoss: Math.round((entry - 12.0) * 100) / 100,
          takeProfit: Math.round((entry + 24.0) * 100) / 100,
          openTime: '13:42:15 UTC',
          pnl: Math.round((currentPrice - entry) * 2.0 * 100 * 100) / 100,
          trailingActive: true,
          candleCloseExit: false,
        },
      ]);
    }
  }, [currentPrice, hasInitializedPosition]);

  // Compute live algorithmic state consuming the real candles & live price
  const signal = SignalEngine.computeSignal(candles, currentPrice, 'London / NY Overlap');
  const regime = 'TRENDING BULLISH';
  const structure = 'BOS CONFIRMED';
  const mtf = SignalEngine.getMultiTimeframeState();

  // Price calculations directly from live market quote
  const dailyChange = quote?.change24h || 0;
  const dailyChangePercent = quote?.changePercent24h || 0;

  // Master Algo switch
  const handleToggleAlgo = () => {
    if (riskProfile.isLocked) {
      alert('Cannot arm algorithm: Hard risk lock is currently active.');
      return;
    }
    setAlgoArmed(!algoArmed);
  };

  // Emergency Kill Switch
  const handleEmergencyKillSwitch = () => {
    setAlgoArmed(false);
    setRiskProfile(prev => ({
      ...prev,
      isLocked: true,
      lockedReason: 'Emergency Kill Switch manually triggered by trader.',
    }));
    setKillSwitchTriggered(true);
  };

  // Execute Order
  const handleExecuteOrder = (ticket: OrderTicket) => {
    if (riskProfile.isLocked) return;

    const slPrice =
      ticket.direction === 'BUY'
        ? currentPrice - ticket.slPoints
        : currentPrice + ticket.slPoints;
    const tpPrice =
      ticket.direction === 'BUY'
        ? currentPrice + ticket.tpPoints
        : currentPrice - ticket.tpPoints;

    const newPos: Position = {
      id: `POS-${Math.floor(1000 + Math.random() * 9000)}`,
      symbol: 'XAUUSD',
      direction: ticket.direction,
      sizeLots: ticket.sizeLots,
      entryPrice: currentPrice,
      stopLoss: Math.round(slPrice * 100) / 100,
      takeProfit: Math.round(tpPrice * 100) / 100,
      openTime: new Date().toUTCString().slice(17, 25) + ' UTC',
      pnl: 0,
      trailingActive: true,
      candleCloseExit: ticket.candleCloseExit || false,
    };

    setPositions(prev => [newPos, ...prev]);
    setCurrentTab('POSITIONS');
  };

  // Quick Execute from Home
  const handleQuickExecute = (dir: 'BUY' | 'SELL') => {
    handleExecuteOrder({
      direction: dir,
      sizeLots: 1.5,
      riskPercent: 0.5,
      entryPrice: currentPrice,
      slPoints: 12.0,
      tpPoints: 24.0,
      mode: 'MANUAL',
      candleCloseExit: false,
    });
  };

  // Close Position
  const handleClosePosition = (id: string) => {
    setPositions(prev => prev.filter(p => p.id !== id));
  };

  // Close All Positions
  const handleCloseAllPositions = () => {
    if (window.confirm(`Close all ${positions.length} active positions immediately at market?`)) {
      setPositions([]);
    }
  };

  // Set Break-Even (+0.2 pts cushion)
  const handleSetBreakEven = (id: string) => {
    setPositions(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const bePrice = p.direction === 'BUY' ? p.entryPrice + 0.2 : p.entryPrice - 0.2;
        return { ...p, stopLoss: Math.round(bePrice * 100) / 100 };
      })
    );
  };

  // Toggle Trailing Stop
  const handleToggleTrailing = (id: string) => {
    setPositions(prev =>
      prev.map(p => (p.id === id ? { ...p, trailingActive: !p.trailingActive } : p))
    );
  };

  // Reset Risk Locks
  const handleResetLocks = () => {
    setRiskProfile(prev => ({
      ...prev,
      isLocked: false,
      lockedReason: undefined,
      consecutiveLosses: 0,
    }));
    setKillSwitchTriggered(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#080808] text-[#F5F5F5] overflow-hidden select-none font-sans">
      {/* 1. Header Top Bar displaying true live Bid/Ask, status, spread and latency */}
      <HeaderTopBar
        currentPrice={currentPrice}
        bid={bid}
        ask={ask}
        spread={spread}
        marketStatus={marketStatus}
        marketSource={marketSource}
        lastUpdatedText={lastUpdatedText}
        latencyMs={latencyMs}
        dailyChange={dailyChange}
        dailyChangePercent={dailyChangePercent}
        algoArmed={algoArmed}
        onToggleAlgo={handleToggleAlgo}
        onEmergencyKillSwitch={handleEmergencyKillSwitch}
        onOpenAiAnalyst={() => setIsAiModalOpen(true)}
        riskLocked={riskProfile.isLocked}
        equity={riskProfile.equity}
        onReconnect={reconnect}
      />

      {/* Emergency Kill Switch Banner if active */}
      {killSwitchTriggered && (
        <div className="bg-[#ef4444] text-[#080808] px-4 py-2 text-xs font-mono font-bold flex items-center justify-between z-40">
          <span>
            ⚠️ EMERGENCY KILL SWITCH ACTIVE: Algorithm disarmed. All automatic executions blocked.
          </span>
          <button
            onClick={handleResetLocks}
            className="underline uppercase cursor-pointer hover:opacity-80"
          >
            Acknowledge &amp; Reset Lock
          </button>
        </div>
      )}

      {/* 2. Main Workspace Layout: Sidebar + Active View */}
      <div className="flex flex-1 overflow-hidden relative">
        <LeftSidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          collapsed={collapsedSidebar}
          onToggleCollapse={() => setCollapsedSidebar(!collapsedSidebar)}
          openPositionsCount={positions.length}
          riskProfile={riskProfile}
        />

        {/* View Router */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {currentTab === 'HOME' && (
            <HomeView
              currentPrice={currentPrice}
              candles={candles}
              signal={signal}
              riskProfile={riskProfile}
              algoArmed={algoArmed}
              onQuickExecute={handleQuickExecute}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'MARKET' && (
            <MarketView
              candles={candles}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
              currentPrice={currentPrice}
            />
          )}

          {currentTab === 'ALGO' && (
            <AlgoView
              currentPrice={currentPrice}
              candles={candles}
              signal={signal}
              regime={regime}
              structure={structure}
              mtf={mtf}
            />
          )}

          {currentTab === 'EXECUTION' && (
            <ExecutionView
              currentPrice={currentPrice}
              riskProfile={riskProfile}
              onExecuteOrder={handleExecuteOrder}
            />
          )}

          {currentTab === 'POSITIONS' && (
            <PositionsView
              positions={positions}
              currentPrice={currentPrice}
              onClosePosition={handleClosePosition}
              onSetBreakEven={handleSetBreakEven}
              onToggleTrailing={handleToggleTrailing}
              onCloseAllPositions={handleCloseAllPositions}
            />
          )}

          {currentTab === 'BACKTEST' && <BacktestView />}

          {currentTab === 'ANALYTICS' && <AnalyticsView />}

          {currentTab === 'JOURNAL' && <JournalView />}

          {currentTab === 'BROKERS' && (
            <BrokersView
              source={marketSource}
              onSelectSource={setSource}
            />
          )}

          {currentTab === 'SETTINGS' && (
            <SettingsView
              riskProfile={riskProfile}
              onUpdateRiskProfile={up => setRiskProfile(prev => ({ ...prev, ...up }))}
              onResetLocks={handleResetLocks}
            />
          )}
        </main>
      </div>

      {/* 3. Global Status Footer Bar with live latency & provider */}
      <FooterBar
        algoArmed={algoArmed}
        latency={`${latencyMs}ms`}
        brokerName={marketSource === 'BROKER EXECUTION DATA' ? 'HFM // MT5 DEMO (#49711913)' : 'HFM / MT5 GLOBAL FEED'}
        marketStatus={marketStatus}
        marketSource={marketSource}
        providerName={quote?.providerName || 'HFM / MetaTrader 5 (HF Markets SV Ltd)'}
        lastUpdatedText={lastUpdatedText}
      />

      {/* 4. AI Market Analyst Modal */}
      <AiAnalystModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentPrice={currentPrice}
        candles={candles}
        signal={signal}
        riskProfile={riskProfile}
      />
    </div>
  );
}

export default function App() {
  return (
    <LiveMarketDataProvider>
      <TradingTerminal />
    </LiveMarketDataProvider>
  );
}
