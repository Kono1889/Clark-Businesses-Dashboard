import { Route, Routes } from "react-router-dom";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import CustomerManagementScreen from "../screens/CustomerManagementScreen";
import OrdersScreen from "../screens/OrdersScreen";
import FinancialScreen from "../screens/FinancialScreen";
import OverviewScreen from "../screens/OverviewScreen";
import Layout from "../Layout/Layout";

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
      </Route>

    </Routes>
  );
};

export default Routers;
