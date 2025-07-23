import React, { useState } from "react";
import { Database, Play, Loader } from "lucide-react";

import QueryResult from "../components/QueryResult";

export default function QueryTestPage({ user }) {
  const [query, setQuery] = useState("SELECT * FROM users LIMIT 10;");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/query`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: query }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <Database className="h-10 w-10 sm:h-12 sm:w-12 text-purple-400 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
            Query Tester
          </h2>
          <p className="text-gray-300 text-sm sm:text-base lg:text-lg px-4">
            Test your SQL queries through the proxy
          </p>
        </div>

        {/* Query Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2 sm:mb-3">
                SQL Query
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-24 sm:h-32 md:h-40 px-3 py-2 sm:px-4 sm:py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs sm:text-sm resize-none"
                placeholder="Enter your SQL query here..."
                required
              />
            </div>

            {/* User Status Indicator */}
            {!user && (
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 sm:p-4">
                <div className="text-yellow-300 text-sm sm:text-base">
                  ⚠️ Please configure your database connection first to execute queries.
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !user}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 sm:py-3 lg:py-4 px-4 sm:px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center text-sm sm:text-base lg:text-lg"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Execute Query
                </>
              )}
            </button>
          </div>

          {/* Results Section */}
          {result && (
            <div className="mt-4 sm:mt-6 space-y-4">
              <div className="border-t border-white/20 pt-4 sm:pt-6">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
                  Results
                </h3>
                <QueryResult result={result} />
              </div>
            </div>
          )}
        </div>

        {/* Quick Examples Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
            Quick Examples
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              "SELECT * FROM users LIMIT 5;",
              "SELECT COUNT(*) FROM orders;",
              "SHOW TABLES;",
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setQuery(example)}
                className="text-left p-3 bg-black/20 hover:bg-black/30 border border-white/20 hover:border-white/40 rounded-lg transition-all group"
              >
                <div className="font-mono text-xs sm:text-sm text-gray-300 group-hover:text-white break-all">
                  {example}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 sm:p-6">
          <h3 className="text-blue-300 font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
            💡 Tips for testing queries:
          </h3>
          <div className="text-xs sm:text-sm text-blue-200 space-y-1 sm:space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
              <div>• Use LIMIT to avoid large result sets</div>
              <div>• Test with SELECT queries first</div>
              <div>• Check table names with SHOW TABLES</div>
              <div>• Use proper SQL syntax for your database</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
