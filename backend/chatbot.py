import os
import json
import time
import random
import joblib
import numpy as np

from preprocess import preprocess_text, preprocess_pipeline_details

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "chatbot_model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "model", "tfidf_vectorizer.pkl")
INTENTS_PATH = os.path.join(BASE_DIR, "intents.json")

CONFIDENCE_THRESHOLD = 0.40

# Global cached variables
model = None
vectorizer = None
intents_data = {}
responses_map = {}


def load_chatbot_resources():
    """Load model, vectorizer, and intents into memory."""
    global model, vectorizer, intents_data, responses_map

    if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
        raise FileNotFoundError(
            f"Trained model or vectorizer not found at {MODEL_PATH}. Run train.py first."
        )

    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)

    with open(INTENTS_PATH, "r", encoding="utf-8") as f:
        intents_data = json.load(f)

    responses_map = {
        item["tag"]: item.get("responses", [])
        for item in intents_data.get("intents", [])
    }


def get_response(user_message):
    """
    Main NLP inference function.
    Returns: (predicted_intent, confidence_score, response_text, response_time, pipeline_details)
    """
    start_time = time.time()

    if model is None or vectorizer is None:
        load_chatbot_resources()

    if not user_message or not str(user_message).strip():
        elapsed = round(time.time() - start_time, 4)
        return (
            "unknown",
            0.0,
            "Please enter a message so I can assist you.",
            elapsed,
            {"error": "Empty message"}
        )

    # 1. Preprocessing
    pipeline_info = preprocess_pipeline_details(user_message)
    cleaned_query = pipeline_info["processed_text"]

    # 2. TF-IDF Vectorization
    X_vec = vectorizer.transform([cleaned_query])

    # Extract non-zero TF-IDF features for UI inspection
    feature_names = vectorizer.get_feature_names_out()
    non_zero_indices = X_vec.nonzero()[1]
    extracted_features = [
        {"feature": feature_names[idx], "weight": round(float(X_vec[0, idx]), 4)}
        for idx in non_zero_indices
    ]
    # Sort by weight descending
    extracted_features.sort(key=lambda x: x["weight"], reverse=True)

    # 3. Intent Recognition & Probabilities
    classes = list(model.classes_)
    probabilities = model.predict_proba(X_vec)[0]

    top_idx = int(np.argmax(probabilities))
    raw_intent = classes[top_idx]
    confidence = float(probabilities[top_idx])

    # Top 3 predicted intents with probabilities
    sorted_prob_indices = np.argsort(probabilities)[::-1]
    top_candidates = [
        {"intent": classes[i], "probability": round(float(probabilities[i]), 4)}
        for i in sorted_prob_indices[:3]
    ]

    # 4. Confidence Threshold Check & Fallback
    if confidence < CONFIDENCE_THRESHOLD:
        final_intent = "unknown"
        status = "failed"
        fallback_list = responses_map.get("unknown", [
            "I'm sorry, I didn't quite catch that. Could you rephrase your question regarding NLP or Machine Learning?"
        ])
        bot_response = random.choice(fallback_list)
    else:
        final_intent = raw_intent
        status = "success"
        intent_responses = responses_map.get(final_intent, [])
        if intent_responses:
            bot_response = random.choice(intent_responses)
        else:
            bot_response = "I have identified your intent, but no response template was configured."

    elapsed_time = round(time.time() - start_time, 4)

    # Compile comprehensive pipeline diagnostics
    pipeline_details = {
        "preprocessing": pipeline_info,
        "tfidf_features": extracted_features[:5],
        "vocabulary_match_count": len(extracted_features),
        "raw_intent": raw_intent,
        "final_intent": final_intent,
        "confidence": round(confidence, 4),
        "confidence_percentage": f"{round(confidence * 100, 1)}%",
        "top_candidates": top_candidates,
        "status": status,
        "response_time_seconds": elapsed_time
    }

    return final_intent, confidence, bot_response, elapsed_time, pipeline_details


# Initial load
try:
    load_chatbot_resources()
except Exception as e:
    print(f"Chatbot resource initialization notice: {e}")


if __name__ == "__main__":
    test_queries = [
        "What is NLP?",
        "Explain machine learning algorithms",
        "Hello chatbot",
        "Who created this project?",
        "What is your accuracy?",
        "qwerty asdfgh 12345"
    ]

    print("\n--- TESTING CHATBOT INFERENCE ---")
    for q in test_queries:
        intent, conf, resp, elapsed, details = get_response(q)
        print(f"\nUser: {q}")
        print(f"Intent: {intent} (Confidence: {conf*100:.1f}%) [Time: {elapsed}s]")
        print(f"Bot: {resp}")
