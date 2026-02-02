import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroImage1 from "../../../img/quangcao1.jpg";
import heroImage2 from "../../../img/quangcao2.jpg";
import heroImage3 from "../../../img/quangcao3.jpg";
import heroImage4 from "../../../img/quangcao4.jpg";

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const advertisements = [
    "✨ KHAI XUÂN NHƯ Ý - GIẢM GIÁ 20% TẤT CẢ TƯỢNG GỖ",
    "🚚 MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC CHO ĐƠN HÀNG TRÊN 5TR",
    "💎 CAM KẾT GỖ TỰ NHIÊN 100% - BẢO HÀNH TRỌN ĐỜI",
    "🛠️ NHẬN ĐẶT HÀNG THEO YÊU CẦU - THIẾT KẾ RIÊNG BIỆT",
  ];

  const heroBanners = [
    heroImage1,
    heroImage2,
    heroImage3,
    heroImage4,
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroBanners.length);
    }, 3000); // Chuyển ảnh mỗi 5 giây

    return () => clearInterval(interval);
  }, [heroBanners.length]);

  return (
    <div className="w-full">
      {/* Banner chạy ngang (Marquee) */}
      <div className="bg-amber-700 text-amber-50 py-2 overflow-hidden border-b border-amber-800">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...advertisements, ...advertisements].map((ad, i) => (
            <span
              key={i}
              className="mx-10 font-medium uppercase tracking-widest text-sm"
            >
              {ad} <span className="ml-10">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Hero Image Carousel */}
      <div className="relative h-[400px] md:h-[550px] bg-gray-900 overflow-hidden">
        {heroBanners.map((banner, index) => (
          <img
            key={index}
            src={banner}
            className={`absolute w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
            alt={`Hero Banner ${index + 1}`}
          />
        ))}

        {/* Dots Navigation */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
          {heroBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-3 w-3 rounded-full transition-all ${
                index === currentImageIndex
                  ? "bg-amber-500 w-8"
                  : "bg-white bg-opacity-50 hover:bg-opacity-75"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
