import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaArrowLeft,
  FaShoppingBag,
} from "react-icons/fa";
import cartService from "../services/cartService";
import productService from "../services/productService";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { formatCurrency } from "../utils/formatter";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

const CartPage = () => {
  const navigate = useNavigate();
  const { refreshCartCount } = useCart(); // 👇 Lấy hàm refresh
  const { addToast } = useToast();

  // 👇 1. Thêm state lưu danh sách ID các sản phẩm được chọn
  const [selectedItems, setSelectedItems] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false); // Để disable nút khi đang gọi API
  const [quantityInputs, setQuantityInputs] = useState({}); // local input values per cart item
  const [quantityErrors, setQuantityErrors] = useState({}); // per-item error messages
  const [latestStocks, setLatestStocks] = useState({}); // lưu stock mới nhất từ backend {productId: stockQty}
  const errorTimers = useRef({});

  // Hàm tải dữ liệu giỏ hàng
  const fetchCart = async () => {
    try {
      const response = await cartService.getCart();
      setCart(response.data);
    } catch (error) {
      console.error("Lỗi tải giỏ hàng:", error);
      // Nếu chưa đăng nhập (401) hoặc lỗi khác
      if (error.response && error.response.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Sync local input map from cart when cart changes
  // (kept here to ensure effect order)

  useEffect(() => {
    if (!cart || !cart.items) return;
    const map = {};
    cart.items.forEach((it) => {
      map[it.id] = String(it.quantity);
    });
    setQuantityInputs(map);
  }, [cart]);

  // 👇 Effect để fetch stock mới nhất từ backend cho tất cả products trong giỏ
  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) return;

    const fetchAllStocks = async () => {
      const newStocks = {};
      const promises = cart.items.map(async (item) => {
        try {
          const pRes = await productService.getById(item.product.id);
          newStocks[item.product.id] = pRes.data?.stockQuantity ?? 0;
        } catch (err) {
          console.warn(
            `Failed to fetch stock for product ${item.product.id}`,
            err
          );
          // Nếu lỗi, giữ stock từ cart item
          newStocks[item.product.id] = item.product?.stockQuantity ?? 0;
        }
      });
      await Promise.all(promises);
      setLatestStocks(newStocks);
    };

    fetchAllStocks();
  }, [cart]);

  // Xử lý cập nhật số lượng
  const handleQuantityChange = async (
    itemId,
    currentQty,
    type,
    stockQty,
    productId
  ) => {
    console.log("handleQuantityChange called", {
      itemId,
      currentQty,
      type,
      stockQty,
      productId,
      processing,
    });
    if (processing) {
      console.log("Ignored click because processing is true");
      return; // Chặn click liên tục
    }

    // On increase, fetch latest product to get fresh stock info
    let latestStock = stockQty;
    if (type === "increase" && productId) {
      try {
        const pRes = await productService.getById(productId);
        latestStock = pRes.data?.stockQuantity;
        console.log("Fetched latest stock", { productId, latestStock });
      } catch (err) {
        console.warn("Failed to fetch product for stock check", err);
      }
    }

    // Nếu cố tăng mà đã đạt tối đa trong kho thì báo lỗi cho người dùng và chặn
    if (
      type === "increase" &&
      typeof latestStock === "number" &&
      currentQty >= latestStock
    ) {
      showQuantityError(itemId, `Chỉ còn ${latestStock} sản phẩm trong kho.`);
      return;
    }

    let newQty = currentQty;
    if (type === "decrease") {
      if (currentQty === 1) return; // Không giảm dưới 1 (hoặc có thể hỏi xóa)
      newQty = currentQty - 1;
    } else {
      newQty = currentQty + 1;
    }
    // Nếu newQty vượt quá tồn kho thì giới hạn về tồn kho
    const capStock = typeof latestStock === "number" ? latestStock : stockQty;
    if (typeof capStock === "number" && newQty > capStock) {
      showQuantityError(itemId, `Chỉ còn ${capStock} sản phẩm trong kho.`);
      newQty = capStock;
    }

    // Nếu sau giới hạn không có thay đổi thực chất thì bỏ qua
    if (newQty === currentQty) {
      console.log("No quantity change needed after capping", {
        itemId,
        currentQty,
        newQty,
      });
      return;
    }
    setProcessing(true);
    try {
      // Gọi API update
      const response = await cartService.updateItemQuantity(itemId, newQty);
      // Cập nhật lại state cart với dữ liệu mới từ Backend trả về
      setCart(response.data);
      refreshCartCount(); // 👇 CẬP NHẬT NAVBAR NGAY
    } catch (error) {
      addToast("Không thể cập nhật số lượng.", "error");
    } finally {
      setProcessing(false);
    }
  };

  // Show per-item error for a few seconds
  const showQuantityError = (itemId, message) => {
    // clear existing timer
    if (errorTimers.current[itemId]) {
      clearTimeout(errorTimers.current[itemId]);
    }
    setQuantityErrors((s) => ({ ...s, [itemId]: message }));
    errorTimers.current[itemId] = setTimeout(() => {
      setQuantityErrors((s) => {
        const copy = { ...s };
        delete copy[itemId];
        return copy;
      });
      delete errorTimers.current[itemId];
    }, 4000);
  };

  // Handle typing in the quantity input (local only)
  const handleQtyInputChange = (itemId, value) => {
    // allow empty string while typing, but keep only digits
    const sanitized = value.replace(/[^0-9]/g, "");
    // clear error when user types
    setQuantityErrors((s) => {
      const copy = { ...s };
      delete copy[itemId];
      return copy;
    });
    setQuantityInputs((s) => ({ ...s, [itemId]: sanitized }));
  };

  // Commit typed value on blur or enter
  const handleQtyInputCommit = async (
    itemId,
    rawValue,
    stockQty,
    productId,
    currentQty
  ) => {
    const parsed = parseInt(rawValue, 10);
    if (isNaN(parsed) || parsed < 1) {
      // restore previous
      setQuantityInputs((s) => ({ ...s, [itemId]: String(currentQty) }));
      return;
    }

    let newQty = parsed;
    // fetch latest stock if productId provided
    let latestStock = stockQty;
    if (productId) {
      try {
        const pRes = await productService.getById(productId);
        latestStock = pRes.data?.stockQuantity;
      } catch (err) {
        console.warn("Failed to fetch product for commit", err);
      }
    }

    if (typeof latestStock === "number" && newQty > latestStock)
      newQty = latestStock;

    if (newQty === currentQty) {
      // update input to normalized value
      setQuantityInputs((s) => ({ ...s, [itemId]: String(currentQty) }));
      return;
    }

    setProcessing(true);
    try {
      const response = await cartService.updateItemQuantity(itemId, newQty);
      setCart(response.data);
      refreshCartCount();
    } catch (err) {
      addToast("Không thể cập nhật số lượng.", "error");
      // rollback input
      setQuantityInputs((s) => ({ ...s, [itemId]: String(currentQty) }));
    } finally {
      setProcessing(false);
    }
  };

  // Xử lý xóa 1 sản phẩm
  const handleRemoveItem = async (itemId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) return;

    setProcessing(true);
    try {
      const response = await cartService.removeItem(itemId);
      setCart(response.data); // Backend trả về giỏ hàng mới sau khi xóa
      refreshCartCount(); // 👇 CẬP NHẬT NAVBAR NGAY
    } catch (error) {
      console.error(error);
      addToast("Lỗi khi xóa sản phẩm.", "error");
    } finally {
      setProcessing(false);
    }
  };

  // Xử lý xóa toàn bộ
  const handleClearCart = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) return;

    setProcessing(true);
    try {
      const response = await cartService.clearCart();
      setCart(response.data);
      refreshCartCount(); // 👇 CẬP NHẬT NAVBAR NGAY
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  // 👇 2. Hàm xử lý khi tick vào checkbox
  const handleCheckboxChange = (itemId) => {
    if (selectedItems.includes(itemId)) {
      // Nếu đã có -> Bỏ chọn
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      // Nếu chưa có -> Chọn
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  // 👇 3. Hàm xử lý Chọn tất cả
  const handleSelectAll = (e) => {
    if (e.target.checked && cart) {
      const allIds = cart.items.map((item) => item.id);
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  // 👇 4. Hàm chuyển sang trang Checkout
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      addToast("Vui lòng chọn ít nhất một sản phẩm để thanh toán.", "error");
      return;
    }

    // Lọc ra các object item chi tiết dựa trên ID đã chọn để truyền sang trang sau
    const itemsToCheckout = cart.items.filter((item) =>
      selectedItems.includes(item.id)
    );

    // Chuyển hướng và gửi kèm dữ liệu (state)
    navigate("/checkout", { state: { items: itemsToCheckout } });
  };

  // 👇 5. Tính tổng tiền của CÁC MÓN ĐƯỢC CHỌN
  const selectedTotal =
    cart?.items
      .filter((item) => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + item.subtotal, 0) || 0;

  if (loading)
    return <div className="text-center py-20">Đang tải giỏ hàng...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar onSearch={() => {}} />

      <div className="container mx-auto px-4 py-10 flex-grow">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <FaShoppingBag /> Giỏ Hàng Của Bạn
        </h1>

        {!cart || !cart.items || cart.items.length === 0 ? (
          // TRƯỜNG HỢP GIỎ HÀNG TRỐNG
          <div className="text-center bg-white p-12 rounded-lg shadow-sm">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
              alt="Empty Cart"
              className="w-32 h-32 mx-auto mb-4 opacity-50"
            />
            <p className="text-xl text-gray-600 mb-6">
              Giỏ hàng của bạn đang trống.
            </p>
            <Link
              to="/"
              className="bg-amber-600 text-white px-6 py-3 rounded-full hover:bg-amber-700 transition shadow-lg"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          // TRƯỜNG HỢP CÓ SẢN PHẨM
          <div className="flex flex-col lg:flex-row gap-8">
            {/* DANH SÁCH SẢN PHẨM (Bên Trái) */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {/* Header Bảng */}
                <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b text-sm font-semibold text-gray-600">
                  <div className="col-span-1 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        cart &&
                        cart.items.length > 0 &&
                        selectedItems.length === cart.items.length
                      }
                      className="w-4 h-4 cursor-pointer"
                    />
                  </div>
                  <div className="col-span-6">Sản phẩm</div>
                  <div className="col-span-2 text-center">Đơn giá</div>
                  <div className="col-span-2 text-center">Số lượng</div>
                  <div className="col-span-2 text-right">Thành tiền</div>
                </div>

                {/* Items */}
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0 hover:bg-gray-50 transition"
                  >
                    {/* Checkbox từng dòng */}
                    <div className="col-span-1 text-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleCheckboxChange(item.id)}
                        className="w-4 h-4 cursor-pointer accent-amber-600"
                      />
                    </div>
                    {/* Cột Sản phẩm (Ảnh + Tên) */}
                    <div className="col-span-6 flex items-center gap-4">
                      <Link to={`/product/${item.product.id}`}>
                        <img
                          src={
                            item.product.imageUrl ||
                            "https://via.placeholder.com/80"
                          }
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded border"
                        />
                      </Link>
                      <div>
                        <Link
                          to={`/product/${item.product.id}`}
                          className="font-medium text-gray-800 hover:text-amber-600 line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 text-xs mt-2 flex items-center gap-1 hover:underline"
                        >
                          <FaTrash /> Xóa
                        </button>
                      </div>
                    </div>

                    {/* Cột Đơn giá */}
                    <div className="col-span-2 text-center text-gray-600 font-medium">
                      {formatCurrency(item.product.price)}
                    </div>

                    {/* Cột Số lượng */}
                    <div className="col-span-2 flex justify-center">
                      <div className="flex items-center border border-gray-300 rounded w-fit">
                        <button
                          disabled={processing || item.quantity <= 1}
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              item.quantity,
                              "decrease",
                              item.product?.stockQuantity,
                              item.product?.id
                            )
                          }
                          className="px-2 py-1 hover:bg-gray-200 disabled:opacity-50"
                        >
                          <FaMinus size={10} />
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={
                            quantityInputs[item.id] ?? String(item.quantity)
                          }
                          onChange={(e) =>
                            handleQtyInputChange(item.id, e.target.value)
                          }
                          onBlur={() =>
                            handleQtyInputCommit(
                              item.id,
                              quantityInputs[item.id] ?? String(item.quantity),
                              item.product?.stockQuantity,
                              item.product?.id,
                              item.quantity
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.currentTarget.blur();
                            }
                          }}
                          disabled={processing}
                          className="px-2 w-10 text-center text-sm font-medium border-l border-r focus:outline-none"
                        />
                        <button
                          disabled={
                            processing ||
                            (typeof latestStocks[item.product.id] ===
                              "number" &&
                              item.quantity >= latestStocks[item.product.id])
                          }
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              item.quantity,
                              "increase",
                              item.product?.stockQuantity,
                              item.product?.id
                            )
                          }
                          title={
                            typeof latestStocks[item.product.id] === "number" &&
                            item.quantity >= latestStocks[item.product.id]
                              ? `Đã đạt tối đa trong kho (${
                                  latestStocks[item.product.id]
                                })`
                              : undefined
                          }
                          className="px-2 py-1 hover:bg-gray-200 disabled:opacity-50"
                        >
                          <FaPlus size={10} />
                        </button>
                      </div>
                    </div>

                    {/* Cột Thành tiền */}
                    <div className="col-span-2 text-right font-bold text-amber-700">
                      {formatCurrency(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Nút Xóa hết & Tiếp tục mua */}
              <div className="flex justify-between mt-6">
                <Link
                  to="/"
                  className="flex items-center gap-2 text-gray-600 hover:text-amber-600 font-medium"
                >
                  <FaArrowLeft /> Tiếp tục xem hàng
                </Link>
                <button
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-800 font-medium border border-red-200 px-4 py-2 rounded hover:bg-red-50 transition"
                >
                  Xóa toàn bộ giỏ hàng
                </button>
              </div>
            </div>

            {/* TỔNG KẾT GIỎ HÀNG (Bên Phải) */}
            <div className="lg:w-1/3">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-24">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                  Cộng Giỏ Hàng
                </h3>

                <div className="flex justify-between mb-2 text-gray-600">
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(cart.totalCartPrice)}</span>
                </div>
                <div className="flex justify-between mb-4 text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span>Miễn phí</span>
                </div>

                <div className="flex justify-between mb-2 text-gray-600">
                  <span>Đã chọn:</span>
                  <span>{selectedItems.length} sản phẩm</span>
                </div>

                <div className="border-t border-dashed border-gray-300 pt-4 flex justify-between items-center mb-6">
                  <span className="font-bold text-lg text-gray-800">
                    Tổng cộng:
                  </span>
                  <span className="text-2xl font-bold text-red-600">
                    {formatCurrency(cart.totalCartPrice)}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                  className={`w-full text-white font-bold py-3 rounded shadow-lg transition-all ${
                    selectedItems.length === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-amber-600 hover:bg-amber-700 hover:shadow-amber-500/50"
                  }`}
                >
                  MUA HÀNG ({selectedItems.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;
