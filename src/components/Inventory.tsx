import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Edit, 
  Trash2, 
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  History,
  X,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  QrCode,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Calendar,
  FileDown,
  ListFilter
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { Product, StockMovement } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

const mockMovements: StockMovement[] = [
  { id: 'm1', storeId: '1', productId: '1', type: 'In', quantity: 10, reason: 'Réception fournisseur', date: '2026-04-15 10:30' },
  { id: 'm2', storeId: '1', productId: '1', type: 'Out', quantity: 2, reason: 'Vente #INV-2026-001', date: '2026-04-16 14:20' },
  { id: 'm3', storeId: '1', productId: '1', type: 'Adjustment', quantity: -3, reason: 'Produit défectueux retourné', date: '2026-04-18 09:15' },
  { id: 'm4', storeId: '2', productId: '3', type: 'In', quantity: 100, reason: 'Stock initial', date: '2026-04-01 08:00' },
  { id: 'm5', storeId: '2', productId: '3', type: 'Out', quantity: 50, reason: 'Vente comptoir', date: '2026-04-19 16:45' },
];

const mockProducts: Product[] = [
  { id: '1', storeId: '1', name: 'Smartphone Galaxy S21', category: 'Electronique', price: 450000, purchasePrice: 380000, stock: 5, sku: 'S21-450', minStockThreshold: 2 },
  { id: '2', storeId: '1', name: 'Laptop Dell XPS 13', category: 'Electronique', price: 850000, purchasePrice: 720000, stock: 3, sku: 'XPS-13-850', minStockThreshold: 1 },
  { id: '3', storeId: '2', name: 'Marteau 500g', category: 'Quincaillerie', price: 5000, purchasePrice: 3500, stock: 50, sku: 'MART-500', minStockThreshold: 10 },
  { id: '4', storeId: '2', name: 'Perceuse Sans Fil', category: 'Quincaillerie', price: 75000, purchasePrice: 55000, stock: 2, sku: 'PERC-75', minStockThreshold: 3 },
  { id: '5', storeId: '1', name: 'Écouteurs Bluetooth', category: 'Electronique', price: 25000, purchasePrice: 15000, stock: 0, sku: 'EC-BLUE', minStockThreshold: 5 },
];

