// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import {KlerosCoreBase, IDisputeKit, ISortitionModule, IERC20, OnError, StakingResult} from "./KlerosCoreBase.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @title KlerosCoreNeo
/// Core arbitrator contract for Kleros v2.
/// Note that this contract trusts the PNK token, the dispute kit and the sortition module contracts.
contract KlerosCoreNeo is KlerosCoreBase {
    string public constant override version = "0.9.4";

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    mapping(address => bool) public arbitrableWhitelist; // Arbitrable whitelist.
    IERC721 public jurorNft; // Eligible jurors NFT.

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @dev Initializer (constructor equivalent for upgradable contracts).
    /// @param _governor The governor's address.
    /// @param _guardian The guardian's address.
    /// @param _pinakion The address of the token contract.
    /// @param _jurorProsecutionModule The address of the juror prosecution module.
    /// @param _disputeKit The address of the default dispute kit.
    /// @param _hiddenVotes The `hiddenVotes` property value of the general court.
    /// @param _courtParameters Numeric parameters of General court (minStake, alpha, feeForJuror and jurorsForCourtJump respectively).
    /// @param _timesPerPeriod The `timesPerPeriod` property value of the general court.
    /// @param _sortitionExtraData The extra data for sortition module.
    /// @param _sortitionModuleAddress The sortition module responsible for sortition of the jurors.
    /// @param _jurorNft NFT contract to vet the jurors.
    function initialize(
        address _governor,
        address _guardian,
        IERC20 _pinakion,
        address _jurorProsecutionModule,
        IDisputeKit _disputeKit,
        bool _hiddenVotes,
        uint256[4] memory _courtParameters,
        uint256[4] memory _timesPerPeriod,
        bytes memory _sortitionExtraData,
        ISortitionModule _sortitionModuleAddress,
        IERC721 _jurorNft
    ) external reinitializer(2) {
        __KlerosCoreBase_initialize(
            _governor,
            _guardian,
            _pinakion,
            _jurorProsecutionModule,
            _disputeKit,
            _hiddenVotes,
            _courtParameters,
            _timesPerPeriod,
            _sortitionExtraData,
            _sortitionModuleAddress
        );
        jurorNft = _jurorNft;
    }

    function initialize5() external reinitializer(5) {
        // NOP
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the governor can perform upgrades (`onlyByGovernor`)
    function _authorizeUpgrade(address) internal view override onlyByGovernor {
        // NOP
    }

    /// @dev Changes the `jurorNft` storage variable.
    /// @param _jurorNft The new value for the `jurorNft` storage variable.
    function changeJurorNft(IERC721 _jurorNft) external onlyByGovernor {
        jurorNft = _jurorNft;
    }

    /// @dev Adds or removes an arbitrable from whitelist.
    /// @param _arbitrable Arbitrable address.
    /// @param _allowed Whether add or remove permission.
    function changeArbitrableWhitelist(address _arbitrable, bool _allowed) external onlyByGovernor {
        arbitrableWhitelist[_arbitrable] = _allowed;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @dev Sets the caller's stake in a court.
    /// Note: Staking and unstaking is forbidden during pause.
    /// @param _courtID The ID of the court.
    /// @param _newStake The new stake.
    /// Note that the existing delayed stake will be nullified as non-relevant.
    function setStake(uint96 _courtID, uint256 _newStake) external override whenNotPaused {
        if (jurorNft.balanceOf(msg.sender) == 0) revert NotEligibleForStaking();
        super._setStake(msg.sender, _courtID, _newStake, false, OnError.Revert);
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    function _createDispute(
        uint256 _numberOfChoices,
        bytes memory _extraData,
        IERC20 _feeToken,
        uint256 _feeAmount
    ) internal override returns (uint256 disputeID) {
        if (!arbitrableWhitelist[msg.sender]) revert ArbitrableNotWhitelisted();
        return super._createDispute(_numberOfChoices, _extraData, _feeToken, _feeAmount);
    }

    function _stakingFailed(OnError _onError, StakingResult _result) internal pure override {
        super._stakingFailed(_onError, _result);
        if (_result == StakingResult.CannotStakeMoreThanMaxStakePerJuror) revert StakingMoreThanMaxStakePerJuror();
        if (_result == StakingResult.CannotStakeMoreThanMaxTotalStaked) revert StakingMoreThanMaxTotalStaked();
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error NotEligibleForStaking();
    error StakingMoreThanMaxStakePerJuror();
    error StakingMoreThanMaxTotalStaked();
    error ArbitrableNotWhitelisted();
}
