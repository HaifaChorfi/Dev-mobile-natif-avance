import { RANK_TIEBREAK_BY_SPEED } from "../data/tps.js";

// Classement par SCORE ; à score égal, la durée totale la plus courte est mieux classée
// (RANK_TIEBREAK_BY_SPEED = true dans data/tps.js). Seuls les étudiants ayant exactement
// le même score ET la même durée partagent un rang. Avec false : score seul (9, 8, 8, 6 -> 1, 2, 2, 4).

const dur = (x) => (Number.isFinite(x.durationMs) ? x.durationMs : Infinity);

// true si "a" est classé strictement devant "b"
export function isAhead(a, b) {
  if (a.score !== b.score) return a.score > b.score;
  return RANK_TIEBREAK_BY_SPEED ? dur(a) < dur(b) : false;
}

// true si a et b sont ex æquo
export const isTied = (a, b) => !isAhead(a, b) && !isAhead(b, a);

export function rankOf(me, all) {
  return 1 + all.filter((o) => isAhead(o, me)).length;
}

export function withRanks(rows) {
  const sorted = [...rows].sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    if (RANK_TIEBREAK_BY_SPEED && dur(a) !== dur(b)) return dur(a) < dur(b) ? -1 : 1;
    return String(a.studentName || "").localeCompare(String(b.studentName || ""), "fr");
  });
  return sorted.map((r) => ({ ...r, rank: rankOf(r, sorted) }));
}

export function formatDuration(ms) {
  if (!Number.isFinite(ms)) return "—";
  const total = Math.round(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
