import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import categoryService from "../../services/categoryService";

const AdminCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho Modal
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null = thêm mới, object = sửa
  const [formData, setFormData] = useState({ name: "" });

  // 1. Load dữ liệu
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getAll();
      setCategories(res.data);
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Xử lý Xóa
  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa danh mục này? Lưu ý: Các sản phẩm thuộc danh mục này có thể bị ảnh hưởng."
      )
    ) {
      try {
        await categoryService.delete(id);
        alert("Xóa thành công!");
        fetchCategories(); // Reload lại bảng
      } catch (error) {
        alert(
          "Lỗi khi xóa: " + (error.response?.data?.message || error.message)
        );
      }
    }
  };

  // 3. Mở Modal (Thêm hoặc Sửa)
  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name });
    } else {
      setEditingCategory(null);
      setFormData({ name: "" });
    }
    setShowModal(true);
  };

  // 4. Xử lý Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        // Logic Sửa
        await categoryService.update(editingCategory.id, formData);
        alert("Cập nhật thành công!");
      } else {
        // Logic Thêm mới
        await categoryService.create(formData);
        alert("Thêm mới thành công!");
      }
      setShowModal(false);
      fetchCategories(); // Reload dữ liệu
    } catch (error) {
      alert(
        "Có lỗi xảy ra: " + (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Danh mục</h2>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <FaPlus /> Thêm Danh mục
        </button>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                ID
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tên Danh mục
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="text-center py-10">
                  Đang tải...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-10">
                  Chưa có danh mục nào.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      #{cat.id}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 font-medium">{cat.name}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm text-center">
                    <button
                      onClick={() => openModal(cat)}
                      className="text-blue-600 hover:text-blue-900 mx-2"
                      title="Sửa"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-red-600 hover:text-red-900 mx-2"
                      title="Xóa"
                    >
                      <FaTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM / SỬA */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 animate-fade-in-down">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-bold">
                {editingCategory ? "Cập nhật Danh mục" : "Thêm Danh mục Mới"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tên Danh mục
                </label>
                <input
                  type="text"
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nhập tên danh mục..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  {editingCategory ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoryPage;
