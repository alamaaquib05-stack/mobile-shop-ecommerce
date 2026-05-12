import Coupon from '../models/Coupon.js';

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Admin
export const getAllCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;
    
    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const coupons = await Coupon.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Coupon.countDocuments(query);
    
    res.json({
      success: true,
      coupons,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupons'
    });
  }
};

// @desc    Get active coupons (Public)
// @route   GET /api/coupons/active
// @access  Public
export const getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();
    
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      $or: [
        { maxUses: null },
        { $expr: { $lt: ['$usedCount', '$maxUses'] } }
      ]
    })
    .select('code description discountType discountValue minOrderAmount maxDiscount validUntil')
    .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      coupons
    });
  } catch (error) {
    console.error('Get active coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active coupons'
    });
  }
};

// @desc    Validate and apply coupon
// @route   POST /api/coupons/validate
// @access  Public
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount, categories } = req.body;
    
    if (!code || !orderAmount) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code and order amount are required'
      });
    }
    
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase() 
    });
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }
    
    // Calculate discount
    const result = coupon.calculateDiscount(orderAmount, categories || []);
    
    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
    
    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount: result.discount
      },
      discount: result.discount
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate coupon'
    });
  }
};

// @desc    Create coupon (Admin)
// @route   POST /api/coupons
// @access  Admin
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      maxUses,
      validFrom,
      validUntil,
      applicableCategories
    } = req.body;
    
    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ 
      code: code.toUpperCase() 
    });
    
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }
    
    // Validate dates
    if (new Date(validFrom) >= new Date(validUntil)) {
      return res.status(400).json({
        success: false,
        message: 'Valid until date must be after valid from date'
      });
    }
    
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxDiscount: maxDiscount || null,
      maxUses: maxUses || null,
      validFrom,
      validUntil,
      applicableCategories: applicableCategories || [],
      createdBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create coupon'
    });
  }
};

// @desc    Update coupon (Admin)
// @route   PUT /api/coupons/:id
// @access  Admin
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Don't allow changing code or usedCount
    delete updates.code;
    delete updates.usedCount;
    delete updates.createdBy;
    
    // Validate dates if provided
    if (updates.validFrom && updates.validUntil) {
      if (new Date(updates.validFrom) >= new Date(updates.validUntil)) {
        return res.status(400).json({
          success: false,
          message: 'Valid until date must be after valid from date'
        });
      }
    }
    
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Coupon updated successfully',
      coupon
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update coupon'
    });
  }
};

// @desc    Delete coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Admin
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findByIdAndDelete(id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete coupon'
    });
  }
};

// @desc    Toggle coupon active status (Admin)
// @route   PATCH /api/coupons/:id/toggle
// @access  Admin
export const toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findById(id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }
    
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    
    res.json({
      success: true,
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
      coupon
    });
  } catch (error) {
    console.error('Toggle coupon status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle coupon status'
    });
  }
};

// @desc    Increment coupon usage (Internal - called when order is placed)
// @route   Not exposed as API endpoint
// @access  Internal
export const incrementCouponUsage = async (couponCode) => {
  try {
    const coupon = await Coupon.findOne({ 
      code: couponCode.toUpperCase() 
    });
    
    if (coupon) {
      coupon.usedCount += 1;
      await coupon.save();
    }
  } catch (error) {
    console.error('Increment coupon usage error:', error);
  }
};

// Made with Bob
