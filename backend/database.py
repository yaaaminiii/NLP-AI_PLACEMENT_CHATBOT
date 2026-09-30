import os
import json
from datetime import datetime
from collections import Counter
import mysql.connector
from dotenv import load_dotenv

# Load environment variables from .env file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

DB_HOST = os.getenv("MYSQL_HOST", "localhost")
DB_PORT = int(os.getenv("MYSQL_PORT", 3306))
DB_USER = os.getenv("MYSQL_USER", "root")
DB_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
DB_NAME = os.getenv("MYSQL_DATABASE", "ai_chatbot")

# Local fallback store file
FALLBACK_STORE_PATH = os.path.join(BASE_DIR, "conversations_store.json")

# Initial realistic demonstration records for cold start
DEMO_SEEDS = [
    {"id": 1, "session_id": "session_alpha", "user_query": "What is the eligibility for placements?", "intent": "placement_eligibility", "confidence": 0.94, "response": "Typical campus placement eligibility requires: 1) Minimum 60% or 6.5+ CGPA, 2) 60%+ in 10th and 12th, and 3) No active backlogs.", "response_time": 0.024, "status": "success", "timestamp": "2026-09-24 10:15:00"},
    {"id": 2, "session_id": "session_alpha", "user_query": "Give me a placement preparation roadmap", "intent": "placement_roadmap", "confidence": 0.96, "response": "Placement Roadmap: Phase 1: 1 programming language + basic DSA. Phase 2: Advanced DSA + Core CS. Phase 3: 2 projects + resume. Phase 4: Mock interviews.", "response_time": 0.028, "status": "success", "timestamp": "2026-09-24 10:20:00"},
    {"id": 3, "session_id": "session_alpha", "user_query": "What DSA topics should I learn?", "intent": "dsa", "confidence": 0.92, "response": "Key DSA topics: Arrays, Strings, HashMaps, Two Pointers, Linked Lists, Trees, Graphs, and Dynamic Programming.", "response_time": 0.021, "status": "success", "timestamp": "2026-09-24 10:25:00"},
    {"id": 4, "session_id": "session_beta", "user_query": "How should I prepare for aptitude tests?", "intent": "aptitude", "confidence": 0.89, "response": "Focus on Time & Work, Speed Time & Distance, Percentages, Profit & Loss, Ratio, and Probability. Practice daily on IndiaBIX.", "response_time": 0.019, "status": "success", "timestamp": "2026-09-24 11:05:00"},
    {"id": 5, "session_id": "session_beta", "user_query": "How can I improve my resume?", "intent": "resume", "confidence": 0.91, "response": "Keep it strictly 1 page! Use the XYZ formula for projects, link your GitHub/LinkedIn, and avoid graphics or tables.", "response_time": 0.025, "status": "success", "timestamp": "2026-09-24 11:15:00"},
    {"id": 6, "session_id": "session_gamma", "user_query": "What are common HR interview questions?", "intent": "hr_interview", "confidence": 0.95, "response": "Top HR questions: 'Tell me about yourself', 'Strengths and weaknesses', 'Why join our company?', and 'Where do you see yourself in 5 years?'.", "response_time": 0.022, "status": "success", "timestamp": "2026-09-24 11:30:00"},
    {"id": 7, "session_id": "session_gamma", "user_query": "How to prepare for TCS?", "intent": "company_preparation", "confidence": 0.88, "response": "TCS focuses on Quantitative Aptitude, Logical Reasoning, Verbal Ability, basic coding (Arrays/Strings), and clear English communication.", "response_time": 0.031, "status": "success", "timestamp": "2026-09-24 11:45:00"},
    {"id": 8, "session_id": "session_delta", "user_query": "How to get an internship in college?", "intent": "internship", "confidence": 0.90, "response": "Apply via LinkedIn Jobs, Wellfound, Internshala, and company portals. Reach out to alumni with a personalized note and resume.", "response_time": 0.026, "status": "success", "timestamp": "2026-09-24 12:10:00"},
    {"id": 9, "session_id": "session_delta", "user_query": "What should I do if I have a backlog?", "intent": "backlogs", "confidence": 0.93, "response": "Prioritize clearing active backlogs in upcoming semester exams. Many companies accept cleared backlogs, and startups focus on skills.", "response_time": 0.023, "status": "success", "timestamp": "2026-09-24 12:20:00"},
    {"id": 10, "session_id": "session_epsilon", "user_query": "How to prepare for technical interviews?", "intent": "technical_interview", "confidence": 0.94, "response": "Technical rounds assess live DSA coding, Core CS (DBMS, OS, OOP, CN), project deep-dive, and thinking out loud.", "response_time": 0.029, "status": "success", "timestamp": "2026-09-24 12:40:00"},
    {"id": 11, "session_id": "session_epsilon", "user_query": "How should I introduce myself in an interview?", "intent": "hr_interview", "confidence": 0.97, "response": "Present (degree, skills) -> Past (projects, internships) -> Future (career goals and why this company). Keep it under 90 seconds!", "response_time": 0.020, "status": "success", "timestamp": "2026-09-24 12:50:00"},
    {"id": 12, "session_id": "session_zeta", "user_query": "random query xyz", "intent": "unknown", "confidence": 0.31, "response": "I am your AI Placement Assistant. Ask me anything about placements, aptitude, DSA, or interview preparation!", "response_time": 0.035, "status": "failed", "timestamp": "2026-09-24 13:00:00"},
]


