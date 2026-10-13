import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  ShieldAlert,
  Building2,
  TrendingUp,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Edit2,
  Save,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  Lock,
  UserCheck,
  Search,
  DollarSign,
  Layers,
  History,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, Reseller } from '../types';
import { formatFcfa, formatDateFr, exportToCsv } from '../utils/formatters';

export const OwnerAdminScreen: React.FC = () => {
  const {
    products,
    resellers,
    sites,
    transactions,
    stockLevels,
    priceLogs,
    cashClosings,
    updateProductPrices,
    updateReseller,
    addReseller,
    showToast,
  } = useApp();

  // Navigation tab inside Admin
  type AdminTab = 'dashboard' | 'tarifs' | 'revendeurs' | 'audit' | 'sheets';
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');

  // Edit price state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [retailPriceInput, setRetailPriceInput] = useState<number>(0);
  const [resellerPriceInput, setResellerPriceInput] = useState<number>(0);

  // Edit reseller state
  const [editingReseller, setEditingReseller] = useState<Reseller | null>(null);
  const [resellerLimitInput, setResellerLimitInput] = useState<number>(0);
  const [resellerPhoneInput, setResellerPhoneInput] = useState<string>('');

  // Add reseller modal
  const [isAddResellerModalOpen, setIsAddResellerModalOpen] = useState(false);
  const [newResellerName, setNewResellerName] = useState('');
  const [newResellerCity, setNewResellerCity] = useState('Abidjan');
  const [newResellerPhone, setNewResellerPhone] = useState('+225 ');
  const [newResellerLimit, setNewResellerLimit] = useState(3000000);
  const [newResellerContact, setNewResellerContact] = useState('');

  // Google sheet active tab
  const [activeSheetTab, setActiveSheetTab] = useState<'Ventes' | 'Stocks' | 'Revendeurs' | 'Clotures'>('Ventes');
  const [sheetSyncTime, setSheetSyncTime] = useState('Il y a 2 min (14:30:12 GMT)');

  // Dashboard metrics calculations
  const totalSalesRevenue = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'vente' && t.status === 'validee')
      .reduce((sum, t) => sum + (t.totalAmountFcfa || 0), 0);
  }, [transactions]);

  const totalCreditEngaged = useMemo(() => {
    return resellers.reduce((sum, r) => sum + r.currentBalanceFcfa, 0);
  }, [resellers]);

  // Sales by Site for Recharts
  const salesBySiteData = useMemo(() => {
    return sites.map((s) => {
      const total = transactions
        .filter((t) => t.siteId === s.id && t.type === 'vente' && t.status === 'validee')
        .reduce((sum, t) => sum + (t.totalAmountFcfa || 0), 0);
      return {
        name: s.name.replace('Boutique ', 'B. ').replace('Dépôt ', 'D. '),
        fullName: s.name,
        ca: total,
      };
    });
  }, [sites, transactions]);

  // Resellers at credit risk (>= 90% or over limit)
  const resellersAtRisk = useMemo(() => {
    return resellers
      .map((r) => {
        const ratio = (r.currentBalanceFcfa / r.creditLimitFcfa) * 100;
        return {
          reseller: r,
          ratio,
          isOver: r.currentBalanceFcfa > r.creditLimitFcfa,
          isNear: ratio >= 85 && r.currentBalanceFcfa <= r.creditLimitFcfa,
        };
      })
      .filter((item) => item.isOver || item.isNear)
      .sort((a, b) => b.ratio - a.ratio);
  }, [resellers]);

  // Total cash gaps from cash closings
  const totalCashGaps = useMemo(() => {
    return cashClosings.reduce((sum, c) => sum + (c.differenceFcfa || 0), 0);
  }, [cashClosings]);

  // Price Edit handlers
  const handleStartEditProduct = (p: Product) => {
    setEditingProduct(p);
    setRetailPriceInput(p.retailPriceFcfa);
    setResellerPriceInput(p.resellerPriceFcfa);
  };

  const handleSaveProductPrice = () => {
    if (!editingProduct) return;
    updateProductPrices(editingProduct.id, retailPriceInput, resellerPriceInput);
    setEditingProduct(null);
  };

  // Reseller Edit handlers
  const handleStartEditReseller = (r: Reseller) => {
    setEditingReseller(r);
    setResellerLimitInput(r.creditLimitFcfa);
    setResellerPhoneInput(r.phone);
  };

  const handleSaveReseller = () => {
    if (!editingReseller) return;
    updateReseller({
      ...editingReseller,
      creditLimitFcfa: resellerLimitInput,
      phone: resellerPhoneInput,
    });
    setEditingReseller(null);
  };

  const handleCreateReseller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResellerName.trim()) return;

    addReseller({
      name: newResellerName.trim(),
      city: newResellerCity,
      phone: newResellerPhone,
      creditLimitFcfa: newResellerLimit,
      contactPerson: newResellerContact || newResellerName,
    });

    setIsAddResellerModalOpen(false);
    setNewResellerName('');
    setNewResellerContact('');
  };

  // CSV Export
  const handleExportCsv = () => {
    const exportRows = transactions.map((t) => ({
      ID_Transaction: t.id,
      Date: t.date,
      Type: t.type,
      Site: t.siteName,
      Client: t.clientName || '',
      Montant_FCFA: t.totalAmountFcfa || 0,
      Mode_Reglement: t.paymentMethod || '',
      Ref_Paiement: t.mobileMoneyReference || '',
      Statut: t.status,
      Motif_Annulation: t.cancellationReason || '',
      Operateur: t.userName,
    }));

    exportToCsv(`Ivoire_Nutrition_Avicole_Transactions_${new Date().toISOString().slice(0, 10)}`, exportRows);
    showToast('Export CSV généré', `${exportRows.length} lignes téléchargées sur votre appareil.`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 flex flex-col gap-6">
      {/* Top Banner: Remote Montreal Owner Badge & Quick Export */}
      <div className="bg-stone-900 text-white p-5 rounded-3xl border border-stone-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-lg">
            PT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Console Direction Générale (Montréal)
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Supervision Distante
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Patrick Tremblay · Fuseau : Montréal (UTC-4) · Synchronisation temps réel Abidjan & Bouaké
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Exporter les données (CSV)</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveAdminTab('dashboard')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeAdminTab === 'dashboard'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Tableau de Bord
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('tarifs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeAdminTab === 'tarifs'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Mercuriale & Prix Officiels
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('revendeurs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeAdminTab === 'revendeurs'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Revendeurs & Crédits
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('audit')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeAdminTab === 'audit'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Journal d'Audit Central
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('sheets')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeAdminTab === 'sheets'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Aperçu Google Sheets</span>
        </button>
      </div>

      {/* Tab 1: Dashboard View */}
      {activeAdminTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
              <span className="text-xs text-stone-500 block mb-1">Chiffre d'Affaires Global</span>
              <div className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
                {formatFcfa(totalSalesRevenue)}
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">Toutes boutiques & dépôts</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
              <span className="text-xs text-stone-500 block mb-1">Encours Crédit Total Revendeurs</span>
              <div className="text-2xl font-bold font-mono text-amber-900 tabular-nums">
                {formatFcfa(totalCreditEngaged)}
              </div>
              <span className="text-[11px] text-amber-700 mt-1 block">Créances en cours de recouvrement</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
              <span className="text-xs text-stone-500 block mb-1">Revendeurs à Risque / Plafond</span>
              <div className="text-2xl font-bold font-mono text-red-700 tabular-nums">
                {resellersAtRisk.length}
              </div>
              <span className="text-[11px] text-red-700 mt-1 block">Dépassement ou proche du plafond</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
              <span className="text-xs text-stone-500 block mb-1">Écarts de Caisse Cumulés</span>
              <div
                className={`text-2xl font-bold font-mono tabular-nums ${
                  totalCashGaps === 0 ? 'text-emerald-800' : 'text-red-700'
                }`}
              >
                {formatFcfa(totalCashGaps)}
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">Sur les clôtures enregistrées</span>
            </div>
          </div>

          {/* Recharts Chart: Sales by Site */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
              <div>
                <h4 className="text-base font-bold text-stone-900 tracking-tight">
                  Chiffre d'affaires par site d'exploitation (7 derniers jours)
                </h4>
                <p className="text-xs text-stone-500">
                  Performance comparée des boutiques et dépôts en Côte d'Ivoire
                </p>
              </div>
              <span className="text-xs text-stone-500 font-mono">Devise : FCFA (XOF)</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesBySiteData} margin={{ top: 10, right: 10, left: 20, bottom: 25 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#78716C' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#78716C' }}
                    tickFormatter={(v) => `${(v / 1000).toLocaleString('fr-FR')}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatFcfa(Number(val)), "Chiffre d'affaires"]}
                    contentStyle={{
                      backgroundColor: '#FAF8F5',
                      borderRadius: '12px',
                      border: '1px solid #ECE7DE',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="ca" radius={[8, 8, 0, 0]}>
                    {salesBySiteData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index < 2 ? '#B84A28' : '#D97724'} // warm terracotta for boutiques, gold for depots
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Resellers Credit Alerts Table */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-700" strokeWidth={1.75} />
                <h4 className="text-sm font-bold text-stone-900">
                  Revendeurs nécessitant vigilance (Plafonds critiques)
                </h4>
              </div>
              <span className="text-xs text-stone-500">
                {resellersAtRisk.length} compte(s) concerné(s)
              </span>
            </div>

            <div className="space-y-2.5">
              {resellersAtRisk.map(({ reseller, ratio, isOver }) => (
                <div
                  key={reseller.id}
                  className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    isOver
                      ? 'bg-red-50 border-red-200 text-red-950'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm">{reseller.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase bg-white border border-stone-200">
                        {reseller.city}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      Contact : {reseller.contactPerson} ({reseller.phone})
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-stone-900 tabular-nums block">
                      Encours : {formatFcfa(reseller.currentBalanceFcfa)} / Plafond :{' '}
                      {formatFcfa(reseller.creditLimitFcfa)}
                    </span>
                    <span
                      className={`text-[11px] font-bold ${isOver ? 'text-red-700' : 'text-amber-800'}`}
                    >
                      {isOver ? `DÉPASSEMENT (${Math.round(ratio)}%)` : `ALERTE PLAFOND (${Math.round(ratio)}%)`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Price List Management (Mercuriale) */}
      {activeAdminTab === 'tarifs' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
              <div>
                <h4 className="text-base font-bold text-stone-900 tracking-tight">
                  Mercuriale Officielle des Prix (10 Aliments & Concentrés)
                </h4>
                <p className="text-xs text-stone-500">
                  Les caissiers et vendeurs en boutique ne peuvent pas modifier les prix. Toute modification est verrouillée par la Direction et consignée dans l'audit.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Code</th>
                    <th className="py-3 px-3">Produit & Description</th>
                    <th className="py-3 px-3">Catégorie</th>
                    <th className="py-3 px-3">Sac (kg)</th>
                    <th className="py-3 px-3 text-right">Prix Détaillant (FCFA)</th>
                    <th className="py-3 px-3 text-right">Prix Revendeur (FCFA)</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map((p) => {
                    const isEditing = editingProduct?.id === p.id;

                    return (
                      <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-stone-900">{p.code}</td>
                        <td className="py-3.5 px-3 max-w-xs">
                          <span className="font-bold text-stone-900 block">{p.name}</span>
                          <span className="text-[11px] text-stone-500 truncate block">
                            {p.description}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-semibold text-[10px]">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-mono tabular-nums">{p.sackWeightKg} kg</td>

                        {/* Retail Price column */}
                        <td className="py-3.5 px-3 text-right font-mono font-bold tabular-nums">
                          {isEditing ? (
                            <input
                              type="number"
                              step="500"
                              value={retailPriceInput}
                              onChange={(e) => setRetailPriceInput(parseInt(e.target.value) || 0)}
                              className="w-24 p-1.5 rounded-lg border border-amber-600 bg-white text-right font-mono text-xs focus:outline-none"
                            />
                          ) : (
                            formatFcfa(p.retailPriceFcfa)
                          )}
                        </td>

                        {/* Reseller Price column */}
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-amber-900 tabular-nums">
                          {isEditing ? (
                            <input
                              type="number"
                              step="500"
                              value={resellerPriceInput}
                              onChange={(e) => setResellerPriceInput(parseInt(e.target.value) || 0)}
                              className="w-24 p-1.5 rounded-lg border border-amber-600 bg-white text-right font-mono text-xs focus:outline-none"
                            />
                          ) : (
                            formatFcfa(p.resellerPriceFcfa)
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={handleSaveProductPrice}
                                className="p-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs flex items-center gap-1 font-semibold"
                                title="Sauvegarder"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>Valider</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingProduct(null)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                              >
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStartEditProduct(p)}
                              className="px-2.5 py-1 rounded-lg border border-stone-200 text-stone-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-900 transition-colors"
                            >
                              Modifier
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Price Change Audit Logs */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs">
            <h4 className="text-sm font-bold text-stone-900 mb-3">
              Historique des modifications de prix (Audit log)
            </h4>
            <div className="space-y-2">
              {priceLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-stone-900">{log.productName}</span> —{' '}
                    <span className="text-stone-600">{log.fieldLabel}</span> modifié de{' '}
                    <span className="font-mono text-red-700 line-through">
                      {formatFcfa(log.oldValue)}
                    </span>{' '}
                    à <span className="font-mono text-emerald-800 font-bold">{formatFcfa(log.newValue)}</span>
                  </div>
                  <div className="text-right text-[11px] text-stone-500">
                    <span>Par {log.changedBy}</span> · <span>{formatDateFr(log.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Resellers & Credit Limits */}
      {activeAdminTab === 'revendeurs' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
              <div>
                <h4 className="text-base font-bold text-stone-900 tracking-tight">
                  Gestion des 12 Revendeurs Agréés & Plafonds de Crédit
                </h4>
                <p className="text-xs text-stone-500">
                  Définissez les plafonds de crédit autorisés. Les ventes au comptoir sont bloquées dès que le plafond est atteint.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddResellerModalOpen(true)}
                className="py-2 px-3 rounded-xl bg-warm-terracotta text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs hover:opacity-95"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Revendeur</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Revendeur</th>
                    <th className="py-3 px-3">Ville</th>
                    <th className="py-3 px-3">Téléphone</th>
                    <th className="py-3 px-3 text-right">Plafond Crédit</th>
                    <th className="py-3 px-3 text-right">Encours Actuel</th>
                    <th className="py-3 px-3 text-center">Taux d'usage</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {resellers.map((r) => {
                    const isEditing = editingReseller?.id === r.id;
                    const ratio = Math.round((r.currentBalanceFcfa / r.creditLimitFcfa) * 100);
                    const isOver = r.currentBalanceFcfa > r.creditLimitFcfa;

                    return (
                      <tr key={r.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-stone-900 block">{r.name}</span>
                          <span className="text-[11px] text-stone-500">Contact: {r.contactPerson}</span>
                        </td>
                        <td className="py-3.5 px-3 text-stone-700">{r.city}</td>
                        <td className="py-3.5 px-3 font-mono text-stone-700">
                          {isEditing ? (
                            <input
                              type="text"
                              value={resellerPhoneInput}
                              onChange={(e) => setResellerPhoneInput(e.target.value)}
                              className="w-32 p-1 rounded border border-stone-300 text-xs"
                            />
                          ) : (
                            r.phone
                          )}
                        </td>

                        {/* Credit Limit */}
                        <td className="py-3.5 px-3 text-right font-mono font-bold tabular-nums">
                          {isEditing ? (
                            <input
                              type="number"
                              step="500000"
                              value={resellerLimitInput}
                              onChange={(e) => setResellerLimitInput(parseInt(e.target.value) || 0)}
                              className="w-28 p-1 rounded border border-amber-600 text-right font-mono text-xs"
                            />
                          ) : (
                            formatFcfa(r.creditLimitFcfa)
                          )}
                        </td>

                        {/* Current Balance */}
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-amber-900 tabular-nums">
                          {formatFcfa(r.currentBalanceFcfa)}
                        </td>

                        {/* Ratio */}
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isOver
                                ? 'bg-red-100 text-red-800'
                                : ratio >= 85
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-50 text-emerald-800'
                            }`}
                          >
                            {ratio}% {isOver ? '(Bloqué)' : ''}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={handleSaveReseller}
                                className="p-1 px-2.5 rounded-lg bg-emerald-700 text-white font-semibold text-xs"
                              >
                                Valider
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingReseller(null)}
                                className="p-1 text-stone-400 hover:text-stone-700"
                              >
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStartEditReseller(r)}
                              className="px-2.5 py-1 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100"
                            >
                              Ajuster
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Central Audit Log */}
      {activeAdminTab === 'audit' && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <h4 className="text-base font-bold text-stone-900">
                Piste d'Audit Centralisée (Annulations, Corrections & Prix)
              </h4>
              <p className="text-xs text-stone-500">
                Conformité stricte : aucun enregistrement n'est effacé de la base
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {transactions
              .filter((t) => t.status === 'annulee')
              .map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 rounded-2xl bg-red-50/70 border border-red-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-red-950">
                      ANNULATION : {tx.id} ({tx.siteName})
                    </span>
                    <span className="text-[11px] text-red-700 font-mono">
                      {formatDateFr(tx.cancelledAt || tx.date)}
                    </span>
                  </div>

                  <p className="text-stone-800">
                    <strong>Motif obligatoire consigné :</strong> "{tx.cancellationReason}"
                  </p>

                  <div className="text-[11px] text-stone-500 pt-1 border-t border-red-200/60 flex justify-between">
                    <span>Opérateur ayant validé l'annulation : <strong>{tx.cancelledBy}</strong></span>
                    <span>Montant annulé : {tx.totalAmountFcfa ? formatFcfa(tx.totalAmountFcfa) : '-'}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab 5: Google Sheets Mirror Panel */}
      {activeAdminTab === 'sheets' && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-stone-900">
                  Aperçu Google Sheets · Direction Montréal
                </h4>
                <p className="text-xs text-stone-500">
                  Feuille de calcul miroir : "INA_DISTRIB_REPORTING_MONTREAL_2026.xlsx"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                <span>Dernière synchro : {sheetSyncTime}</span>
              </span>

              <button
                type="button"
                onClick={() => {
                  setSheetSyncTime("À l'instant (14:32:00 GMT)");
                  showToast('Google Sheets synchronisé', 'Flux Google Drive mis à jour avec succès.', 'success');
                }}
                className="p-2 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700"
                title="Actualiser la synchronisation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Spreadsheet tabs */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs">
            {(['Ventes', 'Stocks', 'Revendeurs', 'Clotures'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveSheetTab(tab)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeSheetTab === tab
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Feuille '{tab}'
              </button>
            ))}
          </div>

          {/* Spreadsheet Grid Simulation */}
          <div className="border border-stone-300 rounded-2xl overflow-hidden font-mono text-[11px]">
            <div className="bg-stone-100 px-3 py-1.5 border-b border-stone-300 text-stone-600 flex items-center gap-2">
              <span className="font-bold text-stone-800">fx</span>
              <span className="bg-white px-2 py-0.5 rounded border border-stone-300 flex-1 truncate text-stone-700">
                =QUERY(Ventes!A1:H100; "SELECT A, B, C, F WHERE G='validee'"; 1)
              </span>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left bg-white">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 border-b border-stone-200">
                    <th className="py-2 px-2 border-r border-stone-200 w-10 text-center bg-stone-100">
                      #
                    </th>
                    <th className="py-2 px-3 border-r border-stone-200">A · ID_TX</th>
                    <th className="py-2 px-3 border-r border-stone-200">B · DATE_UTC</th>
                    <th className="py-2 px-3 border-r border-stone-200">C · SITE_CI</th>
                    <th className="py-2 px-3 border-r border-stone-200">D · CLIENT</th>
                    <th className="py-2 px-3 border-r border-stone-200 text-right">E · MONTANT_FCFA</th>
                    <th className="py-2 px-3 border-r border-stone-200">F · PAIEMENT</th>
                    <th className="py-2 px-3">G · STATUT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {transactions.slice(0, 15).map((t, idx) => (
                    <tr key={t.id} className="hover:bg-emerald-50/30">
                      <td className="py-1.5 px-2 text-center text-stone-400 bg-stone-50 border-r border-stone-200">
                        {idx + 2}
                      </td>
                      <td className="py-1.5 px-3 border-r border-stone-200 font-bold text-stone-900">
                        {t.id}
                      </td>
                      <td className="py-1.5 px-3 border-r border-stone-200 text-stone-600">
                        {t.date.slice(0, 16).replace('T', ' ')}
                      </td>
                      <td className="py-1.5 px-3 border-r border-stone-200 text-stone-800">
                        {t.siteName}
                      </td>
                      <td className="py-1.5 px-3 border-r border-stone-200 text-stone-800 truncate max-w-[150px]">
                        {t.clientName || 'Particulier'}
                      </td>
                      <td className="py-1.5 px-3 border-r border-stone-200 text-right tabular-nums font-bold">
                        {t.totalAmountFcfa ? t.totalAmountFcfa.toLocaleString('fr-FR') : '-'}
                      </td>
                      <td className="py-1.5 px-3 border-r border-stone-200 capitalize text-stone-700">
                        {t.paymentMethod || '-'}
                      </td>
                      <td className="py-1.5 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            t.status === 'validee'
                              ? 'text-emerald-700 bg-emerald-50'
                              : 'text-red-700 bg-red-50'
                          }`}
                        >
                          {t.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Reseller Modal */}
      <AnimatePresence>
        {isAddResellerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 max-w-md w-full"
            >
              <h4 className="text-lg font-bold text-stone-900 mb-1">
                Créer un nouveau revendeur agréé
              </h4>
              <p className="text-xs text-stone-500 mb-4">
                Enregistrement dans le réseau de distribution avicole
              </p>

              <form onSubmit={handleCreateReseller} className="space-y-3 text-xs">
                <div>
                  <label className="text-stone-600 block mb-1 font-semibold">Nom de la ferme / Société :</label>
                  <input
                    type="text"
                    required
                    value={newResellerName}
                    onChange={(e) => setNewResellerName(e.target.value)}
                    placeholder="Ex: Élevage Moderne Bouaké"
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-stone-600 block mb-1 font-semibold">Ville :</label>
                    <input
                      type="text"
                      required
                      value={newResellerCity}
                      onChange={(e) => setNewResellerCity(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-stone-600 block mb-1 font-semibold">Téléphone (+225) :</label>
                    <input
                      type="text"
                      required
                      value={newResellerPhone}
                      onChange={(e) => setNewResellerPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-stone-600 block mb-1 font-semibold">Contact responsable :</label>
                  <input
                    type="text"
                    value={newResellerContact}
                    onChange={(e) => setNewResellerContact(e.target.value)}
                    placeholder="Ex: M. Kouamé Adama"
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                  />
                </div>

                <div>
                  <label className="text-stone-600 block mb-1 font-semibold">Plafond de crédit initial (FCFA) :</label>
                  <input
                    type="number"
                    step="500000"
                    required
                    value={newResellerLimit}
                    onChange={(e) => setNewResellerLimit(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-mono font-bold"
                  />
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsAddResellerModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-warm-terracotta text-white font-bold"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
