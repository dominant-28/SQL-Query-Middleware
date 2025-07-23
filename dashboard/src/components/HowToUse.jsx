import React from "react";

export default function HowToUse() {
  return (
    <div className="mt-4 sm:mt-6">
      <div className="collapse collapse-arrow bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <input type="checkbox" className="peer" />
        <div className="collapse-title font-semibold text-blue-300">
          📘 How to integrate this proxy into your development workflow
        </div>
        <div className="collapse-content text-blue-200 space-y-4 text-sm">
          {/* Intro */}
          <div>
            <p>
              This app acts as a <strong>middleware</strong> between your
              application and your actual MySQL database. It helps you{" "}
              <strong>track, log, and analyze</strong> every query you run during
              development.
            </p>
            <p className="mt-2">
              Instead of connecting directly to your DB, you point your requests
              to this proxy. The proxy forwards your query, logs it, analyzes it,
              and returns the DB result — exactly like your DB would.
            </p>
          </div>

          {/* Steps */}
          <div>
            <h3 className="text-blue-300 font-semibold mb-1">
              🛠️ Steps to use:
            </h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                <strong>Generate your API key:</strong> Use the “Generate API Key”
                button in your dashboard. Keep it secret.
              </li>
              <li>
                <strong>Configure your DB connection:</strong> Save your database
                host, user, and password in your account. This will be used by the
                proxy. And one time you can set one configuration if you want to set other new configuration, again set configuration. It will get update. 
              </li>
              <li>
                <strong>Update your app’s DB calls:</strong> Instead of hitting
                your DB directly, send a <code>POST</code> request to{" "}
                <code>/api/query</code> on this proxy.
              </li>
              <li>
                <strong>Include your API key:</strong> Add your API key in the{" "}
                <code>Authorization</code> header as{" "}
                <code>Bearer YOUR_API_KEY</code>.
              </li>
            </ol>
          </div>

          {/* Example Request */}
          <div>
            <h3 className="text-blue-300 font-semibold mb-1">
              ✅ Example Axios Request:
            </h3>
            <pre className="bg-black/30 p-3 rounded text-xs overflow-x-auto">
{`import axios from "axios";

const sql = "SELECT * FROM users WHERE id = 1";

axios.post("www.proxy/api/query",
  { sql },
  {
    headers: {
      "Authorization": "Bearer YOUR_API_KEY"
    }
  }
).then(res => {
  console.log(res.data);
}).catch(err => {
  console.error(err);
});`}
            </pre>
          </div>

          {/* Response Format */}
          <div>
            <h3 className="text-blue-300 font-semibold mb-1">
              📦 Response Format:
            </h3>
            <p className="text-xs mb-2">
              The proxy returns your query result just like a real DB would,
              plus extra info:
            </p>
            <pre className="bg-black/30 p-3 rounded text-xs overflow-x-auto">
{`{
  "rows": [...],            // Array of rows from your DB
  "fields": [...],          // Field metadata (optional)
  "affectedRows": 0,        // Rows affected if INSERT/UPDATE
  "insertId": null,         // Insert ID if applicable
  "execTime": 12,           // Execution time in ms
  "queryType": "SELECT",    // Query type (e.g., SELECT, UPDATE)
  "status": "success",
  "suspicious": false,      // True if risky query detected
  "feedback": []            // ML feedback about performance
}`}
            </pre>
            <p className="text-yellow-300 text-xs">
              ✔️ You get the same data you expect — plus insights to help you
              optimize your queries.
            </p>
            <p className="text-yellow-300 text-xs">
              ✔️ But you will only require the <code>rows</code> field for most applications.
            </p>
          </div>

          {/* Final Tips */}
          <div>
            <p className="text-xs text-blue-200">
              🗝️ <strong>Keep your API key secure</strong>. Do not expose it in
              public repos or client-side code. Store it in your backend or as an
              environment variable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
