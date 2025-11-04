"use client";

import React, { useState, useEffect } from "react";
import BreadCrumb from "@/components/Application/Admin/BreadCrumb";
import UploadMedia from "@/components/Application/Admin/UploadMedia";
import { ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute";

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: "Home" },
  { href: "", label: "Media" },
];

const MediaPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        // Call our own API endpoint that fetches images from Cloudinary
        const response = await fetch("/api/cloudinary/images", {
          method: "GET"
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch images from Cloudinary");
        }
        
        const data = await response.json();
        // Transform the data to get the image URLs
        const imageUrls = data.resources.map(img => img.secure_url);
        setImages(imageUrls);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="space-y-4">
      <BreadCrumb breadcrumbData={breadcrumbData} />
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl shadow-sm">
        <UploadMedia />
      </div>
      
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Media Library</h2>
        
        {loading && (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        
        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <img 
                  src={image} 
                  alt={`Cloudinary image ${index + 1}`} 
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button className="bg-white text-gray-800 px-2 py-1 rounded text-sm font-medium hover:bg-gray-100 mr-2">View</button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded text-sm font-medium hover:bg-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && !error && images.length === 0 && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <p>No images found in your media library.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaPage;
