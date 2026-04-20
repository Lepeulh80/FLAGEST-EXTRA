import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  User,
  ShoppingBag,
  Zap,
  Hammer,
  Mail,
  Phone
} from 'lucide-react';
import { formatCurrency, cn, generateInvoiceNumber } from '../lib/utils';
import { Product, InvoiceItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const mockProducts: Product[] = [
  { id: '1', storeId: '1', name: 'Smartphone Galaxy S21', category: 'Electronique', price: 450000, stock: 5, sku: 'S21-450', minStockThreshold: 2 },
  { id: '2', storeId: '1', name: 'Laptop Dell XPS 13', category: 'Electronique', price: 850000, stock: 3, sku: 'XPS-13-850', minStockThreshold: 1 },
  { id: '3', storeId: '2', name: 'Marteau 500g', category: 'Quincaillerie', price: 5000, stock: 50, sku: 'MART-500', minStockThreshold: 10 },
  { id: '4', storeId: '2', name: 'Perceuse Sans Fil', category: 'Quincaillerie', price: 75000, stock: 12, sku: 'PERC-75', minStockThreshold: 3 },
  { id: '5', storeId: '1', name: 'Écouteurs Bluetooth', category: 'Electronique', price: 25000, stock: 25, sku: 'EC-BLUE', minStockThreshold: 5 },
  { id: '6', storeId: '2', name: 'Set de Tournevis', category: 'Quincaillerie', price: 12000, stock: 15, sku: 'TOUR-12', minStockThreshold: 4 },
];

export const POS = ({ storeId }: { storeId: string }) => {
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'All' | 'Electronique' | 'Quincaillerie'>('All');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Espèces');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [showCartMobile, setShowCartMobile] = useState(false);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
            : item
        );
      }
      return [...prev, { 
        productId: product.id, 
        name: product.name, 
        quantity: 1, 
        unitPrice: product.price, 
        total: product.price 
      }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, total: newQty * item.unitPrice };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.productId !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.total, 0);

  const filteredProducts = mockProducts.filter(p => 
    p.storeId === storeId &&
    (filter === 'All' || p.category === filter) &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row h-full lg:h-[calc(100vh-10rem)] gap-8 relative">
      {/* Search & Products Area */}
      <div className={cn(
        "flex-1 flex flex-col space-y-6 overflow-hidden transition-all duration-300",
        showCartMobile ? "hidden lg:flex" : "flex"
      )}>
        <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Produit..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-900 dark:text-slate-100 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar">
            {['All', 'Electronique', 'Quincaillerie'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={cn(
                  "px-3 py-2 rounded-xl text-[10px] md:text-sm font-black uppercase whitespace-nowrap transition-all",
                  filter === f ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                {f === 'All' ? 'Tous' : f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 pb-20 lg:pb-4">
          {filteredProducts.map((product) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white dark:bg-slate-900 p-3 md:p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg dark:hover:shadow-blue-900/10 hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer group flex flex-col"
            >
              <div className="flex justify-between items-start mb-3 md:mb-4">
                <div className={cn(
                  "p-2 md:p-3 rounded-xl",
                  product.category === 'Electronique' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                )}>
                  {product.category === 'Electronique' ? <Zap className="w-5 h-5 md:w-6 md:h-6" /> : <Hammer className="w-5 h-5 md:w-6 md:h-6" />}
                </div>
                <span className="text-[8px] md:text-xs font-black bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-2 py-1 rounded-lg">
                  {product.stock}U
                </span>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs md:text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[2.5rem]">{product.name}</h4>
              <p className="text-lg md:text-xl font-black text-slate-900 dark:text-white mt-2">{formatCurrency(product.price)}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cart Area */}
      <div className={cn(
        "bg-white dark:bg-slate-950 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 z-10",
        "lg:w-96",
        showCartMobile ? "fixed inset-0 m-0 rounded-none z-50 flex" : "hidden lg:flex"
      )}>
        <div className="p-6 border-b border-slate-50 dark:border-slate-900/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              {showCartMobile && (
                <button onClick={() => setShowCartMobile(false)} className="mr-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-full">
                  <Minus className="w-6 h-6 rotate-90 text-slate-900 dark:text-slate-100" />
                </button>
              )}
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center">
                <ShoppingBag className="w-6 h-6 mr-2 text-blue-600" /> Panier
              </h3>
            </div>
            <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">
              {cart.length} ARTICLES
            </span>
          </div>
          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Nom du client..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="email" 
                  placeholder="Email..."
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="tel" 
                  placeholder="Tel..."
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>
            
            <div className="pt-2">
              <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Paiement</h4>
              <div className="grid grid-cols-2 gap-2">
                {['Espèces', 'Mobile Money', 'Chèque', 'Virement'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={cn(
                      "py-2 rounded-xl text-[10px] font-bold border transition-all",
                      paymentMethod === m 
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md" 
                        : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-4 pt-4">
          <AnimatePresence initial={false}>
            {cart.map((item) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                key={item.productId}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all group"
              >
                <div className="flex-1 mr-4">
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200 line-clamp-1">{item.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{formatCurrency(item.unitPrice)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                    <button 
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                    >
                      <Minus className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                    </button>
                    <span className="px-3 text-xs font-black text-slate-800 dark:text-slate-200">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                    >
                      <Plus className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeItem(item.productId)}
                    className="p-2 text-rose-500 bg-rose-50 dark:bg-rose-900/20 md:opacity-0 md:group-hover:opacity-100 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 space-y-4 opacity-50">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <p className="text-sm font-black uppercase tracking-widest">Panier vide</p>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-6 text-slate-900 dark:text-slate-100">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Montant Versé</span>
                <input 
                  type="number"
                  className="w-32 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-right text-lg font-black text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                />
              </div>
              <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
                <span className="text-[10px] font-black uppercase tracking-widest">Dette Restante</span>
                <span className="text-lg font-black">{formatCurrency(Math.max(0, total - amountPaid))}</span>
              </div>
            </div>

            <div className="flex justify-between text-2xl font-black text-slate-900 dark:text-white pt-4 border-t border-slate-200 dark:border-slate-700">
              <span className="text-sm self-center text-slate-400 dark:text-slate-500">TOTAL</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <button 
            disabled={cart.length === 0}
            className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest flex items-center justify-center space-x-3 shadow-2xl shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
          >
            <CreditCard className="w-6 h-6" />
            <span>Valider la Vente</span>
          </button>
        </div>
      </div>

      {/* Mobile Cart Floating Button */}
      <button 
        onClick={() => setShowCartMobile(true)}
        className={cn(
          "lg:hidden fixed bottom-24 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 transition-all active:scale-90",
          cart.length > 0 ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        <ShoppingBag className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
          {cart.length}
        </span>
      </button>
    </div>
  );
};
