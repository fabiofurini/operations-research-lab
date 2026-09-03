# Gurobi in Python (`gurobipy`) — a practical guide

A self-contained guide for the Operations Research Lab: **how to build a model, how to run it,
how to retrieve the solution and how to interpret the output**. All the examples can be copied
and pasted straight into a Python terminal.

---

## 1. Installation and licence

```bash
python3 -m pip install gurobipy
```

The pip package ships with a **demo licence** (up to 2000 variables and 2000 constraints):
enough for every model in this lab. At start-up the line
`Restricted license - for non-production use only` appears: this is normal.

**Full academic licence (free of charge):**
1. register at <https://portal.gurobi.com> with your institutional email (`@uniroma1.it`);
2. request a *Named-User Academic License*;
3. run the command `grbgetkey XXXXXXXX-...` shown by the portal (you need the university network or a VPN);
4. the licence is saved in `~/gurobi.lic` and from that moment there are no size limits.

Quick check:

```python
import gurobipy as gp
print(gp.gurobi.version())        # e.g. (13, 0, 3)
```

---

## 2. How to build a model

A mathematical programming model in `gurobipy` is always built in **the same five steps**.
As an example we use a small generic maximization LP, with two non-negative
variables and two ≤ constraints — the same 2×2 LP of the background chapter
(the examples with real data come in the application chapters):

```
max         30 x_1 + 50 x_2
subject to   1 x_1 +  3 x_2 ≤ 90    (constraint 1)
             2 x_1 +  1 x_2 ≤ 80    (constraint 2)
               x_1,     x_2 ≥ 0
```

### Step 1 — create the model container

```python
import gurobipy as gp
from gurobipy import GRB

m = gp.Model("lp_2x2")
```

`m` is an empty object to which we will add variables, constraints and an objective.

### Step 2 — add the decision variables

```python
x1 = m.addVar(lb=0, name="x1")        # lb = lower bound (default 0)
x2 = m.addVar(lb=0, name="x2")
```

Key points:
- the **default** is a continuous variable with `lb=0` and `ub=+inf`: for non-negative variables `m.addVar(name=...)` is enough;
- `vtype=GRB.CONTINUOUS` is the default; in this lab we **never use** `GRB.BINARY`/`GRB.INTEGER`;
- for a free variable (possibly negative, e.g. the SVM intercept `b` or the CVaR threshold `η`): `m.addVar(lb=-GRB.INFINITY)`.

For **indexed families of variables** (the normal case in real models):

```python
I = ["1", "2", "3"]              # indices (e.g. numbered items)
T = range(6)                     # indices (e.g. periods)
x = m.addVars(I, T, name="x")    # creates x["1",0], x["1",1], ...
```

`addVars` returns a `tupledict` dictionary: entries are accessed with `x["1", 3]`.

### Step 3 — add the constraints

```python
v1 = m.addConstr(1*x1 + 3*x2 <= 90, name="constraint1")
v2 = m.addConstr(2*x1 + 1*x2 <= 80, name="constraint2")
```

- a constraint is written **as a Python inequality** between linear expressions;
- keeping the returned object (`v1`) is needed later, to read the **shadow price**;
- for families of constraints:

```python
m.addConstrs((x.sum(i, "*") <= b[i] for i in I), name="cap")
```

- sums are written with `gp.quicksum(...)` or with `x.sum(i, "*")`
  (sum over all values of the second index).

### Step 4 — set the objective function

```python
m.setObjective(30*x1 + 50*x2, GRB.MAXIMIZE)
```

The second argument is `GRB.MAXIMIZE` or `GRB.MINIMIZE`. **Quadratic** objectives (Markowitz,
SVM, smoothing) are written in the natural way:

```python
m.setObjective(x @ Q @ x, GRB.MINIMIZE)                  # matrix form (numpy)
m.setObjective(gp.quicksum(q[i,j]*x[i]*x[j] for i in I for j in I), GRB.MINIMIZE)
```

### Step 5 — (optional) check what we have written

```python
m.write("lp_2x2.lp")         # writes the model in human-readable format
```

The `.lp` file shows exactly the model that the solver sees: **it is the first debugging
tool** when the optimum "does not add up".


### The complete example, from top to bottom

The whole cycle — building, solving, reading EVERYTHING the solver
returns — on the 2×2 LP:

