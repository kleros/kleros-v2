#!/usr/bin/env bash
# Local stack: start | stop | rebuild
# start/rebuild: tmux panes for Hardhat + graph-node, orchestrates deploy → populate → subgraph → web.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SESSION="local-stack"
STATE_DIR="$ROOT/.local-stack"
PORT_8545_PID_FILE="$STATE_DIR/port-8545.pid"
COMPOSE_FILE="$ROOT/services/graph-node/docker-compose.yml"
GRAPH_DATA_DIR="$ROOT/services/graph-node/data"
GRAPH_INDEX_URL="http://127.0.0.1:8030/graphql"
GRAPH_ETHEREUM_NETWORK="mainnet"
RPC_URL="http://127.0.0.1:8545"
WAIT_TIMEOUT="${LOCAL_STACK_TIMEOUT:-600}"
LOG_DIR="${TMPDIR:-/tmp}/kleros-v2-local-stack-$$"

DEPLOY_MARKER="$ROOT/contracts/deployments/localhost/KlerosCore.json"
SUBGRAPH_CORE="kleros/kleros-v2-core-local"
SUBGRAPH_DRT="kleros/kleros-v2-drt-local"

contracts_ws="@kleros/kleros-v2-contracts"
subgraph_ws="@kleros/kleros-v2-subgraph"
web_ws="@kleros/kleros-v2-web"

log() { printf '[local-stack] %s\n' "$*"; }
die() { log "error: $*"; exit 1; }

# tee must not swallow failures from yarn/graph (needs pipefail + explicit check).
run_logged() {
  local logfile="$1"
  shift
  log "-> $*"
  if ! "$@" 2>&1 | tee "$logfile"; then
    die "command failed (see $logfile): $*"
  fi
}

usage() {
  cat <<EOF
Usage: $(basename "$0") [start|stop|rebuild] [options]

  start     Clean preflight (unless LOCAL_STACK_SKIP_CLEAN=1), orchestrate stack, attach tmux
  stop      Kill tmux session, stop graph-node docker, stop Hardhat on :8545
  rebuild   stop + full clean + start

Options:
  --pin <ref>   Pin contracts to a git tag, commit, branch, or npm version before start/rebuild

Env:
  LOCAL_STACK_SKIP_CLEAN=1   Skip wiping deployments / graph data on start
  LOCAL_STACK_TIMEOUT=600    Seconds to wait for each readiness check

Examples:
  $(basename "$0") start --pin v2-contracts-audit-certora-end
  $(basename "$0") --pin b537adcf rebuild
  yarn local-stack --pin b537adcf
EOF
}

apply_pin() {
  local ref="$1"
  log "pinning contracts to $ref"
  (cd "$ROOT/contracts" && bash scripts/pin.sh "$ref")
}

require_tools() {
  command -v docker >/dev/null || die "docker not installed"
  docker info >/dev/null 2>&1 || die "docker is not running"
  command -v curl >/dev/null || die "curl not installed"
  command -v lsof >/dev/null || die "lsof not installed"
  command -v jq >/dev/null || die "jq not installed"
  command -v tmux >/dev/null || die "tmux not installed (brew install tmux)"
}

wait_for() {
  local name="$1" timeout="$2"
  shift 2
  local start now
  start="$(date +%s)"
  log "waiting for $name (timeout ${timeout}s)…"
  while true; do
    if "$@"; then
      log "✓ $name ready"
      return 0
    fi
    now="$(date +%s)"
    if (( now - start >= timeout )); then
      die "timed out waiting for $name"
    fi
    sleep 2
  done
}

rpc_ready() {
  curl -sf -X POST "$RPC_URL" \
    -H 'Content-Type: application/json' \
    -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
    | grep -q '"result"'
}

deploy_marker_ready() {
  [[ -f "$DEPLOY_MARKER" ]]
}

graph_index_ready() {
  curl -sf -X POST "$GRAPH_INDEX_URL" \
    -H 'Content-Type: application/json' \
    -d '{"query":"{ version { version } }"}' \
    | jq -e '.data.version.version != null' >/dev/null
}

graph_ethereum_ready() {
  curl -sf -X POST "$GRAPH_INDEX_URL" \
    -H 'Content-Type: application/json' \
    -d "{\"query\":\"{ blockHashFromNumber(network: \\\"${GRAPH_ETHEREUM_NETWORK}\\\", blockNumber: 0) }\"}" \
    | jq -e '.data.blockHashFromNumber != null' >/dev/null
}

subgraph_status_json() {
  local name="$1"
  curl -sf -X POST "$GRAPH_INDEX_URL" \
    -H 'Content-Type: application/json' \
    -d "{\"query\":\"{ indexingStatusForCurrentVersion(subgraphName: \\\"${name}\\\") { synced health fatalError { message block { number } } chains { latestBlock { number } chainHeadBlock { number } } } }\"}"
}

