#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

function generate() { #deploymentDir #explorerUrl
    deploymentDir=$1
    explorerUrl=$2
    for f in $(ls -1 $deploymentDir/*.json | grep -v "PNK.json\|MetaEvidence_*"); do
        contractName=$(basename $f .json)
        address=$(cat $f | jq -r .address)
        echo "- [$contractName]($explorerUrl$address)"
    done
}

echo "### Kleros Chain (Orbit L3 Rollup)"
echo "#### Kleros Protocol"
generate "$SCRIPT_DIR/../deployments/kleroschain" "http://localhost:4000/address/"
echo '
#### Rollup Contracts
- [Rollup](https://goerli.arbiscan.io/address/0xCbe972b865D4Dc0D077FE1f293FD8B9d2aE74370)
- [Inbox](https://goerli.arbiscan.io/address/0x6DcAaD11B3A85548EDec4247D1bb406eBDc4101F)
- [Outbox](https://goerli.arbiscan.io/address/0x5d3e1A839438386E5760e33496dBF8b2d4A99aff)
- [Admin Proxy](https://goerli.arbiscan.io/address/0x8341e3127585fE74B41190e31a05C7da668c779f)
- [Sequencer Inbox](https://goerli.arbiscan.io/address/0xb0cb33Fc9c04661fe54C747e484155A51922A50D)
- [Bridge](https://goerli.arbiscan.io/address/0xfbd46bc3F038eC0E04816AcA23be68Ac0663A84E)
- [Utils](https://goerli.arbiscan.io/address/0x54F8e1d51e4B97d046aE6651fe260ADe4139D553)
- [Validator Wallet Creator](https://goerli.arbiscan.io/address/0x5D8a0a8ee09185d0898f03a057dde4BB3EaDA601)
- Deployed at block number: [28323884](https://goerli.arbiscan.io/block/28323884)

#### Validators

- [Validator #1](https://goerli.arbiscan.io/address/0xdD3748f5DD1212fAa83a8f1233cF610A810c487B)

#### Batch Poster

- [Batch Poster](https://goerli.arbiscan.io/address/0x4288B029865667fE12CF1c9e69d1Da0ab24e946C)
'
echo
echo "### Foreign Chains"
echo "#### Chiado"
echo
generate "$SCRIPT_DIR/../deployments/chiado" "https://blockscout.com/gnosis/chiado/address/"
echo
echo "#### Goerli"
echo
echo "- [PNK](https://goerli.etherscan.io/token/0xA3B02bA6E10F55fb177637917B1b472da0110CcC)"
generate "$SCRIPT_DIR/../deployments/goerli" "https://goerli.etherscan.io/address/"
echo
echo "#### Arbitrum Goerli"
echo
echo "- [PNK](https://goerli.arbiscan.io/token/0x4DEeeFD054434bf6721eF39Aa18EfB3fd0D12610/token-transfers)"
generate "$SCRIPT_DIR/../deployments/arbitrumGoerli" "https://goerli.arbiscan.io/address/"