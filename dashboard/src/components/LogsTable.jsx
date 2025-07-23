import { Database, CheckCircle, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function LogsTable({ logs }) {
  const getSeverityColor = (feedback) => {
    if (!feedback) return "text-gray-400";
    try {
      const parsed = JSON.parse(JSON.stringify(feedback));
      if (parsed.some((f) => f.severity === "critical")) return "text-red-400";
      if (parsed.some((f) => f.severity === "high")) return "text-orange-400";
      if (parsed.some((f) => f.severity === "medium")) return "text-yellow-400";
      return "text-green-400";
    } catch {
      return "text-gray-400";
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-black/20">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">
              Query
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">
              Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">
              Feedback
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">
              Timestamp
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {logs.map((log, index) => (
            <tr key={log.id || index} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                {index + 1}
              </td>
              <td className="px-6 py-4">
                <div className="max-w-xs overflow-hidden overflow-ellipsis whitespace-nowrap font-mono bg-black/20 px-2 py-1 rounded">
                  {log.query_text}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                {log.execution_time_ms.toFixed(0)}ms
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {log.suspicious ? (
                  <span className="flex items-center text-red-400">
                    <AlertTriangle className="h-4 w-4 mr-1 flex-shrink-0" />
                    Suspicious
                  </span>
                ) : (
                  <span className="flex items-center text-green-400">
                    <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    Clean
                  </span>
                )}
              </td>
              <td className={`px-6 py-4 ${getSeverityColor(log.feedback)}`}>
                <div className="prose max-w-xs break-words">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        return (
                          <code className="whitespace-pre-wrap break-words">{children}</code>
                        );
                      },
                    }}
                  >
                    {(() => {
                      const feedback = JSON.parse(JSON.stringify(log.feedback));
                      const ai = feedback.find((f) => f.type === "ai_analysis");
                      if (ai) return ai.message;

                      const fallback = feedback
                        .filter(
                          (f) => f.type === "optimization" || f.type === "success"
                        )
                        .map((f) => f.message)
                        .join("\n\n");

                      return fallback || "No feedback";
                    })()}
                  </ReactMarkdown>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                {new Date(log.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
