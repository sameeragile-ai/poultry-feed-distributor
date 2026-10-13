import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldAlert,
  X,
  Printer,
  ChevronRight,
  UserCheck,
  User,
  Package,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, Reseller, PaymentMethod, MobileMoneyOperator } from '../types';
import { formatFcfa, formatDateFr } from '../utils/formatters';

export const PosSaleScreen: React.FC = () => {
  const {
    products,
    resellers,
    currentSite,
    getStockForProduct,
    activeCart,
    cartClientType,
    setCartClientType,
    selectedReseller,
    setSelectedReseller,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    completeSale,
  } = useApp();

  // Search and filter states
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Tous' | 'Prémix' | 'Concentré'>('Tous');
  const [resellerSearch, setResellerSearch] = useState('');

  // Payment selection states
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('especes');
  const [mobileOperator, setMobileOperator] = useState<MobileMoneyOperator>('orange');
  const [mobileRef, setMobileRef] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [completedTxId, setCompletedTxId] = useState<string | null>(null);

  // Cart totals
  const totalAmount = useMemo(() => {
    return activeCart.reduce((sum, item) => sum + item.total, 0);
  }, [activeCart]);

  const totalSacks = useMemo(() => {
    return activeCart.reduce((sum, item) => sum + item.quantity, 0);
  }, [activeCart]);

  // Reseller Credit calculations
  const resellerCreditInfo = useMemo(() => {
    if (!selectedReseller) return null;
    const currentBalance = selectedReseller.currentBalanceFcfa;
    const limit = selectedReseller.creditLimitFcfa;
    const projectedBalance = paymentMethod === 'credit' ? currentBalance + totalAmount : currentBalance;
    const percentage = Math.min(100, Math.round((projectedBalance / limit) * 100));
    const isExceeded = projectedBalance > limit;
    const availableCredit = Math.max(0, limit - currentBalance);
    return {
      currentBalance,
      limit,
      projectedBalance,
      percentage,
      isExceeded,
      availableCredit,
      exceededAmount: projectedBalance - limit,
    };
  }, [selectedReseller, totalAmount, paymentMethod]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.code.toLowerCase().includes(productSearch.toLowerCase());
      const matchCat = selectedCategory === 'Tous' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, productSearch, selectedCategory]);

  // Filtered resellers
  const filteredResellers = useMemo(() => {
    if (!resellerSearch.trim()) return resellers;
    return resellers.filter(
      (r) =>
        r.name.toLowerCase().includes(resellerSearch.toLowerCase()) ||
        r.city.toLowerCase().includes(resellerSearch.toLowerCase()) ||
        r.phone.includes(resellerSearch)
    );
  }, [resellers, resellerSearch]);

  // Is sale block condition met?
  const isCreditBlocked = paymentMethod === 'credit' && (resellerCreditInfo?.isExceeded || !selectedReseller);

  const handleCheckoutClick = () => {
    if (activeCart.length === 0) return;
    if (isCreditBlocked) return;
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSale = () => {
    const res = completeSale({
      method: paymentMethod,
      operator: paymentMethod === 'mobile_money' ? mobileOperator : undefined,
      reference: paymentMethod === 'mobile_money' ? mobileRef : undefined,
    });

    if (res.success && res.txId) {
      setCompletedTxId(res.txId);
      // Reset payment fields
      setMobileRef('');
    }
  };

  const handleFinishSale = () => {
    setIsConfirmModalOpen(false);
    setCompletedTxId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
      {/* 2-Column Split: Left = Catalog (7 cols), Right = Cart & Payment (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Client Type + Product Catalog */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Client Type & Reseller Selection Card */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Type de clientèle
              </span>
              <span className="text-xs text-amber-900 font-medium">
                Tarification automatique appliquée
              </span>
            </div>

            {/* Segmented Control for Client Type */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-2xl mb-4">
              <button
                type="button"
                onClick={() => setCartClientType('particulier')}
                className={`py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  cartClientType === 'particulier'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <User className="w-4 h-4 text-stone-500" strokeWidth={1.75} />
                <span>Client particulier (Tarif détail)</span>
              </button>

              <button
                type="button"
                onClick={() => setCartClientType('revendeur')}
                className={`py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  cartClientType === 'revendeur'
                    ? 'bg-white text-amber-950 shadow-xs ring-1 ring-amber-600/20'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <UserCheck className="w-4 h-4 text-amber-700" strokeWidth={1.75} />
                <span>Revendeur agréé (Tarif gros)</span>
              </button>
            </div>

            {/* If Revendeur: Search and Credit Status */}
            {cartClientType === 'revendeur' && (
              <div className="flex flex-col gap-3 pt-3 border-t border-stone-100">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" strokeWidth={1.5} />
                    <input
                      type="text"
                      value={resellerSearch}
                      onChange={(e) => setResellerSearch(e.target.value)}
                      placeholder="Rechercher revendeur par nom, ville ou téléphone..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30"
                    />
                  </div>

                  <select
                    value={selectedReseller?.id || ''}
                    onChange={(e) => {
                      const found = resellers.find((r) => r.id === e.target.value);
                      setSelectedReseller(found || null);
                    }}
                    className="py-2.5 px-3 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-600/30"
                  >
                    <option value="">Sélectionner dans la liste ({resellers.length})</option>
                    {filteredResellers.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.city}) - Encours : {formatFcfa(r.currentBalanceFcfa)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Reseller Credit Meter */}
                {selectedReseller && resellerCreditInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-stone-900">{selectedReseller.name}</span>
                      <span className="text-[11px] text-stone-500 font-mono">
                        {selectedReseller.phone} · {selectedReseller.city}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 text-xs border-y border-stone-200/60 my-1.5">
                      <div>
                        <span className="text-[10px] text-stone-500 block">Plafond autorisé</span>
                        <span className="font-mono font-bold text-stone-900 tabular-nums">
                          {formatFcfa(resellerCreditInfo.limit)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 block">Encours actuel</span>
                        <span className="font-mono font-bold text-amber-900 tabular-nums">
                          {formatFcfa(resellerCreditInfo.currentBalance)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 block">Crédit disponible</span>
                        <span
                          className={`font-mono font-bold tabular-nums ${
                            resellerCreditInfo.availableCredit <= 0 ? 'text-red-700' : 'text-emerald-800'
                          }`}
                        >
                          {formatFcfa(resellerCreditInfo.availableCredit)}
                        </span>
                      </div>
                    </div>

                    {/* Animated Credit Limit Progress Bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-stone-500">Utilisation du crédit autorisé :</span>
                        <span
                          className={`font-mono font-bold tabular-nums ${
                            resellerCreditInfo.percentage >= 95 ? 'text-red-700' : 'text-amber-800'
                          }`}
                        >
                          {resellerCreditInfo.percentage}%
                        </span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, resellerCreditInfo.percentage)}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className={`h-full rounded-full transition-colors ${
                            resellerCreditInfo.percentage >= 100
                              ? 'bg-red-600'
                              : resellerCreditInfo.percentage >= 85
                              ? 'bg-amber-500'
                              : 'bg-emerald-600'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Exceeded Warning Notice */}
                    {resellerCreditInfo.isExceeded && (
                      <div className="mt-2.5 p-2 rounded-lg bg-red-100/70 border border-red-300 text-red-900 text-[11px] flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" strokeWidth={1.75} />
                        <span>
                          <strong>Plafond dépassé de {formatFcfa(resellerCreditInfo.exceededAmount)} !</strong>{' '}
                          Toute vente à crédit est verrouillée pour ce compte.
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Product Search & Category Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" strokeWidth={1.5} />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Rechercher prémix ou concentré..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600/30"
              />
            </div>

            {/* Category Segmented Tabs */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl self-stretch sm:self-auto">
              {(['Tous', 'Prémix', 'Concentré'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredProducts.map((prod) => {
              const availableStock = getStockForProduct(currentSite.id, prod.id);
              const price =
                cartClientType === 'revendeur' ? prod.resellerPriceFcfa : prod.retailPriceFcfa;
              const cartItem = activeCart.find((it) => it.product.id === prod.id);
              const isOutOfStock = availableStock <= 0;

              return (
                <motion.div
                  key={prod.id}
                  whileTap={{ scale: isOutOfStock ? 1 : 0.98 }}
                  onClick={() => {
                    if (!isOutOfStock) addToCart(prod, 1);
                  }}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                    isOutOfStock
                      ? 'bg-stone-100/60 border-stone-200 opacity-60 cursor-not-allowed'
                      : cartItem
                      ? 'bg-white border-amber-600 ring-2 ring-amber-600/15 shadow-sm'
                      : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-2xs'
                  }`}
                >
                  {/* Category & Weight Tags */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-stone-500">
                      {prod.category} · Sac {prod.sackWeightKg} kg
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        availableStock <= prod.minAlertStock
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {availableStock} dispo
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="mb-3">
                    <h4 className="text-sm font-bold text-stone-900 leading-snug">{prod.name}</h4>
                    <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{prod.description}</p>
                  </div>

                  {/* Price & Add indicator */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <div>
                      <span className="text-sm font-bold text-stone-900 font-mono tabular-nums block">
                        {formatFcfa(price)}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        {cartClientType === 'revendeur' ? 'Tarif Revendeur' : 'Tarif Détaillant'}
                      </span>
                    </div>

                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                        cartItem
                          ? 'bg-amber-700 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {cartItem ? (
                        <span className="font-bold text-xs font-mono">{cartItem.quantity}</span>
                      ) : (
                        <Plus className="w-4 h-4" strokeWidth={2} />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs flex flex-col justify-between sticky top-22">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-base font-bold text-stone-900 tracking-tight">Panier en cours</h3>
                <p className="text-xs text-stone-500">
                  {activeCart.length} référence(s) · {totalSacks} sacs au total
                </p>
              </div>

              {activeCart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-stone-400 hover:text-red-700 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Vider</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="my-4 max-h-[280px] overflow-y-auto space-y-2.5 pr-1">
              {activeCart.length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-xs">
                  <Package className="w-10 h-10 mx-auto text-stone-300 mb-2" strokeWidth={1.25} />
                  Panier vide. Touchez un produit dans le catalogue pour l'ajouter.
                </div>
              ) : (
                <AnimatePresence>
                  {activeCart.map((item) => (
                    <motion.div
                      key={item.product.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="p-3 rounded-2xl bg-stone-50 border border-stone-200/90 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-stone-900 block truncate">
                          {item.product.name}
                        </span>
                        <span className="text-[11px] text-stone-500 font-mono tabular-nums block">
                          {formatFcfa(item.unitPrice)} / sac ({item.product.sackWeightKg} kg)
                        </span>
                      </div>

                      {/* Stepper with touch targets >= 44px */}
                      <div className="flex items-center gap-1.5 shrink-0 bg-white p-1 rounded-xl border border-stone-200">
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 active:scale-95 transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>

                        <span className="w-7 text-center font-bold font-mono text-xs tabular-nums text-stone-900">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 active:scale-95 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>
                      </div>

                      <div className="text-right shrink-0 min-w-[70px]">
                        <span className="font-bold text-stone-900 font-mono tabular-nums block">
                          {formatFcfa(item.total)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Total Section with Large Tabular Figures */}
            <div className="pt-3 border-t border-stone-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Sous-total HT</span>
                <span className="font-mono tabular-nums">{formatFcfa(totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Taxes & Droits (Exonération intrants avicoles)</span>
                <span className="font-mono tabular-nums">0 FCFA</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-stone-900 font-bold">
                <span className="text-sm">Total à payer</span>
                <span className="text-2xl font-mono tabular-nums text-amber-900">
                  {formatFcfa(totalAmount)}
                </span>
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div className="mt-4 pt-3 border-t border-stone-200">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                Mode de règlement
              </span>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('especes')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-medium border flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'especes'
                      ? 'bg-amber-50 border-amber-600 text-amber-950 font-semibold shadow-2xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-700" strokeWidth={1.75} />
                  <span>Espèces</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('mobile_money')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-medium border flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'mobile_money'
                      ? 'bg-amber-50 border-amber-600 text-amber-950 font-semibold shadow-2xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-orange-600" strokeWidth={1.75} />
                  <span>Mobile Money</span>
                </button>

                <button
                  type="button"
                  disabled={cartClientType !== 'revendeur'}
                  onClick={() => setPaymentMethod('credit')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-medium border flex flex-col items-center gap-1 transition-all ${
                    cartClientType !== 'revendeur'
                      ? 'opacity-40 cursor-not-allowed bg-stone-100 border-stone-200 text-stone-400'
                      : paymentMethod === 'credit'
                      ? 'bg-amber-50 border-amber-600 text-amber-950 font-semibold shadow-2xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                  title={
                    cartClientType !== 'revendeur'
                      ? 'Le crédit est réservé aux revendeurs agréés'
                      : 'Vente à terme (portée au compte revendeur)'
                  }
                >
                  <CreditCard className="w-4 h-4 text-stone-700" strokeWidth={1.75} />
                  <span>Crédit</span>
                </button>
              </div>

              {/* Mobile Money Details */}
              {paymentMethod === 'mobile_money' && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs"
                >
                  <span className="text-[11px] font-semibold text-stone-600 block">Opérateur :</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['orange', 'wave', 'mtn', 'moov'] as const).map((op) => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => setMobileOperator(op)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold capitalize border transition-all ${
                          mobileOperator === op
                            ? 'bg-amber-800 text-white border-amber-900 shadow-xs'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {op === 'wave' ? 'Wave' : op}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                      N° Référence transaction (ex: CI-OM-992014) :
                    </label>
                    <input
                      type="text"
                      value={mobileRef}
                      onChange={(e) => setMobileRef(e.target.value)}
                      placeholder="Saisir la référence SMS/opérateur"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-600/30"
                    />
                  </div>
                </motion.div>
              )}

              {/* CRITICAL CREDIT BLOCK BANNER */}
              {isCreditBlocked && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 p-3.5 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs flex items-start gap-2.5"
                >
                  <ShieldAlert className="w-5 h-5 text-red-700 shrink-0 mt-0.5" strokeWidth={1.75} />
                  <div>
                    <h5 className="font-bold">VENTE À CRÉDIT BLOQUÉE</h5>
                    <p className="text-[11px] mt-0.5 leading-relaxed text-red-800">
                      {!selectedReseller
                        ? 'Veuillez sélectionner un revendeur agréé pour autoriser le crédit.'
                        : `Le plafond de crédit (${formatFcfa(
                            resellerCreditInfo?.limit || 0
                          )}) serait dépassé de ${formatFcfa(
                            resellerCreditInfo?.exceededAmount || 0
                          )}. Règlement en espèces ou Mobile Money exigé.`}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Checkout CTA Button (min 56px touch target) */}
          <div className="mt-5 pt-3 border-t border-stone-100">
            <motion.button
              type="button"
              whileTap={{ scale: isCreditBlocked || activeCart.length === 0 ? 1 : 0.98 }}
              disabled={activeCart.length === 0 || isCreditBlocked}
              onClick={handleCheckoutClick}
              className={`w-full h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                activeCart.length === 0 || isCreditBlocked
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                  : 'bg-warm-terracotta text-white hover:opacity-95'
              }`}
            >
              <span>Valider la vente ({formatFcfa(totalAmount)})</span>
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Confirmation & Receipt Modal with animated checkmark */}
      <AnimatePresence>
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 md:p-8 max-w-lg w-full relative"
            >
              {!completedTxId ? (
                /* Step 1: Pre-confirmation Summary */
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                    <div>
                      <h3 className="text-lg font-bold text-stone-900">Confirmation d'encaissement</h3>
                      <p className="text-xs text-stone-500">
                        Vérifiez les informations avant validation définitive
                      </p>
                    </div>
                    <button
                      onClick={() => setIsConfirmModalOpen(false)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="py-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-stone-600">Client :</span>
                      <span className="font-bold text-stone-900">
                        {cartClientType === 'revendeur' && selectedReseller
                          ? selectedReseller.name
                          : 'Client particulier'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-stone-600">Mode de paiement :</span>
                      <span className="font-bold text-stone-900 capitalize">
                        {paymentMethod === 'mobile_money'
                          ? `Mobile Money (${mobileOperator.toUpperCase()} - Réf: ${mobileRef || 'Sans réf'})`
                          : paymentMethod}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-stone-600">Site d'enlèvement :</span>
                      <span className="font-bold text-stone-900">{currentSite.name}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
                      <div className="font-semibold text-amber-950 mb-1">Détail des sacs :</div>
                      {activeCart.map((it) => (
                        <div key={it.product.id} className="flex justify-between text-stone-700 py-0.5">
                          <span>
                            {it.quantity}x {it.product.name} ({it.product.sackWeightKg} kg)
                          </span>
                          <span className="font-mono">{formatFcfa(it.total)}</span>
                        </div>
                      ))}
                      <div className="pt-2 mt-2 border-t border-amber-200/60 flex justify-between font-bold text-amber-950 text-sm">
                        <span>Montant total :</span>
                        <span className="font-mono">{formatFcfa(totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => setIsConfirmModalOpen(false)}
                      className="flex-1 py-3 px-4 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50"
                    >
                      Modifier le panier
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmSale}
                      className="flex-1 py-3 px-4 rounded-xl bg-warm-terracotta text-white text-xs font-bold hover:opacity-95 shadow-sm"
                    >
                      Confirmer & Encaisser
                    </button>
                  </div>
                </div>
              ) : (
                /* Step 2: Elegant Success State with Checkmark Draw Animation */
                <div className="text-center py-4">
                  {/* Elegant SVG checkmark draw animation */}
                  <div className="w-20 h-20 mx-auto mb-4 relative flex items-center justify-center">
                    <svg className="w-20 h-20 text-emerald-600" viewBox="0 0 52 52">
                      <motion.circle
                        cx="26"
                        cy="26"
                        r="24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                      />
                      <motion.path
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 27l8 8 16-16"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.35, delay: 0.35, ease: 'easeOut' }}
                      />
                    </svg>
                  </div>

                  <h3 className="text-xl font-bold text-stone-900">Vente enregistrée avec succès !</h3>
                  <p className="text-xs text-stone-500 mt-1">
                    N° Transaction : <strong className="font-mono text-stone-800">{completedTxId}</strong>
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Les stocks de {currentSite.name} ont été décrémentés en temps réel.
                  </p>

                  {/* Printable Ticket Receipt Preview */}
                  <div className="my-5 p-4 bg-[#FAF8F5] rounded-2xl border border-dashed border-stone-300 text-left text-xs font-mono space-y-1 text-stone-700">
                    <div className="text-center font-bold text-stone-900 pb-1 border-b border-stone-200">
                      IVOIRE NUTRITION AVICOLE
                    </div>
                    <div className="text-center text-[10px] text-stone-500 pb-2">
                      {currentSite.name} · {formatDateFr(new Date().toISOString())}
                    </div>
                    <div className="flex justify-between font-bold pt-1">
                      <span>TOTAL PAYÉ :</span>
                      <span>{formatFcfa(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-stone-500">
                      <span>Règlement :</span>
                      <span className="capitalize">{paymentMethod}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex-1 py-3 px-4 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 flex items-center justify-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Imprimer le reçu</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleFinishSale}
                      className="flex-1 py-3 px-4 rounded-xl bg-warm-terracotta text-white text-xs font-bold hover:opacity-95 shadow-sm"
                    >
                      Nouvelle vente
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
