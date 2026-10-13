import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  Ban,
  Clock,
  Eye,
  X,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  Store,
  User,
  ShieldAlert,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Transaction, TransactionType } from '../types';
import { formatFcfa, formatDateFr } from '../utils/formatters';

export const HistoryScreen: React.FC = () => {
  const { transactions, sites, users, cancelTransaction, currentUser } = useApp();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Drawer & Cancellation modal states
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [txToCancel, setTxToCancel] = useState<Transaction | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');

  // Filter logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.clientName && t.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.userName && t.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.mobileMoneyReference && t.mobileMoneyReference.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType = typeFilter === 'all' || t.type === typeFilter;
      const matchSite = siteFilter === 'all' || t.siteId === siteFilter;
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;

      return matchSearch && matchType && matchSite && matchStatus;
    });
  }, [transactions, searchQuery, typeFilter, siteFilter, statusFilter]);

  const handleOpenCancelModal = (tx: Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
    setTxToCancel(tx);
    setCancelReason('');
    setCancelError('');
  };

  const handleConfirmCancel = () => {
    if (!txToCancel) return;
    if (!cancelReason.trim()) {
      setCancelError('Le motif d’annulation est strictement obligatoire.');
      return;
    }

    const res = cancelTransaction(txToCancel.id, cancelReason);
    if (!res.success) {
      setCancelError(res.error || 'Erreur lors de l’annulation');
    } else {
      setTxToCancel(null);
      setCancelReason('');
      if (selectedTx && selectedTx.id === txToCancel.id) {
        // update drawer view too
        const updated = transactions.find((t) => t.id === txToCancel.id);
        if (updated) setSelectedTx(updated);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 flex flex-col gap-6">
      {/* Page Title & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <h3 className="text-xl font-bold text-stone-900 tracking-tight">
              Journal des Opérations & Piste d'Audit
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Historique inaltérable de toutes les écritures : ventes, transferts, réceptions et clôtures
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par ID, client, référence..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30"
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Type filter */}
          <div>
            <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Type d'opération
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30"
            >
              <option value="all">Tous les types ({transactions.length})</option>
              <option value="vente">Ventes au comptoir</option>
              <option value="entree_stock">Réceptions usine</option>
              <option value="transfert">Transferts de stock</option>
              <option value="retour">Retours clients</option>
              <option value="avarie">Avaries & pertes</option>
              <option value="cloture_caisse">Clôtures de caisse</option>
            </select>
          </div>

          {/* Site filter */}
          <div>
            <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Site d'exploitation
            </label>
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30"
            >
              <option value="all">Tous les sites (Abidjan, Bouaké, Dépôts...)</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.city})
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Statut d'audit
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30"
            >
              <option value="all">Toutes les écritures</option>
              <option value="validee">Validées uniquement</option>
              <option value="annulee">Annulées uniquement</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs text-stone-500 font-medium">
          <span>{filteredTransactions.length} opération(s) trouvée(s)</span>
          <span>Touchez une ligne pour ouvrir la piste d'audit détaillée</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Réf. Transaction</th>
                <th className="py-3 px-3">Date & Heure</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Site</th>
                <th className="py-3 px-3">Client / Objet</th>
                <th className="py-3 px-3 text-right">Montant</th>
                <th className="py-3 px-3">Paiement</th>
                <th className="py-3 px-3 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredTransactions.map((tx) => {
                const isCancelled = tx.status === 'annulee';

                return (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className={`cursor-pointer transition-colors ${
                      isCancelled
                        ? 'bg-stone-50/70 hover:bg-stone-100/60 opacity-70'
                        : 'hover:bg-amber-50/40'
                    }`}
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      <span className={isCancelled ? 'line-through text-stone-400' : ''}>
                        {tx.id}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 text-stone-600 font-mono whitespace-nowrap">
                      {formatDateFr(tx.date)}
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          tx.type === 'vente'
                            ? 'bg-emerald-50 text-emerald-800'
                            : tx.type === 'entree_stock'
                            ? 'bg-blue-50 text-blue-800'
                            : tx.type === 'transfert'
                            ? 'bg-amber-50 text-amber-800'
                            : tx.type === 'avarie'
                            ? 'bg-red-50 text-red-800'
                            : 'bg-stone-100 text-stone-800'
                        }`}
                      >
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Site */}
                    <td className="py-3.5 px-3 text-stone-700 whitespace-nowrap">{tx.siteName}</td>

                    {/* Client / Notes */}
                    <td className="py-3.5 px-3 font-medium text-stone-900 max-w-xs truncate">
                      <span className={isCancelled ? 'line-through text-stone-400' : ''}>
                        {tx.clientName || tx.notes || 'Opération interne'}
                      </span>
                    </td>

                    {/* Montant */}
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-stone-900 tabular-nums whitespace-nowrap">
                      <span className={isCancelled ? 'line-through text-stone-400' : ''}>
                        {tx.totalAmountFcfa ? formatFcfa(tx.totalAmountFcfa) : '-'}
                      </span>
                    </td>

                    {/* Payment mode */}
                    <td className="py-3.5 px-3 text-stone-600 capitalize whitespace-nowrap">
                      {tx.paymentMethod ? (
                        tx.paymentMethod === 'mobile_money' ? (
                          <span className="text-[11px] font-medium text-orange-700">
                            MoMo ({tx.mobileMoneyOperator})
                          </span>
                        ) : (
                          tx.paymentMethod
                        )
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {isCancelled ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                          Annulée
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Validée
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {!isCancelled && tx.type !== 'cloture_caisse' ? (
                        <button
                          type="button"
                          onClick={(e) => handleOpenCancelModal(tx, e)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-700 hover:bg-red-50 hover:text-red-800 border border-transparent hover:border-red-200 transition-colors"
                          title="Annuler avec motif obligatoire"
                        >
                          Annuler
                        </button>
                      ) : (
                        <span className="text-[11px] text-stone-400">Verrouillé</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Trail Drawer on row click */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/50 backdrop-blur-xs">
            <div className="absolute inset-0" onClick={() => setSelectedTx(null)} />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg bg-[#FAF8F5] h-full shadow-2xl border-l border-stone-200 flex flex-col z-10"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-stone-200 bg-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-stone-900 font-mono">
                      {selectedTx.id}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        selectedTx.status === 'annulee'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {selectedTx.status === 'annulee' ? 'ANNULÉE' : 'VALIDÉE'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">Piste d'audit et historique complet</p>
                </div>

                <button
                  onClick={() => setSelectedTx(null)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                {/* Cancellation Banner if cancelled */}
                {selectedTx.status === 'annulee' && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-xs text-red-900">
                      <ShieldAlert className="w-4 h-4 text-red-700" />
                      <span>ÉCRITURE ANNULÉE DANS LE REGISTRE</span>
                    </div>
                    <p className="text-xs">
                      <strong>Motif obligatoire enregistré :</strong> "{selectedTx.cancellationReason}"
                    </p>
                    <p className="text-[11px] text-red-800">
                      Annulée par <strong>{selectedTx.cancelledBy}</strong> le{' '}
                      {formatDateFr(selectedTx.cancelledAt || selectedTx.date)}
                    </p>
                    <p className="text-[10px] text-red-700/80 pt-1 border-t border-red-200">
                      Les stocks et le solde client ont été automatiquement réajustés. L'écriture d'origine reste conservée à des fins d'audit fiscal et comptable.
                    </p>
                  </div>
                )}

                {/* Primary Metadata */}
                <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2.5">
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-500">Date et heure locale :</span>
                    <span className="font-mono font-semibold text-stone-900">
                      {formatDateFr(selectedTx.date)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-500">Site d'opération :</span>
                    <span className="font-semibold text-stone-900">{selectedTx.siteName}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-500">Opérateur / Caissier :</span>
                    <span className="font-semibold text-stone-900">{selectedTx.userName}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-500">Client :</span>
                    <span className="font-semibold text-stone-900">
                      {selectedTx.clientName || 'Client de passage'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-stone-500">Mode de paiement :</span>
                    <span className="font-semibold text-stone-900 capitalize">
                      {selectedTx.paymentMethod || 'Non applicable'}
                    </span>
                  </div>

                  {selectedTx.mobileMoneyReference && (
                    <div className="flex justify-between py-1 border-t border-stone-100">
                      <span className="text-stone-500">Réf. Opérateur MoMo :</span>
                      <span className="font-mono font-semibold text-orange-800">
                        {selectedTx.mobileMoneyReference}
                      </span>
                    </div>
                  )}
                </div>

                {/* Items Breakdown */}
                {selectedTx.items && selectedTx.items.length > 0 && (
                  <div className="bg-white p-4 rounded-2xl border border-stone-200">
                    <h5 className="font-bold text-stone-900 mb-2">Articles concernés :</h5>
                    <div className="space-y-2">
                      {selectedTx.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-2 rounded-xl bg-stone-50 border border-stone-100"
                        >
                          <div>
                            <span className="font-semibold text-stone-900 block">{it.productName}</span>
                            <span className="text-[11px] text-stone-500">
                              {it.quantity} sacs ({it.sackWeightKg} kg) à {formatFcfa(it.unitPrice)}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-stone-900">
                            {formatFcfa(it.total)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 mt-3 border-t border-stone-100 flex justify-between font-bold text-sm text-stone-900">
                      <span>Total général :</span>
                      <span className="font-mono text-amber-900">
                        {selectedTx.totalAmountFcfa ? formatFcfa(selectedTx.totalAmountFcfa) : '-'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Audit & Technical metadata */}
                <div className="bg-stone-100 p-4 rounded-2xl border border-stone-200 space-y-1.5 text-[11px] text-stone-600 font-mono">
                  <div className="font-bold text-stone-800 font-sans mb-1 text-xs">
                    Certificat technique d'audit :
                  </div>
                  <div>Statut synchronisation : {selectedTx.syncStatus.toUpperCase()}</div>
                  <div className="truncate">Clé idempotence : {selectedTx.idempotencyKey}</div>
                  <div>Horodatage création : {selectedTx.localCreatedAt}</div>
                  <div>Terminal source : Android Tablet 10" (Landscape)</div>
                </div>

                {/* Cancel CTA inside drawer */}
                {selectedTx.status !== 'annulee' && selectedTx.type !== 'cloture_caisse' && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={(e) => handleOpenCancelModal(selectedTx, e)}
                      className="w-full py-3 px-4 rounded-xl border border-red-300 bg-red-50 text-red-800 hover:bg-red-100 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Ban className="w-4 h-4" />
                      <span>Annuler cette écriture avec motif</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancellation Reason Modal (Mandatory Reason) */}
      <AnimatePresence>
        {txToCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 md:p-8 max-w-md w-full relative"
            >
              <button
                onClick={() => setTxToCancel(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-700 mx-auto flex items-center justify-center mb-2">
                  <AlertTriangle className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <h4 className="text-lg font-bold text-stone-900">Annulation de Transaction</h4>
                <p className="text-xs text-stone-500 mt-1">
                  Transaction : <strong className="font-mono text-stone-800">{txToCancel.id}</strong>
                </p>
                <p className="text-[11px] text-stone-500">
                  Cette opération ne supprime pas la ligne. Elle enregistre l'annulation et restaure les stocks.
                </p>
              </div>

              {cancelError && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-800 text-xs font-medium rounded-xl">
                  {cancelError}
                </div>
              )}

              <div className="my-4">
                <label className="text-xs font-semibold text-red-900 block mb-1">
                  Motif d'annulation obligatoire :
                </label>
                <textarea
                  required
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ex: Erreur saisie de quantité par le caissier, double encaissement, désistement avant livraison..."
                  className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
                />
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setTxToCancel(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50"
                >
                  Retour
                </button>

                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-700 text-white text-xs font-bold hover:bg-red-800 shadow-sm"
                >
                  Confirmer l'annulation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
