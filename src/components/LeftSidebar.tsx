import React from 'react';
import {
  Home,
  CandlestickChart,
  Cpu,
  Zap,
  Layers,
  FlaskConical,
  BarChart3,
  BookOpen,
  Network,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { NavigationTab, RiskProfile } from '../types';

interface LeftSidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  openPositionsCount: number;
  riskProfile: RiskProfile;
  onOpenCinematicExhibition?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  openPositionsCount,
  riskProfile,
  onOpenCinematicExhibition,
}) => {
  const navItems: { tab: NavigationTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { tab: 'HOME', label: 'HOME', icon: <Home className="w-4 h-4" /> },
    { tab: 'MARKET', label: 'MARKET', icon: <CandlestickChart className="w-4 h-4" /> },
    { tab: 'ALGO', label: 'ALGO', icon: <Cpu className="w-4 h-4" /> },
    { tab: 'EXECUTION', label: 'EXECUTION', icon: <Zap className="w-4 h-4" /> },
    {
      tab: 'POSITIONS',
      label: 'POSITIONS',
      icon: <Layers className="w-4 h-4" />,
      badge: openPositionsCount > 0 ? openPositionsCount : undefined,
    },
    { tab: 'BACKTEST', label: 'BACKTEST', icon: <FlaskConical className="w-4 h-4" /> },
    { tab: 'ANALYTICS', label: 'ANALYTICS', icon: <BarChart3 className="w-4 h-4" /> },
    { tab: 'JOURNAL', label: 'JOURNAL', icon: <BookOpen className="w-4 h-4" /> },
    { tab: 'BROKERS', label: 'BROKERS', icon: <Network className="w-4 h-4" /> },
    { tab: 'SETTINGS', label: 'SETTINGS', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside
      className={`relative h-[calc(100vh-3.5rem)] bg-[#0a0a0a] border-r border-[#242424] flex flex-col justify-between transition-all duration-200 select-none z-20 shrink-0 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Navigation Rail */}
      <div className="flex flex-col py-4">
        <div className="flex items-center justify-between px-4 mb-3">
          {!collapsed && (
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#858585] font-bold">
              Navigation
            </span>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-sm text-[#858585] hover:text-[#F5F5F5] hover:bg-[#151515] transition-colors ml-auto cursor-pointer"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-2.5">
          {navItems.map(item => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onSelectTab(item.tab)}
                className={`flex items-center ${collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'} rounded-sm text-xs font-mono transition-all relative cursor-pointer border ${
                  isActive
                    ? 'bg-[#151515] border-[#C9A227] text-[#C9A227] font-semibold'
                    : 'border-transparent text-[#858585] hover:text-[#F5F5F5] hover:bg-[#111111]'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className={`${isActive ? 'text-[#C9A227]' : 'text-[#858585]'}`}>
                  {item.icon}
                </div>

                {!collapsed && (
                  <span className="text-[11px] tracking-wider uppercase">{item.label}</span>
                )}

                {item.badge !== undefined && (
                  <span
                    className={`ml-auto px-1.5 py-0.5 rounded-sm text-[9px] font-bold ${
                      isActive
                        ? 'bg-[#C9A227] text-black'
                        : 'bg-[#151515] text-[#E5C45A] border border-[#C9A227]/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3D Exhibition Button & Bottom Account Area */}
      <div className="p-3 border-t border-[#242424] bg-[#0a0a0a] space-y-2">
        {onOpenCinematicExhibition && (
          <button
            onClick={onOpenCinematicExhibition}
            className={`w-full flex items-center ${
              collapsed ? 'justify-center p-2' : 'gap-2 px-3 py-2'
            } rounded-xs bg-[#E5C45A]/10 hover:bg-[#E5C45A]/20 border border-[#E5C45A]/40 text-[#E5C45A] text-xs font-mono font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(229,196,90,0.15)]`}
            title="3D Photorealistic Bullion Exhibition"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#E5C45A] animate-pulse" />
            {!collapsed && <span className="text-[10px] tracking-wider uppercase">3D EXHIBITION</span>}
          </button>
        )}

        {!collapsed ? (
          <div className="flex flex-col gap-2 p-3 rounded-sm bg-[#111111] border border-[#242424] font-mono text-[11px]">
            {/* Account ID & Health */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-widest text-[#858585]">
                Account #49711913
              </span>
              <span className="flex items-center gap-1.5 text-[9px] text-[#22c55e] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                28ms
              </span>
            </div>

            {/* Broker */}
            <div className="text-[10px] text-[#858585] truncate">
              BROKER: <span className="text-[#F5F5F5]">HFM // MT5 GLOBAL</span>
            </div>

            {/* Equity */}
            <div className="flex items-center justify-between pt-1 border-t border-[#242424]">
              <span className="text-[9px] uppercase tracking-widest text-[#858585]">Equity</span>
              <span className="font-bold text-[#E5C45A] tabular-nums">
                ${riskProfile.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Risk State */}
            <div className="flex items-center justify-between text-[10px] pt-1">
              <span className="text-[9px] uppercase tracking-widest text-[#858585]">Risk State</span>
              <span
                className={`flex items-center gap-1 font-semibold text-[10px] ${
                  riskProfile.isLocked ? 'text-[#ef4444]' : 'text-[#22c55e]'
                }`}
              >
                {riskProfile.isLocked ? (
                  <>
                    <ShieldAlert className="w-3 h-3" />
                    LOCKED
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3 h-3" />
                    0.50% / NORMAL
                  </>
                )}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2" title="Account Status: MT5 Connected">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
};
