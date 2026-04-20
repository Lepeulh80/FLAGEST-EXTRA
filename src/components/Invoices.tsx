import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  Printer,
  ChevronRight,
  TrendingUp,
  Wallet,
  ClipboardList,
  FileDown,
  RefreshCw,
  Plus,
  Trash2,
  User,
  Calendar
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { Invoice, Quote } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const mockInvoices: Invoice[] = [
  { 
    id: 'f1', 
    storeId: '1',
    invoiceNumber: 'INV-2026-001', 
    customerName: 'Entreprise TechSoud', 
    customerEmail: 'contact@techsoud.ci',
    customerPhone: '+225 07 44 88 11',
    totalAmount: 842000, 
    amountPaid: 0,
    remainingDebt: 842000,
    status: 'Pending', 
    paymentMethod: 'Virement',
    createdAt: '2026-04-15 10:30',
    updatedAt: '2026-04-15 10:30',
    items: [
      { productId: '1', name: 'Smartphone Galaxy S21', quantity: 2, unitPrice: 421000, total: 842000 }
    ]
  },
  { 
    id: 'f2', 
    storeId: '1',
    invoiceNumber: 'INV-2026-002', 
    customerName: 'M. Marc Lemoine', 
    totalAmount: 125500, 
    amountPaid: 125500,
    remainingDebt: 0,
    status: 'Paid', 
    paymentMethod: 'Espèces',
    createdAt: '2026-04-18 14:20',
    updatedAt: '2026-04-18 14:20',
    items: [
      { productId: '3', name: 'Marteau 500g', quantity: 5, unitPrice: 5000, total: 25000 },
      { productId: '4', name: 'Perceuse Sans Fil', quantity: 1, unitPrice: 100500, total: 100500 }
    ]
  },
  { 
    id: 'f3', 
    storeId: '2',
    invoiceNumber: 'INV-2026-003', 
    customerName: 'BTP Construction Ivoire', 
    totalAmount: 2500000, 
    amountPaid: 1000000,
    remainingDebt: 1500000,
    status: 'Partial', 
    paymentMethod: 'Chèque',
    createdAt: '2026-04-10 09:15',
    updatedAt: '2026-04-10 09:15',
    items: [
      { productId: '4', name: 'Perceuse Sans Fil Expert', quantity: 25, unitPrice: 100000, total: 2500000 }
    ]
  },
];

const mockQuotes: Quote[] = [
  {
    id: 'q1',
    storeId: '1',
    quoteNumber: 'DEV-2026-001',
    customerName: 'Serrurerie Moderne',
    customerEmail: 'info@serrurerie.bj',
    totalAmount: 155000,
    status: 'Sent',
    validUntil: '2026-05-15',
    createdAt: '2026-04-12 11:00',
    updatedAt: '2026-04-12 11:00',
    items: [
      { productId: '3', name: 'Marteau 500g', quantity: 10, unitPrice: 5000, total: 50000 },
      { productId: '4', name: 'Perceuse Sans Fil', quantity: 1, unitPrice: 105000, total: 105000 }
    ]
  }
];

const mockProducts = [
  { id: '1', name: 'Smartphone Galaxy S21', price: 421000 },
  { id: '2', name: 'Laptop Dell XPS 13', price: 850000 },
  { id: '3', name: 'Marteau 500g', price: 5000 },
  { id: '4', name: 'Perceuse Sans Fil', price: 100500 },
];

