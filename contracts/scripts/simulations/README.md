# Guide: Executing the dispute simulations tasks

1. Copy and paste the file `.env.example` and rename it to `.env`.
2. Make sure to be located inside the contracts folder:

```bash
$ cd kleros-v2/contracts/
```

#### To run the scripts in hardhat's localhost network, first you need to do this

```bash
# Open 2 terminals, on the first one, run this:
$ yarn hardhat node --tags Arbitration
# and on the second one, deploy the Arbitrable:
$ yarn deploy --network localhost --tags HomeArbitrable
# all set, from now on, run the scripts on the second console
```

## Scripts start here

Note that if you get some gas related errors when executing any script, you can go to the file `contracts/scripts/simulations/utils.ts` and modify the variable `options` to have more GasPrice/GasLimit. Then save the file and you're good to go.

#### Simulate All

```bash
# This script simulates all at once.
$ yarn hardhat simulate:all --network localhost
```

#### Individual scripts

#### Split PNK

```bash
# This script quickly sends PNK from one wallet to other 4 wallets (the ones declared on the "hardhat.config.ts" as private keys, private key 1 matches walletindex 0, and so on). ENSURE that the five wallets from `.env` are correctly funded with ETH and PNK. Otherwise you will get a lot of nasty errors. In this example, you will need 800 PNK to perform this transaction, because will send 200 PNK to each wallet, watch out.
$ yarn hardhat simulate:split-pnk --walletindex 0 --pnkperwallet 200 --network arbitrumSepolia
```

#### Stake PNK

```bash
# approve KlerosCore to use your PNK tokens on 5 different wallets, then stake them on the court "1" (specify courtid in parameter)
$ yarn hardhat simulate:stake-five-jurors --walletindexes 0,1,2,3,4 --pnkamounts 200,200,200,200,200 --courtid 1 --network arbitrumSepolia
```

#### (optional) Create Court

```bash
# create a new court. Note that the config for creating this court is hardcoded in the task "create-court" in the file "contracts/scripts/simulations/tasks.ts". If you want a specific configuration for the court, you can go there and change the variables.
$ yarn hardhat simulate:create-court --walletindex 0 --network localhost
```

#### Create Dispute

```bash
# create a new dispute (you need some ETH on the calling wallet)
$ yarn hardhat simulate:create-dispute --walletindex 0 --courtid 1 --nbofchoices 2 --nbofjurors 3n --feeforjuror 100000000000000000n --network arbitrumSepolia
```

#### To Freezing and Generating phase

```bash
# pass Core and DK 1 phase each, core to 'freezing' and DK to 'generating'
$ yarn hardhat simulate:to-freezing-and-generating-phase --walletindex 0 --network arbitrumSepolia
```

#### Waits for Rng

```bash
# waits for the random number to be generated and lets you know, we can not continue until this is done
$ yarn hardhat simulate:wait-for-rng --network arbitrumSepolia
```

#### Pass DK phase, draw, unfreeze

```bash
# once the number is generated, this function will move DK to the phase 'drawing', it also draws the jurors for the dispute, then returns the DK and Core phases to 'resolving' and 'staking', respectively
$ yarn hardhat simulate:pass-phase-draw-unfreeze --walletindex 0 --disputeid 0 --network arbitrumSepolia
```

#### (if you created multiple disputes you can use Draw individually)

```bash
# draw jurors for a dispute
$ yarn hardhat simulate:draw --walletindex 0 --disputeid 5 --network arbitrumSepolia
```

#### Submit Evidence

```bash
# submits evidence
$ yarn hardhat simulate:submit-evidence --walletindex 0 --evidencegroupid 35485348662853211036000747072835336201257659261269148469720238392298048238137 --network arbitrumSepolia
```

#### Dispute period to Commit

```bash
# passes the dispute period to commit
$ yarn hardhat simulate:pass-period --walletindex 0 --disputeid 0 --network arbitrumSepolia
```

#### Cast Commit

```bash
# a juror commits its vote
$ yarn hardhat simulate:cast-commit --walletindex 1 --disputeid 0 --choice 1 --justification because --network arbitrumSepolia
```

#### Dispute period to Vote

```bash
# passes the dispute period to voting
$ yarn hardhat simulate:pass-period --walletindex 0 --disputeid 0 --network arbitrumSepolia
```

#### Cast Vote

```bash
# a juror votes. In case there wasn't a commit period, omit the --salt parameter. In case there was a commit period, the commit and vote parameters have to match, and you must include the salt which for testing purposes we will use "123"
$ yarn hardhat simulate:cast-vote --walletindex 1 --disputeid 0 --choice 1 --justification because --salt 123 --network arbitrumSepolia
```

#### Dispute period to Appeal

```bash
# passes the dispute period to appeal
$ yarn hardhat simulate:pass-period --walletindex 0 --disputeid 0 --network arbitrumSepolia
```

#### Fund Appeal

```bash
# appeal a choice
$ yarn hardhat simulate:fund-appeal --walletindex 0 --disputeid 0 --appealchoice 1 --network arbitrumSepolia
```

#### Dispute period to Execution

```bash
# passes the dispute period to execution
$ yarn hardhat simulate:pass-period --walletindex 0 --disputeid 0 --network arbitrumSepolia
```

#### Execute Ruling

```bash
# execute the ruling and end the dispute
$ yarn hardhat simulate:execute-ruling --walletindex 0 --disputeid 0 --network arbitrumSepolia
```

#### Withdraw Fees And Rewards

```bash
# withdraws fees and rewards for the people that won appeals. modify parameters accordingly.
$ yarn hardhat simulate:withdraw-fees-and-rewards --beneficiary 0x1cC9304B31F05d27470ccD855b05310543b70f17 --roundId 0 --choice 1 --walletindex 0 --disputeid 0 --network arbitrumSepolia
```
