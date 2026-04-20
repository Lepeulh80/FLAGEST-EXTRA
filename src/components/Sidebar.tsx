import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Settings, 
  ShoppingCart, 
  Users,
  Building2,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  collapsed?: boolean;
}

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full p-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
        : "text-slate-500 hover:bg-slate-100"
    )}
  >
    <Icon className={cn("w-5 h-5", collapsed ? "mx-auto" : "mr-3")} />
    {!collapsed && <span className="font-medium">{label}</span>}
    {active && !collapsed && (
      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
    )}
  </button>
);

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar = ({ currentTab, setCurrentTab }: SidebarProps) => {
  const [collapsed] = React.useState(true);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'pos', icon: ShoppingCart, label: 'Vente' },
    { id: 'inventory', icon: Package, label: 'Stock' },
    { id: 'invoices', icon: FileText, label: 'Factures' },
    { id: 'customers', icon: Users, label: 'Clients' },
    { id: 'stores', icon: Building2, label: 'Magasins' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div 
        className={cn(
          "hidden md:flex h-screen transition-all duration-300 flex-col sticky top-0 z-20 shrink-0",
          collapsed ? "w-20" : "w-64",
          "bg-[#0f172a] dark:bg-slate-950"
        )}
      >
        <div className="p-6 flex flex-col items-center h-full">
          <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center mb-10 shadow-lg shadow-blue-500/20">
            <span className="text-white font-black text-xl">FG</span>
          </div>
          
          <nav className="flex-1 space-y-6">
            {menuItems.map((item) => (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => setCurrentTab(item.id)}
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200",
                    currentTab === item.id 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40" 
                      : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white dark:bg-slate-900 dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-800"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                </button>
                {collapsed && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="mt-auto space-y-6 flex flex-col items-center border-t border-white/5 pt-6 pb-6 dark:border-slate-800">
            <button 
              onClick={() => setCurrentTab('settings')}
              className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center transition-all",
                currentTab === 'settings' ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:text-white dark:bg-slate-900 dark:hover:text-slate-200"
              )}
            >
              <Settings className="w-5 h-5" />
            </button>
            <button className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/5 text-slate-400 hover:text-rose-400 transition-all dark:bg-slate-900">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0f172a] dark:bg-slate-950 border-t border-white/5 dark:border-slate-800 z-50 px-2 py-2 flex justify-around items-center">
        {menuItems.slice(0, 6).map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={cn(
              "flex flex-col items-center p-2 rounded-xl transition-all",
              currentTab === item.id ? "text-blue-500" : "text-slate-400 dark:text-slate-500"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-tighter mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
};
