import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Calculator,
  Coins,
  CheckCircle2,
  AlertTriangle,
  History,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Plus,
  Minus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatFcfa, formatDateFr } from '../utils/formatters';

const FCFA_DENOMINATIONS = [
  10000, 5000, 2000, 1000, 500, 250, 200, 100, 50, 25,
];

export const CashClosingScreen: React.FC = () => {
  const {
    currentSite,
    currentUser,
    transactions,
    cashClosings,
    recordCashClosing,
  } = useApp();

  const [viewMode, setViewMode] = useState<'cloture' | 'historique_jour' | 'historique_semaine'>('cloture');

  // Denominations count state (pieces/billets)
  const [counts, setCounts] = useState<Record<number, number>>({
    10000: 0,
    5000: 0,
    2000: 0,
    1000: 0,
    500: 0,
    250: 0,
    200: 0,
    100: 0,
    50: 0,
    25: 0,
  });

  const [justification, setJustification] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Calculate theoretical expected cash from today's cash transactions on current site
  const todayStr = '2026-10-13';
  const siteCashSales = transactions.filter(
    (t) =>
      t.siteId === currentSite.id &&
      t.type === 'vente' &&
      t.paymentMethod === 'especes' &&
      t.status === 'validee' &&
      (t.date.startsWith(todayStr) || t.localCreatedAt.startsWith(todayStr))
  );

  const initialFloat = 50000; // Fond de caisse d'ouverture usuel en FCFA
  const todayCashSalesTotal = siteCashSales.reduce((acc, t) => acc + (t.totalAmountFcfa || 0), 0);
  const theoreticalCash = todayCashSalesTotal + initialFloat;

  // Total counted
  const countedTotal = useMemo(() => {
    return Object.entries(counts).reduce((sum, [denom, qty]) => {
      return sum + Number(denom) * Number(qty);
    }, 0);
  }, [counts]);

  const difference = countedTotal - theoreticalCash;
  const isZeroDiff = difference === 0;

  const handleCountChange = (denom: number, delta: number) => {
    setCounts((prev) => ({
      ...prev,
      [denom]: Math.max(0, (prev[denom] || 0) + delta),
    }));
  };

  const handleDirectInput = (denom: number, val: string) => {
    const num = Math.max(0, parseInt(val) || 0);
    setCounts((prev) => ({
      ...prev,
      [denom]: num,
    }));
  };

  // Helper to prefill matching exact cash for quick demo convenience
  const handleAutoFillExact = () => {
    // Fill realistic notes matching theoretical cash
    let remaining = theoreticalCash;
    const newCounts: Record<number, number> = { ...counts };

    for (const d of FCFA_DENOMINATIONS) {
      if (remaining >= d) {
        const count = Math.floor(remaining / d);
        newCounts[d] = count;
        remaining -= count * d;
      } else {
        newCounts[d] = 0;
      }
    }
    setCounts(newCounts);
    setJustification('');
  };

  const handleSubmitClosing = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (countedTotal === 0) {
      setErrorMessage('Veuillez renseigner le comptage des coupures en caisse.');
      return;
    }

    if (!isZeroDiff && (!justification || !justification.trim())) {
      setErrorMessage(
        `Un écart de ${formatFcfa(
          difference
        )} a été détecté. La justification écrite du différentiel est strictement obligatoire.`
      );
      return;
    }

    const res = recordCashClosing({
      theoreticalCash,
      countedCash: countedTotal,
      denominations: counts,
      justification: justification.trim(),
    });

    if (!res.success) {
      setErrorMessage(res.error || 'Erreur lors de la validation de la clôture.');
    } else {
      // Reset
      setJustification('');
      setViewMode('historique_jour');
    }
  };

  // Closings filtered by site
  const siteClosings = cashClosings.filter((c) => c.siteId === currentSite.id);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 flex flex-col gap-6">
      {/* Top Navigation Tabs for Daily/Weekly views */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs">
        <div>
          <h3 className="text-lg font-bold text-stone-900 tracking-tight">
            Clôture de Caisse & Rapprochement
          </h3>
          <p className="text-xs text-stone-500">
            {currentSite.name} · Responsable : {currentUser?.name}
          </p>
        </div>

        {/* View Mode Segmented Control */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setViewMode('cloture')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'cloture'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Saisie Clôture
          </button>
          <button
            type="button"
            onClick={() => setViewMode('historique_jour')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'historique_jour'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Clôtures Journalières
          </button>
          <button
            type="button"
            onClick={() => setViewMode('historique_semaine')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'historique_semaine'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Vue Hebdomadaire
          </button>
        </div>
      </div>

      {viewMode === 'cloture' ? (
        /* Saisie de clôture (Denominations Counting) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Denomination Counters (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div>
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                  Coupures & Monnaie FCFA (XOF)
                </span>
                <span className="text-xs text-stone-600">
                  Comptez les billets et pièces physiques dans le tiroir-caisse
                </span>
              </div>

              <button
                type="button"
                onClick={handleAutoFillExact}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                title="Remplir le montant théorique pour test rapide"
              >
                Équilibrer démo
              </button>
            </div>

            {/* Denomination rows */}
            <div className="space-y-2.5">
              {FCFA_DENOMINATIONS.map((denom) => {
                const isBanknote = denom >= 500;
                const count = counts[denom] || 0;
                const subtotal = denom * count;

                return (
                  <div
                    key={denom}
                    className="p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200/90 flex items-center justify-between gap-3 text-xs"
                  >
                    {/* Denomination badge */}
                    <div className="flex items-center gap-2.5 w-36 shrink-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                          isBanknote
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-stone-200 text-stone-800 border border-stone-300'
                        }`}
                      >
                        {isBanknote ? 'B' : 'P'}
                      </div>
                      <div>
                        <span className="font-mono font-bold text-stone-900 text-sm tabular-nums block">
                          {denom.toLocaleString('fr-FR')} FCFA
                        </span>
                        <span className="text-[10px] text-stone-500">
                          {isBanknote ? 'Billet' : 'Pièce'}
                        </span>
                      </div>
                    </div>

                    {/* Stepper with touch targets >= 44px */}
                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200">
                      <button
                        type="button"
                        onClick={() => handleCountChange(denom, -1)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 active:scale-95 transition-all"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <input
                        type="number"
                        min="0"
                        value={count}
                        onChange={(e) => handleDirectInput(denom, e.target.value)}
                        className="w-14 text-center font-bold font-mono text-sm tabular-nums text-stone-900 focus:outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => handleCountChange(denom, 1)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 active:scale-95 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right w-28 shrink-0">
                      <span className="font-mono font-bold text-stone-900 tabular-nums text-xs">
                        {formatFcfa(subtotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Reconciliation & Justification (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs flex flex-col justify-between sticky top-22">
            <div>
              <div className="pb-3 border-b border-stone-200 mb-4">
                <h4 className="text-base font-bold text-stone-900 tracking-tight">
                  Rapprochement Caisse Théorique vs Compté
                </h4>
                <p className="text-xs text-stone-500">Rapprochement en direct des encaissements</p>
              </div>

              {/* Summary Cards */}
              <div className="space-y-3 mb-4">
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-stone-500 block">Fond de caisse d'ouverture</span>
                    <span className="font-semibold text-stone-700">Dépôt initial sécurisé</span>
                  </div>
                  <span className="font-mono font-bold text-stone-900 tabular-nums">
                    {formatFcfa(initialFloat)}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-stone-500 block">Ventes en espèces du jour</span>
                    <span className="font-semibold text-stone-700">
                      {siteCashSales.length} transaction(s)
                    </span>
                  </div>
                  <span className="font-mono font-bold text-stone-900 tabular-nums">
                    {formatFcfa(todayCashSalesTotal)}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-amber-900 font-semibold block">Total Théorique Attendu</span>
                    <span className="text-[11px] text-amber-700">Fond + Ventes espèces</span>
                  </div>
                  <span className="font-mono font-bold text-amber-950 text-base tabular-nums">
                    {formatFcfa(theoreticalCash)}
                  </span>
                </div>

                {/* Total Counted live */}
                <div className="p-3.5 rounded-2xl bg-stone-900 text-white flex justify-between items-center text-xs">
                  <div>
                    <span className="text-stone-300 block">Total Espèces Compté</span>
                    <span className="text-[11px] text-stone-400">Somme des coupures</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400 text-xl tabular-nums">
                    {formatFcfa(countedTotal)}
                  </span>
                </div>

                {/* Écart de caisse (Difference display) */}
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
                    isZeroDiff
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : difference > 0
                      ? 'bg-blue-50 border-blue-300 text-blue-950'
                      : 'bg-red-50 border-red-300 text-red-950'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isZeroDiff ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold block">
                        {isZeroDiff
                          ? 'Caisse équilibrée (Écart nul)'
                          : difference > 0
                          ? 'Excédent de caisse'
                          : 'Déficit de caisse'}
                      </span>
                      <span className="text-[11px] opacity-80">
                        {isZeroDiff ? 'Montant parfait' : 'Justification exigée'}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-base tabular-nums">
                    {formatFcfa(difference)}
                  </span>
                </div>
              </div>

              {/* Justification field required if difference !== 0 */}
              {!isZeroDiff && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4"
                >
                  <label className="text-xs font-semibold text-red-900 block mb-1">
                    Motif obligatoire de l'écart ({formatFcfa(difference)}) :
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Ex: Rendu de monnaie erroné sur vente n°..., coupure abîmée non acceptée..."
                    className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30"
                  />
                </motion.div>
              )}

              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Validation Button */}
            <div className="pt-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmitClosing}
                className="w-full h-14 rounded-2xl bg-warm-terracotta text-white font-bold text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Valider et signer la clôture journalière</span>
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        /* History Views (Daily / Weekly) */
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
            <div>
              <h4 className="text-base font-bold text-stone-900">
                {viewMode === 'historique_jour'
                  ? 'Historique des clôtures journalières'
                  : 'Synthèse des clôtures de la semaine'}
              </h4>
              <p className="text-xs text-stone-500">
                Enregistrements horodatés des vérifications de caisse
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Réf. Clôture</th>
                  <th className="py-3 px-3">Date & Heure</th>
                  <th className="py-3 px-3">Caissier / Opérateur</th>
                  <th className="py-3 px-3 text-right">Théorique</th>
                  <th className="py-3 px-3 text-right">Compté</th>
                  <th className="py-3 px-3 text-right">Écart</th>
                  <th className="py-3 px-3">Justification</th>
                  <th className="py-3 px-3 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {siteClosings.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-stone-900">{c.id}</td>
                    <td className="py-3 px-3 text-stone-600 font-mono">{formatDateFr(c.date)}</td>
                    <td className="py-3 px-3 font-medium text-stone-800">{c.userName}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {formatFcfa(c.theoreticalCashFcfa)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-stone-900 tabular-nums">
                      {formatFcfa(c.countedCashFcfa)}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-mono font-bold tabular-nums ${
                        c.differenceFcfa === 0
                          ? 'text-emerald-700'
                          : c.differenceFcfa > 0
                          ? 'text-blue-700'
                          : 'text-red-700'
                      }`}
                    >
                      {formatFcfa(c.differenceFcfa)}
                    </td>
                    <td className="py-3 px-3 text-stone-600 max-w-xs truncate">
                      {c.justification || 'Équilibré'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Validée
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
