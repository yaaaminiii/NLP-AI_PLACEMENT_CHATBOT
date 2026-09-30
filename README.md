# AI Placement Assistant Chatbot for Students

An intelligent, full-stack Natural Language Processing (NLP) placement preparation assistant and real-time analytics dashboard developed as a Computer Science & Engineering college project.

---

## 👥 Project Team Members

| Roll Number | Name | Primary Contribution |
| :--- | :--- | :--- |
| **24B11CS058** | **B. Yamini** | Full-Stack Integration & Architecture |
| **24B11CS115** | **E. Divya Teja** | NLP Preprocessing Pipeline |
| **24B11CS298** | **N. Siva Sri** | Intent Classification Model & Training |
| **24B11CS465** | **V. Divya** | MySQL Database & Analytics Dashboard |

---

## 🌟 Project Overview & Architecture

The objective of this project is to develop an intelligent conversational assistant that helps college students prepare for campus placements, technical interviews, coding assessments, aptitude rounds, and resume building through Natural Language Processing and Machine Learning. The system stores student conversation interactions in MySQL and provides an interactive analytics dashboard.

### Core NLP Workflow
```
             User Query
                 ↓
         Text Preprocessing
(Lowercase, Regex Punctuation Removal, Tokenization, Stopwords Filtering)
                 ↓
        TF-IDF Vectorization
(Sublinear Term Frequency, Unigram + Bigram Features)
                 ↓
        Intent Recognition
(Logistic Regression Classifier with predict_proba)
                 ↓
       Confidence Scoring & Fallback
     (Threshold: 40% -> 'unknown' fallback)
                 ↓
       Response Generation
(Dynamic Template Dispatch from intents.json)
                 ↓
        Chatbot Response
                 ↓
     MySQL Database Logging
(Stores query, intent, confidence, response, latency, timestamp)
```

---

## 💻 Technology Stack

- **Frontend:** React.js 18, Vite, Tailwind CSS, Chart.js, react-chartjs-2, Lucide Icons, Axios
- **Backend:** Python 3.11, Flask, Flask-CORS, python-dotenv
- **NLP & Machine Learning:** NLTK (Tokenization, Stopwords), scikit-learn (TF-IDF Vectorizer, Logistic Regression)
- **Database:** MySQL Server 8.0 (Database: `ai_chatbot`, Table: `conversations`)

---

## 📂 Project Structure

```
ai-chatbot-nlp/
│
├── backend/
│   ├── app.py                     # Flask REST API server & static single-page app router
│   ├── chatbot.py                 # Chatbot NLP inference engine with step-by-step metadata
│   ├── preprocess.py              # NLP preprocessing (cleaning, tokenizing, stopword removal)
│   ├── train.py                   # Model training script with accuracy evaluation
│   ├── database.py                # MySQL connection manager & parameterized queries
│   ├── seed_data.py               # Database seeder for realistic viva/demo data
│   ├── intents.json               # Rich dataset with 15 intents and 180+ training patterns
│   ├── requirements.txt           # Python dependencies
│   ├── .env.example               # Environment variables template
│   ├── .env                       # Local environment variables
│   └── model/
│       ├── chatbot_model.pkl      # Trained Logistic Regression classifier
│       └── tfidf_vectorizer.pkl   # Fitted TF-IDF vectorizer
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx        # Navigation sidebar matching reference UI
│   │   │   ├── Header.jsx         # Header with title and live date
│   │   │   ├── StatCard.jsx       # Metric cards with custom icons & sparklines
│   │   │   ├── ChatPanel.jsx      # Live Chat with message bubbles & typing indicator
│   │   │   ├── IntentDonutChart.jsx # Donut chart with legend & percentages
│   │   │   ├── RecentConversations.jsx # Real-time recent conversations list
│   │   │   └── PerformanceCards.jsx # 4 bottom KPI cards
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx  # Overview dashboard matching design
│   │   │   ├── ChatPage.jsx       # Full-screen Chat with NLP Pipeline step inspector
│   │   │   ├── IntentsPage.jsx    # Visual explorer of training dataset
│   │   │   ├── AnalyticsPage.jsx  # Trend line charts and query frequency bar charts
│   │   │   ├── HistoryPage.jsx    # Full conversation history table with filters & CSV export
│   │   │   ├── TeamPage.jsx       # Team members & viva preparation Q&A
│   │   │   └── SettingsPage.jsx   # System configuration & DB initializer
│   │   ├── services/
│   │   │   └── api.js             # Centralized Axios API service with anonymous session ID
│   │   ├── App.jsx                # Main layout and view routing
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Custom Tailwind CSS & dark theme styling
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── README.md                      # Complete setup, running instructions & documentation
└── .gitignore
```

