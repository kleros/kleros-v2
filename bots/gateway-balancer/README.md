# Gateway balancer bot

Unattended treasury and maintenance bot for Kleros gateway pairs that use Veashi messaging. It is not the message relayer; it never relays messages and never pauses a gateway contract.

Three independent responsibilities, each a loop per pair or route:

1. **HomeGateway refills.** When a HomeGateway's native ETH drops below the configured number of reference cases, sweep the ForeignGateway's withdrawable arbitration fees, move them to the home chain as native ETH through LI.FI, verify what arrived and deposit it.
2. **Reporter funding.** Keep every configured Veashi reporter funded in its chain's native gas token from the ForeignGateway's bridging fees, independently of the HomeGateway refills.
3. **Exchange-rate maintenance.** Propose a ForeignGateway currency-rate update when the median of several price sources moves by at least the configured threshold; the contract enforces its own guardrails.

## Layout

- `src/domain`: shared value types (assets, amounts, accounting scopes, operations, loops).
- `src/ports`: the interfaces the components are built against (journal and ledger, executor, chain clients, gateway and reporter adapters, routing, transfers, prices, notifier).
- `src/config`: the non-secret configuration schema; the topology (chains, pairs, reporter routes) and one section per component.
- `src/platform`: configuration and secrets, logging, the SQLite journal, chain clients, the transaction executor, startup reconciliation, notifications, health.
- `src/gateway`, `src/lifi`, `src/refill`: gateway adapters, LI.FI routing with the signing policy, the refill loop.
- `src/reporter`: reporter funding.
- `src/rates`: price aggregation and rate maintenance.
- `src/testing`: in-memory fakes of every port and the journal contract suite.
- `src/main.ts`: the composition root.

## Commands

```bash
yarn workspace @kleros/gateway-balancer-bot start       # run every loop
yarn workspace @kleros/gateway-balancer-bot status      # health from the journal
yarn workspace @kleros/gateway-balancer-bot reconcile   # startup reconciliation only
yarn workspace @kleros/gateway-balancer-bot lifi-probe  # quote-only route verification, never signs
yarn workspace @kleros/gateway-balancer-bot test
yarn workspace @kleros/gateway-balancer-bot check-types
yarn workspace @kleros/gateway-balancer-bot check-style
```

Configuration is a JSON file named by `GATEWAY_BALANCER_CONFIG` (see `config/example.json`); secrets come from the environment (see `.env.example`) and are never logged or stored. Requires Node 22.13 or newer (`node:sqlite`).
