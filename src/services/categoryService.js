import axiosClient from "../api/axiosClient";

const categoryService = {
  getAll: () => {
    return axiosClient.get("/categories");
  },
  // 👇 Các hàm dành cho Admin 👇

  // Thêm mới (với ảnh)
  create: (data) => {
    // data có thể là FormData (với file) hoặc object (chỉ tên)
    const config = {};
    if (data instanceof FormData) {
      config.headers = {
        "Content-Type": "multipart/form-data",
      };
    }
    return axiosClient.post("/categories", data, config);
  },

  // Cập nhật (với ảnh)
  update: (id, data) => {
    // data có thể là FormData (với file) hoặc object (chỉ tên)
    const config = {};
    if (data instanceof FormData) {
      config.headers = {
        "Content-Type": "multipart/form-data",
      };
    }
    return axiosClient.put(`/categories/${id}`, data, config);
  },

  // Xóa
  delete: (id) => {
    return axiosClient.delete(`/categories/${id}`);
  },
};

export default categoryService;
