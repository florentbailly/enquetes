/* ============================================================
   TEMPLATE D'ENQUÊTE — remplacer chaque <<...>> puis coller ce bloc
   dans index.html JUSTE AVANT la ligne `CASES.push(...)`, et compléter
   cette ligne : CASES.push(CAS_FANTOME, CAS_DRAGON, CAS_<<XXX>>);
   Ajouter aussi les portraits/noms (§ tout en bas). Suffixe unique = _<<X>>.
   Voir CONTRACT.md pour le détail de chaque champ.
   ============================================================ */

/* ---------- INDICES (exactement 12) ---------- */
const IND_<<X>> = {
  t_<<gardien>>:{ ico:"👁️", nom:"Le récit de <<Gardien>>", desc:"<<...>>" },
  <<serrure>>:{ ico:"🔍", nom:"<<Loquet rayé>>", desc:"<<pas cassé, fines rayures>>" },
  <<brillant>>:{ ico:"✨", nom:"<<Indice brillant>>", desc:"<<... dans le noir ça brille>>" },
  <<passage>>:{ ico:"🕳️", nom:"<<Passage étroit>>", desc:"<<...>>" },
  <<indicePassage>>:{ ico:"⭕", nom:"<<Indice du passage>>", desc:"<<...>>" },
  t_<<temoin2>>:{ ico:"🐦", nom:"Le récit de <<Témoin2>>", desc:"<<il ne ___ pas, il ___ !>>" },
  <<traceFuite>>:{ ico:"🧗", nom:"<<Trace de fuite>>", desc:"<<...>>" },
  <<prospectus>>:{ ico:"📜", nom:"<<Prospectus>>", desc:"<<Échoppe de <<Marchand>>>>" },
  <<produit>>:{ ico:"🌙", nom:"<<Produit brillant>>", desc:"<<vendu à un petit client...>>" },
  <<paiement>>:{ ico:"🐚", nom:"<<Payé en ...>>", desc:"<<...>>" },
  <<outil>>:{ ico:"🪝", nom:"<<Outil fin>>", desc:"<<pour ouvrir les serrures>>" },
  <<affiche>>:{ ico:"🎭", nom:"L'affiche du <<Concours>>", desc:"<<le numéro du coupable a raté>>" }
};

/* ---------- SUSPECTS (3) ---------- */
const SUS_<<X>> = {
  <<innocentA>>:{ nom:"<<Nom>>", desc:"<<... + laisse deviner son trait>>" },
  <<innocentB>>:{ nom:"<<Nom>>", desc:"<<...>>" },
  <<coupable>>:{ nom:"<<Nom>>", desc:"<<petit·e, agile, ...>>" }
};

/* ---------- DEDUCTIONS (d1..d5) ---------- */
const DED_<<X>> = {
  d1:{ titre:"Déduction n°1", besoin:["<<brillant>>","t_<<gardien>>"],
    question:"<<Pourquoi ça brillait/bougeait ?>>", resume:"<<Le truc démystifié.>>",
    options:[
      { t:"<<mauvaise (surnaturel)>>", ok:false, r:"<<renvoie vers l'indice brillant>>" },
      { t:"<<BONNE : le truc>>", ok:true, r:"<<valide>>" },
      { t:"<<mauvaise loufoque>>", ok:false, r:"<<...>>" }
    ] },
  d2:{ titre:"Déduction n°2", besoin:["<<passage>>","<<indicePassage>>","t_<<gardien>>"],
    question:"<<Fermé à clé, rien cassé : par où ?>>", resume:"<<passage étroit → trait ; innocentA éliminé>>",
    options:[
      { t:"<<mauvaise>>", ok:false, r:"<<...>>" },
      { t:"<<mauvaise>>", ok:false, r:"<<...>>" },
      { t:"<<BONNE : petit/mou passe le passage>>", ok:true, r:"<<... innocentA trop ___ : rayé !>>" }
    ], apres(){ S.suspects.<<innocentA>>="non"; S.raisons.<<innocentA>>="<<raison courte>>"; } },
  d3:{ titre:"Déduction n°3", besoin:["<<traceFuite>>","t_<<temoin2>>"],
    question:"<<Comment s'est-il enfui ?>>", resume:"<<mode de fuite → trait ; innocentB éliminé>>",
    options:[
      { t:"<<mauvaise>>", ok:false, r:"<<...>>" },
      { t:"<<BONNE : mode de fuite>>", ok:true, r:"<<... innocentB ne peut pas : rayé !>>" },
      { t:"<<mauvaise>>", ok:false, r:"<<...>>" }
    ], apres(){ S.suspects.<<innocentB>>="non"; S.raisons.<<innocentB>>="<<raison courte>>"; } },
  d4:{ titre:"Déduction n°4", besoin:["<<outil>>","<<serrure>>"],
    question:"<<Ouvert sans casser : comment ?>>", resume:"<<l'outil fin a laissé les rayures>>",
    options:[
      { t:"<<mauvaise (magie)>>", ok:false, r:"<<...>>" },
      { t:"<<mauvaise (force brute)>>", ok:false, r:"<<...>>" },
      { t:"<<BONNE : l'outil fin>>", ok:true, r:"<<les rayures correspondent à l'outil>>" }
    ] },
  d5:{ titre:"La grande déduction", besoin:["<<produit>>","<<paiement>>","<<outil>>","<<affiche>>"], besoinDed:["d1","d2","d3","d4"],
    question:"<<Récap des traits... QUI est le coupable ?>>", resume:"<<Le coupable est X : traits + client du marchand.>>",
    options:[
      { t:"<<innocentA nom>>", ok:false, r:"<<impossible car d2>>" },
      { t:"<<innocentB nom>>", ok:false, r:"<<impossible car d3>>" },
      { t:"<<Coupable nom>>", ok:true, r:"<<tout se recoupe !>>" }
    ], apres(){ S.suspects.<<coupable>>="coupable"; } }
};
const ORD_<<X>> = ["d1","d2","d3","d4","d5"];

