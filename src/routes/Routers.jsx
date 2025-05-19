import { Route, Routes } from "react-router-dom";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import CustomerManagementScreen from "../screens/CustomerManagementScreen";
import OrdersScreen from "../screens/OrdersScreen";
import FinancialScreen from "../screens/FinancialScreen";
import OverviewScreen from "../screens/OverviewScreen";
import ProductScreen from "../screens/ProductScreen";

import Layout from "../Layout/Layout";
import CategoriesScreen from "../screens/CategoriesScreen";
import PromoScreen from "../screens/PromoScreen";

const Routers = () => {
  return (
    <Routes>
      {/* <Route path="/" element={<AdminLogin />} /> */}

      <Route path="/" element={<Layout />}>
        <Route path="/overview" element={<OverviewScreen />} />
        <Route
          path="/customermanagement"
          element={<CustomerManagementScreen />}
        />
        <Route path="/financialreport" element={<FinancialScreen />} />
        <Route path="/orders" element={<OrdersScreen />} />
        <Route path="/analytics" element={<AnalyticsScreen />} />
        <Route path="/products" element={<ProductScreen />} />
        <Route path="/categories" element={<CategoriesScreen />} />
        <Route path="/promo" element={< PromoScreen/>} />
      </Route>
    </Routes>
  );
};

export default Routers;
