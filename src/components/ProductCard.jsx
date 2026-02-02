import React, { useState } from "react";
import { formatCurrency } from "../utils/formatter";
import { FaCartPlus } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import cartService from "../services/cartService";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { refreshCartCount } = useCart(); // 👇 Lấy hàm refresh
  const { addToast } = useToast();
  const [isAdding, setIsAdding] = useState(false); // State để disable nút khi đang gọi API

  const isOutOfStock = product.stockQuantity === 0;

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Ngăn chặn Link nhảy vào trang chi tiết

    if (isOutOfStock) {
      // ⭐️ CHECK TRƯỚC
      addToast("Sản phẩm này đã hết hàng!", "error");
      return;
    }

    // Kiểm tra đăng nhập nhanh (nếu chưa có token thì đá về login)
    if (!localStorage.getItem("accessToken")) {
      addToast("Vui lòng đăng nhập để mua hàng!", "error");
      navigate("/login");
      return;
    }

    setIsAdding(true);
    try {
      // Gọi API thêm vào giỏ (Mặc định số lượng là 1)
      await cartService.addToCart({
        productId: product.id,
        quantity: 1,
      });

      addToast(`Đã thêm "${product.name}" vào giỏ hàng!`, "success");
      refreshCartCount();
    } catch (error) {
      // ⭐️ LOGIC BẮT LỖI MỚI (nếu backend trả về OUT_OF_STOCK: 6004)
      const errorCode = error.response?.data?.errorCode;
      if (errorCode === 6004) {
        addToast("Thêm vào giỏ thất bại: Sản phẩm đã hết hàng!", "error");
      } else {
        console.error("Lỗi khi thêm vào giỏ:", error);
        addToast("Lỗi khi thêm vào giỏ hàng.", "error");
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
      {/* Hình ảnh */}
      <Link
        to={`/product/${product.id}`}
        className="relative aspect-square overflow-hidden bg-gray-100"
      >
        <img
          src={product.imageUrl || "https://via.placeholder.com/300"}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 px-4 py-1 rounded-full font-bold text-sm">
              Hết hàng
            </span>
          </div>
        )}
      </Link>

      {/* Thông tin */}
      <div className="p-5 flex flex-col flex-grow">
        <span className="text-xs font-medium text-amber-600 mb-1 uppercase tracking-wider">
          {product.category?.name || "Đồ gỗ"}
        </span>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto">
          <p className="text-xl font-black text-red-600">
            {formatCurrency(product.price)}
          </p>
          <button
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock}
            className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-all ${
              isOutOfStock
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-amber-700 text-white hover:bg-amber-800 active:scale-95 shadow-md hover:shadow-amber-200"
            }`}
          >
            <FaCartPlus />
            {isAdding ? "Đang thêm..." : "Thêm vào giỏ"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
