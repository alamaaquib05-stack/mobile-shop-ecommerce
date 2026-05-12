import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'flat'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxDiscount: {
    type: Number,
    default: null,
    min: 0
  },
  maxUses: {
    type: Number,
    default: null,
    min: 1
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableCategories: [{
    type: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });

// Method to check if coupon is valid
couponSchema.methods.isValid = function() {
  const now = new Date();
  
  // Check if active
  if (!this.isActive) {
    return { valid: false, message: 'Coupon is inactive' };
  }
  
  // Check date validity
  if (now < this.validFrom) {
    return { valid: false, message: 'Coupon is not yet valid' };
  }
  
  if (now > this.validUntil) {
    return { valid: false, message: 'Coupon has expired' };
  }
  
  // Check usage limit
  if (this.maxUses && this.usedCount >= this.maxUses) {
    return { valid: false, message: 'Coupon usage limit reached' };
  }
  
  return { valid: true };
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function(orderAmount, categories = []) {
  // Check if coupon is valid
  const validation = this.isValid();
  if (!validation.valid) {
    return { discount: 0, error: validation.message };
  }
  
  // Check minimum order amount
  if (orderAmount < this.minOrderAmount) {
    return { 
      discount: 0, 
      error: `Minimum order amount of ₹${this.minOrderAmount} required` 
    };
  }
  
  // Check category applicability
  if (this.applicableCategories.length > 0) {
    const hasApplicableCategory = categories.some(cat => 
      this.applicableCategories.includes(cat)
    );
    if (!hasApplicableCategory) {
      return { 
        discount: 0, 
        error: 'Coupon not applicable to items in cart' 
      };
    }
  }
  
  let discount = 0;
  
  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
    
    // Apply max discount cap if set
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    // Flat discount
    discount = this.discountValue;
    
    // Discount cannot exceed order amount
    if (discount > orderAmount) {
      discount = orderAmount;
    }
  }
  
  return { discount: Math.round(discount), error: null };
};

export default mongoose.model('Coupon', couponSchema);

// Made with Bob
