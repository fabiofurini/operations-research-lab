"""Chapter 16 — Robust and quantile regression (LP).

Case study: the bakery of chapter 12. Sixty days of history (demand,
temperature, price, weekend) plus five transport-strike days on which demand
collapses.

Contents:
  1. With no features the model returns the empirical quantile (worked example)
  2. Absolute deviations (LP) against least squares (QP): robustness to outliers
  3. Dual reading: pi_i, complementary slackness, support points
  4. Quantile regression: the newsvendor safety stock from the data
  5. Feature selection with a budget on the coefficients
"""
import gurobipy as gp
import numpy as np
import pandas as pd
from gurobipy import GRB

from stile import (ARANCIO, BLU, GRIGIO, ROSSO, TEAL, VERDE, intestazione, plt,
                   salva_dat, salva_dati, salva_figura)

TAU_NV = 9 / 13                                # critical fractile of chapter 12


# ----------------------------------------------------------------------
# MODEL: quantile regression as an LP
# ----------------------------------------------------------------------
def quantile_regression(X, y, tau=0.5, budget=None):
    """min sum_i [tau u_i + (1-tau) v_i]  with  X w + b + u - v = y.

    With `budget` it adds sum_j z_j <= budget and -z_j <= w_j <= z_j
    (feature selection: a budget on the coefficients)."""
    n, p = X.shape
    m = gp.Model("regression")
    m.Params.OutputFlag = 0
    w = m.addVars(p, lb=-GRB.INFINITY, name="w")
    b = m.addVar(lb=-GRB.INFINITY, name="b")
    u = m.addVars(n, name="u")                 # deviation above
    v = m.addVars(n, name="v")                 # deviation below
    residual = m.addConstrs(
        (gp.quicksum(X[i, j] * w[j] for j in range(p)) + b + u[i] - v[i] == y[i]
         for i in range(n)), name="residual")
    budget_constr = None
    if budget is not None:
        z = m.addVars(p, name="z")
        m.addConstrs((w[j] <= z[j] for j in range(p)), name="abs_up")
        m.addConstrs((-w[j] <= z[j] for j in range(p)), name="abs_down")
        budget_constr = m.addConstr(gp.quicksum(z[j] for j in range(p)) <= budget,
                                    name="budget")
    m.setObjective(gp.quicksum(tau * u[i] + (1 - tau) * v[i] for i in range(n)),
                   GRB.MINIMIZE)
    m.optimize()
    assert m.Status == GRB.OPTIMAL
    coef = np.array([w[j].X for j in range(p)])
    duals = np.array([residual[i].Pi for i in range(n)])
    return m, coef, b.X, duals, budget_constr


def least_squares(X, y):
    """min sum_i r_i^2  with  X w + b + r = y  (convex QP, same solver)."""
    n, p = X.shape
    m = gp.Model("least_squares")
    m.Params.OutputFlag = 0
    w = m.addVars(p, lb=-GRB.INFINITY, name="w")
    b = m.addVar(lb=-GRB.INFINITY, name="b")
    r = m.addVars(n, lb=-GRB.INFINITY, name="r")
    m.addConstrs((gp.quicksum(X[i, j] * w[j] for j in range(p)) + b + r[i] == y[i]
                  for i in range(n)), name="residual")
    m.setObjective(gp.quicksum(r[i] * r[i] for i in range(n)), GRB.MINIMIZE)
    m.optimize()
    assert m.Status == GRB.OPTIMAL
    return np.array([w[j].X for j in range(p)]), b.X


def mean_deviation(X, y, coef, b):
    return float(np.abs(y - (X @ coef + b)).mean())


