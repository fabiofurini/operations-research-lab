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
      k(A[1][0]) + "x_1 + " + k(A[1][1]) + "x_2 \\le " + b[1] + "$, $x_1, x_2 \\ge 0$; " +
      T(L, "its dual has one variable $\\pi_i \\ge 0$ per constraint $i$ (the shadow price of the constraint). ",
           "il suo duale ha una variabile $\\pi_i \\ge 0$ per ogni vincolo $i$ (il prezzo ombra del vincolo). ");
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
        "The optimal solution is $(\\tilde x_1, \\tilde x_2) = (" + I.x[0] + ", " + I.x[1] + ")$, with both constraints active. What are the optimal dual values $(\\tilde\\pi_1, \\tilde\\pi_2)$?",
        "La soluzione ottima è $(\\tilde x_1, \\tilde x_2) = (" + I.x[0] + ", " + I.x[1] + ")$, con entrambi i vincoli attivi. Quali sono i valori duali ottimi $(\\tilde\\pi_1, \\tilde\\pi_2)$?");
      var sp = T(L,
        "Both variables are positive, so by complementary slackness both dual constraints are active: $" + A[0][0] + "\\pi_1 + " + A[1][0] + "\\pi_2 = " + c[0] + "$ and $" + A[0][1] + "\\pi_1 + " + A[1][1] + "\\pi_2 = " + c[1] + "$ (the coefficients are the columns of the primal), hence $\\tilde\\pi = (" + p[0] + "; " + p[1] + ")$. Solving with the rows instead of the columns is the typical mistake.",
        "Le due variabili sono positive, quindi per gli scarti complementari i due vincoli duali sono attivi: $" + A[0][0] + "\\pi_1 + " + A[1][0] + "\\pi_2 = " + c[0] + "$ e $" + A[0][1] + "\\pi_1 + " + A[1][1] + "\\pi_2 = " + c[1] + "$ (i coefficienti sono le colonne del primale), da cui $\\tilde\\pi = (" + p[0] + "; " + p[1] + ")$. Risolvere con le righe invece che con le colonne è l'errore tipico.");
      var cand = [[r1, r2], [p[1], p[0]], [q1, q2], [s1, s2]].filter(function (u) { return u[0] >= 0 && u[1] >= 0; })
        .map(function (u) { return o(u[0], u[1]); });
      return chiudi(rng, testo, o(p[0], p[1]), cand, sp,
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
        "At the optimum the duals are $(\\tilde\\pi_1, \\tilde\\pi_2) = (" + p[0] + ", " + p[1] + ")$. We add a variable $x_3 \\ge 0$ with objective coefficient $c_3 = " + c3 + "$ and consumptions $a_{13} = " + a13 + "$, $a_{23} = " + a23 + "$. What are its reduced cost $\\bar c_3$ ($c_3$ minus the value of the resources it consumes at the shadow prices) and the threshold $c_3^{\\max}$, the smallest $c_3$ at which $x_3$ becomes worth using?",
        "All'ottimo i duali sono $(\\tilde\\pi_1, \\tilde\\pi_2) = (" + p[0] + ", " + p[1] + ")$. Si aggiunge una variabile $x_3 \\ge 0$ con coefficiente $c_3 = " + c3 + "$ in obiettivo e consumi $a_{13} = " + a13 + "$, $a_{23} = " + a23 + "$. Quanto valgono il suo costo ridotto $\\bar c_3$ ($c_3$ meno il valore delle risorse che consuma ai prezzi ombra) e la soglia $c_3^{\\max}$, il più piccolo $c_3$ per cui conviene usare $x_3$?");
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
      "Production-inventory LP, one product, two months: $x_t$ = units produced and $s_t$ = inventory at the end of month $t$, balance $s_{t-1} + x_t = d_t + s_t$ ($s_0 = 0$), capacity $x_t \\le b_t$; minimize $\\sum_t (c\\,x_t + h\\,s_t)$. Data: demand $d_1 = " + I.d1 + "$, $d_2 = " + I.d2 + "$; $b_1 = b_2 = " + I.b + "$ units; $c = " + I.c + "$ €/unit, holding cost $h = " + I.h + "$ €/unit/month. ",
      "LP di produzione e scorte, un prodotto, due mesi: $x_t$ = unità prodotte e $s_t$ = scorta a fine mese $t$, bilancio $s_{t-1} + x_t = d_t + s_t$ ($s_0 = 0$), capacità $x_t \\le b_t$; si minimizza $\\sum_t (c\\,x_t + h\\,s_t)$. Dati: domanda $d_1 = " + I.d1 + "$, $d_2 = " + I.d2 + "$; $b_1 = b_2 = " + I.b + "$ unità; $c = " + I.c + "$ €/unità, costo di giacenza $h = " + I.h + "$ €/unità/mese. ");
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
        "What are the shadow prices $\\tilde\\pi_t = \\partial\\tilde z/\\partial b_t$ of the two capacity constraints ($\\tilde z$ = optimal cost; Gurobi's sign convention)?",
        "Quanto valgono i prezzi ombra $\\tilde\\pi_t = \\partial\\tilde z/\\partial b_t$ dei due vincoli di capacità ($\\tilde z$ = costo ottimo; convenzione di segno di Gurobi)?");
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
        "Production-inventory LP, one product, three months: $x_t$ = units produced and $s_t$ = inventory at the end of month $t$, balance $s_{t-1} + x_t = d_t + s_t$ ($s_0 = 0$), capacity $x_t \\le b_t$; minimize $z = \\sum_t (c\\,x_t + h\\,s_t)$. Data: $(d_1, d_2, d_3) = (" + d1 + ", " + d2 + ", " + d3 + ")$, $(b_1, b_2, b_3) = (" + b1 + ", " + b2 + ", " + b3 + ")$, $c = " + c + "$ €/unit, $h = " + h + "$ €/unit/month. What are the optimal cost $\\tilde z$ and the optimal inventories $\\tilde s_1, \\tilde s_2$?",
        "LP di produzione e scorte, un prodotto, tre mesi: $x_t$ = unità prodotte e $s_t$ = scorta a fine mese $t$, bilancio $s_{t-1} + x_t = d_t + s_t$ ($s_0 = 0$), capacità $x_t \\le b_t$; si minimizza $z = \\sum_t (c\\,x_t + h\\,s_t)$. Dati: $(d_1, d_2, d_3) = (" + d1 + ", " + d2 + ", " + d3 + ")$, $(b_1, b_2, b_3) = (" + b1 + ", " + b2 + ", " + b3 + ")$, $c = " + c + "$ €/unità, $h = " + h + "$ €/unità/mese. Quanto valgono il costo ottimo $\\tilde z$ e le scorte ottime $\\tilde s_1, \\tilde s_2$?");
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
        "Minimum-cost flow LP of a supply chain: a market demands $D = " + D + "$ units, sent on two routes with flows $x_1, x_2 \\ge 0$ and demand constraint $x_1 + x_2 \\ge D$. Route 1 costs $c_1 = " + c1 + "$ €/unit with capacity $x_1 \\le " + u1 + "$; route 2 costs $c_2 = " + c2 + "$ €/unit with unlimited capacity. What are the optimal cost and the shadow price of the demand constraint (cost of serving one more unit)?",
        "LP di flusso a costo minimo di una supply chain: un mercato chiede $D = " + D + "$ unità, inviate su due rotte con flussi $x_1, x_2 \\ge 0$ e vincolo di domanda $x_1 + x_2 \\ge D$. La rotta 1 costa $c_1 = " + c1 + "$ €/unità con capacità $x_1 \\le " + u1 + "$; la rotta 2 costa $c_2 = " + c2 + "$ €/unità con capacità illimitata. Quanto valgono il costo ottimo e il prezzo ombra del vincolo di domanda (costo di servire un'unità in più)?");
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
        "Supply chain with congestion: $D = " + D + "$ units are split between two routes, $x_1 + x_2 = D$, $x_1, x_2 \\ge 0$. Route 1 (unit cost $c_1 = " + c1 + "$, nominal capacity $u_1 = " + u1 + "$, congestion parameter $\\alpha = " + m(al, 1, L) + "$) costs $c_1x_1 + \\alpha c_1x_1^2/u_1$ €; route 2 costs $c_2 = " + c2 + "$ €/unit with ample capacity. Minimizing the total cost, what is the optimal split $(\\tilde x_1; \\tilde x_2)$?",
        "Supply chain con congestione: $D = " + D + "$ unità si ripartiscono su due rotte, $x_1 + x_2 = D$, $x_1, x_2 \\ge 0$. La rotta 1 (costo unitario $c_1 = " + c1 + "$, capacità nominale $u_1 = " + u1 + "$, parametro di congestione $\\alpha = " + m(al, 1, L) + "$) costa $c_1x_1 + \\alpha c_1x_1^2/u_1$ €; la rotta 2 costa $c_2 = " + c2 + "$ €/unità con capacità ampia. Minimizzando il costo totale, qual è la ripartizione ottima $(\\tilde x_1; \\tilde x_2)$?");
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
        "Markowitz model with two uncorrelated assets of volatilities (standard deviations of the return) $\\sigma_1 = " + s1 + "\\%$ and $\\sigma_2 = " + s2 + "\\%$. The shares $x_1, x_2$ of capital, with $x_1 + x_2 = 1$, minimize the portfolio variance (no return constraint). What are the optimal share $\\tilde x_1$ and the portfolio volatility $\\sigma_p$ (square root of the variance)?",
        "Modello di Markowitz con due titoli non correlati di volatilità (deviazione standard del rendimento) $\\sigma_1 = " + s1 + "\\%$ e $\\sigma_2 = " + s2 + "\\%$. Le quote $x_1, x_2$ del capitale, con $x_1 + x_2 = 1$, minimizzano la varianza del portafoglio (senza vincolo di rendimento). Quanto valgono la quota ottima $\\tilde x_1$ e la volatilità $\\sigma_p$ del portafoglio (radice della varianza)?");
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
        "Markowitz model, portfolio of two assets with shares of capital $x_1 = " + m(x1, 1, L) + "$, $x_2 = " + m(x2, 1, L) + "$; expected returns $\\mu_1 = " + mu1 + "\\%$, $\\mu_2 = " + mu2 + "\\%$; volatilities $\\sigma_1 = " + m(s1, 2, L) + "$, $\\sigma_2 = " + m(s2, 2, L) + "$; correlation $\\rho = " + m(rho, 2, L) + "$, so $q_{ii} = \\sigma_i^2$ and $q_{12} = q_{21} = \\rho\\sigma_1\\sigma_2$. What are its expected return and its variance $\\sum_{i}\\sum_{j} q_{ij} x_i x_j$?",
        "Modello di Markowitz, portafoglio di due titoli con quote del capitale $x_1 = " + m(x1, 1, L) + "$, $x_2 = " + m(x2, 1, L) + "$; rendimenti attesi $\\mu_1 = " + mu1 + "\\%$, $\\mu_2 = " + mu2 + "\\%$; volatilità $\\sigma_1 = " + m(s1, 2, L) + "$, $\\sigma_2 = " + m(s2, 2, L) + "$; correlazione $\\rho = " + m(rho, 2, L) + "$, quindi $q_{ii} = \\sigma_i^2$ e $q_{12} = q_{21} = \\rho\\sigma_1\\sigma_2$. Quanto valgono il rendimento atteso e la varianza $\\sum_{i}\\sum_{j} q_{ij} x_i x_j$?");
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
        "Markowitz model with two assets of volatilities (standard deviations of the return) $\\sigma_1 = " + m(s1, 2, L) + "$, $\\sigma_2 = " + m(s2, 2, L) + "$ and correlation $\\rho = " + m(rho, 2, L) + "$. The shares $x_1 + x_2 = 1$ minimize the portfolio variance $\\sum_i\\sum_j q_{ij}x_ix_j$, with covariance $q_{12} = \\rho\\sigma_1\\sigma_2$ (no return constraint; the optimum has $x_1, x_2 > 0$). What are $\\tilde x_1$ and the minimum variance $\\sigma_p^2$?",
        "Modello di Markowitz con due titoli di volatilità (deviazione standard del rendimento) $\\sigma_1 = " + m(s1, 2, L) + "$, $\\sigma_2 = " + m(s2, 2, L) + "$ e correlazione $\\rho = " + m(rho, 2, L) + "$. Le quote $x_1 + x_2 = 1$ minimizzano la varianza del portafoglio $\\sum_i\\sum_j q_{ij}x_ix_j$, con covarianza $q_{12} = \\rho\\sigma_1\\sigma_2$ (senza vincolo di rendimento; all\'ottimo $x_1, x_2 > 0$). Quanto valgono $\\tilde x_1$ e la varianza minima $\\sigma_p^2$?");
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
        "Pricing model: choose the price $p$ and the quantity sold $q$ to maximize the profit $(p - c)\\,q$ subject to $q \\le d(p) = " + I.a + " - " + I.b + "p$ (demand) and $q \\le k$ (capacity), with marginal cost $c = " + I.c + "$ € and $k = " + I.k + "$. What are the optimal price $p^*$ and the optimal profit?",
        "Modello di pricing: si scelgono il prezzo $p$ e la quantità venduta $q$ per massimizzare il profitto $(p - c)\\,q$ soggetto a $q \\le d(p) = " + I.a + " - " + I.b + "p$ (domanda) e $q \\le k$ (capacità), con costo marginale $c = " + I.c + "$ € e $k = " + I.k + "$. Quanto valgono il prezzo ottimo $p^*$ e il profitto ottimo?");
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
        "Pricing model: choose the price $p$ and the quantity sold $q$ to maximize $(p - c)\\,q$ subject to $q \\le d(p) = " + I.a + " - " + I.b + "p$ and $q \\le k$, with $c = " + I.c + "$ € and $k = " + I.k + "$; the capacity constraint is active at the optimum. Let $\\Pi(k)$ be the optimal profit as a function of the capacity. What is $d\\Pi/dk$, the value of one more unit of capacity?",
        "Modello di pricing: si scelgono il prezzo $p$ e la quantità venduta $q$ per massimizzare $(p - c)\\,q$ soggetto a $q \\le d(p) = " + I.a + " - " + I.b + "p$ e $q \\le k$, con $c = " + I.c + "$ € e $k = " + I.k + "$; all'ottimo il vincolo di capacità è attivo. Sia $\\Pi(k)$ il profitto ottimo in funzione della capacità. Quanto vale $d\\Pi/dk$, il valore di un'unità di capacità in più?");
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
        "Advertising budget: the spends $x_1, x_2 \\ge 0$ (thousands of €) on two channels maximize $r_1(x_1) + r_2(x_2)$ with $r_1(x) = " + a1 + "\\log(1 + " + m(k1, 2, L) + "x)$, $r_2(x) = " + a2 + "\\log(1 + " + m(k2, 2, L) + "x)$ (natural logarithm), subject to $x_1 + x_2 \\le b = " + B + "$, no caps. What are the optimal allocation and the multiplier $\\lambda$ of the budget constraint (extra response per extra thousand €)?",
        "Budget pubblicitario: le spese $x_1, x_2 \\ge 0$ (migliaia di €) su due canali massimizzano $r_1(x_1) + r_2(x_2)$ con $r_1(x) = " + a1 + "\\log(1 + " + m(k1, 2, L) + "x)$, $r_2(x) = " + a2 + "\\log(1 + " + m(k2, 2, L) + "x)$ (logaritmo naturale), soggetto a $x_1 + x_2 \\le b = " + B + "$, senza tetti. Quanto valgono l'allocazione ottima e il moltiplicatore $\\lambda$ del vincolo di budget (risposta in più per mille € in più)?");
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
        "Location on a straight road: customers at positions $a_i$ with weights $w_i$: " + pts.join(", ") + ". A facility at position $x$ (km) minimizes the weighted total distance $\\sum_i w_i |x - a_i|$ (Weber model on a line). Where is the optimal position $x^*$?",
        "Localizzazione su una strada rettilinea: clienti nelle posizioni $a_i$ con pesi $w_i$: " + pts.join(", ") + ". Una struttura nella posizione $x$ (km) minimizza la distanza totale pesata $\\sum_i w_i |x - a_i|$ (modello di Weber su una retta). Dov'è la posizione ottima $x^*$?");
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
        "EV charging LP, one vehicle, two one-hour slots: $x_t$ = energy charged in hour $t$ (kWh), $0 \\le x_t \\le \\bar p = " + pb + "$ (charger power, kW), requirement $x_1 + x_2 \\ge e = " + e + "$ kWh (efficiency $\\eta = 1$); minimize $\\pi_1x_1 + \\pi_2x_2$ with $\\pi_1 = " + m(p1, 2, L) + "$, $\\pi_2 = " + m(p2, 2, L) + "$ €/kWh. What are the minimum cost and the shadow price of the requirement (cost of one more kWh)?",
        "LP di ricarica EV, un veicolo, due fasce di un'ora: $x_t$ = energia caricata nell'ora $t$ (kWh), $0 \\le x_t \\le \\bar p = " + pb + "$ (potenza del caricatore, kW), requisito $x_1 + x_2 \\ge e = " + e + "$ kWh (rendimento $\\eta = 1$); si minimizza $\\pi_1x_1 + \\pi_2x_2$ con $\\pi_1 = " + m(p1, 2, L) + "$, $\\pi_2 = " + m(p2, 2, L) + "$ €/kWh. Quanto valgono il costo minimo e il prezzo ombra del requisito (costo di un kWh in più)?");
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
        "Capacity of an M/M/1 queue: arrival rate $\\lambda = " + lam + "$ customers/hour; the service rate $\\mu > \\lambda$ (capacity) minimizes $C(\\mu) = c\\,\\mu + h\\,\\lambda/(\\mu - \\lambda)$, where $c = " + c + "$ €/h per unit of $\\mu$, $h = " + m(h, 1, L) + "$ € per hour a customer spends in the system and $\\lambda/(\\mu - \\lambda)$ is the mean number of customers in the system. What are $\\mu^*$ and $C(\\mu^*)$?",
        "Capacità di una coda M/M/1: tasso di arrivo $\\lambda = " + lam + "$ clienti/ora; il tasso di servizio $\\mu > \\lambda$ (capacità) minimizza $C(\\mu) = c\\,\\mu + h\\,\\lambda/(\\mu - \\lambda)$, dove $c = " + c + "$ €/h per unità di $\\mu$, $h = " + m(h, 1, L) + "$ € per ora passata da un cliente nel sistema e $\\lambda/(\\mu - \\lambda)$ è il numero medio di clienti nel sistema. Quanto valgono $\\mu^*$ e $C(\\mu^*)$?");
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
        "M/M/1 queue (Poisson arrivals, exponential service, one server) with arrival rate $\\lambda = " + lam + "$ per hour and service rate $\\mu = " + mu + "$ per hour. What are the utilization $\\rho$, the mean time in the system $w$ and the mean number of customers in the system $l$?",
        "Coda M/M/1 (arrivi di Poisson, servizio esponenziale, un servente) con tasso di arrivo $\\lambda = " + lam + "$ all'ora e tasso di servizio $\\mu = " + mu + "$ all'ora. Quanto valgono l'utilizzo $\\rho$, il tempo medio nel sistema $w$ e il numero medio di clienti nel sistema $l$?");
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
        "DEA with five DMUs (decision-making units), one input $x$ and one output $y$. ", "DEA con cinque DMU (unità decisionali), un input $x$ e un output $y$. ") + tabellaDEA(I, L) + T(L,
        "The CCR efficiency of DMU $o$ is $h_o = \\max\\, u\\,y_o/(v\\,x_o)$ over the weights $u, v \\ge 0$ that give every DMU $j$ a ratio $u\\,y_j/(v\\,x_j) \\le 1$. What is the CCR efficiency $\\tilde h_{" + (o + 1) + "}$ of DMU " + (o + 1) + "?",
        "L'efficienza CCR della DMU $o$ è $h_o = \\max\\, u\\,y_o/(v\\,x_o)$ sui pesi $u, v \\ge 0$ che danno a ogni DMU $j$ un rapporto $u\\,y_j/(v\\,x_j) \\le 1$. Qual è l'efficienza CCR $\\tilde h_{" + (o + 1) + "}$ della DMU " + (o + 1) + "?");
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
        "DEA with five DMUs (decision-making units), one input $x$ and one output $y$. ", "DEA con cinque DMU (unità decisionali), un input $x$ e un output $y$. ") + tabellaDEA(I, L) + T(L,
        "The input-oriented BCC efficiency $\\tilde\\theta^{\\rm BCC}$ of DMU $o$ is the smallest $\\theta$ such that a convex combination of the DMUs ($\\lambda_j \\ge 0$, $\\sum_j\\lambda_j = 1$) produces at least $y_o$ with at most $\\theta x_o$; the scale efficiency is $\\mathrm{SE} = \\tilde\\theta^{\\rm CCR}/\\tilde\\theta^{\\rm BCC}$. DMU " + (o + 1) + " has $\\tilde\\theta^{\\rm CCR} = " + m(tC, 3, L) + "$. What are its $\\tilde\\theta^{\\rm BCC}$ and $\\mathrm{SE}$?",
        "L'efficienza BCC orientata all'input $\\tilde\\theta^{\\rm BCC}$ della DMU $o$ è il più piccolo $\\theta$ tale che una combinazione convessa delle DMU ($\\lambda_j \\ge 0$, $\\sum_j\\lambda_j = 1$) produca almeno $y_o$ con al più $\\theta x_o$; l'efficienza di scala è $\\mathrm{SE} = \\tilde\\theta^{\\rm CCR}/\\tilde\\theta^{\\rm BCC}$. La DMU " + (o + 1) + " ha $\\tilde\\theta^{\\rm CCR} = " + m(tC, 3, L) + "$. Quanto valgono il suo $\\tilde\\theta^{\\rm BCC}$ e $\\mathrm{SE}$?");
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
        "DEA with five DMUs (decision-making units), two inputs and one output, data $(x_{1j}, x_{2j}; y_{1j})$: " + parti.join(", ") + ". Input-oriented CCR envelopment model for DMU $o$: $\\min\\theta$ subject to $\\sum_j\\lambda_jx_{ij} \\le \\theta x_{io}$ ($i = 1, 2$), $\\sum_j\\lambda_jy_{1j} \\ge y_{1o}$, $\\lambda_j \\ge 0$. For $o = " + (o + 1) + "$, what are the efficiency $\\tilde\\theta$ and the radial input targets $(\\tilde\\theta x_{1o}; \\tilde\\theta x_{2o})$?",
        "DEA con cinque DMU (unità decisionali), due input e un output, dati $(x_{1j}, x_{2j}; y_{1j})$: " + parti.join(", ") + ". Forma di inviluppo CCR orientata all'input per la DMU $o$: $\\min\\theta$ soggetto a $\\sum_j\\lambda_jx_{ij} \\le \\theta x_{io}$ ($i = 1, 2$), $\\sum_j\\lambda_jy_{1j} \\ge y_{1o}$, $\\lambda_j \\ge 0$. Per $o = " + (o + 1) + "$, quanto valgono l'efficienza $\\tilde\\theta$ e i target radiali degli input $(\\tilde\\theta x_{1o}; \\tilde\\theta x_{2o})$?");
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
        "Newsvendor: a quantity $q$ is ordered before the demand is known; each unit costs $c = " + c + "$ €, sells at $p = " + p + "$ € and, if unsold, is salvaged at $v = " + v + "$ €. Demand is uniform on $[" + A + ", " + (A + W) + "]$ and $q$ maximizes the expected profit. What are the critical ratio $\\alpha^* = \\mathbb P(D \\le q^*)$ and the optimal quantity $q^*$?",
        "Newsvendor: si ordina una quantità $q$ prima di conoscere la domanda; ogni unità costa $c = " + c + "$ €, si vende a $p = " + p + "$ € e, se invenduta, si recupera a $v = " + v + "$ €. La domanda è uniforme su $[" + A + ", " + (A + W) + "]$ e $q$ massimizza il profitto atteso. Quanto valgono il rapporto critico $\\alpha^* = \\mathbb P(D \\le q^*)$ e la quantità ottima $q^*$?");
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
    return T(L, "Newsvendor: a quantity $q$ is ordered before the demand $D$ is known, to minimize the expected cost $\\mathbb E[c_o(q - D)^+ + c_u(D - q)^+]$, with underage cost $c_u = " + I.cu + "$ per unit of unmet demand and overage cost $c_o = " + I.co + "$ per unsold unit. Demand scenarios (probability in brackets): ",
           "Newsvendor: si ordina una quantità $q$ prima di conoscere la domanda $D$, per minimizzare il costo atteso $\\mathbb E[c_o(q - D)^+ + c_u(D - q)^+]$, con costo di underage $c_u = " + I.cu + "$ per unità di domanda non servita e di overage $c_o = " + I.co + "$ per unità invenduta. Scenari di domanda (probabilità tra parentesi): ") +
      parti.join(", ") + ". ";
  }

  gen({
    id: "orl-g-nv-discreto", livello: "media", capitolo: "newsvendor",
    link: link("newsvendor/#the-scenario-based-linear-formulation", "newsvendor/#la-formulazione-lineare-a-scenari"),
    prova: function (rng, L) {
      var I = istanzaNVd(rng); if (!I) return null;
      var s = nvQuantile(I, I.al), q = I.d[s];
      var sm = nvQuantile(I, 0.5), ss = nvQuantile(I, 1 - I.al), sn = s + 1 < I.k ? s + 1 : s - 1;
      function o(j) { return "$q^* = " + I.d[j] + "$, " + T(L, "expected cost ", "costo atteso ") + f(nvCosto(I, I.d[j]), 2, L); }
      var testo = testoNVd(I, L) + T(L, "What are the optimal quantity $q^*$ and its expected cost?", "Quanto valgono la quantità ottima $q^*$ e il suo costo atteso?");
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
        "Risk measures of a loss $L$ with $k = " + k + "$ equally likely scenarios: $" + l.join(", ") + "$. $\\mathrm{VaR}_\\alpha$ is the smallest loss $\\ell$ with $\\mathbb P(L \\le \\ell) \\ge \\alpha$; $\\mathrm{CVaR}_\\alpha$ is the mean loss in the worst tail of probability $1 - \\alpha$. With $\\alpha = " + m(a, 2, L) + "$, what are $\\mathrm{VaR}_\\alpha$ and $\\mathrm{CVaR}_\\alpha$?",
        "Misure di rischio di una perdita $L$ con $k = " + k + "$ scenari equiprobabili: $" + l.join(", ") + "$. $\\mathrm{VaR}_\\alpha$ è la più piccola perdita $\\ell$ con $\\mathbb P(L \\le \\ell) \\ge \\alpha$; $\\mathrm{CVaR}_\\alpha$ è la perdita media nella coda peggiore di probabilità $1 - \\alpha$. Con $\\alpha = " + m(a, 2, L) + "$, quanto valgono $\\mathrm{VaR}_\\alpha$ e $\\mathrm{CVaR}_\\alpha$?");
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
        "Risk measures of a loss $L$ with six equally likely scenarios: $" + l.join(", ") + "$. $\\mathrm{VaR}_\\alpha$ is the smallest loss $\\ell$ with $\\mathbb P(L \\le \\ell) \\ge \\alpha$, and $\\mathrm{CVaR}_\\alpha = \\mathrm{VaR}_\\alpha + \\mathbb E[(L - \\mathrm{VaR}_\\alpha)^+]/(1 - \\alpha)$. With $\\alpha = " + m(a, 2, L) + "$ (the tail of probability $1 - \\alpha$ is not a whole number of scenarios), what are $\\mathrm{VaR}_\\alpha$ and $\\mathrm{CVaR}_\\alpha$?",
        "Misure di rischio di una perdita $L$ con sei scenari equiprobabili: $" + l.join(", ") + "$. $\\mathrm{VaR}_\\alpha$ è la più piccola perdita $\\ell$ con $\\mathbb P(L \\le \\ell) \\ge \\alpha$, e $\\mathrm{CVaR}_\\alpha = \\mathrm{VaR}_\\alpha + \\mathbb E[(L - \\mathrm{VaR}_\\alpha)^+]/(1 - \\alpha)$. Con $\\alpha = " + m(a, 2, L) + "$ (la coda di probabilità $1 - \\alpha$ non è un numero intero di scenari), quanto valgono $\\mathrm{VaR}_\\alpha$ e $\\mathrm{CVaR}_\\alpha$?");
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
        "Risk measures of a loss $L$ with scenarios (probability in brackets): " + parti.join(", ") + ". $\\mathrm{VaR}_\\alpha$ is the smallest loss $\\ell$ with $\\mathbb P(L \\le \\ell) \\ge \\alpha$; $\\mathrm{CVaR}_\\alpha$ is the optimal value of the Rockafellar–Uryasev LP $\\min_\\eta\\, \\eta + \\mathbb E[(L - \\eta)^+]/(1 - \\alpha)$. With $\\alpha = " + m(a, 2, L) + "$, what are $\\mathrm{VaR}_\\alpha$ and $\\mathrm{CVaR}_\\alpha$?",
        "Misure di rischio di una perdita $L$ con scenari (probabilità tra parentesi): " + parti.join(", ") + ". $\\mathrm{VaR}_\\alpha$ è la più piccola perdita $\\ell$ con $\\mathbb P(L \\le \\ell) \\ge \\alpha$; $\\mathrm{CVaR}_\\alpha$ è il valore ottimo dell'LP di Rockafellar–Uryasev $\\min_\\eta\\, \\eta + \\mathbb E[(L - \\eta)^+]/(1 - \\alpha)$. Con $\\alpha = " + m(a, 2, L) + "$, quanto valgono $\\mathrm{VaR}_\\alpha$ e $\\mathrm{CVaR}_\\alpha$?");
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
      "One-period market with two states of the world: a risk-free security costs $1$ today and pays $R = " + m(I.R, 2, L) + "$ in both states; a risky security costs $s^0_1 = " + I.s0 + "$ today and pays $" + I.u + "$ in state 1 and $" + I.d + "$ in state 2. Risk-neutral probabilities are $q_1, q_2 \\ge 0$ with $q_1 + q_2 = 1$ under which every price equals the expected payoff divided by $R$. ",
      "Mercato a un periodo con due stati del mondo: un titolo privo di rischio costa oggi $1$ e paga $R = " + m(I.R, 2, L) + "$ in entrambi gli stati; un titolo rischioso costa oggi $s^0_1 = " + I.s0 + "$ e paga $" + I.u + "$ nello stato 1 e $" + I.d + "$ nello stato 2. Le probabilità neutrali al rischio sono $q_1, q_2 \\ge 0$ con $q_1 + q_2 = 1$ sotto le quali ogni prezzo è il pagamento atteso diviso per $R$. ");
  }

  gen({
    id: "orl-g-arb-neutrali", livello: "facile", capitolo: "arbitrage",
    link: link("arbitrage/#duality-is-pricing", "arbitraggio/#la-dualita-e-la-prezzatura"),
    prova: function (rng, L) {
      var I = istanzaArb(rng); if (!I) return null;
      function o(a) { return "$(q_1; q_2) = (" + m(a, 4, L) + "; " + m(1 - a, 4, L) + ")$"; }
      var testo = testoArb(I, L) + T(L, "What are $q_1$ and $q_2$?", "Quanto valgono $q_1$ e $q_2$?");
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
        "A call option with strike $" + K + "$ pays tomorrow $\\max(s^1_{1j} - " + K + ", 0)$ in state $j$, where $s^1_{1j}$ is the payoff of the risky security. In this complete market, what is the arbitrage-free price of the call today?",
        "Un'opzione call con strike $" + K + "$ paga domani $\\max(s^1_{1j} - " + K + ", 0)$ nello stato $j$, dove $s^1_{1j}$ è il pagamento del titolo rischioso. In questo mercato completo, qual è oggi il prezzo senza arbitraggio della call?");
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
        "Hard-margin SVM: $\\min \\tfrac12\\|\\mathbf w\\|^2$ subject to $y_i(\\mathbf w'\\mathbf x_i + b) \\ge 1$, with $\\mathbf w \\in \\mathbb R^2$ and $b$ free. Two observations: $\\mathbf x_1 = (0; 0)$ with label $y_1 = -1$ and $\\mathbf x_2 = (" + a + "; " + b + ")$ with label $y_2 = +1$. What are the optimal $\\tilde{\\mathbf w}$ and the margin $2/\\|\\tilde{\\mathbf w}\\|$?",
        "SVM hard margin: $\\min \\tfrac12\\|\\mathbf w\\|^2$ soggetto a $y_i(\\mathbf w'\\mathbf x_i + b) \\ge 1$, con $\\mathbf w \\in \\mathbb R^2$ e $b$ libero. Due osservazioni: $\\mathbf x_1 = (0; 0)$ con etichetta $y_1 = -1$ e $\\mathbf x_2 = (" + a + "; " + b + ")$ con etichetta $y_2 = +1$. Quanto valgono il $\\tilde{\\mathbf w}$ ottimo e il margine $2/\\|\\tilde{\\mathbf w}\\|$?");
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
        "Quantile regression with no features: an intercept $b$ is fitted to $y = (" + y.join("; ") + ")$ by minimizing $\\sum_i [\\tau u_i + (1 - \\tau) v_i]$, where $u_i = (y_i - b)^+$ and $v_i = (b - y_i)^+$ are the deviations above and below $b$. With $\\tau = " + m(tau, 2, L) + "$, what is the objective value for $b = " + b + "$?",
        "Regressione quantile senza caratteristiche: si stima un'intercetta $b$ per $y = (" + y.join("; ") + ")$ minimizzando $\\sum_i [\\tau u_i + (1 - \\tau) v_i]$, dove $u_i = (y_i - b)^+$ e $v_i = (b - y_i)^+$ sono gli scostamenti sopra e sotto $b$. Con $\\tau = " + m(tau, 2, L) + "$, quanto vale l'obiettivo per $b = " + b + "$?");
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
        "Quantile regression with no features: an intercept $b$ is fitted to the $n = " + n + "$ observations $y = (" + y.join("; ") + ")$ by minimizing $z(b) = \\sum_i [\\tau (y_i - b)^+ + (1 - \\tau)(b - y_i)^+]$, with $\\tau = " + m(tau, 2, L) + "$. What are the optimal intercept $\\tilde b$ and the optimal value $\\tilde z$?",
        "Regressione quantile senza caratteristiche: si stima un'intercetta $b$ per le $n = " + n + "$ osservazioni $y = (" + y.join("; ") + ")$ minimizzando $z(b) = \\sum_i [\\tau (y_i - b)^+ + (1 - \\tau)(b - y_i)^+]$, con $\\tau = " + m(tau, 2, L) + "$. Quanto valgono l'intercetta ottima $\\tilde b$ e il valore ottimo $\\tilde z$?");
      var sp = T(L,
        "Without features the LP returns the empirical $\\tau$-quantile: raising $b$ pays while the share of observations below it is at most $\\tau$. Since $\\tau n = " + m(tn, 2, L) + "$, $\\tilde b$ is the observation in position " + (j + 1) + " in increasing order, $" + b + "$, with $\\tilde z = " + m(perditaQ(y, b, tau), 2, L) + "$.",
        "Senza caratteristiche l'LP restituisce il quantile empirico di livello $\\tau$: alzare $b$ conviene finché la quota di osservazioni sotto di esso è al più $\\tau$. Poiché $\\tau n = " + m(tn, 2, L) + "$, $\\tilde b$ è l'osservazione in posizione " + (j + 1) + " in ordine crescente, $" + b + "$, con $\\tilde z = " + m(perditaQ(y, b, tau), 2, L) + "$.");
      var cand = [o(s[jm]), o(j + 1 < n ? s[j + 1] : s[j - 2]), o(j - 1 >= 0 ? s[j - 1] : s[j + 2]), o(mean)];
      return chiudi(rng, testo, o(b), cand, sp, { y: y, tau: tau });
    }
  });
  /* ===================== generatori aggiunti (6 novembre 2026): almeno 2 per capitolo con calcoli ===================== */

  /* Cap. 2 — intervallo di validità di b_1 */
  gen({
    id: "orl-g-lp-intervallo-b", livello: "media", capitolo: "background",
    link: link("theory-lp/#sensitivity-analysis-in-lps", "teoria-lp/#lanalisi-di-sensitivita-negli-lp"),
    prova: function (rng, L) {
      var I = istanzaLP(rng); if (!I) return null;
      var A = I.A, b = I.b;
      // x(b1) = A^{-1}(b1, b2): x1 = 0 per b1 = a12 b2 / a22, x2 = 0 per b1 = a11 b2 / a21
      var r1 = A[0][1] * b[1] / A[1][1], r2 = A[0][0] * b[1] / A[1][0];
      var lo = Math.min(r1, r2), hi = Math.max(r1, r2);
      // errori tipici: intervallo di b2, matrice trasposta, un solo lato
      var t1 = A[1][0] * b[1] / A[1][1], t2 = A[0][0] * b[1] / A[0][1];
      var u1 = A[1][1] * b[0] / A[0][1], u2 = A[1][0] * b[0] / A[0][0];
      var vals = [lo, hi, t1, t2, u1, u2];
      for (var i = 0; i < vals.length; i++) if (quasiMezzo(vals[i], 2)) return null;
      if (hi - lo < 1) return null;
      function o(a, c) { return "$b_1 \\in [" + m(a, 2, L) + "; " + m(c, 2, L) + "]$"; }
      var testo = testoLP(I, L) + T(L,
        "At the optimum both constraints are active and $\\tilde x = (" + I.x[0] + ", " + I.x[1] + ")$, with $\\tilde x_1, \\tilde x_2 > 0$. Keeping $b_2 = " + b[1] + "$ fixed, for which values of $b_1$ does this basis stay optimal (the validity range of the shadow price $\\tilde\\pi_1$)?",
        "All'ottimo entrambi i vincoli sono attivi e $\\tilde x = (" + I.x[0] + ", " + I.x[1] + ")$, con $\\tilde x_1, \\tilde x_2 > 0$. Tenendo fisso $b_2 = " + b[1] + "$, per quali valori di $b_1$ questa base resta ottima (l'intervallo di validità del prezzo ombra $\\tilde\\pi_1$)?");
      var det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
      det = det < 0 ? "(" + det + ")" : String(det);
      var sp = T(L,
        "With both constraints active, $x(b_1)$ solves $A x = (b_1, " + b[1] + ")$: $x_1 = (" + A[1][1] + "b_1 - " + A[0][1] * b[1] + ")/" + det + "$ and $x_2 = (" + A[0][0] * b[1] + " - " + A[1][0] + "b_1)/" + det + "$. The basis stays optimal (the duals do not change) as long as both are $\\ge 0$, that is for $b_1 \\in [" + m(lo, 2, L) + ", " + m(hi, 2, L) + "]$; Gurobi returns it as `SARHSLow`–`SARHSUp`.",
        "Con entrambi i vincoli attivi, $x(b_1)$ risolve $A x = (b_1, " + b[1] + ")$: $x_1 = (" + A[1][1] + "b_1 - " + A[0][1] * b[1] + ")/" + det + "$ e $x_2 = (" + A[0][0] * b[1] + " - " + A[1][0] + "b_1)/" + det + "$. La base resta ottima (i duali non cambiano) finché entrambe sono $\\ge 0$, cioè per $b_1 \\in [" + m(lo, 2, L) + ", " + m(hi, 2, L) + "]$; Gurobi lo restituisce come `SARHSLow`–`SARHSUp`.");
      return chiudi(rng, testo, o(lo, hi),
        [o(Math.min(t1, t2), Math.max(t1, t2)), o(Math.min(u1, u2), Math.max(u1, u2)), o(lo, b[0]), o(b[0], hi), o(0, hi)], sp,
        { c: I.c, A: A, b: b, x: I.x });
    }
  });

  /* Cap. 8 — budget con un tetto attivo */
  gen({
    id: "orl-g-budget-tetto", livello: "complessa", capitolo: "budget",
    link: link("budget/#results-and-verification-of-the-kkt-conditions", "budget/#risultati-e-verifica-delle-kkt"),
    prova: function (rng, L) {
      var k1 = pk(rng, [0.1, 0.2, 0.25, 0.5]), k2 = pk(rng, [0.1, 0.2, 0.25, 0.5]);
      var a1 = 10 * ri(rng, 2, 20), a2 = 10 * ri(rng, 2, 20), B = 10 * ri(rng, 3, 10);
      var xu = (a1 * k1 * (1 + k2 * B) - a2 * k2) / (k1 * k2 * (a1 + a2));
      if (xu < 6 || xu > B - 1) return null;
      var u1 = ri(rng, 2, Math.floor(xu) - 2);
      var x2 = B - u1;
      function d1(x) { return a1 * k1 / (1 + k1 * x); }
      function d2(x) { return a2 * k2 / (1 + k2 * x); }
      var lam = d2(x2), mu = d1(u1) - lam;
      if (mu < 0.05) return null;
      var vals = [lam, mu, d1(u1), d1(xu), d2(B - xu), lam - mu];
      for (var i = 0; i < vals.length; i++) if (quasiMezzo(vals[i], 2)) return null;
      if (quasiMezzo(xu, 2)) return null;
      function o(x, l, mm) {
        return "$\\tilde x_1 = " + m(x, 2, L) + "$, $\\tilde x_2 = " + m(B - x, 2, L) + "$, $\\lambda = " + m(l, 2, L) + "$, $\\mu_1 = " + m(mm, 2, L) + "$";
      }
      var testo = T(L,
        "Advertising budget: the spends $x_1, x_2 \\ge 0$ (thousands of €) maximize $r_1(x_1) + r_2(x_2)$, with $r_1(x) = " + a1 + "\\log(1 + " + m(k1, 2, L) + "x)$ and $r_2(x) = " + a2 + "\\log(1 + " + m(k2, 2, L) + "x)$ (natural logarithm), subject to $x_1 + x_2 \\le b = " + B + "$ (multiplier $\\lambda$) and the cap $x_1 \\le u_1 = " + u1 + "$ (multiplier $\\mu_1$). KKT: $r_i'(\\tilde x_i) = \\lambda + \\mu_i$, with $\\mu_2 = 0$. What are the optimal allocation, $\\lambda$ and $\\mu_1$?",
        "Budget pubblicitario: le spese $x_1, x_2 \\ge 0$ (migliaia di €) massimizzano $r_1(x_1) + r_2(x_2)$, con $r_1(x) = " + a1 + "\\log(1 + " + m(k1, 2, L) + "x)$ e $r_2(x) = " + a2 + "\\log(1 + " + m(k2, 2, L) + "x)$ (logaritmo naturale), soggetto a $x_1 + x_2 \\le b = " + B + "$ (moltiplicatore $\\lambda$) e al tetto $x_1 \\le u_1 = " + u1 + "$ (moltiplicatore $\\mu_1$). KKT: $r_i'(\\tilde x_i) = \\lambda + \\mu_i$, con $\\mu_2 = 0$. Quanto valgono l'allocazione ottima, $\\lambda$ e $\\mu_1$?");
      var sp = T(L,
        "Without the cap the marginal returns would be equal at $x_1 = " + m(xu, 2, L) + " > u_1$: the cap binds, $\\tilde x_1 = " + u1 + "$ and $\\tilde x_2 = " + x2 + "$. Channel 2 is interior, so $\\lambda = r_2'(" + x2 + ") = " + m(a2 * k2, 2, L) + "/(1 + " + m(k2, 2, L) + "\\cdot " + x2 + ") = " + m(lam, 2, L) + "$; channel 1 gives $\\mu_1 = r_1'(" + u1 + ") - \\lambda = " + m(d1(u1), 2, L) + " - " + m(lam, 2, L) + " = " + m(mu, 2, L) + "$, the value of one more thousand € of cap.",
        "Senza tetto i rendimenti marginali sarebbero uguali in $x_1 = " + m(xu, 2, L) + " > u_1$: il tetto è attivo, $\\tilde x_1 = " + u1 + "$ e $\\tilde x_2 = " + x2 + "$. Il canale 2 è interno, quindi $\\lambda = r_2'(" + x2 + ") = " + m(a2 * k2, 2, L) + "/(1 + " + m(k2, 2, L) + "\\cdot " + x2 + ") = " + m(lam, 2, L) + "$; il canale 1 dà $\\mu_1 = r_1'(" + u1 + ") - \\lambda = " + m(d1(u1), 2, L) + " - " + m(lam, 2, L) + " = " + m(mu, 2, L) + "$, il valore di mille € di tetto in più.");
      return chiudi(rng, testo, o(u1, lam, mu),
        [o(xu, d2(B - xu), 0), o(u1, d1(u1), 0), o(u1, lam, d1(u1)), o(u1, lam, -mu)], sp,
        { a1: a1, a2: a2, k1: k1, k2: k2, B: B, u1: u1 });
    }
  });

  /* Cap. 9 — minimax nel piano (cerchio minimo) */
  function cerchio3(P) {
    function d(p, q) { return Math.hypot(p[0] - q[0], p[1] - q[1]); }
    var best = null;
    for (var i = 0; i < 3; i++) for (var j = i + 1; j < 3; j++) {
      var k = 3 - i - j, M = [(P[i][0] + P[j][0]) / 2, (P[i][1] + P[j][1]) / 2], r = d(P[i], P[j]) / 2;
      if (d(M, P[k]) <= r + 1e-9 && (best === null || r < best.r)) best = { c: M, r: r, tipo: "lato", dk: d(M, P[k]) - r };
    }
    var ax = P[0][0], ay = P[0][1], bx = P[1][0], by = P[1][1], cx = P[2][0], cy = P[2][1];
    var D = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
    var ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / D;
    var uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / D;
    var circ = { c: [ux, uy], r: d([ux, uy], P[0]), tipo: "circo" };
    return { opt: best || circ, circ: circ };
  }
  gen({
    id: "orl-g-loc-minimax-2d", livello: "media", capitolo: "location",
    link: link("location/#model", "localizzazione/#modello"),
    prova: function (rng, L) {
      var P = [];
      while (P.length < 3) {
        var p = [ri(rng, 0, 10), ri(rng, 0, 10)], nuovo = true;
        for (var t = 0; t < P.length; t++) if (P[t][0] === p[0] && P[t][1] === p[1]) nuovo = false;
        if (nuovo) P.push(p);
      }
      var area = (P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[2][0] - P[0][0]) * (P[1][1] - P[0][1]);
      if (Math.abs(area) < 6) return null;
      var R = cerchio3(P), opt = R.opt;
      if (opt.tipo === "lato" && Math.abs(opt.dk) < 0.05) return null;       // quasi retto: due risposte vicine
      function d(q, s) { return Math.hypot(q[0] - s[0], q[1] - s[1]); }
      function maxd(c) { return Math.max(d(c, P[0]), d(c, P[1]), d(c, P[2])); }
      var G = [(P[0][0] + P[1][0] + P[2][0]) / 3, (P[0][1] + P[1][1] + P[2][1]) / 3];
      var xs = [P[0][0], P[1][0], P[2][0]], ys = [P[0][1], P[1][1], P[2][1]];
      var BB = [(Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2];
      // lato più lungo
      var li = 0, lj = 1, lmax = d(P[0], P[1]);
      if (d(P[0], P[2]) > lmax) { li = 0; lj = 2; lmax = d(P[0], P[2]); }
      if (d(P[1], P[2]) > lmax) { li = 1; lj = 2; lmax = d(P[1], P[2]); }
      var Ml = [(P[li][0] + P[lj][0]) / 2, (P[li][1] + P[lj][1]) / 2];
      var vals = [opt.c[0], opt.c[1], opt.r, G[0], G[1], maxd(G), BB[0], BB[1], maxd(BB), R.circ.c[0], R.circ.c[1], R.circ.r, lmax / 2];
      for (var i = 0; i < vals.length; i++) if (quasiMezzo(vals[i], 2)) return null;
      function o(c, z) { return "$(x^*; y^*) = (" + m(c[0], 2, L) + "; " + m(c[1], 2, L) + ")$, $z^* = " + m(z, 2, L) + "$"; }
      var pts = P.map(function (q) { return "$(" + q[0] + "; " + q[1] + ")$"; }).join(", ");
      var testo = T(L,
        "Minimax location in the plane: three districts at " + pts + " (km). The facility at $(x, y)$ minimizes $z$, the largest Euclidean distance from it to a district (no weights). What are the optimal point $(x^*; y^*)$ and the optimal value $z^*$?",
        "Localizzazione minimax nel piano: tre quartieri in " + pts + " (km). La struttura in $(x, y)$ minimizza $z$, la massima distanza euclidea da essa a un quartiere (senza pesi). Quanto valgono il punto ottimo $(x^*; y^*)$ e il valore ottimo $z^*$?");
      var sp = opt.tipo === "lato" ? T(L,
        "The optimum is the centre of the smallest circle containing the three points. The triangle is obtuse: the circle having the longest side as diameter already contains the third point, so the centre is the midpoint of that side and $z^*$ is half its length, $" + m(opt.r, 2, L) + "$. The circle through all three points would be larger.",
        "L'ottimo è il centro del più piccolo cerchio che contiene i tre punti. Il triangolo è ottusangolo: il cerchio che ha per diametro il lato più lungo contiene già il terzo punto, quindi il centro è il punto medio di quel lato e $z^*$ è metà della sua lunghezza, $" + m(opt.r, 2, L) + "$. Il cerchio per i tre punti sarebbe più grande.") : T(L,
        "The optimum is the centre of the smallest circle containing the three points. The triangle is acute: no circle built on one side contains the third point, so the optimum is the circumcentre, equidistant from the three districts, with $z^* = " + m(opt.r, 2, L) + "$. The centroid ignores the extreme districts.",
        "L'ottimo è il centro del più piccolo cerchio che contiene i tre punti. Il triangolo è acutangolo: nessun cerchio costruito su un lato contiene il terzo punto, quindi l'ottimo è il circocentro, equidistante dai tre quartieri, con $z^* = " + m(opt.r, 2, L) + "$. Il baricentro ignora i quartieri estremi.");
      var cand = [o(G, maxd(G)), opt.tipo === "lato" ? o(R.circ.c, R.circ.r) : o(Ml, lmax / 2), o(BB, maxd(BB))];
      return chiudi(rng, testo, o(opt.c, opt.r), cand, sp, { P: P });
    }
  });

  /* Cap. 10 — un veicolo, tre ore, rendimento eta < 1 */
  gen({
    id: "orl-g-ev-tre-ore", livello: "media", capitolo: "ev-charging",
    link: link("ev-charging/#model", "ricarica-ev/#modello"),
    prova: function (rng, L) {
      var lista = [0.08, 0.1, 0.12, 0.15, 0.18, 0.2, 0.25, 0.3], pr = [];
      while (pr.length < 3) { var v = pk(rng, lista); if (pr.indexOf(v) < 0) pr.push(v); }
      var eta = pk(rng, [0.8, 0.9]), pb = ri(rng, 4, 12);
      var E = ri(rng, pb + 1, 3 * pb - 1);
      if (E % pb === 0) return null;
      var e = eta * E;
      if (Math.abs(10 * e - Math.round(10 * e)) > 1e-9) return null;
      var ord = [0, 1, 2].sort(function (i, j) { return pr[i] - pr[j]; });
      function riempi(en) {
        var z = 0, rest = en, marg = null;
        for (var t = 0; t < 3; t++) { var x = Math.min(pb, rest); z += x * pr[ord[t]]; rest -= x; if (x > 0) marg = pr[ord[t]]; }
        return { z: z, marg: marg };
      }
      var A = riempi(E), Bf = riempi(e);
      var dual = A.marg / eta;
      if (quasiMezzo(dual, 3) || quasiMezzo(Bf.z, 2)) return null;
      function o(z, p) { return T(L, "cost ", "costo ") + f(z, 2, L) + " €, " + T(L, "shadow price ", "prezzo ombra ") + f(p, 3, L) + " €/kWh"; }
      var testo = T(L,
        "EV charging LP, one vehicle plugged in for three one-hour slots: $x_t$ = energy drawn from the grid in hour $t$ (kWh), $0 \\le x_t \\le \\bar p = " + pb + "$; requirement $\\eta\\,(x_1 + x_2 + x_3) \\ge e = " + m(e, 1, L) + "$ kWh, with efficiency $\\eta = " + m(eta, 1, L) + "$; minimize $\\sum_t \\pi_t x_t$ with $(\\pi_1, \\pi_2, \\pi_3) = (" + m(pr[0], 2, L) + ", " + m(pr[1], 2, L) + ", " + m(pr[2], 2, L) + ")$ €/kWh. What are the minimum cost and the shadow price of the requirement (cost of one more kWh in the battery)?",
        "LP di ricarica EV, un veicolo collegato per tre fasce di un'ora: $x_t$ = energia prelevata dalla rete nell'ora $t$ (kWh), $0 \\le x_t \\le \\bar p = " + pb + "$; requisito $\\eta\\,(x_1 + x_2 + x_3) \\ge e = " + m(e, 1, L) + "$ kWh, con rendimento $\\eta = " + m(eta, 1, L) + "$; si minimizza $\\sum_t \\pi_t x_t$ con $(\\pi_1, \\pi_2, \\pi_3) = (" + m(pr[0], 2, L) + ", " + m(pr[1], 2, L) + ", " + m(pr[2], 2, L) + ")$ €/kWh. Quanto valgono il costo minimo e il prezzo ombra del requisito (costo di un kWh in più nella batteria)?");
      var sp = T(L,
        "The grid must supply $e/\\eta = " + E + "$ kWh, bought in the cheapest hours at full power $\\bar p$: cost $" + m(A.z, 2, L) + "$ €. One more kWh in the battery needs $1/\\eta$ kWh in the marginal hour (price $" + m(A.marg, 2, L) + "$): shadow price $" + m(A.marg, 2, L) + "/" + m(eta, 1, L) + " = " + m(dual, 3, L) + "$ €/kWh. Forgetting $\\eta$ buys only $e$ kWh.",
        "La rete deve fornire $e/\\eta = " + E + "$ kWh, comprati nelle ore più economiche alla potenza massima $\\bar p$: costo $" + m(A.z, 2, L) + "$ €. Un kWh in più nella batteria richiede $1/\\eta$ kWh nell'ora marginale (prezzo $" + m(A.marg, 2, L) + "$): prezzo ombra $" + m(A.marg, 2, L) + "/" + m(eta, 1, L) + " = " + m(dual, 3, L) + "$ €/kWh. Dimenticare $\\eta$ fa comprare solo $e$ kWh.");
      return chiudi(rng, testo, o(A.z, dual),
        [o(A.z, A.marg), o(Bf.z, Bf.marg), o(A.z, pr[ord[0]] / eta), o(A.z, A.marg * eta)], sp,
        { pr: pr, eta: eta, pbar: pb, e: e });
    }
  });

  /* Cap. 11 — il prezzo di una promessa di servizio */
  gen({
    id: "orl-g-code-promessa", livello: "media", capitolo: "queues",
    link: link("queues/#the-price-of-a-service-promise", "code/#il-prezzo-di-una-promessa-di-servizio"),
    prova: function (rng, L) {
      var s = ri(rng, 2, 8), lam = ri(rng, 4, 40), c = ri(rng, 1, 5);
      var h = s * s * c / lam;
      if (Math.abs(2 * h - Math.round(2 * h)) > 1e-9 || h < 0.5 || h > 20) return null;
      var w = pk(rng, [2, 3, 4, 5, 6, 10, 12, 15, 20, 30]), g = 60 / w;
      if (g <= s + 0.5) return null;
      function C(mu) { return c * mu + h * lam / (mu - lam); }
      var mu = lam + g;
      function o(x, z) { return "$\\mu = " + m(x, 2, L) + "$, $C = " + m(z, 2, L) + "$ €/h"; }
      var cand = [o(lam + s, C(lam + s)), o(lam + w, C(lam + w)), o(mu, c * mu + h * w / 60)];
      if (g > lam + 0.5) cand.push(o(g, C(g)));
      cand.push(o(lam + 1 / w, C(lam + 1 / w)));
      var testo = T(L,
        "Capacity of an M/M/1 queue: arrival rate $\\lambda = " + lam + "$ customers/hour; the service rate $\\mu > \\lambda$ minimizes $C(\\mu) = c\\,\\mu + h\\,\\lambda/(\\mu - \\lambda)$ €/h, with $c = " + c + "$ and $h = " + m(h, 1, L) + "$; the mean time in the system is $w = 1/(\\mu - \\lambda)$ hours. Marketing promises $w \\le w_{\\max} = " + w + "$ minutes. What are the optimal capacity under the promise and its cost $C$?",
        "Capacità di una coda M/M/1: tasso di arrivo $\\lambda = " + lam + "$ clienti/ora; il tasso di servizio $\\mu > \\lambda$ minimizza $C(\\mu) = c\\,\\mu + h\\,\\lambda/(\\mu - \\lambda)$ €/h, con $c = " + c + "$ e $h = " + m(h, 1, L) + "$; il tempo medio nel sistema è $w = 1/(\\mu - \\lambda)$ ore. Il marketing promette $w \\le w_{\\max} = " + w + "$ minuti. Quanto valgono la capacità ottima con la promessa e il suo costo $C$?");
      var sp = T(L,
        "Without the promise $\\tilde\\mu = \\lambda + \\sqrt{h\\lambda/c} = " + (lam + s) + "$. The promise requires $\\mu \\ge \\lambda + 1/w_{\\max} = " + lam + " + 60/" + w + " = " + m(mu, 2, L) + "$ (with $w_{\\max}$ in hours), tighter than $\\tilde\\mu$: since $C$ is convex, the optimum is on the constraint, with $C = " + c + "\\cdot " + m(mu, 2, L) + " + " + m(h, 1, L) + "\\cdot " + lam + "\\cdot " + w + "/60 = " + m(C(mu), 2, L) + "$ €/h.",
        "Senza promessa $\\tilde\\mu = \\lambda + \\sqrt{h\\lambda/c} = " + (lam + s) + "$. La promessa richiede $\\mu \\ge \\lambda + 1/w_{\\max} = " + lam + " + 60/" + w + " = " + m(mu, 2, L) + "$ (con $w_{\\max}$ in ore), più stretto di $\\tilde\\mu$: essendo $C$ convessa, l'ottimo sta sul vincolo, con $C = " + c + "\\cdot " + m(mu, 2, L) + " + " + m(h, 1, L) + "\\cdot " + lam + "\\cdot " + w + "/60 = " + m(C(mu), 2, L) + "$ €/h.");
      return chiudi(rng, testo, o(mu, C(mu)), cand, sp, { lam: lam, c: c, h: h, wmin: w });
    }
  });

  /* Cap. 16 — soft margin: slack e obiettivo di un classificatore dato */
  gen({
    id: "orl-g-svm-soft", livello: "media", capitolo: "svm",
    link: link("svm/#soft-margin-and-the-role-of-c", "svm/#soft-margin-e-il-ruolo-di-c"),
    prova: function (rng, L) {
      var w = [ri(rng, -2, 2), ri(rng, -2, 2)], b = ri(rng, -2, 2), C = pk(rng, [0.5, 1, 2]);
      if (w[0] === 0 && w[1] === 0) return null;
      var X = [], y = [], neg = 0, posi = 0;
      for (var i = 0; i < 4; i++) {
        var xn = [ri(rng, -2, 2), ri(rng, -2, 2)];
        for (var t = 0; t < X.length; t++) if (X[t][0] === xn[0] && X[t][1] === xn[1]) return null;
        X.push(xn); y.push(rng() < 0.5 ? -1 : 1);
        if (y[i] < 0) neg++; else posi++;
      }
      if (neg === 0 || posi === 0) return null;
      var sx = 0, raw = 0, h0 = 0, oltre = 0, mis = 0;
      for (i = 0; i < 4; i++) {
        var fm = y[i] * (w[0] * X[i][0] + w[1] * X[i][1] + b);
        sx += pos(1 - fm); raw += 1 - fm; h0 += pos(-fm); if (fm > 1) oltre++; if (fm < 0) mis += 1 - fm;
      }
      if (sx === 0 || oltre === 0 || h0 === sx) return null;
      var nw = (w[0] * w[0] + w[1] * w[1]) / 2;
      function o(s, z) { return "$\\sum_i \\xi_i = " + m(s, 2, L) + "$, " + T(L, "objective ", "obiettivo ") + "$" + m(z, 2, L) + "$"; }
      var pts = [];
      for (i = 0; i < 4; i++) pts.push("$\\mathbf x_" + (i + 1) + " = (" + X[i][0] + "; " + X[i][1] + ")$, $y_" + (i + 1) + " = " + (y[i] > 0 ? "+1" : "-1") + "$");
      var testo = T(L,
        "Soft-margin SVM: objective $\\tfrac12\\|\\mathbf w\\|^2 + C\\sum_i \\xi_i$, where for given $\\mathbf w, b$ the optimal slacks are $\\xi_i = \\max\\{0,\\ 1 - y_i(\\mathbf w'\\mathbf x_i + b)\\}$. Candidate classifier $\\mathbf w = (" + w[0] + "; " + w[1] + ")$, $b = " + b + "$, with $C = " + m(C, 1, L) + "$; observations " + pts.join("; ") + ". What are $\\sum_i \\xi_i$ and the objective value?",
        "SVM soft margin: obiettivo $\\tfrac12\\|\\mathbf w\\|^2 + C\\sum_i \\xi_i$, dove per $\\mathbf w, b$ dati gli slack ottimi sono $\\xi_i = \\max\\{0,\\ 1 - y_i(\\mathbf w'\\mathbf x_i + b)\\}$. Classificatore candidato $\\mathbf w = (" + w[0] + "; " + w[1] + ")$, $b = " + b + "$, con $C = " + m(C, 1, L) + "$; osservazioni " + pts.join("; ") + ". Quanto valgono $\\sum_i \\xi_i$ e il valore dell'obiettivo?");
      var sp = T(L,
        "Compute $y_i(\\mathbf w'\\mathbf x_i + b)$ for each observation: the points with value $\\ge 1$ are beyond the margin and pay nothing, the others pay $1 - y_i(\\mathbf w'\\mathbf x_i + b)$. The slacks sum to $" + m(sx, 2, L) + "$ and the objective is $\\tfrac12\\cdot " + (2 * nw) + " + " + m(C, 1, L) + "\\cdot " + m(sx, 2, L) + " = " + m(nw + C * sx, 2, L) + "$. Dropping the $\\max$ lets well-classified points subtract.",
        "Si calcola $y_i(\\mathbf w'\\mathbf x_i + b)$ per ogni osservazione: i punti con valore $\\ge 1$ sono oltre il margine e non pagano, gli altri pagano $1 - y_i(\\mathbf w'\\mathbf x_i + b)$. Gli slack sommano $" + m(sx, 2, L) + "$ e l'obiettivo è $\\tfrac12\\cdot " + (2 * nw) + " + " + m(C, 1, L) + "\\cdot " + m(sx, 2, L) + " = " + m(nw + C * sx, 2, L) + "$. Togliere il $\\max$ fa sottrarre i punti ben classificati.");
      return chiudi(rng, testo, o(sx, nw + C * sx),
        [raw >= 0 ? o(raw, nw + C * raw) : "", o(sx, 2 * nw + C * sx), o(h0, nw + C * h0), o(mis, nw + C * mis), o(sx, nw + sx)]
          .filter(function (u) { return u; }), sp,
        { w: w, b: b, C: C, X: X, y: y });
    }
  });

  /* Cap. 15 — mercato incompleto: intervallo dei prezzi coerenti */
  gen({
    id: "orl-g-arb-intervallo", livello: "complessa", capitolo: "arbitrage",
    link: link("arbitrage/#sensitivity-the-interval-of-consistent-prices", "arbitraggio/#sensitivita-lintervallo-dei-prezzi-coerenti"),
    prova: function (rng, L) {
      var R = pk(rng, [1, 1.05, 1.1]), a = [], cc = [];
      while (a.length < 3) { var v = ri(rng, 5, 40); if (a.indexOf(v) < 0) a.push(v); }
      for (var j = 0; j < 3; j++) cc.push(ri(rng, 0, 20));
      var amin = Math.min.apply(null, a), amax = Math.max.apply(null, a);
      var s0 = ri(rng, Math.ceil(amin / R) + 1, Math.floor(amax / R) - 1);
      if (!(s0 * R > amin && s0 * R < amax)) return null;
      function intervallo(t, disc) {
        // q >= 0, sum q = 1, sum q_j a_j = t; prezzo = sum q_j c_j / disc; vertici su coppie di stati
        var lo = Infinity, hi = -Infinity;
        for (var i = 0; i < 3; i++) {
          if (Math.abs(a[i] - t) < 1e-9) return null;
          for (var k = 0; k < 3; k++) {
            if (a[i] < t && t < a[k]) {
              var qk = (t - a[i]) / (a[k] - a[i]), pr = ((1 - qk) * cc[i] + qk * cc[k]) / disc;
              lo = Math.min(lo, pr); hi = Math.max(hi, pr);
            }
          }
        }
        return lo === Infinity ? null : [lo, hi];
      }
      var I = intervallo(s0 * R, R); if (!I) return null;
      if (I[1] - I[0] < 0.2) return null;
      var Ib = intervallo(s0, R);
      var cmin = Math.min.apply(null, cc), cmax = Math.max.apply(null, cc);
      var vals = [I[0], I[1], I[0] * R, I[1] * R, cmin / R, cmax / R, I[0] / R, I[1] / R];
      if (Ib) vals.push(Ib[0], Ib[1]);
      for (var t = 0; t < vals.length; t++) if (quasiMezzo(vals[t], 2)) return null;
      function o(x, y) { return "$[" + m(x, 2, L) + "; " + m(y, 2, L) + "]$"; }
      var cand = [o(I[0] * R, I[1] * R), o(cmin / R, cmax / R)];
      if (Ib && Ib[1] - Ib[0] > 0.01) cand.push(o(Ib[0], Ib[1]));
      cand.push(o(I[0] / R, I[1] / R));
      var testo = T(L,
        "One-period market with three states: a risk-free security costs $1$ and pays $R = " + m(R, 2, L) + "$ in every state; a risky security costs $s^0_1 = " + s0 + "$ and pays $(a_1; a_2; a_3) = (" + a.join("; ") + ")$ in the three states. A new security pays $(c_1; c_2; c_3) = (" + cc.join("; ") + ")$. Its price is consistent (creates no arbitrage) if it equals $\\frac1R\\sum_j q_j\\, c_j$ for risk-neutral probabilities $q_j \\ge 0$, $\\sum_j q_j = 1$, that also price the two existing securities. What is the interval of consistent prices (its endpoints)?",
        "Mercato a un periodo con tre stati: un titolo privo di rischio costa $1$ e paga $R = " + m(R, 2, L) + "$ in ogni stato; un titolo rischioso costa $s^0_1 = " + s0 + "$ e paga $(a_1; a_2; a_3) = (" + a.join("; ") + ")$ nei tre stati. Un nuovo titolo paga $(c_1; c_2; c_3) = (" + cc.join("; ") + ")$. Il suo prezzo è coerente (non crea arbitraggi) se vale $\\frac1R\\sum_j q_j\\, c_j$ per probabilità neutrali al rischio $q_j \\ge 0$, $\\sum_j q_j = 1$, che prezzano anche i due titoli esistenti. Qual è l'intervallo dei prezzi coerenti (i suoi estremi)?");
      var sp = T(L,
        "The consistent measures satisfy $\\sum_j q_j = 1$ and $\\sum_j q_j a_j = R\\,s^0_1 = " + m(s0 * R, 2, L) + "$: a segment whose endpoints put mass on two states only, one with payoff below and one above $" + m(s0 * R, 2, L) + "$. Minimizing and maximizing $\\frac1R\\sum_j q_jc_j$ (two LPs) over it gives $[" + m(I[0], 2, L) + ", " + m(I[1], 2, L) + "]$. Forgetting the factor $R$ (in the constraint or in the discount) shifts the interval.",
        "Le misure coerenti soddisfano $\\sum_j q_j = 1$ e $\\sum_j q_j a_j = R\\,s^0_1 = " + m(s0 * R, 2, L) + "$: un segmento i cui estremi mettono massa su due soli stati, uno con pagamento sotto e uno sopra $" + m(s0 * R, 2, L) + "$. Minimizzando e massimizzando $\\frac1R\\sum_j q_jc_j$ (due LP) su di esso si ottiene $[" + m(I[0], 2, L) + ", " + m(I[1], 2, L) + "]$. Dimenticare il fattore $R$ (nel vincolo o nello sconto) sposta l'intervallo.");
      return chiudi(rng, testo, o(I[0], I[1]), cand, sp, { R: R, s0: s0, a: a, c: cc });
    }
  });
  /* ===================== generatori aggiunti (7 novembre 2026): copertura dettagliata, parte «Strumenti» ===================== */

  gen({
    id: "orl-g-lp-dualita-debole", livello: "facile", capitolo: "background",
    link: link("theory-lp/#linear-programming-and-duality", "teoria-lp/#programmazione-lineare-e-dualita"),
    prova: function (rng, L) {
      var I = istanzaLP(rng); if (!I) return null;
      var k1 = ri(rng, 1, 4), k2 = ri(rng, 1, 4), e1 = ri(rng, 1, 3), e2 = ri(rng, 0, 3);
      function u1(a) { return a === 1 ? "" : String(a); }
      var xb = [I.x[0] - k1, I.x[1] - k2], pb = [I.pi[0] + e1, I.pi[1] + e2];
      var lo = I.c[0] * xb[0] + I.c[1] * xb[1], up = I.b[0] * pb[0] + I.b[1] * pb[1], g = up - lo;
      function o(a, c) { return "$\\tilde z \\in [" + a + "; " + c + "]$"; }
      var testo = testoLP(I, L) + T(L,
        "The point $\\bar x = (" + xb[0] + ", " + xb[1] + ")$ is feasible for the primal and $\\bar\\pi = (" + pb[0] + ", " + pb[1] + ")$ is feasible for the dual $\\min\\ " + I.b[0] + "\\pi_1 + " + I.b[1] + "\\pi_2$ (dual constraints $" + u1(I.A[0][0]) + "\\pi_1 + " + u1(I.A[1][0]) + "\\pi_2 \\ge " + I.c[0] + "$, $" + u1(I.A[0][1]) + "\\pi_1 + " + u1(I.A[1][1]) + "\\pi_2 \\ge " + I.c[1] + "$). By weak duality, which interval certainly contains the optimal value $\\tilde z$ of the primal?",
        "Il punto $\\bar x = (" + xb[0] + ", " + xb[1] + ")$ è ammissibile per il primale e $\\bar\\pi = (" + pb[0] + ", " + pb[1] + ")$ è ammissibile per il duale $\\min\\ " + I.b[0] + "\\pi_1 + " + I.b[1] + "\\pi_2$ (vincoli duali $" + u1(I.A[0][0]) + "\\pi_1 + " + u1(I.A[1][0]) + "\\pi_2 \\ge " + I.c[0] + "$, $" + u1(I.A[0][1]) + "\\pi_1 + " + u1(I.A[1][1]) + "\\pi_2 \\ge " + I.c[1] + "$). Per la dualità debole, quale intervallo contiene certamente il valore ottimo $\\tilde z$ del primale?");
      var sp = T(L,
        "Every feasible primal point gives a lower bound for a maximum, $" + I.c[0] + "\\cdot " + xb[0] + " + " + I.c[1] + "\\cdot " + xb[1] + " = " + lo + "$, and every feasible dual point an upper bound, $" + I.b[0] + "\\cdot " + pb[0] + " + " + I.b[1] + "\\cdot " + pb[1] + " = " + up + "$. So $" + lo + " \\le \\tilde z \\le " + up + "$ (here $\\tilde z = " + (I.c[0] * I.x[0] + I.c[1] * I.x[1]) + "$). Swapping the roles of the two bounds is the typical mistake.",
        "Ogni punto primale ammissibile dà un limite inferiore per un massimo, $" + I.c[0] + "\\cdot " + xb[0] + " + " + I.c[1] + "\\cdot " + xb[1] + " = " + lo + "$, e ogni punto duale ammissibile un limite superiore, $" + I.b[0] + "\\cdot " + pb[0] + " + " + I.b[1] + "\\cdot " + pb[1] + " = " + up + "$. Quindi $" + lo + " \\le \\tilde z \\le " + up + "$ (qui $\\tilde z = " + (I.c[0] * I.x[0] + I.c[1] * I.x[1]) + "$). Scambiare i ruoli dei due limiti è l'errore tipico.");
      return chiudi(rng, testo, o(lo, up), [o(up, up + g), o(lo - g, lo), o(lo, lo + Math.round(g / 2))], sp,
        { c: I.c, A: I.A, b: I.b, xb: xb, pb: pb });
    }
  });

  gen({
    id: "orl-g-lp-perturbazione", livello: "facile", capitolo: "background",
    link: link("theory-lp/#sensitivity-analysis-in-lps", "teoria-lp/#lanalisi-di-sensitivita-negli-lp"),
    prova: function (rng, L) {
      var I = istanzaLP(rng); if (!I) return null;
      var A = I.A, b = I.b, p = I.pi;
      var r1 = A[0][1] * b[1] / A[1][1], r2 = A[0][0] * b[1] / A[1][0];
      var lo = Math.min(r1, r2), hi = Math.max(r1, r2);
      if (quasiMezzo(lo, 2) || quasiMezzo(hi, 2)) return null;
      var d = ri(rng, -12, 12); if (d === 0) return null;
      var nb = b[0] + d; if (nb <= lo + 0.5 || nb >= hi - 0.5) return null;
      var z = I.c[0] * I.x[0] + I.c[1] * I.x[1], nz = z + p[0] * d;
      function o(v) { return "$\\tilde z = " + m(v, 2, L) + "$"; }
      var testo = testoLP(I, L) + T(L,
        "At the optimum $\\tilde z = " + z + "$, the shadow price of constraint 1 is $\\tilde\\pi_1 = " + p[0] + "$ (and $\\tilde\\pi_2 = " + p[1] + "$), and the validity range of $b_1$ (where $\\tilde\\pi_1$ stays exact) is $[" + m(lo, 2, L) + "; " + m(hi, 2, L) + "]$. What is the new optimal value if $b_1$ changes from $" + b[0] + "$ to $" + nb + "$, all else equal?",
        "All'ottimo $\\tilde z = " + z + "$, il prezzo ombra del vincolo 1 è $\\tilde\\pi_1 = " + p[0] + "$ (e $\\tilde\\pi_2 = " + p[1] + "$), e l'intervallo di validità di $b_1$ (dove $\\tilde\\pi_1$ resta esatto) è $[" + m(lo, 2, L) + "; " + m(hi, 2, L) + "]$. Quanto vale il nuovo valore ottimo se $b_1$ passa da $" + b[0] + "$ a $" + nb + "$, a parità del resto?");
      var sp = T(L,
        "The new value $" + nb + "$ is inside the validity range, so the shadow price is exact: $\\tilde z + \\tilde\\pi_1\\,\\Delta b_1 = " + z + " + " + p[0] + "\\cdot(" + d + ") = " + nz + "$.",
        "Il nuovo valore $" + nb + "$ è dentro l'intervallo di validità, quindi il prezzo ombra è esatto: $\\tilde z + \\tilde\\pi_1\\,\\Delta b_1 = " + z + " + " + p[0] + "\\cdot(" + d + ") = " + nz + "$.");
      return chiudi(rng, testo, o(nz), [o(z - p[0] * d), o(z + p[0] * (d > 0 ? 1 : -1)), o(z + p[1] * d), o(z * nb / b[0])], sp,
        { c: I.c, A: A, b: b, nb: nb });
    }
  });

  gen({
    id: "orl-g-qp-kkt", livello: "facile", capitolo: "background",
    link: link("theory-nonlinear/#the-nonlinear-optimality-conditions-the-kkt-conditions",
               "teoria-non-lineare/#le-condizioni-di-ottimalita-non-lineari-le-kkt"),
    prova: function (rng, L) {
      var a = ri(rng, 1, 6), bq = ri(rng, 1, 6), d = ri(rng, 3, 24);
      if (a === bq) return null;
      var x1 = bq * d / (a + bq), x2 = a * d / (a + bq), lam = 2 * a * x1;
      var vals = [x1, x2, lam, lam / 2];
      for (var i = 0; i < vals.length; i++) if (quasiMezzo(vals[i], 2)) return null;
      function o(u, v) { return "$\\tilde x_1 = " + m(u, 2, L) + "$, $\\lambda = " + m(v, 2, L) + "$"; }
      function k(c) { return c === 1 ? "" : String(c); }
      var testo = T(L,
        "Convex QP: $\\min\\ " + k(a) + "x_1^2 + " + k(bq) + "x_2^2$ subject to $x_1 + x_2 \\ge " + d + "$, $x_1, x_2 \\ge 0$. At the optimum the constraint is active, the bounds are not, and stationarity of the Lagrangian $L = f + \\lambda(" + d + " - x_1 - x_2)$ holds. What are $\\tilde x_1$ and the multiplier $\\lambda$?",
        "QP convesso: $\\min\\ " + k(a) + "x_1^2 + " + k(bq) + "x_2^2$ soggetto a $x_1 + x_2 \\ge " + d + "$, $x_1, x_2 \\ge 0$. All'ottimo il vincolo è attivo, i limiti no, e vale la stazionarietà della Lagrangiana $L = f + \\lambda(" + d + " - x_1 - x_2)$. Quanto valgono $\\tilde x_1$ e il moltiplicatore $\\lambda$?");
      var sp = T(L,
        "Stationarity: $" + 2 * a + "x_1 = \\lambda$ and $" + 2 * bq + "x_2 = \\lambda$, so $x_1 = \\lambda/" + 2 * a + "$, $x_2 = \\lambda/" + 2 * bq + "$; the active constraint gives $\\lambda = " + m(lam, 2, L) + "$, hence $\\tilde x_1 = " + m(x1, 2, L) + "$, $\\tilde x_2 = " + m(x2, 2, L) + "$. The variable with the smaller quadratic coefficient takes the larger share; $\\lambda$ is the marginal cost of one more unit of $d$.",
        "Stazionarietà: $" + 2 * a + "x_1 = \\lambda$ e $" + 2 * bq + "x_2 = \\lambda$, quindi $x_1 = \\lambda/" + 2 * a + "$, $x_2 = \\lambda/" + 2 * bq + "$; il vincolo attivo dà $\\lambda = " + m(lam, 2, L) + "$, da cui $\\tilde x_1 = " + m(x1, 2, L) + "$, $\\tilde x_2 = " + m(x2, 2, L) + "$. La variabile col coefficiente quadratico minore prende la quota maggiore; $\\lambda$ è il costo marginale di un'unità in più di $d$.");
      return chiudi(rng, testo, o(x1, lam), [o(x2, lam), o(x1, lam / 2), o(d / 2, a * d), o(x1, 2 * lam)], sp,
        { a: a, b: bq, d: d });
    }
  });

  gen({
    id: "orl-g-sv-dimensioni", livello: "facile", capitolo: "solver",
    link: link("solver-lp/#the-log-explained", "solver-lp/#il-log-spiegato"),
    prova: function (rng, L) {
      var n = ri(rng, 2, 6), mm = ri(rng, 3, 12);
      var R = n * mm + mm, Cn = 2 * n * mm;
      function o(r, c) { return T(L, "$" + r + "$ rows, $" + c + "$ columns", "$" + r + "$ righe, $" + c + "$ colonne"); }
      var testo = T(L,
        "A gurobipy production-inventory LP has $n = " + n + "$ products and $m = " + mm + "$ months: variables $x_{it} \\ge 0$ (units produced) and $s_{it} \\ge 0$ (inventory at the end of the month) for every product $i$ and month $t$; one balance constraint $s_{i,t-1} + x_{it} = d_{it} + s_{it}$ per product and month (initial inventory $s_{i0}$ is a datum); one machine-hours constraint $\\sum_i a_ix_{it} \\le b_t$ per month. What does the line `Optimize a model with ... rows, ... columns` of the Gurobi log report?",
        "Un LP gurobipy di produzione e scorte ha $n = " + n + "$ prodotti e $m = " + mm + "$ mesi: variabili $x_{it} \\ge 0$ (unità prodotte) e $s_{it} \\ge 0$ (scorta a fine mese) per ogni prodotto $i$ e mese $t$; un vincolo di bilancio $s_{i,t-1} + x_{it} = d_{it} + s_{it}$ per prodotto e mese (la scorta iniziale $s_{i0}$ è un dato); un vincolo di ore macchina $\\sum_i a_ix_{it} \\le b_t$ per mese. Che cosa riporta la riga `Optimize a model with ... rows, ... columns` del log di Gurobi?");
      var sp = T(L,
        "Rows are constraints: $nm = " + n * mm + "$ balances plus $m = " + mm + "$ capacities, $" + R + "$ in all; columns are variables: $2nm = " + Cn + "$. Checking these sizes is the first reading of the log.",
        "Le righe sono i vincoli: $nm = " + n * mm + "$ bilanci più $m = " + mm + "$ capacità, $" + R + "$ in tutto; le colonne sono le variabili: $2nm = " + Cn + "$. Controllare queste dimensioni è la prima lettura del log.");
      return chiudi(rng, testo, o(R, Cn), [o(Cn, R), o(n * mm, Cn), o(R, n * mm), o(n * mm + n, Cn)], sp,
        { n: n, m: mm });
    }
  });

  gen({
    id: "orl-g-lp-tutti-casi", livello: "complessa", capitolo: "background",
    link: link("theory-lp/#the-optimality-conditions-of-lp-complementary-slackness",
               "teoria-lp/#le-condizioni-di-ottimalita-delllp-gli-scarti-complementari"),
    prova: function (rng, L) {
      var x1 = ri(rng, 10, 60), x2 = ri(rng, 5, 40), sl = ri(rng, 5, 30);
      var a31 = ri(rng, 1, 3), a32 = -ri(rng, 1, 3);
      var p2 = ri(rng, 1, 9), p3 = -ri(rng, 1, 5), del = ri(rng, 1, 5);
      var c1 = p2 + a31 * p3, c2 = p2 + a32 * p3, c3 = -p2 - del;
      var b1 = x1 + x2 - sl, b2 = x1 + x2, b3 = a31 * x1 + a32 * x2;
      var w2 = p2 + del, w3 = (c1 - w2) / a31;
      function u1(a) { return a === 1 ? "" : String(a); }
      // errore: sistema scritto con le righe dei vincoli (1, 1) e (a31, a32) invece che con le colonne
      var rr2 = (c1 * a32 - c2) / (a32 - a31), rr3 = (c2 - a31 * c1) / (a32 - a31);
      if (quasiMezzo(rr2, 2) || quasiMezzo(rr3, 2)) return null;
      if (quasiMezzo(w3, 2) || w3 === p3 || c1 === 0 || c2 === 0) return null;
      function o(u, v, w) { return "$(\\tilde\\pi_1; \\tilde\\pi_2; \\tilde\\pi_3) = (" + m(u, 2, L) + "; " + m(v, 2, L) + "; " + m(w, 2, L) + ")$"; }
      function t(c, s) { return (c < 0 ? " - " : " + ") + (Math.abs(c) === 1 ? "" : Math.abs(c)) + s; }
      function f1(c, s) { return (c < 0 ? "-" : "") + (Math.abs(c) === 1 ? "" : Math.abs(c)) + s; }
      var lp = "$\\min\\ " + f1(c1, "x_1") + t(c2, "x_2") + t(c3, "x_3") + "$, " + T(L, "subject to ", "soggetto a ") +
        "(1) $x_1 + x_2 \\ge " + b1 + "$, (2) $x_1 + x_2 - x_3 = " + b2 + "$, (3) $" + f1(a31, "x_1") + t(a32, "x_2") + " \\le " + b3 + "$, " +
        "$x_1 \\ge 0$, $x_2$ " + T(L, "free", "libera") + ", $x_3 \\le 0$";
      var testo = T(L,
        "Consider the LP " + lp + ". Its optimal solution is $\\tilde x = (" + x1 + ", " + x2 + ", 0)$. Let $\\tilde\\pi_i = \\partial\\tilde z/\\partial b_i$ be the dual value of constraint $i$ (in a minimum: $\\pi_i \\ge 0$ for $\\ge$, free for $=$, $\\le 0$ for $\\le$). Using complementary slackness, what are the optimal dual values?",
        "Si consideri l'LP " + lp + ". La sua soluzione ottima è $\\tilde x = (" + x1 + ", " + x2 + ", 0)$. Sia $\\tilde\\pi_i = \\partial\\tilde z/\\partial b_i$ il valore duale del vincolo $i$ (in un minimo: $\\pi_i \\ge 0$ per $\\ge$, libera per $=$, $\\le 0$ per $\\le$). Con gli scarti complementari, quali sono i valori duali ottimi?");
      var sp = T(L,
        "Constraint (1) is slack ($" + (x1 + x2) + " > " + b1 + "$), so $\\tilde\\pi_1 = 0$. $x_1 > 0$ and $x_2 \\ne 0$ make their dual constraints active (columns of the primal): $\\pi_2 + " + u1(a31) + "\\pi_3 = " + c1 + "$ and $\\pi_2 - " + u1(-a32) + "\\pi_3 = " + c2 + "$, so $\\tilde\\pi_2 = " + p2 + "$, $\\tilde\\pi_3 = " + p3 + " \\le 0$ as required. The dual constraint of $x_3$ need not be active: $x_3$ sits at its bound $0$ with reduced cost $" + c3 + " + " + p2 + " = " + (c3 + p2) + "$. Check: $\\sum_i b_i\\tilde\\pi_i = " + (b2 * p2 + b3 * p3) + " = \\tilde z$.",
        "Il vincolo (1) è lasco ($" + (x1 + x2) + " > " + b1 + "$), quindi $\\tilde\\pi_1 = 0$. $x_1 > 0$ e $x_2 \\ne 0$ rendono attivi i loro vincoli duali (colonne del primale): $\\pi_2 + " + u1(a31) + "\\pi_3 = " + c1 + "$ e $\\pi_2 - " + u1(-a32) + "\\pi_3 = " + c2 + "$, da cui $\\tilde\\pi_2 = " + p2 + "$, $\\tilde\\pi_3 = " + p3 + " \\le 0$ come richiesto. Il vincolo duale di $x_3$ non deve essere attivo: $x_3$ sta al suo limite $0$ con costo ridotto $" + c3 + " + " + p2 + " = " + (c3 + p2) + "$. Verifica: $\\sum_i b_i\\tilde\\pi_i = " + (b2 * p2 + b3 * p3) + " = \\tilde z$.");
      return chiudi(rng, testo, o(0, p2, p3), [o(0, rr2, rr3), o(0, w2, w3), o(0, p3, p2), o(0, p2, -p3), o(p2, 0, p3)], sp,
        { c: [c1, c2, c3], b: [b1, b2, b3], a3: [a31, a32], x: [x1, x2, 0] });
    }
  });
  /* ===================== generatori aggiunti (7 novembre 2026): parte «Ottimizzazione e machine learning» ===================== */

  var SVM_E = "SVM for binary classification: observations $\\mathbf x_i$ with labels $y_i \\in \\{-1, +1\\}$, hyperplane $\\mathbf w'\\mathbf x + b = 0$. ";
  var SVM_I = "SVM per la classificazione binaria: osservazioni $\\mathbf x_i$ con etichette $y_i \\in \\{-1, +1\\}$, iperpiano $\\mathbf w'\\mathbf x + b = 0$. ";
  function vec(v, L) { return "(" + v.map(function (u) { return m(u, 3, L); }).join("; ") + ")"; }

  gen({
    id: "orl-g-svm-margine", livello: "facile", capitolo: "svm",
    link: link("svm/#hard-margin", "svm/#hard-margin"),
    prova: function (rng, L) {
      var w = [ri(rng, -6, 6), ri(rng, -6, 6)], b = ri(rng, -8, 8), x0 = [ri(rng, -4, 4), ri(rng, -4, 4)];
      if (w[0] === 0 || w[1] === 0) return null;
      var nw = Math.sqrt(w[0] * w[0] + w[1] * w[1]), f0 = w[0] * x0[0] + w[1] * x0[1] + b;
      if (f0 === 0) return null;
      var mg = 2 / nw, dist = Math.abs(f0) / nw;
      var vals = [mg, dist, 1 / nw, Math.abs(f0), 2 / (nw * nw)];
      for (var i = 0; i < vals.length; i++) if (quasiMezzo(vals[i], 3)) return null;
      function o(a, c) { return T(L, "margin $", "margine $") + m(a, 3, L) + T(L, "$, distance $", "$, distanza $") + m(c, 3, L) + "$"; }
      var testo = (L === "it" ? SVM_I : SVM_E) + T(L,
        "A trained SVM has $\\mathbf w = (" + w[0] + "; " + w[1] + ")$ and $b = " + b + "$; its margin lines are $\\mathbf w'\\mathbf x + b = \\pm 1$. What are the margin (the distance between the two margin lines) and the distance of the point $\\mathbf x_0 = (" + x0[0] + "; " + x0[1] + ")$ from the hyperplane?",
        "Una SVM addestrata ha $\\mathbf w = (" + w[0] + "; " + w[1] + ")$ e $b = " + b + "$; le sue rette di margine sono $\\mathbf w'\\mathbf x + b = \\pm 1$. Quanto valgono il margine (la distanza fra le due rette di margine) e la distanza del punto $\\mathbf x_0 = (" + x0[0] + "; " + x0[1] + ")$ dall'iperpiano?");
      var sp = T(L,
        "$\\|\\mathbf w\\| = \\sqrt{" + (w[0] * w[0] + w[1] * w[1]) + "} = " + m(nw, 3, L) + "$: the margin is $2/\\|\\mathbf w\\| = " + m(mg, 3, L) + "$; the distance of $\\mathbf x_0$ is $|\\mathbf w'\\mathbf x_0 + b|/\\|\\mathbf w\\| = " + Math.abs(f0) + "/" + m(nw, 3, L) + " = " + m(dist, 3, L) + "$. Forgetting to divide by $\\|\\mathbf w\\|$ is the typical mistake.",
        "$\\|\\mathbf w\\| = \\sqrt{" + (w[0] * w[0] + w[1] * w[1]) + "} = " + m(nw, 3, L) + "$: il margine è $2/\\|\\mathbf w\\| = " + m(mg, 3, L) + "$; la distanza di $\\mathbf x_0$ è $|\\mathbf w'\\mathbf x_0 + b|/\\|\\mathbf w\\| = " + Math.abs(f0) + "/" + m(nw, 3, L) + " = " + m(dist, 3, L) + "$. Dimenticare di dividere per $\\|\\mathbf w\\|$ è l'errore tipico.");
      return chiudi(rng, testo, o(mg, dist), [o(1 / nw, dist), o(mg, Math.abs(f0)), o(2 / (nw * nw), dist), o(1 / nw, Math.abs(f0))], sp,
        { w: w, b: b, x0: x0 });
    }
  });

  gen({
    id: "orl-g-svm-duale-w", livello: "facile", capitolo: "svm",
    link: link("svm/#the-dual-and-the-support-vectors", "svm/#il-duale-e-i-support-vector"),
    prova: function (rng, L) {
      var X = [[ri(rng, -3, 4), ri(rng, -3, 4)], [ri(rng, -3, 4), ri(rng, -3, 4)], [ri(rng, -3, 4), ri(rng, -3, 4)]];
      var a1 = pk(rng, [0.5, 1, 1.5, 2]), a2 = pk(rng, [0.5, 1, 1.5, 2]), al = [a1, a2, a1 + a2], y = [1, 1, -1];
      var w = [0, 1].map(function (k) { return al[0] * X[0][k] + al[1] * X[1][k] - al[2] * X[2][k]; });
      var nos = [0, 1].map(function (k) { return al[0] * X[0][k] + al[1] * X[1][k] + al[2] * X[2][k]; });
      var pos = [0, 1].map(function (k) { return al[0] * X[0][k] + al[1] * X[1][k]; });
      if (w[0] === 0 && w[1] === 0) return null;
      for (var u = 0; u < 3; u++) for (var v = u + 1; v < 3; v++) if (X[u][0] === X[v][0] && X[u][1] === X[v][1]) return null;
      function o(v) { return "$\\tilde{\\mathbf w} = " + vec(v, L) + "$"; }
      var testo = (L === "it" ? SVM_I : SVM_E) + T(L,
        "In the dual of the soft margin ($\\max\\ \\sum_i\\alpha_i - \\tfrac12\\sum_i\\sum_j\\alpha_i\\alpha_jy_iy_j\\mathbf x_i'\\mathbf x_j$, $\\sum_i\\alpha_iy_i = 0$, $0 \\le \\alpha_i \\le C$) only three points have $\\tilde\\alpha_i > 0$: $\\mathbf x_1 = (" + X[0].join("; ") + ")$, $y_1 = +1$, $\\tilde\\alpha_1 = " + m(a1, 1, L) + "$; $\\mathbf x_2 = (" + X[1].join("; ") + ")$, $y_2 = +1$, $\\tilde\\alpha_2 = " + m(a2, 1, L) + "$; $\\mathbf x_3 = (" + X[2].join("; ") + ")$, $y_3 = -1$, $\\tilde\\alpha_3 = " + m(a1 + a2, 1, L) + "$. What is the optimal $\\tilde{\\mathbf w}$ of the primal?",
        "Nel duale del soft margin ($\\max\\ \\sum_i\\alpha_i - \\tfrac12\\sum_i\\sum_j\\alpha_i\\alpha_jy_iy_j\\mathbf x_i'\\mathbf x_j$, $\\sum_i\\alpha_iy_i = 0$, $0 \\le \\alpha_i \\le C$) solo tre punti hanno $\\tilde\\alpha_i > 0$: $\\mathbf x_1 = (" + X[0].join("; ") + ")$, $y_1 = +1$, $\\tilde\\alpha_1 = " + m(a1, 1, L) + "$; $\\mathbf x_2 = (" + X[1].join("; ") + ")$, $y_2 = +1$, $\\tilde\\alpha_2 = " + m(a2, 1, L) + "$; $\\mathbf x_3 = (" + X[2].join("; ") + ")$, $y_3 = -1$, $\\tilde\\alpha_3 = " + m(a1 + a2, 1, L) + "$. Quanto vale il $\\tilde{\\mathbf w}$ ottimo del primale?");
      var sp = T(L,
        "Primal–dual relation: $\\tilde{\\mathbf w} = \\sum_i\\tilde\\alpha_iy_i\\mathbf x_i$, a sum over the support vectors only, with the sign of the labels: $" + m(a1, 1, L) + "\\,\\mathbf x_1 + " + m(a2, 1, L) + "\\,\\mathbf x_2 - " + m(a1 + a2, 1, L) + "\\,\\mathbf x_3 = " + vec(w, L) + "$. Forgetting the labels $y_i$ is the typical mistake.",
        "Relazione primale-duale: $\\tilde{\\mathbf w} = \\sum_i\\tilde\\alpha_iy_i\\mathbf x_i$, una somma sui soli support vector, col segno delle etichette: $" + m(a1, 1, L) + "\\,\\mathbf x_1 + " + m(a2, 1, L) + "\\,\\mathbf x_2 - " + m(a1 + a2, 1, L) + "\\,\\mathbf x_3 = " + vec(w, L) + "$. Dimenticare le etichette $y_i$ è l'errore tipico.");
      return chiudi(rng, testo, o(w), [o(nos), o([-w[0], -w[1]]), o(pos), o([w[1], w[0]])], sp,
        { X: X, y: y, alpha: al });
    }
  });

  gen({
    id: "orl-g-svm-rbf-valore", livello: "facile", capitolo: "svm",
    link: link("svm/#rbf-kernel", "svm/#kernel-rbf"),
    prova: function (rng, L) {
      var x = [ri(rng, 0, 4), ri(rng, 0, 4)], z = [ri(rng, 0, 4), ri(rng, 0, 4)], g = pk(rng, [0.1, 0.2, 0.25, 0.5, 1]);
      var d2 = (x[0] - z[0]) * (x[0] - z[0]) + (x[1] - z[1]) * (x[1] - z[1]);
      if (d2 === 0 || d2 > 10) return null;
      var K = Math.exp(-g * d2), w1 = Math.exp(-g * Math.sqrt(d2)), w2 = Math.exp(-d2 / g), w3 = Math.exp(-g * d2 / 2);
      var vals = [K, w1, w2, w3];
      for (var i = 0; i < vals.length; i++) if (quasiMezzo(vals[i], 3) || vals[i] < 0.001) return null;
      function o(v) { return "$K = " + m(v, 3, L) + "$"; }
      var testo = (L === "it" ? SVM_I : SVM_E) + T(L,
        "With the RBF (Gaussian) kernel $K(\\mathbf x, \\mathbf z) = e^{-\\gamma\\|\\mathbf x - \\mathbf z\\|^2}$ and $\\gamma = " + m(g, 2, L) + "$, what is $K(\\mathbf x, \\mathbf z)$ for $\\mathbf x = (" + x.join("; ") + ")$ and $\\mathbf z = (" + z.join("; ") + ")$?",
        "Con il kernel RBF (gaussiano) $K(\\mathbf x, \\mathbf z) = e^{-\\gamma\\|\\mathbf x - \\mathbf z\\|^2}$ e $\\gamma = " + m(g, 2, L) + "$, quanto vale $K(\\mathbf x, \\mathbf z)$ per $\\mathbf x = (" + x.join("; ") + ")$ e $\\mathbf z = (" + z.join("; ") + ")$?");
      var sp = T(L,
        "$\\|\\mathbf x - \\mathbf z\\|^2 = " + d2 + "$ (the squared distance, not the distance), so $K = e^{-" + m(g, 2, L) + "\\cdot " + d2 + "} = " + m(K, 3, L) + "$. Points far apart give $K$ close to 0, coincident points $K = 1$; a larger $\\gamma$ makes the kernel more local.",
        "$\\|\\mathbf x - \\mathbf z\\|^2 = " + d2 + "$ (la distanza al quadrato, non la distanza), quindi $K = e^{-" + m(g, 2, L) + "\\cdot " + d2 + "} = " + m(K, 3, L) + "$. Punti lontani danno $K$ vicino a 0, punti coincidenti $K = 1$; un $\\gamma$ più grande rende il kernel più locale.");
      return chiudi(rng, testo, o(K), [o(w1), o(w2), o(w3)], sp, { x: x, z: z, g: g });
    }
  });

  gen({
    id: "orl-g-svr-tubo", livello: "facile", capitolo: "svm",
    link: link("svm/#unbalanced-classes-and-svr", "svm/#classi-sbilanciate-e-svr"),
    prova: function (rng, L) {
      var a = -ri(rng, 2, 12), c0 = 10 * ri(rng, 15, 25), eps = ri(rng, 3, 8);
      var xs = [1, 2, 3, 4, 5].map(function (k) { return k + ri(rng, 0, 2) * 5; });
      xs = sortNum(xs);
      for (var k = 1; k < xs.length; k++) if (xs[k] === xs[k - 1]) return null;
      var r = xs.map(function () { return ri(rng, -2 * eps, 2 * eps); });
      var ys = xs.map(function (x, i) { return a * x + c0 + r[i]; });
      var fuori = 0, pen = 0, assol = 0;
      r.forEach(function (e) { if (Math.abs(e) > eps) { fuori++; pen += Math.abs(e) - eps; assol += Math.abs(e); } });
      if (fuori === 0 || fuori === 5) return null;
      function o(k, p) { return T(L, "$" + k + "$ points outside, penalty $" + p + "$", "$" + k + "$ punti fuori, penalità $" + p + "$"); }
      var pts = xs.map(function (x, i) { return "(" + x + "; " + ys[i] + ")"; }).join(", ");
      var testo = T(L,
        "Support Vector Regression: errors within a tube $|y_i - \\hat y_i| \\le \\varepsilon$ cost nothing, those outside pay $|y_i - \\hat y_i| - \\varepsilon$ (the slacks $\\xi_i$, $\\xi_i^*$). The estimated line is $\\hat y = " + a + "x + " + c0 + "$, with $\\varepsilon = " + eps + "$; the observations $(x_i; y_i)$ are " + pts + ". How many points fall outside the tube, and what is their total penalty $\\sum_i(\\xi_i + \\xi_i^*)$?",
        "Support Vector Regression: gli errori dentro un tubo $|y_i - \\hat y_i| \\le \\varepsilon$ non costano, quelli fuori pagano $|y_i - \\hat y_i| - \\varepsilon$ (gli scarti $\\xi_i$, $\\xi_i^*$). La retta stimata è $\\hat y = " + a + "x + " + c0 + "$, con $\\varepsilon = " + eps + "$; le osservazioni $(x_i; y_i)$ sono " + pts + ". Quanti punti cadono fuori dal tubo, e qual è la loro penalità totale $\\sum_i(\\xi_i + \\xi_i^*)$?");
      var sp = T(L,
        "Residuals $y_i - \\hat y_i$: $" + r.join("$, $") + "$. Those with $|r_i| > " + eps + "$ are " + fuori + "; each pays only the part beyond the tube, $|r_i| - " + eps + "$, for a total of $" + pen + "$. Paying the whole residual gives $" + assol + "$.",
        "Residui $y_i - \\hat y_i$: $" + r.join("$, $") + "$. Quelli con $|r_i| > " + eps + "$ sono " + fuori + "; ciascuno paga solo la parte oltre il tubo, $|r_i| - " + eps + "$, per un totale di $" + pen + "$. Pagare l'intero residuo dà $" + assol + "$.");
      return chiudi(rng, testo, o(fuori, pen), [o(fuori, assol), o(5 - fuori, pen), o(5 - fuori, assol), o(fuori, pen + eps)], sp,
        { xs: xs, ys: ys, a: a, c: c0, eps: eps });
    }
  });

  gen({
    id: "orl-g-reg-mediana-media", livello: "facile", capitolo: "regression",
    link: link("regression/#case-study-the-bakery-history", "regressione/#caso-di-studio-lo-storico-della-panetteria"),
    prova: function (rng, L) {
      var y = [];
      for (var i = 0; i < 6; i++) y.push(ri(rng, 90, 150));
      y.push(ri(rng, 10, 30));
      var s = sortNum(y);
      for (var k = 1; k < 7; k++) if (s[k] === s[k - 1]) return null;
      var med = s[3], media = y.reduce(function (u, v) { return u + v; }, 0) / 7;
      var med6 = (s[3] + s[4]) / 2;
      if (quasiMezzo(media, 2) || Math.abs(media - med) < 3) return null;
      function o(a, c) { return T(L, "LP $\\tilde b = ", "LP $\\tilde b = ") + m(a, 2, L) + T(L, "$, QP $\\tilde b = ", "$, QP $\\tilde b = ") + m(c, 2, L) + "$"; }
      var testo = T(L,
        "Seven days of sales of a bakery, one of them during a strike: $" + y.join("$, $") + "$. With no features, the LP of least absolute deviations ($\\min\\sum_i|y_i - b|$, quantile regression with $\\tau = 1/2$) and the QP of least squares ($\\min\\sum_i(y_i - b)^2$) each estimate one number $b$. What are the two estimates?",
        "Sette giorni di vendite di una panetteria, uno dei quali durante uno sciopero: $" + y.join("$, $") + "$. Senza caratteristiche, l'LP dei minimi scostamenti assoluti ($\\min\\sum_i|y_i - b|$, regressione quantile con $\\tau = 1/2$) e il QP dei minimi quadrati ($\\min\\sum_i(y_i - b)^2$) stimano ciascuno un solo numero $b$. Quanto valgono le due stime?");
      var sp = T(L,
        "The LP returns the median, the 4th of the 7 sorted values, $" + med + "$; the QP returns the mean, $" + m(media, 2, L) + "$, pulled down by the strike day. The median ignores how far the anomalous value is: this is the robustness of the LP.",
        "L'LP restituisce la mediana, il 4º dei 7 valori ordinati, $" + med + "$; il QP restituisce la media, $" + m(media, 2, L) + "$, tirata in basso dal giorno di sciopero. La mediana ignora quanto è lontano il valore anomalo: è la robustezza dell'LP.");
      return chiudi(rng, testo, o(med, media), [o(media, med), o(med6, media), o(med, (s[1] + s[2] + s[3] + s[4] + s[5] + s[6]) / 6)], sp,
        { y: y });
    }
  });

  gen({
    id: "orl-g-svm-duale-b", livello: "media", capitolo: "svm",
    link: link("svm/#the-dual-and-the-support-vectors", "svm/#il-duale-e-i-support-vector"),
    prova: function (rng, L) {
      var w = [ri(rng, -3, 3), ri(rng, -3, 3)], xk = [ri(rng, -3, 3), ri(rng, -3, 3)], yk = pk(rng, [-1, 1]);
      var x0 = [ri(rng, -3, 3), ri(rng, -3, 3)];
      if (w[0] === 0 && w[1] === 0) return null;
      var b = yk - (w[0] * xk[0] + w[1] * xk[1]), f0 = w[0] * x0[0] + w[1] * x0[1] + b;
      var bw = -(w[0] * xk[0] + w[1] * xk[1]), b1 = 1 - (w[0] * xk[0] + w[1] * xk[1]);
      if (f0 === 0 || b1 === b) return null;
      function o(bb, ff) { return "$\\tilde b = " + bb + "$, $f(\\mathbf x_0) = " + ff + "$"; }
      function fx(bb) { return w[0] * x0[0] + w[1] * x0[1] + bb; }
      var testo = (L === "it" ? SVM_I : SVM_E) + T(L,
        "A soft-margin SVM (dual multipliers $0 \\le \\alpha_i \\le C$) gives $\\tilde{\\mathbf w} = (" + w.join("; ") + ")$. The point $\\mathbf x_k = (" + xk.join("; ") + ")$ with label $y_k = " + (yk > 0 ? "+1" : "-1") + "$ has $0 < \\tilde\\alpha_k < C$. What are the intercept $\\tilde b$ and the score $f(\\mathbf x_0) = \\tilde{\\mathbf w}'\\mathbf x_0 + \\tilde b$ of $\\mathbf x_0 = (" + x0.join("; ") + ")$?",
        "Una SVM soft margin (moltiplicatori duali $0 \\le \\alpha_i \\le C$) dà $\\tilde{\\mathbf w} = (" + w.join("; ") + ")$. Il punto $\\mathbf x_k = (" + xk.join("; ") + ")$ con etichetta $y_k = " + (yk > 0 ? "+1" : "-1") + "$ ha $0 < \\tilde\\alpha_k < C$. Quanto valgono l'intercetta $\\tilde b$ e il punteggio $f(\\mathbf x_0) = \\tilde{\\mathbf w}'\\mathbf x_0 + \\tilde b$ di $\\mathbf x_0 = (" + x0.join("; ") + ")$?");
      var sp = T(L,
        "$0 < \\tilde\\alpha_k < C$ means $\\mathbf x_k$ lies exactly on its margin line: $y_k(\\tilde{\\mathbf w}'\\mathbf x_k + b) = 1$, so $\\tilde b = y_k - \\tilde{\\mathbf w}'\\mathbf x_k = " + b + "$ (since $1/y_k = y_k$). Then $f(\\mathbf x_0) = " + f0 + "$: $\\mathbf x_0$ is assigned to class $" + (f0 > 0 ? "+1" : "-1") + "$.",
        "$0 < \\tilde\\alpha_k < C$ vuol dire che $\\mathbf x_k$ sta esattamente sulla sua retta di margine: $y_k(\\tilde{\\mathbf w}'\\mathbf x_k + b) = 1$, quindi $\\tilde b = y_k - \\tilde{\\mathbf w}'\\mathbf x_k = " + b + "$ (perché $1/y_k = y_k$). Allora $f(\\mathbf x_0) = " + f0 + "$: $\\mathbf x_0$ va nella classe $" + (f0 > 0 ? "+1" : "-1") + "$.");
      return chiudi(rng, testo, o(b, f0), [o(bw, fx(bw)), o(b1, fx(b1)), o(-b, fx(-b)), o(b, -f0)], sp,
        { w: w, xk: xk, yk: yk, x0: x0 });
    }
  });

  gen({
    id: "orl-g-reg-duale-interpolato", livello: "media", capitolo: "regression",
    link: link("regression/#the-dual-reading-the-support-points", "regressione/#la-lettura-duale-i-punti-di-appoggio"),
    prova: function (rng, L) {
      var n = pk(rng, [5, 7, 9]), k = ri(rng, 2, n - 1);
      var y = [];
      for (var i = 0; i < n; i++) y.push(ri(rng, 80, 160));
      var s = sortNum(y);
      for (var j = 1; j < n; j++) if (s[j] === s[j - 1]) return null;
      var num = 2 * k - 1, den = 2 * n, tau = num / den;
      var pi = (k - 1) - tau * (n - 1);
      if (quasiMezzo(pi, 3) || quasiMezzo(1 - tau, 3)) return null;
      function o(bb, p) { return "$\\tilde b = " + bb + "$, $\\tilde\\pi = " + m(p, 3, L) + "$"; }
      var testo = T(L,
        "Quantile regression LP with no features: $\\min\\sum_i[\\tau u_i + (1 - \\tau)v_i]$ subject to $b + u_i - v_i = y_i$, $u_i, v_i \\ge 0$, $b$ free; $\\tilde\\pi_i$ is the optimal dual of the constraint of observation $i$ (it equals $\\tau$ for observations above $\\tilde b$, $-(1 - \\tau)$ for those below, and $\\sum_i\\tilde\\pi_i = 0$). Data: $y = (" + y.join("; ") + ")$, $\\tau = " + num + "/" + den + "$. What are $\\tilde b$ and the dual $\\tilde\\pi$ of the interpolated observation ($y_i = \\tilde b$)?",
        "LP di regressione quantile senza caratteristiche: $\\min\\sum_i[\\tau u_i + (1 - \\tau)v_i]$ soggetto a $b + u_i - v_i = y_i$, $u_i, v_i \\ge 0$, $b$ libera; $\\tilde\\pi_i$ è il duale ottimo del vincolo dell'osservazione $i$ (vale $\\tau$ per le osservazioni sopra $\\tilde b$, $-(1 - \\tau)$ per quelle sotto, e $\\sum_i\\tilde\\pi_i = 0$). Dati: $y = (" + y.join("; ") + ")$, $\\tau = " + num + "/" + den + "$. Quanto valgono $\\tilde b$ e il duale $\\tilde\\pi$ dell'osservazione interpolata ($y_i = \\tilde b$)?");
      var sp = T(L,
        "$\\tilde b$ is the empirical $\\tau$-quantile: with $(k - 1)/n < \\tau < k/n$ for $k = " + k + "$ it is the " + k + "th smallest value, $" + s[k - 1] + "$, with $" + (k - 1) + "$ observations below and $" + (n - k) + "$ above. From $\\sum_i\\tilde\\pi_i = 0$: $\\tilde\\pi = (1 - \\tau)\\cdot " + (k - 1) + " - \\tau\\cdot " + (n - k) + " = " + m(pi, 3, L) + "$, inside $[-(1 - \\tau), \\tau]$.",
        "$\\tilde b$ è il quantile empirico di livello $\\tau$: con $(k - 1)/n < \\tau < k/n$ per $k = " + k + "$ è il " + k + "º valore più piccolo, $" + s[k - 1] + "$, con $" + (k - 1) + "$ osservazioni sotto e $" + (n - k) + "$ sopra. Da $\\sum_i\\tilde\\pi_i = 0$: $\\tilde\\pi = (1 - \\tau)\\cdot " + (k - 1) + " - \\tau\\cdot " + (n - k) + " = " + m(pi, 3, L) + "$, dentro $[-(1 - \\tau), \\tau]$.");
      return chiudi(rng, testo, o(s[k - 1], pi), [o(s[k - 1], -pi), o(s[k], pi), o(s[k - 2], tau), o(s[k - 1], tau), o(s[k - 1], -(1 - tau))], sp,
        { y: y, tau: tau, b: s[k - 1] });
    }
  });

  gen({
    id: "orl-g-reg-lad-3punti", livello: "complessa", capitolo: "regression",
    link: link("regression/#the-dual-reading-the-support-points", "regressione/#la-lettura-duale-i-punti-di-appoggio"),
    prova: function (rng, L) {
      var xs = sortNum([ri(rng, 0, 9), ri(rng, 0, 9), ri(rng, 0, 9)]);
      if (xs[0] === xs[1] || xs[1] === xs[2]) return null;
      var ys = [ri(rng, 10, 60), ri(rng, 10, 60), ri(rng, 10, 60)];
      var tau = pk(rng, [0.25, 0.5, 0.75]);
      var cand = [];
      [[0, 1, 2], [0, 2, 1], [1, 2, 0]].forEach(function (t) {
        var i = t[0], j = t[1], h = t[2];
        var a = (ys[j] - ys[i]) / (xs[j] - xs[i]), c = ys[i] - a * xs[i], r = ys[h] - (a * xs[h] + c);
        cand.push({ a: a, c: c, z: r > 0 ? tau * r : -(1 - tau) * r });
      });
      var ord = cand.slice().sort(function (u, v) { return u.z - v.z; });
      if (ord[1].z - ord[0].z < 0.5) return null;
      for (var q = 0; q < 3; q++) if (quasiMezzo(cand[q].a, 2) || quasiMezzo(cand[q].c, 2) || quasiMezzo(cand[q].z, 2)) return null;
      var best = ord[0];
      function o(u) { return T(L, "slope $", "pendenza $") + m(u.a, 2, L) + T(L, "$, intercept $", "$, intercetta $") + m(u.c, 2, L) + T(L, "$, value $", "$, valore $") + m(u.z, 2, L) + "$"; }
      // errore: costi dei due lati scambiati
      var sw = [[0, 1, 2], [0, 2, 1], [1, 2, 0]].map(function (t) {
        var i = t[0], j = t[1], h = t[2];
        var a = (ys[j] - ys[i]) / (xs[j] - xs[i]), c = ys[i] - a * xs[i], r = ys[h] - (a * xs[h] + c);
        return { a: a, c: c, z: r > 0 ? (1 - tau) * r : -tau * r };
      }).sort(function (u, v) { return u.z - v.z; })[0];
      var pts = xs.map(function (x, i) { return "(" + x + "; " + ys[i] + ")"; }).join(", ");
      var testo = T(L,
        "Quantile regression LP with one feature ($p = 1$): $\\min\\sum_i[\\tau u_i + (1 - \\tau)v_i]$ subject to $wx_i + b + u_i - v_i = y_i$, $u_i, v_i \\ge 0$ ($u_i$: observation above the line, $v_i$: below), $w, b$ free, with $\\tau = " + m(tau, 2, L) + "$ and three observations $(x_i; y_i)$: " + pts + ". An optimal line interpolates $p + 1 = 2$ observations. What are the optimal slope $\\tilde w$, intercept $\\tilde b$ and optimal value?",
        "LP di regressione quantile con una caratteristica ($p = 1$): $\\min\\sum_i[\\tau u_i + (1 - \\tau)v_i]$ soggetto a $wx_i + b + u_i - v_i = y_i$, $u_i, v_i \\ge 0$ ($u_i$: osservazione sopra la retta, $v_i$: sotto), $w, b$ liberi, con $\\tau = " + m(tau, 2, L) + "$ e tre osservazioni $(x_i; y_i)$: " + pts + ". Una retta ottima interpola $p + 1 = 2$ osservazioni. Quanto valgono la pendenza ottima $\\tilde w$, l'intercetta $\\tilde b$ e il valore ottimo?");
      var sp = T(L,
        "Three candidate lines, one per pair of points; each leaves one residual $r$ on the third point, which costs $\\tau r$ if the point is above ($r > 0$) and $(1 - \\tau)|r|$ if below. Values: $" + cand.map(function (u) { return m(u.z, 2, L); }).join("$, $") + "$. The cheapest is the line with slope $" + m(best.a, 2, L) + "$ and intercept $" + m(best.c, 2, L) + "$.",
        "Tre rette candidate, una per coppia di punti; ciascuna lascia un residuo $r$ sul terzo punto, che costa $\\tau r$ se il punto sta sopra ($r > 0$) e $(1 - \\tau)|r|$ se sta sotto. Valori: $" + cand.map(function (u) { return m(u.z, 2, L); }).join("$, $") + "$. La più economica è la retta con pendenza $" + m(best.a, 2, L) + "$ e intercetta $" + m(best.c, 2, L) + "$.");
      return chiudi(rng, testo, o(best), [o(ord[1]), o(ord[2]), o(sw), o({ a: best.a, c: best.c, z: 2 * best.z })], sp,
        { xs: xs, ys: ys, tau: tau });
    }
  });
  /* ===================== generatori aggiunti (7 novembre 2026): parte «Decisioni sotto incertezza» ===================== */

  gen({
    id: "orl-g-nv-normale", livello: "facile", capitolo: "newsvendor",
    link: link("newsvendor/#case-study", "newsvendor/#caso-di-studio"),
    prova: function (rng, L) {
      var tab = [[0.6, 0.253], [0.7, 0.524], [0.75, 0.674], [0.8, 0.842], [0.9, 1.282]];
      var k = ri(rng, 0, 4), al = tab[k][0], z = tab[k][1];
      var co = pk(rng, [2, 4, 6]), cu = Math.round(co * al / (1 - al) * 1000) / 1000;
      if (Math.abs(cu - Math.round(cu)) > 1e-9) return null;
      var v = ri(rng, 1, 5), c = v + co, p = c + cu;
      var mu = 10 * ri(rng, 8, 20), sg = 5 * ri(rng, 2, 8);
      var qs = mu + z * sg, qm = mu - z * sg, k2 = k < 4 ? k + 1 : k - 1, qw = mu + tab[k2][1] * sg;
      if (quasiMezzo(qs, 1) || quasiMezzo(qm, 1) || quasiMezzo(qw, 1)) return null;
      function o(x) { return "$\\tilde q = " + m(x, 1, L) + "$"; }
      var zt = tab.map(function (t) { return "$\\Phi^{-1}(" + m(t[0], 2, L) + ") = " + m(t[1], 3, L) + "$"; }).join(", ");
      var testo = T(L,
        "Newsvendor: a product is bought at $c = " + c + "$ €, sold at $p = " + p + "$ € and each unsold unit is recovered at $v = " + v + "$ €; demand is normal with mean $" + mu + "$ and standard deviation $" + sg + "$. The optimal order satisfies $F(\\tilde q) = c_u/(c_u + c_o)$ with $c_u = p - c$ and $c_o = c - v$, so $\\tilde q = \\mu + z\\sigma$ with $z = \\Phi^{-1}(c_u/(c_u + c_o))$ (standard normal quantiles: " + zt + "). What is $\\tilde q$?",
        "Newsvendor: un prodotto si compra a $c = " + c + "$ €, si vende a $p = " + p + "$ € e ogni unità invenduta si recupera a $v = " + v + "$ €; la domanda è normale con media $" + mu + "$ e deviazione standard $" + sg + "$. L'ordine ottimo soddisfa $F(\\tilde q) = c_u/(c_u + c_o)$ con $c_u = p - c$ e $c_o = c - v$, quindi $\\tilde q = \\mu + z\\sigma$ con $z = \\Phi^{-1}(c_u/(c_u + c_o))$ (quantili della normale standard: " + zt + "). Quanto vale $\\tilde q$?");
      var sp = T(L,
        "$c_u = " + cu + "$, $c_o = " + co + "$, critical ratio $" + cu + "/" + (cu + co) + " = " + m(al, 2, L) + "$, $z = " + m(z, 3, L) + "$: $\\tilde q = " + mu + " + " + m(z, 3, L) + "\\cdot " + sg + " = " + m(qs, 1, L) + "$, above the mean because shortages cost more than leftovers. Swapping $c_u$ and $c_o$ gives $\\mu - z\\sigma$.",
        "$c_u = " + cu + "$, $c_o = " + co + "$, rapporto critico $" + cu + "/" + (cu + co) + " = " + m(al, 2, L) + "$, $z = " + m(z, 3, L) + "$: $\\tilde q = " + mu + " + " + m(z, 3, L) + "\\cdot " + sg + " = " + m(qs, 1, L) + "$, sopra la media perché la carenza costa più dell'invenduto. Scambiare $c_u$ e $c_o$ dà $\\mu - z\\sigma$.");
      return chiudi(rng, testo, o(qs), [o(qm), o(qw), o(mu), o(mu + sg)], sp,
        { p: p, c: c, v: v, mu: mu, sigma: sg });
    }
  });

  gen({
    id: "orl-g-cvar-eccessi", livello: "facile", capitolo: "var-cvar",
    link: link("var-cvar/#the-rockafellaruryasev-linear-formulation", "var-cvar/#la-formulazione-lineare-di-rockafellaruryasev"),
    prova: function (rng, L) {
      var l = [ri(rng, 1, 30), ri(rng, 1, 30), ri(rng, 1, 30), ri(rng, 1, 30), ri(rng, 1, 30)];
      var al = pk(rng, [0.6, 0.8]), eta = ri(rng, 5, 25);
      var xi = l.map(function (u) { return pos(u - eta); }), sx = xi.reduce(function (a, b) { return a + b; }, 0);
      var neg = l.reduce(function (a, b) { return a + b - eta; }, 0);
      if (sx === 0 || sx === neg) return null;
      var F = eta + 0.2 * sx / (1 - al), F1 = eta + 0.2 * sx, F2 = eta + 0.2 * sx / al, F3 = eta + 0.2 * neg / (1 - al);
      function o(s, f) { return "$\\sum_s\\xi_s = " + m(s, 2, L) + "$, " + T(L, "value", "valore") + " $" + m(f, 2, L) + "$"; }
      var testo = T(L,
        "Rockafellar–Uryasev formulation of the CVaR: for a threshold $\\eta$, the excesses are $\\xi_s = (\\ell_s - \\eta)^+$ and the function to minimize over $\\eta$ is $F(\\eta) = \\eta + \\frac{1}{1-\\alpha}\\sum_s\\pi_s\\xi_s$. Five equiprobable scenarios ($\\pi_s = 0{.}2$) with losses $\\ell = (" + l.join("; ") + ")$, $\\alpha = " + m(al, 1, L) + "$. For $\\eta = " + eta + "$ (not necessarily optimal), what are $\\sum_s\\xi_s$ and $F(\\eta)$?",
        "Formulazione di Rockafellar–Uryasev del CVaR: per una soglia $\\eta$ gli eccessi sono $\\xi_s = (\\ell_s - \\eta)^+$ e la funzione da minimizzare in $\\eta$ è $F(\\eta) = \\eta + \\frac{1}{1-\\alpha}\\sum_s\\pi_s\\xi_s$. Cinque scenari equiprobabili ($\\pi_s = 0{,}2$) con perdite $\\ell = (" + l.join("; ") + ")$, $\\alpha = " + m(al, 1, L) + "$. Per $\\eta = " + eta + "$ (non necessariamente ottimo), quanto valgono $\\sum_s\\xi_s$ e $F(\\eta)$?");
      testo = testo.replace("0{.}2", "0.2");
      var sp = T(L,
        "Only the losses above $" + eta + "$ count: $\\xi = (" + xi.join("; ") + ")$, sum $" + sx + "$. Then $F(" + eta + ") = " + eta + " + \\frac{1}{" + m(1 - al, 1, L) + "}\\cdot 0.2\\cdot " + sx + " = " + m(F, 2, L) + "$. Negative differences are cut at zero; forgetting the factor $1/(1-\\alpha)$ is the other typical mistake.",
        "Contano solo le perdite sopra $" + eta + "$: $\\xi = (" + xi.join("; ") + ")$, somma $" + sx + "$. Allora $F(" + eta + ") = " + eta + " + \\frac{1}{" + m(1 - al, 1, L) + "}\\cdot 0{,}2\\cdot " + sx + " = " + m(F, 2, L) + "$. Le differenze negative si tagliano a zero; dimenticare il fattore $1/(1-\\alpha)$ è l'altro errore tipico.");
      return chiudi(rng, testo, o(sx, F), [o(sx, F1), o(neg, F3), o(sx, F2)], sp,
        { l: l, alpha: al, eta: eta });
    }
  });

  gen({
    id: "orl-g-arb-portafoglio", livello: "facile", capitolo: "arbitrage",
    link: link("arbitrage/#the-model", "arbitraggio/#il-modello"),
    prova: function (rng, L) {
      var R = pk(rng, [1.02, 1.04, 1.05]);
      var s1 = [ri(rng, 5, 20), ri(rng, 5, 20), ri(rng, 5, 20)], s2 = [ri(rng, 10, 40), ri(rng, 10, 40), ri(rng, 10, 40)];
      var p1 = ri(rng, 5, 20), p2 = ri(rng, 10, 40);
      var x1 = pk(rng, [-1, 1, 2]), x2 = pk(rng, [-1, 1, 2]), x0 = -ri(rng, 5, 40);
      var costo = x0 + x1 * p1 + x2 * p2;
      var pay = [0, 1, 2].map(function (j) { return x0 * R + x1 * s1[j] + x2 * s2[j]; });
      var mn = Math.min.apply(null, pay), mx = Math.max.apply(null, pay);
      var payNoR = [0, 1, 2].map(function (j) { return x0 + x1 * s1[j] + x2 * s2[j]; });
      var mnNoR = Math.min.apply(null, payNoR);
      if (Math.abs(mn - mnNoR) < 0.5 || mn === mx) return null;
      function o(c, w) { return T(L, "cost $", "costo $") + m(c, 2, L) + T(L, "$, smallest payoff $", "$, pagamento minimo $") + m(w, 2, L) + "$"; }
      var testo = T(L,
        "One-period market with three states: security 0 is risk-free (costs 1 today, pays $R = " + m(R, 2, L) + "$ in every state); security 1 costs $" + p1 + "$ and pays $(" + s1.join("; ") + ")$; security 2 costs $" + p2 + "$ and pays $(" + s2.join("; ") + ")$. The portfolio $x = (" + x0 + "; " + x1 + "; " + x2 + ")$ holds $x_i$ units of security $i$ (negative = short). What are its cost today, $\\sum_is^0_ix_i$, and its smallest payoff tomorrow over the three states?",
        "Mercato a un periodo con tre stati: il titolo 0 è privo di rischio (costa 1 oggi, paga $R = " + m(R, 2, L) + "$ in ogni stato); il titolo 1 costa $" + p1 + "$ e paga $(" + s1.join("; ") + ")$; il titolo 2 costa $" + p2 + "$ e paga $(" + s2.join("; ") + ")$. Il portafoglio $x = (" + x0 + "; " + x1 + "; " + x2 + ")$ contiene $x_i$ unità del titolo $i$ (negativo = allo scoperto). Quanto valgono il suo costo di oggi, $\\sum_is^0_ix_i$, e il suo pagamento minimo domani sui tre stati?");
      var sp = T(L,
        "Cost: $" + x0 + "\\cdot 1 + " + x1 + "\\cdot " + p1 + " + " + x2 + "\\cdot " + p2 + " = " + costo + "$. Payoffs: $" + x0 + "\\cdot " + m(R, 2, L) + " + " + x1 + "s^1_{1j} + " + x2 + "s^1_{2j}$ = $" + pay.map(function (u) { return m(u, 2, L); }).join("$, $") + "$, smallest $" + m(mn, 2, L) + "$. A negative cost with every payoff $\\ge 0$ would be an arbitrage of type A. The risk-free position pays $R$ per unit, not 1.",
        "Costo: $" + x0 + "\\cdot 1 + " + x1 + "\\cdot " + p1 + " + " + x2 + "\\cdot " + p2 + " = " + costo + "$. Pagamenti: $" + x0 + "\\cdot " + m(R, 2, L) + " + " + x1 + "s^1_{1j} + " + x2 + "s^1_{2j}$ = $" + pay.map(function (u) { return m(u, 2, L); }).join("$, $") + "$, il minimo $" + m(mn, 2, L) + "$. Un costo negativo con tutti i pagamenti $\\ge 0$ sarebbe un arbitraggio di tipo A. La posizione priva di rischio paga $R$ per unità, non 1.");
      return chiudi(rng, testo, o(costo, mn), [o(costo, mnNoR), o(costo, mx), o(x0 * R + x1 * p1 + x2 * p2, mn), o(-costo, mn)], sp,
        { R: R, s1: s1, s2: s2, p1: p1, p2: p2, x: [x0, x1, x2] });
    }
  });

  gen({
    id: "orl-g-arb-prezzo-atteso", livello: "facile", capitolo: "arbitrage",
    link: link("arbitrage/#duality-is-pricing", "arbitraggio/#la-dualita-e-la-prezzatura"),
    prova: function (rng, L) {
      var a = ri(rng, 1, 7), b = ri(rng, 1, 8 - a), q = [a / 10, b / 10, (10 - a - b) / 10];
      if (q[2] <= 0) return null;
      var R = pk(rng, [1.02, 1.04, 1.05]), s = [ri(rng, 0, 30), ri(rng, 0, 30), ri(rng, 0, 30)];
      var e = q[0] * s[0] + q[1] * s[1] + q[2] * s[2], pr = e / R;
      var media = (s[0] + s[1] + s[2]) / 3 / R;
      var vals = [pr, e, e * R, media];
      for (var i = 0; i < vals.length; i++) if (quasiMezzo(vals[i], 2)) return null;
      if (Math.abs(pr - media) < 0.05 || e === 0) return null;
      function o(x) { return "$s^0 = " + m(x, 2, L) + "$"; }
      var testo = T(L,
        "One-period market with three states and risk-free gross return $R = " + m(R, 2, L) + "$. The duals of the arbitrage LP give the risk-neutral probabilities $q = (" + q.map(function (u) { return m(u, 1, L); }).join("; ") + ")$, and every price today is the discounted expected payoff under $q$: $s^0_i = \\frac1R\\sum_jq_js^1_{ij}$. A new security pays $(" + s.join("; ") + ")$ in the three states. What is its arbitrage-free price today?",
        "Mercato a un periodo con tre stati e rendimento lordo privo di rischio $R = " + m(R, 2, L) + "$. I duali dell'LP di arbitraggio danno le probabilità neutrali al rischio $q = (" + q.map(function (u) { return m(u, 1, L); }).join("; ") + ")$, e ogni prezzo di oggi è il pagamento atteso scontato sotto $q$: $s^0_i = \\frac1R\\sum_jq_js^1_{ij}$. Un titolo nuovo paga $(" + s.join("; ") + ")$ nei tre stati. Qual è il suo prezzo di oggi senza arbitraggio?");
      var sp = T(L,
        "Expected payoff under $q$: $" + m(e, 2, L) + "$; discounted: $" + m(e, 2, L) + "/" + m(R, 2, L) + " = " + m(pr, 2, L) + "$. Forgetting to discount, or using equal probabilities instead of $q$, are the typical mistakes.",
        "Pagamento atteso sotto $q$: $" + m(e, 2, L) + "$; scontato: $" + m(e, 2, L) + "/" + m(R, 2, L) + " = " + m(pr, 2, L) + "$. Dimenticare lo sconto, o usare probabilità uguali invece di $q$, sono gli errori tipici.");
      return chiudi(rng, testo, o(pr), [o(e), o(e * R), o(media)], sp, { q: q, R: R, s: s });
    }
  });

  gen({
    id: "orl-g-nv-servizio-uniforme", livello: "media", capitolo: "newsvendor",
    link: link("newsvendor/#service-levels-and-risk", "newsvendor/#livelli-di-servizio-e-rischio"),
    prova: function (rng, L) {
      var a = 10 * ri(rng, 5, 10), w = 10 * ri(rng, 4, 12), b = a + w;
      var cu = ri(rng, 2, 9), co = ri(rng, 2, 9);
      var al = cu / (cu + co), be = pk(rng, [0.9, 0.95]);
      if (al >= be - 0.05 || cu === co) return null;
      function C(qq) { return (co * (qq - a) * (qq - a) + cu * (b - qq) * (b - qq)) / (2 * w); }
      var qs = a + al * w, qb = a + be * w, ex = C(qb) - C(qs);
      var qb2 = a + (1 - be) * w;
      function Cs(qq) { return (cu * (qq - a) * (qq - a) + co * (b - qq) * (b - qq)) / (2 * w); }
      var exs = Cs(qb) - Cs(qs);
      var vals = [qb, ex, exs, C(qb)];
      for (var i = 0; i < vals.length; i++) if (quasiMezzo(vals[i], 2)) return null;
      if (Math.abs(ex - exs) < 0.05) return null;
      function o(x, y) { return "$q_\\beta = " + m(x, 2, L) + "$, " + T(L, "extra cost", "costo in più") + " $" + m(y, 2, L) + "$"; }
      var testo = T(L,
        "Newsvendor with uniform demand on $[" + a + ", " + b + "]$, $c_u = " + cu + "$, $c_o = " + co + "$. The expected cost of an order $q$ in $[" + a + ", " + b + "]$ is $C(q) = \\frac{c_o(q - " + a + ")^2 + c_u(" + b + " - q)^2}{2\\cdot " + w + "}$, minimized at $\\tilde q = " + a + " + \\frac{c_u}{c_u + c_o}\\cdot " + w + "$. A contract imposes a cycle service level $\\mathbb P(D \\le q) = " + m(be, 2, L) + "$. What are the required order $q_\\beta$ and its extra expected cost $C(q_\\beta) - C(\\tilde q)$?",
        "Newsvendor con domanda uniforme su $[" + a + ", " + b + "]$, $c_u = " + cu + "$, $c_o = " + co + "$. Il costo atteso di un ordine $q$ in $[" + a + ", " + b + "]$ è $C(q) = \\frac{c_o(q - " + a + ")^2 + c_u(" + b + " - q)^2}{2\\cdot " + w + "}$, minimo in $\\tilde q = " + a + " + \\frac{c_u}{c_u + c_o}\\cdot " + w + "$. Un contratto impone un livello di servizio di ciclo $\\mathbb P(D \\le q) = " + m(be, 2, L) + "$. Quanto valgono l'ordine richiesto $q_\\beta$ e il suo costo atteso in più $C(q_\\beta) - C(\\tilde q)$?");
      var sp = T(L,
        "$q_\\beta = " + a + " + " + m(be, 2, L) + "\\cdot " + w + " = " + m(qb, 2, L) + "$; $\\tilde q = " + m(qs, 2, L) + "$; $C(q_\\beta) = " + m(C(qb), 2, L) + "$ and $C(\\tilde q) = " + m(C(qs), 2, L) + "$, so the service level costs $" + m(ex, 2, L) + "$ more per cycle than the economic optimum, whose service level is only $" + m(al, 2, L) + "$.",
        "$q_\\beta = " + a + " + " + m(be, 2, L) + "\\cdot " + w + " = " + m(qb, 2, L) + "$; $\\tilde q = " + m(qs, 2, L) + "$; $C(q_\\beta) = " + m(C(qb), 2, L) + "$ e $C(\\tilde q) = " + m(C(qs), 2, L) + "$, quindi il livello di servizio costa $" + m(ex, 2, L) + "$ in più a ciclo rispetto all'ottimo economico, il cui livello di servizio è solo $" + m(al, 2, L) + "$.");
      return chiudi(rng, testo, o(qb, ex), [o(qb, exs), o(qb2, ex), o(qb, C(qb)), o(qb2, C(qb2) - C(qs))], sp,
        { a: a, b: b, cu: cu, co: co, beta: be });
    }
  });
  /* ===================== generatori aggiunti (7 novembre 2026): equilibrio fra capitoli (meno ripetizioni) ===================== */

  gen({
    id: "orl-g-sv-rc-soglia", livello: "facile", capitolo: "solver",
    link: link("solver-lp/#43-reduced-costs-rc-why-is-this-variable-at-zero", "solver-lp/#43-costi-ridotti-rc-perche-questa-variabile-e-a-zero"),
    prova: function (rng, L) {
      var a1 = ri(rng, 1, 3), a2 = ri(rng, 1, 3), c1 = ri(rng, 2, 9) * a1, D = 10 * ri(rng, 3, 12);
      var pi = c1 / a1, c2 = a2 * pi + ri(rng, 1, 8), rc = c2 - a2 * pi, thr = a2 * pi;
      function o(r, t) { return "`RC` $= " + m(r, 2, L) + "$, " + T(L, "threshold", "soglia") + " $" + m(t, 2, L) + "$"; }
      function k(a) { return a === 1 ? "" : String(a); }
      var testo = T(L,
        "gurobipy, minimization LP: $\\min\\ " + c1 + "x_1 + " + c2 + "x_2$ subject to $" + k(a1) + "x_1 + " + k(a2) + "x_2 \\ge " + D + "$, $x_1, x_2 \\ge 0$. At the optimum $x_2 = 0$. What are its reduced cost (attribute `x2.RC`, $c_2$ minus the value of the resources it uses at the shadow prices) and the cost threshold `SAObjLow` below which $x_2$ becomes worth using?",
        "gurobipy, LP di minimo: $\\min\\ " + c1 + "x_1 + " + c2 + "x_2$ soggetto a $" + k(a1) + "x_1 + " + k(a2) + "x_2 \\ge " + D + "$, $x_1, x_2 \\ge 0$. All'ottimo $x_2 = 0$. Quanto valgono il suo costo ridotto (attributo `x2.RC`, $c_2$ meno il valore delle risorse che usa ai prezzi ombra) e la soglia di costo `SAObjLow` sotto la quale conviene usare $x_2$?");
      var sp = T(L,
        "Only $x_1$ is used, so the shadow price of the constraint is $c_1/a_1 = " + m(pi, 2, L) + "$; $x_2$ uses $" + a2 + "$ units, worth $" + m(thr, 2, L) + "$: `RC` $= " + c2 + " - " + m(thr, 2, L) + " = " + m(rc, 2, L) + " \\ge 0$ (a variable at its lower bound in a minimum). It becomes worth using when its cost falls to $" + m(thr, 2, L) + "$.",
        "Si usa solo $x_1$, quindi il prezzo ombra del vincolo è $c_1/a_1 = " + m(pi, 2, L) + "$; $x_2$ usa $" + a2 + "$ unità, che valgono $" + m(thr, 2, L) + "$: `RC` $= " + c2 + " - " + m(thr, 2, L) + " = " + m(rc, 2, L) + " \\ge 0$ (una variabile al limite inferiore in un minimo). Conviene usarla quando il suo costo scende a $" + m(thr, 2, L) + "$.");
      return chiudi(rng, testo, o(rc, thr), [o(-rc, thr), o(rc, c2 + rc), o(c2 - pi, pi), o(rc, c2)], sp,
        { c: [c1, c2], a: [a1, a2], D: D });
    }
  });

  gen({
    id: "orl-g-sv-pi-capacita", livello: "facile", capitolo: "solver",
    link: link("solver-lp/#43-bis-the-general-case-signs-and-reading", "solver-lp/#43-bis-il-caso-generale-segni-e-lettura"),
    prova: function (rng, L) {
      var c1 = ri(rng, 2, 8), c2 = c1 + ri(rng, 2, 9), u = 10 * ri(rng, 2, 8), D = u + 10 * ri(rng, 1, 6);
      var dlt = ri(rng, 1, 9) * pk(rng, [-1, 1]);
      if (u + dlt <= 0 || u + dlt >= D) return null;
      var z = c1 * u + c2 * (D - u), pcap = c1 - c2, nz = z + pcap * dlt;
      function o(v) { return "$\\tilde z = " + v + "$"; }
      var testo = T(L,
        "gurobipy, minimization LP: $\\min\\ " + c1 + "x_1 + " + c2 + "x_2$ subject to demand $x_1 + x_2 \\ge " + D + "$ and capacity of the cheap source $x_1 \\le " + u + "$, $x \\ge 0$. Output: optimal cost $" + z + "$; demand constraint `Pi` $= " + c2 + "$; capacity constraint `Pi` $= " + pcap + "$, `SARHS` $= [0, " + D + "]$. What is the optimal cost if the capacity becomes $" + (u + dlt) + "$?",
        "gurobipy, LP di minimo: $\\min\\ " + c1 + "x_1 + " + c2 + "x_2$ soggetto a domanda $x_1 + x_2 \\ge " + D + "$ e capacità della fonte economica $x_1 \\le " + u + "$, $x \\ge 0$. Output: costo ottimo $" + z + "$; vincolo di domanda `Pi` $= " + c2 + "$; vincolo di capacità `Pi` $= " + pcap + "$, `SARHS` $= [0, " + D + "]$. Quanto vale il costo ottimo se la capacità diventa $" + (u + dlt) + "$?");
      var sp = T(L,
        "`Pi` $= \\partial\\tilde z/\\partial b$: a $\\le$ capacity in a minimum has `Pi` $\\le 0$, each unit saves $" + (-pcap) + "$ (the cheap source replaces the expensive one). The new value is inside `SARHS`, so $" + z + " + (" + pcap + ")\\cdot(" + dlt + ") = " + nz + "$.",
        "`Pi` $= \\partial\\tilde z/\\partial b$: una capacità $\\le$ in un minimo ha `Pi` $\\le 0$, ogni unità fa risparmiare $" + (-pcap) + "$ (la fonte economica sostituisce quella cara). Il nuovo valore è dentro `SARHS`, quindi $" + z + " + (" + pcap + ")\\cdot(" + dlt + ") = " + nz + "$.");
      return chiudi(rng, testo, o(nz), [o(z - pcap * dlt), o(z + c2 * dlt), o(z + c1 * dlt), o(z)], sp,
        { c: [c1, c2], u: u, D: D, nu: u + dlt });
    }
  });

  gen({
    id: "orl-g-sv-rhs-costante", livello: "facile", capitolo: "solver",
    link: link("solver-lp/#43-bis-the-general-case-signs-and-reading", "solver-lp/#43-bis-il-caso-generale-segni-e-lettura"),
    prova: function (rng, L) {
      var base = ri(rng, 10, 60), C = base + 10 * ri(rng, 2, 10), C2 = C + 5 * ri(rng, 1, 6) * pk(rng, [-1, 1]);
      if (C2 <= base) return null;
      function o(r, s) { return "`constr.RHS` $= " + r + "$, " + T(L, "to set", "da impostare") + " $" + s + "$"; }
      var testo = T(L,
        "In gurobipy the meter constraint of an EV-charging model is written `constr = m.addConstr(quicksum(x[v,t] for v in V) + base[t] <= C)`, with the constant `base[t] = " + base + "` (base load, kW) and `C = " + C + "` (meter limit). What value does Gurobi store in `constr.RHS`, and which value must be assigned to `constr.RHS` to study a meter limit of $" + C2 + "$ kW?",
        "In gurobipy il vincolo del contatore di un modello di ricarica EV si scrive `constr = m.addConstr(quicksum(x[v,t] for v in V) + base[t] <= C)`, con la costante `base[t] = " + base + "` (carico di base, kW) e `C = " + C + "` (limite del contatore). Quale valore memorizza Gurobi in `constr.RHS`, e quale valore va assegnato a `constr.RHS` per studiare un limite di $" + C2 + "$ kW?");
      var sp = T(L,
        "Gurobi moves the constant to the right-hand side: `RHS` $= " + C + " - " + base + " = " + (C - base) + "$. Writing `constr.RHS = " + C2 + "` would impose $\\sum_v x_{vt} \\le " + C2 + "$, another constraint; the correct assignment is $" + C2 + " - " + base + " = " + (C2 - base) + "$.",
        "Gurobi sposta la costante nel termine noto: `RHS` $= " + C + " - " + base + " = " + (C - base) + "$. Scrivere `constr.RHS = " + C2 + "` imporrebbe $\\sum_v x_{vt} \\le " + C2 + "$, un altro vincolo; l'assegnazione corretta è $" + C2 + " - " + base + " = " + (C2 - base) + "$.");
      return chiudi(rng, testo, o(C - base, C2 - base), [o(C, C2), o(C - base, C2), o(C + base, C2 + base), o(C, C2 - base)], sp,
        { base: base, C: C, C2: C2 });
    }
  });

  gen({
    id: "orl-g-sv-perturbazione-nl", livello: "facile", capitolo: "solver",
    link: link("solver-nonlinear/#the-multipliers-in-nonlinear-models", "solver-non-lineare/#i-moltiplicatori-nei-modelli-non-lineari"),
    prova: function (rng, L) {
      var a = 10 * ri(rng, 2, 9), k = pk(rng, [0.1, 0.2, 0.5, 1]), b = ri(rng, 2, 20), eps = 0.1;
      var z1 = a * Math.log(1 + k * b), z2 = a * Math.log(1 + k * (b + eps));
      var z1r = Math.round(z1 * 1e4) / 1e4, z2r = Math.round(z2 * 1e4) / 1e4;
      var est = (z2r - z1r) / eps, der = a * k / (1 + k * b);
      if (quasiMezzo(est, 2) || quasiMezzo(z2r - z1r, 2) || Math.abs(est - der) < 0.01) return null;
      function o(v) { return "$\\approx " + m(v, 2, L) + "$"; }
      var testo = T(L,
        "A gurobipy model maximizes $" + a + "\\log(1 + " + m(k, 1, L) + "x)$ subject to $0 \\le x \\le b$, with the logarithm written through `addGenConstrLog`, so the solver returns no dual for the bound $x \\le b$. Solving with $b = " + b + "$ gives $" + m(z1r, 4, L) + "$; with $b = " + m(b + eps, 1, L) + "$ it gives $" + m(z2r, 4, L) + "$. What is the perturbation estimate of the multiplier of $x \\le b$?",
        "Un modello gurobipy massimizza $" + a + "\\log(1 + " + m(k, 1, L) + "x)$ soggetto a $0 \\le x \\le b$, con il logaritmo scritto tramite `addGenConstrLog`, quindi il solver non restituisce il duale del limite $x \\le b$. Risolvendo con $b = " + b + "$ si ottiene $" + m(z1r, 4, L) + "$; con $b = " + m(b + eps, 1, L) + "$ si ottiene $" + m(z2r, 4, L) + "$. Qual è la stima per perturbazione del moltiplicatore di $x \\le b$?");
      var sp = T(L,
        "Incremental ratio: $(" + m(z2r, 4, L) + " - " + m(z1r, 4, L) + ")/0.1 = " + m(est, 2, L) + "$, close to the exact derivative $" + a + "\\cdot " + m(k, 1, L) + "/(1 + " + m(k, 1, L) + "\\cdot " + b + ") = " + m(der, 2, L) + "$ (the difference is the curvature). Forgetting to divide by $0.1$ is the typical slip.",
        "Rapporto incrementale: $(" + m(z2r, 4, L) + " - " + m(z1r, 4, L) + ")/0{,}1 = " + m(est, 2, L) + "$, vicino alla derivata esatta $" + a + "\\cdot " + m(k, 1, L) + "/(1 + " + m(k, 1, L) + "\\cdot " + b + ") = " + m(der, 2, L) + "$ (la differenza è la curvatura). Dimenticare di dividere per $0{,}1$ è la svista tipica.");
      return chiudi(rng, testo, o(est), [o(z2r - z1r), o(z1r / b), o(10 * est)], sp,
        { a: a, k: k, b: b, z1: z1r, z2: z2r });
    }
  });

  gen({
    id: "orl-g-reg-obiettivo-retta", livello: "facile", capitolo: "regression",
    link: link("regression/#the-model", "regressione/#il-modello"),
    prova: function (rng, L) {
      var w = ri(rng, -5, 5), b = 10 * ri(rng, 5, 15), tau = pk(rng, [0.25, 0.5, 0.75, 0.9]);
      if (w === 0) return null;
      var xs = [ri(rng, 0, 4), ri(rng, 5, 9), ri(rng, 10, 14), ri(rng, 15, 20)];
      var r = xs.map(function () { return ri(rng, -12, 12); });
      var ys = xs.map(function (x, i) { return w * x + b + r[i]; });
      var U = 0, V = 0;
      r.forEach(function (e) { if (e > 0) U += e; else V -= e; });
      if (U === 0 || V === 0) return null;
      var z = tau * U + (1 - tau) * V, zs = (1 - tau) * U + tau * V, za = U + V;
      if (Math.abs(z - zs) < 0.01) return null;
      function o(u, v, zz) { return "$\\sum u_i = " + u + "$, $\\sum v_i = " + v + "$, " + T(L, "value", "valore") + " $" + m(zz, 2, L) + "$"; }
      var pts = xs.map(function (x, i) { return "(" + x + "; " + ys[i] + ")"; }).join(", ");
      var testo = T(L,
        "Quantile regression LP with one feature: $\\min\\sum_i[\\tau u_i + (1 - \\tau)v_i]$ with $wx_i + b + u_i - v_i = y_i$, $u_i, v_i \\ge 0$ ($u_i$: observation above the line, $v_i$: below). For the candidate line $w = " + w + "$, $b = " + b + "$ (not necessarily optimal), $\\tau = " + m(tau, 2, L) + "$ and the observations $(x_i; y_i)$ " + pts + ", what are $\\sum_iu_i$, $\\sum_iv_i$ and the objective value?",
        "LP di regressione quantile con una caratteristica: $\\min\\sum_i[\\tau u_i + (1 - \\tau)v_i]$ con $wx_i + b + u_i - v_i = y_i$, $u_i, v_i \\ge 0$ ($u_i$: osservazione sopra la retta, $v_i$: sotto). Per la retta candidata $w = " + w + "$, $b = " + b + "$ (non necessariamente ottima), $\\tau = " + m(tau, 2, L) + "$ e le osservazioni $(x_i; y_i)$ " + pts + ", quanto valgono $\\sum_iu_i$, $\\sum_iv_i$ e il valore dell'obiettivo?");
      var sp = T(L,
        "Residuals $y_i - (wx_i + b)$: $" + r.join("$, $") + "$; positive parts sum to $" + U + "$ (the $u_i$), negative parts to $" + V + "$ (the $v_i$). Value $" + m(tau, 2, L) + "\\cdot " + U + " + " + m(1 - tau, 2, L) + "\\cdot " + V + " = " + m(z, 2, L) + "$; swapping the weights of the two sides is the typical mistake.",
        "Residui $y_i - (wx_i + b)$: $" + r.join("$, $") + "$; le parti positive sommano $" + U + "$ (gli $u_i$), quelle negative $" + V + "$ (i $v_i$). Valore $" + m(tau, 2, L) + "\\cdot " + U + " + " + m(1 - tau, 2, L) + "\\cdot " + V + " = " + m(z, 2, L) + "$; scambiare i pesi dei due lati è l'errore tipico.");
      return chiudi(rng, testo, o(U, V, z), [o(U, V, zs), o(V, U, z), o(U, V, za), o(V, U, zs)], sp,
        { w: w, b: b, tau: tau, xs: xs, ys: ys });
    }
  });

  gen({
    id: "orl-g-reg-scorta", livello: "facile", capitolo: "regression",
    link: link("regression/#quantile-regression-and-safety-stock", "regressione/#regressione-quantile-e-scorta-di-sicurezza"),
    prova: function (rng, L) {
      var t = ri(rng, 10, 32), pr = pk(rng, [2.5, 3, 3.5]), we = pk(rng, [0, 1]);
      var A = [270 + ri(rng, -5, 5), -(3.5 + ri(rng, 0, 6) / 10), -(22 + ri(rng, 0, 4)), 28 + ri(rng, 0, 6)];
      var B = [A[0] + ri(rng, 6, 14), A[1] - ri(rng, -2, 2) / 10, A[2] - ri(rng, 0, 3), A[3] + ri(rng, 0, 4)];
      function prev(c) { return c[0] + c[1] * t + c[2] * pr + c[3] * we; }
      var med = prev(A), qu = prev(B), ss = qu - med;
      if (ss <= 0.5 || quasiMezzo(med, 1) || quasiMezzo(qu, 1) || quasiMezzo(ss, 1)) return null;
      function o(x, y) { return T(L, "produce $", "produrre $") + m(x, 1, L) + T(L, "$, safety stock $", "$, scorta di sicurezza $") + m(y, 1, L) + "$"; }
      function f(c) { return m(c[0], 2, L) + " " + (c[1] < 0 ? "-" : "+") + " " + m(Math.abs(c[1]), 2, L) + "\\,t " + (c[2] < 0 ? "-" : "+") + " " + m(Math.abs(c[2]), 2, L) + "\\,p + " + m(c[3], 2, L) + "\\,e"; }
      var testo = T(L,
        "A bakery forecasts daily demand from temperature $t$ (°C), price $p$ (€) and weekend indicator $e \\in \\{0, 1\\}$ with quantile regression. Median model ($\\tau = 0.5$): $" + f(A) + "$; model at the critical fractile $\\tau = 9/13$ (the newsvendor quantile): $" + f(B) + "$. For a day with $t = " + t + "$, $p = " + m(pr, 1, L) + "$, $e = " + we + "$, how much should be produced, and what is the safety stock?",
        "Una panetteria prevede la domanda giornaliera da temperatura $t$ (°C), prezzo $p$ (€) e indicatore di weekend $e \\in \\{0, 1\\}$ con la regressione quantile. Modello mediano ($\\tau = 0{,}5$): $" + f(A) + "$; modello al frattile critico $\\tau = 9/13$ (il quantile del newsvendor): $" + f(B) + "$. Per un giorno con $t = " + t + "$, $p = " + m(pr, 1, L) + "$, $e = " + we + "$, quanto conviene produrre, e qual è la scorta di sicurezza?");
      var sp = T(L,
        "One produces the forecast at the critical fractile, $" + m(qu, 1, L) + "$; the median forecast is $" + m(med, 1, L) + "$, and their difference, $" + m(ss, 1, L) + "$, is the safety stock, obtained with no assumption on the distribution of demand.",
        "Si produce la previsione al frattile critico, $" + m(qu, 1, L) + "$; la previsione mediana è $" + m(med, 1, L) + "$, e la loro differenza, $" + m(ss, 1, L) + "$, è la scorta di sicurezza, ottenuta senza ipotesi sulla distribuzione della domanda.");
      return chiudi(rng, testo, o(qu, ss), [o(med, ss), o(qu, qu), o(med + 2 * ss, ss), o(qu, med)], sp,
        { A: A, B: B, t: t, p: pr, e: we });
    }
  });

  gen({
    id: "orl-g-kkt-proiezione", livello: "media", capitolo: "background",
    link: link("theory-nonlinear/#the-nonlinear-optimality-conditions-the-kkt-conditions",
               "teoria-non-lineare/#le-condizioni-di-ottimalita-non-lineari-le-kkt"),
    prova: function (rng, L) {
      var a = ri(rng, 1, 6), b = ri(rng, 1, 6), c = ri(rng, 2, 8);
      if (a + b <= c) return null;
      // proiezione sulla retta x + y = c
      var t = (a + b - c) / 2, x = a - t, y = b - t, lam = 2 * t;
      if (x <= 0.2 || y <= 0.2) return null;
      var fv = 2 * t * t;
      if (quasiMezzo(x, 2) || quasiMezzo(y, 2) || quasiMezzo(lam, 2) || quasiMezzo(fv, 2)) return null;
      function o(u, v, l) { return "$(" + m(u, 2, L) + "; " + m(v, 2, L) + ")$, $\\lambda = " + m(l, 2, L) + "$"; }
      var testo = T(L,
        "Convex QP: $\\min\\ (x - " + a + ")^2 + (y - " + b + ")^2$ subject to $x + y \\le " + c + "$, $x, y \\ge 0$; $\\lambda \\ge 0$ is the KKT multiplier of $x + y \\le " + c + "$ (Lagrangian $L = f + \\lambda(x + y - " + c + ")$). What are the optimum and $\\lambda$?",
        "QP convesso: $\\min\\ (x - " + a + ")^2 + (y - " + b + ")^2$ soggetto a $x + y \\le " + c + "$, $x, y \\ge 0$; $\\lambda \\ge 0$ è il moltiplicatore KKT di $x + y \\le " + c + "$ (Lagrangiana $L = f + \\lambda(x + y - " + c + ")$). Quanto valgono l'ottimo e $\\lambda$?");
      var sp = T(L,
        "The free minimum $(" + a + ", " + b + ")$ violates $x + y \\le " + c + "$, so the constraint is active. Stationarity: $2(x - " + a + ") + \\lambda = 0$, $2(y - " + b + ") + \\lambda = 0$, so $x = " + a + " - \\lambda/2$, $y = " + b + " - \\lambda/2$; with $x + y = " + c + "$: $\\lambda = " + m(lam, 2, L) + "$, optimum $(" + m(x, 2, L) + "; " + m(y, 2, L) + ")$, both positive (bounds inactive). Convex problem: the KKT point is the global optimum.",
        "Il minimo libero $(" + a + ", " + b + ")$ viola $x + y \\le " + c + "$, quindi il vincolo è attivo. Stazionarietà: $2(x - " + a + ") + \\lambda = 0$, $2(y - " + b + ") + \\lambda = 0$, quindi $x = " + a + " - \\lambda/2$, $y = " + b + " - \\lambda/2$; con $x + y = " + c + "$: $\\lambda = " + m(lam, 2, L) + "$, ottimo $(" + m(x, 2, L) + "; " + m(y, 2, L) + ")$, entrambe positive (limiti inattivi). Problema convesso: il punto KKT è l'ottimo globale.");
      return chiudi(rng, testo, o(x, y, lam), [o(x, y, t), o(a, b, 0), o(y, x, lam), o(x, y, 2 * lam)], sp,
        { a: a, b: b, c: c });
    }
  });
  /* ===================== generatori aggiunti (7 novembre 2026): parte «Modelli deterministici» ===================== */

  gen({
    id: "orl-g-mk-due-titoli-r", livello: "complessa", capitolo: "markowitz",
    link: link("markowitz/#model", "markowitz/#modello"),
    prova: function (rng, L) {
      var mu1 = ri(rng, 10, 20), mu2 = ri(rng, 3, 8), s1 = ri(rng, 15, 30), s2 = ri(rng, 8, 14), rho = pk(rng, [-0.2, 0, 0.2, 0.4]);
      var v1 = s1 * s1 / 1e4, v2 = s2 * s2 / 1e4, cv = rho * s1 * s2 / 1e4;
      var xmv = (v2 - cv) / (v1 + v2 - 2 * cv);
      if (xmv <= 0.05 || xmv >= 0.95) return null;
      var rmv = xmv * mu1 + (1 - xmv) * mu2;
      var rb = pk(rng, [Math.round(rmv) - 2, Math.round(rmv) + 1, Math.round(rmv) + 2, Math.round(rmv) + 3]);
      if (rb >= mu1 || rb <= mu2 || Math.abs(rb - rmv) < 0.3) return null;
      var xr = (rb - mu2) / (mu1 - mu2);
      var x1 = rb <= rmv ? xmv : xr;
      function vol(x) { return 100 * Math.sqrt(x * x * v1 + (1 - x) * (1 - x) * v2 + 2 * x * (1 - x) * cv); }
      function vol0(x) { return 100 * Math.sqrt(x * x * v1 + (1 - x) * (1 - x) * v2); }
      var alt = rb <= rmv ? xr : xmv;
      var vals = [x1, vol(x1), alt, vol(alt), vol0(x1)];
      for (var i = 0; i < vals.length; i++) if (quasiMezzo(100 * vals[i], 1) || quasiMezzo(vals[i], 2)) return null;
      function o(x, s) { return "$x_1 = " + m(100 * x, 1, L) + "\\%$, " + T(L, "volatility", "volatilità") + " $" + m(s, 2, L) + "\\%$"; }
      var testo = T(L,
        "Markowitz with two assets: expected returns $\\mu_1 = " + mu1 + "\\%$, $\\mu_2 = " + mu2 + "\\%$; volatilities $\\sigma_1 = " + s1 + "\\%$, $\\sigma_2 = " + s2 + "\\%$; correlation $\\rho = " + m(rho, 1, L) + "$. Minimize the portfolio variance $x_1^2\\sigma_1^2 + x_2^2\\sigma_2^2 + 2x_1x_2\\rho\\sigma_1\\sigma_2$ with $x_1 + x_2 = 1$, $x \\ge 0$ and expected return at least $\\bar r = " + rb + "\\%$. What are the optimal share $x_1$ and the portfolio volatility?",
        "Markowitz con due titoli: rendimenti attesi $\\mu_1 = " + mu1 + "\\%$, $\\mu_2 = " + mu2 + "\\%$; volatilità $\\sigma_1 = " + s1 + "\\%$, $\\sigma_2 = " + s2 + "\\%$; correlazione $\\rho = " + m(rho, 1, L) + "$. Si minimizza la varianza del portafoglio $x_1^2\\sigma_1^2 + x_2^2\\sigma_2^2 + 2x_1x_2\\rho\\sigma_1\\sigma_2$ con $x_1 + x_2 = 1$, $x \\ge 0$ e rendimento atteso almeno $\\bar r = " + rb + "\\%$. Quanto valgono la quota ottima $x_1$ e la volatilità del portafoglio?");
      var sp = T(L,
        "Minimum-variance share without the return constraint: $x_1 = (\\sigma_2^2 - \\rho\\sigma_1\\sigma_2)/(\\sigma_1^2 + \\sigma_2^2 - 2\\rho\\sigma_1\\sigma_2) = " + m(100 * xmv, 1, L) + "\\%$, with return $" + m(rmv, 2, L) + "\\%$. " + (rb <= rmv ? "It already meets $\\bar r$: the return constraint is inactive (zero multiplier)." : "It is below $\\bar r$, so the constraint binds: $x_1\\mu_1 + (1 - x_1)\\mu_2 = \\bar r$ gives $x_1 = " + m(100 * xr, 1, L) + "\\%$.") + " Volatility $" + m(vol(x1), 2, L) + "\\%$.",
        "Quota di minima varianza senza il vincolo di rendimento: $x_1 = (\\sigma_2^2 - \\rho\\sigma_1\\sigma_2)/(\\sigma_1^2 + \\sigma_2^2 - 2\\rho\\sigma_1\\sigma_2) = " + m(100 * xmv, 1, L) + "\\%$, con rendimento $" + m(rmv, 2, L) + "\\%$. " + (rb <= rmv ? "Rispetta già $\\bar r$: il vincolo di rendimento è inattivo (moltiplicatore nullo)." : "È sotto $\\bar r$, quindi il vincolo morde: $x_1\\mu_1 + (1 - x_1)\\mu_2 = \\bar r$ dà $x_1 = " + m(100 * xr, 1, L) + "\\%$.") + " Volatilità $" + m(vol(x1), 2, L) + "\\%$.");
      var cand = [o(alt, vol(alt)), o(x1, vol0(x1)), o(x1, x1 * s1 + (1 - x1) * s2), o(1 - x1, vol(1 - x1))];
      return chiudi(rng, testo, o(x1, vol(x1)), cand, sp,
        { mu: [mu1, mu2], s: [s1, s2], rho: rho, rb: rb });
    }
  });

  gen({
    id: "orl-g-code-robusto", livello: "complessa", capitolo: "queues",
    link: link("queues/#the-price-of-a-service-promise", "code/#il-prezzo-di-una-promessa-di-servizio"),
    prova: function (rng, L) {
      var lo = ri(rng, 20, 40), hi = lo + ri(rng, 6, 15), c = ri(rng, 1, 5), h = pk(rng, [1, 1.5, 2, 3]);
      var l0 = (lo + hi) / 2;
      function mu(l) { return l + Math.sqrt(h * l / c); }
      function C(m_, l) { return c * m_ + h * l / (m_ - l); }
      var mr = mu(hi), cw = C(mr, hi), cn = C(mu(l0), l0), pr = 100 * (cw / cn - 1);
      var mm = mu(l0), cm = C(mm, l0);
      var vals = [mr, cw, pr, mm];
      for (var i = 0; i < vals.length; i++) if (quasiMezzo(vals[i], 2)) return null;
      function o(a, b, p) { return "$\\mu = " + m(a, 2, L) + "$, " + T(L, "worst-case cost", "costo nel caso peggiore") + " $" + m(b, 2, L) + "$, " + T(L, "premium", "premio") + " $" + m(p, 1, L) + "\\%$"; }
      var testo = T(L,
        "M/M/1 capacity model: choose the capacity $\\mu$ to minimize $C(\\mu, \\lambda) = c\\mu + h\\lambda/(\\mu - \\lambda)$, with $c = " + c + "$ € per unit of capacity and $h = " + m(h, 1, L) + "$ €/h per customer in the system. The arrival rate is uncertain, $\\lambda \\in [" + lo + ", " + hi + "]$ per hour, nominal value $" + m(l0, 1, L) + "$. One sizes $\\mu$ to minimize the worst-case cost over the interval. What are the robust $\\mu$, its worst-case cost and its premium over the nominal optimal cost $C(\\tilde\\mu(" + m(l0, 1, L) + "), " + m(l0, 1, L) + ")$?",
        "Modello di capacità M/M/1: si sceglie la capacità $\\mu$ per minimizzare $C(\\mu, \\lambda) = c\\mu + h\\lambda/(\\mu - \\lambda)$, con $c = " + c + "$ € per unità di capacità e $h = " + m(h, 1, L) + "$ €/h per cliente nel sistema. Il tasso di arrivo è incerto, $\\lambda \\in [" + lo + ", " + hi + "]$ all'ora, valore nominale $" + m(l0, 1, L) + "$. Si dimensiona $\\mu$ minimizzando il costo nel caso peggiore sull'intervallo. Quanto valgono il $\\mu$ robusto, il suo costo nel caso peggiore e il premio rispetto al costo ottimo nominale $C(\\tilde\\mu(" + m(l0, 1, L) + "), " + m(l0, 1, L) + ")$?");
      var sp = T(L,
        "For fixed $\\mu$ the cost grows with $\\lambda$, so the worst case is $\\lambda = " + hi + "$: $\\mu_{\\rm rob} = " + hi + " + \\sqrt{h\\cdot " + hi + "/c} = " + m(mr, 2, L) + "$, worst-case cost $" + m(cw, 2, L) + "$. The nominal optimum costs $" + m(cn, 2, L) + "$: the insurance premium is $" + m(pr, 1, L) + "\\%$. Sizing on the nominal $\\tilde\\mu = " + m(mm, 2, L) + " < " + hi + "$ would make the queue unstable at the top of the interval.",
        "A $\\mu$ fissato il costo cresce con $\\lambda$, quindi il caso peggiore è $\\lambda = " + hi + "$: $\\mu_{\\rm rob} = " + hi + " + \\sqrt{h\\cdot " + hi + "/c} = " + m(mr, 2, L) + "$, costo nel caso peggiore $" + m(cw, 2, L) + "$. L'ottimo nominale costa $" + m(cn, 2, L) + "$: il premio assicurativo è del $" + m(pr, 1, L) + "\\%$. Dimensionare sul $\\tilde\\mu = " + m(mm, 2, L) + " < " + hi + "$ nominale renderebbe instabile la coda in cima all'intervallo.");
      var ml = mu(lo), cl = C(ml, lo);
      return chiudi(rng, testo, o(mr, cw, pr), [o(mm, cm, 0), o(mr, C(mr, l0), 100 * (C(mr, l0) / cn - 1)), o(hi + h * hi / c, C(hi + h * hi / c, hi), 100 * (C(hi + h * hi / c, hi) / cn - 1)), o(ml, cl, 100 * (cl / cn - 1))], sp,
        { lo: lo, hi: hi, c: c, h: h });
    }
  });
})();
