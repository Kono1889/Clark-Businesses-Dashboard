import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Plus, Trash2, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

// Ghana regions and towns data
const GHANA_LOCATIONS = [
  {
    "region": "Greater Accra",
    "capital": "Accra",
    "towns": ["Accra", "Tema", "Madina", "Teshie", "Nungua", "Dansoman", "Adenta", "Lapaz"]
  },
  {
    "region": "Ashanti",
    "capital": "Kumasi",
    "towns": ["Kumasi", "Obuasi", "Ejisu", "Konongo", "Mampong", "Asante Bekwai", "Offinso"]
  },
  {
    "region": "Eastern",
    "capital": "Koforidua",
    "towns": ["Koforidua", "Nkawkaw", "Akosombo", "Suhum", "Nsawam", "Akim Oda"]
  },
  {
    "region": "Western",
    "capital": "Sekondi-Takoradi",
    "towns": ["Takoradi", "Sekondi", "Tarkwa", "Axim", "Shama", "Agona Nkwanta"]
  },
  {
    "region": "Central",
    "capital": "Cape Coast",
    "towns": ["Cape Coast", "Kasoa", "Mankessim", "Winneba", "Elmina", "Assin Fosu"]
  },
  {
    "region": "Volta",
    "capital": "Ho",
    "towns": ["Ho", "Aflao", "Keta", "Kpando", "Akatsi", "Anloga"]
  },
  {
    "region": "Northern",
    "capital": "Tamale",
    "towns": ["Tamale", "Yendi", "Savelugu", "Gushegu", "Karaga", "Walewale"]
  },
  {
    "region": "Upper East",
    "capital": "Bolgatanga",
    "towns": ["Bolgatanga", "Bawku", "Navrongo", "Zebilla", "Sandema"]
  },
  {
    "region": "Upper West",
    "capital": "Wa",
    "towns": ["Wa", "Tumu", "Nadowli", "Lawra", "Jirapa"]
  },
  {
    "region": "Bono",
    "capital": "Sunyani",
    "towns": ["Sunyani", "Berekum", "Dormaa Ahenkro", "Wenchi"]
  },
  {
    "region": "Bono East",
    "capital": "Techiman",
    "towns": ["Techiman", "Kintampo", "Nkoranza", "Atebubu"]
  },
  {
    "region": "Ahafo",
    "capital": "Goaso",
    "towns": ["Goaso", "Bechem", "Hwidiem", "Kenyasi"]
  },
  {
    "region": "Oti",
    "capital": "Dambai",
    "towns": ["Dambai", "Krachi", "Nkwanta", "Jasikan"]
  },
  {
    "region": "Savannah",
    "capital": "Damongo",
    "towns": ["Damongo", "Salaga", "Bole", "Sawla"]
  },
  {
    "region": "North East",
    "capital": "Nalerigu",
    "towns": ["Nalerigu", "Walewale", "Chereponi", "Gambaga"]
  },
  {
    "region": "Western North",
    "capital": "Sefwi Wiawso",
    "towns": ["Sefwi Wiawso", "Bibiani", "Juaboso", "Enchi"]
  }
];

