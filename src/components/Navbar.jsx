import React, { useEffect, useState } from "react";
import {
  FaChevronDown,
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
  const { cartCount, resetCartCount } = useCart();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.clear();
      setUser(null);
      resetCartCount();
      navigate("/login");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(keyword);
    } else {
      navigate(`/products?keyword=${keyword}`);
    }
  };

  const isAdminOrEmployee =
    user?.role === "ROLE_ADMIN" || user?.role === "ROLE_EMPLOYEE";
  const adminPath = user?.role === "ROLE_EMPLOYEE" ? "/admin/orders" : "/admin";

  return (
    <nav className="bg-amber-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Đồ Gỗ Phúc Chỉnh
        </Link>

        <div className="hidden md:flex items-center gap-8 font-medium">
          <div className="hidden md:flex items-center gap-8 font-medium">
            <Link to="/" className="hover:text-amber-200 transition">
              Trang chủ
            </Link>

            <Link to="/products" className="hover:text-amber-200 transition">
              Sản phẩm
            </Link>

            <Link to="/categories" className="hover:text-amber-200 transition">
              Danh mục
            </Link>

            <Link to="/news" className="hover:text-amber-200 transition">
              Tin tức
            </Link>
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          className="hidden lg:flex items-center bg-white rounded-full px-3 py-1 w-1/4"
        >
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="flex-grow bg-transparent text-gray-700 outline-none px-2 text-sm"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit" className="text-amber-900">
            <FaSearch />
          </button>
        </form>

        <div className="flex items-center gap-5">
          {isAdminOrEmployee ? (
            <Link
              to={adminPath}
              className="flex items-center gap-2 hover:text-amber-200"
              title="Vào trang quản trị"
            >
              <FaTachometerAlt size={22} />
            </Link>
          ) : (
            <Link
              to="/cart"
              className="relative hover:text-amber-200 transition"
            >
              <FaShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-amber-900">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="group relative">
              <Link
                to="/profile"
                className="flex items-center gap-2 cursor-pointer hover:text-amber-200"
              >
                <img
                  src={
                    user.avatar ||
                    `https://ui-avatars.com/api/?name=${user.username}&background=random`
                  }
                  alt="avatar"
                  className="w-8 h-8 rounded-full border-2 border-amber-200"
                />
                <span className="font-medium hidden lg:block">
                  {user.username}
                </span>
              </Link>
              <div className="absolute top-full right-0 w-48 bg-white text-gray-800 rounded-md shadow-lg hidden group-hover:block z-50 border border-gray-100 mt-2">
                {/* LỚP ĐỆM: Thêm một div trong suốt phía trên để nối liền nút và menu */}
                <div className="absolute -top-2 left-0 w-full h-2 bg-transparent"></div>
                <Link
                  to="/profile"
                  className="block px-4 py-3 hover:bg-gray-100 transition-colors"
                >
                  Hồ sơ của tôi
                </Link>

                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 hover:bg-gray-100 text-red-600 font-medium transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 bg-white text-amber-900 px-4 py-1.5 rounded-full font-bold hover:bg-amber-100 transition shadow-sm text-sm"
            >
              <FaUser />
              <span>Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
