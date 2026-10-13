import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, X } from 'lucide-react';
import { PinPad } from './PinPad';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDigit = (d: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + d);
      setError('');
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleSubmit = () => {
    // Admin PIN is 9999
    if (pin === '9999') {
      onSuccess();
      setPin('');
      setError('');
    } else {
      setError('Code administrateur incorrect (PIN démo : 9999)');
      setPin('');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 md:p-8 max-w-sm w-full relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>

          <div className="text-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 mx-auto flex items-center justify-center mb-3">
              <ShieldAlert className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <h3 className="text-lg font-bold text-stone-900">Accès Direction Générale</h3>
            <p className="text-xs text-stone-500 mt-1">
              Cette console est réservée au propriétaire à Montréal. Saisissez le PIN Admin (4 chiffres).
            </p>
          </div>

          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg text-center">
              {error}
            </div>
          )}

          <PinPad
            pin={pin}
            onDigit={handleDigit}
            onDelete={handleDelete}
            onSubmit={handleSubmit}
          />

          <div className="mt-4 pt-3 border-t border-stone-100 text-center">
            <button
              type="button"
              onClick={() => {
                setPin('9999');
                setError('');
              }}
              className="text-xs text-amber-800 underline font-mono hover:text-amber-950"
            >
              Remplir code propriétaire démo (9999)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
