import React from "react";

const HeroSection = () => {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
        Shorten URLs in
        <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          {" "}
          seconds
        </span>
      </h2>
      <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
        Transform long, complex URLs into short, shareable links. Fast, secure,
        and completely free.
      </p>
    </div>
  );
};

export default HeroSection;
