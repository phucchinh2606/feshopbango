import React, { useEffect, useState } from "react";

import productService from "../services/productService.js";
import categoryService from "../services/categoryService.js";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection.jsx";
import Footer from "../components/Footer.jsx";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy danh mục
  const fetchCategories = async () => {
    try {
      // Code ngắn gọn, dễ hiểu
      const response = await categoryService.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  const fetchProducts = async (keyword = "") => {
    setLoading(true); // 1. Bắt đầu tải -> Hiện loading
    try {
      let response;
      if (keyword) {
        response = await productService.search(keyword);
      } else {
        response = await productService.getAll();
      }

      // Kiểm tra cấu trúc dữ liệu (như đã bàn ở bước trước)
      const data = response.data?.content || response.data || [];
      setProducts(data);

      console.log("Đã set products:", data); // Kiểm tra xem dòng này có chạy ko
    } catch (error) {
      console.error("Lỗi lấy sản phẩm:", error);
      // Có thể setProducts([]) nếu lỗi để tránh crash
    } finally {
      // 👇 QUAN TRỌNG: Dòng này bắt buộc phải có để tắt chữ "Đang tải..."
      setLoading(false);
    }
  };

  // Lọc theo danh mục
  const handleCategoryClick = async (id) => {
    try {
      const response = await productService.getByCategory(id);
      setProducts(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearch={fetchProducts} />

      <HeroSection />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar: Danh mục */}
          <aside className="w-full md:w-1/4">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
              Danh Mục
            </h2>
            <ul className="space-y-2">
              <li
                className="cursor-pointer hover:text-amber-700 hover:bg-amber-50 p-2 rounded transition"
                onClick={() => fetchProducts()} // Reset về tất cả
              >
                Tất cả sản phẩm
              </li>
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className="cursor-pointer hover:text-amber-700 hover:bg-amber-50 p-2 rounded transition"
                  onClick={() => handleCategoryClick(cat.id)}
                >
                  {cat.name}
                </li>
              ))}
            </ul>
          </aside>

          {/* Main Content: Danh sách sản phẩm */}
          <main className="w-full md:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Sản phẩm nổi bật
              </h2>
              <span className="text-gray-500">{products.length} sản phẩm</span>
            </div>

            {loading ? (
              // TRƯỜNG HỢP 1: Đang tải
              <div className="text-center py-20">Đang tải dữ liệu...</div>
            ) : // TRƯỜNG HỢP 2: Tải xong -> Kiểm tra có dữ liệu không
            products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              // TRƯỜNG HỢP 3: Tải xong nhưng không có sản phẩm
              <div className="text-center py-20 text-gray-500">
                Không tìm thấy sản phẩm nào.
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
