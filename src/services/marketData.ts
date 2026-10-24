import { Candle, Timeframe, MarketSession, FinancialCenter, LiquidityLevel, EconomicEvent, GoldCorridor } from '../types';

export const INITIAL_GOLD_PRICE = 2488.45;

export const FINANCIAL_CENTERS: FinancialCenter[] = [
  {
    id: 'london',
    name: 'London (LBMA)',
    hubType: 'OTC_CLEARING',
    vaultName: 'Bank of England & LPMCL Commercial Vaults',
    vaultTonnage: '5,134 MT',
    lat: 51.5074,
    lon: -0.1278,
    session: 'LONDON',
    status: 'ACTIVE',
    volumeShare: '36.8%',
    spread: '0.10',
    clearingMechanism: 'LBMA Gold Fix & Aurum Electronic Unallocated Clearing',
  },
  {
    id: 'newyork',
    name: 'New York (COMEX)',
    hubType: 'FUTURES_EXCHANGE',
    vaultName: 'Federal Reserve Bank NY & COMEX Licensed Depositories',
    vaultTonnage: '6,190 MT',
    lat: 40.7128,
    lon: -74.006,
    session: 'NEW YORK',
    status: 'ACTIVE',
    volumeShare: '38.5%',
    spread: '0.10',
    clearingMechanism: 'CME ClearPort 100oz Futures Physical Delivery',
  },
  {
    id: 'zurich',
    name: 'Zurich (Swiss Refineries)',
    hubType: 'REFINERY',
    vaultName: 'Swiss National Bank & Ticino Refineries (Valcambi/PAMP/Argor)',
    vaultTonnage: '2,850 MT',
    lat: 47.3769,
    lon: 8.5417,
    session: 'LONDON',
    status: 'ACTIVE',
    volumeShare: '14.2%',
    spread: '0.11',
    clearingMechanism: '400oz Good Delivery to 1kg 999.9 Kilobar Conversion',
  },
  {
    id: 'dubai',
    name: 'Dubai (DMCC / City of Gold)',
    hubType: 'SOVEREIGN_VAULT',
    vaultName: 'DMCC High Security Vault & Emirates Gold Refineries',
    vaultTonnage: '1,420 MT',
    lat: 25.2048,
    lon: 55.2708,
    session: 'MIDDLE_EAST',
    status: 'ACTIVE',
    volumeShare: '11.4%',
    spread: '0.12',
    clearingMechanism: 'DGCX Physical Bullion & Duty-Free Transit Corridor',
  },
  {
    id: 'shanghai',
    name: 'Shanghai (SGE / PBOC)',
    hubType: 'FUTURES_EXCHANGE',
    vaultName: 'People\'s Bank of China & SGE Certified Vaults',
    vaultTonnage: '2,264 MT',
    lat: 31.2304,
    lon: 121.4737,
    session: 'ASIAN',
    status: 'CLOSED',
    volumeShare: '13.6%',
    spread: '0.12',
    clearingMechanism: 'Shanghai Gold Benchmark Price (SHAU) RMB Physical Deliveries',
  },
  {
    id: 'singapore',
    name: 'Singapore (SBMA / Le Freeport)',
    hubType: 'SOVEREIGN_VAULT',
    vaultName: 'Le Freeport High-Security Vault (Changi) & MAS Reserves',
    vaultTonnage: '820 MT',
    lat: 1.3521,
    lon: 103.8198,
    session: 'ASIAN',
    status: 'CLOSED',
    volumeShare: '7.8%',
    spread: '0.14',
    clearingMechanism: 'ASEAN Bullion Trading Hub & GST-Exempt Vault Custody',
  },
  {
    id: 'hongkong',
    name: 'Hong Kong (HKEX Gateway)',
    hubType: 'SOVEREIGN_VAULT',
    vaultName: 'HKIA Precious Metals Depository & CGSE Ring',
    vaultTonnage: '940 MT',
    lat: 22.3193,
    lon: 114.1694,
    session: 'ASIAN',
    status: 'CLOSED',
    volumeShare: '9.1%',
    spread: '0.13',
    clearingMechanism: 'Cross-Border Bullion Rail to Mainland China',
  },
  {
    id: 'tokyo',
    name: 'Tokyo (TOCOM)',
    hubType: 'FUTURES_EXCHANGE',
    vaultName: 'Bank of Japan & Tanaka Kikinzoku Vaults',
    vaultTonnage: '846 MT',
    lat: 35.6762,
    lon: 139.6503,
    session: 'TOKYO',
    status: 'CLOSED',
    volumeShare: '8.5%',
    spread: '0.14',
    clearingMechanism: 'TOCOM Standard 1kg Gold Contract (JPY Settled)',
  },
  {
    id: 'mumbai',
    name: 'Mumbai (IIBX / Zaveri Bazaar)',
    hubType: 'SOVEREIGN_VAULT',
    vaultName: 'Reserve Bank of India (Nagpur) & GIFT City Bullion Depot',
    vaultTonnage: '822 MT',
    lat: 19.076,
    lon: 72.8777,
    session: 'ASIAN',
    status: 'CLOSED',
    volumeShare: '8.1%',
    spread: '0.15',
    clearingMechanism: 'India International Bullion Exchange (IIBX) Import Quotas',
  },
  {
    id: 'perth',
    name: 'Perth (The Perth Mint)',
    hubType: 'MINING_HUB',
    vaultName: 'Perth Mint Sovereign Vault (Western Australia)',
    vaultTonnage: '680 MT',
    lat: -31.9505,
    lon: 115.8605,
    session: 'SYDNEY',
    status: 'CLOSED',
    volumeShare: '6.4%',
    spread: '0.16',
    clearingMechanism: 'Australian Dore Mine Refining & Kangaroo Coin Minting',
  },
  {
    id: 'johannesburg',
    name: 'Johannesburg (Rand Refinery)',
    hubType: 'REFINERY',
    vaultName: 'Rand Refinery Smelter & SARB Vaults (Germiston)',
    vaultTonnage: '750 MT',
    lat: -26.2041,
    lon: 28.0473,
    session: 'LONDON',
    status: 'ACTIVE',
    volumeShare: '5.2%',
    spread: '0.16',
    clearingMechanism: 'African Continental Dore Aggregation & Krugerrand Minting',
  },
  {
    id: 'toronto',
    name: 'Toronto (Royal Canadian Mint)',
    hubType: 'MINING_HUB',
    vaultName: 'RCM Ottawa & Toronto Institutional Depository',
    vaultTonnage: '490 MT',
    lat: 43.6532,
    lon: -79.3832,
    session: 'NEW YORK',
    status: 'ACTIVE',
    volumeShare: '4.8%',
    spread: '0.14',
    clearingMechanism: 'Canadian Gold Maple Leaf & 99.999% Five-Nines Refining',
  },
];

