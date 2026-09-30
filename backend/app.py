import os
import uuid
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

from chatbot import get_response, load_chatbot_resources, intents_data
from database import (
    init_db,
    check_db_connection,
    save_conversation,
    get_conversations,
    clear_history,
    get_dashboard_stats,
    get_intent_distribution,
    get_conversation_trend,
    get_frequent_queries
)

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIST = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend", "dist"))

# Initialize Flask with static folder pointing to Vite's production build
app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path="")
CORS(app, resources={r"/api/*": {"origins": "*"}})

PORT = int(os.getenv("PORT", 5000))


@app.before_request
def check_preflight():
    """Handle CORS preflight OPTIONS requests cleanly."""
    if request.method == "OPTIONS":
        return "", 200


@app.route("/api/health", methods=["GET"])
def health_check():
    """System health check endpoint verifying ML model and MySQL status."""
    db_status = check_db_connection()
    return jsonify({
        "status": "online",
        "service": "AI Chatbot NLP Backend",
        "timestamp": datetime.now().isoformat(),
        "database": db_status,
        "model_loaded": True
    }), 200


@app.route("/api/init-db", methods=["POST"])
def initialize_database():
    """Initialize MySQL database schema and table."""
    success, message = init_db()
    if success:
        return jsonify({"success": True, "message": message}), 200
    else:
        return jsonify({"success": False, "error": message}), 500


@app.route("/api/chat", methods=["POST"])
def chat():
    """
    Main Chat API endpoint:
    1. Receives natural language user query
    2. Runs complete NLP workflow (preprocess, TF-IDF, intent recognition)
    3. Calculates confidence percentage
    4. Automatically stores conversation in MySQL
    5. Returns chatbot response and pipeline metadata
    """
    data = request.get_json(silent=True) or {}
    user_query = data.get("message", "").strip()
    session_id = data.get("session_id", "").strip()

    if not session_id:
        session_id = str(uuid.uuid4())

    if not user_query:
        return jsonify({
            "error": "Empty query. Please provide a message.",
            "intent": "unknown",
            "confidence": 0.0,
            "response": "Please enter a message to begin our conversation."
        }), 400

    try:
        # Step 1-5: NLP inference
        intent, confidence, response_text, response_time, pipeline_details = get_response(user_query)
        status = "success" if (confidence >= 0.40 and intent != "unknown") else "failed"

        # Step 6: Store in MySQL
        inserted_id = None
        db_saved = False
        try:
            inserted_id = save_conversation(
                session_id=session_id,
                user_query=user_query,
                intent=intent,
                confidence=confidence,
                response=response_text,
                response_time=response_time,
                status=status
            )
            db_saved = True
        except Exception as db_err:
            print(f"[Notice] Could not log conversation to MySQL: {db_err}")

        return jsonify({
            "id": inserted_id,
            "session_id": session_id,
            "user_query": user_query,
            "intent": intent,
            "confidence": round(confidence, 4),
            "confidence_percentage": f"{round(confidence * 100, 1)}%",
            "response": response_text,
            "response_time": response_time,
            "status": status,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "db_saved": db_saved,
            "pipeline_details": pipeline_details
        }), 200

    except Exception as e:
        print(f"[Server Error] Chat processing error: {e}")
        return jsonify({
            "error": "An internal server error occurred while processing your query.",
            "details": str(e)
        }), 500


@app.route("/api/history", methods=["GET"])
def get_chat_history():
    """Retrieve stored conversations from MySQL with optional search and pagination."""
    limit = request.args.get("limit", default=50, type=int)
    offset = request.args.get("offset", default=0, type=int)
    session_id = request.args.get("session_id", default=None, type=str)
    intent = request.args.get("intent", default=None, type=str)
    search = request.args.get("search", default=None, type=str)

    history = get_conversations(
        limit=limit,
        offset=offset,
        session_id=session_id,
        intent=intent,
        search=search
    )
    return jsonify(history), 200


@app.route("/api/history", methods=["DELETE"])
def delete_chat_history():
    """Clear conversation history (for a specific session or entire database)."""
    session_id = request.args.get("session_id", default=None, type=str)
    success, result = clear_history(session_id=session_id)

    if success:
        return jsonify({
            "success": True,
            "message": f"Successfully cleared conversation history ({result} records removed)."
        }), 200
    else:
        return jsonify({"success": False, "error": str(result)}), 500


@app.route("/api/dashboard/stats", methods=["GET"])
def dashboard_stats():
    """Retrieve high-level KPI metrics computed from MySQL."""
    stats = get_dashboard_stats()
    return jsonify(stats), 200


@app.route("/api/dashboard/intent-distribution", methods=["GET"])
def dashboard_intent_distribution():
    """Retrieve intent distribution data for the Donut/Pie chart."""
    distribution = get_intent_distribution()
    return jsonify(distribution), 200


@app.route("/api/dashboard/conversation-trend", methods=["GET"])
def dashboard_conversation_trend():
    """Retrieve conversation volume trends over time for the Line chart."""
    trend = get_conversation_trend()
    return jsonify(trend), 200


@app.route("/api/dashboard/frequent-queries", methods=["GET"])
def dashboard_frequent_queries():
    """Retrieve most frequently asked queries for the Bar chart."""
    limit = request.args.get("limit", default=5, type=int)
    queries = get_frequent_queries(limit=limit)
    return jsonify(queries), 200


@app.route("/api/intents", methods=["GET"])
def list_intents():
    """Return all configured intents, patterns, and responses."""
    intents = intents_data.get("intents", [])
    summary = [
        {
            "tag": item["tag"],
            "pattern_count": len(item.get("patterns", [])),
            "patterns": item.get("patterns", []),
            "responses": item.get("responses", [])
        }
        for item in intents
    ]
    return jsonify({"total_intents": len(summary), "intents": summary}), 200


# Fallback single-page app static routing
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend_spa(path):
    """Serve built React single page application if built."""
    if path != "" and os.path.exists(os.path.join(FRONTEND_DIST, path)):
        return send_from_directory(FRONTEND_DIST, path)
    if os.path.exists(os.path.join(FRONTEND_DIST, "index.html")):
        return send_from_directory(FRONTEND_DIST, "index.html")
    return jsonify({
        "status": "online",
        "service": "AI Chatbot NLP Backend",
        "message": "Flask API running. To view UI, run 'npm run build' or use Vite dev server on http://localhost:5173"
    })


if __name__ == "__main__":
    print(f"Starting AI Chatbot Flask REST API on http://127.0.0.1:{PORT}...")
    try:
        init_db()
    except Exception as err:
        print(f"[Notice] MySQL not initialized on boot: {err}")

    app.run(host="0.0.0.0", port=PORT, debug=False)
