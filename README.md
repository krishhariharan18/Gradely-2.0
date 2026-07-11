<div align="center">
  <h1 align="center">Gradely 2.0</h1>
  <p align="center">
    <strong>The Ultimate Academic Excellence & Grading Platform</strong>
  </p>
</div>

## 🌟 Overview
Gradely 2.0 is a comprehensive, modern academic management platform designed to help students predict, balance, and maximize their academic performance. Featuring a beautiful glassmorphic UI and seamless full-stack architecture, Gradely empowers students to take control of their grades and attendance.

## 🚀 Features

### 🎓 Academic Calculators
- **SGPA Calculator**: Calculate your current Semester Grade Point Average dynamically based on your specific program and semester weightages.
- **CGPA Calculator**: Track your cumulative academic performance across multiple semesters.
- **Required ESE Marks Calculator**: Predict exactly how many marks you need in your End Semester Examination (ESE) to achieve your target grade.
- **Expected Grade Calculator**: Input your internal scores (IA1, IA2, Mid-Sem) to predict your final letter grade.

### ⚖️ Balancers & Planners
- **GPA Balancer**: An intelligent engine that calculates the exact grade combinations you need across multiple courses to hit a target SGPA. Includes a "Maximize Mode" if your target is mathematically challenging.
- **Attendance Balancer**: Monitor your course attendance, predict if you will meet the 75% mandatory threshold, and calculate exactly how many classes you can afford to safely bunk.

## 💻 Tech Stack
This project follows a decoupled, hybrid monolithic architecture:

**Frontend:**
- React 19
- Vite (Build Tool & Dev Server)
- Tailwind CSS v4 (Styling Engine)
- Lucide React (Iconography)

**Backend:**
- Python 3
- Flask (API framework)
- PyMySQL (Database driver)
- MySQL (Relational Database)

## 📁 Repository Structure
```text
gradely2.0/
├── backend/            # Flask API routes and configurations
├── database/           # SQL schemas and database scripts
├── public/             # Static public assets
├── src/                # React frontend application
│   ├── assets/         # Images, fonts, etc.
│   ├── pages/          # Full-page React components (Calculators, Balancers)
│   ├── App.jsx         # Main application router
│   └── main.jsx        # React entry point
├── app.py              # Main Flask server entry point
├── package.json        # Frontend dependencies
├── vite.config.js      # Vite and Tailwind configuration
└── .env.example        # Environment variable template
```

## 🛠️ Local Setup & Installation

### 1. Database Setup
1. Ensure MySQL is installed and running on your local machine.
2. Import the database schema from `database/gradely_db.sql`.
3. Copy `.env.example` to a new file named `.env` and fill in your actual MySQL credentials:
   ```env
   DB_HOST=127.0.0.1
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=gradely_db
   ```

### 2. Backend (Flask) Setup
1. Open a terminal in the root directory.
2. (Optional but recommended) Create and activate a virtual environment.
3. Install dependencies:
   ```bash
   pip install flask pymysql
   ```
4. Run the backend server:
   ```bash
   python app.py
   ```
   *The API will run on `http://localhost:5000`.*

### 3. Frontend (React/Vite) Setup
1. Open a **second** terminal in the root directory.
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The web app will run on `http://localhost:5173`.*

## 🎨 Design Philosophy
Gradely 2.0 is built with a heavy emphasis on premium UI/UX:
- **Neon Glassmorphism**: Utilizes blurred backgrounds, subtle glowing borders, and semi-transparent layers to create a futuristic academic vibe.
- **Dynamic Feedback**: Real-time validation, color-coded health indicators (Green/Orange/Red zones), and micro-animations for interactive engagement.

---
*Built with ❤️ for academic excellence.*
