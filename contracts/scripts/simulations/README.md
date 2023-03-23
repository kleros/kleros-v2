# Guide: Executing the dispute simulations tasks

1. Copy and paste the file `.env.example` and rename it to `.env`. You can find the values for the private variables in the Kleros private Slack channel "v2".
2. Make sure to be located inside the contracts folder:

```bash
# cd kleros-v2/contracts/
```

## Scripts start here

The scripts are supposed to be executed in order. Note that if you get some gas related errors when executing any script, you can go to the file `contracts/scripts/simulations/utils.ts` and modify the variable `options` to have more GasPrice/GasLimit. Then save the file and you're good to go.

You pass the values you want as parameters on the scripts. I'll give you some parameters as example that work too.

#### Fund with PNK

```bash
# This script quickly sends PNK from one wallet to other 4 wallets (the ones declared on the "hardhat.config.ts" as private keys, private key 1 matches walletindex 0, and so on). ENSURE that the five wallets from `.env` are correctly funded with ETH and PNK. Otherwise you will get a lot of nasty errors. In this example, you will need 800 PNK to perform this transaction, because will send 200 PNK to each wallet, watch out.
$ npx hardhat fund-with-PNK --walletindex 0 --pnkamountforeach 200 --network arbitrumGoerli
```

#### Stake PNK

```bash
# approve KlerosCore to use your PNK tokens on 5 different wallets, and then stake them on the court "1"
$ npx hardhat stake-five-jurors --walletindexes 0,1,2,3,4 --pnkamounts 200,200,200,200,200 --network arbitrumGoerli
```

#### Create Dispute

```bash
# create a new dispute (you need some ETH on the calling wallet)
$ npx hardhat create-dispute --walletindex 0 --nbofchoices 2 --nbofjurors 3n --feeforjuror 100000000000000000n --network arbitrumGoerli
```

#### Dispute to Generating

```bash
# pass Core and DK 1 phase each, core to 'freezing' and DK to 'generating'
$ npx hardhat dispute-to-generating --walletindex 0 --network arbitrumGoerli
```

#### Waits for Rng

```bash
# waits for the random number to be generated and lets you know, we cannot continue until this is done
$ npx hardhat wait-for-rng --network arbitrumGoerli
```

#### Pass DK Phase and Draw

```bash
# once the number is generated, you can run this function and DK will go to the phase 'drawing', it will also draw the jurors for the dispute
$ npx hardhat pass-dk-phase-and-draw --walletindex 0 --disputeid 0 --network arbitrumGoerli
```

#### Dispute period to Commit

```bash
# passes the dispute period to commit
$ npx hardhat pass-period --walletindex 0 --disputeid 0 --network arbitrumGoerli
```

#### Cast Commit

```bash
# a juror commits its vote. Modify walletindex to match the drawn juror, who will be calling this function. The index is the same order as the accounts listed on the file "hardhat.config.ts" (ex: firstWallet matches walletindex 0, and so on)
$ npx hardhat cast-commit --walletindex 1 --disputeid 0 --voteids 0 --choice 1 --justification because --network arbitrumGoerli
```

#### Dispute period to Vote

```bash
# passes the dispute period to voting
$ npx hardhat pass-period --walletindex 0 --disputeid 0 --network arbitrumGoerli
```

#### Cast Vote

```bash
# a juror votes. IN CASE THERE WAS NO COMMIT PERIOD; PUT SALT AS 0 (ex: --salt 0). In case there was a commit period, the commit and vote parameters have to match, and you must include the salt, which for testing purposes we will always use "123" as the salt.
$ npx hardhat cast-vote --walletindex 1 --disputeid 0 --voteids 0 --choice 1 --justification because --salt 123 --network arbitrumGoerli
```

#### Dispute period to Appeal

```bash
# passes the dispute period to appeal
$ npx hardhat pass-period --walletindex 0 --disputeid 0 --network arbitrumGoerli
```

#### Fund Appeal

```bash
# you appeal a choice. by default you will always appeal with 0.5 ETH so make sure you have funds, you will receive the difference automatically by the Core contract. You can modify this quantity in the "tasks.ts" file if you want.
$ npx hardhat fund-appeal --walletindex 0 --disputeid 0 --choice 1 --network arbitrumGoerli
```

#### Dispute period to Execution

```bash
# passes the dispute period to execution
$ npx hardhat pass-period --walletindex 0 --disputeid 0 --network arbitrumGoerli
```

#### Execute Ruling

```bash
# execute the ruling and end the dispute
$ npx hardhat execute-ruling --walletindex 0 --disputeid 0 --network arbitrumGoerli
```

#### Withdraw Fees And Rewards

```bash
# withdraws fees and rewards for the people that won appeals. modify parameters accordingly.
$ npx hardhat withdraw-fees-and-rewards --beneficiary 0x1cC9304B31F05d27470ccD855b05310543b70f17 --roundId 0 --choice 1 --walletindex 0 --disputeid 0 --network arbitrumGoerli
```

#### Return Phases

```bash
# returns DK and Core phases to "resolving" and "staking", respectively
$ npx hardhat return-phases --walletindex 0 --network arbitrumGoerli
```
