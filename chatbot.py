import sys
import os
import importlib.util

backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
backend_chatbot_file = os.path.join(backend_dir, "chatbot.py")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

spec = importlib.util.spec_from_file_location("backend_chatbot", backend_chatbot_file)
backend_chatbot = importlib.util.module_from_spec(spec)
sys.modules["backend_chatbot"] = backend_chatbot
spec.loader.exec_module(backend_chatbot)

get_response = backend_chatbot.get_response
load_chatbot_resources = backend_chatbot.load_chatbot_resources

if __name__ == "__main__":
    print("AI Placement Assistant Chatbot ready!")
    while True:
        try:
            msg = input("Student: ")
            if msg.lower() in ["exit", "quit", "bye"]:
                print("Bot: Goodbye! Best of luck with placements!")
                break
            intent, conf, resp, elapsed, details = get_response(msg)
            print(f"Intent: {intent} ({conf*100:.1f}%) [Time: {elapsed}s]")
            print(f"Assistant: {resp}\n")
        except (KeyboardInterrupt, EOFError):
            break