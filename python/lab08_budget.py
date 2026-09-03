"""Chapter 8 — Advertising budget allocation (convex NLP).

Case study: a 100,000 € campaign over 4 channels (social, search, TV, influencer)
with concave response curves (decreasing marginal returns).

Contents:
  1. Maximisation of the total response with a budget and per-channel caps
  2. Numerical check of the KKT condition: equal marginal return on the active channels
  3. Value-budget curve and marginal value of one euro
  4. Optimal mix as the budget grows
"""
import gurobipy as gp
import numpy as np
import pandas as pd
from gurobipy import GRB

from stile import (ARANCIO, CICLO, GRIGIO, TEAL, intestazione, plt, salva_dat, salva_dati,
                   salva_figura)

# ----------------------------------------------------------------------
# 1. DATA: logarithmic response R_i(x) = a_i * log(1 + b_i x)   [x in thousands of €]
# ----------------------------------------------------------------------
canali = ["social", "search", "TV", "influencer"]
a = np.array([260.0, 380.0, 520.0, 190.0])   # response scale (useful contacts, thousands)
b = np.array([0.14, 0.09, 0.025, 0.20])      # saturation speed
u = np.array([60.0, 80.0, 120.0, 35.0])      # per-channel cap (thousands of €)
B = 100.0                                    # total budget (thousands of €)

salva_dati(pd.DataFrame({"channel": canali, "a": a, "b": b, "cap": u}), "budget_canali")


def risposta(x):
    return float(np.sum(a * np.log1p(b * x)))


def marginale(x):
    return a * b / (1 + b * x)


def alloca(budget):
    """max sum a_i log(1+b_i x_i)  subject to  sum x_i <= budget, 0 <= x_i <= u_i.

    Concave problem, solved GLOBALLY by Gurobi with the non-linear constraints
    z_i = log(g_i): the same solver used throughout the lecture notes."""
    m = gp.Model("budget")
    m.Params.OutputFlag = 0
    m.Params.FuncNonlinear = 1     # log treated as an exact NL constraint (global)
    m.Params.MIPGap = 1e-9         # very tight gap: accurate differences are needed
    m.Params.FeasibilityTol = 1e-9
    m.Params.OptimalityTol = 1e-9
    x = m.addVars(4, ub=u, name="x")
    g = m.addVars(4, lb=1.0, name="g")                 # g_i = 1 + b_i x_i
    z = m.addVars(4, lb=-GRB.INFINITY, name="z")       # z_i = log(g_i)
    for i in range(4):
        m.addConstr(g[i] == 1 + b[i] * x[i])
        m.addGenConstrLog(g[i], z[i])
    m.addConstr(gp.quicksum(x[i] for i in range(4)) <= budget)
    m.setObjective(gp.quicksum(a[i] * z[i] for i in range(4)), GRB.MAXIMIZE)
    m.optimize()
    assert m.Status == GRB.OPTIMAL
    return np.array([x[i].X for i in range(4)]), m.ObjVal


intestazione(f"Optimal allocation with budget B = {B:.0f} thousand €")
x_opt, R_opt = alloca(B)
print(f"Total response: {R_opt:,.1f} (thousands of useful contacts)\n")
print(f"{'channel':>11} | {'spend':>8} | {'cap':>6} | {'response':>9} | {'marginal':>9}")
marg = marginale(x_opt)
for i, ch in enumerate(canali):
    print(f"{ch:>11} | {x_opt[i]:8.1f} | {u[i]:6.0f} | {a[i] * np.log1p(b[i] * x_opt[i]):9.1f} "
          f"| {marg[i]:9.4f}")
print(f"\nTotal spend: {x_opt.sum():.1f} / {B:.0f}")

# ----------------------------------------------------------------------
# 2. KKT CHECK: equal marginal on the active channels not at their cap
# ----------------------------------------------------------------------
intestazione("KKT check")
interni = [(0 < x_opt[i] < u[i] - 1e-6) for i in range(4)]
marg_interni = marg[interni]
print(f"Interior channels (neither at 0 nor at the cap): {[canali[i] for i in range(4) if interni[i]]}")
print(f"Marginal returns on the interior channels: {np.round(marg_interni, 4)}")
print(f"-> all equal to the shadow price of the budget: lambda ~ {marg_interni.mean():.4f}")
print("The last euro invested yields the same return in every active channel.")

# check by perturbation
_, R_piu = alloca(B + 1)
print(f"Check: +1000 € of budget -> response +{R_piu - R_opt:.4f} ~ lambda")

# ----------------------------------------------------------------------
# 3. VALUE-BUDGET CURVE and optimal mix
# ----------------------------------------------------------------------
intestazione("Value-budget curve")
budgets = np.arange(20, 301, 10)
valori, mixes, lambde = [], [], []
for bb in budgets:
    xx, rr = alloca(float(bb))
    _, rr2 = alloca(float(bb) + 1)
    valori.append(rr)
    mixes.append(xx)
    lambde.append(rr2 - rr)
mixes = np.array(mixes)
curva = pd.DataFrame({"budget": budgets, "response": valori, "lambda": lambde})
salva_dati(curva, "budget_curva_valore")
for bb, rr, ll in zip(budgets[::4], valori[::4], lambde[::4]):
    print(f"  B = {bb:3d}: response {rr:8.1f}, marginal value of 1000 € = {ll:6.3f}")

# ----------------------------------------------------------------------
# 4. FIGURES
# ----------------------------------------------------------------------
xx = np.linspace(0, 130, 300)
salva_dat(pd.DataFrame({"x": xx, **{ch: a[i] * np.log1p(b[i] * xx)
                                    for i, ch in enumerate(canali)}}), "cap08_risposte")
salva_dat(curva, "cap08_valore_budget")
salva_dat(pd.DataFrame({"budget": budgets, **{ch: mixes[:, i]
                                              for i, ch in enumerate(canali)}}), "cap08_mix")
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10.5, 4.0))
for i, ch in enumerate(canali):
    ax1.plot(xx, a[i] * np.log1p(b[i] * xx), label=ch, color=CICLO[i])
    ax1.axvline(u[i], color=CICLO[i], ls=":", alpha=0.5)
ax1.set_xlabel("spend in the channel (thousands of €)")
ax1.set_ylabel("expected response (thousands of contacts)")
ax1.set_title("Concave response curves (dotted = cap)")
ax1.legend(fontsize=8)
ax2.plot(curva["budget"], curva["response"], color=TEAL, lw=2)
ax2.set_xlabel("total budget (thousands of €)")
ax2.set_ylabel("optimal total response")
ax2b = ax2.twinx()
ax2b.plot(curva["budget"], curva["lambda"], color=ARANCIO, ls="--")
ax2b.set_ylabel("marginal value $\\lambda$", color=ARANCIO)
ax2b.tick_params(axis="y", labelcolor=ARANCIO)
ax2b.spines.right.set_visible(True)
ax2.set_title("Value of the budget: concave; $\\lambda$ decreasing")
salva_figura(fig, "cap08_curve")

fig, ax = plt.subplots()
ax.stackplot(budgets, mixes.T, labels=canali, colors=CICLO, alpha=0.9)
for i in range(4):
    ax.axhline(0, lw=0)  # noop, for a clean legend
ax.set_xlabel("total budget (thousands of €)")
ax.set_ylabel("spend per channel (thousands of €)")
ax.set_title("Optimal mix as the budget grows (channels saturate at their caps)")
ax.legend(fontsize=8, loc="upper left")
salva_figura(fig, "cap08_mix")

print("\nDone: chapter 8.")
