import axiosClient from "../api/axiosClient";

const productService = {
  getAll: (params) => {
    return axiosClient.get("/products", { params });
  },

  getByCategory: (categoryId) => {
    return axiosClient.get(`/products/by-category/${categoryId}`);
  },

  getById: (id) => {
    return axiosClient.get(`/products/${id}`);
  },

  search: (keyword) => {
    return axiosClient.get(`/products/search`, {
      params: { name: keyword },
    });
  },

  // 👇 CÁC HÀM ADMIN 👇

  // 👇 SỬA LẠI CÁC HÀM NÀY (Bỏ chữ /admin đi)
  create: (formData) => {
    // Lưu ý: Phải set Content-Type là multipart/form-data
    return axiosClient.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (id, formData) => {
    return axiosClient.put(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Xóa sản phẩm
  delete: (id) => {
    return axiosClient.delete(`/products/${id}`);
  },
};

export default productService;
