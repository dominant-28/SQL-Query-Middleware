import React, { useState } from "react";
import { Database, CheckCircle, AlertCircle, Loader } from "lucide-react";
import HowToUse from "../components/HowToUse";

export default function Setuppage({ onConfigSaved }) {
  const [form, setForm] = useState({
    DB_HOST: "localhost",
    DB_PORT: "3306",
    DB_USER: "",
    DB_PASS: "",
    DB_NAME: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [testResult, setTestResult] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const testConnection = async () => {
    setLoading(true);
    setMessage("Testing database connection...");
    setTestResult(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/test-connection`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok) {
        setTestResult({ success: true, message: "Connection successful!" });
        setMessage("✅ Database connection test passed!");
      } else {
        setTestResult({ success: false, message: data.error });
        setMessage(`❌ Connection failed: ${data.error}`);
      }
    } catch (error) {
      setTestResult({ success: false, message: error.message });
      setMessage(`❌ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("Saving configuration...");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/save-config`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Configuration saved successfully!");
        onConfigSaved({
          ...data,
          USER_ID: data.user_id,
        });
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20">
          <div className="text-center mb-6 sm:mb-8">
            <Database className="h-10 w-10 sm:h-12 sm:w-12 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Database Configuration
            </h2>
            <p className="text-gray-300 text-sm sm:text-base">
              Connect your database to start monitoring queries
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Host and Port - Stack on mobile, side by side on larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Database Host
                </label>
                <input
                  type="text"
                  name="DB_HOST"
                  value={form.DB_HOST}
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                  placeholder="localhost"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Port
                </label>
                <input
                  type="number"
                  name="DB_PORT"
                  value={form.DB_PORT}
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                  placeholder="3306"
                  required
                />
              </div>
            </div>

            {/* Database Name - Full width */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Database Name
              </label>
              <input
                type="text"
                name="DB_NAME"
                value={form.DB_NAME}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                placeholder="my_database"
                required
              />
            </div>

            {/* Username and Password - Stack on mobile, side by side on larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="DB_USER"
                  value={form.DB_USER}
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                  placeholder="username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="DB_PASS"
                  value={form.DB_PASS}
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                  placeholder="password"
                  required
                />
              </div>
            </div>

            {/* Buttons - Stack on mobile, side by side on larger screens */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={testConnection}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center text-sm sm:text-base"
              >
                {loading ? (
                  <Loader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                ) : (
                  <Database className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                )}
                Test Connection
              </button>

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading || !testResult?.success}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center text-sm sm:text-base"
              >
                {loading ? (
                  <Loader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                )}
                Save Configuration
              </button>
            </div>
          </div>

          {/* Test Result */}
          {testResult && (
            <div
              className={`mt-4 p-3 sm:p-4 rounded-lg flex items-start sm:items-center ${
                testResult.success
                  ? "bg-green-500/20 border border-green-500/50"
                  : "bg-red-500/20 border border-red-500/50"
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5 sm:mt-0" />
              ) : (
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5 sm:mt-0" />
              )}
              <span
                className={`${testResult.success ? "text-green-300" : "text-red-300"} text-sm sm:text-base break-words`}
              >
                {testResult.message}
              </span>
            </div>
          )}

          {/* Status Message */}
          {message && (
            <div
              className={`mt-4 p-3 sm:p-4 rounded-lg text-sm sm:text-base break-words ${
                message.includes("✅")
                  ? "bg-green-500/20 text-green-300"
                  : "bg-red-500/20 text-red-300"
              }`}
            >
              {message}
            </div>
          )}

          {/* Integration Instructions */}
         <HowToUse/>
        </div>
      </div>
    </div>
  );
}
