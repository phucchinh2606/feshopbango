import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaImage } from "react-icons/fa";
import categoryService from "../../services/categoryService";
import { useToast } from "../../context/ToastContext";

const AdminCategoryPage = () => {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho Modal
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null = thêm mới, object = sửa
  const [formData, setFormData] = useState({ name: "", image: null });
  const [imagePreview, setImagePreview] = useState(null);

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
        addToast("Xóa thành công!", "success");
        fetchCategories(); // Reload lại bảng
      } catch (error) {
        addToast(
          "Lỗi khi xóa: " + (error.response?.data?.message || error.message),
          "error"
        );
      }
    }
  };

  // 3. Xử lý chọn ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });

      // Hiển thị ảnh preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 4. Mở Modal (Thêm hoặc Sửa)
  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, image: null });
      setImagePreview(category.imageUrl || null);
    } else {
      setEditingCategory(null);
      setFormData({ name: "", image: null });
      setImagePreview(null);
    }
    setShowModal(true);
  };

  // 5. Xử lý Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      if (editingCategory) {
        // Logic Sửa
        await categoryService.update(editingCategory.id, formDataToSend);
        addToast("Cập nhật thành công!", "success");
      } else {
        // Logic Thêm mới
        await categoryService.create(formDataToSend);
        addToast("Thêm mới thành công!", "success");
      }
      setShowModal(false);
      fetchCategories(); // Reload dữ liệu
    } catch (error) {
      addToast(
        "Có lỗi xảy ra: " + (error.response?.data?.message || error.message),
        "error"
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
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ảnh
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-10">
                  Đang tải...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-10">
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
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                        <FaImage className="text-gray-400" />
                      </div>
                    )}
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
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-screen overflow-y-auto">
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

              {/* Upload Ảnh */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Ảnh Danh mục
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {imagePreview ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded mb-2"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="text-sm text-gray-600 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, image: null });
                          setImagePreview(null);
                        }}
                        className="mt-2 text-red-600 hover:text-red-900 text-sm"
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  ) : (
                    <div>
                      <FaImage
                        className="mx-auto text-gray-400 mb-2"
                        size={32}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="text-sm text-gray-600 cursor-pointer"
                      />
                      <p className="text-gray-500 text-xs mt-2">
                        Chọn ảnh hoặc kéo thả ảnh vào đây
                      </p>
                    </div>
                  )}
                </div>
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
