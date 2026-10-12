// Banque de questions du QCM — TP1 : SharedPreferences
// ⚠️ Ces données (y compris "correctIndex") sont incluses dans le bundle
// JavaScript envoyé au navigateur : un étudiant technophile pourrait les
// lire via les outils de développement. Pour une sécurité renforcée
// (scoring impossible à tricher), déplacez la correction vers une
// Cloud Function Firebase qui reçoit les réponses et renvoie uniquement
// le score. Voir le README pour plus de détails.

const tp1Questions = [
  {
    id: "q1",
    question:
      "Quelle instruction permet d'ouvrir (ou de créer) un fichier de préférences nommé en Kotlin ?",
    options: [
      "getSharedPreferences(nom, MODE_PRIVATE)",
      "getDefaultSharedPreferences(this)",
      "openFileOutput(nom, MODE_PRIVATE)",
      "new SharedPreferences(nom)",
    ],
    correctIndex: 0,
  },
  {
    id: "q2",
    question:
      "Pourquoi utilise-t-on apply() plutôt que commit() dans la quasi-totalité des cas d'usage courants ?",
    options: [
      "apply() écrit de façon asynchrone et ne bloque pas le thread principal",
      "commit() est obsolète et ne fonctionne plus sur Android récent",
      "apply() peut stocker plus de données que commit()",
      "apply() remplace totalement commit() depuis Android 14",
    ],
    correctIndex: 0,
  },
  {
    id: "q3",
    question:
      "Quel est le risque théorique d'utiliser apply() pour une donnée absolument critique ?",
    options: [
      "En cas de fermeture brutale du processus, la donnée peut être perdue silencieusement",
      "apply() chiffre automatiquement la donnée, ce qui ralentit son accès",
      "apply() limite la taille de la donnée à 1 Ko",
      "apply() ne fonctionne pas avec le type Boolean",
    ],
    correctIndex: 0,
  },
  {
    id: "q4",
    question:
      "Dans quelle méthode du cycle de vie d'une Activity est-il recommandé de sauvegarder automatiquement un formulaire ?",
    options: ["onCreate()", "onPause()", "onDestroy()", "onClick()"],
    correctIndex: 1,
  },
  {
    id: "q5",
    question:
      "Les SharedPreferences chiffrent-elles automatiquement les données stockées ?",
    options: [
      "Oui, toujours, par défaut",
      "Non : elles sont stockées en clair dans un fichier XML",
      "Oui, mais uniquement pour les String",
      "Seulement si MODE_PRIVATE est utilisé",
    ],
    correctIndex: 1,
  },
  {
    id: "q6",
    question:
      "Quelle API Jetpack permet de construire un écran de paramètres natif (PreferenceFragmentCompat) ?",
    options: [
      "androidx.recyclerview",
      "androidx.room",
      "androidx.preference",
      "androidx.navigation",
    ],
    correctIndex: 2,
  },
];

export default tp1Questions;
