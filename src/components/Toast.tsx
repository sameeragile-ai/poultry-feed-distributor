import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toast, dismissToast } = useApp();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-5 right-5 z-50 max-w-md w-full pointer-events-auto"
        >
          <div
            className={`p-4 rounded-xl border shadow-lg flex items-start gap-3 backdrop-blur-sm ${
              toast.type === 'success'
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-950'
                : toast.type === 'error'
                ? 'bg-red-50/95 border-red-200 text-red-950'
                : toast.type === 'warning'
                ? 'bg-amber-50/95 border-amber-200 text-amber-950'
                : 'bg-stone-50/95 border-stone-200 text-stone-900'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-700" strokeWidth={1.75} />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-700" strokeWidth={1.75} />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-700" strokeWidth={1.75} />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-stone-700" strokeWidth={1.75} />}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold tracking-tight">{toast.title}</h4>
              {toast.description && (
                <p className="text-xs mt-0.5 opacity-90 leading-relaxed font-normal">{toast.description}</p>
              )}
            </div>

            <button
              onClick={dismissToast}
              className="p-1 rounded-lg hover:bg-black/5 text-stone-500 hover:text-stone-800 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
