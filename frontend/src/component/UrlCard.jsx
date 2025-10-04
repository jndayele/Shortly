import React from "react";
import { useState } from "react";
import { getUserId } from "../utils/userId";
import {
  Zap,
  Globe,
  Copy,
  Check,
  CircleAlert as AlertCircle,
} from "lucide-react";

const UrlCard = () => {
  const userId = getUserId();
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [urlHistory, setUrlHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const handleShorten = async () => {
    if (!originalUrl.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ url: originalUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to shorten URL");
      }

      if (data.success) {
        setShortenedUrl(data.data.shortUrl);

        // Create new entry for local state
        const newEntry = {
          id: data.data.id,
          original: data.data.originalUrl,
          shortened: data.data.shortUrl,
          date: new Date(data.data.createdAt).toLocaleDateString(),
          clicks: 0,
          createdAt: data.data.createdAt,
        };

        // Update local history
        setUrlHistory((prev) => [newEntry, ...prev.slice(0, 9)]);
      }
    } catch (err) {
      console.error("Error shortening URL:", err);
      setError(err.message || "Failed to shorten URL. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortenedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError("Failed to copy to clipboard");
    }
  };

  const isValidUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleInputChange = (e) => {
    setOriginalUrl(e.target.value);
    setError("");
    setShortenedUrl("");
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 sm:p-8 mb-12">
      <div className="space-y-6">
        {/* Input Section */}
        <div>
          <label
            htmlFor="url-input"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Enter your long URL
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                id="url-input"
                type="url"
                value={originalUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/very-long-url"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                disabled={isLoading}
              />
              <Globe className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <button
              onClick={handleShorten}
              disabled={
                !originalUrl.trim() || !isValidUrl(originalUrl) || isLoading
              }
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 min-w-[120px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Shorten
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* URL Validation Message */}
          {originalUrl && !isValidUrl(originalUrl) && !error && (
            <p className="text-red-500 text-sm mt-2">
              Please enter a valid URL starting with http:// or https://
            </p>
          )}
        </div>

        {/* Result Section */}
        {shortenedUrl && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Your shortened URL:
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex-1 bg-white rounded-lg px-4 py-3 border border-green-200">
                <p className="text-purple-600 font-medium break-all">
                  {shortenedUrl}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-green-200 rounded-lg hover:bg-green-50 transition-colors duration-200 font-medium text-gray-700 min-w-[100px] justify-center"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <p>
                Original: <span className="break-all">{originalUrl}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UrlCard;
