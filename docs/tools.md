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
