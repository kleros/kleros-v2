#!/usr/bin/env bash

session="local-stack"

tmux has-session -t $session 2>/dev/null
if [ $? != 0 ]; then
  # Session does not exist, set it up your session
  tmux new-session -d -s $session -x $(tput cols) -y $(tput lines)

  tmux set-window-option automatic-rename off
  tmux set pane-border-status top
  tmux set pane-border-format " #{pane_index} - #{pane_title} "

  # Some users set 1 as the pane-base-index instead of 0 by default
  index=$(tmux show-options -gv pane-base-index)
  
  tmux split-window -h
  tmux split-window -v
  tmux select-pane -t $index
  tmux split-window -v
  
  tmux select-pane -t $index -T "HARDHAT RPC"
  tmux send-keys -t $index 'cd contracts' Enter
  tmux send-keys -t $index 'yarn start-local'

  (( ++index ))
  tmux select-pane -t $index -T "GRAPH NODE"
  tmux send-keys -t $index 'cd subgraph' Enter
  tmux send-keys -t $index 'yarn start-local-indexer'

  (( ++index ))
  tmux select-pane -t $index -T "SUBGRAPH DEPLOY"
  tmux send-keys -t $index 'cd subgraph' Enter
  tmux send-keys -t $index 'yarn rebuild-deploy-local'

  (( ++index ))
  tmux select-pane -t $index -T "WEB"
  tmux send-keys -t $index 'cd web' Enter
  tmux send-keys -t $index 'yarn start-local'
fi

tmux attach-session -t $session

