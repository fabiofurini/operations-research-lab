# Operations Research Lab

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

<div class="grid cards" markdown>

-   :material-hammer-wrench: **Getting started**

    ---

    How a model is built, how it is run, how to read the solution,
    the shadow prices and the reduced costs.

    [:octicons-arrow-right-24: LP theory](theory-lp.md) ·
    [Nonlinear theory](theory-nonlinear.md) ·
    [Solver, linear models](solver-lp.md) ·
    [Solver, nonlinear](solver-nonlinear.md)

-   :material-factory: **Planning production**

    ---

    Multi-period LP with inventory: the solver discovers the pre-build and the duals tell
    how much an hour of capacity is worth.

    [:octicons-arrow-right-24: Production and inventory](production.md)

-   :material-truck-delivery: **Moving the flows**

    ---

    Minimum-cost flow, convex congestion and cost-emissions frontier with the
    internal price of CO₂.

    [:octicons-arrow-right-24: Supply chain](supplychain.md)

-   :material-chart-line: **Investing**

    ---

    The most famous QP in history: efficient frontier, diversification and
    fragility of the estimates.

    [:octicons-arrow-right-24: Markowitz](markowitz.md)

-   :material-currency-eur: **Setting prices**

    ---

    Endogenous demand, bilinear objective, corner optima and the true value of one
    extra seat.

    [:octicons-arrow-right-24: Pricing](pricing.md) ·
    [Advertising budget](budget.md)

-   :material-map-marker: **Locating and sizing**

    ---

    Efficiency against equity on the map; the utilization wall in queues;
    the smart charging of a fleet.

    [:octicons-arrow-right-24: Location](location.md) ·
    [Queues](queues.md) · [EV charging](ev-charging.md)

-   :material-dice-multiple: **Deciding before knowing**

    ---

    The quantile rule, the scenarios, the value of the stochastic solution and the
    tail risk optimized with an LP.

    [:octicons-arrow-right-24: Newsvendor](newsvendor.md) ·
    [VaR and CVaR](var-cvar.md) ·
    [Arbitrage](arbitrage.md)

-   :material-robot: **From the solver to machine learning**

    ---

    The SVM as a convex QP: margin, dual, support vectors and kernel — without
    ML libraries.

    [:octicons-arrow-right-24: Support Vector Machine](svm.md)

</div>

## Complete index

**Tools**

1. [Solver, linear models](solver-lp.md) and [nonlinear](solver-nonlinear.md) — building the model, running
   it, retrieving the solution, interpreting the output
2. [Theory: linear programming](theory-lp.md) and [nonlinear optimization](theory-nonlinear.md) — duality, shadow prices, KKT, sensitivity
   protocol

**Deterministic models**

3. [Multi-period production and inventory](production.md) — LP/QP
4. [Supply chain with congestion and CO₂](supplychain.md) — LP/NLP
5. [The Markowitz portfolio](markowitz.md) — QP
6. [Pricing and revenue management](pricing.md) — NLP
7. [Advertising budget](budget.md) — convex NLP
8. [Continuous location](location.md) — convex NLP
9. [Electric vehicle charging](ev-charging.md) — LP/QP
10. [Queues and service capacity](queues.md) — convex NLP

**Decisions under uncertainty**

11. [The Newsvendor and its variants](newsvendor.md) — stochastic LP
12. [VaR and CVaR](var-cvar.md) — scenario-based LP
13. [Arbitrage and pricing](arbitrage.md) — LP and duality that prices

**Optimization and machine learning**

13. [Support Vector Machine](svm.md) — QP

**The course**

14. [Organization of the lab](organization.md) — lab sessions, submissions,
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
