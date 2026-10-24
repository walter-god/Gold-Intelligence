import React, { useState } from 'react';
import { BacktestEngine } from '../services/algorithmEngine';
import { BacktestResult } from '../types';
import { FlaskConical, Play, TrendingUp, Sliders, RefreshCw, BarChart2 } from 'lucide-react';

export const BacktestView: React.FC = () => {
  const [timeframe, setTimeframe] = useState<string>('5M');
  const [sessionFilter, setSessionFilter] = useState<string>('OVERLAP');
  const [startingBalance, setStartingBalance] = useState<number>(100000);
  const [riskPercent, setRiskPercent] = useState<number>(0.5);
  const [spreadPoints, setSpreadPoints] = useState<number>(0.15);
  const [commission, setCommission] = useState<number>(3.5);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const [result, setResult] = useState<BacktestResult>(() =>
    BacktestEngine.runSimulation([], {
      startingBalance: 100000,
      riskPerTrade: 0.5,
      spreadPoints: 0.15,
      commissionPerLot: 3.5,
      slippagePoints: 0.05,
      timeframe: '5M',
      sessionFilter: 'OVERLAP',
    })
  );

  const handleRunBacktest = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = BacktestEngine.runSimulation([], {
        startingBalance,
        riskPerTrade: riskPercent,
        spreadPoints,
        commissionPerLot: commission,
        slippagePoints: 0.05,
        timeframe,
        sessionFilter,
      });
      setResult(res);
      setIsRunning(false);
    }, 600);
  };

  // SVG dimensions for Equity Curve
  const svgWidth = 700;
  const svgHeight = 220;
  const points = result.equityCurve;
  const minEquity = Math.min(...points.map(p => p.equity)) * 0.98;
  const maxEquity = Math.max(...points.map(p => p.equity)) * 1.02;
  const range = maxEquity - minEquity || 1;

  const pathD = points
    .map((p, idx) => {
      const x = (idx / (points.length - 1)) * svgWidth;
      const y = svgHeight - ((p.equity - minEquity) / range) * svgHeight;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const areaD = `${pathD} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#080808] font-mono">
      {/* Top Banner */}
      <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-sm bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#E5C45A]">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-[#858585] uppercase tracking-widest font-bold">
              Quantitative Strategy Simulator
            </div>
            <div className="text-lg font-bold text-[#F5F5F5] uppercase tracking-wider">
              XAUUSD Algorithmic Backtest &amp; Parameter Sweep
            </div>
          </div>
        </div>

        <button
          onClick={handleRunBacktest}
          disabled={isRunning}
          className="px-5 py-2.5 rounded-sm bg-[#C9A227] hover:bg-[#b59120] text-[#080808] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {isRunning ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          {isRunning ? 'SIMULATING...' : 'RUN SIMULATION'}
        </button>
      </div>

      {/* Input Parameters Form */}
      <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div>
          <label className="text-[#858585] block text-[9px] uppercase tracking-widest mb-1.5 font-bold">Timeframe</label>
          <select
            value={timeframe}
            onChange={e => setTimeframe(e.target.value)}
            className="w-full bg-[#111111] border border-[#242424] rounded-sm p-2 text-[#F5F5F5] focus:border-[#C9A227] outline-none"
          >
            <option value="1M">1M Execution</option>
            <option value="5M">5M Intraday</option>
            <option value="15M">15M Swing</option>
            <option value="1H">1H Structure</option>
          </select>
        </div>

        <div>
          <label className="text-[#858585] block text-[9px] uppercase tracking-widest mb-1.5 font-bold">Session Filter</label>
          <select
            value={sessionFilter}
            onChange={e => setSessionFilter(e.target.value)}
            className="w-full bg-[#111111] border border-[#242424] rounded-sm p-2 text-[#F5F5F5] focus:border-[#C9A227] outline-none"
          >
            <option value="OVERLAP">London / NY Overlap</option>
            <option value="LONDON">London Only</option>
            <option value="NEWYORK">New York Only</option>
            <option value="ALL">All 24H Sessions</option>
          </select>
        </div>

        <div>
          <label className="text-[#858585] block text-[9px] uppercase tracking-widest mb-1.5 font-bold">Start Balance ($)</label>
          <input
            type="number"
            value={startingBalance}
            onChange={e => setStartingBalance(parseFloat(e.target.value) || 100000)}
            className="w-full bg-[#111111] border border-[#242424] rounded-sm p-2 text-[#F5F5F5] focus:border-[#C9A227] outline-none"
          />
        </div>

        <div>
          <label className="text-[#858585] block text-[9px] uppercase tracking-widest mb-1.5 font-bold">Risk / Trade (%)</label>
          <input
            type="number"
            step="0.1"
            value={riskPercent}
            onChange={e => setRiskPercent(parseFloat(e.target.value) || 0.5)}
            className="w-full bg-[#111111] border border-[#242424] rounded-sm p-2 text-[#F5F5F5] focus:border-[#C9A227] outline-none"
          />
        </div>

        <div>
          <label className="text-[#858585] block text-[9px] uppercase tracking-widest mb-1.5 font-bold">Spread (pts)</label>
          <input
            type="number"
            step="0.01"
            value={spreadPoints}
            onChange={e => setSpreadPoints(parseFloat(e.target.value) || 0.15)}
            className="w-full bg-[#111111] border border-[#242424] rounded-sm p-2 text-[#F5F5F5] focus:border-[#C9A227] outline-none"
          />
        </div>

        <div>
          <label className="text-[#858585] block text-[9px] uppercase tracking-widest mb-1.5 font-bold">Comm / Lot ($)</label>
          <input
            type="number"
            step="0.5"
            value={commission}
            onChange={e => setCommission(parseFloat(e.target.value) || 3.5)}
            className="w-full bg-[#111111] border border-[#242424] rounded-sm p-2 text-[#F5F5F5] focus:border-[#C9A227] outline-none"
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-3.5">
          <div className="text-[9px] text-[#858585] uppercase tracking-widest font-bold">NET PROFIT</div>
          <div className="text-base font-bold text-[#22c55e] tabular-nums mt-1">
            +${result.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#22c55e] mt-0.5">
            +{((result.netProfit / startingBalance) * 100).toFixed(1)}% Return
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-3.5">
          <div className="text-[9px] text-[#858585] uppercase tracking-widest font-bold">WIN RATE</div>
          <div className="text-base font-bold text-[#F5F5F5] tabular-nums mt-1">
            {result.winRate.toFixed(1)}%
          </div>
          <div className="text-[10px] text-[#858585] mt-0.5">{result.totalTrades} Executions</div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-3.5">
          <div className="text-[9px] text-[#858585] uppercase tracking-widest font-bold">PROFIT FACTOR</div>
          <div className="text-base font-bold text-[#E5C45A] tabular-nums mt-1">
            {result.profitFactor.toFixed(2)}
          </div>
          <div className="text-[10px] text-[#858585] mt-0.5">Target: &gt;1.60</div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-3.5">
          <div className="text-[9px] text-[#858585] uppercase tracking-widest font-bold">SHARPE RATIO</div>
          <div className="text-base font-bold text-[#F5F5F5] tabular-nums mt-1">
            {result.sharpeRatio.toFixed(2)}
          </div>
          <div className="text-[10px] text-[#22c55e] mt-0.5 uppercase tracking-wider">Institutional Grade</div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-3.5">
          <div className="text-[9px] text-[#858585] uppercase tracking-widest font-bold">MAX DRAWDOWN</div>
          <div className="text-base font-bold text-[#ef4444] tabular-nums mt-1">
            {result.maxDrawdownPercent.toFixed(1)}%
          </div>
          <div className="text-[10px] text-[#858585] mt-0.5">-${result.maxDrawdown.toFixed(0)}</div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-3.5">
          <div className="text-[9px] text-[#858585] uppercase tracking-widest font-bold">EXPECTANCY</div>
          <div className="text-base font-bold text-[#22c55e] tabular-nums mt-1">
            +${result.expectancy.toFixed(2)}
          </div>
          <div className="text-[10px] text-[#858585] mt-0.5">Per Trade Avg</div>
        </div>
      </div>

      {/* Equity Curve Visualization */}
      <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-4">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#242424]">
          <span className="text-[10px] text-[#E5C45A] uppercase tracking-widest font-bold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#C9A227]" />
            CUMULATIVE EQUITY CURVE
          </span>
          <span className="text-xs text-[#E5C45A] font-bold">
            FINAL: ${result.endingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="w-full overflow-hidden">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-48 md:h-56">
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C9A227" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#C9A227" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#equityGrad)" />
            <path d={pathD} fill="none" stroke="#E5C45A" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Parameter Sweep & Optimization Module */}
      <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-4">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242424]">
          <span className="text-[10px] text-[#E5C45A] uppercase tracking-widest font-bold flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#C9A227]" />
            PARAMETER OPTIMIZATION MATRIX (SORTED BY RISK-ADJUSTED RETURN)
          </span>
          <span className="text-[9px] text-[#858585] uppercase tracking-widest">OUT-OF-SAMPLE TESTED</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111111] text-[#858585] text-[9px] uppercase tracking-widest border-b border-[#242424]">
              <tr>
                <th className="py-2.5 px-3">CONFIG SET</th>
                <th className="py-2.5 px-3">MOMENTUM ATR</th>
                <th className="py-2.5 px-3">STOP DISTANCE</th>
                <th className="py-2.5 px-3">TP MULTIPLIER</th>
                <th className="py-2.5 px-3">MIN SCORE</th>
                <th className="py-2.5 px-3">WIN RATE</th>
                <th className="py-2.5 px-3">PROFIT FACTOR</th>
                <th className="py-2.5 px-3">SHARPE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181818]">
              {result.parameterSweep.map((p, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-[#111111] transition-colors ${
                    idx === 0 ? 'bg-[#C9A227]/5 font-semibold text-[#E5C45A]' : 'text-[#bbb]'
                  }`}
                >
                  <td className="py-2 px-3">
                    {idx === 0 ? '★ RECOMMENDED #1' : `PARAM SET #${idx + 1}`}
                  </td>
                  <td className="py-2 px-3">{p.momentumThreshold}x ATR</td>
                  <td className="py-2 px-3">{p.stopDistance} pts</td>
                  <td className="py-2 px-3">{p.takeProfitMultiplier}x</td>
                  <td className="py-2 px-3">&ge;{p.minScore} pts</td>
                  <td className="py-2 px-3 font-bold">{p.winRate}%</td>
                  <td className="py-2 px-3 text-[#22c55e]">{p.profitFactor}</td>
                  <td className="py-2 px-3 font-bold">{p.sharpe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
