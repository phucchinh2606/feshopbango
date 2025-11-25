import React, { useState } from "react"; // Thêm useState nếu muốn làm hiệu ứng loading
import { formatCurrency } from "../utils/formatter";
import { FaCartPlus } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate
import cartService from "../services/cartService"; // Import Service
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { refreshCartCount } = useCart(); // 👇 Lấy hàm refresh
  const [isAdding, setIsAdding] = useState(false); // State để disable nút khi đang gọi API

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Ngăn chặn Link nhảy vào trang chi tiết

    // Kiểm tra đăng nhập nhanh (nếu chưa có token thì đá về login)
    if (!localStorage.getItem("accessToken")) {
      alert("Vui lòng đăng nhập để mua hàng!");
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

      alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
      // Ở đây bạn có thể cập nhật lại số lượng trên Navbar (nếu dùng Context/Redux)
      refreshCartCount(); // 👇 GỌI HÀM NÀY ĐỂ NAVBAR CẬP NHẬT SỐ NGAY
    } catch (error) {
      console.error(error);
      // Nếu token hết hạn (401)
      if (error.response && error.response.status === 401) {
        alert("Phiên đăng nhập hết hạn.");
        navigate("/login");
      } else {
        alert("Lỗi khi thêm vào giỏ hàng.");
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
      {/* Ảnh sản phẩm */}
      <Link
        to={`/product/${product.id}`}
        className="h-64 w-full bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer"
      >
        <img
          src={product.imageUrl || "https://via.placeholder.com/300"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      {/* Thông tin */}
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3
            className="text-lg font-semibold text-gray-800 truncate hover:text-amber-700 transition"
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>
        <p className="text-red-600 font-bold mt-2 text-xl">
          {formatCurrency(product.price)}
        </p>

        {/* Nút thêm vào giỏ - Đã sửa logic */}
        <button
          disabled={isAdding}
          className={`mt-4 w-full flex items-center justify-center gap-2 text-white py-2 rounded-md transition-colors ${
            isAdding
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-amber-700 hover:bg-amber-800"
          }`}
          onClick={handleAddToCart}
        >
          <FaCartPlus /> {isAdding ? "Đang thêm..." : "Thêm vào giỏ"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
