import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import userData from '../data/userData.json';
import productData from '../data/productData.json';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const CustomerManagementScreen = () => {
  // User states
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Product states
  const [products, setProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'products'
  const [priceRangeFilter, setPriceRangeFilter] = useState('all');

  useEffect(() => {
    // Load user data
    setUsers(userData.data.users);
    setUserLoading(false);
    
    // Load product data
    setProducts(productData.data.products);
    setProductLoading(false);
  }, []);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Filter products
  const filteredProducts = products.filter(product => {
    // Price range filter
    let priceMatch = true;
    if (priceRangeFilter === 'under100') priceMatch = product.price < 100;
    else if (priceRangeFilter === '100to500') priceMatch = product.price >= 100 && product.price <= 500;
    else if (priceRangeFilter === 'over500') priceMatch = product.price > 500;
    
    return priceMatch;
  });

  // User stats
  const totalUsers = users.length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalSellers = users.filter(u => u.isSeller).length;
  const totalVerified = users.filter(u => u.isVerified).length;

  // Product stats
  const totalProducts = products.length;
  const discountedProducts = products.filter(p => p.discount !== null).length;
  const avgProductPrice = products.reduce((sum, p) => sum + p.price, 0) / totalProducts;
  const totalProductViews = products.reduce((sum, p) => sum + p.views, 0);

  // User chart data
  const roleData = {
    labels: ['Admins', 'Users'],
    datasets: [{
      data: [totalAdmins, totalUsers - totalAdmins],
      backgroundColor: ['#FF6384', '#36A2EB']
    }]
  };

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

  if (userLoading || productLoading) {
    return <div className="p-6">Loading...</div>;
  }
const signupsByDate = users.reduce((acc, user) => {
  const date = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  acc[date] = (acc[date] || 0) + 1;
  return acc;
}, {});

const signupData = {
  labels: Object.keys(signupsByDate),
  datasets: [{
    label: 'New Signups',
    data: Object.values(signupsByDate),
    backgroundColor: '#4CAF50'
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
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Management Dashboard</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'users' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('users')}
        >
          Users ({totalUsers})
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'products' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('products')}
        >
          Products ({totalProducts})
        </button>
      </div>

      {activeTab === 'users' ? (
        <>
          {/* User Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard title="Total Users" value={totalUsers} icon="👥" />
            <StatCard title="Admins" value={totalAdmins} icon="🛡️" />
            <StatCard title="Sellers" value={totalSellers} icon="🛒" />
            <StatCard title="Verified" value={totalVerified} icon="✅" />
          </div>

          {/* User Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">User Roles</h3>
              <Pie data={roleData} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Signup Trends</h3>
              <Bar data={signupData} />
            </div>
          </div>

          {/* User Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="p-2 border rounded-lg flex-grow"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="p-2 border rounded-lg"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="user">Users</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Email</TableHeader>
                  <TableHeader>Role</TableHeader>
                  <TableHeader>Seller</TableHeader>
                  <TableHeader>Joined</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <UserTableRow key={user._id} user={user} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

// Reusable Components
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex justify-between items-center">
      <span className="text-gray-500">{title}</span>
      <span className="text-2xl">{icon}</span>
    </div>
    <div className="text-3xl font-bold mt-2">{value}</div>
  </div>
);

const TableHeader = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    {children}
  </th>
);

const UserTableRow = ({ user }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="text-sm font-medium text-gray-900">{user.username}</div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`px-2 py-1 text-xs rounded-full ${
        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
      }`}>
        {user.role}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      {user.isSeller ? (
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Yes</span>
      ) : (
        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">No</span>
      )}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {new Date(user.createdAt).toLocaleDateString()}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
      <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
      <button className="text-red-600 hover:text-red-900">Delete</button>
    </td>
  </tr>
);

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

export default CustomerManagementScreen;