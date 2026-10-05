import React, { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, remove, push } from "firebase/database";

/* ───────── 1. CONFIG ───────── */
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

const DUR = 30; // secondes par question (limite stricte)
const db = getDatabase(initializeApp(firebaseConfig));

/* ───────── 2. CONTENU ───────── */
const QCMS = [
  {
    id: "qcm1",
    titre: "QCM 1 — SharedPreferences",
    sous: "Stockage clé-valeur sous Android : lecture, écriture, bonnes pratiques",
    questions: [
      { q: "Quel type de données SharedPreferences permet-il de stocker ?", o: ["Des objets Kotlin quelconques", "Des paires clé-valeur de types simples (Int, String, Boolean, Float, Long, Set<String>)", "Des tables relationnelles", "Des fichiers binaires volumineux"], a: 1 },
      { q: "Quelle instruction ouvre un fichier de préférences nommé « config » accessible uniquement par l'application ?", o: ["getSharedPreferences(\"config\", MODE_PRIVATE)", "openFileOutput(\"config\", MODE_PRIVATE)", "getPreferences(\"config\")", "SharedPreferences.create(\"config\")"], a: 0 },
      { q: "Quelle est la différence entre apply() et commit() ?", o: ["Aucune, ce sont des synonymes", "apply() est synchrone, commit() est asynchrone", "apply() écrit en mémoire puis sur disque en arrière-plan, commit() écrit de façon synchrone et renvoie un booléen", "commit() ne fonctionne que sur le thread principal"], a: 2 },
      { q: "Où SharedPreferences enregistre-t-il physiquement les données ?", o: ["Dans un fichier XML du dossier shared_prefs de l'application", "Dans une base SQLite partagée du système", "Dans le cloud Google", "Dans la carte SD publique"], a: 0 },
      { q: "Que renvoie prefs.getString(\"nom\", \"inconnu\") si la clé « nom » n'existe pas ?", o: ["null", "Une exception", "\"inconnu\"", "Une chaîne vide"], a: 2 },
      { q: "Quelle ligne enregistre correctement l'entier 10 sous la clé « score » ?", o: ["prefs.putInt(\"score\", 10)", "prefs.edit().putInt(\"score\", 10)", "prefs.save(\"score\", 10)", "prefs.edit().putInt(\"score\", 10).apply()"], a: 3 },
      { q: "Quel mode de création faut-il utiliser pour que le fichier ne soit pas lisible par d'autres applications ?", o: ["MODE_WORLD_READABLE", "MODE_PRIVATE", "MODE_WORLD_WRITEABLE", "MODE_APPEND"], a: 1 },
      { q: "Quelle solution moderne Google recommande-t-il pour remplacer SharedPreferences ?", o: ["Jetpack DataStore", "Intent extras", "ContentProvider", "WorkManager"], a: 0 },
    ],
  },
];

/* ───────── 3. UTILITAIRES ───────── */
const useVal = (path) => {
  const [v, setV] = useState(undefined);
  useEffect(() => onValue(ref(db, path), (s) => setV(s.val())), [path]);
  return v;
};
let offset = 0;
onValue(ref(db, ".info/serverTimeOffset"), (s) => (offset = s.val() || 0));
const now = () => Date.now() + offset;
const score = (qcm, answers = {}) =>
  qcm.questions.reduce((n, q, i) => n + (answers[i] === q.a ? 1 : 0), 0);

/* ───────── 4. APP ───────── */
export default function App() {
  const [view, setView] = useState({ name: "home" });
  return (
    <div className="app">
      <style>{CSS}</style>
      <header className="top">
        <button className="brand" onClick={() => setView({ name: "home" })}>
          Mobile natif avancé
        </button>
        {view.name !== "home" && (
          <button className="ghost" onClick={() => setView({ name: "home" })}>Accueil</button>
        )}
      </header>
      {view.name === "home" && <Home go={setView} />}
      {view.name === "student" && <Student qcm={view.qcm} />}
      {view.name === "teacher" && <Teacher qcm={view.qcm} />}
    </div>
  );
}

