# 🏦 Vernacular FD Advisor

> A multilingual AI-powered Fixed Deposit chatbot that explains FDs, calculates returns, and simulates bookings — in English, Hindi, Tamil, Telugu, and Bengali.

---

## 🚀 Quick Start

### 1. Install server dependencies

```bash
cd server
npm install
```

### 2. Configure your OpenAI API Key

Edit `server/.env`:

```env
OPENAI_API_KEY=sk-...your-key-here...
PORT=5000
```

### 3. Start the backend

```bash
cd server
npm run dev
```

The API will be live at `http://localhost:5000`

### 4. Open the frontend

Open `client/index.html` directly in your browser, **or** serve it with a static server:

```bash
npx serve client -p 3000
```

Then visit `http://localhost:3000`

---

## 📁 Folder Structure

```
Vernacular FD Advisor/
│
├── client/                    # Frontend (Vanilla HTML/CSS/JS)
│   ├── components/
│   │   ├── Message.js         # Chat message bubble
│   │   ├── CalcCard.js        # FD calculation result card
│   │   └── BookingCard.js     # FD booking confirmation card
│   ├── pages/
│   │   └── ChatPage.js        # Main chat page + booking flow
│   ├── services/
│   │   └── api.js             # Backend API calls (fetch)
│   ├── App.js                 # Root app bootstrapper
│   ├── index.js               # Bundler entry point
│   └── index.html             # Single-page HTML + all CSS
│
├── server/                    # Backend (Node.js + Express)
│   ├── controllers/
│   │   ├── chatController.js  # /api/chat handler
│   │   └── bookingController.js # /api/booking handler
│   ├── routes/
│   │   ├── chatRoutes.js      # POST /api/chat
│   │   └── bookingRoutes.js   # POST/GET /api/booking
│   ├── services/
│   │   ├── openaiService.js   # OpenAI API integration
│   │   └── bookingService.js  # Mock booking store
│   ├── utils/
│   │   ├── languageDetector.js # Detect Hindi/Tamil/Telugu/Bengali/English
│   │   ├── intentDetector.js   # Keyword-based intent detection
│   │   └── fdCalculator.js     # FD math + INR formatting
│   ├── app.js                 # Express entry point
│   ├── package.json
│   ├── .env                   # ← Add your OpenAI key here
│   └── .env.example
│
├── package.json               # Root convenience scripts
├── .gitignore
└── README.md
```

---

## 🌐 API Endpoints

| Method | Endpoint          | Description                     |
|--------|-------------------|---------------------------------|
| POST   | `/api/chat`       | Send a message, get AI reply    |
| POST   | `/api/booking`    | Create a mock FD booking        |
| GET    | `/api/booking/:ref` | Fetch booking by reference    |
| GET    | `/api/bookings`   | List all bookings (dev)         |
| GET    | `/api/health`     | Health check                    |

### Chat Request Body

```json
{
  "message": "What is a Fixed Deposit?",
  "history": []
}
```

### Chat Response

```json
{
  "reply": "A Fixed Deposit (FD) is...",
  "language": "english",
  "intent": "fd_explain",
  "calculation": null
}
```

### Booking Request Body

```json
{
  "name": "Rahul Sharma",
  "amount": 50000,
  "tenureYears": 2,
  "rate": 7.0
}
```

---

## 🧠 Core Logic

### Language Detection
Detects language from Unicode script ranges (Devanagari, Tamil, Telugu, Bengali) or romanized keyword hints.

### Intent Detection
Keyword-based matching across multiple languages for:
- `fd_explain` — "What is FD?", "FD kya hai?"
- `interest` — "interest rate", "byaj dar"
- `calculate` — "calculate", "kitna milega"
- `book_fd` — "book FD", "FD kholna"

### FD Calculation
```
Maturity = Principal + (Principal × Rate × Years) / 100
```

Supports amount/tenure parsing from natural language: `"1 lakh"`, `"50k"`, `"18 months"`

---

## 💬 Supported Languages

| Language | Script       | Romanized Support |
|----------|--------------|-------------------|
| English  | Latin        | ✅                |
| Hindi    | Devanagari   | ✅ (Hinglish)     |
| Tamil    | Tamil script | ✅                |
| Telugu   | Telugu script| ✅                |
| Bengali  | Bengali script| ✅               |

---

## 🔒 Notes

- The booking system is **simulated** (in-memory). No real bank data is used.
- Add your real `OPENAI_API_KEY` in `server/.env` before running.
- The frontend uses native ES modules — serve it via a static file server for best results (CORS).

---

## 📦 Tech Stack

| Layer    | Technology                     |
|----------|--------------------------------|
| Backend  | Node.js, Express               |
| AI       | OpenAI GPT-3.5-turbo           |
| Frontend | Vanilla HTML + CSS + JS (ESM)  |
| Language | Unicode + Keyword Detection    |
| Design   | Dark UI, Glassmorphism, CSS3   |
