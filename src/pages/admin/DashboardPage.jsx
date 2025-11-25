import React, { useEffect, useState } from "react";
import {
  FaBox,
  FaClipboardList,
  FaUserFriends,
  FaDollarSign,
  FaArrowRight,
} from "react-icons/fa";
// ... import Recharts giữ nguyên ...
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axiosClient from "../../api/axiosClient";
import orderService from "../../services/orderService"; // 👇 Import orderService
import { formatCurrency } from "../../utils/formatter";
import { Link } from "react-router-dom"; // 👇 Import Link

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]); // 👇 State cho đơn chờ xử lý
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Gọi API thống kê
        const statsRes = await axiosClient.get("/admin/statistics");
        setStats(statsRes.data);

        // 2. 👇 Gọi API lấy 5 đơn hàng đang CHỜ XỬ LÝ (PENDING)
        const pendingRes = await orderService.getAllOrders({
          status: "PENDING",
          page: 0,
          size: 5,
          sort: "createdAt,desc", // Mới nhất lên đầu
        });

        // Lấy data an toàn (tuỳ cấu trúc trả về là Page hay List)
        const pendingData = pendingRes.data.content || pendingRes.data || [];
        setPendingOrders(pendingData);
      } catch (error) {
        console.error("Lỗi tải dữ liệu Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
  if (!stats)
    return <div className="p-10 text-center">Không có dữ liệu thống kê.</div>;

  const chartData =
    stats.revenueChart && stats.revenueChart.length > 0
      ? stats.revenueChart
      : [];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Tổng quan kinh doanh
      </h2>

      {/* 1. CÁC THẺ CHỈ SỐ (Giữ nguyên) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard
          title="Tổng Doanh Thu"
          value={formatCurrency(stats.totalRevenue)}
          icon={<FaDollarSign />}
          color="green"
        />
        <StatCard
          title="Tổng Đơn Hàng"
          value={stats.totalOrders}
          icon={<FaClipboardList />}
          color="blue"
        />
      </div>

      {/* 2. BIỂU ĐỒ & DANH SÁCH CẦN XỬ LÝ (Chia cột 2:1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: BIỂU ĐỒ (Chiếm 2 phần) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Biểu đồ doanh thu
          </h3>
          <div className="h-[350px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="month" />
                  <YAxis
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("en", {
                        notation: "compact",
                      }).format(value)
                    }
                  />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar
                    dataKey="revenue"
                    name="Doanh thu"
                    fill="#d97706"
                    radius={[4, 4, 0, 0]}
                    barSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded">
                Chưa có dữ liệu doanh thu.
              </div>
            )}
          </div>
        </div>

        {/* 👇 CỘT PHẢI: CẦN XỬ LÝ GẤP (Chiếm 1 phần) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Cần xử lý gấp</h3>
            <Link
              to="/admin/orders"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              Xem tất cả <FaArrowRight size={12} />
            </Link>
          </div>

          {pendingOrders.length > 0 ? (
            <div className="flex-grow overflow-y-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-3 py-2">Đơn hàng</th>
                    <th className="px-3 py-2 text-right">Tổng tiền</th>
                    <th className="px-3 py-2 text-center">TT</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOrders.map((order) => (
                    <tr
                      key={order.orderId}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-3 py-3">
                        <div className="font-bold text-gray-900">
                          #{order.orderId}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </div>
                        <div className="text-xs text-blue-600 truncate max-w-[120px]">
                          {order.user?.username}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-amber-700">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <Link
                          to="/admin/orders"
                          className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded hover:bg-blue-200 whitespace-nowrap"
                        >
                          Xử lý
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-gray-400 text-center py-10">
              <FaClipboardList size={40} className="mb-3 opacity-30" />
              <p>Tuyệt vời! Không có đơn hàng nào tồn đọng.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Component con hiển thị thẻ số liệu cho gọn code
const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    green: "border-green-500 text-green-500",
    blue: "border-blue-500 text-blue-500",
    purple: "border-purple-500 text-purple-500",
    amber: "border-amber-500 text-amber-500",
  };

  return (
    <div
      className={`bg-white p-6 rounded-lg shadow-sm border-l-4 ${colors[color]} flex items-center justify-between transition hover:shadow-md`}
    >
      <div>
        <p className="text-gray-500 text-sm font-medium uppercase">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className="text-3xl opacity-80">{icon}</div>
    </div>
  );
};

export default DashboardPage;
