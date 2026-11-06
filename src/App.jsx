import React, { useEffect, useMemo, useRef, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue, get, set, update } from "firebase/database";
import { zipSync, strToU8 } from "fflate";

const firebaseConfig = {
  apiKey: "AIzaSyCtK7G954PKqz2u8Hw9igz2ckRTA9J2O3I",
  authDomain: "kotlinqcm.firebaseapp.com",
  databaseURL: "https://kotlinqcm-default-rtdb.firebaseio.com",
  projectId: "kotlinqcm",
  storageBucket: "kotlinqcm.firebasestorage.app",
  messagingSenderId: "837004906865",
  appId: "1:837004906865:web:0b6404c4b1dee15ea3a6d0",
  measurementId: "G-NPKQTTH7GN"
};


const TEACHER_PASSCODE = "mobile2026"; 
const DUR = 30; 
const EXPECTED = 50; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let authPromise;
const ensureAuth = () =>
  (authPromise ||= new Promise((resolve, reject) => {
    const off = onAuthStateChanged(auth, (u) => {
      if (u) {
        off();
        resolve(u);
      } else signInAnonymously(auth).catch(reject);
    });
  }));

/* ═════════════ 2. CONTENU DES QCM ═════════════ */
const Q1 = [
  { q: "Quel type de données SharedPreferences permet-il de stocker ?", o: ["Des objets Kotlin quelconques", "Des paires clé-valeur de types simples (Int, String, Boolean, Float, Long, Set<String>)", "Des tables relationnelles", "Des fichiers binaires volumineux"], a: 1 },
  { q: "Quelle instruction ouvre un fichier de préférences nommé « config » accessible uniquement par l'application ?", o: ['getSharedPreferences("config", MODE_PRIVATE)', 'openFileOutput("config", MODE_PRIVATE)', 'getPreferences("config")', 'SharedPreferences.create("config")'], a: 0 },
  { q: "Quelle est la différence entre apply() et commit() ?", o: ["Aucune, ce sont des synonymes", "apply() est synchrone, commit() est asynchrone", "apply() écrit en mémoire puis sur disque en arrière-plan ; commit() écrit de façon synchrone et renvoie un booléen", "commit() ne fonctionne que sur le thread principal"], a: 2 },
  { q: "Où SharedPreferences enregistre-t-il physiquement les données ?", o: ["Dans un fichier XML du dossier shared_prefs de l'application", "Dans une base SQLite partagée du système", "Dans le cloud Google", "Sur la carte SD publique"], a: 0 },
  { q: 'Que renvoie prefs.getString("nom", "inconnu") si la clé « nom » n\'existe pas ?', o: ["null", "Une exception", '"inconnu"', "Une chaîne vide"], a: 2 },
  { q: "Quelle ligne enregistre correctement l'entier 10 sous la clé « score » ?", o: ['prefs.putInt("score", 10)', 'prefs.edit().putInt("score", 10)', 'prefs.save("score", 10)', 'prefs.edit().putInt("score", 10).apply()'], a: 3 },
  { q: "Quel mode de création rend le fichier illisible par les autres applications ?", o: ["MODE_WORLD_READABLE", "MODE_PRIVATE", "MODE_WORLD_WRITEABLE", "MODE_APPEND"], a: 1 },
  { q: "Quelle solution moderne Google recommande-t-il pour remplacer SharedPreferences ?", o: ["Jetpack DataStore", "Intent extras", "ContentProvider", "WorkManager"], a: 0 },
];

const Q2 = [
  { q: "Quelle classe Android facilite la création et la gestion des versions d'une base SQLite ?", o: ["SQLiteDatabase.Builder", "DatabaseManager", "SQLiteOpenHelper", "SQLiteConnection"], a: 2 },
  { q: "Quelle méthode de SQLiteOpenHelper est appelée à la toute première création de la base ?", o: ["onCreate(SQLiteDatabase db)", "onUpgrade()", "onOpen() uniquement", "getWritableDatabase()"], a: 0 },
  { q: "Quelle méthode de SQLiteDatabase insère une ligne et renvoie l'identifiant de la ligne créée ?", o: ["execSQL()", "insert()", "rawQuery()", "replaceAll()"], a: 1 },
  { q: "Après un rawQuery(), que faut-il appeler avant de lire la première ligne d'un Cursor ?", o: ["cursor.open()", "cursor.reset()", "cursor.start()", "cursor.moveToFirst()"], a: 3 },
  { q: "Comment éviter les injections SQL dans une requête ?", o: ["Concaténer les valeurs dans la chaîne SQL", "Utiliser des paramètres « ? » avec selectionArgs", "Mettre les valeurs en majuscules", "Ouvrir la base en lecture seule"], a: 1 },
  { q: "Quand onUpgrade() est-elle appelée ?", o: ["À chaque lancement de l'application", "À chaque insertion", "Quand le numéro de version passé au constructeur est supérieur à celui de la base existante", "Quand la base est fermée"], a: 2 },
  { q: "Quelle définition de clé primaire auto-incrémentée est correcte en SQLite ?", o: ["id INTEGER PRIMARY KEY AUTOINCREMENT", "id INT AUTO_INCREMENT", "id SERIAL PRIMARY KEY", "id UUID PRIMARY KEY"], a: 0 },
  { q: "À quoi sert la classe ContentValues lors d'une insertion ou d'une mise à jour ?", o: ["À lire les résultats d'une requête", "À créer la base de données", "À gérer les migrations de schéma", "À regrouper des paires colonne-valeur à écrire"], a: 3 },
  { q: "Que renvoie la méthode update() de SQLiteDatabase ?", o: ["L'identifiant de la dernière ligne", "Le nombre de lignes affectées", "Un Cursor", "Toujours true"], a: 1 },
  { q: "Que faut-il faire d'un Cursor une fois la lecture terminée ?", o: ["Le fermer avec close()", "Le réutiliser indéfiniment", "Le sérialiser dans SharedPreferences", "Rien, le ramasse-miettes s'en occupe toujours immédiatement"], a: 0 },
  { q: "Quel type de colonne utilise-t-on généralement dans SQLite pour stocker un booléen ?", o: ["BOOLEAN natif, comme dans MySQL", "BLOB", "INTEGER, avec les valeurs 0 et 1", "FLOAT, avec 0.0 et 1.0"], a: 2 },
  { q: "Où est stocké physiquement le fichier de la base SQLite d'une application Android ?", o: ["Sur la carte SD, dans Documents", "Dans le cloud Google, synchronisé automatiquement", "Dans le dossier res/ du projet", "Dans un dossier privé de l'application : data/data/<package>/databases/"], a: 3 },
];

