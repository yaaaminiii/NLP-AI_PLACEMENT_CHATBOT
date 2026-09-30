import re
import nltk

from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

nltk.download("punkt")
nltk.download("punkt_tab")
nltk.download("stopwords")


def preprocess_text(text):
    text = text.lower()

    text = re.sub(r"[^a-zA-Z0-9\s]", "", text)

    words = word_tokenize(text)

    stop_words = set(stopwords.words("english"))
    words = [word for word in words if word not in stop_words]

    cleaned_text = " ".join(words)

    return cleaned_text


if __name__ == "__main__":
    sentence = "Hey!!! What is Natural Language Processing??"

    result = preprocess_text(sentence)

    print("Original:", sentence)
    print("Processed:", result)