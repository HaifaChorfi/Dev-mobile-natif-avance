// Banque de questions du QCM — TP3 : Consommation d'un Web Service REST avec Retrofit (Kotlin)
// Focus : opérations HTTP (GET, POST, PUT, DELETE, codes de réponse) et Retrofit.
// 10 questions · 35 secondes par question (voir tps.js).
// ⚠️ "correctIndex" est présent dans le bundle JavaScript : voir README (section sécurité).

const tp3Questions = [
  {
    id: "q1",
    question:
      "Quelle déclaration de ApiService permet de supprimer le produit n° 5 sur le serveur ?",
    options: [
      "@GET(\"products/5\") : le serveur supprime la ressource après l'avoir lue",
      "@POST(\"products/delete\") avec @Body : on envoie l'ordre de suppression au serveur",
      "@PUT(\"products/5\") avec un corps vide : on remplace le produit par rien du tout",
      "@DELETE(\"products/{id}\") avec @Path(\"id\") : le verbe DELETE sur l'URL du produit",
    ],
    correctIndex: 3,
  },
  {
    id: "q2",
    question: "Quelle association verbe HTTP / opération CRUD est correcte ?",
    options: [
      "POST pour créer, PUT pour modifier, DELETE pour supprimer",
      "GET pour créer, POST pour lire, DELETE pour modifier, PUT pour supprimer",
      "PUT pour supprimer, GET pour modifier, POST pour lire, DELETE pour créer",
      "DELETE pour créer, PUT pour lire, GET pour supprimer, POST pour modifier",
    ],
    correctIndex: 0,
  },
  {
    id: "q3",
    question:
      "Quelle déclaration de ApiService produit la requête GET https://dummyjson.com/products/search?q=phone ?",
    options: [
      "@GET(\"products/search\") suspend fun rechercher(@Path(\"q\") motCle: String): ReponseProduits",
      "@GET(\"products/{q}\") suspend fun rechercher(@Query(\"q\") motCle: String): ReponseProduits",
      "@GET(\"products/search\") suspend fun rechercher(@Query(\"q\") motCle: String): ReponseProduits",
      "@GET(\"products/search\") suspend fun rechercher(@Body motCle: String): ReponseProduits",
    ],
    correctIndex: 2,
  },
  {
    id: "q4",
    question:
      "Avec @GET(\"products/{id}\") suspend fun getProduit(@Path(\"id\") id: Int), que se passe-t-il quand on appelle getProduit(5) ?",
    options: [
      "Retrofit envoie GET /products?id=5, avec 5 en paramètre de requête",
      "Retrofit remplace {id} par 5 et envoie GET /products/5",
      "Retrofit envoie GET /products avec la valeur 5 dans le corps JSON",
      "Retrofit envoie GET /products avec l'en-tête HTTP « id: 5 »",
    ],
    correctIndex: 1,
  },
  {
    id: "q5",
    question:
      "Pour un POST vers products/add, comment transmettre l'objet NouveauProduit au serveur ?",
    options: [
      "Avec @Body : Gson convertit l'objet en JSON dans le corps de la requête",
      "Avec @Path : l'objet est inséré dans le chemin de l'URL de la requête",
      "Avec @Query : l'objet est ajouté après le « ? » dans l'URL de la requête",
      "Avec @Header : l'objet est envoyé dans les en-têtes HTTP de la requête",
    ],
    correctIndex: 0,
  },
  {
    id: "q6",
    question:
      "Quelle déclaration de ApiService permet de modifier le produit n° 5 en envoyant son nouveau titre et son nouveau prix ?",
    options: [
      "@PUT(\"products/{id}\") suspend fun modifier(@Path(\"id\") id: Int, @Query(\"title\") t: String): Produit",
      "@PUT(\"products/{id}\") suspend fun modifier(@Path(\"id\") id: Int, @Body p: NouveauProduit): Produit",
      "@POST(\"products/{id}\") suspend fun modifier(@Header(\"id\") id: Int, @Body p: NouveauProduit): Produit",
      "@GET(\"products/{id}\") suspend fun modifier(@Path(\"id\") id: Int, @Body p: NouveauProduit): Produit",
    ],
    correctIndex: 1,
  },
  {
    id: "q7",
    question:
      "Que fait l'instruction « retrofit.create(ApiService::class.java) » dans RetrofitClient ?",
    options: [
      "Elle télécharge le fichier ApiService depuis le serveur dummyjson.com",
      "Elle crée dans la base SQLite une table pour chaque fonction de ApiService",
      "Elle génère l'implémentation de l'interface ApiService à partir de ses annotations",
      "Elle envoie immédiatement une requête GET pour chaque fonction de ApiService",
    ],
    correctIndex: 2,
  },
  {
    id: "q8",
    question:
      "Quel est le rôle de GsonConverterFactory dans la construction de Retrofit ?",
    options: [
      "Chiffrer les échanges avec le serveur en utilisant le protocole HTTPS",
      "Journaliser chaque requête et chaque réponse dans le Logcat d'Android",
      "Convertir le JSON en objets Kotlin, et inversement",
      "Ouvrir la connexion réseau et gérer les délais d'attente (timeouts)",
    ],
    correctIndex: 2,
  },
  {
    id: "q9",
    question: "Quelle phrase décrit correctement la relation entre Retrofit et OkHttp ?",
    options: [
      "Retrofit remplace complètement OkHttp : les deux bibliothèques ne peuvent pas être utilisées ensemble dans un projet",
      "OkHttp convertit le JSON en objets Kotlin pendant que Retrofit se charge d'envoyer les requêtes sur le réseau",
      "Retrofit n'est utile que pour télécharger des images, alors qu'OkHttp gère toutes les requêtes qui renvoient du JSON",
      "Retrofit décrit l'API par une interface et s'appuie sur OkHttp pour envoyer les requêtes",
    ],
    correctIndex: 3,
  },
  {
    id: "q10",
    question:
      "Comment afficher dans le Logcat la requête envoyée et la réponse JSON reçue pendant le TP ?",
    options: [
      "Ajouter un HttpLoggingInterceptor (BODY) à OkHttpClient, filtrer sur « OkHttp »",
      "Écrire un appel Log.d dans chaque fonction déclarée à l'intérieur de l'interface ApiService",
      "Ajouter l'annotation @Logging devant chaque fonction de l'interface ApiService de Retrofit",
      "Remplacer GsonConverterFactory par un convertisseur spécialisé dans la journalisation",
    ],
    correctIndex: 0,
  },
];

export default tp3Questions;
