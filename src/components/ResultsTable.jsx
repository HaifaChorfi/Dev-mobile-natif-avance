import { useEffect, useMemo, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { db, auth } from "../firebase.js";
import { withRanks, formatDuration } from "../lib/ranking.js";
import { RANK_TIEBREAK_BY_SPEED, EXPECTED_STUDENTS } from "../data/tps.js";

export default function ResultsTable({ tp }) {
  const [responses, setResponses] = useState({});
  const [attempts, setAttempts] = useState({});
  const [permissionError, setPermissionError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setPermissionError(false);
    const onErr = (err) => {
      console.error(err);
      setPermissionError(true);
      setLoading(false);
    };
    const u1 = onValue(
      ref(db, `responses/${tp.id}`),
      (snap) => {
        setResponses(snap.val() || {});
        setLoading(false);
      },
      onErr
    );
    const u2 = onValue(ref(db, `attempts/${tp.id}`), (snap) => setAttempts(snap.val() || {}), onErr);
    return () => {
      u1();
      u2();
    };
  }, [tp.id]);

  const rows = useMemo(
    () => withRanks(Object.values(responses).map((r) => ({ ...r }))),
    [responses]
  );

  // Tentatives démarrées mais non terminées (étudiant parti, panne, abandon...)
  const unfinished = Object.entries(attempts)
    .filter(([id]) => !responses[id])
    .map(([id, a]) => ({ id, name: a.name || id, uid: a.uid }));

  const average = rows.length
    ? (rows.reduce((sum, r) => sum + r.score, 0) / rows.length).toFixed(1)
    : "—";
  const best = rows.length ? rows[0].score : "—";
  const maxScore = tp.questions.length;

  async function resetStudent({ id, name, uid }) {
    const ok = window.confirm(
      `Réinitialiser ${name} ? Son résultat et sa tentative seront supprimés : il pourra repasser le test.`
    );
    if (!ok) return;
    const updates = {
      [`attempts/${tp.id}/${id}`]: null,
      [`responses/${tp.id}/${id}`]: null,
      [`leaderboard/${tp.id}/${id}`]: null,
    };
    const lockUid = uid || responses[id]?.uid || attempts[id]?.uid;
    if (lockUid) updates[`uidLocks/${tp.id}/${lockUid}`] = null;
    await update(ref(db), updates);
  }

  function exportCsv() {
    const header = "Rang;Nom;Score;Total;Temps de réponse\n";
    const body = rows
      .map((r) => `${r.rank};"${r.studentName}";${r.score};${r.total};${formatDuration(r.durationMs)}`)
      .join("\n");
    const blob = new Blob(["\uFEFF" + header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resultats_${tp.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (permissionError) {
    return (
      <div>
        <h3>Accès refusé par les règles Firebase</h3>
        <p style={{ color: "var(--muted)" }}>
          Votre compte n'est pas encore déclaré comme enseignant. Dans la console Firebase, ajoutez
          la valeur <code>true</code> sous <code>roles/teachers/{auth.currentUser?.uid || "VOTRE_UID"}</code>.
        </p>
        {auth.currentUser && (
          <p>
            Votre UID actuel : <code>{auth.currentUser.uid}</code>
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <h3>Résultats — {tp.label}</h3>

      <div className="stat-row">
        <div className="stat">
          <div className="value">
            {rows.length}/{EXPECTED_STUDENTS}
          </div>
          <div className="label">Ont terminé</div>
        </div>
        <div className="stat">
          <div className="value">{average}</div>
          <div className="label">Score moyen /{maxScore}</div>
        </div>
        <div className="stat">
          <div className="value">{best}</div>
          <div className="label">Meilleur score</div>
        </div>
        <div className="stat">
          <div className="value">{unfinished.length}</div>
          <div className="label">En cours / abandon</div>
        </div>
      </div>

      {loading ? (
        <p>Chargement…</p>
      ) : rows.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>Aucune réponse pour le moment.</p>
      ) : (
        <>
          <p className="note" style={{ textAlign: "left", marginTop: 0 }}>
            {RANK_TIEBREAK_BY_SPEED
              ? "Classement par score ; à score égal, le temps de réponse le plus court est mieux classé."
              : "Classement par score uniquement (les ex æquo partagent le même rang ; le temps est indicatif)."}
          </p>
          <table className="results">
            <thead>
              <tr>
                <th>Rang</th>
                <th>Étudiant</th>
                <th>Score</th>
                <th>Temps</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.studentId}>
                  <td>
                    <span className={"rank-badge" + (r.rank === 1 ? " top1" : "")}>{r.rank}</span>
                  </td>
                  <td>{r.studentName}</td>
                  <td>
                    {r.score}/{r.total}
                  </td>
                  <td>{formatDuration(r.durationMs)}</td>
                  <td>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "0.2rem 0.5rem", fontSize: "0.78rem" }}
                      onClick={() => resetStudent({ id: r.studentId, name: r.studentName, uid: r.uid })}
                    >
                      Réinitialiser
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="btn btn-outline" style={{ marginTop: "1.2rem" }} onClick={exportCsv}>
            ⬇️ Exporter en CSV
          </button>
        </>
      )}

      {unfinished.length > 0 && (
        <details style={{ marginTop: "1.4rem" }} open>
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>
            Tentatives démarrées, non terminées ({unfinished.length})
          </summary>
          <table className="results" style={{ marginTop: "0.6rem" }}>
            <tbody>
              {unfinished.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td style={{ color: "var(--amber)" }}>Non terminée</td>
                  <td>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "0.2rem 0.5rem", fontSize: "0.78rem" }}
                      onClick={() => resetStudent(u)}
                    >
                      Réinitialiser
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </div>
  );
}
