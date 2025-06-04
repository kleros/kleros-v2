// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import {PNKVaultBase, IERC20} from "./PNKVaultBase.sol";
import {SafeERC20} from "../../libraries/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @title PNKVaultNeo
/// @notice Enhanced PNK Vault with additional features like NFT-gated deposits
/// @dev Follows the same pattern as KlerosCoreNeo for upgradeable contracts
contract PNKVaultNeo is PNKVaultBase {
    using SafeERC20 for IERC20;

    string public constant override version = "1.0.0";

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    IERC721 public depositNft; // NFT required to deposit (optional)
    uint256 public maxDepositPerUser; // Maximum deposit per user (0 = unlimited)
    uint256 public totalDepositCap; // Total deposit cap across all users (0 = unlimited)
    uint256 public totalDeposited; // Total amount deposited across all users

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event DepositNftChanged(IERC721 indexed oldNft, IERC721 indexed newNft);
    event MaxDepositPerUserChanged(uint256 oldMax, uint256 newMax);
    event TotalDepositCapChanged(uint256 oldCap, uint256 newCap);

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @dev Initializer (constructor equivalent for upgradable contracts).
    /// @param _governor The governor's address.
    /// @param _pnk The address of the PNK token contract.
    /// @param _stakeController The address of the stake controller.
    /// @param _core The address of the KlerosCore contract.
    /// @param _depositNft The NFT contract for deposit gating (optional, can be zero address).
    /// @param _maxDepositPerUser Maximum deposit per user (0 = unlimited).
    /// @param _totalDepositCap Total deposit cap (0 = unlimited).
    function initialize(
        address _governor,
        IERC20 _pnk,
        address _stakeController,
        address _core,
        IERC721 _depositNft,
        uint256 _maxDepositPerUser,
        uint256 _totalDepositCap
    ) external reinitializer(2) {
        __PNKVaultBase_initialize(_governor, _pnk, _stakeController, _core);

        depositNft = _depositNft;
        maxDepositPerUser = _maxDepositPerUser;
        totalDepositCap = _totalDepositCap;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the governor can perform upgrades (`onlyByGovernor`)
    function _authorizeUpgrade(address) internal view override onlyByGovernor {
        // NOP
    }

    /// @dev Changes the `depositNft` storage variable.
    /// @param _depositNft The new NFT contract for deposit gating.
    function changeDepositNft(IERC721 _depositNft) external onlyByGovernor {
        emit DepositNftChanged(depositNft, _depositNft);
        depositNft = _depositNft;
    }

    /// @dev Changes the `maxDepositPerUser` storage variable.
    /// @param _maxDepositPerUser The new maximum deposit per user.
    function changeMaxDepositPerUser(uint256 _maxDepositPerUser) external onlyByGovernor {
        emit MaxDepositPerUserChanged(maxDepositPerUser, _maxDepositPerUser);
        maxDepositPerUser = _maxDepositPerUser;
    }

    /// @dev Changes the `totalDepositCap` storage variable.
    /// @param _totalDepositCap The new total deposit cap.
    function changeTotalDepositCap(uint256 _totalDepositCap) external onlyByGovernor {
        emit TotalDepositCapChanged(totalDepositCap, _totalDepositCap);
        totalDepositCap = _totalDepositCap;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Deposit PNK and mint stPNK with additional validation checks
    function deposit(uint256 _amount) external override returns (uint256 stPnkAmount) {
        // Check NFT requirement if set
        if (address(depositNft) != address(0) && depositNft.balanceOf(msg.sender) == 0) {
            revert DepositNftRequired();
        }

        // Check per-user deposit limit
        if (maxDepositPerUser > 0) {
            uint256 currentUserDeposit = jurorBalances[msg.sender].deposited;
            if (currentUserDeposit + _amount > maxDepositPerUser) {
                revert ExceedsMaxDepositPerUser();
            }
        }

        // Check total deposit cap
        if (totalDepositCap > 0 && totalDeposited + _amount > totalDepositCap) {
            revert ExceedsTotalDepositCap();
        }

        // Update total deposited
        totalDeposited += _amount;

        // Execute deposit logic
        if (_amount == 0) revert InvalidAmount();

        pnk.safeTransferFrom(msg.sender, address(this), _amount);
        jurorBalances[msg.sender].deposited += _amount;

        // Mint 1:1 stPNK
        stPnkAmount = _amount;
        stPnkToken.mint(msg.sender, stPnkAmount);

        emit Deposit(msg.sender, _amount);
        return stPnkAmount;
    }

    /// @notice Withdraw PNK by burning stPNK and update total deposited
    function withdraw(uint256 _amount) external override returns (uint256 pnkAmount) {
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

        // Update total deposited
        totalDeposited -= _amount;

        emit Withdraw(msg.sender, _amount);
        return _amount;
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Check if an account is eligible to deposit
    /// @param _account The account to check
    /// @param _amount The amount they want to deposit
    /// @return eligible Whether they can deposit
    /// @return reason Reason for ineligibility (empty if eligible)
    function checkDepositEligibility(
        address _account,
        uint256 _amount
    ) external view returns (bool eligible, string memory reason) {
        // Check NFT requirement
        if (address(depositNft) != address(0) && depositNft.balanceOf(_account) == 0) {
            return (false, "NFT required for deposit");
        }

        // Check per-user limit
        if (maxDepositPerUser > 0) {
            uint256 currentUserDeposit = jurorBalances[_account].deposited;
            if (currentUserDeposit + _amount > maxDepositPerUser) {
                return (false, "Exceeds max deposit per user");
            }
        }

        // Check total cap
        if (totalDepositCap > 0 && totalDeposited + _amount > totalDepositCap) {
            return (false, "Exceeds total deposit cap");
        }

        return (true, "");
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error DepositNftRequired();
    error ExceedsMaxDepositPerUser();
    error ExceedsTotalDepositCap();
}
