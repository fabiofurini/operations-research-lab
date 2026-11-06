"""Chapter 12 — Data Envelopment Analysis (LP).

Case study: 12 branches of a bank (branches 1, 2, ..., 12) compared on
2 inputs (staff in FTE, operating costs in thousands of €) and 2 outputs
(loans and deposits in millions of €). Realistic synthetic data generated
with a fixed seed.

Contents:
  1. Branch data (generator with a fixed seed)
  2. Worked example: 5 units, one input and one output
  3. Input-oriented CCR: multiplier form (primal)
  4. CCR: envelopment form (dual), theta = efficiency, peers and lambda
  5. BCC (variable returns to scale) and scale efficiency
  6. Slacks, weak and strong efficiency, input targets
  7. Sensitivity: shadow prices verified by perturbation, and stability
  8. Figures (data for pgfplots + matplotlib preview)
"""
import gurobipy as gp
import numpy as np
import pandas as pd
from gurobipy import GRB

from stile import (ARANCIO, BLU, GRIGIO, ROSSO, TEAL, intestazione, plt, salva_dat,
                   salva_dati, salva_figura)

TOL = 1e-6

# ----------------------------------------------------------------------
# 1. BRANCH DATA
# ----------------------------------------------------------------------
# Generator: staff between 8 and 30 FTE; costs proportional to staff with a
# fixed share; outputs from a production function with decreasing returns to
# scale, multiplied by a random inefficiency exp(-|N(0, 0.25)|) and split
# between loans and deposits.
rng = np.random.default_rng(42)
n = 12                                                    # branches
personale = rng.integers(8, 31, n).astype(float)          # FTE
costi = np.round(personale * rng.uniform(38, 52, n) + rng.uniform(80, 260, n), -1)  # k€
efficienza_vera = np.exp(-np.abs(rng.normal(0, 0.25, n)))
volume = 9.0 * personale ** 0.55 * (costi / 100) ** 0.30 * efficienza_vera
quota = rng.uniform(0.38, 0.62, n)
prestiti = np.round(volume * quota, 1)                    # M€
depositi = np.round(volume * (1 - quota) * 1.3, 1)        # M€

filiali = list(range(1, n + 1))
X = np.vstack([personale, costi])                         # inputs:  m x n
Y = np.vstack([prestiti, depositi])                       # outputs: p x n
nomi_in = ["staff", "costs"]
nomi_out = ["loans", "deposits"]

dati = pd.DataFrame({"branch": filiali, "staff": personale.astype(int),
                     "operating_costs": costi.astype(int),
                     "loans": prestiti, "deposits": depositi})
salva_dati(dati, "dea_filiali")
intestazione("Branch data")
print(dati.to_string(index=False))


def moltiplicatori(X, Y, o):
    """Input-oriented CCR, multiplier form (Charnes-Cooper LP)."""
    m_, n_ = X.shape
    p_ = Y.shape[0]
    md = gp.Model("dea_multipliers")
    md.Params.OutputFlag = 0
    md.Params.FeasibilityTol = 1e-9
    md.Params.OptimalityTol = 1e-9
    u = md.addVars(p_, name="u")                            # output weights
    v = md.addVars(m_, name="v")                            # input weights
    norm = md.addConstr(gp.quicksum(v[i] * X[i, o] for i in range(m_)) == 1,
                        name="normalisation")
    rapp = md.addConstrs(
        (gp.quicksum(u[r] * Y[r, j] for r in range(p_))
         - gp.quicksum(v[i] * X[i, j] for i in range(m_)) <= 0 for j in range(n_)),
        name="ratio")
    md.setObjective(gp.quicksum(u[r] * Y[r, o] for r in range(p_)), GRB.MAXIMIZE)
    md.optimize()
    assert md.Status == GRB.OPTIMAL
    return (md.ObjVal, np.array([u[r].X for r in range(p_)]),
            np.array([v[i].X for i in range(m_)]), norm.Pi,
            np.array([rapp[j].Pi for j in range(n_)]))


