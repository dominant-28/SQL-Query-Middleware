from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import time
import logging
from datetime import datetime
import os
import json
import google.generativeai as genai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-2.5-pro')

# Enhanced SQL injection patterns
INJECTION_PATTERNS = [
    r"(1\s*=\s*1|OR\s+1=1)",
    r"(UNION\s+SELECT)",
    r"(DROP\s+TABLE)",
    r"(DELETE\s+FROM)",
    r"(INSERT\s+INTO)",
    r"(UPDATE\s+SET)",
    r"(EXEC\s*\()",
    r"(SCRIPT\s*>)",
    r"(SLEEP\s*\()",
    r"(BENCHMARK\s*\()",
    r"(LOAD_FILE\s*\()",
    r"(INTO\s+OUTFILE)",
    r"(INFORMATION_SCHEMA)",
    r"(SHOW\s+TABLES)",
    r"(DESCRIBE\s+)",
    r"(--\s*$)",
    r"(#.*$)",
    r"(/\*.*\*/)",
]

def generate_gemini_feedback(original_query, explanation, manual_feedback, exec_time, error=None):
    """Generate AI-powered feedback using Gemini"""
    try:
        # Format explanation output for the prompt
        explain_output = ""
       
        explain_output = str(explanation)
        
        # Add manual feedback context
        manual_feedback_text = ""
        if manual_feedback:
            manual_feedback_text = "\n".join([f"- {fb.get('message', '')}" for fb in manual_feedback])
        
        # Create the prompt
        prompt = f"""
You are an expert SQL query reviewer.
Given an EXPLAIN ANALYZE output, manual analysis feedback, and execution details, do the following:
1️⃣ Give a short summary of how the query performs (1–2 lines).
2️⃣ State any performance or security issues and how to improve them (max 2–3 lines).
3️⃣ If needed, write an improved version of the query, clearly labeled "Improved Query:".
4️⃣ If there are syntax errors or logical errors, explain the issue and how to fix it (1–2 lines).
Be clear, direct, and keep total output under 10 lines.

---
EXPLAIN ANALYZE Output:
{explain_output}

Original Query:
{original_query}

Execution Time: {exec_time}ms
Error: {error if error else "None"}

Manual Analysis:
{manual_feedback_text}
"""
        
        # Generate content with Gemini
        response = model.generate_content(prompt)
       
        return {
            "type": "ai_analysis",
            "severity": "info",
            "message": response.text.strip(),
            "source": "gemini"
        }
        
    except Exception as e:
        logger.error(f"Gemini API error: {str(e)}")
        return {
            "type": "ai_analysis",
            "severity": "info",
            "message": "AI analysis temporarily unavailable",
            "source": "fallback"
        }

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "SQL Anomaly Detection with AI",
        "gemini_configured": bool(os.getenv('GEMINI_API_KEY'))
    })