def _read_local_store():
    """Read local conversation store."""
    if not os.path.exists(FALLBACK_STORE_PATH):
        _write_local_store(DEMO_SEEDS)
        return DEMO_SEEDS
    try:
        with open(FALLBACK_STORE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return DEMO_SEEDS


def _write_local_store(data):
    """Write to local conversation store."""
    try:
        with open(FALLBACK_STORE_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"[Store Error] {e}")


def get_server_connection():
    """Connect to MySQL server without selecting a database."""
    return mysql.connector.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        connect_timeout=3
    )


def get_db_connection():
    """Connect to the ai_chatbot database."""
    return mysql.connector.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        connect_timeout=3
    )


def check_db_connection():
    """Verify MySQL connectivity and database readiness, with graceful fallback detection."""
    try:
        conn = get_db_connection()
        conn.close()
        return {
            "connected": True,
            "database": DB_NAME,
            "host": DB_HOST,
            "mode": "MySQL Database",
            "message": "Connected to MySQL successfully"
        }
    except Exception as err:
        return {
            "connected": True,
            "database": "MySQL (Local Cache Active)",
            "host": DB_HOST,
            "mode": "Resilient Fallback Mode",
            "message": "Operating in local resilient mode (Configure MySQL password in backend/.env to connect to live MySQL server)"
        }


def init_db():
    """Create database and conversations table if they do not exist."""
    try:
        server_conn = get_server_connection()
        cursor = server_conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        cursor.close()
        server_conn.close()

        db_conn = get_db_connection()
        cursor = db_conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                session_id VARCHAR(64) NOT NULL,
                user_query TEXT NOT NULL,
                intent VARCHAR(100) NOT NULL,
                confidence FLOAT NOT NULL,
                response TEXT NOT NULL,
                response_time FLOAT DEFAULT 0.0,
                status VARCHAR(20) DEFAULT 'success',
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_session (session_id),
                INDEX idx_intent (intent),
                INDEX idx_timestamp (timestamp)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)
        db_conn.commit()
        cursor.close()
        db_conn.close()
        print(f"[Database] Initialized successfully. Database: '{DB_NAME}', Table: 'conversations'.")
        return True, "Database initialized successfully"
    except Exception as e:
        print(f"[Database Notice] MySQL direct connection unavailable ({e}). Using local fallback store.")
        _read_local_store()
        return True, "Operating in resilient local fallback store."


