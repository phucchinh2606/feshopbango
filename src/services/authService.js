import axiosClient from "../api/axiosClient";

const authService = {
  // API Đăng nhập
  login: (credentials) => {
    // credentials = { username, password }
    return axiosClient.post("/users/login", credentials);
  },

  // API Đăng ký
  register: (userData) => {
    // userData = { username, password, email, phoneNumber }
    return axiosClient.post("/users/register", userData);
  },

  // Lấy thông tin user hiện tại (cần Token)
  getMyInfo: () => {
    return axiosClient.get("/users/my-info");
  },

  logout: () => {
    const refreshToken = localStorage.getItem("refreshToken");
    // API Logout yêu cầu refreshToken trong body
    return axiosClient.post("/users/logout", { refreshToken: refreshToken });
  },
};

export default authService;
