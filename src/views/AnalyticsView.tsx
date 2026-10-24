import React from 'react';
import { BarChart3, TrendingUp, PieChart, Clock, Calendar, ShieldCheck, Activity } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const sessionStats = [
    { session: 'London / NY Overlap', trades: 142, winRate: 71.8, pnl: '+$48,240', pf: 2.14 },
    { session: 'London Session', trades: 184, winRate: 67.4, pnl: '+$39,520', pf: 1.88 },
    { session: 'New York Session', trades: 165, winRate: 64.2, pnl: '+$28,410', pf: 1.72 },
    { session: 'Asian Session', trades: 98, winRate: 52.0, pnl: '+$4,150', pf: 1.15 },
  ];

  const weekdayStats = [
    { day: 'Monday', winRate: 63.4, pnl: '+$14,200' },
    { day: 'Tuesday', winRate: 72.1, pnl: '+$31,400' },
    { day: 'Wednesday', winRate: 69.5, pnl: '+$28,900' },
    { day: 'Thursday', winRate: 70.8, pnl: '+$32,100' },
    { day: 'Friday', winRate: 58.2, pnl: '+$13,720' },
  ];

  const regimeStats = [
    { regime: 'Trending Bullish', winRate: 74.2, pnl: '+$52,100', trades: 210 },
    { regime: 'Trending Bearish', winRate: 71.0, pnl: '+$44,300', trades: 185 },
    { regime: 'High Volatility', winRate: 61.5, pnl: '+$18,200', trades: 112 },
    { regime: 'Ranging / Consolidation', winRate: 48.4, pnl: '+$5,720', trades: 82 },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#080808] font-mono">
      {/* Top Banner */}
      <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-sm bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#E5C45A]">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-[#858585] uppercase tracking-widest font-bold">
              Quantitative Performance Analytics
            </div>
            <div className="text-lg font-bold text-[#F5F5F5] uppercase tracking-wider">
              XAUUSD Algorithmic Alpha Decomposition
            </div>
          </div>
        </div>
        <div className="text-xs text-[#858585] uppercase tracking-wider hidden sm:block">
          AUDITED PERIOD: <span className="text-[#E5C45A] font-bold">LAST 365 DAYS</span>
        </div>
      </div>

      {/* Primary Key Ratios Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-3.5">
          <div className="text-[9px] text-[#858585] uppercase tracking-widest font-bold">SHARPE RATIO</div>
          <div className="text-lg font-bold text-[#F5F5F5] mt-1">2.28</div>
          <div className="text-[10px] text-[#22c55e] mt-0.5 uppercase tracking-wider">Benchmark &gt; 1.50</div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-3.5">
          <div className="text-[9px] text-[#858585] uppercase tracking-widest font-bold">SORTINO RATIO</div>
          <div className="text-lg font-bold text-[#E5C45A] mt-1">3.14</div>
          <div className="text-[10px] text-[#22c55e] mt-0.5 uppercase tracking-wider">Low Downside Risk</div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-3.5">
          <div className="text-[9px] text-[#858585] uppercase tracking-widest font-bold">CALMAR RATIO</div>
          <div className="text-lg font-bold text-[#F5F5F5] mt-1">4.82</div>
          <div className="text-[10px] text-[#858585] mt-0.5">Ann. Return / Max DD</div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-3.5">
          <div className="text-[9px] text-[#858585] uppercase tracking-widest font-bold">PROFIT FACTOR</div>
          <div className="text-lg font-bold text-[#22c55e] mt-1">1.94</div>
          <div className="text-[10px] text-[#858585] mt-0.5">Gross Win / Loss</div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-3.5">
          <div className="text-[9px] text-[#858585] uppercase tracking-widest font-bold">MAX DRAWDOWN</div>
          <div className="text-lg font-bold text-[#ef4444] mt-1">3.8%</div>
          <div className="text-[10px] text-[#858585] mt-0.5">Peak to Trough</div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-3.5">
          <div className="text-[9px] text-[#858585] uppercase tracking-widest font-bold">AVG HOLD TIME</div>
          <div className="text-lg font-bold text-[#F5F5F5] mt-1">18.4m</div>
          <div className="text-[10px] text-[#858585] mt-0.5">Intraday Scalp</div>
        </div>
      </div>

      {/* Performance by Session & Weekday */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Breakdown by Session */}
        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242424]">
            <span className="text-[10px] text-[#E5C45A] uppercase tracking-widest font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#C9A227]" />
              PERFORMANCE BY MARKET SESSION
            </span>
            <span className="text-[9px] text-[#858585] uppercase tracking-widest font-bold">589 TOTAL TRADES</span>
          </div>

          <div className="space-y-2.5">
            {sessionStats.map(s => (
              <div key={s.session} className="p-3 rounded-sm bg-[#111111] border border-[#242424] text-xs">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-[#F5F5F5]">{s.session}</span>
                  <span className="font-bold text-[#22c55e]">{s.pnl}</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#888]">
                  <span>Win Rate: <strong className="text-[#eee]">{s.winRate}%</strong> ({s.trades} trades)</span>
                  <span>Profit Factor: <strong className="text-[#E5C45A]">{s.pf}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown by Day of Week */}
        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242424]">
            <span className="text-[10px] text-[#E5C45A] uppercase tracking-widest font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#C9A227]" />
              PERFORMANCE BY DAY OF WEEK
            </span>
            <span className="text-[9px] text-[#858585] uppercase tracking-widest font-bold">WIN RATE HEATMAP</span>
          </div>

          <div className="space-y-2.5">
            {weekdayStats.map(w => (
              <div key={w.day} className="flex items-center justify-between p-2.5 rounded-sm bg-[#111111] border border-[#242424] text-xs">
                <span className="w-24 font-bold text-[#F5F5F5]">{w.day}</span>
                <div className="flex-1 mx-3 h-1.5 bg-[#181818] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C9A227]"
                    style={{ width: `${w.winRate}%` }}
                  />
                </div>
                <span className="w-14 text-right text-[#bbb] font-semibold">{w.winRate}%</span>
                <span className="w-20 text-right text-[#22c55e] font-bold">{w.pnl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breakdown by Market Regime */}
      <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-4">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242424]">
          <span className="text-[10px] text-[#E5C45A] uppercase tracking-widest font-bold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#C9A227]" />
            ALPHA GENERATION BY VOLATILITY REGIME
          </span>
          <span className="text-[9px] text-[#22c55e] uppercase tracking-wider font-semibold">OPTIMAL: TRENDING REGIMES</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {regimeStats.map(r => (
            <div key={r.regime} className="p-3.5 rounded-sm bg-[#111111] border border-[#242424]">
              <div className="font-bold text-[#F5F5F5] mb-1">{r.regime}</div>
              <div className="text-base font-bold text-[#22c55e] tabular-nums">{r.pnl}</div>
              <div className="text-[11px] text-[#888] mt-1.5">
                Win Rate: <strong className="text-[#eee]">{r.winRate}%</strong>
              </div>
              <div className="text-[10px] text-[#666] mt-0.5">{r.trades} Trades Logged</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
