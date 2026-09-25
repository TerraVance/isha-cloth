import { CartItem } from '@/types/database';

// ============================================================
// WhatsApp Config — fetched from DB at runtime
// ============================================================
const DEFAULT_ADMIN_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER || '919209337387';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

// ============================================================
// Helper: Format currency in Indian style
// ============================================================
function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
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
    .map((item, i) => `│ ${i + 1}. *${item.name}* × ${item.quantity} — ${formatINR(item.price * item.quantity)}`)
    .join('\n');

  const couponLine = couponCode 
    ? `🎟️ Discount    *−${formatINR(discountAmount)}* (${couponCode})\n` 
    : '';

  const shippingText = shipping === 0 ? '*FREE*' : formatINR(shipping);

  return `━━━━━━━━━━━━━━━━━━━━
   🛍️ *ISHA VASTRAM*
     _New Order Received_
━━━━━━━━━━━━━━━━━━━━

📦 *Order:* ${orderId}
👤 *Customer:* ${customerName}
📱 *Phone:* +${customerPhone}
📍 *Address:* ${address}, ${city} - ${pincode}

┌─────────────────────
│ 🛒 *Order Items*
├─────────────────────
${itemLines}
└─────────────────────

💰 Subtotal     ${formatINR(subtotal)}
${couponLine}🚚 Shipping     ${shippingText}
━━━━━━━━━━━━━━
✅ *Total: ${formatINR(total)}*

📝 _Status: Awaiting Confirmation_
⏰ ${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`;
}

// ============================================================
// 🔄 Order confirmation → Customer
// ============================================================
export function buildCustomerOrderMessage(params: {
  orderId: string;
  total: number;
}): string {
  const { orderId, total } = params;
  return `🛍️ *Isha Vastram — Order Placed*

Hi! I just placed an order.

📦 *Order ID:* ${orderId}
💰 *Total:* ${formatINR(total)}

Please confirm my order. 🙏`;
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
    confirmed: `━━━━━━━━━━━━━━━━━━━━
   🛍️ *ISHA VASTRAM*
━━━━━━━━━━━━━━━━━━━━

✅ *Order Confirmed!*

Hi *${customerName}*,

Your order *${orderId}* has been confirmed and is being prepared for dispatch.

We'll notify you once it's shipped! 🌸`,

    shipped: `━━━━━━━━━━━━━━━━━━━━
   🛍️ *ISHA VASTRAM*
━━━━━━━━━━━━━━━━━━━━

🚚 *Order Shipped!*

Hi *${customerName}*,

Your order *${orderId}* is on its way to you! 📦

We'll update you when it arrives. Track your package and feel free to reach out if you have any questions.`,

    delivered: `━━━━━━━━━━━━━━━━━━━━
   🛍️ *ISHA VASTRAM*
━━━━━━━━━━━━━━━━━━━━

🎉 *Order Delivered!*

Hi *${customerName}*,

Your order *${orderId}* has been delivered! We hope you love your new saree! 🌸

📸 _We'd love to see you wearing it! Send us a photo and get featured on our website._

Thank you for shopping with us! 🙏`,

    cancelled: `━━━━━━━━━━━━━━━━━━━━
   🛍️ *ISHA VASTRAM*
━━━━━━━━━━━━━━━━━━━━

❌ *Order Cancelled*

Hi *${customerName}*,

Your order *${orderId}* has been cancelled.

If you have any questions or would like to reorder, please don't hesitate to reach out. We're here to help! 🙏`,
  };

  return statusMessages[status] || `Hi *${customerName}*, your order *${orderId}* status has been updated to: *${status}*`;
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
  return `✨ Look at this beautiful *${sareeName}* from *Isha Vastram*!

Pure cotton, handloom crafted sarees at amazing prices 🌸

👉 ${url}

_Shop authentic handloom sarees — delivered to your doorstep!_`;
}

// ============================================================
// 🔄 Post-Purchase Loop — "Share your coupon" message
// ============================================================
export function buildShareCouponMessage(params: {
  couponCode: string;
}): string {
  const { couponCode } = params;
  return `🎉 I just bought a beautiful saree from *Isha Vastram*!

Use my code *${couponCode}* and get *10% off* your order too! 🌸

👉 ${APP_URL}/collection

_Shop pure cotton handloom sarees — authentic and affordable!_`;
}

// ============================================================
// 🔄 Social Proof Loop — "Send us your photo" message
// ============================================================
export function buildReviewRequestMessage(customerName: string): string {
  return `━━━━━━━━━━━━━━━━━━━━
   🛍️ *ISHA VASTRAM*
━━━━━━━━━━━━━━━━━━━━

📸 *We'd Love Your Feedback!*

Hi *${customerName}*,

We hope you're loving your new saree! 🌸

Would you like to be *featured on our website*? Just send us a photo of you wearing your saree and a short review.

Thank you for being a valued customer! 🙏`;
}

// ============================================================
// 🔄 Re-engagement Loop — "New collection" broadcast
// ============================================================
export function buildNewCollectionMessage(params: {
  customerName: string;
  collectionName: string;
}): string {
  const { customerName, collectionName } = params;
  return `━━━━━━━━━━━━━━━━━━━━
   🛍️ *ISHA VASTRAM*
     _New Collection Alert_
━━━━━━━━━━━━━━━━━━━━

Hi *${customerName}*! 🎉

Our *${collectionName}* is now live!

As a valued customer, you get _early access_ 🌸

👉 ${APP_URL}/collection

Shop now before it sells out! 🛍️`;
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
  return `━━━━━━━━━━━━━━━━━━━━
   🛍️ *ISHA VASTRAM*
━━━━━━━━━━━━━━━━━━━━

🔔 *Back in Stock!*

Great news! The *${productName}* you were waiting for is now available again!

👉 ${url}

_Hurry — grab it before it sells out!_ 🌸`;
}

// ============================================================
// Predefined customer queries for the chat widget
// ============================================================
export const WHATSAPP_QUICK_REPLIES = [
  { emoji: '📦', label: 'Track My Order', message: 'Hi! I would like to track my order. My order ID is: ' },
  { emoji: '💰', label: 'Know Pricing', message: 'Hi! I would like to know the pricing for your sarees.' },
  { emoji: '📏', label: 'Size & Fabric Guide', message: 'Hi! Can you help me with the size and fabric details?' },
  { emoji: '🔄', label: 'Return / Exchange', message: 'Hi! I would like to know about your return and exchange policy.' },
  { emoji: '💬', label: 'Other Query', message: 'Hi! I have a question about your sarees.' },
];

// ============================================================
// URL builders for the frontend
// ============================================================
export const whatsapp = {
  toAdmin: (message: string) => buildWhatsAppUrl(DEFAULT_ADMIN_NUMBER, message),
  toCustomer: (phone: string, message: string) => buildWhatsAppUrl(phone, message),
  toAdminWithPhone: (phone: string, message: string) => buildWhatsAppUrl(phone, message),
};
