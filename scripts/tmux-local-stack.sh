#!/usr/bin/env bash

session="local-stack"

tmux has-session -t $session 2>/dev/null
if [ $? != 0 ]; then
  # Session does not exist, set it up your session
  tmux new-session -d -s $session -x $(tput cols) -y $(tput lines)

  tmux set-window-option automatic-rename off
  tmux set pane-border-status top
  tmux set pane-border-format " #{pane_index} - #{pane_title} "
  
  tmux split-window -h
  tmux split-window -v
  tmux select-pane -t 1
  tmux split-window -v
  
  tmux select-pane -t 1 -T "HARDHAT RPC"
  tmux send-keys -t 1 'cd contracts' Enter
  tmux send-keys -t 1 'yarn start-local'

  tmux select-pane -t 2 -T "GRAPH NODE"
  tmux send-keys -t 2 'cd subgraph' Enter
  tmux send-keys -t 2 'yarn start-local-indexer'

  tmux select-pane -t 3 -T "SUBGRAPH DEPLOY"
  tmux send-keys -t 3 'cd subgraph' Enter
  tmux send-keys -t 3 'yarn rebuild-deploy-local'

  tmux select-pane -t 4 -T "WEB"
  tmux send-keys -t 4 'cd web' Enter
  tmux send-keys -t 4 'yarn start-local'
fi

tmux attach-session -t $session