export const GOLD_CORRIDORS: GoldCorridor[] = [
  {
    id: 'corr-london-newyork',
    from: 'london',
    to: 'newyork',
    fromName: 'London (LBMA)',
    toName: 'New York (COMEX)',
    dailyVolume: '$18.4 Billion / day',
    monthlyTonnage: '480 MT / mo',
    category: 'OTC_CLEARING',
    flowTypeDescription: 'COMEX EFP (Exchange for Physical) & 400oz vs 100oz Arbitrage Transfers',
    activeDirection: 'BIDIRECTIONAL',
  },
  {
    id: 'corr-zurich-london',
    from: 'zurich',
    to: 'london',
    fromName: 'Zurich (Refineries)',
    toName: 'London (LBMA)',
    dailyVolume: '$9.2 Billion / day',
    monthlyTonnage: '240 MT / mo',
    category: 'REFINERY_FLOW',
    flowTypeDescription: 'Swiss 400oz Good Delivery Bar recasting and BoE Vault deliveries',
    activeDirection: 'A_TO_B',
  },
  {
    id: 'corr-zurich-dubai',
    from: 'zurich',
    to: 'dubai',
    fromName: 'Zurich (Refineries)',
    toName: 'Dubai (DMCC)',
    dailyVolume: '$6.8 Billion / day',
    monthlyTonnage: '175 MT / mo',
    category: 'PHYSICAL_BULLION',
    flowTypeDescription: 'High-purity Kilobars air-freighted via Emirates SkyCargo for Middle East re-export',
    activeDirection: 'A_TO_B',
  },
  {
    id: 'corr-dubai-mumbai',
    from: 'dubai',
    to: 'mumbai',
    fromName: 'Dubai (DMCC)',
    toName: 'Mumbai (IIBX)',
    dailyVolume: '$5.4 Billion / day',
    monthlyTonnage: '140 MT / mo',
    category: 'PHYSICAL_BULLION',
    flowTypeDescription: 'GIFT City India Bullion Exchange import quota physical shipments',
    activeDirection: 'A_TO_B',
  },
  {
    id: 'corr-london-hongkong',
    from: 'london',
    to: 'hongkong',
    fromName: 'London (LBMA)',
    toName: 'Hong Kong (HKEX)',
    dailyVolume: '$6.1 Billion / day',
    monthlyTonnage: '160 MT / mo',
    category: 'CENTRAL_BANK',
    flowTypeDescription: 'Asian institutional allocation & Chek Lap Kok airport vaulting',
    activeDirection: 'A_TO_B',
  },
  {
    id: 'corr-hongkong-shanghai',
    from: 'hongkong',
    to: 'shanghai',
    fromName: 'Hong Kong (Gateway)',
    toName: 'Shanghai (SGE)',
    dailyVolume: '$7.8 Billion / day',
    monthlyTonnage: '210 MT / mo',
    category: 'PHYSICAL_BULLION',
    flowTypeDescription: 'PBOC designated import channels feeding SGE spot physical demand',
    activeDirection: 'A_TO_B',
  },
  {
    id: 'corr-singapore-shanghai',
    from: 'singapore',
    to: 'shanghai',
    fromName: 'Singapore (SBMA)',
    toName: 'Shanghai (SGE)',
    dailyVolume: '$3.9 Billion / day',
    monthlyTonnage: '95 MT / mo',
    category: 'PHYSICAL_BULLION',
    flowTypeDescription: 'ASEAN-China physical bullion clearing and trade corridor',
    activeDirection: 'A_TO_B',
  },
  {
    id: 'corr-perth-singapore',
    from: 'perth',
    to: 'singapore',
    fromName: 'Perth (The Perth Mint)',
    toName: 'Singapore (SBMA)',
    dailyVolume: '$3.2 Billion / day',
    monthlyTonnage: '85 MT / mo',
    category: 'REFINERY_FLOW',
    flowTypeDescription: 'Western Australian doré mine output refined into 99.99% minted bars',
    activeDirection: 'A_TO_B',
  },
  {
    id: 'corr-johannesburg-zurich',
    from: 'johannesburg',
    to: 'zurich',
    fromName: 'Johannesburg (Rand Refinery)',
    toName: 'Zurich (Refineries)',
    dailyVolume: '$4.1 Billion / day',
    monthlyTonnage: '110 MT / mo',
    category: 'REFINERY_FLOW',
    flowTypeDescription: 'Deep-level Witwatersrand unrefined doré gold sent for Swiss assaying and assay refining',
    activeDirection: 'A_TO_B',
  },
  {
    id: 'corr-toronto-newyork',
    from: 'toronto',
    to: 'newyork',
    fromName: 'Toronto (RCM)',
    toName: 'New York (COMEX)',
    dailyVolume: '$2.8 Billion / day',
    monthlyTonnage: '75 MT / mo',
    category: 'PHYSICAL_BULLION',
    flowTypeDescription: 'North American overland secure transport to COMEX licensed depositories',
    activeDirection: 'A_TO_B',
  },
  {
    id: 'corr-tokyo-singapore',
    from: 'tokyo',
    to: 'singapore',
    fromName: 'Tokyo (TOCOM)',
    toName: 'Singapore (SBMA)',
    dailyVolume: '$2.2 Billion / day',
    monthlyTonnage: '55 MT / mo',
    category: 'OTC_CLEARING',
    flowTypeDescription: 'East Asian arbitrage balancing TOCOM futures against loco-Singapore spot',
    activeDirection: 'BIDIRECTIONAL',
  },
];

