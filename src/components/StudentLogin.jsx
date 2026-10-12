import { useState } from "react";
import { ref, get, set } from "firebase/database";
import { db, ensureAuth } from "../firebase.js";
import { TP_LIST } from "../data/tps.js";
import { loadProgress } from "../lib/progress.js";
import { buildStudent } from "../lib/names.js";

const availableTps = TP_LIST.filter((t) => t.enabled);

export default function StudentLogin({ onBack, onContinue }) {
  const [tpId, setTpId] = useState(availableTps[availableTps.length - 1].id);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const student = buildStudent(prenom, nom);
    if (!student) {
      setError("Saisissez votre prénom ET votre nom.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const user = await ensureAuth();

      // 1) Test déjà terminé avec ce nom ?
      const finished = await get(ref(db, `leaderboard/${tpId}/${student.id}`));
      if (finished.exists()) {
        setError("Ce test a déjà été passé avec ce nom. Une seule tentative est autorisée.");
        return;
      }

      // 2) Tentative déjà démarrée sur CE navigateur (rechargement de page) : on reprend
      const saved = loadProgress(tpId, student.id);
      if (saved && saved.uid === user.uid) {
        onContinue({ tpId, student, resume: true });
        return;
      }

      // 3) Première tentative : verrou "étudiant" (écriture unique imposée par les règles Firebase).
      //    Refusé si ce nom est déjà pris OU si cet appareil a déjà passé ce test sous un autre nom.
      try {
        await set(ref(db, `attempts/${tpId}/${student.id}`), {
          uid: user.uid,
          name: student.name,
          startedAt: Date.now(),
        });
      } catch {
        setError(
          "Impossible de démarrer : ce nom a déjà été utilisé pour ce test, ou ce navigateur l'a déjà passé. Prévenez l'enseignant en cas d'erreur."
        );
        return;
      }

      // 4) Verrou "appareil" : empêche de repasser le test sous une autre orthographe
      try {
        await set(ref(db, `uidLocks/${tpId}/${user.uid}`), student.id);
      } catch (err) {
        console.warn("Verrou appareil non posé", err);
      }

      onContinue({ tpId, student, resume: false });
    } catch (err) {
      console.error(err);
      setError("Connexion impossible. Vérifiez votre réseau et réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Passer un QCM</h2>
      <p style={{ color: "var(--muted)", marginTop: "0.4rem" }}>
        Une seule tentative par test. 30 secondes par question, sans retour en arrière.
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: "1.4rem" }}>
        <label htmlFor="tp-select">Test</label>
        <select id="tp-select" value={tpId} onChange={(e) => setTpId(e.target.value)}>
          {availableTps.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label} ({t.questions.length} questions)
            </option>
          ))}
        </select>

        <label htmlFor="prenom">Prénom</label>
        <input
          id="prenom"
          type="text"
          autoComplete="off"
          value={prenom}
          onChange={(e) => {
            setPrenom(e.target.value);
            setError("");
          }}
        />

        <label htmlFor="nom">Nom</label>
        <input
          id="nom"
          type="text"
          autoComplete="off"
          value={nom}
          onChange={(e) => {
            setNom(e.target.value);
            setError("");
          }}
        />

        <p className="note" style={{ textAlign: "left", marginTop: "-0.6rem", marginBottom: "1rem" }}>
          Écrivez votre nom exactement comme sur la liste de la classe.
        </p>

        {error && (
          <p style={{ color: "var(--red)", fontSize: "0.85rem", marginTop: "-0.4rem" }}>{error}</p>
        )}

        <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.4rem" }}>
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            ← Retour
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Vérification…" : "Démarrer le quiz"}
          </button>
        </div>
      </form>
    </div>
  );
}
