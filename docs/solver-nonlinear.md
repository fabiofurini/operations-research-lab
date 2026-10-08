# Implementation: nonlinear models

[:material-file-pdf-box: Lecture notes (PDF)](pdf/operations-research-lab-notes.pdf) · [:material-presentation: Chapter slides (PDF)](pdf/slides-03-python-gurobi.pdf)

**A single solver: general NLPs are solved with Gurobi too** (from version 12
on), with the same syntax and the same checklist as the linear models.
Nonlinear functions as functional constraints on auxiliary variables — `addGenConstrLog`,
`addGenConstrExp`, `addGenConstrPow` with `m.Params.FuncNonlinear = 1` — and bilinear terms
with `m.Params.NonConvex = 2`: the optimum remains **globally certified**. Examples in the
lab: advertising budget (`log`), constant-elasticity pricing (`Pow` + bilinear), M/M/1 queues
(bilinear constraint `w·(mu - lam) = 1`), Weber (conic constraints `dx² + dy² ≤ d²`, a convex
QCP). For marginal analyses tighten `MIPGap`, `FeasibilityTol` and `OptimalityTol`
to `1e-9`; reformulate to avoid tiny quantities (e.g. `q·p^eps ≤ A` instead of
`q ≤ A·p^(-eps)`).


## How they are written

```python
m.Params.FuncNonlinear = 1     # functions handled exactly (globally)
z = m.addVar(lb=-GRB.INFINITY)
m.addGenConstrLog(g, z)        # z = log(g);  also Exp, Pow, Sin, ...
m.addQConstr(w * v == 1)       # bilinear terms: NonConvex = 2 is required
```

Two practical devices, both used in the scripts of the lab:

- **tolerances**: for accurate marginal analyses (differences between two
  nearby optima) tighten `MIPGap`, `FeasibilityTol` and `OptimalityTol` to `1e-9`;
- **scaling**: reformulate to avoid tiny quantities — for instance
  `q ≤ A·p^(-eps)` is written `q·r ≤ A` with `r = p^eps`, which keeps the numbers in a
  healthy range.

## The multipliers in nonlinear models

For convex QP/NLP the multipliers (`Pi` on the linear constraints, KKT conditions in general)
have the same marginal reading as shadow prices. Numerical check recommended in the
lab: perturb the right-hand side by ε and check again that
`new_optimum ≈ old_optimum + Pi·ε`.


## Why a single solver

Same syntax, same interpretation checklist and — above all — a **certified
global** optimum even in non-convex problems: with a local solver every result
would have to be accompanied by the question “is it only a local optimum?”.
Convex problems with a purely quadratic or conic structure (constraints such as
`dx² + dy² ≤ d²`) require nothing special.
