import React, { useEffect, useState } from "react";
import { FaEdit, FaSearch, FaTrash } from "react-icons/fa";
import userService from "../../services/userService";
import { useToast } from "../../context/ToastContext";

const AdminUserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // ID của user đang update
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");

  const { addToast } = useToast();

  // 1. Load dữ liệu người dùng
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAll();
      setUsers(res.data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu người dùng:", error);
      addToast("Lỗi tải dữ liệu người dùng!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Mở modal chỉnh sửa
  const openEditModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.userRole);
    setShowModal(true);
  };

  // 3. Đóng modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setNewRole("");
  };

  // 4. Cập nhật vai trò
  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    setUpdating(selectedUser.id);
    try {
      await userService.updateRole(selectedUser.id, newRole);
      addToast("Cập nhật vai trò thành công!", "success");
      fetchUsers(); // Reload danh sách
      closeModal();
    } catch (error) {
      console.error("Lỗi cập nhật vai trò:", error);
      addToast("Lỗi cập nhật vai trò!", "error");
    } finally {
      setUpdating(null);
    }
  };

  // 5. Xóa người dùng
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa người dùng ${selectedUser.username}? Hành động này không thể hoàn tác.`
    );
    if (!confirmDelete) return;

    setUpdating(selectedUser.id);
    try {
      await userService.delete(selectedUser.id);
      addToast("Xóa người dùng thành công!", "success");
      fetchUsers(); // Reload danh sách
      closeModal();
    } catch (error) {
      console.error("Lỗi xóa người dùng:", error);
      addToast("Lỗi xóa người dùng!", "error");
    } finally {
      setUpdating(null);
    }
  };

  // 3. Lọc người dùng theo search
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 4. Format role display
  const formatRole = (role) => {
    return role.replace("ROLE_", "");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Quản lý Người dùng
        </h2>

        {/* Search Bar */}
        <div className="mb-4 flex items-center bg-white p-2 rounded-lg shadow-sm">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Tìm kiếm theo username hoặc email..."
            className="flex-1 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.id}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {user.username}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {user.phoneNumber}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.userRole === "ROLE_ADMIN"
                          ? "bg-red-100 text-red-800"
                          : user.userRole === "ROLE_EMPLOYEE"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {formatRole(user.userRole)}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <FaEdit className="mr-1" />
                      Chỉnh sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            Không tìm thấy người dùng nào.
          </div>
        )}

        {/* Modal */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-4 border w-80 shadow-lg rounded-md bg-white">
              <div className="mt-2">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Chỉnh sửa người dùng: {selectedUser.username}
                </h3>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vai trò
                  </label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                  >
                    <option value="ROLE_USER">USER</option>
                    <option value="ROLE_EMPLOYEE">EMPLOYEE</option>
                    <option value="ROLE_ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={closeModal}
                    className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleUpdateRole}
                    disabled={updating === selectedUser.id}
                    className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 text-sm"
                  >
                    {updating === selectedUser.id
                      ? "Đang cập nhật..."
                      : "Cập nhật"}
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    disabled={updating === selectedUser.id}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 flex items-center text-sm"
                  >
                    <FaTrash className="mr-1" />
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserPage;