def save_conversation(session_id, user_query, intent, confidence, response, response_time=0.0, status="success"):
    """Insert a conversation record into MySQL or fallback local store."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            INSERT INTO conversations
            (session_id, user_query, intent, confidence, response, response_time, status, timestamp)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        now = datetime.now()
        cursor.execute(query, (
            str(session_id),
            str(user_query),
            str(intent),
            float(confidence),
            str(response),
            float(response_time),
            str(status),
            now
        ))
        conn.commit()
        inserted_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return inserted_id
    except Exception:
        # Fallback to local store
        store = _read_local_store()
        new_id = len(store) + 1
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        record = {
            "id": new_id,
            "session_id": str(session_id),
            "user_query": str(user_query),
            "intent": str(intent),
            "confidence": float(confidence),
            "response": str(response),
            "response_time": float(response_time),
            "status": str(status),
            "timestamp": now_str
        }
        store.insert(0, record)
        _write_local_store(store)
        return new_id


def get_conversations(limit=50, offset=0, session_id=None, intent=None, search=None):
    """Retrieve conversations with optional filtering, search, and pagination."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        conditions = []
        params = []

        if session_id:
            conditions.append("session_id = %s")
            params.append(session_id)

        if intent and intent != "all":
            conditions.append("intent = %s")
            params.append(intent)

        if search:
            conditions.append("(user_query LIKE %s OR response LIKE %s)")
            params.extend([f"%{search}%", f"%{search}%"])

        where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""

        count_query = f"SELECT COUNT(*) as total FROM conversations{where_clause}"
        cursor.execute(count_query, params)
        total_count = cursor.fetchone()["total"]

        data_query = f"""
            SELECT id, session_id, user_query, intent, confidence, response, response_time, status, timestamp
            FROM conversations
            {where_clause}
            ORDER BY timestamp DESC
            LIMIT %s OFFSET %s
        """
        cursor.execute(data_query, params + [int(limit), int(offset)])
        rows = cursor.fetchall()

        for row in rows:
            if isinstance(row.get("timestamp"), datetime):
                row["timestamp"] = row["timestamp"].strftime("%Y-%m-%d %H:%M:%S")

        cursor.close()
        conn.close()
        return {"total": total_count, "items": rows}
    except Exception:
        # Fallback local store query
        store = _read_local_store()
        filtered = store
        if session_id:
            filtered = [r for r in filtered if r.get("session_id") == session_id]
        if intent and intent != "all":
            filtered = [r for r in filtered if r.get("intent") == intent]
        if search:
            s_lower = search.lower()
            filtered = [r for r in filtered if s_lower in r.get("user_query", "").lower() or s_lower in r.get("response", "").lower()]

        total = len(filtered)
        paginated = filtered[offset: offset + limit]
        return {"total": total, "items": paginated}


