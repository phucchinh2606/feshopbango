import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("accessToken");

  // Nếu có token -> Cho phép đi tiếp (render Outlet)
  // Nếu không -> Đá về trang login
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
