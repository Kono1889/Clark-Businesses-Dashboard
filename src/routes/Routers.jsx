import { Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import CustomerManagementScreen from "../screens/CustomerManagementScreen";
import OrdersScreen from "../screens/OrdersScreen";
import FinancialScreen from "../screens/FinancialScreen";
import OverviewScreen from "../screens/OverviewScreen";
import ProductScreen from "../screens/ProductScreen";
import Layout from "../Layout/Layout";
import CategoriesScreen from "../screens/CategoriesScreen";
import PromoScreen from "../screens/PromoScreen";
import AdminLogin from "../screens/Login";
import AddProduct from "../screens/AddProduct";

const Routers = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in when component mounts
  useEffect(() => {
    const checkAuthStatus = () => {
      const sessionToken = sessionStorage.getItem('authToken');
      const localToken = localStorage.getItem('accessToken');
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      
      if (sessionToken || (localToken && isLoggedIn)) {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuthStatus();

    // Listen for storage changes (useful for login from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'accessToken' || e.key === 'isLoggedIn') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    // Store authentication state
    sessionStorage.setItem('authToken', 'authenticated');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    // Clear all authentication data
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('isLoggedIn');
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  // If authenticated, show the main app
  return (
    <Routes>
      <Route path="/" element={<Layout onLogout={handleLogout} />}>
        <Route index element={<OverviewScreen />} />
        <Route path="/overview" element={<OverviewScreen />} />
        <Route path="/customermanagement" element={<CustomerManagementScreen />} />
        <Route path="/financialreport" element={<FinancialScreen />} />
        <Route path="/orders" element={<OrdersScreen />} />
        <Route path="/analytics" element={<AnalyticsScreen />} />
        <Route path="/products" element={<ProductScreen />} />
        <Route path="/categories" element={<CategoriesScreen />} />
        <Route path="/promo" element={<PromoScreen />} />
                <Route path="/add-product" element={<AddProduct />} />

      </Route>
    </Routes>
  );
};

export default Routers;