"""Chapter 9 — Continuous location of a service (convex NLP).

Case study: where to place a fast-charging station in a city with 12 districts,
weighted by population.

Contents:
  1. Weighted barycentre (squared distance): closed-form solution
  2. Weber point (Euclidean distance): Gurobi (conic reformulation)
  3. Minimax (protects the farthest district): reformulation with a variable z
  4. Trade-off alpha·mean + (1-alpha)·maximum: efficiency-equity curve
"""
import gurobipy as gp
import numpy as np
import pandas as pd
from gurobipy import GRB

from stile import (ARANCIO, GRIGIO, ROSSO, TEAL, VERDE, intestazione, plt, salva_dat,
                   salva_dati, salva_figura, salva_tikz)

rng = np.random.default_rng(7)

# ----------------------------------------------------------------------
# 1. DATA: 12 districts (coordinates in km, weight = population in thousands)
# ----------------------------------------------------------------------
nomi = [f"Q{k}" for k in range(1, 13)]
coord = np.array([
    [1.0, 8.5], [2.5, 6.0], [4.0, 9.0], [5.5, 7.5], [7.0, 8.0], [9.0, 9.5],
    [1.5, 3.0], [3.0, 1.5], [5.0, 3.5], [6.5, 2.0], [8.0, 4.0], [9.5, 1.0]])
peso = np.array([12.0, 18.0, 9.0, 22.0, 15.0, 6.0, 14.0, 8.0, 25.0, 10.0, 16.0, 5.0])
salva_dati(pd.DataFrame({"district": nomi, "x": coord[:, 0], "y": coord[:, 1], "weight": peso}),
           "localizzazione_quartieri")


def dist(p):
    return np.sqrt(((coord - p) ** 2).sum(axis=1))


def f_weber(p):
    return float(peso @ dist(p))


def f_max(p):
    return float(dist(p).max())


def localizza(pesi=None, tetto=None, cabina=None, raggio=None):
    """Location with Gurobi (convex SOCP, certified global optimum).

    The trick: a variable d_k >= Euclidean distance from district k, imposed
    with the conic constraint dx_k^2 + dy_k^2 <= d_k^2 (d_k >= 0). With weights
    it minimises the weighted mean distance (Weber); without weights it minimises
    the maximum one (minimax). `tetto` imposes d_k <= cap; `cabina`/`raggio` the
    geographical constraint."""
    m = gp.Model("location")
    m.Params.OutputFlag = 0
    px = m.addVar(lb=-GRB.INFINITY, name="px")
    py = m.addVar(lb=-GRB.INFINITY, name="py")
    n = len(coord)
    d = m.addVars(n, name="d")
    for k in range(n):
        dx = m.addVar(lb=-GRB.INFINITY)
        dy = m.addVar(lb=-GRB.INFINITY)
        m.addConstr(dx == px - coord[k, 0])
        m.addConstr(dy == py - coord[k, 1])
        m.addQConstr(dx * dx + dy * dy <= d[k] * d[k])   # cone: d_k >= distance
    if tetto is not None:
        m.addConstrs((d[k] <= tetto for k in range(n)))
    if cabina is not None:
        m.addQConstr((px - cabina[0]) ** 2 + (py - cabina[1]) ** 2 <= raggio ** 2)
    if pesi is not None:                     # Weber: weighted mean
        m.setObjective(gp.quicksum(pesi[k] * d[k] for k in range(n)), GRB.MINIMIZE)
    else:                                    # minimax: maximum distance
        z = m.addVar(name="z")
        m.addConstrs((d[k] <= z for k in range(n)))
        m.setObjective(z, GRB.MINIMIZE)
    m.optimize()
    assert m.Status == GRB.OPTIMAL
    return np.array([px.X, py.X]), m.ObjVal


