# Deterministic models

Eight chapters where every datum is known: you decide under certainty, and the
value lies in interrogating the solution (how much is one more unit of a
resource worth? where does the plan break?).

Inside you will find LPs, QPs, convex NLPs and a non-convex NLP: **the modelling
language changes, the workflow does not** --- build the model, solve it, read the
duals, move the data and see what holds.

<div class="grid cards" markdown>

-   :material-factory: **Production and inventory**

    ---

    Multi-period LP with inventory: the solver discovers pre-building, the duals
    say how much an hour of capacity is worth. QP variant with smoothing.

    [:octicons-arrow-right-24: LP / QP](production.md)

-   :material-truck-delivery: **Supply chain and CO₂**

    ---

    Minimum-cost flow, convex congestion and the cost-emissions frontier with an
    internal carbon price.

    [:octicons-arrow-right-24: LP / NLP](supplychain.md)

-   :material-chart-line: **Markowitz portfolio**

    ---

    The most famous QP in history: efficient frontier, diversification and the
    fragility of the estimates.

    [:octicons-arrow-right-24: QP](markowitz.md)

-   :material-currency-eur: **Pricing and revenue management**

    ---

    Endogenous demand, bilinear objective, corner optima and the true value of
    one more seat.

    [:octicons-arrow-right-24: NLP](pricing.md)

-   :material-bullhorn: **Advertising budget**

    ---

    Diminishing returns, the KKT condition «equal marginal return on every active
    channel», value-versus-budget curve.

    [:octicons-arrow-right-24: Convex NLP](budget.md)

-   :material-map-marker: **Continuous location**

    ---

    Centroid, Weber point and minimax on the map: efficiency versus equity, with
    a geographic constraint.

    [:octicons-arrow-right-24: Convex NLP](location.md)

-   :material-ev-station: **Electric vehicle charging**

    ---

    Minimum cost versus peak shaving, hourly energy prices and the duals of the
    energy requirements.

    [:octicons-arrow-right-24: LP / QP](ev-charging.md)

-   :material-account-clock: **Queues and service capacity**

    ---

    The utilisation wall: optimal capacity, the price of a service promise,
    robustness to uncertain demand.

    [:octicons-arrow-right-24: Convex NLP](queues.md)

</div>
