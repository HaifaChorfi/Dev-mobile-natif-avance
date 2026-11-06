import tp1Questions from "./tp1Questions.js";
import tp2Questions from "./tp2Questions.js";
import tp3Questions from "./tp3Questions.js";

// Configuration centrale des QCM.
// Options facultatives par QCM :
//   timePerQuestion : durée par question en secondes (sinon TIME_PER_QUESTION)
//   requireSession  : true -> les étudiants ne peuvent démarrer que si l'enseignant a activé la session
//   showCorrection  : true -> l'étudiant voit, à la fin, bonne/mauvaise réponse pour chaque question
// Pour activer un nouveau TP : créez sa banque de questions, importez-la ici
// et passez "enabled" à true (sans oublier de l'ajouter aux règles Firebase).
export const TP_LIST = [
  { id: "tp1", label: "TP1 — SharedPreferences", enabled: true, questions: tp1Questions },
  { id: "tp2", label: "TP2 — SQLite", enabled: true, questions: tp2Questions },
  {
    id: "tp3",
    label: "TP3 — Web service REST (Retrofit)",
    enabled: true,
    questions: tp3Questions,
    timePerQuestion: 35, // secondes (remplace TIME_PER_QUESTION pour ce QCM)
    requireSession: true, // l'enseignant doit activer la session avant que les étudiants puissent démarrer
    showCorrection: true, // détail question par question affiché à l'étudiant après l'envoi
  },
  { id: "tp4", label: "TP4 — Géolocalisation", enabled: false },
  { id: "tp5", label: "TP5 — Connectivité", enabled: false },
  { id: "tp8", label: "TP8 — Multimédia", enabled: false },
  { id: "tp9", label: "TP9 — Capteurs", enabled: false },
  { id: "tp10", label: "TP10 — Fragments", enabled: false },
  { id: "tp11", label: "TP11 — Publication", enabled: false },
];

export const TIME_PER_QUESTION = 30; // secondes (valeur par défaut)
export const getTimePerQuestion = (tp) => tp.timePerQuestion ?? TIME_PER_QUESTION;

// Mode de classement :
//   true  -> à score égal, l'étudiant le plus RAPIDE (durée totale du test) est mieux classé (par défaut)
//   false -> classement par score uniquement ; les ex æquo partagent le même rang
export const RANK_TIEBREAK_BY_SPEED = true;

// Effectif attendu (affiché dans le tableau de bord : "x/50 ont terminé")
export const EXPECTED_STUDENTS = 50;

export const getTp = (id) => TP_LIST.find((t) => t.id === id);
