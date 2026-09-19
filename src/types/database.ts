// ============================================================
// Isha Vastram — TypeScript Types matching the SQL schema
// All types use snake_case to match PostgreSQL column names
// ============================================================

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_price: number | null;
  images: string[];
  category: string;
  tags: string[];
  color: string | null;
  stock: number;
  sold: number;
  share_count: number;      // 🔄 Viral Loop
  status: 'active' | 'draft';
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  pincode: string | null;
  total_orders: number;
  total_spent: number;
  last_order_date: string | null;
  last_contacted_at: string | null;  // 🔄 Re-engagement Loop
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number | null;
  times_used: number;
  min_order: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_id: string;
  customer_id: string;
  coupon_id: string | null;       // 🔄 Post-Purchase Loop
  subtotal: number;
  discount_amount: number;        // 🔄 Amount saved via coupon
  shipping: number;
  total: number;
  status: 'received' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  whatsapp_sent: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations (from Supabase select with relationships)
  customer?: Customer;
  items?: OrderItem[];
  coupon?: Coupon;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  photo_url: string | null;       // 🔄 Social Proof Loop
  review_text: string | null;
  rating: number | null;
  product_id: string | null;
  is_approved: boolean;
  created_at: string;
  // Joined
  product?: Pick<Product, 'id' | 'name' | 'images'>;
}

export interface RestockRequest {
  id: string;
  product_id: string;
  phone: string;
  notified: boolean;              // 🔄 Restock Notification Loop
  created_at: string;
  // Joined
  product?: Pick<Product, 'id' | 'name' | 'images' | 'stock'>;
}

// ============================================================
// API Response types
// ============================================================
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ============================================================
// Cart types (client-side only, stored in localStorage)
// ============================================================
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;  // Max available
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  coupon: {
    code: string;
    discountPercent: number;
    discountAmount: number;
  } | null;
  total: number;
}

// ============================================================
// Admin dashboard types
// ============================================================
export interface DashboardStats {
  totalRevenue: number;
  ordersToday: number;
  totalProducts: number;
  lowStockAlerts: number;
}

export interface LoopKPIs {
  totalShareClicks: number;
  topSharedProducts: Pick<Product, 'id' | 'name' | 'share_count'>[];
  couponRedemptions: number;
  revenueFromCoupons: number;
  reviewsCollected: number;
  approvedReviews: number;
  pendingReviews: number;
  restockRequestsActive: number;
  customersContacted: number;
  repeatPurchaseRate: number;  // percentage
}

export type OrderStatus = Order['status'];
export type ProductStatus = Product['status'];
