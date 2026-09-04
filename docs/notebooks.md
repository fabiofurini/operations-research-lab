# The notebooks of the lab

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
| [Multi-period production and inventory](production.md) | LP / convex QP | [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/fabiofurini/operations-research-lab/blob/main/notebooks/lab04_production.ipynb) |
| [Supply chain with congestion and sustainability](supplychain.md) | LP / convex NLP | [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/fabiofurini/operations-research-lab/blob/main/notebooks/lab05_supplychain.ipynb) |
| [The Markowitz portfolio](markowitz.md) | convex QP | [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/fabiofurini/operations-research-lab/blob/main/notebooks/lab06_markowitz.ipynb) |
| [Pricing and revenue management](pricing.md) | concave / non-convex NLP | [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/fabiofurini/operations-research-lab/blob/main/notebooks/lab07_pricing.ipynb) |
| [Advertising budget allocation](budget.md) | convex NLP | [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/fabiofurini/operations-research-lab/blob/main/notebooks/lab08_budget.ipynb) |
| [Continuous location of a service](location.md) | convex NLP | [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/fabiofurini/operations-research-lab/blob/main/notebooks/lab09_location.ipynb) |
| [Smart charging of electric vehicles](ev-charging.md) | LP / convex QP | [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/fabiofurini/operations-research-lab/blob/main/notebooks/lab10_ev_charging.ipynb) |
| [Service capacity and waiting times](queues.md) | convex NLP (M/M/1 queue) | [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/fabiofurini/operations-research-lab/blob/main/notebooks/lab11_queues.ipynb) |
| [The Newsvendor and its variants](newsvendor.md) | 1D convex / scenario-based stochastic LP | [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/fabiofurini/operations-research-lab/blob/main/notebooks/lab12_newsvendor.ipynb) |
| [VaR and CVaR: measuring and optimizing risk](var-cvar.md) | scenario-based LP | [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/fabiofurini/operations-research-lab/blob/main/notebooks/lab13_var_cvar.ipynb) |
| [Arbitrage and arbitrage-free pricing](arbitrage.md) | LP | [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/fabiofurini/operations-research-lab/blob/main/notebooks/lab14_arbitrage.ipynb) |
| [Support Vector Machine: optimization for machine learning](svm.md) | convex QP | [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/fabiofurini/operations-research-lab/blob/main/notebooks/lab15_svm.ipynb) |
| [Robust and quantile regression](regression.md) | LP (compared with a QP) | [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/fabiofurini/operations-research-lab/blob/main/notebooks/lab16_regression.ipynb) |

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