---

## 🚀 Step-by-Step Setup Guide

### 1. Prerequisites
- **Python 3.10 or 3.11** installed.
- **Node.js 18+ and npm** installed.
- **MySQL Server 8.0** running locally (e.g. `MySQL80` service on port 3306).

---

### 2. MySQL Configuration
Open `backend/.env` (or copy from `backend/.env.example`):
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_root_password_here
MYSQL_DATABASE=ai_chatbot
PORT=5000
FLASK_ENV=development
```
> Replace `your_mysql_root_password_here` with your actual MySQL root password.

#### Optional: Create Database via MySQL Command Line / Workbench
```sql
CREATE DATABASE IF NOT EXISTS ai_chatbot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
*(The backend also automatically creates this database and table on startup!)*

---

### 3. Backend Setup & Model Training

Open a terminal in the project directory:

```bash
# Activate virtual environment (if using existing venv)
.\venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Train the NLP Intent Classification Model
python backend/train.py

# Optional: Seed realistic demo data into MySQL
python backend/seed_data.py
```

---

### 4. Running the Application

You have two convenient ways to run the project:

#### Option A: Unified Full-Stack Run (Recommended for Viva / Demo)
Because the frontend has already been built into `frontend/dist/`, Flask serves both the API and the React Single-Page Application:

```bash
python backend/app.py
```
Open your browser at: **[http://localhost:5000](http://localhost:5000)**

---

#### Option B: Dual Development Server (With Vite Hot-Reloading)

**Terminal 1 (Backend API):**
```bash
python backend/app.py
```
*(Runs on `http://localhost:5000`)*

**Terminal 2 (Frontend Dev Server):**
```bash
cd frontend
npm run dev
```
*(Runs on `http://localhost:5173` with instant hot-reloading)*

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/chat` | Send user message; performs NLP classification and saves to MySQL |
| `GET` | `/api/dashboard/stats` | Returns real-time KPI metrics computed from database |
| `GET` | `/api/dashboard/intent-distribution` | Returns counts and percentages for Donut chart |
| `GET` | `/api/dashboard/conversation-trend` | Returns time-series counts for Line chart |
| `GET` | `/api/dashboard/frequent-queries` | Returns top asked queries for Bar chart |
| `GET` | `/api/history` | Paginated and searchable list of stored conversations |
| `DELETE` | `/api/history` | Clear conversations (optionally filtered by `session_id`) |
| `GET` | `/api/intents` | List of all configured intents, patterns, and responses |
| `GET` | `/api/health` | Health check verifying model readiness and MySQL connectivity |
| `POST` | `/api/init-db` | Initializes MySQL database schema and table |

---

## 🎓 College Viva / Project Review Q&A

1. **How is intent predicted from natural text?**
   The user query is first normalized (lowercase, special characters removed) and tokenized using NLTK. Common English stopwords are stripped. The cleaned token sequence is converted into a numerical vector using scikit-learn's `TfidfVectorizer` (with unigrams and bigrams). The vector is fed into a `LogisticRegression` classifier which outputs the predicted intent and posterior class probability via `predict_proba`.

2. **How does the system handle unknown or out-of-domain queries?**
   If the predicted intent's maximum probability falls below 40%, the query is flagged as `unknown` (failed status), and a polite fallback response is returned to avoid hallucination.

3. **How is user privacy preserved without SQLite?**
   The frontend automatically generates an anonymous UUID session token stored in browser `localStorage`. No personal information (PII) is captured, allowing MySQL to accurately calculate `COUNT(DISTINCT session_id)` for unique user counts.

4. **Why Logistic Regression for this NLP task?**
   Logistic Regression is computationally lightweight, converges fast, performs exceptionally well on high-dimensional sparse TF-IDF text features, and directly outputs calibrated probabilities through the Softmax function.