def inviluppo(X, Y, o, vrs=False, rhs_out=None):
    """Input-oriented envelopment form: CCR (vrs=False) or BCC (vrs=True).

    rhs_out, if given, replaces the right-hand side of the output constraints."""
    m_, n_ = X.shape
    p_ = Y.shape[0]
    md = gp.Model("dea_envelopment")
    md.Params.OutputFlag = 0
    md.Params.FeasibilityTol = 1e-9
    md.Params.OptimalityTol = 1e-9
    theta = md.addVar(lb=-GRB.INFINITY, name="theta")
    lam = md.addVars(n_, name="lambda")
    c_in = md.addConstrs(
        (theta * X[i, o] - gp.quicksum(lam[j] * X[i, j] for j in range(n_)) >= 0
         for i in range(m_)), name="input")
    b = Y[:, o] if rhs_out is None else rhs_out
    c_out = md.addConstrs(
        (gp.quicksum(lam[j] * Y[r, j] for j in range(n_)) >= b[r] for r in range(p_)),
        name="output")
    if vrs:
        md.addConstr(lam.sum() == 1, name="convexity")
    md.setObjective(theta, GRB.MINIMIZE)
    md.optimize()
    assert md.Status == GRB.OPTIMAL
    return md, theta, lam, c_in, c_out


def scarti(X, Y, o, theta, vrs=False):
    """Second phase: with theta fixed, maximise the sum of the slacks."""
    m_, n_ = X.shape
    p_ = Y.shape[0]
    md = gp.Model("dea_slacks")
    md.Params.OutputFlag = 0
    md.Params.FeasibilityTol = 1e-9
    md.Params.OptimalityTol = 1e-9
    lam = md.addVars(n_, name="lambda")
    s_in = md.addVars(m_, name="s_minus")
    s_out = md.addVars(p_, name="s_plus")
    md.addConstrs((gp.quicksum(lam[j] * X[i, j] for j in range(n_)) + s_in[i]
                   == theta * X[i, o] for i in range(m_)), name="input")
    md.addConstrs((gp.quicksum(lam[j] * Y[r, j] for j in range(n_)) - s_out[r]
                   == Y[r, o] for r in range(p_)), name="output")
    if vrs:
        md.addConstr(lam.sum() == 1, name="convexity")
    md.setObjective(s_in.sum() + s_out.sum(), GRB.MAXIMIZE)
    md.optimize()
    assert md.Status == GRB.OPTIMAL
    pulisci = lambda a: np.where(np.abs(a) < TOL, 0.0, a)
    return (pulisci(np.array([lam[j].X for j in range(n_)])),
            pulisci(np.array([s_in[i].X for i in range(m_)])),
            pulisci(np.array([s_out[r].X for r in range(p_)])))


def testo_peer(lam):
    return " ".join(f"{j + 1}:{l:.3f}" for j, l in enumerate(lam) if l > TOL)


# ----------------------------------------------------------------------
# 2. WORKED EXAMPLE: 5 units, one input and one output
# ----------------------------------------------------------------------
intestazione("Worked example: 5 units, one input and one output")
Xe = np.array([[2.0, 4.0, 6.0, 5.0, 2.0]])
Ye = np.array([[2.0, 6.0, 7.0, 3.0, 1.0]])
for o in range(Xe.shape[1]):
    h, u, v, pi_norm, pi_rapp = moltiplicatori(Xe, Ye, o)
    md, th, lam, _, _ = inviluppo(Xe, Ye, o)
    mb, thb, _, _, _ = inviluppo(Xe, Ye, o, vrs=True)
    lam_b, sm_b, sp_b = scarti(Xe, Ye, o, thb.X, vrs=True)
    lam_c, _, _ = scarti(Xe, Ye, o, th.X)
    print(f"unit {o + 1}: x = {Xe[0, o]:.0f}, y = {Ye[0, o]:.0f}, y/x = {Ye[0, o] / Xe[0, o]:.4f} | "
          f"CCR h = {h:.4f} (u = {u[0]:.4f}, v = {v[0]:.4f}), theta = {th.X:.4f}, "
          f"lambda = {testo_peer(lam_c)} | "
          f"BCC theta = {thb.X:.4f}, lambda = {testo_peer(lam_b)}, "
          f"output slack = {sp_b[0]:.4f}")