# ----------------------------------------------------------------------
# 1. NO FEATURES: THE MODEL RETURNS THE EMPIRICAL QUANTILE
# ----------------------------------------------------------------------
intestazione("No features: the empirical quantile (worked example)")
y7 = np.array([88.0, 96.0, 104.0, 112.0, 120.0, 132.0, 148.0])
X0 = np.zeros((len(y7), 0))
m0, _, b0, pi0, _ = quantile_regression(X0, y7, tau=TAU_NV)
print(f"Seven days: {y7.astype(int)}")
print(f"tau = alpha* = 9/13 = {TAU_NV:.4f}  (bakery of chapter 12: cu=9, co=4)")
print(f"Optimal intercept b = {b0:.4f}  -> the 5th ordered value, the 69.23% quantile")
print(f"Optimal value = {m0.ObjVal:.4f} = 680/13")
print(f"Duals pi = {np.round(pi0, 4)}  (bounds: -(1-tau) = {-(1 - TAU_NV):.4f}, "
      f"tau = {TAU_NV:.4f})")
print(f"Check, sum of the duals = {pi0.sum():.6f}  (must be 0: dual of the intercept)")
above = int((y7 > b0 + 1e-9).sum())
below = int((y7 < b0 - 1e-9).sum())
print(f"Observations: {below}/7 below the estimate, 1/7 on it, {above}/7 above")
print(f"  {below}/7 = {below / 7:.4f}  <=  tau = {TAU_NV:.4f}  <=  "
      f"{below + 1}/7 = {(below + 1) / 7:.4f}")

# ----------------------------------------------------------------------
# 2. DATA: SIXTY DAYS OF THE BAKERY
# ----------------------------------------------------------------------
intestazione("The bakery history: 60 days")
rng = np.random.default_rng(16)
n = 60
temperature = np.round(rng.uniform(10, 34, n), 1)
price = rng.choice([2.20, 2.60, 3.00, 3.40], n)
weekend = (rng.random(n) < 0.30).astype(float)
demand = (258 - 3.7 * temperature - 19.0 * price + 33.0 * weekend
          + rng.normal(0, 9, n))
outlier = np.zeros(n)
strike_days = [11, 22, 29, 41, 46]             # two transport strikes
demand[strike_days] = rng.uniform(18, 32, len(strike_days))
outlier[strike_days] = 1
demand = np.round(demand).astype(float)

# four features with no link to demand (for the selection)
followers = np.round(rng.uniform(8, 20, n), 1)
rain = np.round(rng.uniform(0, 12, n), 1)
stock_index = np.round(rng.uniform(95, 115, n), 1)
day_of_month = rng.integers(1, 29, n).astype(float)

data = pd.DataFrame({
    "giorno": np.arange(1, n + 1),
    "domanda": demand.astype(int),
    "temperatura": temperature,
    "prezzo": price,
    "weekend": weekend.astype(int),
    "follower": followers,
    "pioggia": rain,
    "indice_borsa": stock_index,
    "giorno_del_mese": day_of_month.astype(int),
    "sciopero": outlier.astype(int),
})
salva_dati(data, "panetteria_storico")
print(f"Demand: min {demand.min():.0f}, mean {demand.mean():.1f}, "
      f"max {demand.max():.0f}   strike days: {strike_days}")

# ----------------------------------------------------------------------
# 3. ABSOLUTE DEVIATIONS (LP) AGAINST LEAST SQUARES (QP)
# ----------------------------------------------------------------------
intestazione("Absolute deviations (LP) against least squares (QP)")
Xt = temperature.reshape(-1, 1)
m_lad, w_lad, b_lad, pi_lad, _ = quantile_regression(Xt, demand, tau=0.5)
w_ols, b_ols = least_squares(Xt, demand)
normal = outlier == 0
print(f"LP  (median)      : demand = {b_lad:.2f} {w_lad[0]:+.2f} * temperature")
print(f"QP  (least squares): demand = {b_ols:.2f} {w_ols[0]:+.2f} * temperature")
print(f"Mean absolute deviation over the 55 normal days: "
      f"LP {mean_deviation(Xt[normal], demand[normal], w_lad, b_lad):.2f} pieces, "
      f"QP {mean_deviation(Xt[normal], demand[normal], w_ols, b_ols):.2f} pieces")
