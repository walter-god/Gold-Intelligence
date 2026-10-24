import React, { useState } from 'react';
import { FINANCIAL_CENTERS, GOLD_CORRIDORS } from '../services/marketData';
import { COUNTRY_GOLD_PROFILES, GLOBAL_CROSS_BORDER_TRADES } from '../services/countryGoldData';
import { FinancialCenter, GoldCorridor, CountryGoldProfile } from '../types';
import { SatelliteFlowMap } from './SatelliteFlowMap';
import { SatelliteGlobe3D } from './SatelliteGlobe3D';
import { CountryGoldDossier } from './CountryGoldDossier';
import {
  Globe,
  Layers,
  Search,
  ChevronDown,
  Shield,
  Activity,
  X,
  ExternalLink,
  Info,
} from 'lucide-react';

interface GlobalGoldVisualizerProps {
  currentPrice: number;
  activeSession: string;
  onSelectCenter?: (center: FinancialCenter) => void;
  defaultSizeMode?: 'MINI' | 'COMPACT' | 'STANDARD';
}

export const GlobalGoldVisualizer: React.FC<GlobalGoldVisualizerProps> = ({
  currentPrice,
  activeSession,
  onSelectCenter,
  defaultSizeMode = 'COMPACT',
}) => {
  const [viewMode, setViewMode] = useState<'GLOBE' | 'MAP'>('GLOBE');
  const [sizeMode, setSizeMode] = useState<'MINI' | 'COMPACT' | 'STANDARD'>(defaultSizeMode);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [selectedCenter, setSelectedCenter] = useState<FinancialCenter | null>(null);
  const [selectedCorridor, setSelectedCorridor] = useState<GoldCorridor | null>(null);

  // Country Selection and Gold Dossier Modal State
  const [selectedCountry, setSelectedCountry] = useState<CountryGoldProfile | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState<string>('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState<boolean>(false);

  const handleCenterClick = (center: FinancialCenter) => {
    setSelectedCenter(center);
    if (onSelectCenter) onSelectCenter(center);
  };

  const handleSelectCountry = (country: CountryGoldProfile) => {
    setSelectedCountry(country);
    setIsDossierOpen(true);
    setIsSearchDropdownOpen(false);
    setCountrySearchTerm('');
  };

  // Filtered countries for quick search dropdown
  const filteredSearchCountries = countrySearchTerm.trim()
    ? COUNTRY_GOLD_PROFILES.filter(
        c =>
          c.name.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
          c.code.toLowerCase().includes(countrySearchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="relative w-full rounded-sm border border-[#242424] bg-[#080808] overflow-hidden flex flex-col select-none">
      {/* 1. Header Bar: Title, Satellite Badge, Country Search and View Mode Toggle */}
      <div className="bg-[#0a0a0a] border-b border-[#242424] px-4 py-3 flex flex-wrap items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#E5C45A]">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider">
                GLOBAL GOLD TRADES &amp; SOVEREIGN ATLAS
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-green-600/15 border border-green-600/30 text-green-400 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                LIVE 360° SATELLITE
              </span>
            </div>
            <div className="text-[10px] text-[#858585] uppercase tracking-wider mt-0.5">
              WORLDWIDE CROSS-BORDER FLOWS • CLICK OR SEARCH ANY NATION FOR STATISTICS
            </div>
          </div>
        </div>

        {/* Center/Right: Country Search Bar & Mode Toggle */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Search Input with Autocomplete */}
          <div className="relative">
            <div className="flex items-center bg-[#141417] border border-[#2c2d38] rounded-sm px-2.5 py-1 text-xs text-white focus-within:border-[#C9A227] transition-colors">
              <Search className="w-3.5 h-3.5 text-[#C9A227] mr-1.5 shrink-0" />
              <input
                type="text"
                placeholder="Search any country (e.g. USA, China, India)..."
                value={countrySearchTerm}
                onChange={e => {
                  setCountrySearchTerm(e.target.value);
                  setIsSearchDropdownOpen(true);
                }}
                onFocus={() => setIsSearchDropdownOpen(true)}
                className="bg-transparent border-none outline-none text-[11px] font-mono w-48 sm:w-60 text-white placeholder-neutral-500"
              />
              {countrySearchTerm && (
                <button
                  onClick={() => {
                    setCountrySearchTerm('');
                    setIsSearchDropdownOpen(false);
                  }}
                  className="text-neutral-400 hover:text-white ml-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Instant Search Results Dropdown */}
            {isSearchDropdownOpen && filteredSearchCountries.length > 0 && (
              <div className="absolute top-full right-0 mt-1 w-72 max-h-64 bg-[#0d0e12] border border-[#C9A227]/40 rounded-sm shadow-2xl z-50 overflow-y-auto font-mono">
                <div className="p-1.5 text-[9px] text-neutral-400 uppercase tracking-wider border-b border-[#20222c] bg-[#12131a]">
                  MATCHING SOVEREIGN NATIONS ({filteredSearchCountries.length})
                </div>
                {filteredSearchCountries.map(c => (
                  <button
                    key={c.code}
                    onClick={() => handleSelectCountry(c)}
                    className="w-full text-left px-3 py-2 hover:bg-[#1f212c] border-b border-[#1b1c24] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{c.flagEmoji}</span>
                      <span className="text-xs font-bold text-white">{c.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#E5C45A] font-bold">
                        {c.reservesTonnage.toLocaleString()} MT
                      </span>
                      <span className="text-[9px] text-neutral-400 block">Rank #{c.reservesRank}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Directory Button */}
          <button
            onClick={() => setIsDossierOpen(true)}
            className="px-3 py-1 rounded-sm bg-[#1a1c24] hover:bg-[#252834] border border-[#34384a] text-[10px] font-mono text-[#E5C45A] font-bold cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <span>📊</span>
            <span>ALL COUNTRY STATS</span>
          </button>

          {/* View Mode Selector: 3D Satellite Globe vs 2D Satellite Map */}
          <div className="flex items-center bg-[#111111] p-0.5 rounded-sm border border-[#242424]">
            <button
              onClick={() => setViewMode('GLOBE')}
              className={`px-3 py-1 rounded-sm text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'GLOBE'
                  ? 'bg-[#C9A227] text-[#080808]'
                  : 'text-[#858585] hover:text-[#F5F5F5]'
              }`}
            >
              <span>🌐</span>
              3D SATELLITE GLOBE
            </button>
            <button
              onClick={() => setViewMode('MAP')}
              className={`px-3 py-1 rounded-sm text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'MAP'
                  ? 'bg-[#C9A227] text-[#080808]'
                  : 'text-[#858585] hover:text-[#F5F5F5]'
              }`}
            >
              <span>🛰️</span>
              2D SATELLITE MAP
            </button>
          </div>

          {/* Map Size Switcher: MINI | COMPACT | EXPAND */}
          <div className="flex items-center bg-[#111111] p-0.5 rounded-sm border border-[#242424]">
            <button
              onClick={() => setSizeMode('MINI')}
              title="Miniature View (220px)"
              className={`px-2 py-1 rounded-sm text-[9px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                sizeMode === 'MINI'
                  ? 'bg-[#C9A227] text-[#080808]'
                  : 'text-[#858585] hover:text-[#F5F5F5]'
              }`}
            >
              MINI
            </button>
            <button
              onClick={() => setSizeMode('COMPACT')}
              title="Compact View (320px) - Reduced Default"
              className={`px-2 py-1 rounded-sm text-[9px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                sizeMode === 'COMPACT'
                  ? 'bg-[#C9A227] text-[#080808]'
                  : 'text-[#858585] hover:text-[#F5F5F5]'
              }`}
            >
              COMPACT
            </button>
            <button
              onClick={() => setSizeMode('STANDARD')}
              title="Expanded View (460px)"
              className={`px-2 py-1 rounded-sm text-[9px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                sizeMode === 'STANDARD'
                  ? 'bg-[#C9A227] text-[#080808]'
                  : 'text-[#858585] hover:text-[#F5F5F5]'
              }`}
            >
              EXPAND
            </button>
          </div>
        </div>
      </div>

      {/* 2. Flow Filter Strip & Quick Top Countries Bar */}
      <div className="bg-[#0c0c0c] border-b border-[#242424] px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-[#777] uppercase tracking-widest mr-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#C9A227]" />
            TRADE CORRIDORS:
          </span>
          {[
            { id: 'ALL', label: 'ALL GLOBAL TRADES ($184.6B)' },
            { id: 'PHYSICAL', label: 'PHYSICAL BULLION' },
            { id: 'OTC', label: 'OTC CLEARING (LBMA/COMEX)' },
            { id: 'CENTRAL_BANK', label: 'CENTRAL BANK RESERVES' },
            { id: 'REFINERIES', label: 'REFINERY TRANSIT' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-2 py-0.5 rounded-sm text-[9px] uppercase tracking-wider font-bold transition-colors cursor-pointer border ${
                activeFilter === f.id
                  ? 'bg-[#C9A227]/20 border-[#C9A227] text-[#E5C45A]'
                  : 'bg-[#111111] border-[#242424] text-[#858585] hover:text-[#eee] hover:border-[#383838]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Quick Top Sovereign Nations Clickable Chips */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <span className="text-[9px] text-neutral-500 uppercase tracking-widest hidden xl:inline mr-1">
            TOP HOLDERS:
          </span>
          {[
            { code: 'USA', label: '🇺🇸 USA', rank: '#1' },
            { code: 'DEU', label: '🇩🇪 DEU', rank: '#2' },
            { code: 'ITA', label: '🇮🇹 ITA', rank: '#3' },
            { code: 'FRA', label: '🇫🇷 FRA', rank: '#4' },
            { code: 'RUS', label: '🇷🇺 RUS', rank: '#5' },
            { code: 'CHN', label: '🇨🇳 CHN', rank: '#6' },
            { code: 'CHE', label: '🇨🇭 CHE', rank: '#7' },
            { code: 'IND', label: '🇮🇳 IND', rank: '#9' },
            { code: 'TUR', label: '🇹🇷 TUR', rank: '#11' },
            { code: 'ARE', label: '🇦🇪 UAE', rank: '#44' },
            { code: 'AUS', label: '🇦🇺 AUS', rank: '#42' },
            { code: 'ZAF', label: '🇿🇦 ZAF', rank: '#36' },
          ].map(item => {
            const country = COUNTRY_GOLD_PROFILES.find(c => c.code === item.code);
            if (!country) return null;
            return (
              <button
                key={item.code}
                onClick={() => handleSelectCountry(country)}
                className="px-2 py-0.5 rounded text-[9px] bg-[#14151b] hover:bg-[#20232e] border border-[#242633] hover:border-[#C9A227] text-neutral-300 hover:text-white font-mono transition-colors cursor-pointer shrink-0"
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Satellite Stage Area (Reduced height by default) */}
      <div
        className={`relative w-full ${
          sizeMode === 'MINI'
            ? 'h-[190px] sm:h-[210px] md:h-[230px]'
            : sizeMode === 'COMPACT'
            ? 'h-[260px] sm:h-[290px] md:h-[320px] lg:h-[340px]'
            : 'h-[380px] md:h-[440px] lg:h-[480px]'
        } bg-[#05070a] transition-[height] duration-300`}
      >
        {viewMode === 'GLOBE' ? (
          <SatelliteGlobe3D
            countries={COUNTRY_GOLD_PROFILES}
            trades={GLOBAL_CROSS_BORDER_TRADES}
            selectedCountry={selectedCountry}
            onSelectCountry={handleSelectCountry}
            activeFilter={activeFilter}
            currentPrice={currentPrice}
          />
        ) : (
          <SatelliteFlowMap
            centers={FINANCIAL_CENTERS}
            corridors={GOLD_CORRIDORS}
            activeFilter={activeFilter}
            selectedCenter={selectedCenter}
            onSelectCenter={handleCenterClick}
            selectedCorridor={selectedCorridor}
            onSelectCorridor={setSelectedCorridor}
            currentPrice={currentPrice}
          />
        )}

        {/* Interactive Hub Detail Drawer / Overlay Card (for 2D Map) */}
        {selectedCenter && viewMode === 'MAP' && (
          <div className="absolute top-4 right-4 z-[600] w-80 sm:w-96 bg-[#080808]/95 backdrop-blur-md border border-[#C9A227]/40 rounded-sm p-4 font-mono text-xs shadow-2xl space-y-3">
            <div className="flex items-start justify-between pb-2 border-b border-[#242424]">
              <div>
                <div className="text-[10px] text-[#C9A227] uppercase tracking-widest font-bold">
                  {selectedCenter.hubType?.replace('_', ' ')}
                </div>
                <div className="text-base font-bold text-[#F5F5F5] uppercase tracking-wider">
                  {selectedCenter.name}
                </div>
              </div>
              <button
                onClick={() => setSelectedCenter(null)}
                className="text-[#858585] hover:text-white p-1 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-[9px] text-[#858585] uppercase tracking-widest font-bold block">
                  PHYSICAL VAULT DEPOSITORY
                </span>
                <span className="text-[#eee] font-medium">{selectedCenter.vaultName}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 rounded-sm bg-[#111111] border border-[#242424]">
                  <span className="text-[9px] text-[#858585] uppercase tracking-widest font-bold block">
                    VAULT TONNAGE
                  </span>
                  <span className="text-sm font-bold text-[#E5C45A] tabular-nums">
                    {selectedCenter.vaultTonnage || '850 MT'}
                  </span>
                </div>
                <div className="p-2 rounded-sm bg-[#111111] border border-[#242424]">
                  <span className="text-[9px] text-[#858585] uppercase tracking-widest font-bold block">
                    VOLUME SHARE
                  </span>
                  <span className="text-sm font-bold text-[#22c55e] tabular-nums">
                    {selectedCenter.volumeShare}
                  </span>
                </div>
              </div>

              {selectedCenter.clearingMechanism && (
                <div className="pt-1">
                  <span className="text-[9px] text-[#858585] uppercase tracking-widest font-bold block">
                    CLEARING &amp; SETTLEMENT
                  </span>
                  <span className="text-[11px] text-[#bbb] leading-relaxed">
                    {selectedCenter.clearingMechanism}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-[#1b1b1b] text-[10px]">
                <span className="text-[#858585]">
                  TYPICAL SPREAD:{' '}
                  <strong className="text-[#F5F5F5]">{selectedCenter.spread} PTS</strong>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider ${
                    selectedCenter.status === 'ACTIVE'
                      ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                      : 'bg-[#181818] text-[#888] border border-[#333]'
                  }`}
                >
                  {selectedCenter.status} SESSION
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Institutional Gold Flow Metrics Strip */}
      <div className="bg-[#0a0a0a] border-t border-[#242424] px-4 py-3 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        {/* Metric 1: XAUUSD Live Ticker */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#858585] uppercase tracking-widest font-bold">
            SPOT TICKER
          </span>
          <span className="text-sm font-bold text-[#F5F5F5] tracking-wider">XAUUSD</span>
          <span className="text-base font-bold text-[#E5C45A] tabular-nums">
            ${currentPrice.toFixed(2)}
          </span>
          <span className="text-[10px] text-[#22c55e] bg-green-600/10 px-1.5 py-0.5 rounded-sm border border-green-600/20 font-bold">
            +0.75%
          </span>
        </div>

        {/* Metric 2: Primary Gold Flow Telemetry */}
        <div className="flex items-center gap-5 text-xs">
          <div>
            <span className="text-[9px] text-[#858585] uppercase tracking-widest font-bold mr-2">
              LARGEST GLOBAL CORRIDOR:
            </span>
            <span className="text-[#F5F5F5] font-bold">SWISS REFINERIES ➔ CHINA</span>
            <span className="text-[#E5C45A] ml-2 font-bold tabular-nums">($28.5B / YR • 360 MT)</span>
          </div>

          <div className="hidden xl:block">
            <span className="text-[9px] text-[#858585] uppercase tracking-widest font-bold mr-2">
              INDIA IMPORT PIPELINE:
            </span>
            <span className="text-[#F5F5F5] font-bold">SWITZERLAND + UAE ➔ INDIA</span>
            <span className="text-[#22c55e] ml-2 font-bold tabular-nums">($37.2B / YR • 500 MT)</span>
          </div>
        </div>

        {/* Metric 3: Total 24H Liquidity */}
        <div className="text-[11px] text-[#858585] hidden md:block">
          TOTAL 24H GOLD FLOW:{' '}
          <strong className="text-[#F5F5F5] font-bold tracking-wider">$184.6 BILLION</strong>
        </div>
      </div>

      {/* 5. Comprehensive Country Gold Dossier & Statistics Modal */}
      {isDossierOpen && (
        <CountryGoldDossier
          country={selectedCountry || COUNTRY_GOLD_PROFILES[0]}
          countries={COUNTRY_GOLD_PROFILES}
          trades={GLOBAL_CROSS_BORDER_TRADES}
          currentPrice={currentPrice}
          onSelectCountry={country => {
            setSelectedCountry(country);
          }}
          onClose={() => setIsDossierOpen(false)}
        />
      )}
    </div>
  );
};
