import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:1234/api", // URL Backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor cho Request: Tự động gắn Token vào Header
axiosClient.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho Response: Xử lý lỗi 401 (Hết hạn token)

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Nếu lỗi 401 -> Token hết hạn -> Logout hoặc gọi Refresh Token
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
