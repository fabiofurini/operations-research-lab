# Operations Research Lab

Teaching material designed and developed by **[Fabio Furini](https://sites.google.com/view/fabiofurini/home-page)**, associate
professor at [DIAG](https://www.diag.uniroma1.it/), Sapienza University of Rome.

**Continuous optimization models** — the course lecture
notes in online form, with Python/Gurobi code, data and reproducible case
studies.

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

    The SVM as a convex QP and robust regression as an LP: margin, dual, support
    vectors and support points — without ML libraries.

    [:octicons-arrow-right-24: The two problems](optimization-ml.md)

</div>

## The lab at a glance

**13 application chapters · 4 chapters of tools · LP, QP and NLP · one Colab
notebook per chapter · reproducible Python/Gurobi code.** The full list, chapter
by chapter, is in the [syllabus](syllabus.md).

## Download as PDF

- 📘 **[Full lecture notes](pdf/operations-research-lab-notes.pdf)** — 115 pages: models, worked examples, case studies, sensitivity analysis
- 📊 **[Course slides](pdf/operations-research-lab-slides.pdf)** — 83 slides, the whole content of the notes in compact form

## Getting started

Nothing to install: every chapter has its own
[notebook that opens in Colab](notebooks.md) and runs in the browser. Those who
prefer to work locally find the commands and the notes on the Gurobi licence on
the same page.

---

By the same author: **[MIP Modelling](https://fabiofurini.github.io/mip-modelling/)** —
the module on integer-variable models, with the same tools and the same style —
and **[Mathematical Analysis 1](https://fabiofurini.github.io/mathematical-analysis-1/)** — the analysis
lecture notes, with interactive graphs.

Teaching material by **[Fabio Furini](https://sites.google.com/view/fabiofurini/home-page)** —
[DIAG](https://www.diag.uniroma1.it/), Sapienza University of Rome.