function Home({ go }) {
  return (
    <main className="wrap">
      <h1>Cours de développement mobile natif avancé</h1>
      <p className="lead">Choisissez un test. Le chronomètre démarre dès la première question : 30 secondes par question, sans retour en arrière.</p>
      {QCMS.map((q) => (
        <section className="card qcm" key={q.id}>
          <div>
            <h2>{q.titre}</h2>
            <p>{q.sous}</p>
            <p className="meta">{q.questions.length} questions, {DUR} s chacune</p>
          </div>
          <div className="actions">
            <button className="primary" onClick={() => go({ name: "student", qcm: q })}>Passer le test</button>
            <button className="ghost" onClick={() => go({ name: "teacher", qcm: q })}>Espace enseignant</button>
          </div>
        </section>
      ))}
    </main>
  );
}

/* ───────── 5. ÉTUDIANT ───────── */
function Student({ qcm }) {
  const key = "sid_" + qcm.id;
  const [sid, setSid] = useState(localStorage.getItem(key));
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const status = useVal(`sessions/${qcm.id}/status`);
  const me = useVal(sid ? `sessions/${qcm.id}/students/${sid}` : "none");
  const N = qcm.questions.length;
  const base = (id) => `sessions/${qcm.id}/students/${id}`;

  const join = async () => {
    const r = push(ref(db, `sessions/${qcm.id}/students`));
    await set(r, { nom: nom.trim().toUpperCase(), prenom: prenom.trim(), joinedAt: now() });
    localStorage.setItem(key, r.key);
    setSid(r.key);
  };

  if (!sid || me === null)
    return (
      <main className="wrap narrow">
        <h1>{qcm.titre}</h1>
        <p className="lead">Saisissez votre identité avant de commencer. Elle ne pourra plus être modifiée.</p>
        <div className="card form">
          <label>Nom<input value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="family-name" /></label>
          <label>Prénom<input value={prenom} onChange={(e) => setPrenom(e.target.value)} autoComplete="given-name" /></label>
          <button className="primary" disabled={nom.trim().length < 2 || prenom.trim().length < 2} onClick={join}>
            Valider mon identité
          </button>
        </div>
      </main>
    );
  if (me === undefined || status === undefined) return <main className="wrap"><p>Connexion…</p></main>;

  if (me.done) return <Result qcm={qcm} me={me} />;

  if (me.current === undefined)
    return (
      <main className="wrap narrow center">
        <h1>{me.prenom} {me.nom}</h1>
        {status === "open" ? (
          <>
            <p className="lead">Le test est ouvert. Dès que vous cliquez, le chronomètre de la première question démarre.</p>
            <button className="primary big" onClick={() => update(ref(db, base(sid)), { current: 0, qStart: now() })}>
              Démarrer le test
            </button>
          </>
        ) : (
          <p className="lead waiting">En attente de l'activation du test par l'enseignant… cette page se met à jour toute seule.</p>
        )}
      </main>
    );

  return <Question qcm={qcm} me={me} path={base(sid)} N={N} />;
}

