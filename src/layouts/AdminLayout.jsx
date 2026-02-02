import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  FaBox,
  FaClipboardList,
  FaUserFriends,
  FaSignOutAlt,
  FaChartBar,
  FaHome,
  FaUsers,
} from "react-icons/fa";
import authService from "../services/authService";

const AdminLayout = () => {
  const navigate = useNavigate();

  // Lấy role từ localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role;

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error(e);
    }
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* --- SIDEBAR (Bên trái) --- */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed h-full">
        <div className="p-6 text-center border-b border-gray-800">
          <h1 className="text-2xl font-bold text-amber-500">Admin Panel</h1>
          <p className="text-gray-400 text-xs mt-1">Quản lý Đồ Gỗ</p>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          {userRole === "ROLE_ADMIN" && (
            <Link
              to="/admin"
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded transition text-gray-300 hover:text-white"
            >
              <FaChartBar /> Thống kê
            </Link>
          )}
          <Link
            to="/admin/categories"
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded transition text-gray-300 hover:text-white"
          >
            <FaBox /> Quản lý Danh mục
          </Link>
            <Link
              to="/admin/products"
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded transition text-gray-300 hover:text-white"
            >
              <FaClipboardList /> Quản lý Sản phẩm
            </Link>
            <Link
              to="/admin/news"
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded transition text-gray-300 hover:text-white"
            >
              <FaClipboardList /> Quản lý Tin tức
            </Link>
          {userRole === "ROLE_ADMIN" && (
            <>
              <Link
                to="/admin/orders"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded transition text-gray-300 hover:text-white"
              >
                <FaUserFriends /> Quản lý Đơn hàng
              </Link>
              <Link
                to="/admin/users"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded transition text-gray-300 hover:text-white"
              >
                <FaUsers /> Quản lý Người dùng
              </Link>
            </>
          )}

          <div className="border-t border-gray-700 my-4"></div>

          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded transition text-amber-400"
          >
            <FaHome /> Về trang bán hàng
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 w-full"
          >
            <FaSignOutAlt /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT (Bên phải) --- */}
      <div className="flex-grow ml-64 p-8">
        {/* Header nhỏ của Admin */}
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-gray-800">Tổng quan</h2>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">
              ADMIN
            </span>
            <span className="text-gray-600">Xin chào, Quản trị viên</span>
          </div>
        </header>

        {/* Nơi hiển thị các trang con (Dashboard, Products...) */}
        <div className="bg-white rounded-lg shadow-sm p-6 min-h-[500px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