# ----------------------------------------------------------------------
# 2. THREE CLASSIC OBJECTIVES
# ----------------------------------------------------------------------
intestazione("Three optimal locations")
baricentro = (peso[:, None] * coord).sum(axis=0) / peso.sum()   # closed form
print(f"Weighted barycentre (squared dist.) : ({baricentro[0]:.3f}, {baricentro[1]:.3f}) km")

weber, costo_weber = localizza(pesi=peso)
print(f"Weber point (weighted mean dist.)   : ({weber[0]:.3f}, {weber[1]:.3f}) km, "
      f"cost {costo_weber:,.1f} (thousand inh. · km)")

minimax, dist_minimax = localizza()
print(f"Minimax (farthest district)         : ({minimax[0]:.3f}, {minimax[1]:.3f}) km, "
      f"maximum distance {dist_minimax:.3f} km")

print(f"\nWith the Weber point: weighted mean distance {f_weber(weber) / peso.sum():.3f} km, "
      f"maximum {f_max(weber):.3f} km")
print(f"With the minimax    : weighted mean distance {f_weber(minimax) / peso.sum():.3f} km, "
      f"maximum {f_max(minimax):.3f} km")

# ----------------------------------------------------------------------
# 3. EFFICIENCY-EQUITY FRONTIER (constraint method, epsilon-constraint):
#    minimise the weighted mean distance imposing max_dist <= D
# ----------------------------------------------------------------------
intestazione("Efficiency-equity frontier (min mean with a cap on the maximum)")
media_pesi = peso.sum()
D_grid = np.linspace(f_max(minimax) + 1e-4, f_max(weber), 21)
punti = []
for D in D_grid:
    pos, _ = localizza(pesi=peso, tetto=D)
    punti.append((D, pos[0], pos[1], f_weber(pos) / media_pesi, f_max(pos)))
comp = pd.DataFrame(punti, columns=["D_max", "x", "y", "mean_dist", "max_dist"])
salva_dati(comp, "localizzazione_frontiera")
for _, r in comp.iloc[::5].iterrows():
    print(f"  cap D = {r['D_max']:5.3f} km: position ({r['x']:5.2f}, {r['y']:5.2f}), "
          f"mean {r['mean_dist']:5.3f} km, max {r['max_dist']:5.3f} km")

# ----------------------------------------------------------------------
# 4. GEOGRAPHICAL CONSTRAINT: within 2 km of an electrical substation
# ----------------------------------------------------------------------
intestazione("Weber with a constraint: within R = 2 km of the substation at (7, 6)")
cabina, R = np.array([7.0, 6.0]), 2.0
pos_v, costo_v = localizza(pesi=peso, cabina=cabina, raggio=R)
print(f"Constrained optimum: ({pos_v[0]:.3f}, {pos_v[1]:.3f}), cost {costo_v:,.1f}")
print(f"Cost of the constraint: +{costo_v - costo_weber:,.1f} with respect to the free Weber "
      f"({(costo_v / costo_weber - 1) * 100:.1f}%)")
attivo = np.isclose(((pos_v - cabina) ** 2).sum(), R**2, rtol=1e-3)
print(f"The constraint is {'active (optimum on the boundary of the circle)' if attivo else 'not active'}")

# ----------------------------------------------------------------------
# 5. FIGURES (generated TikZ + pgfplots data + matplotlib preview)
# ----------------------------------------------------------------------
salva_dat(comp, "cap09_frontiera")

r = ["% Map of the districts and optimal locations (generated by lab09_location.py)",
     "\\begin{tikzpicture}[scale=0.82, >=stealth]",
     "  \\draw[black!20, very thin] (0,0) grid[step=1] (10.5,10);",
     "  \\draw[->, black!50] (0,0) -- (10.8,0) node[below left, font=\\scriptsize] {km east};",
     "  \\draw[->, black!50] (0,0) -- (0,10.3) node[below left, rotate=90, font=\\scriptsize] {km north};"]
