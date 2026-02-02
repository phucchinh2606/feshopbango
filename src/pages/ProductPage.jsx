import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import productService from "../services/productService";
import categoryService from "../services/categoryService";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Tất cả sản phẩm");

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const categoryName = searchParams.get("category") || "";
  const keyword = searchParams.get("keyword") || "";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAll();
        setCategories(res.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const params = {
        page: page,
        size: 12,
        categoryName: categoryName,
        keyword: keyword,
      };

      try {
        const res = await productService.getAll(params);
        setProducts(res.data.content);
        setTotalPages(res.data.totalPages);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    
    if (categoryName) {
        setTitle(`Danh mục: ${categoryName}`);
    } else if (keyword) {
        setTitle(`Kết quả tìm kiếm cho "${keyword}"`);
    } else {
        setTitle("Tất cả sản phẩm");
    }

  }, [location.search, page, categoryName, keyword]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      window.scrollTo(0, 0); // Scroll to top on page change
    }
  };
  
  const handleCategoryClick = (catName) => {
    setPage(0);
    navigate(`/products?category=${catName}`);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
  
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(0, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);
  
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }
  
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
  
    return (
      <div className="flex justify-center items-center gap-2 mt-12">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 0}
          className="p-2 rounded-md hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaChevronLeft />
        </button>
  
        {startPage > 0 && (
           <>
             <button onClick={() => handlePageChange(0)} className="px-4 py-2 rounded-md hover:bg-amber-100">1</button>
             {startPage > 1 && <span className="px-4 py-2">...</span>}
           </>
        )}
  
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`px-4 py-2 rounded-md ${page === number ? 'bg-amber-800 text-white' : 'hover:bg-amber-100'}`}
          >
            {number + 1}
          </button>
        ))}
  
        {endPage < totalPages - 1 && (
          <>
            {endPage < totalPages - 2 && <span className="px-4 py-2">...</span>}
            <button onClick={() => handlePageChange(totalPages - 1)} className="px-4 py-2 rounded-md hover:bg-amber-100">{totalPages}</button>
          </>
        )}
  
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages - 1}
          className="p-2 rounded-md hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaChevronRight />
        </button>
      </div>
    );
  };


  return (
    <div className="bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-1/4 lg:w-1/5">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-28">
              <h3 className="text-xl font-bold text-amber-900 mb-4 border-b-2 border-amber-800 pb-2">
                Danh Mục
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/products" 
                     className={`block px-4 py-2 rounded-md transition-colors font-medium ${!categoryName ? 'bg-amber-100 text-amber-900' : 'text-gray-700 hover:bg-amber-50 hover:text-amber-800'}`}
                     onClick={() => setPage(0)}
                  >
                    Tất Cả Sản Phẩm
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleCategoryClick(cat.name)}
                      className={`w-full text-left block px-4 py-2 rounded-md transition-colors font-medium ${categoryName === cat.name ? 'bg-amber-100 text-amber-900' : 'text-gray-700 hover:bg-amber-50 hover:text-amber-800'}`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <main className="w-full md:w-3/4 lg:w-4/5">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{title}</h1>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm p-4">
                     <div className="bg-gray-200 h-48 w-full rounded"></div>
                     <div className="h-5 bg-gray-200 rounded w-3/4 mt-4"></div>
                     <div className="h-8 bg-gray-200 rounded w-1/2 mt-2"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {renderPagination()}
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-xl text-gray-500">Không tìm thấy sản phẩm nào.</p>
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductPage;
