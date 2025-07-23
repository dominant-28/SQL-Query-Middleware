
export default function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    red: "from-red-500 to-red-600",
    yellow: "from-yellow-500 to-yellow-600",
    green: "from-green-500 to-green-600",
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-300 truncate">
            {title}
          </p>
          <p className="text-2xl font-bold text-white truncate">
            {value}
          </p>
        </div>
        <div
          className={`flex-shrink-0 p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
