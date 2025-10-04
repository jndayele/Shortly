import React from "react";
import { useState } from "react";
import Header from "./component/Header";
import HeroSection from "./component/HeroSection";
import UrlCard from "./component/UrlCard";
import Features from "./component/Features";
import UrlHistory from "./component/UrlHistory";
import Footer from "./component/Footer";

const App = () => {
  const [urlHistory, setUrlHistory] = useState([]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 ">
      <Header c />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <HeroSection />
        <UrlCard setUrlHistory={urlHistory} />
        <Features />
        <UrlHistory urlHistory={urlHistory} setUrlHistory={setUrlHistory} />
      </main>
      <Footer />
    </div>
  );
};

export default App;
