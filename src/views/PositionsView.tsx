import React from 'react';
import { Position } from '../types';
import { ShieldAlert, ArrowUpRight, ArrowDownRight, XCircle, CheckCircle2, Sliders, AlertOctagon } from 'lucide-react';

interface PositionsViewProps {
  positions: Position[];
  currentPrice: number;
  onClosePosition: (id: string) => void;
  onSetBreakEven: (id: string) => void;
  onToggleTrailing: (id: string) => void;
  onCloseAllPositions: () => void;
}

export const PositionsView: React.FC<PositionsViewProps> = ({
  positions,
  currentPrice,
  onClosePosition,
  onSetBreakEven,
  onToggleTrailing,
  onCloseAllPositions,
}) => {
  // Compute floating total P/L
  const totalFloatingPnl = positions.reduce((acc, pos) => {
    const diff = pos.direction === 'BUY' ? currentPrice - pos.entryPrice : pos.entryPrice - currentPrice;
    return acc + diff * pos.sizeLots * 100;
  }, 0);

  const totalLots = positions.reduce((acc, pos) => acc + pos.sizeLots, 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-[#080808] font-mono">
      {/* Top Positions Metric Summary Strip */}
      <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-[9px] text-[#858585] uppercase tracking-widest">Open Positions</div>
            <div className="text-xl font-bold text-[#F5F5F5]">{positions.length} ACTIVE</div>
          </div>
          <div className="h-8 w-px bg-[#242424]" />
          <div>
            <div className="text-[9px] text-[#858585] uppercase tracking-widest">Total Volume</div>
            <div className="text-xl font-bold text-[#E5C45A]">{totalLots.toFixed(2)} LOTS</div>
          </div>
          <div className="h-8 w-px bg-[#242424]" />
          <div>
            <div className="text-[9px] text-[#858585] uppercase tracking-widest">Floating P&amp;L</div>
            <div
              className={`text-xl font-bold ${
                totalFloatingPnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'
              }`}
            >
              {totalFloatingPnl >= 0 ? '+' : ''}${totalFloatingPnl.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Emergency Close All Button */}
        {positions.length > 0 && (
          <button
            onClick={onCloseAllPositions}
            className="px-4 py-2 rounded-sm bg-red-600/15 border border-red-600/40 hover:bg-red-600/25 text-red-400 text-xs font-bold tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer"
          >
            <AlertOctagon className="w-4 h-4" />
            CLOSE ALL POSITIONS ({positions.length})
          </button>
        )}
      </div>

      {/* Positions Table */}
      <div className="bg-[#0a0a0a] border border-[#242424] rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[#242424] flex items-center justify-between">
          <span className="text-[10px] text-[#E5C45A] uppercase tracking-widest font-bold">
            Portfolio Monitor &amp; Live Order Reconciliation
          </span>
          <span className="text-[10px] text-[#22c55e] flex items-center gap-1 uppercase tracking-wider font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            MT5 TICK STREAM ACTIVE
          </span>
        </div>

        {positions.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#666] space-y-2">
            <div className="uppercase tracking-wider">No open positions currently active.</div>
            <div className="text-[11px] text-[#444] uppercase tracking-wider">
              Algorithmic signals and manual orders will appear here automatically.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111111] text-[#858585] text-[9px] uppercase tracking-widest border-b border-[#242424]">
                <tr>
                  <th className="py-3 px-4">POSITION</th>
                  <th className="py-3 px-4">TYPE</th>
                  <th className="py-3 px-4">LOTS</th>
                  <th className="py-3 px-4">ENTRY</th>
                  <th className="py-3 px-4">CURRENT</th>
                  <th className="py-3 px-4">SL / TP</th>
                  <th className="py-3 px-4">FLOATING P&amp;L</th>
                  <th className="py-3 px-4">DYNAMIC EXITS</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181818]">
                {positions.map(pos => {
                  const points =
                    pos.direction === 'BUY'
                      ? currentPrice - pos.entryPrice
                      : pos.entryPrice - currentPrice;
                  const livePnl = points * pos.sizeLots * 100;
                  const isProfit = livePnl >= 0;

                  return (
                    <tr key={pos.id} className="hover:bg-[#111111] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#F5F5F5]">
                        <div className="flex items-center gap-1.5">
                          <span>XAUUSD</span>
                          <span className="text-[9px] text-[#666]">#{pos.id.slice(-4)}</span>
                        </div>
                        <div className="text-[10px] text-[#777]">{pos.openTime}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                            pos.direction === 'BUY'
                              ? 'bg-green-600/15 text-green-400 border border-green-600/30'
                              : 'bg-red-600/15 text-red-400 border border-red-600/30'
                          }`}
                        >
                          {pos.direction === 'BUY' ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {pos.direction}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-[#E5C45A]">
                        {pos.sizeLots} <span className="text-[10px] text-[#777]">({(pos.sizeLots * 100).toFixed(0)} oz)</span>
                      </td>

                      <td className="py-3 px-4 text-[#ddd]">${pos.entryPrice.toFixed(2)}</td>

                      <td className="py-3 px-4 text-[#E5C45A] font-semibold">
                        ${currentPrice.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-[11px]">
                        <div className="text-[#ef4444]">SL: ${pos.stopLoss.toFixed(2)}</div>
                        <div className="text-[#22c55e]">TP: ${pos.takeProfit.toFixed(2)}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div
                          className={`text-sm font-bold tabular-nums ${
                            isProfit ? 'text-[#22c55e]' : 'text-[#ef4444]'
                          }`}
                        >
                          {isProfit ? '+' : ''}${livePnl.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-[#888]">
                          {points >= 0 ? '+' : ''}
                          {points.toFixed(2)} pts
                        </div>
                      </td>

                      {/* Dynamic Exits Toggles */}
                      <td className="py-3 px-4 space-y-1">
                        <button
                          onClick={() => onSetBreakEven(pos.id)}
                          className="px-2 py-0.5 rounded-sm text-[9px] uppercase tracking-wider bg-[#151515] hover:bg-[#202020] border border-[#242424] text-[#aaa] hover:text-[#fff] block cursor-pointer"
                        >
                          SET BE (+0.2 pts)
                        </button>
                        <button
                          onClick={() => onToggleTrailing(pos.id)}
                          className={`px-2 py-0.5 rounded-sm text-[9px] uppercase tracking-wider border block cursor-pointer ${
                            pos.trailingActive
                              ? 'bg-[#C9A227]/15 border-[#C9A227]/40 text-[#E5C45A]'
                              : 'bg-[#151515] border-[#242424] text-[#777]'
                          }`}
                        >
                          TRAILING: {pos.trailingActive ? 'ON' : 'OFF'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onClosePosition(pos.id)}
                          className="px-3 py-1.5 rounded-sm bg-red-600/15 hover:bg-red-600/25 border border-red-600/30 text-red-400 font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
                        >
                          CLOSE
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
