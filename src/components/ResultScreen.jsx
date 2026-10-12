import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db, ensureAuth } from "../firebase.js";
import { rankOf, isTied, formatDuration } from "../lib/ranking.js";
import { RANK_TIEBREAK_BY_SPEED } from "../data/tps.js";

export default function ResultScreen({ tp, student, result, onRestart }) {
  const [rank, setRank] = useState(null);
  const [count, setCount] = useState(null);
  const [tied, setTied] = useState(0);

  useEffect(() => {
    let unsubscribe = () => {};
    ensureAuth().then(() => {
      unsubscribe = onValue(ref(db, `leaderboard/${tp.id}`), (snapshot) => {
        const entries = [];
        snapshot.forEach((child) => {
          entries.push(child.val());
        });
        const me = { score: result.score, durationMs: result.durationMs };
        setRank(rankOf(me, entries));
        setCount(entries.length);
        setTied(entries.filter((e) => isTied(e, me)).length - 1);
      });
    });
    return () => unsubscribe();
  }, [tp.id, result.score, result.durationMs]);

  const percent = Math.round((result.score / result.total) * 100);

  return (
    <div className="card">
      <h2 style={{ textAlign: "center" }}>Résultat — {tp.label.split(" — ")[0]}</h2>

      <div className="result-score">
        <div className="big">
          {result.score}/{result.total}
        </div>
        <div className="label">
          {percent}% de bonnes réponses · temps de réponse {formatDuration(result.durationMs)}
        </div>

        <div>
          {rank ? (
            <span className="rank-pill">
              🏅 Rang {rank} / {count} ({student.name})
            </span>
          ) : (
            <span className="rank-pill">Calcul du classement…</span>
          )}
        </div>
        {rank && tied > 0 && (
          <div className="label" style={{ marginTop: "0.5rem" }}>
            Ex æquo avec {tied} autre{tied > 1 ? "s" : ""} étudiant{tied > 1 ? "s" : ""} (
            {RANK_TIEBREAK_BY_SPEED
              ? "même score et même temps de réponse"
              : "classement par score, sans tenir compte de la rapidité"}
            ).
          </div>
        )}
      </div>

      <p className="note">
        À score égal, l'étudiant le plus rapide est mieux classé. Le rang évolue à mesure que les autres étudiants terminent le test. Le corrigé détaillé
        n'est pas affiché : votre enseignant le partagera en séance.
      </p>

      <div style={{ display: "flex", justifyContent: "center", marginTop: "1.4rem" }}>
        <button className="btn btn-outline" onClick={onRestart}>
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}
