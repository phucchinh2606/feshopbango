import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:1234/api", // URL Backend của bạn
  headers: {
    "Content-Type": "application/json",
  },
});

// Có thể thêm Interceptor ở đây để tự động gắn Token sau này
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

// Interceptor cho Response: Xử lý lỗi 401 (Hết hạn token) - Nâng cao (Có thể làm sau)

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