for k, nome in enumerate(nomi):
    raggio = 0.11 * np.sqrt(peso[k])
    r.append(f"  \\fill[teal, opacity=0.45] ({coord[k, 0]:.2f},{coord[k, 1]:.2f}) "
             f"circle ({raggio:.2f});")
    r.append(f"  \\node[font=\\tiny, text=black!55, anchor=west] at "
             f"({coord[k, 0] + raggio:.2f},{coord[k, 1]:.2f}) {{{nome}}};")
r.append("  % trajectory of the efficiency-equity trade-off")
traj = " -- ".join(f"({rr['x']:.3f},{rr['y']:.3f})" for _, rr in comp.iterrows())
r.append(f"  \\draw[black!45, thick, densely dotted] {traj};")
r.append(f"  % geographical constraint: circle of the substation")
r.append(f"  \\draw[viola, dashed, thick] ({cabina[0]},{cabina[1]}) circle ({R});")
r.append(f"  \\node[rectangle, fill=viola, minimum size=2.2mm, inner sep=0] at "
         f"({cabina[0]},{cabina[1]}) {{}};")
# labels at different angles to avoid overlaps (the points are close to each other)
punti_not = [(weber, "rossomattone", 190, "Weber"),
             (minimax, "arancio", -55, "minimax"),
             (baricentro, "verde", 120, "barycentre"),
             (pos_v, "viola", 35, "constrained Weber")]
for pt, colore, angolo, etich in punti_not:
    r.append(f"  \\node[star, star points=5, fill={colore}, minimum size=3.2mm, inner sep=0pt,"
             f" label={{[font=\\scriptsize, text={colore}, label distance=2.5mm]"
             f"{angolo}:{etich}}}] at ({pt[0]:.3f},{pt[1]:.3f}) {{}};")
r.append("\\end{tikzpicture}")
salva_tikz("\n".join(r), "cap09_mappa")

fig, ax = plt.subplots(figsize=(7.2, 6.2))
ax.scatter(coord[:, 0], coord[:, 1], s=peso * 28, color=TEAL, alpha=0.55,
           label="districts (area = population)")
for k, nome in enumerate(nomi):
    ax.annotate(f" {nome}", coord[k], fontsize=8, color=GRIGIO)
ax.scatter(*weber, marker="*", s=300, color=ROSSO, zorder=5, label="Weber (mean)")
ax.scatter(*minimax, marker="P", s=160, color=ARANCIO, zorder=5, label="minimax (equity)")
ax.scatter(*baricentro, marker="X", s=140, color=VERDE, zorder=5, label="barycentre (squared)")
ax.plot(comp["x"], comp["y"], ".-", color=GRIGIO, lw=1, ms=4, alpha=0.8,
        label="trade-off trajectory")
cerchio = plt.Circle(cabina, R, fill=False, color="#8E44AD", ls="--")
ax.add_patch(cerchio)
ax.scatter(*cabina, marker="s", s=70, color="#8E44AD", label="substation + 2 km radius")
ax.scatter(*pos_v, marker="*", s=200, color="#8E44AD", zorder=5)
ax.set_xlabel("km east"); ax.set_ylabel("km north")
ax.set_title("Where to put the station? It depends on the objective")
ax.legend(fontsize=8, loc="lower right")
ax.set_aspect("equal")
salva_figura(fig, "cap09_mappa")

fig, ax = plt.subplots()
ax.plot(comp["max_dist"], comp["mean_dist"], "-o", color=TEAL, ms=4)
for idx, etich in [(0, "minimax"), (20, "Weber")]:
    r = comp.iloc[idx]
    ax.annotate(f"  {etich}", (r["max_dist"], r["mean_dist"]), fontsize=9)
ax.set_xlabel("maximum distance (km) — equity")
ax.set_ylabel("weighted mean distance (km) — efficiency")
ax.set_title("Efficiency-equity frontier")
salva_figura(fig, "cap09_frontiera")

print("\nDone: chapter 9.")
