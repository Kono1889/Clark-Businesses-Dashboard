import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import productData from '../data/productData.json';
import StatCard from '../components/statCard/StatCard';
import TableHeader from '../components/tableHeader/TableHeader';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const ProductScreen = () => {
  const [products, setProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRangeFilter, setPriceRangeFilter] = useState('all');

  useEffect(() => {
    // Load product data
    setProducts(productData.data.products);
    setProductLoading(false);
  }, []);

  // Filter products
  const filteredProducts = products.filter(product => {
    // Name search filter
    const nameMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Price range filter
    let priceMatch = true;
    if (priceRangeFilter === 'under100') priceMatch = product.price < 100;
    else if (priceRangeFilter === '100to500') priceMatch = product.price >= 100 && product.price <= 500;
    else if (priceRangeFilter === 'over500') priceMatch = product.price > 500;
    
    return nameMatch && priceMatch;
  });

  // Product stats
  const totalProducts = products.length;
  const discountedProducts = products.filter(p => p.discount !== null).length;
  const avgProductPrice = products.reduce((sum, p) => sum + p.price, 0) / totalProducts;
  const totalProductViews = products.reduce((sum, p) => sum + p.views, 0);

  // Product chart data
  const productCategoryData = {
    labels: [...new Set(products.map(p => p.subcategory))],
    datasets: [{
      data: [...new Set(products.map(p => p.subcategory))].map(cat => 
        products.filter(p => p.subcategory === cat).length
      ),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
    }]
  };

  const priceRanges = {
    'Under $100': products.filter(p => p.price < 100).length,
    '$100-$500': products.filter(p => p.price >= 100 && p.price <= 500).length,
    'Over $500': products.filter(p => p.price > 500).length
  };

  const priceDistributionData = {
    labels: Object.keys(priceRanges),
    datasets: [{
      label: 'Products by Price Range',
      data: Object.values(priceRanges),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
    }]
  };

  if (productLoading) {
    return <div className="p-6">Loading products...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Product Management</h1>

      {/* Product Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Products" value={totalProducts} icon="📦" />
        <StatCard title="Discounted" value={discountedProducts} icon="🏷️" />
        <StatCard title="Avg. Price" value={`$${avgProductPrice.toFixed(2)}`} icon="💰" />
        <StatCard title="Total Views" value={totalProductViews} icon="👀" />
      </div>

      {/* Product Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Categories</h3>
          <Pie data={productCategoryData} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Price Distribution</h3>
          <Bar data={priceDistributionData} />
        </div>
      </div>

      {/* Product Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search products by name..."
          className="p-2 border rounded-lg flex-grow"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="p-2 border rounded-lg"
          onChange={(e) => setPriceRangeFilter(e.target.value)}
        >
          <option value="all">All Prices</option>
          <option value="under100">Under $100</option>
          <option value="100to500">$100 - $500</option>
          <option value="over500">Over $500</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <TableHeader>Product</TableHeader>
              <TableHeader>Price</TableHeader>
              <TableHeader>Discount</TableHeader>
              <TableHeader>Views</TableHeader>
              <TableHeader>Rating</TableHeader>
              <TableHeader>Seller</TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <ProductTableRow key={product._id} product={product} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProductTableRow = ({ product }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        {product.images.length > 0 ? (
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-10 h-10 rounded-md object-cover mr-3"
          />
        ) : (
          <div className="w-10 h-10 rounded-md bg-gray-200 mr-3 flex items-center justify-center">
            <span className="text-xs text-gray-500">No Image</span>
          </div>
        )}
        <div>
          <div className="text-sm font-medium text-gray-900">{product.name}</div>
          <div className="text-xs text-gray-500">{product.subcategory}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      ${product.price.toFixed(2)}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      {product.discount ? (
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
          {product.discount}%
        </span>
      ) : (
        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
          None
        </span>
      )}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {product.views}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      {product.rating > 0 ? (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
          {product.rating.toFixed(1)} ★
        </span>
      ) : (
        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
          No ratings
        </span>
      )}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {product.owner.username}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
      <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
      <button className="text-red-600 hover:text-red-900">Delete</button>
    </td>
  </tr>
);

export default ProductScreen;