# ----------------------------------------------------------------------
# 3. CCR: MULTIPLIER FORM (primal)
# ----------------------------------------------------------------------
intestazione("Input-oriented CCR: multiplier form")
ris = {}
for o in range(n):
    h, u, v, pi_norm, pi_rapp = moltiplicatori(X, Y, o)
    ris[o] = {"h": h, "u": u, "v": v, "pi_norm": pi_norm, "pi_rapp": pi_rapp}
    print(f"branch {o + 1:2d}: h = {h:.4f} | u = ({u[0]:.5f}, {u[1]:.5f}) "
          f"v = ({v[0]:.5f}, {v[1]:.6f}) | Pi normalisation = {pi_norm:.4f}")

# ----------------------------------------------------------------------
# 4. CCR: ENVELOPMENT FORM (dual), peers and lambda
# ----------------------------------------------------------------------
intestazione("CCR: envelopment form (dual) and comparison with the multipliers")
for o in range(n):
    md, th, lam, c_in, c_out = inviluppo(X, Y, o)
    ris[o]["ccr"] = th.X
    # strong duality: theta = h; the Pi of the envelopment form are weights u and v
    assert abs(th.X - ris[o]["h"]) < 1e-7
    assert abs(ris[o]["pi_norm"] - th.X) < 1e-7
    pi_in = np.array([c_in[i].Pi for i in range(2)])
    pi_out = np.array([c_out[r].Pi for r in range(2)])
    print(f"branch {o + 1:2d}: theta = {th.X:.4f} = h = {ris[o]['h']:.4f} | "
          f"Pi output = ({pi_out[0]:.5f}, {pi_out[1]:.5f}) "
          f"Pi input = ({pi_in[0]:.5f}, {pi_in[1]:.6f})")
print("Check: theta (envelopment) = h (multipliers) and Pi of the normalisation = theta "
      "for all 12 branches.")

# ----------------------------------------------------------------------
# 5. BCC (variable returns to scale) and scale efficiency
# ----------------------------------------------------------------------
intestazione("CCR, BCC and scale efficiencies")
print(" branch    CCR     BCC   scale    sum lambda (CCR)   returns")
righe_eff = []
for o in range(n):
    mb, thb, _, _, _ = inviluppo(X, Y, o, vrs=True)
    lam, s_in, s_out = scarti(X, Y, o, ris[o]["ccr"])
    ris[o].update({"bcc": thb.X, "lam": lam, "s_in": s_in, "s_out": s_out})
    scala = ris[o]["ccr"] / thb.X
    somma = lam.sum()
    if abs(ris[o]["ccr"] - 1) < TOL:
        rts = "constant"
    else:
        rts = "increasing" if somma < 1 - TOL else ("decreasing" if somma > 1 + TOL else "constant")
    righe_eff.append((o + 1, ris[o]["ccr"], thb.X, scala, somma))
    print(f"{o + 1:7d}  {ris[o]['ccr']:.4f}  {thb.X:.4f}  {scala:.4f}  {somma:18.3f}   {rts}")
eff = pd.DataFrame(righe_eff, columns=["branch", "ccr", "bcc", "scale", "sum_lambda"])
salva_dati(eff.round(6), "dea_efficienze")
print(f"CCR-efficient branches: {[o + 1 for o in range(n) if abs(ris[o]['ccr'] - 1) < TOL]}")
print(f"BCC-efficient branches: {[o + 1 for o in range(n) if abs(ris[o]['bcc'] - 1) < TOL]}")
print(f"Mean CCR efficiency: {eff['ccr'].mean():.4f}; mean BCC: {eff['bcc'].mean():.4f}")