export const Inventory = ({ storeId }: { storeId: string }) => {
  const [viewMode, setViewMode] = useState<'inventory' | 'movements'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qrProduct, setQrProduct] = useState<Product | null>(null);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter States (Inventory)
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Filter States (Movements)
  const [movementFilterType, setMovementFilterType] = useState<string>('All');
  const [movementFilterDate, setMovementFilterDate] = useState<string>('');
  const [movements, setMovements] = useState<StockMovement[]>(mockMovements);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [sortField, setSortField] = useState<'name' | 'stock' | 'price' | 'value'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Form State
  const initialMovementState = {
    productId: '',
    type: 'In' as 'In' | 'Out' | 'Adjustment',
    quantity: 1,
    reason: '',
    date: new Date().toISOString().split('T')[0]
  };
  const [movementForm, setMovementForm] = useState(initialMovementState);

  const productMovements = selectedProduct 
    ? movements.filter(m => m.productId === selectedProduct.id)
    : [];

  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const newMovement: StockMovement = {
      id: `m-${Date.now()}`,
      storeId: storeId,
      productId: movementForm.productId,
      type: movementForm.type,
      quantity: movementForm.quantity,
      reason: movementForm.reason,
      date: movementForm.date + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMovements([newMovement, ...movements]);
    
    // Update product stock
    setProducts(products.map(p => {
      if (p.id === movementForm.productId) {
        const change = movementForm.type === 'In' ? movementForm.quantity : -movementForm.quantity;
        return { ...p, stock: Math.max(0, p.stock + change), updatedAt: new Date().toISOString() };
      }
      return p;
    }));

    setIsMovementModalOpen(false);
    setMovementForm(initialMovementState);
  };

  const storeProducts = products.filter(p => p.storeId === storeId);
  const storeMovements = movements.filter(m => m.storeId === storeId);

  const filteredProducts = storeProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    
    const matchesStatus = filterStatus === 'All' || (() => {
      if (filterStatus === 'Rupture') return p.stock === 0;
      if (filterStatus === 'Faible stock') return p.stock > 0 && p.stock <= p.minStockThreshold;
      if (filterStatus === 'En stock') return p.stock > p.minStockThreshold;
      return true;
    })();

    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    const getValue = (p: Product) => {
      switch (sortField) {
        case 'stock': return p.stock;
        case 'price': return p.price;
        case 'value': return p.stock * p.price;
        default: return p.name.toLowerCase();
      }
    };

    const valA = getValue(a);
    const valB = getValue(b);

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredMovements = storeMovements.filter(m => {
    const p = products.find(prod => prod.id === m.productId);
    const productName = p ? p.name : '';
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = movementFilterType === 'All' || m.type === movementFilterType;
    const matchesDate = !movementFilterDate || m.date.startsWith(movementFilterDate);
    
    return matchesSearch && matchesType && matchesDate;
  });

  const handleSort = (field: 'name' | 'stock' | 'price' | 'value') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const totalInventoryValue = filteredProducts.reduce((sum, p) => sum + (p.stock * p.price), 0);
  const lowStockCount = filteredProducts.filter(p => p.stock > 0 && p.stock <= p.minStockThreshold).length;
  const outOfStockCount = filteredProducts.filter(p => p.stock === 0).length;

  const generateReport = () => {
    const doc = new jsPDF() as any;
    doc.setFontSize(20);
    doc.text('Rapport d\'Inventaire - FlaGest', 20, 20);
    doc.setFontSize(10);
    doc.text(`Généré le: ${new Date().toLocaleString()}`, 20, 30);

    const tableData = products.map(p => [
      p.name,
      p.sku,
      p.category,
      p.stock,
      formatCurrency(p.price),
      formatCurrency(p.stock * p.price)
    ]);

    doc.autoTable({
      startY: 40,
      head: [['Produit', 'SKU', 'Catégorie', 'Stock', 'Prix', 'Valeur' ]],
      body: tableData,
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
    doc.setFontSize(12);
    doc.text(`Valeur Totale du Stock: ${formatCurrency(totalValue)}`, 20, finalY);

    doc.save(`rapport-inventaire-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateMovementsReport = () => {
    const doc = new jsPDF() as any;
    doc.setFontSize(20);
    doc.text('Historique des Mouvements de Stock', 20, 20);
    doc.setFontSize(10);
    doc.text(`Période: ${movementFilterDate || 'Toutes dates'} | Type: ${movementFilterType}`, 20, 30);

    const tableData = filteredMovements.map(m => {
      const p = products.find(prod => prod.id === m.productId);
      return [
        m.date,
        p ? p.name : 'Inconnu',
        m.type === 'In' ? 'Entrée' : (m.type === 'Out' ? 'Sortie' : 'Ajustement'),
        m.quantity,
        m.reason
      ];
    });

    doc.autoTable({
      startY: 40,
      head: [['Date', 'Produit', 'Type', 'Qté', 'Motif']],
      body: tableData,
    });

    doc.save(`mouvements-stock-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const categoryChartData = [
    { name: 'Electronique', stock: products.filter(p => p.category === 'Electronique').reduce((sum, p) => sum + p.stock, 0) },
    { name: 'Quincaillerie', stock: products.filter(p => p.category === 'Quincaillerie').reduce((sum, p) => sum + p.stock, 0) }
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Gestion des Stocks</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm mt-1">Gérez votre inventaire et vos mouvements en temps réel.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[20px] shadow-inner w-full md:w-auto">
          <button 
            onClick={() => setViewMode('inventory')}
            className={cn(
              "flex-1 md:px-8 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all",
              viewMode === 'inventory' ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md" : "text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50"
            )}
          >
            Inventaire
          </button>
          <button 
            onClick={() => setViewMode('movements')}
            className={cn(
              "flex-1 md:px-8 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all",
              viewMode === 'movements' ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md" : "text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50"
            )}
          >
            Mouvements
          </button>
        </div>
      </header>

      {/* Quick Summary Widgets & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 p-6 rounded-[32px] flex items-center shadow-sm">
            <div className="bg-blue-600 p-3 rounded-2xl mr-4 text-white">
              <Package className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-blue-900 dark:text-blue-300 text-[10px] font-black uppercase tracking-widest opacity-60">Total Valeur Stock</p>
              <h3 className="text-2xl font-black text-blue-900 dark:text-blue-100">{formatCurrency(totalInventoryValue)}</h3>
            </div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 p-6 rounded-2xl flex items-center shadow-sm">
            <div className="bg-emerald-600 p-3 rounded-xl mr-4 text-white">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-emerald-900 dark:text-emerald-300 text-[10px] font-black uppercase tracking-widest opacity-60">Articles Distincts</p>
              <h3 className="text-2xl font-black text-emerald-900 dark:text-emerald-100">{filteredProducts.length}</h3>
            </div>
          </div>
          <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 p-6 rounded-2xl flex items-center shadow-sm">
            <div className="bg-rose-600 p-3 rounded-xl mr-4 text-white">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-rose-900 dark:text-rose-300 text-[10px] font-black uppercase tracking-widest opacity-60">Alertes Stock</p>
              <h3 className="text-2xl font-black text-rose-900 dark:text-rose-100">{lowStockCount + outOfStockCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Stock par Catégorie</h4>
          </div>
          <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical" margin={{ left: -20, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg border border-slate-800 dark:border-slate-700">
                          {payload[0].payload.name}: {payload[0].value}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="stock" radius={[0, 4, 4, 0]} barSize={12}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Electronique' ? '#3b82f6' : '#a855f7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-2 pt-2 border-t border-slate-50 dark:border-slate-800">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Elec.</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Quin.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder={viewMode === 'inventory' ? "Rechercher par nom, SKU..." : "Rechercher par produit, motif..."}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            {viewMode === 'inventory' ? (
              <>
                <button 
                  onClick={() => generateReport()}
                  className="flex items-center px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm"
                >
                  <FileDown className="w-4 h-4 mr-2" /> Rapport
                </button>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "flex items-center px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-sm",
                    showFilters || filterCategory !== 'All' || filterStatus !== 'All'
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                      : "text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                  )}
                >
                  <Filter className="w-4 h-4 mr-2" /> Filtrer
                </button>
                <button 
                  onClick={() => setIsMovementModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center space-x-2 shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Mouvement</span>
                </button>
              </>
            ) : (
              <>
                <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
                  {(['All', 'In', 'Out', 'Adjustment'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setMovementFilterType(t)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap",
                        movementFilterType === t 
                          ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" 
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                      )}
                    >
                      {t === 'All' ? 'Tous' : (t === 'In' ? 'Entrées' : (t === 'Out' ? 'Sorties' : 'Ajust.'))}
                    </button>
                  ))}
                </div>
                <div className="flex bg-slate-50 dark:bg-slate-800 rounded-xl px-3 items-center border border-slate-100 dark:border-slate-700">
                  <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                  <input 
                    type="date" 
                    className="bg-transparent border-none text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 outline-none"
                    value={movementFilterDate}
                    onChange={(e) => setMovementFilterDate(e.target.value)}
                  />
                  {movementFilterDate && (
                    <button onClick={() => setMovementFilterDate('')} className="ml-2">
                      <X className="w-3 h-3 text-slate-400" />
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => generateMovementsReport()}
                  className="flex items-center px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm"
                >
                  <FileDown className="w-4 h-4 mr-2" /> Rapport
                </button>
              </>
            )}
          </div>

            <AnimatePresence>
              {showFilters && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowFilters(false)} 
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-72 bg-white rounded-[24px] shadow-2xl border border-slate-100 p-6 z-20"
                  >
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Catégorie</label>
                        <div className="grid grid-cols-1 gap-1">
                          {['All', 'Electronique', 'Quincaillerie'].map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setFilterCategory(cat)}
                              className={cn(
                                "text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
                                filterCategory === cat 
                                  ? "bg-blue-50 text-blue-600" 
                                  : "text-slate-500 hover:bg-slate-50"
                              )}
                            >
                              {cat === 'All' ? 'Toutes les catégories' : cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-slate-50">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut Stock</label>
                        <div className="grid grid-cols-1 gap-1">
                          {['All', 'En stock', 'Faible stock', 'Rupture'].map((status) => (
                            <button
                              key={status}
                              onClick={() => setFilterStatus(status)}
                              className={cn(
                                "text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
                                filterStatus === status
                                  ? "bg-blue-50 text-blue-600" 
                                  : "text-slate-500 hover:bg-slate-50"
                              )}
                            >
                              {status === 'All' ? 'Tous les statuts' : status}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          setFilterCategory('All');
                          setFilterStatus('All');
                        }}
                        className="w-full pt-4 border-t border-slate-50 text-center text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                      >
                        Réinitialiser les filtres
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
        </div>

          <div className="overflow-x-auto">
          {viewMode === 'inventory' ? (
            <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <th className="px-4 py-4 md:px-6 md:py-4 w-10"></th>
                  <th className="px-2 py-4 md:px-6 md:py-4 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('name')}>
                    <div className="flex items-center">
                      Produit {sortField === 'name' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />)}
                    </div>
                  </th>
                  <th className="px-4 py-4 md:px-6 md:py-4 hidden sm:table-cell">Catégorie</th>
                  <th className="px-4 py-4 md:px-6 md:py-4 hidden md:table-cell">SKU</th>
                  <th className="px-4 py-4 md:px-6 md:py-4 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('stock')}>
                    <div className="flex items-center">
                      Stock {sortField === 'stock' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />)}
                    </div>
                  </th>
                  <th className="px-4 py-4 md:px-6 md:py-4 hidden sm:table-cell cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('price')}>
                    <div className="flex items-center">
                      Prix {sortField === 'price' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />)}
                    </div>
                  </th>
                  <th className="px-4 py-4 md:px-6 md:py-4 hidden lg:table-cell cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('value')}>
                    <div className="flex items-center">
                      Valeur {sortField === 'value' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />)}
                    </div>
                  </th>
                  <th className="px-4 py-4 md:px-6 md:py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredProducts.map((p) => {
                  const isExpanded = expandedProductId === p.id;
                  return (
                    <React.Fragment key={p.id}>
                      <tr 
                        className={cn(
                          "hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group",
                          isExpanded && "bg-blue-50/30 dark:bg-blue-900/10"
                        )}
                        onClick={() => setExpandedProductId(isExpanded ? null : p.id)}
                      >
                        <td className="px-6 py-4">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-blue-600 transition-transform duration-200" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-transform duration-200 dark:text-slate-600" />
                          )}
                        </td>
                        <td className="px-4 py-4 md:px-6 md:py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-3 font-bold text-slate-400 dark:text-slate-500 text-xs">
                              {p.name.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs md:text-sm truncate max-w-[100px] md:max-w-none">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 md:px-6 md:py-4 hidden sm:table-cell">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold",
                            p.category === 'Electronique' ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
                          )}>
                            {p.category}
                          </span>
                        </td>
                        <td className="px-4 py-4 md:px-6 md:py-4 hidden md:table-cell font-mono text-[10px] text-slate-500 dark:text-slate-400">{p.sku}</td>
                        <td className="px-4 py-4 md:px-6 md:py-4">
                          <div className="flex items-center">
                            <span className={cn(
                              "font-bold mr-2 text-xs md:text-sm",
                              p.stock === 0 ? "text-rose-600" : (p.stock <= p.minStockThreshold ? "text-amber-500" : "text-slate-800 dark:text-slate-200")
                            )}>
                              {p.stock}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 md:px-6 md:py-4 hidden sm:table-cell font-bold text-slate-900 dark:text-white text-xs md:text-sm">{formatCurrency(p.price)}</td>
                        <td className="px-4 py-4 md:px-6 md:py-4 hidden lg:table-cell font-bold text-blue-600 dark:text-blue-400 text-xs md:text-sm">{formatCurrency(p.stock * p.price)}</td>
                        <td className="px-4 py-4 md:px-6 md:py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end space-x-1 md:space-x-2">
                            <button 
                              onClick={() => setSelectedProduct(p)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                              title="Historique"
                            >
                              <History className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setQrProduct(p)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                              title="Code QR"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-all">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      <AnimatePresence>
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="px-6 py-0 border-none">
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="py-6 px-10 grid grid-cols-1 md:grid-cols-3 gap-8 bg-blue-50/10 dark:bg-blue-900/10 border-t border-slate-50 dark:border-slate-800 ml-10 rounded-2xl mb-4 mr-6 shadow-inner">
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Prix d'Achat</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{p.purchasePrice ? formatCurrency(p.purchasePrice) : 'Non défini'}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Seuil d'Alerte Stock</p>
                                    <div className="flex items-center space-x-2">
                                      <AlertCircle className="w-4 h-4 text-amber-500" />
                                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{p.minStockThreshold} unités</p>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Dernière Mise à jour</p>
                                    <div className="flex items-center space-x-2">
                                      <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                      <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{p.updatedAt ? new Date(p.updatedAt).toLocaleString() : 'Jamais'}</p>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Produit</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Qté</th>
                  <th className="px-6 py-4">Motif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredMovements.map((m) => {
                  const p = products.find(prod => prod.id === m.productId);
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                          <Calendar className="w-3.5 h-3.5 mr-2 opacity-60" />
                          {m.date}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-black text-slate-800 dark:text-slate-200 text-sm">{p ? p.name : 'Inconnu'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                          m.type === 'In' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : 
                          (m.type === 'Out' ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400")
                        )}>
                          {m.type === 'In' ? 'Entrée' : (m.type === 'Out' ? 'Sortie' : 'Ajustement')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn(
                          "flex items-center font-black text-sm",
                          m.type === 'In' ? "text-emerald-600 dark:text-emerald-400" : (m.type === 'Out' ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400")
                        )}>
                          {m.type === 'In' ? '+' : (m.type === 'Out' ? '-' : '')}
                          {m.quantity}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{m.reason}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-between items-center text-sm">
          <p className="text-slate-500 font-medium">Affichage de {filteredProducts.length} sur {products.length} produits</p>
          <div className="flex space-x-2">
            <button disabled className="px-4 py-2 border border-slate-200 rounded-xl text-slate-400 disabled:opacity-50">Précédent</button>
            <button className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">Suivant</button>
          </div>
        </div>
      </div>

      {/* Stock History Overlay */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mr-4">
                    <History className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Historique des mouvements</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{selectedProduct.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 dark:text-slate-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {productMovements.length > 0 ? (
                  <div className="space-y-6">
                    {productMovements.map((movement, idx) => (
                      <div key={movement.id} className="relative pl-8 pb-6 last:pb-0 border-l-2 border-slate-100 dark:border-slate-800 last:border-transparent">
                        <div className={cn(
                          "absolute left-[-9px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900",
                          movement.type === 'In' ? "bg-emerald-500" : (movement.type === 'Out' ? "bg-rose-500" : "bg-amber-500")
                        )} />
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className={cn(
                                "text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded",
                                movement.type === 'In' ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400" : 
                                (movement.type === 'Out' ? "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400" : "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400")
                              )}>
                                {movement.type === 'In' ? 'ENTRÉE' : (movement.type === 'Out' ? 'SORTIE' : 'AJUSTEMENT')}
                              </span>
                              <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">{movement.date}</span>
                            </div>
                            <p className="mt-1.5 text-slate-800 dark:text-slate-200 font-bold">{movement.reason}</p>
                          </div>
                          <div className={cn(
                            "flex items-center font-black text-lg",
                            movement.type === 'In' ? "text-emerald-600 dark:text-emerald-400" : (movement.type === 'Out' ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400")
                          )}>
                            {movement.type === 'In' ? <ArrowUp className="w-4 h-4 mr-1" /> : (movement.type === 'Out' ? <ArrowDown className="w-4 h-4 mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />)}
                            {Math.abs(movement.quantity)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-bold">Aucun mouvement trouvé</p>
                    <p className="text-sm">Les entrées et sorties de stock apparaîtront ici.</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* New Movement Form Modal */}
      <AnimatePresence>
        {isMovementModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMovementModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Nouvel Historique</h3>
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-bold">Enregistrer une entrée ou sortie de stock</p>
                </div>
                <button 
                  onClick={() => setIsMovementModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 dark:text-slate-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddMovement} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Produit</label>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 dark:text-slate-200"
                    value={movementForm.productId}
                    onChange={(e) => setMovementForm({...movementForm, productId: e.target.value})}
                  >
                    <option value="" className="dark:bg-slate-900">Sélectionner un article...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id} className="dark:bg-slate-900">{p.name} (Stock: {p.stock})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Type</label>
                    <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl">
                      {(['In', 'Out', 'Adjustment'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setMovementForm({...movementForm, type: t})}
                          className={cn(
                            "flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all",
                            movementForm.type === t 
                              ? (t === 'In' ? "bg-emerald-500 text-white" : t === 'Out' ? "bg-rose-500 text-white" : "bg-amber-500 text-white")
                              : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                          )}
                        >
                          {t === 'In' ? 'Entrée' : t === 'Out' ? 'Sortie' : 'Ajust.'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Quantité</label>
                    <input 
                      type="number" 
                      min="1"
                      required
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 dark:text-slate-200"
                      value={movementForm.quantity}
                      onChange={(e) => setMovementForm({...movementForm, quantity: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Date</label>
                    <input 
                      type="date" 
                      required
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 dark:text-slate-200"
                      value={movementForm.date}
                      onChange={(e) => setMovementForm({...movementForm, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Motif</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Réception fournisseur..."
                      required
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 dark:text-slate-200"
                      value={movementForm.reason}
                      onChange={(e) => setMovementForm({...movementForm, reason: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4 flex space-x-4">
                  <button 
                    type="button"
                    onClick={() => setIsMovementModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQrProduct(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden p-8 flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6">
                <QrCode className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-1">Code QR du Produit</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-8">{qrProduct.name}</p>

              <div className="bg-white p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm mb-8">
                <QRCodeSVG 
                  value={JSON.stringify({ sku: qrProduct.sku, name: qrProduct.name })}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="w-full grid grid-cols-2 gap-4 text-left mb-8">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">SKU</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{qrProduct.sku}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Prix</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatCurrency(qrProduct.price)}</p>
                </div>
              </div>

              <button 
                onClick={() => setQrProduct(null)}
                className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 dark:shadow-blue-500/20 hover:bg-slate-800 dark:hover:bg-blue-700 transition-all font-sans"
              >
                Fermer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
