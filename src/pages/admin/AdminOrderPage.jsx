import React, { useEffect, useState } from "react";
import {
  FaEye,
  FaTimes,
  FaBoxOpen,
  FaUser,
  FaMapMarkerAlt,
} from "react-icons/fa";
import orderService from "../../services/orderService";
import { formatCurrency } from "../../utils/formatter";

const AdminOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho Modal Chi tiết
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Danh sách trạng thái đơn hàng
  const ORDER_STATUSES = [
    {
      value: "PENDING",
      label: "Chờ xử lý",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "CONFIRMED",
      label: "Đã xác nhận",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "SHIPPING",
      label: "Đang giao",
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "DELIVERED",
      label: "Đã giao hàng",
      color: "bg-green-100 text-green-800",
    },
    { value: "CANCELLED", label: "Đã hủy", color: "bg-red-100 text-red-800" },
  ];

  // 1. Tải danh sách đơn hàng
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getAllOrders();
      // Backend trả về Page -> lấy .content, hoặc List -> lấy trực tiếp
      const data = response.data.content || response.data || [];

      // Sắp xếp đơn mới nhất lên đầu (nếu Backend chưa sắp xếp)
      const sortedData = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sortedData);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Mở Modal xem chi tiết
  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // 3. Xử lý thay đổi trạng thái
  const handleStatusChange = async (newStatus) => {
    if (!selectedOrder) return;

    // Logic chặn (VD: Không thể chuyển từ Đã giao về Chờ xử lý) - Tùy chọn
    if (
      selectedOrder.status === "DELIVERED" ||
      selectedOrder.status === "CANCELLED"
    ) {
      alert("Đơn hàng đã hoàn tất hoặc đã hủy, không thể thay đổi trạng thái.");
      return;
    }

    if (
      !window.confirm(`Bạn có chắc muốn chuyển trạng thái sang ${newStatus}?`)
    )
      return;

    setUpdating(true);
    try {
      await orderService.updateStatus(selectedOrder.orderId, newStatus);
      alert("Cập nhật trạng thái thành công!");
      setShowModal(false);
      fetchOrders(); // Tải lại danh sách mới
    } catch (error) {
      alert(
        "Lỗi cập nhật: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setUpdating(false);
    }
  };

  // Helper: Lấy màu sắc cho badge trạng thái
  const getStatusColor = (status) => {
    const found = ORDER_STATUSES.find((s) => s.value === status);
    return found ? found.color : "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status) => {
    const found = ORDER_STATUSES.find((s) => s.value === status);
    return found ? found.label : status;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Quản lý Đơn hàng
      </h2>

      {/* BẢNG DANH SÁCH */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Mã Đơn</th>
              <th className="py-3 px-6 text-left">Khách hàng</th>
              <th className="py-3 px-6 text-left">Ngày đặt</th>
              <th className="py-3 px-6 text-right">Tổng tiền</th>
              <th className="py-3 px-6 text-center">Trạng thái</th>
              <th className="py-3 px-6 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-10">
                  Đang tải...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-10">
                  Chưa có đơn hàng nào.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.orderId}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-3 px-6 text-left font-bold">
                    #{order.orderId}
                  </td>
                  <td className="py-3 px-6 text-left">
                    <div className="flex items-center">
                      <span className="font-medium">
                        {order.user?.username || "Unknown"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-left">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="py-3 px-6 text-right font-bold text-red-600">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span
                      className={`${getStatusColor(
                        order.status
                      )} py-1 px-3 rounded-full text-xs`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => handleViewDetail(order)}
                      className="text-blue-600 hover:text-blue-900 transform hover:scale-110 transition"
                      title="Xem chi tiết"
                    >
                      <FaEye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl animate-fade-in-down max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Chi Tiết Đơn Hàng #{selectedOrder.orderId}
                </h3>
                <p className="text-sm text-gray-500">
                  Ngày đặt:{" "}
                  {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Cột Trái: Thông tin khách hàng & Giao hàng */}
              <div className="md:col-span-1 space-y-6">
                {/* Thông tin người nhận */}
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FaUser /> Khách hàng
                  </h4>
                  <p className="text-sm">
                    <strong>Tên:</strong> {selectedOrder.user?.username}
                  </p>
                  <p className="text-sm">
                    <strong>Email:</strong> {selectedOrder.user?.email}
                  </p>
                  <p className="text-sm">
                    <strong>SĐT:</strong> {selectedOrder.user?.phoneNumber}
                  </p>
                </div>

                {/* Địa chỉ giao hàng */}
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FaMapMarkerAlt /> Giao tới
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.shippingAddress?.fullAddress ||
                      "Địa chỉ đã bị xóa"}
                  </p>
                  {selectedOrder.shippingAddress?.note && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                      Note: {selectedOrder.shippingAddress.note}
                    </p>
                  )}
                </div>

                {/* CẬP NHẬT TRẠNG THÁI (Quan trọng) */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-bold text-amber-800 mb-2">
                    Cập nhật trạng thái
                  </h4>
                  <select
                    className="w-full p-2 border rounded focus:outline-none focus:border-amber-500 bg-white"
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updating}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  {updating && (
                    <p className="text-xs text-amber-600 mt-1">
                      Đang cập nhật...
                    </p>
                  )}
                </div>
              </div>

              {/* Cột Phải: Danh sách sản phẩm */}
              <div className="md:col-span-2">
                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <FaBoxOpen /> Danh sách sản phẩm
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">Sản phẩm</th>
                        <th className="px-4 py-3 text-center">SL</th>
                        <th className="px-4 py-3 text-right">Đơn giá</th>
                        <th className="px-4 py-3 text-right">Tổng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-3">
                            <img
                              src={
                                item.product?.imageUrl ||
                                "https://via.placeholder.com/40"
                              }
                              alt=""
                              className="w-10 h-10 object-cover rounded"
                            />
                            <span className="line-clamp-1">
                              {item.product?.name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatCurrency(item.priceAtPurchase)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold">
                            {formatCurrency(
                              item.priceAtPurchase * item.quantity
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mt-4">
                  <div className="text-right">
                    <span className="text-gray-600 mr-4">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-red-600">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Ghi chú của khách hàng (nếu có) */}
                {selectedOrder.customerNote && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-sm text-gray-700">
                    <span className="font-bold block mb-1">
                      Ghi chú từ khách hàng:
                    </span>
                    "{selectedOrder.customerNote}"
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderPage;
