import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute"; // 👇 Import
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./layouts/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import AdminCategoryPage from "./pages/admin/AdminCategoryPage";
import AdminProductPage from "./pages/admin/AdminProductPage";
import AdminOrderPage from "./pages/admin/AdminOrderPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES (Ai cũng vào được) */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />

        {/* PROTECTED ROUTES (Phải đăng nhập mới vào được) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* 👇 ADMIN ROUTES (MỚI) */}
        <Route element={<AdminRoute />}>
          {/* Layout Admin bao bọc các trang con */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />{" "}
            {/* Mặc định vào Dashboard */}
            {/* 👇 Route mới cho Danh mục */}
            <Route path="categories" element={<AdminCategoryPage />} />
            {/* Sau này bạn sẽ thêm các trang này: */}
            <Route path="products" element={<AdminProductPage />} />
            <Route path="orders" element={<AdminOrderPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
