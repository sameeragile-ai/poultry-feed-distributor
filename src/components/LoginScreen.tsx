import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Wifi, WifiOff, MapPin, Building2, Store } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User, Site } from '../types';
import { PinPad } from './PinPad';

export const LoginScreen: React.FC = () => {
  const { users, sites, currentSite, setCurrentSite, isOffline, toggleOffline, login } = useApp();
  const [selectedUser, setSelectedUser] = useState<User>(users[0]);
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // When selected user changes, reset pin
    setPin('');
    setErrorMessage('');
  }, [selectedUser]);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
      setErrorMessage('');
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleFormSubmit = () => {
    if (pin.length !== 4) {
      setErrorMessage('Veuillez saisir un code à 4 chiffres');
      return;
    }
    const success = login(selectedUser.id, pin);
    if (!success) {
      setErrorMessage('Code PIN erroné. Veuillez réessayer.');
      setPin('');
    }
  };

  // Keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Enter') {
        handleFormSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, selectedUser]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between p-4 md:p-8">
      {/* Top Header info */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warm-terracotta flex items-center justify-center text-white font-bold text-lg shadow-sm">
            INA
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-stone-900 leading-tight">
              IVOIRE NUTRITION AVICOLE
            </h1>
            <p className="text-xs text-stone-500 font-normal">Terminal Tablette Point de Vente & Dépôt</p>
          </div>
        </div>

        {/* Network status toggle & Current site */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleOffline}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              isOffline
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }`}
            title="Cliquer pour simuler la perte ou le retour de connexion"
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" strokeWidth={1.75} />
                <span>Mode Hors Ligne (Simulé)</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.75} />
                <span>Connecté (En ligne)</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Login Workspace - 2 columns for landscape tablet */}
      <main className="max-w-6xl w-full mx-auto my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left column: User & Site selection */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          <div>
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Identification Opérateur
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-stone-900 mt-1">
              Sélectionnez votre profil
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Touchez votre nom puis composez votre code PIN personnel à 4 chiffres.
            </p>
          </div>

          {/* User selector list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {users.map((u) => {
              const isSelected = selectedUser.id === u.id;
              const isAdmin = u.role === 'admin';
              return (
                <motion.button
                  key={u.id}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedUser(u)}
                  className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all ${
                    isSelected
                      ? 'bg-white border-amber-600 ring-2 ring-amber-600/20 shadow-md'
                      : 'bg-stone-50/80 border-stone-200/90 hover:bg-white hover:border-stone-300'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${
                      isAdmin
                        ? 'bg-stone-900 text-amber-400'
                        : isSelected
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {u.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-stone-900 text-sm truncate">{u.name}</span>
                      {isAdmin && (
                        <span className="text-[10px] font-medium bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded border border-stone-200 shrink-0">
                          Montréal
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{u.roleLabel}</p>
                    <p className="text-[11px] text-amber-900/70 mt-1 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" strokeWidth={1.5} />
                      <span className="truncate">{u.locationName}</span>
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Site Selector for the active session */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mt-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-stone-500" strokeWidth={1.5} />
                Site d'exploitation actif
              </span>
              <span className="text-[11px] text-stone-500">
                {currentSite.type === 'boutique' ? 'Boutique de vente' : 'Dépôt logistique'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sites.map((site) => {
                const isActive = currentSite.id === site.id;
                return (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => setCurrentSite(site)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-left flex items-center gap-2 transition-all ${
                      isActive
                        ? 'bg-amber-50 border-amber-600 text-amber-950 font-semibold shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {site.type === 'boutique' ? (
                      <Store className="w-3.5 h-3.5 text-stone-500 shrink-0" strokeWidth={1.5} />
                    ) : (
                      <Building2 className="w-3.5 h-3.5 text-stone-500 shrink-0" strokeWidth={1.5} />
                    )}
                    <span className="truncate">{site.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right column: PIN Keypad */}
        <section className="lg:col-span-5 flex flex-col items-center bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-md">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-3">
              <ShieldCheck className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <h3 className="text-lg font-bold text-stone-900 tracking-tight">{selectedUser.name}</h3>
            <p className="text-xs text-stone-500 mt-0.5">Saisissez votre code PIN (4 chiffres)</p>
          </div>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs text-center font-medium"
            >
              {errorMessage}
            </motion.div>
          )}

          <PinPad
            pin={pin}
            onDigit={handleDigit}
            onDelete={handleDelete}
            onSubmit={handleFormSubmit}
          />

          {/* Quick Demo Helper */}
          <div className="mt-6 pt-4 border-t border-stone-100 text-center w-full">
            <span className="text-[11px] text-stone-500 block mb-1.5">
              Code PIN Démo pour ce profil :
            </span>
            <button
              type="button"
              onClick={() => {
                setPin(selectedUser.pin);
                setErrorMessage('');
              }}
              className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-mono font-medium rounded-lg transition-colors"
            >
              Remplir automatiquement ({selectedUser.pin})
            </button>
          </div>
        </section>
      </main>

      {/* Footer info */}
      <footer className="max-w-6xl w-full mx-auto pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
        <span>Ivoire Nutrition Avicole · Système d'exploitation décentralisé</span>
        <span>Version 2.4 · Abidjan - Bouaké - Montréal</span>
      </footer>
    </div>
  );
};