function Question({ qcm, me, path, N }) {
  const i = me.current;
  const q = qcm.questions[i];
  const [left, setLeft] = useState(DUR);
  const lock = useRef(-1);

  const submit = (choice, timedOut) => {
    if (lock.current === i) return;
    lock.current = i;
    const next = i + 1;
    update(ref(db, path), {
      [`answers/${i}`]: choice,
      current: next,
      // après un timeout, la question suivante part de l'échéance (pas de temps gagné en rechargeant la page)
      qStart: timedOut ? me.qStart + DUR * 1000 : now(),
      ...(next >= N ? { done: true, finishedAt: now() } : {}),
    });
  };

  useEffect(() => {
    const t = setInterval(() => {
      const rest = DUR - (now() - me.qStart) / 1000;
      setLeft(Math.max(0, rest));
      if (rest <= 0) submit(-1, true);
    }, 100);
    return () => clearInterval(t);
  }, [i, me.qStart]);

  const urgent = left <= 10;
  return (
    <main className="wrap narrow">
      <div className="timer" aria-hidden>
        <div className={"fill" + (urgent ? " urgent" : "")} style={{ width: (left / DUR) * 100 + "%" }} />
      </div>
      <div className="qhead">
        <span>Question {i + 1} sur {N}</span>
        <span className={"clock" + (urgent ? " urgent" : "")} role="timer">{Math.ceil(left)} s</span>
      </div>
      <h2 className="qtext">{q.q}</h2>
      <div className="opts">
        {q.o.map((o, k) => (
          <button key={k} className="opt" onClick={() => submit(k, false)}>
            <b>{String.fromCharCode(65 + k)}</b>{o}
          </button>
        ))}
      </div>
      <p className="meta">Choisir une réponse valide immédiatement la question. À 0 s, elle est comptée fausse.</p>
    </main>
  );
}

function Result({ qcm, me }) {
  const s = score(qcm, me.answers);
  const N = qcm.questions.length;
  return (
    <main className="wrap narrow">
      <h1>Test terminé, {me.prenom}</h1>
      <p className="bigscore">{s}<span> / {N}</span></p>
      <p className="lead">Vos réponses ont été transmises à l'enseignant.</p>
      {qcm.questions.map((q, i) => {
        const a = me.answers?.[i];
        const ok = a === q.a;
        return (
          <div key={i} className={"card rev " + (ok ? "ok" : "ko")}>
            <p><b>{i + 1}.</b> {q.q}</p>
            <p>Votre réponse : {a === -1 || a === undefined ? "temps écoulé" : q.o[a]}</p>
            {!ok && <p>Bonne réponse : {q.o[q.a]}</p>}
          </div>
        );
      })}
    </main>
  );
}

