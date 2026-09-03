"""Chapter 12 — The Newsvendor and its variants (scenario-based stochastic LP).

Case study: a bakery deciding how many artisan panettoni to produce.
Price p = 15 €, cost c = 6 €, salvage v = 2 € -> Cu = 9, Co = 4.
Normal demand with mean 100 and standard deviation 20

Contents:
  1. Quantile rule: alpha* = 9/13 = 0.6923 -> q* ~ 110
  2. Scenario LP: it coincides with the empirical quantile
  3. Value of the stochastic solution (VSS) and stability in the number of scenarios
  4. Service constraints (cycle service level, fill rate)
  5. Risk aversion: mean cost - CVaR frontier
  6. Multi-product with a shared budget and correlated demands
"""
import gurobipy as gp
import numpy as np
import pandas as pd
from gurobipy import GRB
from scipy import stats

from stile import (ARANCIO, GRIGIO, ROSSO, TEAL, VERDE, intestazione, plt, salva_dat,
                   salva_dati, salva_figura)

rng = np.random.default_rng(42)

p, c, v = 15.0, 6.0, 2.0
Cu, Co = p - c, c - v                 # 9 and 4
mu_d, sigma_d = 100.0, 20.0

# ----------------------------------------------------------------------
# 1. QUANTILE RULE (analytical solution)
# ----------------------------------------------------------------------
intestazione("Quantile rule")
alpha_star = Cu / (Cu + Co)
q_star = stats.norm.ppf(alpha_star, mu_d, sigma_d)
print(f"Critical fractile alpha* = Cu/(Cu+Co) = {Cu:.0f}/{Cu + Co:.0f} = {alpha_star:.4f}")
print(f"Optimal quantity q* = F^-1({alpha_star:.4f}) = {q_star:.2f} units (mean = {mu_d:.0f})")


def costo_atteso(q):
    """E[Co(q-D)^+ + Cu(D-q)^+] for normal demand (normal loss function)."""
    z = (q - mu_d) / sigma_d
    # E[(D-q)^+] = sigma*(phi(z) - z*(1-Phi(z)))
    perdita = sigma_d * (stats.norm.pdf(z) - z * (1 - stats.norm.cdf(z)))
    ecc = q - mu_d + perdita          # E[(q-D)^+] = q - mu + E[(D-q)^+]
    return Co * ecc + Cu * perdita


print(f"Expected cost at q*: {costo_atteso(q_star):.2f} €  |  at q = mean: "
      f"{costo_atteso(mu_d):.2f} €")

qq = np.linspace(50, 160, 400)
salva_dat(pd.DataFrame({"q": qq, "cost": [costo_atteso(q) for q in qq]}), "cap12_costo")

# ----------------------------------------------------------------------
# 2. SCENARIO LP
# ----------------------------------------------------------------------
intestazione(f"Scenario LP (S = {600})")
S = 600   # with the pip licence (2000 vars/constraints) the CVaR requires S <= 600
dom = np.maximum(rng.normal(mu_d, sigma_d, S), 0.0)
salva_dati(pd.DataFrame({"scenario": range(1, S + 1), "demand": dom}), "newsvendor_scenari")


def newsvendor_lp(dom_s, prob=None, lam=0.0, alpha_cvar=0.90):
    """LP: min (1-lam)·expected cost + lam·CVaR_alpha(cost). lam=0 -> risk neutral."""
    Sn = len(dom_s)
    pi = np.full(Sn, 1 / Sn) if prob is None else prob
    m = gp.Model("newsvendor")
    m.Params.OutputFlag = 0
    q = m.addVar(name="q")
    o = m.addVars(Sn, name="o")                 # overage
    u = m.addVars(Sn, name="u")                 # underage
    m.addConstrs((o[s] >= q - dom_s[s] for s in range(Sn)), name="over")
    m.addConstrs((u[s] >= dom_s[s] - q for s in range(Sn)), name="under")
    costo_s = {s: Co * o[s] + Cu * u[s] for s in range(Sn)}
    atteso = gp.quicksum(pi[s] * costo_s[s] for s in range(Sn))
    if lam > 0:
        eta = m.addVar(lb=-GRB.INFINITY, name="eta")
        xi = m.addVars(Sn, name="xi")
        m.addConstrs((xi[s] >= costo_s[s] - eta for s in range(Sn)), name="cvar")
        cvar = eta + gp.quicksum(pi[s] * xi[s] for s in range(Sn)) / (1 - alpha_cvar)
        m.setObjective((1 - lam) * atteso + lam * cvar, GRB.MINIMIZE)
    else:
        m.setObjective(atteso, GRB.MINIMIZE)
    m.optimize()
    assert m.Status == GRB.OPTIMAL
    costi = np.array([Co * max(q.X - d, 0) + Cu * max(d - q.X, 0) for d in dom_s])
    return q.X, float(costi @ pi), costi