```python
import gurobipy as gp
from gurobipy import GRB

m = gp.Model("lp_2x2")
m.Params.OutputFlag = 0
x1 = m.addVar(name="x1")
x2 = m.addVar(name="x2")
v1 = m.addConstr(1*x1 + 3*x2 <= 90, name="constraint1")
v2 = m.addConstr(2*x1 + 1*x2 <= 80, name="constraint2")
m.setObjective(30*x1 + 50*x2, GRB.MAXIMIZE)
m.optimize()
assert m.Status == GRB.OPTIMAL

print(f"Optimal value: {m.ObjVal:.1f}")
for v in m.getVars():
    print(f"  {v.VarName}: X = {v.X:.1f}   RC = {v.RC:.1f}   "
          f"SAObj = [{v.SAObjLow:.1f}, {v.SAObjUp:.1f}]")
for c in m.getConstrs():
    print(f"  {c.ConstrName}: Slack = {c.Slack:.1f}   Pi = {c.Pi:.1f}   "
          f"SARHS = [{c.SARHSLow:.1f}, {c.SARHSUp:.1f}]")
```

Output (verified):

```
Optimal value: 1900.0
  x1: X = 30.0   RC = 0.0   SAObj = [16.7, 100.0]
  x2: X = 20.0   RC = 0.0   SAObj = [15.0, 90.0]
  constraint1: Slack = 0.0   Pi = 14.0   SARHS = [40.0, 240.0]
  constraint2: Slack = 0.0   Pi = 8.0   SARHS = [30.0, 180.0]
```

Section 5 explains how to read each of these numbers; the "all the cases"
example (section 5.3 bis) also covers `=`/`≥` constraints and variables that are free or `≤ 0`.


---

## 3. How to run it

```python
m.optimize()
```

That is all. Useful parameters to set **before** `optimize()`:

```python
m.Params.OutputFlag = 0      # 1 = log on screen (default), 0 = silent
m.Params.TimeLimit  = 60     # maximum number of seconds
m.Params.NonConvex  = 2      # allows non-convex QPs (e.g. pricing p*q)
```

### The log explained

```
Gurobi Optimizer version 13.0.3 ...
Optimize a model with 2 rows, 2 columns and 4 nonzeros   ← 2 constraints, 2 variables
Coefficient statistics:
  Matrix range  [1e+00, 3e+00]                            ← orders of magnitude of the data:
  Objective range [3e+01, 5e+01]                            if very different (1e-6 and 1e+9)
  RHS range     [8e+01, 9e+01]                              the model is badly scaled
Iteration    Objective       Primal Inf.    Dual Inf.      Time
       2    1.9000000e+03   0.000000e+00   0.000000e+00      0s
Optimal objective  1.900000000e+03                          ← optimal value found
```

The lines to look at every time: the number of rows/columns (does the model have the expected
size?), the coefficient *ranges* (is the data well scaled?) and the last line (the outcome).

---

## 4. How to retrieve the solution

**Before reading any value, always check the status:**

```python
if m.Status == GRB.OPTIMAL:
    print("Optimal value:", m.ObjVal)
    print("x1 =", x1.X, " x2 =", x2.X)      # .X = value of the variable at the optimum
elif m.Status == GRB.INFEASIBLE:
    print("Infeasible model")
elif m.Status == GRB.UNBOUNDED:
    print("Unbounded model")
```

| Attribute | On what | Meaning |
|---|---|---|
| `m.Status` | model | outcome: `OPTIMAL` (2), `INFEASIBLE` (3), `UNBOUNDED` (5), `TIME_LIMIT` (9) |
| `m.ObjVal` | model | value of the objective function at the optimum |
| `v.X` | variable | optimal value of the variable |
| `v.RC` | variable | **reduced cost** (LP only) |
| `c.Pi` | constraint | **shadow price / dual variable** (LP only) |
| `c.Slack` | constraint | slack: 0 ⇒ active (binding) constraint |
| `v.SAObjLow`, `v.SAObjUp` | variable | range of the cost coefficient over which the optimal basis does not change |
| `c.SARHSLow`, `c.SARHSUp` | constraint | range of the right-hand side over which the shadow price stays valid |

For families of variables:

```python
for i in I:
    for t in T:
        if x[i, t].X > 1e-6:              # print only the non-zero variables
            print(i, t, x[i, t].X)
```

With **pandas**, to move the solution into a DataFrame:

```python
import pandas as pd
sol = pd.DataFrame([(i, t, x[i, t].X) for i in I for t in T],
                   columns=["i", "t", "value"])
```

---

## 5. How to interpret the output

### 5.1 The outcome

- **OPTIMAL** — certified optimal solution. In the convex models of this lab
  the optimum is **global**; even in a QP declared non-convex (`NonConvex=2`) and in
  models with nonlinear constraints (`FuncNonlinear=1`) Gurobi certifies the global one.