w_clean, b_clean = least_squares(Xt[normal], demand[normal])
print(f"QP without the 5 strike days: demand = {b_clean:.2f} "
      f"{w_clean[0]:+.2f} * temperature  (the LP gets there removing nothing)")
print(f"Distance from the 'clean' intercept {b_clean:.2f}: "
      f"LP {abs(b_lad - b_clean):.2f} pieces, QP {abs(b_ols - b_clean):.2f} pieces")

# ----------------------------------------------------------------------
# 4. DUAL READING: SUPPORT POINTS AND THE QUANTILE PROPERTY
# ----------------------------------------------------------------------
intestazione("Dual reading of the LP")
residual = demand - (Xt @ w_lad + b_lad)
support = np.abs(residual) < 1e-6
print(f"Observations above the line: {(residual > 1e-6).sum()}, "
      f"below: {(residual < -1e-6).sum()}, interpolated: {int(support.sum())}")
print(f"Duals: minimum {pi_lad.min():.4f}, maximum {pi_lad.max():.4f}  "
      f"(bounds -0.5 and +0.5)")
print(f"pi = +0.5 (point above the line): {(pi_lad > 0.5 - 1e-6).sum()} points")
print(f"pi = -0.5 (point below the line): {(pi_lad < -0.5 + 1e-6).sum()} points")
print(f"-0.5 < pi < +0.5 (support points): {int(support.sum())} points  -> p + 1 = 2")
print(f"Sum of the duals = {pi_lad.sum():.6f} (dual of the intercept)")
print(f"Sum of the duals times temperature = {(pi_lad * temperature).sum():.6f}")
print(f"Dual value {float(pi_lad @ demand):.4f} = primal value "
      f"{m_lad.ObjVal:.4f}  (strong duality)")
print("Support days:", (np.where(support)[0] + 1).tolist(),
      "-> temperatures", np.round(temperature[support], 1).tolist())

# the anomalous days show up in the deviations of the three-feature model
X3all = np.column_stack([temperature, price, weekend])
_, w3, b3, _, _ = quantile_regression(X3all, demand, tau=0.5)
res3 = demand - (X3all @ w3 + b3)
suspect = np.abs(res3) > 40
print(f"\nThree-feature model over all 60 days: "
      f"demand = {b3:.2f} {w3[0]:+.2f}*temp {w3[1]:+.2f}*price {w3[2]:+.2f}*weekend")
print(f"Absolute deviation: {np.abs(res3[outlier == 0]).max():.1f} pieces at most on "
      f"normal days, {np.abs(res3[outlier == 1]).min():.1f} at least on anomalous ones")
print(f"Days with a deviation above 40 pieces: {(np.where(suspect)[0] + 1).tolist()}")
print(f"They are exactly the strike days: {bool((suspect == (outlier == 1)).all())}")
clean = ~suspect

# ----------------------------------------------------------------------
# 5. QUANTILE REGRESSION: THE SAFETY STOCK FROM THE DATA
# ----------------------------------------------------------------------
intestazione("Quantile regression and safety stock")
X3 = np.column_stack([temperature, price, weekend])[clean]
y3 = demand[clean]
print(f"From here on: the {int(clean.sum())} normal days")
rows = []
for tau in (0.10, 0.50, TAU_NV, 0.90):
    _, w_t, b_t, _, _ = quantile_regression(X3, y3, tau=tau)
    below_t = float((y3 < X3 @ w_t + b_t - 1e-9).mean())
    rows.append({"tau": tau, "intercetta": b_t, "temperatura": w_t[0],
                 "prezzo": w_t[1], "weekend": w_t[2], "quota_sotto": below_t})
    print(f"tau = {tau:.4f}: demand = {b_t:7.2f} {w_t[0]:+6.2f}*temp "
          f"{w_t[1]:+7.2f}*price {w_t[2]:+6.2f}*weekend   "
          f"| observations below the estimate {below_t:.3f}")
