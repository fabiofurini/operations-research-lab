# Organization of the lab

## Essential path in four lab sessions

| | Content | Learning objectives |
|---|---|---|
| **Lab 1** | Production and inventory | formulate a multi-period LP; read duals, slacks and ranges; verify a shadow price by perturbation |
| **Lab 2** | Markowitz | build a convex QP; plot a frontier; discuss the fragility of the estimates |
| **Lab 3** | Pricing *or* budget | model nonlinear functions; study concavity; check the KKT conditions numerically |
| **Lab 4** | Project of your choice | supply chain, EV charging, location, queues, Newsvendor, CVaR or SVM; managerial presentation |

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