- **INFEASIBLE** — the constraints contradict each other. Diagnosis:
  `m.computeIIS(); m.write("conflict.ilp")` — the file lists a minimal subset of
  mutually conflicting constraints. Typical mistake: total demand > total capacity without a
  shortage variable.
- **UNBOUNDED** — the objective can improve indefinitely: almost always a constraint or a
  bound is missing (e.g. maximum profit with no capacity constraint).

### 5.2 Shadow prices (`Pi`) — "how much is one extra unit of resource worth?"

In the 2×2 LP: at the optimum `x_1 = 30, x_2 = 20`, value 1900, both constraints
active. The duals are:

```python
print(v1.Pi)   # 14.0  → one extra unit of b_1 is worth 14
print(v2.Pi)   # 8.0   → one extra unit of b_2 is worth 8
```

Reading: if obtaining one extra unit of b_1 costs less than 14, it is worth doing.
**Validity**: marginal only and only inside the range `SARHSLow ≤ b ≤ SARHSUp`; beyond it
the basis changes and the shadow price is no longer the same.

A **non-active** constraint (`Slack > 0`) always has `Pi = 0`: the resource is left over, one
extra unit is worth nothing.

### 5.3 Reduced costs (`RC`) — "why is this variable at zero?"

Basic variables have `RC = 0` (careful: there may be a variable **in the basis
at value zero** — a *degenerate* basis — so `RC = 0` on its own does not say that the
variable is used); for a variable at zero the reduced cost says **by how much its
objective coefficient must improve before it becomes worth activating it**.
In the 2×2 LP: a third variable with coefficient 20 and consumptions 1 and 1 absorbs resources
that at the shadow prices are worth 1·14 + 1·8 = 22 → the solver gives `x3.X = 0` and
`x3.RC = -2` (and `SAObjUp = 22`): the coefficient must rise by at least 2.
Counter-check: with coefficient 23 the optimal solution changes to (0, 5, 75), value 1975.

The reduced cost has its own validity range too, `SAObjLow/Up`: the range over which
the objective coefficient can vary without the optimal basis changing (in the example:
`c_1` can stay in [16.7, 100] without moving the solution; for a variable at zero
`SAObjUp` is the profitability threshold).

The standard loop to read them (LP only):

```python
for v in m.getVars():
    if v.X < 1e-6:
        print(v.VarName, v.RC)
```

### 5.3 bis — The general case: signs and reading

**Shadow prices** (`Pi`): always the "derivative of the optimum with respect to the right-hand
side", `Pi = ∂z*/∂b`. The sign follows from two questions: *does increasing `b` enlarge or
shrink the feasible region?* (it enlarges it with `≤`, it shrinks it with `≥`);
*how does a wider region change the optimum?* (it can never make it worse: a minimum
goes down or stays the same, a maximum goes up or stays the same).

| Constraint direction | minimum | maximum |
|---|---|---|
| `≤` (`b` ↑ ⇒ wider region) | `Pi ≤ 0` | `Pi ≥ 0` |
| `≥` (`b` ↑ ⇒ narrower region) | `Pi ≥ 0` | `Pi ≤ 0` |
| `=` | any sign | any sign |

Non-active constraint → `Pi = 0` (complementarity); validity in `SARHSLow–SARHSUp`.

**Reduced costs** (`RC`): basic variable → `RC = 0`; at the lower bound →
`RC ≥ 0` in a minimum, `RC ≤ 0` in a maximum (profitability threshold, validity in
`SAObjLow–SAObjUp`); at the **upper** bound → `RC` is the shadow price of the bound (a
saturated arc in a minimum-cost flow has `RC < 0`: one extra unit of capacity
saves `|RC|`).

```python
for v in m.getConstrs():
    print(v.ConstrName, v.Pi, v.SARHSLow, v.SARHSUp)
for v in m.getVars():
    print(v.VarName, v.X, v.RC, v.SAObjLow, v.SAObjUp)
```

**The "all the cases" example** — three constraint directions and three variable signs in the
same LP, to see every rule at work:

```python
m = gp.Model("all_cases")
x1 = m.addVar(name="x1")                          # x1 >= 0 (default)
x2 = m.addVar(lb=-GRB.INFINITY, name="x2")        # x2 free
x3 = m.addVar(lb=-GRB.INFINITY, ub=0, name="x3")  # x3 <= 0
v1 = m.addConstr(x1 + x2 >= 30,        name="constraint1")  # direction >=
v2 = m.addConstr(x1 + x2 - x3 == 100,  name="constraint2")  # direction  =
v3 = m.addConstr(x1 - 2*x2 <= -20,     name="constraint3")  # direction <=
m.setObjective(5*x1 + 8*x2 - 9*x3, GRB.MINIMIZE)
m.optimize()
```