/* ---------- PREUVES (3, confrontation) ---------- */
const PRV_<<X>> = [
  { question:"« Tu <<brillais>> parce que couvert·e de... »",
    options:[
      { t:"📜 ...<<leurre>>", ok:false, r:"<<...>>" },
      { t:"🌙 ...<<produit>>", ok:true, r:"<<...>>" },
      { t:"🐚 ...<<leurre>>", ok:false, r:"<<...>>" } ] },
  { question:"« Tu es passé·e par <<le passage>>, où tu as laissé... »",
    options:[
      { t:"🎭 ...<<leurre>>", ok:false, r:"<<...>>" },
      { t:"🪝 ...<<leurre>>", ok:false, r:"<<...>>" },
      { t:"⭕ ...<<indicePassage>>", ok:true, r:"<<...>>" } ] },
  { question:"« Et tu as ouvert <<la vitrine>> grâce à... »",
    options:[
      { t:"🐚 ...<<leurre>>", ok:false, r:"<<...>>" },
      { t:"🪝 ...<<outil>>", ok:true, r:"<<...>>" },
      { t:"🌙 ...<<leurre>>", ok:false, r:"<<...>>" } ] }
];

/* ---------- LIEUX (4) ---------- */
const LIEUX_<<X>> = {
  <<lieu1>>:{ nom:"<<Le lieu du crime>>", indices:["t_<<gardien>>","<<serrure>>","<<brillant>>","<<passage>>","<<indicePassage>>"], deds:["d1","d2"] },
  <<lieu2>>:{ nom:"<<Le lieu de fuite>>", indices:["t_<<temoin2>>","<<traceFuite>>","<<prospectus>>"], deds:["d3"] },
  <<lieu3>>:{ nom:"<<L'échoppe>>", indices:["<<produit>>","<<paiement>>","<<outil>>","<<affiche>>"], deds:["d4","d5"] },
  <<lieuFinal>>:{ nom:"<<Le lieu final>>", indices:[], deds:[] }
};

/* ---------- ART (l'AGENT ARTISTE remplit ces corps ; stubs valides ci-dessous) ----------
   Chaque fonction doit renvoyer une chaîne SVG viewBox="0 0 960 540".
   Utiliser les helpers moteur : etoiles(), lune(x,y,r), brume(), hotspot(id,x,y,"",label,r).
   S'inspirer de artAquarium_D / artCarte_D dans index.html pour le style. */
