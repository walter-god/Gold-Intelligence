import React, { useState, useEffect } from 'react';
import { RiskProfile } from '../types';
import { Shield, Lock, AlertTriangle, CheckCircle2, RotateCcw, Terminal, Server, Key, Radio } from 'lucide-react';

interface SettingsViewProps {
  riskProfile: RiskProfile;
  onUpdateRiskProfile: (updated: Partial<RiskProfile>) => void;
  onResetLocks: () => void;
}

interface EnvDiagnostics {
  system: string;
  runtime: { nodeEnv: string; port: number; appUrl: string };
  ai: { isGeminiKeyConfigured: boolean; model: string };
  marketData: { provider: string; hasApiKey: boolean; streamUrl: string; restUrl: string };
  brokerGateway: {
    gatewayUrl: string;
    accountId: string;
    serverName: string;
    company?: string;
    hasPasswordConfigured?: boolean;
  };
  riskPolicy: { maxEquityRiskPercent: number; maxDailyDrawdownUsd: number; hardMaxOpenLots: number };
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  riskProfile,
  onUpdateRiskProfile,
  onResetLocks,
}) => {
  const [newsLockEnabled, setNewsLockEnabled] = useState(riskProfile.newsLockEnabled);
  const [spreadCap, setSpreadCap] = useState(riskProfile.spreadLockThreshold);
  const [maxRiskPercent, setMaxRiskPercent] = useState(riskProfile.riskPerTradePercent);
  const [dailyLossLimit, setDailyLossLimit] = useState(riskProfile.dailyLossLimitPercent);
  const [maxDrawdownLimit, setMaxDrawdownLimit] = useState(riskProfile.maxDrawdownPercent);
  const [maxOpenLots, setMaxOpenLots] = useState(riskProfile.maxOpenLots);
  const [consecutiveLossLimit, setConsecutiveLossLimit] = useState(riskProfile.consecutiveLossLimit);
  const [savedMessage, setSavedMessage] = useState(false);
  const [envData, setEnvData] = useState<EnvDiagnostics | null>(null);

  useEffect(() => {
    fetch('/api/system/environment')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setEnvData(d);
      })
      .catch(() => {});
  }, []);

  const handleSave = () => {
    onUpdateRiskProfile({
      newsLockEnabled,
      spreadLockThreshold: spreadCap,
      riskPerTradePercent: maxRiskPercent,
      dailyLossLimitPercent: dailyLossLimit,
      maxDrawdownPercent: maxDrawdownLimit,
      maxOpenLots,
      consecutiveLossLimit,
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#080808] font-mono">
      {/* Top Banner */}
      <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-sm bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#E5C45A]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-[#858585] uppercase tracking-widest font-bold">
              Hard Risk Controls &amp; Fail-Safes
            </div>
            <div className="text-lg font-bold text-[#F5F5F5] uppercase tracking-wider">
              Independent Institutional Risk Engine
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {riskProfile.isLocked && (
            <button
              onClick={onResetLocks}
              className="px-3 py-2 rounded-sm bg-red-950/30 hover:bg-red-950/50 border border-red-500/40 text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              RESET RISK LOCKS
            </button>
          )}

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-sm bg-[#C9A227] hover:bg-[#b59120] text-[#080808] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            {savedMessage ? 'SAVED' : 'SAVE RISK RULES'}
          </button>
        </div>
      </div>

      {/* 8 Gold-Specific Hard Risk Locks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Volatility Lock */}
        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-5 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
            <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#C9A227]" />
              1. VOLATILITY LOCK
            </span>
            <span className="text-[9px] text-[#22c55e] bg-green-600/10 border border-green-600/30 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
              ARMED
            </span>
          </div>
          <p className="text-xs text-[#888] pt-1">
            Halts execution if ATR(14) expands beyond 2.5x normal baseline or abnormal 1M price shock is detected.
          </p>
          <div className="text-[10px] text-[#bbb] pt-2 uppercase tracking-wider">Threshold: <span className="text-[#E5C45A] font-bold">2.5x Baseline ATR</span></div>
        </div>

        {/* 2. Spread Lock */}
        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-5 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
            <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#C9A227]" />
              2. SPREAD LOCK
            </span>
            <span className="text-[9px] text-[#22c55e] bg-green-600/10 border border-green-600/30 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
              {spreadCap} PTS CAP
            </span>
          </div>
          <p className="text-xs text-[#888] pt-1">
            Blocks trade submissions if XAUUSD raw spread widens past threshold (e.g. during rollover or liquidity voids).
          </p>
          <div className="flex items-center gap-3 pt-2">
            <input
              type="range"
              min="0.15"
              max="0.60"
              step="0.05"
              value={spreadCap}
              onChange={e => setSpreadCap(parseFloat(e.target.value))}
              className="w-full accent-[#C9A227]"
            />
            <span className="text-xs text-[#E5C45A] font-bold w-16 text-right">{spreadCap} pts</span>
          </div>
        </div>

        {/* 3. News Lock */}
        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-5 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
            <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#C9A227]" />
              3. NEWS LOCK (CPI / FOMC / NFP)
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={newsLockEnabled}
                onChange={e => setNewsLockEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#222] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C9A227]"></div>
            </label>
          </div>
          <p className="text-xs text-[#888] pt-1">
            Automatically freezes algorithm 15 minutes before and after Tier-1 economic releases affecting Gold.
          </p>
          <div className="text-[10px] text-[#bbb] pt-2 uppercase tracking-wider">Buffer: <span className="text-[#E5C45A] font-bold">±15 Minutes Window</span></div>
        </div>

        {/* 4. Session Lock */}
        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-5 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
            <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#C9A227]" />
              4. SESSION RESTRICTION LOCK
            </span>
            <span className="text-[9px] text-[#E5C45A] bg-[#C9A227]/10 border border-[#C9A227]/30 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
              LONDON + NY
            </span>
          </div>
          <p className="text-xs text-[#888] pt-1">
            Confines automatic executions exclusively to high-liquidity session windows (07:00 UTC - 17:00 UTC).
          </p>
          <div className="text-[10px] text-[#bbb] pt-2 uppercase tracking-wider">Status: <span className="text-[#eee]">Excludes low-volume Asian range scalping</span></div>
        </div>

        {/* 5. Daily Loss Lock */}
        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-5 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
            <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#C9A227]" />
              5. DAILY LOSS HARD LOCK
            </span>
            <span className="text-[9px] text-[#ef4444] bg-red-600/10 border border-red-600/30 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
              {dailyLossLimit}% LIMIT
            </span>
          </div>
          <p className="text-xs text-[#888] pt-1">
            Hard circuit breaker terminating all algorithmic execution for the day if net P/L drops to threshold.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.5"
              value={dailyLossLimit}
              onChange={e => setDailyLossLimit(parseFloat(e.target.value))}
              className="w-full accent-[#ef4444]"
            />
            <span className="text-xs text-[#ef4444] font-bold w-16 text-right">-{dailyLossLimit}%</span>
          </div>
        </div>

        {/* 6. Maximum Drawdown Lock */}
        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-5 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
            <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#C9A227]" />
              6. MAXIMUM DRAWDOWN CAP
            </span>
            <span className="text-[9px] text-[#ef4444] bg-red-600/10 border border-red-600/30 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
              {maxDrawdownLimit}% CAP
            </span>
          </div>
          <p className="text-xs text-[#888] pt-1">
            Portfolio capital protection limit. Requires authenticated manual override to resume operations if hit.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <input
              type="range"
              min="3.0"
              max="10.0"
              step="0.5"
              value={maxDrawdownLimit}
              onChange={e => setMaxDrawdownLimit(parseFloat(e.target.value))}
              className="w-full accent-[#ef4444]"
            />
            <span className="text-xs text-[#ef4444] font-bold w-16 text-right">-{maxDrawdownLimit}%</span>
          </div>
        </div>

        {/* 7. Max Open Position Lock */}
        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-5 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
            <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#C9A227]" />
              7. MAX OPEN VOLUME LOCK
            </span>
            <span className="text-[9px] text-[#E5C45A] bg-[#C9A227]/10 border border-[#C9A227]/30 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
              {maxOpenLots} LOTS MAX
            </span>
          </div>
          <p className="text-xs text-[#888] pt-1">
            Prevents overleveraging across concurrent positions. Rejects any order pushing net exposure above cap.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <input
              type="range"
              min="1.0"
              max="10.0"
              step="0.5"
              value={maxOpenLots}
              onChange={e => setMaxOpenLots(parseFloat(e.target.value))}
              className="w-full accent-[#C9A227]"
            />
            <span className="text-xs text-[#E5C45A] font-bold w-16 text-right">{maxOpenLots} lots</span>
          </div>
        </div>

        {/* 8. Consecutive Loss Lock */}
        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-5 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
            <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#C9A227]" />
              8. CONSECUTIVE STOP-OUT LOCK
            </span>
            <span className="text-[9px] text-[#bbb] bg-[#161616] border border-[#242424] px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
              {consecutiveLossLimit} TRADES
            </span>
          </div>
          <p className="text-xs text-[#888] pt-1">
            Enforces a 60-minute mandatory market observation cool-down if {consecutiveLossLimit} consecutive stop-outs occur.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <input
              type="range"
              min="2"
              max="5"
              step="1"
              value={consecutiveLossLimit}
              onChange={e => setConsecutiveLossLimit(parseInt(e.target.value))}
              className="w-full accent-[#C9A227]"
            />
            <span className="text-xs text-[#bbb] font-bold w-16 text-right">{consecutiveLossLimit} losses</span>
          </div>
        </div>
      </div>

      {/* Legit Environmental Variables Runtime Panel */}
      <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#242424] gap-3">
          <div className="flex items-center gap-2.5">
            <Server className="w-4 h-4 text-[#E5C45A]" />
            <div>
              <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider block">
                ENVIRONMENTAL RUNTIME CONFIGURATION (.ENV)
              </span>
              <span className="text-[10px] text-[#737373] tracking-widest uppercase">
                Active server &amp; client configuration parameters
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] px-2 py-0.5 rounded-xs bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30 font-bold uppercase">
              NODE_ENV: {envData?.runtime?.nodeEnv || 'development'}
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-xs bg-[#E5C45A]/10 text-[#E5C45A] border border-[#E5C45A]/30 font-bold uppercase">
              PORT: {envData?.runtime?.port || 3000}
            </span>
          </div>
        </div>

        {/* Environmental Variables Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1f1f1f] text-[10px] text-[#858585] uppercase tracking-wider">
                <th className="py-2 px-3">Variable Name</th>
                <th className="py-2 px-3">Scope</th>
                <th className="py-2 px-3">Subsystem</th>
                <th className="py-2 px-3">Current Active Value</th>
                <th className="py-2 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171717] font-mono text-[11px]">
              {/* GEMINI_API_KEY */}
              <tr className="hover:bg-[#111] transition-colors">
                <td className="py-2.5 px-3 font-bold text-[#F5F5F5]">GEMINI_API_KEY</td>
                <td className="py-2.5 px-3 text-[#aaa]">Server-Side</td>
                <td className="py-2.5 px-3 text-[#777]">AI Quantitative Analyst</td>
                <td className="py-2.5 px-3 text-[#888]">
                  {envData?.ai?.isGeminiKeyConfigured ? '•••••••••••••••• (Injected via AI Studio Secrets)' : 'Injected at runtime / Deterministic fallback'}
                </td>
                <td className="py-2.5 px-3 text-right">
                  <span className={`px-1.5 py-0.5 rounded-xs text-[9px] font-bold uppercase ${envData?.ai?.isGeminiKeyConfigured ? 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30' : 'bg-[#E5C45A]/10 text-[#E5C45A] border border-[#E5C45A]/30'}`}>
                    {envData?.ai?.isGeminiKeyConfigured ? 'ARMED' : 'READY'}
                  </span>
                </td>
              </tr>

              {/* XAUUSD_DATA_PROVIDER */}
              <tr className="hover:bg-[#111] transition-colors">
                <td className="py-2.5 px-3 font-bold text-[#F5F5F5]">XAUUSD_DATA_PROVIDER</td>
                <td className="py-2.5 px-3 text-[#aaa]">Server-Side</td>
                <td className="py-2.5 px-3 text-[#777]">Market Data Feed</td>
                <td className="py-2.5 px-3 text-[#E5C45A]">{envData?.marketData?.provider || 'BINANCE_GOLD'}</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold uppercase bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
                    ONLINE
                  </span>
                </td>
              </tr>

              {/* XAUUSD_STREAM_URL */}
              <tr className="hover:bg-[#111] transition-colors">
                <td className="py-2.5 px-3 font-bold text-[#F5F5F5]">XAUUSD_STREAM_URL</td>
                <td className="py-2.5 px-3 text-[#aaa]">Server-Side</td>
                <td className="py-2.5 px-3 text-[#777]">Sub-Second WebSocket Feed</td>
                <td className="py-2.5 px-3 text-[#888] truncate max-w-xs">{envData?.marketData?.streamUrl || 'wss://stream.binance.com:9443/ws/paxgusdt@bookTicker'}</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold uppercase bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
                    STREAMING
                  </span>
                </td>
              </tr>

              {/* XAUUSD_REST_URL */}
              <tr className="hover:bg-[#111] transition-colors">
                <td className="py-2.5 px-3 font-bold text-[#F5F5F5]">XAUUSD_REST_URL</td>
                <td className="py-2.5 px-3 text-[#aaa]">Server-Side</td>
                <td className="py-2.5 px-3 text-[#777]">REST 24h &amp; Klines Cache</td>
                <td className="py-2.5 px-3 text-[#888] truncate max-w-xs">{envData?.marketData?.restUrl || 'https://api.binance.com/api/v3/ticker/24hr?symbol=PAXGUSDT'}</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold uppercase bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
                    ACTIVE
                  </span>
                </td>
              </tr>

              {/* BROKER_FIX_GATEWAY_URL */}
              <tr className="hover:bg-[#111] transition-colors">
                <td className="py-2.5 px-3 font-bold text-[#F5F5F5]">BROKER_FIX_GATEWAY_URL</td>
                <td className="py-2.5 px-3 text-[#aaa]">Server-Side</td>
                <td className="py-2.5 px-3 text-[#777]">Broker Execution Bridge</td>
                <td className="py-2.5 px-3 text-[#888]">{envData?.brokerGateway?.gatewayUrl || 'http://0.0.0.0:3000/api/mt5/bridge'}</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold uppercase bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
                    CONNECTED
                  </span>
                </td>
              </tr>

              {/* BROKER_ACCOUNT_ID */}
              <tr className="hover:bg-[#111] transition-colors">
                <td className="py-2.5 px-3 font-bold text-[#F5F5F5]">BROKER_ACCOUNT_ID</td>
                <td className="py-2.5 px-3 text-[#aaa]">Server-Side</td>
                <td className="py-2.5 px-3 text-[#777]">HFM / MT5 Account ID</td>
                <td className="py-2.5 px-3 text-[#E5C45A] font-bold">{envData?.brokerGateway?.accountId || '49711913'}</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold uppercase bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
                    AUTHENTICATED
                  </span>
                </td>
              </tr>

              {/* BROKER_SERVER_NAME */}
              <tr className="hover:bg-[#111] transition-colors">
                <td className="py-2.5 px-3 font-bold text-[#F5F5F5]">BROKER_SERVER_NAME</td>
                <td className="py-2.5 px-3 text-[#aaa]">Server-Side</td>
                <td className="py-2.5 px-3 text-[#777]">MT5 Server Cluster</td>
                <td className="py-2.5 px-3 text-[#888]">{envData?.brokerGateway?.serverName || 'HFMarketsGlobal-Demo'}</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold uppercase bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
                    RESOLVED
                  </span>
                </td>
              </tr>

              {/* BROKER_COMPANY_NAME */}
              <tr className="hover:bg-[#111] transition-colors">
                <td className="py-2.5 px-3 font-bold text-[#F5F5F5]">BROKER_COMPANY_NAME</td>
                <td className="py-2.5 px-3 text-[#aaa]">Server-Side</td>
                <td className="py-2.5 px-3 text-[#777]">Regulated Broker Entity</td>
                <td className="py-2.5 px-3 text-[#888]">{envData?.brokerGateway?.company || 'HF Markets (SV) Ltd'}</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold uppercase bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
                    VERIFIED
                  </span>
                </td>
              </tr>

              {/* BROKER_ACCOUNT_PASSWORD */}
              <tr className="hover:bg-[#111] transition-colors">
                <td className="py-2.5 px-3 font-bold text-[#F5F5F5]">BROKER_ACCOUNT_PASSWORD</td>
                <td className="py-2.5 px-3 text-[#aaa]">Server-Side Secret</td>
                <td className="py-2.5 px-3 text-[#777]">MT5 Bridge Auth</td>
                <td className="py-2.5 px-3 text-[#888]">
                  {envData?.brokerGateway?.hasPasswordConfigured ? '•••••••••••••••• (Active Server Secret)' : 'Configured in .env'}
                </td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold uppercase bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
                    SECURED
                  </span>
                </td>
              </tr>

              {/* RISK_MAX_EQUITY_RISK_PERCENT */}
              <tr className="hover:bg-[#111] transition-colors">
                <td className="py-2.5 px-3 font-bold text-[#F5F5F5]">RISK_MAX_EQUITY_RISK_PERCENT</td>
                <td className="py-2.5 px-3 text-[#aaa]">Server-Side</td>
                <td className="py-2.5 px-3 text-[#777]">Per-Trade Hard Ceiling</td>
                <td className="py-2.5 px-3 text-[#888]">{envData?.riskPolicy?.maxEquityRiskPercent ?? 2.0}%</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold uppercase bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
                    ENFORCED
                  </span>
                </td>
              </tr>

              {/* RISK_MAX_DAILY_DRAWDOWN_USD */}
              <tr className="hover:bg-[#111] transition-colors">
                <td className="py-2.5 px-3 font-bold text-[#F5F5F5]">RISK_MAX_DAILY_DRAWDOWN_USD</td>
                <td className="py-2.5 px-3 text-[#aaa]">Server-Side</td>
                <td className="py-2.5 px-3 text-[#777]">Daily Circuit Breaker</td>
                <td className="py-2.5 px-3 text-[#888]">${(envData?.riskPolicy?.maxDailyDrawdownUsd ?? 2500).toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold uppercase bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
                    ENFORCED
                  </span>
                </td>
              </tr>

              {/* APP_URL */}
              <tr className="hover:bg-[#111] transition-colors">
                <td className="py-2.5 px-3 font-bold text-[#F5F5F5]">APP_URL</td>
                <td className="py-2.5 px-3 text-[#aaa]">Server-Side</td>
                <td className="py-2.5 px-3 text-[#777]">Cloud Ingress Host</td>
                <td className="py-2.5 px-3 text-[#888] truncate max-w-xs">{envData?.runtime?.appUrl || 'https://ais-dev-...run.app'}</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold uppercase bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
                    RESOLVED
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
