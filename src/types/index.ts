export type SiteType = 'boutique' | 'depot';

export interface Site {
  id: string;
  name: string;
  type: SiteType;
  city: string;
  address: string;
}

export type ProductCategory = 'Prémix' | 'Concentré' | 'Aliment complet';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: ProductCategory;
  sackWeightKg: number;
  retailPriceFcfa: number; // Prix client particulier
  resellerPriceFcfa: number; // Prix revendeur agréé
  minAlertStock: number;
  description: string;
}

export interface Reseller {
  id: string;
  name: string;
  city: string;
  phone: string;
  creditLimitFcfa: number;
  currentBalanceFcfa: number;
  contactPerson: string;
  notes?: string;
}

export type UserRole = 'vendeur' | 'caissier' | 'chef_depot' | 'magasinier' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  pin: string;
  defaultSiteId: string;
  locationName: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type PaymentMethod = 'especes' | 'mobile_money' | 'credit';
export type MobileMoneyOperator = 'orange' | 'mtn' | 'moov' | 'wave';

export type TransactionType = 'vente' | 'entree_stock' | 'transfert' | 'retour' | 'avarie' | 'cloture_caisse';
export type TransactionStatus = 'validee' | 'annulee';

export interface SaleItem {
  productId: string;
  productName: string;
  sackWeightKg: number;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO String
  type: TransactionType;
  siteId: string;
  siteName: string;
  destinationSiteId?: string;
  destinationSiteName?: string;
  userId: string;
  userName: string;
  clientType?: 'particulier' | 'revendeur';
  clientName?: string;
  resellerId?: string;
  items?: SaleItem[];
  totalAmountFcfa?: number;
  paymentMethod?: PaymentMethod;
  mobileMoneyOperator?: MobileMoneyOperator;
  mobileMoneyReference?: string;
  status: TransactionStatus;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  notes?: string;
  syncStatus: 'synced' | 'pending';
  localCreatedAt: string;
  idempotencyKey: string;
}

export interface StockLevel {
  siteId: string;
  productId: string;
  quantity: number;
}

export interface CashClosing {
  id: string;
  date: string;
  siteId: string;
  siteName: string;
  userId: string;
  userName: string;
  theoreticalCashFcfa: number;
  countedCashFcfa: number;
  differenceFcfa: number;
  denominations: Record<number, number>;
  justification?: string;
  syncStatus: 'synced' | 'pending';
}

export interface TransferMovement {
  id: string;
  date: string;
  fromSiteId: string;
  fromSiteName: string;
  toSiteId: string;
  toSiteName: string;
  productId: string;
  productName: string;
  quantity: number;
  status: 'en_transit' | 'receptionne';
  createdBy: string;
  receivedBy?: string;
  receivedAt?: string;
}

export interface PriceChangeLog {
  id: string;
  date: string;
  productId: string;
  productName: string;
  field: 'retailPriceFcfa' | 'resellerPriceFcfa';
  fieldLabel: string;
  oldValue: number;
  newValue: number;
  changedBy: string;
}

export interface SyncQueueItem {
  id: string;
  idempotencyKey: string;
  action: 'vente' | 'mouvement_stock' | 'cloture_caisse' | 'annulation';
  description: string;
  timestamp: string;
  payload: any;
  status: 'pending' | 'syncing' | 'synced' | 'duplicate_ignored';
}