function artTitre_<<X>>(){ return `<svg viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice"><rect width="960" height="540" fill="#131a3d"/>${etoiles()}${lune(150,100,50)}</svg>`; }
function artQG_<<X>>(m){ return artQG(m); /* réutilise le QG générique OU dessine le tien avec PORTRAITS des 3 suspects */ }
function artIntro1_<<X>>(){ return `<svg viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice"><rect width="960" height="540" fill="#131a3d"/></svg>`; }
function artIntro2_<<X>>(){ return `<svg viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice"><rect width="960" height="540" fill="#131a3d"/></svg>`; }
function artCarte_<<X>>(){ /* voir artCarte_D : fond + noeud(id,x,y,label,ico) pour 4 lieux + QG */ return artCarte_D_placeholder(); }
function art<<Lieu1>>_<<X>>(){ return `<svg viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice"><rect width="960" height="540" fill="#131a3d"/>${hotspot("<<hs>>",480,270,"","<<label>>",50)}</svg>`; }
function art<<Lieu2>>_<<X>>(){ return `<svg viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice"><rect width="960" height="540" fill="#131a3d"/></svg>`; }
function art<<Lieu3>>_<<X>>(){ return `<svg viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice"><rect width="960" height="540" fill="#131a3d"/></svg>`; }
function art<<LieuFinal>>_<<X>>(o={}){ return `<svg viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice"><rect width="960" height="540" fill="#131a3d"/></svg>`; }
function artFin_<<X>>(){ return `<svg viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice"><rect width="960" height="540" fill="#131a3d"/></svg>`; }

/* ---------- LOGIQUE ---------- */
function verif_<<X>>(){
  if(S.deductions.d1 && S.deductions.d2 && !S.faits.vers2){ S.faits.vers2=true; S.lieux.<<lieu2>>="ouvert"; sauver();
    dire([{p:"mcflare",t:"<<...>>"},{p:"clever",t:"<<...>>"}], ()=>{ toast("🗺️ Nouveau lieu : <<lieu2>> !"); allerCarte(); }); return true; }
  if(S.deductions.d3 && S.indices.includes("<<prospectus>>") && !S.faits.vers3){ S.faits.vers3=true; S.lieux.<<lieu3>>="ouvert"; sauver();
    dire([{p:"clever",t:"<<...>>"},{p:"bro",t:"<<...>>"}], ()=>{ toast("🗺️ Nouveau lieu : <<lieu3>> !"); allerCarte(); }); return true; }
  if(S.deductions.d3 && !S.indices.includes("<<prospectus>>") && !S.faits.astuce){ S.faits.astuce=true; sauver();
    dire([{p:"clever",t:"<<Il manque une piste, fouillons encore le lieu2 !>>"}]); return true; }
  if(S.deductions.d5 && !S.faits.versFinal){ S.faits.versFinal=true; S.lieux.<<lieuFinal>>="ouvert"; sauver();
    dire([{p:"mcflare",t:"<<...>>"},{p:"clever",t:"<<...>>"}], ()=>{ toast("🗺️ Nouveau lieu : <<lieuFinal>> !"); allerCarte(); }); return true; }
  return false;
}
function briefing_<<X>>(){
  S.ecran="lieu"; S.lieu=null; majUI();
  montrer(`<div class="scene-svg">${artQG_<<X>>(true)}</div>`);
  dire([
    {p:"mcflare", t:"<<Le trophée a disparu... porte fermée, un témoin parle de <<phénomène>> !>>"},
    {p:"bro", t:"<<Un ___ ?! Chouette ! euh... au secours.>>"},
    {p:"clever", t:"<<Les ___ n'existent pas. McFlare : qui rêvait du trophée ?>>"},
    {p:"mcflare", t:"<<Les trois finalistes : A, B et C.>>"},
    {p:"clever", t:"<<Nos suspects ! Direction <<lieu1>>.>>"}
  ], ()=>{ S.faits.brief=true; S.lieux.<<lieu1>>="ouvert"; carnetAlerte=true; sauver();
    toast("📓 Trois suspects notés dans le carnet !"); allerCarte();
    setTimeout(()=>toast("👆 Touche les endroits qui brillent pour enquêter !"),3400); });
}
const ENTREES_<<X>> = {
  <<lieu1>>:[{p:"clever",t:"<<... touche les endroits qui brillent.>>"},{p:"bro",t:"<<Compris chef !>>"}],
  <<lieu2>>:[{p:"clever",t:"<<...>>"}],
  <<lieu3>>:[{p:"bro",t:"<<...>>"},{p:"clever",t:"<<... interroger <<Marchand>>.>>"}]
};
function toucher_<<X>>(id){
  if(id==="maison"){ dire([{p:"bro",t:"<<...>>"},{p:"clever",t:"<<... une enquête nous attend !>>"}]); return; }
  if(id==="<<hsGardien>>"){ dire([ /*<<récit gardien>>*/ ], ()=>{ ajouterIndice("t_<<gardien>>"); marque("h_<<hsGardien>>"); }); return; }
  if(id==="<<hsSerrure>>"){ dire([ /*<<...>>*/ ], ()=>{ ajouterIndice("<<serrure>>"); marque("h_<<hsSerrure>>"); }); return; }
  if(id==="<<hsBrillant>>"){ dire([ /*<<...>>*/ ], ()=>{ ajouterIndice("<<brillant>>"); marque("h_<<hsBrillant>>"); }); return; }
  if(id==="<<hsPassage>>"){
    if(S.faits.h_<<hsPassage>>){ dire([{p:"clever",t:"<<déjà fait>>"}]); return; }
    dire([{p:"clever",t:"<<trop étroit pour moi, Bro ?>>"},{p:"bro",t:"<<Mission acceptée !>>"}], ()=>{
      choisir({p:"clever",t:"À toi de choisir, Bro..."},[
        { t:"<<option A>>", fn:()=>mission_<<X>>([{p:"bro",t:"<<...>>"}]) },
        { t:"<<option B>>", fn:()=>mission_<<X>>([{p:"recit",t:"<<...>>"}]) },
        { t:"<<option C>>", fn:()=>mission_<<X>>([{p:"bro",t:"<<...>>"}]) } ]); }); return; }
  if(id==="<<hsTemoin2>>"){ dire([ /*<<...>>*/ ], ()=>{ ajouterIndice("t_<<temoin2>>"); marque("h_<<hsTemoin2>>"); }); return; }
  if(id==="<<hsTrace>>"){ dire([ /*<<...>>*/ ], ()=>{ ajouterIndice("<<traceFuite>>"); marque("h_<<hsTrace>>"); }); return; }
  if(id==="<<hsCaisse>>"){ dire([ /*<<... trouve prospectus>>*/ ], ()=>{ ajouterIndice("<<prospectus>>"); marque("h_<<hsCaisse>>"); setTimeout(verifierProgression,400); }); return; }
  if(id==="<<hsMarchand>>"){ dire([ /*<<interrogatoire>>*/ ], ()=>{ ajouterIndice("<<produit>>"); ajouterIndice("<<paiement>>"); ajouterIndice("<<outil>>"); marque("h_<<hsMarchand>>"); }); return; }
  if(id==="<<hsAffiche>>"){ dire([ /*<<...>>*/ ], ()=>{ ajouterIndice("<<affiche>>"); marque("h_<<hsAffiche>>"); }); return; }
}
function mission_<<X>>(gag){ dire(gag.concat([
    {p:"bro",t:"<<trouve l'indice du passage>>"},{p:"clever",t:"<<bien joué>>"}
  ]), ()=>{ ajouterIndice("<<passage>>"); ajouterIndice("<<indicePassage>>"); marque("h_<<hsPassage>>"); }); }

