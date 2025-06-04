// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title IVault
/// @notice Interface for the PNK Vault that handles PNK deposits, withdrawals, locks, and penalties
interface IVault {
    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event Deposit(address indexed account, uint256 amount);
    event Withdraw(address indexed account, uint256 amount);
    event Lock(address indexed account, uint256 amount);
    event Unlock(address indexed account, uint256 amount);
    event Penalty(address indexed account, uint256 amount);
    event RewardTransferred(address indexed account, uint256 amount);

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Deposit PNK and mint stPNK
    /// @param _amount The amount of PNK to deposit
    /// @return stPnkAmount The amount of stPNK minted
    function deposit(uint256 _amount) external returns (uint256 stPnkAmount);

    /// @notice Withdraw PNK by burning stPNK
    /// @param _amount The amount to withdraw
    /// @return pnkAmount The amount of PNK withdrawn
    function withdraw(uint256 _amount) external returns (uint256 pnkAmount);

    /// @notice Lock tokens for dispute participation (only StakeController)
    /// @param _account The account to lock tokens for
    /// @param _amount The amount to lock
    function lockTokens(address _account, uint256 _amount) external;

    /// @notice Unlock tokens after dispute resolution (only StakeController)
    /// @param _account The account to unlock tokens for
    /// @param _amount The amount to unlock
    function unlockTokens(address _account, uint256 _amount) external;

    /// @notice Apply penalty by reducing deposited balance (only StakeController)
    /// @param _account The account to penalize
    /// @param _amount The penalty amount
    /// @return actualPenalty The actual penalty applied
    function applyPenalty(address _account, uint256 _amount) external returns (uint256 actualPenalty);

    /// @notice Transfer PNK rewards directly to account (only KlerosCore)
    /// @param _account The account to receive rewards
    /// @param _amount The reward amount
    function transferReward(address _account, uint256 _amount) external;

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Get available balance for withdrawal
    /// @param _account The account to check
    /// @return The available balance
    function getAvailableBalance(address _account) external view returns (uint256);

    /// @notice Get total deposited balance
    /// @param _account The account to check
    /// @return The deposited balance
    function getDepositedBalance(address _account) external view returns (uint256);

    /// @notice Get locked balance
    /// @param _account The account to check
    /// @return The locked balance
    function getLockedBalance(address _account) external view returns (uint256);

    /// @notice Get stPNK balance (same as deposited - penalties)
    /// @param _account The account to check
    /// @return The stPNK balance
    function getStPNKBalance(address _account) external view returns (uint256);

    /// @notice Get penalty balance
    /// @param _account The account to check
    /// @return The penalty balance
    function getPenaltyBalance(address _account) external view returns (uint256);
}
