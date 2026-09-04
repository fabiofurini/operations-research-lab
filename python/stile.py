"""Shared plotting style and helpers for the laboratory scripts.

Every script imports from here: palette consistent with the lecture notes,
figures saved into notes/figure/, data saved into data/.
"""
import os
import sys
from pathlib import Path

import matplotlib


def _dentro_notebook() -> bool:
    """True inside Jupyter/Colab: there figures are shown, not saved."""
    if "google.colab" in sys.modules:
        return True
    try:
        from IPython import get_ipython
        return type(get_ipython()).__name__ == "ZMQInteractiveShell"
    except Exception:
        return False


NOTEBOOK = _dentro_notebook()

if not NOTEBOOK:
    matplotlib.use("Agg")     # in notebooks the inline backend stays
import matplotlib.pyplot as plt

BASE = Path(__file__).resolve().parent.parent
DIR_FIGURE = BASE / "notes" / "figure"
DIR_DAT = DIR_FIGURE / "dat"
DIR_DATI = BASE / "data"
DIR_IMG = BASE / "docs" / "img"

# make sure the English output folders exist (they must not overwrite the Italian ones);
# in a notebook there is no repository around the script, so nothing is created
if not NOTEBOOK:
    for _d in (DIR_FIGURE, DIR_DAT, DIR_DATI, DIR_IMG):
        os.makedirs(_d, exist_ok=True)

# Institutional palette of the lecture notes
BLU = "#16324A"      # midnight blue (titles)
TEAL = "#0E7490"     # teal (main accent)
ROSSO = "#C0392B"
VERDE = "#1E8449"
ARANCIO = "#CA6F1E"
GRIGIO = "#7F8C8D"
CICLO = [TEAL, ROSSO, VERDE, ARANCIO, BLU, GRIGIO, "#8E44AD", "#B7950B"]

plt.rcParams.update({
    "figure.figsize": (7.2, 4.2),
    "figure.dpi": 120,
    "font.size": 10,
    "font.family": "DejaVu Sans",
    "axes.prop_cycle": plt.cycler(color=CICLO),
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.grid": True,
    "grid.alpha": 0.25,
    "grid.linewidth": 0.6,
    "axes.titlesize": 11,
    "axes.titleweight": "bold",
    "axes.titlecolor": BLU,
    "legend.frameon": False,
    "savefig.bbox": "tight",
})


def salva_figura(fig, nome: str) -> None:
    """Save the figure as PDF (preview) and as PNG for the website (docs/img/).

    In a notebook nothing is saved: the figure is shown below the cell.
    """
    if NOTEBOOK:
        plt.show()
        return
    DIR_FIGURE.mkdir(parents=True, exist_ok=True)
    percorso = DIR_FIGURE / f"{nome}.pdf"
    fig.savefig(percorso)
    img = DIR_IMG
    img.mkdir(parents=True, exist_ok=True)
    fig.savefig(img / f"{nome}.png", dpi=150)
    plt.close(fig)
    print(f"  [figure] {percorso.relative_to(BASE)} (+ docs/img/{nome}.png)")


def salva_dati(df, nome: str) -> None:
    """Save a DataFrame into data/<name>.csv (in a notebook it only prints its size)."""
    if NOTEBOOK:
        print(f"  [data]   {nome}: {len(df)} rows x {len(df.columns)} columns")
        return
    DIR_DATI.mkdir(parents=True, exist_ok=True)
    percorso = DIR_DATI / f"{nome}.csv"
    df.to_csv(percorso, index=False)
    print(f"  [data]   {percorso.relative_to(BASE)}")


def salva_dat(df, nome: str) -> None:
    """Save a pgfplots-ready CSV into notes/figure/dat/<name>.csv.

    Only the printed lecture notes need it: in a notebook it does nothing.
    """
    if NOTEBOOK:
        return
    d = DIR_DAT
    d.mkdir(parents=True, exist_ok=True)
    percorso = d / f"{nome}.csv"
    df.to_csv(percorso, index=False)
    print(f"  [dat]    {percorso.relative_to(BASE)}")


def salva_tikz(codice: str, nome: str) -> None:
    """Save generated TikZ code into notes/figure/<name>.tex.

    Only the printed lecture notes need it: in a notebook it does nothing.
    """
    if NOTEBOOK:
        return
    DIR_FIGURE.mkdir(parents=True, exist_ok=True)
    percorso = DIR_FIGURE / f"{nome}.tex"
    percorso.write_text(codice)
    print(f"  [tikz]   {percorso.relative_to(BASE)}")


def intestazione(titolo: str) -> None:
    print("\n" + "=" * 72)
    print(titolo)
    print("=" * 72)
