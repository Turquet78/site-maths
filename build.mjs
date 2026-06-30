// =====================================================================
//  Génération automatique de la liste des fiches.
//  Ce script est exécuté par Netlify à chaque mise à jour.
//  Vous n'avez JAMAIS besoin de le lancer vous-même ni de le modifier.
//
//  Il parcourt le dossier "fiches/" et fabrique le fichier "fiches.json"
//  que le site lit pour afficher les cartes.
//
//  Organisation attendue des dossiers :
//      fiches/<Niveau>/<Matière>/<Le titre de la fiche>.pdf
//  exemple :
//      fiches/Seconde/Mathématiques/Les fonctions affines.pdf
//  Le titre affiché est simplement le nom du fichier (sans « .pdf »).
// =====================================================================
import { readdirSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = 'fiches';
const NIVEAUX = ['Seconde', 'Première', 'Terminale'];

const isPdf = (n) => n.toLowerCase().endsWith('.pdf');
const titre = (n) => n.replace(/\.pdf$/i, '');
const encodePath = (segs) => segs.map(encodeURIComponent).join('/');

const fiches = [];

for (const niveau of NIVEAUX) {
  const dirNiveau = join(ROOT, niveau);
  let entries;
  try { entries = readdirSync(dirNiveau); } catch { continue; }

  for (const entry of entries) {
    if (entry.startsWith('.')) continue;
    const full = join(dirNiveau, entry);
    let st;
    try { st = statSync(full); } catch { continue; }

    if (st.isDirectory()) {
      // Sous-dossier = matière
      const matiere = entry;
      let files;
      try { files = readdirSync(full); } catch { continue; }
      for (const f of files) {
        if (f.startsWith('.') || !isPdf(f)) continue;
        fiches.push({ niveau, matiere, titre: titre(f), lien: encodePath([ROOT, niveau, matiere, f]) });
      }
    } else if (isPdf(entry)) {
      // PDF posé directement dans le dossier du niveau
      fiches.push({ niveau, matiere: '', titre: titre(entry), lien: encodePath([ROOT, niveau, entry]) });
    }
  }
}

fiches.sort((a, b) =>
  (a.matiere || '').localeCompare(b.matiere || '', 'fr') ||
  a.titre.localeCompare(b.titre, 'fr')
);

writeFileSync('fiches.json', JSON.stringify(fiches, null, 2), 'utf8');
console.log(`fiches.json généré : ${fiches.length} fiche(s).`);
