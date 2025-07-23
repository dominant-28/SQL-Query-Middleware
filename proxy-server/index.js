const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");

const auth = require("./auth");
const cookieParser = require("cookie-parser");
const express = require("express");
const mysql = require("mysql2/promise");
const axios = require("axios");
const { connectDB, disconnectDB } = require("./db");
const {  UserConfig, QueryLog, User } = require("./schema");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
  "https://smart-query-proxy.vercel.app",
  "http://localhost:5173" 
],
    credentials: true 
  })
);
async function createUserPool(userId, config) {
  try {
    const pool = mysql.createPool({
      host: config.DB_HOST,
      port: config.DB_PORT,
      user: config.DB_USER,
      password: config.DB_PASS,
      database: config.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

   
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    return pool;
  } catch (error) {
    console.error(`❌ Failed to create pool for user ${userId}:`, error);
    throw error;
  }
}

function getQueryType(sql) {
  const query = sql.trim().toUpperCase();
  if (query.startsWith("SELECT")) return "SELECT";
  if (query.startsWith("INSERT")) return "INSERT";
  if (query.startsWith("UPDATE")) return "UPDATE";
  if (query.startsWith("DELETE")) return "DELETE";
  if (query.startsWith("CREATE")) return "CREATE";
  if (query.startsWith("DROP")) return "DROP";
  if (query.startsWith("ALTER")) return "ALTER";
  return "OTHER";
}


app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Username, email, and password are required",
        status: "error",
      });
    }

    const user = await auth.registerUser(username, email, password);
    const token = auth.generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 2 * 60 * 60 * 1000,
    });

    res.json({
      message: "User registered successfully",
      user: { id: user.id, username: user.username, email: user.email },
      token,
      status: "success",
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      status: "error",
    });
  }
});


app.post("/api/generate-apikey", auth.verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

  
    const newApiKey = uuidv4();


    await User.findByIdAndUpdate(userId, { api_key: newApiKey });

    res.json({
      status: "success",
      api_key: newApiKey
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate API key" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
        status: "error",
      });
    }

    const user = await auth.authenticateUser(email, password);
    const token = auth.generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 2 * 60 * 60 * 1000, 
    });

    res.json({
      message: "Login successful",
      user: { id: user.id, username: user.username, email: user.email },
      token,
      status: "success",
    });
  } catch (error) {
    res.status(401).json({
      error: error.message,
      status: "error",
    });
  }
});


app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "Logout successful",
    status: "success",
  });
});


app.get("/api/me", auth.verifyToken, (req, res) => {
  res.json({
    user: req.user,
    status: "success",
  });
});


app.post("/api/save-config", auth.verifyToken, async (req, res) => {
  try {
    const config = req.body;
    const userId = req.user.id;

    if (!config.DB_HOST || !config.DB_USER || !config.DB_NAME) {
      return res.status(400).json({
        error: "DB_HOST, DB_USER, and DB_NAME are required",
        status: "error",
      });
    }

    const testPool = await createUserPool(userId, config);
    await testPool.end();

    await UserConfig.findOneAndUpdate(
      { user_id: userId },
      {
        user_id: userId,
        config: {
          DB_HOST: config.DB_HOST,
          DB_PORT: config.DB_PORT || 3306,
          DB_USER: config.DB_USER,
          DB_PASS: config.DB_PASS || "",
          DB_NAME: config.DB_NAME,
        }
      },
      { upsert: true, new: true }
    );

    res.json({
      message: "Configuration saved successfully",
      user_id: userId,
      status: "success",
    });
  } catch (error) {
    res.status(400).json({
      error: `Database connection failed: ${error.message}`,
      status: "error",
    });
  }
});

app.get("/api/get-config", auth.verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const userConfig = await UserConfig.findOne({ user_id: userId });

    if (userConfig) {
      res.json({
        ...userConfig.config,
        USER_ID: userId,
        status: "success",
      });
    } else {
      res.json({
        status: "success",
        message: "No configuration found",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
      status: "error",
    });
  }
});

function supportsExplainAnalyze(sql) {
  const query = sql.trim().toUpperCase();
  return query.startsWith("SELECT");
}

app.delete("/api/logs/clear", auth.verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    await QueryLog.deleteMany({ user_id: userId });
    res.json({
      status: "success",
      message: "All logs cleared successfully."
    });
  } catch (err) {
    console.error("Failed to clear logs:", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong while clearing logs."
    });
  }
});

function supportsExplain(sql) {
  const query = sql.trim().toUpperCase();
  return (
    query.startsWith("SELECT") ||
    query.startsWith("INSERT") ||
    query.startsWith("UPDATE") ||
    query.startsWith("DELETE")
  );
}

