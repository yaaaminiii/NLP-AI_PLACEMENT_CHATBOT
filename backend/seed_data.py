import os
import random
from datetime import datetime, timedelta
from database import init_db, get_db_connection, check_db_connection

SAMPLE_CONVERSATIONS = [
    ("session_alpha", "What is NLP?", "nlp", 0.97, "NLP stands for Natural Language Processing.", 0.024, "success"),
    ("session_alpha", "How are you?", "greeting", 0.88, "I'm just a bot, but I'm here to help you! 😊", 0.018, "success"),
    ("session_alpha", "Explain machine learning", "machine_learning", 0.93, "Machine learning is a branch of AI where computers learn from data.", 0.031, "success"),
    ("session_beta", "What is deep learning?", "deep_learning", 0.95, "Deep learning uses neural networks with multiple layers.", 0.027, "success"),
    ("session_beta", "Why is Python used in AI?", "python", 0.91, "Python is popular due to extensive libraries like NLTK and scikit-learn.", 0.022, "success"),
    ("session_gamma", "Who created you?", "about_bot", 0.89, "I am an AI Placement Assistant developed to help students prepare for campus placements, interviews, coding, and aptitude tests.", 0.019, "success"),
    ("session_gamma", "What is your accuracy?", "accuracy", 0.96, "Our intent classifier achieves over 95% accuracy.", 0.021, "success"),
    ("session_delta", "Tell me about your services.", "faq", 0.84, "I can answer questions regarding NLP, AI, Python, and system architecture.", 0.033, "success"),
    ("session_delta", "What courses are available?", "course", 0.92, "Courses include NLP, Machine Learning, and Data Science.", 0.025, "success"),
    ("session_epsilon", "How does this chatbot work?", "working", 0.94, "Queries go through Preprocessing, TF-IDF vectorization, Intent Recognition, and Response Generation.", 0.029, "success"),
    ("session_epsilon", "How do I contact support?", "contact", 0.90, "You can check the Settings section or explore our placement guides.", 0.020, "success"),
    ("session_zeta", "What is NLP?", "nlp", 0.98, "NLP enables computers to understand human language.", 0.017, "success"),
    ("session_zeta", "Thank you so much", "thanks", 0.96, "You're welcome! Happy to help!", 0.015, "success"),
    ("session_eta", "Random gibberish text xyz", "unknown", 0.32, "Sorry, I didn't understand your question. Could you please rephrase?", 0.035, "failed"),
    ("session_theta", "Can you help me?", "help", 0.87, "Sure! Ask me anything regarding AI or NLP.", 0.019, "success"),
    ("session_theta", "What is machine learning?", "machine_learning", 0.95, "Machine learning is an application of AI.", 0.023, "success"),
    ("session_iota", "What is NLP?", "nlp", 0.97, "Natural Language Processing is a subfield of AI.", 0.018, "success"),
    ("session_iota", "Goodbye", "goodbye", 0.94, "Goodbye! Have a great day!", 0.016, "success"),
    ("session_kappa", "What are frequently asked questions?", "faq", 0.91, "Common FAQs include: What is NLP? and How does ML work?", 0.026, "success"),
    ("session_kappa", "Tell me about Python", "python", 0.93, "Python is an interpreted, high-level programming language.", 0.021, "success"),
]


def seed_database():
    """Populate database with sample queries for realistic initial dashboard."""
    status = check_db_connection()
    if not status["connected"]:
        print(f"[Seed Error] Cannot seed: {status['message']}")
        return False

    init_db()

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check existing count
    cursor.execute("SELECT COUNT(*) FROM conversations")
    count = cursor.fetchone()[0]
    if count > 0:
        print(f"[Database] Already contains {count} conversations. Skipping seed.")
        conn.close()
        return True

    print("[Database] Seeding sample conversations...")
    insert_sql = """
        INSERT INTO conversations
        (session_id, user_query, intent, confidence, response, response_time, status, timestamp)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """

    now = datetime.now()
    records = []
    for i, item in enumerate(SAMPLE_CONVERSATIONS):
        session_id, query, intent, conf, resp, rtime, state = item
        # Distribute over past few hours/days
        time_offset = timedelta(hours=(len(SAMPLE_CONVERSATIONS) - i) * 2, minutes=random.randint(2, 45))
        ts = now - time_offset
        records.append((session_id, query, intent, conf, resp, rtime, state, ts))

    cursor.executemany(insert_sql, records)
    conn.commit()
    print(f"[Database] Successfully seeded {len(records)} realistic conversations!")

    cursor.close()
    conn.close()
    return True


if __name__ == "__main__":
    seed_database()
