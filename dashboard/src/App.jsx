import React, { useState, useEffect } from "react";
import { Database, Activity, Shield, Settings, LogOut, Key, Copy, CheckCircle, Menu, X } from "lucide-react";
import Setuppage from "./pages/Setuppage";
import DashboardPage from "./pages/DashboardPage";
import QueryTestPage from "./pages/QueryTestPage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("setup");
  const [config, setConfig] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // API Key modal state
  const [apiKey, setApiKey] = useState("");
  const [apiLoading, setApiLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

 useEffect(() => {
  fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Not authenticated");
      return res.json();
    })
    .then((data) => {
      setUser(data.user);
      return fetch(`${import.meta.env.VITE_API_URL}/api/get-config`, {
        credentials: "include",
      });
    })
    .then((res) => res.json())
    .then((configData) => {
      if (configData.DB_HOST) {
        setConfig(configData);
        setCurrentPage("dashboard");
      } else {
        setCurrentPage("setup");
      }
    })
    .catch(() => {
      setUser(null);
      setCurrentPage("login");
    })
    .finally(() => {
      setLoading(false);
    });
}, []);


  const handleLogout = async () => {
    try {
     await fetch(`${import.meta.env.VITE_API_URL}/api/logout`, {
  method: "POST",
  credentials: "include",
});
      setUser(null);
      setConfig(null);
      setCurrentPage("login");
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleGenerateApiKey = async () => {
    setApiLoading(true);
    setCopied(false);
    setError("");
    try {
    const res =  await fetch(`${import.meta.env.VITE_API_URL}/api/generate-apikey`, {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
});
      if (!res.ok) throw new Error("Failed to generate API key");
      const data = await res.json();
      setApiKey(data.api_key);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setApiLoading(false);
    }
  };

  const handleCopyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const closeApiKeyModal = () => {
    setApiKey("");
    setError("");
    setCopied(false);
    document.getElementById('my_modal_5').close();
  };

  const handleNavClick = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "setup":
        return (
          <Setuppage
            onConfigSaved={(cfg) => {
              setConfig(cfg);
              setCurrentPage("dashboard");
            }}
          />
        );
      case "dashboard":
        return <DashboardPage user={user} />;
      case "query":
        return <QueryTestPage user={user} />;
      default:
        return <Setuppage />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
              <h1 className="text-lg sm:text-xl font-bold text-white truncate">Smart Query Proxy</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="text-gray-300 text-sm hidden xl:block">
                Welcome, {user.username || user.email}
              </div>
              
              <button
                onClick={() => handleNavClick("setup")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  currentPage === "setup"
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:bg-white/10"
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Setup</span>
              </button>
              
              <button
                onClick={() => handleNavClick("dashboard")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  currentPage === "dashboard"
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:bg-white/10"
                }`}
              >
                <Activity className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
              
              <button
                onClick={() => handleNavClick("query")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  currentPage === "query"
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:bg-white/10"
                }`}
              >
                <Database className="h-4 w-4" />
                <span>Test Query</span>
              </button>

              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-white/10 transition"
                onClick={() => document.getElementById('my_modal_5').showModal()}
              >
                <Key className="h-4 w-4" />
                <span>API Key</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-md text-gray-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded="false"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-black/30 backdrop-blur-md rounded-lg mt-2 mb-4">
                {/* Welcome message for mobile */}
                <div className="px-3 py-2 text-gray-300 text-sm border-b border-white/10">
                  Welcome, {user.username || user.email}
                </div>
                
                <button
                  onClick={() => handleNavClick("setup")}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-all text-left ${
                    currentPage === "setup"
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Setup</span>
                </button>
                
                <button
                  onClick={() => handleNavClick("dashboard")}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-all text-left ${
                    currentPage === "dashboard"
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  <span>Dashboard</span>
                </button>
                
                <button
                  onClick={() => handleNavClick("query")}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-all text-left ${
                    currentPage === "query"
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <Database className="h-4 w-4" />
                  <span>Test Query</span>
                </button>

                <button
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/10 transition text-left"
                  onClick={() => {
                    document.getElementById('my_modal_5').showModal();
                    setMobileMenuOpen(false);
                  }}
                >
                  <Key className="h-4 w-4" />
                  <span>API Key</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-all text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {renderPage()}
      </main>

      {/* API Key Modal */}
      <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-black text-gray-900 mx-4 max-w-md sm:max-w-lg">
          <h3 className="font-bold text-lg flex items-center gap-2 text-white">
            <Key className="h-5 w-5 text-purple-500" />
            Generate API Key
          </h3>
          
          <p className="py-4 text-sm text-white">
            Generate a new API key for programmatic access to your account.
          </p>

          {/* Generate Button */}
          <div className="py-4">
            <button
              onClick={handleGenerateApiKey}
              disabled={apiLoading}
              className={`btn w-full ${apiLoading ? 'loading' : ''} btn-primary`}
            >
              {apiLoading ? "Generating..." : "Generate New API Key"}
            </button>
          </div>

          {/* API Key Display */}
          {apiKey && (
            <div className="space-y-3 p-4 bg-gray-900 rounded-lg">
              <label className="text-sm font-medium text-white">
                Your API Key:
              </label>
              <div className="flex items-center gap-2 p-3 bg-gray-700 border rounded-lg">
                <code className="flex-1 text-xs font-mono text-white break-all">
                  {apiKey}
                </code>
                <button
                  onClick={handleCopyApiKey}
                  className={`btn btn-sm ${copied ? 'btn-success' : 'btn-outline-primary'} flex-shrink-0`}
                  title={copied ? "Copied!" : "Copy to clipboard"}
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4 text-white" />
                  )}
                </button>
              </div>
              <div className="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.76 0L3.054 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm">
                  Keep this API key secure! Store it safely and don't share it publicly.
                </span>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="alert alert-error mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="modal-action flex-col sm:flex-row gap-2">
            <button 
              onClick={closeApiKeyModal}
              className="btn w-full sm:w-auto"
            >
              Close
            </button>
            <button onClick={closeApiKeyModal} className="btn btn-primary w-full sm:w-auto">
              Clear & Close
            </button>
          </div>
        </div>
      </dialog>
    </div>
  ) : (
    <LoginPage onLoginSuccess={setUser} />
  );
}
