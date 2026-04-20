import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  User, 
  Plus, 
  Search, 
  MoreVertical, 
  TrendingUp, 
  ShoppingCart, 
  CheckCircle2, 
  XCircle,
  X,
  Edit,
  Trash2
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { Store } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const mockStores: Store[] = [
  { id: '1', name: 'FlaGest - Cotonou Centre', location: 'Avenue Steinmetz, Cotonou', manager: 'Marc G.', phone: '+229 97 00 00 01', revenue: 12500000, transactionsCount: 450, status: 'Open' },
  { id: '2', name: 'FlaGest - Porto-Novo', location: 'Quartier Ouando, Porto-Novo', manager: 'Alice B.', phone: '+229 97 00 00 02', revenue: 8400000, transactionsCount: 280, status: 'Open' },
  { id: '3', name: 'FlaGest - Parakou', location: 'Place Hubert Maga, Parakou', manager: 'Jean K.', phone: '+229 97 00 00 03', revenue: 0, transactionsCount: 0, status: 'Closed' },
];

export const Stores = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [stores, setStores] = useState<Store[]>(mockStores);

  const filteredStores = stores.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = stores.reduce((sum, s) => sum + s.revenue, 0);
  const totalTransactions = stores.reduce((sum, s) => sum + s.transactionsCount, 0);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-[1400px] mx-auto pb-20 md:pb-0 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Gestion des Magasins</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm mt-1">Supervisez tous vos points de vente en un coup d'œil.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto px-6 py-4 bg-blue-600 text-white rounded-[20px] font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span>Nouveau Magasin</span>
        </button>
      </header>

      {/* Global Performance Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">C.A. Consolidé</h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-xl text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          </div>
          <p className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">{formatCurrency(totalRevenue)}</p>
          <div className="flex items-center space-x-2">
            <span className="text-emerald-500 font-black text-xs">+12.5%</span>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold">vs mois dernier</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Ventes</h3>
          <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2">{totalTransactions}</p>
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold">Transactions</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Points de Vente</h3>
          <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2">{stores.length}</p>
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold">Magasins actifs</span>
          </div>
        </div>
      </div>

      {/* Stores List */}
      <div className="space-y-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Rechercher un magasin..."
            className="w-full pl-16 pr-6 py-4 md:py-5 bg-white dark:bg-slate-900 border-none rounded-[24px] shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm md:text-base font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredStores.map((store) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={store.id}
                className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl dark:hover:shadow-blue-500/5 transition-all group"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className={cn(
                    "w-12 h-12 md:w-16 md:h-16 rounded-[24px] flex items-center justify-center transition-all",
                    store.status === 'Open' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                  )}>
                    <Building2 className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <h4 className="font-black text-slate-900 dark:text-white text-lg md:text-xl tracking-tight">{store.name}</h4>
                      {store.status === 'Open' ? (
                        <span className="flex items-center text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Ouvert
                        </span>
                      ) : (
                        <span className="flex items-center text-[10px] font-black uppercase text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                          <XCircle className="w-3 h-3 mr-1" /> Fermé
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-slate-400 dark:text-slate-500 text-xs font-bold">
                      <MapPin className="w-3 h-3 mr-2 opacity-60" /> {store.location}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Manager</p>
                      <div className="flex items-center text-sm font-bold text-slate-700 dark:text-slate-300">
                        <User className="w-3 h-3 mr-2 opacity-40" /> {store.manager}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact</p>
                      <div className="flex items-center text-sm font-bold text-slate-700 dark:text-slate-300">
                        <Phone className="w-3 h-3 mr-2 opacity-40" /> {store.phone}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-[28px] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Chiffre d'Affaires</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(store.revenue)}</p>
                    </div>
                    <div className="h-10 w-px bg-slate-200 dark:bg-slate-800" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Ventes</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white text-right">{store.transactionsCount}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Store Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl overflow-hidden p-8 md:p-12"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-blue-600 rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Configuration Magasin</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-bold">Ajoutez une nouvelle succursale FlaGest</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-colors shadow-sm"
                >
                  <X className="w-6 h-6 md:w-8 md:h-8" />
                </button>
              </div>

              <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Nom du Magasin</label>
                    <input 
                      type="text" 
                      placeholder="FlaGest - Ville..."
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[20px] focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Manager</label>
                    <input 
                      type="text" 
                      placeholder="Nom complet..."
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[20px] focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Localisation (Adresse)</label>
                    <input 
                      type="text" 
                      placeholder="Avenue, Quartier, Ville..."
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[20px] focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Téléphone</label>
                    <input 
                      type="tel" 
                      placeholder="+229..."
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[20px] focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Statut Initial</label>
                    <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-[20px]">
                      <button type="button" className="flex-1 py-3 bg-white dark:bg-slate-900 rounded-[16px] text-xs font-black text-blue-600 shadow-sm uppercase tracking-widest">Ouvert</button>
                      <button type="button" className="flex-1 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Fermé</button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-[24px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-xs"
                  >
                    Annuler
                  </button>
                  <button 
                    type="button"
                    className="flex-1 py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-[0.98] text-xs"
                  >
                    Confirmer Création
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
