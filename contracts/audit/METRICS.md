[<img width="200" alt="get in touch with Consensys Diligence" src="https://user-images.githubusercontent.com/2865694/56826101-91dcf380-685b-11e9-937c-af49c2510aa0.png">](https://consensys.io/diligence)<br/>
<sup>
[[  🌐  ](https://consensys.io/diligence)  [  📩  ](mailto:diligence@consensys.net)  [  🔥  ](https://consensys.io/diligence/tools/)]
</sup><br/><br/>



# Solidity Metrics for 'CLI'

## Table of contents

- [Scope](#t-scope)
    - [Source Units in Scope](#t-source-Units-in-Scope)
        - [Deployable Logic Contracts](#t-deployable-contracts)
    - [Out of Scope](#t-out-of-scope)
        - [Excluded Source Units](#t-out-of-scope-excluded-source-units)
        - [Duplicate Source Units](#t-out-of-scope-duplicate-source-units)
        - [Doppelganger Contracts](#t-out-of-scope-doppelganger-contracts)
- [Report Overview](#t-report)
    - [Risk Summary](#t-risk)
    - [Source Lines](#t-source-lines)
    - [Inline Documentation](#t-inline-documentation)
    - [Components](#t-components)
    - [Exposed Functions](#t-exposed-functions)
    - [StateVariables](#t-statevariables)
    - [Capabilities](#t-capabilities)
    - [Dependencies](#t-package-imports)
    - [Totals](#t-totals)

## <span id=t-scope>Scope</span>

This section lists files that are in scope for the metrics report. 

- **Project:** `'CLI'`
- **Included Files:** 
    - ``
- **Excluded Paths:** 
    - ``
- **File Limit:** `undefined`
    - **Exclude File list Limit:** `undefined`

- **Workspace Repository:** `unknown` (`undefined`@`undefined`)

### <span id=t-source-Units-in-Scope>Source Units in Scope</span>

Source Units Analyzed: **`29`**<br>
Source Units in Scope: **`29`** (**100%**)

| Type | File   | Logic Contracts | Interfaces | Lines | nLines | nSLOC | Comment Lines | Complex. Score | Capabilities |
| ---- | ------ | --------------- | ---------- | ----- | ------ | ----- | ------------- | -------------- | ------------ | 
| 📝 | src\arbitration\KlerosCore.sol | 1 | **** | 1172 | 1130 | 684 | 351 | 360 | **<abbr title='Uses Assembly'>🖥</abbr><abbr title='Payable Functions'>💰</abbr>** |
| 📝 | src\arbitration\PolicyRegistry.sol | 1 | **** | 79 | 79 | 25 | 38 | 18 | **** |
| 📝 | src\arbitration\SortitionModule.sol | 1 | **** | 437 | 422 | 227 | 163 | 162 | **<abbr title='Uses Hash-Functions'>🧮</abbr>** |
| 📝 | src\arbitration\arbitrables\DisputeResolver.sol | 1 | **** | 133 | 123 | 60 | 55 | 30 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝 | src\arbitration\DisputeTemplateRegistry.sol | 1 | **** | 36 | 32 | 9 | 18 | 7 | **** |
| 📝 | src\arbitration\dispute-kits\CentralizedKit.sol | 1 | **** | 304 | 268 | 105 | 136 | 80 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝 | src\arbitration\dispute-kits\DisputeKitClassic.sol | 1 | **** | 731 | 678 | 383 | 241 | 206 | **<abbr title='Payable Functions'>💰</abbr><abbr title='Uses Hash-Functions'>🧮</abbr>** |
| 📝🔍 | src\arbitration\dispute-kits\DisputeKitGated.sol | 1 | 2 | 800 | 726 | 407 | 270 | 229 | **<abbr title='Payable Functions'>💰</abbr><abbr title='Uses Hash-Functions'>🧮</abbr><abbr title='doppelganger(IBalanceHolderERC1155)'>🔆</abbr>** |
| 📝🔍 | src\arbitration\dispute-kits\DisputeKitGatedArgentinaConsumerProtection.sol | 1 | 1 | 792 | 722 | 409 | 263 | 229 | **<abbr title='Payable Functions'>💰</abbr><abbr title='Uses Hash-Functions'>🧮</abbr>** |
| 📝🔍 | src\arbitration\dispute-kits\DisputeKitGatedShutter.sol | 1 | 2 | 856 | 778 | 444 | 282 | 243 | **<abbr title='Payable Functions'>💰</abbr><abbr title='Uses Hash-Functions'>🧮</abbr><abbr title='doppelganger(IBalanceHolderERC1155)'>🔆</abbr>** |
| 📝 | src\arbitration\dispute-kits\DisputeKitShutter.sol | 1 | **** | 788 | 732 | 420 | 253 | 220 | **<abbr title='Payable Functions'>💰</abbr><abbr title='Uses Hash-Functions'>🧮</abbr>** |
| 📝🔍 | src\arbitration\dispute-kits\DisputeKitSybilResistant.sol | 1 | 1 | 799 | 729 | 411 | 266 | 229 | **<abbr title='Payable Functions'>💰</abbr><abbr title='Uses Hash-Functions'>🧮</abbr><abbr title='doppelganger(IProofOfHumanity)'>🔆</abbr>** |
| 📝 | src\arbitration\evidence\EvidenceModule.sol | 1 | **** | 19 | 19 | 7 | 8 | 6 | **** |
| 🔍 | src\arbitration\interfaces\IArbitrableV2.sol | **** | 1 | 42 | 41 | 6 | 28 | 3 | **** |
| 🔍 | src\arbitration\interfaces\IArbitratorV2.sol | **** | 1 | 63 | 42 | 8 | 38 | 10 | **<abbr title='Payable Functions'>💰</abbr>** |
| 🔍 | src\arbitration\interfaces\ICourtEligibility.sol | **** | 1 | 15 | 14 | 3 | 9 | 3 | **<abbr title='doppelganger(ICourtEligibility)'>🔆</abbr>** |
| 🔍 | src\arbitration\interfaces\IDisputeKit.sol | **** | 1 | 175 | 37 | 10 | 101 | 25 | **** |
| 🔍 | src\arbitration\interfaces\IDisputeTemplateRegistry.sol | **** | 1 | 41 | 36 | 9 | 22 | 3 | **** |
| 🔍 | src\arbitration\interfaces\IEvidence.sol | **** | 1 | 12 | 12 | 4 | 6 | 1 | **** |
| 🔍 | src\arbitration\interfaces\ISortitionModule.sol | **** | 1 | 135 | 34 | 11 | 87 | 29 | **** |
| 📝 | src\governance\LeaderboardOffset.sol | 1 | **** | 63 | 63 | 19 | 30 | 11 | **** |
|  | src\libraries\Constants.sol | **** | **** | 25 | 25 | 12 | 15 | 2 | **** |
| 📚 | src\libraries\SortitionTrees.sol | 1 | **** | 248 | 234 | 117 | 94 | 53 | **<abbr title='Uses Assembly'>🖥</abbr>** |
| 📚 | src\libraries\SafeERC20.sol | 1 | **** | 53 | 53 | 21 | 27 | 15 | **** |
| 📚🔍 | src\libraries\SafeSend.sol | 1 | 1 | 36 | 26 | 9 | 20 | 15 | **<abbr title='Payable Functions'>💰</abbr><abbr title='Initiates ETH Value Transfer'>📤</abbr>** |
| 📝 | src\rng\RNGWithFallback.sol | 1 | **** | 134 | 134 | 62 | 56 | 41 | **<abbr title='TryCatch Blocks'>♻️</abbr>** |
| 📝 | src\rng\ChainlinkRNG.sol | 1 | **** | 209 | 209 | 106 | 80 | 64 | **** |
| 🔍 | src\rng\IRNG.sol | **** | 1 | 19 | 14 | 3 | 10 | 5 | **** |
| 📝 | src\token\SBT.sol | 1 | **** | 123 | 123 | 52 | 51 | 41 | **** |
| 📝📚🔍 | **Totals** | **20** | **15** | **8339**  | **7535** | **4043** | **3018** | **2340** | **<abbr title='Uses Assembly'>🖥</abbr><abbr title='Payable Functions'>💰</abbr><abbr title='Initiates ETH Value Transfer'>📤</abbr><abbr title='Uses Hash-Functions'>🧮</abbr><abbr title='doppelganger'>🔆</abbr><abbr title='TryCatch Blocks'>♻️</abbr>** |

<sub>
Legend: <a onclick="toggleVisibility('table-legend', this)">[➕]</a>
<div id="table-legend" style="display:none">

<ul>
<li> <b>Lines</b>: total lines of the source unit </li>
<li> <b>nLines</b>: normalized lines of the source unit (e.g. normalizes functions spanning multiple lines) </li>
<li> <b>nSLOC</b>: normalized source lines of code (only source-code lines; no comments, no blank lines) </li>
<li> <b>Comment Lines</b>: lines containing single or block comments </li>
<li> <b>Complexity Score</b>: a custom complexity score derived from code statements that are known to introduce code complexity (branches, loops, calls, external interfaces, ...) </li>
</ul>

</div>
</sub>


##### <span id=t-deployable-contracts>Deployable Logic Contracts</span>
Total: 17
* 📝 `KlerosCore`
* 📝 `PolicyRegistry`
* 📝 `SortitionModule`
* 📝 `DisputeResolver`
* 📝 `DisputeTemplateRegistry`
* <a onclick="toggleVisibility('deployables', this)">[➕]</a>
<div id="deployables" style="display:none">
<ul>
<li> 📝 <code>CentralizedKit</code></li>
<li> 📝 <code>DisputeKitClassic</code></li>
<li> 📝 <code>DisputeKitGated</code></li>
<li> 📝 <code>DisputeKitGatedArgentinaConsumerProtection</code></li>
<li> 📝 <code>DisputeKitGatedShutter</code></li>
<li> 📝 <code>DisputeKitShutter</code></li>
<li> 📝 <code>DisputeKitSybilResistant</code></li>
<li> 📝 <code>EvidenceModule</code></li>
<li> 📝 <code>LeaderboardOffset</code></li>
<li> 📝 <code>RNGWithFallback</code></li>
<li> 📝 <code>ChainlinkRNG</code></li>
<li> 📝 <code>SBT</code></li>
</ul>
</div>
            



#### <span id=t-out-of-scope>Out of Scope</span>

##### <span id=t-out-of-scope-excluded-source-units>Excluded Source Units</span>

Source Units Excluded: **`0`**

<a onclick="toggleVisibility('excluded-files', this)">[➕]</a>
<div id="excluded-files" style="display:none">
| File   |
| ------ |
| None |

</div>


##### <span id=t-out-of-scope-duplicate-source-units>Duplicate Source Units</span>

Duplicate Source Units Excluded: **`0`** 

<a onclick="toggleVisibility('duplicate-files', this)">[➕]</a>
<div id="duplicate-files" style="display:none">
| File   |
| ------ |
| None |

</div>

##### <span id=t-out-of-scope-doppelganger-contracts>Doppelganger Contracts</span>

Doppelganger Contracts: **`4`** 

<a onclick="toggleVisibility('doppelganger-contracts', this)">[➕]</a>
<div id="doppelganger-contracts" style="display:none">
| File   | Contract | Doppelganger | 
| ------ | -------- | ------------ |
| src\arbitration\dispute-kits\DisputeKitGated.sol | IBalanceHolderERC1155 | (fuzzy) [0](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v2.5.0/contracts/introspection/IERC1820Implementer.sol), [1](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.2.0/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [2](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.2.2-solc-0.7/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [3](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.3.0/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [4](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.3.0-solc-0.7/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [5](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.4.0/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [6](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.4.0-solc-0.7/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [7](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.0.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [8](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.0.0-beta.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [9](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.0.0-rc.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [10](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.1.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [11](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.1.0-rc.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [12](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.2.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [13](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0/contracts/introspection/IERC1820Implementer.sol), [14](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.0/contracts/drafts/IERC1820Implementer.sol), [15](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.1/contracts/drafts/IERC1820Implementer.sol), [16](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.2/contracts/introspection/IERC1820Implementer.sol), [17](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.3/contracts/introspection/IERC1820Implementer.sol), [18](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0/contracts/introspection/IERC1820Implementer.sol), [19](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0-beta.0/contracts/introspection/IERC1820Implementer.sol), [20](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0-beta.1/contracts/introspection/IERC1820Implementer.sol), [21](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0-beta.2/contracts/introspection/IERC1820Implementer.sol), [22](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.0/contracts/introspection/IERC1820Implementer.sol), [23](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.0-rc.0/contracts/introspection/IERC1820Implementer.sol), [24](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.1/contracts/introspection/IERC1820Implementer.sol), [25](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/introspection/IERC1820Implementer.sol), [26](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0-beta.0/contracts/introspection/IERC1820Implementer.sol), [27](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0-rc.0/contracts/introspection/IERC1820Implementer.sol), [28](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0-rc.1/contracts/introspection/IERC1820Implementer.sol), [29](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.1/contracts/introspection/IERC1820Implementer.sol), [30](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.2/contracts/introspection/IERC1820Implementer.sol), [31](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/introspection/IERC1820Implementer.sol), [32](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0-rc.0/contracts/introspection/IERC1820Implementer.sol), [33](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.0/contracts/introspection/IERC1820Implementer.sol), [34](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.0-rc.0/contracts/introspection/IERC1820Implementer.sol), [35](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.1-solc-0.7/contracts/introspection/IERC1820Implementer.sol), [36](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.2-solc-0.7/contracts/introspection/IERC1820Implementer.sol) |
| src\arbitration\dispute-kits\DisputeKitGatedShutter.sol | IBalanceHolderERC1155 | (fuzzy) [0](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v2.5.0/contracts/introspection/IERC1820Implementer.sol), [1](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.2.0/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [2](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.2.2-solc-0.7/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [3](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.3.0/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [4](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.3.0-solc-0.7/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [5](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.4.0/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [6](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.4.0-solc-0.7/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [7](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.0.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [8](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.0.0-beta.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [9](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.0.0-rc.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [10](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.1.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [11](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.1.0-rc.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [12](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.2.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [13](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0/contracts/introspection/IERC1820Implementer.sol), [14](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.0/contracts/drafts/IERC1820Implementer.sol), [15](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.1/contracts/drafts/IERC1820Implementer.sol), [16](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.2/contracts/introspection/IERC1820Implementer.sol), [17](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.3/contracts/introspection/IERC1820Implementer.sol), [18](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0/contracts/introspection/IERC1820Implementer.sol), [19](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0-beta.0/contracts/introspection/IERC1820Implementer.sol), [20](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0-beta.1/contracts/introspection/IERC1820Implementer.sol), [21](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0-beta.2/contracts/introspection/IERC1820Implementer.sol), [22](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.0/contracts/introspection/IERC1820Implementer.sol), [23](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.0-rc.0/contracts/introspection/IERC1820Implementer.sol), [24](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.1/contracts/introspection/IERC1820Implementer.sol), [25](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/introspection/IERC1820Implementer.sol), [26](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0-beta.0/contracts/introspection/IERC1820Implementer.sol), [27](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0-rc.0/contracts/introspection/IERC1820Implementer.sol), [28](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0-rc.1/contracts/introspection/IERC1820Implementer.sol), [29](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.1/contracts/introspection/IERC1820Implementer.sol), [30](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.2/contracts/introspection/IERC1820Implementer.sol), [31](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/introspection/IERC1820Implementer.sol), [32](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0-rc.0/contracts/introspection/IERC1820Implementer.sol), [33](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.0/contracts/introspection/IERC1820Implementer.sol), [34](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.0-rc.0/contracts/introspection/IERC1820Implementer.sol), [35](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.1-solc-0.7/contracts/introspection/IERC1820Implementer.sol), [36](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.2-solc-0.7/contracts/introspection/IERC1820Implementer.sol) |
| src\arbitration\dispute-kits\DisputeKitSybilResistant.sol | IProofOfHumanity | (fuzzy) [0](https://github.com/smartcontractkit/chainlink/blob/explorer-v0.8.5/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [1](https://github.com/smartcontractkit/chainlink/blob/upgrade/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [2](https://github.com/smartcontractkit/chainlink/blob/v.0.8.12/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [3](https://github.com/smartcontractkit/chainlink/blob/v0.8.12/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [4](https://github.com/smartcontractkit/chainlink/blob/v0.8.13/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [5](https://github.com/smartcontractkit/chainlink/blob/v0.8.14/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [6](https://github.com/smartcontractkit/chainlink/blob/v0.8.15/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [7](https://github.com/smartcontractkit/chainlink/blob/v0.8.16/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [8](https://github.com/smartcontractkit/chainlink/blob/v0.8.17/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [9](https://github.com/smartcontractkit/chainlink/blob/v0.8.18/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [10](https://github.com/smartcontractkit/chainlink/blob/v0.9.0/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [11](https://github.com/smartcontractkit/chainlink/blob/v0.9.2/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [12](https://github.com/smartcontractkit/chainlink/blob/v0.9.3/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [13](https://github.com/smartcontractkit/chainlink/blob/v0.9.4/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [14](https://github.com/smartcontractkit/chainlink/blob/v0.9.5/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [15](https://github.com/smartcontractkit/chainlink/blob/v0.9.6/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [16](https://github.com/smartcontractkit/chainlink/blob/v0.9.7/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [17](https://github.com/smartcontractkit/chainlink/blob/v0.9.8/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [18](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v2.0.0/contracts/introspection/IERC165.sol), [19](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v2.0.1/contracts/introspection/IERC165.sol), [20](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v2.0.2/contracts/introspection/IERC165.sol), [21](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v2.1.2/contracts/introspection/IERC165.sol), [22](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v2.1.3/contracts/introspection/IERC165.sol), [23](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v2.2.1/contracts/introspection/IERC165.sol), [24](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v2.2.2/contracts/introspection/IERC165.sol), [25](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v2.2.3/contracts/introspection/IERC165.sol), [26](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v2.5.0/contracts/introspection/IERC165.sol), [27](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.2.0/contracts/introspection/IERC165Upgradeable.sol), [28](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.2.2-solc-0.7/contracts/introspection/IERC165Upgradeable.sol), [29](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.3.0/contracts/introspection/IERC165Upgradeable.sol), [30](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.3.0-solc-0.7/contracts/introspection/IERC165Upgradeable.sol), [31](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.4.0/contracts/introspection/IERC165Upgradeable.sol), [32](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.4.0-solc-0.7/contracts/introspection/IERC165Upgradeable.sol), [33](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.0.0/contracts/utils/introspection/IERC165Upgradeable.sol), [34](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.0.0-beta.0/contracts/utils/introspection/IERC165Upgradeable.sol), [35](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.0.0-rc.0/contracts/utils/introspection/IERC165Upgradeable.sol), [36](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.1.0/contracts/utils/introspection/IERC165Upgradeable.sol), [37](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.1.0-rc.0/contracts/utils/introspection/IERC165Upgradeable.sol), [38](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.2.0/contracts/utils/introspection/IERC165Upgradeable.sol), [39](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.0.0/contracts/introspection/IERC165.sol), [40](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.0.0-rc.1/contracts/introspection/IERC165.sol), [41](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.0.0-rc.2/contracts/introspection/IERC165.sol), [42](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.0.0-rc.3/contracts/introspection/IERC165.sol), [43](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.0.0-rc.4/contracts/introspection/IERC165.sol), [44](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.0.1/contracts/introspection/IERC165.sol), [45](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.1.0-rc.1/contracts/introspection/IERC165.sol), [46](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.1.0-rc.2/contracts/introspection/IERC165.sol), [47](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.1.1/contracts/introspection/IERC165.sol), [48](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.1.2/contracts/introspection/IERC165.sol), [49](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.1.3/contracts/introspection/IERC165.sol), [50](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.2.0/contracts/introspection/IERC165.sol), [51](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.2.0-rc.1/contracts/introspection/IERC165.sol), [52](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0/contracts/introspection/IERC165.sol), [53](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.0/contracts/introspection/IERC165.sol), [54](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.1/contracts/introspection/IERC165.sol), [55](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.2/contracts/introspection/IERC165.sol), [56](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.3/contracts/introspection/IERC165.sol), [57](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0/contracts/introspection/IERC165.sol), [58](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0-beta.0/contracts/introspection/IERC165.sol), [59](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0-beta.1/contracts/introspection/IERC165.sol), [60](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0-beta.2/contracts/introspection/IERC165.sol), [61](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.0/contracts/introspection/IERC165.sol), [62](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.0-rc.0/contracts/introspection/IERC165.sol), [63](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.1/contracts/introspection/IERC165.sol), [64](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/introspection/IERC165.sol), [65](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0-beta.0/contracts/introspection/IERC165.sol), [66](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0-rc.0/contracts/introspection/IERC165.sol), [67](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0-rc.1/contracts/introspection/IERC165.sol), [68](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.1/contracts/introspection/IERC165.sol), [69](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.2/contracts/introspection/IERC165.sol), [70](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/introspection/IERC165.sol), [71](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0-rc.0/contracts/introspection/IERC165.sol), [72](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.0/contracts/introspection/IERC165.sol), [73](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.0-rc.0/contracts/introspection/IERC165.sol), [74](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.1-solc-0.7/contracts/introspection/IERC165.sol), [75](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.2-solc-0.7/contracts/introspection/IERC165.sol) |
| src\arbitration\interfaces\ICourtEligibility.sol | ICourtEligibility | (fuzzy) [0](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v2.5.0/contracts/introspection/IERC1820Implementer.sol), [1](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.2.0/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [2](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.2.2-solc-0.7/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [3](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.3.0/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [4](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.3.0-solc-0.7/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [5](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.4.0/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [6](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.4.0-solc-0.7/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [7](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.0.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [8](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.0.0-beta.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [9](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.0.0-rc.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [10](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.1.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [11](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.1.0-rc.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [12](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.2.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [13](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0/contracts/introspection/IERC1820Implementer.sol), [14](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.0/contracts/drafts/IERC1820Implementer.sol), [15](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.1/contracts/drafts/IERC1820Implementer.sol), [16](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.2/contracts/introspection/IERC1820Implementer.sol), [17](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.3/contracts/introspection/IERC1820Implementer.sol), [18](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0/contracts/introspection/IERC1820Implementer.sol), [19](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0-beta.0/contracts/introspection/IERC1820Implementer.sol), [20](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0-beta.1/contracts/introspection/IERC1820Implementer.sol), [21](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0-beta.2/contracts/introspection/IERC1820Implementer.sol), [22](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.0/contracts/introspection/IERC1820Implementer.sol), [23](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.0-rc.0/contracts/introspection/IERC1820Implementer.sol), [24](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.1/contracts/introspection/IERC1820Implementer.sol), [25](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/introspection/IERC1820Implementer.sol), [26](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0-beta.0/contracts/introspection/IERC1820Implementer.sol), [27](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0-rc.0/contracts/introspection/IERC1820Implementer.sol), [28](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0-rc.1/contracts/introspection/IERC1820Implementer.sol), [29](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.1/contracts/introspection/IERC1820Implementer.sol), [30](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.2/contracts/introspection/IERC1820Implementer.sol), [31](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/introspection/IERC1820Implementer.sol), [32](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0-rc.0/contracts/introspection/IERC1820Implementer.sol), [33](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.0/contracts/introspection/IERC1820Implementer.sol), [34](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.0-rc.0/contracts/introspection/IERC1820Implementer.sol), [35](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.1-solc-0.7/contracts/introspection/IERC1820Implementer.sol), [36](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.2-solc-0.7/contracts/introspection/IERC1820Implementer.sol) |

</div>


## <span id=t-report>Report</span>

### Overview

The analysis finished with **`0`** errors and **`0`** duplicate files.





#### <span id=t-risk>Risk</span>

<div class="wrapper" style="max-width: 512px; margin: auto">
			<canvas id="chart-risk-summary"></canvas>
</div>

#### <span id=t-source-lines>Source Lines (sloc vs. nsloc)</span>

<div class="wrapper" style="max-width: 512px; margin: auto">
    <canvas id="chart-nsloc-total"></canvas>
</div>

#### <span id=t-inline-documentation>Inline Documentation</span>

- **Comment-to-Source Ratio:** On average there are`1.53` code lines per comment (lower=better).
- **ToDo's:** `0` 

#### <span id=t-components>Components</span>

| 📝Contracts   | 📚Libraries | 🔍Interfaces | 🎨Abstract |
| ------------- | ----------- | ------------ | ---------- |
| 17 | 3  | 15  | 0 |

#### <span id=t-exposed-functions>Exposed Functions</span>

This section lists functions that are explicitly declared public or payable. Please note that getter methods for public stateVars are not included.  

| 🌐Public   | 💰Payable |
| ---------- | --------- |
| 267 | 12  | 

| External   | Internal | Private | Pure | View |
| ---------- | -------- | ------- | ---- | ---- |
| 227 | 155  | 1 | 5 | 143 |

#### <span id=t-statevariables>StateVariables</span>

| Total      | 🌐Public  |
| ---------- | --------- |
| 139  | 123 |

#### <span id=t-capabilities>Capabilities</span>

| Solidity Versions observed | 🧪 Experimental Features | 💰 Can Receive Funds | 🖥 Uses Assembly | 💣 Has Destroyable Contracts | 
| -------------------------- | ------------------------ | -------------------- | ---------------- | ---------------------------- |
| `^0.8.28`<br/>`>=0.8.0 <0.9.0` |  | `yes` | `yes` <br/>(4 asm blocks) | **** | 

| 📤 Transfers ETH | ⚡ Low-Level Calls | 👥 DelegateCall | 🧮 Uses Hash Functions | 🔖 ECRecover | 🌀 New/Create/Create2 |
| ---------------- | ----------------- | --------------- | ---------------------- | ------------ | --------------------- |
| `yes` | **** | **** | `yes` | **** | **** | 

| ♻️ TryCatch | Σ Unchecked |
| ---------- | ----------- |
| `yes` | **** |

#### <span id=t-package-imports>Dependencies / External Imports</span>

| Dependency / Import Path | Count  | 
| ------------------------ | ------ |
| @chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol | 1 |
| @chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFMigratableConsumerV2Plus.sol | 1 |
| @chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol | 1 |
| @openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol | 10 |
| @openzeppelin/contracts/token/ERC20/IERC20.sol | 4 |

#### <span id=t-totals>Totals</span>

##### Summary

<div class="wrapper" style="max-width: 90%; margin: auto">
    <canvas id="chart-num-bar"></canvas>
</div>

##### AST Node Statistics

###### Function Calls

<div class="wrapper" style="max-width: 90%; margin: auto">
    <canvas id="chart-num-bar-ast-funccalls"></canvas>
</div>

###### Assembly Calls

<div class="wrapper" style="max-width: 90%; margin: auto">
    <canvas id="chart-num-bar-ast-asmcalls"></canvas>
</div>

###### AST Total

<div class="wrapper" style="max-width: 90%; margin: auto">
    <canvas id="chart-num-bar-ast"></canvas>
</div>

##### Inheritance Graph

<a onclick="toggleVisibility('surya-inherit', this)">[➕]</a>
<div id="surya-inherit" style="display:none">
<div class="wrapper" style="max-width: 512px; margin: auto">
    <div id="surya-inheritance" style="text-align: center;"></div> 
</div>
</div>

##### CallGraph

<a onclick="toggleVisibility('surya-call', this)">[➕]</a>
<div id="surya-call" style="display:none">
<div class="wrapper" style="max-width: 512px; margin: auto">
    <div id="surya-callgraph" style="text-align: center;"></div>
</div>
</div>

###### Contract Summary

<a onclick="toggleVisibility('surya-mdreport', this)">[➕]</a>
<div id="surya-mdreport" style="display:none">
 

 Files Description Table


|  File Name  |  SHA-1 Hash  |
|-------------|--------------|
| src\arbitration\KlerosCore.sol | fc1efe6130e7fc893286c8e45d7215b32541922d |
| src\arbitration\PolicyRegistry.sol | a45745313b0bade047143fba6e788f261fce42f3 |
| src\arbitration\SortitionModule.sol | b26116e16fc1ab464d0426b2c44ccde8eb8d5778 |
| src\arbitration\arbitrables\DisputeResolver.sol | 91abe89345d5b147b82cbfdeb974675a6728ce99 |
| src\arbitration\DisputeTemplateRegistry.sol | 943cc655ad9627d7adebe030f60f78ede0c1592e |
| src\arbitration\dispute-kits\CentralizedKit.sol | 0ed4db82818fa093cff5e1bc01484d373326d26d |
| src\arbitration\dispute-kits\DisputeKitClassic.sol | 62adc210c263a2f92ebd10c903ec530fc81181dd |
| src\arbitration\dispute-kits\DisputeKitGated.sol | afbc1034eb6b23f2a8a49704947814240e5c3231 |
| src\arbitration\dispute-kits\DisputeKitGatedArgentinaConsumerProtection.sol | 8d064156ca1a19f3b42528d3d6e9a7dc4d9fb31c |
| src\arbitration\dispute-kits\DisputeKitGatedShutter.sol | d02090257349d5dfaea5739addb465689b45711d |
| src\arbitration\dispute-kits\DisputeKitShutter.sol | e5ef98b5e85dea10127a73ec94e23cb35d441151 |
| src\arbitration\dispute-kits\DisputeKitSybilResistant.sol | 207779f6c172613d0fabcc751c12abba2af5c350 |
| src\arbitration\evidence\EvidenceModule.sol | 7b3cfdde2c62ec434c851b1485e2d4488085b643 |
| src\arbitration\interfaces\IArbitrableV2.sol | 15aa469bbe3c732d717d6974bfb64f9513bd25e3 |
| src\arbitration\interfaces\IArbitratorV2.sol | 05b53dd7766b43ae3f5eec173de061559d9c650a |
| src\arbitration\interfaces\ICourtEligibility.sol | c5ac6d358e9319b8c9d545d7ffb1cb3bc8f813a6 |
| src\arbitration\interfaces\IDisputeKit.sol | f410c74c32f2556fea5a1c76435ea4ce510d7398 |
| src\arbitration\interfaces\IDisputeTemplateRegistry.sol | fda30871a4c0c6e61156877a38f1c973e9a5e8e0 |
| src\arbitration\interfaces\IEvidence.sol | 1125e3a05ad7e5059f981355573c01845950f7ca |
| src\arbitration\interfaces\ISortitionModule.sol | 283a1aab370f91f924a2b1fb5b24ad1f52cd1462 |
| src\governance\LeaderboardOffset.sol | 062393a84dfd279f4830f7cc99e5e363c9abe51a |
| src\libraries\Constants.sol | e329cd582239eb6595e52cbcdd158ac7c2b60bb2 |
| src\libraries\SortitionTrees.sol | ec8f4f2b95c7775184272a3d815c704d1210b5bd |
| src\libraries\SafeERC20.sol | 65f781c761067b1e5a299e2efb78b36a24d4d880 |
| src\libraries\SafeSend.sol | ce915f80552b069b49f3e6d7555ff4fc9beca2d2 |
| src\rng\RNGWithFallback.sol | dc39fea427df047b9077e92bc1742e772ea49ca8 |
| src\rng\ChainlinkRNG.sol | 9c1bfa55805d1d99be860d6eec70ea5f297b4d74 |
| src\rng\IRNG.sol | 1d021016d253cdf1e60177808a76f31037fa8bd1 |
| src\token\SBT.sol | 8f2f4f2c2ab94780d326a700c1c08c5f682ccb66 |


 Contracts Description Table


|  Contract  |         Type        |       Bases      |                  |                 |
|:----------:|:-------------------:|:----------------:|:----------------:|:---------------:|
|     └      |  **Function Name**  |  **Visibility**  |  **Mutability**  |  **Modifiers**  |
||||||
| **KlerosCore** | Implementation | IArbitratorV2, Initializable |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | initialize | External ❗️ | 🛑  | initializer |
| └ | executeOwnerProposal | External ❗️ | 🛑  | onlyOwner |
| └ | changeOwner | External ❗️ | 🛑  | onlyOwner |
| └ | changePnkToken | External ❗️ | 🛑  | onlyOwner |
| └ | changeSortitionModule | External ❗️ | 🛑  | onlyOwner |
| └ | addNewDisputeKit | External ❗️ | 🛑  | onlyOwner |
| └ | createCourt | External ❗️ | 🛑  | onlyOwner |
| └ | changeCourtParameters | External ❗️ | 🛑  | onlyOwner |
| └ | enableDisputeKits | External ❗️ | 🛑  | onlyOwner |
| └ | setStake | External ❗️ | 🛑  |NO❗️ |
| └ | forceUnstake | External ❗️ | 🛑  |NO❗️ |
| └ | depositTokens | External ❗️ | 🛑  |NO❗️ |
| └ | withdrawTokens | External ❗️ | 🛑  |NO❗️ |
| └ | createDispute | External ❗️ |  💵 |NO❗️ |
| └ | passPeriod | External ❗️ | 🛑  |NO❗️ |
| └ | draw | External ❗️ | 🛑  |NO❗️ |
| └ | appeal | External ❗️ |  💵 |NO❗️ |
| └ | execute | External ❗️ | 🛑  |NO❗️ |
| └ | executeRuling | External ❗️ | 🛑  |NO❗️ |
| └ | arbitrationCost | Public ❗️ |   |NO❗️ |
| └ | appealCost | Public ❗️ |   |NO❗️ |
| └ | appealPeriod | External ❗️ |   |NO❗️ |
| └ | currentRuling | Public ❗️ |   |NO❗️ |
| └ | getRoundInfo | External ❗️ |   |NO❗️ |
| └ | getAdditionalCourtParams | External ❗️ |   |NO❗️ |
| └ | getCourtParametersIndex | External ❗️ |   |NO❗️ |
| └ | getTotalFeesForJurors | External ❗️ |   |NO❗️ |
| └ | getPnkAtStakePerJuror | External ❗️ |   |NO❗️ |
| └ | getNumberOfRounds | External ❗️ |   |NO❗️ |
| └ | isSupported | External ❗️ |   |NO❗️ |
| └ | getTimesPerPeriod | External ❗️ |   |NO❗️ |
| └ | getNumberOfVotes | External ❗️ |   |NO❗️ |
| └ | getDisputeKitID | External ❗️ |   |NO❗️ |
| └ | getDisputeKitsLength | External ❗️ |   |NO❗️ |
| └ | _getCompatibleNextRoundSettings | Internal 🔒 |   | |
| └ | _extraDataToCourtIDMinJurorsDisputeKit | Internal 🔒 |   | |
||||||
| **PolicyRegistry** | Implementation | Initializable |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | initialize | External ❗️ | 🛑  | initializer |
| └ | changeOwner | External ❗️ | 🛑  | onlyOwner |
| └ | setPolicy | External ❗️ | 🛑  | onlyOwner |
||||||
| **SortitionModule** | Implementation | ISortitionModule, Initializable |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | initialize | External ❗️ | 🛑  | initializer |
| └ | changeOwner | External ❗️ | 🛑  | onlyOwner |
| └ | changeMinStakingTime | External ❗️ | 🛑  | onlyOwner |
| └ | changeMaxDrawingTime | External ❗️ | 🛑  | onlyOwner |
| └ | changeRandomNumberGenerator | External ❗️ | 🛑  | onlyOwner |
| └ | passPhase | External ❗️ | 🛑  |NO❗️ |
| └ | createTree | External ❗️ | 🛑  | onlyCore |
| └ | executeDelayedStakes | External ❗️ | 🛑  |NO❗️ |
| └ | registerDisputeForDrawing | External ❗️ | 🛑  | onlyCore |
| └ | completeDisputeDrawing | External ❗️ | 🛑  | onlyCore |
| └ | setStake | External ❗️ | 🛑  | onlyCore |
| └ | lockStake | External ❗️ | 🛑  | onlyCore |
| └ | unlockStake | External ❗️ | 🛑  | onlyCore |
| └ | forcedUnstakeAllCourts | External ❗️ | 🛑  | onlyCore |
| └ | draw | Public ❗️ |   |NO❗️ |
| └ | getJurorBalance | External ❗️ |   |NO❗️ |
| └ | stakeOf | Public ❗️ |   |NO❗️ |
| └ | getJurorCourtIDs | Public ❗️ |   |NO❗️ |
| └ | isJurorStaked | External ❗️ |   |NO❗️ |
| └ | _setStake | Internal 🔒 | 🛑  | |
||||||
| **DisputeResolver** | Implementation | IArbitrableV2 |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | createDisputeForTemplate | External ❗️ |  💵 |NO❗️ |
| └ | rule | External ❗️ | 🛑  |NO❗️ |
| └ | _createDispute | Internal 🔒 | 🛑  | |
||||||
| **DisputeTemplateRegistry** | Implementation | IDisputeTemplateRegistry |||
| └ | setDisputeTemplate | External ❗️ | 🛑  |NO❗️ |
||||||
| **CentralizedKit** | Implementation | IDisputeKit, Initializable |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | initialize | External ❗️ | 🛑  | initializer |
| └ | createDispute | Public ❗️ | 🛑  | onlyCore |
| └ | giveRuling | External ❗️ | 🛑  |NO❗️ |
| └ | withdrawFees | External ❗️ | 🛑  |NO❗️ |
| └ | <Receive Ether> | External ❗️ |  💵 |NO❗️ |
| └ | draw | Public ❗️ | 🛑  | onlyCore |
| └ | currentRuling | External ❗️ |   |NO❗️ |
| └ | getRewards | External ❗️ |   |NO❗️ |
| └ | getPenalty | External ❗️ |   |NO❗️ |
| └ | areCommitsAllCast | External ❗️ |   |NO❗️ |
| └ | areVotesAllCast | External ❗️ |   |NO❗️ |
| └ | isAppealTimeFinished | External ❗️ |   |NO❗️ |
| └ | getNextRoundSettings | External ❗️ |   |NO❗️ |
| └ | isVoteActive | External ❗️ |   |NO❗️ |
| └ | getRoundInfo | External ❗️ |   |NO❗️ |
| └ | getVoteInfo | External ❗️ |   |NO❗️ |
||||||
| **DisputeKitClassic** | Implementation | IDisputeKit, Initializable |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | initialize | External ❗️ | 🛑  | initializer |
| └ | createDispute | Public ❗️ | 🛑  | onlyCore |
| └ | draw | Public ❗️ | 🛑  | onlyCore isActive |
| └ | castCommit | External ❗️ | 🛑  | isActive |
| └ | castVote | External ❗️ | 🛑  | isActive |
| └ | fundAppeal | External ❗️ |  💵 | isActive |
| └ | withdrawFeesAndRewards | External ❗️ | 🛑  |NO❗️ |
| └ | getFundedChoices | Public ❗️ |   |NO❗️ |
| └ | currentRuling | Public ❗️ |   |NO❗️ |
| └ | getRewards | External ❗️ |   |NO❗️ |
| └ | getPenalty | External ❗️ |   |NO❗️ |
| └ | areCommitsAllCast | External ❗️ |   |NO❗️ |
| └ | areVotesAllCast | External ❗️ |   |NO❗️ |
| └ | isAppealTimeFinished | External ❗️ |   |NO❗️ |
| └ | getNextRoundSettings | Public ❗️ |   |NO❗️ |
| └ | isVoteActive | External ❗️ |   |NO❗️ |
| └ | getRoundInfo | External ❗️ |   |NO❗️ |
| └ | getNumberOfRounds | External ❗️ |   |NO❗️ |
| └ | getLocalDisputeRoundID | External ❗️ |   |NO❗️ |
| └ | getVoteInfo | External ❗️ |   |NO❗️ |
||||||
| **IBalanceHolder** | Interface |  |||
| └ | balanceOf | External ❗️ |   |NO❗️ |
||||||
| **IBalanceHolderERC1155** | Interface |  |||
| └ | balanceOf | External ❗️ |   |NO❗️ |
||||||
| **DisputeKitGated** | Implementation | IDisputeKit, Initializable, ICourtEligibility |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | initialize | External ❗️ | 🛑  | initializer |
| └ | createDispute | Public ❗️ | 🛑  | onlyCore |
| └ | draw | Public ❗️ | 🛑  | onlyCore isActive |
| └ | castCommit | External ❗️ | 🛑  | isActive |
| └ | castVote | External ❗️ | 🛑  | isActive |
| └ | fundAppeal | External ❗️ |  💵 | isActive |
| └ | withdrawFeesAndRewards | External ❗️ | 🛑  |NO❗️ |
| └ | isEligible | External ❗️ |   |NO❗️ |
| └ | getFundedChoices | Public ❗️ |   |NO❗️ |
| └ | currentRuling | Public ❗️ |   |NO❗️ |
| └ | getRewards | External ❗️ |   |NO❗️ |
| └ | getPenalty | External ❗️ |   |NO❗️ |
| └ | areCommitsAllCast | External ❗️ |   |NO❗️ |
| └ | areVotesAllCast | External ❗️ |   |NO❗️ |
| └ | isAppealTimeFinished | External ❗️ |   |NO❗️ |
| └ | getNextRoundSettings | Public ❗️ |   |NO❗️ |
| └ | isVoteActive | External ❗️ |   |NO❗️ |
| └ | getRoundInfo | External ❗️ |   |NO❗️ |
| └ | getNumberOfRounds | External ❗️ |   |NO❗️ |
| └ | getLocalDisputeRoundID | External ❗️ |   |NO❗️ |
| └ | getVoteInfo | External ❗️ |   |NO❗️ |
| └ | _isTokenHolder | Internal 🔒 |   | |
||||||
| **IBalanceHolder** | Interface |  |||
| └ | balanceOf | External ❗️ |   |NO❗️ |
||||||
| **DisputeKitGatedArgentinaConsumerProtection** | Implementation | IDisputeKit, Initializable, ICourtEligibility |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | initialize | External ❗️ | 🛑  | initializer |
| └ | createDispute | Public ❗️ | 🛑  | onlyCore |
| └ | draw | Public ❗️ | 🛑  | onlyCore isActive |
| └ | castCommit | External ❗️ | 🛑  | isActive |
| └ | castVote | External ❗️ | 🛑  | isActive |
| └ | fundAppeal | External ❗️ |  💵 | isActive |
| └ | withdrawFeesAndRewards | External ❗️ | 🛑  |NO❗️ |
| └ | isEligible | External ❗️ |   |NO❗️ |
| └ | getFundedChoices | Public ❗️ |   |NO❗️ |
| └ | currentRuling | Public ❗️ |   |NO❗️ |
| └ | getRewards | External ❗️ |   |NO❗️ |
| └ | getPenalty | External ❗️ |   |NO❗️ |
| └ | areCommitsAllCast | External ❗️ |   |NO❗️ |
| └ | areVotesAllCast | External ❗️ |   |NO❗️ |
| └ | isAppealTimeFinished | External ❗️ |   |NO❗️ |
| └ | getNextRoundSettings | Public ❗️ |   |NO❗️ |
| └ | isVoteActive | External ❗️ |   |NO❗️ |
| └ | getRoundInfo | External ❗️ |   |NO❗️ |
| └ | getNumberOfRounds | External ❗️ |   |NO❗️ |
| └ | getLocalDisputeRoundID | External ❗️ |   |NO❗️ |
| └ | getVoteInfo | External ❗️ |   |NO❗️ |
||||||
| **IBalanceHolder** | Interface |  |||
| └ | balanceOf | External ❗️ |   |NO❗️ |
||||||
| **IBalanceHolderERC1155** | Interface |  |||
| └ | balanceOf | External ❗️ |   |NO❗️ |
||||||
| **DisputeKitGatedShutter** | Implementation | IDisputeKit, Initializable, ICourtEligibility |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | initialize | External ❗️ | 🛑  | initializer |
| └ | createDispute | Public ❗️ | 🛑  | onlyCore |
| └ | draw | Public ❗️ | 🛑  | onlyCore isActive |
| └ | castCommitShutter | Public ❗️ | 🛑  | isActive |
| └ | castVoteShutter | External ❗️ | 🛑  | isActive |
| └ | fundAppeal | External ❗️ |  💵 | isActive |
| └ | withdrawFeesAndRewards | External ❗️ | 🛑  |NO❗️ |
| └ | isEligible | External ❗️ |   |NO❗️ |
| └ | getFundedChoices | Public ❗️ |   |NO❗️ |
| └ | currentRuling | Public ❗️ |   |NO❗️ |
| └ | getRewards | External ❗️ |   |NO❗️ |
| └ | getPenalty | External ❗️ |   |NO❗️ |
| └ | areCommitsAllCast | External ❗️ |   |NO❗️ |
| └ | areVotesAllCast | External ❗️ |   |NO❗️ |
| └ | isAppealTimeFinished | External ❗️ |   |NO❗️ |
| └ | getNextRoundSettings | Public ❗️ |   |NO❗️ |
| └ | isVoteActive | External ❗️ |   |NO❗️ |
| └ | getRoundInfo | External ❗️ |   |NO❗️ |
| └ | getNumberOfRounds | External ❗️ |   |NO❗️ |
| └ | getLocalDisputeRoundID | External ❗️ |   |NO❗️ |
| └ | getVoteInfo | External ❗️ |   |NO❗️ |
| └ | _isTokenHolder | Internal 🔒 |   | |
||||||
| **DisputeKitShutter** | Implementation | IDisputeKit, Initializable |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | initialize | External ❗️ | 🛑  | initializer |
| └ | createDispute | Public ❗️ | 🛑  | onlyCore |
| └ | draw | Public ❗️ | 🛑  | onlyCore isActive |
| └ | castCommitShutter | Public ❗️ | 🛑  | isActive |
| └ | castVoteShutter | External ❗️ | 🛑  | isActive |
| └ | fundAppeal | External ❗️ |  💵 | isActive |
| └ | withdrawFeesAndRewards | External ❗️ | 🛑  |NO❗️ |
| └ | getFundedChoices | Public ❗️ |   |NO❗️ |
| └ | currentRuling | Public ❗️ |   |NO❗️ |
| └ | getRewards | External ❗️ |   |NO❗️ |
| └ | getPenalty | External ❗️ |   |NO❗️ |
| └ | areCommitsAllCast | External ❗️ |   |NO❗️ |
| └ | areVotesAllCast | External ❗️ |   |NO❗️ |
| └ | isAppealTimeFinished | External ❗️ |   |NO❗️ |
| └ | getNextRoundSettings | Public ❗️ |   |NO❗️ |
| └ | isVoteActive | External ❗️ |   |NO❗️ |
| └ | getRoundInfo | External ❗️ |   |NO❗️ |
| └ | getNumberOfRounds | External ❗️ |   |NO❗️ |
| └ | getLocalDisputeRoundID | External ❗️ |   |NO❗️ |
| └ | getVoteInfo | External ❗️ |   |NO❗️ |
||||||
| **IProofOfHumanity** | Interface |  |||
| └ | isHuman | External ❗️ |   |NO❗️ |
||||||
| **DisputeKitSybilResistant** | Implementation | IDisputeKit, Initializable, ICourtEligibility |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | initialize | External ❗️ | 🛑  | initializer |
| └ | changeOwner | External ❗️ | 🛑  | onlyOwner |
| └ | changeCcPoh | External ❗️ | 🛑  | onlyOwner |
| └ | createDispute | Public ❗️ | 🛑  | onlyCore |
| └ | draw | Public ❗️ | 🛑  | onlyCore isActive |
| └ | castCommit | External ❗️ | 🛑  | isActive |
| └ | castVote | External ❗️ | 🛑  | isActive |
| └ | fundAppeal | External ❗️ |  💵 | isActive |
| └ | withdrawFeesAndRewards | External ❗️ | 🛑  |NO❗️ |
| └ | isEligible | External ❗️ |   |NO❗️ |
| └ | getFundedChoices | Public ❗️ |   |NO❗️ |
| └ | currentRuling | Public ❗️ |   |NO❗️ |
| └ | getRewards | External ❗️ |   |NO❗️ |
| └ | getPenalty | External ❗️ |   |NO❗️ |
| └ | areCommitsAllCast | External ❗️ |   |NO❗️ |
| └ | areVotesAllCast | External ❗️ |   |NO❗️ |
| └ | isAppealTimeFinished | External ❗️ |   |NO❗️ |
| └ | getNextRoundSettings | Public ❗️ |   |NO❗️ |
| └ | isVoteActive | External ❗️ |   |NO❗️ |
| └ | getRoundInfo | External ❗️ |   |NO❗️ |
| └ | getNumberOfRounds | External ❗️ |   |NO❗️ |
| └ | getLocalDisputeRoundID | External ❗️ |   |NO❗️ |
| └ | getVoteInfo | External ❗️ |   |NO❗️ |
||||||
| **EvidenceModule** | Implementation | IEvidence |||
| └ | submitEvidence | External ❗️ | 🛑  |NO❗️ |
||||||
| **IArbitrableV2** | Interface |  |||
| └ | rule | External ❗️ | 🛑  |NO❗️ |
||||||
| **IArbitratorV2** | Interface |  |||
| └ | createDispute | External ❗️ |  💵 |NO❗️ |
| └ | arbitrationCost | External ❗️ |   |NO❗️ |
| └ | currentRuling | External ❗️ |   |NO❗️ |
||||||
| **ICourtEligibility** | Interface |  |||
| └ | isEligible | External ❗️ |   |NO❗️ |
||||||
| **IDisputeKit** | Interface |  |||
| └ | createDispute | External ❗️ | 🛑  |NO❗️ |
| └ | draw | External ❗️ | 🛑  |NO❗️ |
| └ | currentRuling | External ❗️ |   |NO❗️ |
| └ | getRewards | External ❗️ |   |NO❗️ |
| └ | getPenalty | External ❗️ |   |NO❗️ |
| └ | areCommitsAllCast | External ❗️ |   |NO❗️ |
| └ | areVotesAllCast | External ❗️ |   |NO❗️ |
| └ | isAppealTimeFinished | External ❗️ |   |NO❗️ |
| └ | getNextRoundSettings | External ❗️ |   |NO❗️ |
| └ | isVoteActive | External ❗️ |   |NO❗️ |
| └ | getRoundInfo | External ❗️ |   |NO❗️ |
| └ | getVoteInfo | External ❗️ |   |NO❗️ |
||||||
| **IDisputeTemplateRegistry** | Interface |  |||
| └ | setDisputeTemplate | External ❗️ | 🛑  |NO❗️ |
||||||
| **IEvidence** | Interface |  |||
||||||
| **ISortitionModule** | Interface |  |||
| └ | passPhase | External ❗️ | 🛑  |NO❗️ |
| └ | executeDelayedStakes | External ❗️ | 🛑  |NO❗️ |
| └ | createTree | External ❗️ | 🛑  |NO❗️ |
| └ | setStake | External ❗️ | 🛑  |NO❗️ |
| └ | forcedUnstakeAllCourts | External ❗️ | 🛑  |NO❗️ |
| └ | lockStake | External ❗️ | 🛑  |NO❗️ |
| └ | unlockStake | External ❗️ | 🛑  |NO❗️ |
| └ | registerDisputeForDrawing | External ❗️ | 🛑  |NO❗️ |
| └ | completeDisputeDrawing | External ❗️ | 🛑  |NO❗️ |
| └ | draw | External ❗️ |   |NO❗️ |
| └ | getJurorBalance | External ❗️ |   |NO❗️ |
| └ | stakeOf | External ❗️ |   |NO❗️ |
| └ | getJurorCourtIDs | External ❗️ |   |NO❗️ |
| └ | isJurorStaked | External ❗️ |   |NO❗️ |
||||||
| **LeaderboardOffset** | Implementation |  |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | updateOwner | External ❗️ | 🛑  | onlyOwner |
| └ | addOffset | External ❗️ | 🛑  | onlyOwner |
||||||
| **SortitionTrees** | Library |  |||
| └ | createTree | Internal 🔒 | 🛑  | |
| └ | draw | Internal 🔒 |   | |
| └ | set | Internal 🔒 | 🛑  | |
| └ | updateParents | Private 🔐 | 🛑  | |
| └ | stakeOf | Internal 🔒 |   | |
| └ | toStakePathID | Internal 🔒 |   | |
| └ | toAccountAndCourtID | Internal 🔒 |   | |
||||||
| **SafeERC20** | Library |  |||
| └ | increaseAllowance | Internal 🔒 | 🛑  | |
| └ | safeTransfer | Internal 🔒 | 🛑  | |
| └ | safeTransferFrom | Internal 🔒 | 🛑  | |
||||||
| **WethLike** | Interface |  |||
| └ | deposit | External ❗️ |  💵 |NO❗️ |
| └ | transfer | External ❗️ | 🛑  |NO❗️ |
||||||
| **SafeSend** | Library |  |||
| └ | safeSend | Internal 🔒 | 🛑  | |
||||||
| **RNGWithFallback** | Implementation | IRNG |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | changeOwner | External ❗️ | 🛑  | onlyOwner |
| └ | changeConsumer | External ❗️ | 🛑  | onlyOwner |
| └ | changeFallbackTimeout | External ❗️ | 🛑  | onlyOwner |
| └ | requestRandomness | External ❗️ | 🛑  | onlyConsumer |
| └ | receiveRandomness | External ❗️ | 🛑  | onlyConsumer |
||||||
| **ChainlinkRNG** | Implementation | IRNG, IVRFMigratableConsumerV2Plus |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | changeOwner | External ❗️ | 🛑  | onlyOwner |
| └ | changeConsumer | External ❗️ | 🛑  | onlyOwner |
| └ | changeKeyHash | External ❗️ | 🛑  | onlyOwner |
| └ | changeSubscriptionId | External ❗️ | 🛑  | onlyOwner |
| └ | changeRequestConfirmations | External ❗️ | 🛑  | onlyOwner |
| └ | changeCallbackGasLimit | External ❗️ | 🛑  | onlyOwner |
| └ | setCoordinator | External ❗️ | 🛑  | onlyOwnerOrCoordinator |
| └ | requestRandomness | External ❗️ | 🛑  | onlyConsumer |
| └ | rawFulfillRandomWords | External ❗️ | 🛑  |NO❗️ |
| └ | receiveRandomness | External ❗️ |   |NO❗️ |
||||||
| **IRNG** | Interface |  |||
| └ | requestRandomness | External ❗️ | 🛑  |NO❗️ |
| └ | receiveRandomness | External ❗️ | 🛑  |NO❗️ |
||||||
| **SBT** | Implementation |  |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | changeOwner | External ❗️ | 🛑  |NO❗️ |
| └ | mint | External ❗️ | 🛑  |NO❗️ |
| └ | burn | External ❗️ | 🛑  |NO❗️ |
| └ | transferFrom | External ❗️ |   |NO❗️ |
| └ | safeTransferFrom | External ❗️ |   |NO❗️ |
| └ | safeTransferFrom | External ❗️ |   |NO❗️ |


 Legend

|  Symbol  |  Meaning  |
|:--------:|-----------|
|    🛑    | Function can modify state |
|    💵    | Function is payable |
 

</div>
____
<sub>
Thinking about smart contract security? We can provide training, ongoing advice, and smart contract auditing. [Contact us](https://consensys.io/diligence/contact/).
</sub>


