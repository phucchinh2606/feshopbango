import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Navbar from "../components/Navbar";

const NewsDetailPage = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axiosClient.get(`/news/${id}`);
        setNews(response.data);
      } catch (err) {
        setError("Không tìm thấy tin tức hoặc có lỗi xảy ra!");
        console.error("Error fetching news detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Đang tải tin tức...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (!news) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Không có tin tức nào được tìm thấy.
      </div>
    );
  }

  return (
    <>
      <Navbar onSearch={() => {}} />
      <div className="container mx-auto px-4 py-8">
        <article className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">
            {news.title}
          </h1>
          <div className="text-gray-600 text-sm mb-6 text-center">
            Ngày đăng: {new Date(news.createdAt).toLocaleDateString()}
          </div>
          {news.imageUrl && (
            <div className="mb-8 flex justify-center">
              <img
                src={news.imageUrl}
                alt={news.title}
                className="rounded-lg shadow-sm max-h-96 object-cover"
              />
            </div>
          )}
          <div className="prose max-w-none text-gray-800 leading-relaxed">
            <p>{news.content}</p>
          </div>
        </article>
      </div>
    </>
  );
};

export default NewsDetailPage;
