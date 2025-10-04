import React, { useState, useEffect } from "react";
import { getUserId } from "../utils/userId";
import {
  ExternalLink,
  Copy,
  Check,
  Trash2,
  ChartBar as BarChart3,
  CircleAlert as AlertCircle,
} from "lucide-react";

const UrlHistory = ({ urlHistory, setUrlHistory }) => {
  const userId = getUserId();
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Fetch user history on component mount
  useEffect(() => {
    fetchUserHistory();
  }, []);

  const fetchUserHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/history?limit=10`, {
        headers: { "x-user-id": userId },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch history");
      }

      if (data.success) {
        const formattedHistory = data.data.map((item) => ({
          id: item.id,
          original: item.originalUrl,
          shortened: item.shortUrl,
          date: new Date(item.createdAt).toLocaleDateString(),
          clicks: item.clicks || 0,
          createdAt: item.createdAt,
          lastAccessed: item.lastAccessed,
        }));

        setUrlHistory(formattedHistory);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
      setError(err.message || "Failed to load URL history");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (url, id) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDelete = async (shortId) => {
    if (!confirm("Are you sure you want to delete this URL?")) {
      return;
    }

    try {
      setDeletingId(shortId);

      const response = await fetch(`${API_BASE_URL}/api/delete/${shortId}`, {
        headers: { "x-user-id": userId },
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete URL");
      }

      if (data.success) {
        // Remove from local state
        setUrlHistory((prev) => prev.filter((item) => item.id !== shortId));
      }
    } catch (err) {
      console.error("Error deleting URL:", err);
      alert(err.message || "Failed to delete URL");
    } finally {
      setDeletingId(null);
    }
  };

  const fetchStats = async (shortId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats/${shortId}`, {
        headers: { "x-user-id": userId },
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setStats((prev) => ({
          ...prev,
          [shortId]: data.data,
        }));
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleStatsClick = (shortId) => {
    if (!stats[shortId]) {
      fetchStats(shortId);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 sm:p-8">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading your URLs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 sm:p-8">
        <div className="flex items-center gap-3 text-red-600 p-4 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error loading history</p>
            <p className="text-sm text-red-500">{error}</p>
          </div>
          <button
            onClick={fetchUserHistory}
            className="ml-auto px-3 py-1 text-sm bg-red-100 hover:bg-red-200 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (urlHistory.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 sm:p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent URLs</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <ExternalLink className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No URLs shortened yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Your shortened URLs will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Recent URLs</h3>
        <button
          onClick={fetchUserHistory}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {urlHistory.map((entry) => (
          <div
            key={entry.id}
            className="flex flex-col gap-4 p-4 bg-gray-50/70 rounded-xl hover:bg-gray-100/70 transition-colors"
          >
            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <p className="text-sm text-gray-500">Original URL</p>
                <p className="text-gray-900 break-all text-sm">
                  {entry.original}
                </p>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-gray-500">Shortened URL</p>
                <div className="flex items-center gap-2">
                  <p className="text-purple-600 font-medium break-all text-sm flex-1">
                    {entry.shortened}
                  </p>
                  <button
                    onClick={() => handleCopy(entry.shortened, entry.id)}
                    className="p-1 hover:bg-white rounded transition-colors"
                    title="Copy URL"
                  >
                    {copiedId === entry.id ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              <div className="lg:text-right space-y-2 lg:min-w-[120px]">
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-sm text-gray-700">{entry.date}</p>
                {entry.clicks > 0 && (
                  <p className="text-xs text-green-600 font-medium">
                    {entry.clicks} clicks
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <button
                onClick={() => handleDelete(entry.id)}
                disabled={deletingId === entry.id}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {deletingId === entry.id ? (
                  <div className="w-3 h-3 border border-red-600/30 border-t-red-600 rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
                Delete
              </button>
            </div>

            {/* Stats Display */}
            {stats[entry.id] && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-blue-600 font-medium">
                      {stats[entry.id].clicks}
                    </p>
                    <p className="text-blue-500 text-xs">Total Clicks</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium">
                      {new Date(stats[entry.id].createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-blue-500 text-xs">Created</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium">
                      {stats[entry.id].lastAccessed
                        ? new Date(
                            stats[entry.id].lastAccessed
                          ).toLocaleDateString()
                        : "Never"}
                    </p>
                    <p className="text-blue-500 text-xs">Last Accessed</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium">{entry.id}</p>
                    <p className="text-blue-500 text-xs">Short ID</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UrlHistory;
