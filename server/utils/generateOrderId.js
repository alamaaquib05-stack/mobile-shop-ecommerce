import Order from '../models/Order.js';

/**
 * Generate a unique order ID in format: ORD-YYYYMMDD-XXXX
 * Example: ORD-20260511-0001
 */
export const generateOrderId = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;

  // Find the last order created today
  const lastOrder = await Order.findOne({
    orderId: new RegExp(`^ORD-${datePrefix}-`)
  }).sort({ createdAt: -1 });

  let sequence = 1;
  
  if (lastOrder) {
    // Extract sequence number from last order ID
    const lastSequence = parseInt(lastOrder.orderId.split('-')[2]);
    sequence = lastSequence + 1;
  }

  // Format sequence with leading zeros (4 digits)
  const sequenceStr = String(sequence).padStart(4, '0');

  return `ORD-${datePrefix}-${sequenceStr}`;
};

// Made with Bob
