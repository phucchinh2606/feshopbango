import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaMapMarkerAlt,
  FaBoxOpen,
  FaSignOutAlt,
  FaSpinner,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import authService from "../services/authService";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { formatCurrency } from "../utils/formatter";
import { FaPlus } from "react-icons/fa";
import addressService from "../services/addressService";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info"); // 'info', 'addresses', 'orders'

  // --- STATE CHO FORM THÊM ĐỊA CHỈ ---
  const [showModal, setShowModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    city: "",
    commune: "",
    village: "",
    note: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Hàm tải dữ liệu User (bao gồm địa chỉ, đơn hàng)
  const fetchProfile = async () => {
    try {
      const response = await authService.getMyInfo();
      setUser(response.data);
    } catch (error) {
      console.error("Lỗi tải hồ sơ:", error);
      if (error.response && error.response.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  // --- LOGIC XỬ LÝ ĐỊA CHỈ ---

  // Xử lý thay đổi input form
  const handleAddressChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  // Xử lý Submit Form thêm địa chỉ
  const handleAddAddress = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Gọi API thêm địa chỉ
      await addressService.addAddress(addressForm);

      alert("Thêm địa chỉ thành công!");
      setShowModal(false); // Đóng modal
      setAddressForm({ city: "", commune: "", village: "", note: "" }); // Reset form

      // Tải lại dữ liệu User để cập nhật danh sách địa chỉ mới
      fetchProfile();
    } catch (error) {
      console.error(error);
      alert("Lỗi khi thêm địa chỉ. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý xóa địa chỉ (Tùy chọn thêm)
  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
    try {
      await addressService.deleteAddress(id);
      fetchProfile(); // Reload lại danh sách
    } catch (error) {
      alert("Không thể xóa địa chỉ này.");
    }
  };

  // Hàm hiển thị trạng thái đơn hàng có màu sắc
  const renderOrderStatus = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      SHIPPING: "bg-purple-100 text-purple-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold ${
          colors[status] || "bg-gray-100"
        }`}
      >
        {status}
      </span>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <FaSpinner className="animate-spin text-4xl text-amber-600" />
      </div>
    );

  if (!user)
    return (
      <div className="text-center py-20">
        Không tải được thông tin người dùng.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar onSearch={() => {}} />

      <div className="container mx-auto px-4 py-10 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* --- SIDEBAR (Menu bên trái) --- */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center border border-gray-100">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600 text-3xl mb-4">
                <FaUser />
              </div>
              <h2 className="font-bold text-xl text-gray-800">
                {user.username}
              </h2>
              <p className="text-gray-500 text-sm mb-6">{user.email}</p>

              <div className="space-y-2 text-left">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "info"
                      ? "bg-amber-50 text-amber-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <FaUser /> Thông tin tài khoản
                </button>
                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "addresses"
                      ? "bg-amber-50 text-amber-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <FaMapMarkerAlt /> Sổ địa chỉ
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "orders"
                      ? "bg-amber-50 text-amber-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <FaBoxOpen /> Đơn mua ({user.orders?.length || 0})
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-4 border-t"
                >
                  <FaSignOutAlt /> Đăng xuất
                </button>
              </div>
            </div>
          </div>

          {/* --- MAIN CONTENT (Nội dung bên phải) --- */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 min-h-[400px]">
              {/* TAB 1: THÔNG TIN TÀI KHOẢN */}
              {activeTab === "info" && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">
                    Hồ Sơ Của Tôi
                  </h3>
                  <div className="space-y-6 max-w-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Tên đăng nhập
                      </label>
                      <div className="p-3 bg-gray-50 rounded-md text-gray-800 font-medium">
                        {user.username}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Email
                      </label>
                      <div className="p-3 bg-gray-50 rounded-md text-gray-800">
                        {user.email}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Số điện thoại
                      </label>
                      <div className="p-3 bg-gray-50 rounded-md text-gray-800">
                        {user.phoneNumber}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Ngày tham gia
                      </label>
                      <div className="p-3 bg-gray-50 rounded-md text-gray-800">
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ADDRESSES (Đã cập nhật) */}
              {activeTab === "addresses" && (
                <div>
                  <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      Địa Chỉ Nhận Hàng
                    </h3>
                    {/* Nút Mở Modal */}
                    <button
                      onClick={() => setShowModal(true)}
                      className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 text-sm flex items-center gap-2"
                    >
                      <FaPlus /> Thêm địa chỉ mới
                    </button>
                  </div>

                  {user.addresses && user.addresses.length > 0 ? (
                    <div className="space-y-4">
                      {user.addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-amber-400 transition-colors relative group"
                        >
                          <div className="flex items-start gap-3">
                            <FaMapMarkerAlt className="text-amber-600 mt-1 shrink-0" />
                            <div className="flex-grow">
                              <p className="font-medium text-gray-800">
                                {addr.fullAddress}
                              </p>
                              <div className="text-sm text-gray-500 mt-1">
                                <span className="mr-2">{addr.village},</span>
                                <span className="mr-2">{addr.commune},</span>
                                <span className="font-semibold text-gray-700">
                                  {addr.city}
                                </span>
                              </div>
                              {addr.note && (
                                <p className="text-xs text-gray-400 mt-2 italic">
                                  Ghi chú: {addr.note}
                                </p>
                              )}
                            </div>
                            {/* Nút xóa */}
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-gray-400 hover:text-red-500 p-2"
                              title="Xóa địa chỉ"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      Bạn chưa lưu địa chỉ nào.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ĐƠN MUA */}
              {activeTab === "orders" && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">
                    Lịch Sử Đơn Hàng
                  </h3>

                  {user.orders && user.orders.length > 0 ? (
                    <div className="space-y-6">
                      {user.orders.map((order) => (
                        <div
                          key={order.orderId}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          {/* Header đơn hàng */}
                          <div className="bg-gray-50 p-4 flex justify-between items-center border-b border-gray-200">
                            <div>
                              <span className="font-bold text-gray-700 mr-2">
                                #{order.orderId}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </span>
                            </div>
                            {renderOrderStatus(order.status)}
                          </div>

                          {/* Danh sách sản phẩm trong đơn */}
                          <div className="p-4 space-y-4">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-4"
                              >
                                <img
                                  src={
                                    item.product?.imageUrl ||
                                    "https://via.placeholder.com/60"
                                  }
                                  alt={item.product?.name}
                                  className="w-16 h-16 object-cover rounded border"
                                />
                                <div className="flex-grow">
                                  <h4 className="font-medium text-gray-800">
                                    {item.product?.name}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    x{item.quantity}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-800">
                                    {formatCurrency(item.priceAtPurchase)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Footer đơn hàng */}
                          <div className="p-4 bg-amber-50 flex justify-between items-center border-t border-amber-100">
                            <span className="text-gray-600">Tổng tiền:</span>
                            <span className="text-xl font-bold text-red-600">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      Bạn chưa có đơn hàng nào.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
      {/* --- MODAL THÊM ĐỊA CHỈ --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            {/* Header Modal */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">
                Thêm Địa Chỉ Mới
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Body Modal */}
            {/* Body Modal Thêm Địa Chỉ */}
            <form onSubmit={handleAddAddress} className="p-6 space-y-4">
              {/* Cấp 1: Tỉnh / Thành phố */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tỉnh / Thành phố <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Ví dụ: Thái Bình"
                  value={addressForm.city}
                  onChange={handleAddressChange}
                />
              </div>

              {/* Cấp 2: Xã / Phường (Bỏ qua Huyện) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Xã / Phường / Thị trấn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="commune"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Ví dụ: Xã Minh Tân"
                  value={addressForm.commune}
                  onChange={handleAddressChange}
                />
              </div>

              {/* Cấp 3: Thôn / Xóm */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thôn / Xóm / Tổ dân phố{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="village"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Ví dụ: Thôn 5 (hoặc Đường Nguyễn Trãi)"
                  value={addressForm.village}
                  onChange={handleAddressChange}
                />
              </div>

              {/* Ghi chú cụ thể */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú / Số nhà cụ thể
                </label>
                <textarea
                  name="note"
                  rows="2"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Ví dụ: Nhà màu xanh, đối diện tạp hóa..."
                  value={addressForm.note}
                  onChange={handleAddressChange}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 text-white bg-amber-600 rounded hover:bg-amber-700 font-medium ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu Địa Chỉ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
