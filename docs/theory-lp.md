# Theory: linear programming

The first subchapter of the background: duality, optimality conditions and
sensitivity analysis of LPs. The nonlinear extension (convexity, QP, KKT) is in
the [companion page](theory-nonlinear.md).

## Linear programming and duality

The *data* are the costs $c_j$, the coefficients $a_{ij}$ and the right-hand sides $b_i$,
with $i \in M = \{1, 2, \dots, m\}$ and $j \in N = \{1, 2, \dots, n\}$. The sets
$M_{\le}, M_{=}, M_{\ge}$ partition $M$ according to the direction of the constraint;
the sets $N_{\ge 0}, N_{\gtreqless 0}, N_{\le 0}$ partition $N$ according to the
sign of the variable (non-negative, free, non-positive). The *variables* are the
$x_j$ of the primal and, in the dual, one $\pi_i$ per constraint of the primal.

$$
\begin{aligned}
\text{(P)} \qquad \max ~ \sum_{j \in N} c_j x_j & & \\
\text{subject to} \quad \sum_{j \in N} a_{ij} x_j &\le b_i, & \forall i \in M_{\le}, \\
\sum_{j \in N} a_{ij} x_j &= b_i, & \forall i \in M_{=}, \\
\sum_{j \in N} a_{ij} x_j &\ge b_i, & \forall i \in M_{\ge}, \\
x_j &\ge 0, & \forall j \in N_{\ge 0}, \\
x_j &\gtreqless 0, & \forall j \in N_{\gtreqless 0}, \\
x_j &\le 0, & \forall j \in N_{\le 0}; \\[1ex]
\text{(D)} \qquad \min ~ \sum_{i \in M} b_i \pi_i & & \\
\text{subject to} \quad \sum_{i \in M} a_{ij} \pi_i &\ge c_j, & \forall j \in N_{\ge 0}, \\
\sum_{i \in M} a_{ij} \pi_i &= c_j, & \forall j \in N_{\gtreqless 0}, \\
\sum_{i \in M} a_{ij} \pi_i &\le c_j, & \forall j \in N_{\le 0}, \\
\pi_i &\ge 0, & \forall i \in M_{\le}, \\
\pi_i &\gtreqless 0, & \forall i \in M_{=}, \\
\pi_i &\le 0, & \forall i \in M_{\ge}.
\end{aligned}
$$

**The rules of duality** — every constraint of the primal generates a dual
variable, every variable a dual constraint:

| Primal (max) | Dual (min) |
|---|---|
| constraint $\le b_i$ ($i \in M_{\le}$) | variable $\pi_i \ge 0$ |
| constraint $= b_i$ ($i \in M_{=}$) | variable $\pi_i \gtreqless 0$ |
| constraint $\ge b_i$ ($i \in M_{\ge}$) | variable $\pi_i \le 0$ |
| variable $x_j \ge 0$ ($j \in N_{\ge 0}$) | constraint $\ge c_j$ |
| variable $x_j \gtreqless 0$ ($j \in N_{\gtreqless 0}$) | constraint $= c_j$ |
| variable $x_j \le 0$ ($j \in N_{\le 0}$) | constraint $\le c_j$ |

The *equalities* of the primal give *free* dual variables (and vice versa); for a
**minimization** primal the table is read from right to left.

**Theorem (weak duality).** For every feasible solution $(\bar x_1, \dots, \bar x_n)$
of (P) and every feasible solution $(\bar\pi_1, \dots, \bar\pi_m)$ of (D):

$$
\sum_{j \in N} c_j \bar x_j \;\le\; \sum_{i \in M} b_i \bar\pi_i .
$$

**Theorem (strong duality).** (P) has an optimal solution $(\tilde x_1, \dots, \tilde x_n)$
**if and only if** (D) has an optimal solution $(\tilde\pi_1, \dots, \tilde\pi_m)$,
and in that case the optimal values coincide:

