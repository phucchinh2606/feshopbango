import axiosClient from "../api/axiosClient";

const addressService = {
  // Lấy danh sách địa chỉ
  getMyAddresses: () => {
    return axiosClient.get("/user/addresses");
  },

  // 👇 Hàm MỚI: Thêm địa chỉ
  addAddress: (data) => {
    // data = { city, commune, village, note }
    return axiosClient.post("/user/addresses", data);
  },

  // (Tùy chọn) Xóa địa chỉ
  deleteAddress: (addressId) => {
    return axiosClient.delete(`/user/addresses/${addressId}`);
  },
};

export default addressService;
