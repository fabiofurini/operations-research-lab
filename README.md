<h3 align="center">Teaching material by
<a href="https://sites.google.com/view/fabiofurini/home-page">Fabio Furini</a></h3>
<p align="center">
  Associate professor of Operations Research ·
  <a href="https://www.diag.uniroma1.it/">DIAG</a>, Sapienza University of Rome ·
  <a href="https://sites.google.com/view/fabiofurini/home-page">personal website</a>
</p>

# Operations Research Lab

> **The author.** Since September 2021 Fabio Furini has been an associate
> professor at DIAG, Sapienza University of Rome. Ph.D. in Control Engineering
> and Operations Research at the University of Bologna (2011), research fellow
> there until 2012; postdoc at Université Paris-13 (2012–2013); from 2013 to 2019
> *Maître de Conférences* at Université Paris-Dauphine. *Habilitation à Diriger
> des Recherches* in France in 2017 and Italian National Scientific
> Qualification for Full Professor in Operations Research in 2019. In 2020 CNR
> researcher at IASI-CNR in Rome.
> Personal website: <https://sites.google.com/view/fabiofurini/home-page>

Continuous optimization models for Management Engineering — the course lecture
notes in online form, with Python/Gurobi code, data and case studies.

**📖 Online lecture notes: [fabiofurini.github.io/operations-research-lab](https://fabiofurini.github.io/operations-research-lab/)**

## Download as PDF

- [Full lecture notes](https://fabiofurini.github.io/operations-research-lab/pdf/operations-research-lab-notes.pdf) (106 pages)
- [Course slides](https://fabiofurini.github.io/operations-research-lab/pdf/operations-research-lab-slides.pdf) (80 slides)

## Contents

**Tools**

- [Theory: linear programming](https://fabiofurini.github.io/operations-research-lab/theory-lp/) — duality, complementary slackness, shadow prices and sensitivity
- [Theory: nonlinear optimization](https://fabiofurini.github.io/operations-research-lab/theory-nonlinear/) — convexity, QP, KKT conditions
- [Solver: linear models](https://fabiofurini.github.io/operations-research-lab/solver-lp/) — building the model, running it, reading and interpreting the solution
- [Solver: nonlinear models](https://fabiofurini.github.io/operations-research-lab/solver-nonlinear/) — function constraints, bilinear terms, tolerances

**Deterministic models**

- [Multi-period production and inventory](https://fabiofurini.github.io/operations-research-lab/production/) — LP/QP
- [Supply chain with congestion and CO₂](https://fabiofurini.github.io/operations-research-lab/supplychain/) — LP/NLP
- [Markowitz portfolio](https://fabiofurini.github.io/operations-research-lab/markowitz/) — QP
- [Pricing and revenue management](https://fabiofurini.github.io/operations-research-lab/pricing/) — NLP
- [Advertising budget](https://fabiofurini.github.io/operations-research-lab/budget/) — convex NLP
- [Continuous location](https://fabiofurini.github.io/operations-research-lab/location/) — convex NLP
- [Electric vehicle charging](https://fabiofurini.github.io/operations-research-lab/ev-charging/) — LP/QP
- [Queues and service capacity](https://fabiofurini.github.io/operations-research-lab/queues/) — convex NLP

**Decisions under uncertainty**

- [The newsvendor and its variants](https://fabiofurini.github.io/operations-research-lab/newsvendor/) — stochastic LP
- [VaR and CVaR](https://fabiofurini.github.io/operations-research-lab/var-cvar/) — scenario LP
- [Arbitrage and pricing](https://fabiofurini.github.io/operations-research-lab/arbitrage/) — LP, the duality that prices

**Optimization and machine learning**

- [Support Vector Machine](https://fabiofurini.github.io/operations-research-lab/svm/) — QP

**The course**

- [Lab organization](https://fabiofurini.github.io/operations-research-lab/organization/) — lab sessions, deliverables, assessment

## Running the models

Every chapter has its own script in [`python/`](python/) (`lab04`–`lab15`), with the
data in [`data/`](data/):

```bash
python3 -m pip install gurobipy matplotlib pandas scipy
python3 python/run_all.py     # all models: data, results and figures
```

The `gurobipy` licence bundled with the pip package is enough for every model in
the course; the free academic licence can be activated at
[portal.gurobi.com](https://portal.gurobi.com).

## Versione italiana

The whole lab is also available in Italian:
**[fabiofurini.github.io/laboratorio-ricerca-operativa](https://fabiofurini.github.io/laboratorio-ricerca-operativa/)**
([repository](https://github.com/fabiofurini/laboratorio-ricerca-operativa)).

---

Teaching material by **[Fabio Furini](https://sites.google.com/view/fabiofurini/home-page)** — [DIAG](https://www.diag.uniroma1.it/), Sapienza University of Rome.
Course slides and exercise solutions are distributed in class.
