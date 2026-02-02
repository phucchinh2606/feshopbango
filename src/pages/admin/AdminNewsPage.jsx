import React, { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import axiosClient from "../../api/axiosClient";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const AdminNewsPage = () => {
  const [newsList, setNewsList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentNews, setCurrentNews] = useState({
    id: null,
    title: "",
    content: "",
    imageUrl: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axiosClient.get("/news");
      setNewsList(response.data);
    } catch (error) {
      addToast("Lỗi khi tải tin tức!", "error");
      console.error("Error fetching news:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentNews({ ...currentNews, [name]: value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setCurrentNews({ id: null, title: "", content: "", imageUrl: "" });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (news) => {
    setIsEditMode(true);
    setCurrentNews(news);
    setImageFile(null); // Clear image file when opening edit modal
    setIsModalOpen(true);
  };

  const closeNewsModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveNews = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", currentNews.title);
    formData.append("content", currentNews.content);

    if (imageFile) {
      formData.append("image", imageFile);
    } else if (currentNews.imageUrl) {
      // If no new file, but there's an existing image URL, we might want to keep it or handle explicit removal
      // For simplicity, we'll send a dummy value if no new file and imageUrl exists, backend should handle it
      // Or, the backend can just ignore if 'image' part is missing when imageUrl exists
      // If imageUrl is explicitly cleared by user and no new image, we might need a flag
      // For now, let's assume if currentNews.imageUrl is set, we don't clear it unless a new image is uploaded.
      // If user wants to explicitly remove image, frontend needs a way to signal it to backend.
      // A more robust solution might involve sending currentNews.imageUrl as a separate field or a flag.
      // For this example, let's assume currentNews.imageUrl is handled by backend if no new image.
    }

    try {
      if (isEditMode) {
        await axiosClient.put(`/news/${currentNews.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        addToast("Cập nhật tin tức thành công!", "success");
      } else {
        await axiosClient.post("/news", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        addToast("Thêm tin tức thành công!", "success");
      }
      fetchNews();
      closeNewsModal();
    } catch (error) {
      addToast("Lỗi khi lưu tin tức!", "error");
      console.error("Error saving news:", error);
    }
  };

  const handleDeleteNews = async (id) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa tin tức này?",
      text: "Bạn sẽ không thể hoàn tác hành động này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Vâng, xóa nó!",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosClient.delete(`/news/${id}`);
          addToast("Xóa tin tức thành công!", "success");
          fetchNews();
        } catch (error) {
          addToast("Lỗi khi xóa tin tức!", "error");
          console.error("Error deleting news:", error);
        }
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Quản lý Tin Tức
      </h1>

      <div className="flex justify-end mb-6">
        <button
          onClick={openAddModal}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <FaPlus /> Thêm Tin Tức Mới
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                ID
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Hình ảnh
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tiêu đề
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {newsList.map((news) => (
              <tr key={news.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {news.id}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {news.imageUrl && (
                    <img
                      src={news.imageUrl}
                      alt={news.title}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  )}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {news.title}
                  </p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {new Date(news.createdAt).toLocaleDateString()}
                  </p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                  <button
                    onClick={() => openEditModal(news)}
                    className="text-amber-600 hover:text-amber-900 mr-3"
                  >
                    <FaEdit className="inline-block" />
                  </button>
                  <button
                    onClick={() => handleDeleteNews(news.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash className="inline-block" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit News */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {isEditMode ? "Sửa Tin Tức" : "Thêm Tin Tức Mới"}
            </h2>
            <form onSubmit={handleSaveNews}>
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Tiêu đề
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={currentNews.title}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="content"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Nội dung
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={currentNews.content}
                  onChange={handleInputChange}
                  rows="5"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                ></textarea>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="image"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Hình ảnh
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                />
                {currentNews.imageUrl && !imageFile && (
                  <div className="mt-2">
                    <p className="text-gray-600 text-sm">Hình ảnh hiện tại:</p>
                    <img
                      src={currentNews.imageUrl}
                      alt="Current"
                      className="w-32 h-32 object-cover rounded-md mt-1"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
                >
                  {isEditMode ? "Cập nhật" : "Thêm"}
                </button>
                <button
                  type="button"
                  onClick={closeNewsModal}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNewsPage;
