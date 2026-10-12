import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getDatabase } from "firebase/database";

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

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

/**
 * Garantit qu'un utilisateur (étudiant ou enseignant) est authentifié de
 * façon anonyme avant toute lecture/écriture dans la base. L'UID anonyme
 * sert d'identifiant unique pour appliquer les règles de sécurité
 * Firebase (voir database.rules.json).
 */
export function ensureAuth() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          unsubscribe();
          resolve(user);
        } else {
          signInAnonymously(auth).catch(reject);
        }
      },
      reject
    );
  });
}

export const TEACHER_PASSCODE = sem-2026