@app.route('/check', methods=['POST'])
def check():
    """Advanced SQL query analysis endpoint with Gemini integration"""
    try:
        data = request.json
        sql = data.get('sql', '').strip()
        exec_time = data.get('exec_time_ms', 0)
        explanation = data.get('explanation')  # Fixed typo
        error = data.get('error')
        
        if not sql:
            return jsonify({
                "error": "SQL query is required",
                "suspicious": False,
                "feedback": []
            }), 400

        suspicious = False
        feedback = []
        risk_score = 0

        # Check for query errors
        if error:
            suspicious = True
            risk_score += 30
            feedback.append({
                "type": "error",
                "severity": "high",
                "message": f"Query syntax failed: {error}"
            })

        # Performance analysis
        if exec_time > 10000:  # 10 seconds
            suspicious = True
            risk_score += 40
            feedback.append({
                "type": "performance",
                "severity": "high",
                "message": f"Very slow query detected ({exec_time/1000:.1f}s). Consider optimization."
            })
        elif exec_time > 5000:  # 5 seconds
            suspicious = True
            risk_score += 20
            feedback.append({
                "type": "performance",
                "severity": "medium",
                "message": f"Slow query detected ({exec_time/1000:.1f}s). Review for optimization."
            })
        elif exec_time > 1000:  # 1 second
            risk_score += 10
            feedback.append({
                "type": "performance",
                "severity": "low",
                "message": f"Query took {exec_time/1000:.1f}s. Consider indexing."
            })

        # SQL injection detection
        for pattern in INJECTION_PATTERNS:
            if re.search(pattern, sql, re.IGNORECASE):
                suspicious = True
                risk_score += 50
                feedback.append({
                    "type": "security",
                    "severity": "critical",
                    "message": "Potential SQL injection pattern detected!"
                })
                break

        # Best practices analysis
        sql_upper = sql.upper()
        
        # SELECT * usage
        if "SELECT *" in sql_upper:
            risk_score += 5
            feedback.append({
                "type": "optimization",
                "severity": "low",
                "message": "Avoid SELECT *. Specify only needed columns for better performance."
            })

        # Missing WHERE clause in UPDATE/DELETE
        if re.search(r"(UPDATE|DELETE)\s+(?!.*WHERE)", sql_upper):
            suspicious = True
            risk_score += 35
            feedback.append({
                "type": "security",
                "severity": "high",
                "message": "UPDATE/DELETE without WHERE clause detected. This could affect all rows!"
            })

        # Nested queries analysis
        if sql.count('(') > 3:
            risk_score += 10
            feedback.append({
                "type": "complexity",
                "severity": "medium",
                "message": "Complex nested query detected. Consider breaking into simpler queries."
            })

        # Check for excessive JOINs
        join_count = len(re.findall(r'\bJOIN\b', sql_upper))
        if join_count > 5:
            risk_score += 15
            feedback.append({
                "type": "performance",
                "severity": "medium",
                "message": f"Query has {join_count} JOINs. Consider denormalization or query optimization."
            })

        # Generate AI feedback using Gemini
        if explanation or feedback:  # Only call Gemini if we have meaningful data
            ai_feedback = generate_gemini_feedback(sql, explanation, feedback, exec_time, error)
            feedback.append(ai_feedback)

        # Determine final risk level
        if risk_score >= 50:
            risk_level = "critical"
        elif risk_score >= 30:
            risk_level = "high"
        elif risk_score >= 15:
            risk_level = "medium"
        else:
            risk_level = "low"

        # Add positive feedback if query is clean
        if not suspicious and risk_score < 15:
            feedback.append({
                "type": "success",
                "severity": "info",
                "message": "Query looks optimized and secure."
            })

        logger.info(f"Analyzed query - Risk Score: {risk_score}, Suspicious: {suspicious}")
        
        return jsonify({
            "suspicious": suspicious,
            "feedback": feedback,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "analysis_timestamp": datetime.now().isoformat(),
            "ai_enhanced": True
        })

    except Exception as e:
        logger.error(f"Error analyzing query: {str(e)}")
        return jsonify({
            "error": "Internal server error during analysis",
            "suspicious": False,
            "feedback": []
        }), 500

@app.route('/stats', methods=['GET'])
def stats():
    """Get service statistics"""
    return jsonify({
        "service": "SQL Anomaly Detection with AI",
        "version": "3.0",
        "patterns_count": len(INJECTION_PATTERNS),
        "uptime": time.time(),
        "ai_enabled": bool(os.getenv('GEMINI_API_KEY')),
        "features": [
            "SQL Injection Detection",
            "Performance Analysis",
            "Best Practices Recommendations",
            "Risk Scoring",
            "AI-Powered Query Analysis",
            "Gemini Integration"
        ]
    })

if __name__ == '__main__':
    print("🚀 Starting SQL Anomaly Detection Service with AI...")
    print("🔍 Monitoring for SQL injection patterns and performance issues")
    print("🤖 AI-powered analysis enabled" if os.getenv('GEMINI_API_KEY') else "⚠️  AI analysis disabled (GEMINI_API_KEY not set)")
    app.run(host='0.0.0.0', port=5000, debug=True)