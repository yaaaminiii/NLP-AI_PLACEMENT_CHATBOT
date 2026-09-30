import re
import nltk

# Safely verify / load NLTK resources
try:
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize
    _ = stopwords.words("english")
except (LookupError, AttributeError):
    try:
        nltk.download("punkt", quiet=True)
        nltk.download("punkt_tab", quiet=True)
        nltk.download("stopwords", quiet=True)
        from nltk.corpus import stopwords
        from nltk.tokenize import word_tokenize
    except Exception:
        pass


def get_stop_words():
    """Retrieve English stopwords set with safe fallback."""
    try:
        return set(stopwords.words("english"))
    except Exception:
        # Fallback standard English stopword list
        return {
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any",
            "are", "aren't", "as", "at", "be", "because", "been", "before", "being", "below",
            "between", "both", "but", "by", "can't", "cannot", "could", "couldn't", "did",
            "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each",
            "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
            "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's",
            "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll",
            "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself",
            "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of",
            "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves",
            "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's",
            "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the",
            "their", "theirs", "them", "themselves", "then", "there", "there's", "these",
            "they", "they'd", "they'll", "they're", "they've", "this", "those", "through",
            "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd",
            "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's",
            "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's",
            "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've",
            "your", "yours", "yourself", "yourselves"
        }


def preprocess_text(text):
    """
    Standard preprocessing pipeline:
    1. Lowercase conversion
    2. Remove non-alphanumeric characters
    3. Tokenize words
    4. Remove English stopwords
    5. Join back into normalized text
    """
    if not text or not isinstance(text, str):
        return ""

    # 1. Lowercase
    lower_text = text.lower().strip()

    # 2. Remove unwanted characters (keep letters, digits, and spaces)
    cleaned_characters = re.sub(r"[^a-zA-Z0-9\s]", " ", lower_text)

    # 3. Tokenize
    try:
        tokens = word_tokenize(cleaned_characters)
    except Exception:
        tokens = cleaned_characters.split()

    # 4. Filter stopwords
    stop_words = get_stop_words()
    filtered_tokens = [w for w in tokens if w and w not in stop_words]

    # If all tokens were filtered out (e.g. query was just "what is"), keep non-empty tokens
    if not filtered_tokens and tokens:
        filtered_tokens = tokens

    return " ".join(filtered_tokens)


def preprocess_pipeline_details(text):
    """
    Detailed step-by-step preprocessing breakdown for education / UI inspection.
    """
    raw_query = text if text else ""
    lowercase_text = raw_query.lower().strip()
    cleaned_text = re.sub(r"[^a-zA-Z0-9\s]", " ", lowercase_text)

    try:
        raw_tokens = word_tokenize(cleaned_text)
    except Exception:
        raw_tokens = cleaned_text.split()

    stop_words = get_stop_words()
    removed_stopwords = [w for w in raw_tokens if w in stop_words]
    filtered_tokens = [w for w in raw_tokens if w and w not in stop_words]

    final_processed = " ".join(filtered_tokens) if filtered_tokens else " ".join(raw_tokens)

    return {
        "raw_query": raw_query,
        "lowercase": lowercase_text,
        "cleaned_text": cleaned_text,
        "raw_tokens": raw_tokens,
        "removed_stopwords": removed_stopwords,
        "final_tokens": filtered_tokens or raw_tokens,
        "processed_text": final_processed
    }


if __name__ == "__main__":
    sample = "Hey there!!! Can you explain what is Natural Language Processing?"
    print("Sample:", sample)
    print("Preprocessed:", preprocess_text(sample))
    print("Details:", preprocess_pipeline_details(sample))
