import os
import json
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

from preprocess import preprocess_text


def train_model():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    intents_path = os.path.join(base_dir, "intents.json")
    model_dir = os.path.join(base_dir, "model")
    os.makedirs(model_dir, exist_ok=True)

    print("=" * 60)
    print("AI-BASED CHATBOT USING NLP - MODEL TRAINING PIPELINE")
    print("=" * 60)

    # 1. Load dataset
    print(f"[1/6] Loading intents dataset from: {intents_path}")
    with open(intents_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    texts = []
    labels = []

    for intent in data.get("intents", []):
        tag = intent["tag"]
        for pattern in intent["patterns"]:
            cleaned = preprocess_text(pattern)
            if cleaned:
                texts.append(cleaned)
                labels.append(tag)

    total_samples = len(texts)
    unique_intents = sorted(list(set(labels)))

    print(f"[2/6] Total training patterns: {total_samples}")
    print(f"      Total unique intents: {len(unique_intents)} ({', '.join(unique_intents)})")

    # 2. TF-IDF Vectorization
    print("[3/6] Fitting TF-IDF Vectorizer (unigrams + bigrams)...")
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        sublinear_tf=True,
        min_df=1
    )
    X = vectorizer.fit_transform(texts)
    print(f"      TF-IDF Vocabulary size: {len(vectorizer.vocabulary_)} features")
    print(f"      TF-IDF Matrix shape: {X.shape}")

    # 3. Train/Test Split
    print("[4/6] Splitting dataset (80% train, 20% test with stratification)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        labels,
        test_size=0.2,
        random_state=42,
        stratify=labels
    )
    print(f"      Training samples: {X_train.shape[0]}, Test samples: {X_test.shape[0]}")

    # 4. Train Model
    print("[5/6] Training Logistic Regression Intent Classifier...")
    model = LogisticRegression(
        C=10.0,
        max_iter=1000,
        random_state=42,
        solver="lbfgs"
    )
    model.fit(X_train, y_train)

    # 5. Evaluate
    y_pred = model.predict(X_test)
    test_accuracy = accuracy_score(y_test, y_pred)
    train_accuracy = accuracy_score(y_train, model.predict(X_train))

    print(f"      Train Accuracy: {train_accuracy * 100:.2f}%")
    print(f"      Test Accuracy:  {test_accuracy * 100:.2f}%")
    print("-" * 60)
    print("Classification Report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    # 6. Save Model and Vectorizer
    model_path = os.path.join(model_dir, "chatbot_model.pkl")
    vectorizer_path = os.path.join(model_dir, "tfidf_vectorizer.pkl")

    # Re-fit on full data for maximum production generalization
    model.fit(X, labels)

    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vectorizer_path)

    print(f"[6/6] Saved trained model to:      {model_path}")
    print(f"      Saved TF-IDF vectorizer to: {vectorizer_path}")
    print("=" * 60)
    print("MODEL TRAINING COMPLETE!")
    print("=" * 60)

    return test_accuracy


if __name__ == "__main__":
    train_model()
