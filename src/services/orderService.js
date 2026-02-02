import axiosClient from "../api/axiosClient";

const orderService = {
  createOrder: (data) => {
    // data = { addressId, cartItemIds, customerNote, paymentMethod }
    return axiosClient.post("/user/orders", data);
  },

  // Tạo thanh toán VNPay
  createVNPayPayment: (data) => {
    // data = { orderId, amount, orderInfo, bankCode }
    return axiosClient.post("/user/payment/vnpay/create", data);
  },

  // Xử lý kết quả trả về từ VNPay
  processVNPayReturn: (params) => {
    return axiosClient.get("/user/payment/vnpay/return", { params });
  },

  getHistory: () => {
    return axiosClient.get("/user/orders");
  },

  // ⭐️ THÊM HÀM HỦY ĐƠN HÀNG (USER)
  cancelOrder: (orderId) => {
    // Gọi API PATCH /api/user/orders/{orderId}/cancel
    return axiosClient.patch(`/user/orders/${orderId}/cancel`);
  },

  // --- 👇 ADMIN APIs (Thêm mới) ---

  // Lấy tất cả đơn hàng
  getAllOrders: () => {
    // Tăng page size để lấy tất cả orders (sort mới nhất trước)
    return axiosClient.get("/admin/orders", {
      params: {
        page: 0,
        size: 1000, // Lấy nhiều orders để hiển thị tất cả
        sort: "createdAt,desc" // Sắp xếp mới nhất trước
      }
    });
  },

  // Lấy chi tiết đơn hàng (Admin)
  getOrderById: (orderId) => {
    return axiosClient.get(`/admin/orders/${orderId}`);
  },

  // Cập nhật trạng thái đơn hàng
  updateStatus: (orderId, newStatus) => {
    // Body: { newStatus: "SHIPPING" }
    return axiosClient.patch(`/admin/orders/${orderId}/status`, { newStatus });
  },
};

export default orderService;
