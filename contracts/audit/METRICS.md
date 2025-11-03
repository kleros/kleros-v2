[<img width="200" alt="get in touch with Consensys Diligence" src="https://user-images.githubusercontent.com/2865694/56826101-91dcf380-685b-11e9-937c-af49c2510aa0.png">](https://consensys.io/diligence)<br/>
<sup>
[[ 🌐 ](https://consensys.io/diligence) [ 📩 ](mailto:diligence@consensys.net) [ 🔥 ](https://consensys.io/diligence/tools/)]
</sup>

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

Source Units Analyzed: **`30`**<br>
Source Units in Scope: **`30`** (**100%**)

| Type     | File                                                                        | Logic Contracts | Interfaces | Lines    | nLines   | nSLOC    | Comment Lines | Complex. Score | Capabilities                                                                                                                                                                                                                                                                                     |
| -------- | --------------------------------------------------------------------------- | --------------- | ---------- | -------- | -------- | -------- | ------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 📝       | src/arbitration/KlerosCore.sol                                              | 1               | \*\*\*\*   | 1460     | 1391     | 907      | 404           | 485            | **<abbr title='Uses Assembly'>🖥</abbr><abbr title='Payable Functions'>💰</abbr>**                                                                                                                                                                                                               |
| 📝       | src/arbitration/PolicyRegistry.sol                                          | 1               | \*\*\*\*   | 90       | 90       | 29       | 43            | 22             | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 📝       | src/arbitration/SortitionModule.sol                                         | 1               | \*\*\*\*   | 562      | 512      | 322      | 149           | 216            | **<abbr title='Uses Assembly'>🖥</abbr>**                                                                                                                                                                                                                                                        |
| 📝       | src/arbitration/arbitrables/DisputeResolver.sol                             | 1               | \*\*\*\*   | 150      | 140      | 75       | 50            | 43             | **<abbr title='Payable Functions'>💰</abbr>**                                                                                                                                                                                                                                                    |
| 📝       | src/arbitration/DisputeTemplateRegistry.sol                                 | 1               | \*\*\*\*   | 82       | 78       | 29       | 32            | 23             | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 📝       | src/arbitration/dispute-kits/DisputeKitClassic.sol                          | 1               | \*\*\*\*   | 43       | 43       | 14       | 21            | 10             | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 🎨       | src/arbitration/dispute-kits/DisputeKitClassicBase.sol                      | 1               | \*\*\*\*   | 828      | 715      | 445      | 232           | 236            | **<abbr title='Payable Functions'>💰</abbr><abbr title='Uses Hash-Functions'>🧮</abbr>**                                                                                                                                                                                                         |
| 📝🔍     | src/arbitration/dispute-kits/DisputeKitGated.sol                            | 1               | 2          | 158      | 133      | 51       | 67            | 69             | **<abbr title='Uses Assembly'>🖥</abbr><abbr title='doppelganger(IBalanceHolderERC1155)'>🔆</abbr>**                                                                                                                                                                                             |
| 📝🔍     | src/arbitration/dispute-kits/DisputeKitGatedArgentinaConsumerProtection.sol | 1               | 1          | 145      | 118      | 54       | 54            | 40             | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 📝🔍     | src/arbitration/dispute-kits/DisputeKitGatedShutter.sol                     | 1               | 2          | 287      | 241      | 101      | 110           | 102            | **<abbr title='Uses Assembly'>🖥</abbr><abbr title='Uses Hash-Functions'>🧮</abbr><abbr title='doppelganger(IBalanceHolderERC1155)'>🔆</abbr>**                                                                                                                                                  |
| 📝       | src/arbitration/dispute-kits/DisputeKitShutter.sol                          | 1               | \*\*\*\*   | 190      | 170      | 64       | 76            | 43             | **<abbr title='Uses Hash-Functions'>🧮</abbr>**                                                                                                                                                                                                                                                  |
| 📝🔍     | src/arbitration/dispute-kits/DisputeKitSybilResistant.sol                   | 1               | 1          | 78       | 59       | 21       | 33            | 16             | **<abbr title='doppelganger(IProofOfHumanity)'>🔆</abbr>**                                                                                                                                                                                                                                       |
| 📝       | src/arbitration/evidence/EvidenceModule.sol                                 | 1               | \*\*\*\*   | 72       | 72       | 25       | 32            | 19             | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 🔍       | src/arbitration/interfaces/IArbitrableV2.sol                                | \*\*\*\*        | 1          | 42       | 41       | 6        | 28            | 3              | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 🔍       | src/arbitration/interfaces/IArbitratorV2.sol                                | \*\*\*\*        | 1          | 89       | 47       | 9        | 53            | 14             | **<abbr title='Payable Functions'>💰</abbr>**                                                                                                                                                                                                                                                    |
| 🔍       | src/arbitration/interfaces/IDisputeKit.sol                                  | \*\*\*\*        | 1          | 195      | 41       | 11       | 105           | 27             | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 🔍       | src/arbitration/interfaces/IDisputeTemplateRegistry.sol                     | \*\*\*\*        | 1          | 38       | 33       | 9        | 19            | 3              | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 🔍       | src/arbitration/interfaces/IEvidence.sol                                    | \*\*\*\*        | 1          | 12       | 12       | 4        | 6             | 1              | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 🔍       | src/arbitration/interfaces/ISortitionModule.sol                             | \*\*\*\*        | 1          | 216      | 33       | 10       | 141           | 39             | \*\*\*\*                                                                                                                                                                                                                                                                                         |
|          | src/libraries/Constants.sol                                                 | \*\*\*\*        | \*\*\*\*   | 42       | 42       | 27       | 14            | 2              | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 📚       | src/libraries/SortitionTrees.sol                                            | 1               | \*\*\*\*   | 239      | 234      | 117      | 94            | 60             | **<abbr title='Uses Assembly'>🖥</abbr><abbr title='Uses Hash-Functions'>🧮</abbr>**                                                                                                                                                                                                             |
| 📚       | src/libraries/SafeERC20.sol                                                 | 1               | \*\*\*\*   | 49       | 49       | 18       | 26            | 12             | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 📚🔍     | src/libraries/SafeSend.sol                                                  | 1               | 1          | 24       | 19       | 9        | 8             | 15             | **<abbr title='Payable Functions'>💰</abbr><abbr title='Initiates ETH Value Transfer'>📤</abbr>**                                                                                                                                                                                                |
| 📝       | src/rng/RNGWithFallback.sol                                                 | 1               | \*\*\*\*   | 110      | 110      | 49       | 45            | 38             | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 📝       | src/rng/ChainlinkRNG.sol                                                    | 1               | \*\*\*\*   | 172      | 172      | 83       | 70            | 51             | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 🎨       | src/rng/ChainlinkConsumerBaseV2Plus.sol                                     | 1               | \*\*\*\*   | 169      | 164      | 36       | 121           | 28             | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 🔍       | src/rng/IRNG.sol                                                            | \*\*\*\*        | 1          | 24       | 12       | 3        | 11            | 5              | \*\*\*\*                                                                                                                                                                                                                                                                                         |
| 🎨       | src/proxy/UUPSProxiable.sol                                                 | 1               | \*\*\*\*   | 141      | 123      | 44       | 72            | 46             | **<abbr title='Uses Assembly'>🖥</abbr><abbr title='Payable Functions'>💰</abbr><abbr title='DelegateCall'>👥</abbr><abbr title='TryCatch Blocks'>♻️</abbr>**                                                                                                                                    |
| 📝       | src/proxy/UUPSProxy.sol                                                     | 1               | \*\*\*\*   | 91       | 91       | 38       | 38            | 65             | **<abbr title='Uses Assembly'>🖥</abbr><abbr title='Payable Functions'>💰</abbr><abbr title='DelegateCall'>👥</abbr>**                                                                                                                                                                           |
| 🎨       | src/proxy/Initializable.sol                                                 | 1               | \*\*\*\*   | 215      | 215      | 70       | 128           | 31             | **<abbr title='Uses Assembly'>🖥</abbr>**                                                                                                                                                                                                                                                        |
| 📝📚🔍🎨 | **Totals**                                                                  | **22**          | **14**     | **6013** | **5200** | **2680** | **2282**      | **1764**       | **<abbr title='Uses Assembly'>🖥</abbr><abbr title='Payable Functions'>💰</abbr><abbr title='Initiates ETH Value Transfer'>📤</abbr><abbr title='DelegateCall'>👥</abbr><abbr title='Uses Hash-Functions'>🧮</abbr><abbr title='doppelganger'>🔆</abbr><abbr title='TryCatch Blocks'>♻️</abbr>** |

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

Total: 15

- 📝 `KlerosCore`
- 📝 `PolicyRegistry`
- 📝 `SortitionModule`
- 📝 `DisputeResolver`
- 📝 `DisputeTemplateRegistry`
- <a onclick="toggleVisibility('deployables', this)">[➕]</a>
<div id="deployables" style="display:none">
<ul>
<li> 📝 <code>DisputeKitClassic</code></li>
<li> 📝 <code>DisputeKitGated</code></li>
<li> 📝 <code>DisputeKitGatedArgentinaConsumerProtection</code></li>
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

- **Comment-to-Source Ratio:** On average there are`1.39` code lines per comment (lower=better).
- **ToDo's:** `1`

#### <span id=t-components>Components</span>

| 📝Contracts | 📚Libraries | 🔍Interfaces | 🎨Abstract |
| ----------- | ----------- | ------------ | ---------- |
| 15          | 3           | 14           | 4          |

#### <span id=t-exposed-functions>Exposed Functions</span>

This section lists functions that are explicitly declared public or payable. Please note that getter methods for public stateVars are not included.

| 🌐Public | 💰Payable |
| -------- | --------- |
| 195      | 9         |

| External | Internal | Private | Pure | View |
| -------- | -------- | ------- | ---- | ---- |
| 176      | 224      | 2       | 12   | 92   |

#### <span id=t-statevariables>StateVariables</span>

| Total | 🌐Public |
| ----- | -------- |
| 95    | 86       |

#### <span id=t-capabilities>Capabilities</span>

| Solidity Versions observed                   | 🧪 Experimental Features | 💰 Can Receive Funds | 🖥 Uses Assembly           | 💣 Has Destroyable Contracts |
| -------------------------------------------- | ------------------------ | -------------------- | -------------------------- | ---------------------------- |
| `^0.8.24`<br/>`^0.8.28`<br/>`>=0.8.0 <0.9.0` |                          | `yes`                | `yes` <br/>(12 asm blocks) | \*\*\*\*                     |

| 📤 Transfers ETH | ⚡ Low-Level Calls | 👥 DelegateCall | 🧮 Uses Hash Functions | 🔖 ECRecover | 🌀 New/Create/Create2 |
| ---------------- | ------------------ | --------------- | ---------------------- | ------------ | --------------------- |
| `yes`            | \*\*\*\*           | `yes`           | `yes`                  | \*\*\*\*     | \*\*\*\*              |

| ♻️ TryCatch | Σ Unchecked |
| ----------- | ----------- |
| `yes`       | \*\*\*\*    |

#### <span id=t-package-imports>Dependencies / External Imports</span>

| Dependency / Import Path                                                          | Count |
| --------------------------------------------------------------------------------- | ----- |
| @chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol        | 1     |
| @chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFMigratableConsumerV2Plus.sol | 1     |
| @chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol               | 1     |
| @openzeppelin/contracts/token/ERC20/IERC20.sol                                    | 4     |
| @openzeppelin/contracts/token/ERC721/IERC721.sol                                  | 1     |

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

| File Name                                                                   | SHA-1 Hash                               |
| --------------------------------------------------------------------------- | ---------------------------------------- |
| src/arbitration/KlerosCore.sol                                              | 75e0d221f43ad6b2dd2e671a15a982db9bbbe805 |
| src/arbitration/PolicyRegistry.sol                                          | 51c9beae644e6307a70398dd927b9467ec8d811f |
| src/arbitration/SortitionModule.sol                                         | 24c0168472357ece5029cf4f3d962c41b6e518df |
| src/arbitration/arbitrables/DisputeResolver.sol                             | c3a6083a380845b75ffab50440fbdfe1268978a4 |
| src/arbitration/DisputeTemplateRegistry.sol                                 | ff84f0ee7329b8f4f18ea44bfffa38644199861b |
| src/arbitration/dispute-kits/DisputeKitClassic.sol                          | 8650a2ae022647c3cacd1d5fa3595765ad8d6caf |
| src/arbitration/dispute-kits/DisputeKitClassicBase.sol                      | fc5b1c1027f731d5be55e8de931a0588127f0911 |
| src/arbitration/dispute-kits/DisputeKitGated.sol                            | 2578857c404311941605e03a6b12cbf22eaa4500 |
| src/arbitration/dispute-kits/DisputeKitGatedArgentinaConsumerProtection.sol | b37c6191b9aad71f1c4b554657e93658bccb4966 |
| src/arbitration/dispute-kits/DisputeKitGatedShutter.sol                     | a98f45a957ff39f32eaf23ae089660679c343f6c |
| src/arbitration/dispute-kits/DisputeKitShutter.sol                          | 7579da752fd99483b9ae3d2b5cc220a3a69264b7 |
| src/arbitration/dispute-kits/DisputeKitSybilResistant.sol                   | 277ba27b3cc8d4e639c65a2eb02852f4f7ce6dc7 |
| src/arbitration/evidence/EvidenceModule.sol                                 | 3f5940081924bb439804ba48c1e3f7a695c14282 |
| src/arbitration/interfaces/IArbitrableV2.sol                                | 9b4a27286b3da37b95588b12d231fbfbe760df31 |
| src/arbitration/interfaces/IArbitratorV2.sol                                | 204ef591b6cbec703a2dd783aeda249ce78fad9b |
| src/arbitration/interfaces/IDisputeKit.sol                                  | d36771d3ec03c39413ecbd5c55e2eb950c2a8f91 |
| src/arbitration/interfaces/IDisputeTemplateRegistry.sol                     | e040646a815ba0bca1a89462ccbdac32b0fd2d2a |
| src/arbitration/interfaces/IEvidence.sol                                    | 91defc8ad804b82eeb8a9b7abd87bf678435a19d |
| src/arbitration/interfaces/ISortitionModule.sol                             | c2531ff74ac4aa9ba3c18a7ea68d14229849bc18 |
| src/libraries/Constants.sol                                                 | 124e1cee89c420f294bf93b5da0d0798dc6555ee |
| src/libraries/SortitionTrees.sol                                            | b8252396b2c12655dc32cf616578027adaf6acea |
| src/libraries/SafeERC20.sol                                                 | be5471bf1f0dc54f5ead27e68a7ce8dbddcbc3ea |
| src/libraries/SafeSend.sol                                                  | 49af874d44fabafe0f232b1adbb80f02afe5e008 |
| src/rng/RNGWithFallback.sol                                                 | 68e487d01b802a7a078e7e43b982949d8657fc2f |
| src/rng/ChainlinkRNG.sol                                                    | 3baccf9fa2b3e5a668d28e0f3b4a35565baaf37b |
| src/rng/ChainlinkConsumerBaseV2Plus.sol                                     | f2711f2698a553b907a44c8b5d75bc3742a06dbb |
| src/rng/IRNG.sol                                                            | 5b92e16d90546c98627da5e0781fef342772da5e |
| src/proxy/UUPSProxiable.sol                                                 | b141472eeb40169e5add5ba2b3d26e1a0f7c091c |
| src/proxy/UUPSProxy.sol                                                     | 0af9029bc9645052e07bdd507b997328b5ee52fc |
| src/proxy/Initializable.sol                                                 | bf3ba9453bab903eda4247e90e39376e20744353 |

Contracts Description Table

|                    Contract                    |                     Type                      |                         Bases                          |                |                                     |
| :--------------------------------------------: | :-------------------------------------------: | :----------------------------------------------------: | :------------: | :---------------------------------: |
|                       └                        |               **Function Name**               |                     **Visibility**                     | **Mutability** |            **Modifiers**            |
|                                                |                                               |                                                        |                |                                     |
|                 **KlerosCore**                 |                Implementation                 |      IArbitratorV2, Initializable, UUPSProxiable       |                |                                     |
|                       └                        |                 <Constructor>                 |                       Public ❗️                        |       🛑       |                NO❗️                 |
|                       └                        |                  initialize                   |                      External ❗️                       |       🛑       |             initializer             |
|                       └                        |              \_authorizeUpgrade               |                      Internal 🔒                       |                |             onlyByOwner             |
|                       └                        |                     pause                     |                      External ❗️                       |       🛑       | onlyByGuardianOrOwner whenNotPaused |
|                       └                        |                    unpause                    |                      External ❗️                       |       🛑       |       onlyByOwner whenPaused        |
|                       └                        |             executeOwnerProposal              |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |                  changeOwner                  |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |                changeGuardian                 |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |                changePinakion                 |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |         changeJurorProsecutionModule          |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |             changeSortitionModule             |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |               addNewDisputeKit                |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |                  createCourt                  |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |             changeCourtParameters             |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |               enableDisputeKits               |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |            changeAcceptedFeeTokens            |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |              changeCurrencyRates              |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |                changeJurorNft                 |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |           changeArbitrableWhitelist           |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |       changeArbitrableWhitelistEnabled        |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |                   setStake                    |                      External ❗️                       |       🛑       |            whenNotPaused            |
|                       └                        |           setStakeBySortitionModule           |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |           transferBySortitionModule           |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                 createDispute                 |                      External ❗️                       |       💵       |                NO❗️                 |
|                       └                        |                 createDispute                 |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                \_createDispute                |                      Internal 🔒                       |       🛑       |                                     |
|                       └                        |                  passPeriod                   |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                     draw                      |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                    appeal                     |                      External ❗️                       |       💵       |                NO❗️                 |
|                       └                        |                    execute                    |                      External ❗️                       |       🛑       |            whenNotPaused            |
|                       └                        |              \_executePenalties               |                      Internal 🔒                       |       🛑       |                                     |
|                       └                        |               \_executeRewards                |                      Internal 🔒                       |       🛑       |                                     |
|                       └                        |                 executeRuling                 |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                arbitrationCost                |                       Public ❗️                        |                |                NO❗️                 |
|                       └                        |                arbitrationCost                |                       Public ❗️                        |                |                NO❗️                 |
|                       └                        |                  appealCost                   |                       Public ❗️                        |                |                NO❗️                 |
|                       └                        |                 appealPeriod                  |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |                 currentRuling                 |                       Public ❗️                        |                |                NO❗️                 |
|                       └                        |                 getRoundInfo                  |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |             getPnkAtStakePerJuror             |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |               getNumberOfRounds               |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |                  isSupported                  |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |               getTimesPerPeriod               |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |               getNumberOfVotes                |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |          getCourtAndDisputeKitJumps           |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |             getDisputeKitsLength              |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |            convertEthToTokenAmount            |                       Public ❗️                        |                |                NO❗️                 |
|                       └                        |       \_getCompatibleNextRoundSettings        |                      Internal 🔒                       |                |                                     |
|                       └                        |              \_transferFeeToken               |                      Internal 🔒                       |       🛑       |                                     |
|                       └                        |               \_applyCoherence                |                      Internal 🔒                       |                |                                     |
|                       └                        |             \_calculatePnkAtStake             |                      Internal 🔒                       |                |                                     |
|                       └                        |              \_enableDisputeKit               |                      Internal 🔒                       |       🛑       |                                     |
|                       └                        |                  \_setStake                   |                      Internal 🔒                       |       🛑       |                                     |
|                       └                        |                \_stakingFailed                |                      Internal 🔒                       |                |                                     |
|                       └                        |    \_extraDataToCourtIDMinJurorsDisputeKit    |                      Internal 🔒                       |                |                                     |
|                                                |                                               |                                                        |                |                                     |
|               **PolicyRegistry**               |                Implementation                 |              UUPSProxiable, Initializable              |                |                                     |
|                       └                        |                 <Constructor>                 |                       Public ❗️                        |       🛑       |                NO❗️                 |
|                       └                        |                  initialize                   |                      External ❗️                       |       🛑       |             initializer             |
|                       └                        |              \_authorizeUpgrade               |                      Internal 🔒                       |                |             onlyByOwner             |
|                       └                        |                  changeOwner                  |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |                   setPolicy                   |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                                                |                                               |                                                        |                |                                     |
|              **SortitionModule**               |                Implementation                 |     ISortitionModule, Initializable, UUPSProxiable     |                |                                     |
|                       └                        |                 <Constructor>                 |                       Public ❗️                        |       🛑       |                NO❗️                 |
|                       └                        |                  initialize                   |                      External ❗️                       |       🛑       |             initializer             |
|                       └                        |              \_authorizeUpgrade               |                      Internal 🔒                       |                |             onlyByOwner             |
|                       └                        |                  changeOwner                  |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |             changeMinStakingTime              |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |             changeMaxDrawingTime              |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |          changeRandomNumberGenerator          |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |            changeMaxStakePerJuror             |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |             changeMaxTotalStaked              |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |                   passPhase                   |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                  createTree                   |                      External ❗️                       |       🛑       |             onlyByCore              |
|                       └                        |             executeDelayedStakes              |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |               createDisputeHook               |                      External ❗️                       |       🛑       |             onlyByCore              |
|                       └                        |                 postDrawHook                  |                      External ❗️                       |       🛑       |             onlyByCore              |
|                       └                        |                 validateStake                 |                      External ❗️                       |       🛑       |             onlyByCore              |
|                       └                        |                \_validateStake                |                      Internal 🔒                       |       🛑       |                                     |
|                       └                        |                   setStake                    |                      External ❗️                       |       🛑       |             onlyByCore              |
|                       └                        |                setStakePenalty                |                      External ❗️                       |       🛑       |             onlyByCore              |
|                       └                        |                setStakeReward                 |                      External ❗️                       |       🛑       |             onlyByCore              |
|                       └                        |                  \_setStake                   |                      Internal 🔒                       |       🛑       |                                     |
|                       └                        |                   lockStake                   |                      External ❗️                       |       🛑       |             onlyByCore              |
|                       └                        |                  unlockStake                  |                      External ❗️                       |       🛑       |             onlyByCore              |
|                       └                        |            forcedUnstakeAllCourts             |                      External ❗️                       |       🛑       |             onlyByCore              |
|                       └                        |                 forcedUnstake                 |                      External ❗️                       |       🛑       |             onlyByCore              |
|                       └                        |              withdrawLeftoverPNK              |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                     draw                      |                       Public ❗️                        |                |                NO❗️                 |
|                       └                        |                getJurorBalance                |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |               getJurorCourtIDs                |                       Public ❗️                        |                |                NO❗️                 |
|                       └                        |                 isJurorStaked                 |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |              getJurorLeftoverPNK              |                       Public ❗️                        |                |                NO❗️                 |
|                       └                        |                   \_stakeOf                   |                      Internal 🔒                       |                |                                     |
|                       └                        |              \_extraDataToTreeK               |                      Internal 🔒                       |                |                                     |
|                                                |                                               |                                                        |                |                                     |
|              **DisputeResolver**               |                Implementation                 |                     IArbitrableV2                      |                |                                     |
|                       └                        |                 <Constructor>                 |                       Public ❗️                        |       🛑       |                NO❗️                 |
|                       └                        |                  changeOwner                  |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |               changeArbitrator                |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |            changeTemplateRegistry             |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |           createDisputeForTemplate            |                      External ❗️                       |       💵       |                NO❗️                 |
|                       └                        |                     rule                      |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                \_createDispute                |                      Internal 🔒                       |       🛑       |                                     |
|                                                |                                               |                                                        |                |                                     |
|          **DisputeTemplateRegistry**           |                Implementation                 | IDisputeTemplateRegistry, UUPSProxiable, Initializable |                |                                     |
|                       └                        |                 <Constructor>                 |                       Public ❗️                        |       🛑       |                NO❗️                 |
|                       └                        |                  initialize                   |                      External ❗️                       |       🛑       |             initializer             |
|                       └                        |              \_authorizeUpgrade               |                      Internal 🔒                       |                |             onlyByOwner             |
|                       └                        |                  changeOwner                  |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |              setDisputeTemplate               |                      External ❗️                       |       🛑       |                NO❗️                 |
|                                                |                                               |                                                        |                |                                     |
|             **DisputeKitClassic**              |                Implementation                 |                 DisputeKitClassicBase                  |                |                                     |
|                       └                        |                 <Constructor>                 |                       Public ❗️                        |       🛑       |                NO❗️                 |
|                       └                        |                  initialize                   |                      External ❗️                       |       🛑       |             initializer             |
|                       └                        |              \_authorizeUpgrade               |                      Internal 🔒                       |                |             onlyByOwner             |
|                                                |                                               |                                                        |                |                                     |
|           **DisputeKitClassicBase**            |                Implementation                 |       IDisputeKit, Initializable, UUPSProxiable        |                |                                     |
|                       └                        |     \_\_DisputeKitClassicBase_initialize      |                      Internal 🔒                       |       🛑       |          onlyInitializing           |
|                       └                        |             executeOwnerProposal              |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |                  changeOwner                  |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |                  changeCore                   |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |            changeNextRoundSettings            |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |                 createDispute                 |                       Public ❗️                        |       🛑       |             onlyByCore              |
|                       └                        |                     draw                      |                       Public ❗️                        |       🛑       |         onlyByCore isActive         |
|                       └                        |                  castCommit                   |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                 \_castCommit                  |                      Internal 🔒                       |       🛑       |              isActive               |
|                       └                        |                   castVote                    |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                  \_castVote                   |                      Internal 🔒                       |       🛑       |              isActive               |
|                       └                        |                  fundAppeal                   |                      External ❗️                       |       💵       |              isActive               |
|                       └                        |            withdrawFeesAndRewards             |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                   hashVote                    |                       Public ❗️                        |                |                NO❗️                 |
|                       └                        |               getFundedChoices                |                       Public ❗️                        |                |                NO❗️                 |
|                       └                        |                 currentRuling                 |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |          getDegreeOfCoherenceReward           |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |          getDegreeOfCoherencePenalty          |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |            \_getDegreeOfCoherence             |                      Internal 🔒                       |                |                                     |
|                       └                        |               getCoherentCount                |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |               areCommitsAllCast               |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |                areVotesAllCast                |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |                isAppealFunded                 |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |             getNextRoundSettings              |                       Public ❗️                        |                |                NO❗️                 |
|                       └                        |                 isVoteActive                  |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |                 getRoundInfo                  |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |               getNumberOfRounds               |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |            getLocalDisputeRoundID             |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |                  getVoteInfo                  |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |         \_verifyHiddenVoteCommitments         |                      Internal 🔒                       |                |                                     |
|                       └                        |                \_postDrawCheck                |                      Internal 🔒                       |                |                                     |
|                                                |                                               |                                                        |                |                                     |
|               **IBalanceHolder**               |                   Interface                   |                                                        |                |                                     |
|                       └                        |                   balanceOf                   |                      External ❗️                       |                |                NO❗️                 |
|                                                |                                               |                                                        |                |                                     |
|           **IBalanceHolderERC1155**            |                   Interface                   |                                                        |                |                                     |
|                       └                        |                   balanceOf                   |                      External ❗️                       |                |                NO❗️                 |
|                                                |                                               |                                                        |                |                                     |
|              **DisputeKitGated**               |                Implementation                 |                 DisputeKitClassicBase                  |                |                                     |
|                       └                        |                 <Constructor>                 |                       Public ❗️                        |       🛑       |                NO❗️                 |
|                       └                        |                  initialize                   |                      External ❗️                       |       🛑       |             initializer             |
|                       └                        |              \_authorizeUpgrade               |                      Internal 🔒                       |                |             onlyByOwner             |
|                       └                        |             changeSupportedTokens             |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |                 createDispute                 |                       Public ❗️                        |       🛑       |                NO❗️                 |
|                       └                        |            \_extraDataToTokenInfo             |                      Internal 🔒                       |                |                                     |
|                       └                        |                \_postDrawCheck                |                      Internal 🔒                       |                |                                     |
|                                                |                                               |                                                        |                |                                     |
|               **IBalanceHolder**               |                   Interface                   |                                                        |                |                                     |
|                       └                        |                   balanceOf                   |                      External ❗️                       |                |                NO❗️                 |
|                                                |                                               |                                                        |                |                                     |
| **DisputeKitGatedArgentinaConsumerProtection** |                Implementation                 |                 DisputeKitClassicBase                  |                |                                     |
|                       └                        |                 <Constructor>                 |                       Public ❗️                        |       🛑       |                NO❗️                 |
|                       └                        |                  initialize                   |                      External ❗️                       |       🛑       |             initializer             |
|                       └                        |              \_authorizeUpgrade               |                      Internal 🔒                       |                |             onlyByOwner             |
|                       └                        |       changeAccreditedProfessionalToken       |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        | changeAccreditedConsumerProtectionLawyerToken |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |                     draw                      |                       Public ❗️                        |       🛑       |         onlyByCore isActive         |
|                       └                        |                \_postDrawCheck                |                      Internal 🔒                       |                |                                     |
|                                                |                                               |                                                        |                |                                     |
|               **IBalanceHolder**               |                   Interface                   |                                                        |                |                                     |
|                       └                        |                   balanceOf                   |                      External ❗️                       |                |                NO❗️                 |
|                                                |                                               |                                                        |                |                                     |
|           **IBalanceHolderERC1155**            |                   Interface                   |                                                        |                |                                     |
|                       └                        |                   balanceOf                   |                      External ❗️                       |                |                NO❗️                 |
|                                                |                                               |                                                        |                |                                     |
|           **DisputeKitGatedShutter**           |                Implementation                 |                 DisputeKitClassicBase                  |                |                                     |
|                       └                        |                 <Constructor>                 |                       Public ❗️                        |       🛑       |                NO❗️                 |
|                       └                        |                  initialize                   |                      External ❗️                       |       🛑       |             initializer             |
|                       └                        |              \_authorizeUpgrade               |                      Internal 🔒                       |                |             onlyByOwner             |
|                       └                        |             changeSupportedTokens             |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |                 createDispute                 |                       Public ❗️                        |       🛑       |                NO❗️                 |
|                       └                        |               castCommitShutter               |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                castVoteShutter                |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |               hashJustification               |                       Public ❗️                        |                |                NO❗️                 |
|                       └                        |         \_verifyHiddenVoteCommitments         |                      Internal 🔒                       |                |                                     |
|                       └                        |            \_extraDataToTokenInfo             |                      Internal 🔒                       |                |                                     |
|                       └                        |                \_postDrawCheck                |                      Internal 🔒                       |                |                                     |
|                                                |                                               |                                                        |                |                                     |
|             **DisputeKitShutter**              |                Implementation                 |                 DisputeKitClassicBase                  |                |                                     |
|                       └                        |                 <Constructor>                 |                       Public ❗️                        |       🛑       |                NO❗️                 |
|                       └                        |                  initialize                   |                      External ❗️                       |       🛑       |             initializer             |
|                       └                        |              \_authorizeUpgrade               |                      Internal 🔒                       |                |             onlyByOwner             |
|                       └                        |               castCommitShutter               |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                castVoteShutter                |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |               hashJustification               |                       Public ❗️                        |                |                NO❗️                 |
|                       └                        |         \_verifyHiddenVoteCommitments         |                      Internal 🔒                       |                |                                     |
|                                                |                                               |                                                        |                |                                     |
|              **IProofOfHumanity**              |                   Interface                   |                                                        |                |                                     |
|                       └                        |                 isRegistered                  |                      External ❗️                       |                |                NO❗️                 |
|                                                |                                               |                                                        |                |                                     |
|          **DisputeKitSybilResistant**          |                Implementation                 |                 DisputeKitClassicBase                  |                |                                     |
|                       └                        |                 <Constructor>                 |                       Public ❗️                        |       🛑       |                NO❗️                 |
|                       └                        |                  initialize                   |                      External ❗️                       |       🛑       |             initializer             |
|                       └                        |              \_authorizeUpgrade               |                      Internal 🔒                       |                |             onlyByOwner             |
|                       └                        |                \_postDrawCheck                |                      Internal 🔒                       |                |                                     |
|                                                |                                               |                                                        |                |                                     |
|               **EvidenceModule**               |                Implementation                 |        IEvidence, Initializable, UUPSProxiable         |                |                                     |
|                       └                        |                 <Constructor>                 |                       Public ❗️                        |       🛑       |                NO❗️                 |
|                       └                        |                  initialize                   |                      External ❗️                       |       🛑       |             initializer             |
|                       └                        |              \_authorizeUpgrade               |                      Internal 🔒                       |                |             onlyByOwner             |
|                       └                        |                submitEvidence                 |                      External ❗️                       |       🛑       |                NO❗️                 |
|                                                |                                               |                                                        |                |                                     |
|               **IArbitrableV2**                |                   Interface                   |                                                        |                |                                     |
|                       └                        |                     rule                      |                      External ❗️                       |       🛑       |                NO❗️                 |
|                                                |                                               |                                                        |                |                                     |
|               **IArbitratorV2**                |                   Interface                   |                                                        |                |                                     |
|                       └                        |                 createDispute                 |                      External ❗️                       |       💵       |                NO❗️                 |
|                       └                        |                 createDispute                 |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                arbitrationCost                |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |                arbitrationCost                |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |                 currentRuling                 |                      External ❗️                       |                |                NO❗️                 |
|                                                |                                               |                                                        |                |                                     |
|                **IDisputeKit**                 |                   Interface                   |                                                        |                |                                     |
|                       └                        |                 createDispute                 |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                     draw                      |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                 currentRuling                 |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |          getDegreeOfCoherenceReward           |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |          getDegreeOfCoherencePenalty          |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |               getCoherentCount                |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |               areCommitsAllCast               |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |                areVotesAllCast                |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |                isAppealFunded                 |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |             getNextRoundSettings              |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |                 isVoteActive                  |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |                 getRoundInfo                  |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |                  getVoteInfo                  |                      External ❗️                       |                |                NO❗️                 |
|                                                |                                               |                                                        |                |                                     |
|          **IDisputeTemplateRegistry**          |                   Interface                   |                                                        |                |                                     |
|                       └                        |              setDisputeTemplate               |                      External ❗️                       |       🛑       |                NO❗️                 |
|                                                |                                               |                                                        |                |                                     |
|                 **IEvidence**                  |                   Interface                   |                                                        |                |                                     |
|                                                |                                               |                                                        |                |                                     |
|              **ISortitionModule**              |                   Interface                   |                                                        |                |                                     |
|                       └                        |                   passPhase                   |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |             executeDelayedStakes              |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                  createTree                   |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                 validateStake                 |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                   setStake                    |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                setStakePenalty                |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                setStakeReward                 |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |            forcedUnstakeAllCourts             |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                 forcedUnstake                 |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                   lockStake                   |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                  unlockStake                  |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |               createDisputeHook               |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                 postDrawHook                  |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |              withdrawLeftoverPNK              |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                     draw                      |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |                getJurorBalance                |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |               getJurorCourtIDs                |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |                 isJurorStaked                 |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |              getJurorLeftoverPNK              |                      External ❗️                       |                |                NO❗️                 |
|                                                |                                               |                                                        |                |                                     |
|               **SortitionTrees**               |                    Library                    |                                                        |                |                                     |
|                       └                        |                   toTreeKey                   |                      Internal 🔒                       |                |                                     |
|                       └                        |                  createTree                   |                      Internal 🔒                       |       🛑       |                                     |
|                       └                        |                     draw                      |                      Internal 🔒                       |                |                                     |
|                       └                        |                      set                      |                      Internal 🔒                       |       🛑       |                                     |
|                       └                        |                 updateParents                 |                       Private 🔐                       |       🛑       |                                     |
|                       └                        |                    stakeOf                    |                      Internal 🔒                       |                |                                     |
|                       └                        |                 toStakePathID                 |                      Internal 🔒                       |                |                                     |
|                       └                        |              toAccountAndCourtID              |                      Internal 🔒                       |                |                                     |
|                                                |                                               |                                                        |                |                                     |
|                 **SafeERC20**                  |                    Library                    |                                                        |                |                                     |
|                       └                        |               increaseAllowance               |                      Internal 🔒                       |       🛑       |                                     |
|                       └                        |                 safeTransfer                  |                      Internal 🔒                       |       🛑       |                                     |
|                       └                        |               safeTransferFrom                |                      Internal 🔒                       |       🛑       |                                     |
|                                                |                                               |                                                        |                |                                     |
|                  **WethLike**                  |                   Interface                   |                                                        |                |                                     |
|                       └                        |                    deposit                    |                      External ❗️                       |       💵       |                NO❗️                 |
|                       └                        |                   transfer                    |                      External ❗️                       |       🛑       |                NO❗️                 |
|                                                |                                               |                                                        |                |                                     |
|                  **SafeSend**                  |                    Library                    |                                                        |                |                                     |
|                       └                        |                   safeSend                    |                      Internal 🔒                       |       🛑       |                                     |
|                                                |                                               |                                                        |                |                                     |
|              **RNGWithFallback**               |                Implementation                 |                          IRNG                          |                |                                     |
|                       └                        |                 <Constructor>                 |                       Public ❗️                        |       🛑       |                NO❗️                 |
|                       └                        |                  changeOwner                  |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |                changeConsumer                 |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |             changeFallbackTimeout             |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |               requestRandomness               |                      External ❗️                       |       🛑       |           onlyByConsumer            |
|                       └                        |               receiveRandomness               |                      External ❗️                       |       🛑       |           onlyByConsumer            |
|                                                |                                               |                                                        |                |                                     |
|                **ChainlinkRNG**                |                Implementation                 |              IRNG, VRFConsumerBaseV2Plus               |                |                                     |
|                       └                        |                 <Constructor>                 |                       Public ❗️                        |       🛑       |        VRFConsumerBaseV2Plus        |
|                       └                        |                  changeOwner                  |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |                changeConsumer                 |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |             changeVrfCoordinator              |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |                 changeKeyHash                 |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |             changeSubscriptionId              |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |          changeRequestConfirmations           |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |            changeCallbackGasLimit             |                      External ❗️                       |       🛑       |             onlyByOwner             |
|                       └                        |               requestRandomness               |                      External ❗️                       |       🛑       |           onlyByConsumer            |
|                       └                        |              fulfillRandomWords               |                      Internal 🔒                       |       🛑       |                                     |
|                       └                        |               receiveRandomness               |                      External ❗️                       |                |                NO❗️                 |
|                                                |                                               |                                                        |                |                                     |
|           **VRFConsumerBaseV2Plus**            |                Implementation                 |              IVRFMigratableConsumerV2Plus              |                |                                     |
|                       └                        |                 <Constructor>                 |                       Public ❗️                        |       🛑       |                NO❗️                 |
|                       └                        |              fulfillRandomWords               |                      Internal 🔒                       |       🛑       |                                     |
|                       └                        |             rawFulfillRandomWords             |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |                setCoordinator                 |                      External ❗️                       |       🛑       |       onlyOwnerOrCoordinator        |
|                                                |                                               |                                                        |                |                                     |
|                    **IRNG**                    |                   Interface                   |                                                        |                |                                     |
|                       └                        |               requestRandomness               |                      External ❗️                       |       🛑       |                NO❗️                 |
|                       └                        |               receiveRandomness               |                      External ❗️                       |       🛑       |                NO❗️                 |
|                                                |                                               |                                                        |                |                                     |
|               **UUPSProxiable**                |                Implementation                 |                                                        |                |                                     |
|                       └                        |              \_authorizeUpgrade               |                      Internal 🔒                       |       🛑       |                                     |
|                       └                        |               upgradeToAndCall                |                       Public ❗️                        |       💵       |                NO❗️                 |
|                       └                        |                 proxiableUUID                 |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |                    version                    |                      External ❗️                       |                |                NO❗️                 |
|                       └                        |              \_getImplementation              |                      Internal 🔒                       |                |                                     |
|                                                |                                               |                                                        |                |                                     |
|                 **UUPSProxy**                  |                Implementation                 |                                                        |                |                                     |
|                       └                        |                 <Constructor>                 |                       Public ❗️                        |       🛑       |                NO❗️                 |
|                       └                        |                  \_delegate                   |                      Internal 🔒                       |       🛑       |                                     |
|                       └                        |              \_getImplementation              |                      Internal 🔒                       |                |                                     |
|                       └                        |                  <Fallback>                   |                      External ❗️                       |       💵       |                NO❗️                 |
|                       └                        |                <Receive Ether>                |                      External ❗️                       |       💵       |                NO❗️                 |
|                                                |                                               |                                                        |                |                                     |
|               **Initializable**                |                Implementation                 |                                                        |                |                                     |
|                       └                        |              \_checkInitializing              |                      Internal 🔒                       |                |                                     |
|                       └                        |             \_disableInitializers             |                      Internal 🔒                       |       🛑       |                                     |
|                       └                        |            \_getInitializedVersion            |                      Internal 🔒                       |                |                                     |
|                       └                        |               \_isInitializing                |                      Internal 🔒                       |                |                                     |
|                       └                        |           \_getInitializableStorage           |                       Private 🔐                       |                |                                     |

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
