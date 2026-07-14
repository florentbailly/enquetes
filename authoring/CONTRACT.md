# CONTRAT D'UNE ENQUÊTE (`CAS_*`)

Ce fichier décrit **tout** ce qu'une enquête doit fournir au moteur de `index.html`.
Un agent qui écrit une enquête lit **ce fichier**, jamais les 2000 lignes du moteur.

Le moteur est générique. Il ne connaît que l'objet `CAS` actif. Ajouter une enquête =
produire un bloc JS conforme à ce contrat, puis l'enregistrer avec `CASES.push(...)`.

---

## 1. Structure obligatoire de l'objet `CAS`

```js
const CAS_XXX = {
  id:        "kebab",                    // unique, ex "dragon"
  cle:       "mysterylane-xxx",          // clé de sauvegarde localStorage, unique
  emoji:     "🐉",
  titre:     "L'Affaire du ...",
  accroche:  "Phrase de la carte du menu. HTML autorisé (&amp; etc.).",
  lieuFinal: "phare",                    // id du lieu de confrontation
  libelleCoupable: "C'est le Dragon ... !",

  indices:   IND_XXX,      // objet { cle:{ico,nom,desc}, ... }  — voir §2
  suspects:  SUS_XXX,      // objet { id:{nom,desc}, ... }        — 3 suspects
  deductions:DED_XXX,      // objet { d1..d5:{...} }              — voir §3
  ordreDed:  ["d1","d2","d3","d4","d5"],
  preuves:   PRV_XXX,      // tableau de 3 questions de confrontation — voir §4
  lieux:     LIEUX_XXX,    // objet { id:{nom,indices:[],deds:[]} } — 4 lieux — voir §5

  etatNeuf:  ()=>({ suspects:{...:"?"}, lieux:{...:"verrou"} }), // état initial — voir §6
  intro:     INTRO_XXX,    // tableau de 3 { art:fn, t:"..." }
  briefing:  briefing_XXX, // fonction — voir §7
  verif:     verif_XXX,    // fonction de progression — voir §8
  toucher:   toucher_XXX,  // gère les clics sur les hotspots — voir §9
  confrontation: confrontation_XXX, // scène finale — voir §10
  entrees:   ENTREES_XXX,  // dialogues d'entrée par lieu

  art: {
    titre:  artTitre_XXX,   // écran-titre / vignette du menu
    carte:  artCarte_XXX,   // carte des lieux
    fin:    artFin_XXX,     // écran de victoire
    lieux:  { musee:artMusee_XXX, ... } // 1 fonction par lieu NON-final
  }
};
```

En plus de l'objet, l'enquête ajoute ses personnages aux dictionnaires partagés
`PORTRAITS` (SVG) et `NOMS` (chaîne affichée). Personnages communs déjà présents :
`clever`, `bro`, `mcflare`, `recit`. À fournir : le gardien-témoin, le témoin de fuite,
le marchand, et les 3 suspects.

---

## 2. INDICES — exactement 12

`{ ico:"emoji", nom:"Nom court", desc:"Phrase trouvée dans le carnet." }`

Répartition type (reproduit la structure des 2 enquêtes existantes) :
- **5** au lieu du crime : récit du gardien, "serrure/loquet rayé", indice brillant,
  passage étroit, indice-du-passage.
- **3** au lieu de fuite : récit du 2e témoin, trace de fuite, prospectus du marchand.
- **4** chez le marchand : produit brillant, moyen de paiement, outil fin, affiche du concours.

Les `nom`/`ico` servent aussi de puces dans la modale de déduction et de choix dans la
confrontation : garder courts et imagés.

## 3. DEDUCTIONS — d1..d5 (la colonne vertébrale logique)

```js
d2:{
  titre:"Déduction n°2",
  besoin:["grille2","ventouse","t_pepin"], // indices requis pour DÉBLOQUER la question
  question:"...",
  resume:"Phrase notée au carnet une fois résolue (sert au récap final).",
  options:[
    { t:"mauvaise 1", ok:false, r:"réplique pédagogique qui renvoie vers l'indice." },
    { t:"BONNE",       ok:true,  r:"réplique qui valide + élimine un suspect." },
    { t:"mauvaise 2", ok:false, r:"..." }
  ],
  apres(){ S.suspects.gaston="non"; S.raisons.gaston="raison courte."; } // optionnel
}
```