const AddProducts = () => {
  const { user, fetchUserProfile } = useAuth();
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm();
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
        toast.error('Failed to load categories and promotion plans', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    };

    fetchData();
  }, []);

  // Check for payment success on component mount (when returning from payment)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const productId = urlParams.get('product_id') || localStorage.getItem('pendingProductId');

    if (paymentStatus === 'success' && productId) {
      handlePaymentSuccess(productId);
      localStorage.removeItem('pendingProductId');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'cancelled' && productId) {
      handlePaymentCancellation(productId);
      localStorage.removeItem('pendingProductId');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handlePaymentSuccess = async (productId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Update product with payment verification
      await axios.patch(
        `https://clark-backend.onrender.com/api/v1/products/${productId}/activate-promotion`,
        {
          paymentVerified: true,
          paymentStatus: 'completed'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      toast.success('Payment successful! Your product is now live with premium promotion.', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Navigate to products page after a short delay
      setTimeout(() => {
        navigate('/products');
      }, 2000);

    } catch (err) {
      console.error('Error activating promotion after payment:', err);
      toast.error('Payment successful but failed to activate promotion. Please contact support.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentCancellation = async (productId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Delete the product since payment was cancelled
      await axios.delete(
        `https://clark-backend.onrender.com/api/v1/products/${productId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      toast.error('Payment was cancelled. Product has been removed.', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

    } catch (err) {
      console.error('Error removing product after payment cancellation:', err);
      toast.warning('Payment cancelled. Please check your products and contact support if needed.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    // Validate images
    if (productImages.length === 0) {
      toast.error('Please upload at least one product image', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    if (productImages.length > 5) {
      toast.error('Maximum 5 images allowed', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Check each image size
    for (const image of productImages) {
      if (image.size > 10 * 1024 * 1024) { // 10MB
        toast.error('Each image should be less than 10MB', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }
    }

    // Validate location fields
    if (!data.region) {
      toast.error('Please select a region', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    if (!data.town) {
      toast.error('Please select a town', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    if (!data.specificAddress) {
      toast.error('Please enter a specific address', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
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
      
      // Append location data
      formData.append('region', data.region);
      formData.append('town', data.town);
      formData.append('specificAddress', data.specificAddress);
      
      // Also append in location object format (backend might expect this structure)
      formData.append('location[region]', data.region);
      formData.append('location[town]', data.town);
      formData.append('location[specificAddress]', data.specificAddress);
      
      // Find the selected region's capital
      const selectedRegion = GHANA_LOCATIONS.find(loc => loc.region === data.region);
      if (selectedRegion) {
        formData.append('location[capital]', selectedRegion.capital);
      }
      
      // Append optional discount (only if provided and not empty)
      if (data.discount && data.discount.trim() !== '') {
        formData.append('discount', data.discount);
      }
      
      // Append optional tags (only if provided and not empty)
      if (data.tags && data.tags.trim() !== '') {
        formData.append('tags', data.tags);
      }
      
      // Append images
      productImages.forEach((image, index) => {
        formData.append('images', image);
      });

      // For premium plans, mark as pending payment
      if (selectedPromotion !== 'free') {
        formData.append('promotionPlan[type]', selectedPromotion);
        formData.append('promotionPlan[paymentStatus]', 'pending');
        formData.append('status', 'draft'); // Keep as draft until payment
      }

      // Create the product first
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

      const productId = response.data.data.product._id;

      // If premium plan selected, redirect to payment
      if (selectedPromotion !== 'free') {
        const selectedPlan = promotionPlans.find(plan => plan.type === selectedPromotion);
        if (selectedPlan) {
          // Store product ID for after payment
          localStorage.setItem('pendingProductId', productId);

          const paymentResponse = await axios.post(
            'https://clark-backend.onrender.com/api/v1/payments/initialize',
            {
              email: user.email,
              amount: selectedPlan.price,
              productId: productId,
              planType: selectedPromotion,
              callback_url: `${window.location.origin}${window.location.pathname}?payment=success&product_id=${productId}`,
              cancel_url: `${window.location.origin}${window.location.pathname}?payment=cancelled&product_id=${productId}`
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          toast.info('Product created! Redirecting to payment to activate promotion...', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          
          // Redirect to payment URL after a short delay
          setTimeout(() => {
            window.location.href = paymentResponse.data.data.authorization_url;
          }, 3000);
          return;
        }
      }

      // Show success toast for free plan
      toast.success('Product added successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Reset form
      resetForm();

      // Navigate to products page after a short delay
      setTimeout(() => {
        navigate('/products');
      }, 1500);

    } catch (err) {
      console.error('Error submitting product:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add product. Please try again.';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setProductImages([]);
    setValue('productName', '');
    setValue('price', '');
    setValue('businessDescription', '');
    setValue('categoryId', '');
    setValue('subcategory', '');
    setValue('quantity', '');
    setValue('discount', '');
    setValue('tags', '');
    setValue('region', '');
    setValue('town', '');
    setValue('specificAddress', '');
    setSelectedPromotion('free');
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Check total number of images
    if (productImages.length + files.length > 5) {
      toast.error('Maximum 5 images allowed', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    
    // Check each file size
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error('Each image should be less than 10MB', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }
    }
    
    setProductImages([...productImages, ...files]);
    setError('');
  };

  const removeImage = (index) => {
    setProductImages(productImages.filter((_, i) => i !== index));
    toast.info('Image removed', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // Handle region change and reset town
  const handleRegionChange = (e) => {
    const selectedRegion = e.target.value;
    setValue('region', selectedRegion);
    setValue('town', ''); // Reset town when region changes
  };

  // Get subcategories for selected category
  const selectedCategoryId = watch('categoryId');
  const selectedCategory = categories.find(cat => cat._id === selectedCategoryId);
  const subcategories = selectedCategory?.subcategories || [];

  // Get towns for selected region
  const selectedRegion = watch('region');
  const selectedLocationData = GHANA_LOCATIONS.find(loc => loc.region === selectedRegion);
  const availableTowns = selectedLocationData?.towns || [];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Product Management</h1>
      
      {/* Error Messages */}
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
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.productName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Full Spectrum CBD Tincture - Pet Tincture"
              {...register('productName', { required: 'Product name is required' })}
            />
            {errors.productName && (
              <span className="text-red-500 text-sm">{errors.productName.message}</span>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Description*</label>
            <textarea
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.businessDescription ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              placeholder="We've partnered with Coastal Green Wellness based out of Myrtle Beach South Carolina"
              {...register('businessDescription', { required: 'Description is required' })}
            ></textarea>
            {errors.businessDescription && (
              <span className="text-red-500 text-sm">{errors.businessDescription.message}</span>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition*</label>
            <select
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.condition ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('condition', { required: 'Condition is required' })}
            >
              <option value="">Select condition</option>
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="refurbished">Refurbished</option>
            </select>
            {errors.condition && (
              <span className="text-red-500 text-sm">{errors.condition.message}</span>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Optional)</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Fast, Turbo Engine, Affordable (comma-separated)"
              {...register('tags')}
            />
            <p className="text-xs text-gray-500 mt-1">Add relevant tags separated by commas to help customers find your product</p>
          </div>
        </section>

        {/* Location Section - Enhanced */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Location*</h2>
          <p className="text-sm text-gray-600 mb-4">Please specify your product location to help customers find items near them.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.region ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('region', { required: 'Region is required' })}
                onChange={handleRegionChange}
              >
                <option value="">Select a region</option>
                {GHANA_LOCATIONS.map(location => (
                  <option key={location.region} value={location.region}>
                    {location.region}
                  </option>
                ))}
              </select>
              {errors.region && (
                <span className="text-red-500 text-sm">{errors.region.message}</span>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Town <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.town ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('town', { required: 'Town is required' })}
                disabled={!selectedRegion}
              >
                <option value="">{selectedRegion ? 'Select a town' : 'Select region first'}</option>
                {availableTowns.map((town, index) => (
                  <option key={index} value={town}>
                    {town}
                  </option>
                ))}
              </select>
              {errors.town && (
                <span className="text-red-500 text-sm">{errors.town.message}</span>
              )}
              {!selectedRegion && (
                <p className="text-xs text-gray-500 mt-1">Please select a region first</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specific Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.specificAddress ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="123 Independence Avenue, Osu"
              {...register('specificAddress', { required: 'Specific address is required' })}
            />
            {errors.specificAddress && (
              <span className="text-red-500 text-sm">{errors.specificAddress.message}</span>
            )}
            <p className="text-xs text-gray-500 mt-1">Enter your detailed address (street, building, landmark, etc.)</p>
          </div>
        </section>

        {/* Category Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Category*</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Main Category</label>
              <select
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.categoryId ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('categoryId', { required: 'Category is required' })}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <span className="text-red-500 text-sm">{errors.categoryId.message}</span>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
              <select
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.subcategory ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('subcategory', { required: 'Subcategory is required' })}
                disabled={!selectedCategoryId}
              >
                <option value="">Select a subcategory</option>
                {subcategories.map((subcategory, index) => (
                  <option key={index} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
              {errors.subcategory && (
                <span className="text-red-500 text-sm">{errors.subcategory.message}</span>
              )}
            </div>
          </div>
        </section>

        {/* Product Images Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Product Images* (Max 5, 10MB each)</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4 hover:border-indigo-400 transition-colors">
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
                className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
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
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
                min="0"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="180.00"
                {...register('price', { 
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
              />
              {errors.price && (
                <span className="text-red-500 text-sm">{errors.price.message}</span>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%) - Optional</label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.discount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="30"
                {...register('discount', {
                  min: { value: 0, message: 'Discount cannot be negative' },
                  max: { value: 100, message: 'Discount cannot exceed 100%' }
                })}
              />
              {errors.discount && (
                <span className="text-red-500 text-sm">{errors.discount.message}</span>
              )}
              <p className="text-xs text-gray-500 mt-1">Leave empty for no discount</p>
            </div>
          </div>
        </section>

        {/* Promotion Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Promotion Plan</h2>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
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
              <label key={plan._id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  className="text-indigo-600 focus:ring-indigo-500"
                  checked={selectedPromotion === plan.type}
                  onChange={() => setSelectedPromotion(plan.type)}
                />
                <span className="flex-1">
                  <span className="block font-medium">{plan.name} (${plan.price})</span>
                  <span className="block text-sm text-gray-500">{plan.description}</span>
                  {selectedPromotion === plan.type && (
                    <span className="block text-xs text-blue-600 mt-1">
                      📝 Product will be created first, then payment will activate promotion
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Form Actions */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/products')}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : selectedPromotion === 'free' ? (
              'Add Product'
            ) : (
              'Create Product & Pay'
            )}
          </button>
        </div>
      </form>
      
      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default AddProducts;