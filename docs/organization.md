# Organization of the lab

<!-- collana-dalla-home -->
## The lab at a glance

**14 application chapters · 4 chapters of tools · LP, QP and NLP · one Colab
notebook per chapter · reproducible Python/Gurobi code.** The full list, chapter
by chapter, is in the [syllabus](syllabus.md).

<div class="grid cards" markdown>

-   :material-clipboard-check-outline: **Self-assessment**

    ---

    *Mock exam*

    A new mock exam at every start: 13 questions, 33 points, with the solutions and links to the notes.

    [:octicons-arrow-right-24: Test yourself](self-assessment.md)

</div>

## Download as PDF

- 📘 **[Full lecture notes](pdf/operations-research-lab-notes.pdf)** — 127 pages: models, worked examples, case studies, sensitivity analysis
- 📊 **[Lecture slides](downloads.md)** — one deck per chapter of the notes, on the [downloads](downloads.md) page

## Getting started

Nothing to install: every chapter has its own
[notebook that opens in Colab](notebooks.md) and runs in the browser. Those who
prefer to work locally find the commands and the notes on the Gurobi licence on
the same page.
<!-- /collana-dalla-home -->

## Essential path in four lab sessions

| | Content | Learning objectives |
|---|---|---|
| **Lab 1** | Production and inventory | formulate a multi-period LP; read duals, slacks and ranges; verify a shadow price by perturbation |
| **Lab 2** | Markowitz | build a convex QP; plot a frontier; discuss the fragility of the estimates |
| **Lab 3** | Pricing *or* budget | model nonlinear functions; study concavity; check the KKT conditions numerically |
| **Lab 4** | Project of your choice | supply chain, EV charging, location, queues, DEA, Newsvendor, CVaR or SVM; managerial presentation |

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