export const Invoices = ({ storeId }: { storeId: string }) => {
  const [viewMode, setViewMode] = useState<'invoices' | 'quotes'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>(mockQuotes);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  
  // Filter Panel States
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Creation States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState<'invoice' | 'quote'>('invoice');
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    items: [{ productId: '', name: '', quantity: 1, unitPrice: 0, total: 0 }],
    paymentMethod: 'Espèces',
    amountPaid: 0,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', name: '', quantity: 1, unitPrice: 0, total: 0 }]
    });
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index] };

    if (field === 'productId') {
      const prod = mockProducts.find(p => p.id === value);
      if (prod) {
        item.productId = prod.id;
        item.name = prod.name;
        item.unitPrice = prod.price;
      }
    } else {
      (item as any)[field] = value;
    }

    item.total = item.quantity * item.unitPrice;
    newItems[index] = item;
    setFormData({ ...formData, items: newItems });
  };

  const totalAmount = formData.items.reduce((sum, item) => sum + item.total, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (createType === 'invoice') {
      const newInvoice: Invoice = {
        id: `i-${Date.now()}`,
        storeId: storeId,
        invoiceNumber: `INV-${new Date().getFullYear()}-${invoices.length + 1}`.padStart(15, '0'),
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        items: formData.items,
        totalAmount: totalAmount,
        amountPaid: formData.amountPaid,
        remainingDebt: totalAmount - formData.amountPaid,
        status: formData.amountPaid >= totalAmount ? 'Paid' : (formData.amountPaid > 0 ? 'Partial' : 'Pending'),
        paymentMethod: formData.paymentMethod,
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
      };
      setInvoices([newInvoice, ...invoices]);
      setViewMode('invoices');
    } else {
      const newQuote: Quote = {
        id: `q-${Date.now()}`,
        storeId: storeId,
        quoteNumber: `DEV-${new Date().getFullYear()}-${quotes.length + 1}`.padStart(15, '0'),
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        items: formData.items,
        totalAmount: totalAmount,
        status: 'Draft',
        validUntil: formData.validUntil,
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
      };
      setQuotes([newQuote, ...quotes]);
      setViewMode('quotes');
    }

    setIsCreateModalOpen(false);
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      items: [{ productId: '', name: '', quantity: 1, unitPrice: 0, total: 0 }],
      paymentMethod: 'Espèces',
      amountPaid: 0,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || inv.status === filterStatus;
    const matchesStore = inv.storeId === storeId;
    
    // Date filtering
    const invoiceDate = inv.createdAt.split(' ')[0]; // Assuming format 'YYYY-MM-DD HH:mm'
    const matchesStartDate = !startDate || invoiceDate >= startDate;
    const matchesEndDate = !endDate || invoiceDate <= endDate;
    
    return matchesSearch && matchesFilter && matchesStore && matchesStartDate && matchesEndDate;
  });

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          q.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || q.status === filterStatus;
    const matchesStore = q.storeId === storeId;

    // Date filtering
    const quoteDate = q.createdAt.split(' ')[0];
    const matchesStartDate = !startDate || quoteDate >= startDate;
    const matchesEndDate = !endDate || quoteDate <= endDate;
    
    return matchesSearch && matchesFilter && matchesStore && matchesStartDate && matchesEndDate;
  });

  const convertInvoiceToQuote = (invoice: Invoice) => {
    const newQuote: Quote = {
      id: `q-${Date.now()}`,
      storeId: storeId,
      quoteNumber: `DEV-${new Date().getFullYear()}-${quotes.length + 1}`.padStart(15, '0'),
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      customerPhone: invoice.customerPhone,
      items: [...invoice.items],
      totalAmount: invoice.totalAmount,
      status: 'Draft',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
    };
    setQuotes([newQuote, ...quotes]);
    setViewMode('quotes');
    alert(`Devis généré avec succès depuis la facture ${invoice.invoiceNumber}`);
  };

  const convertQuoteToInvoice = (quote: Quote) => {
    const newInvoice: Invoice = {
      id: `i-${Date.now()}`,
      storeId: storeId,
      invoiceNumber: `INV-${new Date().getFullYear()}-${invoices.length + 1}`.padStart(15, '0'),
      customerId: quote.customerId,
      customerName: quote.customerName,
      customerEmail: quote.customerEmail,
      customerPhone: quote.customerPhone,
      items: [...quote.items],
      totalAmount: quote.totalAmount,
      amountPaid: 0,
      remainingDebt: quote.totalAmount,
      status: 'Pending',
      paymentMethod: 'Non défini',
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
    };
    setInvoices([newInvoice, ...invoices]);
    setViewMode('invoices');
    alert(`Facture générée avec succès depuis le devis ${quote.quoteNumber}`);
  };

  const generatePDF = (docData: Invoice | Quote) => {
    const isInvoice = 'invoiceNumber' in docData;
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(20);
    doc.text(`FlaGest - ${isInvoice ? 'Facture' : 'Devis'}`, 20, 20);
    
    doc.setFontSize(10);
    doc.text(`N° ${isInvoice ? 'Facture' : 'Devis'}: ${isInvoice ? (docData as Invoice).invoiceNumber : (docData as Quote).quoteNumber}`, 20, 30);
    doc.text(`Date: ${docData.createdAt}`, 20, 35);
    
    // Client Info
    doc.text('Client:', 20, 50);
    doc.setFontSize(12);
    doc.text(docData.customerName, 20, 55);
    doc.setFontSize(10);
    if (docData.customerEmail) doc.text(docData.customerEmail, 20, 60);
    if (docData.customerPhone) doc.text(docData.customerPhone, 20, 65);
    
    // Table
    const tableData = docData.items.map(item => [
      item.name,
      item.quantity,
      formatCurrency(item.unitPrice),
      formatCurrency(item.total)
    ]);
    
    doc.autoTable({
      startY: 80,
      head: [['Désignation', 'Qté', 'Prix Unitaire', 'Total']],
      body: tableData,
    });
    
    // Total section
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Total: ${formatCurrency(docData.totalAmount)}`, 150, finalY);
    if (isInvoice) {
      doc.text(`Payé: ${formatCurrency((docData as Invoice).amountPaid)}`, 150, finalY + 5);
      doc.text(`Reste à payer: ${formatCurrency((docData as Invoice).remainingDebt)}`, 150, finalY + 10);
    } else {
      doc.text(`Valide jusqu'au: ${(docData as Quote).validUntil}`, 20, finalY);
    }
    
    doc.save(`${isInvoice ? (docData as Invoice).invoiceNumber : (docData as Quote).quoteNumber}.pdf`);
  };

  const handleSendEmail = (docData: Invoice | Quote) => {
    setIsSendingEmail(true);
    const num = 'invoiceNumber' in docData ? (docData as Invoice).invoiceNumber : (docData as Quote).quoteNumber;
    const type = 'invoiceNumber' in docData ? 'Facture' : 'Devis';
    // Simulate API call
    setTimeout(() => {
      setIsSendingEmail(false);
      alert(`${type} ${num} envoyée par email à ${docData.customerEmail || 'l\'adresse client'}`);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-[1400px] mx-auto pb-20 md:pb-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Facturation & Devis</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm tracking-tight mt-1">Gérez vos factures et vos devis clients en un seul endroit.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[20px] shadow-inner w-full md:w-auto">
          <button 
            onClick={() => { setCreateType(viewMode === 'invoices' ? 'invoice' : 'quote'); setIsCreateModalOpen(true); }}
            className="flex-1 md:flex-none mr-2 px-6 py-3 bg-blue-600 text-white rounded-[14px] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau {viewMode === 'invoices' ? 'Facture' : 'Devis'}</span>
          </button>
          <button 
            onClick={() => setViewMode('invoices')}
            className={cn(
              "flex-1 md:px-8 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all",
              viewMode === 'invoices' ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md" : "text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50"
            )}
          >
            Factures
          </button>
          <button 
            onClick={() => setViewMode('quotes')}
            className={cn(
              "flex-1 md:px-8 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all",
              viewMode === 'quotes' ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md" : "text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50"
            )}
          >
            Devis
          </button>
        </div>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">C.A. Global</p>
          <h3 className="text-sm md:text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(3467500)}</h3>
          <div className="flex items-center text-emerald-500 text-[8px] md:text-xs font-bold mt-2">
            <TrendingUp className="w-3 h-3 mr-1" /> +15.4%
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Dettes Clients</p>
          <h3 className="text-sm md:text-2xl font-black text-rose-600 dark:text-rose-400">{formatCurrency(2342000)}</h3>
          <p className="text-[8px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2">3 Dossiers</p>
        </div>
        <div className="hidden md:block bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Factures Payées</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">42</h3>
          <p className="text-[10px] font-bold text-emerald-500 mt-2">Recouvrement: 68%</p>
        </div>
        <div className="col-span-2 md:col-span-1 bg-blue-600 p-4 md:p-6 rounded-[24px] md:rounded-[32px] text-white shadow-xl shadow-blue-500/20 flex flex-col justify-center">
          <Wallet className="w-5 h-5 md:w-6 md:h-6 mb-2 opacity-50" />
          <p className="text-[8px] md:text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Encaissements</p>
          <h3 className="text-sm md:text-xl font-black">{formatCurrency(1125500)}</h3>
        </div>
      </div>

      {/* List Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] md:rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-slate-900 dark:text-slate-100">
        <div className="p-4 md:p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="relative flex-1 min-w-0 md:min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4 md:w-5 md:h-5" />
            <input 
              type="text" 
              placeholder="Rechercher..."
              className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 bg-white dark:bg-slate-800 border-none rounded-2xl md:rounded-3xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-sm relative",
                showFilters || filterStatus !== 'All' || startDate !== '' || endDate !== ''
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                  : "text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              )}
            >
              <Filter className="w-4 h-4 mr-2" /> 
              <span>Filtre</span>
              {(filterStatus !== 'All' || startDate !== '' || endDate !== '') && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
              )}
            </button>
            <button 
              onClick={() => {
                setCreateType(viewMode === 'invoices' ? 'invoice' : 'quote');
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center space-x-2 shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{viewMode === 'invoices' ? 'Nouvelle Facture' : 'Nouveau Devis'}</span>
              <span className="sm:hidden">{viewMode === 'invoices' ? 'Facture' : 'Devis'}</span>
            </button>
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
                  className="absolute right-4 md:right-8 top-[calc(100%+8px)] w-80 bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl border border-slate-100 dark:border-slate-800 p-6 z-20 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Filtres Dynamiques</h4>
                    <button 
                      onClick={() => {
                        setFilterStatus('All');
                        setStartDate('');
                        setEndDate('');
                      }}
                      className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                    >
                      Réinitialiser
                    </button>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Statut</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(viewMode === 'invoices' ? ['All', 'Paid', 'Partial', 'Pending'] : ['All', 'Draft', 'Sent', 'Accepted', 'Rejected']).map((status) => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={cn(
                            "px-3 py-2 rounded-xl text-[10px] font-bold transition-all",
                            filterStatus === status 
                              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900" 
                              : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                          )}
                        >
                          {status === 'All' ? 'Tous' : status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Période</label>
                    <div className="space-y-2">
                      <div className="flex bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 items-center border border-slate-100 dark:border-slate-700">
                        <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                        <input 
                          type="date" 
                          className="bg-transparent border-none text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 outline-none w-full"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div className="flex bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 items-center border border-slate-100 dark:border-slate-700">
                        <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                        <input 
                          type="date" 
                          className="bg-transparent border-none text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 outline-none w-full"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowFilters(false)}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                  >
                    Appliquer les filtres
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px] md:min-w-0">
            <thead>
              <tr className="bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-50 dark:border-slate-800">
                <th className="px-6 py-4 md:px-8 md:py-6">{viewMode === 'invoices' ? 'Facture' : 'Devis'}</th>
                <th className="px-6 py-4 md:px-8 md:py-6">Client</th>
                <th className="px-6 py-4 md:px-8 md:py-6 hidden sm:table-cell">Total</th>
                <th className="px-6 py-4 md:px-8 md:py-6">{viewMode === 'invoices' ? 'Reste' : 'Validité'}</th>
                <th className="px-6 py-4 md:px-8 md:py-6 hidden md:table-cell">Status</th>
                <th className="px-6 py-4 md:px-8 md:py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {(viewMode === 'invoices' ? filteredInvoices : filteredQuotes).map((doc) => {
                const isInv = 'invoiceNumber' in doc;
                return (
                  <tr key={doc.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 md:px-8 md:py-6">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center transition-colors",
                          isInv ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                        )}>
                          {isInv ? <FileText className="w-4 h-4 md:w-5 md:h-5" /> : <ClipboardList className="w-4 h-4 md:w-5 md:h-5" />}
                        </div>
                        <div>
                          <span className="font-black text-slate-800 dark:text-slate-200 text-[10px] md:text-sm">{isInv ? (doc as Invoice).invoiceNumber : (doc as Quote).quoteNumber}</span>
                          <p className="text-[8px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500">{doc.createdAt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 md:px-8 md:py-6">
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-xs md:text-sm truncate max-w-[100px] md:max-w-none inline-block">{doc.customerName}</span>
                    </td>
                    <td className="px-6 py-4 md:px-8 md:py-6 font-black text-slate-900 dark:text-white hidden sm:table-cell text-xs md:text-sm">{formatCurrency(doc.totalAmount)}</td>
                    <td className="px-6 py-4 md:px-8 md:py-6">
                      {isInv ? (
                        <span className={cn(
                          "font-black text-[10px] md:text-sm",
                          (doc as Invoice).remainingDebt > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                        )}>
                          {(doc as Invoice).remainingDebt > 0 ? formatCurrency((doc as Invoice).remainingDebt) : 'Soldé'}
                        </span>
                      ) : (
                        <div className="flex items-center text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-bold">
                          <Clock className="w-3 h-3 mr-1.5 opacity-60" />
                          {(doc as Quote).validUntil}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 md:px-8 md:py-6 hidden md:table-cell">
                      <span className={cn(
                        "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                        doc.status === 'Paid' || doc.status === 'Accepted' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" :
                        doc.status === 'Partial' || doc.status === 'Sent' ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" :
                        "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
                      )}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 md:px-8 md:py-6 text-right space-x-1 md:space-x-2">
                      <button 
                        onClick={() => isInv ? setSelectedInvoice(doc as Invoice) : setSelectedQuote(doc as Quote)}
                        className="p-2 md:p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl md:rounded-2xl transition-all"
                      >
                        <Eye className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                      <button 
                        onClick={() => generatePDF(doc)}
                        className="p-2 md:p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-900 dark:hover:bg-slate-100 hover:text-white dark:hover:text-slate-900 rounded-xl md:rounded-2xl transition-all"
                      >
                        <Download className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Overlay */}
      <AnimatePresence>
        {(selectedInvoice || selectedQuote) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => { setSelectedInvoice(null); setSelectedQuote(null); }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[32px] md:rounded-[48px] shadow-2xl overflow-hidden flex flex-col h-full md:h-auto max-h-[100vh] md:max-h-[90vh]"
            >
              {(() => {
                const doc = selectedInvoice || selectedQuote;
                if (!doc) return null;
                const isInv = 'invoiceNumber' in doc;
                
                return (
                  <>
                    <div className="p-6 md:p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                      <div className="flex items-center">
                        <div className={cn(
                          "w-10 h-10 md:w-14 md:h-14 bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl shadow-sm flex items-center justify-center mr-4 md:mr-5",
                          isInv ? "text-blue-600 dark:text-blue-400" : "text-purple-600 dark:text-purple-400"
                        )}>
                          {isInv ? <FileText className="w-5 h-5 md:w-7 md:h-7" /> : <ClipboardList className="w-5 h-5 md:w-7 md:h-7" />}
                        </div>
                        <div>
                          <h3 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {isInv ? (doc as Invoice).invoiceNumber : (doc as Quote).quoteNumber}
                          </h3>
                          <p className="text-slate-400 dark:text-slate-500 font-bold text-[8px] md:text-xs uppercase tracking-widest mt-1">
                            {isInv ? 'Détails de la facture' : 'Détails du devis'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 md:space-x-4">
                        <button 
                          onClick={() => {
                            if (isInv) convertInvoiceToQuote(doc as Invoice);
                            else convertQuoteToInvoice(doc as Quote);
                            setSelectedInvoice(null);
                            setSelectedQuote(null);
                          }}
                          className="hidden md:flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>{isInv ? 'Générer Devis' : 'Générer Facture'}</span>
                        </button>
                        <button 
                          onClick={() => { setSelectedInvoice(null); setSelectedQuote(null); }}
                          className="p-2 md:p-3 hover:bg-white dark:hover:bg-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 transition-colors shadow-sm"
                        >
                          <X className="w-5 h-5 md:w-7 md:h-7" />
                        </button>
                      </div>
                    </div>

                    <div className="p-6 md:p-10 flex-1 overflow-y-auto space-y-8 md:space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Client</h4>
                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-[24px] md:rounded-[32px] space-y-4 text-sm md:text-base">
                              <p className="font-black text-slate-800 dark:text-slate-200">{doc.customerName}</p>
                              {doc.customerEmail && (
                                <div className="flex items-center text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400">
                                  <Mail className="w-4 h-4 mr-3 opacity-60 text-slate-500 dark:text-slate-400" /> {doc.customerEmail}
                                </div>
                              )}
                              <div className="flex items-center text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400">
                                <Clock className="w-4 h-4 mr-3 opacity-60 text-slate-500 dark:text-slate-400" /> {doc.createdAt}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-6">
                          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                            {isInv ? 'Finance' : 'Validité'}
                          </h4>
                          <div className={cn("grid grid-cols-2 gap-3 md:gap-4", !isInv && "grid-cols-1")}>
                            <div className={cn(
                              "p-4 md:p-6 rounded-[24px] md:rounded-[32px] text-white",
                              isInv ? "bg-blue-600" : "bg-purple-600"
                            )}>
                              <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Total</p>
                              <p className="text-sm md:text-xl font-black">{formatCurrency(doc.totalAmount)}</p>
                            </div>
                            {isInv ? (
                              <div className="bg-slate-900 dark:bg-slate-950 p-4 md:p-6 rounded-[24px] md:rounded-[32px] text-white">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Payé</p>
                                <p className="text-sm md:text-xl font-black">{formatCurrency((doc as Invoice).amountPaid)}</p>
                              </div>
                            ) : (
                              <div className="bg-slate-900 dark:bg-slate-950 p-4 md:p-6 rounded-[24px] md:rounded-[32px] text-white">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Valide jusqu'au</p>
                                <p className="text-sm md:text-xl font-black">{(doc as Quote).validUntil}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Articles</h4>
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[24px] md:rounded-[32px] overflow-hidden">
                          <table className="w-full text-xs md:text-sm">
                            <thead>
                              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 border-b border-slate-50 dark:border-slate-800">
                                <th className="px-4 py-4 md:px-8 text-left">Article</th>
                                <th className="px-4 py-4 md:px-8 text-center sm:table-cell hidden">Qté</th>
                                <th className="px-4 py-4 md:px-8 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                              {doc.items.map((item, idx) => (
                                <tr key={idx}>
                                  <td className="px-4 py-4 md:px-8 font-bold text-slate-800 dark:text-slate-200">
                                    {item.name}
                                    <p className="sm:hidden text-[10px] text-slate-400 dark:text-slate-500">Qté: {item.quantity}</p>
                                  </td>
                                  <td className="px-4 py-4 md:px-8 text-center font-bold text-slate-600 dark:text-slate-400 hidden sm:table-cell">{item.quantity}</td>
                                  <td className="px-4 py-4 md:px-8 text-right font-black text-slate-900 dark:text-white">{formatCurrency(item.total)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 md:p-10 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row gap-3 md:gap-4">
                      <button 
                        onClick={() => {
                          if (isInv) convertInvoiceToQuote(doc as Invoice);
                          else convertQuoteToInvoice(doc as Quote);
                          setSelectedInvoice(null);
                          setSelectedQuote(null);
                        }}
                        className="md:hidden w-full py-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-[20px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-3 text-[10px]"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>{isInv ? 'Générer Devis' : 'Générer Facture'}</span>
                      </button>
                      <button 
                        onClick={() => generatePDF(doc)}
                        className="w-full md:flex-1 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-[20px] md:rounded-3xl font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center space-x-3 shadow-sm text-[10px] md:text-sm"
                      >
                        <Printer className="w-4 h-4 md:w-5 md:h-5 text-slate-900 dark:text-slate-100" />
                        <span>Imprimer PDF</span>
                      </button>
                      <button 
                        onClick={() => handleSendEmail(doc)}
                        disabled={isSendingEmail}
                        className="w-full md:flex-1 py-4 bg-blue-600 text-white rounded-[20px] md:rounded-3xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center space-x-3 shadow-xl shadow-blue-600/20 disabled:opacity-50 text-[10px] md:text-sm"
                      >
                        <Mail className={cn("w-4 h-4 md:w-5 md:h-5", isSendingEmail && "animate-spin")} />
                        <span>{isSendingEmail ? 'Envoi...' : 'Par Email'}</span>
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Creation Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsCreateModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[32px] md:rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
            >
              <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center">
                  <div className={cn(
                    "w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mr-4",
                    createType === 'invoice' ? "text-blue-600" : "text-purple-600"
                  )}>
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight capitalize">
                      Nouveau {createType === 'invoice' ? 'Facture' : 'Devis'}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                      Remplissez les informations ci-dessous
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 md:p-8 overflow-y-auto flex-1 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Client</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="text" 
                        placeholder="Nom du client"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-xs md:text-sm font-bold"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        placeholder="email@exemple.com"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-xs md:text-sm font-bold"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Téléphone</label>
                    <input 
                      type="text" 
                      placeholder="+225 ..."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-xs md:text-sm font-bold"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Articles</label>
                    <button 
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center space-x-2 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Ajouter un article</span>
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex flex-col md:flex-row gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                        <div className="flex-1 min-w-[200px]">
                          <select 
                            required
                            className="w-full h-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100"
                            value={item.productId}
                            onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                          >
                            <option value="">Sélectionner un produit</option>
                            {mockProducts.map(p => (
                              <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-full md:w-24">
                          <input 
                            required
                            type="number"
                            min="1"
                            placeholder="Qté"
                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="w-full md:w-32">
                          <input 
                            required
                            type="number"
                            placeholder="Prix Unitaire"
                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="flex items-center space-x-3 w-full md:w-auto">
                          <div className="flex-1 md:w-32 px-4 py-3 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs md:text-sm font-black text-slate-800 dark:text-slate-200">
                            {formatCurrency(item.total)}
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-50 dark:border-slate-800">
                  <div className="space-y-6">
                    {createType === 'invoice' ? (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Méthode de paiement</label>
                          <select 
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none text-xs md:text-sm font-bold"
                            value={formData.paymentMethod}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                          >
                            <option value="Espèces">Espèces</option>
                            <option value="Virement">Virement</option>
                            <option value="Chèque">Chèque</option>
                            <option value="Mobile Money">Mobile Money</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Montant Versé</label>
                          <input 
                            type="number"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none text-xs md:text-sm font-bold"
                            value={formData.amountPaid}
                            onChange={(e) => setFormData({ ...formData, amountPaid: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Valide jusqu'au</label>
                        <input 
                          type="date"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none text-xs md:text-sm font-bold"
                          value={formData.validUntil}
                          onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                        />
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-900 rounded-[24px] md:rounded-[32px] p-6 md:p-8 text-white flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Global</span>
                      <span className="text-2xl font-black">{formatCurrency(totalAmount)}</span>
                    </div>
                    {createType === 'invoice' && (
                      <div className="flex justify-between items-center text-rose-400 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest">Reste à payer</span>
                        <span className="text-sm font-bold">{formatCurrency(totalAmount - formData.amountPaid)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4 pt-4 pb-4">
                  <button 
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-xs md:text-sm"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className={cn(
                      "flex-1 py-4 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all text-xs md:text-sm",
                      createType === 'invoice' ? "bg-blue-600 shadow-blue-500/20 hover:bg-blue-700" : "bg-purple-600 shadow-purple-500/20 hover:bg-purple-700"
                    )}
                  >
                    Enregistrer le {createType === 'invoice' ? 'Facture' : 'Devis'}
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
