// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {IArbitrableV2} from "./interfaces/IArbitrableV2.sol";
import {IArbitratorV2} from "./interfaces/IArbitratorV2.sol";
import {SafeSend} from "../libraries/SafeSend.sol";
import {IDisputeTemplateRegistry} from "./interfaces/IDisputeTemplateRegistry.sol";

/// @title KlerosGovernor for V2.
/// @dev Appeal and evidence submission is handled by the court.
contract KlerosGovernor is IArbitrableV2 {
    using SafeSend for address payable;

    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    enum Status {
        NoDispute,
        DisputeCreated,
        Resolved
    }

    struct Session {
        uint256 ruling; // The ruling that was given in this session, if any.
        uint256 disputeID; // ID given to the dispute of the session, if any.
        uint256[] submittedLists; // Tracks all lists that were submitted in a session in the form submittedLists[submissionID].
        uint256 sumDeposit; // Sum of all submission deposits in a session (minus arbitration fees). This is used to calculate the reward.
        Status status; // Status of a session.
        mapping(bytes32 listHash => bool) alreadySubmitted; // Indicates whether or not the transaction list was already submitted in order to catch duplicates in the form alreadySubmitted[listHash].
        uint256 durationOffset; // Time in seconds that prolongs the submission period after the first submission, to give other submitters time to react.
    }

    struct Transaction {
        address target; // The address to call.
        uint256 value; // Value paid by governor contract that will be used as msg.value in the execution.
        bytes data; // Calldata of the transaction.
        bool executed; // Whether the transaction was already executed or not.
    }

    struct Submission {
        address payable submitter; // The one who submits the list.
        uint256 deposit; // Value of the deposit paid upon submission of the list.
        Transaction[] txs; // Transactions stored in the list in the form txs[_transactionIndex].
        bytes32 listHash; // A hash chain of all transactions stored in the list. This is used as a unique identifier within a session.
        uint256 submissionTime; // The time when the list was submitted.
        bool approved; // Whether the list was approved for execution or not.
        uint256 approvalTime; // The time when the list was approved.
    }

    IArbitratorV2 public arbitrator; // Arbitrator contract.
    bytes public arbitratorExtraData; // Extra data for arbitrator.
    address public wNative; // The wrapped native token for safeSend().
    IDisputeTemplateRegistry public templateRegistry; // The dispute template registry.
    uint256 public templateId; // The current dispute template identifier.

    uint256 public submissionBaseDeposit; // The base deposit in wei that needs to be paid in order to submit the list.
    uint256 public submissionTimeout; // Time in seconds allowed for submitting the lists. Once it's passed the contract enters the approval period.
    uint256 public executionTimeout; // Time in seconds allowed for the execution of approved lists.
    uint256 public withdrawTimeout; // Time in seconds allowed to withdraw a submitted list.

    uint256 public lastApprovalTime; // The time of the last approval of a transaction list.
    uint256 public reservedETH; // Sum of contract's submission deposits. These funds are not to be used in the execution of transactions.

    Submission[] public submissions; // Stores all created transaction lists. submissions[_listID].
    Session[] public sessions; // Stores all submitting sessions. sessions[_session].

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier duringSubmissionPeriod() {
        uint256 offset = sessions[sessions.length - 1].durationOffset;
        if (block.timestamp - lastApprovalTime > submissionTimeout + offset) revert SubmissionTimeHasEnded();
        _;
    }

    modifier duringApprovalPeriod() {
        uint256 offset = sessions[sessions.length - 1].durationOffset;
        if (block.timestamp - lastApprovalTime <= submissionTimeout + offset) revert ApprovalTimeNotStarted();
        _;
    }

    modifier onlyByOwner() {
        if (address(this) != msg.sender) revert OwnerOnly();
        _;
    }

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice Emitted when a new list is submitted.
    /// @param _listID The index of the transaction list in the array of lists.
    /// @param _submitter The address that submitted the list.
    /// @param _session The number of the current session.
    /// @param _description The string in CSV format that contains labels of list's transactions.
    /// Note that the submitter may give bad descriptions of correct actions, but this is to be seen as UI enhancement, not a critical feature and that would play against him in case of dispute.
    event ListSubmitted(
        uint256 indexed _listID,
        address indexed _submitter,
        uint256 indexed _session,
        string _description
    );

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @notice Constructor.
    /// @param _arbitrator The arbitrator of the contract.
    /// @param _arbitratorExtraData Extra data for the arbitrator.
    /// @param _templateData The dispute template data.
    /// @param _templateDataMappings The dispute template data mappings.
    /// @param _submissionBaseDeposit The base deposit required for submission.
    /// @param _submissionTimeout Time in seconds allocated for submitting transaction list.
    /// @param _executionTimeout Time in seconds after approval that allows to execute transactions of the approved list.
    /// @param _withdrawTimeout Time in seconds after submission that allows to withdraw submitted list.
    /// @param _wNative The wrapped native token address, typically wETH.
    constructor(
        IArbitratorV2 _arbitrator,
        bytes memory _arbitratorExtraData,
        string memory _templateData,
        string memory _templateDataMappings,
        uint256 _submissionBaseDeposit,
        uint256 _submissionTimeout,
        uint256 _executionTimeout,
        uint256 _withdrawTimeout,
        address _wNative
    ) {
        arbitrator = _arbitrator;
        arbitratorExtraData = _arbitratorExtraData;
        wNative = _wNative;

        lastApprovalTime = block.timestamp;
        submissionBaseDeposit = _submissionBaseDeposit;
        submissionTimeout = _submissionTimeout;
        executionTimeout = _executionTimeout;
        withdrawTimeout = _withdrawTimeout;
        sessions.push();

        templateId = templateRegistry.setDisputeTemplate("", _templateData, _templateDataMappings);
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @notice Changes the value of the base deposit required for submitting a list.
    /// @param _submissionBaseDeposit The new value of the base deposit, in wei.
    function changeSubmissionDeposit(uint256 _submissionBaseDeposit) external onlyByOwner {
        submissionBaseDeposit = _submissionBaseDeposit;
    }

    /// @notice Changes the time allocated for submission.
    /// @dev It cannot be changed during approval period because there can be an active dispute in the old arbitrator contract
    /// and prolonging submission timeout might switch it back to submission period.
    /// @param _submissionTimeout The new duration of the submission period, in seconds.
    function changeSubmissionTimeout(uint256 _submissionTimeout) external onlyByOwner duringSubmissionPeriod {
        submissionTimeout = _submissionTimeout;
    }

    /// @notice Changes the time allocated for list's execution.
    /// @param _executionTimeout The new duration of the execution timeout, in seconds.
    function changeExecutionTimeout(uint256 _executionTimeout) external onlyByOwner {
        executionTimeout = _executionTimeout;
    }

    /// @notice Changes list withdrawal timeout. Note that withdrawals are only possible in the first half of the submission period.
    /// @param _withdrawTimeout The new duration of withdraw period, in seconds.
    function changeWithdrawTimeout(uint256 _withdrawTimeout) external onlyByOwner {
        withdrawTimeout = _withdrawTimeout;
    }

    /// @notice Changes the arbitrator of the contract.
    /// @dev It cannot be changed during approval period because there can be an active dispute in the old arbitrator contract.
    /// @param _arbitrator The new trusted arbitrator.
    /// @param _arbitratorExtraData The extra data used by the new arbitrator.
    function changeArbitrator(
        IArbitratorV2 _arbitrator,
        bytes memory _arbitratorExtraData
    ) external onlyByOwner duringSubmissionPeriod {
        arbitrator = _arbitrator;
        arbitratorExtraData = _arbitratorExtraData;
    }

    /// @notice Update the dispute template data.
    /// @param _templateData The new dispute template data.
    /// @param _templateDataMappings The new dispute template data mappings.
    function changeDisputeTemplate(
        string memory _templateData,
        string memory _templateDataMappings
    ) external onlyByOwner {
        templateId = templateRegistry.setDisputeTemplate("", _templateData, _templateDataMappings);
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Creates transaction list based on input parameters and submits it for potential approval and execution.
    /// @param _target List of addresses to call.
    /// @param _value List of values required for respective addresses.
    /// @param _data Concatenated calldata of all transactions of this list.
    /// @param _dataSize List of lengths in bytes required to split calldata for its respective targets.
    /// @param _description String in CSV format that describes list's transactions.
    function submitList(
        address[] memory _target,
        uint256[] memory _value,
        bytes memory _data,
        uint256[] memory _dataSize,
        string memory _description
    ) external payable duringSubmissionPeriod {
        if (_target.length != _value.length) revert WrongInputTargetAndValue();
        if (_target.length != _dataSize.length) revert WrongInputTargetAndDatasize();
        Session storage session = sessions[sessions.length - 1];
        Submission storage submission = submissions.push();
        submission.submitter = payable(msg.sender);
        // Do the assignment first to avoid creating a new variable and bypass a 'stack too deep' error.
        submission.deposit = submissionBaseDeposit + arbitrator.arbitrationCost(arbitratorExtraData);
        if (msg.value < submission.deposit) revert InsufficientDeposit();

        bytes32 listHash;
        bytes32 currentTxHash;
        uint256 readingPosition;
        for (uint256 i = 0; i < _target.length; i++) {
            bytes memory readData = new bytes(_dataSize[i]);
            Transaction storage transaction = submission.txs.push();
            transaction.target = _target[i];
            transaction.value = _value[i];
            for (uint256 j = 0; j < _dataSize[i]; j++) {
                readData[j] = _data[readingPosition + j];
            }
            transaction.data = readData;
            readingPosition += _dataSize[i];
            currentTxHash = keccak256(abi.encodePacked(transaction.target, transaction.value, transaction.data));
            listHash = keccak256(abi.encodePacked(currentTxHash, listHash));
        }
        if (session.alreadySubmitted[listHash]) revert ListAlreadySubmitted();
        session.alreadySubmitted[listHash] = true;
        submission.listHash = listHash;
        submission.submissionTime = block.timestamp;
        session.sumDeposit += submission.deposit;
        session.submittedLists.push(submissions.length - 1);
        if (session.submittedLists.length == 1) session.durationOffset = block.timestamp - lastApprovalTime;

        emit ListSubmitted(submissions.length - 1, msg.sender, sessions.length - 1, _description);

        uint256 remainder = msg.value - submission.deposit;
        if (remainder > 0) payable(msg.sender).safeSend(remainder, wNative);

        reservedETH += submission.deposit;
    }

    /// @notice Withdraws submitted transaction list. Reimburses submission deposit.
    /// @dev Withdrawal is only possible during the first half of the submission period and during withdrawTimeout after the submission is made.
    /// @param _submissionID Submission's index in the array of submitted lists of the current sesssion.
    /// @param _listHash Hash of a withdrawing list.
    function withdrawTransactionList(uint256 _submissionID, bytes32 _listHash) external {
        Session storage session = sessions[sessions.length - 1];
        Submission storage submission = submissions[session.submittedLists[_submissionID]];
        if (block.timestamp - lastApprovalTime > submissionTimeout / 2) revert ShouldOnlyWithdrawInFirstHalf();
        // This is an extra check to prevent _submissionID linking to the wrong list because of index swap during withdrawal.
        if (submission.listHash != _listHash) revert WrongListHash();
        if (submission.submitter != msg.sender) revert OnlySubmitterCanWithdraw();
        if (block.timestamp - submission.submissionTime > withdrawTimeout) revert WithdrawingTimeHasPassed();
        session.submittedLists[_submissionID] = session.submittedLists[session.submittedLists.length - 1];
        session.alreadySubmitted[_listHash] = false;
        session.submittedLists.pop();
        session.sumDeposit -= submission.deposit;
        reservedETH -= submission.deposit;
        payable(msg.sender).transfer(submission.deposit);
    }

    /// @notice Approves a transaction list or creates a dispute if more than one list was submitted.
    /// @dev If nothing was submitted changes session.
    function executeSubmissions() external duringApprovalPeriod {
        Session storage session = sessions[sessions.length - 1];
        if (session.status != Status.NoDispute) revert AlreadyDisputed();
        if (session.submittedLists.length == 0) {
            lastApprovalTime = block.timestamp;
            session.status = Status.Resolved;
            sessions.push();
        } else if (session.submittedLists.length == 1) {
            Submission storage submission = submissions[session.submittedLists[0]];
            submission.approved = true;
            submission.approvalTime = block.timestamp;
            uint256 sumDeposit = session.sumDeposit;
            session.sumDeposit = 0;
            submission.submitter.safeSend(sumDeposit, wNative);
            lastApprovalTime = block.timestamp;
            session.status = Status.Resolved;
            sessions.push();

            reservedETH -= sumDeposit;
        } else {
            session.status = Status.DisputeCreated;
            uint256 arbitrationCost = arbitrator.arbitrationCost(arbitratorExtraData);
            session.disputeID = arbitrator.createDispute{value: arbitrationCost}(
                session.submittedLists.length,
                arbitratorExtraData
            );
            // Check in case arbitration cost increased after the submission. It's unlikely that its increase won't be covered by the base deposit, but technically possible.
            session.sumDeposit = session.sumDeposit > arbitrationCost ? session.sumDeposit - arbitrationCost : 0;
            reservedETH = reservedETH > arbitrationCost ? reservedETH - arbitrationCost : 0;
            emit DisputeRequest(arbitrator, session.disputeID, templateId);
        }
    }

    /// @notice Gives a ruling for a dispute.
    /// @dev Must be called by the arbitrator.
    /// @param _disputeID ID of the dispute in the Arbitrator contract.
    /// @param _ruling Ruling given by the arbitrator. Note that 0 is reserved for "Refuse to arbitrate".
    /// Note If the final ruling is "0" nothing is approved and deposits will stay locked in the contract.
    function rule(uint256 _disputeID, uint256 _ruling) external override {
        Session storage session = sessions[sessions.length - 1];
        if (msg.sender != address(arbitrator)) revert OnlyArbitratorAllowed();
        if (session.status != Status.DisputeCreated) revert NotDisputed();
        if (_ruling > session.submittedLists.length) revert RulingOutOfBounds();

        if (_ruling != 0) {
            Submission storage submission = submissions[session.submittedLists[_ruling - 1]];
            submission.approved = true;
            submission.approvalTime = block.timestamp;
            submission.submitter.safeSend(session.sumDeposit, wNative);
        }
        // If the ruling is "0" the reserved funds of this session become expendable.
        reservedETH -= session.sumDeposit;

        session.sumDeposit = 0;
        lastApprovalTime = block.timestamp;
        session.status = Status.Resolved;
        session.ruling = _ruling;
        sessions.push();

        emit Ruling(IArbitratorV2(msg.sender), _disputeID, _ruling);
    }

    /// @notice Executes selected transactions of the list.
    /// @param _listID The index of the transaction list in the array of lists.
    /// @param _cursor Index of the transaction from which to start executing.
    /// @param _count Number of transactions to execute. Executes until the end if set to "0" or number higher than number of transactions in the list.
    function executeTransactionList(uint256 _listID, uint256 _cursor, uint256 _count) external {
        Submission storage submission = submissions[_listID];
        if (!submission.approved) revert SubmissionNotApproved();
        if (block.timestamp - submission.approvalTime > executionTimeout) revert TimeToExecuteHasPassed();
        for (uint256 i = _cursor; i < submission.txs.length && (_count == 0 || i < _cursor + _count); i++) {
            Transaction storage transaction = submission.txs[i];
            uint256 expendableFunds = getExpendableFunds();
            if (!transaction.executed && transaction.value <= expendableFunds) {
                (bool callResult, ) = transaction.target.call{value: transaction.value}(transaction.data);
                // An extra check to prevent re-entrancy through target call.
                if (callResult == true) {
                    if (transaction.executed) revert AlreadyExecuted();
                    transaction.executed = true;
                }
            }
        }
    }

    /// @notice Receive function to receive funds for the execution of transactions.
    receive() external payable {}

    /// @notice Gets the sum of contract funds that are used for the execution of transactions.
    /// @return Contract balance without reserved ETH.
    function getExpendableFunds() public view returns (uint256) {
        return address(this).balance - reservedETH;
    }

    /// @notice Gets the info of the specific transaction in the specific list.
    /// @param _listID The index of the transaction list in the array of lists.
    /// @param _transactionIndex The index of the transaction.
    /// @return target The target of the transaction.
    /// @return value The value of the transaction.
    /// @return data The data of the transaction.
    /// @return executed Whether the transaction was executed or not.
    function getTransactionInfo(
        uint256 _listID,
        uint256 _transactionIndex
    ) external view returns (address target, uint256 value, bytes memory data, bool executed) {
        Submission storage submission = submissions[_listID];
        Transaction storage transaction = submission.txs[_transactionIndex];
        return (transaction.target, transaction.value, transaction.data, transaction.executed);
    }

    /// @notice Gets the array of submitted lists in the session.
    ///
    /// @dev This function is O(n), where `n` is the number of submissions in the session.
    /// This could exceed the gas limit, therefore this function should only be used for interface display and not by other contracts.
    ///
    /// @param _session The ID of the session.
    /// @return submittedLists Indexes of lists that were submitted during the session.
    function getSubmittedLists(uint256 _session) external view returns (uint256[] memory submittedLists) {
        Session storage session = sessions[_session];
        submittedLists = session.submittedLists;
    }

    /// @notice Gets the number of transactions in the list.
    /// @param _listID The index of the transaction list in the array of lists.
    /// @return txCount The number of transactions in the list.
    function getNumberOfTransactions(uint256 _listID) external view returns (uint256 txCount) {
        Submission storage submission = submissions[_listID];
        return submission.txs.length;
    }

    /// @notice Gets the number of lists created in contract's lifetime.
    /// @return The number of created lists.
    function getNumberOfCreatedLists() external view returns (uint256) {
        return submissions.length;
    }

    /// @notice Gets the number of the ongoing session.
    /// @return The number of the ongoing session.
    function getCurrentSessionNumber() external view returns (uint256) {
        return sessions.length - 1;
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error SubmissionTimeHasEnded();
    error ApprovalTimeNotStarted();
    error OwnerOnly();
    error WrongInputTargetAndValue();
    error WrongInputTargetAndDatasize();
    error InsufficientDeposit();
    error ListAlreadySubmitted();
    error ShouldOnlyWithdrawInFirstHalf();
    error WrongListHash();
    error OnlySubmitterCanWithdraw();
    error WithdrawingTimeHasPassed();
    error AlreadyDisputed();
    error OnlyArbitratorAllowed();
    error NotDisputed();
    error RulingOutOfBounds();
    error SubmissionNotApproved();
    error TimeToExecuteHasPassed();
    error AlreadyExecuted();
}
