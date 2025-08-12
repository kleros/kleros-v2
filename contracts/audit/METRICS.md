[<img width="200" alt="get in touch with Consensys Diligence" src="https://user-images.githubusercontent.com/2865694/56826101-91dcf380-685b-11e9-937c-af49c2510aa0.png">](https://consensys.io/diligence)<br/>
<sup>
[[ 🌐 ](https://consensys.io/diligence) [ 📩 ](mailto:diligence@consensys.net) [ 🔥 ](https://consensys.io/diligence/tools/)]
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

Source Units Analyzed: **`31`**<br>
Source Units in Scope: **`31`** (**100%**)

| Type     | File                                                      | Logic Contracts | Interfaces | Lines    | nLines   | nSLOC    | Comment Lines | Complex. Score | Capabilities                                                                                                                                                                                                                                                                                     |
| -------- | --------------------------------------------------------- | --------------- | ---------- | -------- | -------- | -------- | ------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 📝       | src/arbitration/KlerosCore.sol                            | 1               | \*\*\*\*   | 75       | 63       | 28       | 26            | 13             | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 🎨       | src/arbitration/KlerosCoreBase.sol                        | 1               | \*\*\*\*   | 1211     | 1162     | 809      | 286           | 449            | **<abbr title='Uses Assembly'>🖥</abbr><abbr title='Payable Functions'>💰</abbr>**                                                                                                                                                                                                               |
| 📝       | src/arbitration/KlerosCoreNeo.sol                         | 1               | \*\*\*\*   | 142      | 124      | 55       | 51            | 36             | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 📝       | src/arbitration/PolicyRegistry.sol                        | 1               | \*\*\*\*   | 88       | 88       | 30       | 41            | 24             | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 📝       | src/arbitration/SortitionModule.sol                       | 1               | \*\*\*\*   | 50       | 44       | 15       | 20            | 13             | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 🎨       | src/arbitration/SortitionModuleBase.sol                   | 1               | \*\*\*\*   | 689      | 645      | 393      | 205           | 300            | **<abbr title='Uses Assembly'>🖥</abbr><abbr title='Uses Hash-Functions'>🧮</abbr>**                                                                                                                                                                                                             |
| 📝       | src/arbitration/SortitionModuleNeo.sol                    | 1               | \*\*\*\*   | 103      | 91       | 48       | 28            | 31             | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 📝       | src/arbitration/arbitrables/DisputeResolver.sol           | 1               | \*\*\*\*   | 149      | 134      | 72       | 50            | 43             | **<abbr title='Payable Functions'>💰</abbr>**                                                                                                                                                                                                                                                    |
| 📝       | src/arbitration/DisputeTemplateRegistry.sol               | 1               | \*\*\*\*   | 83       | 79       | 30       | 33            | 25             | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 📝       | src/arbitration/dispute-kits/DisputeKitClassic.sol        | 1               | \*\*\*\*   | 46       | 46       | 16       | 21            | 13             | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 🎨       | src/arbitration/dispute-kits/DisputeKitClassicBase.sol    | 1               | \*\*\*\*   | 713      | 632      | 365      | 225           | 192            | **<abbr title='Payable Functions'>💰</abbr><abbr title='Uses Hash-Functions'>🧮</abbr>**                                                                                                                                                                                                         |
| 📝🔍     | src/arbitration/dispute-kits/DisputeKitGated.sol          | 1               | 2          | 117      | 99       | 39       | 51            | 57             | **<abbr title='Uses Assembly'>🖥</abbr><abbr title='doppelganger(IBalanceHolderERC1155)'>🔆</abbr>**                                                                                                                                                                                             |
| 📝🔍     | src/arbitration/dispute-kits/DisputeKitGatedShutter.sol   | 1               | 2          | 194      | 159      | 59       | 84            | 69             | **<abbr title='Uses Assembly'>🖥</abbr><abbr title='Uses Hash-Functions'>🧮</abbr><abbr title='doppelganger(IBalanceHolderERC1155)'>🔆</abbr>**                                                                                                                                                  |
| 📝       | src/arbitration/dispute-kits/DisputeKitShutter.sol        | 1               | \*\*\*\*   | 123      | 107      | 36       | 54            | 27             | **<abbr title='Uses Hash-Functions'>🧮</abbr>**                                                                                                                                                                                                                                                  |
| 📝🔍     | src/arbitration/dispute-kits/DisputeKitSybilResistant.sol | 1               | 1          | 76       | 58       | 20       | 33            | 16             | **<abbr title='doppelganger(IProofOfHumanity)'>🔆</abbr>**                                                                                                                                                                                                                                       |
| 📝       | src/arbitration/evidence/EvidenceModule.sol               | 1               | \*\*\*\*   | 70       | 70       | 26       | 30            | 21             | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 🔍       | src/arbitration/interfaces/IArbitrableV2.sol              | \*\*\*\*        | 1          | 40       | 39       | 12       | 22            | 3              | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 🔍       | src/arbitration/interfaces/IArbitratorV2.sol              | \*\*\*\*        | 1          | 83       | 44       | 9        | 50            | 14             | **<abbr title='Payable Functions'>💰</abbr>**                                                                                                                                                                                                                                                    |
| 🔍       | src/arbitration/interfaces/IDisputeKit.sol                | \*\*\*\*        | 1          | 128      | 39       | 11       | 60            | 23             | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 🔍       | src/arbitration/interfaces/IDisputeTemplateRegistry.sol   | \*\*\*\*        | 1          | 25       | 20       | 9        | 8             | 3              | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 🔍       | src/arbitration/interfaces/IEvidence.sol                  | \*\*\*\*        | 1          | 12       | 12       | 4        | 6             | 1              | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 🔍       | src/arbitration/interfaces/ISortitionModule.sol           | \*\*\*\*        | 1          | 63       | 16       | 10       | 4             | 33             | \*\*\*\*                                                                                                                                                                                                                                                                                         |
|          | src/libraries/Constants.sol                               | \*\*\*\*        | \*\*\*\*   | 39       | 39       | 26       | 13            | 2              | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 📚       | src/libraries/SafeERC20.sol                               | 1               | \*\*\*\*   | 47       | 47       | 18       | 24            | 12             | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 📚🔍     | src/libraries/SafeSend.sol                                | 1               | 1          | 24       | 19       | 9        | 7             | 15             | **<abbr title='Payable Functions'>💰</abbr><abbr title='Initiates ETH Value Transfer'>📤</abbr>**                                                                                                                                                                                                |
| 📝       | src/rng/RNGWithFallback.sol                               | 1               | \*\*\*\*   | 103      | 103      | 48       | 41            | 35             | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 📝       | src/rng/ChainlinkRNG.sol                                  | 1               | \*\*\*\*   | 173      | 173      | 85       | 70            | 50             | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 🔍       | src/rng/IRNG.sol                                          | \*\*\*\*        | 1          | 13       | 8        | 3        | 5             | 5              | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 🎨       | src/proxy/UUPSProxiable.sol                               | 1               | \*\*\*\*   | 140      | 122      | 44       | 71            | 46             | **<abbr title='Uses Assembly'>🖥</abbr><abbr title='Payable Functions'>💰</abbr><abbr title='DelegateCall'>👥</abbr><abbr title='TryCatch Blocks'>♻️</abbr>**                                                                                                                                    |
| 📝       | src/proxy/UUPSProxy.sol                                   | 1               | \*\*\*\*   | 90       | 90       | 38       | 37            | 65             | **<abbr title='Uses Assembly'>🖥</abbr><abbr title='Payable Functions'>💰</abbr><abbr title='DelegateCall'>👥</abbr>**                                                                                                                                                                           |
| 🎨       | src/proxy/Initializable.sol                               | 1               | \*\*\*\*   | 215      | 215      | 70       | 128           | 31             | **<abbr title='Uses Assembly'>🖥</abbr>**                                                                                                                                                                                                                                                        |
| 📝📚🔍🎨 | **Totals**                                                | **23**          | **13**     | **5124** | **4587** | **2437** | **1784**      | **1667**       | **<abbr title='Uses Assembly'>🖥</abbr><abbr title='Payable Functions'>💰</abbr><abbr title='Initiates ETH Value Transfer'>📤</abbr><abbr title='DelegateCall'>👥</abbr><abbr title='Uses Hash-Functions'>🧮</abbr><abbr title='doppelganger'>🔆</abbr><abbr title='TryCatch Blocks'>♻️</abbr>** |

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

Total: 16

- 📝 `KlerosCore`
- 📝 `KlerosCoreNeo`
- 📝 `PolicyRegistry`
- 📝 `SortitionModule`
- 📝 `SortitionModuleNeo`
- <a onclick="toggleVisibility('deployables', this)">[➕]</a>
<div id="deployables" style="display:none">
<ul>
<li> 📝 <code>DisputeResolver</code></li>
<li> 📝 <code>DisputeTemplateRegistry</code></li>
<li> 📝 <code>DisputeKitClassic</code></li>
<li> 📝 <code>DisputeKitGated</code></li>
<li> 📝 <code>DisputeKitGatedShutter</code></li>
<li> 📝 <code>DisputeKitShutter</code></li>
<li> 📝 <code>DisputeKitSybilResistant</code></li>
<li> 📝 <code>EvidenceModule</code></li>
<li> 📝 <code>RNGWithFallback</code></li>
<li> 📝 <code>ChainlinkRNG</code></li>
<li> 📝 <code>UUPSProxy</code></li>
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

Doppelganger Contracts: **`3`**

<a onclick="toggleVisibility('doppelganger-contracts', this)">[➕]</a>

<div id="doppelganger-contracts" style="display:none">
| File   | Contract | Doppelganger |
| ------ | -------- | ------------ |
| src/arbitration/dispute-kits/DisputeKitGated.sol | IBalanceHolderERC1155 | (fuzzy) [0](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v2.5.0/contracts/introspection/IERC1820Implementer.sol), [1](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.2.0/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [2](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.2.2-solc-0.7/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [3](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.3.0/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [4](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.3.0-solc-0.7/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [5](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.4.0/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [6](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.4.0-solc-0.7/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [7](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.0.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [8](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.0.0-beta.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [9](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.0.0-rc.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [10](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.1.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [11](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.1.0-rc.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [12](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.2.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [13](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0/contracts/introspection/IERC1820Implementer.sol), [14](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.0/contracts/drafts/IERC1820Implementer.sol), [15](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.1/contracts/drafts/IERC1820Implementer.sol), [16](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.2/contracts/introspection/IERC1820Implementer.sol), [17](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.3/contracts/introspection/IERC1820Implementer.sol), [18](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0/contracts/introspection/IERC1820Implementer.sol), [19](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0-beta.0/contracts/introspection/IERC1820Implementer.sol), [20](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0-beta.1/contracts/introspection/IERC1820Implementer.sol), [21](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0-beta.2/contracts/introspection/IERC1820Implementer.sol), [22](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.0/contracts/introspection/IERC1820Implementer.sol), [23](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.0-rc.0/contracts/introspection/IERC1820Implementer.sol), [24](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.1/contracts/introspection/IERC1820Implementer.sol), [25](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/introspection/IERC1820Implementer.sol), [26](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0-beta.0/contracts/introspection/IERC1820Implementer.sol), [27](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0-rc.0/contracts/introspection/IERC1820Implementer.sol), [28](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0-rc.1/contracts/introspection/IERC1820Implementer.sol), [29](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.1/contracts/introspection/IERC1820Implementer.sol), [30](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.2/contracts/introspection/IERC1820Implementer.sol), [31](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/introspection/IERC1820Implementer.sol), [32](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0-rc.0/contracts/introspection/IERC1820Implementer.sol), [33](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.0/contracts/introspection/IERC1820Implementer.sol), [34](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.0-rc.0/contracts/introspection/IERC1820Implementer.sol), [35](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.1-solc-0.7/contracts/introspection/IERC1820Implementer.sol), [36](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.2-solc-0.7/contracts/introspection/IERC1820Implementer.sol) |
| src/arbitration/dispute-kits/DisputeKitGatedShutter.sol | IBalanceHolderERC1155 | (fuzzy) [0](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v2.5.0/contracts/introspection/IERC1820Implementer.sol), [1](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.2.0/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [2](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.2.2-solc-0.7/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [3](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.3.0/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [4](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.3.0-solc-0.7/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [5](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.4.0/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [6](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.4.0-solc-0.7/contracts/introspection/IERC1820ImplementerUpgradeable.sol), [7](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.0.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [8](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.0.0-beta.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [9](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.0.0-rc.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [10](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.1.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [11](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.1.0-rc.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [12](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.2.0/contracts/utils/introspection/IERC1820ImplementerUpgradeable.sol), [13](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0/contracts/introspection/IERC1820Implementer.sol), [14](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.0/contracts/drafts/IERC1820Implementer.sol), [15](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.1/contracts/drafts/IERC1820Implementer.sol), [16](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.2/contracts/introspection/IERC1820Implementer.sol), [17](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.3/contracts/introspection/IERC1820Implementer.sol), [18](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0/contracts/introspection/IERC1820Implementer.sol), [19](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0-beta.0/contracts/introspection/IERC1820Implementer.sol), [20](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0-beta.1/contracts/introspection/IERC1820Implementer.sol), [21](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0-beta.2/contracts/introspection/IERC1820Implementer.sol), [22](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.0/contracts/introspection/IERC1820Implementer.sol), [23](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.0-rc.0/contracts/introspection/IERC1820Implementer.sol), [24](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.1/contracts/introspection/IERC1820Implementer.sol), [25](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/introspection/IERC1820Implementer.sol), [26](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0-beta.0/contracts/introspection/IERC1820Implementer.sol), [27](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0-rc.0/contracts/introspection/IERC1820Implementer.sol), [28](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0-rc.1/contracts/introspection/IERC1820Implementer.sol), [29](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.1/contracts/introspection/IERC1820Implementer.sol), [30](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.2/contracts/introspection/IERC1820Implementer.sol), [31](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/introspection/IERC1820Implementer.sol), [32](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0-rc.0/contracts/introspection/IERC1820Implementer.sol), [33](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.0/contracts/introspection/IERC1820Implementer.sol), [34](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.0-rc.0/contracts/introspection/IERC1820Implementer.sol), [35](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.1-solc-0.7/contracts/introspection/IERC1820Implementer.sol), [36](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.2-solc-0.7/contracts/introspection/IERC1820Implementer.sol) |
| src/arbitration/dispute-kits/DisputeKitSybilResistant.sol | IProofOfHumanity | (fuzzy) [0](https://github.com/smartcontractkit/chainlink/blob/explorer-v0.8.5/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [1](https://github.com/smartcontractkit/chainlink/blob/upgrade/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [2](https://github.com/smartcontractkit/chainlink/blob/v.0.8.12/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [3](https://github.com/smartcontractkit/chainlink/blob/v0.8.12/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [4](https://github.com/smartcontractkit/chainlink/blob/v0.8.13/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [5](https://github.com/smartcontractkit/chainlink/blob/v0.8.14/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [6](https://github.com/smartcontractkit/chainlink/blob/v0.8.15/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [7](https://github.com/smartcontractkit/chainlink/blob/v0.8.16/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [8](https://github.com/smartcontractkit/chainlink/blob/v0.8.17/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [9](https://github.com/smartcontractkit/chainlink/blob/v0.8.18/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [10](https://github.com/smartcontractkit/chainlink/blob/v0.9.0/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [11](https://github.com/smartcontractkit/chainlink/blob/v0.9.2/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [12](https://github.com/smartcontractkit/chainlink/blob/v0.9.3/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [13](https://github.com/smartcontractkit/chainlink/blob/v0.9.4/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [14](https://github.com/smartcontractkit/chainlink/blob/v0.9.5/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [15](https://github.com/smartcontractkit/chainlink/blob/v0.9.6/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [16](https://github.com/smartcontractkit/chainlink/blob/v0.9.7/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [17](https://github.com/smartcontractkit/chainlink/blob/v0.9.8/evm-contracts/src/v0.6/interfaces/BlockHashStoreInterface.sol), [18](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v2.0.0/contracts/introspection/IERC165.sol), [19](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v2.0.1/contracts/introspection/IERC165.sol), [20](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v2.0.2/contracts/introspection/IERC165.sol), [21](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v2.1.2/contracts/introspection/IERC165.sol), [22](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v2.1.3/contracts/introspection/IERC165.sol), [23](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v2.2.1/contracts/introspection/IERC165.sol), [24](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v2.2.2/contracts/introspection/IERC165.sol), [25](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v2.2.3/contracts/introspection/IERC165.sol), [26](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v2.5.0/contracts/introspection/IERC165.sol), [27](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.2.0/contracts/introspection/IERC165Upgradeable.sol), [28](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.2.2-solc-0.7/contracts/introspection/IERC165Upgradeable.sol), [29](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.3.0/contracts/introspection/IERC165Upgradeable.sol), [30](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.3.0-solc-0.7/contracts/introspection/IERC165Upgradeable.sol), [31](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.4.0/contracts/introspection/IERC165Upgradeable.sol), [32](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v3.4.0-solc-0.7/contracts/introspection/IERC165Upgradeable.sol), [33](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.0.0/contracts/utils/introspection/IERC165Upgradeable.sol), [34](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.0.0-beta.0/contracts/utils/introspection/IERC165Upgradeable.sol), [35](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.0.0-rc.0/contracts/utils/introspection/IERC165Upgradeable.sol), [36](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.1.0/contracts/utils/introspection/IERC165Upgradeable.sol), [37](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.1.0-rc.0/contracts/utils/introspection/IERC165Upgradeable.sol), [38](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v4.2.0/contracts/utils/introspection/IERC165Upgradeable.sol), [39](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.0.0/contracts/introspection/IERC165.sol), [40](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.0.0-rc.1/contracts/introspection/IERC165.sol), [41](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.0.0-rc.2/contracts/introspection/IERC165.sol), [42](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.0.0-rc.3/contracts/introspection/IERC165.sol), [43](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.0.0-rc.4/contracts/introspection/IERC165.sol), [44](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.0.1/contracts/introspection/IERC165.sol), [45](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.1.0-rc.1/contracts/introspection/IERC165.sol), [46](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.1.0-rc.2/contracts/introspection/IERC165.sol), [47](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.1.1/contracts/introspection/IERC165.sol), [48](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.1.2/contracts/introspection/IERC165.sol), [49](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.1.3/contracts/introspection/IERC165.sol), [50](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.2.0/contracts/introspection/IERC165.sol), [51](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.2.0-rc.1/contracts/introspection/IERC165.sol), [52](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0/contracts/introspection/IERC165.sol), [53](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.0/contracts/introspection/IERC165.sol), [54](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.1/contracts/introspection/IERC165.sol), [55](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.2/contracts/introspection/IERC165.sol), [56](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.3.0-rc.3/contracts/introspection/IERC165.sol), [57](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0/contracts/introspection/IERC165.sol), [58](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0-beta.0/contracts/introspection/IERC165.sol), [59](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0-beta.1/contracts/introspection/IERC165.sol), [60](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.4.0-beta.2/contracts/introspection/IERC165.sol), [61](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.0/contracts/introspection/IERC165.sol), [62](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.0-rc.0/contracts/introspection/IERC165.sol), [63](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.1/contracts/introspection/IERC165.sol), [64](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/introspection/IERC165.sol), [65](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0-beta.0/contracts/introspection/IERC165.sol), [66](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0-rc.0/contracts/introspection/IERC165.sol), [67](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0-rc.1/contracts/introspection/IERC165.sol), [68](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.1/contracts/introspection/IERC165.sol), [69](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.2/contracts/introspection/IERC165.sol), [70](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/introspection/IERC165.sol), [71](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0-rc.0/contracts/introspection/IERC165.sol), [72](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.0/contracts/introspection/IERC165.sol), [73](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.0-rc.0/contracts/introspection/IERC165.sol), [74](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.1-solc-0.7/contracts/introspection/IERC165.sol), [75](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.2.2-solc-0.7/contracts/introspection/IERC165.sol) |

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

- **Comment-to-Source Ratio:** On average there are`1.59` code lines per comment (lower=better).
- **ToDo's:** `2`

#### <span id=t-components>Components</span>

| 📝Contracts | 📚Libraries | 🔍Interfaces | 🎨Abstract |
| ----------- | ----------- | ------------ | ---------- |
| 16          | 2           | 13           | 5          |

#### <span id=t-exposed-functions>Exposed Functions</span>

This section lists functions that are explicitly declared public or payable. Please note that getter methods for public stateVars are not included.

| 🌐Public | 💰Payable |
| -------- | --------- |
| 192      | 10        |

| External | Internal | Private | Pure | View |
| -------- | -------- | ------- | ---- | ---- |
| 175      | 217      | 2       | 13   | 80   |

#### <span id=t-statevariables>StateVariables</span>

| Total | 🌐Public |
| ----- | -------- |
| 87    | 80       |

#### <span id=t-capabilities>Capabilities</span>

| Solidity Versions observed     | 🧪 Experimental Features | 💰 Can Receive Funds | 🖥 Uses Assembly           | 💣 Has Destroyable Contracts |
| ------------------------------ | ------------------------ | -------------------- | -------------------------- | ---------------------------- |
| `^0.8.24`<br/>`>=0.8.0 <0.9.0` |                          | `yes`                | `yes` <br/>(12 asm blocks) | \*\*\*\*                     |

| 📤 Transfers ETH | ⚡ Low-Level Calls | 👥 DelegateCall | 🧮 Uses Hash Functions | 🔖 ECRecover | 🌀 New/Create/Create2 |
| ---------------- | ------------------ | --------------- | ---------------------- | ------------ | --------------------- |
| `yes`            | \*\*\*\*           | `yes`           | `yes`                  | \*\*\*\*     | \*\*\*\*              |

| ♻️ TryCatch | Σ Unchecked |
| ----------- | ----------- |
| `yes`       | \*\*\*\*    |

#### <span id=t-package-imports>Dependencies / External Imports</span>

| Dependency / Import Path                                            | Count |
| ------------------------------------------------------------------- | ----- |
| @chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol     | 1     |
| @chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol | 1     |
| @openzeppelin/contracts/token/ERC20/IERC20.sol                      | 3     |
| @openzeppelin/contracts/token/ERC721/IERC721.sol                    | 1     |

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

| File Name                                                 | SHA-1 Hash                               |
| --------------------------------------------------------- | ---------------------------------------- |
| src/arbitration/KlerosCore.sol                            | 5362842ab3a88870e8b3b42cd7cf7a2058240483 |
| src/arbitration/KlerosCoreBase.sol                        | fe829c80ad434e185151a8b5d299a585f576c619 |
| src/arbitration/KlerosCoreNeo.sol                         | 0260ef7a9309d5c73c4c9b1a3f5c7653904f79c7 |
| src/arbitration/PolicyRegistry.sol                        | c36299120ac7318dd29e4ab86f50b0447d87af96 |
| src/arbitration/SortitionModule.sol                       | c1c1b2dd061590cd6c7eee41767e5c3fb898d506 |
| src/arbitration/SortitionModuleBase.sol                   | 7b1037fcdfffc58bf3522f70ed128cad4915e032 |
| src/arbitration/SortitionModuleNeo.sol                    | 8570ebeff10d723ce33b75e077dffb6fcf6e2f08 |
| src/arbitration/arbitrables/DisputeResolver.sol           | 7dad21f0219e0a1b698859205bbf31b07abfdc7c |
| src/arbitration/DisputeTemplateRegistry.sol               | c31e000957b979dc513d8b123253adb9edce50c7 |
| src/arbitration/dispute-kits/DisputeKitClassic.sol        | 32bcb287571a3c4a861659be31a1ee2dc6ea6784 |
| src/arbitration/dispute-kits/DisputeKitClassicBase.sol    | 7c0b04f3e73c0a10a29abfa78f78220e4e43f983 |
| src/arbitration/dispute-kits/DisputeKitGated.sol          | e5f7f2ecd65f5e279c7b55e9edbe6f4cfc5fd632 |
| src/arbitration/dispute-kits/DisputeKitGatedShutter.sol   | abb7f1ac20fa60db95d97fea6e9396b108d40924 |
| src/arbitration/dispute-kits/DisputeKitShutter.sol        | 3720b60db303b866eacbb3dee529a638eaf6782e |
| src/arbitration/dispute-kits/DisputeKitSybilResistant.sol | 69158bf07e78b3cb9892a5fd6cfc768181989a7f |
| src/arbitration/evidence/EvidenceModule.sol               | 45845f3d5ad5548a30698105061bc0e64fd7718f |
| src/arbitration/interfaces/IArbitrableV2.sol              | ce54b7140a6109b2d919cea38ff94ac2ad775398 |
| src/arbitration/interfaces/IArbitratorV2.sol              | 4e0baa0ff6155737540105f9fdb5b54ba2905d2c |
| src/arbitration/interfaces/IDisputeKit.sol                | f21b52ed28a905b3073adaf68961938200cfd644 |
| src/arbitration/interfaces/IDisputeTemplateRegistry.sol   | 8d0351ebeee1ebd8603af9cf50c2ab62f6e8fecb |
| src/arbitration/interfaces/IEvidence.sol                  | 12ee130f67f5d38afbcc810129b030cf7f58f058 |
| src/arbitration/interfaces/ISortitionModule.sol           | 2c6d74752298263f7c649e3feecfb9a03c87a16a |
| src/libraries/Constants.sol                               | 4d1d44dbeeda03f47a646e9552873d26acf4254d |
| src/libraries/SafeERC20.sol                               | 68e49603280eab2b68eabc554dc310ff3313a64c |
| src/libraries/SafeSend.sol                                | 9d282cf6456950471debec28103fcb99638fa83d |
| src/rng/RNGWithFallback.sol                               | 9729dbce3e1dd5981073df38ac31fe356aae0027 |
| src/rng/ChainlinkRNG.sol                                  | ce0d145807bc7b5b59b0e29ba468d9b0c0dc0314 |
| src/rng/IRNG.sol                                          | d701581ef4910cdde9dbc3006dd0229cc3ea6012 |
| src/proxy/UUPSProxiable.sol                               | 80d46ace20ea4c9c6a0cbc1093d6e88eb19aeb12 |
| src/proxy/UUPSProxy.sol                                   | 18a2a570a8ef2ec5f02d59bd1c03a176203e8ccf |
| src/proxy/Initializable.sol                               | 7079462341810d12b0c0ea93845d053bdcbdabff |

Contracts Description Table

|           Contract           |                  Type                   |                         Bases                          |                |                                        |
| :--------------------------: | :-------------------------------------: | :----------------------------------------------------: | :------------: | :------------------------------------: |
|              └               |            **Function Name**            |                     **Visibility**                     | **Mutability** |             **Modifiers**              |
|                              |                                         |                                                        |                |                                        |
|        **KlerosCore**        |             Implementation              |                     KlerosCoreBase                     |                |                                        |
|              └               |              <Constructor>              |                       Public ❗️                        |       🛑       |                  NO❗️                  |
|              └               |               initialize                |                      External ❗️                       |       🛑       |             reinitializer              |
|              └               |              reinitialize               |                      External ❗️                       |       🛑       |             reinitializer              |
|              └               |           \_authorizeUpgrade            |                      Internal 🔒                       |                |             onlyByGovernor             |
|                              |                                         |                                                        |                |                                        |
|      **KlerosCoreBase**      |             Implementation              |      IArbitratorV2, Initializable, UUPSProxiable       |                |                                        |
|              └               |      \_\_KlerosCoreBase_initialize      |                      Internal 🔒                       |       🛑       |            onlyInitializing            |
|              └               |                  pause                  |                      External ❗️                       |       🛑       | onlyByGuardianOrGovernor whenNotPaused |
|              └               |                 unpause                 |                      External ❗️                       |       🛑       |       onlyByGovernor whenPaused        |
|              └               |         executeGovernorProposal         |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |             changeGovernor              |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |             changeGuardian              |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |             changePinakion              |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |      changeJurorProsecutionModule       |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |          changeSortitionModule          |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |            addNewDisputeKit             |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |               createCourt               |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |          changeCourtParameters          |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |            enableDisputeKits            |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |         changeAcceptedFeeTokens         |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |           changeCurrencyRates           |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |                setStake                 |                      External ❗️                       |       🛑       |             whenNotPaused              |
|              └               |        setStakeBySortitionModule        |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |        transferBySortitionModule        |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |              createDispute              |                      External ❗️                       |       💵       |                  NO❗️                  |
|              └               |              createDispute              |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |             \_createDispute             |                      Internal 🔒                       |       🛑       |                                        |
|              └               |               passPeriod                |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |                  draw                   |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |                 appeal                  |                      External ❗️                       |       💵       |                  NO❗️                  |
|              └               |                 execute                 |                      External ❗️                       |       🛑       |             whenNotPaused              |
|              └               |           \_executePenalties            |                      Internal 🔒                       |       🛑       |                                        |
|              └               |            \_executeRewards             |                      Internal 🔒                       |       🛑       |                                        |
|              └               |              executeRuling              |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |             arbitrationCost             |                       Public ❗️                        |                |                  NO❗️                  |
|              └               |             arbitrationCost             |                       Public ❗️                        |                |                  NO❗️                  |
|              └               |               appealCost                |                       Public ❗️                        |                |                  NO❗️                  |
|              └               |              appealPeriod               |                      External ❗️                       |                |                  NO❗️                  |
|              └               |              currentRuling              |                       Public ❗️                        |                |                  NO❗️                  |
|              └               |              getRoundInfo               |                      External ❗️                       |                |                  NO❗️                  |
|              └               |          getPnkAtStakePerJuror          |                      External ❗️                       |                |                  NO❗️                  |
|              └               |            getNumberOfRounds            |                      External ❗️                       |                |                  NO❗️                  |
|              └               |               isSupported               |                      External ❗️                       |                |                  NO❗️                  |
|              └               |            getTimesPerPeriod            |                      External ❗️                       |                |                  NO❗️                  |
|              └               |            getNumberOfVotes             |                      External ❗️                       |                |                  NO❗️                  |
|              └               |           isDisputeKitJumping           |                      External ❗️                       |                |                  NO❗️                  |
|              └               |          getDisputeKitsLength           |                      External ❗️                       |                |                  NO❗️                  |
|              └               |         convertEthToTokenAmount         |                       Public ❗️                        |                |                  NO❗️                  |
|              └               |           \_transferFeeToken            |                      Internal 🔒                       |       🛑       |                                        |
|              └               |            \_applyCoherence             |                      Internal 🔒                       |                |                                        |
|              └               |          \_calculatePnkAtStake          |                      Internal 🔒                       |                |                                        |
|              └               |           \_enableDisputeKit            |                      Internal 🔒                       |       🛑       |                                        |
|              └               |               \_setStake                |                      Internal 🔒                       |       🛑       |                                        |
|              └               |             \_stakingFailed             |                      Internal 🔒                       |                |                                        |
|              └               | \_extraDataToCourtIDMinJurorsDisputeKit |                      Internal 🔒                       |                |                                        |
|                              |                                         |                                                        |                |                                        |
|      **KlerosCoreNeo**       |             Implementation              |                     KlerosCoreBase                     |                |                                        |
|              └               |              <Constructor>              |                       Public ❗️                        |       🛑       |                  NO❗️                  |
|              └               |               initialize                |                      External ❗️                       |       🛑       |             reinitializer              |
|              └               |              reinitialize               |                      External ❗️                       |       🛑       |             reinitializer              |
|              └               |           \_authorizeUpgrade            |                      Internal 🔒                       |                |             onlyByGovernor             |
|              └               |             changeJurorNft              |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |        changeArbitrableWhitelist        |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |                setStake                 |                      External ❗️                       |       🛑       |             whenNotPaused              |
|              └               |             \_createDispute             |                      Internal 🔒                       |       🛑       |                                        |
|              └               |             \_stakingFailed             |                      Internal 🔒                       |                |                                        |
|                              |                                         |                                                        |                |                                        |
|      **PolicyRegistry**      |             Implementation              |              UUPSProxiable, Initializable              |                |                                        |
|              └               |              <Constructor>              |                       Public ❗️                        |       🛑       |                  NO❗️                  |
|              └               |               initialize                |                      External ❗️                       |       🛑       |             reinitializer              |
|              └               |               initialize2               |                      External ❗️                       |       🛑       |             reinitializer              |
|              └               |           \_authorizeUpgrade            |                      Internal 🔒                       |                |             onlyByGovernor             |
|              └               |             changeGovernor              |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |                setPolicy                |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|                              |                                         |                                                        |                |                                        |
|     **SortitionModule**      |             Implementation              |                  SortitionModuleBase                   |                |                                        |
|              └               |              <Constructor>              |                       Public ❗️                        |       🛑       |                  NO❗️                  |
|              └               |               initialize                |                      External ❗️                       |       🛑       |             reinitializer              |
|              └               |               initialize4               |                      External ❗️                       |       🛑       |             reinitializer              |
|              └               |           \_authorizeUpgrade            |                      Internal 🔒                       |                |             onlyByGovernor             |
|                              |                                         |                                                        |                |                                        |
|   **SortitionModuleBase**    |             Implementation              |     ISortitionModule, Initializable, UUPSProxiable     |                |                                        |
|              └               |   \_\_SortitionModuleBase_initialize    |                      Internal 🔒                       |       🛑       |            onlyInitializing            |
|              └               |             changeGovernor              |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |          changeMinStakingTime           |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |          changeMaxDrawingTime           |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |       changeRandomNumberGenerator       |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |                passPhase                |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |               createTree                |                      External ❗️                       |       🛑       |               onlyByCore               |
|              └               |          executeDelayedStakes           |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |            createDisputeHook            |                      External ❗️                       |       🛑       |               onlyByCore               |
|              └               |              postDrawHook               |                      External ❗️                       |       🛑       |               onlyByCore               |
|              └               |           notifyRandomNumber            |                       Public ❗️                        |       🛑       |                  NO❗️                  |
|              └               |              validateStake              |                      External ❗️                       |       🛑       |               onlyByCore               |
|              └               |             \_validateStake             |                      Internal 🔒                       |       🛑       |                                        |
|              └               |                setStake                 |                      External ❗️                       |       🛑       |               onlyByCore               |
|              └               |               \_setStake                |                      Internal 🔒                       |       🛑       |                                        |
|              └               |                lockStake                |                      External ❗️                       |       🛑       |               onlyByCore               |
|              └               |               unlockStake               |                      External ❗️                       |       🛑       |               onlyByCore               |
|              └               |              penalizeStake              |                      External ❗️                       |       🛑       |               onlyByCore               |
|              └               |            setJurorInactive             |                      External ❗️                       |       🛑       |               onlyByCore               |
|              └               |           withdrawLeftoverPNK           |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |                  draw                   |                       Public ❗️                        |                |                  NO❗️                  |
|              └               |                 stakeOf                 |                       Public ❗️                        |                |                  NO❗️                  |
|              └               |                 stakeOf                 |                       Public ❗️                        |                |                  NO❗️                  |
|              └               |             getJurorBalance             |                      External ❗️                       |                |                  NO❗️                  |
|              └               |            getJurorCourtIDs             |                       Public ❗️                        |                |                  NO❗️                  |
|              └               |              isJurorStaked              |                      External ❗️                       |                |                  NO❗️                  |
|              └               |           getJurorLeftoverPNK           |                       Public ❗️                        |                |                  NO❗️                  |
|              └               |             \_updateParents             |                       Private 🔐                       |       🛑       |                                        |
|              └               |         \_stakePathIDToAccount          |                      Internal 🔒                       |                |                                        |
|              └               |           \_extraDataToTreeK            |                      Internal 🔒                       |                |                                        |
|              └               |                  \_set                  |                      Internal 🔒                       |       🛑       |                                        |
|              └               |    \_accountAndCourtIDToStakePathID     |                      Internal 🔒                       |                |                                        |
|                              |                                         |                                                        |                |                                        |
|    **SortitionModuleNeo**    |             Implementation              |                  SortitionModuleBase                   |                |                                        |
|              └               |              <Constructor>              |                       Public ❗️                        |       🛑       |                  NO❗️                  |
|              └               |               initialize                |                      External ❗️                       |       🛑       |             reinitializer              |
|              └               |               initialize4               |                      External ❗️                       |       🛑       |             reinitializer              |
|              └               |           \_authorizeUpgrade            |                      Internal 🔒                       |                |             onlyByGovernor             |
|              └               |         changeMaxStakePerJuror          |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |          changeMaxTotalStaked           |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |             \_validateStake             |                      Internal 🔒                       |       🛑       |               onlyByCore               |
|                              |                                         |                                                        |                |                                        |
|     **DisputeResolver**      |             Implementation              |                     IArbitrableV2                      |                |                                        |
|              └               |              <Constructor>              |                       Public ❗️                        |       🛑       |                  NO❗️                  |
|              └               |             changeGovernor              |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |            changeArbitrator             |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |         changeTemplateRegistry          |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |        createDisputeForTemplate         |                      External ❗️                       |       💵       |                  NO❗️                  |
|              └               |       createDisputeForTemplateUri       |                      External ❗️                       |       💵       |                  NO❗️                  |
|              └               |                  rule                   |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |             \_createDispute             |                      Internal 🔒                       |       🛑       |                                        |
|                              |                                         |                                                        |                |                                        |
| **DisputeTemplateRegistry**  |             Implementation              | IDisputeTemplateRegistry, UUPSProxiable, Initializable |                |                                        |
|              └               |              <Constructor>              |                       Public ❗️                        |       🛑       |                  NO❗️                  |
|              └               |               initialize                |                      External ❗️                       |       🛑       |             reinitializer              |
|              └               |               initialize2               |                      External ❗️                       |       🛑       |             reinitializer              |
|              └               |           \_authorizeUpgrade            |                      Internal 🔒                       |                |             onlyByGovernor             |
|              └               |             changeGovernor              |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |           setDisputeTemplate            |                      External ❗️                       |       🛑       |                  NO❗️                  |
|                              |                                         |                                                        |                |                                        |
|    **DisputeKitClassic**     |             Implementation              |                 DisputeKitClassicBase                  |                |                                        |
|              └               |              <Constructor>              |                       Public ❗️                        |       🛑       |                  NO❗️                  |
|              └               |               initialize                |                      External ❗️                       |       🛑       |             reinitializer              |
|              └               |              reinitialize               |                      External ❗️                       |       🛑       |             reinitializer              |
|              └               |           \_authorizeUpgrade            |                      Internal 🔒                       |                |             onlyByGovernor             |
|                              |                                         |                                                        |                |                                        |
|  **DisputeKitClassicBase**   |             Implementation              |       IDisputeKit, Initializable, UUPSProxiable        |                |                                        |
|              └               |  \_\_DisputeKitClassicBase_initialize   |                      Internal 🔒                       |       🛑       |            onlyInitializing            |
|              └               |         executeGovernorProposal         |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |             changeGovernor              |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |               changeCore                |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |              createDispute              |                      External ❗️                       |       🛑       |               onlyByCore               |
|              └               |                  draw                   |                      External ❗️                       |       🛑       |          onlyByCore notJumped          |
|              └               |               castCommit                |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |              \_castCommit               |                      Internal 🔒                       |       🛑       |               notJumped                |
|              └               |                castVote                 |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |               \_castVote                |                      Internal 🔒                       |       🛑       |               notJumped                |
|              └               |               fundAppeal                |                      External ❗️                       |       💵       |               notJumped                |
|              └               |         withdrawFeesAndRewards          |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |                hashVote                 |                       Public ❗️                        |                |                  NO❗️                  |
|              └               |            getFundedChoices             |                       Public ❗️                        |                |                  NO❗️                  |
|              └               |              currentRuling              |                      External ❗️                       |                |                  NO❗️                  |
|              └               |          getDegreeOfCoherence           |                      External ❗️                       |                |                  NO❗️                  |
|              └               |            getCoherentCount             |                      External ❗️                       |                |                  NO❗️                  |
|              └               |            areCommitsAllCast            |                      External ❗️                       |                |                  NO❗️                  |
|              └               |             areVotesAllCast             |                      External ❗️                       |                |                  NO❗️                  |
|              └               |             isAppealFunded              |                      External ❗️                       |                |                  NO❗️                  |
|              └               |              isVoteActive               |                      External ❗️                       |                |                  NO❗️                  |
|              └               |              getRoundInfo               |                      External ❗️                       |                |                  NO❗️                  |
|              └               |            getNumberOfRounds            |                      External ❗️                       |                |                  NO❗️                  |
|              └               |         getLocalDisputeRoundID          |                      External ❗️                       |                |                  NO❗️                  |
|              └               |               getVoteInfo               |                      External ❗️                       |                |                  NO❗️                  |
|              └               |             \_postDrawCheck             |                      Internal 🔒                       |                |                                        |
|                              |                                         |                                                        |                |                                        |
|      **IBalanceHolder**      |                Interface                |                                                        |                |                                        |
|              └               |                balanceOf                |                      External ❗️                       |                |                  NO❗️                  |
|                              |                                         |                                                        |                |                                        |
|  **IBalanceHolderERC1155**   |                Interface                |                                                        |                |                                        |
|              └               |                balanceOf                |                      External ❗️                       |                |                  NO❗️                  |
|                              |                                         |                                                        |                |                                        |
|     **DisputeKitGated**      |             Implementation              |                 DisputeKitClassicBase                  |                |                                        |
|              └               |              <Constructor>              |                       Public ❗️                        |       🛑       |                  NO❗️                  |
|              └               |               initialize                |                      External ❗️                       |       🛑       |             reinitializer              |
|              └               |              reinitialize               |                      External ❗️                       |       🛑       |             reinitializer              |
|              └               |           \_authorizeUpgrade            |                      Internal 🔒                       |                |             onlyByGovernor             |
|              └               |          extraDataToTokenInfo           |                       Public ❗️                        |                |                  NO❗️                  |
|              └               |             \_postDrawCheck             |                      Internal 🔒                       |                |                                        |
|                              |                                         |                                                        |                |                                        |
|      **IBalanceHolder**      |                Interface                |                                                        |                |                                        |
|              └               |                balanceOf                |                      External ❗️                       |                |                  NO❗️                  |
|                              |                                         |                                                        |                |                                        |
|  **IBalanceHolderERC1155**   |                Interface                |                                                        |                |                                        |
|              └               |                balanceOf                |                      External ❗️                       |                |                  NO❗️                  |
|                              |                                         |                                                        |                |                                        |
|  **DisputeKitGatedShutter**  |             Implementation              |                 DisputeKitClassicBase                  |                |                                        |
|              └               |              <Constructor>              |                       Public ❗️                        |       🛑       |                  NO❗️                  |
|              └               |               initialize                |                      External ❗️                       |       🛑       |             reinitializer              |
|              └               |              reinitialize               |                      External ❗️                       |       🛑       |             reinitializer              |
|              └               |           \_authorizeUpgrade            |                      Internal 🔒                       |                |             onlyByGovernor             |
|              └               |            castCommitShutter            |                      External ❗️                       |       🛑       |               notJumped                |
|              └               |             castVoteShutter             |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |                hashVote                 |                       Public ❗️                        |                |                  NO❗️                  |
|              └               |         \_extraDataToTokenInfo          |                      Internal 🔒                       |                |                                        |
|              └               |             \_postDrawCheck             |                      Internal 🔒                       |                |                                        |
|                              |                                         |                                                        |                |                                        |
|    **DisputeKitShutter**     |             Implementation              |                 DisputeKitClassicBase                  |                |                                        |
|              └               |              <Constructor>              |                       Public ❗️                        |       🛑       |                  NO❗️                  |
|              └               |               initialize                |                      External ❗️                       |       🛑       |             reinitializer              |
|              └               |              reinitialize               |                      External ❗️                       |       🛑       |             reinitializer              |
|              └               |           \_authorizeUpgrade            |                      Internal 🔒                       |                |             onlyByGovernor             |
|              └               |            castCommitShutter            |                      External ❗️                       |       🛑       |               notJumped                |
|              └               |             castVoteShutter             |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |                hashVote                 |                       Public ❗️                        |                |                  NO❗️                  |
|                              |                                         |                                                        |                |                                        |
|     **IProofOfHumanity**     |                Interface                |                                                        |                |                                        |
|              └               |              isRegistered               |                      External ❗️                       |                |                  NO❗️                  |
|                              |                                         |                                                        |                |                                        |
| **DisputeKitSybilResistant** |             Implementation              |                 DisputeKitClassicBase                  |                |                                        |
|              └               |              <Constructor>              |                       Public ❗️                        |       🛑       |                  NO❗️                  |
|              └               |               initialize                |                      External ❗️                       |       🛑       |             reinitializer              |
|              └               |           \_authorizeUpgrade            |                      Internal 🔒                       |                |             onlyByGovernor             |
|              └               |             \_postDrawCheck             |                      Internal 🔒                       |                |                                        |
|                              |                                         |                                                        |                |                                        |
|      **EvidenceModule**      |             Implementation              |        IEvidence, Initializable, UUPSProxiable         |                |                                        |
|              └               |              <Constructor>              |                       Public ❗️                        |       🛑       |                  NO❗️                  |
|              └               |               initialize                |                      External ❗️                       |       🛑       |             reinitializer              |
|              └               |               initialize2               |                      External ❗️                       |       🛑       |             reinitializer              |
|              └               |           \_authorizeUpgrade            |                      Internal 🔒                       |                |             onlyByGovernor             |
|              └               |             submitEvidence              |                      External ❗️                       |       🛑       |                  NO❗️                  |
|                              |                                         |                                                        |                |                                        |
|      **IArbitrableV2**       |                Interface                |                                                        |                |                                        |
|              └               |                  rule                   |                      External ❗️                       |       🛑       |                  NO❗️                  |
|                              |                                         |                                                        |                |                                        |
|      **IArbitratorV2**       |                Interface                |                                                        |                |                                        |
|              └               |              createDispute              |                      External ❗️                       |       💵       |                  NO❗️                  |
|              └               |              createDispute              |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |             arbitrationCost             |                      External ❗️                       |                |                  NO❗️                  |
|              └               |             arbitrationCost             |                      External ❗️                       |                |                  NO❗️                  |
|              └               |              currentRuling              |                      External ❗️                       |                |                  NO❗️                  |
|                              |                                         |                                                        |                |                                        |
|       **IDisputeKit**        |                Interface                |                                                        |                |                                        |
|              └               |              createDispute              |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |                  draw                   |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |              currentRuling              |                      External ❗️                       |                |                  NO❗️                  |
|              └               |          getDegreeOfCoherence           |                      External ❗️                       |                |                  NO❗️                  |
|              └               |            getCoherentCount             |                      External ❗️                       |                |                  NO❗️                  |
|              └               |            areCommitsAllCast            |                      External ❗️                       |                |                  NO❗️                  |
|              └               |             areVotesAllCast             |                      External ❗️                       |                |                  NO❗️                  |
|              └               |             isAppealFunded              |                      External ❗️                       |                |                  NO❗️                  |
|              └               |              isVoteActive               |                      External ❗️                       |                |                  NO❗️                  |
|              └               |              getRoundInfo               |                      External ❗️                       |                |                  NO❗️                  |
|              └               |               getVoteInfo               |                      External ❗️                       |                |                  NO❗️                  |
|                              |                                         |                                                        |                |                                        |
| **IDisputeTemplateRegistry** |                Interface                |                                                        |                |                                        |
|              └               |           setDisputeTemplate            |                      External ❗️                       |       🛑       |                  NO❗️                  |
|                              |                                         |                                                        |                |                                        |
|        **IEvidence**         |                Interface                |                                                        |                |                                        |
|                              |                                         |                                                        |                |                                        |
|     **ISortitionModule**     |                Interface                |                                                        |                |                                        |
|              └               |               createTree                |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |              validateStake              |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |                setStake                 |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |            setJurorInactive             |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |                lockStake                |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |               unlockStake               |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |              penalizeStake              |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |           notifyRandomNumber            |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |                  draw                   |                      External ❗️                       |                |                  NO❗️                  |
|              └               |             getJurorBalance             |                      External ❗️                       |                |                  NO❗️                  |
|              └               |            getJurorCourtIDs             |                      External ❗️                       |                |                  NO❗️                  |
|              └               |              isJurorStaked              |                      External ❗️                       |                |                  NO❗️                  |
|              └               |           getJurorLeftoverPNK           |                      External ❗️                       |                |                  NO❗️                  |
|              └               |            createDisputeHook            |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |              postDrawHook               |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |           withdrawLeftoverPNK           |                      External ❗️                       |       🛑       |                  NO❗️                  |
|                              |                                         |                                                        |                |                                        |
|        **SafeERC20**         |                 Library                 |                                                        |                |                                        |
|              └               |            increaseAllowance            |                      Internal 🔒                       |       🛑       |                                        |
|              └               |              safeTransfer               |                      Internal 🔒                       |       🛑       |                                        |
|              └               |            safeTransferFrom             |                      Internal 🔒                       |       🛑       |                                        |
|                              |                                         |                                                        |                |                                        |
|         **WethLike**         |                Interface                |                                                        |                |                                        |
|              └               |                 deposit                 |                      External ❗️                       |       💵       |                  NO❗️                  |
|              └               |                transfer                 |                      External ❗️                       |       🛑       |                  NO❗️                  |
|                              |                                         |                                                        |                |                                        |
|         **SafeSend**         |                 Library                 |                                                        |                |                                        |
|              └               |                safeSend                 |                      Internal 🔒                       |       🛑       |                                        |
|                              |                                         |                                                        |                |                                        |
|     **RNGWithFallback**      |             Implementation              |                          IRNG                          |                |                                        |
|              └               |              <Constructor>              |                       Public ❗️                        |       🛑       |                  NO❗️                  |
|              └               |             changeGovernor              |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |             changeConsumer              |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |          changeFallbackTimeout          |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |            requestRandomness            |                      External ❗️                       |       🛑       |             onlyByConsumer             |
|              └               |            receiveRandomness            |                      External ❗️                       |       🛑       |             onlyByConsumer             |
|                              |                                         |                                                        |                |                                        |
|       **ChainlinkRNG**       |             Implementation              |              IRNG, VRFConsumerBaseV2Plus               |                |                                        |
|              └               |              <Constructor>              |                       Public ❗️                        |       🛑       |         VRFConsumerBaseV2Plus          |
|              └               |             changeGovernor              |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |             changeConsumer              |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |          changeVrfCoordinator           |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |              changeKeyHash              |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |          changeSubscriptionId           |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |       changeRequestConfirmations        |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |         changeCallbackGasLimit          |                      External ❗️                       |       🛑       |             onlyByGovernor             |
|              └               |            requestRandomness            |                      External ❗️                       |       🛑       |             onlyByConsumer             |
|              └               |           fulfillRandomWords            |                      Internal 🔒                       |       🛑       |                                        |
|              └               |            receiveRandomness            |                      External ❗️                       |                |                  NO❗️                  |
|                              |                                         |                                                        |                |                                        |
|           **IRNG**           |                Interface                |                                                        |                |                                        |
|              └               |            requestRandomness            |                      External ❗️                       |       🛑       |                  NO❗️                  |
|              └               |            receiveRandomness            |                      External ❗️                       |       🛑       |                  NO❗️                  |
|                              |                                         |                                                        |                |                                        |
|      **UUPSProxiable**       |             Implementation              |                                                        |                |                                        |
|              └               |           \_authorizeUpgrade            |                      Internal 🔒                       |       🛑       |                                        |
|              └               |            upgradeToAndCall             |                       Public ❗️                        |       💵       |                  NO❗️                  |
|              └               |              proxiableUUID              |                      External ❗️                       |                |                  NO❗️                  |
|              └               |                 version                 |                      External ❗️                       |                |                  NO❗️                  |
|              └               |           \_getImplementation           |                      Internal 🔒                       |                |                                        |
|                              |                                         |                                                        |                |                                        |
|        **UUPSProxy**         |             Implementation              |                                                        |                |                                        |
|              └               |              <Constructor>              |                       Public ❗️                        |       🛑       |                  NO❗️                  |
|              └               |               \_delegate                |                      Internal 🔒                       |       🛑       |                                        |
|              └               |           \_getImplementation           |                      Internal 🔒                       |                |                                        |
|              └               |               <Fallback>                |                      External ❗️                       |       💵       |                  NO❗️                  |
|              └               |             <Receive Ether>             |                      External ❗️                       |       💵       |                  NO❗️                  |
|                              |                                         |                                                        |                |                                        |
|      **Initializable**       |             Implementation              |                                                        |                |                                        |
|              └               |           \_checkInitializing           |                      Internal 🔒                       |                |                                        |
|              └               |          \_disableInitializers          |                      Internal 🔒                       |       🛑       |                                        |
|              └               |         \_getInitializedVersion         |                      Internal 🔒                       |                |                                        |
|              └               |            \_isInitializing             |                      Internal 🔒                       |                |                                        |
|              └               |        \_getInitializableStorage        |                       Private 🔐                       |                |                                        |

Legend

| Symbol | Meaning                   |
| :----: | ------------------------- |
|   🛑   | Function can modify state |
|   💵   | Function is payable       |

</div>
____
<sub>
Thinking about smart contract security? We can provide training, ongoing advice, and smart contract auditing. [Contact us](https://consensys.io/diligence/contact/).
</sub>
