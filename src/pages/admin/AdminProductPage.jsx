import React, { useEffect, useState } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaImage,
  FaSearch,
} from "react-icons/fa";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import { formatCurrency } from "../../utils/formatter";
import { useToast } from "../../context/ToastContext";

const AdminProductPage = () => {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // Để đổ vào Dropdown
  const [loading, setLoading] = useState(true);

  // State cho tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // State cho Modal
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // State cho Modal chi tiết sản phẩm
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null); // State lưu file ảnh

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    imageUrl: "",
    categoryId: "", // Quan trọng: Lưu ID danh mục
    stockQuantity: 0, // Thêm trường này
  });

  // 1. Load dữ liệu (Sản phẩm + Danh mục)
  const fetchData = async () => {
    setLoading(true);
    try {
      // Gọi song song 2 API cho nhanh
      const [productRes, categoryRes] = await Promise.all([
        productService.getAll({ size: 1000, page: 0 }), // Lấy tối đa 1000 sản phẩm
        categoryService.getAll(),
      ]);

      // Xử lý dữ liệu sản phẩm (API trả về Page nên lấy .content)
      const productData = productRes.data.content || productRes.data || [];
      setProducts(productData);

      setCategories(categoryRes.data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Logic lọc sản phẩm
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "" ||
      product.category?.id === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // 2. Xử lý Input thay đổi
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 3. Mở Modal
  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        description: product.description || "",
        imageUrl: product.imageUrl || "",
        categoryId: product.category?.id || "", // Lấy ID từ object category
        stockQuantity: product.stockQuantity || 0,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        price: "",
        description: "",
        imageUrl: "",
        categoryId: categories.length > 0 ? categories[0].id : "",
        stockQuantity: 100,
      });
    }
    setSelectedFile(null);
    setShowModal(true);
  };

  // Hàm xử lý khi chọn file ảnh
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // 👇 SỬA HÀM SUBMIT ĐỂ GỬI FORM DATA
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Tạo FormData object để gửi dữ liệu dạng multipart
    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("description", formData.description);
    data.append("categoryId", formData.categoryId);
    data.append("stockQuantity", formData.stockQuantity);

    // Chỉ append file nếu có file mới được chọn
    if (selectedFile) {
      data.append("file", selectedFile);
    }

    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, data);
        addToast("Cập nhật thành công!", "success");
      } else {
        // Tạo mới bắt buộc phải có file (theo Controller của bạn)
        if (!selectedFile) {
          addToast("Vui lòng chọn ảnh sản phẩm!", "error");
          return;
        }
        if (editingProduct) {
          // Cập nhật sản phẩm
          await productService.update(editingProduct.id, data);
          addToast("Cập nhật sản phẩm thành công!", "success");
        } else {
          // Thêm mới sản phẩm
          await productService.create(data);
          addToast("Thêm sản phẩm thành công!", "success");
        }
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error(error);
      addToast(
        "Lỗi: " + (error.response?.data?.message || error.message),
        "error"
      );
    }
  };

  // 5. Xóa sản phẩm
  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await productService.delete(id);
        addToast("Xóa thành công!", "success");
        fetchData();
      } catch (error) {
        addToast("Không thể xóa sản phẩm này.", "error");
      }
    }
  };

  // 6. Mở modal chi tiết sản phẩm
  const openDetailModal = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  // 7. Đóng modal chi tiết
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedProduct(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Sản phẩm</h2>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <FaPlus /> Thêm Sản phẩm
        </button>
      </div>

      {/* TÌM KIẾM VÀ LỌC */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm sản phẩm
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Nhập tên sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lọc theo danh mục
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-2 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Hiển thị {filteredProducts.length} / {products.length} sản phẩm
          </div>
          {(searchTerm || selectedCategory) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
              }}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">ID</th>
              <th className="py-3 px-6 text-left">Hình ảnh</th>
              <th className="py-3 px-6 text-left">Tên sản phẩm</th>
              <th className="py-3 px-6 text-center">Danh mục</th>
              <th className="py-3 px-6 text-right">Giá</th>
              <th className="px-6 py-3">Tồn kho</th> {/* 👈 THÊM DÒNG NÀY */}
              <th className="py-3 px-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-10">
                  Đang tải...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-10">
                  {products.length === 0
                    ? "Chưa có sản phẩm nào."
                    : "Không tìm thấy sản phẩm phù hợp."}
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {product.id}
                  </td>
                  <td className="py-3 px-6 text-left">
                    <img
                      src={product.imageUrl || "https://via.placeholder.com/50"}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => openDetailModal(product)}
                    />
                  </td>
                  <td className="py-3 px-6 text-left font-medium">
                    <span
                      className="cursor-pointer text-blue-600 hover:text-blue-800 hover:underline"
                      onClick={() => openDetailModal(product)}
                    >
                      {product.name}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span className="bg-gray-200 text-gray-700 py-1 px-3 rounded-full text-xs">
                      {product.category?.name || "N/A"}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right font-bold text-amber-600">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4 font-bold">
                    {product.stockQuantity}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center">
                      <button
                        onClick={() => openModal(product)}
                        className="w-4 mr-2 transform hover:text-blue-500 hover:scale-110"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="w-4 mr-2 transform hover:text-red-500 hover:scale-110"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl animate-fade-in-down max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-xl font-bold text-gray-800">
                {editingProduct ? "Cập nhật Sản phẩm" : "Thêm Sản phẩm Mới"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Tên sản phẩm */}
              <div className="col-span-2">
                <label className="block text-sm font-bold mb-2">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              {/* Giá */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  Giá (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>

              {/* Số lượng tồn kho */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  Tồn kho <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  required
                  min="0"
                  className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                />
              </div>

              {/* Danh mục (Dropdown) */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  required
                  className="w-full p-2 border rounded focus:outline-none focus:border-blue-500 bg-white"
                  value={formData.categoryId}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* URL Ảnh */}
              {/* 👇 SỬA INPUT ẢNH THÀNH TYPE FILE */}
              <div className="col-span-2">
                <label className="block text-sm font-bold mb-2">
                  Ảnh Sản phẩm
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full p-2 border rounded"
                />
                {/* Preview ảnh cũ nếu đang sửa */}
                {editingProduct && !selectedFile && (
                  <img
                    src={editingProduct.imageUrl}
                    alt="Old"
                    className="h-20 mt-2 border rounded"
                  />
                )}
              </div>

              {/* Mô tả */}
              <div className="col-span-2">
                <label className="block text-sm font-bold mb-2">
                  Mô tả chi tiết
                </label>
                <textarea
                  name="description"
                  rows="4"
                  className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingProduct ? "Lưu Cập Nhật" : "Thêm Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT SẢN PHẨM */}
      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Chi tiết sản phẩm
                </h3>
                <button
                  onClick={closeDetailModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hình ảnh */}
                <div>
                  <img
                    src={
                      selectedProduct.imageUrl ||
                      "https://via.placeholder.com/300"
                    }
                    alt={selectedProduct.name}
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                </div>

                {/* Thông tin chi tiết */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      {selectedProduct.name}
                    </h4>
                    <p className="text-2xl font-bold text-amber-600">
                      {formatCurrency(selectedProduct.price)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        ID sản phẩm
                      </span>
                      <p className="font-semibold">{selectedProduct.id}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Danh mục
                      </span>
                      <p className="font-semibold">
                        {selectedProduct.category?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Tồn kho
                      </span>
                      <p className="font-semibold">
                        {selectedProduct.stockQuantity}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Trạng thái
                      </span>
                      <p
                        className={`font-semibold ${
                          selectedProduct.stockQuantity > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {selectedProduct.stockQuantity > 0
                          ? "Còn hàng"
                          : "Hết hàng"}
                      </p>
                    </div>
                  </div>

                  {selectedProduct.description && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Mô tả
                      </span>
                      <p className="mt-1 text-gray-700 leading-relaxed">
                        {selectedProduct.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={closeDetailModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    closeDetailModal();
                    openModal(selectedProduct);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <FaEdit /> Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductPage;
