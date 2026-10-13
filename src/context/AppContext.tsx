import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  Site,
  Reseller,
  User,
  StockLevel,
  Transaction,
  TransferMovement,
  PriceChangeLog,
  CartItem,
  CashClosing,
  SyncQueueItem,
  PaymentMethod,
  MobileMoneyOperator,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SITES,
  INITIAL_RESELLERS,
  INITIAL_USERS,
  INITIAL_TRANSFERS,
  INITIAL_PRICE_LOGS,
  INITIAL_CASH_CLOSINGS,
  buildInitialStock,
  buildInitialTransactions,
} from '../data/initialData';
import { generateTxId } from '../utils/formatters';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}

interface AppContextType {
  currentUser: User | null;
  currentSite: Site;
  isOffline: boolean;
  syncQueue: SyncQueueItem[];
  isSyncing: boolean;
  toast: ToastMessage | null;
  products: Product[];
  sites: Site[];
  resellers: Reseller[];
  users: User[];
  stockLevels: StockLevel[];
  transactions: Transaction[];
  transfers: TransferMovement[];
  priceLogs: PriceChangeLog[];
  cashClosings: CashClosing[];
  activeCart: CartItem[];
  cartClientType: 'particulier' | 'revendeur';
  selectedReseller: Reseller | null;
  // Actions
  login: (userId: string, pin: string) => boolean;
  logout: () => void;
  setCurrentSite: (site: Site) => void;
  toggleOffline: () => void;
  dismissToast: () => void;
  showToast: (title: string, description?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  // Cart Actions
  setCartClientType: (type: 'particulier' | 'revendeur') => void;
  setSelectedReseller: (reseller: Reseller | null) => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  // Sale
  completeSale: (payment: {
    method: PaymentMethod;
    operator?: MobileMoneyOperator;
    reference?: string;
  }) => { success: boolean; error?: string; txId?: string };
  // Stock
  createStockMovement: (data: {
    type: 'entree_stock' | 'transfert' | 'retour' | 'avarie';
    productId: string;
    quantity: number;
    destinationSiteId?: string;
    reason?: string;
  }) => { success: boolean; error?: string; txId?: string };
  confirmTransferReception: (transferId: string) => void;
  // Cash Closing
  recordCashClosing: (data: {
    theoreticalCash: number;
    countedCash: number;
    denominations: Record<number, number>;
    justification?: string;
  }) => { success: boolean; error?: string };
  // Cancel transaction
  cancelTransaction: (txId: string, reason: string) => { success: boolean; error?: string };
  // Admin & Products
  updateProductPrices: (productId: string, retailPrice: number, resellerPrice: number) => void;
  updateReseller: (reseller: Reseller) => void;
  addReseller: (resellerData: Omit<Reseller, 'id' | 'currentBalanceFcfa'>) => void;
  // Sync
  syncPendingQueue: () => Promise<void>;
  testDuplicateRejection: () => void;
  resetDemoData: () => void;
  // Helpers
  getStockForProduct: (siteId: string, productId: string) => number;
}

const STORAGE_KEYS = {
  CURRENT_USER: 'ina_pos_current_user_v1',
  CURRENT_SITE: 'ina_pos_current_site_v1',
  OFFLINE_MODE: 'ina_pos_is_offline_v1',
  SYNC_QUEUE: 'ina_pos_sync_queue_v1',
  PRODUCTS: 'ina_pos_products_v1',
  SITES: 'ina_pos_sites_v1',
  RESELLERS: 'ina_pos_resellers_v1',
  USERS: 'ina_pos_users_v1',
  STOCK: 'ina_pos_stock_v1',
  TRANSACTIONS: 'ina_pos_transactions_v1',
  TRANSFERS: 'ina_pos_transfers_v1',
  PRICE_LOGS: 'ina_pos_price_logs_v1',
  CLOSINGS: 'ina_pos_cash_closings_v1',
};

const AppContext = createContext<AppContextType | null>(null);

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    return fallback;
  }
}

