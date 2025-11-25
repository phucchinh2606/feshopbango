import axiosClient from "../api/axiosClient";

const cartService = {
  // Lấy thông tin giỏ hàng
  getCart: () => {
    return axiosClient.get("/user/cart");
  },

  // Thêm vào giỏ hàng
  addToCart: (data) => {
    // data = { productId, quantity }
    return axiosClient.post("/user/cart/add", data);
  },

  // Cập nhật số lượng (PATCH)
  updateItemQuantity: (cartItemId, quantity) => {
    // Backend yêu cầu quantity qua Query Param: ?quantity=...
    return axiosClient.patch(`/user/cart/items/${cartItemId}`, null, {
      params: { quantity },
    });
  },

  // Xóa 1 sản phẩm
  removeItem: (cartItemId) => {
    return axiosClient.delete(`/user/cart/items/${cartItemId}`);
  },

  // Xóa hết giỏ hàng
  clearCart: () => {
    return axiosClient.delete("/user/cart/clear");
  },
};

export default cartService;
