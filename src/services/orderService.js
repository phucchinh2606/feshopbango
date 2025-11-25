import axiosClient from "../api/axiosClient";

const orderService = {
  createOrder: (data) => {
    // data = { addressId, cartItemIds, customerNote }
    return axiosClient.post("/user/orders", data);
  },

  getHistory: () => {
    return axiosClient.get("/user/orders");
  },

  // --- 👇 ADMIN APIs (Thêm mới) ---

  // Lấy tất cả đơn hàng (Có thể thêm params phân trang sau này)
  getAllOrders: () => {
    return axiosClient.get("/admin/orders");
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