Règles **strictes** (vérifiées par le validateur) :
- Chaque déduction a **exactement une** option `ok:true`.
- `d5` a en plus `besoinDed:["d1","d2","d3","d4"]` et son `apres()` met un suspect à `"coupable"`.
- La chaîne élimine **2** suspects (via `apres` de deux déductions intermédiaires) et
  désigne le **3e** comme coupable en d5. Chaque élimination repose sur **un trait physique**
  (trop gros / vole / déteste l'eau / ...). Deux traits distincts, un par suspect innocent.
- d1 = "pourquoi ça brille/bouge" → révèle le **truc** (ce n'est pas surnaturel).
- d4 = "comment ouvrir sans casser" → l'**outil fin** acheté chez le marchand.

## 4. PREUVES — 3 questions de confrontation

Même forme que les options de déduction (`{question, options:[{t,ok,r}]}`), une seule
`ok:true` chacune. Elles rejouent 3 indices-clefs : le produit brillant, l'indice-du-passage,
l'outil. Les mauvaises réponses piochent parmi les autres indices (paiement, affiche...).

## 5. LIEUX — 4 lieux

`{ nom:"...", indices:["..."], deds:["d1","d2"] }`
- L'**union** des `indices` de tous les lieux doit être **exactement** les 12 clés d'`indices`.
- Le lieu final (`lieuFinal`) a `indices:[]` et `deds:[]`.
- `deds` liste les déductions résolvables dans ce lieu (sert au marqueur "✓ complété").

## 6. `etatNeuf()` — état de départ propre à l'enquête

Retourne uniquement `{ suspects, lieux }` : chaque suspect à `"?"`, chaque lieu à
`"verrou"` **sauf** le premier qui sera ouvert par `briefing`. États suspect possibles :
`"?"` | `"non"` (innocenté) | `"coupable"`. États lieu : `"verrou"` | `"ouvert"`.

## 7. `briefing()` — le mot de McFlare

Affiche `artQG_XXX(true)`, joue le dialogue d'ouverture, puis dans le callback :
`S.faits.brief=true; S.lieux.PREMIER="ouvert"; carnetAlerte=true; sauver(); toast(...); allerCarte();`

## 8. `verif()` — progression / déblocage des lieux

Appelée après chaque déduction et après certains ramassages. Renvoie `true` si elle a
déclenché une transition (sinon `false`). Schéma récurrent :
```js
if(S.deductions.d1 && S.deductions.d2 && !S.faits.versX){
  S.faits.versX=true; S.lieux.X="ouvert"; sauver();
  dire([...], ()=>{ toast("🗺️ Nouveau lieu ..."); allerCarte(); });
  return true;
}
```
Débloque : lieu2 après d1+d2 ; lieu3 après d3 + prospectus ; lieuFinal après d5.

## 9. `toucher(id)` — clics sur hotspots

`switch`-like sur les `id` des hotspots. Gère `"maison"` (gag QG) + chaque hotspot des lieux.
Un hotspot d'interrogatoire/objet appelle `dire([...], ()=> { ajouterIndice("x"); marque("h_ID"); })`.
Le hotspot "passage étroit" lance un mini-choix (`choisir(...)`) façon `missionGrille`.
Le hotspot du prospectus finit par `setTimeout(verifierProgression, 400)`.
`marque("h_"+id)` grise le hotspot une fois fait.

## 10. `confrontation()` — la scène finale

Affiche `artFinalLieu_XXX()`, joue l'intro, puis `preuve(0, fuiteXXX)`. `preuve` est
**générique** (dans le moteur). `fuiteXXX` = mini-jeu de poursuite (2-3 choix, un seul
"prop gagnant") qui se termine par `reussiteXXX()` → dialogue d'aveu → `finirPartie`.

---

## Fonctions & helpers FOURNIS par le moteur (à réutiliser, ne PAS réécrire)

`dire(lignes, fin)` · `choisir(ligne, options)` · `poserQuestion(cfg, onOk)` ·
`ajouterIndice(id)` · `marque(id)` · `toast(txt)` · `allerCarte()` · `allerLieu(id)` ·
`verifierProgression()` · `finirPartie()` · `preuve(i, onDone)` · `son(quoi)` ·
Helpers d'art : `etoiles()` · `lune(x,y,r)` · `brume()` · `hotspot(id,x,y,picto,label,r)` ·
Dialogue : `{p:"clever", t:"texte"}` où `p` ∈ clés de `PORTRAITS`/`NOMS`.

## Conventions de nommage (obligatoires)

- Suffixe `_F` = enquête 1 (fantome), `_D` = enquête 2 (dragon). Nouvelle enquête = **nouveau suffixe unique** (ex `_C` pour cirque).
- `id`, `cle`, clés d'`indices`, ids de hotspots, ids de suspects : **uniques dans tout le projet** (le validateur refuse les collisions).
- SVG : viewBox `0 0 960 540`, `preserveAspectRatio="xMidYMid slice"`. Aucune ressource externe (tout inline).