```
Status: 2 (OPTIMAL)    ObjVal: 620.0
x1: X =  60.0  RC =  0.0  SAObj = [-inf, 8.0]
x2: X =  40.0  RC =  0.0  SAObj = [5.0, 17.0]
x3: X =   0.0  RC = -3.0  SAObj = [-inf, -6.0]
constraint1: Slack = -70.0  Pi =  0.0  SARHS = [-inf, 100.0]
constraint2: Slack =   0.0  Pi =  6.0  SARHS = [30.0, inf]
constraint3: Slack =   0.0  Pi = -1.0  SARHS = [-200.0, inf]
```

Every case in one go: non-active constraint → `Pi = 0` (constraint1, by
complementarity); equality → free dual, here `+6`; `≤` in a minimum → dual
`-1 ≤ 0`; two basic variables with `RC = 0`; variable `x3` stuck at its
**upper bound** (zero) with `RC = -3` and threshold `SAObjUp = -6`. Checks by
perturbation: `b_2 = 101 → 626` (+6), `b_3 = -19 → 619` (−1), `x3` forced to
−1 → `623` (+3).

### 5.4 In nonlinear models

For convex QP/NLP the multipliers (`Pi` on the linear constraints, KKT conditions in general)
have the same marginal reading as shadow prices. Numerical check recommended in the
lab: perturb the right-hand side by ε and check again that
`new_optimum ≈ old_optimum + Pi·ε`.

### 5.5 Interpretation checklist (to be used in every lab session)

1. Is the status `OPTIMAL`? If not, stop and diagnose.
2. Does the optimal value have the expected order of magnitude?
3. Which constraints are active (`Slack = 0`)? Are they the ones we expected?
4. How large are the shadow prices? Which resource should be expanded first?
5. Are there variables at zero? Read their reduced cost (`RC`): the profitability
   threshold beyond which they would enter the solution.
6. Is the solution stable? (re-run with data perturbed by 5%)
7. Turn everything into a **three-line managerial recommendation**.

---

## 6. Typical errors and how to recognise them

| Symptom | Likely cause | Remedy |
|---|---|---|
| `KeyError` on `x[i,t]` | indices different from those used in `addVars` | check the types (string vs int) |
| optimum = 0, all variables at zero | objective not set or wrong direction | check `setObjective(..., GRB.MAXIMIZE)` |
| unexpected `INFEASIBLE` | constraint written with the wrong direction, inconsistent data | `computeIIS()` + read the `.ilp` |
| `UNBOUNDED` | a bound or a capacity constraint is missing | write the `.lp` and look for the free variable |
| expected values but `Pi` not available | the model is a QP/MIP, LP duals do not exist | for QP use `m.Params.QCPDual = 1` or check by perturbation |
| "almost zero" numbers such as `1e-13` | normal numerical tolerance | filter with `> 1e-6` when printing |
| `Model too large for size-limited license` | the pip licence limits have been exceeded | activate the academic licence (sec. 1) |

---

## 7. Standard skeleton to reuse

Every script in the lab follows this skeleton:

```python
import gurobipy as gp
from gurobipy import GRB

# 1. DATA ------------------------------------------------------
# read the CSV files or define the parameters

# 2. MODEL -----------------------------------------------------
m = gp.Model("name")
x = m.addVars(...)                     # variables
m.addConstrs(...)                      # constraints
m.setObjective(..., GRB.MINIMIZE)      # objective

# 3. SOLUTION --------------------------------------------------
m.optimize()
assert m.Status == GRB.OPTIMAL, f"unexpected status: {m.Status}"

# 4. RESULTS ---------------------------------------------------
# read .X, .Pi, .RC and print a readable report

# 5. SENSITIVITY -----------------------------------------------
# loop over a key parameter, re-optimize, save figures
```

**A single solver: general NLPs are solved with Gurobi too** (from version 12 on).
Nonlinear functions as functional constraints on auxiliary variables — `addGenConstrLog`,
`addGenConstrExp`, `addGenConstrPow` with `m.Params.FuncNonlinear = 1` — and bilinear terms
with `m.Params.NonConvex = 2`: the optimum remains **globally certified**. Examples in the lab:
advertising budget (`log`), constant-elasticity pricing (`Pow` + bilinear), M/M/1 queues
(bilinear constraint `w·(mu - lam) = 1`), Weber (conic constraints `dx² + dy² ≤ d²`, a convex
QCP). For marginal analyses tighten `MIPGap`, `FeasibilityTol` and `OptimalityTol`
to `1e-9`; reformulate to avoid tiny quantities (e.g. `q·p^eps ≤ A` instead of
`q ≤ A·p^(-eps)`).
