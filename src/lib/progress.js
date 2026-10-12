// Sauvegarde locale de la progression : permet de reprendre après un rechargement
// de page SANS gagner de temps (l'horloge de la question continue de tourner).

const key = (tpId, studentId) => `qcm:${tpId}:${studentId}`;

export function loadProgress(tpId, studentId) {
  try {
    const raw = localStorage.getItem(key(tpId, studentId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProgress(tpId, studentId, data) {
  try {
    localStorage.setItem(key(tpId, studentId), JSON.stringify(data));
  } catch {
    /* stockage indisponible : la reprise ne sera simplement pas possible */
  }
}

export function clearProgress(tpId, studentId) {
  try {
    localStorage.removeItem(key(tpId, studentId));
  } catch {
    /* ignore */
  }
}
