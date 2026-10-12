// Identifiant d'un étudiant à partir du prénom et du nom saisis.
// Insensible à la casse, aux accents, aux espaces/tirets multiples et à l'ordre des mots :
// "Ahmed Ben Ali", "ali ahmed ben" et "AHMED  BEN-ALI" donnent le même identifiant.
// (Une faute d'orthographe, elle, produit un identifiant différent.)

const tokens = (str) =>
  str
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

const clean = (str) => str.trim().replace(/\s+/g, " ");

export function buildStudent(prenom, nom) {
  const p = tokens(prenom);
  const n = tokens(nom);
  if (p.length === 0 || n.length === 0 || [...p, ...n].join("").length < 4) return null;
  const id = [...p, ...n].sort().join("-").slice(0, 100);
  return { id, name: `${clean(prenom)} ${clean(nom)}` };
}
