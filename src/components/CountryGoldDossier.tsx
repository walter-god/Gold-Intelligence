import React, { useState } from 'react';
import { CountryGoldProfile, GoldCorridor } from '../types';

interface CountryGoldDossierProps {
  country: CountryGoldProfile | null;
  countries: CountryGoldProfile[];
  trades: GoldCorridor[];
  currentPrice: number;
  onSelectCountry: (country: CountryGoldProfile) => void;
  onClose: () => void;
}

export const CountryGoldDossier: React.FC<CountryGoldDossierProps> = ({
  country,
  countries,
  trades,
  currentPrice,
  onSelectCountry,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [isSearchOpen, setIsSearchOpen] = useState(!country);

  // Filter countries list
  const filteredCountries = countries.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'ALL' || c.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  // Calculate live dollar valuation of sovereign reserves based on spot price
  // 1 Metric Tonne = 32,150.7 Troy Ounces
  const calculateReservesValue = (tonnes: number) => {
    const troyOunces = tonnes * 32150.7466;
    const totalDollars = troyOunces * currentPrice;
    if (totalDollars >= 1e9) {
      return `$${(totalDollars / 1e9).toFixed(1)} Billion`;
    }
    return `$${(totalDollars / 1e6).toFixed(1)} Million`;
  };

  const getStanceColor = (stance: string) => {
    switch (stance) {
      case 'AGGRESSIVE_ACCUMULATOR':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'NET_BUYER':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'REPATRIATING':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'STRATEGIC_HOLDER':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#0c0d10] border border-[#242424] rounded-lg shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-[#1f2024] bg-[#111216] flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#E5C45A] shadow-[0_0_10px_#E5C45A]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#E5C45A] font-bold">
              GLOBAL SOVEREIGN GOLD INTELLIGENCE &amp; TRADE ATLAS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="px-3 py-1.5 rounded bg-[#1b1c22] hover:bg-[#252730] border border-[#2c2e38] text-xs font-mono text-[#E5C45A] flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>🔍</span>
              <span>{isSearchOpen ? 'HIDE COUNTRY SELECTOR' : 'SEARCH / SELECT COUNTRY'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded bg-[#1b1c22] hover:bg-[#2a2c38] text-neutral-400 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search & Country Directory Drawer */}
        {isSearchOpen && (
          <div className="p-5 border-b border-[#1f2024] bg-[#0f1014]">
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search 25+ sovereign countries by name or code (e.g., USA, China, Germany, Switzerland, India, UAE, Ghana, South Africa)..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-[#16171d] border border-[#282a35] rounded px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#C9A227] font-mono"
                  autoFocus
                />
              </div>

              {/* Region Filter Pills */}
              <div className="flex flex-wrap gap-1.5 items-center">
                {[
                  { label: 'ALL REGIONS', value: 'ALL' },
                  { label: 'NORTH AMERICA', value: 'NORTH_AMERICA' },
                  { label: 'EUROPE', value: 'EUROPE' },
                  { label: 'ASIA-PACIFIC', value: 'ASIA_PACIFIC' },
                  { label: 'MIDDLE EAST', value: 'MIDDLE_EAST' },
                  { label: 'AFRICA', value: 'AFRICA' },
                  { label: 'SOUTH AMERICA', value: 'SOUTH_AMERICA' },
                ].map(r => (
                  <button
                    key={r.value}
                    onClick={() => setSelectedRegion(r.value)}
                    className={`px-2.5 py-1 text-[10px] font-mono rounded cursor-pointer transition-colors ${
                      selectedRegion === r.value
                        ? 'bg-[#C9A227] text-black font-bold'
                        : 'bg-[#181920] text-neutral-400 hover:text-white border border-[#23252e]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Country Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
              {filteredCountries.map(c => {
                const isCurrent = country?.code === c.code;
                return (
                  <button
                    key={c.code}
                    onClick={() => {
                      onSelectCountry(c);
                      setIsSearchOpen(false);
                    }}
                    className={`p-2 rounded text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-[#222430] border-[#E5C45A] shadow-[0_0_8px_rgba(229,196,90,0.3)]'
                        : 'bg-[#14151a] border-[#22242d] hover:border-[#444] hover:bg-[#1a1c24]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{c.flagEmoji}</span>
                      <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-[#0a0a0c] text-[#E5C45A]">
                        #{c.reservesRank}
                      </span>
                    </div>
                    <div className="mt-1.5 truncate">
                      <div className="text-xs font-bold text-white truncate">{c.name}</div>
                      <div className="text-[10px] font-mono text-neutral-400">
                        {c.reservesTonnage.toLocaleString()} MT
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Country Gold Dossier Content */}
        {country ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Country Hero Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg bg-gradient-to-r from-[#14161f] via-[#101218] to-[#14161f] border border-[#262833]">
              <div className="flex items-center gap-4">
                <div className="text-5xl drop-shadow">{country.flagEmoji}</div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-white tracking-wide">{country.name}</h1>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#E5C45A]/20 text-[#E5C45A] font-bold border border-[#E5C45A]/30">
                      ISO: {country.code}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${getStanceColor(
                        country.centralBankStance
                      )}`}
                    >
                      {country.centralBankStance.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                    {country.summary}
                  </p>
                </div>
              </div>

              {/* World Rank Badge */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider">
                    SOVEREIGN RESERVE RANK
                  </div>
                  <div className="text-3xl font-extrabold font-mono text-[#E5C45A]">
                    #{country.reservesRank}
                  </div>
                </div>
              </div>
            </div>

            {/* Core Telemetry Metrics 4-Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Sovereign Gold Reserves */}
              <div className="p-4 rounded-lg bg-[#111319] border border-[#20222c] flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    OFFICIAL GOLD RESERVES
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-[#E5C45A] mt-1">
                    {country.reservesTonnage.toLocaleString()} MT
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                    ≈ {(country.reservesTonnage * 32150.7).toLocaleString(undefined, { maximumFractionDigits: 0 })}{' '}
                    troy oz
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-[#1f212a] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-neutral-400">Spot Valuation:</span>
                  <span className="text-emerald-400 font-bold">
                    {calculateReservesValue(country.reservesTonnage)}
                  </span>
                </div>
              </div>

              {/* Share of Total Foreign Reserves */}
              <div className="p-4 rounded-lg bg-[#111319] border border-[#20222c] flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    SHARE OF TOTAL FX RESERVES
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-white mt-1">
                    {country.reservesShareOfFx}%
                  </div>
                  <div className="w-full bg-[#1c1e28] rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#C9A227] to-[#E5C45A] h-full rounded-full"
                      style={{ width: `${Math.min(100, country.reservesShareOfFx)}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-[#1f212a] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-neutral-400">12M Net CB Flows:</span>
                  <span
                    className={`font-bold ${
                      country.centralBankNetPurchasesMT12M > 0 ? 'text-emerald-400' : 'text-neutral-300'
                    }`}
                  >
                    {country.centralBankNetPurchasesMT12M > 0 ? `+` : ''}
                    {country.centralBankNetPurchasesMT12M} MT
                  </span>
                </div>
              </div>

              {/* Annual Mine Production */}
              <div className="p-4 rounded-lg bg-[#111319] border border-[#20222c] flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    ANNUAL DOMESTIC MINING OUTPUT
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-[#22c55e] mt-1">
                    {country.annualMineOutputMT} MT/yr
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                    Production Rank: #{country.mineProductionRank} globally
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-[#1f212a] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-neutral-400">Loco Reference:</span>
                  <span className="text-[#E5C45A] font-medium truncate max-w-[120px]">
                    {country.locoSpotPremium}
                  </span>
                </div>
              </div>

              {/* Consumer & Investment Demand */}
              <div className="p-4 rounded-lg bg-[#111319] border border-[#20222c] flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    ANNUAL DOMESTIC CONSUMPTION
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-amber-400 mt-1">
                    {country.annualConsumerDemandMT} MT
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                    Jewelry: {country.jewelryDemandMT} MT • Bars: {country.barAndCoinDemandMT} MT
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-[#1f212a] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-neutral-400">Primary Exchange:</span>
                  <span className="text-white font-medium truncate max-w-[130px]">
                    {country.primaryExchange.split('(')[0]}
                  </span>
                </div>
              </div>
            </div>

            {/* Bilateral Cross-Border Gold Trades Table */}
            <div className="p-5 rounded-lg bg-[#111319] border border-[#20222c]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-base">🌐</span>
                  <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
                    MAJOR BILATERAL GOLD TRADING PARTNERS &amp; CONDUITS
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-[#E5C45A] bg-[#E5C45A]/10 px-2 py-0.5 rounded border border-[#E5C45A]/20">
                  {country.trades.length} ACTIVE TRADE CONDUITS
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {country.trades.map((trade, idx) => {
                  const isExport = trade.type === 'EXPORT';
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded bg-[#161720] border border-[#252834] hover:border-[#3b3e4f] transition-all flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                              isExport
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {trade.type}
                          </span>
                          <span className="text-sm font-bold text-white font-mono">
                            {country.code} {isExport ? '➔' : '🠔'} {trade.partnerCountryName} ({trade.partnerCountryCode})
                          </span>
                        </div>
                        <span className="text-xs font-mono font-extrabold text-[#E5C45A]">
                          {trade.annualValueUsd}
                        </span>
                      </div>

                      <div className="text-[11px] text-neutral-400 leading-snug">
                        {trade.primaryProduct}
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 border-t border-[#20222c] pt-2 mt-1">
                        <span>ANNUAL TONNAGE:</span>
                        <strong className="text-neutral-300 font-bold">{trade.annualTonnage}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bullion Depository, Infrastructure & Regulatory Regime */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Depository & Refineries */}
              <div className="p-4 rounded-lg bg-[#111319] border border-[#20222c] space-y-3">
                <div className="text-xs font-mono uppercase tracking-wider text-[#E5C45A] font-bold flex items-center gap-2">
                  <span>🏛</span>
                  <span>SOVEREIGN VAULT &amp; DEPOSITORY ARCHITECTURE</span>
                </div>
                <div className="text-xs text-neutral-300 bg-[#161720] p-3 rounded border border-[#22242e] leading-relaxed">
                  {country.vaultDepository}
                </div>

                <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold mt-3">
                  ACCREDITED MINTS &amp; REFINERIES
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {country.primaryMintsRefineries.map((mint, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-[#181a24] border border-[#272a38] text-[11px] font-mono text-neutral-300"
                    >
                      {mint}
                    </span>
                  ))}
                </div>
              </div>

              {/* Taxation & Mines */}
              <div className="p-4 rounded-lg bg-[#111319] border border-[#20222c] space-y-3">
                <div className="text-xs font-mono uppercase tracking-wider text-[#E5C45A] font-bold flex items-center gap-2">
                  <span>⚖️</span>
                  <span>TAXATION, CUSTOMS &amp; MINING CONCESSIONS</span>
                </div>
                <div className="text-xs text-neutral-300 bg-[#161720] p-3 rounded border border-[#22242e] leading-relaxed">
                  {country.taxRegime}
                </div>

                <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold mt-3">
                  KEY ACTIVE MINES / PRODUCING ASSETS
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {country.keyMines.map((mine, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-[#181a24] border border-[#272a38] text-[11px] font-mono text-emerald-400"
                    >
                      ⛏ {mine}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-neutral-500 font-mono">
            Please search or click any country pin on the 3D globe to view sovereign gold intelligence.
          </div>
        )}

        {/* Footer Bar */}
        <div className="px-6 py-3 border-t border-[#1f2024] bg-[#0c0d10] flex items-center justify-between text-[11px] font-mono text-neutral-500">
          <div>DATA SOURCE: WORLD GOLD COUNCIL (WGC) • LBMA • CENTRAL BANK REPORTS</div>
          <div className="text-[#E5C45A] font-bold">
            LIVE XAU/USD BENCHMARK: ${currentPrice.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};
