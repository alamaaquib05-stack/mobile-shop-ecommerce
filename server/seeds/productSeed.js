import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import connectDB from '../config/db.js';

dotenv.config();

const sampleProducts = [
  {
    name: 'iPhone 15 Pro Silicone Case - Blue',
    description: 'Premium silicone case designed specifically for iPhone 15 Pro. Soft-touch finish with microfiber lining protects your phone from scratches.',
    category: 'cases',
    brand: 'Apple',
    price: 4900,
    discountPrice: 3999,
    stock: 50,
    sku: 'CASE-IP15-BLU-001',
    tags: ['silicone', 'premium', 'protective'],
    compatibility: ['iPhone 15 Pro', 'iPhone 15 Pro Max'],
    isFeatured: true,
    images: []
  },
  {
    name: 'Samsung Galaxy S24 Clear Case',
    description: 'Crystal clear case that showcases your phone design while providing excellent protection against drops and scratches.',
    category: 'cases',
    brand: 'Samsung',
    price: 2499,
    discountPrice: 1999,
    stock: 75,
    sku: 'CASE-S24-CLR-001',
    tags: ['clear', 'transparent', 'slim'],
    compatibility: ['Samsung Galaxy S24', 'Samsung Galaxy S24+'],
    isFeatured: true,
    images: []
  },
  {
    name: '65W GaN Fast Charger with USB-C Cable',
    description: 'Ultra-compact GaN technology charger. Charges your phone from 0-50% in just 30 minutes. Includes 1m braided USB-C cable.',
    category: 'chargers',
    brand: 'Anker',
    price: 2999,
    discountPrice: 2499,
    stock: 100,
    sku: 'CHG-65W-GAN-001',
    tags: ['fast-charging', 'gan', 'compact'],
    compatibility: ['iPhone 15 series', 'Samsung Galaxy series', 'OnePlus', 'Xiaomi'],
    isFeatured: true,
    images: []
  },
  {
    name: 'Wireless Charging Pad 15W',
    description: 'Qi-certified wireless charging pad with 15W fast charging support. LED indicator and non-slip surface.',
    category: 'chargers',
    brand: 'Belkin',
    price: 1999,
    stock: 60,
    sku: 'CHG-WRL-15W-001',
    tags: ['wireless', 'qi-certified', 'fast-charging'],
    compatibility: ['iPhone 12 and above', 'Samsung Galaxy S20 and above'],
    isFeatured: false,
    images: []
  },
  {
    name: 'USB-C to Lightning Cable 2m - Braided',
    description: 'MFi certified braided cable with reinforced connectors. Supports fast charging and data transfer up to 480Mbps.',
    category: 'cables',
    brand: 'Anker',
    price: 899,
    discountPrice: 699,
    stock: 200,
    sku: 'CBL-C2L-2M-001',
    tags: ['braided', 'mfi-certified', 'durable'],
    compatibility: ['iPhone 15 series', 'iPhone 14 series', 'iPhone 13 series'],
    isFeatured: false,
    images: []
  },
  {
    name: 'USB-C to USB-C Cable 1m - 100W',
    description: 'Premium USB-C cable supporting 100W power delivery and 10Gbps data transfer. Perfect for laptops and tablets.',
    category: 'cables',
    brand: 'Belkin',
    price: 1299,
    stock: 150,
    sku: 'CBL-C2C-1M-001',
    tags: ['usb-c', '100w', 'fast-data'],
    compatibility: ['MacBook', 'iPad Pro', 'Samsung Galaxy', 'Google Pixel'],
    isFeatured: false,
    images: []
  },
  {
    name: 'Tempered Glass Screen Protector - iPhone 15 Pro',
    description: '9H hardness tempered glass with oleophobic coating. Easy bubble-free installation with alignment frame.',
    category: 'screen-protectors',
    brand: 'Spigen',
    price: 599,
    discountPrice: 399,
    stock: 300,
    sku: 'SCR-IP15-TG-001',
    tags: ['tempered-glass', '9h-hardness', 'bubble-free'],
    compatibility: ['iPhone 15 Pro'],
    isFeatured: true,
    images: []
  },
  {
    name: 'Privacy Screen Protector - Samsung S24',
    description: 'Anti-spy tempered glass that limits viewing angle to 28 degrees. Protects your privacy in public places.',
    category: 'screen-protectors',
    brand: 'Spigen',
    price: 899,
    stock: 120,
    sku: 'SCR-S24-PRV-001',
    tags: ['privacy', 'anti-spy', 'tempered-glass'],
    compatibility: ['Samsung Galaxy S24'],
    isFeatured: false,
    images: []
  },
  {
    name: 'AirPods Pro 2nd Gen - USB-C',
    description: 'Active Noise Cancellation, Adaptive Audio, and Personalized Spatial Audio. Up to 6 hours listening time.',
    category: 'earphones',
    brand: 'Apple',
    price: 24900,
    discountPrice: 22999,
    stock: 30,
    sku: 'EAR-APP-PRO2-001',
    tags: ['wireless', 'anc', 'premium'],
    compatibility: ['iPhone', 'iPad', 'Mac', 'Android'],
    isFeatured: true,
    images: []
  },
  {
    name: 'Galaxy Buds 2 Pro - Graphite',
    description: 'Intelligent ANC, 360 Audio, and Hi-Fi sound. IPX7 water resistance with 8 hours battery life.',
    category: 'earphones',
    brand: 'Samsung',
    price: 17999,
    discountPrice: 14999,
    stock: 45,
    sku: 'EAR-SAM-B2P-001',
    tags: ['wireless', 'anc', 'waterproof'],
    compatibility: ['Samsung Galaxy', 'Android', 'iPhone'],
    isFeatured: true,
    images: []
  },
  {
    name: '20000mAh Power Bank with 65W PD',
    description: 'High-capacity power bank with dual USB-C ports supporting 65W Power Delivery. LED display shows remaining battery.',
    category: 'power-banks',
    brand: 'Anker',
    price: 4999,
    discountPrice: 3999,
    stock: 80,
    sku: 'PWR-20K-65W-001',
    tags: ['high-capacity', 'fast-charging', 'dual-port'],
    compatibility: ['All smartphones', 'Tablets', 'Laptops'],
    isFeatured: true,
    images: []
  },
  {
    name: '10000mAh Slim Power Bank - MagSafe',
    description: 'Ultra-slim MagSafe compatible power bank. Wireless charging for iPhone 12 and above. 20W wired charging.',
    category: 'power-banks',
    brand: 'Belkin',
    price: 3499,
    stock: 65,
    sku: 'PWR-10K-MAG-001',
    tags: ['magsafe', 'wireless', 'slim'],
    compatibility: ['iPhone 12 and above'],
    isFeatured: false,
    images: []
  },
  {
    name: 'Adjustable Phone Stand - Aluminum',
    description: 'Premium aluminum phone stand with adjustable angle. Non-slip base and protective padding. Folds flat for travel.',
    category: 'stands',
    brand: 'Lamicall',
    price: 1299,
    discountPrice: 999,
    stock: 150,
    sku: 'STD-ALU-ADJ-001',
    tags: ['aluminum', 'adjustable', 'portable'],
    compatibility: ['All smartphones', 'Tablets up to 10 inches'],
    isFeatured: false,
    images: []
  },
  {
    name: 'Car Phone Mount - Magnetic',
    description: 'Strong magnetic car mount with 360-degree rotation. Attaches to air vent. Includes metal plates.',
    category: 'stands',
    brand: 'iOttie',
    price: 1599,
    stock: 100,
    sku: 'STD-CAR-MAG-001',
    tags: ['magnetic', 'car-mount', '360-rotation'],
    compatibility: ['All smartphones with case'],
    isFeatured: false,
    images: []
  },
  {
    name: 'OnePlus 12R Rugged Case - Black',
    description: 'Military-grade drop protection with reinforced corners. Raised bezels protect camera and screen.',
    category: 'cases',
    brand: 'Spigen',
    price: 1499,
    discountPrice: 1199,
    stock: 90,
    sku: 'CASE-OP12-RUG-001',
    tags: ['rugged', 'military-grade', 'protective'],
    compatibility: ['OnePlus 12R'],
    isFeatured: false,
    images: []
  },
  {
    name: 'Xiaomi 14 Leather Wallet Case',
    description: 'Genuine leather case with card slots and kickstand. RFID blocking technology protects your cards.',
    category: 'cases',
    brand: 'Xiaomi',
    price: 1999,
    stock: 70,
    sku: 'CASE-MI14-LTH-001',
    tags: ['leather', 'wallet', 'rfid-blocking'],
    compatibility: ['Xiaomi 14', 'Xiaomi 14 Pro'],
    isFeatured: false,
    images: []
  },
  {
    name: 'Multi-Port USB Hub with HDMI',
    description: '7-in-1 USB-C hub with HDMI 4K, 3x USB 3.0, SD/microSD card readers, and 100W PD charging.',
    category: 'others',
    brand: 'Anker',
    price: 3999,
    stock: 55,
    sku: 'HUB-7IN1-HDMI-001',
    tags: ['usb-hub', 'hdmi', 'multi-port'],
    compatibility: ['MacBook', 'iPad Pro', 'Windows laptops'],
    isFeatured: false,
    images: []
  },
  {
    name: 'Phone Camera Lens Kit - 3 in 1',
    description: 'Professional lens kit with wide-angle, macro, and fisheye lenses. Universal clip fits all smartphones.',
    category: 'others',
    brand: 'Moment',
    price: 2499,
    discountPrice: 1999,
    stock: 40,
    sku: 'LNS-3IN1-PRO-001',
    tags: ['camera-lens', 'photography', 'universal'],
    compatibility: ['All smartphones'],
    isFeatured: false,
    images: []
  }
];

const seedProducts = async () => {
  try {
    await connectDB();

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Existing products cleared');

    // Insert sample products one by one to trigger pre-save hooks
    for (const productData of sampleProducts) {
      await Product.create(productData);
    }
    
    console.log('✅ Sample products added successfully');
    console.log(`📦 Total products: ${sampleProducts.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();

// Made with Bob
