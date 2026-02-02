import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaMapMarkerAlt, FaStickyNote } from "react-icons/fa";
import addressService from "../services/addressService";
import orderService from "../services/orderService";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { formatCurrency } from "../utils/formatter";
import { useToast } from "../context/ToastContext";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshCartCount } = useCart(); // Để cập nhật lại số giỏ hàng sau khi mua thành công

  const { addToast } = useToast();

  // Lấy danh sách sản phẩm được truyền từ trang Cart
  const itemsToCheckout = location.state?.items || [];

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Nếu người dùng vào thẳng link /checkout mà không qua giỏ hàng -> Đuổi về
  useEffect(() => {
    if (itemsToCheckout.length === 0) {
      navigate("/cart");
    }
  }, [itemsToCheckout, navigate]);

  // Tải danh sách địa chỉ
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await addressService.getMyAddresses();
        setAddresses(res.data);
        // Mặc định chọn địa chỉ đầu tiên
        if (res.data && res.data.length > 0) {
          setSelectedAddressId(res.data[0].id);
        }
      } catch (error) {
        console.error("Lỗi tải địa chỉ", error);
      }
    };
    fetchAddresses();
  }, []);

  // Tính tổng tiền
  const totalAmount = itemsToCheckout.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      addToast("Vui lòng thêm/chọn địa chỉ nhận hàng!", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        addressId: selectedAddressId,
        cartItemIds: itemsToCheckout.map((item) => item.id),
        customerNote: note,
        paymentMethod: paymentMethod,
      };

      const orderResponse = await orderService.createOrder(payload);

      if (paymentMethod === "VNPAY") {
        // Tạo URL thanh toán VNPay
        const vnpayPayload = {
          orderId: orderResponse.data.orderId,
          amount: orderResponse.data.totalAmount,
          orderInfo: `Thanh toan don hang ${orderResponse.data.orderId}`,
        };

        const vnpayResponse = await orderService.createVNPayPayment(
          vnpayPayload
        );

        // Redirect đến VNPay
        window.location.href = vnpayResponse.data.paymentUrl;
      } else {
        // COD: Chuyển đến trang profile
        addToast("Đặt hàng thành công!", "success");

        // Cập nhật lại số lượng trên Navbar (vì các món đã mua sẽ bị xóa khỏi giỏ)
        refreshCartCount();

        // Chuyển hướng đến trang Profile -> Tab Đơn mua
        navigate("/profile");
      }
    } catch (error) {
      console.error(error);
      addToast(error.response?.data?.message || "Đặt hàng thất bại.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar onSearch={() => {}} />

      <div className="container mx-auto px-4 py-10 flex-grow">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Xác Nhận Đơn Hàng
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG & SẢN PHẨM */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Địa chỉ */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt /> Địa Chỉ Nhận Hàng
              </h3>

              {addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start p-3 border rounded-lg cursor-pointer transition ${
                        selectedAddressId === addr.id
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        className="mt-1 mr-3 accent-amber-600"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                      />
                      <div>
                        <span className="font-medium text-gray-800">
                          {addr.fullAddress}
                        </span>
                        {addr.note && (
                          <div className="text-sm text-gray-500 italic">
                            ({addr.note})
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Bạn chưa có địa chỉ nào.
                  <Link to="/profile" className="text-amber-600 font-bold ml-2">
                    Thêm ngay
                  </Link>
                </div>
              )}
            </div>

            {/* Phương thức thanh toán */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                <span className="text-xl">💳</span> Phương Thức Thanh Toán
              </h3>

              <div className="space-y-3">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer transition hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3 accent-amber-600"
                  />
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚚</span>
                    <div>
                      <div className="font-medium text-gray-800">
                        Thanh toán khi nhận hàng (COD)
                      </div>
                      <div className="text-sm text-gray-500">
                        Thanh toán bằng tiền mặt khi nhận hàng
                      </div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-4 border rounded-lg cursor-pointer transition hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPAY"
                    checked={paymentMethod === "VNPAY"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3 accent-amber-600"
                  />
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💳</span>
                    <div>
                      <div className="font-medium text-gray-800">
                        Thanh toán online (VNPay)
                      </div>
                      <div className="text-sm text-gray-500">
                        Thanh toán qua VNPay - An toàn và tiện lợi
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* 2. Danh sách sản phẩm */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Sản Phẩm ({itemsToCheckout.length})
              </h3>
              <div className="divide-y">
                {itemsToCheckout.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-4">
                    <img
                      src={
                        item.product.imageUrl ||
                        "https://via.placeholder.com/60"
                      }
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded border"
                    />
                    <div className="flex-grow">
                      <h4 className="font-medium text-gray-800">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Đơn giá: {formatCurrency(item.product.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">x{item.quantity}</p>
                      <p className="font-bold text-amber-700">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Ghi chú */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaStickyNote /> Ghi Chú Cho Shop
              </h3>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-amber-500"
                rows="3"
                placeholder="Ví dụ: Giao hàng vào giờ hành chính, gọi trước khi giao..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              ></textarea>
            </div>
          </div>

          {/* CỘT PHẢI: TỔNG KẾT */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24 border border-amber-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">
                Tổng Kết Đơn Hàng
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tiền hàng:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span>Miễn phí</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-red-600 pt-3 border-t border-dashed">
                  <span>Tổng thanh toán:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className={`w-full text-white font-bold py-3 rounded-lg shadow-lg transition-all ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-amber-600 hover:bg-amber-700 hover:shadow-amber-500/50"
                }`}
              >
                {loading
                  ? "Đang xử lý..."
                  : paymentMethod === "VNPAY"
                  ? "THANH TOÁN VNPAY"
                  : "ĐẶT HÀNG"}
              </button>

              <p className="text-xs text-center text-gray-400 mt-4">
                Nhấn "Đặt hàng" đồng nghĩa với việc bạn đồng ý tuân theo điều
                khoản của chúng tôi.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
