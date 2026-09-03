"""Chapter 10 — Smart charging of electric vehicles (LP / convex QP).

Case study: a company depot with 6 electric vans to be charged overnight;
hourly energy prices; base load of the building.

Contents:
  1. Minimum-cost LP: charging chases the cheap hours
  2. Peak shaving: minimise the peak withdrawal (minimax)
  3. Smooth profile (QP) and multi-objective cost-peak comparison
  4. Shadow prices: grid capacity and energy requirement
"""
import gurobipy as gp
import numpy as np
import pandas as pd
from gurobipy import GRB

from stile import (ARANCIO, GRIGIO, ROSSO, TEAL, intestazione, plt, salva_dat, salva_dati,
                   salva_figura)

# ----------------------------------------------------------------------
# 1. DATA
# ----------------------------------------------------------------------
ore = list(range(24))                      # hour t = [t, t+1)
# price €/kWh: high during the day and in the evening peak, low at night
prezzo = np.array([0.09, 0.08, 0.07, 0.07, 0.08, 0.10, 0.14, 0.18, 0.20, 0.19,
                   0.17, 0.16, 0.15, 0.15, 0.16, 0.18, 0.21, 0.24, 0.26, 0.24,
                   0.20, 0.15, 0.12, 0.10])
# base load of the building (kW)
base = np.array([22, 20, 19, 19, 20, 24, 35, 48, 60, 63, 65, 64,
                 62, 61, 62, 64, 66, 68, 62, 55, 45, 36, 30, 25], dtype=float)

veicoli = [f"V{k}" for k in range(1, 7)]
# (arrival hour, departure hour, required energy kWh, max power kW)
flotta = {
    "V1": (18, 7, 46, 11), "V2": (19, 6, 38, 11), "V3": (20, 8, 55, 22),
    "V4": (17, 6, 30, 7.4), "V5": (21, 7, 42, 11), "V6": (22, 8, 50, 22),
}
eta = 0.95            # charging efficiency
C_rete = 120.0        # maximum power that can be drawn from the meter (kW)

disp = {(v, t): 1 if (flotta[v][0] <= t or t < flotta[v][1]) else 0
        for v in veicoli for t in ore}      # windows that straddle midnight

salva_dati(pd.DataFrame({"hour": ore, "price": prezzo, "base_load": base}), "ev_prezzi_base")
salva_dati(pd.DataFrame([(v, *flotta[v]) for v in veicoli],
                        columns=["vehicle", "arrival", "departure", "energy_kWh", "pmax_kW"]),
           "ev_flotta")


def costruisci():
    m = gp.Model("ev_charging")
    m.Params.OutputFlag = 0
    x = m.addVars(veicoli, ore, name="x")       # charging power (kW)
    for v in veicoli:
        for t in ore:
            x[v, t].UB = flotta[v][3] * disp[v, t]     # 0 if not plugged in
    v_ene = m.addConstrs((eta * gp.quicksum(x[v, t] for t in ore) >= flotta[v][2]
                          for v in veicoli), name="energy")
    v_rete = m.addConstrs((gp.quicksum(x[v, t] for v in veicoli) + base[t] <= C_rete
                           for t in ore), name="grid")
    return m, x, v_ene, v_rete


def profilo(x):
    return np.array([sum(x[v, t].X for v in veicoli) for t in ore])


# ----------------------------------------------------------------------
# 2. MINIMUM-COST LP
# ----------------------------------------------------------------------
intestazione("LP: minimum energy cost")
m, x, v_ene, v_rete = costruisci()
m.setObjective(gp.quicksum(prezzo[t] * x[v, t] for v in veicoli for t in ore), GRB.MINIMIZE)
m.optimize()
assert m.Status == GRB.OPTIMAL
prof_costo = profilo(x)
costo_min = m.ObjVal
picco_costo = (prof_costo + base).max()
print(f"Charging cost: {costo_min:.2f} €   peak withdrawal: {picco_costo:.1f} kW "
      f"(limit {C_rete:.0f})")
print("\nShadow prices of the energy requirement (marginal cost of 1 more kWh per vehicle):")
for v in veicoli:
    print(f"  {v}: {v_ene[v].Pi:.4f} €/kWh")

# ----------------------------------------------------------------------
# 3. PEAK SHAVING (minimax) and SMOOTH PROFILE (QP)
# ----------------------------------------------------------------------
intestazione("Peak shaving: minimise the peak withdrawal")
mp, xp, _, _ = costruisci()
z = mp.addVar(name="peak")
mp.addConstrs((gp.quicksum(xp[v, t] for v in veicoli) + base[t] <= z for t in ore),
              name="peak_def")
