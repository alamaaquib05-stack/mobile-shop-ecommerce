import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Send order confirmation email
 */
export const sendOrderConfirmationEmail = async (order) => {
  try {
    const transporter = createTransporter();

    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">₹${item.subtotal.toFixed(2)}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"MobileShop" <${process.env.SMTP_USER}>`,
      to: order.buyer.email,
      subject: `Order Confirmation - ${order.orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Order Placed Successfully!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${order.buyer.name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for your order! We've received your order and ${order.payment.mode === 'gateway' ? 'payment has been confirmed' : 'payment verification is in progress'}.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
              <h2 style="margin-top: 0; color: #667eea;">Order Details</h2>
              <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order.orderId}</p>
              <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p style="margin: 5px 0;"><strong>Payment Status:</strong> 
                <span style="color: ${order.payment.status === 'verified' ? '#10b981' : '#f59e0b'}; font-weight: bold;">
                  ${order.payment.status === 'verified' ? 'Confirmed' : 'Pending Verification'}
                </span>
              </p>
            </div>
            
            <h3 style="color: #667eea; margin-top: 30px;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background: #667eea; color: white;">
                  <th style="padding: 12px; text-align: left;">Image</th>
                  <th style="padding: 12px; text-align: left;">Product</th>
                  <th style="padding: 12px; text-align: center;">Qty</th>
                  <th style="padding: 12px; text-align: right;">Price</th>
                  <th style="padding: 12px; text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0;">Subtotal:</td>
                  <td style="padding: 8px 0; text-align: right;">₹${order.pricing.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">Shipping:</td>
                  <td style="padding: 8px 0; text-align: right; color: ${order.pricing.shippingCharge === 0 ? '#10b981' : '#333'};">
                    ${order.pricing.shippingCharge === 0 ? 'FREE' : '₹' + order.pricing.shippingCharge.toFixed(2)}
                  </td>
                </tr>
                ${order.pricing.discount > 0 ? `
                <tr>
                  <td style="padding: 8px 0; color: #10b981;">Discount ${order.couponCode ? `(${order.couponCode})` : ''}:</td>
                  <td style="padding: 8px 0; text-align: right; color: #10b981;">-₹${order.pricing.discount.toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr style="border-top: 2px solid #667eea;">
                  <td style="padding: 12px 0; font-size: 18px; font-weight: bold;">Total:</td>
                  <td style="padding: 12px 0; text-align: right; font-size: 18px; font-weight: bold; color: #667eea;">₹${order.pricing.total.toFixed(2)}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <h3 style="color: #667eea; margin-top: 0;">Delivery Address</h3>
              <p style="margin: 5px 0;">${order.deliveryAddress.fullName}</p>
              <p style="margin: 5px 0;">${order.deliveryAddress.addressLine1}</p>
              ${order.deliveryAddress.addressLine2 ? `<p style="margin: 5px 0;">${order.deliveryAddress.addressLine2}</p>` : ''}
              <p style="margin: 5px 0;">${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}</p>
              <p style="margin: 5px 0;">Phone: ${order.deliveryAddress.phone}</p>
            </div>
            
            ${order.payment.mode === 'manual_upi' && order.payment.status === 'pending' ? `
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin-top: 20px;">
              <p style="margin: 0; color: #92400e;">
                <strong>⏳ Payment Verification Pending</strong><br>
                Your payment is being verified by our team. You'll receive a confirmation email once verified.
              </p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}/track-order" 
                 style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Track Your Order
              </a>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666; text-align: center;">
              If you have any questions, please contact us at ${process.env.SMTP_USER}
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} MobileShop. All rights reserved.</p>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to ${order.buyer.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    return false;
  }
};

/**
 * Send payment verification confirmation email
 */
export const sendPaymentVerifiedEmail = async (order) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"MobileShop" <${process.env.SMTP_USER}>`,
      to: order.buyer.email,
      subject: `Payment Confirmed - ${order.orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Confirmed</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✓ Payment Confirmed!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${order.buyer.name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Great news! Your payment has been verified and confirmed. Your order is now being processed.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
              <h2 style="margin-top: 0; color: #10b981;">Order Details</h2>
              <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order.orderId}</p>
              <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${order.pricing.total.toFixed(2)}</p>
              <p style="margin: 5px 0;"><strong>Payment Status:</strong> <span style="color: #10b981; font-weight: bold;">Confirmed ✓</span></p>
            </div>
            
            <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; margin-top: 20px;">
              <p style="margin: 0; color: #065f46;">
                <strong>What's Next?</strong><br>
                Your order is now being prepared for shipment. You'll receive a shipping confirmation email with tracking details once your order is dispatched.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}/track-order" 
                 style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Track Your Order
              </a>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666; text-align: center;">
              Thank you for shopping with MobileShop!
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} MobileShop. All rights reserved.</p>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Payment verified email sent to ${order.buyer.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending payment verified email:', error);
    return false;
  }
};

/**
 * Send order shipped email with tracking number
 */
export const sendOrderShippedEmail = async (order) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"MobileShop" <${process.env.SMTP_USER}>`,
      to: order.buyer.email,
      subject: `Order Shipped - ${order.orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Shipped</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📦 Your Order is On Its Way!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${order.buyer.name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Exciting news! Your order has been shipped and is on its way to you.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
              <h2 style="margin-top: 0; color: #3b82f6;">Shipping Details</h2>
              <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order.orderId}</p>
              <p style="margin: 5px 0;"><strong>Tracking Number:</strong> <span style="color: #3b82f6; font-weight: bold;">${order.trackingNumber}</span></p>
              <p style="margin: 5px 0;"><strong>Shipped Date:</strong> ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #3b82f6; margin-top: 0;">Delivery Address</h3>
              <p style="margin: 5px 0;">${order.deliveryAddress.fullName}</p>
              <p style="margin: 5px 0;">${order.deliveryAddress.addressLine1}</p>
              ${order.deliveryAddress.addressLine2 ? `<p style="margin: 5px 0;">${order.deliveryAddress.addressLine2}</p>` : ''}
              <p style="margin: 5px 0;">${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}</p>
              <p style="margin: 5px 0;">Phone: ${order.deliveryAddress.phone}</p>
            </div>
            
            <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin-top: 20px;">
              <p style="margin: 0; color: #1e40af;">
                <strong>📍 Track Your Package</strong><br>
                Use the tracking number above to track your shipment. Expected delivery: 3-5 business days.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}/track-order" 
                 style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Track Your Order
              </a>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666; text-align: center;">
              Thank you for shopping with MobileShop!
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} MobileShop. All rights reserved.</p>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order shipped email sent to ${order.buyer.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending order shipped email:', error);
    return false;
  }
};

export default {
  sendOrderConfirmationEmail,
  sendPaymentVerifiedEmail,
  sendOrderShippedEmail
};

// Made with Bob
