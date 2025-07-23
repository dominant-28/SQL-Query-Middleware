import { CheckCircle, AlertTriangle } from "lucide-react";

export default function QueryResult({ result }) {
  if (result.error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
        <div className="flex items-center text-red-400">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span className="font-semibold">Error</span>
        </div>
        <p className="text-red-300 mt-2 break-words">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Query Results */}
      <div className="bg-black/20 rounded-lg p-4 border border-white/20">
        <h4 className="text-white font-semibold mb-2">Query Results</h4>
        <div className="text-sm text-gray-300 space-y-1">
          <p>Execution Time: {result.execTime}ms</p>
          <p>Rows Returned: {result.rows?.length || 0}</p>
        </div>
      </div>

      {/* Security Analysis */}
      <div
        className={`rounded-lg p-4 border ${
          result.suspicious
            ? "bg-red-500/20 border-red-500/50"
            : "bg-green-500/20 border-green-500/50"
        }`}
      >
        <div className="flex items-center mb-2">
          {result.suspicious ? (
            <AlertTriangle className="h-5 w-5 mr-2 text-red-400 flex-shrink-0" />
          ) : (
            <CheckCircle className="h-5 w-5 mr-2 text-green-400 flex-shrink-0" />
          )}
          <span
            className={`font-semibold ${
              result.suspicious ? "text-red-400" : "text-green-400"
            }`}
          >
            {result.suspicious
              ? "Security Issues Detected"
              : "Query Passed Security Check"}
          </span>
        </div>
        {result.feedback && result.feedback.length > 0 && (
          <ul className="space-y-1">
            {result.feedback.map((item, index) => (
              <li
                key={index}
                className={`text-sm break-words ${
                  item.severity === "critical"
                    ? "text-red-300"
                    : item.severity === "high"
                    ? "text-orange-300"
                    : item.severity === "medium"
                    ? "text-yellow-300"
                    : "text-green-300"
                }`}
              >
                • {item.message}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Data Preview */}
      {result.rows && result.rows.length > 0 && (
        <div className="bg-black/20 rounded-lg p-4 border border-white/20">
          <h4 className="text-white font-semibold mb-2">Data Preview</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  {Object.keys(result.rows[0]).map((key) => (
                    <th
                      key={key}
                      className="text-left py-2 px-4 text-gray-300 font-medium whitespace-nowrap"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.slice(0, 5).map((row, index) => (
                  <tr key={index} className="border-b border-white/10">
                    {Object.values(row).map((value, i) => (
                      <td
                        key={i}
                        className="py-2 px-4 text-gray-300 break-words max-w-xs"
                      >
                        {value !== null ? String(value) : "NULL"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {result.rows.length > 5 && (
              <p className="text-gray-400 text-xs mt-2">
                Showing first 5 rows of {result.rows.length} total results
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
