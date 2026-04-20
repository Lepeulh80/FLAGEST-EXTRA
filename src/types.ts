export interface Product {
  id: string;
  name: string;
  description?: string;
  category: 'Electronique' | 'Quincaillerie';
  price: number;
  purchasePrice?: number;
  stock: number;
  minStockThreshold: number;
  sku: string;
  storeId: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  totalPurchases: number;
  unpaidDebt: number;
  lastVisit: any;
}

export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  category: 'Electronique' | 'Quincaillerie';
}

export interface InvoiceItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: InvoiceItem[];
  storeId: string;
  totalAmount: number;
  amountPaid: number;
  remainingDebt: number;
  status: 'Paid' | 'Partial' | 'Pending' | 'Cancelled';
  paymentMethod: string;
  createdAt: any;
  updatedAt: any;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: InvoiceItem[];
  storeId: string;
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';
  validUntil: any;
  createdAt: any;
  updatedAt: any;
}

export interface Store {
  id: string;
  name: string;
  location: string;
  manager: string;
  phone: string;
  revenue: number;
  transactionsCount: number;
  status: 'Open' | 'Closed';
}

export interface StockMovement {
  id: string;
  productId: string;
  storeId: string;
  type: 'In' | 'Out' | 'Adjustment';
  quantity: number;
  reason: string;
  date: any;
}

export interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  lowStockItems: number;
  pendingInvoices: number;
}