function confrontation_<<X>>(){
  S.ecran="lieu"; S.lieu="<<lieuFinal>>"; majUI();
  montrer(`<div class="scene-svg">${art<<LieuFinal>>_<<X>>()}</div>`);
  dire([
    {p:"<<coupable>>",t:"<<... Clever ?! Que faites-vous ici ?>>"},
    {p:"clever",t:"<<Nous venons applaudir... le <<phénomène>>.>>"},
    {p:"<<coupable>>",t:"<<Le quoi ? Je ne vois pas de quoi vous parlez !>>"},
    {p:"clever",t:"<<Vérifions ma logique. Détective, choisis la bonne preuve !>>"}
  ], ()=>preuve(0, fuite_<<X>>));
}
function fuite_<<X>>(){
  dire([{p:"<<coupable>>",t:"<<VOUS NE M'ATTRAPEREZ JAMAIS !>>"},{p:"recit",t:"<<... file vers ___ !>>"}], ()=>{
    choisir({p:"clever",t:"<<Vite Bro ! Que fais-tu ?>>"},[
      { t:"<<leurre>>", fn:()=>dire([{p:"bro",t:"<<...>>"},{p:"recit",t:"<<raté>>"}], fuite2_<<X>>) },
      { t:"🕸️ <<prop gagnant>> !", fn:reussite_<<X>> },
      { t:"<<leurre>>", fn:()=>dire([{p:"bro",t:"<<...>>"},{p:"recit",t:"<<raté>>"}], fuite2_<<X>>) } ]); });
}
function fuite2_<<X>>(){
  choisir({p:"clever",t:"<<Réfléchis : qu'y a-t-il au-dessus ?>>"},[
    { t:"🕸️ <<prop gagnant>> !", fn:reussite_<<X>> },
    { t:"<<le leurre encore>>", fn:()=>dire([{p:"mcflare",t:"<<N'y pense même pas, Bro.>>"}], fuite2_<<X>>) } ]);
}
function reussite_<<X>>(){ son("bon");
  dire([
    {p:"bro",t:"<<prop gagnant ! GERONIMO !>>"},
    {p:"recit",t:"<<le coupable est attrapé en douceur>>"},
    {p:"mcflare",t:"<<... vous êtes fait·e comme un rat.>>"},
    {p:"<<coupable>>",t:"<<D'accord... c'était moi. Mais laissez-moi expliquer !>>"},
    {p:"<<coupable>>",t:"<<mon numéro a raté, tout le monde a ri...>>"},
    {p:"<<coupable>>",t:"<<je voulais prouver que j'étais un·e VRAI·E ___. J'allais le rendre !>>"},
    {p:"clever",t:"<<Faire disparaître c'est facile. Le vrai talent, c'est faire APPARAÎTRE. En spectacle ?>>"},
    {p:"<<coupable>>",t:"<<Vous feriez ça pour moi ?>>"},
    {p:"recit",t:"<<Le lendemain : ABRACADABRA ! Le trophée réapparaît sous les applaudissements.>>"},
    {p:"mcflare",t:"<<Affaire classée. Chapeau, Clever !>>"},
    {p:"bro",t:"<<... et chapeau pour le coupable !>>"}
  ], finirPartie);
}
const INTRO_<<X>> = [
  { art:artIntro1_<<X>>, t:"<<Londres, la nuit. Au ___ dort le ___ (trophée).>>" },
  { art:artIntro2_<<X>>, t:"<<Mais cette nuit... <<phénomène>> ! Au matin, ___ vide. Le gardien : « J'ai vu un ___ ! »>>" },
  { art:()=>artQG_<<X>>(true), t:"<<Scotland Yard n'y croit pas. McFlare file à Mystery Lane.>>" }
];

