import React, { useState } from "react";
import { Shield, Loader } from "lucide-react";

export default function LoginPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    const endpoint = isRegister ? `${import.meta.env.VITE_API_URL}/api/register` : `${import.meta.env.VITE_API_URL}/api/login`;

    const payload = isRegister
      ? { username, email, password }
      : { email, password }; // Changed: use email for login instead of username

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error || `${isRegister ? "Registration" : "Login"} failed`);
      }
    } catch (error) {
      setError(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10">
      {/* Header Section */}
      <div className="flex items-center space-x-2 mb-6 sm:mb-8 lg:mb-10">
        <Shield className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-purple-400" />
        <h1 className="text-xl sm:text-3xl lg:text-5xl font-bold text-white text-center">
          Smart Query Proxy
        </h1>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            {isRegister ? "Create an Account" : "Please Login"}
          </h2>
          <p className="text-gray-300 text-sm sm:text-base lg:text-xl mt-2 px-4">
            {isRegister
              ? "Register to start using the dashboard"
              : "Login to access the dashboard"}
          </p>
        </div>

        {/* Login/Register Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20 w-full">
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm sm:text-base break-words">
              {error}
            </div>
          )}
          
          <div className="space-y-4 sm:space-y-5">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                required
              />
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 sm:py-3 lg:py-4 px-4 sm:px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center text-sm sm:text-base lg:text-lg"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                  {isRegister ? "Creating Account..." : "Signing In..."}
                </>
              ) : (
                isRegister ? "Register" : "Login"
              )}
            </button>
          </div>

          {/* Toggle Login/Register */}
          <div className="text-center mt-4 sm:mt-6">
            <p className="text-gray-400 text-sm sm:text-base">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError("");
                  setUsername("");
                  setEmail("");
                  setPassword("");
                }}
                className="text-purple-400 underline hover:text-purple-300 transition-colors font-medium"
              >
                {isRegister ? "Login here" : "Register here"}
              </button>
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 sm:mt-8 text-center">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 sm:p-4">
            <p className="text-blue-300 text-xs sm:text-sm">
              <span className="font-semibold">🔒 Secure Authentication</span>
              <br />
              Your credentials are encrypted and stored securely
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
