import { useEffect, useState } from "react";
import { ref, onValue, set, update, serverTimestamp } from "firebase/database";
import { db } from "../firebase.js";

// Bandeau enseignant : active / clôture la session d'un QCM (sessions/<tpId>).
// Tant que la session est fermée, les étudiants ne peuvent pas DÉMARRER le test
// (ceux qui l'ont déjà commencé peuvent le terminer).
export default function SessionControl({ tp }) {
  const [session, setSession] = useState(undefined); // undefined = chargement
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return onValue(
      ref(db, `sessions/${tp.id}`),
      (snap) => setSession(snap.val() || { active: false }),
      () => setError("Lecture de la session refusée par les règles Firebase (voir REGLES_FIREBASE_TP3.md).")
    );
  }, [tp.id]);

  async function activate() {
    setBusy(true);
    setError("");
    try {
      await set(ref(db, `sessions/${tp.id}`), { active: true, activatedAt: serverTimestamp() });
    } catch (err) {
      console.error(err);
      setError("Activation refusée : compte enseignant non déclaré dans les règles Firebase.");
    } finally {
      setBusy(false);
    }
  }

  async function close() {
    if (!window.confirm("Clôturer la session ? Plus aucun étudiant ne pourra démarrer le test.")) return;
    setBusy(true);
    setError("");
    try {
      await update(ref(db, `sessions/${tp.id}`), { active: false, closedAt: serverTimestamp() });
    } catch (err) {
      console.error(err);
      setError("Clôture refusée : compte enseignant non déclaré dans les règles Firebase.");
    } finally {
      setBusy(false);
    }
  }

  const active = session?.active === true;
  const time = (ms) => (ms ? new Date(ms).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : null);

  return (
    <div
      className="card"
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}
    >
      <div>
        <strong>Session du {tp.label.split(" — ")[0]}</strong>
        <div style={{ color: active ? "var(--green-700)" : "var(--amber)", fontSize: "0.9rem", marginTop: "0.2rem" }}>
          {session === undefined && !error && "Chargement…"}
          {session !== undefined && (active ? `🟢 Ouverte${time(session.activatedAt) ? ` depuis ${time(session.activatedAt)}` : ""}` : "🟠 Fermée : les étudiants attendent")}
        </div>
        <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: "0.2rem" }}>
          {tp.questions.length} questions · {tp.timePerQuestion} s par question · une seule tentative par étudiant
        </div>
        {error && <div style={{ color: "var(--red)", fontSize: "0.85rem", marginTop: "0.3rem" }}>{error}</div>}
      </div>
      {session !== undefined && (
        <button className={active ? "btn btn-outline" : "btn btn-primary"} onClick={active ? close : activate} disabled={busy}>
          {active ? "Clôturer la session" : "▶ Activer la session"}
        </button>
      )}
    </div>
  );
}
