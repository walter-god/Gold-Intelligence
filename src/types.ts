export type Timeframe = '1M' | '5M' | '15M' | '30M' | '1H' | '4H' | '1D';

export type MarketDataStatus = 'LIVE' | 'RECONNECTING' | 'DATA DELAYED' | 'OFFLINE' | 'CONNECTING';
export type MarketDataSource = 'GLOBAL MARKET DATA' | 'BROKER EXECUTION DATA';

export interface XauusdLiveQuote {
  symbol: 'XAUUSD';
  bid: number;
  ask: number;
  spread: number;
  mid: number;
  last: number;
  high24h: number;
  low24h: number;
  open24h: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  providerTimestamp: number;
  serverReceiptTimestamp: number;
  clientReceiptTimestamp?: number;
  latencyMs?: number;
  status: MarketDataStatus;
  source: MarketDataSource;
  providerName: string;
}

export type MarketQuote = XauusdLiveQuote;

export type NavigationTab =
  | 'HOME'
  | 'MARKET'
  | 'ALGO'
  | 'EXECUTION'
  | 'POSITIONS'
  | 'BACKTEST'
  | 'ANALYTICS'
  | 'JOURNAL'
  | 'BROKERS'
  | 'SETTINGS';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
  ema20?: number;
  ema50?: number;
  atr?: number;
}

export type MarketRegimeType =
  | 'TRENDING UP'
  | 'TRENDING DOWN'
  | 'RANGING'
  | 'HIGH VOLATILITY'
  | 'LOW VOLATILITY'
  | 'TRANSITION';

export type MarketStructureType =
  | 'BULLISH CONTINUATION (HH/HL)'
  | 'BEARISH CONTINUATION (LH/LL)'
  | 'BREAK OF STRUCTURE (BOS)'
  | 'CHANGE OF CHARACTER (CHoCH)'
  | 'RANGE EQUILIBRIUM'
  | 'POTENTIAL REVERSAL';

export interface LiquidityLevel {
  label: 'PDH' | 'PDL' | 'PDC' | 'ASIAN_HIGH' | 'ASIAN_LOW' | 'LONDON_HIGH' | 'LONDON_LOW' | 'EQH' | 'EQL' | 'ORDER_BLOCK' | 'FVG';
  price: number;
  type: 'resistance' | 'support' | 'zone' | 'imbalance';
  swept: boolean;
}

export type MomentumState = 'BULLISH MOMENTUM' | 'BEARISH MOMENTUM' | 'NEUTRAL';

export interface MultiTimeframeState {
  '1M': { bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; structure: string; momentum: number };
  '5M': { bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; structure: string; momentum: number };
  '15M': { bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; structure: string; momentum: number };
  '30M': { bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; structure: string; momentum: number };
  '1H': { bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; structure: string; momentum: number };
  '4H': { bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; structure: string; momentum: number };
  '1D': { bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; structure: string; momentum: number };
}

export type SignalConviction = 'NO TRADE' | 'WEAK' | 'WATCH' | 'STRONG' | 'HIGH CONVICTION';

export interface SignalScoreBreakdown {
  structure: number; // max 20
  liquidity: number; // max 20
  momentum: number; // max 15
  volatility: number; // max 10
  session: number; // max 10
  mtfConfirmation: number; // max 15
  spread: number; // max 5
  risk: number; // max 5
  total: number; // max 100
  conviction: SignalConviction;
  direction: 'BUY' | 'SELL' | 'WAIT';
  reasons: string[];
}

export interface SignalResult {
  score: number;
  direction: 'BUY' | 'SELL' | 'WAIT';
  regime: string;
  structure: number;
  liquidity: number;
  multiTimeframe: number;
}

export interface MarketSession {
  name: 'SYDNEY' | 'TOKYO' | 'LONDON' | 'NEW YORK';
  city: string;
  utcOpen: number; // UTC hour
  utcClose: number;
  status: 'ACTIVE' | 'UPCOMING' | 'CLOSED';
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  rangePoints: number;
  relativeVolume: number;
  volatility: 'LOW' | 'NORMAL' | 'ELEVATED' | 'EXTREME';
}

export interface FinancialCenter {
  id: string;
  name: string;
  hubType?: 'OTC_CLEARING' | 'FUTURES_EXCHANGE' | 'REFINERY' | 'SOVEREIGN_VAULT' | 'MINING_HUB';
  vaultName?: string;
  vaultTonnage?: string;
  lat: number;
  lon: number;
  session: string;
  status: 'ACTIVE' | 'CLOSED' | 'UPCOMING';
  volumeShare: string;
  spread: string;
  clearingMechanism?: string;
}

export interface GoldCorridor {
  id: string;
  from: string;
  to: string;
  fromName: string;
  toName: string;
  dailyVolume: string;
  monthlyTonnage: string;
  category: 'OTC_CLEARING' | 'PHYSICAL_BULLION' | 'CENTRAL_BANK' | 'REFINERY_FLOW';
  flowTypeDescription: string;
  activeDirection: 'A_TO_B' | 'B_TO_A' | 'BIDIRECTIONAL';
}

