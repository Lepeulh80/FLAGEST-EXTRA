import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { POS } from './components/POS';
import { Inventory } from './components/Inventory';
import { Customers } from './components/Customers';
import { Invoices } from './components/Invoices';
import { Stores } from './components/Stores';
import { formatCurrency, cn } from './lib/utils';
import { Search, Bell, User, Sparkles, Moon, Sun, LogOut, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Login } from './components/Login';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [currentStore, setCurrentStore] = useState('Cotonou Centre');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard': return <Dashboard storeId={currentStore === 'Cotonou Centre' ? '1' : currentStore === 'Porto-Novo' ? '2' : '3'} />;
      case 'pos': return <POS storeId={currentStore === 'Cotonou Centre' ? '1' : currentStore === 'Porto-Novo' ? '2' : '3'} />;
      case 'inventory': return <Inventory storeId={currentStore === 'Cotonou Centre' ? '1' : currentStore === 'Porto-Novo' ? '2' : '3'} />;
      case 'customers': return <Customers storeId={currentStore === 'Cotonou Centre' ? '1' : currentStore === 'Porto-Novo' ? '2' : '3'} />;
      case 'invoices': return <Invoices storeId={currentStore === 'Cotonou Centre' ? '1' : currentStore === 'Porto-Novo' ? '2' : '3'} />;
      case 'stores': return <Stores />;
      default: return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
          <Sparkles className="w-16 h-16 opacity-20" />
          <h2 className="text-xl font-bold">Fonctionnalité en cours de développement</h2>
          <p>L'équipe FlaGest travaille dur pour vous offrir cette fonctionnalité très bientôt.</p>
        </div>
      );
    }
  };

  return (
    <div className={cn(
      "flex flex-col md:flex-row min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900 pb-20 md:pb-0 transition-colors duration-300",
      isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    )}>
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <nav className={cn(
          "h-16 md:h-20 border-b px-4 md:px-8 flex items-center justify-between shrink-0 transition-colors duration-300",
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}>
          <div className="flex items-center space-x-4 flex-1">
            <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
              <Building2 className="w-4 h-4 text-blue-600 mr-3" />
              <select 
                className="bg-transparent border-none outline-none text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white cursor-pointer"
                value={currentStore}
                onChange={(e) => setCurrentStore(e.target.value)}
              >
                <option value="Cotonou Centre">Cotonou Centre</option>
                <option value="Porto-Novo">Porto-Novo</option>
                <option value="Parakou">Parakou (Fermé)</option>
              </select>
            </div>

            <div className="flex-1 max-w-sm ml-4">
              <div className="relative group">
                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 md:w-5 md:h-5 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Recherche..."
                  className={cn(
                    "w-full pl-10 md:pl-12 pr-4 py-2 border-none rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                    isDarkMode ? "bg-slate-800 text-slate-100 placeholder:text-slate-500" : "bg-slate-100 text-slate-900"
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 md:space-x-6 ml-4">
            <button 
              onClick={toggleDarkMode}
              className={cn(
                "p-2 rounded-xl transition-all hover:scale-110",
                isDarkMode ? "bg-slate-800 text-amber-400 hover:bg-slate-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              )}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button className={cn(
              "relative p-2 rounded-xl transition-all group",
              isDarkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-50"
            )}>
              <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full" />
            </button>
            <div className={cn("h-6 w-px hidden sm:block", isDarkMode ? "bg-slate-800" : "bg-slate-200")} />
            <div className="flex items-center space-x-3 cursor-pointer group relative">
              <div className="text-right hidden lg:block">
                <p className={cn("text-sm font-bold transition-colors", isDarkMode ? "text-slate-200 group-hover:text-blue-400" : "text-slate-800 group-hover:text-blue-600")}>{currentUser?.name || 'Utilisateur'}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentUser?.role || 'Staff'}</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform" onClick={handleLogout}>
                <LogOut className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </div>
        </nav>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth pb-32 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
