"""Chapter 6 — Markowitz portfolio (convex QP).

Case study: 8 securities (sector ETFs), 60 monthly returns simulated with a
one-factor market model + idiosyncratic noise.

Contents:
  1. Estimation of mu and Q from the historical data
  2. Global minimum-variance portfolio and portfolio with a minimum return
  3. Efficient frontier and composition along the frontier
  4. Effect of the per-security upper bounds (u_i)
"""
import gurobipy as gp
import numpy as np
import pandas as pd
from gurobipy import GRB

from stile import (ARANCIO, CICLO, GRIGIO, ROSSO, TEAL, intestazione, plt, salva_dat,
                   salva_dati, salva_figura)

rng = np.random.default_rng(42)

# ----------------------------------------------------------------------
# 1. DATA: 60 months of simulated returns (one-factor model)
# ----------------------------------------------------------------------
titoli = ["ENE", "FIN", "TEC", "IND", "SAN", "CON", "UTL", "MAT"]
n, T = len(titoli), 60
beta = np.array([1.1, 1.3, 1.5, 1.0, 0.6, 0.8, 0.4, 1.2])       # market exposure
alfa_ann = np.array([0.05, 0.06, 0.11, 0.05, 0.045, 0.05, 0.035, 0.06])  # excess return
sigma_idio = np.array([0.05, 0.055, 0.07, 0.04, 0.03, 0.035, 0.02, 0.06])  # monthly idio vol

mercato = rng.normal(0.004, 0.035, T)                 # monthly market factor
R = (alfa_ann[None, :] / 12 + np.outer(mercato, beta)
     + rng.normal(0, sigma_idio, (T, n)))             # T x n matrix of returns

rend = pd.DataFrame(R, columns=titoli)
rend.insert(0, "month", range(1, T + 1))
salva_dati(rend, "markowitz_rendimenti")

mu = R.mean(axis=0) * 12                # annualised expected return
Q = np.cov(R.T) * 12                    # annualised covariance
vol = np.sqrt(np.diag(Q))

intestazione("Statistics of the securities (annualised)")
for i, tt in enumerate(titoli):
    print(f"  {tt}: mu = {mu[i]:6.2%}   vol = {vol[i]:6.2%}")


def portafoglio(r_min=None, u=1.0):
    """QP: minimum variance with optional minimum return and per-security cap."""
    m = gp.Model("markowitz")
    m.Params.OutputFlag = 0
    x = m.addVars(n, ub=u, name="x")
    m.addConstr(x.sum() == 1, name="budget")
    if r_min is not None:
        m.addConstr(gp.quicksum(mu[i] * x[i] for i in range(n)) >= r_min, name="return")
    m.setObjective(gp.quicksum(Q[i, j] * x[i] * x[j]
                               for i in range(n) for j in range(n)), GRB.MINIMIZE)
    m.optimize()
    if m.Status != GRB.OPTIMAL:
        return None, None, None
    w = np.array([x[i].X for i in range(n)])
    return w, float(mu @ w), float(np.sqrt(w @ Q @ w))


# ----------------------------------------------------------------------
# 2. NOTABLE PORTFOLIOS
# ----------------------------------------------------------------------
intestazione("Notable portfolios")
w_mv, r_mv, v_mv = portafoglio()
print(f"Global minimum variance : return {r_mv:6.2%}, volatility {v_mv:6.2%}")
w_eq = np.ones(n) / n
print(f"Equally weighted (1/n)  : return {mu @ w_eq:6.2%}, "
      f"volatility {np.sqrt(w_eq @ Q @ w_eq):6.2%}")
r_obb = 0.08
w_8, r_8, v_8 = portafoglio(r_min=r_obb)
print(f"Minimum return 8%       : return {r_8:6.2%}, volatility {v_8:6.2%}")
print("\nComposition (weights > 1%):")
for nome, w in [("min variance", w_mv), ("min return 8%", w_8)]:
    quote = ", ".join(f"{titoli[i]} {w[i]:.1%}" for i in range(n) if w[i] > 0.01)
    print(f"  {nome:>14}: {quote}")

