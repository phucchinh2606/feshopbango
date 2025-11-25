import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import reviewService from "../services/reviewService";

const ReviewForm = ({ productId, onReviewSuccess }) => {
  const [rating, setRating] = useState(0); // Số sao đã chọn
  const [hover, setHover] = useState(0); // Số sao khi di chuột qua
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Validate cơ bản
    if (rating === 0) {
      setError("Vui lòng chọn số sao đánh giá!");
      return;
    }
    if (!localStorage.getItem("accessToken")) {
      setError("Bạn cần đăng nhập để đánh giá.");
      return;
    }

    setLoading(true);
    try {
      // 2. Gọi API
      await reviewService.createReview({
        productId: productId,
        rating: rating,
        comment: comment,
      });

      // 3. Thành công -> Reset form & báo cho cha biết
      setRating(0);
      setComment("");
      alert("Cảm ơn bạn đã đánh giá sản phẩm!");

      if (onReviewSuccess) {
        onReviewSuccess(); // Gọi hàm reload lại danh sách review
      }
    } catch (err) {
      console.error(err);
      // 4. Xử lý lỗi từ Backend
      if (err.response && err.response.status === 403) {
        setError(
          "Bạn chỉ được đánh giá sau khi đã mua và nhận hàng thành công!"
        );
      } else {
        setError(
          err.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Viết đánh giá của bạn
      </h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Chọn Sao */}
        <div className="flex items-center mb-4">
          <span className="mr-3 text-sm font-medium text-gray-700">
            Chất lượng sản phẩm:
          </span>
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1;
            return (
              <label key={index} className="cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  value={ratingValue}
                  className="hidden" // Ẩn radio button thật đi
                  onClick={() => setRating(ratingValue)}
                />
                <FaStar
                  className="transition-colors duration-200"
                  size={24}
                  color={
                    ratingValue <= (hover || rating) ? "#fbbf24" : "#e5e7eb"
                  } // Vàng hoặc Xám
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(0)}
                />
              </label>
            );
          })}
          <span className="ml-3 text-sm font-bold text-amber-600">
            {rating > 0 ? `${rating} Sao` : ""}
          </span>
        </div>

        {/* Nhập nội dung */}
        <div className="mb-4">
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
            rows="3"
            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition font-medium ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Đang gửi..." : "Gửi Đánh Giá"}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
