// SPDX-License-Identifier: MIT

/**
 *  @custom:authors: [@epiqueras, @unknownunknown1, @jaybuidl, @shotaronowhere]
 *  @custom:reviewers: []
 *  @custom:auditors: []
 *  @custom:bounties: []
 *  @custom:deployments: []
 */

pragma solidity 0.8.18;

import "./KlerosCore.sol";
import "./interfaces/ISortitionModule.sol";
import "./interfaces/IDisputeKit.sol";
import "../rng/RNG.sol";
import "../proxy/UUPSProxiable.sol";
import "../proxy/Initializable.sol";
import "../libraries/Constants.sol";

/// @title SortitionModule
/// @dev A factory of trees that keeps track of staked values for sortition.
contract SortitionModule is ISortitionModule, UUPSProxiable, Initializable {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    enum PreStakeHookResult {
        ok, // Correct phase. All checks are passed.
        stakeDelayedAlreadyTransferred, // Wrong phase but stake is increased, so transfer the tokens without updating the drawing chance.
        stakeDelayedNotTransferred, // Wrong phase and stake is decreased. Delay the token transfer and drawing chance update.
        failed // Checks didn't pass. Do no changes.
    }

    struct SortitionSumTree {
        uint256 K; // The maximum number of children per node.
        // We use this to keep track of vacant positions in the tree after removing a leaf. This is for keeping the tree as balanced as possible without spending gas on moving nodes around.
        uint256[] stack;
        uint256[] nodes;
        // Two-way mapping of IDs to node indexes. Note that node index 0 is reserved for the root node, and means the ID does not have a node.
        mapping(bytes32 => uint256) IDsToNodeIndexes;
        mapping(uint256 => bytes32) nodeIndexesToIDs;
    }

    struct DelayedStake {
        address account; // The address of the juror.
        uint96 courtID; // The ID of the court.
        uint256 stake; // The new stake.
        bool alreadyTransferred; // True if tokens were already transferred before delayed stake's execution.
    }

    struct Juror {
        uint96[] courtIDs; // The IDs of courts where the juror's stake path ends. A stake path is a path from the general court to a court the juror directly staked in using `_setStake`.
        uint256 stakedPnk; // The juror's total amount of tokens staked in subcourts. Reflects actual pnk balance.
        uint256 lockedPnk; // The juror's total amount of tokens locked in disputes. Can reflect actual pnk balance when stakedPnk are fully withdrawn.
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 public constant MAX_STAKE_PATHS = 4; // The maximum number of stake paths a juror can have.
    uint256 public constant DEFAULT_K = 6; // Default number of children per node.

    address public governor; // The governor of the contract.
    KlerosCore public core; // The core arbitrator contract.
    Phase public phase; // The current phase.
    uint256 public minStakingTime; // The time after which the phase can be switched to Drawing if there are open disputes.
    uint256 public maxDrawingTime; // The time after which the phase can be switched back to Staking.
    uint256 public lastPhaseChange; // The last time the phase was changed.
    uint256 public randomNumberRequestBlock; // Number of the block when RNG request was made.
    uint256 public disputesWithoutJurors; // The number of disputes that have not finished drawing jurors.
    RNG public rng; // The random number generator.
    uint256 public randomNumber; // Random number returned by RNG.
    uint256 public rngLookahead; // Minimal block distance between requesting and obtaining a random number.
    uint256 public delayedStakeWriteIndex; // The index of the last `delayedStake` item that was written to the array. 0 index is skipped.
    uint256 public delayedStakeReadIndex; // The index of the next `delayedStake` item that should be processed. Starts at 1 because 0 index is skipped.
    mapping(bytes32 => SortitionSumTree) sortitionSumTrees; // The mapping trees by keys.
    mapping(address => Juror) public jurors; // The jurors.
    mapping(uint256 => DelayedStake) public delayedStakes; // Stores the stakes that were changed during Drawing phase, to update them when the phase is switched to Staking.
    mapping(address => mapping(uint96 => uint256)) public latestDelayedStakeIndex; // Maps the juror to its latest delayed stake. If there is already a delayed stake for this juror then it'll be replaced. latestDelayedStakeIndex[juror][courtID].

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event StakeSet(address indexed _address, uint256 _courtID, uint256 _amount);
    event StakeDelayedNotTransferred(address indexed _address, uint256 _courtID, uint256 _amount);
    event StakeDelayedAlreadyTransferred(address indexed _address, uint256 _courtID, uint256 _amount);
    event StakeDelayedAlreadyTransferredWithdrawn(address indexed _address, uint96 indexed _courtID, uint256 _amount);
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

    /// @dev Constructor, initializing the implementation to reduce attack surface.
    constructor() {
        _disableInitializers();
    }

    /// @dev Initializer (constructor equivalent for upgradable contracts).
    /// @param _core The KlerosCore.
    /// @param _minStakingTime Minimal time to stake
    /// @param _maxDrawingTime Time after which the drawing phase can be switched
    /// @param _rng The random number generator.
    /// @param _rngLookahead Lookahead value for rng.
    function initialize(
        address _governor,
        KlerosCore _core,
        uint256 _minStakingTime,
        uint256 _maxDrawingTime,
        RNG _rng,
        uint256 _rngLookahead
    ) external reinitializer(1) {
        governor = _governor;
        core = _core;
        minStakingTime = _minStakingTime;
        maxDrawingTime = _maxDrawingTime;
        lastPhaseChange = block.timestamp;
        rng = _rng;
        rngLookahead = _rngLookahead;
        delayedStakeReadIndex = 1;
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

    /// @dev Changes the `minStakingTime` storage variable.
    /// @param _minStakingTime The new value for the `minStakingTime` storage variable.
    function changeMinStakingTime(uint256 _minStakingTime) external onlyByGovernor {
        minStakingTime = _minStakingTime;
    }

    /// @dev Changes the `maxDrawingTime` storage variable.
    /// @param _maxDrawingTime The new value for the `maxDrawingTime` storage variable.
    function changeMaxDrawingTime(uint256 _maxDrawingTime) external onlyByGovernor {
        maxDrawingTime = _maxDrawingTime;
    }

    /// @dev Changes the `_rng` and `_rngLookahead` storage variables.
    /// @param _rng The new value for the `RNGenerator` storage variable.
    /// @param _rngLookahead The new value for the `rngLookahead` storage variable.
    function changeRandomNumberGenerator(RNG _rng, uint256 _rngLookahead) external onlyByGovernor {
        rng = _rng;
        rngLookahead = _rngLookahead;
        if (phase == Phase.generating) {
            rng.requestRandomness(block.number + rngLookahead);
            randomNumberRequestBlock = block.number;
        }
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    function passPhase() external {
        if (phase == Phase.staking) {
            require(
                block.timestamp - lastPhaseChange >= minStakingTime,
                "The minimum staking time has not passed yet."
            );
            require(disputesWithoutJurors > 0, "There are no disputes that need jurors.");
            rng.requestRandomness(block.number + rngLookahead);
            randomNumberRequestBlock = block.number;
            phase = Phase.generating;
        } else if (phase == Phase.generating) {
            randomNumber = rng.receiveRandomness(randomNumberRequestBlock + rngLookahead);
            require(randomNumber != 0, "Random number is not ready yet");
            phase = Phase.drawing;
        } else if (phase == Phase.drawing) {
            require(
                disputesWithoutJurors == 0 || block.timestamp - lastPhaseChange >= maxDrawingTime,
                "There are still disputes without jurors and the maximum drawing time has not passed yet."
            );
            phase = Phase.staking;
        }

        lastPhaseChange = block.timestamp;
        emit NewPhase(phase);
    }

    /// @dev Create a sortition sum tree at the specified key.
    /// @param _key The key of the new tree.
    /// @param _extraData Extra data that contains the number of children each node in the tree should have.
    function createTree(bytes32 _key, bytes memory _extraData) external override onlyByCore {
        SortitionSumTree storage tree = sortitionSumTrees[_key];
        uint256 K = _extraDataToTreeK(_extraData);
        require(tree.K == 0, "Tree already exists.");
        require(K > 1, "K must be greater than one.");
        tree.K = K;
        tree.nodes.push(0);
    }

    /// @dev Executes the next delayed stakes.
    /// @param _iterations The number of delayed stakes to execute.
    function executeDelayedStakes(uint256 _iterations) external {
        require(phase == Phase.staking, "Should be in Staking phase.");

        uint256 actualIterations = (delayedStakeReadIndex + _iterations) - 1 > delayedStakeWriteIndex
            ? (delayedStakeWriteIndex - delayedStakeReadIndex) + 1
            : _iterations;
        uint256 newDelayedStakeReadIndex = delayedStakeReadIndex + actualIterations;

        for (uint256 i = delayedStakeReadIndex; i < newDelayedStakeReadIndex; i++) {
            DelayedStake storage delayedStake = delayedStakes[i];
            // Delayed stake could've been manually removed already. In this case simply move on to the next item.
            if (delayedStake.account != address(0)) {
                core.setStakeBySortitionModule(
                    delayedStake.account,
                    delayedStake.courtID,
                    delayedStake.stake,
                    delayedStake.alreadyTransferred
                );
                delete latestDelayedStakeIndex[delayedStake.account][delayedStake.courtID];
                delete delayedStakes[i];
            }
        }
        delayedStakeReadIndex = newDelayedStakeReadIndex;
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
    /// @param _alreadyTransferred True if the tokens were already transferred from juror. Only relevant for delayed stakes.
    /// @return pnkDeposit The amount of PNK to be deposited.
    /// @return pnkWithdrawal The amount of PNK to be withdrawn.
    /// @return succeeded True if the call succeeded, false otherwise.
    function setStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake,
        bool _alreadyTransferred
    ) external override onlyByCore returns (uint256 pnkDeposit, uint256 pnkWithdrawal, bool succeeded) {
        Juror storage juror = jurors[_account];
        uint256 currentStake = stakeOf(_account, _courtID);

        uint256 nbCourts = juror.courtIDs.length;
        if (_newStake == 0 && (nbCourts >= MAX_STAKE_PATHS || currentStake == 0)) {
            return (0, 0, false); // Prevent staking beyond MAX_STAKE_PATHS but unstaking is always allowed.
        }

        if (phase != Phase.staking) {
            pnkWithdrawal = _deleteDelayedStake(_courtID, _account);

            // Store the stake change as delayed, to be applied when the phase switches back to Staking.
            DelayedStake storage delayedStake = delayedStakes[++delayedStakeWriteIndex];
            delayedStake.account = _account;
            delayedStake.courtID = _courtID;
            delayedStake.stake = _newStake;
            latestDelayedStakeIndex[_account][_courtID] = delayedStakeWriteIndex;
            if (_newStake > currentStake) {
                // PNK deposit: tokens are transferred now.
                delayedStake.alreadyTransferred = true;
                pnkDeposit = _increaseStake(juror, _courtID, _newStake, currentStake);
                emit StakeDelayedAlreadyTransferred(_account, _courtID, _newStake);
            } else {
                // PNK withdrawal: tokens are not transferred yet.
                emit StakeDelayedNotTransferred(_account, _courtID, _newStake);
            }
            return (pnkDeposit, pnkWithdrawal, true);
        }

        // Current phase is Staking: set normal stakes or delayed stakes (which may have been already transferred).
        if (_newStake >= currentStake) {
            if (!_alreadyTransferred) {
                pnkDeposit = _increaseStake(juror, _courtID, _newStake, currentStake);
            }
        } else {
            pnkWithdrawal += _decreaseStake(juror, _courtID, _newStake, currentStake);
        }

        bytes32 stakePathID = _accountAndCourtIDToStakePathID(_account, _courtID);
        bool finished = false;
        uint96 currenCourtID = _courtID;
        while (!finished) {
            // Tokens are also implicitly staked in parent courts through sortition module to increase the chance of being drawn.
            _set(bytes32(uint256(currenCourtID)), _newStake, stakePathID);
            if (currenCourtID == Constants.GENERAL_COURT) {
                finished = true;
            } else {
                (currenCourtID, , , , , , ) = core.courts(currenCourtID);
            }
        }
        emit StakeSet(_account, _courtID, _newStake);
        return (pnkDeposit, pnkWithdrawal, true);
    }

    /// @dev Checks if there is already a delayed stake. In this case consider it irrelevant and remove it.
    /// @param _courtID ID of the court.
    /// @param _juror Juror whose stake to check.
    function _deleteDelayedStake(uint96 _courtID, address _juror) internal returns (uint256 actualAmountToWithdraw) {
        uint256 latestIndex = latestDelayedStakeIndex[_juror][_courtID];
        if (latestIndex != 0) {
            DelayedStake storage delayedStake = delayedStakes[latestIndex];
            if (delayedStake.alreadyTransferred) {
                // Sortition stake represents the stake value that was last updated during Staking phase.
                uint256 sortitionStake = stakeOf(_juror, _courtID);

                // Withdraw the tokens that were added with the latest delayed stake.
                uint256 amountToWithdraw = delayedStake.stake - sortitionStake;
                actualAmountToWithdraw = amountToWithdraw;
                Juror storage juror = jurors[_juror];
                if (juror.stakedPnk <= actualAmountToWithdraw) {
                    actualAmountToWithdraw = juror.stakedPnk;
                }

                // StakePnk can become lower because of penalty.
                juror.stakedPnk -= actualAmountToWithdraw;
                emit StakeDelayedAlreadyTransferredWithdrawn(_juror, _courtID, amountToWithdraw);

                if (sortitionStake == 0) {
                    // Delete the court otherwise it will be duplicated after staking.
                    for (uint256 i = juror.courtIDs.length; i > 0; i--) {
                        if (juror.courtIDs[i - 1] == _courtID) {
                            juror.courtIDs[i - 1] = juror.courtIDs[juror.courtIDs.length - 1];
                            juror.courtIDs.pop();
                            break;
                        }
                    }
                }
            }
            delete delayedStakes[latestIndex];
            delete latestDelayedStakeIndex[_juror][_courtID];
        }
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

    function penalizeStake(address _account, uint256 _relativeAmount) external override onlyByCore {
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
            core.setStakeBySortitionModule(_account, courtIDs[j - 1], 0, false);
        }
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @dev Draw an ID from a tree using a number.
    /// Note that this function reverts if the sum of all values in the tree is 0.
    /// @param _key The key of the tree.
    /// @param _coreDisputeID Index of the dispute in Kleros Core.
    /// @param _nonce Nonce to hash with random number.
    /// @return drawnAddress The drawn address.
    /// `O(k * log_k(n))` where
    /// `k` is the maximum number of children per node in the tree,
    ///  and `n` is the maximum number of nodes ever appended.
    function draw(
        bytes32 _key,
        uint256 _coreDisputeID,
        uint256 _nonce
    ) public view override returns (address drawnAddress) {
        require(phase == Phase.drawing, "Wrong phase.");
        SortitionSumTree storage tree = sortitionSumTrees[_key];

        if (tree.nodes[0] == 0) {
            return address(0); // No jurors staked.
        }

        uint256 currentDrawnNumber = uint256(keccak256(abi.encodePacked(randomNumber, _coreDisputeID, _nonce))) %
            tree.nodes[0];

        // While it still has children
        uint256 treeIndex = 0;
        while ((tree.K * treeIndex) + 1 < tree.nodes.length) {
            for (uint256 i = 1; i <= tree.K; i++) {
                // Loop over children.
                uint256 nodeIndex = (tree.K * treeIndex) + i;
                uint256 nodeValue = tree.nodes[nodeIndex];

                if (currentDrawnNumber >= nodeValue) {
                    // Go to the next child.
                    currentDrawnNumber -= nodeValue;
                } else {
                    // Pick this child.
                    treeIndex = nodeIndex;
                    break;
                }
            }
        }
        drawnAddress = _stakePathIDToAccount(tree.nodeIndexesToIDs[treeIndex]);
    }

    /// @dev Get the stake of a juror in a court.
    /// @param _juror The address of the juror.
    /// @param _courtID The ID of the court.
    /// @return value The stake of the juror in the court.
    function stakeOf(address _juror, uint96 _courtID) public view returns (uint256) {
        bytes32 stakePathID = _accountAndCourtIDToStakePathID(_juror, _courtID);
        return stakeOf(bytes32(uint256(_courtID)), stakePathID);
    }

    /// @dev Get the stake of a juror in a court.
    /// @param _key The key of the tree, corresponding to a court.
    /// @param _ID The stake path ID, corresponding to a juror.
    /// @return The stake of the juror in the court.
    function stakeOf(bytes32 _key, bytes32 _ID) public view returns (uint256) {
        SortitionSumTree storage tree = sortitionSumTrees[_key];
        uint treeIndex = tree.IDsToNodeIndexes[_ID];
        if (treeIndex == 0) {
            return 0;
        }
        return tree.nodes[treeIndex];
    }

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
        stakedInCourt = stakeOf(_juror, _courtID);
        nbCourts = juror.courtIDs.length;
    }

    /// @dev Gets the court identifiers where a specific `_juror` has staked.
    /// @param _juror The address of the juror.
    function getJurorCourtIDs(address _juror) public view override returns (uint96[] memory) {
        return jurors[_juror].courtIDs;
    }

    function isJurorStaked(address _juror) external view override returns (bool) {
        return jurors[_juror].stakedPnk > 0;
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /// @dev Update all the parents of a node.
    /// @param _key The key of the tree to update.
    /// @param _treeIndex The index of the node to start from.
    /// @param _plusOrMinus Whether to add (true) or substract (false).
    /// @param _value The value to add or substract.
    /// `O(log_k(n))` where
    /// `k` is the maximum number of children per node in the tree,
    ///  and `n` is the maximum number of nodes ever appended.
    function _updateParents(bytes32 _key, uint256 _treeIndex, bool _plusOrMinus, uint256 _value) private {
        SortitionSumTree storage tree = sortitionSumTrees[_key];

        uint256 parentIndex = _treeIndex;
        while (parentIndex != 0) {
            parentIndex = (parentIndex - 1) / tree.K;
            tree.nodes[parentIndex] = _plusOrMinus
                ? tree.nodes[parentIndex] + _value
                : tree.nodes[parentIndex] - _value;
        }
    }

    /// @dev Retrieves a juror's address from the stake path ID.
    /// @param _stakePathID The stake path ID to unpack.
    /// @return account The account.
    function _stakePathIDToAccount(bytes32 _stakePathID) internal pure returns (address account) {
        assembly {
            // solium-disable-line security/no-inline-assembly
            let ptr := mload(0x40)
            for {
                let i := 0x00
            } lt(i, 0x14) {
                i := add(i, 0x01)
            } {
                mstore8(add(add(ptr, 0x0c), i), byte(i, _stakePathID))
            }
            account := mload(ptr)
        }
    }

    function _extraDataToTreeK(bytes memory _extraData) internal pure returns (uint256 K) {
        if (_extraData.length >= 32) {
            assembly {
                // solium-disable-line security/no-inline-assembly
                K := mload(add(_extraData, 0x20))
            }
        } else {
            K = DEFAULT_K;
        }
    }

    /// @dev Set a value in a tree.
    /// @param _key The key of the tree.
    /// @param _value The new value.
    /// @param _ID The ID of the value.
    /// `O(log_k(n))` where
    /// `k` is the maximum number of children per node in the tree,
    ///  and `n` is the maximum number of nodes ever appended.
    function _set(bytes32 _key, uint256 _value, bytes32 _ID) internal {
        SortitionSumTree storage tree = sortitionSumTrees[_key];
        uint256 treeIndex = tree.IDsToNodeIndexes[_ID];

        if (treeIndex == 0) {
            // No existing node.
            if (_value != 0) {
                // Non zero value.
                // Append.
                // Add node.
                if (tree.stack.length == 0) {
                    // No vacant spots.
                    // Get the index and append the value.
                    treeIndex = tree.nodes.length;
                    tree.nodes.push(_value);

                    // Potentially append a new node and make the parent a sum node.
                    if (treeIndex != 1 && (treeIndex - 1) % tree.K == 0) {
                        // Is first child.
                        uint256 parentIndex = treeIndex / tree.K;
                        bytes32 parentID = tree.nodeIndexesToIDs[parentIndex];
                        uint256 newIndex = treeIndex + 1;
                        tree.nodes.push(tree.nodes[parentIndex]);
                        delete tree.nodeIndexesToIDs[parentIndex];
                        tree.IDsToNodeIndexes[parentID] = newIndex;
                        tree.nodeIndexesToIDs[newIndex] = parentID;
                    }
                } else {
                    // Some vacant spot.
                    // Pop the stack and append the value.
                    treeIndex = tree.stack[tree.stack.length - 1];
                    tree.stack.pop();
                    tree.nodes[treeIndex] = _value;
                }

                // Add label.
                tree.IDsToNodeIndexes[_ID] = treeIndex;
                tree.nodeIndexesToIDs[treeIndex] = _ID;

                _updateParents(_key, treeIndex, true, _value);
            }
        } else {
            // Existing node.
            if (_value == 0) {
                // Zero value.
                // Remove.
                // Remember value and set to 0.
                uint256 value = tree.nodes[treeIndex];
                tree.nodes[treeIndex] = 0;

                // Push to stack.
                tree.stack.push(treeIndex);

                // Clear label.
                delete tree.IDsToNodeIndexes[_ID];
                delete tree.nodeIndexesToIDs[treeIndex];

                _updateParents(_key, treeIndex, false, value);
            } else if (_value != tree.nodes[treeIndex]) {
                // New, non zero value.
                // Set.
                bool plusOrMinus = tree.nodes[treeIndex] <= _value;
                uint256 plusOrMinusValue = plusOrMinus
                    ? _value - tree.nodes[treeIndex]
                    : tree.nodes[treeIndex] - _value;
                tree.nodes[treeIndex] = _value;

                _updateParents(_key, treeIndex, plusOrMinus, plusOrMinusValue);
            }
        }
    }

    /// @dev Packs an account and a court ID into a stake path ID.
    /// @param _account The address of the juror to pack.
    /// @param _courtID The court ID to pack.
    /// @return stakePathID The stake path ID.
    function _accountAndCourtIDToStakePathID(
        address _account,
        uint96 _courtID
    ) internal pure returns (bytes32 stakePathID) {
        assembly {
            // solium-disable-line security/no-inline-assembly
            let ptr := mload(0x40)
            for {
                let i := 0x00
            } lt(i, 0x14) {
                i := add(i, 0x01)
            } {
                mstore8(add(ptr, i), byte(add(0x0c, i), _account))
            }
            for {
                let i := 0x14
            } lt(i, 0x20) {
                i := add(i, 0x01)
            } {
                mstore8(add(ptr, i), byte(i, _courtID))
            }
            stakePathID := mload(ptr)
        }
    }
}
