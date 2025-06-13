import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Plus, Trash2, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast'; // Assuming you're using react-hot-toast
// import { toast } from 'react-toastify'; // Alternative if using react-toastify
import axios from 'axios';

const AddProducts = () => {
  const { user, fetchUserProfile } = useAuth();
  const { register, handleSubmit, control, setValue, watch } = useForm();
  const navigate = useNavigate();
  const [productImages, setProductImages] = useState([]);
  const [selectedSellingType, setSelectedSellingType] = useState('both');
  const [categories, setCategories] = useState([]);
  const [promotionPlans, setPromotionPlans] = useState([]);
  const [selectedPromotion, setSelectedPromotion] = useState('free');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch categories and promotion plans on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        // Fetch categories
        const categoriesResponse = await axios.get(
          'https://clark-backend.onrender.com/api/v1/categories',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Cookie': `refreshToken=${localStorage.getItem('refreshToken')}`
            }
          }
        );
        setCategories(categoriesResponse.data.data.categories);

        // Fetch promotion plans
        const promotionsResponse = await axios.get(
          'https://clark-backend.onrender.com/api/v1/promotions',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Cookie': `refreshToken=${localStorage.getItem('refreshToken')}`
            }
          }
        );
        setPromotionPlans(promotionsResponse.data.data.promotionPlans);
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load categories and promotion plans');
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data) => {
    if (productImages.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }

    if (productImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    // Check each image size
    for (const image of productImages) {
      if (image.size > 10 * 1024 * 1024) { // 10MB
        toast.error('Each image should be less than 10MB');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      
      // Append basic product data
      formData.append('name', data.productName);
      formData.append('price', data.price);
      formData.append('description', data.businessDescription);
      formData.append('categoryId', data.categoryId);
      formData.append('subcategory', data.subcategory);
      formData.append('condition', data.condition || 'new');
      
      // Append images
      productImages.forEach((image, index) => {
        formData.append('images', image);
      });

      // Append promotion plan if selected
      if (selectedPromotion !== 'free') {
        formData.append('promotionPlan[type]', selectedPromotion);
      }

      const response = await axios.post(
        'https://clark-backend.onrender.com/api/v1/products',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      // If premium plan selected, redirect to payment
      if (selectedPromotion !== 'free') {
        const selectedPlan = promotionPlans.find(plan => plan.type === selectedPromotion);
        if (selectedPlan) {
          const paymentResponse = await axios.post(
            'https://clark-backend.onrender.com/api/v1/payments/initialize',
            {
              email: user.email,
              amount: selectedPlan.price, // convert to kobo
              productId: response.data.data.product._id,
              planType: selectedPromotion
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          // Show success message before redirect
          toast.success('Product added successfully! Redirecting to payment...');
          
          // Redirect to payment URL
          window.location.href = paymentResponse.data.data.authorization_url;
          return;
        }
      }

      // Show success toast
      toast.success('Product added successfully!');
      
      // Reset form
      setProductImages([]);
      setValue('productName', '');
      setValue('price', '');
      setValue('businessDescription', '');
      setValue('categoryId', '');
      setValue('subcategory', '');
      setValue('quantity', '');

      // Navigate to analytics page after a short delay
      setTimeout(() => {
        navigate('/products');
      }, 1500);

    } catch (err) {
      console.error('Error submitting product:', err);
      toast.error(err.response?.data?.message || 'Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Check total number of images
    if (productImages.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    // Check each file size
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error('Each image should be less than 10MB');
        return;
      }
    }
    
    setProductImages([...productImages, ...files]);
    setError('');
  };

  const removeImage = (index) => {
    setProductImages(productImages.filter((_, i) => i !== index));
  };

  // Get subcategories for selected category
  const selectedCategoryId = watch('categoryId');
  const selectedCategory = categories.find(cat => cat._id === selectedCategoryId);
  const subcategories = selectedCategory?.subcategories || [];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Product Management</h1>
      
      {/* Error Messages (keeping for validation errors) */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Description Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name*</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Full Spectrum CBD Tincture - Pet Tincture"
              {...register('productName', { required: true })}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Description*</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="We've partnered with Coastal Green Wellness based out of Myrtle Beach South Carolina"
              {...register('businessDescription', { required: true })}
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition*</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              {...register('condition', { required: true })}
            >
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="refurbished">Refurbished</option>
            </select>
          </div>
        </section>

        {/* Category Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Category*</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Main Category</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                {...register('categoryId', { required: true })}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                {...register('subcategory', { required: true })}
                disabled={!selectedCategoryId}
              >
                <option value="">Select a subcategory</option>
                {subcategories.map((subcategory, index) => (
                  <option key={index} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Product Images Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Product Images* (Max 5, 10MB each)</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
            <div className="flex flex-col items-center justify-center py-8">
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">Drag and drop images here or click to browse</p>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                id="image-upload"
                onChange={handleImageUpload}
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
              >
                Upload Images
              </label>
            </div>
            
            {productImages.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {productImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Pricing Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Pricing*</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="180.00"
                {...register('price', { required: true })}
              />
            </div>
          </div>
        </section>

        {/* Promotion Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Promotion Plan</h2>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                className="text-indigo-600 focus:ring-indigo-500"
                checked={selectedPromotion === 'free'}
                onChange={() => setSelectedPromotion('free')}
              />
              <span className="flex-1">
                <span className="block font-medium">Free Plan</span>
                <span className="block text-sm text-gray-500">Standard visibility for your product</span>
              </span>
            </label>
            
            {promotionPlans.map(plan => (
              <label key={plan._id} className="flex items-center space-x-3">
                <input
                  type="radio"
                  className="text-indigo-600 focus:ring-indigo-500"
                  checked={selectedPromotion === plan.type}
                  onChange={() => setSelectedPromotion(plan.type)}
                />
                <span className="flex-1">
                  <span className="block font-medium">{plan.name} (${plan.price})</span>
                  <span className="block text-sm text-gray-500">{plan.description}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Form Actions */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Processing...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProducts;