// SPDX-License-Identifier: MIT

/**
 *  @custom:authors: [@epiqueras, @unknownunknown1, @jaybuidl, @shotaronowhere]
 *  @custom:reviewers: []
 *  @custom:auditors: []
 *  @custom:bounties: []
 *  @custom:deployments: []
 */

pragma solidity 0.8.24;

import "./KlerosCoreUniversity.sol";
import "./ISortitionModuleUniversity.sol";
import "../interfaces/IDisputeKit.sol";
import "../../proxy/UUPSProxiable.sol";
import "../../proxy/Initializable.sol";
import "../../libraries/Constants.sol";

/// @title SortitionModuleUniversity
/// @dev An adapted version of the SortitionModule contract for educational purposes.
contract SortitionModuleUniversity is ISortitionModuleUniversity, UUPSProxiable, Initializable {
    string public constant override version = "0.8.0";

    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct Juror {
        mapping(uint96 => uint256) stakesByCourtID; // The stakes of the juror in particular courts.
        uint96[] courtIDs; // The IDs of courts where the juror's stake path ends. A stake path is a path from the general court to a court the juror directly staked in using `_setStake`.
        uint256 stakedPnk; // The juror's total amount of tokens staked in subcourts. Reflects actual pnk balance.
        uint256 lockedPnk; // The juror's total amount of tokens locked in disputes. Can reflect actual pnk balance when stakedPnk are fully withdrawn.
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public governor; // The governor of the contract.
    KlerosCoreUniversity public core; // The core arbitrator contract.
    uint256 public disputesWithoutJurors; // The number of disputes that have not finished drawing jurors.
    mapping(address account => Juror) public jurors; // The jurors.
    address private transientJuror; // The juror address used between calls within the same transaction.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice Emitted when a juror stakes in a court.
    /// @param _address The address of the juror.
    /// @param _courtID The ID of the court.
    /// @param _amount The amount of tokens staked in the court.
    /// @param _amountAllCourts The amount of tokens staked in all courts.
    event StakeSet(address indexed _address, uint256 _courtID, uint256 _amount, uint256 _amountAllCourts);

    /// @notice Emitted when a juror's stake is locked.
    /// @param _address The address of the juror.
    /// @param _relativeAmount The amount of tokens locked.
    /// @param _unlock Whether the stake is locked or unlocked.
    event StakeLocked(address indexed _address, uint256 _relativeAmount, bool _unlock);

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        require(address(governor) == msg.sender, "Access not allowed: Governor only.");
        _;
    }

    modifier onlyByCore() {
        require(address(core) == msg.sender, "Access not allowed: KlerosCore only.");
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @dev Initializer (constructor equivalent for upgradable contracts).
    /// @param _core The KlerosCore.
    function initialize(address _governor, KlerosCoreUniversity _core) external reinitializer(1) {
        governor = _governor;
        core = _core;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /**
     * @dev Access Control to perform implementation upgrades (UUPS Proxiable)
     * @dev Only the governor can perform upgrades (`onlyByGovernor`)
     */
    function _authorizeUpgrade(address) internal view override onlyByGovernor {
        // NOP
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    function setTransientJuror(address _juror) external override onlyByCore {
        transientJuror = _juror;
    }

    function createTree(bytes32 _key, bytes memory _extraData) external {
        // NOP
    }

    function createDisputeHook(uint256 /*_disputeID*/, uint256 /*_roundID*/) external override onlyByCore {
        disputesWithoutJurors++;
    }

    function postDrawHook(uint256 /*_disputeID*/, uint256 /*_roundID*/) external override onlyByCore {
        disputesWithoutJurors--;
    }

    /// @dev Saves the random number to use it in sortition. Not used by this contract because the storing of the number is inlined in passPhase().
    /// @param _randomNumber Random number returned by RNG contract.
    function notifyRandomNumber(uint256 _randomNumber) public override {}

    /// @dev Sets the specified juror's stake in a court.
    /// `O(n + p * log_k(j))` where
    /// `n` is the number of courts the juror has staked in,
    /// `p` is the depth of the court tree,
    /// `k` is the minimum number of children per node of one of these courts' sortition sum tree,
    /// and `j` is the maximum number of jurors that ever staked in one of these courts simultaneously.
    /// @param _account The address of the juror.
    /// @param _courtID The ID of the court.
    /// @param _newStake The new stake.
    /// @return pnkDeposit The amount of PNK to be deposited.
    /// @return pnkWithdrawal The amount of PNK to be withdrawn.
    /// @return stakingResult The result of the staking operation.
    function setStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake
    ) external override onlyByCore returns (uint256 pnkDeposit, uint256 pnkWithdrawal, StakingResult stakingResult) {
        Juror storage juror = jurors[_account];
        uint256 currentStake = _stakeOf(_account, _courtID);

        uint256 nbCourts = juror.courtIDs.length;
        if (_newStake == 0 && (nbCourts >= MAX_STAKE_PATHS || currentStake == 0)) {
            return (0, 0, StakingResult.CannotStakeInMoreCourts); // Prevent staking beyond MAX_STAKE_PATHS but unstaking is always allowed.
        }

        if (_newStake >= currentStake) {
            pnkDeposit = _increaseStake(juror, _courtID, _newStake, currentStake);
        } else {
            pnkWithdrawal = _decreaseStake(juror, _courtID, _newStake, currentStake);
        }

        bool finished = false;
        uint96 currentCourtID = _courtID;
        while (!finished) {
            // Tokens are also implicitly staked in parent courts through sortition module to increase the chance of being drawn.
            juror.stakesByCourtID[currentCourtID] += _newStake;
            juror.stakesByCourtID[currentCourtID] -= currentStake;
            if (currentCourtID == GENERAL_COURT) {
                finished = true;
            } else {
                (currentCourtID, , , , , , ) = core.courts(currentCourtID);
            }
        }
        emit StakeSet(_account, _courtID, _newStake, juror.stakedPnk);
        return (pnkDeposit, pnkWithdrawal, StakingResult.Successful);
    }

    function _increaseStake(
        Juror storage juror,
        uint96 _courtID,
        uint256 _newStake,
        uint256 _currentStake
    ) internal returns (uint256 transferredAmount) {
        // Stake increase
        // When stakedPnk becomes lower than lockedPnk count the locked tokens in when transferring tokens from juror.
        // (E.g. stakedPnk = 0, lockedPnk = 150) which can happen if the juror unstaked fully while having some tokens locked.
        uint256 previouslyLocked = (juror.lockedPnk >= juror.stakedPnk) ? juror.lockedPnk - juror.stakedPnk : 0; // underflow guard
        transferredAmount = (_newStake >= _currentStake + previouslyLocked) // underflow guard
            ? _newStake - _currentStake - previouslyLocked
            : 0;
        if (_currentStake == 0) {
            juror.courtIDs.push(_courtID);
        }
        // stakedPnk can become async with _currentStake (e.g. after penalty).
        juror.stakedPnk = (juror.stakedPnk >= _currentStake) ? juror.stakedPnk - _currentStake + _newStake : _newStake;
    }

    function _decreaseStake(
        Juror storage juror,
        uint96 _courtID,
        uint256 _newStake,
        uint256 _currentStake
    ) internal returns (uint256 transferredAmount) {
        // Stakes can be partially delayed only when stake is increased.
        // Stake decrease: make sure locked tokens always stay in the contract. They can only be released during Execution.
        if (juror.stakedPnk >= _currentStake - _newStake + juror.lockedPnk) {
            // We have enough pnk staked to afford withdrawal while keeping locked tokens.
            transferredAmount = _currentStake - _newStake;
        } else if (juror.stakedPnk >= juror.lockedPnk) {
            // Can't afford withdrawing the current stake fully. Take whatever is available while keeping locked tokens.
            transferredAmount = juror.stakedPnk - juror.lockedPnk;
        }
        if (_newStake == 0) {
            for (uint256 i = juror.courtIDs.length; i > 0; i--) {
                if (juror.courtIDs[i - 1] == _courtID) {
                    juror.courtIDs[i - 1] = juror.courtIDs[juror.courtIDs.length - 1];
                    juror.courtIDs.pop();
                    break;
                }
            }
        }
        // stakedPnk can become async with _currentStake (e.g. after penalty).
        juror.stakedPnk = (juror.stakedPnk >= _currentStake) ? juror.stakedPnk - _currentStake + _newStake : _newStake;
    }

    function lockStake(address _account, uint256 _relativeAmount) external override onlyByCore {
        jurors[_account].lockedPnk += _relativeAmount;
        emit StakeLocked(_account, _relativeAmount, false);
    }

    function unlockStake(address _account, uint256 _relativeAmount) external override onlyByCore {
        jurors[_account].lockedPnk -= _relativeAmount;
        emit StakeLocked(_account, _relativeAmount, true);
    }

    function penalizeStake(
        address _account,
        uint256 _relativeAmount
    ) external override onlyByCore returns (uint256 pnkBalance, uint256 availablePenalty) {
        Juror storage juror = jurors[_account];
        if (juror.stakedPnk >= _relativeAmount) {
            juror.stakedPnk -= _relativeAmount;
        } else {
            juror.stakedPnk = 0; // stakedPnk might become lower after manual unstaking, but lockedPnk will always cover the difference.
        }
    }

    /// @dev Unstakes the inactive juror from all courts.
    /// `O(n * (p * log_k(j)) )` where
    /// `n` is the number of courts the juror has staked in,
    /// `p` is the depth of the court tree,
    /// `k` is the minimum number of children per node of one of these courts' sortition sum tree,
    /// and `j` is the maximum number of jurors that ever staked in one of these courts simultaneously.
    /// @param _account The juror to unstake.
    function setJurorInactive(address _account) external override onlyByCore {
        uint96[] memory courtIDs = getJurorCourtIDs(_account);
        for (uint256 j = courtIDs.length; j > 0; j--) {
            core.setStakeBySortitionModule(_account, courtIDs[j - 1], 0);
        }
    }

    function withdrawLeftoverPNK(address _account) external override {}

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @dev Draw an ID from a tree using a number.
    /// Note that this function reverts if the sum of all values in the tree is 0.
    /// @return drawnAddress The drawn address.
    /// `O(k * log_k(n))` where
    /// `k` is the maximum number of children per node in the tree,
    ///  and `n` is the maximum number of nodes ever appended.
    function draw(bytes32, uint256, uint256) public view override returns (address drawnAddress) {
        drawnAddress = transientJuror;
    }

    /// @dev Gets the stake of a juror in a court.
    /// Warning: `O(n)` complexity where `n` is the number of courts the juror has staked in
    /// but acceptable for this educational implementation.
    /// @param _juror The address of the juror.
    /// @param _courtID The ID of the court.
    /// @return totalStaked The total amount of tokens staked by the juror in the court.
    /// @return totalLocked The total amount of tokens locked by the juror in the court.
    /// @return stakedInCourt The amount of tokens staked by the juror in the court.
    /// @return nbCourts The number of courts the juror has staked in.
    function getJurorBalance(
        address _juror,
        uint96 _courtID
    )
        external
        view
        override
        returns (uint256 totalStaked, uint256 totalLocked, uint256 stakedInCourt, uint256 nbCourts)
    {
        Juror storage juror = jurors[_juror];
        totalStaked = juror.stakedPnk;
        totalLocked = juror.lockedPnk;
        nbCourts = juror.courtIDs.length;
        for (uint256 i = 0; i < nbCourts; i++) {
            if (juror.courtIDs[i] == _courtID) {
                stakedInCourt = juror.stakesByCourtID[_courtID];
                break;
            }
        }
    }

    /// @dev Gets the court identifiers where a specific `_juror` has staked.
    /// @param _juror The address of the juror.
    function getJurorCourtIDs(address _juror) public view override returns (uint96[] memory) {
        return jurors[_juror].courtIDs;
    }

    function isJurorStaked(address _juror) external view override returns (bool) {
        return jurors[_juror].stakedPnk > 0;
    }

    function updateState(
        address _account,
        uint96 _courtID,
        uint256 _pnkDeposit,
        uint256 _pnkWithdrawal,
        uint256 _newStake
    ) external {}

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /// @dev Gets the stake of a juror in a court.
    /// Warning: `O(n)` complexity where `n` is the number of courts the juror has staked in
    /// but acceptable for this educational implementation.
    /// @param _juror The address of the juror.
    /// @param _courtID The ID of the court.
    /// @return stakedInCourt The amount of tokens staked by the juror in the court.
    function _stakeOf(address _juror, uint96 _courtID) internal view returns (uint256 stakedInCourt) {
        Juror storage juror = jurors[_juror];
        for (uint256 i = 0; i < juror.courtIDs.length; i++) {
            if (juror.courtIDs[i] == _courtID) {
                stakedInCourt = juror.stakesByCourtID[_courtID];
                break;
            }
        }
    }
}
