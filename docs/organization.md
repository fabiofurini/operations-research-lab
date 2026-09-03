# Organization of the lab

## Essential path in four lab sessions

| | Content | Learning objectives |
|---|---|---|
| **Lab 1** | Production and inventory | formulate a multi-period LP; read duals, slacks and ranges; verify a shadow price by perturbation |
| **Lab 2** | Markowitz | build a convex QP; plot a frontier; discuss the fragility of the estimates |
| **Lab 3** | Pricing *or* budget | model nonlinear functions; study concavity; check the KKT conditions numerically |
| **Lab 4** | Project of your choice | supply chain, EV charging, location, queues, Newsvendor, CVaR or SVM; managerial presentation |

## Structure of the deliverable (report, max 8 pages)

1. **Problem and assumptions** — context and simplifications stated explicitly;
2. **Model** — data, variables, constraints and objective, each of them explained;
3. **Data** — origin, units of measurement, generation;
4. **Results** — optimal value, decisions, active constraints;
5. **Sensitivity** — the complete protocol in six steps;
6. **Managerial recommendation** — at most ten lines, without formulas.

## Assessment criteria

| Dimension | Weight |
|---|---|
| Correctness of the formulation | 30% |
| Implementation and numerical verification | 25% |
| Sensitivity analysis | 25% |
| Interpretation and communication | 20% |

## Typical discussion questions

- Which resource is it best to increase first, and how much can be paid for it?
- What is the cost of a more ambitious service promise?
- Does the solution remain credible if the data change by 5%?
- Which point of the frontier would you recommend to a decision maker, and why?
- What does the model NOT say?

## The most common mistakes

1. Reading `.X` or `.Pi` without checking `m.Status`.
2. Forgetting `lb=-GRB.INFINITY` on the free variables ($b$ of the SVM, $\eta$ of the CVaR).
3. Using a shadow price outside its validity range.
4. Getting the sign of the duals wrong in minimization problems.
5. Updating the RHS of a constraint that contains constants on the left-hand side.
6. Optimizing a single objective when the problem has two (pure minimax).
7. Choosing the hyperparameters by looking at the test set.
8. Reporting six decimal digits from estimates that wobble at the second.

## Reproducibility

```bash
python3 -m pip install gurobipy matplotlib pandas scipy   # scipy: statistical functions only
python3 python/run_all.py            # regenerates data, results and figures
```

The course slides and the solutions to the exercises are distributed in class.