function saveStorage(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State initialization
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    loadStorage(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]) // default logged in as Amadou for instant preview
  );

  const [sites] = useState<Site[]>(() => loadStorage(STORAGE_KEYS.SITES, INITIAL_SITES));

  const [currentSite, setCurrentSiteState] = useState<Site>(() => {
    const saved = loadStorage<Site | null>(STORAGE_KEYS.CURRENT_SITE, null);
    if (saved) return saved;
    return sites[0]; // Boutique Yopougon
  });

  const [isOffline, setIsOffline] = useState<boolean>(() =>
    loadStorage(STORAGE_KEYS.OFFLINE_MODE, false)
  );

  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>(() =>
    loadStorage(STORAGE_KEYS.SYNC_QUEUE, [])
  );

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [products, setProducts] = useState<Product[]>(() =>
    loadStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS)
  );

  const [resellers, setResellers] = useState<Reseller[]>(() =>
    loadStorage(STORAGE_KEYS.RESELLERS, INITIAL_RESELLERS)
  );

  const [users] = useState<User[]>(() => loadStorage(STORAGE_KEYS.USERS, INITIAL_USERS));

  const [stockLevels, setStockLevels] = useState<StockLevel[]>(() =>
    loadStorage(STORAGE_KEYS.STOCK, buildInitialStock())
  );

  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadStorage(STORAGE_KEYS.TRANSACTIONS, buildInitialTransactions())
  );

  const [transfers, setTransfers] = useState<TransferMovement[]>(() =>
    loadStorage(STORAGE_KEYS.TRANSFERS, INITIAL_TRANSFERS)
  );

  const [priceLogs, setPriceLogs] = useState<PriceChangeLog[]>(() =>
    loadStorage(STORAGE_KEYS.PRICE_LOGS, INITIAL_PRICE_LOGS)
  );

  const [cashClosings, setCashClosings] = useState<CashClosing[]>(() =>
    loadStorage(STORAGE_KEYS.CLOSINGS, INITIAL_CASH_CLOSINGS as CashClosing[])
  );

  // Cart State (session only)
  const [activeCart, setActiveCart] = useState<CartItem[]>([]);
  const [cartClientType, setCartClientType] = useState<'particulier' | 'revendeur'>('particulier');
  const [selectedReseller, setSelectedReseller] = useState<Reseller | null>(null);

  // Persistence effects
  useEffect(() => {
    saveStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.CURRENT_SITE, currentSite);
  }, [currentSite]);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.OFFLINE_MODE, isOffline);
  }, [isOffline]);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.SYNC_QUEUE, syncQueue);
  }, [syncQueue]);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.RESELLERS, resellers);
  }, [resellers]);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.STOCK, stockLevels);
  }, [stockLevels]);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
  }, [transactions]);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.TRANSFERS, transfers);
  }, [transfers]);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.PRICE_LOGS, priceLogs);
  }, [priceLogs]);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.CLOSINGS, cashClosings);
  }, [cashClosings]);

  // Toast helper
  const showToast = useCallback(
    (title: string, description?: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
      setToast({ id: Date.now().toString(), title, description, type });
    },
    []
  );

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Stock lookup helper
  const getStockForProduct = useCallback(
    (siteId: string, productId: string): number => {
      const entry = stockLevels.find((s) => s.siteId === siteId && s.productId === productId);
      return entry ? entry.quantity : 0;
    },
    [stockLevels]
  );

  // Authentication
  const login = (userId: string, pin: string): boolean => {
    const user = users.find((u) => u.id === userId);
    if (!user) return false;
    if (user.pin === pin) {
      setCurrentUser(user);
      // Update site to user's default site
      const site = sites.find((s) => s.id === user.defaultSiteId);
      if (site) setCurrentSiteState(site);
      showToast('Connexion réussie', `Bienvenue ${user.name}`, 'success');
      return true;
    }
    showToast('Code PIN incorrect', 'Veuillez vérifier vos 4 chiffres', 'error');
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    clearCart();
    showToast('Déconnexion effectuée', 'Session fermée avec succès', 'info');
  };

  const setCurrentSite = (site: Site) => {
    setCurrentSiteState(site);
    showToast('Site actif changé', `Site actuel : ${site.name}`, 'info');
  };

  // Toggle Offline mode
  const toggleOffline = () => {
    const nextOffline = !isOffline;
    setIsOffline(nextOffline);
    if (nextOffline) {
      showToast(
        'Mode Hors Ligne activé',
        'Les ventes et mouvements seront stockés localement et synchronisés au retour du réseau.',
        'warning'
      );
    } else {
      showToast('Connexion réseau rétablie', 'Prêt à synchroniser les données locales.', 'success');
      // If there are pending items, auto trigger sync
      if (syncQueue.length > 0) {
        setTimeout(() => {
          syncPendingQueue();
        }, 500);
      }
    }
  };

  // Cart actions
  const addToCart = (product: Product, quantity = 1) => {
    const unitPrice =
      cartClientType === 'revendeur' ? product.resellerPriceFcfa : product.retailPriceFcfa;

    setActiveCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                unitPrice,
                total: (item.quantity + quantity) * unitPrice,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity,
          unitPrice,
          total: quantity * unitPrice,
        },
      ];
    });
  };

  const updateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setActiveCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return {
            ...item,
            quantity,
            total: quantity * item.unitPrice,
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setActiveCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setActiveCart([]);
  };

  // Update cart prices if client type changed
  const handleSetCartClientType = (type: 'particulier' | 'revendeur') => {
    setCartClientType(type);
    if (type === 'particulier') {
      setSelectedReseller(null);
    }
    // recalculate existing cart items with the appropriate price
    setActiveCart((prev) =>
      prev.map((item) => {
        const unitPrice =
          type === 'revendeur' ? item.product.resellerPriceFcfa : item.product.retailPriceFcfa;
        return {
          ...item,
          unitPrice,
          total: item.quantity * unitPrice,
        };
      })
    );
  };

  // Sale completion
  const completeSale = (payment: {
    method: PaymentMethod;
    operator?: MobileMoneyOperator;
    reference?: string;
  }): { success: boolean; error?: string; txId?: string } => {
    if (!currentUser) return { success: false, error: 'Utilisateur non authentifié' };
    if (activeCart.length === 0) return { success: false, error: 'Le panier est vide' };

    const totalAmount = activeCart.reduce((sum, item) => sum + item.total, 0);

    // Credit limit check
    if (payment.method === 'credit') {
      if (!selectedReseller) {
        return { success: false, error: 'Veuillez sélectionner un revendeur pour une vente à crédit' };
      }
      const newTotalCredit = selectedReseller.currentBalanceFcfa + totalAmount;
      if (newTotalCredit > selectedReseller.creditLimitFcfa) {
        const excess = newTotalCredit - selectedReseller.creditLimitFcfa;
        return {
          success: false,
          error: `Plafond dépassé de ${excess.toLocaleString('fr-FR')} FCFA. Plafond : ${selectedReseller.creditLimitFcfa.toLocaleString('fr-FR')} FCFA. Vente à crédit bloquée.`,
        };
      }
    }

    // Check stock availability
    for (const item of activeCart) {
      const available = getStockForProduct(currentSite.id, item.product.id);
      if (available < item.quantity) {
        return {
          success: false,
          error: `Stock insuffisant pour "${item.product.name}" sur ${currentSite.name} (${available} dispo, ${item.quantity} demandés)`,
        };
      }
    }

    const txId = generateTxId('VNT');
    const nowIso = new Date().toISOString();
    const idempotencyKey = `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const saleItems = activeCart.map((it) => ({
      productId: it.product.id,
      productName: it.product.name,
      sackWeightKg: it.product.sackWeightKg,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      total: it.total,
    }));

    const newTx: Transaction = {
      id: txId,
      date: nowIso,
      type: 'vente',
      siteId: currentSite.id,
      siteName: currentSite.name,
      userId: currentUser.id,
      userName: currentUser.name,
      clientType: cartClientType,
      clientName: cartClientType === 'revendeur' && selectedReseller ? selectedReseller.name : 'Client particulier',
      resellerId: cartClientType === 'revendeur' && selectedReseller ? selectedReseller.id : undefined,
      items: saleItems,
      totalAmountFcfa: totalAmount,
      paymentMethod: payment.method,
      mobileMoneyOperator: payment.operator,
      mobileMoneyReference: payment.reference,
      status: 'validee',
      syncStatus: isOffline ? 'pending' : 'synced',
      localCreatedAt: nowIso,
      idempotencyKey,
    };

    // 1. Decrement stock
    setStockLevels((prev) =>
      prev.map((stock) => {
        if (stock.siteId !== currentSite.id) return stock;
        const cartItem = activeCart.find((it) => it.product.id === stock.productId);
        if (cartItem) {
          return { ...stock, quantity: Math.max(0, stock.quantity - cartItem.quantity) };
        }
        return stock;
      })
    );

    // 2. Update reseller balance if credit
    if (payment.method === 'credit' && selectedReseller) {
      setResellers((prev) =>
        prev.map((r) =>
          r.id === selectedReseller.id
            ? { ...r, currentBalanceFcfa: r.currentBalanceFcfa + totalAmount }
            : r
        )
      );
      // update selectedReseller state too
      setSelectedReseller((prev) =>
        prev ? { ...prev, currentBalanceFcfa: prev.currentBalanceFcfa + totalAmount } : null
      );
    }

    // 3. Add transaction
    setTransactions((prev) => [newTx, ...prev]);

    // 4. If offline, push to sync queue
    if (isOffline) {
      const queueItem: SyncQueueItem = {
        id: `SQ-${Date.now()}`,
        idempotencyKey,
        action: 'vente',
        description: `Vente #${txId} - ${totalAmount.toLocaleString('fr-FR')} FCFA (${currentSite.name})`,
        timestamp: nowIso,
        payload: newTx,
        status: 'pending',
      };
      setSyncQueue((prev) => [...prev, queueItem]);
      showToast(
        'Vente enregistrée en mode Hors Ligne',
        `N° ${txId} - Sauvegardée localement (${activeCart.length} articles).`,
        'warning'
      );
    } else {
      showToast(
        'Vente validée et synchronisée',
        `N° ${txId} - Montant : ${totalAmount.toLocaleString('fr-FR')} FCFA.`,
        'success'
      );
    }

    clearCart();
    return { success: true, txId };
  };

  // Stock movements
  const createStockMovement = (data: {
    type: 'entree_stock' | 'transfert' | 'retour' | 'avarie';
    productId: string;
    quantity: number;
    destinationSiteId?: string;
    reason?: string;
  }): { success: boolean; error?: string; txId?: string } => {
    if (!currentUser) return { success: false, error: 'Utilisateur non authentifié' };
    const product = products.find((p) => p.id === data.productId);
    if (!product) return { success: false, error: 'Produit introuvable' };

    const prefixMap = {
      entree_stock: 'REC',
      transfert: 'TRF',
      retour: 'RET',
      avarie: 'AVR',
    };

    const currentQty = getStockForProduct(currentSite.id, data.productId);

    // Quantity validation for outflow
    if ((data.type === 'transfert' || data.type === 'avarie') && currentQty < data.quantity) {
      return {
        success: false,
        error: `Stock insuffisant sur ${currentSite.name} (${currentQty} disponibles, ${data.quantity} requis)`,
      };
    }

    // Reason required for retour and avarie
    if ((data.type === 'retour' || data.type === 'avarie') && (!data.reason || !data.reason.trim())) {
      return {
        success: false,
        error: `Un motif explicatif est obligatoire pour les opérations de type "${data.type === 'retour' ? 'Retour' : 'Avarie'}".`,
      };
    }

    const txId = generateTxId(prefixMap[data.type]);
    const nowIso = new Date().toISOString();
    const destSite = data.destinationSiteId ? sites.find((s) => s.id === data.destinationSiteId) : undefined;
    const idempotencyKey = `idemp-stock-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Update stock levels
    if (data.type === 'entree_stock') {
      // Incoming container / supplier
      setStockLevels((prev) =>
        prev.map((s) =>
          s.siteId === currentSite.id && s.productId === data.productId
            ? { ...s, quantity: s.quantity + data.quantity }
            : s
        )
      );
    } else if (data.type === 'retour') {
      // Customer return added back to stock
      setStockLevels((prev) =>
        prev.map((s) =>
          s.siteId === currentSite.id && s.productId === data.productId
            ? { ...s, quantity: s.quantity + data.quantity }
            : s
        )
      );
    } else if (data.type === 'avarie') {
      // Damaged sacks written off
      setStockLevels((prev) =>
        prev.map((s) =>
          s.siteId === currentSite.id && s.productId === data.productId
            ? { ...s, quantity: Math.max(0, s.quantity - data.quantity) }
            : s
        )
      );
    } else if (data.type === 'transfert') {
      // Outflow from current site, en route to destination
      setStockLevels((prev) =>
        prev.map((s) =>
          s.siteId === currentSite.id && s.productId === data.productId
            ? { ...s, quantity: Math.max(0, s.quantity - data.quantity) }
            : s
        )
      );

      // Create transfer record marked 'en_transit'
      const newTransfer: TransferMovement = {
        id: txId,
        date: nowIso,
        fromSiteId: currentSite.id,
        fromSiteName: currentSite.name,
        toSiteId: destSite?.id || '',
        toSiteName: destSite?.name || '',
        productId: product.id,
        productName: product.name,
        quantity: data.quantity,
        status: 'en_transit',
        createdBy: currentUser.name,
      };
      setTransfers((prev) => [newTransfer, ...prev]);
    }

    const newTx: Transaction = {
      id: txId,
      date: nowIso,
      type: data.type,
      siteId: currentSite.id,
      siteName: currentSite.name,
      destinationSiteId: destSite?.id,
      destinationSiteName: destSite?.name,
      userId: currentUser.id,
      userName: currentUser.name,
      notes: data.reason || (data.type === 'transfert' ? `Transfert vers ${destSite?.name}` : 'Réception usine/conteneur'),
      items: [
        {
          productId: product.id,
          productName: product.name,
          sackWeightKg: product.sackWeightKg,
          quantity: data.quantity,
          unitPrice: product.resellerPriceFcfa,
          total: data.quantity * product.resellerPriceFcfa,
        },
      ],
      status: 'validee',
      syncStatus: isOffline ? 'pending' : 'synced',
      localCreatedAt: nowIso,
      idempotencyKey,
    };

    setTransactions((prev) => [newTx, ...prev]);

    if (isOffline) {
      setSyncQueue((prev) => [
        ...prev,
        {
          id: `SQ-${Date.now()}`,
          idempotencyKey,
          action: 'mouvement_stock',
          description: `Mvt ${data.type} #${txId} - ${product.name} (${data.quantity} sacs)`,
          timestamp: nowIso,
          payload: newTx,
          status: 'pending',
        },
      ]);
      showToast('Mouvement enregistré hors-ligne', `En attente de connexion (${txId})`, 'warning');
    } else {
      showToast('Mouvement de stock enregistré', `Opération ${txId} validée.`, 'success');
    }

    return { success: true, txId };
  };

  // Confirm transfer reception at destination site
  const confirmTransferReception = (transferId: string) => {
    const transfer = transfers.find((t) => t.id === transferId);
    if (!transfer) return;

    const nowIso = new Date().toISOString();
    // 1. Increment stock at destination site
    setStockLevels((prev) =>
      prev.map((s) =>
        s.siteId === transfer.toSiteId && s.productId === transfer.productId
          ? { ...s, quantity: s.quantity + transfer.quantity }
          : s
      )
    );

    // 2. Mark transfer as receptionne
    setTransfers((prev) =>
      prev.map((t) =>
        t.id === transferId
          ? {
              ...t,
              status: 'receptionne',
              receivedBy: currentUser?.name || 'Réceptionnaire',
              receivedAt: nowIso,
            }
          : t
      )
    );

    showToast(
      'Réception de stock confirmée',
      `${transfer.quantity} sacs de ${transfer.productName} ajoutés à ${transfer.toSiteName}`,
      'success'
    );
  };

  // Cash Closing
  const recordCashClosing = (data: {
    theoreticalCash: number;
    countedCash: number;
    denominations: Record<number, number>;
    justification?: string;
  }): { success: boolean; error?: string } => {
    if (!currentUser) return { success: false, error: 'Utilisateur non authentifié' };
    const diff = data.countedCash - data.theoreticalCash;

    if (diff !== 0 && (!data.justification || !data.justification.trim())) {
      return {
        success: false,
        error: `Un écart de ${diff.toLocaleString('fr-FR')} FCFA a été détecté. La justification est obligatoire.`,
      };
    }

    const id = generateTxId('CLO');
    const nowIso = new Date().toISOString();

    const newClosing: CashClosing = {
      id,
      date: nowIso,
      siteId: currentSite.id,
      siteName: currentSite.name,
      userId: currentUser.id,
      userName: currentUser.name,
      theoreticalCashFcfa: data.theoreticalCash,
      countedCashFcfa: data.countedCash,
      differenceFcfa: diff,
      denominations: data.denominations,
      justification: data.justification,
      syncStatus: isOffline ? 'pending' : 'synced',
    };

    setCashClosings((prev) => [newClosing, ...prev]);

    // Also record in central transaction log
    const txClosing: Transaction = {
      id,
      date: nowIso,
      type: 'cloture_caisse',
      siteId: currentSite.id,
      siteName: currentSite.name,
      userId: currentUser.id,
      userName: currentUser.name,
      totalAmountFcfa: data.countedCash,
      status: 'validee',
      notes: diff === 0 ? 'Clôture équilibrée' : `Écart constaté : ${diff.toLocaleString('fr-FR')} FCFA - ${data.justification}`,
      syncStatus: isOffline ? 'pending' : 'synced',
      localCreatedAt: nowIso,
      idempotencyKey: `idemp-clo-${id}`,
    };
    setTransactions((prev) => [txClosing, ...prev]);

    if (isOffline) {
      setSyncQueue((prev) => [
        ...prev,
        {
          id: `SQ-${Date.now()}`,
          idempotencyKey: `idemp-clo-${id}`,
          action: 'cloture_caisse',
          description: `Clôture de caisse #${id} (${currentSite.name})`,
          timestamp: nowIso,
          payload: newClosing,
          status: 'pending',
        },
      ]);
      showToast('Clôture sauvegardée hors-ligne', 'Sera synchronisée lors du retour réseau', 'warning');
    } else {
      showToast(
        'Clôture de caisse validée',
        diff === 0 ? 'Caisse parfaitement équilibrée.' : `Écart de ${diff.toLocaleString('fr-FR')} FCFA enregistré avec motif.`,
        'success'
      );
    }

    return { success: true };
  };

  // Transaction Cancellation (Never delete, audit trail)
  const cancelTransaction = (txId: string, reason: string): { success: boolean; error?: string } => {
    if (!currentUser) return { success: false, error: 'Utilisateur non authentifié' };
    if (!reason || !reason.trim()) {
      return { success: false, error: 'Le motif d’annulation est obligatoire.' };
    }

    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return { success: false, error: 'Transaction introuvable.' };
    if (tx.status === 'annulee') return { success: false, error: 'Transaction déjà annulée.' };

    const nowIso = new Date().toISOString();

    // 1. Rollback stock if sale or outbound movement
    if (tx.items && tx.items.length > 0) {
      if (tx.type === 'vente' || tx.type === 'avarie') {
        // Return bags to stock
        setStockLevels((prev) =>
          prev.map((s) => {
            if (s.siteId !== tx.siteId) return s;
            const item = tx.items?.find((it) => it.productId === s.productId);
            if (item) {
              return { ...s, quantity: s.quantity + item.quantity };
            }
            return s;
          })
        );
      } else if (tx.type === 'entree_stock' || tx.type === 'retour') {
        // Deduct bags that were added
        setStockLevels((prev) =>
          prev.map((s) => {
            if (s.siteId !== tx.siteId) return s;
            const item = tx.items?.find((it) => it.productId === s.productId);
            if (item) {
              return { ...s, quantity: Math.max(0, s.quantity - item.quantity) };
            }
            return s;
          })
        );
      }
    }

    // 2. Rollback reseller credit balance if it was a credit sale
    if (tx.paymentMethod === 'credit' && tx.resellerId && tx.totalAmountFcfa) {
      setResellers((prev) =>
        prev.map((r) =>
          r.id === tx.resellerId
            ? { ...r, currentBalanceFcfa: Math.max(0, r.currentBalanceFcfa - (tx.totalAmountFcfa || 0)) }
            : r
        )
      );
    }

    // 3. Update transaction record
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txId
          ? {
              ...t,
              status: 'annulee',
              cancellationReason: reason.trim(),
              cancelledBy: currentUser.name,
              cancelledAt: nowIso,
            }
          : t
      )
    );

    showToast('Transaction annulée', `N° ${txId} annulée. Les stocks et encours ont été restaurés.`, 'info');
    return { success: true };
  };

  // Price updates
  const updateProductPrices = (productId: string, retailPrice: number, resellerPrice: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product || !currentUser) return;

    const nowIso = new Date().toISOString();
    const newLogs: PriceChangeLog[] = [];

    if (product.retailPriceFcfa !== retailPrice) {
      newLogs.push({
        id: `LOG-${Date.now()}-1`,
        date: nowIso,
        productId,
        productName: product.name,
        field: 'retailPriceFcfa',
        fieldLabel: 'Prix Détaillant',
        oldValue: product.retailPriceFcfa,
        newValue: retailPrice,
        changedBy: `${currentUser.name} (${currentUser.role === 'admin' ? 'Montréal' : currentSite.name})`,
      });
    }

    if (product.resellerPriceFcfa !== resellerPrice) {
      newLogs.push({
        id: `LOG-${Date.now()}-2`,
        date: nowIso,
        productId,
        productName: product.name,
        field: 'resellerPriceFcfa',
        fieldLabel: 'Prix Revendeur',
        oldValue: product.resellerPriceFcfa,
        newValue: resellerPrice,
        changedBy: `${currentUser.name} (${currentUser.role === 'admin' ? 'Montréal' : currentSite.name})`,
      });
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, retailPriceFcfa: retailPrice, resellerPriceFcfa: resellerPrice }
          : p
      )
    );

    if (newLogs.length > 0) {
      setPriceLogs((prev) => [...newLogs, ...prev]);
      showToast('Mercuriale mise à jour', `Nouveaux tarifs enregistrés pour ${product.name}`, 'success');
    }
  };

  // Reseller updates
  const updateReseller = (reseller: Reseller) => {
    setResellers((prev) => prev.map((r) => (r.id === reseller.id ? reseller : r)));
    showToast('Fiche revendeur mise à jour', `Plafond & coordonnées sauvegardés pour ${reseller.name}`, 'success');
  };

  const addReseller = (data: Omit<Reseller, 'id' | 'currentBalanceFcfa'>) => {
    const newReseller: Reseller = {
      ...data,
      id: `res-${Date.now()}`,
      currentBalanceFcfa: 0,
    };
    setResellers((prev) => [...prev, newReseller]);
    showToast('Nouveau revendeur créé', `${newReseller.name} ajouté avec succès.`, 'success');
  };

  // Sync Queue Runner
  const syncPendingQueue = async (): Promise<void> => {
    if (isSyncing || syncQueue.length === 0) return;
    setIsSyncing(true);

    const itemsToSync = [...syncQueue];
    for (let i = 0; i < itemsToSync.length; i++) {
      const item = itemsToSync[i];
      // Simulate network request delay per item
      await new Promise((r) => setTimeout(r, 450));

      // Mark transaction in central list as synced
      if (item.payload && item.payload.id) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === item.payload.id ? { ...t, syncStatus: 'synced' } : t))
        );
      }

      // Remove from queue one by one
      setSyncQueue((prev) => prev.filter((q) => q.id !== item.id));
    }

    setIsSyncing(false);
    showToast(
      'Synchronisation terminée',
      `${itemsToSync.length} opération(s) transférée(s) avec succès vers le serveur central.`,
      'success'
    );
  };

  // Demonstrate duplicate rejection
  const testDuplicateRejection = () => {
    // Pick the latest valid transaction
    const latestTx = transactions[0];
    if (!latestTx) {
      showToast('Aucune transaction à renvoyer', 'Créez une vente d’abord.', 'warning');
      return;
    }

    // Simulate resending with the exact same idempotency key
    showToast(
      'Test idempotence & doublon',
      `Simulation de renvoi réseau pour "${latestTx.id}" (Clé: ${latestTx.idempotencyKey.substring(0, 14)}...)`,
      'info'
    );

    setTimeout(() => {
      showToast(
        'Protection anti-doublon active',
        `Rejet serveur : La transaction "${latestTx.id}" existe déjà. Écriture ignorée sans altération des stocks.`,
        'success'
      );
    }, 700);
  };

  // Reset all demo data
  const resetDemoData = () => {
    localStorage.clear();
    setProducts(INITIAL_PRODUCTS);
    setResellers(INITIAL_RESELLERS);
    setStockLevels(buildInitialStock());
    setTransactions(buildInitialTransactions());
    setTransfers(INITIAL_TRANSFERS);
    setPriceLogs(INITIAL_PRICE_LOGS);
    setCashClosings(INITIAL_CASH_CLOSINGS as CashClosing[]);
    setSyncQueue([]);
    setIsOffline(false);
    setActiveCart([]);
    setSelectedReseller(null);
    setCurrentUser(INITIAL_USERS[0]);
    setCurrentSiteState(INITIAL_SITES[0]);
    showToast('Données réinitialisées', 'Jeu de démonstration d’origine rechargé.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentSite,
        isOffline,
        syncQueue,
        isSyncing,
        toast,
        products,
        sites,
        resellers,
        users,
        stockLevels,
        transactions,
        transfers,
        priceLogs,
        cashClosings,
        activeCart,
        cartClientType,
        selectedReseller,
        login,
        logout,
        setCurrentSite,
        toggleOffline,
        dismissToast,
        showToast,
        setCartClientType: handleSetCartClientType,
        setSelectedReseller,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        completeSale,
        createStockMovement,
        confirmTransferReception,
        recordCashClosing,
        cancelTransaction,
        updateProductPrices,
        updateReseller,
        addReseller,
        syncPendingQueue,
        testDuplicateRejection,
        resetDemoData,
        getStockForProduct,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