export const SESSIONS_DATA: MarketSession[] = [
  {
    name: 'TOKYO',
    city: 'Tokyo / Asian Liquidity',
    utcOpen: 0,
    utcClose: 9,
    status: 'CLOSED',
    openPrice: 2476.20,
    highPrice: 2482.40,
    lowPrice: 2474.80,
    rangePoints: 7.60,
    relativeVolume: 0.72,
    volatility: 'LOW',
  },
  {
    name: 'LONDON',
    city: 'London / European Fix',
    utcOpen: 7,
    utcClose: 16,
    status: 'ACTIVE',
    openPrice: 2481.10,
    highPrice: 2494.60,
    lowPrice: 2479.50,
    rangePoints: 15.10,
    relativeVolume: 1.48,
    volatility: 'ELEVATED',
  },
  {
    name: 'NEW YORK',
    city: 'New York / COMEX Pit',
    utcOpen: 12,
    utcClose: 21,
    status: 'ACTIVE',
    openPrice: 2485.30,
    highPrice: 2496.20,
    lowPrice: 2483.90,
    rangePoints: 12.30,
    relativeVolume: 1.62,
    volatility: 'NORMAL',
  },
];

export const LIQUIDITY_LEVELS: LiquidityLevel[] = [
  { label: 'PDH', price: 4434.30, type: 'resistance', swept: true },
  { label: 'PDL', price: 4383.85, type: 'support', swept: false },
  { label: 'PDC', price: 4428.16, type: 'zone', swept: true },
  { label: 'LONDON_HIGH', price: 4410.50, type: 'resistance', swept: true },
  { label: 'ASIAN_HIGH', price: 4398.20, type: 'resistance', swept: true },
  { label: 'ASIAN_LOW', price: 4386.40, type: 'support', swept: false },
  { label: 'ORDER_BLOCK', price: 4392.50, type: 'zone', swept: false },
  { label: 'FVG', price: 4394.80, type: 'imbalance', swept: false },
];

