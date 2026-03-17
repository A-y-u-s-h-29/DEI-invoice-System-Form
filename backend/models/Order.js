const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    businessName: {
        type: String,
        required: [true, 'Business name is required'],
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    contactPerson: {
        type: String,
        required: [true, 'Contact person is required'],
        trim: true
    },
    phoneMobile: {
        type: String,
        required: [true, 'Phone number is required'],
        validate: {
            validator: function(v) {
                return /^[0-9]{10}$/.test(v);
            },
            message: 'Please enter a valid 10-digit phone number'
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Please enter a valid email address'
        }
    },
    website: {
        type: String,
        trim: true
    },
    salesManagerName: {
        type: String,
        required: [true, 'Sales manager name is required'],
        trim: true
    },
    subscriptionService: {
        type: String,
        required: [true, 'Subscription/Service is required'],
        enum: ['Website', 'Google Maps', 'SEO', 'Social Media', 'E-commerce', 'Mobile App', 'Other']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    }
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
    if (!this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const count = await this.constructor.countDocuments();
        this.orderNumber = `INV-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);