# ----------------------------------------------------------------------
# 3. EFFICIENT FRONTIER (with and without the cap u_i = 30%)
# ----------------------------------------------------------------------
intestazione("Efficient frontier")
r_grid = np.linspace(r_mv, mu.max() * 0.999, 30)
frontiere = {}
for u, etich in [(1.0, "no caps"), (0.30, "u_i = 30%")]:
    punti, composizioni = [], []
    for r in r_grid:
        w, rr, vv = portafoglio(r_min=r, u=u)
        if w is not None:
            punti.append((vv, rr))
            composizioni.append(w)
    frontiere[etich] = (np.array(punti), np.array(composizioni))
    print(f"  frontier '{etich}': {len(punti)} points computed")

pf = frontiere["no caps"][0]
salva_dati(pd.DataFrame({"volatility": pf[:, 0], "return": pf[:, 1]}),
           "markowitz_frontiera")

# ----------------------------------------------------------------------
# 4. FIGURES (pgfplots data + matplotlib preview)
# ----------------------------------------------------------------------
pf_lim = frontiere["u_i = 30%"][0]
salva_dat(pd.DataFrame({"vol": pf[:, 0] * 100, "ret": pf[:, 1] * 100}), "cap06_front_libera")
salva_dat(pd.DataFrame({"vol": pf_lim[:, 0] * 100, "ret": pf_lim[:, 1] * 100}),
          "cap06_front_limiti")
salva_dat(pd.DataFrame({"security": titoli, "vol": vol * 100, "mu": mu * 100}), "cap06_titoli")
salva_dat(pd.DataFrame({
    "name": ["minvar", "equalweight"],
    "vol": [v_mv * 100, float(np.sqrt(w_eq @ Q @ w_eq)) * 100],
    "ret": [r_mv * 100, float(mu @ w_eq) * 100],
}), "cap06_speciali")
punti_sl, comp_sl = frontiere["no caps"]
salva_dat(pd.DataFrame({"ret": punti_sl[:, 1] * 100,
                        **{titoli[i]: comp_sl[:, i] * 100 for i in range(n)}}),
          "cap06_composizione")

fig, ax = plt.subplots()
for (etich, (punti, _)), colore in zip(frontiere.items(), [TEAL, ARANCIO]):
    ax.plot(punti[:, 0] * 100, punti[:, 1] * 100, "-", color=colore, lw=2, label=etich)
ax.scatter(vol * 100, mu * 100, color=GRIGIO, s=28, zorder=3, label="individual securities")
for i, tt in enumerate(titoli):
    ax.annotate(" " + tt, (vol[i] * 100, mu[i] * 100), fontsize=8, color=GRIGIO)
ax.scatter([v_mv * 100], [r_mv * 100], marker="*", s=200, color=ROSSO, zorder=4,
           label="minimum variance")
ax.scatter([np.sqrt(w_eq @ Q @ w_eq) * 100], [mu @ w_eq * 100], marker="D", s=60,
           color="#8E44AD", zorder=4, label="equally weighted 1/n")
ax.set_xlabel("annual volatility (%)")
ax.set_ylabel("expected annual return (%)")
ax.set_title("Efficient frontier: diversification dominates the individual securities")
ax.legend(fontsize=8)
salva_figura(fig, "cap06_frontiera")

punti, comp = frontiere["no caps"]
fig, ax = plt.subplots()
ax.stackplot(punti[:, 1] * 100, (comp.T * 100), labels=titoli, colors=CICLO, alpha=0.9)
ax.set_xlabel("required return $\\bar r$ (%)")
ax.set_ylabel("portfolio composition (%)")
ax.set_title("Optimal composition along the frontier")
ax.legend(fontsize=7, ncol=4, loc="lower left")
ax.set_ylim(0, 100)
salva_figura(fig, "cap06_composizione")

# sensitivity: price of the return constraint (multiplier ~ slope of the frontier)
intestazione("Sensitivity: cost (in variance) of the required return")
for r in [0.06, 0.08, 0.10, 0.12]:
    w, rr, vv = portafoglio(r_min=r)
    if w is None:
        print(f"  r_min = {r:.0%}: infeasible (beyond the maximum return)")
        continue
    eps = 0.002
    w2, _, vv2 = portafoglio(r_min=r + eps)
    pend = (vv2**2 - vv**2) / eps if w2 is not None else float("nan")
    print(f"  r_min = {r:5.1%}: vol {vv:6.2%}  |  d(variance)/d(r_min) ~ {pend:7.4f}")

print("\nDone: chapter 6.")
