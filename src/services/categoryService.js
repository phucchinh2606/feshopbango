import axiosClient from "../api/axiosClient";

const categoryService = {
  getAll: () => {
    return axiosClient.get("/categories");
  },
  // 👇 Các hàm dành cho Admin 👇

  // Thêm mới
  create: (data) => {
    return axiosClient.post("/categories", data);
  },

  // Cập nhật
  update: (id, data) => {
    return axiosClient.put(`/categories/${id}`, data);
  },

  // Xóa
  delete: (id) => {
    return axiosClient.delete(`/categories/${id}`);
  },
};

export default categoryService;