const TP_LIST = [
  { id: "tp1", short: "QCM1", title: "SharedPreferences", description: "Préférences persistantes : lecture/écriture, apply() vs commit(), modes d'accès, DataStore.", enabled: true, questions: Q1 },
  { id: "tp2", short: "QCM2", title: "SQLite — base de données locale", description: "SQLiteOpenHelper, CRUD, Cursor, requêtes paramétrées, migration de schéma.", enabled: true, questions: Q2 },
  { id: "tp3", short: "QCM3", title: "Retrofit -- Web service HTTP ", description: "Échanges avec une API via HTTP ", enabled: false },
  { id: "tp4", short: "QCM4", title: "Géolocalisation", description: "Google Maps et localisation de l'utilisateur.", enabled: false },
  { id: "tp5", short: "QCM5", title: "Connectivité", description: "Bluetooth, Wi-Fi et USB.", enabled: false },
  { id: "tp8", short: "QCM8", title: "Multimédia", description: "Lecteur audio et vidéo.", enabled: false },
  { id: "tp9", short: "QCM9", title: "Capteurs", description: "Accéléromètre, proximité, caméra, boussole.", enabled: false },
  { id: "tp10", short: "QCM10", title: "Fragments", description: "Interfaces avancées avec Fragments.", enabled: false },
  { id: "tp11", short: "QCM11", title: "Publication Google Play", description: "Empaqueter, signer et publier une application.", enabled: false },
];
const getTp = (id) => TP_LIST.find((t) => t.id === id);

/* ═════════════ 3. UTILITAIRES ═════════════ */
const tokens = (s) =>
  s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim().split(" ").filter(Boolean);
