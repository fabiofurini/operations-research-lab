"""Generate the Jupyter/Colab notebooks of the chapters from the scripts.

One notebook per chapter in `notebooks/labNN_name.ipynb`, derived from the
matching script in `python/`: the course code stays in one place — the scripts
are the source, the notebooks are regenerated. The sections of a script (the
`# ---- n. TITLE ----` blocks) become separate code cells, each preceded by its
title in a text cell.

It also generates the website page that lists them (`docs/notebooks.md`).

Usage:  python3 make_notebooks.py           # regenerate notebooks and website page
        python3 make_notebooks.py --check   # verify they are up to date
"""
import json
import re
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
DIR_SCRIPT = BASE / "python"
DIR_NOTEBOOK = BASE / "notebooks"
DIR_DOCS = BASE / "docs"

REPO = "fabiofurini/operations-research-lab"
SITO = "https://fabiofurini.github.io/operations-research-lab"
RAW_STILE = f"https://raw.githubusercontent.com/{REPO}/main/python/stile.py"
BADGE = "https://colab.research.google.com/assets/colab-badge.svg"

RIGA = re.compile(r"^# -{10,}$")
VOCE = re.compile(r"^\s+(\d+)\. ")

PREPARAZIONE = f"""## Setup

The cell below installs `gurobipy` and downloads `stile.py`, the shared plotting
style of the course scripts. The licence bundled with the pip package is limited
to **2000 variables and 2000 constraints**: every model of the lab fits — the
largest one, the scenario newsvendor, uses 1803 and 1801 — but raising the number
of scenarios can exceed it. In that case activate the free academic licence at
[portal.gurobi.com](https://portal.gurobi.com).
"""

CODICE_PREPARAZIONE = f'''# Environment: the solver and the plotting style of the lab.
# Locally it uses the repository's python/stile.py; on Colab it installs and downloads what is missing.
import importlib.util
import subprocess
import sys
import urllib.request
from pathlib import Path

if importlib.util.find_spec("gurobipy") is None:
    subprocess.run([sys.executable, "-m", "pip", "install", "-q",
                    "gurobipy", "matplotlib", "pandas", "scipy"], check=True)

if importlib.util.find_spec("stile") is None:
    locale = next((p for p in (Path("../python/stile.py"), Path("python/stile.py"))
                   if p.exists()), None)
    if locale is not None:
        sys.path.insert(0, str(locale.parent.resolve()))     # notebook opened in the repository
    else:
        urllib.request.urlretrieve("{RAW_STILE}", "stile.py")   # Colab
'''

CHIUSURA = f"""---

Notebook generated from `python/{{nome}}.py` with `python3 python/make_notebooks.py`:
edits go into the script, not here.

Teaching material by [Fabio Furini]({{sito}}) — DIAG, Sapienza University of Rome.
Text, figures and data [CC BY 4.0](https://github.com/{REPO}/blob/main/LICENSE),
code [MIT](https://github.com/{REPO}/blob/main/LICENSE-CODE).
"""


INDICE = """# The notebooks of the lab

Every chapter with a model has its own **notebook**: one click on the badge opens
it in Google Colab, it installs the solver by itself and runs in the browser —
nothing to install on your machine. It is the very same code as the scripts in
`python/`, cell by cell, with the figures appearing below the cells instead of
being written to a file.

!!! tip "The pip licence is enough"
    The licence bundled with `gurobipy` is limited to 2000 variables and 2000
    constraints, and every model of the lab fits: the largest one — the scenario
    newsvendor — uses 1803 and 1801. Raising the number of scenarios can exceed it:
    in that case activate the free academic licence at
    [portal.gurobi.com](https://portal.gurobi.com).

| Chapter | Class | Notebook |
|---|---|---|
{righe}

## How they are made

The notebooks are not written by hand: they are generated from the scripts with

```bash
python3 python/make_notebooks.py
```

The chapter script remains the single source of the code — the notebook takes its
docstring, sections and comments from it — and whoever prefers the command line
keeps running, from the `python/` folder:

```bash
python3 lab06_markowitz.py
```

## Installation and licence

Working locally needs only `gurobipy`:

```bash
python3 -m pip install gurobipy
```

The pip package ships with a **demo licence** (up to 2000 variables and 2000 constraints):
enough for every model in this lab. At start-up the line
`Restricted license - for non-production use only` appears: this is normal.

**Full academic licence (free of charge):**

1. register at <https://portal.gurobi.com> with your institutional email (`@uniroma1.it`);
2. request a *Named-User Academic License*;
3. run the command `grbgetkey XXXXXXXX-...` shown by the portal (you need the university network or a VPN);
4. the licence is saved in `~/gurobi.lic` and from that moment there are no size limits.

Quick check:

```python
import gurobipy as gp
print(gp.gurobi.version())        # e.g. (13, 0, 3)
```

## Regenerating everything

```bash
python3 -m pip install gurobipy matplotlib pandas scipy   # scipy: statistical functions only
python3 python/run_all.py             # regenerates data, results and figures
```

The [repository](https://github.com/fabiofurini/operations-research-lab)
holds all the **Python scripts** and the case study **data** in CSV format.
"""


def pagina_del_capitolo(nome: str) -> str | None:
    """Find the website page that presents this script (its «Script:» field)."""
    for pagina in sorted(DIR_DOCS.glob("*.md")):
        if f"python/{nome}.py" in pagina.read_text():
            return pagina.stem
    return None


