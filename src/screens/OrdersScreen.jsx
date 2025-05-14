import { useState } from "react";
import { motion } from "framer-motion";

// OrderCard Component
const OrderCard = ({ order }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className=" shadow-sm shadow-amber-600  border-b-amber-600 rounded-lg p-4 mb-4 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-amber-700">{order.id}</h3>
          <p className="text-sm text-gray-500">{order.date}</p>
          <p className="font-medium text-amber-700">{order.customer}</p>
        </div>
        <div className="text-right">
          <p className="font-bold">{order.total}</p>
          <p
            className={`text-sm ${
              order.paymentStatus === "Paid" ? "text-green-500" : "text-red-500"
            }`}
          >
            {order.paymentStatus}
          </p>
        </div>
      </div>
      <div className="mt-2 flex justify-between items-center">
        <p className="text-sm">
          {order.items} {order.items > 1 ? "Items" : "Item"}
        </p>
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            order.orderStatus === "Delivered"
              ? "bg-green-100 text-green-800"
              : order.orderStatus === "Shipped"
              ? "bg-blue-100 text-blue-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {order.orderStatus}
        </span>
      </div>
    </motion.div>
  );
};

// StatsCard Component
const StatsCard = ({ title, value }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white p-4 rounded-lg shadow-sm border-4 border-x-0 border-b-0  border-t-amber-600"
    >
      <h3 className="text-amber-900 font-medium text-[14px]">{title}</h3>
      <p className="text-2xl text-amber-600 font-bold">{value}</p>
    </motion.div>
  );
};

// OrdersScreen Component
const OrdersScreen = () => {
  // Sample data
  const ordersData = [
    {
      id: "#H35624367",
      date: "Oct 23, 2024",
      customer: "Makenna Mango",
      total: "$440.00",
      paymentStatus: "Paid",
      items: 2,
      orderStatus: "Order processing",
    },
    {
      id: "#H35624368",
      date: "Oct 18, 2024",
      customer: "Phillip Vaccaro",
      total: "$440.00",
      paymentStatus: "Paid",
      items: 1,
      orderStatus: "Shipped",
    },
    {
      id: "#H35624369",
      date: "Oct 18, 2024",
      customer: "Madelyn Botosh",
      total: "$440.00",
      paymentStatus: "Paid",
      items: 3,
      orderStatus: "Order processing",
    },
    {
      id: "#H35624370",
      date: "Oct 18, 2024",
      customer: "Allison Levin",
      total: "$440.00",
      paymentStatus: "Unpaid",
      items: 1,
      orderStatus: "Order processing",
    },
    {
      id: "#H35624371",
      date: "Oct 18, 2024",
      customer: "Allison Levin",
      total: "$440.00",
      paymentStatus: "Paid",
      items: 1,
      orderStatus: "Delivered",
    },
    {
      id: "#H35624372",
      date: "Oct 18, 2024",
      customer: "Allison Levin",
      total: "$440.00",
      paymentStatus: "Paid",
      items: 1,
      orderStatus: "Delivered",
    },
    {
      id: "#H35624373",
      date: "Oct 18, 2024",
      customer: "Allison Levin",
      total: "$440.00",
      paymentStatus: "Paid",
      items: 1,
      orderStatus: "Shipped",
    },
    {
      id: "#H35624374",
      date: "Oct 18, 2024",
      customer: "Allison Levin",
      total: "$440.00",
      paymentStatus: "Unpaid",
      items: 1,
      orderStatus: "Order processing",
    },
    {
      id: "#H35624375",
      date: "Oct 18, 2024",
      customer: "Allison Levin",
      total: "$440.00",
      paymentStatus: "Paid",
      items: 1,
      orderStatus: "Order processing",
    },
    {
      id: "#H35624376",
      date: "Oct 18, 2024",
      customer: "Allison Levin",
      total: "$440.00",
      paymentStatus: "Paid",
      items: 1,
      orderStatus: "Delivered",
    },
    {
      id: "#H35624377",
      date: "Oct 18, 2024",
      customer: "Allison Levin",
      total: "$440.00",
      paymentStatus: "Paid",
      items: 1,
      orderStatus: "Order processing",
    },
  ];

  // State for filters and sorting
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Filter and sort orders
  const filteredOrders = ordersData
    .filter((order) => {
      // Search filter
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase());

      // Payment status filter
      const matchesPayment =
        paymentFilter === "All" || order.paymentStatus === paymentFilter;

      // Order status filter
      const matchesStatus =
        statusFilter === "All" || order.orderStatus === statusFilter;

      // Tab filter
      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Unfulfilled" &&
          order.orderStatus === "Order processing") ||
        (activeTab === "Unpaid" && order.paymentStatus === "Unpaid") ||
        (activeTab === "Paid" && order.paymentStatus === "Paid") ||
        (activeTab === "Open" && order.orderStatus !== "Delivered") ||
        (activeTab === "Close" && order.orderStatus === "Delivered");

      return matchesSearch && matchesPayment && matchesStatus && matchesTab;
    })
    .sort((a, b) => {
      // Sort by date
      if (sortBy === "date-asc") {
        return new Date(a.date) - new Date(b.date);
      } else if (sortBy === "date-desc") {
        return new Date(b.date) - new Date(a.date);
      }
      // Sort by customer name
      else if (sortBy === "customer-asc") {
        return a.customer.localeCompare(b.customer);
      } else if (sortBy === "customer-desc") {
        return b.customer.localeCompare(a.customer);
      }
      // Sort by total amount
      else if (sortBy === "total-asc") {
        return parseFloat(a.total.slice(1)) - parseFloat(b.total.slice(1));
      } else if (sortBy === "total-desc") {
        return parseFloat(b.total.slice(1)) - parseFloat(a.total.slice(1));
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-2xl font-bold mb-6 text-amber-700">Orders</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatsCard title="Total Orders" value="3,210" />
          <StatsCard title="Ordered items over time" value="3,210" />
          <StatsCard title="Returns" value="3,210" />
          <StatsCard title="Delivered orders overtime" value="3,210" />
        </div>

        {/* Filters and Tabs */}
        <div className="bg-white rounded-lg shadow-sm  p-4 mb-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {["All", "Unfulfilled", "Unpaid", "Paid", "Open", "Close"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm cursor-pointer ${
                    activeTab === tab
                      ? "bg-amber-600  text-white"
                      : "bg-gray-100  hover:bg-gray-200"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Find order
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by ID or customer"
                className="w-full p-2 shadow-xs shadow-amber-600 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="paymentStatus"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Payment Status
              </label>
              <select
                id="paymentStatus"
                className="w-full p-2 shadow-xs shadow-amber-600 rounded-md"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="orderStatus"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Order Status
              </label>
              <select
                id="orderStatus"
                className="w-full p-2 shadow-xs shadow-amber-600 rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Order processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="sortBy"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Sort By
              </label>
              <select
                id="sortBy"
                className="w-full p-2 shadow-xs shadow-amber-600 rounded-md"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date-desc">Date (Newest)</option>
                <option value="date-asc">Date (Oldest)</option>
                <option value="customer-asc">Customer (A-Z)</option>
                <option value="customer-desc">Customer (Z-A)</option>
                <option value="total-asc">Total (Low-High)</option>
                <option value="total-desc">Total (High-Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-sm  p-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => (
                <OrderCard key={index} order={order} />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-10 text-gray-500"
              >
                No orders found matching your criteria
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrdersScreen;
