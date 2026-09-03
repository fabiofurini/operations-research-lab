"""Chapter 7 — Pricing and revenue management (NLP, partly non-convex).

Case study: ticket price for a concert in a 400-seat theatre.

Contents:
  1. Linear demand: analytical solution and QP (bilinear) with Gurobi
  2. Marginal value of one extra seat (by perturbation)
  3. Constant-elasticity and logistic demand (Gurobi function constraints, global)
  4. Multi-product version (2 categories with substitution)
"""
import gurobipy as gp
import numpy as np
import pandas as pd
from gurobipy import GRB

from stile import (ARANCIO, GRIGIO, ROSSO, TEAL, VERDE, intestazione, plt, salva_dat,
                   salva_dati, salva_figura)

# ----------------------------------------------------------------------
# 1. LINEAR DEMAND: D(p) = a - b p
# ----------------------------------------------------------------------
a, b, c, K = 1200.0, 5.0, 20.0, 400.0   # demand, slope, unit cost, seating capacity

intestazione("Linear demand: analytical vs Gurobi (bilinear QP)")
p_libero = (a / b + c) / 2                 # optimum without the capacity constraint
q_libero = a - b * p_libero
print(f"UNCONSTRAINED optimum: p* = {p_libero:.2f} €, q* = {q_libero:.0f} tickets")
if q_libero > K:
    p_vinc = (a - K) / b
    print(f"The capacity K = {K:.0f} is binding -> p* = (a-K)/b = {p_vinc:.2f} €, q* = {K:.0f}")

m = gp.Model("linear_pricing")
m.Params.OutputFlag = 0
m.Params.NonConvex = 2                      # bilinear objective p*q
p = m.addVar(lb=0, ub=a / b, name="p")
q = m.addVar(lb=0, name="q")
m.addConstr(q <= a - b * p, name="demand")
v_cap = m.addConstr(q <= K, name="capacity")
m.setObjective(p * q - c * q, GRB.MAXIMIZE)
m.optimize()
assert m.Status == GRB.OPTIMAL
print(f"Gurobi:  p* = {p.X:.2f} €, q* = {q.X:.0f}, profit = {m.ObjVal:,.2f} €")

# marginal value of a seat (perturbation: there are no LP duals in a non-convex QP)
v_cap.RHS = K + 1
m.optimize()
val_posto = m.ObjVal - (p_vinc - c) * K if False else None
m2_obj = m.ObjVal
v_cap.RHS = K
m.optimize()
print(f"Marginal value of one extra seat: {m2_obj - m.ObjVal:.2f} € "
      f"(theory: p - c + K·dp/dK = {p_vinc - c - K / b:.2f} €)")

# ----------------------------------------------------------------------
# 2. SENSITIVITY: price and profit as the seating capacity varies
# ----------------------------------------------------------------------
intestazione("Sensitivity to the seating capacity")
capienze = np.arange(200, 901, 50)
righe = []
for KK in capienze:
    q_opt = min(KK, q_libero)
    p_opt = (a - q_opt) / b
    profitto = (p_opt - c) * q_opt
    marg = (p_opt - c - q_opt / b) if q_opt < q_libero else 0.0
    righe.append((KK, p_opt, q_opt, profitto, max(marg, 0)))
    print(f"  K = {KK:3.0f}: p* = {p_opt:6.2f} €, profit = {profitto:9.2f} €, "
          f"seat value = {max(marg, 0):5.2f} €")
sens = pd.DataFrame(righe, columns=["K", "price", "quantity", "profit", "seat_value"])
salva_dati(sens, "pricing_sensitivita_capienza")

# ----------------------------------------------------------------------
# 3. OTHER DEMAND FUNCTIONS (Gurobi, global non-linear constraints)
# ----------------------------------------------------------------------
intestazione("Constant elasticity and logistic demand (Gurobi)")
A_el, eps = 6.0e6, 2.2                     # D(p) = A p^-eps
M_log, alfa, beta_l = 900.0, 6.0, 0.045    # D(p) = M / (1 + exp(-alfa + beta*p))


def prezzo_elasticita():
    """max (p-c)·q  subject to  q·p^eps <= A, q <= K  (global, NonConvex=2).

    The form q·r <= A with r = p^eps is equivalent to q <= A p^(-eps) but
    numerically well scaled (r ~ 10^4 instead of p^(-eps) ~ 10^-5)."""
    m = gp.Model("elasticity")
    m.Params.OutputFlag = 0
    m.Params.NonConvex = 2
    m.Params.FuncNonlinear = 1           # p^eps treated as an exact NL constraint
    p = m.addVar(lb=float(c), ub=400.0, name="p")
    q = m.addVar(ub=float(K), name="q")
    r = m.addVar(name="r")               # r = p^eps
    m.addGenConstrPow(p, r, eps)
    m.addQConstr(q * r <= A_el)          # bilinear
    m.setObjective((p - c) * q, GRB.MAXIMIZE)
    m.optimize()
    assert m.Status == GRB.OPTIMAL
    return p.X, m.ObjVal