export function getDynamicLiquidityLevels(currentPrice: number): LiquidityLevel[] {
  if (currentPrice <= 0) return LIQUIDITY_LEVELS;
  return [
    { label: 'PDH', price: Math.round((currentPrice * 1.008) * 100) / 100, type: 'resistance', swept: true },
    { label: 'PDL', price: Math.round((currentPrice * 0.992) * 100) / 100, type: 'support', swept: false },
    { label: 'PDC', price: Math.round((currentPrice * 1.003) * 100) / 100, type: 'zone', swept: true },
    { label: 'LONDON_HIGH', price: Math.round((currentPrice * 1.004) * 100) / 100, type: 'resistance', swept: true },
    { label: 'ASIAN_HIGH', price: Math.round((currentPrice * 1.0015) * 100) / 100, type: 'resistance', swept: true },
    { label: 'ASIAN_LOW', price: Math.round((currentPrice * 0.997) * 100) / 100, type: 'support', swept: false },
    { label: 'ORDER_BLOCK', price: Math.round((currentPrice * 0.9985) * 100) / 100, type: 'zone', swept: false },
    { label: 'FVG', price: Math.round((currentPrice * 0.9995) * 100) / 100, type: 'imbalance', swept: false },
  ];
}

export const UPCOMING_ECONOMIC_EVENTS: EconomicEvent[] = [
  { id: '1', time: '14:30 UTC', currency: 'USD', name: 'US Core CPI (MoM)', impact: 'HIGH', forecast: '0.2%', previous: '0.2%', isUpcoming: true, minutesUntil: 45 },
  { id: '2', time: '18:00 UTC', currency: 'USD', name: 'FOMC Meeting Minutes', impact: 'HIGH', forecast: '—', previous: '—', isUpcoming: true, minutesUntil: 255 },
  { id: '3', time: 'Tomorrow', currency: 'USD', name: 'Initial Jobless Claims', impact: 'MEDIUM', forecast: '228K', previous: '231K', isUpcoming: true, minutesUntil: 1200 },
];

