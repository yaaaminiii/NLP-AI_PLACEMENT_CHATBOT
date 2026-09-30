import mysql.connector
from datetime import datetime


# MySQL database configuration
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "YOUR_MYSQL_PASSWORD",
    "database": "ai_chatbot"
}


def create_database():

    connection = mysql.connector.connect(
        host=DB_CONFIG["host"],
        user=DB_CONFIG["user"],
        password=DB_CONFIG["password"]
    )

    cursor = connection.cursor()

    cursor.execute(
        "CREATE DATABASE IF NOT EXISTS ai_chatbot"
    )

    cursor.close()
    connection.close()

    # Connect to the created database
    connection = mysql.connector.connect(**DB_CONFIG)

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_query TEXT NOT NULL,
            intent VARCHAR(100) NOT NULL,
            confidence FLOAT NOT NULL,
            response TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    connection.commit()

    cursor.close()
    connection.close()


def save_conversation(user_query, intent, confidence, response):

    connection = mysql.connector.connect(**DB_CONFIG)

    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO conversations
        (user_query, intent, confidence, response, timestamp)
        VALUES (%s, %s, %s, %s, %s)
    """, (
        user_query,
        intent,
        confidence,
        response,
        datetime.now()
    ))

    connection.commit()

    cursor.close()
    connection.close()


def get_conversations():

    connection = mysql.connector.connect(**DB_CONFIG)

    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            id,
            user_query,
            intent,
            confidence,
            response,
            timestamp
        FROM conversations
        ORDER BY id DESC
    """)

    conversations = cursor.fetchall()

    cursor.close()
    connection.close()

    return conversations


if __name__ == "__main__":

    create_database()

    print("MySQL database created successfully!")