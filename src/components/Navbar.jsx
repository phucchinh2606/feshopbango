import React, { useEffect, useState } from "react";
import {
  FaSearch,
  FaShoppingCart,
  FaTachometerAlt,
  FaUser,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { useCart } from "../context/CartContext";

const Navbar = ({ onSearch }) => {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const { cartCount, resetCartCount } = useCart(); // 👇 2. Lấy data từ Context

  useEffect(() => {
    // Lấy thông tin user từ localStorage khi load trang
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 👇 Hàm xử lý khi bấm vào giỏ hàng
  const handleCartClick = (e) => {
    if (!user) {
      e.preventDefault(); // Ngăn không cho chuyển trang sang /cart
      alert("Vui lòng đăng nhập để xem giỏ hàng!");
      navigate("/login"); // Chuyển hướng về trang đăng nhập
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.clear();
      setUser(null);

      resetCartCount(); // 👇 3. Gọi hàm reset của Context khi đăng xuất

      navigate("/login");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(keyword);
  };

  // Hàm kiểm tra Admin
  const isAdmin = user?.role === "ROLE_ADMIN";

  return (
    <nav className="bg-amber-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">
          Đồ Gỗ Phúc Chỉnh
        </Link>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center bg-white rounded-full px-4 py-1 w-1/3"
        >
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="flex-grow text-gray-700 outline-none px-2"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit" className="text-amber-900">
            <FaSearch />
          </button>
        </form>

        {/* Thay thế phần Icons cũ bằng đoạn logic này */}
        <div className="flex items-center gap-6">
          {/* 👇 KHU VỰC THAY ĐỔI LOGIC: ADMIN vs USER */}
          {isAdmin ? (
            // 1. NẾU LÀ ADMIN: Hiện nút vào trang quản trị
            <Link
              to="/admin"
              className="flex items-center gap-2 bg-white text-amber-900 px-3 py-1.5 rounded-full font-bold hover:bg-amber-100 transition shadow-sm"
              title="Vào trang quản trị"
            >
              <FaTachometerAlt />
              <span className="text-sm">Quản trị</span>
            </Link>
          ) : (
            // 2. NẾU LÀ USER/KHÁCH: Hiện nút Giỏ hàng như cũ
            <Link
              to="/cart"
              className="relative hover:text-amber-200 transition"
            >
              <FaShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-amber-900">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          )}

          {/* User Info */}
          {user ? (
            <div className="flex items-center gap-3 group relative">
              <span className="font-medium">Xin chào, {user.username}</span>
              <FaUser size={20} />

              {/* Dropdown Menu đơn giản */}
              <div className="absolute top-full right-0 w-40 bg-white text-gray-800 rounded shadow-lg hidden group-hover:block z-50 border border-gray-100">
                {/* 🔥 CÂY CẦU VÔ HÌNH: Lấp khoảng trống giữa nút và menu */}
                <div className="absolute -top-4 left-0 w-full h-4 bg-transparent"></div>

                <Link
                  to="/profile"
                  className="block px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  Hồ sơ
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 hover:text-amber-200"
            >
              <FaUser size={24} />
              <span>Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
