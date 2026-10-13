import { Product, Site, Reseller, User, StockLevel, Transaction, TransferMovement, PriceChangeLog } from '../types';

export const INITIAL_SITES: Site[] = [
  {
    id: 'site-yopougon',
    name: 'Boutique Yopougon',
    type: 'boutique',
    city: 'Abidjan',
    address: 'Zone Industrielle Yopougon, Carrefour Sable',
  },
  {
    id: 'site-bouake',
    name: 'Boutique Bouaké',
    type: 'boutique',
    city: 'Bouaké',
    address: 'Quartier Commerce, Rue de la Gare',
  },
  {
    id: 'site-abidjan-port',
    name: 'Dépôt Abidjan Port',
    type: 'depot',
    city: 'Abidjan',
    address: 'Zone Portuaire Vridi, Quai Céréalier',
  },
  {
    id: 'site-yamoussoukro',
    name: 'Dépôt Yamoussoukro',
    type: 'depot',
    city: 'Yamoussoukro',
    address: 'Route Nationale 1, Zone Logistique',
  },
  {
    id: 'site-san-pedro',
    name: 'Dépôt San-Pédro',
    type: 'depot',
    city: 'San-Pédro',
    address: 'Zone Industrielle Portuaire',
  },
  {
    id: 'site-korhogo',
    name: 'Dépôt Korhogo',
    type: 'depot',
    city: 'Korhogo',
    address: 'Quartier Soba, Sortie Ferké',
  },
  {
    id: 'site-daloa',
    name: 'Dépôt Daloa',
    type: 'depot',
    city: 'Daloa',
    address: 'Avenue de la Paix, Face CFAO',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    code: 'PRM-POND-05',
    name: 'Prémix Pondeuse 5%',
    category: 'Prémix',
    sackWeightKg: 25,
    retailPriceFcfa: 32500,
    resellerPriceFcfa: 29000,
    minAlertStock: 40,
    description: 'Complexe vitaminique et minéral haut rendement pour pondeuses en production.',
  },
  {
    id: 'prod-2',
    code: 'CNC-CHAIR-DEM',
    name: 'Concentré Chair Démarrage 10%',
    category: 'Concentré',
    sackWeightKg: 50,
    retailPriceFcfa: 42000,
    resellerPriceFcfa: 38000,
    minAlertStock: 50,
    description: 'Riche en acides aminés essentiels et phosphore assimilable pour poussins 0-14 jours.',
  },
  {
    id: 'prod-3',
    code: 'PRM-FIN-025',
    name: 'Prémix Poulet Finition 2.5%',
    category: 'Prémix',
    sackWeightKg: 25,
    retailPriceFcfa: 28000,
    resellerPriceFcfa: 25500,
    minAlertStock: 35,
    description: 'Optimisation de la masse musculaire et indice de consommation en fin d’élevage.',
  },
  {
    id: 'prod-4',
    code: 'CNC-POND-PROD',
    name: 'Concentré Pondeuse Production 5%',
    category: 'Concentré',
    sackWeightKg: 50,
    retailPriceFcfa: 44500,
    resellerPriceFcfa: 40500,
    minAlertStock: 60,
    description: 'Renfort en calcium granulaire et chélate de zinc pour la qualité de coquille.',
  },
  {
    id: 'prod-5',
    code: 'PRM-CHAIR-CR',
    name: 'Prémix Chair Croissance 5%',
    category: 'Prémix',
    sackWeightKg: 25,
    retailPriceFcfa: 31000,
    resellerPriceFcfa: 28000,
    minAlertStock: 45,
    description: 'Formule équilibrée en énergie et protéines végétales pour poulets 15-28 jours.',
  },
  {
    id: 'prod-6',
    code: 'CNC-POUSS-SUP',
    name: 'Concentré Poussin Démarrage Super',
    category: 'Concentré',
    sackWeightKg: 50,
    retailPriceFcfa: 46000,
    resellerPriceFcfa: 42000,
    minAlertStock: 50,
    description: 'Protection intestinale renforcée et probiotiques encapsulés pour lot fragile.',
  },
  {
    id: 'prod-7',
    code: 'PRM-REP-SPEC',
    name: 'Prémix Reproductrice Spécial',
    category: 'Prémix',
    sackWeightKg: 25,
    retailPriceFcfa: 39000,
    resellerPriceFcfa: 35000,
    minAlertStock: 30,
    description: 'Haute teneur en vitamine E et sélénium organique pour taux d’éclosion supérieur.',
  },
  {
    id: 'prod-8',
    code: 'CNC-PINT-CROIS',
    name: 'Concentré Pintade & Caille Croissance',
    category: 'Concentré',
    sackWeightKg: 25,
    retailPriceFcfa: 26500,
    resellerPriceFcfa: 23500,
    minAlertStock: 25,
    description: 'Granulométrie adaptée aux gallinacés rustiques et volailles fermières.',
  },
  {
    id: 'prod-9',
    code: 'PRM-MIN-MAX',
    name: 'Prémix Minéral & Vitaminique Ponte Max',
    category: 'Prémix',
    sackWeightKg: 25,
    retailPriceFcfa: 34000,
    resellerPriceFcfa: 30500,
    minAlertStock: 40,
    description: 'Soutien hépatique et minéralisation du squelette pour vieilles pondeuses.',
  },
  {
    id: 'prod-10',
    code: 'CNC-CHAIR-FIN',
    name: 'Concentré Chair Finition 10%',
    category: 'Concentré',
    sackWeightKg: 50,
    retailPriceFcfa: 41000,
    resellerPriceFcfa: 37000,
    minAlertStock: 50,
    description: 'Absence de promoteurs de croissance de synthèse, saveur et engraissement optimal.',
  },
];

