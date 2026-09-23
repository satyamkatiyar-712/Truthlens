# 🔍 Truthlens: AI Media Verification Engine


**Truthlens** is a multi-modal AI platform designed to automate media verification, debunk deepfakes, and combat misinformation. It features a seamless onboarding experience with a built-in guest mode and context-aware AI memory for analyzing text, audio, and video context.

---

## ⚡ Key Features

- **🧠 Advanced Media Analysis:** Leverages LLMs (OpenAI) and audio processing (Groq Whisper) to analyze context, metadata, and media integrity.
- **🛡️ Frictionless Guest Mode:** Allows users to test the platform without signing up, using secure IP & Device ID fingerprinting for rate-limiting.
- **📚 Context-Aware Memory:** Integrated with Vector Databases (Pinecone / MongoDB Atlas Vector Search) to retain chat history, past queries, and verified facts across sessions.
- **🔒 Secure Authentication:** Custom JWT authentication, stateless session management, and secure email OTP verification powered by the Resend API.
- **🎨 Modern UI/UX:** Built with React and Tailwind CSS, featuring a dark-mode first design and smooth animations using GSAP & Framer Motion.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React.js + Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand / Redux
- **Animations:** GSAP & Framer Motion

### Backend
- **Environment:** Node.js + Express.js
- **Database:** MongoDB (Mongoose) + Redis (Caching)
- **Vector DB:** Pinecone / MongoDB Atlas
- **Authentication:** JWT, Resend API

### AI & Processing
- **Core LLM:** Gemini API 
- **Audio Processing:** Groq Whisper

---

## 🚀 Local Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/satyamkatiyar-712/Truthlens
cd truthlens
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
RESEND_API_KEY=your_resend_api_key
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
```

Start the backend server:
```bash
npm run dev
```

### 3. Setup Frontend
Open a new terminal window:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:3000
```

Start the frontend development server:
```bash
npm run dev
```
