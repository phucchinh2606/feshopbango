import { useState, useEffect } from "react";
import productService from "../services/productService";
import categoryService from "../services/categoryService";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";
import { FaImage } from "react-icons/fa";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [resProd, resCat] = await Promise.all([
        productService.getAll({ size: 8 }), // Lấy 8 sản phẩm mới nhất
        categoryService.getAll(),
      ]);
      setProducts(resProd.data.content || resProd.data);
      setCategories(resCat.data);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <HeroSection />

      <div className="container mx-auto px-4 py-12 space-y-20">
        {/* SECTION 1: DANH MỤC NỔI BẬT */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif font-bold text-amber-900">
              Danh Mục Nổi Bật
            </h2>
            <div className="w-24 h-1 bg-amber-600 mx-auto mt-2"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.name}`}
                className="block overflow-hidden bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-amber-600 transition-all"
              >
                <div className="relative w-full h-40 bg-gray-100 overflow-hidden">
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-50">
                      <FaImage className="text-amber-300 text-4xl" />
                    </div>
                  )}
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-amber-900 text-lg">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* SECTION 2: TOP BÁN CHẠY (Grid đặc biệt) */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-amber-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              🔥 Top Bán Chạy
            </h2>
            <Link
              to="/products"
              className="text-amber-700 font-semibold hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* SECTION 3: SẢN PHẨM MỚI */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">
              Tác Phẩm Mới Nhất
            </h2>
            <p className="text-gray-500 italic mt-2">
              Vừa hoàn thiện bởi những nghệ nhân hàng đầu
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
