# Guide: Executing the Dispute Workflow Script

1. Copy and paste the file `.env.example` and rename it to `.env`. You can find the values for the private variables in the Kleros private Slack channel "v2".
2. Ensure that the five wallets from `.env` are correctly funded with ETH and PNK.
3. Navigate to the `executeDisputeWorkflow` folder and run the script:

```bash
$ cd contracts/scripts/executeDisputeWorkflow/
$ rm -rf ./dist && tsc -p ./ --outDir ./dist
$ node dist/scripts/executeDisputeWorkflow/executeDisputeWorkflow.js
```