wait_for_subgraph() {
  local name="$1"
  local start now last_log=0
  start="$(date +%s)"
  log "waiting for $name to sync (timeout ${WAIT_TIMEOUT}s)…"

  while true; do
    local json fatal health synced latest head
    json="$(subgraph_status_json "$name" || echo '{}')"

    fatal="$(jq -r '.data.indexingStatusForCurrentVersion.fatalError.message // empty' <<<"$json")"
    if [[ -n "$fatal" ]]; then
      log "graph-node logs (last 30 lines):"
      docker compose -f "$COMPOSE_FILE" logs --tail 30 graph-node 2>&1 || true
      die "subgraph $name indexing failed: $fatal"
    fi

    health="$(jq -r '.data.indexingStatusForCurrentVersion.health // empty' <<<"$json")"
    if [[ "$health" == "failed" ]]; then
      docker compose -f "$COMPOSE_FILE" logs --tail 30 graph-node 2>&1 || true
      die "subgraph $name health=failed"
    fi

    synced="$(jq -r '.data.indexingStatusForCurrentVersion.synced // false' <<<"$json")"
    if [[ "$synced" == "true" && "$health" == "healthy" ]]; then
      log "✓ $name synced"
      return 0
    fi

    now="$(date +%s)"
    if (( now - last_log >= 10 )); then
      latest="$(jq -r '.data.indexingStatusForCurrentVersion.chains[0].latestBlock.number // "n/a"' <<<"$json")"
      head="$(jq -r '.data.indexingStatusForCurrentVersion.chains[0].chainHeadBlock.number // "n/a"' <<<"$json")"
      if jq -e '.data.indexingStatusForCurrentVersion == null' <<<"$json" >/dev/null; then
        log "  $name: not registered yet (waiting for deploy…)"
      else
        log "  $name: synced=$synced health=${health:-pending} block=$latest head=$head"
      fi
      last_log=$now
    fi

    if (( now - start >= WAIT_TIMEOUT )); then
      docker compose -f "$COMPOSE_FILE" logs --tail 50 graph-node 2>&1 || true
      die "timed out waiting for $name (see $LOG_DIR/subgraph-deploy.log)"
    fi
    sleep 2
  done
}

rpc_listener_pids() {
  lsof -tiTCP:8545 -sTCP:LISTEN 2>/dev/null || true
}

write_port_8545_pids() {
  mkdir -p "$STATE_DIR"
  printf '%s\n' "$1" >"$PORT_8545_PID_FILE"
}

require_rpc_port_free() {
  local pids pid
  pids="$(rpc_listener_pids)"
  [[ -z "$pids" ]] && return 0
  write_port_8545_pids "$pids"
  pid="$(printf '%s\n' "$pids" | head -1)"
  die ":8545 is in use (pid $pid, see $PORT_8545_PID_FILE). Stop it manually, then retry."
}

record_rpc_listener() {
  local pid
  pid="$(rpc_listener_pids | head -1)"
  [[ -n "$pid" ]] || return 0
  write_port_8545_pids "$pid"
}

stop_recorded_hardhat() {
  local pid
  [[ -f "$PORT_8545_PID_FILE" ]] || return 0
  pid="$(head -1 "$PORT_8545_PID_FILE")"
  [[ -n "$pid" ]] || return 0
  if lsof -tiTCP:8545 -sTCP:LISTEN 2>/dev/null | grep -qw "$pid"; then
    log "stopping Hardhat on :8545 (pid $pid)"
    kill "$pid" 2>/dev/null || true
    wait_for "port :8545 to close" 30 bash -c '! lsof -tiTCP:8545 -sTCP:LISTEN >/dev/null 2>&1' || true
  fi
  rm -f "$PORT_8545_PID_FILE"
}

clean_contracts_state() {
  log "cleaning contract build outputs and local deployments"
  rm -rf \
    "$ROOT/contracts/deployments/localhost" \
    "$ROOT/contracts/deployments/hardhat"
  if [[ -f "$ROOT/contracts/pin/version" ]]; then
    rm -rf "$ROOT/contracts/pin/cache" "$ROOT/contracts/pin/artifacts"
  fi
  yarn workspace "$contracts_ws" clean
}

reset_graph_node() {
  log "resetting graph-node (docker down + wiping chain data)"
  docker compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || true
  rm -rf "$GRAPH_DATA_DIR"
}

preflight_clean() {
  log "preflight clean"
  require_rpc_port_free
  clean_contracts_state
  reset_graph_node
}