mp.setObjective(z, GRB.MINIMIZE)
mp.optimize()
prof_picco = profilo(xp)
costo_picco = sum(prezzo[t] * prof_picco[t] for t in ore)
print(f"Lowest achievable peak: {mp.ObjVal:.1f} kW   cost: {costo_picco:.2f} € "
      f"(+{costo_picco - costo_min:.2f} € with respect to the minimum cost)")

intestazione("Trade-off: cost + rho · peak")
compromessi = []
for rho in [0, 0.05, 0.1, 0.2, 0.5, 1.0, 2.0]:
    mc, xc, _, _ = costruisci()
    zc = mc.addVar(name="peak")
    mc.addConstrs((gp.quicksum(xc[v, t] for v in veicoli) + base[t] <= zc for t in ore))
    mc.setObjective(gp.quicksum(prezzo[t] * xc[v, t] for v in veicoli for t in ore)
                    + rho * zc, GRB.MINIMIZE)
    mc.optimize()
    cc = sum(prezzo[t] * xc[v, t].X for v in veicoli for t in ore)
    compromessi.append((rho, cc, zc.X))
    print(f"  rho = {rho:4.2f}: cost {cc:6.2f} €, peak {zc.X:6.1f} kW")
salva_dati(pd.DataFrame(compromessi, columns=["rho", "cost", "peak"]), "ev_compromessi")

# ----------------------------------------------------------------------
# 4. SENSITIVITY: capacity of the meter
# ----------------------------------------------------------------------
intestazione("Sensitivity: capacity of the grid connection")
# careful: in the constraint "sum x + base[t] <= C" Gurobi moves the constant base[t]
# into the right-hand side; the stored RHS is C - base[t], so it must be updated like this:
for CC in [60, 65, 70, 80, 90, 120]:
    ms, xs_, _, vr = costruisci()
    for t in ore:
        vr[t].RHS = CC - base[t]
    ms.setObjective(gp.quicksum(prezzo[t] * xs_[v, t] for v in veicoli for t in ore),
                    GRB.MINIMIZE)
    ms.optimize()
    esito = f"cost {ms.ObjVal:6.2f} €" if ms.Status == GRB.OPTIMAL else "INFEASIBLE"
    print(f"  C_grid = {CC:3d} kW: {esito}")

# ----------------------------------------------------------------------
# 5. FIGURES (pgfplots data + matplotlib preview)
# ----------------------------------------------------------------------
salva_dat(pd.DataFrame({"hour": ore, "price_cent": prezzo * 100, "base": base,
                        "totcost": base + prof_costo, "totpeak": base + prof_picco}),
          "cap10_profili")
salva_dat(pd.DataFrame(compromessi, columns=["rho", "cost", "peak"]), "cap10_frontiera")

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(8.2, 6.4), sharex=True)
ax1.bar(ore, prezzo * 100, color=GRIGIO, alpha=0.6)
ax1.set_ylabel("price (c€/kWh)")
ax1.set_title("Hourly energy price")
ax2.plot(ore, base, color=GRIGIO, ls="--", label="base load")
ax2.plot(ore, base + prof_costo, color=TEAL, lw=2, drawstyle="steps-mid",
         label="minimum cost")
ax2.plot(ore, base + prof_picco, color=ARANCIO, lw=2, drawstyle="steps-mid",
         label="peak shaving")
ax2.axhline(C_rete, color=ROSSO, ls=":", label=f"grid limit {C_rete:.0f} kW")
ax2.set_xlabel("hour of the day"); ax2.set_ylabel("total withdrawal (kW)")
ax2.set_title("Withdrawal profile: chasing prices creates a night-time peak")
ax2.legend(fontsize=8, ncol=2)
salva_figura(fig, "cap10_profili")

comp = pd.DataFrame(compromessi, columns=["rho", "cost", "peak"])
fig, ax = plt.subplots()
ax.plot(comp["peak"], comp["cost"], "-o", color=TEAL)
for _, r in comp.iterrows():
    ax.annotate(f"  $\\rho$={r['rho']:.2f}", (r["peak"], r["cost"]), fontsize=8)
ax.set_xlabel("peak withdrawal (kW)")
ax.set_ylabel("charging cost (€)")
ax.set_title("Cost-peak frontier: cutting the peak is cheap at first")
salva_figura(fig, "cap10_frontiera")

print("\nDone: chapter 10.")
