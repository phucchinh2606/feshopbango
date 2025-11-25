import axiosClient from "../api/axiosClient";

const reviewService = {
  // Lấy đánh giá theo sản phẩm
  getReviewsByProduct: (productId) => {
    return axiosClient.get(`/reviews/product/${productId}`);
  },

  // 👇 THÊM HÀM NÀY: Gửi đánh giá mới
  createReview: (data) => {
    // data = { productId, rating, comment }
    return axiosClient.post("/reviews", data);
  },
};

export default reviewService;
