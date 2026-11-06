/* ==========================================================================
   Autovalutazione / Self-assessment: motore comune dei siti dei moduli
   (Fabio Furini, collana «Materiale didattico»). Specifica: QUIZ_SPEC.md.

   La pagina contiene
     <div id="quiz-app" class="quiz-app" data-modulo="<modulo>"
          data-banca="../quiz/" data-lang="en" data-capitoli='{"slug":"Title"}'></div>
   Il motore carica <banca>domande.json (fetch) e <banca>generatori.js
   (window.QUIZ_GEN[modulo]), costruisce un facsimile con lo schema 8+2+1+1+1
   (33 punti) da un seme (?seed=… per riprodurlo), mostra una domanda alla volta
   e alla fine il risultato. Storico solo in localStorage. Nessun dato inviato.
   Vanilla JS, nessuna libreria: solo MathJax del sito (se c'è).
   ========================================================================== */
(function () {
  "use strict";

  // ------------------------------------------------------------ schema (QUIZ_SPEC)
  var SCHEMA = [
    { livello: "facile", quante: 8, punti: 2 },
    { livello: "media", quante: 2, punti: 4 },
    { livello: "teorema", quante: 1, punti: 2 },
    { livello: "ipotesi", quante: 1, punti: 2 },
    { livello: "complessa", quante: 1, punti: 5 }
  ];
  var PUNTI = {}; SCHEMA.forEach(function (s) { PUNTI[s.livello] = s.punti; });
  var ERRATA = -1;
  var PRATICA_MAX = 10;
  var STORICO_MAX = 30;
  var LETTERE = ["A", "B", "C", "D"];

  // ------------------------------------------------------------ testi
  var T = {
    it: {
      titoloInizio: "Facsimile d'esame",
      intro: "Ogni facsimile è nuovo: 13 domande a risposta multipla (8 facili, 2 medie, 1 teorema, 1 ipotesi, 1 complessa), 33 punti. Risposta giusta: i punti della domanda; errata: −1; in bianco: 0. Una domanda alla volta, senza tornare indietro.",
      inizia: "Inizia un facsimile", altro: "Prova un altro facsimile", rifai: "Rifai lo stesso facsimile",
      pratica: "Esercitati per capitolo", praticaIntro: "Fino a 10 domande di un capitolo, con la soluzione subito dopo ogni risposta. Non entra nello storico.",
      scegliCap: "Capitolo", iniziaPratica: "Inizia l'esercitazione", tuttiCap: "— scegli un capitolo —",
      seme: "Seme", semeAiuto: "Lo stesso seme ridà lo stesso facsimile: aggiungi ?seed=",
      domanda: "Domanda", di: "di", punti: "punti", punto: "punto",
      bianco: "Lascio in bianco", conferma: "Conferma", avanti: "Avanti", fine: "Vedi il risultato",
      scegliPrima: "Scegli una risposta oppure «Lascio in bianco».",
      livelli: { facile: "facile", media: "media", teorema: "teorema", ipotesi: "ipotesi", complessa: "complessa" },
      risultato: "Risultato", trentesimi: "in trentesimi", giuste: "giuste", errate: "errate", bianche: "in bianco",
      riepilogo: "Riepilogo", colN: "N.", colLiv: "Livello", colCap: "Capitolo", colData: "Data", colGiusta: "Giusta", colPunti: "Punti",
      data: "La tua risposta", giusta: "Risposta giusta", spiegazione: "Spiegazione", rivedi: "Rivedi nelle dispense",
      esitoG: "giusta", esitoE: "errata", esitoB: "in bianco", nessuna: "—",
      dettaglio: "Le domande, una per una",
      storico: "I tuoi tentativi", storicoVuoto: "Nessun tentativo ancora (lo storico resta solo in questo browser).",
      quando: "Quando", cancella: "Cancella lo storico", cancellaConf: "Cancellare lo storico dei tentativi?",
      carico: "Carico le domande…", nonDisp: "Le domande di autovalutazione di questo modulo non sono ancora disponibili.",
      pochi: "Attenzione: per alcuni livelli non ci sono abbastanza domande; il facsimile ne ha meno di 13.",
      praticaTit: "Esercitazione", corretta: "Giusta!", sbagliata: "Non è giusta.", inBianco: "Lasciata in bianco.",
      praticaFine: "Esercitazione finita", praticaPunt: "risposte giuste su",
      tornaInizio: "Torna all'inizio", avanzamento: "Avanzamento", privacy: "Nessun dato lascia il tuo computer."
    },
    en: {
      titoloInizio: "Mock exam",
      intro: "Every mock exam is new: 13 multiple-choice questions (8 easy, 2 medium, 1 theorem, 1 hypotheses, 1 complex), 33 points. Right answer: the points of the question; wrong: −1; blank: 0. One question at a time, with no going back.",
      inizia: "Start a mock exam", altro: "Try another mock", rifai: "Retake the same mock",
      pratica: "Practice by chapter", praticaIntro: "Up to 10 questions on one chapter, with the solution right after each answer. Not saved in the history.",
      scegliCap: "Chapter", iniziaPratica: "Start practising", tuttiCap: "— choose a chapter —",
      seme: "Seed", semeAiuto: "The same seed gives the same mock exam again: add ?seed=",
      domanda: "Question", di: "of", punti: "points", punto: "point",
      bianco: "Leave blank", conferma: "Confirm", avanti: "Next", fine: "See the result",
      scegliPrima: "Choose an answer or «Leave blank».",
      livelli: { facile: "easy", media: "medium", teorema: "theorem", ipotesi: "hypotheses", complessa: "complex" },
      risultato: "Result", trentesimi: "out of 30", giuste: "right", errate: "wrong", bianche: "blank",
      riepilogo: "Summary", colN: "No.", colLiv: "Level", colCap: "Chapter", colData: "Given", colGiusta: "Correct", colPunti: "Points",
      data: "Your answer", giusta: "Correct answer", spiegazione: "Explanation", rivedi: "Review in the notes",
      esitoG: "right", esitoE: "wrong", esitoB: "blank", nessuna: "—",
      dettaglio: "The questions, one by one",
      storico: "Your attempts", storicoVuoto: "No attempts yet (the history stays in this browser only).",
      quando: "When", cancella: "Clear the history", cancellaConf: "Clear the history of attempts?",
      carico: "Loading the questions…", nonDisp: "The self-assessment questions of this module are not available yet.",
      pochi: "Note: some levels do not have enough questions; this mock exam has fewer than 13.",
      praticaTit: "Practice", corretta: "Right!", sbagliata: "Not right.", inBianco: "Left blank.",
      praticaFine: "Practice finished", praticaPunt: "right answers out of",
      tornaInizio: "Back to the start", avanzamento: "Progress", privacy: "No data leaves your computer."
    }
  };

  // ------------------------------------------------------------ utilità
  /** mulberry32: generatore deterministico, numeri in [0,1) */
  function mulberry32(a) {
    a = a >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  /** un seme derivato (per domanda, per tentativo) da un seme e da una stringa */
  function derivato(seme, chiave) {
    var h = 2166136261 ^ (seme >>> 0);
    for (var i = 0; i < chiave.length; i++) { h ^= chiave.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function mescola(a, rng) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function el(tag, attr, figli) {
    var e = document.createElement(tag);
    if (attr) Object.keys(attr).forEach(function (k) {
      if (k === "text") e.textContent = attr[k];
      else if (k === "html") {
        // mathjax.js della collana compone solo dentro .arithmatex; sempre su uno <span>: Material dà ai figli
        // di div.arithmatex larghezza min-content e margini automatici (pensati per le formule display)
        var sp = tag === "span" ? e : e.appendChild(document.createElement("span"));
        sp.innerHTML = attr[k]; sp.classList.add("arithmatex");
      }
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), attr[k]);
      else if (attr[k] !== false && attr[k] != null) e.setAttribute(k, attr[k] === true ? "" : attr[k]);
    });
    (figli || []).forEach(function (f) { if (f != null) e.appendChild(typeof f === "string" ? document.createTextNode(f) : f); });
    return e;
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  var TAG_OK = /^<\/?(b|strong|i|em|u|br|code|sub|sup|small|p|ul|ol|li|table|thead|tbody|tr|td|th|span|div|pre)(\s+(class|style|colspan|rowspan|align)="[^"<>]*")*\s*\/?>$/i;
  /** testo di una domanda → HTML: la matematica ($…$, $$…$$, \(…\), \[…\]) passa intatta ma con < > & sfuggiti
      (MathJax li legge dal testo), fuori dalla matematica pochi tag ammessi, **grassetto**, `codice`, a capo. */
  function formatta(s) {
    s = String(s == null ? "" : s);
    // prima il codice (```…``` e `…`: HTML sfuggito, niente matematica né grassetto dentro), poi la matematica
    var re = /(```[\s\S]+?```|`[^`\n]+`|\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$(?:\\\$|[^$])+?\$)/g, out = "", ultimo = 0, m;
    function testo(t) {
      return t.split(/(<[^<>]*>)/).map(function (p) { return TAG_OK.test(p) ? p : esc(p); }).join("")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");
    }
    while ((m = re.exec(s))) {
      var x = m[0];
      out += testo(s.slice(ultimo, m.index));
      if (x.slice(0, 3) === "```") out += "<pre><code>" + esc(x.slice(3, -3).replace(/^[a-z]*\n/, "")) + "</code></pre>";
      else if (x.charAt(0) === "`") out += "<code>" + esc(x.slice(1, -1)) + "</code>";
      else out += esc(x);
      ultimo = re.lastIndex;
    }
    return out + testo(s.slice(ultimo));
  }
  function leggi(chiave) {
    try { var v = window.localStorage.getItem(chiave); return v ? JSON.parse(v) : null; } catch (e) { return null; }
  }
  function scrivi(chiave, v) {
    try { window.localStorage.setItem(chiave, JSON.stringify(v)); return true; } catch (e) { return false; }
  }
  function cancellaChiave(chiave) {
    try { window.localStorage.removeItem(chiave); } catch (e) { /* niente */ }
  }
  function numero(x, lingua) {
    var s = (Math.round(x * 10) / 10).toFixed(1).replace(/\.0$/, "");
    return lingua === "it" ? s.replace(".", ",") : s;
  }
  /** compone le formule di un nodo: la coda di mathjax.js della collana se c'è, se no MathJax.typesetPromise */
  function componi(nodo) {
    try {
      if (typeof window.componiFormule === "function") return Promise.resolve(window.componiFormule([nodo]));
      if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
        if (window.MathJax.typesetClear) window.MathJax.typesetClear([nodo]);
        return window.MathJax.typesetPromise([nodo]).catch(function (e) { console.warn("MathJax:", e); });
      }
    } catch (e) { console.warn("MathJax:", e); }
    return Promise.resolve();
  }
  function caricaScript(url) {
    return new Promise(function (ok) {
      var s = document.createElement("script");
      s.src = url; s.async = true;
      s.onload = function () { ok(true); };
      s.onerror = function () { ok(false); };
      document.head.appendChild(s);
    });
  }
  /** la cartella del sito, ricavata dall'indirizzo di questo script (…/javascripts/quiz.js): vale anche dopo la
   *  navigazione istantanea di Material, quando #__config resta quello della prima pagina aperta (2026-11-06) */
  var SCRIPT_QUIZ = (document.currentScript && document.currentScript.src) || "";
  function baseBanca(radice) {
    var rel = radice.getAttribute("data-banca");
    if (rel) return new URL(rel, location.href).href;
    var src = SCRIPT_QUIZ;
    if (!src) {
      var tag = Array.prototype.find.call(document.getElementsByTagName("script"), function (x) {
        return /javascripts\/quiz\.js/.test(x.src || "");
      });
      src = tag ? tag.src : "";
    }
    if (src) return new URL("../quiz/", src).href;
    try {
      var cfg = document.getElementById("__config");
      var base = JSON.parse(cfg.textContent).base || ".";
      return new URL(base.replace(/\/?$/, "/") + "quiz/", location.href).href;
    } catch (e) {
      return new URL("quiz/", location.href).href;
    }
  }

  // ------------------------------------------------------------ banca: caricamento (una volta per modulo)
  var banche = {};
  function caricaBanca(modulo, url) {
    if (banche[url]) return banche[url];
    var pJson = fetch(url + "domande.json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch(function (e) { console.warn("quiz: domande.json non caricato:", e); return null; });
    var pGen = (window.QUIZ_GEN && window.QUIZ_GEN[modulo]) ? Promise.resolve(true) : caricaScript(url + "generatori.js");
    banche[url] = Promise.all([pJson, pGen]).then(function (r) {
      var json = r[0] || {};
      var mod = modulo || json.modulo;
      var fisse = (json.domande || []).filter(function (d) { return d && d.livello && PUNTI[d.livello] != null; });
      var gen = ((window.QUIZ_GEN || {})[mod] || []).filter(function (g) { return g && typeof g.genera === "function" && PUNTI[g.livello] != null; });
      return { modulo: mod, fisse: fisse, gen: gen };
    });
    return banche[url];
  }

  // ------------------------------------------------------------ istanza di una domanda
  /** una domanda pronta: testo, 4 opzioni mescolate, indice giusto; null se la voce non è utilizzabile */
  function istanzia(voce, generata, seme, lingua) {
    var q = null, tentativi = generata ? 8 : 1;
    for (var t = 0; t < tentativi && !q; t++) {
      var rngQ = mulberry32(derivato(seme, voce.id + "#" + t));
      try {
        var r = generata ? voce.genera(rngQ, lingua) : (voce[lingua] && {
          testo: voce[lingua].testo, opzioni: voce[lingua].opzioni, corretta: voce.corretta, spiegazione: voce[lingua].spiegazione
        });
        if (!r || !Array.isArray(r.opzioni) || r.opzioni.length !== 4) throw new Error("4 opzioni attese");
        var viste = {};
        r.opzioni.forEach(function (o) { viste[String(o).trim()] = 1; });
        if (Object.keys(viste).length !== 4) throw new Error("opzioni coincidenti");
        if (!(r.corretta >= 0 && r.corretta <= 3)) throw new Error("corretta fuori da 0–3");
        var perm = mescola([0, 1, 2, 3], mulberry32(derivato(seme, voce.id + "#perm")));
        q = {
          id: voce.id, livello: voce.livello, capitolo: voce.capitolo || "", generata: generata,
          link: voce.link && (voce.link[lingua] || voce.link.en || voce.link.it) || "",
          testo: r.testo, opzioni: perm.map(function (i) { return r.opzioni[i]; }),
          corretta: perm.indexOf(r.corretta), spiegazione: r.spiegazione || "", punti: PUNTI[voce.livello]
        };
      } catch (e) {
        if (t === tentativi - 1) console.warn("quiz: domanda " + voce.id + " scartata (" + e.message + ")");
      }
    }
    return q;
  }

  // ------------------------------------------------------------ costruzione del facsimile
  /** quante generate vogliamo per livello: facili metà e metà, medie e complessa generate, teorema e ipotesi fisse */
  function quoteGenerate(livello, quante) {
    if (livello === "facile") return Math.ceil(quante / 2);
    if (livello === "media" || livello === "complessa") return quante;
    return 0;
  }
  function costruisciFacsimile(banca, seme, lingua) {
    var rng = mulberry32(seme);
    var usoCap = {}, usate = {}, domande = [], mancano = false;
    function scegli(candidati, quante, generata) {
      var presi = [];
      var lista = mescola(candidati.slice(), rng);
      while (presi.length < quante && lista.length) {
        // il capitolo meno usato finora (a parità, l'ordine mescolato)
        var best = -1, bestUso = Infinity;
        for (var i = 0; i < lista.length; i++) {
          var u = usoCap[lista[i].capitolo || ""] || 0;
          if (u < bestUso) { bestUso = u; best = i; }
        }
        var voce = lista.splice(best, 1)[0];
        if (usate[voce.id]) continue;
        var q = istanzia(voce, generata, derivato(seme, "q:" + voce.id), lingua);
        if (!q) continue;
        usate[voce.id] = 1;
        usoCap[q.capitolo] = (usoCap[q.capitolo] || 0) + 1;
        presi.push(q);
      }
      return presi;
    }
    // prima i livelli con meno domande (la scelta dei capitoli è più libera per le facili)
    ["complessa", "media", "teorema", "ipotesi", "facile"].forEach(function (liv) {
      var s = SCHEMA.filter(function (x) { return x.livello === liv; })[0];
      var gen = banca.gen.filter(function (g) { return g.livello === liv; });
      var fis = banca.fisse.filter(function (d) { return d.livello === liv; });
      var qg = Math.min(quoteGenerate(liv, s.quante), gen.length);
      var presi = scegli(gen, qg, true);
      presi = presi.concat(scegli(fis, s.quante - presi.length, false));
      if (presi.length < s.quante) presi = presi.concat(scegli(gen, s.quante - presi.length, true));
      if (presi.length < s.quante) mancano = true;
      domande = domande.concat(presi);
    });
    mescola(domande, rng);
    return { seme: seme, domande: domande, incompleto: mancano };
  }
  function costruisciPratica(banca, capitolo, seme, lingua) {
    var rng = mulberry32(seme), domande = [];
    var voci = banca.gen.filter(function (g) { return g.capitolo === capitolo; }).map(function (g) { return [g, true]; })
      .concat(banca.fisse.filter(function (d) { return d.capitolo === capitolo; }).map(function (d) { return [d, false]; }));
    mescola(voci, rng);
    for (var i = 0; i < voci.length && domande.length < PRATICA_MAX; i++) {
      var q = istanzia(voci[i][0], voci[i][1], derivato(seme, "p:" + voci[i][0].id), lingua);
      if (q) domande.push(q);
    }
    return { seme: seme, domande: domande, pratica: true, capitolo: capitolo };
  }
  function nuovoSeme() {
    var a = new Uint32Array(1);
    try { window.crypto.getRandomValues(a); } catch (e) { a[0] = (Date.now() * 2654435761) >>> 0; }
    return a[0] % 1000000000;
  }

  // ------------------------------------------------------------ l'app
  function App(radice) {
    this.r = radice;
    var l = (radice.getAttribute("data-lang") || document.documentElement.lang || "en").toLowerCase();
    this.lingua = l.slice(0, 2) === "it" ? "it" : "en";
    this.t = T[this.lingua];
    this.modulo = radice.getAttribute("data-modulo") || "";
    this.url = baseBanca(radice);
    try { this.capitoli = JSON.parse(radice.getAttribute("data-capitoli") || "{}"); } catch (e) { this.capitoli = {}; }
    this.chiave = "quiz-storico:" + (this.modulo || location.pathname);
  }
  App.prototype.nomeCap = function (slug) {
    if (this.capitoli[slug]) return this.capitoli[slug];
    var s = String(slug || "").replace(/[-_]+/g, " ");
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  /** il nome del capitolo senza TeX (per le voci di <select>, dove MathJax non arriva) */
  App.prototype.nomeCapTesto = function (slug) {
    return this.nomeCap(slug).replace(/\$([^$]*)\$/g, function (m, x) {
      return x.replace(/\\\|/g, "||").replace(/\\[a-zA-Z]+/g, "").replace(/[{}_^\\]/g, "");
    });
  };
  App.prototype.mostra = function (nodi, fuoco) {
    var r = this.r;
    r.innerHTML = "";
    nodi.forEach(function (n) { if (n) r.appendChild(n); });
    var dove = fuoco || r.querySelector("h2");
    if (dove) {
      if (!dove.hasAttribute("tabindex")) dove.setAttribute("tabindex", "-1");
      try { dove.focus({ preventScroll: true }); } catch (e) { dove.focus(); }
      var top = r.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.6) r.scrollIntoView({ block: "start" });
    }
    return componi(r);
  };
  App.prototype.avvia = function () {
    var self = this;
    self.mostra([el("p", { "class": "quiz-stato", role: "status", text: self.t.carico })], self.r);
    caricaBanca(self.modulo, self.url).then(function (b) {
      self.banca = b;
      if (!self.modulo) self.modulo = b.modulo;
      var p = new URLSearchParams(location.search);
      var s = parseInt(p.get("seed"), 10);
      if (!b.fisse.length && !b.gen.length) return self.mostra([el("p", { "class": "quiz-stato", text: self.t.nonDisp })]);
      if (!isNaN(s) && s >= 0) return self.inizia(s);
      self.home();
    });
  };

  // ---------------- schermata iniziale
  App.prototype.home = function () {
    var self = this, t = self.t;
    var bott = el("button", { type: "button", "class": "md-button md-button--primary quiz-inizia", text: t.inizia,
      onclick: function () { self.inizia(nuovoSeme()); } });
    var nodi = [
      el("section", { "class": "quiz-card", "aria-labelledby": "quiz-h-inizio" }, [
        el("h2", { id: "quiz-h-inizio", text: t.titoloInizio }),
        el("p", { text: t.intro }),
        el("p", {}, [bott]),
        el("p", { "class": "quiz-nota", text: t.privacy })
      ])
    ];
    // esercitazione per capitolo
    var conta = {};
    self.banca.fisse.concat(self.banca.gen).forEach(function (d) { if (d.capitolo) conta[d.capitolo] = (conta[d.capitolo] || 0) + 1; });
    var caps = Object.keys(conta);
    var ordine = Object.keys(self.capitoli);
    caps.sort(function (a, b) {
      var ia = ordine.indexOf(a), ib = ordine.indexOf(b);
      return (ia < 0 ? 1e9 : ia) - (ib < 0 ? 1e9 : ib) || a.localeCompare(b);
    });
    if (caps.length) {
      var sel = el("select", { id: "quiz-cap", "class": "quiz-select" },
        [el("option", { value: "", text: t.tuttiCap })].concat(caps.map(function (c) {
          return el("option", { value: c, text: self.nomeCapTesto(c) + " (" + conta[c] + ")" });
        })));
      var bp = el("button", { type: "button", "class": "md-button", text: t.iniziaPratica, disabled: true,
        onclick: function () { if (sel.value) self.inizia(nuovoSeme(), sel.value); } });
      sel.addEventListener("change", function () { bp.disabled = !sel.value; });
      nodi.push(el("section", { "class": "quiz-card", "aria-labelledby": "quiz-h-pratica" }, [
        el("h2", { id: "quiz-h-pratica", text: t.pratica }),
        el("p", { text: t.praticaIntro }),
        el("p", { "class": "quiz-riga" }, [el("label", { "for": "quiz-cap", text: t.scegliCap + " " }), sel, bp])
      ]));
    }
    nodi.push(self.storicoNodo());
    self.mostra(nodi, bott);
  };
  App.prototype.storicoNodo = function () {
    var self = this, t = self.t, st = leggi(self.chiave) || [];
    var sez = el("section", { "class": "quiz-card", "aria-labelledby": "quiz-h-storico" }, [el("h2", { id: "quiz-h-storico", text: t.storico })]);
    if (!st.length) { sez.appendChild(el("p", { "class": "quiz-nota", text: t.storicoVuoto })); return sez; }
    var righe = st.slice().reverse().map(function (a) {
      var d = new Date(a.data);
      var url = location.pathname + "?seed=" + a.seme;
      return el("tr", {}, [
        el("td", { text: isNaN(d) ? "" : d.toLocaleString(self.lingua === "it" ? "it-IT" : "en-GB", { dateStyle: "short", timeStyle: "short" }) }),
        el("td", { text: a.punti + "/" + a.max }),
        el("td", { text: numero(a.trentesimi, self.lingua) + "/30" }),
        el("td", {}, [el("a", { href: url, text: String(a.seme) })])
      ]);
    });
    sez.appendChild(el("div", { "class": "quiz-tab" }, [el("table", {}, [
      el("thead", {}, [el("tr", {}, [el("th", { scope: "col", text: t.quando }), el("th", { scope: "col", text: t.punti }),
        el("th", { scope: "col", text: t.trentesimi }), el("th", { scope: "col", text: t.seme })])]),
      el("tbody", {}, righe)])]));
    sez.appendChild(el("p", {}, [el("button", { type: "button", "class": "md-button quiz-piccolo", text: t.cancella,
      onclick: function () { if (window.confirm(t.cancellaConf)) { cancellaChiave(self.chiave); self.home(); } } })]));
    return sez;
  };

  // ---------------- il facsimile, una domanda alla volta
  App.prototype.inizia = function (seme, capitolo) {
    this.f = capitolo ? costruisciPratica(this.banca, capitolo, seme, this.lingua)
                      : costruisciFacsimile(this.banca, seme, this.lingua);
    this.risposte = [];
    this.i = 0;
    if (!this.f.domande.length) return this.mostra([el("p", { "class": "quiz-stato", text: this.t.nonDisp })]);
    this.domanda();
  };
  App.prototype.barra = function () {
    var t = this.t, n = this.f.domande.length, k = this.i;
    var pct = Math.round(100 * k / n);
    return el("div", { "class": "quiz-progresso" }, [
      el("div", { "class": "quiz-progresso-testo" }, [
        el("span", { text: t.domanda + " " + (k + 1) + " " + t.di + " " + n }),
        el("span", { "class": "quiz-seme", text: (this.f.pratica ? t.praticaTit + " · " + this.nomeCapTesto(this.f.capitolo) + " · " : "") + t.seme + " " + this.f.seme })
      ]),
      el("div", { "class": "quiz-barra", role: "progressbar", "aria-label": t.avanzamento, "aria-valuemin": "0",
        "aria-valuemax": String(n), "aria-valuenow": String(k), "aria-valuetext": k + " / " + n }, [
        el("div", { "class": "quiz-barra-piena", style: "width:" + pct + "%" })
      ])
    ]);
  };
  App.prototype.domanda = function () {
    var self = this, t = self.t, q = self.f.domande[self.i];
    var nome = "quiz-r-" + self.i;
    var leg = el("legend", { "class": "quiz-testo", html: formatta(q.testo) });
    var meta = el("p", { "class": "quiz-meta" }, [
      el("span", { "class": "quiz-badge quiz-liv-" + q.livello, text: t.livelli[q.livello] }),
      " " + q.punti + " " + (q.punti === 1 ? t.punto : t.punti) + " · ", el("span", { html: formatta(self.nomeCap(q.capitolo)) })
    ]);
    var opz = q.opzioni.map(function (o, j) {
      var id = nome + "-" + j;
      return el("div", { "class": "quiz-opzione" }, [
        el("input", { type: "radio", name: nome, id: id, value: String(j) }),
        el("label", { "for": id }, [el("span", { "class": "quiz-lettera", "aria-hidden": "true", text: LETTERE[j] }),
          el("span", { "class": "quiz-sr", text: LETTERE[j] + ". " }), el("span", { html: formatta(o) })])
      ]);
    });
    opz.push(el("div", { "class": "quiz-opzione quiz-opzione-bianco" }, [
      el("input", { type: "radio", name: nome, id: nome + "-b", value: "-1" }),
      el("label", { "for": nome + "-b" }, [el("span", { "class": "quiz-lettera", "aria-hidden": "true", text: "–" }), el("span", { text: t.bianco })])
    ]));
    var avviso = el("p", { "class": "quiz-avviso", role: "status", "aria-live": "polite" });
    var conf = el("button", { type: "submit", "class": "md-button md-button--primary", text: t.conferma });
    var titolo = el("h2", { "class": "quiz-h-domanda", text: t.domanda + " " + (self.i + 1) });
    var form = el("form", { "class": "quiz-card quiz-form", novalidate: true }, [
      titolo, meta, el("fieldset", {}, [leg].concat(opz)), avviso, el("p", { "class": "quiz-azioni" }, [conf])
    ]);
    // A–D (o 1–4) scelgono, 0 o «bianco» con la B no: B è un'opzione; Invio conferma (submit)
    form.addEventListener("keydown", function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var k = e.key.toUpperCase(), j = LETTERE.indexOf(k);
      if (j < 0 && /^[1-4]$/.test(k)) j = parseInt(k, 10) - 1;
      if (j < 0 && k === "0") j = 4;
      if (j >= 0 && e.target.tagName !== "BUTTON") {
        var r = form.querySelectorAll("input[type=radio]")[j];
        if (r) { r.checked = true; r.focus(); e.preventDefault(); }
      }
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var scelta = form.querySelector("input[type=radio]:checked");
      if (!scelta) { avviso.textContent = t.scegliPrima; return; }
      if (self.attesa) return;
      self.registra(parseInt(scelta.value, 10), form, conf);
    });
    self.mostra([self.barra(), form], titolo);
  };
  App.prototype.registra = function (v, form, conf) {
    var self = this, t = self.t, q = self.f.domande[self.i];
    var esito = v < 0 ? "b" : (v === q.corretta ? "g" : "e");
    self.risposte.push({ data: v, esito: esito, punti: esito === "g" ? q.punti : (esito === "e" ? ERRATA : 0) });
    var ultima = self.i === self.f.domande.length - 1;
    if (!self.f.pratica) { self.i++; return ultima ? self.risultato() : self.domanda(); }
    // esercitazione: subito la soluzione, poi «Avanti»
    self.attesa = true;
    form.querySelectorAll("input").forEach(function (x) { x.disabled = true; });
    var fb = el("div", { "class": "quiz-feedback quiz-esito-" + esito, role: "status" }, [
      el("p", {}, [el("strong", { text: (esito === "g" ? "✓ " + t.corretta : esito === "e" ? "✗ " + t.sbagliata : "– " + t.inBianco) }),
        " " + t.giusta + ": " + LETTERE[q.corretta] + "."]),
      el("p", { html: formatta(q.spiegazione) }),
      q.link ? el("p", {}, [el("a", { href: q.link, text: t.rivedi + " →" })]) : null
    ]);
    form.querySelectorAll(".quiz-opzione").forEach(function (o, j) {
      var lab = o.querySelector("label");
      if (j === q.corretta) { o.classList.add("quiz-ok"); lab.appendChild(el("strong", { "class": "quiz-segno", text: "✓ " + t.giusta.toLowerCase() })); }
      if (j === v && esito === "e") { o.classList.add("quiz-ko"); lab.appendChild(el("strong", { "class": "quiz-segno", text: "✗ " + t.data.toLowerCase() })); }
    });
    var av = el("button", { type: "button", "class": "md-button md-button--primary", text: ultima ? t.fine : t.avanti,
      onclick: function () { self.attesa = false; self.i++; if (ultima) self.risultato(); else self.domanda(); } });
    conf.replaceWith(av);
    form.insertBefore(fb, form.querySelector(".quiz-azioni"));
    componi(fb);
    av.focus();
  };

  // ---------------- il risultato
  App.prototype.risultato = function () {
    var self = this, t = self.t, f = self.f, R = self.risposte;
    var tot = 0, max = 0, ng = 0, ne = 0, nb = 0;
    f.domande.forEach(function (q, k) {
      max += q.punti; tot += R[k].punti;
      if (R[k].esito === "g") ng++; else if (R[k].esito === "e") ne++; else nb++;
    });
    var trent = max ? tot * 30 / max : 0;
    if (!f.pratica) {
      var st = leggi(self.chiave) || [];
      st.push({ data: new Date().toISOString(), seme: f.seme, punti: tot, max: max, trentesimi: Math.round(trent * 10) / 10, lingua: self.lingua });
      scrivi(self.chiave, st.slice(-STORICO_MAX));
    }
    function lettera(v) { return v < 0 ? t.nessuna : LETTERE[v]; }
    function esitoTxt(e) { return e === "g" ? "✓ " + t.esitoG : e === "e" ? "✗ " + t.esitoE : "– " + t.esitoB; }
    var h = el("h2", { text: f.pratica ? t.praticaFine : t.risultato });
    var punteggio = f.pratica
      ? el("p", { "class": "quiz-punteggio" }, [el("strong", { text: ng + " " }), t.praticaPunt + " " + f.domande.length])
      : el("p", { "class": "quiz-punteggio" }, [
          el("strong", { "class": "quiz-grande", text: tot + "/" + max }), " " + t.punti + " · ",
          el("strong", { text: numero(trent, self.lingua) + "/30" })]);
    var conti = el("p", { "class": "quiz-meta" }, [ng + " " + t.giuste + " · " + ne + " " + t.errate + " · " + nb + " " + t.bianche +
      " · " + t.seme + " " + f.seme]);
    var bottoni = el("p", { "class": "quiz-azioni" }, [
      el("button", { type: "button", "class": "md-button md-button--primary", text: f.pratica ? t.iniziaPratica : t.altro,
        onclick: function () { self.inizia(nuovoSeme(), f.capitolo); } }),
      f.pratica ? null : el("button", { type: "button", "class": "md-button", text: t.rifai, onclick: function () { self.inizia(f.seme); } }),
      el("button", { type: "button", "class": "md-button", text: t.tornaInizio, onclick: function () {
        if (location.search) history.replaceState(null, "", location.pathname + location.hash);
        self.home(); } })
    ]);
    var righe = f.domande.map(function (q, k) {
      return el("tr", { "class": "quiz-esito-" + R[k].esito }, [
        el("td", {}, [el("a", { href: "#quiz-d-" + (k + 1), text: String(k + 1) })]),
        el("td", { text: t.livelli[q.livello] }),
        el("td", { html: formatta(self.nomeCap(q.capitolo)) }),
        el("td", { text: lettera(R[k].data) }),
        el("td", { text: LETTERE[q.corretta] }),
        el("td", { text: esitoTxt(R[k].esito) }),
        el("td", { "class": "quiz-num", text: (R[k].punti > 0 ? "+" : "") + R[k].punti + (f.pratica ? "" : " / " + q.punti) })
      ]);
    });
    var tabella = el("div", { "class": "quiz-tab" }, [el("table", {}, [
      el("caption", { "class": "quiz-sr", text: t.riepilogo }),
      el("thead", {}, [el("tr", {}, [t.colN, t.colLiv, t.colCap, t.colData, t.colGiusta, "", t.colPunti].map(function (c) {
        return el("th", { scope: "col", text: c }); }))]),
      el("tbody", {}, righe)])]);
    var dettagli = f.domande.map(function (q, k) {
      var r = R[k];
      var ol = el("ol", { "class": "quiz-opz-fine", type: "A" }, q.opzioni.map(function (o, j) {
        var seg = j === q.corretta ? " ✓" : (j === r.data ? " ✗" : "");
        return el("li", { "class": j === q.corretta ? "quiz-ok" : (j === r.data ? "quiz-ko" : "") }, [
          el("span", { html: formatta(o) }),
          seg ? el("strong", { "class": "quiz-segno", text: seg + " " + (j === q.corretta ? t.giusta.toLowerCase() : t.data.toLowerCase()) }) : null
        ]);
      }));
      return el("article", { "class": "quiz-card quiz-dettaglio quiz-esito-" + r.esito, id: "quiz-d-" + (k + 1) }, [
        el("h3", {}, [t.domanda + " " + (k + 1) + " · ", el("span", { text: esitoTxt(r.esito) }),
          " (" + (r.punti > 0 ? "+" : "") + r.punti + ")"]),
        el("p", { "class": "quiz-meta" }, [el("span", { "class": "quiz-badge quiz-liv-" + q.livello, text: t.livelli[q.livello] }),
          " " + q.punti + " " + t.punti + " · ", el("span", { html: formatta(self.nomeCap(q.capitolo)) })]),
        el("div", { "class": "quiz-testo", html: formatta(q.testo) }),
        ol,
        el("p", {}, [el("strong", { text: t.data + ": " }), lettera(r.data) + " · ", el("strong", { text: t.giusta + ": " }), LETTERE[q.corretta]]),
        el("p", {}, [el("strong", { text: t.spiegazione + ". " }), el("span", { html: formatta(q.spiegazione) })]),
        q.link ? el("p", {}, [el("a", { href: q.link, text: t.rivedi + " →" })]) : null
      ]);
    });
    var nodi = [el("section", { "class": "quiz-card quiz-fine", "aria-labelledby": "quiz-h-fine" }, [h, punteggio, conti,
      f.incompleto ? el("p", { "class": "quiz-nota", text: t.pochi }) : null, bottoni])];
    h.id = "quiz-h-fine";
    nodi.push(el("h2", { text: t.riepilogo }), tabella, el("h2", { text: t.dettaglio }));
    nodi = nodi.concat(dettagli);
    nodi.push(el("p", { "class": "quiz-azioni" }, [el("button", { type: "button", "class": "md-button md-button--primary",
      text: f.pratica ? t.iniziaPratica : t.altro, onclick: function () { self.inizia(nuovoSeme(), f.capitolo); } })]));
    var p = self.mostra(nodi, h);
    // per i test automatici: l'esito è leggibile dalla pagina
    self.r.setAttribute("data-esito", JSON.stringify({ punti: tot, max: max, n: f.domande.length }));
    return p;
  };

  // ------------------------------------------------------------ API per i test (headless) e avvio
  window.QUIZ_ENGINE = {
    versione: "1.0",
    mulberry32: mulberry32,
    costruisciFacsimile: costruisciFacsimile,
    caricaBanca: caricaBanca,
    formatta: formatta,
    schema: SCHEMA
  };
  function avvia() {
    var r = document.getElementById("quiz-app");
    if (!r || r.getAttribute("data-avviato") === "1") return;
    r.setAttribute("data-avviato", "1");
    var app = new App(r);
    window.QUIZ_ENGINE.app = app;
    app.avvia();
  }
  if (window.document$ && typeof window.document$.subscribe === "function") window.document$.subscribe(avvia);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", avvia);
  else avvia();
})();
