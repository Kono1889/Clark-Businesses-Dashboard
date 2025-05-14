import { useState } from "react";
import { motion } from "framer-motion";
import salesimg from "../assets/headphonesMain.avif";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// StatsCard Component
const StatsCard = ({
  title,
  description,
  value,
  increase,
  icon,
  isIncreasing,
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-xl shadow-sm"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg text-amber-700 font-bold">{title}</h3>
          <p className="text-sm text-amber-600 mb-2">{description}</p>
          <p className="text-2xl text-amber-700 font-bold">{value}</p>
          <div
            className={`flex items-center mt-2 ${
              isIncreasing ? "text-[#328E6E]" : "text-[#D04848]"
            }`}
          >
            {isIncreasing ? (
              <ArrowUpIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 mr-1" />
            )}
            <span className="text-sm">{increase}</span>
          </div>
        </div>
        {icon && (
          <div
            className={`p-3 rounded-lg ${
              isIncreasing
                ? "bg-blue-100 text-[#0A3981]"
                : "bg-red-100 text-[#E38E49]"
            }`}
          >
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
};
// ProductCard Component
const ProductCard = ({ product }) => {
  return (
    <motion.div
      whileHover={{ x: 5 }}
      className="flex items-center justify-between p-4 hover:bg-gray-50"
    >
      <div className="flex items-center space-x-4">
        <div className="bg-gray-100 rounded-lg w-12 h-12 flex items-center justify-center overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-500">No Image</span>
          )}
        </div>

        <div>
          <h4 className="font-medium">{product.name}</h4>
          <p className="text-sm text-gray-500 line-clamp-1">
            {product.description}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-8">
        <span
          className={`px-3 py-1 rounded-full text-xs ${
            product.status === "Uploaded"
              ? "bg-green-100 text-green-800"
              : product.status === "Drafted"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {product.status}
        </span>
        <span className="font-medium w-20 text-right">{product.price}</span>
        <span className="text-sm text-gray-500 w-32">{product.created}</span>
      </div>
    </motion.div>
  );
};

// OverviewScreen Component
const OverviewScreen = () => {
  // Sample data for newest products
  const productsData = [
    {
      image: salesimg,
      name: "Headphone 8 pro",
      description: "Featuring cutting-edge noise...",
      status: "Uploaded",
      price: "$43.44",
      created: "Feb 2, 2019 19:28",
    },
    {
      image: salesimg,
      name: "Wireless mouse Ligo",
      description: "Designed for both work and p...",
      status: "Drafted",
      price: "$21.13",
      created: "Dec 7, 2019 23:26",
    },
    {
      image: salesimg,
      name: "Bluetooth speaker Round",
      description: "Experienced the perfect fusion...",
      status: "Uploaded",
      price: "$99.43",
      created: "Dec 30, 2019 05:18",
    },
    {
      image: salesimg,
      name: "Earbuds Jack",
      description: "With seamless Bluetooth icon...",
      status: "Uploaded",
      price: "$26.61",
      created: "Dec 30, 2019 07:52",
    },
    {
      image: salesimg,
      name: "Smart CCTV",
      description: "Protect your home or business...",
      status: "Return",
      price: "$86.27",
      created: "Dec 4, 2019 21:42",
    },
  ];

  // Data for sales chart
  const salesChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Sales",
        data: [1200, 1900, 3000, 5000, 2000, 3000, 1981],
        backgroundColor: "rgba(50, 142, 110, 0.1)", // 328E6E with 10% opacity
        borderWidth: 2,
        tension: 0.4,
        segment: {
          borderColor: (ctx) => {
            const prev = ctx.p0.parsed.y;
            const curr = ctx.p1.parsed.y;
            return curr >= prev ? "#328E6E" : "#D04848";
          },
        },
        pointBackgroundColor: function (context) {
          const index = context.dataIndex;
          if (index === 0) return "#328E6E"; // First point uses increase color
          const current = context.dataset.data[index];
          const previous = context.dataset.data[index - 1];
          return current >= previous ? "#328E6E" : "#D04848";
        },
        pointBorderColor: "#FFFFFF", // White border for points
        pointBorderWidth: 2,
        fill: true,
      },
    ],
  };

  // Data for audience chart
  const audienceData = {
    labels: ["Female", "Male", "Others"],
    datasets: [
      {
        data: [25, 15, 5],
        backgroundColor: [
          "rgb(253, 228, 158)",
          "rgb(254, 185, 65)",
          "rgb(221, 118, 28)",
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl text-amber-700 font-bold">Overview</h1>
          {/* <p className="text-gray-500">
            Get up-to-the-minute insights. No more waiting for reports
          </p> */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatsCard
            title="Total Product Viewed"
            description="Customers have visited and clicked product"
            value="421.109"
            increase="21k* Increase"
            isIncreasing={true}
          />
          <StatsCard
            title="Total Sales"
            description="Product have been sided"
            value="$28.912"
            increase="$7k* Decrease" // Changed to "Decrease" for example
            isIncreasing={false}
          />
          <StatsCard
            title="Balance"
            description="amount of income and results"
            value="$125.235"
            increase="7k* Increase"
            isIncreasing={true}
          />
        </div>

        {/* Charts and Products Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Sales Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm ">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Sales Overview</h3>
              <button className="text-sm text-blue-600 flex items-center">
                See detail <ChevronRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="h-64">
              <Line
                data={salesChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: "#1F2937",
                      titleColor: "#F3F4F6",
                      bodyColor: "#E5E7EB",
                      callbacks: {
                        label: (ctx) => `$${ctx.parsed.y.toLocaleString()}`,
                        afterLabel: function (context) {
                          const index = context.dataIndex;
                          if (index === 0) return null;
                          const current = context.dataset.data[index];
                          const previous = context.dataset.data[index - 1];
                          const change = current - previous;
                          const percentage = (
                            (change / previous) *
                            100
                          ).toFixed(2);

                          return change >= 0
                            ? `↑ $${Math.abs(change)} (${percentage}%)`
                            : `↓ $${Math.abs(change)} (${percentage}%)`;
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: false,
                      grid: { color: "#E5E7EB" },
                      ticks: {
                        callback: (value) => `$${value}`,
                        color: "#6B7280",
                      },
                    },
                    x: {
                      grid: { display: false },
                      ticks: { color: "#6B7280" },
                    },
                  },
                  elements: {
                    line: { tension: 0.4 },
                    point: {
                      radius: 4,
                      hoverRadius: 8,
                      hoverBorderWidth: 2,
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Audience Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm ">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Audience</h3>
              <button className="text-sm text-blue-600 flex items-center">
                See detail <ChevronRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Customers have visited website
            </p>
            <div className="h-48 mb-4">
              <Doughnut
                data={audienceData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                  cutout: "70%",
                }}
              />
            </div>
            <div className="flex justify-center space-x-8 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#FDE49E] rounded-full mr-2"></div>
                <span>Female</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#FEB941] rounded-full mr-2"></div>
                <span>Male</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#DD761C] rounded-full mr-2"></div>
                <span>Others</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newest Products */}
        <div className="bg-white rounded-xl shadow-sm  overflow-hidden">
          <div className="p-6 ">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Newest Product</h3>
              <button className="text-sm text-blue-600 flex items-center">
                See more <ChevronRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Newest product list of the month
            </p>
          </div>
          <div className="shadow-amber-600 shadow-sm">
            {productsData.map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OverviewScreen;