export const INITIAL_RESELLERS: Reseller[] = [
  {
    id: 'res-1',
    name: 'Ferme Avicole Konan & Fils',
    city: 'Bouaké',
    phone: '+225 07 48 29 11 02',
    creditLimitFcfa: 5000000,
    currentBalanceFcfa: 4920000, // 98.4% -> NEAR LIMIT
    contactPerson: 'M. Brou Konan',
    notes: 'Client historique depuis 2021. Gros volume ponte.',
  },
  {
    id: 'res-2',
    name: 'Société Élevage Moderne Bamba',
    city: 'Daloa',
    phone: '+225 05 64 12 88 40',
    creditLimitFcfa: 3000000,
    currentBalanceFcfa: 3150000, // 105% -> OVER LIMIT (BLOCKED FOR CREDIT)
    contactPerson: 'Dr. Bamba Seydou',
    notes: 'Retard de règlement de 14 jours sur facture F-2609.',
  },
  {
    id: 'res-3',
    name: 'Agri-Prestige Ivoire',
    city: 'Abidjan',
    phone: '+225 07 89 33 22 10',
    creditLimitFcfa: 8000000,
    currentBalanceFcfa: 3200000, // 40%
    contactPerson: 'Mme Christine Koffi',
    notes: 'Excellent payeur, virement Wave ou MoMo hebdomadaire.',
  },
  {
    id: 'res-4',
    name: 'Comptoir Avicole du Bélier',
    city: 'Yamoussoukro',
    phone: '+225 01 22 55 44 99',
    creditLimitFcfa: 4500000,
    currentBalanceFcfa: 1850000, // 41%
    contactPerson: 'M. Yao N’Goran',
    notes: 'Distribution demi-gros sur Toumodi et Yamoussoukro.',
  },
  {
    id: 'res-5',
    name: 'Ferme Providence Korhogo',
    city: 'Korhogo',
    phone: '+225 07 10 99 77 33',
    creditLimitFcfa: 3500000,
    currentBalanceFcfa: 800000, // 22%
    contactPerson: 'M. Soro Daouda',
    notes: 'Commandes groupées mensuelles par camion.',
  },
  {
    id: 'res-6',
    name: 'Coopérative San-Pédro Élevage',
    city: 'San-Pédro',
    phone: '+225 05 04 18 20 60',
    creditLimitFcfa: 6000000,
    currentBalanceFcfa: 4200000, // 70%
    contactPerson: 'M. Gnahoré Félix',
    notes: 'Règlement régulier par chèque certifié et MoMo.',
  },
  {
    id: 'res-7',
    name: 'Aviculture du Centre (Gagnoa)',
    city: 'Gagnoa',
    phone: '+225 07 77 44 11 88',
    creditLimitFcfa: 2500000,
    currentBalanceFcfa: 650000, // 26%
    contactPerson: 'M. Dago Jean-Luc',
    notes: 'Revendeur boutique locale et provendier.',
  },
  {
    id: 'res-8',
    name: 'Aliments & Soins Avicoles Dabou',
    city: 'Dabou',
    phone: '+225 01 45 67 89 00',
    creditLimitFcfa: 4000000,
    currentBalanceFcfa: 1200000, // 30%
    contactPerson: 'Mme Akissi Touré',
    notes: 'Rattachée à la boutique de Yopougon.',
  },
  {
    id: 'res-9',
    name: 'Ferme Bio-Ponte Bingerville',
    city: 'Bingerville',
    phone: '+225 05 88 33 22 55',
    creditLimitFcfa: 5500000,
    currentBalanceFcfa: 0, // 0%
    contactPerson: 'M. Coulibaly Idriss',
    notes: 'Règlement comptant systématique par Orange Money.',
  },
  {
    id: 'res-10',
    name: 'Avicole du Bandama Tiassalé',
    city: 'Tiassalé',
    phone: '+225 07 33 66 99 11',
    creditLimitFcfa: 3000000,
    currentBalanceFcfa: 1100000, // 36%
    contactPerson: 'M. Kassi Albert',
    notes: 'Livraisons assurées depuis Dépôt Port.',
  },
  {
    id: 'res-11',
    name: 'Élevage Volaille Express Abobo',
    city: 'Abidjan',
    phone: '+225 05 55 12 34 78',
    creditLimitFcfa: 4000000,
    currentBalanceFcfa: 2450000, // 61%
    contactPerson: 'M. Cissé Mamadou',
    notes: 'Enlèvement au magasin de Yopougon.',
  },
  {
    id: 'res-12',
    name: 'Provenderie Moderne Man',
    city: 'Man',
    phone: '+225 07 90 22 11 44',
    creditLimitFcfa: 3500000,
    currentBalanceFcfa: 950000, // 27%
    contactPerson: 'M. Tia Robert',
    notes: 'Approvisionné via le dépôt de Daloa.',
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Amadou Kouamé',
    role: 'vendeur',
    roleLabel: 'Responsable Vente Boutique',
    pin: '1234',
    defaultSiteId: 'site-yopougon',
    locationName: 'Boutique Yopougon (Abidjan)',
  },
  {
    id: 'usr-2',
    name: 'Fatou Traoré',
    role: 'caissier',
    roleLabel: 'Caissière Principale',
    pin: '2468',
    defaultSiteId: 'site-bouake',
    locationName: 'Boutique Bouaké',
  },
  {
    id: 'usr-3',
    name: 'Jean-Marc Yao',
    role: 'chef_depot',
    roleLabel: 'Chef de Dépôt Central',
    pin: '5678',
    defaultSiteId: 'site-abidjan-port',
    locationName: 'Dépôt Abidjan Port',
  },
  {
    id: 'usr-4',
    name: 'Aïssatou Diarra',
    role: 'magasinier',
    roleLabel: 'Gestionnaire des Stocks',
    pin: '9012',
    defaultSiteId: 'site-yamoussoukro',
    locationName: 'Dépôt Yamoussoukro',
  },
  {
    id: 'usr-admin',
    name: 'Patrick Tremblay',
    role: 'admin',
    roleLabel: 'Dirigeant & Propriétaire (Montréal)',
    pin: '9999',
    defaultSiteId: 'site-yopougon',
    locationName: 'Montréal / Supervision Globale',
  },
];