$$
\sum_{j \in N} c_j \tilde x_j \;=\; \sum_{i \in M} b_i \tilde\pi_i .
$$

Weak duality says that every feasible solution of the dual is an *upper bound*
for the maximization primal: if two feasible solutions have the same value, they
are both optimal. Strong duality guarantees that at the optimum the gap always
closes (there may be more than one optimal solution, but the optimal values
coincide).

!!! example "Building the dual with the rules: the 2×2 LP"
    The 2×2 LP is exactly in the canonical maximization form (constraints ≤,
    non-negative variables):

    $$
    \begin{array}{r r@{\;}c@{\;}r c r l}
    \max & 30\,x_1 & + & 50\,x_2 & & & \\
    \text{subject to} & x_1 & + & 3\,x_2 & \le & 90, & \\
     & 2\,x_1 & + & x_2 & \le & 80, & \\
     & x_1, & & x_2 & \ge & 0. &
    \end{array}
    $$

    Every constraint generates a dual variable ($\le$ in a maximization ⇒
    $\pi_1, \pi_2 \ge 0$); every variable generates a dual constraint, with the
    coefficients taken by **column** and the costs as right-hand sides; the
    objective swaps the roles:

    $$
    \begin{array}{r r@{\;}c@{\;}r c r l}
    \min & 90\,\pi_1 & + & 80\,\pi_2 & & & \\
    \text{subject to} & \pi_1 & + & 2\,\pi_2 & \ge & 30, & \\
     & 3\,\pi_1 & + & \pi_2 & \ge & 50, & \\
     & \pi_1, & & \pi_2 & \ge & 0. &
    \end{array}
    $$

!!! example "Building the dual with the rules: all the cases in a single LP"
    A **minimization** LP with all the cases of the table (three directions,
    three signs; the table is read from right to left):

    $$
    \begin{array}{r r@{\;}c@{\;}r@{\;}c@{\;}r c r}
    \min & 5\,x_1 & + & 8\,x_2 & - & 9\,x_3 & & \\
    \text{subject to} & x_1 & + & x_2 & & & \ge & 30, \\
     & x_1 & + & x_2 & - & x_3 & = & 100, \\
     & x_1 & - & 2\,x_2 & & & \le & -20, \\
     & x_1 & & & & & \ge & 0, \\
     & & & x_2 & & & \gtreqless & 0, \\
     & & & & & x_3 & \le & 0.
    \end{array}
    $$

    Dual variables: $\pi_1 \ge 0$ (constraint $\ge$ in a minimization),
    $\pi_2 \gtreqless 0$ (equality), $\pi_3 \le 0$ (constraint $\le$).
    Dual constraints by column: from $x_1 \ge 0$ we get
    $\pi_1 + \pi_2 + \pi_3 \le 5$; from $x_2 \gtreqless 0$ we get
    $\pi_1 + \pi_2 - 2\pi_3 = 8$; from $x_3 \le 0$ we get $-\pi_2 \ge -9$:

    $$
    \begin{array}{r r@{\;}c@{\;}r@{\;}c@{\;}r c r}
    \max & 30\,\pi_1 & + & 100\,\pi_2 & - & 20\,\pi_3 & & \\
    \text{subject to} & \pi_1 & + & \pi_2 & + & \pi_3 & \le & 5, \\
     & \pi_1 & + & \pi_2 & - & 2\,\pi_3 & = & 8, \\
     & & - & \pi_2 & & & \ge & -9, \\
     & \pi_1 & & & & & \ge & 0, \\
     & & & \pi_2 & & & \gtreqless & 0, \\
     & & & & & \pi_3 & \le & 0.
    \end{array}
    $$

## The optimality conditions of LP: complementary slackness

To every constraint we associate its *slack* $\bar s_i$, and to every variable
its *reduced cost* $\bar c_j$, that is the slack of the corresponding *dual*
constraint:

