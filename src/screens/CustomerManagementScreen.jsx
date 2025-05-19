import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import userData from '../data/userData.json';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const CustomerManagementScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    // Set users from imported JSON data
    setUsers(userData.data.users);
    setLoading(false);
  }, []);

  // Filter users by search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Stats for cards
  const totalUsers = users.length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalSellers = users.filter(u => u.isSeller).length;
  const totalVerified = users.filter(u => u.isVerified).length;

  // Chart data
  const roleData = {
    labels: ['Admins', 'Users'],
    datasets: [{
      data: [totalAdmins, totalUsers - totalAdmins],
      backgroundColor: ['#FF6384', '#36A2EB']
    }]
  };

  // Group signups by date
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

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Customer Management</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Users" value={totalUsers} icon="👥" />
        <StatCard title="Admins" value={totalAdmins} icon="🛡️" />
        <StatCard title="Sellers" value={totalSellers} icon="🛒" />
        <StatCard title="Verified" value={totalVerified} icon="✅" />
      </div>

      {/* Charts */}
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

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
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
              <TableRow key={user._id} user={user} />
            ))}
          </tbody>
        </table>
      </div>
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

const TableRow = ({ user }) => (
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

export default CustomerManagementScreen;