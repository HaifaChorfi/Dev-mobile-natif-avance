import { useState } from "react";
import StudentLogin from "./components/StudentLogin.jsx";
import StudentQuiz from "./components/StudentQuiz.jsx";
import ResultScreen from "./components/ResultScreen.jsx";
import TeacherLogin from "./components/TeacherLogin.jsx";
import TeacherDashboard from "./components/TeacherDashboard.jsx";
import { getTp } from "./data/tps.js";

// Vues possibles : "home" | "student-login" | "student-quiz" | "student-result"
//                  "teacher-login" | "teacher-dashboard"
export default function App() {
  const [view, setView] = useState("home");
  const [session, setSession] = useState(null); // { tpId, student: {id,name}, resume }
  const [lastResult, setLastResult] = useState(null); // { score, total }

  function resetToHome() {
    setSession(null);
    setLastResult(null);
    setView("home");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="badge">📱</div>
        <div>
          <div className="title">Atelier Développement Mobile Natif</div>
          <div className="subtitle">QCM interactifs — Filière SEM</div>
        </div>
      </header>

      <main className="main">
        {view === "home" && (
          <div className="card">
            <h2>Bienvenue 👋</h2>
            <p style={{ color: "var(--muted)", marginTop: "0.4rem" }}>
              Choisissez votre profil pour continuer.
            </p>
            <div className="role-grid">
              <button
                className="role-card"
                onClick={() => setView("student-login")}
              >
                <div className="emoji">🎓</div>
                <h3>Étudiant</h3>
                <p>Passer un QCM (une seule tentative).</p>
                <span className="btn btn-primary">Commencer</span>
              </button>
              <button
                className="role-card"
                onClick={() => setView("teacher-login")}
              >
                <div className="emoji">🧑‍🏫</div>
                <h3>Enseignant</h3>
                <p>Suivre les résultats en direct.</p>
                <span className="btn btn-outline">Accéder</span>
              </button>
            </div>
          </div>
        )}

        {view === "student-login" && (
          <StudentLogin
            onBack={resetToHome}
            onContinue={(sess) => {
              setSession(sess);
              setView("student-quiz");
            }}
          />
        )}

        {view === "student-quiz" && session && (
          <StudentQuiz
            tp={getTp(session.tpId)}
            student={session.student}
            resume={session.resume}
            onFinished={(result) => {
              setLastResult(result);
              setView("student-result");
            }}
          />
        )}

        {view === "student-result" && session && lastResult && (
          <ResultScreen
            tp={getTp(session.tpId)}
            student={session.student}
            result={lastResult}
            onRestart={resetToHome}
          />
        )}

        {view === "teacher-login" && (
          <TeacherLogin
            onBack={resetToHome}
            onSuccess={() => setView("teacher-dashboard")}
          />
        )}

        {view === "teacher-dashboard" && (
          <TeacherDashboard onLogout={resetToHome} />
        )}
      </main>
    </div>
  );
}