tab_tau = pd.DataFrame(rows)
salva_dati(tab_tau, "regressione_quantili")

typical_day = np.array([28.0, 3.00, 1.0])       # hot, full price, weekend
_, w_med, b_med, _, _ = quantile_regression(X3, y3, tau=0.5)
_, w_nv, b_nv, _, _ = quantile_regression(X3, y3, tau=TAU_NV)
pred_med = float(typical_day @ w_med + b_med)
pred_nv = float(typical_day @ w_nv + b_nv)
q_uncond = float(np.quantile(y3, TAU_NV))
print(f"\nTypical day (28 degrees, price 3.00, weekend):")
print(f"  median predicted demand        {pred_med:6.1f} pieces")
print(f"  predicted {TAU_NV:.4f} quantile     {pred_nv:6.1f} pieces  <- quantity to bake")
print(f"  safety stock                   {pred_nv - pred_med:6.1f} pieces")
print(f"  {TAU_NV:.4f} quantile with no features {q_uncond:6.1f} pieces  "
      f"(chapter 12: same rule, no features)")

# ----------------------------------------------------------------------
# 6. FEATURE SELECTION WITH A BUDGET ON THE COEFFICIENTS
# ----------------------------------------------------------------------
intestazione("Feature selection: a budget on the coefficients")
names = ["temperature", "price", "weekend", "followers", "rain",
         "stock_index", "day_of_month"]
# the CSV keeps the same column names as the Italian version: the two scripts
# must produce byte-identical files
columns = ["temperatura", "prezzo", "weekend", "follower", "pioggia",
           "indice_borsa", "giorno_del_mese"]
Xg = np.column_stack([temperature, price, weekend, followers, rain,
                      stock_index, day_of_month])[clean]
Xs = (Xg - Xg.mean(axis=0)) / Xg.std(axis=0)    # standardisation is mandatory

_, w_full, b_full, _, _ = quantile_regression(Xs, y3, tau=0.5)
print("Without a budget (all the features):")
for name, coeff in zip(names, w_full):
    print(f"  {name:16s} {coeff:+8.2f}")
print(f"  |coefficients| = {np.abs(w_full).sum():.2f}   mean absolute deviation "
      f"{mean_deviation(Xs, y3, w_full, b_full):.2f} pieces")

THRESHOLD = 2.0                                 # relevance: 2 pieces per std. dev.
grid_t = np.round(np.arange(0, 60.5, 1.0), 2)
curve, entries = [], {}
for t in grid_t:
    mt, w_t, b_t, _, constr = quantile_regression(Xs, y3, tau=0.5, budget=t)
    mad = mean_deviation(Xs, y3, w_t, b_t)
    curve.append({"budget": t, "scarto_medio": mad, "prezzo_ombra": constr.Pi,
                  **{col: w_t[j] for j, col in enumerate(columns)}})
    for j, name in enumerate(names):
        if abs(w_t[j]) > THRESHOLD and name not in entries:
            entries[name] = t
curve = pd.DataFrame(curve)
salva_dati(curve, "regressione_budget")
salva_dat(curve[["budget", "scarto_medio", "prezzo_ombra"]], "cap16_budget")

print(f"\nOrder of entry (coefficient above {THRESHOLD:.0f} pieces per standard "
      f"deviation):")
for name, t in sorted(entries.items(), key=lambda kv: kv[1]):
    print(f"  budget {t:5.1f} -> {name} enters")
never = [name for name in names if name not in entries]
print(f"  stay out: {', '.join(never) if never else '(none)'}")

