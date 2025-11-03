"use client";

import { useState, useEffect } from "react";

const VideoBackground = () => {
  const videos = [
    "/assets/valorant.mp4",
    "/assets/bgmi.mp4"
  ];

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    }, 5000); // Change video every 5 seconds

    return () => clearInterval(interval);
  }, [videos.length]);

  return (
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-indigo-900/20"></div>
      <video
        key={currentVideoIndex} // Key ensures video re-renders when source changes
        className="absolute inset-0 w-full h-full object-cover opacity-40"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={videos[currentVideoIndex]} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#00FFAA] opacity-20 animate-pulse"
            style={{
              width: Math.random() * 5 + 2 + "px",
              height: Math.random() * 5 + 2 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              animationDelay: Math.random() * 5 + "s",
              animationDuration: Math.random() * 10 + 10 + "s",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoBackground;
