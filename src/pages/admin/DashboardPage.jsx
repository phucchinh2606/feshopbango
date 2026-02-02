import React, { useEffect, useState } from "react";
import {
  FaBox,
  FaClipboardList,
  FaUserFriends,
  FaDollarSign,
  FaShoppingCart,
  FaExclamationTriangle,
  FaChartLine,
  FaBan,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatter";
import axiosClient from "../../api/axiosClient";

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosClient.get("/admin/statistics");
        setStats(response.data);
      } catch (err) {
        console.error("Lỗi tải thống kê:", err);
        if (err.response && err.response.status === 403) {
          setError({
            status: 403,
            message: "Bạn không có quyền truy cập Dashboard quản trị.",
          });
        } else {
          setError({
            status: err.response?.status || 500,
            message: "Lỗi khi tải dữ liệu thống kê.",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-10 text-center">Đang tải dữ liệu thống kê...</div>;
  }

  if (error) {
    return (
      <div className="p-10">
        <div className="max-w-xl mx-auto bg-white p-6 rounded shadow-sm text-center">
          <h2 className="text-xl font-bold text-red-600 mb-3">
            Không thể truy cập
          </h2>
          <p className="text-gray-700 mb-4">{error.message}</p>
          <div className="flex justify-center gap-4">
            <Link to="/" className="text-amber-600 hover:underline">
              Quay về trang chủ
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="text-gray-600 hover:underline"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Màu cho biểu đồ tròn
  const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"];

  // Hàm render label phần trăm trên pie chart
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const RADIAN = Math.PI / 180;
    // Đặt label ở gần bên trong (20% từ innerRadius)
    const radius = innerRadius + (outerRadius - innerRadius) * 0.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Chọn màu text tương phản: trắng cho nền tối, đen cho nền sáng
    const sliceColor = COLORS[index % COLORS.length];
    const isLight = sliceColor === "#FFCE56" || sliceColor === "#4BC0C0"; // vàng và xanh lá sáng
    const textColor = isLight ? "#000" : "#000";

    return (
      <text
        x={x}
        y={y}
        fill={textColor}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  // Tính tỷ lệ hủy đơn (an toàn khi tổng đơn = 0)
  const totalOrders = stats?.totalOrders || 0;
  const cancelledOrders = stats?.cancelledOrders || 0;
  const cancelRate = totalOrders
    ? ((cancelledOrders / totalOrders) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaChartLine /> Dashboard Quản Trị
      </h1>

      {/* --- PHẦN 1: THỐNG KÊ TỔNG QUAN (4 CARDS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tổng Doanh Thu"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={<FaDollarSign size={24} />}
          color="green"
        />
        <StatCard
          title="Tổng Đơn Hàng"
          value={stats?.totalOrders || 0}
          icon={<FaClipboardList size={24} />}
          color="blue"
        />
        <StatCard
          title="Tỷ Lệ Hủy Đơn"
          value={`${cancelRate}%`}
          subText={`(${cancelledOrders} đơn hủy)`}
          icon={<FaBan size={24} />}
          color="red"
        />
        <StatCard
          title="Khách Hàng"
          value={stats?.totalCustomers || 0}
          icon={<FaUserFriends size={24} />}
          color="purple"
        />
        <StatCard
          title="Tổng Sản Phẩm"
          value={stats?.totalProducts || 0}
          icon={<FaBox size={24} />}
          color="orange"
        />
      </div>

      {/* --- PHẦN 2: BIỂU ĐỒ (CHARTS) --- */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Biểu đồ 1: Doanh thu theo tháng (Bar Chart) */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4">Biểu Đồ Doanh Thu</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.monthlyRevenue || []}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis
                  label={{
                    value: "Doanh thu (VNĐ)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("vi-VN", {
                      notation: "compact",
                      compactDisplay: "short",
                    }).format(value)
                  }
                />
                <Tooltip formatter={(value) => formatCurrency(value || 0)} />
                <Bar
                  dataKey="value"
                  fill="#d97706"
                  name="Doanh thu"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ 2: Tỷ trọng danh mục (Bar Chart) */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4">
            Tỷ Trọng Doanh Thu Theo Danh Mục
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.categoryRevenue || []}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("vi-VN", {
                      notation: "compact",
                      compactDisplay: "short",
                    }).format(value)
                  }
                />
                <YAxis dataKey="name" type="category" width={140} />
                <Tooltip formatter={(value) => formatCurrency(value || 0)} />
                <Bar
                  dataKey="value"
                  fill="#36A2EB"
                  name="Doanh thu"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-xs text-gray-500 mt-4">
            *Phân bổ doanh thu theo các nhóm hàng chủ lực
          </p>
        </div>
      </div>

      {/* --- PHẦN 3: CHI TIẾT SẢN PHẨM (2 BẢNG) --- */}
      <div className="grid grid-cols-1 gap-6">
        {/* Bảng 1: Top 5 Best Sellers */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <FaShoppingCart className="text-amber-600" /> Top Sản Phẩm Bán Chạy
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-semibold">
                <tr>
                  <th className="px-3 py-2">Sản phẩm</th>
                  <th className="px-3 py-2 text-right">Đã bán</th>
                  <th className="px-3 py-2 text-right">Doanh số</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(stats?.bestSellers || []).map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={item.img}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span
                        className="font-medium text-gray-800 line-clamp-1"
                        title={item.name}
                      >
                        {item.name}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-gray-700">
                      {item.sold || 0}
                    </td>
                    <td className="px-3 py-3 text-right text-amber-600 font-medium">
                      {formatCurrency(item.revenue || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bảng 2: Cảnh báo sắp hết hàng */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FaExclamationTriangle size={100} color="red" />
          </div>
          <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2">
            <FaExclamationTriangle /> Cảnh Báo Kho (Sắp hết)
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Các sản phẩm dưới đây có số lượng tồn kho &le; 5. Cần nhập thêm!
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-red-50 text-red-700 font-semibold">
                <tr>
                  <th className="px-3 py-2">Tên sản phẩm</th>
                  <th className="px-3 py-2 text-center">Tồn kho</th>
                  <th className="px-3 py-2 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {(stats?.lowStock || []).map((item) => (
                  <tr key={item.id} className="hover:bg-red-50">
                    <td className="px-3 py-3 font-medium text-gray-800">
                      {item.name}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          item.stock === 0
                            ? "bg-red-200 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link
                        to="/admin/products"
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Nhập hàng
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component con hiển thị thẻ số liệu (Stat Card)
const StatCard = ({ title, value, subText, icon, color }) => {
  const styles = {
    green: "border-green-500 text-green-600 bg-green-50",
    blue: "border-blue-500 text-blue-600 bg-blue-50",
    red: "border-red-500 text-red-600 bg-red-50",
    purple: "border-purple-500 text-purple-600 bg-purple-50",
    orange: "border-amber-500 text-amber-600 bg-amber-50",
  };

  return (
    <div
      className={`bg-white p-5 rounded-lg shadow-sm border-l-4 flex items-center justify-between transition hover:shadow-md ${
        styles[color].split(" ")[0]
      }`}
    >
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          {title}
        </p>
        <h4 className="text-2xl font-bold text-gray-800 mt-1">{value}</h4>
        {subText && <p className="text-xs text-gray-400 mt-1">{subText}</p>}
      </div>
      <div
        className={`p-3 rounded-full ${styles[color]
          .split(" ")
          .slice(1)
          .join(" ")} bg-opacity-20`}
      >
        {icon}
      </div>
    </div>
  );
};

export default DashboardPage;
