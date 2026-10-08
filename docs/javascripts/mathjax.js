window.MathJax = {
  tex: { inlineMath: [["\\(", "\\)"], ["$", "$"]],
         displayMath: [["\\[", "\\]"], ["$$", "$$"]],
         processEscapes: true },
  options: { ignoreHtmlClass: ".*|", processHtmlClass: "arithmatex" }
};

// --- Composizione delle formule (comune a tutti i siti della collana) --------
// Con la navigazione istantanea di Material la pagina cambia senza ricaricarsi:
// le formule della nuova pagina vanno composte di nuovo. MathJax però non regge
// due composizioni sovrapposte (cambio di pagina, grafici e strumenti che si
// aggiornano): si rovinano a vicenda e lasciano formule come testo TeX, che
// tornavano solo ricaricando la pagina. Qui ogni composizione aspetta la fine
// della precedente, in coda su MathJax.startup.promise.
(function () {
  var pronto = false, primaPagina = true;
  window.MathJax.startup = Object.assign({}, window.MathJax.startup, {
    ready: function () {
      MathJax.startup.defaultReady();   // la prima pagina la compone MathJax all'avvio
      pronto = true;
    }
  });
  /** compone le formule di alcuni elementi (nodi) o, senza argomenti, della pagina */
  window.componiFormule = function (nodi) {
    if (!pronto) {
      return new Promise(function (ok) { setTimeout(function () { ok(window.componiFormule(nodi)); }, 100); });
    }
    MathJax.startup.promise = MathJax.startup.promise
      .then(function () {
        if (nodi) {
          MathJax.typesetClear(nodi);
          return MathJax.typesetPromise(nodi);
        }
        MathJax.startup.output.clearCache();
        MathJax.typesetClear();
        MathJax.texReset();
        return MathJax.typesetPromise();
      })
      .catch(function (e) { console.warn("MathJax:", e); });
    return MathJax.startup.promise;
  };
  document$.subscribe(function () {
    // formule nei titoli: anche l'indice laterale va composto
    var nav = [];
    document.querySelectorAll(".md-nav .md-ellipsis, .md-nav__link").forEach(function (el) {
      if (el.textContent.indexOf("\\(") >= 0 && !el.classList.contains("arithmatex")) {
        el.classList.add("arithmatex");
        nav.push(el);
      }
    });
    if (primaPagina) {
      primaPagina = false;
      if (nav.length) window.componiFormule(nav);
      return;
    }
    window.componiFormule();
  });
})();
