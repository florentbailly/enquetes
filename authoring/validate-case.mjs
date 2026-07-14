/* ============================================================
   VALIDATEUR D'ENQUÊTES — robustesse sans coût de tokens
   Usage :  node authoring/validate-case.mjs           (valide toutes les enquêtes)
            node authoring/validate-case.mjs dragon     (valide une seule enquête)
   Sort en code 1 si un problème est trouvé (utilisable en pré-commit / CI).
   Fonctionne en évaluant index.html dans un bac à sable (stubs DOM), sans navigateur.
   ============================================================ */
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const only = process.argv[2] || null;
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
let code = (html.match(/<script>([\s\S]*)<\/script>/) || [])[1];
if (!code) { console.error("Aucun <script> trouvé dans index.html"); process.exit(1); }
// future-proof : si des enquêtes sont dans cases/*.js, on les concatène aussi
const casesDir = path.join(root, "cases");
if (fs.existsSync(casesDir)) for (const f of fs.readdirSync(casesDir).filter(f => f.endsWith(".js")))
  code += "\n;" + fs.readFileSync(path.join(casesDir, f), "utf8");

/* ---- bac à sable ---- */
const noop = () => {};
const el = new Proxy({}, { get: (t, p) => p === "style" ? {} : (p === "classList" ? { add: noop, remove: noop, toggle: noop } : ((p === "textContent" || p === "innerHTML") ? "" : noop)), set: () => true });
const ctx = vm.createContext({
  document: { querySelector: () => el, querySelectorAll: () => [], createElement: () => el, getElementById: () => el },
  window: { addEventListener: noop }, localStorage: { getItem: () => null, setItem: noop }, setTimeout: noop,
  AudioContext: function () { return { createOscillator: () => ({ connect: noop, start: noop, stop: noop, frequency: {} }), createGain: () => ({ connect: noop, gain: { setValueAtTime: noop, exponentialRampToValueAtTime: noop } }), currentTime: 0, destination: {} }; }
});
try { vm.runInContext(code, ctx); } catch (e) { console.error("ERREUR DE SYNTAXE / EXÉCUTION :", e.message); process.exit(1); }
const run = j => vm.runInContext(j, ctx);
const CASES = ctx.CASES || run("CASES");
const PORTRAITS = run("PORTRAITS"), NOMS = run("NOMS");

/* ---- checks ---- */
const errs = [];
const E = (id, m) => errs.push(`[${id}] ${m}`);
const REQUIRED = ["id","cle","emoji","titre","accroche","lieuFinal","libelleCoupable","indices","suspects","deductions","ordreDed","preuves","lieux","etatNeuf","intro","briefing","verif","toucher","confrontation","entrees","art"];

const seenId = new Set(), seenCle = new Set(), seenIndice = new Set();
const targets = only ? CASES.filter(c => c.id === only) : CASES;
if (only && !targets.length) { console.error(`Enquête "${only}" introuvable. Dispo : ${CASES.map(c=>c.id).join(", ")}`); process.exit(1); }

function wellFormed(svg, id, label) {
  const stack = []; const re = /<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g; let m;
  while ((m = re.exec(svg))) { const close = m[1] === "/", name = m[2], self = m[4] === "/";
    if (close) { const top = stack.pop(); if (top !== name) E(id, `SVG ${label} : balise </${name}> ne ferme pas <${top||"rien"}>`); }
    else if (!self) stack.push(name); }
  if (stack.length) E(id, `SVG ${label} : balises non fermées ${stack.join(",")}`);
  if (!/<svg/.test(svg)) E(id, `SVG ${label} : pas de <svg>`);
}