/* ───────── 6. ENSEIGNANT ───────── */
function Teacher({ qcm }) {
  const [ok, setOk] = useState(false);
  const [pin, setPin] = useState("");
  const sess = useVal(`sessions/${qcm.id}`);
  const N = qcm.questions.length;

  if (!ok)
    return (
      <main className="wrap narrow">
        <h1>Espace enseignant</h1>
        <div className="card form">
          <label>Code d'accès<input type="password" value={pin} onChange={(e) => setPin(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setOk(pin === TEACHER_PIN)} /></label>
          <button className="primary" onClick={() => setOk(pin === TEACHER_PIN)}>Entrer</button>
          {pin && !ok && <p className="meta">Saisissez le code puis validez.</p>}
        </div>
      </main>
    );

  const status = sess?.status || "closed";
  const list = Object.entries(sess?.students || {}).map(([id, s]) => ({ id, ...s, sc: score(qcm, s.answers) }));
  list.sort((a, b) => a.nom.localeCompare(b.nom));
  const done = list.filter((s) => s.done).length;
  const avg = done ? (list.filter((s) => s.done).reduce((n, s) => n + s.sc, 0) / done).toFixed(1) : "–";
  const setStatus = (v) => update(ref(db, `sessions/${qcm.id}`), { status: v, ...(v === "open" ? { openedAt: now() } : {}) });
  const reset = () => window.confirm("Effacer tous les étudiants et fermer le test ?") && set(ref(db, `sessions/${qcm.id}`), { status: "closed" });
  const kick = (id) => window.confirm("Retirer cet étudiant ?") && remove(ref(db, `sessions/${qcm.id}/students/${id}`));
  const exportCsv = () => {
    const rows = [["Nom", "Prénom", "Score", "Terminé", ...qcm.questions.map((_, i) => "Q" + (i + 1))]];
    list.forEach((s) => rows.push([s.nom, s.prenom, s.sc, s.done ? "oui" : "non", ...qcm.questions.map((q, i) => (s.answers?.[i] === undefined ? "" : s.answers[i] === -1 ? "timeout" : s.answers[i] === q.a ? "juste" : "faux"))]));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\ufeff" + rows.map((r) => r.join(";")).join("\n")], { type: "text/csv" }));
    a.download = `${qcm.id}-resultats.csv`;
    a.click();
  };

  return (
    <main className="wrap">
      <div className="dash-head">
        <div>
          <h1>{qcm.titre}</h1>
          <p className={"badge " + status}>{status === "open" ? "Test actif" : "Test fermé"}</p>
        </div>
        <div className="actions">
          {status === "open"
            ? <button className="danger" onClick={() => setStatus("closed")}>Clôturer le test</button>
            : <button className="primary" onClick={() => setStatus("open")}>Activer le test</button>}
          <button className="ghost" onClick={exportCsv}>Exporter CSV</button>
          <button className="ghost" onClick={reset}>Réinitialiser</button>
        </div>
      </div>

      <div className="stats">
        <div className="card stat"><b>{list.length}</b> / 25<span>connectés</span></div>
        <div className="card stat"><b>{list.filter((s) => s.current !== undefined && !s.done).length}</b><span>en cours</span></div>
        <div className="card stat"><b>{done}</b><span>terminés</span></div>
        <div className="card stat"><b>{avg}</b><span>moyenne sur {N}</span></div>
      </div>

      <h2>Réussite par question</h2>
      <div className="card bars">
        {qcm.questions.map((q, i) => {
          const ans = list.filter((s) => s.answers?.[i] !== undefined);
          const good = ans.filter((s) => s.answers[i] === q.a).length;
          const pct = ans.length ? Math.round((good / ans.length) * 100) : 0;
          return (
            <div className="bar" key={i} title={q.q}>
              <span>Q{i + 1}</span>
              <div><i style={{ width: pct + "%" }} /></div>
              <em>{ans.length ? `${pct} % (${good}/${ans.length})` : "–"}</em>
            </div>
          );
        })}
      </div>

      <h2>Étudiants</h2>
      <div className="card tablewrap">
        <table>
          <thead><tr><th>Nom</th><th>Prénom</th><th>Avancement</th><th>Score</th><th>État</th><th></th></tr></thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan="6" className="meta">Aucun étudiant connecté pour l'instant.</td></tr>}
            {list.map((s) => {
              const n = Object.keys(s.answers || {}).length;
              return (
                <tr key={s.id}>
                  <td>{s.nom}</td><td>{s.prenom}</td>
                  <td><div className="mini"><i style={{ width: (n / N) * 100 + "%" }} /></div> {n}/{N}</td>
                  <td><b>{s.sc}</b></td>
                  <td>{s.done ? "Terminé" : s.current !== undefined ? `Question ${s.current + 1}` : "En attente"}</td>
                  <td><button className="x" onClick={() => kick(s.id)} aria-label="Retirer">×</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}

/* ───────── 7. STYLES ───────── */
const CSS = `
:root{--bg:#e8edf4;--ink:#0f1a30;--mut:#5a6783;--card:#fff;--line:#d3dbe8;--pri:#2750d8;--ok:#17855c;--ko:#c93a3a;--warn:#e8a200}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.top{display:flex;justify-content:space-between;align-items:center;padding:14px 24px;background:var(--ink)}
.brand{background:none;border:0;color:#fff;font:700 17px system-ui;cursor:pointer;letter-spacing:.2px}
.wrap{max-width:1000px;margin:0 auto;padding:32px 20px 64px}
.narrow{max-width:640px}.center{text-align:center}
h1{font-size:clamp(26px,4vw,38px);line-height:1.15;margin:0 0 12px;letter-spacing:-.5px}
h2{font-size:20px;margin:28px 0 12px}
.lead{color:var(--mut);max-width:60ch}
.meta{color:var(--mut);font-size:14px}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:20px}
.qcm{display:flex;justify-content:space-between;gap:20px;align-items:center;flex-wrap:wrap;margin-top:24px}
.qcm h2{margin:0 0 4px}.qcm p{margin:2px 0}
.actions{display:flex;gap:10px;flex-wrap:wrap}
button{font:600 15px system-ui;border-radius:8px;padding:10px 18px;cursor:pointer;border:1px solid transparent}
button:focus-visible,input:focus-visible{outline:3px solid var(--warn);outline-offset:2px}
.primary{background:var(--pri);color:#fff}.primary:disabled{opacity:.4;cursor:not-allowed}
.danger{background:var(--ko);color:#fff}
.ghost{background:transparent;border-color:var(--line);color:inherit}
.top .ghost{color:#fff;border-color:#3a4a6c}
.big{font-size:18px;padding:14px 28px;margin-top:12px}
.form{display:grid;gap:16px;margin-top:20px}
label{display:grid;gap:6px;font-weight:600;font-size:14px}
input{font:16px system-ui;padding:11px 12px;border:1px solid var(--line);border-radius:8px}
.waiting{animation:pulse 2s ease-in-out infinite;margin:24px auto}
@keyframes pulse{50%{opacity:.45}}
.timer{height:12px;background:var(--line);border-radius:6px;overflow:hidden}
.fill{height:100%;background:var(--pri);transition:width .1s linear}
.fill.urgent{background:var(--warn)}
.qhead{display:flex;justify-content:space-between;margin:14px 0 4px;color:var(--mut);font-weight:600}
.clock{font:700 34px ui-monospace,Menlo,Consolas,monospace;color:var(--ink)}
.clock.urgent{color:var(--ko)}
.qtext{font-size:clamp(20px,3vw,26px);line-height:1.3;margin:12px 0 22px}
.opts{display:grid;gap:12px}
.opt{display:flex;gap:14px;align-items:center;text-align:left;background:var(--card);border:2px solid var(--line);padding:16px;font-size:17px;font-weight:500}
.opt b{display:grid;place-items:center;min-width:32px;height:32px;border-radius:50%;background:var(--bg)}
.opt:hover{border-color:var(--pri)}.opt:active{background:#dfe7ff}
.bigscore{font:800 72px/1 system-ui;margin:12px 0}.bigscore span{font-size:28px;color:var(--mut)}
.rev{margin-top:12px;border-left:6px solid}.rev p{margin:4px 0}
.rev.ok{border-left-color:var(--ok)}.rev.ko{border-left-color:var(--ko)}
.dash-head{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:flex-start}
.badge{display:inline-block;margin:0;padding:3px 12px;border-radius:99px;font-weight:700;font-size:14px;background:#e1e5ee}
.badge.open{background:#d4f1e4;color:var(--ok)}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin-top:20px}
.stat{font-size:15px;color:var(--mut)}.stat b{font-size:34px;color:var(--ink)}.stat span{display:block}
.bars{display:grid;gap:8px}
.bar{display:grid;grid-template-columns:36px 1fr 110px;gap:10px;align-items:center;font-size:14px}
.bar div,.mini{background:var(--bg);border-radius:5px;height:12px;overflow:hidden}
.bar i,.mini i{display:block;height:100%;background:var(--ok)}
.mini{display:inline-block;width:80px;vertical-align:middle}.mini i{background:var(--pri)}
.tablewrap{overflow-x:auto;padding:8px 12px}
table{width:100%;border-collapse:collapse;font-size:15px}
th,td{text-align:left;padding:9px 8px;border-bottom:1px solid var(--line);white-space:nowrap}
th{color:var(--mut);font-weight:600;font-size:14px}
.x{background:none;border:0;color:var(--mut);font-size:20px;padding:0 8px}
@media(prefers-reduced-motion:reduce){.waiting{animation:none}.fill{transition:none}}
`;
