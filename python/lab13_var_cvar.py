"""Chapter 13 — VaR and CVaR: linear models and applications (scenario LP).

Contents:
  1. Example with 6 scenarios: VaR = 12, CVaR = 18.67,
     checked with the linear formulation of Rockafellar-Uryasev
  2. Mean-CVaR portfolio (LP) and comparison with Markowitz (QP)
  3. Return-CVaR frontier
  4. Two-stage supply chain with adverse scenarios: the cost of resilience
"""
import gurobipy as gp
import numpy as np
import pandas as pd
from gurobipy import GRB

from stile import (ARANCIO, GRIGIO, ROSSO, TEAL, VERDE, intestazione, plt, salva_dat,
                   salva_dati, salva_figura)

rng = np.random.default_rng(42)

# ----------------------------------------------------------------------
# 1. EXAMPLE WITH 6 SCENARIOS
# ----------------------------------------------------------------------
intestazione("Example with 6 scenarios: VaR and CVaR with the linear formulation")
perdite = np.array([2.0, 4.0, 5.0, 7.0, 12.0, 20.0])
pi6 = np.full(6, 1 / 6)
alpha = 0.80

# direct computation
cum = np.cumsum(pi6)
var_diretto = perdite[np.searchsorted(cum, alpha)]
print(f"Losses: {perdite.tolist()}, probability 1/6 each, alpha = {alpha}")
print(f"VaR (quantile): {var_diretto:.2f}")

# linear formulation of Rockafellar-Uryasev: min eta + 1/(1-alpha) sum pi_s xi_s
m = gp.Model("cvar6")
m.Params.OutputFlag = 0
eta = m.addVar(lb=-GRB.INFINITY, name="eta")
xi = m.addVars(6, name="xi")
m.addConstrs((xi[s] >= perdite[s] - eta for s in range(6)), name="tail")
m.setObjective(eta + gp.quicksum(pi6[s] * xi[s] for s in range(6)) / (1 - alpha),
               GRB.MINIMIZE)
m.optimize()
print(f"Rockafellar-Uryasev LP: eta* = {eta.X:.2f} (a VaR), CVaR = {m.ObjVal:.4f}")
print(f"By hand: 12 + (1/0.20)·(1/6)·(20-12) = 12 + 6.67 = 18.67  OK")
print(f"Expected value of the loss: {perdite.mean():.2f} "
      f"-> the CVaR tells the story of the tail, the mean does not.")

# ----------------------------------------------------------------------
# 2. MEAN-CVaR PORTFOLIO vs MARKOWITZ
# ----------------------------------------------------------------------
intestazione("Mean-CVaR portfolio (LP) vs Markowitz (QP)")
titoli = ["ENE", "FIN", "TEC", "IND", "SAN", "CON", "UTL", "MAT"]
n = len(titoli)
beta_f = np.array([1.1, 1.3, 1.5, 1.0, 0.6, 0.8, 0.4, 1.2])
alfa_ann = np.array([0.05, 0.06, 0.11, 0.05, 0.045, 0.05, 0.035, 0.06])
sigma_idio = np.array([0.05, 0.055, 0.07, 0.04, 0.03, 0.035, 0.02, 0.06])
S = 220                                   # monthly scenarios (pip licence: n+2+S constraints)
# market factor with FAT TAILS (Student t): realistic extreme scenarios
mercato = 0.004 + 0.035 * rng.standard_t(4, S) / np.sqrt(2)
R = alfa_ann[None, :] / 12 + np.outer(mercato, beta_f) + rng.normal(0, sigma_idio, (S, n))
salva_dati(pd.DataFrame(R, columns=titoli), "cvar_scenari_rendimenti")

mu = R.mean(axis=0) * 12
Q = np.cov(R.T) * 12
alpha_c = 0.90


def porta_cvar(r_min):
    """min CVaR_alpha of the monthly loss -R x  subject to  expected return >= r_min."""
    m = gp.Model("mean_cvar")
    m.Params.OutputFlag = 0
    x = m.addVars(n, name="x")
    eta = m.addVar(lb=-GRB.INFINITY, name="eta")
    xi = m.addVars(S, name="xi")
    m.addConstr(x.sum() == 1)
    m.addConstr(gp.quicksum(mu[i] * x[i] for i in range(n)) >= r_min)
    m.addConstrs((xi[s] >= -gp.quicksum(R[s, i] * x[i] for i in range(n)) - eta
                  for s in range(S)), name="tail")
    m.setObjective(eta + gp.quicksum(xi[s] for s in range(S)) / (S * (1 - alpha_c)),
                   GRB.MINIMIZE)
    m.optimize()
    if m.Status != GRB.OPTIMAL:
        return None, None
    w = np.array([x[i].X for i in range(n)])
    return w, m.ObjVal


