import Product from '../models/Product.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * @desc    Get all products with filtering, sorting, and pagination
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sort = '-createdAt',
      page = 1,
      limit = 12,
      isFeatured
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Category filter
    if (category) {
      query.category = category;
    }

    // Featured filter
    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    // Search filter (name, description, tags)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const products = await Product.find(query)
      .sort(sort)
      .limit(Number(limit))
      .skip(skip)
      .select('-__v');

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 8;

    const products = await Product.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .sort('-createdAt')
      .limit(limit)
      .select('-__v');

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get distinct categories with product counts
 * @route   GET /api/products/categories
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      categories: categories.map(cat => ({
        name: cat._id,
        count: cat.count
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by slug
 * @route   GET /api/products/:slug
 * @access  Public
 */
export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ 
      slug: req.params.slug,
      isActive: true 
    }).select('-__v');

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get related products (same category, exclude current product)
 * @route   GET /api/products/:slug/related
 * @access  Public
 */
export const getRelatedProducts = async (req, res, next) => {
  try {
    const currentProduct = await Product.findOne({ 
      slug: req.params.slug,
      isActive: true 
    });

    if (!currentProduct) {
      return next(new AppError('Product not found', 404));
    }

    // Find related products from the same category
    const relatedProducts = await Product.find({
      category: currentProduct.category,
      isActive: true,
      _id: { $ne: currentProduct._id } // Exclude current product
    })
      .select('name slug price discountPrice images ratings stock')
      .limit(4)
      .sort('-ratings.average -createdAt');

    res.status(200).json({
      success: true,
      count: relatedProducts.length,
      products: relatedProducts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      brand,
      price,
      discountPrice,
      stock,
      sku,
      tags,
      compatibility,
      isFeatured
    } = req.body;

    // Validation
    if (!name || !category || !price || stock === undefined) {
      return next(new AppError('Please provide name, category, price, and stock', 400));
    }

    // Check if SKU already exists
    if (sku) {
      const existingSKU = await Product.findOne({ sku });
      if (existingSKU) {
        return next(new AppError('SKU already exists', 400));
      }
    }

    const product = await Product.create({
      name,
      description,
      category,
      brand,
      price,
      discountPrice,
      stock,
      sku,
      tags: tags || [],
      compatibility: compatibility || [],
      isFeatured: isFeatured || false,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Check if updating SKU and if it's already taken
    if (req.body.sku && req.body.sku !== product.sku) {
      const existingSKU = await Product.findOne({ sku: req.body.sku });
      if (existingSKU) {
        return next(new AppError('SKU already exists', 400));
      }
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete product (soft delete)
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Soft delete - set isActive to false
    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get product by ID (for admin)
 * @route   GET /api/products/id/:id
 * @access  Private/Admin
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).select('-__v');

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Upload product image
 * @route   POST /api/products/upload-image
 * @access  Private/Admin
 */
export const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload an image', 400));
    }

    // Upload to Cloudinary
    const cloudinary = (await import('../config/cloudinary.js')).default;
    
    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'mobile-shop/products',
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    res.status(200).json({
      success: true,
      image: {
        url: result.secure_url,
        publicId: result.public_id
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    next(new AppError('Failed to upload image', 500));
  }
};

/**
 * @desc    Delete product image
 * @route   DELETE /api/products/delete-image/:publicId
 * @access  Private/Admin
 */
export const deleteProductImage = async (req, res, next) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return next(new AppError('Public ID is required', 400));
    }

    // Delete from Cloudinary
    const cloudinary = (await import('../config/cloudinary.js')).default;
    await cloudinary.uploader.destroy(publicId);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Image delete error:', error);
    next(new AppError('Failed to delete image', 500));
  }
};


// Made with Bob
