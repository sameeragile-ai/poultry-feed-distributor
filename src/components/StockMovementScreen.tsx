import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PackageCheck,
  ArrowRightLeft,
  RotateCcw,
  AlertOctagon,
  Building2,
  Store,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Truck,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatFcfa, formatDateFr } from '../utils/formatters';

export const StockMovementScreen: React.FC<StockMovementScreenProps> = () => {
  const {
    currentSite,
    sites,
    products,
    transfers,
    createStockMovement,
    confirmTransferReception,
    getStockForProduct,
  } = useApp();

  type MovementType = 'entree_stock' | 'transfert' | 'retour' | 'avarie';

  const [movementType, setMovementType] = useState<MovementType>('entree_stock');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(10);
  const [destinationSiteId, setDestinationSiteId] = useState<string>(
    sites.find((s) => s.id !== currentSite.id)?.id || ''
  );
  const [reason, setReason] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const currentStock = getStockForProduct(currentSite.id, selectedProductId);

  // Transfers relevant to current site
  const incomingTransfers = transfers.filter(
    (t) => t.toSiteId === currentSite.id && t.status === 'en_transit'
  );
  const outgoingTransfers = transfers.filter(
    (t) => t.fromSiteId === currentSite.id && t.status === 'en_transit'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (quantity <= 0) {
      setFormError('La quantité doit être supérieure à zéro.');
      return;
    }

    if (movementType === 'transfert' && !destinationSiteId) {
      setFormError('Veuillez sélectionner un site de destination pour le transfert.');
      return;
    }

    if (movementType === 'transfert' && destinationSiteId === currentSite.id) {
      setFormError('Le site de destination doit être différent du site d’origine.');
      return;
    }

    if ((movementType === 'retour' || movementType === 'avarie') && !reason.trim()) {
      setFormError(`Le motif d'opération est obligatoire pour les opérations de type "${movementType === 'retour' ? 'Retour' : 'Avarie'}".`);
      return;
    }

    const res = createStockMovement({
      type: movementType,
      productId: selectedProductId,
      quantity,
      destinationSiteId: movementType === 'transfert' ? destinationSiteId : undefined,
      reason: reason.trim(),
    });

    if (!res.success) {
      setFormError(res.error || 'Erreur lors de la validation du mouvement');
    } else {
      // Reset form
      setQuantity(10);
      setReason('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 flex flex-col gap-6">
      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Movement Entry Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200">
            <div>
              <h3 className="text-lg font-bold text-stone-900 tracking-tight">
                Enregistrer un mouvement de stock
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Site d'opération : <strong className="text-stone-800">{currentSite.name}</strong> ({currentSite.city})
              </p>
            </div>
            <span className="text-[11px] font-semibold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              Traçabilité garantie
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {/* Type selector tabs */}
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                Type d'opération
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setMovementType('entree_stock')}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    movementType === 'entree_stock'
                      ? 'bg-amber-50 border-amber-600 text-amber-950 shadow-2xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <PackageCheck className="w-4 h-4 text-emerald-700" strokeWidth={1.75} />
                  <span className="text-center leading-tight">Réception Usine</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMovementType('transfert')}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    movementType === 'transfert'
                      ? 'bg-amber-50 border-amber-600 text-amber-950 shadow-2xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <ArrowRightLeft className="w-4 h-4 text-amber-700" strokeWidth={1.75} />
                  <span className="text-center leading-tight">Transfert Sites</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMovementType('retour')}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    movementType === 'retour'
                      ? 'bg-amber-50 border-amber-600 text-amber-950 shadow-2xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <RotateCcw className="w-4 h-4 text-blue-700" strokeWidth={1.75} />
                  <span className="text-center leading-tight">Retour Client</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMovementType('avarie')}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    movementType === 'avarie'
                      ? 'bg-red-50 border-red-500 text-red-950 shadow-2xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <AlertOctagon className="w-4 h-4 text-red-700" strokeWidth={1.75} />
                  <span className="text-center leading-tight">Avarie / Perte</span>
                </button>
              </div>
            </div>

            {/* Product selection */}
            <div>
              <label className="text-xs font-semibold text-stone-600 block mb-1">
                Produit concerné :
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30"
              >
                {products.map((p) => {
                  const stock = getStockForProduct(currentSite.id, p.id);
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} (Sac {p.sackWeightKg} kg) — Stock actuel : {stock} sacs
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Quantity stepper & stock alert */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1">
                  Quantité de sacs :
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50 text-base font-bold font-mono text-stone-900 tabular-nums focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30"
                  />
                  <span className="text-xs text-stone-500 font-medium shrink-0">sacs</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-center">
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
                  Disponibilité actuelle
                </span>
                <span className="text-lg font-bold text-stone-900 font-mono tabular-nums">
                  {currentStock} sacs
                </span>
                <span className="text-[11px] text-stone-500">
                  {currentProduct.sackWeightKg * currentStock} kg au dépôt
                </span>
              </div>
            </div>

            {/* If Transfer: Destination site */}
            {movementType === 'transfert' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-1"
              >
                <label className="text-xs font-semibold text-stone-600 block mb-1">
                  Site destinataire (transfert vers) :
                </label>
                <select
                  value={destinationSiteId}
                  onChange={(e) => setDestinationSiteId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30"
                >
                  {sites
                    .filter((s) => s.id !== currentSite.id)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.city}) - {s.type === 'boutique' ? 'Boutique' : 'Dépôt'}
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-stone-500 mt-1">
                  Le stock passera en statut <strong>"En transit"</strong> jusqu'à confirmation de réception par le chef du site destinataire.
                </p>
              </motion.div>
            )}

            {/* Mandatory Reason field for Retour or Avarie */}
            {(movementType === 'retour' || movementType === 'avarie') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-1"
              >
                <label className="text-xs font-semibold text-red-900 flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  Motif obligatoire de l'opération :
                </label>
                <textarea
                  required
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    movementType === 'avarie'
                      ? 'Ex: Sacs perforés lors du déchargement, humidité sol...'
                      : 'Ex: Référence erronée retournée par client Konan...'
                  }
                  className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30"
                />
              </motion.div>
            )}

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
                {formError}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                className="w-full h-14 rounded-2xl bg-warm-terracotta text-white font-bold text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Enregistrer le mouvement</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </form>
        </div>

        {/* Right Column: "En Transit" Reception Monitor (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Incoming Transfers in Transit at this site */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-700" strokeWidth={1.75} />
                <h4 className="text-sm font-bold text-stone-900">
                  Transferts entrants en transit ({incomingTransfers.length})
                </h4>
              </div>
              <span className="text-[10px] uppercase font-semibold text-stone-500">
                Destination : {currentSite.name}
              </span>
            </div>

            <div className="my-3 space-y-3">
              {incomingTransfers.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-400">
                  <Clock className="w-8 h-8 text-stone-300 mx-auto mb-2" strokeWidth={1.25} />
                  Aucun transfert en transit vers ce site actuellement.
                </div>
              ) : (
                incomingTransfers.map((trf) => (
                  <div
                    key={trf.id}
                    className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-xs flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-stone-900">{trf.id}</span>
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                        En transit
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-stone-900 block">{trf.productName}</span>
                      <span className="text-amber-900 font-mono font-bold">
                        {trf.quantity} sacs
                      </span>{' '}
                      <span className="text-stone-500">expédiés depuis {trf.fromSiteName}</span>
                    </div>

                    <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                      <span className="text-[10px] text-stone-500">
                        Expédié par {trf.createdBy} le {formatDateFr(trf.date)}
                      </span>

                      <button
                        type="button"
                        onClick={() => confirmTransferReception(trf.id)}
                        className="py-1.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] shadow-2xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirmer réception</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Outgoing Transfers sent from this site */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h4 className="text-sm font-bold text-stone-900">
                Transferts sortants en route ({outgoingTransfers.length})
              </h4>
              <span className="text-[10px] uppercase font-semibold text-stone-500">
                Origine : {currentSite.name}
              </span>
            </div>

            <div className="my-3 space-y-2">
              {outgoingTransfers.length === 0 ? (
                <div className="p-4 text-center text-xs text-stone-400">
                  Aucun transfert sortant en cours.
                </div>
              ) : (
                outgoingTransfers.map((trf) => (
                  <div
                    key={trf.id}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-stone-900 block">{trf.productName}</span>
                      <span className="text-stone-500 text-[11px]">
                        {trf.quantity} sacs vers {trf.toSiteName}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      En route
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StockMovementScreenProps {}