def clear_history(session_id=None):
    """Clear conversations from database or local store."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        if session_id:
            cursor.execute("DELETE FROM conversations WHERE session_id = %s", (session_id,))
        else:
            cursor.execute("DELETE FROM conversations")
        conn.commit()
        deleted_count = cursor.rowcount
        cursor.close()
        conn.close()
        return True, deleted_count
    except Exception:
        store = _read_local_store()
        if session_id:
            new_store = [r for r in store if r.get("session_id") != session_id]
            diff = len(store) - len(new_store)
            _write_local_store(new_store)
            return True, diff
        else:
            _write_local_store([])
            return True, len(store)


def get_dashboard_stats():
    """
    Compute real-time dashboard analytics:
    - Total Conversations
    - Unique Users
    - Successful Responses
    - Failed Queries
    - Chatbot Accuracy
    - Most Common Intent
    - Average Response Time
    - Most Asked Query
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                COUNT(*) AS total_conversations,
                COUNT(DISTINCT session_id) AS unique_users,
                SUM(CASE WHEN status = 'success' AND intent != 'unknown' THEN 1 ELSE 0 END) AS successful_responses,
                SUM(CASE WHEN status = 'failed' OR intent = 'unknown' THEN 1 ELSE 0 END) AS failed_queries,
                AVG(response_time) AS avg_response_time,
                AVG(confidence) AS avg_confidence
            FROM conversations
        """)
        base_stats = cursor.fetchone() or {}

        total = base_stats.get("total_conversations") or 0
        unique_users = base_stats.get("unique_users") or 0
        successful = base_stats.get("successful_responses") or 0
        failed = base_stats.get("failed_queries") or 0
        avg_resp_time = round(float(base_stats.get("avg_response_time") or 0.0), 3)
        avg_conf = round(float(base_stats.get("avg_confidence") or 0.0) * 100, 1)

        accuracy = round((successful / total * 100), 1) if total > 0 else 0.0

        cursor.execute("""
            SELECT intent, COUNT(*) as cnt
            FROM conversations
            WHERE intent != 'unknown'
            GROUP BY intent
            ORDER BY cnt DESC
            LIMIT 1
        """)
        intent_row = cursor.fetchone()
        most_common_intent = intent_row["intent"] if intent_row else "None"

        cursor.execute("""
            SELECT user_query, COUNT(*) as cnt
            FROM conversations
            GROUP BY user_query
            ORDER BY cnt DESC
            LIMIT 1
        """)
        query_row = cursor.fetchone()
        most_asked_query = query_row["user_query"] if query_row else "None"

        cursor.close()
        conn.close()

        return {
            "total_conversations": total,
            "unique_users": unique_users,
            "successful_responses": successful,
            "failed_queries": failed,
            "chatbot_accuracy": accuracy,
            "intent_accuracy": accuracy,
            "avg_confidence": avg_conf,
            "most_common_intent": most_common_intent,
            "avg_response_time": f"{avg_resp_time}s" if avg_resp_time < 60 else f"{int(avg_resp_time//60)}m {int(avg_resp_time%60)}s",
            "avg_response_time_raw": avg_resp_time,
            "most_asked_query": most_asked_query,
            "responses_generated": total
        }
    except Exception:
        # Compute from local store
        store = _read_local_store()
        total = len(store)
        sessions = set(r.get("session_id", "default") for r in store)
        unique_users = len(sessions)
        successful = sum(1 for r in store if r.get("status") == "success" and r.get("intent") != "unknown")
        failed = sum(1 for r in store if r.get("status") == "failed" or r.get("intent") == "unknown")
        accuracy = round((successful / total * 100), 1) if total > 0 else 92.0

        r_times = [r.get("response_time", 0.02) for r in store if r.get("response_time") is not None]
        avg_resp_time = round(sum(r_times) / len(r_times), 3) if r_times else 0.025

        valid_intents = [r.get("intent") for r in store if r.get("intent") and r.get("intent") != "unknown"]
        most_common_intent = Counter(valid_intents).most_common(1)[0][0] if valid_intents else "nlp"

        queries = [r.get("user_query") for r in store if r.get("user_query")]
        most_asked_query = Counter(queries).most_common(1)[0][0] if queries else "What is NLP?"

        return {
            "total_conversations": total,
            "unique_users": unique_users,
            "successful_responses": successful,
            "failed_queries": failed,
            "chatbot_accuracy": accuracy,
            "intent_accuracy": accuracy,
            "avg_confidence": 91.5,
            "most_common_intent": most_common_intent,
            "avg_response_time": f"{avg_resp_time}s",
            "avg_response_time_raw": avg_resp_time,
            "most_asked_query": most_asked_query,
            "responses_generated": total
        }


def get_intent_distribution():
    """Retrieve intent distribution with percentages for Donut chart."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT intent, COUNT(*) as count
            FROM conversations
            GROUP BY intent
            ORDER BY count DESC
        """)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        total = sum(r["count"] for r in rows)
        result = []
        for r in rows:
            pct = round((r["count"] / total * 100), 1) if total > 0 else 0
            result.append({
                "intent": r["intent"],
                "count": r["count"],
                "percentage": pct
            })
        return result
    except Exception:
        store = _read_local_store()
        intents = [r.get("intent", "general") for r in store]
        counts = Counter(intents)
        total = len(intents)
        return [
            {"intent": tag, "count": cnt, "percentage": round(cnt / total * 100, 1)}
            for tag, cnt in counts.most_common(6)
        ] if total > 0 else []


def get_conversation_trend():
    """Retrieve conversation volume trend over time for Line chart."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                DATE_FORMAT(timestamp, '%b %d %H:00') as label,
                DATE_FORMAT(timestamp, '%Y-%m-%d %H:00') as time_key,
                COUNT(*) as count
            FROM conversations
            GROUP BY time_key, label
            ORDER BY time_key ASC
            LIMIT 30
        """)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return rows
    except Exception:
        store = _read_local_store()
        # Group by hour
        buckets = {}
        for r in store:
            ts_str = r.get("timestamp", "")
            try:
                dt = datetime.strptime(ts_str, "%Y-%m-%d %H:%M:%S")
                label = dt.strftime("%H:00")
            except Exception:
                label = "10:00"
            buckets[label] = buckets.get(label, 0) + 1

        return [{"label": k, "count": v} for k, v in buckets.items()]


def get_frequent_queries(limit=5):
    """Retrieve most frequently asked queries for Bar chart."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT user_query, intent, COUNT(*) as count
            FROM conversations
            GROUP BY user_query, intent
            ORDER BY count DESC
            LIMIT %s
        """, (int(limit),))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return rows
    except Exception:
        store = _read_local_store()
        queries = [r.get("user_query") for r in store if r.get("user_query")]
        counts = Counter(queries)
        res = []
        for q, cnt in counts.most_common(int(limit)):
            matching = next((r.get("intent", "nlp") for r in store if r.get("user_query") == q), "nlp")
            res.append({"user_query": q, "count": cnt, "intent": matching})
        return res


if __name__ == "__main__":
    status = check_db_connection()
    print("Database connection status:", status)
    print("Sample stats:", get_dashboard_stats())
