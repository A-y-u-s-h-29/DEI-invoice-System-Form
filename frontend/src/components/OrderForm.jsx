import React, { useState } from 'react';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

const OrderForm = () => {
    const [formData, setFormData] = useState({
        // Remove orderNumber - backend generates it
        date: new Date().toISOString().split('T')[0],
        businessName: '',
        address: '',
        contactPerson: '',
        phoneMobile: '',
        email: '',
        website: '',
        salesManagerName: '', // This is required!
        subscriptionService: 'Website', // Must match enum values
        amount: ''
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });
    const [fieldErrors, setFieldErrors] = useState({});

    // Validation that matches backend schema
    const validate = () => {
        let newErrors = {};
        
        if (!formData.businessName.trim()) newErrors.businessName = "Business name is required";
        if (!formData.address.trim()) newErrors.address = "Address is required";
        if (!formData.contactPerson.trim()) newErrors.contactPerson = "Contact person is required";
        if (!formData.salesManagerName.trim()) newErrors.salesManagerName = "Sales manager name is required";
        
        if (!/^\d{10}$/.test(formData.phoneMobile)) 
            newErrors.phoneMobile = "Enter a valid 10-digit phone number";
        
        if (!/^\S+@\S+\.\S+$/.test(formData.email)) 
            newErrors.email = "Enter a valid email address";
        
        if (!formData.amount || formData.amount <= 0) 
            newErrors.amount = "Enter a valid amount";
        
        return newErrors;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear errors when user starts typing
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
        if (fieldErrors[e.target.name]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setMessage({ type: 'error', text: 'Please fix the errors below' });
            return;
        }

        try {
            setLoading(true);
            setMessage({ type: '', text: '' });
            setFieldErrors({});

            // Prepare data - remove any empty strings that might cause issues
            const submitData = {
                date: formData.date,
                businessName: formData.businessName.trim(),
                address: formData.address.trim(),
                contactPerson: formData.contactPerson.trim(),
                phoneMobile: formData.phoneMobile.trim(),
                email: formData.email.trim().toLowerCase(),
                website: formData.website.trim() || undefined, // Send undefined if empty
                salesManagerName: formData.salesManagerName.trim(),
                subscriptionService: formData.subscriptionService,
                amount: Number(formData.amount) // Ensure amount is a number
            };

            console.log('Sending data:', submitData);

            const res = await axios.post('http://localhost:3000/api/orders', submitData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Response:', res.data);
            
            setMessage({ 
                type: 'success', 
                text: `✅ Order created successfully! Order #: ${res.data.data.orderNumber}` 
            });

            // Reset form
            setFormData({
                date: new Date().toISOString().split('T')[0],
                businessName: '',
                address: '',
                contactPerson: '',
                phoneMobile: '',
                email: '',
                website: '',
                salesManagerName: '',
                subscriptionService: 'Website',
                amount: ''
            });
            
        } catch (err) {
            console.error('Full error:', err);
            console.error('Error response:', err.response);
            
            // Handle validation errors from server
            if (err.response?.data?.error && Array.isArray(err.response.data.error)) {
                const serverErrors = {};
                err.response.data.error.forEach(errMsg => {
                    // Parse mongoose validation errors
                    if (errMsg.includes('required')) {
                        const field = errMsg.split(' ')[0];
                        serverErrors[field] = errMsg;
                    }
                });
                setFieldErrors(serverErrors);
                setMessage({ 
                    type: 'error', 
                    text: 'Please check the form for validation errors'
                });
            } else {
                setMessage({ 
                    type: 'error', 
                    text: err.response?.data?.message || 'Failed to create order'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";
    const errorClasses = "mt-1 text-sm text-red-600";

    // Get error for a field (combine frontend and backend errors)
    const getFieldError = (fieldName) => {
        return errors[fieldName] || fieldErrors[fieldName];
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                        <h2 className="text-3xl font-bold text-white">Create New Order</h2>
                        <p className="text-blue-100 mt-2">Fill in the details below to create a new order</p>
                    </div>

                    {/* Message Alert */}
                    {message.text && (
                        <div className={`mx-8 mt-6 p-4 rounded-lg ${
                            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClasses}>Order Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className={inputClasses}
                                    />
                                </div>

                                <div>
                                    <label className={labelClasses}>Business Name *</label>
                                    <input
                                        name="businessName"
                                        placeholder="Enter business name"
                                        onChange={handleChange}
                                        value={formData.businessName}
                                        className={`${inputClasses} ${getFieldError('businessName') ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    />
                                    {getFieldError('businessName') && (
                                        <p className={errorClasses}>{getFieldError('businessName')}</p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClasses}>Address *</label>
                                    <textarea
                                        name="address"
                                        placeholder="Enter complete address"
                                        rows="3"
                                        onChange={handleChange}
                                        value={formData.address}
                                        className={`${inputClasses} ${getFieldError('address') ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    />
                                    {getFieldError('address') && (
                                        <p className={errorClasses}>{getFieldError('address')}</p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClasses}>Contact Person *</label>
                                    <input
                                        name="contactPerson"
                                        placeholder="Enter contact person name"
                                        onChange={handleChange}
                                        value={formData.contactPerson}
                                        className={`${inputClasses} ${getFieldError('contactPerson') ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    />
                                    {getFieldError('contactPerson') && (
                                        <p className={errorClasses}>{getFieldError('contactPerson')}</p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClasses}>Sales Manager *</label>
                                    <input
                                        name="salesManagerName"
                                        placeholder="Enter sales manager name"
                                        onChange={handleChange}
                                        value={formData.salesManagerName}
                                        className={`${inputClasses} ${getFieldError('salesManagerName') ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    />
                                    {getFieldError('salesManagerName') && (
                                        <p className={errorClasses}>{getFieldError('salesManagerName')}</p>
                                    )}
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClasses}>Phone/Mobile *</label>
                                    <input
                                        name="phoneMobile"
                                        placeholder="Enter 10-digit mobile number"
                                        onChange={handleChange}
                                        value={formData.phoneMobile}
                                        className={`${inputClasses} ${getFieldError('phoneMobile') ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    />
                                    {getFieldError('phoneMobile') && (
                                        <p className={errorClasses}>{getFieldError('phoneMobile')}</p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClasses}>Email *</label>
                                    <input
                                        name="email"
                                        placeholder="Enter email address"
                                        type="email"
                                        onChange={handleChange}
                                        value={formData.email}
                                        className={`${inputClasses} ${getFieldError('email') ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    />
                                    {getFieldError('email') && (
                                        <p className={errorClasses}>{getFieldError('email')}</p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClasses}>Website (Optional)</label>
                                    <input
                                        name="website"
                                        placeholder="Enter website URL"
                                        onChange={handleChange}
                                        value={formData.website}
                                        className={inputClasses}
                                    />
                                </div>

                                <div>
                                    <label className={labelClasses}>Subscription Service *</label>
                                    <select
                                        name="subscriptionService"
                                        value={formData.subscriptionService}
                                        onChange={handleChange}
                                        className={`${inputClasses} ${getFieldError('subscriptionService') ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    >
                                        <option value="Website">🌐 Website</option>
                                        <option value="Google Maps">📍 Google Maps</option>
                                        <option value="SEO">📈 SEO</option>
                                        <option value="Social Media">📱 Social Media</option>
                                        <option value="E-commerce">🛒 E-commerce</option>
                                        <option value="Mobile App">📲 Mobile App</option>
                                        <option value="Other">🔄 Other</option>
                                    </select>
                                    {getFieldError('subscriptionService') && (
                                        <p className={errorClasses}>{getFieldError('subscriptionService')}</p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClasses}>Amount (₹) *</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        placeholder="Enter amount"
                                        onChange={handleChange}
                                        value={formData.amount}
                                        min="0"
                                        step="0.01"
                                        className={`${inputClasses} ${getFieldError('amount') ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    />
                                    {getFieldError('amount') && (
                                        <p className={errorClasses}>{getFieldError('amount')}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <LoadingSpinner />
                                        <span className="ml-2">Creating Order...</span>
                                    </div>
                                ) : "Create Order"}
                            </button>
                        </div>

                        {/* Required Fields Note */}
                        <p className="mt-4 text-sm text-gray-500 text-center">* Required fields</p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OrderForm;