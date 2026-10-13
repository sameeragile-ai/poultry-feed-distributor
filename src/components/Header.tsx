import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Building2,
  Store,
  ChevronDown,
  LogOut,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Site } from '../types';

export type ActiveTab = 'accueil' | 'vente' | 'stocks' | 'caisse' | 'historique' | 'admin';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenSyncDrawer: () => void;
  onRequireAdminPin: (targetTab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenSyncDrawer,
  onRequireAdminPin,
}) => {
  const {
    currentUser,
    currentSite,
    sites,
    setCurrentSite,
    isOffline,
    toggleOffline,
    syncQueue,
    isSyncing,
    logout,
  } = useApp();

  const [siteMenuOpen, setSiteMenuOpen] = useState(false);

  const handleTabClick = (tab: ActiveTab) => {
    if (tab === 'admin') {
      // Check if user is admin or prompt for PIN
      if (currentUser?.role === 'admin') {
        onSelectTab('admin');
      } else {
        onRequireAdminPin('admin');
      }
    } else {
      onSelectTab(tab);
    }
  };

  const pendingCount = syncQueue.length;

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 border-b ${
        isOffline
          ? 'bg-amber-50/90 border-amber-300 backdrop-blur-md'
          : 'bg-[#FAF8F5]/90 border-stone-200 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark + subtle brand mark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('accueil')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-warm-terracotta flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
              INA
            </div>
            <div className="leading-tight">
              <span className="text-sm font-bold tracking-tight text-stone-900 block whitespace-nowrap">
                IVOIRE NUTRITION AVICOLE
              </span>
              <span className="text-[11px] text-stone-500 font-normal block">
                Aliments & Concentrés · CI
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation links (single line, clean button tabs) */}
        <nav className="hidden md:flex items-center gap-1 bg-stone-100/90 p-1 rounded-xl border border-stone-200/80">
          <button
            type="button"
            onClick={() => handleTabClick('accueil')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'accueil'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            Accueil
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('vente')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'vente'
                ? 'bg-warm-terracotta text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            Nouvelle vente
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('stocks')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'stocks'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            Mouvements stock
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('caisse')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'caisse'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            Clôture caisse
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('historique')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'historique'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            Historique & Audit
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('admin')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-stone-900 text-amber-400 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Shield className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Direction (Montréal)</span>
          </button>
        </nav>

        {/* Zone 3: Interactive controls (Site switch, Offline toggle, Sync, User) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Site Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSiteMenuOpen(!siteMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-medium shadow-2xs transition-colors"
            >
              {currentSite.type === 'boutique' ? (
                <Store className="w-3.5 h-3.5 text-amber-700" strokeWidth={1.75} />
              ) : (
                <Building2 className="w-3.5 h-3.5 text-stone-600" strokeWidth={1.75} />
              )}
              <span className="font-semibold max-w-[120px] truncate">{currentSite.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" strokeWidth={1.5} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {siteMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-50 text-xs"
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-100">
                    Changer de site d'opération
                  </div>
                  {sites.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setCurrentSite(s);
                        setSiteMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-stone-50 transition-colors ${
                        currentSite.id === s.id ? 'bg-amber-50/70 font-semibold text-amber-900' : 'text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {s.type === 'boutique' ? (
                          <Store className="w-3.5 h-3.5 text-amber-600 shrink-0" strokeWidth={1.5} />
                        ) : (
                          <Building2 className="w-3.5 h-3.5 text-stone-500 shrink-0" strokeWidth={1.5} />
                        )}
                        <span className="truncate">{s.name}</span>
                      </div>
                      <span className="text-[10px] text-stone-500 shrink-0">{s.city}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Offline Simulation Switch */}
          <button
            type="button"
            onClick={toggleOffline}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              isOffline
                ? 'bg-amber-100/80 border-amber-400 text-amber-950 font-semibold shadow-xs animate-pulse'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
            }`}
            title="Basculer le mode En ligne / Hors ligne pour tester la synchronisation locale"
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-800" strokeWidth={1.75} />
                <span className="hidden sm:inline">Hors ligne</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-700" strokeWidth={1.75} />
                <span className="hidden sm:inline">En ligne</span>
              </>
            )}
          </button>

          {/* Sync Queue Trigger Button */}
          <button
            type="button"
            onClick={onOpenSyncDrawer}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              pendingCount > 0
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
            title="Ouvrir la file de synchronisation"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`}
              strokeWidth={1.75}
            />
            {pendingCount > 0 ? (
              <span className="font-semibold">{pendingCount} en attente</span>
            ) : (
              <span className="hidden sm:inline">Synchro</span>
            )}
          </button>

          {/* User profile & Logout */}
          <div className="flex items-center gap-1.5 pl-1.5 border-l border-stone-200">
            <div className="hidden lg:block text-right text-xs">
              <span className="font-semibold text-stone-900 block truncate max-w-[110px]">
                {currentUser?.name}
              </span>
              <span className="text-[10px] text-stone-500 block truncate max-w-[110px]">
                {currentUser?.role === 'admin' ? 'Montréal (Admin)' : currentUser?.roleLabel}
              </span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-2 rounded-lg border border-stone-200 bg-white hover:bg-red-50 hover:text-red-700 text-stone-600 transition-colors"
              title="Changer d'utilisateur / Verrouiller le terminal"
              aria-label="Déconnexion"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Tab Bar (shown on smaller viewports or below header) */}
      <div className="md:hidden border-t border-stone-200/60 bg-white/60 px-2 py-1.5 flex items-center justify-around overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => handleTabClick('accueil')}
          className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap ${
            activeTab === 'accueil' ? 'bg-amber-100 text-amber-900 font-semibold' : 'text-stone-600'
          }`}
        >
          Accueil
        </button>
        <button
          type="button"
          onClick={() => handleTabClick('vente')}
          className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap ${
            activeTab === 'vente' ? 'bg-warm-terracotta text-white font-semibold' : 'text-stone-600'
          }`}
        >
          Vente
        </button>
        <button
          type="button"
          onClick={() => handleTabClick('stocks')}
          className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap ${
            activeTab === 'stocks' ? 'bg-amber-100 text-amber-900 font-semibold' : 'text-stone-600'
          }`}
        >
          Stocks
        </button>
        <button
          type="button"
          onClick={() => handleTabClick('caisse')}
          className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap ${
            activeTab === 'caisse' ? 'bg-amber-100 text-amber-900 font-semibold' : 'text-stone-600'
          }`}
        >
          Caisse
        </button>
        <button
          type="button"
          onClick={() => handleTabClick('historique')}
          className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap ${
            activeTab === 'historique' ? 'bg-amber-100 text-amber-900 font-semibold' : 'text-stone-600'
          }`}
        >
          Audit
        </button>
        <button
          type="button"
          onClick={() => handleTabClick('admin')}
          className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap ${
            activeTab === 'admin' ? 'bg-stone-900 text-amber-400 font-semibold' : 'text-stone-600'
          }`}
        >
          Admin
        </button>
      </div>
    </header>
  );
};
