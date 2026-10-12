// Banque de questions du QCM — TP2 : Persistance des données (SQLite)
// ⚠️ "correctIndex" est présent dans le bundle JavaScript : voir README (section sécurité).

const tp2Questions = [
  {
    id: "q1",
    question: "Quel est le rôle de la classe SQLiteOpenHelper ?",
    options: [
      "Afficher les données d'une table dans une liste",
      "Envoyer des requêtes SQL à un serveur distant",
      "Créer la base, gérer ses versions et fournir l'accès à la connexion",
      "Chiffrer automatiquement les données de la base",
    ],
    correctIndex: 2,
  },
  {
    id: "q2",
    question: "Quand la méthode onCreate() de SQLiteOpenHelper est-elle appelée ?",
    options: [
      "Lorsque la base n'existe pas encore et qu'on l'ouvre pour la première fois",
      "À chaque ouverture de l'application",
      "À chaque insertion d'une ligne dans une table",
      "Uniquement lorsque l'utilisateur supprime les données de l'application",
    ],
    correctIndex: 0,
  },
  {
    id: "q3",
    question: "Que faut-il toujours faire d'un Cursor une fois la lecture terminée ?",
    options: [
      "Le laisser ouvert pour accélérer la lecture suivante",
      "Le fermer (close() ou cursor.use { })",
      "Le convertir en String",
      "Le stocker dans les SharedPreferences",
    ],
    correctIndex: 1,
  },
  {
    id: "q4",
    question: "Que signifie une valeur de retour égale à -1 pour db.insert() ?",
    options: [
      "La ligne a été insérée à la dernière position",
      "La table était vide avant l'insertion",
      "L'insertion a réussi sans générer d'identifiant",
      "L'insertion a échoué",
    ],
    correctIndex: 3,
  },
  {
    id: "q5",
    question: "À quoi sert ContentValues lors d'une insertion ou d'une mise à jour ?",
    options: [
      "À définir la structure (schéma) de la table",
      "À regrouper les paires colonne/valeur de la ligne à écrire",
      "À parcourir les lignes renvoyées par une requête",
      "À ouvrir la connexion à la base",
    ],
    correctIndex: 1,
  },
  {
    id: "q6",
    question: "Que renvoie db.update(...) ?",
    options: [
      "Un Boolean indiquant le succès",
      "Le nouvel identifiant de la ligne modifiée",
      "Le nombre de lignes modifiées",
      "Un Cursor sur les lignes modifiées",
    ],
    correctIndex: 2,
  },
  {
    id: "q7",
    question:
      "Quelle écriture est la plus sûre pour rechercher les tâches dont le titre contient un mot saisi par l'utilisateur ?",
    options: [
      "selection = \"titre LIKE ?\" avec selectionArgs = arrayOf(\"%\" + mot + \"%\")",
      "\"... WHERE titre LIKE '%\" + mot + \"%'\" concaténé dans la requête",
      "Construire la requête avec un String.format() contenant la saisie",
      "Vérifier uniquement que la saisie n'est pas vide, puis la concaténer",
    ],
    correctIndex: 0,
  },
  {
    id: "q8",
    question: "Quel risque principal crée la concaténation d'une saisie utilisateur dans une requête SQL ?",
    options: [
      "Un ralentissement de l'interface",
      "Une consommation excessive de mémoire",
      "Une incompatibilité avec les anciennes versions d'Android",
      "L'injection SQL : la saisie peut être interprétée comme du code SQL",
    ],
    correctIndex: 3,
  },
  {
    id: "q9",
    question:
      "Vous ajoutez une colonne à une table déjà utilisée par vos utilisateurs. Comment migrer SANS perdre leurs données ?",
    options: [
      "Faire DROP TABLE puis recréer la table dans onUpgrade()",
      "Demander aux utilisateurs de désinstaller puis réinstaller l'application",
      "Incrémenter la version et exécuter ALTER TABLE ... ADD COLUMN dans onUpgrade()",
      "Renommer le fichier .db manuellement",
    ],
    correctIndex: 2,
  },
  {
    id: "q10",
    question:
      "Pourquoi choisir SQLite plutôt que SharedPreferences pour stocker des tâches de révision ?",
    options: [
      "Parce que SharedPreferences est plus lent",
      "Pour stocker une liste illimitée d'éléments structurés qu'on veut interroger",
      "Parce que SQLite chiffre automatiquement les données",
      "Parce que SharedPreferences ne fonctionne plus sur Android récent",
    ],
    correctIndex: 1,
  },
];

export default tp2Questions;