export interface CountryGoldTrade {
  partnerCountryCode: string;
  partnerCountryName: string;
  type: 'EXPORT' | 'IMPORT';
  annualValueUsd: string;
  annualTonnage: string;
  primaryProduct: string;
}

export interface CountryGoldProfile {
  code: string;
  name: string;
  flagEmoji: string;
  region: 'NORTH_AMERICA' | 'EUROPE' | 'ASIA_PACIFIC' | 'MIDDLE_EAST' | 'AFRICA' | 'SOUTH_AMERICA';
  lat: number;
  lon: number;
  reservesTonnage: number;
  reservesRank: number;
  reservesShareOfFx: number;
  vaultDepository: string;
  annualMineOutputMT: number;
  mineProductionRank: number;
  keyMines: string[];
  annualConsumerDemandMT: number;
  jewelryDemandMT: number;
  barAndCoinDemandMT: number;
  centralBankNetPurchasesMT12M: number;
  centralBankStance: 'AGGRESSIVE_ACCUMULATOR' | 'STRATEGIC_HOLDER' | 'NET_BUYER' | 'REPATRIATING' | 'NEUTRAL';
  primaryExchange: string;
  primaryMintsRefineries: string[];
  taxRegime: string;
  locoSpotPremium: string;
  trades: CountryGoldTrade[];
  summary: string;
}

export interface Position {
  id: string;
  ticket?: number;
  symbol: 'XAUUSD';
  direction: 'BUY' | 'SELL';
  sizeLots: number;
  entryPrice: number;
  currentPrice?: number;
  stopLoss: number;
  takeProfit: number;
  sl?: number;
  tp?: number;
  pnl: number;
  pnlPoints?: number;
  openTime: string | number;
  strategy?: string;
  trailingActive?: boolean;
  trailingStopActive?: boolean;
  breakEvenSet?: boolean;
  candleCloseExit?: boolean;
}

export interface OrderTicket {
  direction: 'BUY' | 'SELL';
  sizeLots: number;
  riskPercent: number;
  entryPrice: number;
  slPoints: number;
  tpPoints: number;
  trailingStopPoints?: number;
  mode: 'MANUAL' | 'SEMI-AUTO' | 'AUTO';
  candleCloseExit?: boolean;
}

export interface RiskProfile {
  equity: number;
  balance: number;
  marginUsed: number;
  marginAvailable: number;
  marginLevelPercent: number;
  dailyPnL: number;
  dailyDrawdownPercent: number;
  maxDailyLossPercent: number;
  maxDrawdownLimitPercent: number;
  riskPerTradePercent: number;
  maxLotSize: number;
  maxOpenPositions: number;
  maxConsecutiveLosses: number;
  currentConsecutiveLosses: number;
  spreadLockThreshold: number;
  volatilityLockATR: number;
  newsLockActive: boolean;
  tradeThroughNews: boolean;
  isLocked: boolean;
  lockedReason?: string;
}

export interface BrokerAdapter {
  id: string;
  name: string;
  type: 'MT5_BRIDGE' | 'INTERACTIVE_BROKERS' | 'OANDA' | 'ALPACA' | 'CTRADER' | 'FIX_API';
  status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' | 'MAINTENANCE';
  latencyMs: number;
  accountNumber: string;
  server: string;
  leverage: string;
  currency: string;
  lastPing: number;
}

export interface BacktestResult {
  symbol: 'XAUUSD';
  timeframe: Timeframe;
  period: string;
  startingBalance: number;
  endingBalance: number;
  netProfit: number;
  returnPercent: number;
  winRate: number;
  profitFactor: number;
  expectancy: number;
  maxDrawdownPercent: number;
  maxDrawdown: number;
  sharpeRatio: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  longTrades: number;
  shortTrades: number;
  avgWin: number;
  avgLoss: number;
  bestSession: string;
  worstSession: string;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  equityCurve: { time: string; equity: number }[];
  parameterSweep: {
    momentumThreshold: number;
    stopDistance: number;
    takeProfitMultiplier: number;
    minScore: number;
    winRate: number;
    profitFactor: number;
    sharpe: number;
  }[];
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  ticket: number;
  symbol: 'XAUUSD';
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  sizeLots: number;
  pnl: number;
  signalScore: number;
  regime: MarketRegimeType;
  session: string;
  setup: string;
  reason: string;
  executionQuality: 'PRISTINE' | 'GOOD' | 'SLIPPAGE' | 'SUB-OPTIMAL';
  slippagePts: number;
  commission: number;
  notes: string;
  chartSnapshotUrl?: string;
}

export interface EconomicEvent {
  id: string;
  time: string;
  currency: 'USD';
  name: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  actual?: string;
  forecast?: string;
  previous?: string;
  isUpcoming: boolean;
  minutesUntil: number;
}
