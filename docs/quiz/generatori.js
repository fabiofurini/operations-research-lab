/* Autovalutazione — Laboratorio di Ricerca Operativa / Operations Research Lab
 * Domande generate: dati nuovi a ogni facsimile (specifica: ../QUIZ_SPEC.md).
 * Ogni generatore restituisce { testo, opzioni, corretta, spiegazione, dati }:
 * "dati" (l'istanza) serve solo ai controlli di quiz/verifica/ e l'app lo ignora.
 * Nessuna dipendenza esterna, niente Math.random: solo rng().
 */
window.QUIZ_GEN = window.QUIZ_GEN || {};
(function () {
  "use strict";
  var MOD = "operations-research-lab";
  var LISTA = (window.QUIZ_GEN[MOD] = window.QUIZ_GEN[MOD] || []);
  var URL_EN = "https://fabiofurini.github.io/operations-research-lab/";
  var URL_IT = "https://fabiofurini.github.io/laboratorio-ricerca-operativa/";

  function link(en, it) { return { it: URL_IT + it, en: URL_EN + en }; }
  function ri(rng, a, b) { return a + Math.floor(rng() * (b - a + 1)); }
  function pk(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  /* numero formattato con d decimali, zeri finali tolti; virgola decimale in italiano */
  function f(x, d, L) {
    var p = Math.pow(10, d);
    var y = Math.round(x * p + (x >= 0 ? 1e-7 : -1e-7)) / p;
    var s = y.toFixed(d);
    if (d > 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    if (s === "-0") s = "0";
    return L === "it" ? s.replace(".", ",") : s;
  }
  /* lo stesso numero, da scrivere dentro $...$ */
  function m(x, d, L) { return f(x, d, L).replace(",", "{,}"); }
  function T(L, en, it) { return L === "it" ? it : en; }
  function pos(x) { return x > 0 ? x : 0; }
  /* vero se x cade (quasi) a metà fra due valori arrotondati a d decimali */
  function quasiMezzo(x, d) { var y = x * Math.pow(10, d); return Math.abs(y - Math.floor(y) - 0.5) < 1e-3; }
  function sortNum(a) { return a.slice().sort(function (u, v) { return u - v; }); }

  /* opzioni: la giusta + le prime 3 sbagliate distinte; mescolate con rng */
  function chiudi(rng, testo, giusta, sbagliate, spiegazione, dati) {
    var opz = [giusta];
    for (var i = 0; i < sbagliate.length && opz.length < 4; i++) {
      if (opz.indexOf(sbagliate[i]) < 0) opz.push(sbagliate[i]);
    }
    if (opz.length < 4) return null;
    var idx = [0, 1, 2, 3];
    for (var k = 3; k > 0; k--) {
      var j = Math.floor(rng() * (k + 1));
      var t = idx[k]; idx[k] = idx[j]; idx[j] = t;
    }
    var out = [], corr = 0;
    for (var h = 0; h < 4; h++) { out.push(opz[idx[h]]); if (idx[h] === 0) corr = h; }
    return { testo: testo, opzioni: out, corretta: corr, spiegazione: spiegazione, dati: dati };
  }

  function gen(def) {
    LISTA.push({
      id: def.id, livello: def.livello, capitolo: def.capitolo, link: def.link,
      genera: function (rng, lingua) {
        var L = lingua === "it" ? "it" : "en";
        for (var t = 0; t < 2000; t++) {
          var r = def.prova(rng, L);
          if (r) return r;
        }
        throw new Error("generatore " + def.id + ": nessuna istanza valida");
      }
    });
  }

  /* ===================== Cap. 2 — teoria LP ===================== */

  function istanzaLP(rng) {
    var p1 = ri(rng, 1, 12), p2 = ri(rng, 1, 12);
    if (p1 === p2) return null;
    var a11 = ri(rng, 1, 4), a12 = ri(rng, 1, 4), a21 = ri(rng, 1, 4), a22 = ri(rng, 1, 4);
    var det = a11 * a22 - a12 * a21;
    if (det === 0) return null;
    var x1 = ri(rng, 5, 30), x2 = ri(rng, 5, 30);
    return {
      pi: [p1, p2], A: [[a11, a12], [a21, a22]], x: [x1, x2],
      c: [a11 * p1 + a21 * p2, a12 * p1 + a22 * p2],
      b: [a11 * x1 + a12 * x2, a21 * x1 + a22 * x2]
    };
  }
  function testoLP(I, L) {
    var A = I.A, c = I.c, b = I.b;
    function k(a) { return a === 1 ? "" : String(a); }
    return T(L, "Consider the LP ", "Si consideri l'LP ") +
      "$\\max\\; " + c[0] + "x_1 + " + c[1] + "x_2$ " + T(L, "subject to ", "soggetto a ") +
      "$" + k(A[0][0]) + "x_1 + " + k(A[0][1]) + "x_2 \\le " + b[0] + "$, $" +
      k(A[1][0]) + "x_1 + " + k(A[1][1]) + "x_2 \\le " + b[1] + "$, $x_1, x_2 \\ge 0$. ";
  }

  gen({
    id: "orl-g-lp-duali-cs", livello: "facile", capitolo: "background",
    link: link("theory-lp/#the-optimality-conditions-of-lp-complementary-slackness",
               "teoria-lp/#le-condizioni-di-ottimalita-delllp-gli-scarti-complementari"),
    prova: function (rng, L) {
      var I = istanzaLP(rng); if (!I) return null;
      var A = I.A, c = I.c, p = I.pi;
      var det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
      // errore: sistema per righe A pi = c invece che per colonne
      var r1 = (c[0] * A[1][1] - A[0][1] * c[1]) / det, r2 = (A[0][0] * c[1] - A[1][0] * c[0]) / det;
      var q1 = c[0] / (A[0][0] + A[1][0]), q2 = c[1] / (A[0][1] + A[1][1]);
      var s1 = c[0] * I.x[0] / I.b[0], s2 = c[1] * I.x[1] / I.b[1];
      function o(a, b) { return "$(\\tilde\\pi_1; \\tilde\\pi_2) = (" + m(a, 2, L) + "; " + m(b, 2, L) + ")$"; }
      var testo = testoLP(I, L) + T(L,
        "Solving we obtain $(\\tilde x_1, \\tilde x_2) = (" + I.x[0] + ", " + I.x[1] + ")$, with both constraints active. What are the optimal dual values?",
        "Risolvendo si ottiene $(\\tilde x_1, \\tilde x_2) = (" + I.x[0] + ", " + I.x[1] + ")$, con entrambi i vincoli attivi. Quali sono i valori duali ottimi?");
      var sp = T(L,
        "Both variables are positive, so by complementary slackness both dual constraints are active: $" + A[0][0] + "\\pi_1 + " + A[1][0] + "\\pi_2 = " + c[0] + "$ and $" + A[0][1] + "\\pi_1 + " + A[1][1] + "\\pi_2 = " + c[1] + "$ (the coefficients are the columns of the primal), hence $\\tilde\\pi = (" + p[0] + "; " + p[1] + ")$. Solving with the rows instead of the columns is the typical mistake.",
        "Le due variabili sono positive, quindi per gli scarti complementari i due vincoli duali sono attivi: $" + A[0][0] + "\\pi_1 + " + A[1][0] + "\\pi_2 = " + c[0] + "$ e $" + A[0][1] + "\\pi_1 + " + A[1][1] + "\\pi_2 = " + c[1] + "$ (i coefficienti sono le colonne del primale), da cui $\\tilde\\pi = (" + p[0] + "; " + p[1] + ")$. Risolvere con le righe invece che con le colonne è l'errore tipico.");
      return chiudi(rng, testo, o(p[0], p[1]), [o(r1, r2), o(p[1], p[0]), o(q1, q2), o(s1, s2)], sp,
        { c: c, A: A, b: I.b, x: I.x });
    }
  });

  gen({
    id: "orl-g-lp-costo-ridotto", livello: "facile", capitolo: "background",
    link: link("theory-lp/#sensitivity-analysis-in-lps", "teoria-lp/#lanalisi-di-sensitivita-negli-lp"),
    prova: function (rng, L) {
      var I = istanzaLP(rng); if (!I) return null;
      var p = I.pi, a13 = ri(rng, 1, 4), a23 = ri(rng, 1, 4), del = ri(rng, 1, 6);
      var val = a13 * p[0] + a23 * p[1], c3 = val - del;
      if (c3 <= 0) return null;
      var sw = a13 * p[1] + a23 * p[0];
      function o(r, s) { return "$\\bar c_3 = " + m(r, 2, L) + "$, " + T(L, "threshold", "soglia") + " $c_3^{\\max} = " + m(s, 2, L) + "$"; }
      var testo = testoLP(I, L) + T(L,
        "At the optimum the duals are $(\\tilde\\pi_1, \\tilde\\pi_2) = (" + p[0] + ", " + p[1] + ")$. We add a variable $x_3 \\ge 0$ with objective coefficient $c_3 = " + c3 + "$ and consumptions $a_{13} = " + a13 + "$, $a_{23} = " + a23 + "$. What are its reduced cost and the profitability threshold of $c_3$?",
        "All'ottimo i duali sono $(\\tilde\\pi_1, \\tilde\\pi_2) = (" + p[0] + ", " + p[1] + ")$. Si aggiunge una variabile $x_3 \\ge 0$ con coefficiente $c_3 = " + c3 + "$ in obiettivo e consumi $a_{13} = " + a13 + "$, $a_{23} = " + a23 + "$. Quanto valgono il suo costo ridotto e la soglia di convenienza di $c_3$?");
      var sp = T(L,
        "The resources absorbed by one unit of $x_3$ are worth $" + a13 + "\\cdot " + p[0] + " + " + a23 + "\\cdot " + p[1] + " = " + val + "$ at the shadow prices, so $\\bar c_3 = " + c3 + " - " + val + " = " + (-del) + "$: $x_3$ stays at zero and becomes worth activating only if $c_3$ rises to at least $" + val + "$.",
        "Le risorse assorbite da un'unità di $x_3$ valgono $" + a13 + "\\cdot " + p[0] + " + " + a23 + "\\cdot " + p[1] + " = " + val + "$ ai prezzi ombra, quindi $\\bar c_3 = " + c3 + " - " + val + " = " + (-del) + "$: $x_3$ resta a zero e conviene attivarla solo se $c_3$ sale almeno a $" + val + "$.");
      return chiudi(rng, testo, o(-del, val), [o(del, val), o(c3 - sw, sw), o(c3 - a13 * p[0], a13 * p[0]), o(-del, c3)], sp,
        { c: I.c, A: I.A, b: I.b, c3: c3, a3: [a13, a23] });
    }
  });

  /* ===================== Cap. 4 — produzione ===================== */

  function istanza2mesi(rng, stretto) {
    var b = pk(rng, [60, 70, 80, 90, 100]), de = 5 * ri(rng, 1, 6), d2 = b + de;
    var d1max = b - de - (stretto ? 5 : 0);
    if (Math.floor(d1max / 5) < 4) return null;
    var d1 = 5 * ri(rng, 4, Math.floor(d1max / 5));
    var c = ri(rng, 5, 15), h = ri(rng, 1, 3);
    return { b: b, d1: d1, d2: d2, de: de, c: c, h: h };
  }
  function testo2mesi(I, L) {
    return T(L,
      "Production and inventory LP with one product and two months: demand $d_1 = " + I.d1 + "$, $d_2 = " + I.d2 + "$; capacity $b_1 = b_2 = " + I.b + "$ units/month ($a = 1$); production cost $c = " + I.c + "$ €/unit, holding cost $h = " + I.h + "$ €/unit/month, zero initial inventory. ",
      "LP di produzione e scorte con un prodotto e due mesi: domanda $d_1 = " + I.d1 + "$, $d_2 = " + I.d2 + "$; capacità $b_1 = b_2 = " + I.b + "$ unità/mese ($a = 1$); costo di produzione $c = " + I.c + "$ €/unità, costo di giacenza $h = " + I.h + "$ €/unità/mese, scorta iniziale nulla. ");
  }

  gen({
    id: "orl-g-prod-2mesi-costo", livello: "facile", capitolo: "production",
    link: link("production/#model", "produzione/#modello"),
    prova: function (rng, L) {
      var I = istanza2mesi(rng, false); if (!I) return null;
      var D = I.d1 + I.d2, giusto = I.c * D + I.h * I.de;
      function o(v) { return v + " €"; }
      var testo = testo2mesi(I, L) + T(L, "What is the optimal cost of the plan?", "Qual è il costo ottimo del piano?");
      var sp = T(L,
        "Month 2 produces at most $" + I.b + "$, so $\\tilde s_1 = d_2 - b_2 = " + I.de + "$ units are produced in month 1 and held for one month: $" + I.c + "\\cdot " + D + " + " + I.h + "\\cdot " + I.de + " = " + giusto + "$ €.",
        "Il mese 2 produce al più $" + I.b + "$, quindi $\\tilde s_1 = d_2 - b_2 = " + I.de + "$ unità si producono nel mese 1 e restano a scorta un mese: $" + I.c + "\\cdot " + D + " + " + I.h + "\\cdot " + I.de + " = " + giusto + "$ €.");
      return chiudi(rng, testo, o(giusto),
        [o(I.c * D), o(I.c * D + I.h * I.d2), o(I.c * D + 2 * I.h * I.de), o(I.c * 2 * I.b + I.h * I.de), o(I.c * D + I.h * I.b)],
        sp, I);
    }
  });

  gen({
    id: "orl-g-prod-2mesi-duali", livello: "facile", capitolo: "production",
    link: link("production/#sensitivity", "produzione/#sensitivita"),
    prova: function (rng, L) {
      var I = istanza2mesi(rng, true); if (!I) return null;
      function o(a, b) { return "$\\tilde\\pi_1 = " + a + "$, $\\tilde\\pi_2 = " + b + "$"; }
      var testo = testo2mesi(I, L) + T(L,
        "What are the shadow prices $\\tilde\\pi_1, \\tilde\\pi_2$ of the two capacity constraints?",
        "Quanto valgono i prezzi ombra $\\tilde\\pi_1, \\tilde\\pi_2$ dei due vincoli di capacità?");
      var sp = T(L,
        "One more unit of capacity in month 2 lets one unit be produced a month later, saving the holding cost: $\\tilde\\pi_2 = -h = " + (-I.h) + "$ (a $\\le$ constraint in a minimization has $\\tilde\\pi \\le 0$). Month 1 produces $" + (I.d1 + I.de) + " < " + I.b + "$: its constraint is slack and $\\tilde\\pi_1 = 0$.",
        "Un'unità di capacità in più nel mese 2 permette di produrre un'unità un mese dopo, risparmiando la giacenza: $\\tilde\\pi_2 = -h = " + (-I.h) + "$ (un vincolo $\\le$ in un problema di minimo ha $\\tilde\\pi \\le 0$). Il mese 1 produce $" + (I.d1 + I.de) + " < " + I.b + "$: il suo vincolo non è attivo e $\\tilde\\pi_1 = 0$.");
      return chiudi(rng, testo, o(0, -I.h), [o(0, I.h), o(-I.h, 0), o(0, -I.c), o(-I.h, -I.h)], sp, I);
    }
  });

  gen({
    id: "orl-g-prod-3mesi", livello: "complessa", capitolo: "production",
    link: link("production/#model", "produzione/#modello"),
    prova: function (rng, L) {
      var b1 = 10 * ri(rng, 6, 10), b2 = 10 * ri(rng, 5, 10), b3 = 10 * ri(rng, 5, 10);
      var d3s = 5 * ri(rng, 2, 6), d2s = 5 * ri(rng, 1, 5);
      var d3 = b3 + d3s, d2 = b2 - d3s + d2s;
      if (d2 < 20) return null;
      var d1max = b1 - d2s - 5;
      if (Math.floor(d1max / 5) < 4) return null;
      var d1 = 5 * ri(rng, 4, Math.floor(d1max / 5));
      var c = ri(rng, 5, 12), h = ri(rng, 1, 3), D = d1 + d2 + d3;
      var s1 = d2s, s2 = d3s, z = c * D + h * (s1 + s2);
      function o(zz, a, b) { return "$\\tilde z = " + zz + "$ €, $\\tilde s_1 = " + a + "$, $\\tilde s_2 = " + b + "$"; }
      // errori tipici
      var s1A = pos(d2 - b2);
      var x1 = Math.min(b1, D), x2 = Math.min(b2, D - x1);
      var s1B = x1 - d1, s2B = s1B + x2 - d2;
      var testo = T(L,
        "Production and inventory LP with one product and three months ($a = 1$, zero initial inventory): demand $(d_1, d_2, d_3) = (" + d1 + ", " + d2 + ", " + d3 + ")$, capacity $(b_1, b_2, b_3) = (" + b1 + ", " + b2 + ", " + b3 + ")$, production cost $c = " + c + "$ €/unit in every month, holding cost $h = " + h + "$ €/unit/month. What are the optimal cost and the end-of-month inventories $\\tilde s_1, \\tilde s_2$?",
        "LP di produzione e scorte con un prodotto e tre mesi ($a = 1$, scorta iniziale nulla): domanda $(d_1, d_2, d_3) = (" + d1 + ", " + d2 + ", " + d3 + ")$, capacità $(b_1, b_2, b_3) = (" + b1 + ", " + b2 + ", " + b3 + ")$, costo di produzione $c = " + c + "$ €/unità in ogni mese, giacenza $h = " + h + "$ €/unità/mese. Quanto valgono il costo ottimo e le scorte di fine mese $\\tilde s_1, \\tilde s_2$?");
      var sp = T(L,
        "With the same $c$ every month it pays to produce as late as possible. Month 3 lacks $" + d3 + " - " + b3 + " = " + s2 + "$ units: $\\tilde s_2 = " + s2 + "$. Month 2 must cover $" + d2 + " + " + s2 + " = " + (d2 + s2) + " > " + b2 + "$, so $\\tilde s_1 = " + s1 + "$. Cost $" + c + "\\cdot " + D + " + " + h + "\\cdot(" + s1 + " + " + s2 + ") = " + z + "$ €.",
        "Con lo stesso $c$ in ogni mese conviene produrre il più tardi possibile. Al mese 3 mancano $" + d3 + " - " + b3 + " = " + s2 + "$ unità: $\\tilde s_2 = " + s2 + "$. Il mese 2 deve coprire $" + d2 + " + " + s2 + " = " + (d2 + s2) + " > " + b2 + "$, quindi $\\tilde s_1 = " + s1 + "$. Costo $" + c + "\\cdot " + D + " + " + h + "\\cdot(" + s1 + " + " + s2 + ") = " + z + "$ €.");
      return chiudi(rng, testo, o(z, s1, s2),
        [o(c * D + h * (s1A + s2), s1A, s2), o(c * D + h * (s1B + s2B), s1B, s2B), o(c * D + h * s2, s1, s2), o(c * D + h * (2 * s1 + s2), s1, s2)],
        sp, { b: [b1, b2, b3], d: [d1, d2, d3], c: c, h: h });
    }
  });

  /* ===================== Cap. 5 — supply chain ===================== */

  gen({
    id: "orl-g-sc-due-rotte", livello: "facile", capitolo: "supplychain",
    link: link("supplychain/#model", "supplychain/#modello"),
    prova: function (rng, L) {
      var D = 10 * ri(rng, 6, 20), u1 = D - 10 * ri(rng, 1, 5);
      var c1 = ri(rng, 1, 5), c2 = c1 + ri(rng, 1, 6);
      var z = c1 * u1 + c2 * (D - u1);
      function o(a, b) { return T(L, "cost ", "costo ") + a + " €, " + T(L, "marginal cost ", "costo marginale ") + b + " €/" + T(L, "unit", "unità"); }
      var testo = T(L,
        "A market demands $" + D + "$ units, served by two routes: route 1 with unit cost $" + c1 + "$ € and capacity $" + u1 + "$, route 2 with unit cost $" + c2 + "$ € and abundant capacity. In the minimum-cost flow LP, what are the optimal cost and the shadow price of the demand (cost of serving one more unit)?",
        "Un mercato chiede $" + D + "$ unità, servite da due rotte: la rotta 1 con costo unitario $" + c1 + "$ € e capacità $" + u1 + "$, la rotta 2 con costo unitario $" + c2 + "$ € e capacità abbondante. Nell'LP di flusso a costo minimo, quanto valgono il costo ottimo e il prezzo ombra della domanda (costo di servire un'unità in più)?");
      var sp = T(L,
        "The cheap route is saturated ($x_1 = " + u1 + "$) and the rest goes on route 2: $" + c1 + "\\cdot " + u1 + " + " + c2 + "\\cdot " + (D - u1) + " = " + z + "$ €. The next unit can only travel on route 2: the shadow price of the demand is $" + c2 + "$.",
        "La rotta economica è satura ($x_1 = " + u1 + "$) e il resto va sulla rotta 2: $" + c1 + "\\cdot " + u1 + " + " + c2 + "\\cdot " + (D - u1) + " = " + z + "$ €. L'unità successiva può viaggiare solo sulla rotta 2: il prezzo ombra della domanda è $" + c2 + "$.");
      return chiudi(rng, testo, o(z, c2), [o(z, c1), o(c1 * D, c1), o(z, c2 - c1), o(c2 * D, c2)], sp,
        { D: D, u1: u1, c1: c1, c2: c2 });
    }
  });

  gen({
    id: "orl-g-sc-congestione", livello: "media", capitolo: "supplychain",
    link: link("supplychain/#model", "supplychain/#modello"),
    prova: function (rng, L) {
      var c1 = pk(rng, [1, 2, 4, 5]), al = pk(rng, [0.5, 1, 2]), u1 = 10 * ri(rng, 4, 20), c2 = c1 + ri(rng, 1, 8);
      var x1 = (c2 - c1) * u1 / (2 * al * c1);
      if (Math.abs(x1 - Math.round(x1)) > 1e-9 || x1 < 10) return null;
      var D = Math.round(x1) + 10 * ri(rng, 1, 6);
      var xa = Math.min(u1, D), xb = Math.min((c2 - c1) * u1 / (al * c1), D), xc = D / 2;
      if (Math.abs(xb - Math.round(xb)) > 1e-9) return null;
      function o(a) { return "$(\\tilde x_1; \\tilde x_2) = (" + m(a, 1, L) + "; " + m(D - a, 1, L) + ")$"; }
      var testo = T(L,
        "Demand of $" + D + "$ units on two routes. Route 1 costs $" + c1 + "x_1 + \\alpha\\, " + c1 + "\\, x_1^2/" + u1 + "$ with $\\alpha = " + m(al, 1, L) + "$ (congestion), route 2 costs $" + c2 + "$ €/unit with abundant capacity. What is the optimal split of the flow?",
        "Domanda di $" + D + "$ unità su due rotte. La rotta 1 costa $" + c1 + "x_1 + \\alpha\\, " + c1 + "\\, x_1^2/" + u1 + "$ con $\\alpha = " + m(al, 1, L) + "$ (congestione), la rotta 2 costa $" + c2 + "$ €/unità con capacità abbondante. Qual è la ripartizione ottima del flusso?");
      var sp = T(L,
        "At the optimum the marginal costs are equal: $" + c1 + " + 2\\alpha\\," + c1 + "\\,x_1/" + u1 + " = " + c2 + "$, so $x_1 = " + m(x1, 1, L) + "$ and $x_2 = " + m(D - x1, 1, L) + "$. The pure LP would saturate route 1; forgetting the factor 2 of the derivative doubles $x_1$.",
        "All'ottimo i costi marginali sono uguali: $" + c1 + " + 2\\alpha\\," + c1 + "\\,x_1/" + u1 + " = " + c2 + "$, quindi $x_1 = " + m(x1, 1, L) + "$ e $x_2 = " + m(D - x1, 1, L) + "$. L'LP puro saturerebbe la rotta 1; dimenticare il fattore 2 della derivata raddoppia $x_1$.");
      return chiudi(rng, testo, o(x1), [o(xa), o(xb), o(xc)], sp, { D: D, u1: u1, c1: c1, c2: c2, alpha: al });
    }
  });

  /* ===================== Cap. 6 — Markowitz ===================== */

  gen({
    id: "orl-g-mk-minvar", livello: "facile", capitolo: "markowitz",
    link: link("markowitz/#model", "markowitz/#modello"),
    prova: function (rng, L) {
      var s1 = pk(rng, [10, 15, 20, 25, 30, 40]), s2 = pk(rng, [10, 15, 20, 25, 30, 40]);
      if (s1 === s2) return null;
      var v1 = s1 * s1, v2 = s2 * s2;
      function vol(x) { return Math.sqrt(x * x * v1 + (1 - x) * (1 - x) * v2); }
      function o(x) { return "$\\tilde x_1 = " + m(100 * x, 1, L) + "\\%$, $\\sigma_p = " + m(vol(x), 1, L) + "\\%$"; }
      var x = v2 / (v1 + v2);
      var testo = T(L,
        "Two uncorrelated assets with volatilities $\\sigma_1 = " + s1 + "\\%$ and $\\sigma_2 = " + s2 + "\\%$. Minimize the variance of the portfolio with $x_1 + x_2 = 1$ (no return constraint). What are the optimal share $\\tilde x_1$ and the portfolio volatility $\\sigma_p$?",
        "Due titoli non correlati con volatilità $\\sigma_1 = " + s1 + "\\%$ e $\\sigma_2 = " + s2 + "\\%$. Si minimizza la varianza del portafoglio con $x_1 + x_2 = 1$ (senza vincolo di rendimento). Quanto valgono la quota ottima $\\tilde x_1$ e la volatilità $\\sigma_p$ del portafoglio?");
      var sp = T(L,
        "Setting the derivative of $\\sigma_1^2 x_1^2 + \\sigma_2^2 (1 - x_1)^2$ to zero gives $x_1 = \\sigma_2^2/(\\sigma_1^2 + \\sigma_2^2)$: the weights are inversely proportional to the variances (not to the volatilities). The volatility is below that of both assets.",
        "Annullando la derivata di $\\sigma_1^2 x_1^2 + \\sigma_2^2 (1 - x_1)^2$ si ottiene $x_1 = \\sigma_2^2/(\\sigma_1^2 + \\sigma_2^2)$: i pesi sono inversamente proporzionali alle varianze (non alle volatilità). La volatilità è minore di quella di entrambi i titoli.");
      return chiudi(rng, testo, o(x), [o(s2 / (s1 + s2)), o(v1 / (v1 + v2)), o(0.5)], sp, { s1: s1, s2: s2 });
    }
  });

  gen({
    id: "orl-g-mk-portafoglio", livello: "facile", capitolo: "markowitz",
    link: link("markowitz/#model", "markowitz/#modello"),
    prova: function (rng, L) {
      var x1 = ri(rng, 2, 8) / 10, x2 = 1 - x1;
      var s1 = pk(rng, [0.1, 0.15, 0.2, 0.25, 0.3]), s2 = pk(rng, [0.1, 0.15, 0.2, 0.25, 0.3]);
      var rho = pk(rng, [-0.5, -0.25, 0.25, 0.5, 0.75]);
      var mu1 = ri(rng, 4, 14), mu2 = ri(rng, 4, 14);
      var mu = x1 * mu1 + x2 * mu2;
      var base = x1 * x1 * s1 * s1 + x2 * x2 * s2 * s2, cov = x1 * x2 * rho * s1 * s2;
      function o(v) { return T(L, "expected return ", "rendimento atteso ") + f(mu, 2, L) + "%, " + T(L, "variance ", "varianza ") + f(v, 4, L); }
      var testo = T(L,
        "Portfolio with $x_1 = " + m(x1, 1, L) + "$, $x_2 = " + m(x2, 1, L) + "$; expected returns $\\mu_1 = " + mu1 + "\\%$, $\\mu_2 = " + mu2 + "\\%$; volatilities $\\sigma_1 = " + m(s1, 2, L) + "$, $\\sigma_2 = " + m(s2, 2, L) + "$; correlation $\\rho = " + m(rho, 2, L) + "$, so $q_{12} = \\rho\\sigma_1\\sigma_2$. What are its expected return and its variance $\\sum_{i}\\sum_{j} q_{ij} x_i x_j$?",
        "Portafoglio con $x_1 = " + m(x1, 1, L) + "$, $x_2 = " + m(x2, 1, L) + "$; rendimenti attesi $\\mu_1 = " + mu1 + "\\%$, $\\mu_2 = " + mu2 + "\\%$; volatilità $\\sigma_1 = " + m(s1, 2, L) + "$, $\\sigma_2 = " + m(s2, 2, L) + "$; correlazione $\\rho = " + m(rho, 2, L) + "$, quindi $q_{12} = \\rho\\sigma_1\\sigma_2$. Quanto valgono il rendimento atteso e la varianza $\\sum_{i}\\sum_{j} q_{ij} x_i x_j$?");
      var sp = T(L,
        "The return is linear, $\\mu_1 x_1 + \\mu_2 x_2$. The variance has three terms: $x_1^2\\sigma_1^2 + x_2^2\\sigma_2^2 + 2x_1x_2\\rho\\sigma_1\\sigma_2$; the covariance appears twice ($q_{12}$ and $q_{21}$).",
        "Il rendimento è lineare, $\\mu_1 x_1 + \\mu_2 x_2$. La varianza ha tre termini: $x_1^2\\sigma_1^2 + x_2^2\\sigma_2^2 + 2x_1x_2\\rho\\sigma_1\\sigma_2$; la covarianza compare due volte ($q_{12}$ e $q_{21}$).");
      return chiudi(rng, testo, o(base + 2 * cov), [o(base), o(base + cov), o(x1 * s1 * s1 + x2 * s2 * s2), o(base - 2 * cov)], sp,
        { x1: x1, s1: s1, s2: s2, rho: rho, mu1: mu1, mu2: mu2 });
    }
  });

  gen({
    id: "orl-g-mk-correlati", livello: "media", capitolo: "markowitz",
    link: link("markowitz/#model", "markowitz/#modello"),
    prova: function (rng, L) {
      var s1 = pk(rng, [0.1, 0.15, 0.2, 0.25, 0.3, 0.4]), s2 = pk(rng, [0.1, 0.15, 0.2, 0.25, 0.3, 0.4]);
      if (s1 === s2) return null;
      var rho = pk(rng, [-0.5, -0.25, 0.25, 0.5]);
      var c = rho * s1 * s2, v1 = s1 * s1, v2 = s2 * s2;
      var x = (v2 - c) / (v1 + v2 - 2 * c);
      if (x <= 0.02 || x >= 0.98) return null;
      function vr(y) { return y * y * v1 + (1 - y) * (1 - y) * v2 + 2 * y * (1 - y) * c; }
      function o(y) { return "$\\tilde x_1 = " + m(100 * y, 1, L) + "\\%$, $\\sigma_p^2 = " + m(vr(y), 4, L) + "$"; }
      var xs = (v2 + c) / (v1 + v2 + 2 * c);
      var testo = T(L,
        "Two assets with volatilities $\\sigma_1 = " + m(s1, 2, L) + "$, $\\sigma_2 = " + m(s2, 2, L) + "$ and correlation $\\rho = " + m(rho, 2, L) + "$. Minimize the variance with $x_1 + x_2 = 1$ (no return constraint, no short selling needed). What are $\\tilde x_1$ and the minimum variance $\\sigma_p^2$?",
        "Due titoli con volatilità $\\sigma_1 = " + m(s1, 2, L) + "$, $\\sigma_2 = " + m(s2, 2, L) + "$ e correlazione $\\rho = " + m(rho, 2, L) + "$. Si minimizza la varianza con $x_1 + x_2 = 1$ (senza vincolo di rendimento; non servono vendite allo scoperto). Quanto valgono $\\tilde x_1$ e la varianza minima $\\sigma_p^2$?");
      var sp = T(L,
        "With correlation $x_1 = (\\sigma_2^2 - \\rho\\sigma_1\\sigma_2)/(\\sigma_1^2 + \\sigma_2^2 - 2\\rho\\sigma_1\\sigma_2) = " + m(x, 4, L) + "$; the variance is $x_1^2\\sigma_1^2 + x_2^2\\sigma_2^2 + 2x_1x_2\\rho\\sigma_1\\sigma_2$ at that weight. Ignoring $\\rho$ or flipping its sign gives the wrong weight.",
        "Con la correlazione $x_1 = (\\sigma_2^2 - \\rho\\sigma_1\\sigma_2)/(\\sigma_1^2 + \\sigma_2^2 - 2\\rho\\sigma_1\\sigma_2) = " + m(x, 4, L) + "$; la varianza è $x_1^2\\sigma_1^2 + x_2^2\\sigma_2^2 + 2x_1x_2\\rho\\sigma_1\\sigma_2$ in quel peso. Ignorare $\\rho$ o sbagliarne il segno dà il peso sbagliato.");
      var cand = [v2 / (v1 + v2), xs, 1 - x, 0.5].filter(function (y) { return y >= 0 && y <= 1; }).map(o);
      return chiudi(rng, testo, o(x), cand, sp, { s1: s1, s2: s2, rho: rho });
    }
  });

  /* ===================== Cap. 7 — pricing ===================== */

  function istanzaPricing(rng, soloAttivo) {
    var b = pk(rng, [2, 4, 5, 10]), A = 10 * ri(rng, 10, 30);
    var c = 2 * ri(rng, 5, 40);
    if (c >= A - 20) return null;
    var p0 = (A + c) / 2, q0 = b * (A - p0);
    var attivo = soloAttivo ? true : rng() < 0.6;
    var k;
    if (attivo) { k = q0 - b * 5 * ri(rng, 1, 6); if (k <= 0) return null; }
    else { k = q0 + 10 * ri(rng, 1, 10); }
    var ps = attivo ? (b * A - k) / b : p0;
    return { a: b * A, b: b, A: A, c: c, k: k, p0: p0, q0: q0, ps: ps, attivo: attivo };
  }
  function profitto(I, p) { return (p - I.c) * Math.max(0, Math.min(I.a - I.b * p, I.k)); }

  gen({
    id: "orl-g-pricing-ottimo", livello: "facile", capitolo: "pricing",
    link: link("pricing/#model", "pricing/#modello"),
    prova: function (rng, L) {
      var I = istanzaPricing(rng, false); if (!I) return null;
      function o(p) { return "$p^* = " + m(p, 2, L) + "$ €, " + T(L, "profit ", "profitto ") + f(profitto(I, p), 2, L) + " €"; }
      var testo = T(L,
        "Linear demand $d(p) = " + I.a + " - " + I.b + "p$, marginal cost $c = " + I.c + "$ €, capacity $k = " + I.k + "$. What are the optimal price and the optimal profit $(p - c)\\,q$?",
        "Domanda lineare $d(p) = " + I.a + " - " + I.b + "p$, costo marginale $c = " + I.c + "$ €, capacità $k = " + I.k + "$. Quanto valgono il prezzo ottimo e il profitto ottimo $(p - c)\\,q$?");
      var sp = I.attivo ? T(L,
        "Without capacity $p^\\circ = (a/b + c)/2 = " + m(I.p0, 2, L) + "$ with $q^\\circ = " + I.q0 + " > k$: capacity bites, and the price that sells exactly $k$ is $p^* = (a - k)/b = " + m(I.ps, 2, L) + "$.",
        "Senza capacità $p^\\circ = (a/b + c)/2 = " + m(I.p0, 2, L) + "$ con $q^\\circ = " + I.q0 + " > k$: la capacità morde, e il prezzo che vende esattamente $k$ è $p^* = (a - k)/b = " + m(I.ps, 2, L) + "$.") : T(L,
        "Without capacity $p^\\circ = (a/b + c)/2 = " + m(I.p0, 2, L) + "$ with $q^\\circ = " + I.q0 + " \\le k$: the capacity constraint is inactive and $p^* = p^\\circ$.",
        "Senza capacità $p^\\circ = (a/b + c)/2 = " + m(I.p0, 2, L) + "$ con $q^\\circ = " + I.q0 + " \\le k$: il vincolo di capacità non è attivo e $p^* = p^\\circ$.");
      var cand = I.attivo ? [I.p0, I.A / 2, I.ps - I.c / 2, I.A - I.c / 2] : [(I.a - I.k) / I.b, I.A / 2, I.A - I.c / 2, I.p0 + 5];
      var sb = [];
      for (var i = 0; i < cand.length; i++) if (cand[i] > I.c) sb.push(o(cand[i]));
      return chiudi(rng, testo, o(I.ps), sb, sp, { a: I.a, b: I.b, c: I.c, k: I.k });
    }
  });

  gen({
    id: "orl-g-pricing-posto", livello: "media", capitolo: "pricing",
    link: link("pricing/#model", "pricing/#modello"),
    prova: function (rng, L) {
      var I = istanzaPricing(rng, true); if (!I) return null;
      var v = I.ps - I.c - I.k / I.b;
      function o(x) { return f(x, 2, L) + " €"; }
      var testo = T(L,
        "Linear demand $d(p) = " + I.a + " - " + I.b + "p$, marginal cost $c = " + I.c + "$ €, capacity $k = " + I.k + "$ (the capacity constraint is active at the optimum). How much is one additional unit of capacity worth, $d\\Pi/dk$?",
        "Domanda lineare $d(p) = " + I.a + " - " + I.b + "p$, costo marginale $c = " + I.c + "$ €, capacità $k = " + I.k + "$ (all'ottimo il vincolo di capacità è attivo). Quanto vale un'unità di capacità in più, $d\\Pi/dk$?");
      var sp = T(L,
        "With $p^* = (a - k)/b = " + m(I.ps, 2, L) + "$ the profit is $(p^* - c)\\,k$, and $dp^*/dk = -1/b$: $d\\Pi/dk = (p^* - c) - k/b = " + m(v, 2, L) + "$. The full margin $p^* - c$ forgets that, to fill the extra seat, the price falls for everybody.",
        "Con $p^* = (a - k)/b = " + m(I.ps, 2, L) + "$ il profitto è $(p^* - c)\\,k$, e $dp^*/dk = -1/b$: $d\\Pi/dk = (p^* - c) - k/b = " + m(v, 2, L) + "$. Il margine pieno $p^* - c$ dimentica che, per riempire il posto in più, il prezzo scende per tutti.");
      return chiudi(rng, testo, o(v), [o(I.ps - I.c), o(I.ps - I.c - 2 * I.k / I.b), o(I.ps - I.k / I.b), o(I.ps)], sp,
        { a: I.a, b: I.b, c: I.c, k: I.k });
    }
  });

  /* ===================== Cap. 8 — budget ===================== */

  gen({
    id: "orl-g-budget-due-canali", livello: "media", capitolo: "budget",
    link: link("budget/#model", "budget/#modello"),
    prova: function (rng, L) {
      var k1 = pk(rng, [0.1, 0.2, 0.25, 0.5]), k2 = pk(rng, [0.1, 0.2, 0.25, 0.5]);
      var a1 = 10 * ri(rng, 2, 20), a2 = 10 * ri(rng, 2, 20), B = 10 * ri(rng, 2, 10);
      var x1 = (a1 * k1 * (1 + k2 * B) - a2 * k2) / (k1 * k2 * (a1 + a2));
      if (x1 < 2 || x1 > B - 2) return null;
      function lam1(x) { return a1 * k1 / (1 + k1 * x); }
      if (quasiMezzo(x1, 1) || quasiMezzo(lam1(x1), 2)) return null;
      function o(x, l) { return "$\\tilde x_1 = " + m(x, 1, L) + "$, $\\tilde x_2 = " + m(B - x, 1, L) + "$, $\\lambda = " + m(l, 2, L) + "$"; }
      var xp = B * a1 * k1 / (a1 * k1 + a2 * k2);
      var testo = T(L,
        "Budget $b = " + B + "$ (thousands of €) on two channels with responses $r_1(x) = " + a1 + "\\log(1 + " + m(k1, 2, L) + "x)$ and $r_2(x) = " + a2 + "\\log(1 + " + m(k2, 2, L) + "x)$, no caps. What are the optimal allocation and the shadow price $\\lambda$ of the budget?",
        "Budget $b = " + B + "$ (migliaia di €) su due canali con risposte $r_1(x) = " + a1 + "\\log(1 + " + m(k1, 2, L) + "x)$ e $r_2(x) = " + a2 + "\\log(1 + " + m(k2, 2, L) + "x)$, senza tetti. Quanto valgono l'allocazione ottima e il prezzo ombra $\\lambda$ del budget?");
      var sp = T(L,
        "At the optimum the marginal returns are equal: $" + m(a1 * k1, 2, L) + "/(1 + " + m(k1, 2, L) + "x_1) = " + m(a2 * k2, 2, L) + "/(1 + " + m(k2, 2, L) + "x_2)$ with $x_1 + x_2 = " + B + "$, so $x_1 = " + m(x1, 1, L) + "$; $\\lambda$ is the common marginal return, $" + m(lam1(x1), 2, L) + "$. Splitting in proportion to $a_i k_i$ ignores the saturation.",
        "All'ottimo i rendimenti marginali sono uguali: $" + m(a1 * k1, 2, L) + "/(1 + " + m(k1, 2, L) + "x_1) = " + m(a2 * k2, 2, L) + "/(1 + " + m(k2, 2, L) + "x_2)$ con $x_1 + x_2 = " + B + "$, quindi $x_1 = " + m(x1, 1, L) + "$; $\\lambda$ è il rendimento marginale comune, $" + m(lam1(x1), 2, L) + "$. Ripartire in proporzione ad $a_i k_i$ ignora la saturazione.");
      return chiudi(rng, testo, o(x1, lam1(x1)), [o(xp, lam1(xp)), o(B / 2, lam1(B / 2)), o(B, lam1(B)), o(0, a1 * k1)], sp,
        { a1: a1, a2: a2, k1: k1, k2: k2, B: B });
    }
  });

  /* ===================== Cap. 9 — localizzazione ===================== */

  gen({
    id: "orl-g-loc-weber-1d", livello: "facile", capitolo: "location",
    link: link("location/#model", "localizzazione/#modello"),
    prova: function (rng, L) {
      var n = pk(rng, [3, 5]), xs = [];
      while (xs.length < n) { var v = ri(rng, 0, 20); if (xs.indexOf(v) < 0) xs.push(v); }
      xs = sortNum(xs);
      var w = [], W = 0;
      for (var i = 0; i < n; i++) { w.push(ri(rng, 1, 5)); W += w[i]; }
      var cum = 0, med = null;
      for (i = 0; i < n; i++) {
        if (2 * (cum + w[i]) === W) return null;
        if (med === null && 2 * (cum + w[i]) > W) med = xs[i];
        cum += w[i];
      }
      var umed = xs[(n - 1) / 2];
      if (umed === med) return null;
      var cen = 0; for (i = 0; i < n; i++) cen += w[i] * xs[i]; cen /= W;
      var mm = (xs[0] + xs[n - 1]) / 2;
      function o(x) { return "$x^* = " + m(x, 1, L) + "$ km"; }
      var pts = [];
      for (i = 0; i < n; i++) pts.push(T(L, "km ", "km ") + xs[i] + " (" + T(L, "weight ", "peso ") + w[i] + ")");
      var testo = T(L,
        "Customers on a road: " + pts.join(", ") + ". Where is the Weber optimum (minimum weighted total distance $\\sum_i w_i |x - a_i|$)?",
        "Clienti su una strada: " + pts.join(", ") + ". Dove si trova l'ottimo di Weber (minima distanza totale pesata $\\sum_i w_i |x - a_i|$)?");
      var sp = T(L,
        "In one dimension Weber is the weighted median: the point that leaves at least half of the total weight ($" + W + "/2$) on each side, here km $" + med + "$. The centroid ($" + m(cen, 1, L) + "$) is the optimum of the squared distances, the midpoint of the extremes ($" + m(mm, 1, L) + "$) that of the minimax.",
        "In una dimensione Weber è la mediana pesata: il punto che lascia almeno metà del peso totale ($" + W + "/2$) da ciascun lato, qui il km $" + med + "$. Il baricentro ($" + m(cen, 1, L) + "$) è l'ottimo delle distanze al quadrato, il punto medio degli estremi ($" + m(mm, 1, L) + "$) quello del minimax.");
      return chiudi(rng, testo, o(med), [o(cen), o(mm), o(umed)], sp, { a: xs, w: w });
    }
  });

  /* ===================== Cap. 10 — ricarica EV ===================== */

  gen({
    id: "orl-g-ev-un-veicolo", livello: "facile", capitolo: "ev-charging",
    link: link("ev-charging/#model", "ricarica-ev/#modello"),
    prova: function (rng, L) {
      var pr = [0.08, 0.1, 0.12, 0.15, 0.2, 0.25, 0.3];
      var i1 = ri(rng, 0, 5), i2 = ri(rng, i1 + 1, 6), p1 = pr[i1], p2 = pr[i2];
      var pb = ri(rng, 4, 12), e = pb + ri(rng, 1, pb - 1);
      var z = pb * p1 + (e - pb) * p2;
      function o(a, b) { return T(L, "cost ", "costo ") + f(a, 2, L) + " €, " + T(L, "shadow price ", "prezzo ombra ") + f(b, 2, L) + " €/kWh"; }
      var testo = T(L,
        "One vehicle needs $e = " + e + "$ kWh ($\\eta = 1$) within two hours, with prices $\\pi_1 = " + m(p1, 2, L) + "$ and $\\pi_2 = " + m(p2, 2, L) + "$ €/kWh and maximum power $\\bar p = " + pb + "$ kW. What are the minimum cost and the shadow price of the energy requirement?",
        "Un veicolo deve ricevere $e = " + e + "$ kWh ($\\eta = 1$) entro due ore, con prezzi $\\pi_1 = " + m(p1, 2, L) + "$ e $\\pi_2 = " + m(p2, 2, L) + "$ €/kWh e potenza massima $\\bar p = " + pb + "$ kW. Quanto valgono il costo minimo e il prezzo ombra del requisito di energia?");
      var sp = T(L,
        "The cheap hour is used at full power ($" + pb + "$ kWh), the remaining $" + (e - pb) + "$ kWh go into hour 2: $" + m(z, 2, L) + "$ €. One more kWh would end up in the expensive hour: the dual is the price of the marginal hour, $" + m(p2, 2, L) + "$.",
        "L'ora economica si usa alla potenza massima ($" + pb + "$ kWh), i restanti $" + (e - pb) + "$ kWh vanno nell'ora 2: $" + m(z, 2, L) + "$ €. Un kWh in più finirebbe nell'ora cara: il duale è il prezzo dell'ora marginale, $" + m(p2, 2, L) + "$.");
      return chiudi(rng, testo, o(z, p2), [o(z, p1), o(e * p1, p1), o(z, p2 - p1), o(e * p2, p2)], sp,
        { e: e, p1: p1, p2: p2, pbar: pb });
    }
  });

  /* ===================== Cap. 11 — code ===================== */

  gen({
    id: "orl-g-code-ottimo", livello: "facile", capitolo: "queues",
    link: link("queues/#model", "code/#modello"),
    prova: function (rng, L) {
      var s = ri(rng, 2, 8), lam = ri(rng, 4, 40), c = ri(rng, 1, 5);
      var h = s * s * c / lam;
      if (Math.abs(2 * h - Math.round(2 * h)) > 1e-9 || h < 0.5 || h > 20) return null;
      function C(mu) { return c * mu + h * lam / (mu - lam); }
      function o(mu) { return "$\\mu^* = " + m(mu, 2, L) + "$, $C = " + m(C(mu), 2, L) + "$ €/h"; }
      var testo = T(L,
        "M/M/1 queue with $\\lambda = " + lam + "$ customers/hour, capacity cost $c = " + c + "$ € per unit of $\\mu$, value of time $h = " + m(h, 1, L) + "$ €/h. The model minimizes $c\\,\\mu + h\\,\\lambda/(\\mu - \\lambda)$. What are the optimal capacity and the total cost?",
        "Coda M/M/1 con $\\lambda = " + lam + "$ clienti/ora, costo della capacità $c = " + c + "$ € per unità di $\\mu$, valore del tempo $h = " + m(h, 1, L) + "$ €/h. Il modello minimizza $c\\,\\mu + h\\,\\lambda/(\\mu - \\lambda)$. Quanto valgono la capacità ottima e il costo totale?");
      var sp = T(L,
        "From $c - h\\lambda/(\\mu - \\lambda)^2 = 0$: $\\mu^* = \\lambda + \\sqrt{h\\lambda/c} = " + lam + " + " + s + " = " + (lam + s) + "$, with cost $" + c + "\\cdot " + (lam + s) + " + " + m(h, 1, L) + "\\cdot " + lam + "/" + s + " = " + m(C(lam + s), 2, L) + "$.",
        "Da $c - h\\lambda/(\\mu - \\lambda)^2 = 0$: $\\mu^* = \\lambda + \\sqrt{h\\lambda/c} = " + lam + " + " + s + " = " + (lam + s) + "$, con costo $" + c + "\\cdot " + (lam + s) + " + " + m(h, 1, L) + "\\cdot " + lam + "/" + s + " = " + m(C(lam + s), 2, L) + "$.");
      return chiudi(rng, testo, o(lam + s), [o(lam + h * lam / c), o(lam + Math.sqrt(h / c)), o(lam + 1), o(lam + s / 2)], sp,
        { lam: lam, c: c, h: h });
    }
  });

  gen({
    id: "orl-g-code-misure", livello: "facile", capitolo: "queues",
    link: link("queues/#model", "code/#modello"),
    prova: function (rng, L) {
      var lam = ri(rng, 2, 30), mu = lam + ri(rng, 1, 10);
      function o(r, w, l) { return "$\\rho = " + m(r, 1, L) + "\\%$, $w = " + m(w, 1, L) + "$ min, $l = " + m(l, 2, L) + "$"; }
      var rho = 100 * lam / mu, w = 60 / (mu - lam), l = lam / (mu - lam);
      var testo = T(L,
        "M/M/1 queue with arrival rate $\\lambda = " + lam + "$ per hour and service rate $\\mu = " + mu + "$ per hour. What are the utilization $\\rho$, the mean time in the system $w$ and the mean number of customers in the system $l$?",
        "Coda M/M/1 con tasso di arrivo $\\lambda = " + lam + "$ all'ora e tasso di servizio $\\mu = " + mu + "$ all'ora. Quanto valgono l'utilizzo $\\rho$, il tempo medio nel sistema $w$ e il numero medio di clienti nel sistema $l$?");
      var sp = T(L,
        "$\\rho = \\lambda/\\mu$, $w = 1/(\\mu - \\lambda)$ hours $= " + m(w, 1, L) + "$ minutes and, by Little's law, $l = \\lambda\\, w = \\lambda/(\\mu - \\lambda) = " + m(l, 2, L) + "$. $1/\\mu$ is only the mean service time.",
        "$\\rho = \\lambda/\\mu$, $w = 1/(\\mu - \\lambda)$ ore $= " + m(w, 1, L) + "$ minuti e, per la legge di Little, $l = \\lambda\\, w = \\lambda/(\\mu - \\lambda) = " + m(l, 2, L) + "$. $1/\\mu$ è solo il tempo medio di servizio.");
      return chiudi(rng, testo, o(rho, w, l), [o(rho, 60 / mu, lam / mu), o(rho, 60 * lam / (mu - lam), 1 / (mu - lam)), o(rho, w, mu / (mu - lam))], sp,
        { lam: lam, mu: mu });
    }
  });

  /* ===================== Cap. 12 — DEA ===================== */

  function istanzaDEA1(rng) {
    var n = 5, x = [], y = [];
    for (var j = 0; j < n; j++) { x.push(ri(rng, 2, 12)); y.push(ri(rng, 1, 12)); }
    return { x: x, y: y, n: n };
  }
  function tabellaDEA(I, L) {
    var s = T(L, "DMU $j$: ", "DMU $j$: ");
    var parti = [];
    for (var j = 0; j < I.n; j++) parti.push((j + 1) + " $(x_{1" + (j + 1) + "}, y_{1" + (j + 1) + "}) = (" + I.x[j] + ", " + I.y[j] + ")$");
    return s + parti.join("; ") + ". ";
  }
  function ccr1(I, o) {
    var best = 0;
    for (var j = 0; j < I.n; j++) best = Math.max(best, I.y[j] / I.x[j]);
    return (I.y[o] / I.x[o]) / best;
  }
  function bcc1(I, o, soloSingoli) {
    var best = Infinity;
    for (var j = 0; j < I.n; j++) {
      if (I.y[j] >= I.y[o]) best = Math.min(best, I.x[j]);
      if (soloSingoli) continue;
      for (var k = 0; k < I.n; k++) {
        if (I.y[j] < I.y[o] && I.y[o] < I.y[k]) {
          var a = (I.y[k] - I.y[o]) / (I.y[k] - I.y[j]);
          best = Math.min(best, a * I.x[j] + (1 - a) * I.x[k]);
        }
      }
    }
    return best / I.x[o];
  }

  gen({
    id: "orl-g-dea-ccr-1x1", livello: "facile", capitolo: "dea",
    link: link("dea/#the-input-oriented-ccr-model", "dea/#il-modello-ccr-orientato-allinput"),
    prova: function (rng, L) {
      var I = istanzaDEA1(rng), o = ri(rng, 0, 4);
      var e = ccr1(I, o);
      if (e > 0.98) return null;
      var jb = 0, jy = 0, jx = 0;
      for (var j = 0; j < I.n; j++) {
        if (I.y[j] / I.x[j] > I.y[jb] / I.x[jb]) jb = j;
        if (I.y[j] > I.y[jy]) jy = j;
        if (I.x[j] < I.x[jx]) jx = j;
      }
      function op(v) { return "$\\tilde h_{" + (o + 1) + "} = " + m(v, 3, L) + "$"; }
      var r = I.y[o] / I.x[o];
      var testo = T(L,
        "Five DMUs with one input $x$ and one output $y$. ", "Cinque DMU con un input $x$ e un output $y$. ") + tabellaDEA(I, L) + T(L,
        "What is the CCR relative efficiency of DMU " + (o + 1) + "?",
        "Qual è l'efficienza relativa CCR della DMU " + (o + 1) + "?");
      var sp = T(L,
        "With one input and one output the weights cancel: the efficiency is $y_o/x_o$ divided by the best ratio, $" + I.y[jb] + "/" + I.x[jb] + "$ of DMU " + (jb + 1) + ": $(" + I.y[o] + "/" + I.x[o] + ")/(" + I.y[jb] + "/" + I.x[jb] + ") = " + m(e, 3, L) + "$.",
        "Con un input e un output i pesi si semplificano: l'efficienza è $y_o/x_o$ diviso il rapporto migliore, $" + I.y[jb] + "/" + I.x[jb] + "$ della DMU " + (jb + 1) + ": $(" + I.y[o] + "/" + I.x[o] + ")/(" + I.y[jb] + "/" + I.x[jb] + ") = " + m(e, 3, L) + "$.");
      return chiudi(rng, testo, op(e),
        [op(r / (I.y[jy] / I.x[jy])), op(I.y[o] / I.y[jy]), op(I.x[jx] / I.x[o]), op(r), op(bcc1(I, o, false))],
        sp, { x: I.x, y: I.y, o: o + 1 });
    }
  });

  gen({
    id: "orl-g-dea-bcc-1x1", livello: "media", capitolo: "dea",
    link: link("dea/#the-bcc-model-and-scale-efficiency", "dea/#il-modello-bcc-e-lefficienza-di-scala"),
    prova: function (rng, L) {
      var I = istanzaDEA1(rng), o = ri(rng, 0, 4);
      var tB = bcc1(I, o, false), tS = bcc1(I, o, true), tC = ccr1(I, o);
      if (tB > 0.97 || tS - tB < 0.02 || tB - tC < 0.02) return null;
      function op(a, b) { return "$\\tilde\\theta^{\\rm BCC} = " + m(a, 3, L) + "$, $\\mathrm{SE} = " + m(b, 3, L) + "$"; }
      var testo = T(L,
        "Five DMUs with one input $x$ and one output $y$. ", "Cinque DMU con un input $x$ e un output $y$. ") + tabellaDEA(I, L) + T(L,
        "The CCR efficiency of DMU " + (o + 1) + " is $" + m(tC, 3, L) + "$. What are its input-oriented BCC efficiency and its scale efficiency?",
        "L'efficienza CCR della DMU " + (o + 1) + " è $" + m(tC, 3, L) + "$. Quanto valgono la sua efficienza BCC orientata all'input e la sua efficienza di scala?");
      var sp = T(L,
        "The BCC virtual DMU is a convex combination ($\\sum_j \\lambda_j = 1$) producing at least $y_o = " + I.y[o] + "$ with the least input: combining two DMUs on either side of $y_o$ gives $\\tilde\\theta^{\\rm BCC} = " + m(tB, 3, L) + "$, better than the best single DMU ($" + m(tS, 3, L) + "$). Then $\\mathrm{SE} = \\tilde\\theta^{\\rm CCR}/\\tilde\\theta^{\\rm BCC} = " + m(tC / tB, 3, L) + "$.",
        "La DMU virtuale BCC è una combinazione convessa ($\\sum_j \\lambda_j = 1$) che produce almeno $y_o = " + I.y[o] + "$ col minimo input: combinando due DMU ai due lati di $y_o$ si ottiene $\\tilde\\theta^{\\rm BCC} = " + m(tB, 3, L) + "$, meglio della migliore DMU singola ($" + m(tS, 3, L) + "$). Poi $\\mathrm{SE} = \\tilde\\theta^{\\rm CCR}/\\tilde\\theta^{\\rm BCC} = " + m(tC / tB, 3, L) + "$.");
      return chiudi(rng, testo, op(tB, tC / tB), [op(tS, tC / tS), op(tC, tC / tB), op(tB, tC), op(tC, 1)], sp,
        { x: I.x, y: I.y, o: o + 1 });
    }
  });

  /* theta CCR con 2 input e output y_j: punti normalizzati z_j = x_j / y_j */
  function theta2(Z, zo) {
    var best = Infinity, single = Infinity;
    function val(p) { return Math.max(p[0] / zo[0], p[1] / zo[1]); }
    for (var j = 0; j < Z.length; j++) {
      single = Math.min(single, val(Z[j]));
      for (var k = j + 1; k < Z.length; k++) {
        var al = [0, 1];
        // intersezione delle due rette p_i(a)/zo_i
        var A0 = (Z[j][0] - Z[k][0]) / zo[0], B0 = Z[k][0] / zo[0];
        var A1 = (Z[j][1] - Z[k][1]) / zo[1], B1 = Z[k][1] / zo[1];
        if (Math.abs(A0 - A1) > 1e-12) { var a = (B1 - B0) / (A0 - A1); if (a > 0 && a < 1) al.push(a); }
        for (var t = 0; t < al.length; t++) {
          var p = [al[t] * Z[j][0] + (1 - al[t]) * Z[k][0], al[t] * Z[j][1] + (1 - al[t]) * Z[k][1]];
          best = Math.min(best, val(p));
        }
      }
    }
    return { theta: Math.min(best, single), single: single };
  }

  gen({
    id: "orl-g-dea-ccr-2input", livello: "complessa", capitolo: "dea",
    link: link("dea/#the-envelopment-form-the-dual", "dea/#la-forma-di-inviluppo-il-duale"),
    prova: function (rng, L) {
      var n = 5, Z = [], y = [], X = [];
      for (var j = 0; j < n; j++) {
        var z = [ri(rng, 2, 12), ri(rng, 2, 12)], yy = ri(rng, 1, 3);
        Z.push(z); y.push(yy); X.push([z[0] * yy, z[1] * yy]);
      }
      var o = ri(rng, 0, 4);
      var r = theta2(Z, Z[o]);
      if (r.theta > 0.95 || r.single - r.theta < 0.02) return null;
      var raw = theta2(X, X[o]).theta;
      var mn = Infinity;
      for (j = 0; j < n; j++) mn = Math.min(mn, Z[j][0] / Z[o][0], Z[j][1] / Z[o][1]);
      function op(t) { return "$\\tilde\\theta = " + m(t, 3, L) + "$, target $(" + m(t * X[o][0], 2, L) + "; " + m(t * X[o][1], 2, L) + ")$"; }
      var parti = [];
      for (j = 0; j < n; j++) parti.push((j + 1) + ": $(" + X[j][0] + ", " + X[j][1] + "; " + y[j] + ")$");
      var testo = T(L,
        "Five DMUs with two inputs and one output, data $(x_{1j}, x_{2j}; y_{1j})$: " + parti.join(", ") + ". In the input-oriented CCR model, what are the efficiency $\\tilde\\theta$ of DMU " + (o + 1) + " and its radial input targets $(\\tilde\\theta x_{1o}; \\tilde\\theta x_{2o})$?",
        "Cinque DMU con due input e un output, dati $(x_{1j}, x_{2j}; y_{1j})$: " + parti.join(", ") + ". Nel modello CCR orientato all'input, quanto valgono l'efficienza $\\tilde\\theta$ della DMU " + (o + 1) + " e i suoi target radiali degli input $(\\tilde\\theta x_{1o}; \\tilde\\theta x_{2o})$?");
      var sp = T(L,
        "With constant returns divide the inputs by the output: the points $(x_{1j}/y_{1j}, x_{2j}/y_{2j})$ are compared with the same output. The envelopment form looks for the smallest $\\theta$ such that a combination of DMUs uses at most $\\theta$ times both inputs of DMU " + (o + 1) + ": here the optimum combines two DMUs, $\\tilde\\theta = " + m(r.theta, 3, L) + "$ (the best single DMU gives only $" + m(r.single, 3, L) + "$).",
        "Con rendimenti costanti si dividono gli input per l'output: i punti $(x_{1j}/y_{1j}, x_{2j}/y_{2j})$ si confrontano a parità di output. La forma di inviluppo cerca il più piccolo $\\theta$ tale che una combinazione di DMU usi al più $\\theta$ volte entrambi gli input della DMU " + (o + 1) + ": qui l'ottimo combina due DMU, $\\tilde\\theta = " + m(r.theta, 3, L) + "$ (la migliore DMU singola dà solo $" + m(r.single, 3, L) + "$).");
      return chiudi(rng, testo, op(r.theta), [op(r.single), op(raw), op(mn), op(Math.min(1, (r.theta + r.single) / 2 + 0.05))], sp,
        { X: X, y: y, o: o + 1 });
    }
  });

  /* ===================== Cap. 13 — newsvendor ===================== */

  gen({
    id: "orl-g-nv-uniforme", livello: "facile", capitolo: "newsvendor",
    link: link("newsvendor/#basic-model-and-the-quantile-rule", "newsvendor/#modello-base-e-regola-del-quantile"),
    prova: function (rng, L) {
      var p = ri(rng, 10, 30), c = ri(rng, 3, p - 2), v = ri(rng, 0, c - 1);
      var cu = p - c, co = c - v, A = 10 * ri(rng, 5, 15), k = ri(rng, 2, 8), W = k * (cu + co);
      if (cu === co) return null;
      function o(a) { return "$\\alpha^* = " + m(a, 4, L) + "$, $q^* = " + m(A + a * W, 1, L) + "$"; }
      var al = cu / (cu + co);
      var testo = T(L,
        "Newsvendor with price $p = " + p + "$, cost $c = " + c + "$ and salvage value $v = " + v + "$ €; demand uniform on $[" + A + ", " + (A + W) + "]$. What are the critical ratio $\\alpha^*$ and the optimal quantity?",
        "Newsvendor con prezzo $p = " + p + "$, costo $c = " + c + "$ e valore di recupero $v = " + v + "$ €; domanda uniforme su $[" + A + ", " + (A + W) + "]$. Quanto valgono il rapporto critico $\\alpha^*$ e la quantità ottima?");
      var sp = T(L,
        "$c_u = p - c = " + cu + "$, $c_o = c - v = " + co + "$, $\\alpha^* = c_u/(c_u + c_o) = " + cu + "/" + (cu + co) + "$; for the uniform distribution $F^{-1}(\\alpha) = " + A + " + " + W + "\\,\\alpha$, so $q^* = " + m(A + al * W, 1, L) + "$, not the mean.",
        "$c_u = p - c = " + cu + "$, $c_o = c - v = " + co + "$, $\\alpha^* = c_u/(c_u + c_o) = " + cu + "/" + (cu + co) + "$; per la distribuzione uniforme $F^{-1}(\\alpha) = " + A + " + " + W + "\\,\\alpha$, quindi $q^* = " + m(A + al * W, 1, L) + "$, non la media.");
      return chiudi(rng, testo, o(al), [o(co / (cu + co)), o(0.5), o(p / (p + c)), o(cu / (p + c))], sp,
        { p: p, c: c, v: v, A: A, B: A + W });
    }
  });

  function istanzaNVd(rng) {
    var k = pk(rng, [4, 5]), d = [];
    while (d.length < k) { var v = 10 * ri(rng, 5, 20); if (d.indexOf(v) < 0) d.push(v); }
    d = sortNum(d);
    var parts = [], rest = 10;
    for (var s = 0; s < k - 1; s++) {
      var mx = rest - (k - 1 - s);
      var t = ri(rng, 1, Math.min(4, mx)); parts.push(t); rest -= t;
    }
    if (rest < 1 || rest > 5) return null;
    parts.push(rest);
    var pr = parts.map(function (u) { return u / 10; });
    var cu = ri(rng, 2, 12), co = ri(rng, 2, 12);
    if (cu === co) return null;
    var al = cu / (cu + co), F = 0;
    for (s = 0; s < k; s++) { F += pr[s]; if (Math.abs(F - al) < 1e-9 || Math.abs(F - (1 - al)) < 1e-9 || Math.abs(F - 0.5) < 1e-9) return null; }
    return { d: d, pr: pr, cu: cu, co: co, al: al, k: k };
  }
  function nvCosto(I, q) {
    var C = 0;
    for (var s = 0; s < I.k; s++) C += I.pr[s] * (I.co * pos(q - I.d[s]) + I.cu * pos(I.d[s] - q));
    return C;
  }
  function nvQuantile(I, a) {
    var F = 0;
    for (var s = 0; s < I.k; s++) { F += I.pr[s]; if (F >= a - 1e-12) return s; }
    return I.k - 1;
  }
  function testoNVd(I, L) {
    var parti = [];
    for (var s = 0; s < I.k; s++) parti.push("$" + I.d[s] + "$ (" + m(I.pr[s], 1, L) + ")");
    return T(L, "Newsvendor with demand scenarios (probability in brackets) ", "Newsvendor con scenari di domanda (probabilità tra parentesi) ") +
      parti.join(", ") + "; $c_u = " + I.cu + "$, $c_o = " + I.co + "$. ";
  }

  gen({
    id: "orl-g-nv-discreto", livello: "media", capitolo: "newsvendor",
    link: link("newsvendor/#the-scenario-based-linear-formulation", "newsvendor/#la-formulazione-lineare-a-scenari"),
    prova: function (rng, L) {
      var I = istanzaNVd(rng); if (!I) return null;
      var s = nvQuantile(I, I.al), q = I.d[s];
      var sm = nvQuantile(I, 0.5), ss = nvQuantile(I, 1 - I.al), sn = s + 1 < I.k ? s + 1 : s - 1;
      function o(j) { return "$q^* = " + I.d[j] + "$, " + T(L, "expected cost ", "costo atteso ") + f(nvCosto(I, I.d[j]), 2, L); }
      var testo = testoNVd(I, L) + T(L, "What are the optimal quantity and its expected cost?", "Quanto valgono la quantità ottima e il suo costo atteso?");
      var sp = T(L,
        "$\\alpha^* = " + I.cu + "/" + (I.cu + I.co) + " = " + m(I.al, 4, L) + "$: the optimum is the smallest $q$ with $F(q) \\ge \\alpha^*$, that is $q^* = " + q + "$, with expected cost $\\sum_s \\pi_s (c_o (q - d_s)^+ + c_u (d_s - q)^+) = " + m(nvCosto(I, q), 2, L) + "$.",
        "$\\alpha^* = " + I.cu + "/" + (I.cu + I.co) + " = " + m(I.al, 4, L) + "$: l'ottimo è il più piccolo $q$ con $F(q) \\ge \\alpha^*$, cioè $q^* = " + q + "$, con costo atteso $\\sum_s \\pi_s (c_o (q - d_s)^+ + c_u (d_s - q)^+) = " + m(nvCosto(I, q), 2, L) + "$.");
      return chiudi(rng, testo, o(s), [o(sm), o(ss), o(sn), o(s - 1 >= 0 ? s - 1 : s + 1)], sp,
        { d: I.d, pr: I.pr, cu: I.cu, co: I.co });
    }
  });

  gen({
    id: "orl-g-nv-vss", livello: "complessa", capitolo: "newsvendor",
    link: link("newsvendor/#the-scenario-based-linear-formulation", "newsvendor/#la-formulazione-lineare-a-scenari"),
    prova: function (rng, L) {
      var I = istanzaNVd(rng); if (!I) return null;
      var s = nvQuantile(I, I.al), q = I.d[s], Cs = nvCosto(I, q);
      var dm = 0; for (var t = 0; t < I.k; t++) dm += I.pr[t] * I.d[t];
      var Cm = nvCosto(I, dm), vss = Cm - Cs;
      if (vss < 0.5) return null;
      var sm = nvQuantile(I, 0.5), ss = nvQuantile(I, 1 - I.al);
      function o(qq, c, v) { return "$q^* = " + qq + "$, " + T(L, "cost ", "costo ") + f(c, 2, L) + ", VSS $= " + m(v, 2, L) + "$"; }
      var testo = testoNVd(I, L) + T(L,
        "Compute the optimal quantity $q^*$, its expected cost and the value of the stochastic solution VSS (expected cost of ordering the mean demand minus the cost of $q^*$).",
        "Calcolare la quantità ottima $q^*$, il suo costo atteso e il valore della soluzione stocastica VSS (costo atteso di ordinare la domanda media meno il costo di $q^*$).");
      var sp = T(L,
        "$\\alpha^* = " + m(I.al, 4, L) + "$ gives $q^* = " + q + "$ with cost $" + m(Cs, 2, L) + "$. The mean demand is $" + m(dm, 1, L) + "$, whose expected cost is $" + m(Cm, 2, L) + "$: VSS $= " + m(Cm, 2, L) + " - " + m(Cs, 2, L) + " = " + m(vss, 2, L) + "$.",
        "$\\alpha^* = " + m(I.al, 4, L) + "$ dà $q^* = " + q + "$ con costo $" + m(Cs, 2, L) + "$. La domanda media è $" + m(dm, 1, L) + "$, con costo atteso $" + m(Cm, 2, L) + "$: VSS $= " + m(Cm, 2, L) + " - " + m(Cs, 2, L) + " = " + m(vss, 2, L) + "$.");
      var Cmed = nvCosto(I, I.d[sm]), Csw = nvCosto(I, I.d[ss]);
      return chiudi(rng, testo, o(q, Cs, vss),
        [o(q, Cs, Cm), (Cm - Cmed > 0 ? o(I.d[sm], Cmed, Cm - Cmed) : ""), (Cm - Csw > 0 ? o(I.d[ss], Csw, Cm - Csw) : ""), o(q, Cs, Cs)].filter(function (z) { return z; }),
        sp, { d: I.d, pr: I.pr, cu: I.cu, co: I.co });
    }
  });

  /* ===================== Cap. 14 — VaR e CVaR ===================== */

  function perdite(rng, k) {
    var l = [];
    while (l.length < k) { var v = ri(rng, 1, 40); if (l.indexOf(v) < 0) l.push(v); }
    return l;
  }
  function varcvar(l, pr, a) {
    var idx = l.map(function (_, i) { return i; }).sort(function (u, v) { return l[u] - l[v]; });
    var F = 0, V = null;
    for (var t = 0; t < idx.length; t++) { F += pr[idx[t]]; if (F >= a - 1e-12) { V = l[idx[t]]; break; } }
    var ex = 0;
    for (var i = 0; i < l.length; i++) ex += pr[i] * pos(l[i] - V);
    return { V: V, C: V + ex / (1 - a) };
  }

  gen({
    id: "orl-g-cvar-coda-intera", livello: "facile", capitolo: "var-cvar",
    link: link("var-cvar/#definitions", "var-cvar/#definizioni"),
    prova: function (rng, L) {
      var cfg = pk(rng, [[5, 0.6], [8, 0.75], [10, 0.7], [10, 0.8]]), k = cfg[0], a = cfg[1];
      var l = perdite(rng, k), s = sortNum(l), na = Math.round(a * k), nt = k - na;
      var V = s[na - 1], C = 0; for (var i = na; i < k; i++) C += s[i]; C /= nt;
      var Cinc = (C * nt + V) / (nt + 1), mean = 0; for (i = 0; i < k; i++) mean += l[i]; mean /= k;
      function o(v, c) { return "VaR $= " + m(v, 2, L) + "$, CVaR $= " + m(c, 2, L) + "$"; }
      var testo = T(L,
        "Equally likely losses ($k = " + k + "$ scenarios): $" + l.join(", ") + "$. With $\\alpha = " + m(a, 2, L) + "$, what are $\\mathrm{VaR}_\\alpha$ and $\\mathrm{CVaR}_\\alpha$?",
        "Perdite equiprobabili ($k = " + k + "$ scenari): $" + l.join(", ") + "$. Con $\\alpha = " + m(a, 2, L) + "$, quanto valgono $\\mathrm{VaR}_\\alpha$ e $\\mathrm{CVaR}_\\alpha$?");
      var sp = T(L,
        "Sorting the losses, the distribution function reaches $" + m(a, 2, L) + "$ at position " + na + " in increasing order: VaR $= " + V + "$. The tail of mass $1 - \\alpha$ contains exactly the " + nt + " worst losses, whose mean is the CVaR, $" + m(C, 2, L) + "$.",
        "Ordinando le perdite, la funzione di ripartizione raggiunge $" + m(a, 2, L) + "$ alla posizione " + na + " in ordine crescente: VaR $= " + V + "$. La coda di massa $1 - \\alpha$ contiene esattamente le " + nt + " perdite peggiori, la cui media è il CVaR, $" + m(C, 2, L) + "$.");
      return chiudi(rng, testo, o(V, C), [o(s[na], C), o(V, Cinc), o(V, s[k - 1]), o(mean, C)], sp,
        { l: l, alpha: a });
    }
  });

  gen({
    id: "orl-g-cvar-a-cavallo", livello: "media", capitolo: "var-cvar",
    link: link("var-cvar/#the-rockafellaruryasev-linear-formulation", "var-cvar/#la-formulazione-lineare-di-rockafellaruryasev"),
    prova: function (rng, L) {
      var k = 6, a = pk(rng, [0.7, 0.75, 0.8]);
      var l = perdite(rng, k), pr = [], s = sortNum(l);
      for (var i = 0; i < k; i++) pr.push(1 / k);
      var r = varcvar(l, pr, a);
      var ceilT = Math.ceil((1 - a) * k), floorT = Math.floor((1 - a) * k);
      function meanTop(t) { var c = 0; for (var j = k - t; j < k; j++) c += s[j]; return c / t; }
      var wV = s[Math.ceil(a * k)] !== undefined ? s[Math.ceil(a * k)] : s[k - 2];
      function o(v, c) { return "VaR $= " + m(v, 2, L) + "$, CVaR $= " + m(c, 2, L) + "$"; }
      var testo = T(L,
        "Six equally likely losses: $" + l.join(", ") + "$. With $\\alpha = " + m(a, 2, L) + "$, what are $\\mathrm{VaR}_\\alpha$ and $\\mathrm{CVaR}_\\alpha$? (The tail of mass $1 - \\alpha$ does not contain a whole number of scenarios.)",
        "Sei perdite equiprobabili: $" + l.join(", ") + "$. Con $\\alpha = " + m(a, 2, L) + "$, quanto valgono $\\mathrm{VaR}_\\alpha$ e $\\mathrm{CVaR}_\\alpha$? (La coda di massa $1 - \\alpha$ non contiene un numero intero di scenari.)");
      var sp = T(L,
        "VaR $= " + r.V + "$, the first loss at which the distribution function reaches $\\alpha$. Then $\\mathrm{CVaR} = \\mathrm{VaR} + \\frac{1}{1-\\alpha}\\sum_s \\pi_s (\\ell_s - \\mathrm{VaR})^+ = " + m(r.C, 2, L) + "$: the part of the tail mass that sits on the VaR point is counted at the VaR value.",
        "VaR $= " + r.V + "$, la prima perdita in cui la funzione di ripartizione raggiunge $\\alpha$. Poi $\\mathrm{CVaR} = \\mathrm{VaR} + \\frac{1}{1-\\alpha}\\sum_s \\pi_s (\\ell_s - \\mathrm{VaR})^+ = " + m(r.C, 2, L) + "$: la parte della massa di coda che sta sul punto del VaR si conta al valore del VaR.");
      var cand = [o(r.V, meanTop(ceilT)), o(r.V, floorT > 0 ? meanTop(floorT) : s[k - 1] + 1), o(wV, r.C), o(r.V, s[k - 1])];
      return chiudi(rng, testo, o(r.V, r.C), cand, sp, { l: l, pr: pr, alpha: a });
    }
  });

  gen({
    id: "orl-g-cvar-pesato", livello: "complessa", capitolo: "var-cvar",
    link: link("var-cvar/#the-rockafellaruryasev-linear-formulation", "var-cvar/#la-formulazione-lineare-di-rockafellaruryasev"),
    prova: function (rng, L) {
      var k = 5, a = pk(rng, [0.8, 0.85, 0.9]);
      var l = perdite(rng, k), u = [], rest = 20;
      for (var i = 0; i < k - 1; i++) { var t = ri(rng, 1, Math.min(8, rest - (k - 1 - i))); u.push(t); rest -= t; }
      if (rest < 1 || rest > 8) return null;
      u.push(rest);
      var pr = u.map(function (x) { return x / 20; });
      // F non deve coincidere con alpha
      var idx = l.map(function (_, j) { return j; }).sort(function (p, q) { return l[p] - l[q]; });
      var F = 0;
      for (i = 0; i < k; i++) { F += pr[idx[i]]; if (Math.abs(F - a) < 1e-9) return null; }
      var r = varcvar(l, pr, a), eq = varcvar(l, [0.2, 0.2, 0.2, 0.2, 0.2], a);
      var num = 0, den = 0, num2 = 0, den2 = 0;
      for (i = 0; i < k; i++) {
        if (l[i] > r.V) { num += pr[i] * l[i]; den += pr[i]; }
        if (l[i] >= r.V) { num2 += pr[i] * l[i]; den2 += pr[i]; }
      }
      if (den === 0) return null;
      function o(v, c) { return "VaR $= " + m(v, 2, L) + "$, CVaR $= " + m(c, 2, L) + "$"; }
      var parti = [];
      for (i = 0; i < k; i++) parti.push("$" + l[i] + "$ (" + m(pr[i], 2, L) + ")");
      var testo = T(L,
        "Loss scenarios with probabilities in brackets: " + parti.join(", ") + ". With $\\alpha = " + m(a, 2, L) + "$, what are $\\mathrm{VaR}_\\alpha$ and $\\mathrm{CVaR}_\\alpha$ (the optimal $\\eta$ and the optimal value of the Rockafellar–Uryasev LP)?",
        "Scenari di perdita con le probabilità tra parentesi: " + parti.join(", ") + ". Con $\\alpha = " + m(a, 2, L) + "$, quanto valgono $\\mathrm{VaR}_\\alpha$ e $\\mathrm{CVaR}_\\alpha$ (l'$\\eta$ ottimo e il valore ottimo dell'LP di Rockafellar–Uryasev)?");
      var sp = T(L,
        "Sorting the losses and accumulating the probabilities, $F$ reaches $" + m(a, 2, L) + "$ at $\\ell = " + r.V + "$: VaR $= " + r.V + "$. Then $\\mathrm{CVaR} = " + r.V + " + \\frac{1}{" + m(1 - a, 2, L) + "}\\sum_s \\pi_s(\\ell_s - " + r.V + ")^+ = " + m(r.C, 2, L) + "$. The conditional mean beyond the VaR ignores the tail mass sitting on the VaR point.",
        "Ordinando le perdite e cumulando le probabilità, $F$ raggiunge $" + m(a, 2, L) + "$ in $\\ell = " + r.V + "$: VaR $= " + r.V + "$. Poi $\\mathrm{CVaR} = " + r.V + " + \\frac{1}{" + m(1 - a, 2, L) + "}\\sum_s \\pi_s(\\ell_s - " + r.V + ")^+ = " + m(r.C, 2, L) + "$. La media condizionata oltre il VaR ignora la massa di coda che sta sul punto del VaR.");
      return chiudi(rng, testo, o(r.V, r.C), [o(eq.V, eq.C), o(r.V, num / den), o(r.V, num2 / den2), o(r.V, r.V + num - r.V * den)], sp,
        { l: l, pr: pr, alpha: a });
    }
  });

  /* ===================== Cap. 15 — arbitraggio ===================== */

  function istanzaArb(rng) {
    var R = pk(rng, [1, 1.05, 1.1, 1.25]), s0 = ri(rng, 10, 50);
    var Rs = R * s0, d = ri(rng, Math.max(1, Math.floor(0.5 * s0)), Math.floor(Rs) - 1), u = ri(rng, Math.ceil(Rs) + 1, Math.ceil(1.6 * Rs) + 2);
    if (!(d < Rs && Rs < u)) return null;
    var q1 = (Rs - d) / (u - d);
    if (q1 < 0.05 || q1 > 0.95) return null;
    return { R: R, s0: s0, d: d, u: u, q1: q1 };
  }
  function testoArb(I, L) {
    return T(L,
      "Two states of the world, gross risk-free return $R = " + m(I.R, 2, L) + "$; a risky security costs $s^0_1 = " + I.s0 + "$ today and pays $" + I.u + "$ in state 1 and $" + I.d + "$ in state 2. ",
      "Due stati del mondo, rendimento lordo privo di rischio $R = " + m(I.R, 2, L) + "$; un titolo rischioso costa oggi $s^0_1 = " + I.s0 + "$ e paga $" + I.u + "$ nello stato 1 e $" + I.d + "$ nello stato 2. ");
  }

  gen({
    id: "orl-g-arb-neutrali", livello: "facile", capitolo: "arbitrage",
    link: link("arbitrage/#duality-is-pricing", "arbitraggio/#la-dualita-e-la-prezzatura"),
    prova: function (rng, L) {
      var I = istanzaArb(rng); if (!I) return null;
      function o(a) { return "$(q_1; q_2) = (" + m(a, 4, L) + "; " + m(1 - a, 4, L) + ")$"; }
      var testo = testoArb(I, L) + T(L, "What are the risk-neutral probabilities?", "Quanto valgono le probabilità neutrali al rischio?");
      var sp = T(L,
        "The price is the discounted expected payoff: $s^0_1 = (q_1 \\cdot " + I.u + " + q_2 \\cdot " + I.d + ")/R$ with $q_1 + q_2 = 1$, so $q_1 = (R s^0_1 - " + I.d + ")/(" + I.u + " - " + I.d + ") = " + m(I.q1, 4, L) + "$. Forgetting $R$ is the typical mistake.",
        "Il prezzo è il valore atteso scontato dei pagamenti: $s^0_1 = (q_1 \\cdot " + I.u + " + q_2 \\cdot " + I.d + ")/R$ con $q_1 + q_2 = 1$, quindi $q_1 = (R s^0_1 - " + I.d + ")/(" + I.u + " - " + I.d + ") = " + m(I.q1, 4, L) + "$. Dimenticare $R$ è l'errore tipico.");
      var cand = [(I.s0 - I.d) / (I.u - I.d), 1 - I.q1, I.R * I.s0 / I.u, 0.5].filter(function (y) { return y > 0 && y < 1; }).map(o);
      return chiudi(rng, testo, o(I.q1), cand, sp,
        { R: I.R, s0: I.s0, u: I.u, d: I.d });
    }
  });

  gen({
    id: "orl-g-arb-call", livello: "media", capitolo: "arbitrage",
    link: link("arbitrage/#sensitivity-the-interval-of-consistent-prices", "arbitraggio/#sensitivita-lintervallo-dei-prezzi-coerenti"),
    prova: function (rng, L) {
      var I = istanzaArb(rng); if (!I) return null;
      var K = ri(rng, I.d + 1, I.u - 1), pay = I.u - K;
      var pr = I.q1 * pay / I.R;
      var qn = (I.s0 - I.d) / (I.u - I.d);
      function o(v) { return f(v, 2, L); }
      var testo = testoArb(I, L) + T(L,
        "In this complete market, what is the arbitrage-free price of a call on the security with strike $" + K + "$ (payoff $\\max(s^1_{1j} - " + K + ", 0)$)?",
        "In questo mercato completo, qual è il prezzo senza arbitraggio di una call sul titolo con strike $" + K + "$ (pagamento $\\max(s^1_{1j} - " + K + ", 0)$)?");
      var sp = T(L,
        "The risk-neutral probabilities are $q_1 = (R s^0_1 - " + I.d + ")/(" + I.u + " - " + I.d + ") = " + m(I.q1, 4, L) + "$, $q_2 = 1 - q_1$. The call pays $(" + pay + ", 0)$, so its price is $q_1 \\cdot " + pay + "/R = " + m(pr, 2, L) + "$: discounted expected value under $q$.",
        "Le probabilità neutrali al rischio sono $q_1 = (R s^0_1 - " + I.d + ")/(" + I.u + " - " + I.d + ") = " + m(I.q1, 4, L) + "$, $q_2 = 1 - q_1$. La call paga $(" + pay + ", 0)$, quindi il suo prezzo è $q_1 \\cdot " + pay + "/R = " + m(pr, 2, L) + "$: valore atteso scontato sotto $q$.");
      return chiudi(rng, testo, o(pr), [o(I.q1 * pay), o(qn * pay / I.R), o(0.5 * pay / I.R), o(pos(I.s0 - K))], sp,
        { R: I.R, s0: I.s0, u: I.u, d: I.d, K: K });
    }
  });

  /* ===================== Cap. 16 — SVM ===================== */

  gen({
    id: "orl-g-svm-due-punti", livello: "facile", capitolo: "svm",
    link: link("svm/#hard-margin", "svm/#hard-margin"),
    prova: function (rng, L) {
      var a = ri(rng, 0, 4), b = ri(rng, 0, 4);
      if (a === 0 && b === 0) return null;
      var n2 = a * a + b * b, nr = Math.sqrt(n2);
      function o(w1, w2, mg) { return "$\\mathbf w = (" + m(w1, 3, L) + "; " + m(w2, 3, L) + ")$, " + T(L, "margin ", "margine ") + "$" + m(mg, 3, L) + "$"; }
      var testo = T(L,
        "Hard margin SVM with two observations: $\\mathbf x_1 = (0; 0)$ with $y_1 = -1$ and $\\mathbf x_2 = (" + a + "; " + b + ")$ with $y_2 = +1$. What are the optimal $\\mathbf w$ and the geometric margin $2/\\|\\mathbf w\\|$?",
        "SVM hard margin con due osservazioni: $\\mathbf x_1 = (0; 0)$ con $y_1 = -1$ e $\\mathbf x_2 = (" + a + "; " + b + ")$ con $y_2 = +1$. Quanto valgono il $\\mathbf w$ ottimo e il margine geometrico $2/\\|\\mathbf w\\|$?");
      var sp = T(L,
        "Both constraints are active: $b = -1$ and $\\mathbf w'\\mathbf x_2 + b = 1$; the minimum-norm $\\mathbf w$ is parallel to $\\mathbf x_2$, $\\mathbf w = 2\\mathbf x_2/\\|\\mathbf x_2\\|^2$. The margin $2/\\|\\mathbf w\\| = \\|\\mathbf x_2\\| = " + m(nr, 3, L) + "$ is the distance between the two points.",
        "Entrambi i vincoli sono attivi: $b = -1$ e $\\mathbf w'\\mathbf x_2 + b = 1$; il $\\mathbf w$ di norma minima è parallelo a $\\mathbf x_2$, $\\mathbf w = 2\\mathbf x_2/\\|\\mathbf x_2\\|^2$. Il margine $2/\\|\\mathbf w\\| = \\|\\mathbf x_2\\| = " + m(nr, 3, L) + "$ è la distanza fra i due punti.");
      return chiudi(rng, testo, o(2 * a / n2, 2 * b / n2, nr),
        [o(a / n2, b / n2, 2 * nr), o(a, b, 2 / nr), o(2 * a / n2, 2 * b / n2, nr / 2)], sp, { x2: [a, b] });
    }
  });

  /* ===================== Cap. 17 — regressione ===================== */

  function perditaQ(y, b, tau) {
    var z = 0;
    for (var i = 0; i < y.length; i++) z += tau * pos(y[i] - b) + (1 - tau) * pos(b - y[i]);
    return z;
  }

  gen({
    id: "orl-g-reg-perdita", livello: "facile", capitolo: "regression",
    link: link("regression/#the-model", "regressione/#il-modello"),
    prova: function (rng, L) {
      var n = 5, y = [];
      while (y.length < n) { var v = ri(rng, 80, 150); if (y.indexOf(v) < 0) y.push(v); }
      var tau = pk(rng, [0.25, 0.75, 0.8, 0.9]), b = ri(rng, 90, 140);
      var up = 0, dn = 0;
      for (var i = 0; i < n; i++) { up += pos(y[i] - b); dn += pos(b - y[i]); }
      if (up === 0 || dn === 0) return null;
      function o(z) { return "$" + m(z, 2, L) + "$"; }
      var testo = T(L,
        "Quantile regression with no features ($p = 0$), $\\tau = " + m(tau, 2, L) + "$, observations $y = (" + y.join("; ") + ")$. What is the objective value $\\sum_i [\\tau u_i + (1 - \\tau) v_i]$ for the intercept $b = " + b + "$?",
        "Regressione quantile senza caratteristiche ($p = 0$), $\\tau = " + m(tau, 2, L) + "$, osservazioni $y = (" + y.join("; ") + ")$. Quanto vale l'obiettivo $\\sum_i [\\tau u_i + (1 - \\tau) v_i]$ per l'intercetta $b = " + b + "$?");
      var sp = T(L,
        "The deviations above ($u_i$, observations larger than $b$) sum to $" + up + "$ and are paid $\\tau$; those below ($v_i$) sum to $" + dn + "$ and are paid $1 - \\tau$: $" + m(tau, 2, L) + "\\cdot " + up + " + " + m(1 - tau, 2, L) + "\\cdot " + dn + " = " + m(tau * up + (1 - tau) * dn, 2, L) + "$.",
        "Gli scostamenti in eccesso ($u_i$, osservazioni maggiori di $b$) sommano $" + up + "$ e si pagano $\\tau$; quelli in difetto ($v_i$) sommano $" + dn + "$ e si pagano $1 - \\tau$: $" + m(tau, 2, L) + "\\cdot " + up + " + " + m(1 - tau, 2, L) + "\\cdot " + dn + " = " + m(tau * up + (1 - tau) * dn, 2, L) + "$.");
      return chiudi(rng, testo, o(tau * up + (1 - tau) * dn),
        [o((1 - tau) * up + tau * dn), o(up + dn), o(tau * (up + dn)), o(0.5 * (up + dn))], sp, { y: y, tau: tau, b: b });
    }
  });

  gen({
    id: "orl-g-reg-quantile", livello: "media", capitolo: "regression",
    link: link("regression/#the-model", "regressione/#il-modello"),
    prova: function (rng, L) {
      var n = ri(rng, 5, 9), y = [];
      while (y.length < n) { var v = ri(rng, 80, 160); if (y.indexOf(v) < 0) y.push(v); }
      var tau = pk(rng, [0.25, 0.3, 0.6, 0.7, 0.75, 0.8, 0.9]);
      var tn = tau * n;
      if (Math.abs(tn - Math.round(tn)) < 1e-9) return null;
      var s = sortNum(y), j = Math.ceil(tn) - 1, b = s[j];
      var jm = Math.ceil(0.5 * n - 1e-9) - 1;
      function o(bb) { return "$\\tilde b = " + m(bb, 1, L) + "$, $\\tilde z = " + m(perditaQ(y, bb, tau), 2, L) + "$"; }
      var mean = 0; for (var i = 0; i < n; i++) mean += y[i]; mean /= n;
      var testo = T(L,
        "Quantile regression with no features ($p = 0$) and $\\tau = " + m(tau, 2, L) + "$ on the $n = " + n + "$ observations $y = (" + y.join("; ") + ")$. What are the optimal intercept $\\tilde b$ and the optimal value $\\tilde z$?",
        "Regressione quantile senza caratteristiche ($p = 0$) e $\\tau = " + m(tau, 2, L) + "$ sulle $n = " + n + "$ osservazioni $y = (" + y.join("; ") + ")$. Quanto valgono l'intercetta ottima $\\tilde b$ e il valore ottimo $\\tilde z$?");
      var sp = T(L,
        "Without features the LP returns the empirical $\\tau$-quantile: raising $b$ pays while the share of observations below it is at most $\\tau$. Since $\\tau n = " + m(tn, 2, L) + "$, $\\tilde b$ is the observation in position " + (j + 1) + " in increasing order, $" + b + "$, with $\\tilde z = " + m(perditaQ(y, b, tau), 2, L) + "$.",
        "Senza caratteristiche l'LP restituisce il quantile empirico di livello $\\tau$: alzare $b$ conviene finché la quota di osservazioni sotto di esso è al più $\\tau$. Poiché $\\tau n = " + m(tn, 2, L) + "$, $\\tilde b$ è l'osservazione in posizione " + (j + 1) + " in ordine crescente, $" + b + "$, con $\\tilde z = " + m(perditaQ(y, b, tau), 2, L) + "$.");
      var cand = [o(s[jm]), o(j + 1 < n ? s[j + 1] : s[j - 2]), o(j - 1 >= 0 ? s[j - 1] : s[j + 2]), o(mean)];
      return chiudi(rng, testo, o(b), cand, sp, { y: y, tau: tau });
    }
  });
})();
