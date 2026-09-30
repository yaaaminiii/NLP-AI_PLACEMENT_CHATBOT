import json
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

from preprocess import preprocess_text


# Load dataset
with open("datasets/intents.json", "r", encoding="utf-8") as file:
    data = json.load(file)


# Store sentences and their intents
texts = []
labels = []


for intent in data["intents"]:
    tag = intent["tag"]

    for pattern in intent["patterns"]:
        cleaned_text = preprocess_text(pattern)

        texts.append(cleaned_text)
        labels.append(tag)


print("Total training examples:", len(texts))
print("Total intents:", len(set(labels)))


# Convert text into TF-IDF vectors
vectorizer = TfidfVectorizer()

X = vectorizer.fit_transform(texts)

print("TF-IDF matrix shape:", X.shape)


# Split data into training and testing data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    labels,
    test_size=0.2,
    random_state=42,
    stratify=labels
)


# Create machine learning model
model = LogisticRegression(max_iter=1000)


# Train the model
model.fit(X_train, y_train)


# Test the model
y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)

print("Model Accuracy:", accuracy * 100, "%")


# Save the model
joblib.dump(model, "model/chatbot_model.pkl")

# Save the TF-IDF vectorizer
joblib.dump(vectorizer, "model/tfidf_vectorizer.pkl")


print("Model saved successfully!")
print("TF-IDF vectorizer saved successfully!")