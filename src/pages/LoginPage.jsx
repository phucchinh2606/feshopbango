import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Xử lý Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login(formData);

      // 1. Lưu Token vào LocalStorage
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);

      // 2. Lưu thông tin user (tùy chọn, để hiển thị nhanh)
      localStorage.setItem(
        "user",
        JSON.stringify({
          username: response.data.username,
          role: response.data.userRole,
        })
      );

      alert("Đăng nhập thành công!");

      // 3. 👇 LOGIC ĐIỀU HƯỚNG DỰA TRÊN ROLE 👇
      if (response.data.userRole === "ROLE_ADMIN") {
        navigate("/admin"); // Nếu là Admin -> Vào trang quản trị
      } else {
        navigate("/"); // Nếu là User -> Về trang chủ
      }

      // 4. Reload nhẹ để cập nhật Navbar (nếu Navbar đọc từ localStorage)
      window.location.reload();
    } catch (err) {
      console.error(err);
      // Hiển thị lỗi từ Backend trả về (nếu có) hoặc lỗi chung
      const msg =
        err.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại!";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar onSearch={() => {}} />

      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Đăng nhập tài khoản
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Hoặc{" "}
              <Link
                to="/register"
                className="font-medium text-amber-600 hover:text-amber-500"
              >
                đăng ký tài khoản mới
              </Link>
            </p>
          </div>

          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tên đăng nhập
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                  placeholder="Nhập username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mật khẩu
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                  loading ? "bg-gray-400" : "bg-amber-600 hover:bg-amber-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors`}
              >
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginPage;
