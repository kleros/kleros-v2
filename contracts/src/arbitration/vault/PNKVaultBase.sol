// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import {IPNKVault} from "../interfaces/IPNKVault.sol";
import {stPNK} from "../stPNK.sol";
import {Initializable} from "../../proxy/Initializable.sol";
import {UUPSProxiable} from "../../proxy/UUPSProxiable.sol";
import {SafeERC20, IERC20} from "../../libraries/SafeERC20.sol";

/// @title PNKVaultBase
/// @notice Abstract base contract for PNK vault that handles deposits, withdrawals, locks, and penalties
/// @dev Follows the same pattern as KlerosCoreBase for upgradeable contracts
abstract contract PNKVaultBase is IPNKVault, Initializable, UUPSProxiable {
    using SafeERC20 for IERC20;

    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct JurorBalance {
        uint256 deposited; // Total PNK deposited
        uint256 locked; // PNK locked in disputes
        uint256 penalties; // Accumulated penalties
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public governor; // The governor of the contract.
    IERC20 public pnk; // The PNK token contract.
    stPNK public stPnkToken; // The stPNK token contract.
    address public stakeController; // The stake controller authorized to lock/unlock/penalize.
    address public core; // The KlerosCore authorized to transfer rewards.

    mapping(address => JurorBalance) public jurorBalances; // Juror balance tracking.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    // Events are defined in IPNKVault interface

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        if (governor != msg.sender) revert GovernorOnly();
        _;
    }

    modifier onlyStakeController() {
        if (msg.sender != stakeController) revert OnlyStakeController();
        _;
    }

    modifier onlyCore() {
        if (msg.sender != core) revert OnlyCore();
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    function __PNKVaultBase_initialize(
        address _governor,
        IERC20 _pnk,
        address _stakeController,
        address _core
    ) internal onlyInitializing {
        governor = _governor;
        pnk = _pnk;
        stakeController = _stakeController;
        core = _core;

        // Deploy stPNK token
        stPnkToken = new stPNK(address(this));

        // Add stakeController and core as protocol contracts in stPNK
        address[] memory contracts = new address[](2);
        bool[] memory allowed = new bool[](2);
        contracts[0] = _stakeController;
        contracts[1] = _core;
        allowed[0] = true;
        allowed[1] = true;
        stPnkToken.setProtocolContracts(contracts, allowed);
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Changes the `governor` storage variable.
    /// @param _governor The new value for the `governor` storage variable.
    function changeGovernor(address _governor) external onlyByGovernor {
        governor = _governor;
    }

    /// @dev Changes the `stakeController` storage variable.
    /// @param _stakeController The new value for the `stakeController` storage variable.
    function changeStakeController(address _stakeController) external onlyByGovernor {
        stakeController = _stakeController;
        address[] memory contracts = new address[](1);
        bool[] memory allowed = new bool[](1);
        contracts[0] = _stakeController;
        allowed[0] = true;
        stPnkToken.setProtocolContracts(contracts, allowed);
    }

    /// @dev Changes the `core` storage variable.
    /// @param _core The new value for the `core` storage variable.
    function changeCore(address _core) external onlyByGovernor {
        core = _core;
        address[] memory contracts = new address[](1);
        bool[] memory allowed = new bool[](1);
        contracts[0] = _core;
        allowed[0] = true;
        stPnkToken.setProtocolContracts(contracts, allowed);
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @inheritdoc IPNKVault
    function deposit(uint256 _amount) external virtual override returns (uint256 stPnkAmount) {
        if (_amount == 0) revert InvalidAmount();

        pnk.safeTransferFrom(msg.sender, address(this), _amount);
        jurorBalances[msg.sender].deposited += _amount;

        // Mint 1:1 stPNK
        stPnkAmount = _amount;
        stPnkToken.mint(msg.sender, stPnkAmount);

        emit Deposit(msg.sender, _amount);
    }

    /// @inheritdoc IPNKVault
    function withdraw(uint256 _amount) external virtual override returns (uint256 pnkAmount) {
        if (_amount == 0) revert InvalidAmount();

        JurorBalance storage balance = jurorBalances[msg.sender];

        // Check available balance (deposited - locked - penalties)
        uint256 available = getAvailableBalance(msg.sender);
        if (_amount > available) revert InsufficientAvailableBalance();

        // Check stPNK balance
        if (stPnkToken.balanceOf(msg.sender) < _amount) revert InsufficientStPNKBalance();

        // Burn stPNK and transfer PNK
        stPnkToken.burnFrom(msg.sender, _amount);
        balance.deposited -= _amount;
        pnk.safeTransfer(msg.sender, _amount);

        emit Withdraw(msg.sender, _amount);
        return _amount;
    }

    /// @inheritdoc IPNKVault
    function lockTokens(address _account, uint256 _amount) external virtual override onlyStakeController {
        jurorBalances[_account].locked += _amount;
        emit Lock(_account, _amount);
    }

    /// @inheritdoc IPNKVault
    function unlockTokens(address _account, uint256 _amount) external virtual override onlyStakeController {
        jurorBalances[_account].locked -= _amount;
        emit Unlock(_account, _amount);
    }

    /// @inheritdoc IPNKVault
    function applyPenalty(
        address _account,
        uint256 _amount
    ) external virtual override onlyStakeController returns (uint256 actualPenalty) {
        JurorBalance storage balance = jurorBalances[_account];

        // Calculate actual penalty (cannot exceed deposited amount)
        actualPenalty = _amount > balance.deposited ? balance.deposited : _amount;

        // Update balances
        balance.deposited -= actualPenalty;
        balance.penalties += actualPenalty;

        // Burn equivalent stPNK if user still holds it
        uint256 userStPnkBalance = stPnkToken.balanceOf(_account);
        uint256 toBurn = actualPenalty > userStPnkBalance ? userStPnkBalance : actualPenalty;
        if (toBurn > 0) {
            stPnkToken.burnFrom(_account, toBurn);
        }

        // Note: Penalized PNK stays in vault to fund rewards pool
        emit Penalty(_account, actualPenalty);
    }

    /// @inheritdoc IPNKVault
    function transferReward(address _account, uint256 _amount) external virtual override onlyCore {
        if (pnk.balanceOf(address(this)) < _amount) revert InsufficientVaultBalance();
        pnk.safeTransfer(_account, _amount);
        emit RewardTransferred(_account, _amount);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @inheritdoc IPNKVault
    function getAvailableBalance(address _account) public view override returns (uint256) {
        JurorBalance storage balance = jurorBalances[_account];
        uint256 locked = balance.locked + balance.penalties;
        return balance.deposited > locked ? balance.deposited - locked : 0;
    }

    /// @inheritdoc IPNKVault
    function getDepositedBalance(address _account) external view override returns (uint256) {
        return jurorBalances[_account].deposited;
    }

    /// @inheritdoc IPNKVault
    function getLockedBalance(address _account) external view override returns (uint256) {
        return jurorBalances[_account].locked;
    }

    /// @inheritdoc IPNKVault
    function getStPNKBalance(address _account) external view override returns (uint256) {
        return stPnkToken.balanceOf(_account);
    }

    /// @inheritdoc IPNKVault
    function getPenaltyBalance(address _account) external view override returns (uint256) {
        return jurorBalances[_account].penalties;
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error GovernorOnly();
    error OnlyStakeController();
    error OnlyCore();
    error InvalidAmount();
    error InsufficientAvailableBalance();
    error InsufficientStPNKBalance();
    error InsufficientVaultBalance();
}
