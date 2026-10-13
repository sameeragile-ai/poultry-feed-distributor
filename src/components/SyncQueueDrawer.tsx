import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  RefreshCw,
  WifiOff,
  Wifi,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  ArrowRight,
  ShieldCheck,
  Server,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDateFr } from '../utils/formatters';

interface SyncQueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncQueueDrawer: React.FC<SyncQueueDrawerProps> = ({ isOpen, onClose }) => {
  const {
    syncQueue,
    isSyncing,
    isOffline,
    toggleOffline,
    syncPendingQueue,
    testDuplicateRejection,
    transactions,
  } = useApp();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/50 backdrop-blur-xs">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-[#FAF8F5] h-full shadow-2xl border-l border-stone-200 flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-5 border-b border-stone-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 tracking-tight">
                  Gestionnaire de Synchronisation
                </h3>
                <p className="text-xs text-stone-500">
                  {syncQueue.length} transaction(s) locale(s) en attente
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Network State Card */}
          <div className="p-4 bg-stone-100/70 border-b border-stone-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isOffline ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                )}
                <span className="text-xs font-semibold text-stone-900">
                  {isOffline ? 'Réseau hors ligne (simulation active)' : 'Serveur en ligne & connecté'}
                </span>
              </div>

              <button
                type="button"
                onClick={toggleOffline}
                className="px-2.5 py-1 rounded-md text-xs font-medium border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 transition-colors"
              >
                {isOffline ? 'Rétablir le réseau' : 'Couper le réseau'}
              </button>
            </div>
            <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed">
              En cas de coupure fibre ou 4G à Abidjan ou Bouaké, le terminal continue de vendre et déstocker. Toutes les écritures sont stockées dans la file d'attente sécurisée.
            </p>
          </div>

          {/* Action buttons */}
          <div className="p-4 border-b border-stone-200 bg-white flex flex-col gap-2">
            <button
              type="button"
              disabled={isSyncing || syncQueue.length === 0 || isOffline}
              onClick={syncPendingQueue}
              className="w-full py-3 px-4 rounded-xl bg-warm-terracotta text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} strokeWidth={1.75} />
              {isSyncing
                ? 'Synchronisation des écritures en cours...'
                : isOffline
                ? 'Rétablir le réseau pour synchroniser'
                : `Transférer les ${syncQueue.length} opérations vers le serveur`}
            </button>

            {/* Test Duplicate Rejection Button */}
            <button
              type="button"
              onClick={testDuplicateRejection}
              className="w-full py-2.5 px-3 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" strokeWidth={1.75} />
              <span>Tester la détection de doublons (Renvoyer)</span>
            </button>
          </div>

          {/* Queue Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {syncQueue.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
                <CheckCircle2 className="w-12 h-12 text-emerald-600/40 mb-3" strokeWidth={1.25} />
                <h4 className="text-sm font-semibold text-stone-800">Toutes les données sont synchronisées</h4>
                <p className="text-xs text-stone-500 mt-1 max-w-xs">
                  Aucune transaction locale en attente. Le serveur central à Montréal et les dépôts sont parfaitement à jour.
                </p>
                <div className="mt-4 p-3 rounded-xl bg-white border border-stone-200 text-left w-full text-xs text-stone-600">
                  <span className="font-semibold block text-stone-800 mb-1">Pour tester le mode hors ligne :</span>
                  1. Touchez "Hors ligne" dans la barre du haut.<br />
                  2. Effectuez une vente ou un mouvement.<br />
                  3. Observez l'opération s'ajouter ici.<br />
                  4. Rétablissez le réseau pour la voir se synchroniser.
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {syncQueue.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 20 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                    className="p-3.5 bg-white rounded-xl border border-stone-200 shadow-2xs flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                        {item.action.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-stone-500 font-mono">
                        {formatDateFr(item.timestamp)}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-stone-900 leading-snug">
                      {item.description}
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                      <span className="font-mono text-[10px] truncate max-w-[180px]">
                        Clé: {item.idempotencyKey}
                      </span>
                      <span className="flex items-center gap-1 text-amber-700 font-medium">
                        <Clock className="w-3 h-3" /> En attente
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Footer note */}
          <div className="p-3.5 bg-stone-100 border-t border-stone-200 text-center text-[11px] text-stone-500">
            Protocole UUIDv4 & Clé d'idempotence stricte · Protection anti-doublon active
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