app.post("/api/query", auth.verifyAuth, async (req, res) => {
  const { sql } = req.body;
  const userId = req.user.id;

  if (!sql) {
    return res.status(400).json({
      error: "SQL query is required",
      status: "error",
    });
  }


  const userConfigDoc = await UserConfig.findOne({ user_id: userId });

  if (!userConfigDoc) {
    return res.status(400).json({
      error: "User configuration not found. Please save your database configuration first.",
      status: "error",
    });
  }

  const config = userConfigDoc.config;

  let userPool;
  const startTime = Date.now();
  let queryResult = null;
  let queryError = null;

  try {

    userPool = await createUserPool(userId, config);


    const [rows, fields] = await userPool.query(sql);
    const executionTime = Date.now() - startTime;
    
    let explanation = null;
    if (supportsExplain(sql)) {
      try {
        if (supportsExplainAnalyze(sql)) {
          const [explainResult] = await userPool.query(`EXPLAIN ANALYZE ${sql}`);
          explanation = { type: "ANALYZE", data: explainResult };
        } else {
          const [explainResult] = await userPool.query(`EXPLAIN ${sql}`);
          explanation = { type: "EXPLAIN", data: explainResult };
        }
      } catch (explainError) {
        console.warn("EXPLAIN failed:", explainError.message);
        explanation = null;
      }
    }

    queryResult = {
      rows: Array.isArray(rows) ? rows : [],
      fields: fields || [],
      affectedRows: rows.affectedRows || 0,
      insertId: rows.insertId || null,
      execTime: executionTime,
      queryType: getQueryType(sql),
    };

    
    analyzeQuery(
      sql,
      executionTime,
      userId,
      null,
      queryResult.affectedRows,
      explanation
    ).catch((err) => console.error("ML analysis failed:", err));

    res.json({
      ...queryResult,
      status: "success",
      suspicious: false,
      feedback: [],
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;
    queryError = error.message;

  
    analyzeQuery(sql, executionTime, userId, queryError, 0, null).catch(
      (err) => console.error("ML analysis failed:", err)
    );

    res.status(500).json({
      error: queryError,
      execTime: executionTime,
      status: "error",
      suspicious: true,
      feedback: [{ type: "error", severity: "high", message: queryError }],
    });
  } finally {
    if (userPool) {
      await userPool.end();
    }
  }
});

async function analyzeQuery(sql, executionTime, userId, error, affectedRows, explanation) {
  try {
    const mlResponse = await axios.post(
      process.env.MICRO_URL,
      {
        sql,
        exec_time_ms: executionTime,
        explanation: explanation,
        error: error,
      },
      { timeout: 20000 }
    );

    const analysis = mlResponse.data;

    const queryLog = new QueryLog({
      user_id: userId,
      query_text: sql,
      execution_time_ms: executionTime,
      suspicious: analysis.suspicious || false,
      feedback: analysis.feedback || [],
      query_type: getQueryType(sql),
      affected_rows: affectedRows,
      error: error || null,
    });

    await queryLog.save();

    return analysis;
  } catch (error) {
    console.error("ML analysis error:", error.message);

    const queryLog = new QueryLog({
      user_id: userId,
      query_text: sql,
      execution_time_ms: executionTime,
      suspicious: false,
      feedback: [{ type: "info", message: "ML analysis unavailable" }],
      query_type: getQueryType(sql),
      affected_rows: affectedRows,
      error: error || null,
    });

    await queryLog.save();

    return { suspicious: false, feedback: [] };
  }
}

app.get("/api/logs", auth.verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const logs = await QueryLog.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get("/api/test-connection", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Smart Query Proxy",
    mongoDBConnected: require("mongoose").connection.readyState === 1,
  });
});

app.get("/api/analytics", auth.verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    
    const totalQueries = await QueryLog.countDocuments({ user_id: userId });
    const suspiciousQueries = await QueryLog.countDocuments({ 
      user_id: userId, 
      suspicious: true 
    });

    const avgExecTimeResult = await QueryLog.aggregate([
      { $match: { user_id: userId } },
      { $group: { _id: null, avg: { $avg: "$execution_time_ms" } } }
    ]);

    
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const queries24h = await QueryLog.countDocuments({
      user_id: userId,
      createdAt: { $gte: twentyFourHoursAgo }
    });

    const queries1h = await QueryLog.countDocuments({
      user_id: userId,
      createdAt: { $gte: oneHourAgo }
    });

  
    const queryTypes = await QueryLog.aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: "$query_type",
          count: { $sum: 1 },
          avg_time: { $avg: "$execution_time_ms" }
        }
      },
      {
        $project: {
          query_type: "$_id",
          count: 1,
          avg_time: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      stats: {
        total_queries: totalQueries,
        suspicious_queries: suspiciousQueries,
        avg_execution_time: avgExecTimeResult[0]?.avg || 0,
        queries_24h: queries24h,
        queries_1h: queries1h,
      },
      queryTypes,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  try {
    await connectDB();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Smart Query Proxy running on http://localhost:${PORT}`);
      console.log(`📊 Dashboard available at http://localhost:${PORT}/dashboard`);
      console.log(`🔐 Authentication enabled with MongoDB`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer().catch(console.error);


process.on("SIGINT", async () => {
  console.log("\n🔌 Closing MongoDB connection...");
  await disconnectDB();
  console.log("✅ Server shutdown complete");
  process.exit(0);
});
