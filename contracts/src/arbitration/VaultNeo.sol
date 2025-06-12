// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import {VaultBase, IERC20} from "./VaultBase.sol";
import {SafeERC20} from "../libraries/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @title VaultNeo
/// @notice Enhanced PNK Vault with additional features like NFT-gated deposits
contract VaultNeo is VaultBase {
    using SafeERC20 for IERC20;

    string public constant override version = "0.1.0";

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
        __VaultBase_initialize(_governor, _pnk, _stakeController, _core);

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

    /// @inheritdoc VaultBase
    function _deposit(address _from, uint256 _amount) internal override {
        // Check NFT requirement if set
        if (address(depositNft) != address(0) && depositNft.balanceOf(_from) == 0) {
            revert NotEligible();
        }

        // Check per-user deposit limit
        if (maxDepositPerUser > 0) {
            uint256 currentUserDeposit = jurorBalances[_from].deposited;
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

        super._deposit(_from, _amount);
    }

    /// @inheritdoc VaultBase
    function _withdraw(address _to, uint256 _amount) internal override returns (uint256 pnkAmount) {
        totalDeposited -= _amount;
        return super._withdraw(_to, _amount);
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error NotEligible();
    error ExceedsMaxDepositPerUser();
    error ExceedsTotalDepositCap();
}
