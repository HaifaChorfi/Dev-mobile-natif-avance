import { useEffect, useRef, useState } from "react";
import { ref, update, serverTimestamp } from "firebase/database";
import { auth, db, ensureAuth } from "../firebase.js";
import { TIME_PER_QUESTION } from "../data/tps.js";
import { loadProgress, saveProgress, clearProgress } from "../lib/progress.js";

const LIMIT_MS = TIME_PER_QUESTION * 1000;

// Construit l'état de départ. En cas de reprise après rechargement, l'horloge
// n'est PAS remise à zéro : le temps écoulé hors de la page est décompté.
function buildInitial(tp, student, resume) {
  const total = tp.questions.length;
  const saved = resume ? loadProgress(tp.id, student.id) : null;
  if (!saved) return { index: 0, startedAt: Date.now(), beganAt: Date.now(), answers: {} };
  let { index, startedAt } = saved;
  const now = Date.now();
  while (now - startedAt >= LIMIT_MS && index < total - 1) {
    index += 1;
    startedAt += LIMIT_MS;
  }
  return { index, startedAt, beganAt: saved.beganAt || startedAt, answers: saved.answers || {} };
}

export default function StudentQuiz({ tp, student, resume, onFinished }) {
  const questions = tp.questions;
  const total = questions.length;

  const [s, setS] = useState(() => buildInitial(tp, student, resume));
  const [now, setNow] = useState(Date.now());
  const [phase, setPhase] = useState("quiz"); // "quiz" | "sending" | "error"
  const [error, setError] = useState("");
  const sendingRef = useRef(false);

  const question = questions[s.index];
  const selected = s.answers[question.id];
  const isLast = s.index === total - 1;
  const timeLeft = Math.max(0, Math.ceil((s.startedAt + LIMIT_MS - now) / 1000));

  // Horloge
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  // Sauvegarde locale de la progression (reprise après rechargement)
  useEffect(() => {
    if (phase !== "quiz") return;
    saveProgress(tp.id, student.id, { uid: auth.currentUser?.uid, ...s });
  }, [s, phase, tp.id, student.id]);

  // Fin du temps : passage automatique (même sans réponse), avec rattrapage
  // si l'onglet a été mis en veille.
  useEffect(() => {
    if (phase !== "quiz") return;
    if (now - s.startedAt < LIMIT_MS) return;
    let { index, startedAt } = s;
    while (now - startedAt >= LIMIT_MS && index < total - 1) {
      index += 1;
      startedAt += LIMIT_MS;
    }
    if (now - startedAt >= LIMIT_MS) {
      submit(s.answers); // dernière question expirée
    } else {
      setS((prev) => ({ ...prev, index, startedAt }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  function selectOption(optionIndex) {
    if (phase !== "quiz" || timeLeft === 0) return;
    setS((prev) => ({ ...prev, answers: { ...prev.answers, [question.id]: optionIndex } }));
  }

  function goNext() {
    if (selected === undefined || phase !== "quiz") return;
    if (isLast) {
      submit(s.answers);
    } else {
      setS((prev) => ({ ...prev, index: prev.index + 1, startedAt: Date.now() }));
    }
  }

  async function submit(finalAnswers) {
    if (sendingRef.current) return;
    sendingRef.current = true;
    setPhase("sending");
    setError("");
    try {
      const user = await ensureAuth();
      // Correction calculée localement (voir note de sécurité dans le README)
      let score = 0;
      questions.forEach((q) => {
        if (finalAnswers[q.id] === q.correctIndex) score += 1;
      });

      // Écriture atomique : détail des réponses (enseignant) + score du classement.
      // Les règles Firebase refusent toute 2e écriture pour le même étudiant.
      // Durée totale du test (utilisée seulement si le départage par rapidité est activé)
      const durationMs = Math.max(0, Date.now() - (s.beganAt || Date.now()));

      await update(ref(db), {
        [`responses/${tp.id}/${student.id}`]: {
          studentId: student.id,
          studentName: student.name,
          uid: user.uid,
          answers: finalAnswers,
          score,
          total,
          durationMs,
          submittedAt: serverTimestamp(),
        },
        [`leaderboard/${tp.id}/${student.id}`]: { score, total, durationMs },
      });

      clearProgress(tp.id, student.id);
      onFinished({ score, total, durationMs });
    } catch (err) {
      console.error(err);
      sendingRef.current = false;
      if (err?.code === "PERMISSION_DENIED" || /permission/i.test(String(err?.message))) {
        clearProgress(tp.id, student.id);
        setError(
          "Envoi refusé : votre tentative n'est plus valide (déjà envoyée ou réinitialisée). Prévenez l'enseignant."
        );
      } else {
        setError("Échec de l'envoi (réseau ?). Vos réponses sont conservées : réessayez.");
      }
      setPhase("error");
    }
  }

  return (
    <div className="card">
      <div className="quiz-progress">
        {questions.map((q, i) => (
          <div
            key={q.id}
            className={"dot " + (i < s.index ? "done" : i === s.index ? "current" : "")}
          />
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="quiz-question-label">
          {tp.label.split(" — ")[0]} · Question {s.index + 1} / {total} — {student.name}
        </div>
        <div className={"timer-chip" + (timeLeft <= 10 ? " urgent" : "")} aria-live="off">
          ⏱ {timeLeft}s
        </div>
      </div>

      <div className="timer-bar">
        <div
          className={"timer-bar-fill" + (timeLeft <= 10 ? " urgent" : "")}
          style={{ width: `${(timeLeft / TIME_PER_QUESTION) * 100}%` }}
        />
      </div>

      <div className="quiz-question">{question.question}</div>

      {question.options.map((opt, i) => (
        <button
          key={i}
          className={"option" + (selected === i ? " selected" : "")}
          onClick={() => selectOption(i)}
          type="button"
          disabled={phase !== "quiz" || timeLeft === 0}
        >
          <span className="mark" />
          <span>{opt}</span>
        </button>
      ))}

      {phase === "sending" && <p className="note">Envoi de vos réponses…</p>}

      {phase === "error" && (
        <div style={{ marginTop: "0.8rem" }}>
          <p style={{ color: "var(--red)", fontSize: "0.88rem" }}>{error}</p>
          {!/refusé/.test(error) && (
            <button className="btn btn-primary" onClick={() => submit(s.answers)}>
              Réessayer l'envoi
            </button>
          )}
        </div>
      )}

      {phase === "quiz" && (
        <div className="quiz-nav">
          <span style={{ fontSize: "0.8rem", color: "var(--muted)", alignSelf: "center" }}>
            Pas de retour en arrière · une seule tentative
          </span>
          <button className="btn btn-primary" onClick={goNext} disabled={selected === undefined}>
            {isLast ? "Soumettre le quiz" : "Suivant →"}
          </button>
        </div>
      )}

      <p className="note">
        Aucune correction n'est affichée pendant le quiz. Votre score et votre rang
        s'afficheront après la soumission.
      </p>
    </div>
  );
}
