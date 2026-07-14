# Mystery Lane — Guide de fabrication d'enquêtes

Ce dossier `authoring/` est une **usine à enquêtes**. Il te permet (avec mon aide) d'ajouter
des épisodes jusqu'à ~20, sans casser le jeu et sans exploser la facture de tokens.
Ce guide explique tout, pas à pas, même si tu débutes avec les systèmes d'agents.

---

## 0. Ce qui vient d'être corrigé

L'écran d'accueil restait blanc parce que l'état du jeu (`S`) était réinitialisé sans le champ
`indices`, et `majUI()` plantait sur `S.indices.length`. C'est réparé proprement : une seule
fonction `etatVide(son)` fabrique un état complet, utilisée partout (démarrage, retour au menu,
nouvelle partie). Ce bug ne peut plus revenir. Ton correctif manuel était juste ; je l'ai rendu
"DRY" (une seule source de vérité).

---

## 1. Les 3 briques de Claude Code (vocabulaire de base)

- **Skill (= commande `/xxx`)** : un mode d'emploi que je charge quand tu tapes la commande.
  Ici : `/new-episode`. C'est le **chef d'orchestre**.
- **Sous-agent (subagent)** : un "moi" séparé, avec son propre contexte, lancé pour une tâche
  précise, qui me rend un résultat. Défini par un fichier dans `.claude/agents/`. Ici :
  `scenario-designer`, `case-coder`, `case-artist`.
