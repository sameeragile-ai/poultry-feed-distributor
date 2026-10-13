import React from 'react';
import { motion } from 'motion/react';
import { Delete, Check } from 'lucide-react';

interface PinPadProps {
  pin: string;
  maxDigits?: number;
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const PinPad: React.FC<PinPadProps> = ({
  pin,
  maxDigits = 4,
  onDigit,
  onDelete,
  onSubmit,
  disabled = false,
}) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="w-full max-w-xs mx-auto flex flex-col items-center">
      {/* Visual PIN dots */}
      <div className="flex items-center justify-center gap-4 my-6">
        {Array.from({ length: maxDigits }).map((_, idx) => {
          const filled = idx < pin.length;
          return (
            <motion.div
              key={idx}
              animate={{
                scale: filled ? [1, 1.25, 1] : 1,
                backgroundColor: filled ? '#B84A28' : '#E5E0D8',
              }}
              transition={{ duration: 0.18 }}
              className={`w-4 h-4 rounded-full border border-stone-300 transition-colors ${
                filled ? 'border-amber-700 shadow-sm' : ''
              }`}
            />
          );
        })}
      </div>

      {/* Grid of 3x4 buttons */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {digits.map((d) => (
          <motion.button
            key={d}
            type="button"
            disabled={disabled}
            whileTap={{ scale: 0.94 }}
            onClick={() => onDigit(d)}
            className="h-16 w-full rounded-2xl bg-white border border-stone-200 shadow-sm text-stone-800 text-2xl font-semibold font-mono tabular-nums flex items-center justify-center hover:bg-stone-50 active:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-600/30"
          >
            {d}
          </motion.button>
        ))}

        {/* Bottom row: Delete, 0, Submit */}
        <motion.button
          type="button"
          disabled={disabled || pin.length === 0}
          whileTap={{ scale: 0.94 }}
          onClick={onDelete}
          className="h-16 w-full rounded-2xl bg-stone-100 border border-stone-200 text-stone-700 flex items-center justify-center hover:bg-stone-200 disabled:opacity-40 transition-colors focus:outline-none"
          aria-label="Effacer le dernier chiffre"
        >
          <Delete className="w-6 h-6" strokeWidth={1.75} />
        </motion.button>

        <motion.button
          type="button"
          disabled={disabled}
          whileTap={{ scale: 0.94 }}
          onClick={() => onDigit('0')}
          className="h-16 w-full rounded-2xl bg-white border border-stone-200 shadow-sm text-stone-800 text-2xl font-semibold font-mono tabular-nums flex items-center justify-center hover:bg-stone-50 active:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-600/30"
        >
          0
        </motion.button>

        <motion.button
          type="button"
          disabled={disabled || pin.length < maxDigits}
          whileTap={{ scale: 0.94 }}
          onClick={onSubmit}
          className="h-16 w-full rounded-2xl bg-warm-terracotta text-white shadow-md flex items-center justify-center hover:opacity-95 active:opacity-90 disabled:opacity-40 disabled:pointer-events-none transition-all focus:outline-none"
          aria-label="Valider le code PIN"
        >
          <Check className="w-7 h-7" strokeWidth={2.25} />
        </motion.button>
      </div>
    </div>
  );
};
