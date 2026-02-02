import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";
import orderService from "../services/orderService";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useToast } from "../context/ToastContext";

const PaymentReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const hasProcessed = useRef(false); // Flag để tránh gọi API nhiều lần

  const [paymentResult, setPaymentResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tạo key từ searchParams để tránh xử lý lại cùng một bộ params
    const paramsKey = searchParams.toString();
    
    // Chỉ xử lý một lần cho mỗi bộ params
    if (hasProcessed.current === paramsKey) {
      return;
    }

    const processPaymentReturn = async () => {
      hasProcessed.current = paramsKey; // Đánh dấu đã xử lý params này

      try {
        // Lấy các tham số từ URL
        const params = {};
        for (let [key, value] of searchParams.entries()) {
          params[key] = value;
        }

        // Gọi API để xử lý kết quả thanh toán
        const response = await orderService.processVNPayReturn(params);
        const resultData = response.data; // Axios trả về data trong response.data
        setPaymentResult(resultData);

        if (resultData.status === "success") {
          addToast("Thanh toán thành công!", "success");
        } else {
          addToast("Thanh toán thất bại!", "error");
        }
      } catch (error) {
        console.error("Lỗi xử lý kết quả thanh toán:", error);
        setPaymentResult({
          status: "error",
          message: "Có lỗi xảy ra khi xử lý kết quả thanh toán",
        });
        addToast("Có lỗi xảy ra khi xử lý kết quả thanh toán", "error");
      } finally {
        setLoading(false);
      }
    };

    processPaymentReturn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Chạy khi searchParams thay đổi

  const getStatusIcon = () => {
    if (loading)
      return <FaSpinner className="animate-spin text-4xl text-blue-500" />;
    if (paymentResult?.status === "success")
      return <FaCheckCircle className="text-4xl text-green-500" />;
    return <FaTimesCircle className="text-4xl text-red-500" />;
  };

  const getStatusColor = () => {
    if (loading) return "text-blue-600";
    if (paymentResult?.status === "success") return "text-green-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar onSearch={() => {}} />

      <div className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">{getStatusIcon()}</div>

          <h2 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
            {loading
              ? "Đang xử lý..."
              : paymentResult?.status === "success"
              ? "Thanh toán thành công!"
              : "Thanh toán thất bại!"}
          </h2>

          <p className="text-gray-600 mb-6">
            {loading
              ? "Vui lòng đợi trong giây lát..."
              : paymentResult?.message}
          </p>

          {!loading && (
            <div className="space-y-3">
              <Link
                to="/profile"
                className="block w-full bg-amber-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-700 transition"
              >
                Xem đơn hàng của tôi
              </Link>

              <Link
                to="/"
                className="block w-full bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentReturnPage;
