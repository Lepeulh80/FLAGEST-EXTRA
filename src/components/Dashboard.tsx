import { 
  TrendingUp, 
  Package, 
  FileText, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useMemo } from 'react';

const weeklyData = [
  { name: 'Lun', sales: 4000, expenses: 2400, orders: 12 },
  { name: 'Mar', sales: 3000, expenses: 1398, orders: 15 },
  { name: 'Mer', sales: 6000, expenses: 3800, orders: 25 },
  { name: 'Jeu', sales: 2780, expenses: 3908, orders: 10 },
  { name: 'Ven', sales: 4890, expenses: 4800, orders: 18 },
  { name: 'Sam', sales: 7390, expenses: 3800, orders: 30 },
  { name: 'Dim', sales: 5490, expenses: 4300, orders: 22 },
];

const monthlyData = [
  { name: 'Sem 1', sales: 15400, expenses: 10200, orders: 65 },
  { name: 'Sem 2', sales: 18200, expenses: 11500, orders: 78 },
  { name: 'Sem 3', sales: 12900, expenses: 9800, orders: 52 },
  { name: 'Sem 4', sales: 21500, expenses: 13400, orders: 94 },
];

const categoryData = [
  { name: 'Électronique', value: 64, color: '#3b82f6' },
  { name: 'Quincaillerie', value: 26, color: '#8b5cf6' },
  { name: 'Outillage', value: 10, color: '#f59e0b' },
];

const topProducts = [
  { name: 'iPhone 13', value: 5400000, category: 'Électronique' },
  { name: 'Laptop HP', value: 4200000, category: 'Électronique' },
  { name: 'Perceuse Bosch', value: 1200000, category: 'Outillage' },
  { name: 'Câble HDMI', value: 800000, category: 'Électronique' },
  { name: 'Marteau', value: 350000, category: 'Quincaillerie' },
];

const StatCard = ({ title, value, icon: Icon, trend, color, className }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col",
      className
    )}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-2.5 rounded-xl", color)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {trend && (
        <span className={cn(
          "flex items-center text-xs font-bold px-2 py-1 rounded-lg",
          trend > 0 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400" : "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400"
        )}>
          {trend > 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="mt-auto">
      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{value}</h3>
    </div>
  </motion.div>
);

export const Dashboard = ({ storeId }: { storeId: string }) => {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const chartData = useMemo(() => {
    return period === 'weekly' ? weeklyData : monthlyData;
  }, [period]);

  const totalSales = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.sales, 0);
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex justify-between items-center gap-4">
                <span className="text-xs font-bold text-slate-300 capitalize">{entry.name === 'sales' ? 'Ventes' : 'Dépenses'} :</span>
                <span className="text-xs font-black text-white">{formatCurrency(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Vue d'Ensemble</h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Analysez vos performances sur la période sélectionnée.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 w-full md:w-auto">
          <button 
            onClick={() => setPeriod('weekly')}
            className={cn(
              "flex-1 md:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              period === 'weekly' ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Hebdomadaire
          </button>
          <button 
            onClick={() => setPeriod('monthly')}
            className={cn(
              "flex-1 md:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              period === 'monthly' ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Mensuel
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Ventes Totales" 
          value={formatCurrency(totalSales)} 
          icon={TrendingUp} 
          trend={+12.4}
          color="bg-blue-600"
        />
        <StatCard 
          title="Commandes" 
          value={chartData.reduce((sum, item) => sum + item.orders, 0)} 
          icon={FileText} 
          trend={+8.1}
          color="bg-purple-600"
        />
        <StatCard 
          title="Stock Total" 
          value="1,482" 
          icon={Package} 
          trend={-2.4}
          color="bg-orange-500"
        />
        <StatCard 
          title="Alertes" 
          value="8" 
          icon={AlertTriangle} 
          trend={+15}
          color="bg-rose-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Sales Trend Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Évolution des Flux</h3>
              <p className="text-slate-400 text-[10px] font-bold">Ventes vs Dépenses</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                <span className="text-[10px] font-bold text-slate-500">Ventes</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-slate-300 mr-2" />
                <span className="text-[10px] font-bold text-slate-500">Dépenses</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cfd8dc" strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} tickFormatter={(value) => `${value/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={4} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="expenses" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Distribution Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-8">Répartition par Catégorie</h3>
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveCategory(categoryData[index].name)}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      className="outline-none transition-all duration-300" 
                      opacity={activeCategory && activeCategory !== entry.name ? 0.3 : 1}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-2 rounded-lg text-[10px] font-bold">
                          {payload[0].name}: {payload[0].value}%
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-800 dark:text-white">100%</span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Inventaire</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.map((cat) => (
              <div 
                key={cat.name} 
                className={cn(
                  "flex items-center justify-between p-2 rounded-xl transition-colors cursor-default",
                  activeCategory === cat.name ? "bg-slate-50 dark:bg-slate-800" : ""
                )}
              >
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full mr-3" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{cat.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">{cat.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Horizontal Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Top Produits (CA)</h3>
            <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase tracking-tighter">Meilleures Perf</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#cfd8dc" strokeOpacity={0.1} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} 
                  width={80}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl">
                          <p className="text-[10px] font-black uppercase text-blue-400 mb-1">{payload[0].payload.category}</p>
                          <p className="text-xs font-bold font-mono">{formatCurrency(payload[0].value as number)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.category === 'Électronique' ? '#3b82f6' : '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Activity / Best Clients */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Activités Récentes</h3>
            <button className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="space-y-4 flex-1">
            {[
              { client: 'Entreprise TechSoud', action: 'Vente Validée', amount: 842000, color: 'text-emerald-500' },
              { client: 'M. Marc Lemoine', action: 'Facture Envoyée', amount: 125500, color: 'text-blue-500' },
              { client: 'Hardware Pro', action: 'Devis Accepté', amount: 2450000, color: 'text-purple-500' },
              { client: 'Mme. Sarah Kouamé', action: 'Remboursement', amount: -45000, color: 'text-rose-500' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all cursor-default group">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center font-bold text-slate-400 text-[10px] group-hover:scale-110 transition-transform">
                    {activity.client.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200">{activity.client}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{activity.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("text-xs font-black", activity.color)}>
                    {activity.amount > 0 ? '+' : ''}{formatCurrency(activity.amount)}
                  </p>
                  <p className="text-[8px] font-bold text-slate-400">Il y a 2h</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