def porta_markowitz(r_min):
    m = gp.Model("mk")
    m.Params.OutputFlag = 0
    x = m.addVars(n, name="x")
    m.addConstr(x.sum() == 1)
    m.addConstr(gp.quicksum(mu[i] * x[i] for i in range(n)) >= r_min)
    m.setObjective(gp.quicksum(Q[i, j] * x[i] * x[j] for i in range(n) for j in range(n)),
                   GRB.MINIMIZE)
    m.optimize()
    return np.array([x[i].X for i in range(n)])


r_obb = 0.08
w_cv, cvar_ott = porta_cvar(r_obb)
w_mk = porta_markowitz(r_obb)
perd_cv = -R @ w_cv
perd_mk = -R @ w_mk


def stat_perdite(perd):
    var_ = np.quantile(perd, alpha_c)
    cvar_ = perd[perd >= var_ - 1e-12].mean()
    return perd.mean(), var_, cvar_


print(f"Required minimum return: {r_obb:.0%} per year, alpha = {alpha_c}")
print(f"{'':>12} | {'mean loss':>13} | {'VaR90':>8} | {'CVaR90':>8}  (monthly losses)")
for nome, perd in [("mean-CVaR", perd_cv), ("Markowitz", perd_mk)]:
    mm_, vv_, cc_ = stat_perdite(perd)
    print(f"{nome:>12} | {mm_:13.4f} | {vv_:8.4f} | {cc_:8.4f}")
print("\nCompositions (weights > 1%):")
for nome, w in [("mean-CVaR", w_cv), ("Markowitz", w_mk)]:
    print(f"  {nome:>10}: " + ", ".join(f"{titoli[i]} {w[i]:.1%}"
                                        for i in range(n) if w[i] > 0.01))

# histogram of the losses of the mean-CVaR portfolio
conteggi, bordi = np.histogram(perd_cv * 100, bins=30)
salva_dat(pd.DataFrame({"center": (bordi[:-1] + bordi[1:]) / 2, "freq": conteggi}),
          "cap13_istogramma")
mm_, var_cv, cvar_cv = stat_perdite(perd_cv)
salva_dat(pd.DataFrame({"stat": ["mean", "VaR", "CVaR"],
                        "value": [mm_ * 100, var_cv * 100, cvar_cv * 100]}), "cap13_soglie")

# ----------------------------------------------------------------------
# 3. RETURN-CVaR FRONTIER
# ----------------------------------------------------------------------
intestazione("Return-CVaR frontier")
r_grid = np.linspace(0.02, mu.max() * 0.999, 25)
punti = []
for r in r_grid:
    w, cv = porta_cvar(r)
    if w is not None:
        punti.append((cv * 100, r * 100))
front = pd.DataFrame(punti, columns=["cvar", "ret"])
salva_dat(front, "cap13_frontiera")
print(f"{len(front)} points computed; minimum CVaR {front['cvar'].min():.2f}% "
      f"at return {front.loc[front['cvar'].idxmin(), 'ret']:.1f}%")

# ----------------------------------------------------------------------
# 4. TWO-STAGE SUPPLY CHAIN WITH ADVERSE SCENARIOS
# ----------------------------------------------------------------------
intestazione("Two-stage supply chain: reserved capacity + recourse")
# Two suppliers (F1 cheap but fragile, F2 expensive but reliable) -> one market.
# 1st stage: reserved capacity x_a (€/unit).  2nd stage: flows f_as and shortage u_s.
forn = ["F1", "F2"]
c_pren = {"F1": 2.0, "F2": 3.2}         # reservation cost €/unit
c_uso = {"F1": 4.0, "F2": 5.0}          # purchase cost at delivery time
pen = 40.0                              # penalty per unit of unserved demand
Ss = 400
dom_s = np.maximum(rng.normal(200, 40, Ss), 0)
# availability of the fragile supplier: in 12% of the scenarios it collapses to 30%
disp_f1 = np.where(rng.uniform(size=Ss) < 0.12, 0.3, 1.0)
disp = {"F1": disp_f1, "F2": np.ones(Ss)}


