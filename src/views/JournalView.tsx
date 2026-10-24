import React, { useState } from 'react';
import { BookOpen, Download, Search, CheckCircle2, XCircle, FileText } from 'lucide-react';

interface JournalEntry {
  id: string;
  timestamp: string;
  broker: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  lots: number;
  entryPrice: number;
  exitPrice: number;
  pnlDollar: number;
  pnlPoints: number;
  score: number;
  regime: string;
  session: string;
  executionQuality: string;
  notes: string;
}

export const JournalView: React.FC = () => {
  const [filterResult, setFilterResult] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: 'TR-9821',
      timestamp: '2026-09-04 13:45 UTC',
      broker: 'IC Markets Raw ECN',
      symbol: 'XAUUSD',
      direction: 'BUY',
      lots: 2.5,
      entryPrice: 2478.4,
      exitPrice: 2486.2,
      pnlDollar: 1950.0,
      pnlPoints: 7.8,
      score: 88,
      regime: 'TRENDING BULLISH',
      session: 'LONDON / NY OVERLAP',
      executionQuality: '38ms • 0.01 slip',
      notes: 'Clean Asian High sweep with instant 1M bullish displacement absorption.',
    },
    {
      id: 'TR-9820',
      timestamp: '2026-09-04 10:15 UTC',
      broker: 'IC Markets Raw ECN',
      symbol: 'XAUUSD',
      direction: 'BUY',
      lots: 2.0,
      entryPrice: 2471.2,
      exitPrice: 2476.9,
      pnlDollar: 1140.0,
      pnlPoints: 5.7,
      score: 82,
      regime: 'TRENDING BULLISH',
      session: 'LONDON SESSION',
      executionQuality: '42ms • 0.02 slip',
      notes: 'London open expansion impulse through 5M FVG support.',
    },
    {
      id: 'TR-9819',
      timestamp: '2026-09-04 06:30 UTC',
      broker: 'IC Markets Raw ECN',
      symbol: 'XAUUSD',
      direction: 'SELL',
      lots: 1.5,
      entryPrice: 2475.8,
      exitPrice: 2478.1,
      pnlDollar: -345.0,
      pnlPoints: -2.3,
      score: 68,
      regime: 'RANGING',
      session: 'ASIAN SESSION',
      executionQuality: '45ms • 0.00 slip',
      notes: 'Cut early as Asian session volume lacked continuation through range low.',
    },
    {
      id: 'TR-9818',
      timestamp: '2026-09-03 16:10 UTC',
      broker: 'IC Markets Raw ECN',
      symbol: 'XAUUSD',
      direction: 'BUY',
      lots: 2.5,
      entryPrice: 2465.0,
      exitPrice: 2473.4,
      pnlDollar: 2100.0,
      pnlPoints: 8.4,
      score: 91,
      regime: 'TRENDING BULLISH',
      session: 'NEW YORK SESSION',
      executionQuality: '36ms • 0.01 slip',
      notes: 'US initial jobless claims reaction into PDL liquidity pool.',
    },
  ]);

  const filtered = entries.filter(e => {
    if (filterResult === 'WIN' && e.pnlDollar <= 0) return false;
    if (filterResult === 'LOSS' && e.pnlDollar > 0) return false;
    if (
      searchQuery &&
      !e.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !e.notes.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !e.regime.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = 'ID,Timestamp,Broker,Symbol,Direction,Lots,Entry,Exit,PnL_$,PnL_Pts,Score,Regime,Session,Notes\n';
    const rows = entries
      .map(
        e =>
          `${e.id},"${e.timestamp}","${e.broker}",${e.symbol},${e.direction},${e.lots},${e.entryPrice},${e.exitPrice},${e.pnlDollar},${e.pnlPoints},${e.score},"${e.regime}","${e.session}","${e.notes}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AUREX_XAUUSD_Journal_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#080808] font-mono">
      {/* Top Banner */}
      <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-sm bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#E5C45A]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-[#858585] uppercase tracking-widest font-bold">
              Automated Institutional Logs
            </div>
            <div className="text-lg font-bold text-[#F5F5F5] uppercase tracking-wider">
              XAUUSD Execution Trade Journal
            </div>
          </div>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2 rounded-sm bg-[#111111] hover:bg-[#181818] border border-[#242424] text-xs uppercase tracking-wider text-[#F5F5F5] font-bold flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Download className="w-4 h-4 text-[#C9A227]" />
          EXPORT AUDIT CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 bg-[#111111] p-1 rounded-sm border border-[#242424]">
          {(['ALL', 'WIN', 'LOSS'] as const).map(r => (
            <button
              key={r}
              onClick={() => setFilterResult(r)}
              className={`px-3 py-1 rounded-sm text-[10px] uppercase tracking-wider font-bold transition-colors cursor-pointer ${
                filterResult === r
                  ? 'bg-[#C9A227] text-[#080808]'
                  : 'text-[#858585] hover:text-[#F5F5F5]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#666] absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search notes, regime..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#111111] border border-[#242424] rounded-sm pl-8 pr-3 py-1.5 text-xs text-[#F5F5F5] outline-none focus:border-[#C9A227]"
          />
        </div>
      </div>

      {/* Journal Entries List */}
      <div className="space-y-3">
        {filtered.map(entry => {
          const isWin = entry.pnlDollar >= 0;
          return (
            <div
              key={entry.id}
              className="bg-[#0a0a0a] border border-[#242424] hover:border-[#383838] rounded-sm p-4 transition-all"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#242424]">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                      entry.direction === 'BUY'
                        ? 'bg-green-600/15 text-green-400 border border-green-600/30'
                        : 'bg-red-600/15 text-red-400 border border-red-600/30'
                    }`}
                  >
                    {entry.direction} {entry.lots} LOTS
                  </span>
                  <div>
                    <span className="font-bold text-[#F5F5F5] tracking-wider">{entry.symbol}</span>
                    <span className="text-[10px] text-[#666] ml-2">ID: {entry.id}</span>
                  </div>
                  <span className="text-xs text-[#858585] hidden sm:inline">
                    {entry.timestamp}
                  </span>
                </div>

                <div className="text-right">
                  <div
                    className={`text-base font-bold tabular-nums ${
                      isWin ? 'text-[#22c55e]' : 'text-[#ef4444]'
                    }`}
                  >
                    {isWin ? '+' : ''}${entry.pnlDollar.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-[#888]">
                    {entry.pnlPoints >= 0 ? '+' : ''}
                    {entry.pnlPoints.toFixed(2)} pts
                  </div>
                </div>
              </div>

              {/* Data Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs py-3 text-[#aaa]">
                <div>
                  <span className="text-[#666] block text-[9px] uppercase tracking-widest font-bold">ENTRY / EXIT</span>
                  <span className="text-[#eee]">${entry.entryPrice} → ${entry.exitPrice}</span>
                </div>
                <div>
                  <span className="text-[#666] block text-[9px] uppercase tracking-widest font-bold">ALGO SCORE</span>
                  <span className="text-[#E5C45A] font-bold">{entry.score} / 100</span>
                </div>
                <div>
                  <span className="text-[#666] block text-[9px] uppercase tracking-widest font-bold">SESSION</span>
                  <span className="text-[#eee]">{entry.session}</span>
                </div>
                <div>
                  <span className="text-[#666] block text-[9px] uppercase tracking-widest font-bold">REGIME</span>
                  <span className="text-[#eee]">{entry.regime}</span>
                </div>
                <div>
                  <span className="text-[#666] block text-[9px] uppercase tracking-widest font-bold">LATENCY</span>
                  <span className="text-[#eee]">{entry.executionQuality}</span>
                </div>
                <div>
                  <span className="text-[#666] block text-[9px] uppercase tracking-widest font-bold">BROKER</span>
                  <span className="text-[#eee] truncate block">{entry.broker}</span>
                </div>
              </div>

              {/* Rationale & Notes */}
              <div className="mt-2 pt-2.5 border-t border-[#181818] text-xs text-[#888] flex items-start gap-2">
                <FileText className="w-3.5 h-3.5 text-[#C9A227] shrink-0 mt-0.5" />
                <span className="italic text-[#ccc]">{entry.notes}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
