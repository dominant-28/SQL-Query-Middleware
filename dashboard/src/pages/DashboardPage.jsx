import React, { useState, useEffect } from "react";
import {
  Settings,
  Database,
  AlertTriangle,
  Clock,
  TrendingUp,
} from "lucide-react";
import StatCard from "../components/StatCard";
import LogsTable from "../components/LogsTable";

export default function DashboardPage({ user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    suspicious: 0,
    avgTime: 0,
    recentActivity: 0,
  });

  useEffect(() => {
    if (user) {
      fetchLogs();
      const interval = setInterval(fetchLogs, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/logs`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!Array.isArray(data)) {
      console.warn("Backend /api/logs did not return an array:", data);
      setLogs([]); // fallback to empty logs
      return;
    }
      setLogs(data);

      const total = data.length;
      const suspicious = data.filter((log) => log.suspicious).length;
      const avgTime =
        data.reduce((sum, log) => sum + log.execution_time_ms, 0) / total || 0;
      const recentActivity = data.filter(
        (log) =>
          new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length;

      setStats({ total, suspicious, avgTime, recentActivity });
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12 px-4">
        <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">
          No Configuration Found
        </h3>
        <p className="text-gray-400">
          Please configure your database connection first.
        </p>
      </div>
    );
  }

async function clearLogs() {
  const confirmed = window.confirm("Are you sure you want to delete ALL logs?");
  if (!confirmed) return;

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/logs/clear`, {
      method: "DELETE",
      credentials: "include" 
    });

    const data = await res.json();
    if (data.status === "success") {
      alert("Logs cleared!");
      setLogs([]); 
    } else {
      alert("Failed to clear logs.");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong.");
  }
}

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Query Analytics Dashboard
        </h2>
        <p className="text-gray-300">
          Monitor your database queries in real-time
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Queries"
          value={stats.total}
          icon={<Database className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Suspicious Queries"
          value={stats.suspicious}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="red"
        />
        <StatCard
          title="Avg Response Time"
          value={`${stats.avgTime.toFixed(0)}ms`}
          icon={<Clock className="h-6 w-6" />}
          color="yellow"
        />
        <StatCard
          title="Recent Activity"
          value={stats.recentActivity}
          icon={<TrendingUp className="h-6 w-6" />}
          color="green"
        />
      </div>

      {/* Logs Table */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-white/20">
          <h3 className="text-xl font-semibold text-white">
            Recent Query Logs
          </h3>
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear All Logs
          </button>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No queries logged yet</p>
            </div>
          ) : (
            <div className="min-w-full">
              <LogsTable logs={logs} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
