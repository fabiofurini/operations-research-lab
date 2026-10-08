# Theory: nonlinear optimization

[:material-file-pdf-box: Lecture notes (PDF)](pdf/operations-research-lab-notes.pdf) · [:material-presentation: Chapter slides (PDF)](pdf/slides-02-background.pdf)

The second subchapter of the background: convexity, quadratic programming and
KKT conditions — the nonlinear extension of the [LP theory](theory-lp.md).
It closes with the sensitivity protocol used in every laboratory session.

## Convexity and quadratic programming

A **QP** has objective $\tfrac12 \boldsymbol x' \boldsymbol Q\, \boldsymbol x +
\boldsymbol c' \boldsymbol x$ and linear constraints; it is convex if and only if
$\boldsymbol Q \succeq 0$. In a convex problem every local minimum is global:
optimality can be *certified*.

!!! example "A 2×2 QP, worked out in full"
    Separable quadratic objective and a threshold constraint on the sum:

    $$
    \begin{array}{r r@{\;}c@{\;}r c r l}
    \min & x_1^2 & + & 2\,x_2^2 & & & \\
    \text{subject to} & x_1 & + & x_2 & \ge & 6 & \\
     & x_1, & & x_2 & \ge & 0 &
    \end{array}
    $$

    $\boldsymbol Q = \mathrm{diag}(2, 4) \succ 0$: convex, global optimum.
    **Solving we obtain**: $\tilde x_1 = 4$, $\tilde x_2 = 2$,
    $\tilde f = 24$, $\lambda = 8$.
    **Check**: the constraint is active ($4 + 2 = 6$) and partial derivatives coincide:

    $$
    2\tilde x_1 = 8 = 4\tilde x_2 = \lambda . \quad ✓
    $$

    **By perturbation**: with right-hand side 7, $\tilde f = 32.67 \approx 24 + 8$
    (plus the curvature term).

## The nonlinear optimality conditions: the KKT conditions

For $\min f(x_1, \dots, x_n)$ subject to $g_i(x_1, \dots, x_n) \le 0$ and
$h_j(x_1, \dots, x_n) = 0$, the Lagrangian is

$$
L(x_1, \dots, x_n) = f(x_1, \dots, x_n)
+ \sum_{i=1}^{m} \lambda_i g_i(x_1, \dots, x_n)
+ \sum_{j=1}^{q} \nu_j h_j(x_1, \dots, x_n),
\qquad \lambda_i \ge 0 ;
$$

at a regular optimal point $(\tilde x_1, \dots, \tilde x_n)$ there exist
$\lambda_i \ge 0$, $\nu_j$ such that:

$$
\frac{\partial L}{\partial x_k}(\tilde x_1, \dots, \tilde x_n) = 0 \;\;
\forall k \in \{1, 2, \dots, n\},
\qquad \lambda_i\, g_i(\tilde x_1, \dots, \tilde x_n) = 0 \;\;
\forall i \in \{1, 2, \dots, m\} .
$$

If the problem is convex the KKT conditions are also sufficient. **In the linear
case the KKT conditions are exactly complementary slackness** for the pair
(P)–(D): stationarity is the feasibility of the dual (multipliers = $\pi_i$, and
the multipliers of the sign constraints are the reduced costs), complementarity is
$\bar\pi_i \cdot \bar s_i = 0$. The multipliers generalize the shadow prices;
when the duals are not available, they are estimated **by perturbation** (increase
the right-hand side by $\varepsilon$, re-optimize, incremental ratio).

!!! example "The KKT conditions on the QP of the example"
    On the model $\min x_1^2 + 2x_2^2$ subject to $x_1 + x_2 \ge 6$:
    stationarity $2x_1 = \lambda$, $4x_2 = \lambda$; the constraint must be active
    (otherwise $x_1 = x_2 = 0$, which violates it): $\lambda = 8$, $\tilde x_1 = 4$,
    $\tilde x_2 = 2$, $\tilde f = 24$ — the same numbers as before, now obtained
    with the general procedure. With right-hand side $6 + \varepsilon$ the optimal
    value grows by $\approx 8\varepsilon$ (exactly: $\tilde f(d) = \tfrac{2}{3}d^2$,
    hence $24 + 8\varepsilon + \tfrac{2}{3}\varepsilon^2$).

## The sensitivity protocol (used in every chapter)

1. **Base scenario**: solve, verify, identify the active constraints.
2. **One-at-a-time**: vary one key parameter over a grid.
3. **Shadow prices and reduced costs**: compare the dual with a re-optimization
   after a perturbation; read the $\bar c_j$ of every variable at zero (its
   profitability threshold).
4. **Scenarios**: pessimistic, central, optimistic.
5. **Trade-off**: trace a frontier (cost-service, risk-return…).
6. **Stability**: data ±5% → does the recommendation hold?