/* ---------- OBJET CAS + ENREGISTREMENT ---------- */
const CAS_<<X>> = {
  id:"<<id>>", cle:"<<cle>>", emoji:"<<emoji>>", titre:"<<titre>>", accroche:"<<accroche>>",
  lieuFinal:"<<lieuFinal>>", libelleCoupable:"<<C'est le ___ !>>",
  indices:IND_<<X>>, suspects:SUS_<<X>>, deductions:DED_<<X>>, ordreDed:ORD_<<X>>, preuves:PRV_<<X>>, lieux:LIEUX_<<X>>,
  etatNeuf:()=>({ suspects:{ <<innocentA>>:"?", <<innocentB>>:"?", <<coupable>>:"?" },
                  lieux:{ <<lieu1>>:"verrou", <<lieu2>>:"verrou", <<lieu3>>:"verrou", <<lieuFinal>>:"verrou" } }),
  intro:INTRO_<<X>>, briefing:briefing_<<X>>, verif:verif_<<X>>, toucher:toucher_<<X>>, confrontation:confrontation_<<X>>, entrees:ENTREES_<<X>>,
  art:{ titre:artTitre_<<X>>, carte:artCarte_<<X>>, fin:artFin_<<X>>,
        lieux:{ <<lieu1>>:art<<Lieu1>>_<<X>>, <<lieu2>>:art<<Lieu2>>_<<X>>, <<lieu3>>:art<<Lieu3>>_<<X>> } }
};

/* PORTRAITS à ajouter dans l'objet PORTRAITS (avant `recit:`) :
   <<gardien>>:`<svg viewBox="0 0 100 100">...</svg>`, <<temoin2>>:`...`, <<marchand>>:`...`,
   <<innocentA>>:`...`, <<innocentB>>:`...`, <<coupable>>:`...`
   NOMS à ajouter dans l'objet NOMS :
   <<gardien>>:"...", <<temoin2>>:"...", <<marchand>>:"...", <<innocentA>>:"...", <<innocentB>>:"...", <<coupable>>:"..." */
