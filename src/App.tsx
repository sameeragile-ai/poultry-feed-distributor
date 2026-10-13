import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginScreen } from './components/LoginScreen';
import { Header, ActiveTab } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { PosSaleScreen } from './components/PosSaleScreen';
import { StockMovementScreen } from './components/StockMovementScreen';
import { CashClosingScreen } from './components/CashClosingScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { OwnerAdminScreen } from './components/OwnerAdminScreen';
import { SyncQueueDrawer } from './components/SyncQueueDrawer';
import { AdminPinModal } from './components/AdminPinModal';
import { Toast } from './components/Toast';
import { RotateCcw, Tablet, CheckCircle, Wifi, Shield } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser, resetDemoData, currentSite } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>('accueil');
  const [isSyncDrawerOpen, setIsSyncDrawerOpen] = useState(false);
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);
  const [targetAdminTab, setTargetAdminTab] = useState<ActiveTab>('admin');

  // If no user is logged in, show the tactile Login Screen
  if (!currentUser) {
    return (
      <>
        <Toast />
        <LoginScreen />
      </>
    );
  }

  const handleRequireAdminPin = (tab: ActiveTab) => {
    setTargetAdminTab(tab);
    setIsAdminPinModalOpen(true);
  };

  const handleAdminPinSuccess = () => {
    setIsAdminPinModalOpen(false);
    setActiveTab(targetAdminTab);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between text-stone-900 selection:bg-amber-100 selection:text-amber-900">
      {/* Toast Feedback */}
      <Toast />

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSyncDrawer={() => setIsSyncDrawerOpen(true)}
        onRequireAdminPin={handleRequireAdminPin}
      />

      {/* Main Screen Viewport with smooth page transition */}
      <main className="flex-1 w-full pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'accueil' && (
              <HomeScreen
                onNavigate={setActiveTab}
                onOpenSyncDrawer={() => setIsSyncDrawerOpen(true)}
              />
            )}
            {activeTab === 'vente' && <PosSaleScreen />}
            {activeTab === 'stocks' && <StockMovementScreen />}
            {activeTab === 'caisse' && <CashClosingScreen />}
            {activeTab === 'historique' && <HistoryScreen />}
            {activeTab === 'admin' && <OwnerAdminScreen />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Sync Queue Drawer */}
      <SyncQueueDrawer
        isOpen={isSyncDrawerOpen}
        onClose={() => setIsSyncDrawerOpen(false)}
      />

      {/* Admin PIN Modal */}
      <AdminPinModal
        isOpen={isAdminPinModalOpen}
        onClose={() => setIsAdminPinModalOpen(false)}
        onSuccess={handleAdminPinSuccess}
      />

      {/* Tablet Optimized Demo Footer */}
      <footer className="border-t border-stone-200 bg-white/70 py-4 px-4 lg:px-6 text-xs text-stone-500 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Tablet className="w-4 h-4 text-stone-400" />
            <span>
              <strong>Mode démonstration</strong> · Optimisé pour tablette tactile Android 10" (1280x800) et ordinateur
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-[11px] text-stone-400">
              Terminal connecté à {currentSite.name} · Montréal & Abidjan
            </span>

            <button
              type="button"
              onClick={resetDemoData}
              className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Restaurer le jeu d'essai initial (produits, revendeurs, stocks)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser la démo</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