$$
\bar s_i = \sum_{j \in N} a_{ij} \bar x_j - b_i, \quad \forall i \in M,
\qquad
\bar c_j = c_j - \sum_{i \in M} a_{ij} \bar\pi_i, \quad \forall j \in N.
$$

The slack measures how far the constraint is from being binding; the reduced
cost measures $c_j$ net of the value of the resources consumed, at the shadow
prices.

A pair of feasible solutions is optimal for both problems **if and only if** the
**complementary slackness** conditions hold:

$$
\bar\pi_i \cdot \bar s_i = 0, \quad \forall i \in M,
\qquad
\bar x_j \cdot \bar c_j = 0, \quad \forall j \in N.
$$

In words: **slack constraint ⇒ dual at zero**, and variable different from zero ⇒
reduced cost null. At the optimum these are *implications*, not equivalences
(degeneracy: there may exist a variable at zero with null reduced cost).

**Two readings to remember:**

- **shadow price** $\tilde\pi_i = \partial \tilde z / \partial b_i$: the marginal
  value of the right-hand side; it holds within the **validity range of the
  right-hand side** $[b_i^{\min}, b_i^{\max}]$, the largest interval in which,
  varying only $b_i$, the shadow price remains exactly $\tilde\pi_i$. Inactive
  constraint ⇒ $\tilde\pi_i = 0$;
- **reduced cost** $\bar c_j$: for a variable at zero, by how much $c_j$ must
  improve for it to become worth activating; it holds within the **validity range
  of the coefficient** $[c_j^{\min}, c_j^{\max}]$, the largest interval in which,
  varying only $c_j$, the optimal solution does not change (for a variable at zero
  the profitability threshold is one of the two endpoints). Variable different
  from zero ⇒ $\bar c_j = 0$.

**The signs of shadow prices.** The sign of
$\tilde\pi_i = \partial \tilde z / \partial b_i$ is deduced by answering two
questions: *does increasing $b_i$ enlarge or shrink the feasible region?* (it
enlarges it with $\le$, it shrinks it with $\ge$); *how does a wider region change
the optimum?* (it can never worsen it).

| Direction of the constraint | minimization | maximization |
|---|---|---|
| $\le$ ($b_i$ ↑ ⇒ wider region) | $\tilde\pi_i \le 0$ | $\tilde\pi_i \ge 0$ |
| $\ge$ ($b_i$ ↑ ⇒ narrower region) | $\tilde\pi_i \ge 0$ | $\tilde\pi_i \le 0$ |
| $=$ | any sign | any sign |

An **inactive** constraint always has $\tilde\pi_i = 0$ (complementarity).

!!! example "Duality on the 2×2 LP, worked out in full"
    **Solving we obtain**: $(\tilde x_1, \tilde x_2) = (30, 20)$,
    $\tilde z = 1900$, $(\tilde\pi_1, \tilde\pi_2) = (14, 8)$,
    $(\bar c_1, \bar c_2) = (0, 0)$, with validity ranges
    $[b_1^{\min}, b_1^{\max}] = [40, 240]$, $[b_2^{\min}, b_2^{\max}] = [30, 180]$,
    $[c_1^{\min}, c_1^{\max}] = [50/3, 100]$, $[c_2^{\min}, c_2^{\max}] = [15, 90]$;
    both constraints active.

    **Checks**: $x_1, x_2 \ne 0$ ⇒ dual constraints active
    ($\bar c_1 = \bar c_2 = 0$) and strong duality:

    $$
    14 + 16 = 30 = c_1, \qquad 42 + 8 = 50 = c_2,
    \qquad 90 \cdot 14 + 80 \cdot 8 = 1900 = \tilde z . \quad ✓
    $$