// Helper to build realistic initial stock
export function buildInitialStock(): StockLevel[] {
  const stockLevels: StockLevel[] = [];
  const baseStockBySite: Record<string, number> = {
    'site-yopougon': 95,
    'site-bouake': 80,
    'site-abidjan-port': 350,
    'site-yamoussoukro': 160,
    'site-san-pedro': 120,
    'site-korhogo': 90,
    'site-daloa': 110,
  };

  INITIAL_SITES.forEach((site) => {
    INITIAL_PRODUCTS.forEach((prod, pIdx) => {
      const base = baseStockBySite[site.id] || 100;
      // create variation per product, some low stock for alert testing
      let qty = Math.max(15, Math.round(base * (0.8 + (pIdx % 5) * 0.15)));
      if (site.id === 'site-yopougon' && prod.id === 'prod-8') {
        qty = 18; // Low stock trigger (min is 25)
      }
      if (site.id === 'site-bouake' && prod.id === 'prod-3') {
        qty = 22; // Low stock trigger (min is 35)
      }
      stockLevels.push({
        siteId: site.id,
        productId: prod.id,
        quantity: qty,
      });
    });
  });

  return stockLevels;
}

export const INITIAL_TRANSFERS: TransferMovement[] = [
  {
    id: 'TRF-261012-001',
    date: '2026-10-12T10:15:00.000Z',
    fromSiteId: 'site-abidjan-port',
    fromSiteName: 'Dépôt Abidjan Port',
    toSiteId: 'site-yopougon',
    toSiteName: 'Boutique Yopougon',
    productId: 'prod-1',
    productName: 'Prémix Pondeuse 5%',
    quantity: 80,
    status: 'en_transit',
    createdBy: 'Jean-Marc Yao',
  },
  {
    id: 'TRF-261011-002',
    date: '2026-10-11T14:40:00.000Z',
    fromSiteId: 'site-abidjan-port',
    fromSiteName: 'Dépôt Abidjan Port',
    toSiteId: 'site-bouake',
    toSiteName: 'Boutique Bouaké',
    productId: 'prod-2',
    productName: 'Concentré Chair Démarrage 10%',
    quantity: 60,
    status: 'en_transit',
    createdBy: 'Jean-Marc Yao',
  },
  {
    id: 'TRF-261010-003',
    date: '2026-10-10T09:20:00.000Z',
    fromSiteId: 'site-yamoussoukro',
    fromSiteName: 'Dépôt Yamoussoukro',
    toSiteId: 'site-daloa',
    toSiteName: 'Dépôt Daloa',
    productId: 'prod-4',
    productName: 'Concentré Pondeuse Production 5%',
    quantity: 40,
    status: 'receptionne',
    createdBy: 'Aïssatou Diarra',
    receivedBy: 'Amadou Kouamé',
    receivedAt: '2026-10-11T16:00:00.000Z',
  },
];