print("\nCoefficients as the budget grows:")
print("  budget  " + "".join(f"{name[:9]:>11s}" for name in names))
for t in (10.0, 20.0, 30.0, 45.0):
    row = curve[curve["budget"] == t].iloc[0]
    print(f"  {t:6.0f}  " + "".join(f"{row[col]:11.2f}" for col in columns))

for t in (5.0, 10.0, 20.0, 30.0, 45.0):
    row = curve[curve["budget"] == t].iloc[0]
    print(f"budget {t:5.1f}: mean deviation {row['scarto_medio']:6.2f} pieces, "
          f"shadow price {row['prezzo_ombra']:+7.3f} pieces per unit of budget")

# ----------------------------------------------------------------------
# 7. FIGURES
# ----------------------------------------------------------------------
points = pd.DataFrame({"temperatura": temperature, "domanda": demand,
                       "sciopero": outlier.astype(int),
                       "appoggio": support.astype(int)})
salva_dat(points, "cap16_panetteria")

fig, ax = plt.subplots()
ax.scatter(temperature[normal], demand[normal], s=18, color=TEAL,
           label="normal days")
ax.scatter(temperature[~normal], demand[~normal], s=45, color=ROSSO, marker="X",
           label="strike days")
ax.scatter(temperature[support], demand[support], s=95, facecolors="none",
           edgecolors=VERDE, linewidths=1.6, label="support points")
gr = np.linspace(9, 35, 2)
ax.plot(gr, b_lad + w_lad[0] * gr, color=BLU, lw=2, label="absolute deviations (LP)")
ax.plot(gr, b_ols + w_ols[0] * gr, color=ARANCIO, lw=2, ls="--",
        label="least squares (QP)")
ax.set_xlabel("maximum temperature (degrees)")
ax.set_ylabel("demand (pieces)")
ax.set_title("Five strike days move least squares, not the LP")
ax.legend(loc="upper right", fontsize=8)
salva_figura(fig, "cap16_regressione_robusta")

lines = []
for tau in (0.10, 0.50, TAU_NV):
    _, w_t, b_t, _, _ = quantile_regression(Xt[clean], demand[clean], tau=tau)
    lines.append({"tau": tau, "intercetta": b_t, "pendenza": w_t[0]})
lines = pd.DataFrame(lines)
salva_dat(lines, "cap16_rette_quantili")

fig, ax = plt.subplots()
ax.scatter(temperature[clean], demand[clean], s=16, color=GRIGIO, alpha=0.7,
           label="55 normal days")
colours = {0.10: ARANCIO, 0.50: BLU, TAU_NV: VERDE}
for _, row in lines.iterrows():
    label = ("tau = 9/13 (critical fractile)" if abs(row["tau"] - TAU_NV) < 1e-9
             else f"tau = {row['tau']:.2f}")
    ax.plot(gr, row["intercetta"] + row["pendenza"] * gr,
            color=colours[row["tau"]], lw=2, label=label)
ax.set_xlabel("maximum temperature (degrees)")
ax.set_ylabel("demand (pieces)")
ax.set_title("One line per quantile: the fan of demand")
ax.legend(loc="upper right", fontsize=8)
salva_figura(fig, "cap16_quantili")

fig, ax = plt.subplots()
ax.plot(curve["budget"], curve["scarto_medio"], color=TEAL, lw=2)
for name, t in sorted(entries.items(), key=lambda kv: kv[1]):
    row = curve[curve["budget"] == t].iloc[0]
    ax.plot([t], [row["scarto_medio"]], "o", color=ROSSO, ms=5)
    ax.annotate(name, (t, row["scarto_medio"]), textcoords="offset points",
                xytext=(6, 8), fontsize=8, color=ROSSO)
ax.set_xlabel("budget on the coefficients")
ax.set_ylabel("mean absolute deviation (pieces)")
ax.set_title("The price of complexity: error against budget")
salva_figura(fig, "cap16_budget")

print("\nDone: chapter 16 (robust and quantile regression).")
