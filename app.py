import os
import sys
import importlib.util

# Path to backend/app.py
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
backend_app_file = os.path.join(backend_dir, "app.py")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.chdir(backend_dir)

# Load module explicitly to prevent circular import from same-named app.py
spec = importlib.util.spec_from_file_location("backend_server", backend_app_file)
backend_server = importlib.util.module_from_spec(spec)
sys.modules["backend_server"] = backend_server
spec.loader.exec_module(backend_server)

app = backend_server.app
PORT = backend_server.PORT
init_db = backend_server.init_db

if __name__ == "__main__":
    print("=" * 60)
    print("AI PLACEMENT ASSISTANT CHATBOT FOR STUDENTS")
    print("=" * 60)
    print(f"Server URL: http://127.0.0.1:{PORT}")
    print("Serving Flask REST API & React Dashboard")
    print("=" * 60)
    try:
        init_db()
    except Exception as err:
        print(f"[Notice] MySQL initialization notice: {err}")

    app.run(host="0.0.0.0", port=PORT, debug=False)
