import { useState } from "react";
import { ensureAuth, TEACHER_PASSCODE } from "../firebase.js";

export default function TeacherLogin({ onBack, onSuccess }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (code !== TEACHER_PASSCODE) {
      setError("Code d'accès incorrect.");
      return;
    }
    setLoading(true);
    try {
      await ensureAuth();
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Connexion impossible. Vérifiez votre configuration Firebase.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Espace enseignant</h2>
      <p style={{ color: "var(--muted)", marginTop: "0.4rem" }}>
        Saisissez le code d'accès pour consulter les résultats.
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: "1.4rem" }}>
        <label htmlFor="passcode">Code d'accès</label>
        <input
          id="passcode"
          type="password"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError("");
          }}
          placeholder="••••••••"
        />
        {error && (
          <p style={{ color: "var(--red)", fontSize: "0.85rem", marginTop: "-0.7rem" }}>
            {error}
          </p>
        )}
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            ← Retour
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Connexion…" : "Accéder au tableau de bord"}
          </button>
        </div>
      </form>

      <p className="note">
        Côté base de données, l'accès aux détails des réponses est en plus
        restreint par une règle Firebase qui vérifie que votre compte figure
        dans <code>roles/teachers</code> (voir README).
      </p>
    </div>
  );
}
