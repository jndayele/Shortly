import React from "react";
import { Zap, Shield, Globe } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Zap className="w-6 h-6 text-purple-600" aria-hidden="true" />,
      bg: "bg-purple-100",
      title: "Lightning Fast",
      desc: "Generate short URLs instantly with our optimized processing engine.",
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-600" aria-hidden="true" />,
      bg: "bg-blue-100",
      title: "Secure & Reliable",
      desc: "Your links are protected with enterprise-grade security measures.",
    },
    {
      icon: <Globe className="w-6 h-6 text-green-600" aria-hidden="true" />,
      bg: "bg-green-100",
      title: "Global Access",
      desc: "Share your shortened URLs anywhere in the world with 99.9% uptime.",
    },
  ];

  return (
    <section
      className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-12"
      aria-labelledby="features-heading"
    >
      <h2 id="features-heading" className="sr-only">
        Key Features of Shortly
      </h2>
      {features.map((f, i) => (
        <article
          key={i}
          className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50"
        >
          <div
            className={`w-12 h-12 ${f.bg} rounded-lg flex items-center justify-center mb-4`}
            aria-hidden="true"
          >
            {f.icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {f.title}
          </h3>
          <p className="text-gray-600">{f.desc}</p>
        </article>
      ))}
    </section>
  );
};

export default Features;