!!! example "All the cases in a single LP: verification of the conditions"
    **Solving we obtain**: $(\tilde x_1, \tilde x_2, \tilde x_3) = (60, 40, 0)$,
    $\tilde z = 620$, $(\tilde\pi_1, \tilde\pi_2, \tilde\pi_3) = (0, 6, -1)$,
    $(\bar c_1, \bar c_2, \bar c_3) = (0, 0, -3)$, with validity ranges of the
    right-hand sides $(-\infty, 100]$, $[30, +\infty)$, $[-200, +\infty)$ and of the
    coefficients $(-\infty, 8]$, $[5, 17]$, $(-\infty, -6]$.

    **Checks with the rules**: $\tilde\pi_1 = 0$ by complementarity (slack
    constraint: $60 + 40 = 100 > 30$); $\tilde\pi_2 = 6$ (equality → free dual
    variable); $\tilde\pi_3 = -1 \le 0$ ($\le$ in a minimization). Dual constraints
    of $x_1, x_2$ active and strong duality:

    $$
    0 + 6 - 1 = 5 = c_1, \qquad 0 + 6 - 2 \cdot (-1) = 8 = c_2,
    \qquad 30 \cdot 0 + 100 \cdot 6 + (-20)(-1) = 620 = \tilde z . \quad ✓
    $$

    **Reduced costs, one per sign**: $\bar c_1 = 5 - 5 = 0$,
    $\bar c_2 = 8 - 8 = 0$; $x_3$ sits at its **upper bound** (zero):

    $$
    \bar c_3 = -9 - (-1) \cdot 6 = -3 ,
    $$

    and it would become active only with a coefficient $\ge -6$ ($= c_3^{\max}$).
    By perturbation: $b_2 = 101 → 626$ ($+6$), $b_3 = -19 → 619$ ($-1$),
    $x_3$ forced to $-1 → 623$ ($+3$) ✓.

## Sensitivity analysis in LPs

Together with the solution, four numbers for each constraint and variable come free:

- the **shadow price** $\tilde\pi_i$: marginal value of the right-hand side;
- the **validity range of the right-hand side** $[b_i^{\min}, b_i^{\max}]$
  (in the 2×2 example: the shadow price 14 holds while $b_1$ stays in $[40, 240]$);
- the **reduced cost** $\bar c_j$: for a variable at zero, by how much its
  coefficient must improve for it to become worth activating;
- the **validity range of the coefficient** $[c_j^{\min}, c_j^{\max}]$
  (in the 2×2 example: $c_1$ can vary in $[50/3, 100]$ and $c_2$ in $[15, 90]$
  without moving the solution).

!!! example "Shadow prices in practice"
    On the 2×2 LP ($\tilde z = 1900$, $\tilde\pi_1 = 14$): one extra unit of
    $b_1$ is worth 14; if it cost 12, it would be worth it. By perturbation:

    $$
    b_1 = 91 \Rightarrow 1914 = 1900 + 14,
    \qquad
    b_1 = 100 \Rightarrow 2040 = 1900 + 10 \cdot 14,
    $$

    exact because $100 \in [40, 240]$. At $b_1 = 240$ the structure changes: beyond
    that, every unit is worth less than 14. With $b_1 = 300$ the constraint would be
    inactive and the shadow price $0$.

!!! example "Reduced costs in practice: is a third variable worth it?"
    Let us add to the 2×2 LP a variable $x_3 \ge 0$ with coefficient $c_3 = 20$
    and consumptions $a_{13} = a_{23} = 1$. At the shadow prices the resources
    absorbed are worth

    $$
    1 \cdot 14 + 1 \cdot 8 = 22 > 20 = c_3 ,
    \qquad
    \bar c_3 = 20 - 22 = -2 :
    $$

    the solution remains $(30, 20, 0)$ with $\tilde z = 1900$ and $c_3^{\max} = 22$ —
    the coefficient would have to rise to at least 22. Counter-check with
    $c_3 = 23$: the solution changes to $(0, 5, 75)$, value 1975.