for (const c of targets) {
  const id = c.id || "??";
  for (const k of REQUIRED) if (!(k in c)) E(id, `champ obligatoire manquant : ${k}`);
  // unicité globale
  if (seenId.has(c.id)) E(id, `id en double`); seenId.add(c.id);
  if (seenCle.has(c.cle)) E(id, `clé de sauvegarde en double : ${c.cle}`); seenCle.add(c.cle);

  const ind = c.indices || {}, ded = c.deductions || {}, lieux = c.lieux || {}, sus = c.suspects || {};
  const indKeys = Object.keys(ind);
  if (indKeys.length !== 12) E(id, `${indKeys.length} indices (attendu 12)`);
  for (const k of indKeys) { if (seenIndice.has(k) && !only) E(id, `clé d'indice en collision avec une autre enquête : ${k}`); seenIndice.add(k);
    const i = ind[k]; if (!i.ico || !i.nom || !i.desc) E(id, `indice ${k} incomplet (ico/nom/desc)`); }

  // suspects : 3, portraits + noms présents, exactement 1 coupable après chaîne
  const susIds = Object.keys(sus);
  if (susIds.length !== 3) E(id, `${susIds.length} suspects (attendu 3)`);
  for (const s of susIds) { if (!PORTRAITS[s]) E(id, `PORTRAITS manquant pour le suspect "${s}"`); if (!NOMS[s]) E(id, `NOMS manquant pour "${s}"`); if (!sus[s].nom || !sus[s].desc) E(id, `suspect ${s} incomplet`); }

  // déductions
  const ord = c.ordreDed || [];
  if (ord.length !== 5) E(id, `${ord.length} déductions (attendu 5)`);
  for (const dk of ord) { const d = ded[dk]; if (!d) { E(id, `déduction ${dk} absente`); continue; }
    const nok = (d.options||[]).filter(o => o.ok).length;
    if (nok !== 1) E(id, `déduction ${dk} a ${nok} bonne(s) réponse(s) (attendu 1)`);
    for (const b of (d.besoin||[])) if (!ind[b]) E(id, `déduction ${dk} : indice requis inconnu "${b}"`);
    if (d.besoinDed) for (const bd of d.besoinDed) if (!ded[bd]) E(id, `déduction ${dk} : besoinDed inconnu "${bd}"`);
  }
  if (ded.d5 && !(ded.d5.besoinDed||[]).length) E(id, `d5 devrait avoir besoinDed:["d1".."d4"]`);

  // preuves : 3, une bonne chacune
  const prv = c.preuves || [];
  if (prv.length !== 3) E(id, `${prv.length} preuves (attendu 3)`);
  prv.forEach((p, i) => { const nok = (p.options||[]).filter(o => o.ok).length; if (nok !== 1) E(id, `preuve ${i} a ${nok} bonne(s) (attendu 1)`); });

  // lieux : union == tous les indices ; final vide ; art couvre les non-finals
  const lieuIds = Object.keys(lieux);
  if (lieuIds.length !== 4) E(id, `${lieuIds.length} lieux (attendu 4)`);
  if (!lieux[c.lieuFinal]) E(id, `lieuFinal "${c.lieuFinal}" absent des lieux`);
  const union = new Set(); for (const lk of lieuIds) { for (const x of (lieux[lk].indices||[])) { if (!ind[x]) E(id, `lieu ${lk} : indice inconnu "${x}"`); union.add(x); } for (const dd of (lieux[lk].deds||[])) if (!ded[dd]) E(id, `lieu ${lk} : déduction inconnue "${dd}"`); }
  for (const k of indKeys) if (!union.has(k)) E(id, `indice "${k}" jamais ramassable (absent des lieux)`);
  for (const lk of lieuIds) if (lk !== c.lieuFinal && !(c.art?.lieux||{})[lk]) E(id, `art.lieux manque une scène pour "${lk}"`);

  // état neuf cohérent
  let en; try { en = c.etatNeuf(); } catch (e) { E(id, `etatNeuf() plante : ${e.message}`); en = {}; }
  for (const s of susIds) if ((en.suspects||{})[s] !== "?") E(id, `etatNeuf : suspect ${s} devrait valoir "?"`);

  // rendu de tout l'art (dans un état neutre) + well-formed
  try { run(`activerCas(CASES.find(c=>c.id==="${c.id}")); S=Object.assign(etatVide(false), CAS.etatNeuf()); Object.keys(S.lieux).forEach(k=>S.lieux[k]="ouvert");`);
    for (const a of ["titre","carte","fin"]) { try { wellFormed(c.art[a](), id, a); } catch (e) { E(id, `art.${a} plante : ${e.message}`); } }
    for (const lk of Object.keys(c.art.lieux)) { try { wellFormed(c.art.lieux[lk](), id, lk); } catch (e) { E(id, `art.lieux.${lk} plante : ${e.message}`); } }
    (c.intro||[]).forEach((s,i) => { try { wellFormed(s.art(), id, "intro"+i); } catch (e) { E(id, `intro[${i}].art plante : ${e.message}`); } });
  } catch (e) { E(id, `activation impossible : ${e.message}`); }
}

/* ---- rapport ---- */
if (errs.length) { console.error(`❌ ${errs.length} problème(s) :\n` + errs.map(e => "  - " + e).join("\n")); process.exit(1); }
console.log(`✅ OK — ${targets.length} enquête(s) valide(s) : ${targets.map(c => c.id).join(", ")}`);
