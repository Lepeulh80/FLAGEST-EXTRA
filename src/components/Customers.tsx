import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronRight, 
  ArrowUpRight, 
  Building2,
  Filter,
  MoreVertical,
  Briefcase
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { Customer, Supplier } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const mockCustomers: Customer[] = [
  { id: '1', name: 'M. Marc Lemoine', email: 'marc.lemoine@email.com', phone: '06 12 34 56 78', address: 'Abidjan, Cocody', totalPurchases: 1250000, unpaidDebt: 0, lastVisit: '2026-04-18' },
  { id: '2', name: 'Entreprise TechSoud', email: 'contact@techsoud.ci', phone: '+225 07 44 88 11', address: 'San Pedro, Zone Industrielle', totalPurchases: 4500000, unpaidDebt: 842000, lastVisit: '2026-04-15' },
  { id: '3', name: 'Mme. Sarah Kouamé', email: 'sarah.k@gmail.com', phone: '01 02 03 04 05', address: 'Abidjan, Marcory', totalPurchases: 85000, unpaidDebt: 0, lastVisit: '2026-04-19' },
  { id: '4', name: 'BTP Construction Ivoire', phone: '+225 21 34 56 78', address: 'Yamoussoukro', totalPurchases: 15600000, unpaidDebt: 2500000, lastVisit: '2026-04-10' },
];

const mockSuppliers: Supplier[] = [
  { id: 's1', name: 'Global Electronics Co', contactName: 'John Doe', email: 'sales@globalelec.com', phone: '+86 123 4567 890', category: 'Electronique' },
  { id: 's2', name: 'Quincaillerie du Port', contactName: 'Ahmed Sylla', email: 'ahmed@quinport.ci', phone: '+225 05 55 44 33', category: 'Quincaillerie' },
];

export const Customers = ({ storeId }: { storeId: string }) => {
  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Debtors'>('All');

  const filteredCustomers = mockCustomers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (c.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          c.phone?.includes(searchTerm);
    const matchesFilter = selectedFilter === 'All' || c.unpaidDebt > 0;
    return matchesSearch && matchesFilter;
  });

  const filteredSuppliers = mockSuppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.contactName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">CRM & Contacts</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Gérez vos relations clients et fournisseurs.</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold flex items-center space-x-2 shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all text-sm uppercase tracking-widest">
          <UserPlus className="w-4 h-4" />
          <span>Ajouter {activeTab === 'customers' ? 'un client' : 'un fournisseur'}</span>
        </button>
      </header>

      {/* Navigation Tabs */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('customers')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
            activeTab === 'customers' ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          )}
        >
          Clients
        </button>
        <button 
          onClick={() => setActiveTab('suppliers')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
            activeTab === 'suppliers' ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          )}
        >
          Fournisseurs
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        {/* Left Column: Search & Quick Metrics */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Recherche rapide</h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {activeTab === 'customers' && (
              <div className="pt-2 md:pt-4 space-y-2 flex flex-row lg:flex-col gap-2">
                <button 
                  onClick={() => setSelectedFilter('All')}
                  className={cn(
                    "flex-1 lg:w-full flex items-center justify-between px-3 md:px-4 py-3 rounded-2xl text-[8px] md:text-xs font-black uppercase tracking-wider transition-all",
                    selectedFilter === 'All' ? "bg-blue-600 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  )}
                >
                  <span className="hidden sm:inline">Tous les clients</span>
                  <span className="sm:hidden">TOUS</span>
                  <Users className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => setSelectedFilter('Debtors')}
                  className={cn(
                    "flex-1 lg:w-full flex items-center justify-between px-3 md:px-4 py-3 rounded-2xl text-[8px] md:text-xs font-black uppercase tracking-wider transition-all",
                    selectedFilter === 'Debtors' ? "bg-rose-500 text-white" : "bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40"
                  )}
                >
                  <span className="hidden sm:inline">Clients endettés</span>
                  <span className="sm:hidden">DETTES</span>
                  <AlertCircle className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="bg-blue-600 p-8 rounded-[32px] text-white shadow-xl shadow-blue-500/20 hidden lg:block">
            <h4 className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Impact CRM</h4>
            <p className="text-3xl font-black mb-4">+18%</p>
            <p className="text-xs font-medium text-blue-100 leading-relaxed">Croissance de la fidélité client sur les 30 derniers jours.</p>
          </div>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-3">
          {activeTab === 'customers' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCustomers.map((customer) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={customer.id}
                  className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mr-4 text-slate-400 dark:text-slate-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{customer.name}</h3>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Client Fidèle</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-300 dark:text-slate-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 font-bold">
                      <Mail className="w-3.5 h-3.5 mr-2 opacity-50" />
                      {customer.email || 'Email non fourni'}
                    </div>
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 font-bold">
                      <Phone className="w-3.5 h-3.5 mr-2 opacity-50" />
                      {customer.phone || 'Tel non fourni'}
                    </div>
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 font-bold">
                      <MapPin className="w-3.5 h-3.5 mr-2 opacity-50" />
                      {customer.address}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Volume d'achats</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(customer.totalPurchases)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Dette</p>
                      <p className={cn(
                        "text-sm font-black",
                        customer.unpaidDebt > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                      )}>
                        {customer.unpaidDebt > 0 ? formatCurrency(customer.unpaidDebt) : 'À jour'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSuppliers.map((supplier) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={supplier.id}
                  className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mr-4 text-slate-400 dark:text-slate-500 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-white">{supplier.name}</h3>
                        <p className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          supplier.category === 'Electronique' ? "text-blue-500 dark:text-blue-400" : "text-purple-500 dark:text-purple-400"
                        )}>
                          Fournisseur {supplier.category}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 font-bold">
                      <Briefcase className="w-3.5 h-3.5 mr-2 opacity-50" />
                      Contact: {supplier.contactName}
                    </div>
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 font-bold">
                      <Mail className="w-3.5 h-3.5 mr-2 opacity-50" />
                      {supplier.email}
                    </div>
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 font-bold">
                      <Phone className="w-3.5 h-3.5 mr-2 opacity-50" />
                      {supplier.phone}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <button className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-transparent dark:border-slate-700">Historique Achats</button>
                    <button className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all">Nvelle Commande</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import { AlertCircle } from 'lucide-react';
