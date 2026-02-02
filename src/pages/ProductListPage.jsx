import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import productService from "../services/productService";
import categoryService from "../services/categoryService";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaFilter, FaSortAmountDown } from "react-icons/fa";

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt,desc");

  // Lấy query param từ URL (ví dụ: ?category=Bàn ghế)
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryFromUrl = queryParams.get("category");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedCategory, sortBy, location.search]);

  const fetchCategories = async () => {
    const res = await categoryService.getAll();
    setCategories(res.data || []);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const keyword = queryParams.get("keyword") || "";
      const params = {
        page: 0,
        size: 12,
        sort: sortBy,
        ...(selectedCategory !== "all" && { categoryName: selectedCategory }),
        ...(keyword && { name: keyword }),
      };

      const res = await productService.getAll(params);
      setProducts(res.data.content || res.data || []);
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* SIDEBAR - BỘ LỌC */}
          <aside className="w-full md:w-1/4 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="flex items-center gap-2 font-bold text-lg mb-4 text-amber-900 border-b pb-2">
                <FaFilter size={14} /> Danh mục
              </h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full text-left px-3 py-2 rounded-md transition ${
                      selectedCategory === "all"
                        ? "bg-amber-700 text-white"
                        : "hover:bg-amber-50"
                    }`}
                  >
                    Tất cả sản phẩm
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`w-full text-left px-3 py-2 rounded-md transition ${
                        selectedCategory === cat.name
                          ? "bg-amber-700 text-white"
                          : "hover:bg-amber-50 text-gray-600"
                      }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* MAIN CONTENT - DANH SÁCH */}
          <main className="w-full md:w-3/4">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-6 gap-4">
              <h1 className="text-xl font-bold text-gray-800">
                {selectedCategory === "all"
                  ? "Tất cả sản phẩm"
                  : selectedCategory}
              </h1>

              <div className="flex items-center gap-3">
                <FaSortAmountDown className="text-gray-400" />
                <select
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="createdAt,desc">Mới nhất</option>
                  <option value="price,asc">Giá: Thấp đến Cao</option>
                  <option value="price,desc">Giá: Cao đến Thấp</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white h-80 animate-pulse rounded-xl"
                  ></div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <p className="text-gray-500 italic">
                  Không tìm thấy sản phẩm nào phù hợp.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductListPage;
