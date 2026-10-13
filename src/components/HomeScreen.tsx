import React from 'react';
import { motion } from 'motion/react';
import {
  ShoppingCart,
  ArrowLeftRight,
  Calculator,
  History,
  TrendingUp,
  AlertTriangle,
  Banknote,
  Package,
  Clock,
  Store,
  Building2,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from './Header';
import { formatFcfa, formatDateFr } from '../utils/formatters';

interface HomeScreenProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenSyncDrawer: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, onOpenSyncDrawer }) => {
  const {
    currentUser,
    currentSite,
    transactions,
    stockLevels,
    products,
    syncQueue,
    isOffline,
  } = useApp();

  // Calculate today's summary metrics for the current site
  const todayStr = '2026-10-13'; // reference date in demo
  const siteTransactions = transactions.filter(
    (t) => t.siteId === currentSite.id && t.status === 'validee'
  );

  const todaySales = siteTransactions.filter(
    (t) => t.type === 'vente' && (t.date.startsWith(todayStr) || t.localCreatedAt.startsWith(todayStr))
  );

  const todaySalesCount = todaySales.length;
  const todayTotalFcfa = todaySales.reduce((acc, t) => acc + (t.totalAmountFcfa || 0), 0);

  // Cash expected from cash sales today
  const todayCashSales = todaySales.filter((t) => t.paymentMethod === 'especes');
  const todayCashExpected = todayCashSales.reduce((acc, t) => acc + (t.totalAmountFcfa || 0), 0);

  // Sacks sold today
  const todaySacksSold = todaySales.reduce((acc, t) => {
    const qty = t.items?.reduce((qAcc, item) => qAcc + item.quantity, 0) || 0;
    return acc + qty;
  }, 0);

  // Low stock alerts at this site
  const siteStockAlerts = products
    .map((p) => {
      const stock = stockLevels.find((s) => s.siteId === currentSite.id && s.productId === p.id);
      const currentQty = stock ? stock.quantity : 0;
      return {
        product: p,
        currentQty,
        minAlert: p.minAlertStock,
        isAlert: currentQty <= p.minAlertStock,
      };
    })
    .filter((item) => item.isAlert);

