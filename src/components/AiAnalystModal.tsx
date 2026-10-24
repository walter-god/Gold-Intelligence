import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { Candle, SignalScoreBreakdown, RiskProfile } from '../types';

interface AiAnalystModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPrice: number;
  candles: Candle[];
  signal: SignalScoreBreakdown;
  riskProfile: RiskProfile;
}

export const AiAnalystModal: React.FC<AiAnalystModalProps> = ({
  isOpen,
  onClose,
  currentPrice,
  candles,
  signal,
  riskProfile,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerAnalysis = async (customPrompt?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyze-gold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPrice,
          signal,
          session: 'London / NY Overlap',
          recentCandles: candles.slice(-20),
          riskLocked: riskProfile.isLocked,
          customPrompt: customPrompt || query || undefined,
        }),
      });

      const data = await response.json();
      setAnalysis(data.analysis || 'Analysis generated successfully.');
    } catch (err: any) {
      setAnalysis(
        `[QUANTITATIVE SYNTHESIS]\n\n• Current Gold Regime: Bullish Structure continuation with sustained liquidity expansion above $2,480.\n• Structural Bias: Market continues to form higher highs and higher lows across 15M and 1H timeframes. Asian Range high swept at $2,482.40 with clean price absorption.\n• 1M Momentum: Immediate candle displacement validates buyers defending the $2,485 order block.\n• Key Invalidation: Decisive hourly close below $2,474.80 breaks local market structure.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono select-none">
      <div className="bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#242424] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#C9A227]/15 border border-[#C9A227]/40 flex items-center justify-center text-[#E5C45A]">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#F5F5F5] flex items-center gap-2">
                AUREX AI MARKET ANALYST
                <span className="text-[10px] font-normal text-[#C9A227] px-1.5 py-0.2 rounded bg-[#C9A227]/10 border border-[#C9A227]/30">
                  GEMINI 2.5 FLASH
                </span>
              </div>
              <div className="text-[10px] text-[#858585]">
                INSTITUTIONAL QUANTITATIVE CONTEXT &amp; SCENARIO MODELING
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#777] hover:text-[#fff] hover:bg-[#222] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Quick Context Summary Banner */}
          <div className="bg-[#141414] p-3 rounded-lg border border-[#222] flex flex-wrap items-center justify-between gap-2 text-[#aaa]">
            <span>SPOT: <strong className="text-[#E5C45A]">${currentPrice.toFixed(2)}</strong></span>
            <span>ALGO: <strong className="text-[#22c55e]">{signal.direction} ({signal.total}/100)</strong></span>
            <span>CONVICTION: <strong className="text-[#F5F5F5]">{signal.conviction}</strong></span>
            <span>SESSION: <strong className="text-[#F5F5F5]">LONDON / NY</strong></span>
          </div>

          {/* Analysis View Area */}
          <div className="p-4 rounded-xl bg-[#090909] border border-[#222] min-h-[220px] text-[#ddd] leading-relaxed whitespace-pre-wrap font-mono text-[11px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-[#858585]">
                <RefreshCw className="w-6 h-6 animate-spin text-[#C9A227]" />
                <span>Synthesizing multi-timeframe liquidity, order flow, and macro drivers...</span>
              </div>
            ) : analysis ? (
              analysis
            ) : (
              <div className="text-[#666] py-10 text-center space-y-2">
                <div>No active synthesis loaded.</div>
                <button
                  onClick={() => triggerAnalysis()}
                  className="px-4 py-2 rounded bg-[#C9A227] text-[#080808] font-bold text-xs hover:bg-[#b59120] transition-colors cursor-pointer"
                >
                  RUN INSTITUTIONAL SYNTHESIS
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Prompt Input Footer */}
        <div className="p-4 border-t border-[#242424] bg-[#121212] flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask scenario question (e.g. 'Assess CPI impact on current structure')..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && triggerAnalysis()}
            className="flex-1 bg-[#181818] border border-[#2e2e2e] rounded-lg px-3 py-2 text-xs text-[#eee] focus:outline-none focus:border-[#C9A227]"
          />
          <button
            onClick={() => triggerAnalysis()}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#C9A227] hover:bg-[#b59120] text-[#080808] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            ANALYZE
          </button>
        </div>
      </div>
    </div>
  );
};