# ----------------------------------------------------------------------
# 6. SLACKS, WEAK AND STRONG EFFICIENCY, TARGETS
# ----------------------------------------------------------------------
intestazione("Slacks and input targets (CCR, second phase)")
righe_t = []
for o in range(n):
    r = ris[o]
    deb = abs(r["ccr"] - 1) < TOL and (r["s_in"].sum() + r["s_out"].sum()) > TOL
    if deb:
        print(f"branch {o + 1}: weakly efficient (theta = 1 with positive slacks)")
    if abs(r["ccr"] - 1) < TOL:
        continue
    t_in = r["ccr"] * X[:, o] - r["s_in"]
    t_out = Y[:, o] + r["s_out"]
    righe_t.append((o + 1, r["ccr"], testo_peer(r["lam"]), *t_in, *t_out, *r["s_in"], *r["s_out"]))
    print(f"branch {o + 1:2d}: theta = {r['ccr']:.4f} | peers {testo_peer(r['lam'])} | "
          f"input slacks ({r['s_in'][0]:.2f}, {r['s_in'][1]:.2f}) output ({r['s_out'][0]:.2f}, {r['s_out'][1]:.2f}) | "
          f"target staff {t_in[0]:.2f} (from {X[0, o]:.0f}), costs {t_in[1]:.1f} (from {X[1, o]:.0f})")
deboli = [o + 1 for o in range(n) if abs(ris[o]["ccr"] - 1) < TOL
          and ris[o]["s_in"].sum() + ris[o]["s_out"].sum() > TOL]
print(f"Efficient branches with positive slacks (weakly efficient): {deboli if deboli else 'none'}")
target = pd.DataFrame(righe_t, columns=[
    "branch", "theta", "peers", "staff_target", "costs_target", "loans_target",
    "deposits_target", "slack_staff", "slack_costs", "slack_loans", "slack_deposits"])
salva_dati(target.round(4), "dea_target")

efficienti = [j for j in range(n) if abs(ris[j]["ccr"] - 1) < TOL]
conta = {j + 1: sum(1 for o in range(n) if abs(ris[o]["ccr"] - 1) > TOL and ris[o]["lam"][j] > TOL)
         for j in efficienti}
print("How many times each efficient branch is a peer of an inefficient one: "
      + ", ".join(f"{j}: {c}" for j, c in conta.items()))

# ----------------------------------------------------------------------
# 7. SENSITIVITY: shadow prices verified by perturbation, and stability
# ----------------------------------------------------------------------
intestazione("Sensitivity: shadow prices of the output constraints (least efficient branch)")
o_min = int(eff["ccr"].idxmin())
md, th, lam, c_in, c_out = inviluppo(X, Y, o_min)
print(f"branch {o_min + 1}: theta = {th.X:.4f}")
for r in range(2):
    c = c_out[r]
    print(f"  output {nomi_out[r]:8s}: y = {Y[r, o_min]:.1f} | Pi = {c.Pi:.5f} | "
          f"valid for the right-hand side in [{c.SARHSLow:.2f}, {c.SARHSUp:.2f}]")
r_star = int(np.argmax([c_out[r].Pi for r in range(2)]))
nuovo = Y[:, o_min].copy()
nuovo[r_star] += 1
md2, th2, _, _, _ = inviluppo(X, Y, o_min, rhs_out=nuovo)
print(f"Check: right-hand side of {nomi_out[r_star]} from {Y[r_star, o_min]:.1f} to {nuovo[r_star]:.1f} "
      f"-> theta from {th.X:.4f} to {th2.X:.4f} (change {th2.X - th.X:+.5f} = Pi {c_out[r_star].Pi:.5f})")
print(f"Comparison: primal weight u = ({ris[o_min]['u'][0]:.5f}, {ris[o_min]['u'][1]:.5f})")

intestazione("Stability: remove the most cited peer and recompute the CCR")
j_peer = max(conta, key=conta.get) - 1
resto = [j for j in range(n) if j != j_peer]
Xr, Yr = X[:, resto], Y[:, resto]
cambi = []
for k, o in enumerate(resto):
    md, th, _, _, _ = inviluppo(Xr, Yr, k)
    cambi.append((o + 1, ris[o]["ccr"], th.X))
    seg = "  <- changes" if th.X - ris[o]["ccr"] > 1e-6 else ""
    print(f"  branch {o + 1:2d}: CCR {ris[o]['ccr']:.4f} -> {th.X:.4f}{seg}")