q_lp, costo_lp, costi_s = newsvendor_lp(dom)
q_emp = np.quantile(dom, alpha_star)
print(f"optimal q of the LP: {q_lp:.2f}  |  empirical quantile at {alpha_star:.2%}: {q_emp:.2f}")
print(f"Expected cost (on the scenarios): {costo_lp:.2f} €  |  theoretical: {costo_atteso(q_lp):.2f} €")

# ----------------------------------------------------------------------
# 3. VSS AND STABILITY
# ----------------------------------------------------------------------
intestazione("Value of the stochastic solution (VSS)")
costi_det = np.array([Co * max(mu_d - d, 0) + Cu * max(d - mu_d, 0) for d in dom])
print(f"'Naive' decision q = E[D] = {mu_d:.0f}: expected cost {costi_det.mean():.2f} €")
print(f"Stochastic decision q = {q_lp:.1f}    : expected cost {costo_lp:.2f} €")
print(f"VSS = {costi_det.mean() - costo_lp:.2f} € per selling cycle")

intestazione("Stability: optimal q as the number of scenarios varies")
righe = []
for Sn in [10, 30, 100, 300, 1000, 3000]:
    stime = []
    for rep in range(30):
        dd = np.maximum(rng.normal(mu_d, sigma_d, Sn), 0)
        stime.append(np.quantile(dd, alpha_star))
    righe.append((Sn, np.mean(stime), np.std(stime)))
    print(f"  S = {Sn:5d}: mean q {np.mean(stime):7.2f}, std dev across replications {np.std(stime):5.2f}")
stab = pd.DataFrame(righe, columns=["S", "q_mean", "q_std"])
salva_dat(stab, "cap12_stabilita")

# ----------------------------------------------------------------------
# 4. SERVICE CONSTRAINTS
# ----------------------------------------------------------------------
intestazione("Service levels")
for beta in [0.90, 0.95, 0.99]:
    q_sl = stats.norm.ppf(beta, mu_d, sigma_d)
    extra = costo_atteso(q_sl) - costo_atteso(q_star)
    print(f"  cycle service level {beta:.0%}: q = {q_sl:6.2f} "
          f"(cost +{extra:5.2f} € with respect to the economic optimum)")
q_fill = q_star
fill = 1 - (costo_atteso(q_star) / Cu - Co / Cu * 0) / mu_d  # for teaching display only
perdita_att = sigma_d * (stats.norm.pdf((q_star - mu_d) / sigma_d)
                         - (q_star - mu_d) / sigma_d
                         * (1 - stats.norm.cdf((q_star - mu_d) / sigma_d)))
print(f"  fill rate at q*: {1 - perdita_att / mu_d:.2%} "
      f"(the probability of NOT having a stock-out is instead {alpha_star:.2%})")

# ----------------------------------------------------------------------
# 5. RISK AVERSION: cost-CVaR frontier
# ----------------------------------------------------------------------
intestazione("Mean cost - CVaR frontier (alpha = 0.90)")
alpha_cv = 0.90
front = []
for lam in [0, 0.25, 0.5, 0.75, 1.0]:
    q_l, cm, costi_l = newsvendor_lp(dom, lam=lam, alpha_cvar=alpha_cv)
    var_l = np.quantile(costi_l, alpha_cv)
    cvar_l = costi_l[costi_l >= var_l - 1e-9].mean()
    front.append((lam, q_l, cm, cvar_l))
    print(f"  lambda = {lam:4.2f}: q = {q_l:7.2f}, mean cost = {cm:6.2f}, "
          f"CVaR90 = {cvar_l:6.2f}")
front = pd.DataFrame(front, columns=["lam", "q", "mean_cost", "cvar"])
salva_dat(front, "cap12_frontiera_cvar")
print("Increasing lambda means ordering more: it costs on average, it protects in the worst scenarios.")

