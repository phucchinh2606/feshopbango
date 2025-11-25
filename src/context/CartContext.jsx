import React, { createContext, useState, useContext, useEffect } from "react";
import cartService from "../services/cartService";

// 1. Khởi tạo Context
const CartContext = createContext();

// 2. Tạo Provider (Nhà cung cấp dữ liệu)
export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = async () => {
    const token = localStorage.getItem("accessToken");

    // Lấy thông tin user để check Role
    const userStr = localStorage.getItem("user");
    let user = null;
    if (userStr) user = JSON.parse(userStr);

    // 👇 ĐIỀU KIỆN CHẶN: Chưa đăng nhập HOẶC là Admin thì KHÔNG lấy giỏ
    if (!token || (user && user.role === "ROLE_ADMIN")) {
      setCartCount(0);
      return; // Dừng ngay, không gọi API
    }

    try {
      const response = await cartService.getCart();
      if (response.data && response.data.items) {
        const total = response.data.items.reduce(
          (acc, item) => acc + item.quantity,
          0
        );
        setCartCount(total);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      // Nếu lỡ có lỗi 403 (Forbidden) thì cũng không sao, chỉ cần log nhẹ
      if (error.response && error.response.status === 403) {
        console.log("User này không có quyền truy cập giỏ hàng (Admin)");
      } else {
        console.error("Lỗi cập nhật giỏ hàng:", error);
      }
      setCartCount(0);
    }
  };

  // Hàm reset (dùng khi đăng xuất)
  const resetCartCount = () => {
    setCartCount(0);
  };

  // Tự động lấy số lượng khi app vừa load (nếu đã đăng nhập)
  useEffect(() => {
    refreshCartCount();
  }, []);

  return (
    <CartContext.Provider
      value={{ cartCount, refreshCartCount, resetCartCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

// 3. Hook tùy chỉnh để các component con dùng cho gọn
export const useCart = () => {
  return useContext(CartContext);
};
