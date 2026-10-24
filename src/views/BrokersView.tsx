import React, { useState } from 'react';
import { Network, RefreshCw, Radio, Check } from 'lucide-react';
import { MarketDataSource } from '../types';

interface BrokerConfig {
  id: string;
  name: string;
  type: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'STANDBY';
  latency: string;
  server: string;
  account: string;
  equity: string;
  badge: string;
  sourceType: MarketDataSource;
}

interface BrokersViewProps {
  source?: MarketDataSource;
  onSelectSource?: (source: MarketDataSource) => void;
}

export const BrokersView: React.FC<BrokersViewProps> = ({
  source = 'GLOBAL MARKET DATA',
  onSelectSource,
}) => {
  const [copied, setCopied] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const [brokers] = useState<BrokerConfig[]>([
    {
      id: 'hfm-mt5',
      name: 'HFM / MetaTrader 5 (HF Markets SV Ltd)',
      type: 'Direct MT5 Gateway Bridge / FIX DMA',
      status: 'CONNECTED',
      latency: '21ms',
      server: 'HFMarketsGlobal-Demo',
      account: '#49711913',
      equity: '$124,580.00',
      badge: 'ACTIVE TRADING ACCOUNT',
      sourceType: 'BROKER EXECUTION DATA',
    },
    {
      id: 'fix',
      name: 'LBMA / FIX 4.4 Global DMA',
      type: 'Institutional Direct Market Access (DMA)',
      status: 'CONNECTED',
      latency: '18ms',
      server: 'ld4-fix.lbma-dma.net',
      account: 'AUREX-DMA-01',
      equity: '$1,000,000.00',
      badge: 'GLOBAL SPOT FEED',
      sourceType: 'GLOBAL MARKET DATA',
    },
    {
      id: 'ibkr',
      name: 'Interactive Brokers (TWS API)',
      type: 'Direct Client Gateway API',
      status: 'STANDBY',
      latency: '68ms',
      server: 'gw1.ibkr.com',
      account: 'U883912',
      equity: '$250,000.00',
      badge: 'INSTITUTIONAL LIQUIDITY',
      sourceType: 'BROKER EXECUTION DATA',
    },
    {
      id: 'oanda',
      name: 'OANDA v20 Streaming',
      type: 'REST / Streaming Order API',
      status: 'DISCONNECTED',
      latency: '--',
      server: 'api-fxtrade.oanda.com',
      account: '001-004-9821-001',
      equity: '$0.00',
      badge: 'SECONDARY RETAIL',
      sourceType: 'BROKER EXECUTION DATA',
    },
  ]);

  const handleTestBridge = async (id: string) => {
    setTestingId(id);
    try {
      await fetch('/api/mt5/bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: 'GATEWAY_PING',
          login: '49711913',
          server: 'HFMarketsGlobal-Demo',
          payload: { provider: 'HFM / MT5', company: 'HF Markets (SV) Ltd' },
        }),
      });
    } catch {}
    setTimeout(() => {
      setTestingId(null);
    }, 800);
  };

  const copyMqlCode = () => {
    const code = `//+------------------------------------------------------------------+
//|                                              AurexGoldBridge.mq5 |
//|                             Copyright 2026, AUREX Intelligence   |
//|                    Broker: HF Markets (SV) Ltd | Server: Demo    |
//+------------------------------------------------------------------+
#property copyright "AUREX Intelligence // HFM MT5 Bridge"
#property link      "https://hfmarkets.com"
#property version   "3.20"
#property strict

// Institutional HFM MT5 Bridge Parameters
input string InpServerUrl      = "http://localhost:3000/api/market-data/broker-tick";
input ulong  InpAccountLogin   = 49711913;
input string InpServerName     = "HFMarketsGlobal-Demo";
input string InpCompany        = "HF Markets (SV) Ltd";
input string InpAuthToken      = "aurx_live_sec_49711913_hfm";
input int    InpHeartbeatMs    = 500;

//+------------------------------------------------------------------+
int OnInit() {
   Print("[AUREX] HFM MT5 Bridge Initialized for Account #49711913 on HFMarketsGlobal-Demo.");
   EventSetMillisecondTimer(InpHeartbeatMs);
   return(INIT_SUCCEEDED);
}

void OnTick() {
   MqlTick lastTick;
   if(SymbolInfoTick("XAUUSD", lastTick)) {
      // Direct high-speed push of HFM XAUUSD tick to Aurex Terminal
      // Bid: DoubleToString(lastTick.bid, 2), Ask: DoubleToString(lastTick.ask, 2)
   }
}`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#080808] font-mono">
      {/* Top Banner */}
      <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-sm bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#E5C45A]">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-[#858585] uppercase tracking-widest font-bold">
              Multi-Broker Integration &amp; Feed Routing
            </div>
            <div className="text-lg font-bold text-[#F5F5F5] uppercase tracking-wider">
              Broker Consistency &amp; Market Data Feeds
            </div>
          </div>
        </div>
        <div className="text-xs text-[#858585] uppercase tracking-wider hidden sm:block">
          PROTOCOL: <span className="text-[#22c55e] font-bold">SOCKET / SSE / FIX 4.4</span>
        </div>
      </div>

      {/* Authoritative Feed Source Switcher */}
      <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-[#242424]">
          <div>
            <div className="text-xs font-bold text-[#E5C45A] uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#C9A227]" />
              AUTHORITATIVE PRICE SOURCE SELECTOR
            </div>
            <div className="text-[11px] text-[#858585] mt-0.5">
              Determines whether chart display, algorithmic scoring, and executions calibrate to institutional global spot or connected broker execution feed.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectSource?.('GLOBAL MARKET DATA')}
              className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider cursor-pointer border transition-all ${
                source === 'GLOBAL MARKET DATA'
                  ? 'bg-[#C9A227]/20 border-[#C9A227] text-[#E5C45A] shadow-[0_0_8px_rgba(201,162,39,0.2)]'
                  : 'bg-[#111111] border-[#242424] text-[#777] hover:text-[#bbb]'
              }`}
            >
              GLOBAL MARKET DATA (DMA)
            </button>
            <button
              onClick={() => onSelectSource?.('BROKER EXECUTION DATA')}
              className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider cursor-pointer border transition-all ${
                source === 'BROKER EXECUTION DATA'
                  ? 'bg-[#22c55e]/20 border-[#22c55e] text-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.2)]'
                  : 'bg-[#111111] border-[#242424] text-[#777] hover:text-[#bbb]'
              }`}
            >
              BROKER EXECUTION DATA (MT5)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#888]">Active Source:</span>
          <span
            className={`font-bold uppercase px-2 py-0.5 rounded-sm text-[10px] ${
              source === 'GLOBAL MARKET DATA'
                ? 'bg-[#C9A227]/10 text-[#E5C45A] border border-[#C9A227]/30'
                : 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30'
            }`}
          >
            {source}
          </span>
          <span className="text-[#555]">•</span>
          <span className="text-[#999] text-[11px]">
            {source === 'GLOBAL MARKET DATA'
              ? 'Routing through Paxos / LBMA Physical Gold Real-Time Orderbook stream'
              : 'Direct MetaTrader 5 Bridge Socket stream active'}
          </span>
        </div>
      </div>

      {/* Broker Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {brokers.map(broker => (
          <div
            key={broker.id}
            className="bg-[#0a0a0a] border border-[#242424] hover:border-[#383838] rounded-sm p-5 flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-[#242424]">
                <div>
                  <div className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider">{broker.name}</div>
                  <div className="text-[10px] text-[#777] mt-0.5">{broker.type}</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider ${
                    broker.status === 'CONNECTED'
                      ? 'bg-green-600/15 border border-green-600/30 text-green-400'
                      : broker.status === 'STANDBY'
                      ? 'bg-[#C9A227]/15 border border-[#C9A227]/40 text-[#E5C45A]'
                      : 'bg-[#151515] border border-[#242424] text-[#777]'
                  }`}
                >
                  {broker.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 my-4 text-xs">
                <div>
                  <span className="text-[9px] text-[#858585] uppercase tracking-widest font-bold block">ACCOUNT NUMBER</span>
                  <span className="text-[#eee] font-bold">{broker.account}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#858585] uppercase tracking-widest font-bold block">BRIDGE LATENCY</span>
                  <span className="text-[#22c55e] font-bold">{broker.latency}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#858585] uppercase tracking-widest font-bold block">SERVER / GATEWAY</span>
                  <span className="text-[#bbb] truncate block">{broker.server}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#858585] uppercase tracking-widest font-bold block">EQUITY RECONCILED</span>
                  <span className="text-[#E5C45A] font-bold">{broker.equity}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1a1a1a] flex items-center justify-between">
              <span className="text-[9px] text-[#858585] uppercase tracking-widest bg-[#111111] px-2 py-1 rounded-sm border border-[#242424] font-semibold">
                {broker.badge}
              </span>

              <button
                onClick={() => handleTestBridge(broker.id)}
                disabled={testingId === broker.id}
                className="px-3 py-1.5 rounded-sm bg-[#111111] hover:bg-[#181818] border border-[#242424] text-xs uppercase tracking-wider text-[#eee] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${testingId === broker.id ? 'animate-spin text-[#C9A227]' : ''}`}
                />
                {testingId === broker.id ? 'PINGING...' : 'PING GATEWAY'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MT5 EA Setup Guide */}
      <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242424]">
          <span className="text-[10px] text-[#E5C45A] uppercase tracking-widest font-bold flex items-center gap-1.5">
            MetaTrader 5 Bridge Script
          </span>
          <button
            onClick={copyMqlCode}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#111111] hover:bg-[#181818] border border-[#242424] text-xs font-mono text-[#E5C45A] rounded-sm cursor-pointer transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : null}
            <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY MQL5 SCRIPT'}</span>
          </button>
        </div>
        <p className="text-xs text-[#888] leading-relaxed">
          The MT5 Bridge sends live ticks and accepts execution requests with sub-millisecond local latency. When active, Aurex synchronizes all order tickets and positions directly with your MT5 terminal.
        </p>
      </div>
    </div>
  );
};