print(f"Without branch {j_peer + 1}: {sum(1 for c in cambi if c[2] - c[1] > 1e-6)} branches "
      f"change efficiency; newly efficient: "
      f"{[c[0] for c in cambi if abs(c[2] - 1) < TOL and abs(c[1] - 1) > TOL]}")

# ----------------------------------------------------------------------
# 8. FIGURES (data for pgfplots + matplotlib preview)
# ----------------------------------------------------------------------
salva_dat(eff[["branch", "ccr", "bcc"]], "cap12_efficienze")

# one-input, one-output view: staff -> loans
Xp, Yp = X[[0], :], Y[[0], :]
bcc_p = []
for o in range(n):
    md, th, _, _, _ = inviluppo(Xp, Yp, o, vrs=True)
    _, s_in, s_out = scarti(Xp, Yp, o, th.X, vrs=True)
    bcc_p.append((th.X, s_in.sum() + s_out.sum()))
ccr_p = []
for o in range(n):
    md, th, _, _, _ = inviluppo(Xp, Yp, o)
    ccr_p.append(th.X)
frontiera = sorted((Xp[0, o], Yp[0, o]) for o in range(n)
                   if abs(bcc_p[o][0] - 1) < TOL and bcc_p[o][1] < TOL)
pend = max(Yp[0] / Xp[0])
x_max = 32.0
vrs = [(frontiera[0][0], 0.0)] + frontiera + [(x_max, frontiera[-1][1])]
salva_dat(pd.DataFrame({"branch": filiali, "staff": Xp[0], "loans": Yp[0],
                        "ccr": np.round(ccr_p, 6), "bcc": np.round([b[0] for b in bcc_p], 6)}),
          "cap12_frontiera_punti")
salva_dat(pd.DataFrame(vrs, columns=["staff", "loans"]), "cap12_frontiera_vrs")
salva_dat(pd.DataFrame({"staff": [0.0, x_max], "loans": [0.0, pend * x_max]}),
          "cap12_frontiera_crs")
intestazione("One-input, one-output view: staff -> loans")
print(f"Slope of the CCR frontier (loans per FTE): {pend:.4f}")
print("Efficiencies in the view (CCR/BCC): "
      + "; ".join(f"{o + 1}: {ccr_p[o]:.3f}/{bcc_p[o][0]:.3f}" for o in range(n)))
print("Vertices of the BCC frontier: " + ", ".join(f"({a:.0f}, {b:.1f})" for a, b in frontiera))

fig, ax = plt.subplots()
ax.plot([0, x_max], [0, pend * x_max], "--", color=ROSSO, label="CCR frontier (constant scale)")
ax.plot([a for a, _ in vrs], [b for _, b in vrs], "-", color=TEAL, lw=2,
        label="BCC frontier (variable scale)")
ax.scatter(Xp[0], Yp[0], color=BLU, zorder=3, label="branches")
for o in range(n):
    ax.annotate(str(o + 1), (Xp[0, o], Yp[0, o]), textcoords="offset points", xytext=(4, 4),
                fontsize=8)
ax.set_xlim(0, x_max); ax.set_ylim(0, 75)
ax.set_xlabel("staff (FTE)"); ax.set_ylabel("loans (M€)")
ax.set_title("CCR and BCC efficient frontiers: staff and loans")
ax.legend(fontsize=8)
salva_figura(fig, "cap12_frontiera")

fig, ax = plt.subplots()
larg = 0.38
ax.bar(np.array(filiali) - larg / 2, eff["ccr"], width=larg, color=TEAL, label="CCR")
ax.bar(np.array(filiali) + larg / 2, eff["bcc"], width=larg, color=ARANCIO, label="BCC")
ax.axhline(1, color=GRIGIO, ls=":")
ax.set_xticks(filiali)
ax.set_ylim(0.6, 1.12)
ax.set_xlabel("branch"); ax.set_ylabel("efficiency")
ax.set_title("CCR and BCC efficiencies of the 12 branches")
ax.legend(fontsize=8, loc="upper center", ncol=2)
salva_figura(fig, "cap12_efficienze")

print("\nDone: chapter 12.")
