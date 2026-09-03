"""Runs all the laboratory scripts in sequence.

Regenerates: data (dati_en/*.csv), data for the pgfplots figures
(dispensa_en/figure/dat/*.csv), TikZ diagrams (dispensa_en/figure/*.tex) and
matplotlib previews (dispensa_en/figure/*.pdf).

Usage:  python3 run_all.py
"""
import subprocess
import sys
import time
from pathlib import Path

SCRIPT = [
    "lab04_production.py",
    "lab05_supplychain.py",
    "lab06_markowitz.py",
    "lab07_pricing.py",
    "lab08_budget.py",
    "lab09_location.py",
    "lab10_ev_charging.py",
    "lab11_queues.py",
    "lab12_newsvendor.py",
    "lab13_var_cvar.py",
    "lab14_arbitrage.py",
    "lab15_svm.py",
]

base = Path(__file__).resolve().parent
inizio = time.time()
for s in SCRIPT:
    print(f"\n{'#' * 72}\n# {s}\n{'#' * 72}")
    esito = subprocess.run([sys.executable, str(base / s)], cwd=base)
    if esito.returncode != 0:
        print(f"ERROR in {s}: stopping.")
        sys.exit(1)
print(f"\nAll scripts completed in {time.time() - inizio:.1f} s.")
