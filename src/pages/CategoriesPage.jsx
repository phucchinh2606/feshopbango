import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import categoryService from "../services/categoryService";
import { FaImage } from "react-icons/fa";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getAll();
        console.log("Categories from API:", res.data);
        setCategories(res.data);
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-amber-900 mb-2">
            Danh Mục Sản Phẩm
          </h1>
          <p className="text-gray-600 text-lg">
            Khám phá bộ sưu tập đồ gỗ mỹ nghệ Việt Nam
          </p>
          <div className="w-24 h-1 bg-amber-600 mx-auto mt-4"></div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-amber-200 focus:outline-none focus:border-amber-600 text-gray-700"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full"></div>
            </div>
            <p className="text-gray-600 mt-4">Đang tải danh mục...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {searchTerm
                ? "Không tìm thấy danh mục phù hợp"
                : "Chưa có danh mục nào"}
            </p>
          </div>
        ) : (
          <>
            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredCategories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.name}`}
                  className="group block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-105 transform"
                >
                  {/* Category Image */}
                  {/* Thay thế đoạn hiển thị ảnh trong vòng lặp map của bạn */}
                  <div className="relative w-full h-56 bg-gray-200 overflow-hidden">
                    {cat.imageUrl ? (
                      <>
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          // Fix nếu link ảnh die
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=500&auto=format&fit=crop";
                          }}
                        />
                        {/* Overlay: Chuyển text thành comment hoặc xóa bỏ */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 to-orange-50">
                        <FaImage className="text-amber-300 text-5xl mb-2" />
                        <span className="text-amber-400 text-xs font-medium">
                          Chưa có ảnh
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Category Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-amber-900 mb-2 group-hover:text-amber-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">Xem sản phẩm →</p>
                    <div className="flex items-center justify-center pt-2 border-t border-amber-100">
                      <span className="text-amber-600 font-semibold text-sm">
                        Khám phá
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Results Count */}
            <div className="text-center mt-12 text-gray-600">
              <p>Hiển thị {filteredCategories.length} danh mục</p>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CategoriesPage;
