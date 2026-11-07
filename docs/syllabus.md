# Syllabus

<!-- collana-dalla-fascia -->
Every chapter starts from a concrete managerial problem — how much to produce, where
to locate a service, which price to set, how much risk to accept — turns it
into an optimization model, solves it with Gurobi called from Python and, above all,
*interrogates* it: how much is one extra hour of capacity worth? Does the solution hold if the data
change by 5%?

Every model can be run **right away in the browser**: each chapter has its own
[notebook that opens in Colab](notebooks.md), with nothing to install.

!!! tip "The right question"
    At the end of every lab session the question is not only *“what is the optimum?”*,
    but *“which decision do we recommend and how robust is it?”*. All the decision
    variables are **continuous**; depending on the class of the model we read the
    solution through LP/QP duality, shadow prices or the KKT conditions.
<!-- /collana-dalla-fascia -->

The complete list of the chapters of the lab, in the order in which they are
covered. Every chapter has its own page, its own Python script and its own
[notebook that opens in Colab](notebooks.md).

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
11. [Data Envelopment Analysis](dea.md) — LP and duality

**[Decisions under uncertainty](decisions-uncertainty.md)**

12. [The Newsvendor and its variants](newsvendor.md) — stochastic LP
13. [VaR and CVaR](var-cvar.md) — scenario-based LP
14. [Arbitrage and pricing](arbitrage.md) — LP and duality that prices

**[Optimization and machine learning](optimization-ml.md)**

15. [Support Vector Machine](svm.md) — QP
16. [Robust and quantile regression](regression.md) — LP

**The course**

17. [Organization of the lab](organization.md) — lab sessions and mistakes
    to avoid

---

The four parts and what each one is for are described on the
[home page](index.md).
