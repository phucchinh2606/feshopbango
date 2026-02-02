import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import Navbar from "../components/Navbar";

const NewsPage = () => {
  const [newsArticles, setNewsArticles] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axiosClient.get("/news");
        setNewsArticles(response.data);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };
    fetchNews();
  }, []);

  return (
    <>
      <Navbar onSearch={() => {}} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Tin Tức Đồ Gỗ
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                  {article.title}
                </h2>
                <p className="text-gray-600 text-sm mb-3">
                  {new Date(article.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {article.content}
                </p>
                <a
                  href={`/news/${article.id}`}
                  className="text-amber-600 hover:underline font-medium"
                >
                  Đọc thêm
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default NewsPage;
