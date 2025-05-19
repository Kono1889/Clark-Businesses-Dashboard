import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { FiEdit2, FiTrash2, FiEye, FiPlus, FiSearch, FiFilter } from 'react-icons/fi';
import Modal from 'react-modal';
import categoriesData from '../data/categoriesData.json'; // Your provided JSON data

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const CategoriesScreen = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCreateMode, setIsCreateMode] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCategories(categoriesData.data.categories);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter categories
  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'recent' && new Date(cat.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    return matchesSearch && matchesDate;
  });

  // Chart data for subcategories distribution
  const subcategoryCountData = {
    labels: categories.map(c => c.name),
    datasets: [{
      label: 'Number of Subcategories',
      data: categories.map(c => c.subcategories.length),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#8AC24A', '#F06292', '#7986CB', '#4DB6AC',
        '#FFB74D', '#A1887F', '#90A4AE'
      ]
    }]
  };

  // Chart data for creation trend
  const creationTrendData = {
    labels: [...new Set(categories.map(c => new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })))],
    datasets: [{
      label: 'Categories Added',
      data: Object.values(categories.reduce((acc, c) => {
        const date = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {})),
      backgroundColor: '#4BC0C0',
      borderColor: '#4BC0C0',
      tension: 0.1
    }]
  };

  // Stats calculations
  const totalCategories = categories.length;
  const mostSubcategories = Math.max(...categories.map(c => c.subcategories.length));
  const avgSubcategories = (categories.reduce((sum, c) => sum + c.subcategories.length, 0) / totalCategories).toFixed(1);
  const newThisMonth = categories.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setIsCreateMode(false);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedCategory({
      name: '',
      image: '',
      subcategories: []
    });
    setIsCreateMode(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(cat => cat._id !== id));
    }
  };

  const handleSave = (updatedCategory) => {
    if (isCreateMode) {
      // Simulate creating new category
      const newCategory = {
        ...updatedCategory,
        _id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCategories([...categories, newCategory]);
    } else {
      // Simulate updating existing category
      setCategories(categories.map(cat => 
        cat._id === updatedCategory._id ? { ...cat, ...updatedCategory } : cat
      ));
    }
    closeModal();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Categories Management</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Categories" value={totalCategories} icon="📂" />
        <StatCard title="Most Subcategories" value={mostSubcategories} icon="🗂️" />
        <StatCard title="Avg Subcategories" value={avgSubcategories} icon="📊" />
        <StatCard title="New This Month" value={newThisMonth} icon="🆕" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Subcategories Distribution</h3>
          <Pie data={subcategoryCountData} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Creation Trend</h3>
          <Bar data={creationTrendData} />
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search categories..."
            className="pl-10 p-2 border rounded-lg w-full"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiFilter className="text-gray-400" />
          </div>
          <select 
            className="pl-10 p-2 border rounded-lg"
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="recent">Last 7 Days</option>
          </select>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FiPlus /> Add Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <TableHeader>Name</TableHeader>
              <TableHeader>Subcategories</TableHeader>
              <TableHeader>Image</TableHeader>
              <TableHeader>Created</TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCategories.map(category => (
              <tr key={category._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{category.subcategories.length}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-10 h-10 rounded-md object-cover"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(category.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => openEditModal(category)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    <FiEdit2 className="inline mr-1" /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(category._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FiTrash2 className="inline mr-1" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="modal-overlay"
      >
        {selectedCategory && (
          <CategoryModal 
            category={selectedCategory} 
            onClose={closeModal} 
            onSave={handleSave}
            isCreateMode={isCreateMode}
          />
        )}
      </Modal>
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

const CategoryModal = ({ category, onClose, onSave, isCreateMode }) => {
  const [formData, setFormData] = useState(category);
  const [newSubcategory, setNewSubcategory] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSubcategory = () => {
    if (newSubcategory.trim() && !formData.subcategories.includes(newSubcategory.trim())) {
      setFormData({
        ...formData,
        subcategories: [...formData.subcategories, newSubcategory.trim()]
      });
      setNewSubcategory('');
    }
  };

  const handleRemoveSubcategory = (subcat) => {
    setFormData({
      ...formData,
      subcategories: formData.subcategories.filter(s => s !== subcat)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">
        {isCreateMode ? 'Create New Category' : 'Edit Category'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Category Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Image URL</label>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          {formData.image && (
            <div className="mt-2">
              <img 
                src={formData.image} 
                alt="Preview" 
                className="h-20 object-contain"
              />
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Subcategories</label>
          <div className="flex mb-2">
            <input
              type="text"
              value={newSubcategory}
              onChange={(e) => setNewSubcategory(e.target.value)}
              className="flex-grow p-2 border rounded-l"
              placeholder="Add new subcategory"
            />
            <button
              type="button"
              onClick={handleAddSubcategory}
              className="bg-blue-500 text-white px-4 rounded-r"
            >
              Add
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.subcategories.map(subcat => (
              <div 
                key={subcat} 
                className="bg-gray-100 px-3 py-1 rounded-full flex items-center"
              >
                {subcat}
                <button
                  type="button"
                  onClick={() => handleRemoveSubcategory(subcat)}
                  className="ml-2 text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {isCreateMode ? 'Create' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoriesScreen;