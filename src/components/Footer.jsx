import React from "react";
import {
  FaFacebook,
  FaInstagram,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-amber-950 text-gray-300 pt-12 pb-6 mt-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Cột 1: Thông tin thương hiệu */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Đồ Gỗ Phúc Chỉnh
            </h3>
            <p className="text-sm leading-relaxed mb-4">
              Chúng tôi chuyên cung cấp các sản phẩm đồ gỗ cao cấp, được chạm
              khắc thủ công bởi những nghệ nhân lành nghề nhất. Uy tín và chất
              lượng là kim chỉ nam.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-amber-500 transition">
                <FaFacebook size={24} />
              </a>
              <a href="#" className="hover:text-amber-500 transition">
                <FaInstagram size={24} />
              </a>
            </div>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4 border-b border-amber-800 pb-2 inline-block">
              Liên Kết
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-amber-500 transition">
                  Trang Chủ
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-500 transition">
                  Về Chúng Tôi
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="hover:text-amber-500 transition"
                >
                  Sản Phẩm
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-500 transition">
                  Liên Hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Chính sách */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4 border-b border-amber-800 pb-2 inline-block">
              Chính Sách
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-amber-500 transition">
                  Chính sách bảo hành
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-500 transition">
                  Chính sách đổi trả
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-500 transition">
                  Vận chuyển & Giao nhận
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-500 transition">
                  Bảo mật thông tin
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4 border-b border-amber-800 pb-2 inline-block">
              Liên Hệ
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-1 text-amber-500" />
                <span>
                  Vườn Xoài ngõ Mới, Làng Nghề Đồ Gỗ Châu Phong, Xã Thư Lâm, TP.
                  Hà Nội
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhoneAlt className="text-amber-500" />
                <span>0899.727.854</span>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-amber-500" />
                <span>chinhdo266@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Dòng bản quyền */}
        <div className="border-t border-amber-900 mt-10 pt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Đồ Gỗ Phúc Chỉnh. Bảo lưu mọi quyền.
          Được thiết kế bởi Phúc Chỉnh.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