export const INITIAL_PRICE_LOGS: PriceChangeLog[] = [
  {
    id: 'LOG-001',
    date: '2026-10-08T11:20:00.000Z',
    productId: 'prod-1',
    productName: 'Prémix Pondeuse 5%',
    field: 'retailPriceFcfa',
    fieldLabel: 'Prix Détaillant',
    oldValue: 31500,
    newValue: 32500,
    changedBy: 'Patrick Tremblay (Montréal)',
  },
  {
    id: 'LOG-002',
    date: '2026-10-05T15:45:00.000Z',
    productId: 'prod-2',
    productName: 'Concentré Chair Démarrage 10%',
    field: 'resellerPriceFcfa',
    fieldLabel: 'Prix Revendeur',
    oldValue: 37000,
    newValue: 38000,
    changedBy: 'Patrick Tremblay (Montréal)',
  },
];

// Generate 40 past transactions across 7 days
export function buildInitialTransactions(): Transaction[] {
  const txs: Transaction[] = [];
  const baseTime = new Date('2026-10-13T14:30:00.000Z').getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  const demoClients = [
    { name: 'Kouassi Kouadio (Particulier)', type: 'particulier' as const },
    { name: 'Ferme Avicole Konan & Fils', type: 'revendeur' as const, resId: 'res-1' },
    { name: 'Agri-Prestige Ivoire', type: 'revendeur' as const, resId: 'res-3' },
    { name: 'Élevage Yopougon Ferme 2', type: 'particulier' as const },
    { name: 'Comptoir Avicole du Bélier', type: 'revendeur' as const, resId: 'res-4' },
    { name: 'N’Dri Viviane (Avicultrice)', type: 'particulier' as const },
    { name: 'Coopérative San-Pédro Élevage', type: 'revendeur' as const, resId: 'res-6' },
    { name: 'Gérard Amani (Éleveur chair)', type: 'particulier' as const },
  ];

  const payMethods: { method: 'especes' | 'mobile_money' | 'credit'; op?: 'orange' | 'mtn' | 'moov' | 'wave'; ref?: string }[] = [
    { method: 'especes' },
    { method: 'mobile_money', op: 'orange', ref: 'CI-OM-883921' },
    { method: 'mobile_money', op: 'wave', ref: 'WAV-094827' },
    { method: 'mobile_money', op: 'mtn', ref: 'MTN-CI-554219' },
    { method: 'credit' },
    { method: 'especes' },
  ];

  const sites = [INITIAL_SITES[0], INITIAL_SITES[1], INITIAL_SITES[2], INITIAL_SITES[3]];
  const staff = [INITIAL_USERS[0], INITIAL_USERS[1], INITIAL_USERS[2], INITIAL_USERS[3]];

  // 36 Sales spread across 7 days
  for (let i = 1; i <= 36; i++) {
    // Spread backwards: 0 to 6 days ago
    const dayOffset = (i % 7) * dayMs;
    const hourOffset = ((i * 3) % 10) * 3600 * 1000 + ((i * 17) % 60) * 60 * 1000;
    const txDate = new Date(baseTime - dayOffset - hourOffset).toISOString();

    const client = demoClients[i % demoClients.length];
    const site = sites[i % sites.length];
    const user = staff[i % staff.length];
    const pay = payMethods[i % payMethods.length];

    const prodA = INITIAL_PRODUCTS[(i * 2) % INITIAL_PRODUCTS.length];
    const prodB = INITIAL_PRODUCTS[(i * 3 + 1) % INITIAL_PRODUCTS.length];
    const isReseller = client.type === 'revendeur';

    const pAUnit = isReseller ? prodA.resellerPriceFcfa : prodA.retailPriceFcfa;
    const pBUnit = isReseller ? prodB.resellerPriceFcfa : prodB.retailPriceFcfa;
    const qA = 2 + (i % 8);
    const qB = i % 3 === 0 ? 3 + (i % 4) : 0;

    const items = [
      {
        productId: prodA.id,
        productName: prodA.name,
        sackWeightKg: prodA.sackWeightKg,
        quantity: qA,
        unitPrice: pAUnit,
        total: qA * pAUnit,
      },
    ];

    if (qB > 0) {
      items.push({
        productId: prodB.id,
        productName: prodB.name,
        sackWeightKg: prodB.sackWeightKg,
        quantity: qB,
        unitPrice: pBUnit,
        total: qB * pBUnit,
      });
    }

    const totalAmount = items.reduce((acc, it) => acc + it.total, 0);
    const paymentMethod = client.type === 'particulier' && pay.method === 'credit' ? 'especes' : pay.method;

    // Make 2 transactions cancelled for audit demonstration
    const isCancelled = i === 5 || i === 19;

    txs.push({
      id: `VNT-2610${(13 - (i % 7)).toString().padStart(2, '0')}-${(100 + i).toString().padStart(4, '0')}`,
      date: txDate,
      type: 'vente',
      siteId: site.id,
      siteName: site.name,
      userId: user.id,
      userName: user.name,
      clientType: client.type,
      clientName: client.name,
      resellerId: client.resId,
      items,
      totalAmountFcfa: totalAmount,
      paymentMethod,
      mobileMoneyOperator: paymentMethod === 'mobile_money' ? pay.op : undefined,
      mobileMoneyReference: paymentMethod === 'mobile_money' ? `CI-${pay.op?.toUpperCase()}-${100000 + i * 342}` : undefined,
      status: isCancelled ? 'annulee' : 'validee',
      cancellationReason: isCancelled
        ? i === 5
          ? 'Erreur de saisie caissier : double imputation client comptant'
          : 'Annulation demandée par le client avant enlèvement des sacs'
        : undefined,
      cancelledBy: isCancelled ? 'Amadou Kouamé' : undefined,
      cancelledAt: isCancelled ? new Date(new Date(txDate).getTime() + 1800000).toISOString() : undefined,
      syncStatus: 'synced',
      localCreatedAt: txDate,
      idempotencyKey: `idemp-sale-${i}`,
    });
  }

  // 4 Stock movement transactions
  txs.push({
    id: 'STK-261012-0081',
    date: '2026-10-12T08:30:00.000Z',
    type: 'entree_stock',
    siteId: 'site-abidjan-port',
    siteName: 'Dépôt Abidjan Port',
    userId: 'usr-3',
    userName: 'Jean-Marc Yao',
    notes: 'Réception navire Cotonou / Conteneur MSCU-992144 (250 sacs)',
    items: [
      {
        productId: 'prod-2',
        productName: 'Concentré Chair Démarrage 10%',
        sackWeightKg: 50,
        quantity: 250,
        unitPrice: 38000,
        total: 250 * 38000,
      },
    ],
    status: 'validee',
    syncStatus: 'synced',
    localCreatedAt: '2026-10-12T08:30:00.000Z',
    idempotencyKey: 'idemp-stk-1',
  });

  txs.push({
    id: 'AVR-261011-0012',
    date: '2026-10-11T17:15:00.000Z',
    type: 'avarie',
    siteId: 'site-yopougon',
    siteName: 'Boutique Yopougon',
    userId: 'usr-1',
    userName: 'Amadou Kouamé',
    notes: 'Avarie constatée : 4 sacs déchirés par manipulation chariot élévateur.',
    items: [
      {
        productId: 'prod-1',
        productName: 'Prémix Pondeuse 5%',
        sackWeightKg: 25,
        quantity: 4,
        unitPrice: 29000,
        total: 4 * 29000,
      },
    ],
    status: 'validee',
    syncStatus: 'synced',
    localCreatedAt: '2026-10-11T17:15:00.000Z',
    idempotencyKey: 'idemp-avr-1',
  });

  txs.push({
    id: 'RET-261010-0005',
    date: '2026-10-10T11:00:00.000Z',
    type: 'retour',
    siteId: 'site-bouake',
    siteName: 'Boutique Bouaké',
    userId: 'usr-2',
    userName: 'Fatou Traoré',
    notes: 'Retour client Ferme Konan : 5 sacs erreur référence de commande réintégrés en stock.',
    items: [
      {
        productId: 'prod-3',
        productName: 'Prémix Poulet Finition 2.5%',
        sackWeightKg: 25,
        quantity: 5,
        unitPrice: 25500,
        total: 5 * 25500,
      },
    ],
    status: 'validee',
    syncStatus: 'synced',
    localCreatedAt: '2026-10-10T11:00:00.000Z',
    idempotencyKey: 'idemp-ret-1',
  });

  txs.push({
    id: 'TRF-261009-0099',
    date: '2026-10-09T14:20:00.000Z',
    type: 'transfert',
    siteId: 'site-abidjan-port',
    siteName: 'Dépôt Abidjan Port',
    destinationSiteId: 'site-yamoussoukro',
    destinationSiteName: 'Dépôt Yamoussoukro',
    userId: 'usr-3',
    userName: 'Jean-Marc Yao',
    notes: 'Réapprovisionnement régional hebdomadaire',
    items: [
      {
        productId: 'prod-4',
        productName: 'Concentré Pondeuse Production 5%',
        sackWeightKg: 50,
        quantity: 100,
        unitPrice: 40500,
        total: 100 * 40500,
      },
    ],
    status: 'validee',
    syncStatus: 'synced',
    localCreatedAt: '2026-10-09T14:20:00.000Z',
    idempotencyKey: 'idemp-trf-99',
  });

  // Sort descending by date
  return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const INITIAL_CASH_CLOSINGS: Record<string, any>[] = [
  {
    id: 'CLO-261012-YOP',
    date: '2026-10-12T18:30:00.000Z',
    siteId: 'site-yopougon',
    siteName: 'Boutique Yopougon',
    userId: 'usr-1',
    userName: 'Amadou Kouamé',
    theoreticalCashFcfa: 1250000,
    countedCashFcfa: 1250000,
    differenceFcfa: 0,
    denominations: { 10000: 80, 5000: 60, 2000: 50, 1000: 40, 500: 20 },
    justification: '',
    syncStatus: 'synced',
  },
  {
    id: 'CLO-261011-YOP',
    date: '2026-10-11T18:15:00.000Z',
    siteId: 'site-yopougon',
    siteName: 'Boutique Yopougon',
    userId: 'usr-1',
    userName: 'Amadou Kouamé',
    theoreticalCashFcfa: 985000,
    countedCashFcfa: 980000,
    differenceFcfa: -5000,
    denominations: { 10000: 65, 5000: 40, 2000: 55, 1000: 20 },
    justification: 'Erreur rendu monnaie client pressé sur marché de gros',
    syncStatus: 'synced',
  },
  {
    id: 'CLO-261012-BKE',
    date: '2026-10-12T18:45:00.000Z',
    siteId: 'site-bouake',
    siteName: 'Boutique Bouaké',
    userId: 'usr-2',
    userName: 'Fatou Traoré',
    theoreticalCashFcfa: 820000,
    countedCashFcfa: 820000,
    differenceFcfa: 0,
    denominations: { 10000: 50, 5000: 40, 2000: 50, 1000: 20 },
    justification: '',
    syncStatus: 'synced',
  },
];
