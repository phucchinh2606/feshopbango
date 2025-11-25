import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const token = localStorage.getItem("accessToken");
  const userString = localStorage.getItem("user");
  let user = null;

  if (userString) {
    user = JSON.parse(userString);
  }

  // Điều kiện: Phải có Token VÀ Role phải là ADMIN
  if (token && user && user.role === "ROLE_ADMIN") {
    return <Outlet />; // Cho phép đi tiếp
  } else {
    return <Navigate to="/" replace />; // Đá về trang chủ nếu không đủ quyền
  }
};

export default AdminRoute;
