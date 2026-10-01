# Tools

What you need before the models: the theory that lets you *interrogate* a
solution (duality, shadow prices, KKT) and the solver you build and solve the
models with.

<div class="grid cards" markdown>

-   :material-function-variant: **Theory: linear programming**

    ---

    Primal-dual pair in general form, duality rules, weak and strong duality,
    complementary slackness, shadow prices and sensitivity analysis.

    [:octicons-arrow-right-24: Go to the page](theory-lp.md)

-   :material-chart-bell-curve: **Theory: nonlinear optimization**

    ---

    Convexity, quadratic programming and the KKT conditions — the nonlinear
    extension of LP theory. Closes the sensitivity protocol.

    [:octicons-arrow-right-24: Go to the page](theory-nonlinear.md)

-   :material-console: **Solver: linear models**

    ---

    The five steps to build a model with `gurobipy`, how to run it, how to read
    the solution, shadow prices, reduced costs and validity ranges.

    [:octicons-arrow-right-24: Go to the page](solver-lp.md)

-   :material-function: **Solver: nonlinear models**

    ---

    Function constraints (`log`, `exp`, powers), bilinear terms, tolerances and
    scaling: one solver only, with a certified global optimum.

    [:octicons-arrow-right-24: Go to the page](solver-nonlinear.md)

</div>

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