- **Script déterministe** : du code normal (pas d'IA) qui vérifie ou transforme. Ici :
  `authoring/validate-case.mjs`. **C'est lui qui garantit la robustesse, gratuitement en tokens.**

> Idée-clé : l'IA sert à **inventer** (cher), le script sert à **vérifier** (gratuit). On met le
> maximum de garde-fous dans le script pour ne pas gaspiller de tokens en allers-retours de debug.

---

## 2. L'architecture (et pourquoi elle économise des tokens)

Le moteur du jeu (dans `index.html`) est **générique** : il ne connaît qu'un objet `CAS` actif.
Ajouter une enquête = fournir un objet `CAS_XXX` conforme. Donc les agents n'ont **jamais besoin
de lire les 2000 lignes du moteur** : ils lisent seulement de petits documents.

| Fichier | Rôle | Qui le lit |
|---|---|---|
| `CONTRACT.md` | La forme exacte d'une enquête (12 indices, 5 déductions…) | tous les agents |
| `MECHANICS.md` | Le **registre anti-répétition** : décors/trucs/traits déjà utilisés | le scénariste |
| `scenario.example.json` | Le format du "plan" compact d'une enquête (exemple = dragon) | scénariste + codeur |
| `TEMPLATE.case.js` | Le squelette de code à remplir (`<<...>>`) | le codeur |
| `validate-case.mjs` | Le **vérificateur** automatique | le script (toi, via `node`) |
| `.claude/agents/*.md` | Les 3 sous-agents | Claude Code |
| `.claude/skills/new-episode/` | Le chef d'orchestre | Claude Code (`/new-episode`) |

**Les 4 leviers d'économie de tokens :**
1. On lit ~300 lignes de docs, pas 2000 de moteur (≈ −85 % de contexte par enquête).
2. L'invention se fait sur un **plan JSON d'1 page**, relu et corrigé à bas coût AVANT de coder.
3. Le template évite de réinventer la structure (donc moins de génération et moins d'erreurs).
4. Le validateur attrape les bugs **sans IA** (sinon chaque debug coûterait des milliers de tokens).

**Robustesse :** chaque enquête est indépendante ; le validateur refuse les collisions d'ids, les
déductions à 0 ou 2 bonnes réponses, les indices non ramassables, les SVG mal formés, etc.

---

## 3. Comment créer un épisode — le chemin normal

Tape simplement :

```
/new-episode une gare de nuit
```

(le thème est optionnel). Voici ce qui se passe, avec des **points d'arrêt** où tu décides :

1. **Scénario.** Je propose un plan neuf (décor + truc + 2 suspects innocents éliminés par 2
   traits distincts + coupable + 12 indices + chaîne de déductions). → **Je m'arrête et te montre
   un résumé de 6 lignes.** Tu valides ou tu corriges. *(C'est le moment le plus important : on
   ajuste l'idée quand ça ne coûte presque rien.)*
2. **Code.** Je remplis le template → un fichier `authoring/generated/<id>.case.js` (données +
   dialogues + logique). L'art reste en "stubs".
3. **Art.** Je dessine les 6 personnages + les scènes en SVG, dans le style existant.
4. **Intégration + test.** Je colle le bloc dans `index.html`, je lance
   `node authoring/validate-case.mjs <id>`, je corrige jusqu'au ✅, et je te montre des captures.
5. **Rapport.** Je te dis en quoi les mécaniques sont neuves et je te laisse décider du commit.

### Deux modes (je te demanderai lequel)
- **Lean (défaut)** : je fais tout moi-même, dans une seule conversation. **Le moins cher en
  tokens.** Recommandé au début.
- **Pipeline** : je délègue à des sous-agents (parallélisme, contexte isolé). Plus robuste pour
  des épisodes compliqués, mais chaque sous-agent "démarre à froid" → plus de tokens. À utiliser
  quand tu le demandes.

> Sois lucide sur les agents : plus d'agents ≠ moins de tokens. Le multi-agent brille pour la
> **séparation** et le **parallélisme**, pas pour l'économie. Ici, l'économie vient surtout des
> docs + du template + du validateur, pas du nombre d'agents. C'est pour ça que le mode Lean est
> le défaut.

---

## 4. Vérifier visuellement une scène (recette Edge headless)

Le navigateur gstack n'est pas compilé sur cette machine, mais Edge suffit pour des captures.
Le rendu doit se faire **avec le CSS de la page** (sinon les hotspots apparaissent en gros ronds
noirs, car leur style vit dans `index.html`). Recette : écrire une petite page qui inclut le
`<style>` de `index.html` + une `<div class="scene-svg">` contenant le SVG, puis :

```
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" \
  --headless=new --disable-gpu --window-size=960,540 --hide-scrollbars \
  --virtual-time-budget=2500 --screenshot=out.png "file:///.../harness.html"
```

(Je m'en occupe automatiquement à l'étape 4 ; c'est ici pour référence.)

---

## 5. Passage à l'échelle (viser 20 enquêtes) — recommandation

Aujourd'hui, toutes les enquêtes vivent dans `index.html`. À 3-4 épisodes c'est encore gérable.
Au-delà (~10+), un seul fichier de 10 000+ lignes devient risqué (une virgule casse tout) et
coûteux à éditer.

**Bascule recommandée le moment venu (je peux la faire quand tu veux) :**
- Garder le **moteur** dans `index.html`.
- Sortir chaque enquête dans `cases/<id>.js`, chargé par une balise
  `<script src="cases/<id>.js"></script>` (fonctionne en ouvrant le fichier localement).
- Chaque fichier se termine par `registerCase({...})` (un mini-helper qui fait le `push` +
  fusionne portraits/noms). Ajouter l'épisode 21 = créer 1 petit fichier + 1 ligne.

Le validateur est **déjà prêt** pour ça : s'il détecte un dossier `cases/`, il l'inclut.
Avantage : chaque enquête est isolée, testée seule, et un bug n'affecte plus les autres.

---

## 6. Fabriquer une enquête SANS agents (si tu veux le faire à la main)

1. Copie `TEMPLATE.case.js`, remplace tous les `<<...>>` (aide-toi de `scenario.example.json`).
2. Colle le bloc dans `index.html` avant `CASES.push(...)`, ajoute `CAS_<X>` à cette ligne.
3. Ajoute tes 6 portraits dans `PORTRAITS` (avant `recit:`) et tes noms dans `NOMS`.
4. Lance `node authoring/validate-case.mjs <id>` et corrige jusqu'au ✅.

Le validateur te dira précisément ce qui manque. C'est le filet de sécurité.

---

## 7. Récap ultra-court

- Bug écran blanc : **corrigé** (via `etatVide`).
- Pour un nouvel épisode : **`/new-episode [thème]`**, tu valides le plan, je code/dessine/teste.
- Robustesse : **`node authoring/validate-case.mjs`** (toutes) ou `... <id>` (une seule).
- Fraîcheur des énigmes : garantie par **`MECHANICS.md`** (à respecter/mettre à jour).
- À ~10 épisodes : me demander la **bascule `cases/*.js`**.
