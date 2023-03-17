# Guide: Executing the Dispute Workflow Script

1. Copy and paste the file `.env.example` and rename it to `.env`. You can find the values for the private variables in the Kleros private Slack channel "v2".
2. ENSURE that the five wallets from `.env` are correctly funded with ETH and PNK. Otherwise you will get a lot of nasty errors.
3. Navigate to the `disputeWorkflow` folder and follow the steps:

```bash
$ cd contracts/scripts/disputeWorkflow/

# install the dependencies
$ yarn

# compile the code
$ yarn build
```

## Scripts start here

The scripts are supposed to be executed in order. You are also supposed to modify any parameters you want/need in the `executeScripts.ts` file. Then compile again with `$ yarn build`. Note that if you get some gas related errors when executing any script, you can go to the file `scripts.ts` and modify the variable `options` to have more GasPrice/GasLimit. And of course, then compile again with `$ yarn build`.

#### Stake PNK

```bash
# approve KlerosCore to use your PNK tokens on 5 different wallets, and then stake them on the court "1"
$ yarn run stakeFiveJurors
```

#### Create Dispute

```bash
# create a new dispute (you need some ETH on the calling wallet, in this case is WALLET_1 from .env)
# WARNING: save the disputeID generated and hardcode it in the `executeScripts.ts` file for the next functions that accept a disputeID as parameter. Then compile the code again with $ yarn build.
$ yarn run createDispute
```

#### Dispute to Generating

```bash
# pass Core and DK 1 phase each, core to 'freezing' and DK to 'generating'
$ yarn run disputeToGenerating
```

#### Waits for Rng

```bash
# waits for the random number to be generated and lets you know, we cannot continue until this is done
$ yarn run waitingForRng
```

#### Pass DK Phase and Draw

```bash
# once the number is generated, you can run this function and DK will go to the phase 'drawing', it will also draw the jurors for the dispute
$ yarn run passDKPhaseAndDraw
```

#### Dispute period to Voting

```bash
# passes the dispute period to voting
$ yarn run passDisputePeriod
```

#### Cast Vote

```bash
# a juror votes, remember to modify the parameters of this function in the `executeScripts.ts` file to change the juror/choice each time. Then compile the code again with $ yarn build.
$ yarn run vote
```

#### Dispute period to Appeal

```bash
# passes the dispute period to appeal
$ yarn run passDisputePeriod
```

#### Fund Appeal

```bash
# you appeal a choice. remember to modify the parameters of this function in the `executeScripts.ts` file to change the choice each time. Then compile again with $ yarn build.
$ yarn run appeal
```

#### Dispute period to Execution

```bash
# passes the dispute period to execution
$ yarn run passDisputePeriod
```

#### Execute Ruling

```bash
# execute the ruling and end the dispute
$ yarn run execRuling
```

#### Return Phases

```bash
# returns DK and Core phases to "resolving" and "staking", respectively
$ yarn run returnPhases
```
