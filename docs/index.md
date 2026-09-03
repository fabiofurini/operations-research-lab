# Operations Research Lab

Teaching material designed and developed by **[Fabio Furini](https://sites.google.com/view/fabiofurini/home-page)**, associate
professor at [DIAG](https://www.diag.uniroma1.it/), Sapienza University of Rome.

**Continuous optimization models for Management Engineering** — the course lecture
notes in online form, with Python/Gurobi code, data and reproducible case
studies.

Every chapter starts from a concrete managerial problem — how much to produce, where
to locate a service, which price to set, how much risk to accept — turns it
into an optimization model, solves it with Gurobi called from Python and, above all,
*interrogates* it: how much is one extra hour of capacity worth? Does the solution hold if the data
change by 5%?

!!! tip "The right question"
    At the end of every lab session the question is not only *“what is the optimum?”*,
    but *“which decision do we recommend and how robust is it?”*. All the models use
    **only continuous variables**: duality, shadow prices and KKT conditions apply.

## The four parts of the lab

<div class="grid cards" markdown>

-   :material-hammer-wrench: **Tools**

    ---

    How a model is built, how it is run, how to read the solution, the shadow
    prices and the reduced costs: the theory and the solver.

    [:octicons-arrow-right-24: The four chapters](tools.md)

-   :material-factory: **Deterministic models**

    ---

    Production, supply chain, portfolio, pricing, budget, location, electric
    vehicle charging, queues: every datum is known.

    [:octicons-arrow-right-24: The eight problems](deterministic-models.md)

-   :material-dice-multiple: **Decisions under uncertainty**

    ---

    You decide before you know: the quantile rule, tail risk and the duality that
    prices financial instruments.

    [:octicons-arrow-right-24: The three problems](decisions-uncertainty.md)

-   :material-robot: **Optimization and machine learning**

    ---

    The SVM as a convex QP: margin, dual, support vectors and kernel — without ML
    libraries.

    [:octicons-arrow-right-24: The problem](optimization-ml.md)

</div>

## Complete index

**[Tools](tools.md)**

1. [Theory: linear programming](theory-lp.md) and [nonlinear optimization](theory-nonlinear.md) — duality,
   shadow prices, KKT, sensitivity protocol
2. [Solver, linear models](solver-lp.md) and [nonlinear](solver-nonlinear.md) — building the model, running
   it, retrieving the solution, interpreting the output

**[Deterministic models](deterministic-models.md)**

3. [Multi-period production and inventory](production.md) — LP/QP
4. [Supply chain with congestion and CO₂](supplychain.md) — LP/NLP
5. [The Markowitz portfolio](markowitz.md) — QP
6. [Pricing and revenue management](pricing.md) — NLP
7. [Advertising budget](budget.md) — convex NLP
8. [Continuous location](location.md) — convex NLP
9. [Electric vehicle charging](ev-charging.md) — LP/QP
10. [Queues and service capacity](queues.md) — convex NLP

**[Decisions under uncertainty](decisions-uncertainty.md)**

11. [The Newsvendor and its variants](newsvendor.md) — stochastic LP
12. [VaR and CVaR](var-cvar.md) — scenario-based LP
13. [Arbitrage and pricing](arbitrage.md) — LP and duality that prices

**[Optimization and machine learning](optimization-ml.md)**

14. [Support Vector Machine](svm.md) — QP

**The course**

15. [Organization of the lab](organization.md) — lab sessions, submissions,
    assessment, mistakes to avoid

## Notation and classes of models

- **LP** (*Linear Programming*): linear objective and constraints;
- **QP** (*Quadratic Programming*): quadratic objective, linear constraints;
- **NLP** (*Nonlinear Programming*): general nonlinear objective or constraints.

A problem is **convex** when every local minimum is also global: for LPs this is
always true; for QPs and NLPs it depends on the functions.

**Notation used throughout the course.** Scalars and indices in lowercase
($x_{it}$, $\lambda$); the objects of the models (products, channels, assets,
scenarios…) are **numbered** and the indices run over explicitly enumerated sets,
$i \in \{1, 2, \dots, n\}$; integer counts ($n \in \mathbb{Z}_{\ge 1}$),
rational data ($\mathbb{Q}$); vectors in lowercase bold ($\boldsymbol{x}$),
matrices in uppercase bold ($\boldsymbol{Q}$). Dual variables $\pi_i$, reduced
costs $\bar c_j$, slacks $\bar s_i$: the **bar** denotes the values of a feasible
solution, the **tilde** those of an optimal one ($\tilde x_j$, $\tilde z$). In
the models the wording is always "subject to", the variables are introduced before
the formulation and the constraints defining them close the model.

## Download as PDF

- 📘 **[Full lecture notes](pdf/operations-research-lab-notes.pdf)** — 106 pages: models, worked examples, case studies, sensitivity analysis
- 📊 **[Course slides](pdf/operations-research-lab-slides.pdf)** — 80 slides, the whole content of the notes in compact form

## Installation and licence

```bash
python3 -m pip install gurobipy
```

The pip package ships with a **demo licence** (up to 2000 variables and 2000 constraints):
enough for every model in this lab. At start-up the line
`Restricted license - for non-production use only` appears: this is normal.

**Full academic licence (free of charge):**
1. register at <https://portal.gurobi.com> with your institutional email (`@uniroma1.it`);
2. request a *Named-User Academic License*;
3. run the command `grbgetkey XXXXXXXX-...` shown by the portal (you need the university network or a VPN);
4. the licence is saved in `~/gurobi.lic` and from that moment there are no size limits.

Quick check:

```python
import gurobipy as gp
print(gp.gurobi.version())        # e.g. (13, 0, 3)
```

---

## Quick start

```bash
python3 -m pip install gurobipy matplotlib pandas scipy   # scipy: statistical functions only
python3 python/run_all.py             # regenerates data, results and figures
```

In the [repository](https://github.com/fabiofurini/operations-research-lab)
you will find all the **Python scripts** and the case study **data** in CSV format.

---

Teaching material by **[Fabio Furini](https://sites.google.com/view/fabiofurini/home-page)** —
[DIAG](https://www.diag.uniroma1.it/), Sapienza University of Rome.
