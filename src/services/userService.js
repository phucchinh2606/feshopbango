import axiosClient from "../api/axiosClient";

const userService = {
  getAll: () => {
    return axiosClient.get("/users/all");
  },

  updateRole: (id, newRole) => {
    return axiosClient.put(`/users/${id}/role`, { newRole });
  },

  delete: (id) => {
    return axiosClient.delete(`/users/${id}`);
  },
};

export default userService;