const squeeze = (s) => s.trim().replace(/\s+/g, " ");
const titleCase = (s) =>
  squeeze(s).toLowerCase().replace(/(^|[\s'’-])(\p{L})/gu, (m, sep, l) => sep + l.toUpperCase());

// Même identifiant quelle que soit la casse, les accents ou l'ordre des mots.
function buildStudent(prenom, nom) {
  const p = tokens(prenom), n = tokens(nom);
  if (!p.length || !n.length || [...p, ...n].join("").length < 4) return null;
  const id = [...p, ...n].sort().join("-").slice(0, 100);
  const pr = titleCase(prenom), no = squeeze(nom).toUpperCase();
  return { id, prenom: pr, nom: no, name: `${pr} ${no}` };
}

const fmtDur = (ms) => {
  if (!Number.isFinite(ms)) return "—";
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
const pkey = (tpId, sid) => `qcm:${tpId}:${sid}`;
const loadP = (tpId, sid) => { try { return JSON.parse(localStorage.getItem(pkey(tpId, sid))); } catch { return null; } };
const saveP = (tpId, sid, v) => { try { localStorage.setItem(pkey(tpId, sid), JSON.stringify(v)); } catch {} };
const hasAnyProgress = (tpId) => {
  try {
    for (let i = 0; i < localStorage.length; i++) if (localStorage.key(i)?.startsWith(`qcm:${tpId}:`)) return true;
  } catch {}
  return false;
};

// Classement : score décroissant, puis temps croissant. Ex æquo = même rang.
function withRanks(list) {
  const s = [...list].sort((a, b) => b.score - a.score || (a.durationMs ?? 1e12) - (b.durationMs ?? 1e12) || (a.nom || "").localeCompare(b.nom || ""));
  let rank = 0, prev = null;
  return s.map((r, i) => {
    const key = `${r.score}|${Math.round((r.durationMs ?? 0) / 1000)}`;
    if (key !== prev) { rank = i + 1; prev = key; }
    return { ...r, rank };
  });
}

function computeStats(responses, attempts, total) {
  const done = Object.values(responses || {});
  const doneIds = new Set(Object.keys(responses || {}));
  const all = Object.entries(attempts || {}).map(([id, a]) => ({ id, ...a }));
  const unfinished = all.filter((a) => !doneIds.has(a.id));
  const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
  const scores = done.map((r) => r.score);
  const times = done.map((r) => r.durationMs).filter(Number.isFinite);
  return {
    registered: Math.max(all.length, done.length),
    waiting: unfinished.filter((a) => !a.startedAt).length,
    inProgress: unfinished.filter((a) => a.startedAt).length,
    finished: done.length,
    avgScore: avg(scores),
    bestScore: scores.length ? Math.max(...scores) : null,
    worstScore: scores.length ? Math.min(...scores) : null,
    avgTime: avg(times),
    bestTime: times.length ? Math.min(...times) : null,
    passRate: done.length ? done.filter((r) => r.score * 2 >= r.total).length / done.length : null,
    histogram: Array.from({ length: total + 1 }, (_, i) => done.filter((r) => r.score === i).length),
    unfinished,
  };
}

/* ── Export Excel (.xlsx) : archive ZIP de fichiers XML, générée dans le navigateur ── */
const NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const clean = (s) => String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
const esc = (s) => clean(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const colName = (i) => { let n = i + 1, s = ""; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
const cell = (r, v, st) => {
  if (v === null || v === undefined || v === "") return "";
  const s = st ? ` s="${st}"` : "";
  return typeof v === "number" && Number.isFinite(v)
    ? `<c r="${r}"${s}><v>${v}</v></c>`
    : `<c r="${r}"${s} t="inlineStr"><is><t xml:space="preserve">${esc(v)}</t></is></c>`;
};
const sheetXml = (sh, sel) =>
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="${NS}"><sheetViews><sheetView workbookViewId="0"${sel ? ' tabSelected="1"' : ""}><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${sh.columns.map((c, i) => `<col min="${i + 1}" max="${i + 1}" width="${c.width || 14}" customWidth="1"/>`).join("")}</cols><sheetData><row r="1">${sh.columns.map((c, i) => cell(`${colName(i)}1`, c.header, 1)).join("")}</row>${sh.rows.map((row, r) => `<row r="${r + 2}">${row.map((v, i) => cell(`${colName(i)}${r + 2}`, v, 0)).join("")}</row>`).join("")}</sheetData></worksheet>`;
const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="${NS}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1B5E20"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
function downloadXlsx(filename, sheets) {
  const f = {};
  f["[Content_Types].xml"] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`);
  f["_rels/.rels"] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${REL}/officeDocument" Target="xl/workbook.xml"/></Relationships>`);
  f["xl/workbook.xml"] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="${NS}" xmlns:r="${REL}"><sheets>${sheets.map((s, i) => `<sheet name="${esc(clean(s.name).replace(/[\\/?*[\]:]/g, " ").slice(0, 31))}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets></workbook>`);
  f["xl/_rels/workbook.xml.rels"] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="${REL}/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")}<Relationship Id="rId${sheets.length + 1}" Type="${REL}/styles" Target="styles.xml"/></Relationships>`);
  f["xl/styles.xml"] = strToU8(STYLES);
  sheets.forEach((s, i) => (f[`xl/worksheets/sheet${i + 1}.xml`] = strToU8(sheetXml(s, i === 0))));
  const blob = new Blob([zipSync(f, { level: 6 })], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ═════════════ 4. APPLICATION ═════════════ */
export default function App() {
  const [view, setView] = useState("home");
  const [tpId, setTpId] = useState(null);
  const [student, setStudent] = useState(null);
  const tp = tpId ? getTp(tpId) : null;
  const home = () => { setTpId(null); setStudent(null); setView("home"); };

  return (
    <div className="shell">
      <style>{CSS}</style>
      <header className="top">
        <span className="logo">📱</span>
        <div>
          <div className="t1">Développement Mobile Natif Avancé</div>
          <div className="t2">QCM interactifs</div>
        </div>
      </header>
      <main className="main">
        {view === "home" && <Home onSelect={(id) => { setTpId(id); setView("register"); }} onTeacher={() => setView("tlogin")} />}
        {view === "register" && tp && <Register tp={tp} onBack={home} onNext={(s, phase) => { setStudent(s); setView(phase); }} />}
        {view === "waiting" && tp && student && <Waiting tp={tp} student={student} onBack={home} onStart={() => setView("quiz")} />}
        {view === "quiz" && tp && student && <Quiz tp={tp} student={student} onDone={() => setView("result")} />}
        {view === "result" && tp && student && <Result tp={tp} student={student} onHome={home} />}
        {view === "tlogin" && <TeacherLogin onBack={home} onOk={() => setView("teacher")} />}
        {view === "teacher" && <Teacher onLogout={home} />}
      </main>
    </div>
  );
}

/* ── Accueil : tous les QCM sur une même page ── */
const STATUS = {
  waiting: { text: "Inscriptions ouvertes", cls: "b-wait", hint: "En attente de l'ouverture par l'enseignant" },
  open: { text: "Session ouverte", cls: "b-open", hint: "Vous pouvez vous inscrire et démarrer" },
  closed: { text: "Session clôturée", cls: "b-closed", hint: "Ce QCM n'accepte plus de participants" },
};

function Home({ onSelect, onTeacher }) {
  const [sessions, setSessions] = useState({});
  const [err, setErr] = useState("");
  useEffect(() => {
    let off = () => {};
    ensureAuth().then(() => { off = onValue(ref(db, "sessions"), (s) => setSessions(s.val() || {})); }).catch(() => setErr("Connexion impossible. Vérifiez votre réseau puis rechargez la page."));
    return () => off();
  }, []);
  return (
    <div className="wide">
      <h2>Choisissez votre QCM</h2>
      <p className="muted">Une seule tentative par QCM. {DUR} secondes par question, sans retour en arrière.</p>
      {err && <p className="err">{err}</p>}
      <div className="grid">
        {TP_LIST.map((tp) => {
          const status = sessions[tp.id]?.status || "waiting";
          const resumable = tp.enabled && hasAnyProgress(tp.id);
          const closedForMe = tp.enabled && status === "closed" && !resumable;
          const ok = tp.enabled && !closedForMe;
          const st = STATUS[status];
          return (
            <div key={tp.id} className={"qcm" + (ok ? "" : " locked")}>
              <div className="qtop">
                <span className="short">{tp.short}</span>
                {tp.enabled ? <span className={"badge " + st.cls}>{st.text}</span> : <span className="badge b-soon">Bientôt</span>}
              </div>
              <h3>{tp.title}</h3>
              <p className="desc">{tp.description}</p>
              {tp.enabled && <p className="meta">{tp.questions.length} questions · {Math.round((tp.questions.length * DUR) / 60 * 10) / 10} min</p>}
              {tp.enabled && <p className="hint">{resumable ? "Une tentative est en cours sur cet appareil" : st.hint}</p>}
              <button className={"btn " + (ok ? "pri" : "out")} disabled={!ok} onClick={() => onSelect(tp.id)}>
                {!tp.enabled ? "Indisponible" : closedForMe ? "Clôturé" : resumable ? "Reprendre" : "Choisir ce QCM"}
              </button>
            </div>
          );
        })}
      </div>
      <p className="center"><button className="btn ghost" onClick={onTeacher}>🧑‍🏫 Espace enseignant</button></p>
    </div>
  );
}

/* ── Inscription : prénom + nom ── */
function Register({ tp, onBack, onNext }) {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const s = buildStudent(prenom, nom);
    if (!s) return setErr("Saisissez votre prénom ET votre nom.");
    setBusy(true); setErr("");
    try {
      const user = await ensureAuth();
      // Reprise sur ce même appareil (rechargement de la page)
      const saved = loadP(tp.id, s.id);
      if (saved && saved.uid === user.uid) {
        return onNext(s, saved.phase === "done" ? "result" : saved.phase === "quiz" ? "quiz" : "waiting");
      }
      // Verrou « nom » : écriture unique imposée par les règles Firebase
      try {
        await set(ref(db, `attempts/${tp.id}/${s.id}`), { uid: user.uid, name: s.name, prenom: s.prenom, nom: s.nom, registeredAt: Date.now() });
      } catch {
        return setErr("Inscription refusée : ce nom est déjà inscrit à ce QCM, cet appareil a déjà passé ce QCM, ou la session est clôturée. Prévenez l'enseignant en cas d'erreur.");
      }
      // Verrou « appareil » : empêche de repasser le QCM sous une autre orthographe
      try { await set(ref(db, `uidLocks/${tp.id}/${user.uid}`), s.id); } catch {}
      saveP(tp.id, s.id, { uid: user.uid, phase: "waiting", student: s });
      onNext(s, "waiting");
    } catch (e2) {
      console.error(e2);
      setErr("Connexion impossible. Vérifiez votre réseau et réessayez.");
    } finally { setBusy(false); }
  }

  return (
    <div className="card">
      <p className="short">{tp.short}</p>
      <h2>{tp.title}</h2>
      <p className="muted">{tp.questions.length} questions · {DUR} secondes par question · une seule tentative.</p>
      <form onSubmit={submit} style={{ marginTop: "1.2rem" }}>
        <label htmlFor="prenom">Prénom</label>
        <input id="prenom" autoComplete="off" value={prenom} onChange={(e) => { setPrenom(e.target.value); setErr(""); }} />
        <label htmlFor="nom">Nom</label>
        <input id="nom" autoComplete="off" value={nom} onChange={(e) => { setNom(e.target.value); setErr(""); }} />
        <p className="note">Écrivez votre nom exactement comme sur la liste de la classe.</p>
        {err && <p className="err">{err}</p>}
        <div className="row">
          <button type="button" className="btn ghost" onClick={onBack}>← Les QCM</button>
          <button type="submit" className="btn pri" disabled={busy}>{busy ? "Inscription…" : "Je m'inscris"}</button>
        </div>
      </form>
    </div>
  );
}

/* ── Salle d'attente : l'enseignant active la session ── */
function Waiting({ tp, student, onBack, onStart }) {
  const [status, setStatus] = useState("waiting");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => {
    let off = () => {};
    ensureAuth().then(() => { off = onValue(ref(db, `sessions/${tp.id}/status`), (s) => setStatus(s.val() || "waiting")); });
    return () => off();
  }, [tp.id]);

  async function start() {
    setBusy(true); setErr("");
    try {
      const user = await ensureAuth();
      const t = Date.now();
      await set(ref(db, `attempts/${tp.id}/${student.id}/startedAt`), t); // refusé si session non ouverte ou déjà démarré
      saveP(tp.id, student.id, { uid: user.uid, phase: "quiz", student, index: 0, qStart: t, startedAt: t, answers: [] });
      onStart();
    } catch (e) {
      console.error(e);
      setErr("Démarrage refusé : la session n'est pas (ou plus) ouverte, ou ce QCM a déjà été démarré. Prévenez l'enseignant si besoin.");
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <p className="short">{tp.short}</p>
      <h2>{tp.title}</h2>
      <p>Inscrit(e) : <strong>{student.name}</strong></p>
      <ul className="rules">
        <li>{tp.questions.length} questions, {DUR} secondes chacune (limite stricte : passage automatique à 0 s)</li>
        <li>Pas de retour en arrière, aucune correction pendant le quiz</li>
        <li>Une seule tentative : ne fermez pas la page</li>
        <li>À score égal, le temps de réponse le plus court est mieux classé</li>
      </ul>
      {status === "open" ? (
        <>
          <p className="banner ok">✅ La session est ouverte. Le chrono démarre dès que vous cliquez.</p>
          <button className="btn pri" onClick={start} disabled={busy}>{busy ? "Démarrage…" : "Démarrer le QCM"}</button>
        </>
      ) : status === "closed" ? (
        <p className="banner ko">⛔ La session est clôturée : il n'est plus possible de démarrer.</p>
      ) : (
        <p className="banner"><span className="pulse" /> En attente : l'enseignant n'a pas encore ouvert la session. Cette page se met à jour automatiquement.</p>
      )}
      {err && <p className="err">{err}</p>}
      <div style={{ marginTop: "1rem" }}><button className="btn ghost" onClick={onBack} disabled={busy}>← Les QCM</button></div>
    </div>
  );
}

/* ── Quiz : 30 s par question, limite stricte, résistant au rechargement ── */
function Quiz({ tp, student, onDone }) {
  const N = tp.questions.length;
  const [p, setP] = useState(() => {
    const saved = loadP(tp.id, student.id) || {};
    // Si la page a été fermée, les questions dont le temps est écoulé sont comptées fausses.
    let { index = 0, qStart = Date.now(), answers = [] } = saved;
    answers = [...answers];
    while (index < N && Date.now() - qStart >= DUR * 1000) { answers[index] = -1; qStart += DUR * 1000; index++; }
    return { ...saved, index, qStart, answers };
  });
  const [left, setLeft] = useState(DUR);
  const [err, setErr] = useState("");
  const lock = useRef(-1);
  const finished = useRef(false);

  async function finish(np) {
    setErr("");
    try {
      const user = await ensureAuth();
      const score = tp.questions.reduce((n, q, i) => n + (np.answers[i] === q.a ? 1 : 0), 0);
      const now = Date.now();
      const durationMs = Math.min(now - np.startedAt, N * DUR * 1000);
      await set(ref(db, `responses/${tp.id}/${student.id}`), {
        studentId: student.id, studentName: student.name, prenom: student.prenom, nom: student.nom,
        uid: user.uid, score, total: N, durationMs, submittedAt: now, answers: np.answers,
      });
      saveP(tp.id, student.id, { ...np, phase: "done", score, durationMs });
      onDone();
    } catch (e) {
      console.error(e);
      finished.current = false;
      setErr("Vos réponses n'ont pas pu être envoyées. Vérifiez le réseau puis réessayez.");
    }
  }

  function answer(choice, timedOut) {
    if (lock.current === p.index) return;
    lock.current = p.index;
    const answers = [...p.answers];
    answers[p.index] = choice;
    const np = { ...p, answers, index: p.index + 1, qStart: timedOut ? p.qStart + DUR * 1000 : Date.now(), phase: "quiz" };
    saveP(tp.id, student.id, np);
    setP(np);
    setLeft(DUR);
    if (np.index >= N) { finished.current = true; finish(np); }
  }

  useEffect(() => {
    if (p.index >= N) { if (!finished.current) { finished.current = true; finish(p); } return; }
    const t = setInterval(() => {
      const rest = DUR - (Date.now() - p.qStart) / 1000;
      setLeft(Math.max(0, rest));
      if (rest <= 0) answer(-1, true);
    }, 200);
    return () => clearInterval(t);
  }, [p.index, p.qStart]);

  if (p.index >= N)
    return (
      <div className="card center">
        <h2>Envoi de vos réponses…</h2>
        {err && (<><p className="err">{err}</p><button className="btn pri" onClick={() => { finished.current = true; finish(p); }}>Réessayer</button></>)}
      </div>
    );

  const q = tp.questions[p.index];
  const urgent = left <= 10;
  return (
    <div className="card">
      <div className="bar"><div className={"fill" + (urgent ? " urg" : "")} style={{ width: (left / DUR) * 100 + "%" }} /></div>
      <div className="qhead">
        <span>{tp.short} · Question {p.index + 1} / {N}</span>
        <span className={"clock" + (urgent ? " urg" : "")} role="timer">{Math.ceil(left)} s</span>
      </div>
      <h2 className="qtext">{q.q}</h2>
      <div className="opts">
        {q.o.map((o, k) => (
          <button key={k} className="opt" onClick={() => answer(k, false)}><b>{String.fromCharCode(65 + k)}</b><span>{o}</span></button>
        ))}
      </div>
      <p className="note">Un clic valide immédiatement la réponse. À 0 s, la question est comptée fausse.</p>
    </div>
  );
}

/* ── Résultat de l'étudiant ── */
function Result({ tp, student, onHome }) {
  const [r] = useState(() => loadP(tp.id, student.id));
  const N = tp.questions.length;
  return (
    <div className="card center">
      <p className="short">Résultat — {tp.short}</p>
      <h2>Merci, {student.prenom} !</h2>
      <p className="big">{r?.score ?? "—"}<span> / {N}</span></p>
      <p className="muted">Temps total : {fmtDur(r?.durationMs)}</p>
      <div className="dots">
        {tp.questions.map((q, i) => {
          const a = r?.answers?.[i];
          return <span key={i} className={"dot " + (a === q.a ? "g" : "r")} title={`Question ${i + 1}`}>{i + 1}</span>;
        })}
      </div>
      <p className="note">Vert : bonne réponse · Rouge : mauvaise réponse ou temps écoulé. Les corrections seront données en classe.</p>
      <button className="btn pri" onClick={onHome}>Retour aux QCM</button>
    </div>
  );
}

/* ═════════════ 5. ESPACE ENSEIGNANT ═════════════ */
function TeacherLogin({ onBack, onOk }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const go = (e) => { e.preventDefault(); pin === TEACHER_PASSCODE ? onOk() : setErr("Code incorrect."); };
  return (
    <div className="card">
      <h2>Espace enseignant</h2>
      <form onSubmit={go} style={{ marginTop: "1rem" }}>
        <label htmlFor="pin">Code d'accès</label>
        <input id="pin" type="password" value={pin} onChange={(e) => { setPin(e.target.value); setErr(""); }} />
        {err && <p className="err">{err}</p>}
        <div className="row">
          <button type="button" className="btn ghost" onClick={onBack}>← Retour</button>
          <button type="submit" className="btn pri">Entrer</button>
        </div>
      </form>
    </div>
  );
}

function Teacher({ onLogout }) {
  const [active, setActive] = useState("tp1");
  return (
    <div className="dash">
      <nav className="side">
        {TP_LIST.map((tp) => (
          <button key={tp.id} disabled={!tp.enabled} className={"tpi" + (tp.id === active ? " act" : "")} onClick={() => setActive(tp.id)}>
            {tp.short} — {tp.title}{!tp.enabled && " 🔒"}
          </button>
        ))}
      </nav>
      <div className="dcontent">
        <div className="between">
          <span className="muted">Tableau de bord enseignant</span>
          <button className="btn ghost" onClick={onLogout}>Se déconnecter</button>
        </div>
        <Admin key={active} tp={getTp(active)} />
      </div>
    </div>
  );
}

const SESSION_STATES = [
  { id: "waiting", label: "⏸ Mettre en attente", name: "En attente", help: "Les étudiants peuvent s'inscrire, mais pas démarrer." },
  { id: "open", label: "▶ Ouvrir la session", name: "Ouverte", help: "Les étudiants inscrits peuvent démarrer le QCM." },
  { id: "closed", label: "■ Clôturer", name: "Clôturée", help: "Plus d'inscription ni de démarrage. Les quiz déjà démarrés peuvent se terminer." },
];

function Admin({ tp }) {
  const [responses, setResponses] = useState({});
  const [attempts, setAttempts] = useState({});
  const [status, setStatus] = useState("waiting");
  const [denied, setDenied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uid, setUid] = useState("");

  useEffect(() => {
    let offs = [];
    ensureAuth().then((u) => {
      setUid(u.uid);
      const bad = (e) => { console.error(e); setDenied(true); setLoading(false); };
      offs = [
        onValue(ref(db, `responses/${tp.id}`), (s) => { setResponses(s.val() || {}); setLoading(false); }, bad),
        onValue(ref(db, `attempts/${tp.id}`), (s) => setAttempts(s.val() || {}), bad),
        onValue(ref(db, `sessions/${tp.id}/status`), (s) => setStatus(s.val() || "waiting"), bad),
      ];
    });
    return () => offs.forEach((o) => o());
  }, [tp.id]);

  const total = tp.questions.length;
  const stats = useMemo(() => computeStats(responses, attempts, total), [responses, attempts, total]);
  const ranked = useMemo(() => withRanks(Object.values(responses)), [responses]);
  const maxBar = Math.max(1, ...stats.histogram);
  const stName = SESSION_STATES.find((s) => s.id === status);

  async function changeStatus(next) {
    if (next === status || busy) return;
    if (next === "closed" && !window.confirm("Clôturer la session ? Plus personne ne pourra s'inscrire ni démarrer.")) return;
    setBusy(true);
    try { await set(ref(db, `sessions/${tp.id}`), { status: next, updatedAt: Date.now() }); }
    catch (e) { console.error(e); window.alert("Impossible de modifier la session (droits enseignant requis)."); }
    setBusy(false);
  }

  async function resetStudent({ id, name, uid: u }) {
    if (!window.confirm(`Réinitialiser ${name} ? Son inscription et son résultat seront supprimés : il pourra repasser le QCM.`)) return;
    const up = { [`attempts/${tp.id}/${id}`]: null, [`responses/${tp.id}/${id}`]: null };
    const lock = u || responses[id]?.uid || attempts[id]?.uid;
    if (lock) up[`uidLocks/${tp.id}/${lock}`] = null;
    await update(ref(db), up);
  }

  function exportExcel() {
    const classement = {
      name: "Classement",
      columns: [
        { header: "Rang", width: 8 }, { header: "Nom", width: 24 }, { header: "Prénom", width: 20 },
        { header: "Score", width: 9 }, { header: "Total", width: 9 }, { header: "Pourcentage (%)", width: 16 },
        { header: "Temps (mm:ss)", width: 15 }, { header: "Temps (secondes)", width: 17 }, { header: "Statut", width: 24 },
      ],
      rows: [
        ...ranked.map((r) => [r.rank, r.nom, r.prenom, r.score, r.total, Math.round((r.score / r.total) * 1000) / 10, fmtDur(r.durationMs), Number.isFinite(r.durationMs) ? Math.round(r.durationMs / 1000) : null, "Terminé"]),
        ...stats.unfinished.map((u) => [null, u.nom || u.name || "", u.prenom || "", null, null, null, null, null, u.startedAt ? "En cours / abandon" : "Inscrit, non démarré"]),
      ],
    };
    const resume = {
      name: "Statistiques",
      columns: [{ header: "Indicateur", width: 36 }, { header: "Valeur", width: 24 }],
      rows: [
        ["QCM", `${tp.short} — ${tp.title}`], ["Date d'export", new Date().toLocaleString("fr-FR")], ["Statut de la session", stName.name],
        ["Nombre de questions", total], ["Étudiants inscrits", stats.registered], ["Inscrits, non démarrés", stats.waiting],
        ["En cours / abandons", stats.inProgress], ["Étudiants ayant terminé", stats.finished],
        ["Score moyen", stats.avgScore === null ? "" : Math.round(stats.avgScore * 100) / 100], ["Meilleur score", stats.bestScore ?? ""],
        ["Score le plus bas", stats.worstScore ?? ""], ["Taux de réussite (≥ 50 %)", stats.passRate === null ? "" : `${Math.round(stats.passRate * 100)} %`],
        ["Temps moyen (mm:ss)", stats.avgTime === null ? "" : fmtDur(stats.avgTime)], ["Meilleur temps (mm:ss)", stats.bestTime === null ? "" : fmtDur(stats.bestTime)],
      ],
    };
    downloadXlsx(`resultats_${tp.short.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.xlsx`, [classement, resume]);
  }

  if (denied)
    return (
      <div>
        <h3>Accès refusé par les règles Firebase</h3>
        <p className="muted">Votre compte n'est pas encore déclaré comme enseignant. Dans la console Firebase (Realtime Database → Données), ajoutez la valeur <code>true</code> sous <code>roles/teachers/{uid || "VOTRE_UID"}</code>.</p>
        {uid && <p>Votre UID : <code>{uid}</code></p>}
      </div>
    );

  const nothing = ranked.length + stats.unfinished.length === 0;
  return (
    <div>
      <h3>{tp.short} — {tp.title}</h3>

      <div className="session">
        <div className="between">
          <strong>Session du QCM</strong>
          <span className={"badge " + (status === "open" ? "b-open" : status === "closed" ? "b-closed" : "b-wait")}>{stName.name}</span>
        </div>
        <div className="seg">
          {SESSION_STATES.map((s) => (
            <button key={s.id} disabled={busy} className={"segb" + (status === s.id ? " act" : "") + (s.id === "open" ? " isopen" : "")} onClick={() => changeStatus(s.id)}>{s.label}</button>
          ))}
        </div>
        <p className="note left">{stName.help}</p>
      </div>

      <div className="stats">
        <Stat v={stats.registered} l={`Inscrits (sur ${EXPECTED} attendus)`} />
        <Stat v={stats.waiting} l="Inscrits, pas démarré" />
        <Stat v={stats.inProgress} l="En cours / abandon" />
        <Stat v={stats.finished} l="Ont terminé" strong />
        <Stat v={stats.avgScore === null ? "—" : stats.avgScore.toFixed(1)} l={`Score moyen /${total}`} />
        <Stat v={stats.bestScore ?? "—"} l="Meilleur score" />
        <Stat v={stats.passRate === null ? "—" : `${Math.round(stats.passRate * 100)} %`} l="Réussite (≥ 50 %)" />
        <Stat v={stats.avgTime === null ? "—" : fmtDur(stats.avgTime)} l="Temps moyen" />
        <Stat v={stats.bestTime === null ? "—" : fmtDur(stats.bestTime)} l="Meilleur temps" />
      </div>

      {stats.finished > 0 && (
        <div className="hist">
          <div className="htitle">Répartition des scores</div>
          <div className="hbars">
            {stats.histogram.map((c, s) => (
              <div key={s} className="hcol" title={`${c} étudiant(s) avec ${s}/${total}`}>
                <span className="hcount">{c || ""}</span>
                <div className="hbar" style={{ height: `${(c / maxBar) * 100}%` }} />
                <span className="hlabel">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="between" style={{ margin: "1.4rem 0 .4rem" }}>
        <h3 style={{ margin: 0 }}>Classement</h3>
        <button className="btn pri" onClick={exportExcel} disabled={nothing}>⬇️ Télécharger en Excel (.xlsx)</button>
      </div>
      <p className="note left" style={{ marginTop: 0 }}>Trié par score décroissant puis par temps de réponse le plus court.</p>

      {loading ? <p>Chargement…</p> : nothing ? <p className="muted">Aucun étudiant inscrit pour le moment.</p> : (
        <div className="tw">
          <table>
            <thead><tr><th>Rang</th><th>Nom</th><th>Prénom</th><th>Score</th><th>Temps</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {ranked.map((r) => (
                <tr key={r.studentId}>
                  <td><span className={"rk" + (r.rank === 1 ? " top" : "")}>{r.rank}</span></td>
                  <td>{r.nom}</td><td>{r.prenom}</td>
                  <td><strong>{r.score}</strong>/{r.total}</td>
                  <td>{fmtDur(r.durationMs)}</td><td>Terminé</td>
                  <td><button className="btn ghost sm" onClick={() => resetStudent({ id: r.studentId, name: `${r.prenom} ${r.nom}`, uid: r.uid })}>Réinitialiser</button></td>
                </tr>
              ))}
              {stats.unfinished.map((u) => (
                <tr key={u.id} className="mut">
                  <td>—</td><td>{u.nom || u.name}</td><td>{u.prenom || ""}</td><td>—</td><td>—</td>
                  <td style={{ color: "#a86400" }}>{u.startedAt ? "En cours / abandon" : "Inscrit, non démarré"}</td>
                  <td><button className="btn ghost sm" onClick={() => resetStudent({ id: u.id, name: `${u.prenom || ""} ${u.nom || u.name}`.trim(), uid: u.uid })}>Réinitialiser</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const Stat = ({ v, l, strong }) => (
  <div className={"stat" + (strong ? " strong" : "")}><div className="val">{v}</div><div className="lab">{l}</div></div>
);

/* ═════════════ 6. STYLES ═════════════ */
const CSS = `
:root{--g9:#124a1a;--g7:#1b5e20;--g5:#43a047;--g1:#e6f4e7;--bg:#f1f4ef;--card:#fff;--line:#dde3d9;--ink:#14231a;--mut:#5d6b60;--red:#c0392b;--amb:#e59a00}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.shell{min-height:100vh;display:flex;flex-direction:column}
.top{display:flex;gap:12px;align-items:center;padding:14px 24px;background:var(--g7);color:#fff}
.logo{font-size:26px}.t1{font-weight:700}.t2{font-size:13px;opacity:.8}
.main{flex:1;display:flex;flex-direction:column;align-items:center;padding:28px 16px 60px;gap:1.4rem}
.wide{width:100%;max-width:1000px}
.card{width:100%;max-width:660px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:1.6rem;box-shadow:0 2px 10px rgba(0,0,0,.05)}
h2{margin:.2rem 0 .3rem;font-size:1.5rem}h3{margin:.2rem 0;font-size:1.1rem}
.muted{color:var(--mut)}.center{text-align:center}.err{color:var(--red);font-size:.88rem}
.note{color:var(--mut);font-size:.82rem}.note.left{text-align:left;margin:.5rem 0 0}
.between{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.row{display:flex;gap:.6rem;margin-top:.5rem}
label{display:block;font-weight:600;font-size:.88rem;margin:.9rem 0 .3rem}
input{width:100%;font:inherit;padding:.65rem .75rem;border:1px solid var(--line);border-radius:9px}
input:focus,button:focus-visible{outline:3px solid #f3c969;outline-offset:1px}
.btn{font:600 .92rem system-ui;padding:.65rem 1.1rem;border-radius:9px;border:1px solid transparent;cursor:pointer}
.btn.pri{background:var(--g7);color:#fff}.btn.pri:hover:not(:disabled){background:var(--g9)}
.btn.out{background:#fff;border-color:var(--line);color:var(--mut)}
.btn.ghost{background:transparent;border-color:var(--line);color:var(--ink)}
.btn.sm{padding:.2rem .55rem;font-size:.78rem}
.btn:disabled{opacity:.55;cursor:not-allowed}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;margin:1.3rem 0}
.qcm{display:flex;flex-direction:column;gap:.3rem;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:1.2rem;box-shadow:0 2px 10px rgba(0,0,0,.05)}
.qcm.locked{background:#f4f5f1;box-shadow:none}
.qcm .btn{margin-top:auto}
.qtop{display:flex;justify-content:space-between;align-items:center}
.short{font-weight:700;font-size:.78rem;letter-spacing:.08em;color:var(--g7);margin:0 0 .2rem}
.desc{color:var(--mut);font-size:.88rem;margin:0}.meta{font-size:.82rem;font-weight:600;margin:.3rem 0 0}
.hint{font-size:.8rem;color:var(--mut);margin:0 0 .6rem}
.badge{display:inline-block;font-size:.72rem;font-weight:700;padding:.18rem .6rem;border-radius:999px}
.b-open{background:#d7f0da;color:#11501a}.b-wait{background:#fdebc8;color:#8a5200}.b-closed{background:#f3d9d5;color:var(--red)}.b-soon{background:#e6e8e3;color:var(--mut)}
.rules{color:var(--mut);font-size:.9rem;line-height:1.7;padding-left:1.2rem;margin:1rem 0}
.banner{background:#fff6e5;border:1px solid #f0d9a8;border-radius:10px;padding:.8rem 1rem;font-size:.92rem;margin:0 0 1rem}
.banner.ok{background:#e8f5e9;border-color:#b9dcbd}.banner.ko{background:#fbeae7;border-color:#efc4bd}
.pulse{display:inline-block;width:9px;height:9px;border-radius:50%;background:var(--amb);margin-right:.4rem;animation:pl 1.4s infinite}
@keyframes pl{50%{opacity:.25}}
.bar{height:12px;background:var(--line);border-radius:6px;overflow:hidden}
.fill{height:100%;background:var(--g5);transition:width .2s linear}.fill.urg{background:var(--amb)}
.qhead{display:flex;justify-content:space-between;align-items:center;margin:.8rem 0 .2rem;color:var(--mut);font-weight:600;font-size:.9rem}
.clock{font:700 2rem ui-monospace,Menlo,Consolas,monospace;color:var(--ink)}.clock.urg{color:var(--red)}
.qtext{font-size:1.25rem;line-height:1.35;margin:.6rem 0 1.1rem}
.opts{display:grid;gap:.7rem}
.opt{display:flex;gap:.8rem;align-items:center;text-align:left;background:#fff;border:2px solid var(--line);border-radius:11px;padding:.85rem;font:500 1rem system-ui;cursor:pointer}
.opt b{display:grid;place-items:center;min-width:30px;height:30px;border-radius:50%;background:var(--g1);color:var(--g7)}
.opt:hover{border-color:var(--g5)}.opt:active{background:var(--g1)}
.big{font:800 4rem/1 system-ui;margin:.6rem 0}.big span{font-size:1.5rem;color:var(--mut)}
.dots{display:flex;gap:.4rem;justify-content:center;flex-wrap:wrap;margin:1rem 0}
.dot{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-weight:700;font-size:.85rem;color:#fff}
.dot.g{background:var(--g5)}.dot.r{background:var(--red)}
.dash{width:100%;max-width:1100px;display:grid;grid-template-columns:230px 1fr;gap:1.2rem;align-items:start}
@media(max-width:820px){.dash{grid-template-columns:1fr}}
.side{display:flex;flex-direction:column;gap:.35rem;background:#fff;border:1px solid var(--line);border-radius:14px;padding:.6rem}
.tpi{text-align:left;border:0;background:none;padding:.55rem .7rem;border-radius:8px;font:600 .85rem system-ui;cursor:pointer}
.tpi.act{background:var(--g1);color:var(--g9)}.tpi:disabled{color:#9aa59c;cursor:not-allowed}
.dcontent{background:#fff;border:1px solid var(--line);border-radius:14px;padding:1.3rem;min-width:0}
.session{border:1px solid var(--line);border-radius:12px;padding:1rem 1.2rem;margin:.8rem 0 1rem;background:#fbfdfb}
.seg{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.6rem}
.segb{flex:1;min-width:140px;padding:.6rem .8rem;border-radius:9px;border:1.5px solid var(--line);background:#fff;font:600 .88rem system-ui;cursor:pointer}
.segb.act{background:var(--g1);border-color:var(--g7);color:var(--g9)}.segb.isopen.act{background:var(--g7);color:#fff}
.segb:disabled{opacity:.6;cursor:wait}
.stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.7rem;margin:1rem 0}
.stat{background:#f6f8f4;border:1px solid var(--line);border-radius:11px;padding:.8rem}
.stat .val{font-size:1.7rem;font-weight:800;line-height:1.1}.stat .lab{font-size:.76rem;color:var(--mut)}
.stat.strong{background:var(--g7)}.stat.strong .val,.stat.strong .lab{color:#fff}
.hist{margin-top:.6rem}.htitle{font-size:.8rem;color:var(--mut);font-weight:600;margin-bottom:.3rem}
.hbars{display:flex;align-items:flex-end;gap:6px;height:110px}
.hcol{flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;min-width:0}
.hbar{width:100%;background:var(--g5);border-radius:4px 4px 0 0;min-height:2px}
.hcount{font-size:.72rem;font-weight:700;color:var(--g9)}.hlabel{font-size:.72rem;color:var(--mut);margin-top:2px}
.tw{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:.92rem}
th,td{text-align:left;padding:.5rem .55rem;border-bottom:1px solid var(--line);white-space:nowrap}
th{color:var(--mut);font-size:.8rem}tr.mut td{color:var(--mut)}
.rk{display:inline-grid;place-items:center;min-width:28px;height:28px;border-radius:50%;background:#e9ede6;font-weight:700;font-size:.85rem}
.rk.top{background:#ffd54a}
code{background:#eef2ec;padding:1px 6px;border-radius:5px;font-size:.85rem}
@media(prefers-reduced-motion:reduce){.pulse{animation:none}.fill{transition:none}}
`;