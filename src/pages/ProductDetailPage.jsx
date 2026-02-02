import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaShoppingCart,
  FaMinus,
  FaPlus,
  FaUserCircle,
} from "react-icons/fa";
import productService from "../services/productService";
import reviewService from "../services/reviewService";
import { formatCurrency } from "../utils/formatter";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import cartService from "../services/cartService";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import ReviewForm from "../components/ReviewForm";

const ProductDetailPage = () => {
  const { id } = useParams(); // Lấy ID từ URL (ví dụ: /product/1 -> id = 1)
  const navigate = useNavigate(); // Hook để chuyển trang
  const { refreshCartCount } = useCart(); // 👇 Lấy hàm refresh

  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1); // State cho số lượng mua
  const [isAdding, setIsAdding] = useState(false); // State xử lý nút bấm

  // Tách hàm tải Review ra riêng để tái sử dụng khi submit xong
  const fetchReviews = async () => {
    try {
      const res = await reviewService.getReviewsByProduct(id);
      setReviews(res.data);
    } catch (error) {
      console.error("Lỗi tải review:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const productRes = await productService.getById(id);
        setProduct(productRes.data);

        // Gọi hàm tải review
        await fetchReviews();
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // Hàm thay đổi số lượng
  const handleQuantityChange = (change) => {
    // ⭐️ LOGIC MỚI: Không cho phép chọn quá số lượng tồn kho
    let newQty = quantity + change;

    // Tránh số âm
    if (newQty < 1) newQty = 1;

    // Tránh vượt quá tồn kho (Sản phẩm phải tồn tại và có stockQuantity)
    if (product && product.stockQuantity !== undefined) {
      if (newQty > product.stockQuantity) {
        // Có thể báo lỗi nhẹ nếu bạn muốn
        return;
      }
    }

    setQuantity(newQty);
  };

  // Hàm hiển thị sao (Rating stars)
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? "text-yellow-400" : "text-gray-300"}
      />
    ));
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value);
    const maxStock = product.stockQuantity || 999; // Lấy từ API

    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else if (value > maxStock) {
      setQuantity(maxStock);
      addToast(`Rất tiếc, chỉ còn ${maxStock} sản phẩm trong kho!`, "error");
    } else {
      setQuantity(value);
    }
  };

  // Hàm xử lý thêm vào giỏ
  const handleAddToCart = async () => {
    if (!localStorage.getItem("accessToken")) {
      addToast("Bạn cần đăng nhập để mua hàng.", "error");
      navigate("/login");
      return;
    }

    // ⭐️ LOGIC MỚI: Check lại tồn kho trước khi gửi
    if (product && product.stockQuantity !== undefined) {
      if (product.stockQuantity === 0) {
        addToast("Sản phẩm này đã hết hàng!", "error");
        return;
      }
      if (quantity > product.stockQuantity) {
        addToast(
          `Xin lỗi, chỉ còn ${product.stockQuantity} sản phẩm trong kho.`,
          "error"
        );
        return;
      }
    }

    setIsAdding(true);
    try {
      await cartService.addToCart({
        productId: product.id,
        quantity: quantity,
      });
      addToast(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, "success");
      refreshCartCount();
    } catch (error) {
      // ⭐️ LOGIC BẮT LỖI MỚI (nếu backend trả về OUT_OF_STOCK: 6004)
      const errorCode = error.response?.data?.errorCode;
      if (errorCode === 6004) {
        addToast(
          "Thêm vào giỏ thất bại: Sản phẩm đã hết hàng hoặc không đủ số lượng!",
          "error"
        );
      } else {
        console.error("Lỗi khi thêm vào giỏ:", error);
        addToast("Lỗi khi thêm vào giỏ hàng.", "error");
      }
    } finally {
      setIsAdding(false);
    }
  };

  // Kiểm tra trạng thái hết hàng
  const isOutOfStock = product?.stockQuantity === 0;

  if (loading)
    return (
      <div className="text-center py-20">Đang tải chi tiết sản phẩm...</div>
    );
  if (!product)
    return <div className="text-center py-20">Không tìm thấy sản phẩm!</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar onSearch={() => {}} />

      <div className="container mx-auto px-4 py-8 flex-grow">
        {/* Breadcrumb (Đường dẫn) */}
        <div className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-amber-700">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{product.name}</span>
        </div>

        {/* --- PHẦN 1: THÔNG TIN SẢN PHẨM --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
            {/* Cột Trái: Ảnh */}
            <div className="h-[400px] md:h-[500px] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border">
              <img
                src={product.imageUrl || "https://via.placeholder.com/500"}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Cột Phải: Thông tin */}
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <p className="text-3xl font-bold text-red-600">
                  {formatCurrency(product.price)}
                </p>
                {/* ⭐️ THÊM KHỐI HIỂN THỊ TỒN KHO */}
                <div
                  className={`mb-6 text-lg font-semibold ${
                    isOutOfStock ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {isOutOfStock
                    ? "Hết hàng"
                    : `Còn hàng: ${product.stockQuantity} sản phẩm`}
                </div>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 border-l pl-4 border-gray-300">
                    <span className="font-bold text-yellow-500">5.0</span>
                    <FaStar className="text-yellow-400" />
                    <span>({reviews.length} đánh giá)</span>
                  </div>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed mb-8 border-b pb-6">
                {product.description || "Mô tả đang cập nhật..."}
              </p>

              {/* Bộ chọn số lượng */}
              <div className="flex items-center space-x-4 mb-8">
                <label className="font-semibold text-gray-700">Số lượng:</label>
                <div className="flex items-center border border-gray-300 rounded-md">
                  {/* Nút trừ */}
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    // ⭐️ Disable nút trừ nếu số lượng = 1 hoặc hết hàng
                    disabled={quantity <= 1 || isOutOfStock}
                    className={`p-2 transition-colors ${
                      quantity <= 1 || isOutOfStock
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <FaMinus size={12} />
                  </button>
                  {/* Input số lượng */}
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleInputChange}
                    className="w-12 text-center border-x border-gray-300 focus:outline-none"
                  />
                  {/* Nút cộng */}
                  <button
                    onClick={() => handleQuantityChange(1)}
                    // ⭐️ Disable nút cộng nếu đã đạt giới hạn tồn kho hoặc hết hàng
                    disabled={
                      isOutOfStock ||
                      (product && quantity >= product.stockQuantity)
                    }
                    className={`p-2 transition-colors ${
                      isOutOfStock ||
                      (product && quantity >= product.stockQuantity)
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <FaPlus size={12} />
                  </button>
                </div>
              </div>

              {/* Nút Mua Hàng - Sửa đoạn này */}
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || isOutOfStock} // ⭐️ DISABLE NẾU HẾT HÀNG
                  className={`w-full max-w-xs flex items-center justify-center gap-3 py-3 rounded-lg text-white font-bold transition-all ${
                    isAdding || isOutOfStock
                      ? "bg-gray-400 cursor-not-allowed" // Xám nếu hết hàng
                      : "bg-amber-700 hover:bg-amber-800"
                  }`}
                >
                  <FaShoppingCart size={18} />
                  {isOutOfStock ? "ĐÃ HẾT HÀNG" : "THÊM VÀO GIỎ HÀNG"}{" "}
                  {/* ⭐️ HIỂN THỊ TRẠNG THÁI */}
                </button>

                {/* Nút Mua Ngay (Tùy chọn: Thêm vào giỏ -> Chuyển sang trang giỏ hàng luôn) */}
                <button
                  className="flex-1 border-2 border-amber-700 text-amber-700 py-4 rounded-lg font-bold hover:bg-amber-50 transition-all"
                  onClick={async () => {
                    await handleAddToCart();
                    navigate("/cart");
                  }}
                >
                  Mua Ngay
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- PHẦN 2: ĐÁNH GIÁ SẢN PHẨM --- */}
        <div className="mt-12 max-w-4xl mx-auto">
          {" "}
          {/* Thêm max-w để form ko bị bè ra quá */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-amber-700 pl-4">
            Đánh Giá Từ Khách Hàng ({reviews.length})
          </h2>
          {/* 👇 2. HIỂN THỊ FORM ĐÁNH GIÁ (Nếu đã đăng nhập) */}
          {localStorage.getItem("accessToken") ? (
            <ReviewForm
              productId={product.id}
              onReviewSuccess={fetchReviews} // Truyền hàm refresh vào để gọi lại sau khi submit
            />
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-8 text-center">
              <p className="text-yellow-800">
                Vui lòng{" "}
                <Link to="/login" className="font-bold underline">
                  đăng nhập
                </Link>{" "}
                để viết đánh giá.
              </p>
            </div>
          )}
          {/* Danh sách Reviews */}
          {reviews.length > 0 ? (
            <div className="grid gap-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-gray-300 bg-gray-100 rounded-full p-2">
                      <FaUserCircle size={32} />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">
                            {review.username}
                          </h4>
                          <div className="flex text-xs mt-1 mb-2">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 bg-white rounded border border-dashed">
              <p>Chưa có đánh giá nào cho sản phẩm này.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