setup_tmux() {
  tmux kill-session -t "$SESSION" 2>/dev/null || true

  tmux new-session -d -s "$SESSION" -n stack -c "$ROOT/contracts"
  tmux set-option -t "$SESSION" pane-border-status top
  tmux set-option -t "$SESSION" pane-border-format " #{pane_title} "

  tmux select-pane -t "$SESSION:0.0" -T "HARDHAT"

  tmux split-window -t "$SESSION:0.0" -h -c "$ROOT"
  tmux select-pane -t "$SESSION:0.1" -T "GRAPH NODE"

  tmux split-window -t "$SESSION:0.1" -v -c "$ROOT/web"
  tmux select-pane -t "$SESSION:0.2" -T "WEB"

  tmux send-keys -t "$SESSION:0.0" "yarn start-local" Enter
  tmux send-keys -t "$SESSION:0.1" "docker compose -f '$COMPOSE_FILE' up" Enter
}

cmd_stop() {
  local pids
  log "stopping local stack"
  tmux kill-session -t "$SESSION" 2>/dev/null || true
  docker compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || true
  stop_recorded_hardhat
  pids="$(rpc_listener_pids)"
  if [[ -n "$pids" ]]; then
    write_port_8545_pids "$pids"
    log ":8545 still in use — stop manually (pids in $PORT_8545_PID_FILE)"
  fi
  log "stopped"
}

cmd_start() {
  require_tools
  cd "$ROOT"
  mkdir -p "$LOG_DIR"
  log "orchestration logs -> $LOG_DIR"

  if [[ "${LOCAL_STACK_SKIP_CLEAN:-}" != "1" ]]; then
    preflight_clean
  else
    log "skipping preflight clean (LOCAL_STACK_SKIP_CLEAN=1)"
    require_rpc_port_free
  fi

  if [[ -f "$ROOT/contracts/pin/version" ]]; then
    log "pinned contracts: $(cat "$ROOT/contracts/pin/version")"
  fi

  run_logged "$LOG_DIR/build.log" yarn workspace "$contracts_ws" build

  log "starting Hardhat + graph-node in tmux panes (session: $SESSION)"
  setup_tmux

  wait_for "Hardhat RPC" "$WAIT_TIMEOUT" rpc_ready
  record_rpc_listener
  wait_for "localhost deployments" "$WAIT_TIMEOUT" deploy_marker_ready

  run_logged "$LOG_DIR/populate.log" yarn workspace "$contracts_ws" populate:local

  run_logged "$LOG_DIR/viem-hardhat.log" yarn workspace "$contracts_ws" viem:generate-hardhat

  wait_for "graph-node index API (:8030)" "$WAIT_TIMEOUT" graph_index_ready
  wait_for "graph-node ethereum (${GRAPH_ETHEREUM_NETWORK} → :8545)" "$WAIT_TIMEOUT" graph_ethereum_ready

  run_logged "$LOG_DIR/subgraph-deploy.log" yarn workspace "$subgraph_ws" rebuild-deploy:local

  wait_for_subgraph "$SUBGRAPH_CORE"
  wait_for_subgraph "$SUBGRAPH_DRT"

  log "starting web in tmux pane"
  tmux send-keys -t "$SESSION:0.2" "yarn start-local" Enter

  log "attaching tmux — panes: HARDHAT | GRAPH NODE / WEB"
  log "detach: Ctrl+b d  |  stop stack: yarn stop-local-stack"
  exec tmux attach-session -t "$SESSION"
}

cmd_rebuild() {
  cmd_stop
  preflight_clean
  LOCAL_STACK_SKIP_CLEAN=1 cmd_start
}

main() {
  local cmd="" pin_ref=""
  while (($#)); do
    case "$1" in
      start | stop | rebuild)
        [[ -z "$cmd" ]] || die "multiple commands: $cmd and $1"
        cmd="$1"
        shift
        ;;
      --pin)
        shift
        [[ -n "${1:-}" ]] || die "--pin requires a ref (tag, commit, branch, or npm version)"
        pin_ref="$1"
        shift
        ;;
      -h | --help | help)
        usage
        exit 0
        ;;
      *)
        die "unknown argument: $1 (try --help)"
        ;;
    esac
  done

  cmd="${cmd:-start}"

  if [[ -n "$pin_ref" ]]; then
    [[ "$cmd" == stop ]] && die "--pin is not valid with stop"
    apply_pin "$pin_ref"
  fi

  case "$cmd" in
    start) cmd_start ;;
    stop) cmd_stop ;;
    rebuild) cmd_rebuild ;;
    *) die "unknown command: $cmd (try --help)" ;;
  esac
}

main "$@"