/**
 * Generates realistic candlestick data for XAUUSD across timeframes
 */
export function generateCandles(timeframe: Timeframe, count: number = 80, currentPrice: number = INITIAL_GOLD_PRICE): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();
  let intervalMs = 60 * 1000;
  let volatility = 0.8;

  switch (timeframe) {
    case '1M':
      intervalMs = 60 * 1000;
      volatility = 0.6;
      break;
    case '5M':
      intervalMs = 5 * 60 * 1000;
      volatility = 1.4;
      break;
    case '15M':
      intervalMs = 15 * 60 * 1000;
      volatility = 2.5;
      break;
    case '30M':
      intervalMs = 30 * 60 * 1000;
      volatility = 3.6;
      break;
    case '1H':
      intervalMs = 60 * 60 * 1000;
      volatility = 5.2;
      break;
    case '4H':
      intervalMs = 4 * 60 * 60 * 1000;
      volatility = 10.5;
      break;
    case '1D':
      intervalMs = 24 * 60 * 60 * 1000;
      volatility = 22.0;
      break;
  }

  // Work backwards from current price
  let price = currentPrice;
  const rawCandles: Candle[] = [];

  for (let i = 0; i < count; i++) {
    const t = now - (count - 1 - i) * intervalMs;
    // Semi-random walk with gold momentum characteristics
    const cycle = Math.sin(i / 10) * volatility * 1.5;
    const noise = (Math.random() - 0.48) * volatility;
    const delta = cycle + noise;

    const open = Math.round((price - delta * 0.5) * 100) / 100;
    const close = Math.round(price * 100) / 100;
    const high = Math.round((Math.max(open, close) + Math.random() * volatility * 0.7) * 100) / 100;
    const low = Math.round((Math.min(open, close) - Math.random() * volatility * 0.7) * 100) / 100;
    const volume = Math.floor(120 + Math.random() * 450 + (Math.abs(close - open) > volatility ? 300 : 0));

    rawCandles.push({
      time: t,
      open,
      high,
      low,
      close,
      volume,
    });

    // Advance price for the next candle in sequence
    price = close + (Math.random() - 0.49) * volatility * 0.8;
  }

  // Normalize final close to currentPrice
  const last = rawCandles[rawCandles.length - 1];
  const diff = currentPrice - last.close;
  rawCandles.forEach(c => {
    c.open += diff;
    c.high += diff;
    c.low += diff;
    c.close += diff;
  });

  // Calculate indicators (VWAP, EMA20, EMA50, ATR)
  let cumulativeVol = 0;
  let cumulativePV = 0;
  let ema20 = rawCandles[0].close;
  let ema50 = rawCandles[0].close;
  const k20 = 2 / (20 + 1);
  const k50 = 2 / (50 + 1);

  for (let i = 0; i < rawCandles.length; i++) {
    const c = rawCandles[i];
    const typical = (c.high + c.low + c.close) / 3;
    cumulativePV += typical * c.volume;
    cumulativeVol += c.volume;
    c.vwap = Math.round((cumulativePV / cumulativeVol) * 100) / 100;

    ema20 = c.close * k20 + ema20 * (1 - k20);
    ema50 = c.close * k50 + ema50 * (1 - k50);
    c.ema20 = Math.round(ema20 * 100) / 100;
    c.ema50 = Math.round(ema50 * 100) / 100;

    const tr = i === 0 ? (c.high - c.low) : Math.max(c.high - c.low, Math.abs(c.high - rawCandles[i - 1].close), Math.abs(c.low - rawCandles[i - 1].close));
    c.atr = Math.round(tr * 100) / 100;
    candles.push(c);
  }

  return candles;
}

export const MarketDataService = {
  generateInitialCandles: generateCandles,
  generateCandles,
};
