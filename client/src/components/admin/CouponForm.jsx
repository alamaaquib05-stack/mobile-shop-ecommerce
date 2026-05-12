import { useState, useEffect } from 'react';

const CouponForm = ({ coupon, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    maxUses: '',
    validFrom: '',
    validUntil: '',
    applicableCategories: [],
    isActive: true
  });

  const [errors, setErrors] = useState({});

  const categories = [
    'cases',
    'chargers',
    'cables',
    'screen-protectors',
    'earphones',
    'power-banks',
    'stands',
    'others'
  ];

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || '',
        description: coupon.description || '',
        discountType: coupon.discountType || 'percentage',
        discountValue: coupon.discountValue || '',
        minOrderAmount: coupon.minOrderAmount || '',
        maxDiscount: coupon.maxDiscount || '',
        maxUses: coupon.maxUses || '',
        validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : '',
        validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
        applicableCategories: coupon.applicableCategories || [],
        isActive: coupon.isActive !== undefined ? coupon.isActive : true
      });
    }
  }, [coupon]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      applicableCategories: prev.applicableCategories.includes(category)
        ? prev.applicableCategories.filter(c => c !== category)
        : [...prev.applicableCategories, category]
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Coupon code is required';
    } else if (!/^[A-Z0-9]+$/.test(formData.code)) {
      newErrors.code = 'Code must contain only uppercase letters and numbers';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.discountValue || formData.discountValue <= 0) {
      newErrors.discountValue = 'Discount value must be greater than 0';
    }

    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      newErrors.discountValue = 'Percentage cannot exceed 100%';
    }

    if (!formData.minOrderAmount || formData.minOrderAmount < 0) {
      newErrors.minOrderAmount = 'Minimum order amount is required';
    }

    if (!formData.validUntil) {
      newErrors.validUntil = 'Valid until date is required';
    }

    const today = new Date().toISOString().split('T')[0];
    if (formData.validUntil && formData.validUntil < today) {
      newErrors.validUntil = 'Valid until date must be in the future';
    }

    if (formData.validFrom && formData.validUntil && formData.validFrom > formData.validUntil) {
      newErrors.validFrom = 'Valid from date must be before valid until date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Prepare data for submission
    const submitData = {
      ...formData,
      code: formData.code.toUpperCase(),
      discountValue: parseFloat(formData.discountValue),
      minOrderAmount: parseFloat(formData.minOrderAmount),
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      validFrom: formData.validFrom || new Date().toISOString(),
      applicableCategories: formData.applicableCategories.length > 0 ? formData.applicableCategories : null
    };

    onSave(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {coupon ? 'Edit Coupon' : 'Create New Coupon'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Coupon Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coupon Code *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              disabled={!!coupon} // Code cannot be changed when editing
              placeholder="SUMMER2024"
              className="input-field uppercase"
              maxLength={20}
            />
            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Use uppercase letters and numbers only (e.g., SAVE20, WELCOME100)
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Get 20% off on all products"
              className="input-field"
              rows="2"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Discount Type and Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Type *
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="input-field"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Value *
              </label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                placeholder={formData.discountType === 'percentage' ? '20' : '100'}
                className="input-field"
                min="0"
                step="0.01"
              />
              {errors.discountValue && <p className="text-red-500 text-sm mt-1">{errors.discountValue}</p>}
            </div>
          </div>

          {/* Min Order Amount and Max Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Order Amount (₹) *
              </label>
              <input
                type="number"
                name="minOrderAmount"
                value={formData.minOrderAmount}
                onChange={handleChange}
                placeholder="499"
                className="input-field"
                min="0"
                step="0.01"
              />
              {errors.minOrderAmount && <p className="text-red-500 text-sm mt-1">{errors.minOrderAmount}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Discount Cap (₹)
              </label>
              <input
                type="number"
                name="maxDiscount"
                value={formData.maxDiscount}
                onChange={handleChange}
                placeholder="500"
                className="input-field"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for no cap
              </p>
            </div>
          </div>

          {/* Max Uses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Uses
            </label>
            <input
              type="number"
              name="maxUses"
              value={formData.maxUses}
              onChange={handleChange}
              placeholder="100"
              className="input-field"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for unlimited uses
            </p>
          </div>

          {/* Valid From and Until */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid From
              </label>
              <input
                type="date"
                name="validFrom"
                value={formData.validFrom}
                onChange={handleChange}
                className="input-field"
              />
              {errors.validFrom && <p className="text-red-500 text-sm mt-1">{errors.validFrom}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid Until *
              </label>
              <input
                type="date"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleChange}
                className="input-field"
              />
              {errors.validUntil && <p className="text-red-500 text-sm mt-1">{errors.validUntil}</p>}
            </div>
          </div>

          {/* Applicable Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Applicable Categories
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {categories.map(category => (
                <label
                  key={category}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.applicableCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {category.replace('-', ' ')}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Leave all unchecked to apply to all categories
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label className="ml-2 text-sm text-gray-700">
              Active (coupon can be used immediately)
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {coupon ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponForm;

// Made with Bob