def duestadi(lam, alpha_c2=0.90):
    m = gp.Model("twostage")
    m.Params.OutputFlag = 0
    x = m.addVars(forn, ub=400, name="x")
    f = m.addVars(forn, range(Ss), name="f")
    u = m.addVars(range(Ss), name="u")
    for s in range(Ss):
        for a in forn:
            m.addConstr(f[a, s] <= disp[a][s] * x[a])
        m.addConstr(gp.quicksum(f[a, s] for a in forn) + u[s] >= dom_s[s])
    costo1 = gp.quicksum(c_pren[a] * x[a] for a in forn)
    costo2 = {s: gp.quicksum(c_uso[a] * f[a, s] for a in forn) + pen * u[s]
              for s in range(Ss)}
    atteso = costo1 + gp.quicksum(costo2[s] for s in range(Ss)) / Ss
    if lam > 0:
        eta = m.addVar(lb=-GRB.INFINITY)
        xi = m.addVars(range(Ss))
        m.addConstrs((xi[s] >= costo1 + costo2[s] - eta for s in range(Ss)))
        cvar = eta + gp.quicksum(xi[s] for s in range(Ss)) / (Ss * (1 - alpha_c2))
        m.setObjective((1 - lam) * atteso + lam * cvar, GRB.MINIMIZE)
    else:
        m.setObjective(atteso, GRB.MINIMIZE)
    m.optimize()
    assert m.Status == GRB.OPTIMAL, m.Status
    tot = np.array([c_pren["F1"] * x["F1"].X + c_pren["F2"] * x["F2"].X
                    + sum(c_uso[a] * f[a, s].X for a in forn) + pen * u[s].X
                    for s in range(Ss)])
    serv = np.array([1 - u[s].X / dom_s[s] for s in range(Ss)])
    return {a: x[a].X for a in forn}, tot, serv


righe = []
for lam in [0.0, 0.5, 1.0]:
    cap, tot, serv = duestadi(lam)
    var_t = np.quantile(tot, 0.90)
    cvar_t = tot[tot >= var_t - 1e-9].mean()
    righe.append((lam, cap["F1"], cap["F2"], tot.mean(), cvar_t, serv.mean()))
    print(f"  lambda = {lam:3.1f}: reserve F1 = {cap['F1']:6.1f}, F2 = {cap['F2']:6.1f} | "
          f"mean cost {tot.mean():8.2f}, CVaR90 {cvar_t:8.2f} | mean service {serv.mean():.1%}")
res2 = pd.DataFrame(righe, columns=["lam", "F1", "F2", "mean_cost", "cvar", "service"])
salva_dat(res2, "cap13_duestadi")
print("The risk-averse decision maker reserves more capacity from the reliable supplier:")
print("it pays more on average, but it cuts the tail of the scenarios with shortage.")

# ----------------------------------------------------------------------
# 5. FIGURES
# ----------------------------------------------------------------------
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10.8, 4.0))
ax1.bar((bordi[:-1] + bordi[1:]) / 2, conteggi, width=np.diff(bordi), color=TEAL, alpha=0.75)
ax1.axvline(mm_ * 100, color=VERDE, ls="--", label=f"mean {mm_ * 100:.2f}%")
ax1.axvline(var_cv * 100, color=ARANCIO, ls="-.", label=f"VaR$_{{90}}$ {var_cv * 100:.2f}%")
ax1.axvline(cvar_cv * 100, color=ROSSO, ls="-", label=f"CVaR$_{{90}}$ {cvar_cv * 100:.2f}%")
ax1.set_xlabel("monthly loss of the portfolio (%)")
ax1.set_ylabel("number of scenarios")
ax1.set_title("Distribution of the losses: mean, VaR and CVaR")
ax1.legend(fontsize=8)
ax2.plot(front["cvar"], front["ret"], "-o", color=TEAL, ms=4)
ax2.set_xlabel("CVaR$_{0.90}$ of the monthly loss (%)")
ax2.set_ylabel("expected annual return (%)")
ax2.set_title("Return-CVaR frontier")
salva_figura(fig, "cap13_perdite_frontiera")

print("\nDone: chapter 13.")
