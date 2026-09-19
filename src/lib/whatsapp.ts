import { CartItem } from '@/types/database';

const ADMIN_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER || '919876543210';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ============================================================
// Build wa.me URL with encoded message
// ============================================================
function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

// ============================================================
// 🔄 Order notification → Admin (New order placed)
// ============================================================
export function buildAdminOrderMessage(params: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  pincode: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  shipping: number;
  total: number;
  couponCode?: string;
}): string {
  const { orderId, customerName, customerPhone, address, city, pincode, items, subtotal, discountAmount, shipping, total, couponCode } = params;

  const itemLines = items
    .map((item, i) => `${i + 1}. ${item.name} × ${item.quantity} — ₹${(item.price * item.quantity).toLocaleString('en-IN')}`)
    .join('\n');

  const couponLine = couponCode ? `\n🎟️ Coupon: ${couponCode} (−₹${discountAmount.toLocaleString('en-IN')})` : '';

  return `🆕 New Order - Isha Vastram!

📦 Order ID: ${orderId}
👤 Customer: ${customerName}
📱 Phone: +${customerPhone}
📍 Address: ${address}, ${city} - ${pincode}

🛒 Items:
${itemLines}

💰 Subtotal: ₹${subtotal.toLocaleString('en-IN')}${couponLine}
🚚 Shipping: ₹${shipping.toLocaleString('en-IN')}
✅ Total: ₹${total.toLocaleString('en-IN')}

📝 Status: Received
Please confirm the order!`;
}

// ============================================================
// 🔄 Order confirmation → Customer
// ============================================================
export function buildCustomerOrderMessage(params: {
  orderId: string;
  total: number;
}): string {
  const { orderId, total } = params;
  return `Hi! I just placed Order #${orderId} on Isha Vastram for ₹${total.toLocaleString('en-IN')}. Please confirm. 🙏`;
}

// ============================================================
// 🔄 Viral Loop — "Share this saree" message
// ============================================================
export function buildShareSareeMessage(params: {
  sareeName: string;
  sareeId: string;
}): string {
  const { sareeName, sareeId } = params;
  const url = `${APP_URL}/saree/${sareeId}`;
  return `✨ Look at this beautiful *${sareeName}* from Isha Vastram!\n\nPure cotton, handloom crafted sarees at amazing prices! 🌸\n\n👉 ${url}\n\nUse code *ISHA10* for 10% off your first order! 🎁`;
}

// ============================================================
// 🔄 Post-Purchase Loop — "Share your coupon" message
// ============================================================
export function buildShareCouponMessage(params: {
  couponCode: string;
}): string {
  const { couponCode } = params;
  return `🎉 I just bought a beautiful saree from Isha Vastram!\n\nUse my code *${couponCode}* and get 10% off your order too! 🌸\n\n👉 ${APP_URL}/collection\n\nShop pure cotton handloom sarees from Isha Vastram!`;
}

// ============================================================
// 🔄 Social Proof Loop — "Send us your photo" message
// ============================================================
export function buildReviewRequestMessage(customerName: string): string {
  return `Hi ${customerName}! 🌸\n\nWe hope you are loving your new saree from Isha Vastram!\n\nWould you like to be featured on our website? Just send us a photo of you wearing your saree and we'll add it to our Happy Customers section! 📸\n\nThank you for shopping with us! 🙏`;
}

// ============================================================
// 🔄 Re-engagement Loop — "New collection" broadcast
// ============================================================
export function buildNewCollectionMessage(params: {
  customerName: string;
  collectionName: string;
}): string {
  const { customerName, collectionName } = params;
  return `Hi ${customerName}! 🎉\n\nOur *${collectionName}* is now live on Isha Vastram!\n\nAs a valued customer, you get early access. Use code *ISHA10* for 10% off! 🌸\n\n👉 ${APP_URL}/collection\n\nShop now before it sells out! 🛍️`;
}

// ============================================================
// 🔄 Restock Loop — "Your product is back" message
// ============================================================
export function buildRestockMessage(params: {
  productName: string;
  productId: string;
}): string {
  const { productName, productId } = params;
  const url = `${APP_URL}/saree/${productId}`;
  return `🔔 Great news! The *${productName}* you were waiting for is back in stock at Isha Vastram!\n\n👉 ${url}\n\nShop now before it sells out again! Use *ISHA10* for 10% off! 🌸`;
}

// ============================================================
// 🔄 Order status update → Customer
// ============================================================
export function buildOrderStatusMessage(params: {
  customerName: string;
  orderId: string;
  status: string;
}): string {
  const { customerName, orderId, status } = params;
  const statusMessages: Record<string, string> = {
    confirmed: `✅ Good news, ${customerName}! Your order #${orderId} has been *confirmed*. We are preparing it for dispatch! 🌸`,
    shipped: `🚚 Your order #${orderId} has been *shipped*, ${customerName}! It's on its way to you. We'll keep you updated! 📦`,
    delivered: `🎉 Your order #${orderId} has been *delivered*, ${customerName}! We hope you love your new saree! Do send us a photo! 📸`,
    cancelled: `❌ Your order #${orderId} has been *cancelled*, ${customerName}. If you have any questions, please contact us.`,
  };
  return statusMessages[status] || `Your order #${orderId} status has been updated to: ${status}`;
}

// ============================================================
// URL builders for the frontend
// ============================================================
export const whatsapp = {
  toAdmin: (message: string) => buildWhatsAppUrl(ADMIN_NUMBER, message),
  toCustomer: (phone: string, message: string) => buildWhatsAppUrl(phone, message),
};
