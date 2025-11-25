import React from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <div className="relative w-full h-[500px] or md:h-[600px] overflow-hidden">
      {/* 1. Hình nền (Background Image) */}
      {/* Bạn có thể thay đổi URL ảnh này bằng ảnh thật từ Cloudinary của bạn hoặc ảnh local */}
      <img
        src="https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=2727&auto=format&fit=crop"
        alt="Đồ gỗ mỹ nghệ background"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* 2. Lớp phủ màu đen (Overlay) để làm nổi bật chữ */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* 3. Nội dung chính */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
        <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 drop-shadow-lg">
          Tinh Hoa Gỗ Việt
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl drop-shadow-md text-gray-200">
          Mang vẻ đẹp tự nhiên, sang trọng và đẳng cấp vào không gian sống của
          bạn với những sản phẩm thủ công mỹ nghệ tinh xảo nhất.
        </p>

        {/* Nút kêu gọi hành động */}
        <button
          onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}
          className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-amber-500/50"
        >
          Khám Phá Ngay
        </button>
      </div>
    </div>
  );
};

export default HeroSection;