  // Recent 4 transactions at this site
  const recentSiteTransactions = transactions
    .filter((t) => t.siteId === currentSite.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 flex flex-col gap-6">
      {/* Welcome Banner & Site Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100/70 border border-amber-200 text-amber-900 flex items-center justify-center font-bold text-xl shrink-0">
            {currentUser?.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-stone-900">
                Bonjour, {currentUser?.name}
              </h2>
              {currentUser?.role === 'admin' && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-900 text-amber-400">
                  Direction Montréal
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
              <span>{currentUser?.roleLabel}</span>
              <span>·</span>
              <span className="font-medium text-stone-700 flex items-center gap-1">
                {currentSite.type === 'boutique' ? (
                  <Store className="w-3.5 h-3.5 text-amber-700" />
                ) : (
                  <Building2 className="w-3.5 h-3.5 text-stone-600" />
                )}
                {currentSite.name} ({currentSite.city})
              </span>
            </p>
          </div>
        </div>

        {/* Sync & network health pill */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSyncDrawer}
            className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-colors ${
              syncQueue.length > 0
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-stone-50 border-stone-200 text-stone-800'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                syncQueue.length > 0
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {syncQueue.length > 0 ? (
                <Clock className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div className="pr-1 text-xs">
              <span className="font-bold block">
                {syncQueue.length > 0
                  ? `${syncQueue.length} vente(s) en attente`
                  : 'File de synchro à jour'}
              </span>
              <span className="text-[11px] text-stone-500">
                {isOffline ? 'Réseau déconnecté' : 'Synchronisé avec Montréal'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 4 Large Action Touch Tiles (Optimized for 10" tablet) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: Nouvelle vente (Primary Hero Tile with warm terracotta gradient) */}
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('vente')}
          className="group relative overflow-hidden rounded-3xl p-6 bg-warm-terracotta text-white shadow-md hover:shadow-lg transition-all text-left flex flex-col justify-between min-h-[160px] focus:outline-none"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" strokeWidth={1.75} />
            </div>
            <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/20">
              Caisse POS
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold tracking-tight text-white group-hover:translate-x-1 transition-transform">
              Nouvelle vente
            </h3>
            <p className="text-xs text-white/85 mt-1 leading-relaxed">
              Encaisser un particulier ou facturer un revendeur agréé
            </p>
          </div>
        </motion.button>

        {/* Tile 2: Mouvement de stock */}
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('stocks')}
          className="group rounded-3xl p-6 bg-white border border-stone-200 shadow-2xs hover:shadow-md hover:border-stone-300 transition-all text-left flex flex-col justify-between min-h-[160px] focus:outline-none"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center">
              <ArrowLeftRight className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              Logistique
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">
              Mouvement stock
            </h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Réception usine, transferts entre dépôts, retours & avaries
            </p>
          </div>
        </motion.button>

        {/* Tile 3: Clôture de caisse */}
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('caisse')}
          className="group rounded-3xl p-6 bg-white border border-stone-200 shadow-2xs hover:shadow-md hover:border-stone-300 transition-all text-left flex flex-col justify-between min-h-[160px] focus:outline-none"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
              <Calculator className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              Fin de journée
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold tracking-tight text-stone-900 group-hover:text-emerald-800 transition-colors">
              Clôture de caisse
            </h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Comptage des coupures FCFA et justification des écarts
            </p>
          </div>
        </motion.button>

        {/* Tile 4: Historique des opérations */}
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('historique')}
          className="group rounded-3xl p-6 bg-white border border-stone-200 shadow-2xs hover:shadow-md hover:border-stone-300 transition-all text-left flex flex-col justify-between min-h-[160px] focus:outline-none"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-800 border border-stone-200 flex items-center justify-center">
              <History className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              Traçabilité
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors">
              Historique & Audit
            </h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Consultation des transactions et motif obligatoire d'annulation
            </p>
          </div>
        </motion.button>
      </div>

      {/* Today's KPI Metric Strip */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Activité du jour sur {currentSite.name}
          </span>
          <span className="text-xs text-stone-500 font-medium">Date : 13/10/2026</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/80">
            <span className="text-xs text-stone-500 block mb-1">Ventes réalisées</span>
            <div className="text-2xl font-bold text-stone-900 font-mono tabular-nums">
              {todaySalesCount}
            </div>
            <span className="text-[11px] text-stone-500 mt-0.5 block">Transactions au comptoir</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/80">
            <span className="text-xs text-stone-500 block mb-1">Chiffre d'affaires jour</span>
            <div className="text-xl lg:text-2xl font-bold text-stone-900 font-mono tabular-nums truncate">
              {formatFcfa(todayTotalFcfa)}
            </div>
            <span className="text-[11px] text-stone-500 mt-0.5 block">Tous modes de règlement</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/80">
            <span className="text-xs text-stone-500 block mb-1">Espèces attendues</span>
            <div className="text-xl lg:text-2xl font-bold text-emerald-800 font-mono tabular-nums truncate">
              {formatFcfa(todayCashExpected)}
            </div>
            <span className="text-[11px] text-stone-500 mt-0.5 block">À rapprocher en fin de journée</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/80">
            <span className="text-xs text-stone-500 block mb-1">Volume de sacs vendus</span>
            <div className="text-2xl font-bold text-stone-900 font-mono tabular-nums">
              {todaySacksSold} <span className="text-sm font-normal text-stone-500">sacs</span>
            </div>
            <span className="text-[11px] text-stone-500 mt-0.5 block">Prémix & concentrés sortis</span>
          </div>
        </div>
      </div>

      {/* Two Columns: Low Stock Alerts & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Stock Alerts on this site */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700" strokeWidth={1.75} />
                <h4 className="text-sm font-bold text-stone-900 tracking-tight">
                  Alertes Stock ({currentSite.name})
                </h4>
              </div>
              <span className="text-xs text-stone-500">
                {siteStockAlerts.length} produit(s) en alerte
              </span>
            </div>

            {siteStockAlerts.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-600/50 mx-auto mb-2" />
                Tous les stocks sont au-dessus des seuils de réapprovisionnement.
              </div>
            ) : (
              <div className="space-y-2.5">
                {siteStockAlerts.map(({ product, currentQty, minAlert }) => (
                  <div
                    key={product.id}
                    className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-stone-900 block truncate">
                        {product.name}
                      </span>
                      <span className="text-[11px] text-stone-500 block">
                        Sac {product.sackWeightKg} kg · Seuil mini : {minAlert} sacs
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-amber-900 font-mono tabular-nums block">
                        {currentQty} sacs
                      </span>
                      <span className="text-[10px] text-amber-700 uppercase font-semibold">
                        Stock critique
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onNavigate('stocks')}
            className="mt-4 w-full py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-medium hover:bg-stone-50 flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Gérer les approvisionnements et transferts</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Recent Activity at current site */}
        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-stone-900 tracking-tight">
                Dernières opérations ({currentSite.name})
              </h4>
              <button
                type="button"
                onClick={() => onNavigate('historique')}
                className="text-xs text-amber-800 hover:text-amber-950 font-medium"
              >
                Voir tout l'historique
              </button>
            </div>

            <div className="space-y-2">
              {recentSiteTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                    tx.status === 'annulee'
                      ? 'bg-stone-50 border-stone-200 opacity-60'
                      : 'bg-[#FAF8F5] border-stone-200/90'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-stone-900">{tx.id}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          tx.status === 'annulee'
                            ? 'bg-red-100 text-red-800 line-through'
                            : tx.type === 'vente'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200 text-stone-800'
                        }`}
                      >
                        {tx.status === 'annulee' ? 'Annulée' : tx.type.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-600 mt-0.5 truncate">
                      {tx.clientName || tx.notes || 'Opération magasin'}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-stone-900 block tabular-nums">
                      {tx.totalAmountFcfa ? formatFcfa(tx.totalAmountFcfa) : '-'}
                    </span>
                    <span className="text-[10px] text-stone-500 block">
                      {formatDateFr(tx.date)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span>Terminal connecté en direct avec la base de données locale</span>
            <span className="font-medium text-stone-700">Réf. POS : {currentUser?.defaultSiteId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
