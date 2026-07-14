---
name: new-episode
description: Crée une nouvelle enquête pour le jeu Mystery Lane (index.html), de l'idée jusqu'au code testé, via un pipeline scénario → code → art → validation. Utiliser quand l'utilisateur veut "ajouter une enquête / un épisode / une nouvelle affaire".
---

# /new-episode — chaîne d'assemblage d'une enquête

Objectif : ajouter une enquête conforme au CONTRACT, **fraîche** (mécaniques neuves), **testée**,
en dépensant le minimum de tokens. Toute la connaissance vit dans `authoring/` — ne relis JAMAIS
tout `index.html`.

Argument optionnel : un thème/décor souhaité (ex "/new-episode une gare de nuit").

## Deux modes — annonce-les et laisse l'utilisateur choisir (AskUserQuestion)

- **Mode Lean (défaut, recommandé pour économiser les tokens)** : TU fais les 4 étapes toi-même,
  dans ce contexte, en lisant les docs `authoring/`. Pas de sous-agents. Le moins cher.
- **Mode Pipeline (robuste / parallélisable)** : tu délègues à des sous-agents
  (`scenario-designer`, puis `case-coder` + `case-artist`). Plus de contexte isolé, mais chaque
  sous-agent démarre "à froid" → surcoût de tokens. À réserver aux épisodes complexes ou quand
  l'utilisateur le demande.

## Étapes (identiques dans les deux modes)

### 1. Scénario (invention)
Produit `authoring/scenario.<id>.json` (format = `authoring/scenario.example.json`) en respectant
`authoring/MECHANICS.md` (fraîcheur). En mode Pipeline : lance l'agent `scenario-designer`.
**STOP** — montre à l'utilisateur le résumé 6 lignes (décor, truc, 2 traits, coupable/mobile) et
demande validation via AskUserQuestion. C'est la revue LA PLUS IMPORTANTE et la moins chère :
on corrige l'idée AVANT de coder. Mets à jour `MECHANICS.md` seulement après accord.

### 2. Code (traduction)
À partir du scénario validé, remplis `authoring/TEMPLATE.case.js` → `authoring/generated/<id>.case.js`
(données + dialogues + logique, **stubs d'art laissés tels quels**). Suffixe unique. Aucun `<<` résiduel.
En mode Pipeline : agent `case-coder`.

### 3. Art
Remplis les fonctions d'art SVG + les 6 portraits (style = enquête dragon). En mode Pipeline : agent
`case-artist`. En mode Lean : fais-le toi-même, en t'inspirant de `artAquarium_D`/`artCarte_D`.

### 4. Intégration + validation (déterministe, ~0 token de raisonnement)
1. Colle le bloc `<id>.case.js` dans `index.html` **juste avant** la ligne `CASES.push(...)`.
2. Ajoute `CAS_<X>` à l'appel `CASES.push(...)`.
3. Insère les 6 portraits dans l'objet `PORTRAITS` (avant `recit:`) et les `NOMS`.
4. Lance **`node authoring/validate-case.mjs <id>`**. S'il échoue : corrige exactement les points
   listés, relance. Ne passe à la suite que sur ✅.
5. Contrôle visuel (facultatif mais recommandé) : rends 2-3 scènes en PNG avec Edge headless
   (voir la recette dans `authoring/GUIDE.md`) et regarde-les.

### 5. Rapport
Résume : id, titre, en quoi les mécaniques sont neuves, résultat du validateur, captures.
Ne commit rien sans que l'utilisateur le demande.

## Garde-fous
- Ne touche PAS aux enquêtes existantes (`_F`, `_D`) ni au moteur.
- Un seul `ok:true` par déduction/preuve ; d5 a `besoinDed` ; union des indices == 12.
- Si le validateur reste rouge après 3 tentatives sur le même point, STOP et remonte le blocage.
- Robustesse à 20 épisodes : si `index.html` devient trop lourd à éditer, propose la bascule
  "un fichier par enquête" décrite dans `authoring/GUIDE.md` (§ Passage à l'échelle).