def titolo_e_classe(slug: str) -> tuple[str, str]:
    """Title (H1) and model class declared in the header of the page."""
    righe = (DIR_DOCS / f"{slug}.md").read_text().splitlines()
    titolo = next(r[2:].strip() for r in righe if r.startswith("# "))
    classe = ""
    for r in righe:
        if "Class" in r and "·" in r:
            testo = r.split("·")[0].replace("*", "").strip()
            classe = testo.removeprefix("Class:").strip()
            break
    return titolo, classe


def pagina_indice() -> str:
    """The website page listing the notebooks, one badge per chapter."""
    righe = []
    for percorso in sorted(DIR_SCRIPT.glob("lab*.py")):
        nome = percorso.stem
        slug = pagina_del_capitolo(nome)
        if not slug:
            continue
        titolo, classe = titolo_e_classe(slug)
        colab = (f"https://colab.research.google.com/github/{REPO}"
                 f"/blob/main/notebooks/{nome}.ipynb")
        righe.append(f"| [{titolo}]({slug}.md) | {classe} | "
                     f"[![Open in Colab]({BADGE})]({colab}) |")
    return INDICE.format(righe="\n".join(righe))


def testa_e_corpo(sorgente: str) -> tuple[str, str, str]:
    """Split the module docstring (title, body) from the rest of the code."""
    fine = sorgente.index('"""', 3)
    doc = sorgente[3:fine].strip()
    titolo, _, corpo = doc.partition("\n")
    return titolo.rstrip("."), corpo.strip(), sorgente[fine + 3:].lstrip("\n")


def sezioni(codice: str) -> list[tuple[str | None, str]]:
    """Split the code at the `# ---- title ----` banners: [(title, code), ...]."""
    righe = codice.splitlines()
    blocchi: list[tuple[str | None, list[str]]] = [(None, [])]
    i = 0
    while i < len(righe):
        if RIGA.match(righe[i]):
            j = i + 1
            titolo = []
            while j < len(righe) and righe[j].startswith("#") and not RIGA.match(righe[j]):
                titolo.append(righe[j].lstrip("#").strip())
                j += 1
            if titolo and j < len(righe) and RIGA.match(righe[j]):
                blocchi.append((" ".join(titolo), []))
                i = j + 1
                continue
        blocchi[-1][1].append(righe[i])
        i += 1
    return [(t, "\n".join(c).strip()) for t, c in blocchi if "\n".join(c).strip()]


def cella_testo(testo: str) -> dict:
    return {"cell_type": "markdown", "metadata": {}, "source": righe_json(testo)}


def cella_codice(codice: str) -> dict:
    return {"cell_type": "code", "execution_count": None, "metadata": {},
            "outputs": [], "source": righe_json(codice)}


def righe_json(testo: str) -> list[str]:
    """Text as a list of lines keeping the trailing newline, but not on the last one."""
    righe = testo.rstrip("\n").split("\n")
    return [r + "\n" for r in righe[:-1]] + righe[-1:]


def notebook(percorso: Path) -> dict:
    nome = percorso.stem
    titolo, corpo, codice = testa_e_corpo(percorso.read_text())
    slug = pagina_del_capitolo(nome)
    colab = f"https://colab.research.google.com/github/{REPO}/blob/main/notebooks/{nome}.ipynb"

    intro = [f"# {titolo}", "", f"[![Open in Colab]({BADGE})]({colab})", ""]
    intro.append("\n".join(VOCE.sub(r"\1. ", r) for r in corpo.splitlines()))
    if slug:
        intro += ["", f"The full chapter — model, data, results and sensitivity "
                      f"analysis — is [on the website]({SITO}/{slug}/)."]

    celle = [cella_testo("\n".join(intro)),
             cella_testo(PREPARAZIONE),
             cella_codice(CODICE_PREPARAZIONE.strip())]
    for t, c in sezioni(codice):
        if t:
            celle.append(cella_testo(f"## {t}"))
        celle.append(cella_codice(c))
    celle.append(cella_testo(CHIUSURA.format(
        nome=nome, sito="https://sites.google.com/view/fabiofurini/home-page")))

    return {"cells": celle,
            "metadata": {"colab": {"provenance": []},
                         "kernelspec": {"display_name": "Python 3",
                                        "language": "python", "name": "python3"},
                         "language_info": {"name": "python"}},
            "nbformat": 4, "nbformat_minor": 5}


def main() -> int:
    verifica = "--check" in sys.argv
    DIR_NOTEBOOK.mkdir(exist_ok=True)
    disallineati = []
    indice = DIR_DOCS / "notebooks.md"
    if verifica:
        if not indice.exists() or indice.read_text() != pagina_indice():
            disallineati.append(indice.name)
    else:
        indice.write_text(pagina_indice())
        print(f"  [page]     docs/{indice.name}")
    for percorso in sorted(DIR_SCRIPT.glob("lab*.py")):
        atteso = json.dumps(notebook(percorso), ensure_ascii=False, indent=1) + "\n"
        uscita = DIR_NOTEBOOK / f"{percorso.stem}.ipynb"
        if verifica:
            if not uscita.exists() or uscita.read_text() != atteso:
                disallineati.append(uscita.name)
        else:
            uscita.write_text(atteso)
            print(f"  [notebook] notebooks/{uscita.name}")
    if verifica:
        if disallineati:
            print("Notebooks out of date: " + ", ".join(disallineati))
            print("Regenerate them with: python3 python/make_notebooks.py")
            return 1
        print("Every notebook is in sync with its script.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