# ----------------------------------------------------------------------
# 6. MULTI-PRODUCT WITH BUDGET AND CORRELATED DEMANDS
# ----------------------------------------------------------------------
intestazione("Multi-product: 3 sweets, production budget 1200 €")
nomi_p = ["panettone", "pandoro", "torrone"]
mu_m = np.array([100.0, 80.0, 60.0])
sig_m = np.array([20.0, 25.0, 15.0])
costi_c = np.array([6.0, 5.0, 4.0])
Cu_m = np.array([9.0, 7.0, 5.0])
Co_m = np.array([4.0, 3.5, 2.5])
rho_corr = 0.7
Sigma = np.diag(sig_m) @ (np.full((3, 3), rho_corr) + (1 - rho_corr) * np.eye(3)) @ np.diag(sig_m)
Sm = 300  # pip licence limit: the multi-product model has 3+6S variables
dom_m = np.maximum(rng.multivariate_normal(mu_m, Sigma, Sm), 0)
budget = 1200.0

mm = gp.Model("newsvendor_multi")
mm.Params.OutputFlag = 0
qm = mm.addVars(3, name="q")
om = mm.addVars(3, Sm, name="o")
um = mm.addVars(3, Sm, name="u")
mm.addConstrs((om[i, s] >= qm[i] - dom_m[s, i] for i in range(3) for s in range(Sm)))
mm.addConstrs((um[i, s] >= dom_m[s, i] - qm[i] for i in range(3) for s in range(Sm)))
v_bud = mm.addConstr(gp.quicksum(costi_c[i] * qm[i] for i in range(3)) <= budget, name="budget")
mm.setObjective(gp.quicksum((Co_m[i] * om[i, s] + Cu_m[i] * um[i, s]) / Sm
                            for i in range(3) for s in range(Sm)), GRB.MINIMIZE)
mm.optimize()
assert mm.Status == GRB.OPTIMAL
print(f"{'product':>10} | {'q no budget':>14} | {'q w/ budget':>12}")
for i in range(3):
    q_solo = np.quantile(dom_m[:, i], Cu_m[i] / (Cu_m[i] + Co_m[i]))
    print(f"{nomi_p[i]:>10} | {q_solo:14.1f} | {qm[i].X:12.1f}")
spesa = sum(costi_c[i] * qm[i].X for i in range(3))
print(f"Spend: {spesa:.2f} / {budget:.0f} €  |  shadow price of the budget: {v_bud.Pi:.4f} "
      f"(reduction of the expected cost per extra 1 € of budget)")

# ----------------------------------------------------------------------
# 7. FIGURES
# ----------------------------------------------------------------------
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10.5, 4.0))
ax1.plot(qq, [costo_atteso(q) for q in qq], color=TEAL, lw=2)
ax1.axvline(mu_d, color=GRIGIO, ls="--", label=f"mean = {mu_d:.0f}")
ax1.axvline(q_star, color=ROSSO, ls="-.", label=f"q* = {q_star:.1f}")
ax1.set_xlabel("ordered quantity q"); ax1.set_ylabel("expected cost (€)")
ax1.set_title("The minimum is at the 69th percentile, not at the mean")
ax1.legend(fontsize=8)
ax2.errorbar(stab["S"], stab["q_mean"], yerr=stab["q_std"], fmt="-o", color=TEAL,
             capsize=3)
ax2.axhline(q_star, color=ROSSO, ls="-.", label="theoretical q*")
ax2.set_xscale("log")
ax2.set_xlabel("number of scenarios S"); ax2.set_ylabel("optimal q")
ax2.set_title("Stability of the scenario solution")
ax2.legend(fontsize=8)
salva_figura(fig, "cap12_quantile_stabilita")

fig, ax = plt.subplots()
ax.plot(front["cvar"], front["mean_cost"], "-o", color=TEAL)
for _, r in front.iterrows():
    ax.annotate(f"  $\\lambda$={r['lam']:.2f}, q={r['q']:.0f}", (r["cvar"], r["mean_cost"]),
                fontsize=8)
ax.set_xlabel("CVaR$_{0.90}$ of the cost (€)"); ax.set_ylabel("mean cost (€)")
ax.set_title("Mean cost - tail risk frontier")
salva_figura(fig, "cap12_frontiera")

print("\nDone: chapter 12.")