def prezzo_logistica():
    """max (p-c)·q  subject to  q(1+e) <= M, e = exp(-alfa + beta p), q <= K."""
    m = gp.Model("logistic")
    m.Params.OutputFlag = 0
    m.Params.NonConvex = 2
    m.Params.FuncNonlinear = 1
    p = m.addVar(lb=float(c), ub=400.0, name="p")
    q = m.addVar(ub=float(K), name="q")
    t = m.addVar(lb=-GRB.INFINITY, name="t")   # t = -alfa + beta p
    e = m.addVar(name="e")                     # e = exp(t)
    m.addConstr(t == -alfa + beta_l * p)
    m.addGenConstrExp(t, e)
    m.addConstr(q + q * e <= M_log)            # q (1 + e) <= M  (bilinear)
    m.setObjective((p - c) * q, GRB.MAXIMIZE)
    m.optimize()
    assert m.Status == GRB.OPTIMAL
    return p.X, m.ObjVal


p_el, prof_el = prezzo_elasticita()
p_log, prof_log = prezzo_logistica()
print(f"Constant elasticity (eps = {eps}): p* = {p_el:7.2f} €, profit = {prof_el:9.2f} €")
print(f"  theory without capacity: p* = c·eps/(eps-1) = {c * eps / (eps - 1):.2f} €")
print(f"Logistic: p* = {p_log:7.2f} €, profit = {prof_log:9.2f} €")

# ----------------------------------------------------------------------
# 4. MULTI-PRODUCT: 2 categories with substitution (non-convex QP)
# ----------------------------------------------------------------------
intestazione("Two categories (stalls/balcony) with substitution")
# D1 = a1 - b11 p1 + b12 p2 ; D2 = a2 + b21 p1 - b22 p2
a1, a2 = 500.0, 900.0
b11, b12, b21, b22 = 2.0, 0.6, 0.8, 4.0
c1, c2, K1, K2 = 30.0, 15.0, 150.0, 300.0

mm = gp.Model("multi_pricing")
mm.Params.OutputFlag = 0
mm.Params.NonConvex = 2
p1 = mm.addVar(lb=0, ub=300, name="p1")
p2 = mm.addVar(lb=0, ub=300, name="p2")
q1 = mm.addVar(lb=0, name="q1")
q2 = mm.addVar(lb=0, name="q2")
mm.addConstr(q1 <= a1 - b11 * p1 + b12 * p2, name="dem1")
mm.addConstr(q2 <= a2 + b21 * p1 - b22 * p2, name="dem2")
mm.addConstr(q1 <= K1, name="cap1")
mm.addConstr(q2 <= K2, name="cap2")
mm.setObjective((p1 - c1) * q1 + (p2 - c2) * q2, GRB.MAXIMIZE)
mm.optimize()
assert mm.Status == GRB.OPTIMAL
print(f"stalls  : p1* = {p1.X:6.2f} €, q1* = {q1.X:5.1f} / {K1:.0f}")
print(f"balcony : p2* = {p2.X:6.2f} €, q2* = {q2.X:5.1f} / {K2:.0f}")
print(f"total profit: {mm.ObjVal:,.2f} €")

# ----------------------------------------------------------------------
# 5. FIGURES
# ----------------------------------------------------------------------
pp = np.linspace(20, 240, 400)
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10.5, 4.0))
prof_nc = (pp - c) * (a - b * pp)
prof_c = (pp - c) * np.minimum(a - b * pp, K)
salva_dat(pd.DataFrame({"p": pp, "without": prof_nc, "with": prof_c}), "cap07_profitto")
salva_dat(sens, "cap07_capienza")
salva_dat(pd.DataFrame({
    "p": pp,
    "linear": np.maximum(a - b * pp, 0),
    "elast": np.minimum(A_el * pp ** (-eps), 1400),
    "logistic": M_log / (1 + np.exp(-alfa + beta_l * pp)),
}), "cap07_domande")
ax1.plot(pp, prof_nc, color=GRIGIO, ls="--", label="without capacity constraint")
ax1.plot(pp, prof_c, color=TEAL, lw=2, label=f"with capacity K = {K:.0f}")
ax1.axvline(p_vinc, color=ROSSO, ls=":", label=f"p* = {p_vinc:.0f} €")
ax1.set_xlabel("price (€)"); ax1.set_ylabel("profit (€)")
ax1.set_title("Linear demand: concave profit")
ax1.legend(fontsize=8)
ax2.plot(sens["K"], sens["profit"], "-o", color=TEAL)
ax2.axvline(q_libero, color=GRIGIO, ls="--")
ax2.annotate(" beyond q* the capacity\n is worth nothing", (q_libero, sens["profit"].min()),
             fontsize=8, color=GRIGIO)
ax2.set_xlabel("seating capacity K (seats)"); ax2.set_ylabel("optimal profit (€)")
ax2.set_title("Value curve of the seating capacity")
salva_figura(fig, "cap07_profitto")

fig, ax = plt.subplots()
D_lin = np.maximum(a - b * pp, 0)
D_el = A_el * pp ** (-eps)
D_log = M_log / (1 + np.exp(-alfa + beta_l * pp))
ax.plot(pp, D_lin, label="linear $a-bp$", color=TEAL)
ax.plot(pp, np.minimum(D_el, 1400), label="constant elasticity $Ap^{-\\varepsilon}$", color=ARANCIO)
ax.plot(pp, D_log, label="logistic $M/(1+e^{\\alpha+\\beta p})$", color=VERDE)
ax.axhline(K, color=GRIGIO, ls=":", label=f"capacity K = {K:.0f}")
ax.set_xlabel("price (€)"); ax.set_ylabel("expected demand (tickets)")
ax.set_ylim(0, 1400)
ax.set_title("Three demand functions compared")
ax.legend(fontsize=8)
salva_figura(fig, "cap07_domande")

print("\nDone: chapter 7.")
