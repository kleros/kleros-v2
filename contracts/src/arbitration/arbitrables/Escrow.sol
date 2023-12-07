// SPDX-License-Identifier: MIT

/// @authors: [@unknownunknown1, @fnanni-0, @shalzz, @jaybuidl]
/// @reviewers: []
/// @auditors: []
/// @bounties: []

pragma solidity 0.8.18;

import {IArbitrableV2, IArbitratorV2} from "../interfaces/IArbitrableV2.sol";
import "../interfaces/IDisputeTemplateRegistry.sol";

/// @title Escrow
/// @dev MultipleArbitrableTransaction contract that is compatible with V2.
///      Adapted from https://github.com/kleros/kleros-interaction/blob/master/contracts/standard/arbitration/MultipleArbitrableTransaction.sol
contract Escrow is IArbitrableV2 {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    enum Party {
        None,
        Sender,
        Receiver
    }

    enum Status {
        NoDispute,
        WaitingSender,
        WaitingReceiver,
        DisputeCreated,
        TransactionResolved
    }

    enum Resolution {
        TransactionExecuted,
        TimeoutBySender,
        TimeoutByReceiver,
        RulingEnforced
    }

    struct Transaction {
        address payable sender;
        address payable receiver;
        uint256 amount;
        uint256 deadline; // Timestamp at which the transaction can be automatically executed if not disputed.
        uint256 disputeID; // If dispute exists, the ID of the dispute.
        uint256 senderFee; // Total fees paid by the sender.
        uint256 receiverFee; // Total fees paid by the receiver.
        uint256 lastInteraction; // Last interaction for the dispute procedure.
        string templateData;
        string templateDataMappings;
        Status status;
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 public constant AMOUNT_OF_CHOICES = 2;
    address public immutable governor;
    IArbitratorV2 public arbitrator; // Address of the arbitrator contract.
    bytes public arbitratorExtraData; // Extra data to set up the arbitration.
    IDisputeTemplateRegistry public templateRegistry; // The dispute template registry.
    uint256 public templateId; // The current dispute template identifier.
    uint256 public immutable feeTimeout; // Time in seconds a party can take to pay arbitration fees before being considered unresponsive and lose the dispute.
    Transaction[] public transactions; // List of all created transactions.
    mapping(uint256 => uint256) public disputeIDtoTransactionID; // Naps dispute ID to tx ID.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @dev To be emitted when a party pays or reimburses the other.
    /// @param _transactionID The index of the transaction.
    /// @param _amount The amount paid.
    /// @param _party The party that paid.
    event Payment(uint256 indexed _transactionID, uint256 _amount, address _party);

    /// @dev Indicate that a party has to pay a fee or would otherwise be considered as losing.
    /// @param _transactionID The index of the transaction.
    /// @param _party The party who has to pay.
    event HasToPayFee(uint256 indexed _transactionID, Party _party);

    /// @dev Emitted when a transaction is created.
    /// @param _transactionID The index of the transaction.
    /// @param _sender The address of the sender.
    /// @param _receiver The address of the receiver.
    /// @param _amount The initial amount in the transaction.
    event TransactionCreated(
        uint256 indexed _transactionID,
        address indexed _sender,
        address indexed _receiver,
        uint256 _amount
    );

    /// @dev To be emitted when a transaction is resolved, either by its
    ///      execution, a timeout or because a ruling was enforced.
    /// @param _transactionID The ID of the respective transaction.
    /// @param _resolution Short description of what caused the transaction to be solved.
    event TransactionResolved(uint256 indexed _transactionID, Resolution indexed _resolution);

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        if (governor != msg.sender) revert GovernorOnly();
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @dev Constructor.
    /// @param _arbitrator The arbitrator of the contract.
    /// @param _arbitratorExtraData Extra data for the arbitrator.
    /// @param _templateData The dispute template data.
    /// @param _templateDataMappings The dispute template data mappings.
    /// @param _templateRegistry The dispute template registry.
    /// @param _feeTimeout Arbitration fee timeout for the parties.
    constructor(
        IArbitratorV2 _arbitrator,
        bytes memory _arbitratorExtraData,
        string memory _templateData,
        string memory _templateDataMappings,
        IDisputeTemplateRegistry _templateRegistry,
        uint256 _feeTimeout
    ) {
        governor = msg.sender;
        arbitrator = _arbitrator;
        arbitratorExtraData = _arbitratorExtraData;
        templateRegistry = _templateRegistry;
        feeTimeout = _feeTimeout;

        templateId = templateRegistry.setDisputeTemplate("", _templateData, _templateDataMappings);
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    function changeArbitrator(IArbitratorV2 _arbitrator) external onlyByGovernor {
        arbitrator = _arbitrator;
    }

    function changeArbitratorExtraData(bytes calldata _arbitratorExtraData) external onlyByGovernor {
        arbitratorExtraData = _arbitratorExtraData;
    }

    function changeTemplateRegistry(IDisputeTemplateRegistry _templateRegistry) external onlyByGovernor {
        templateRegistry = _templateRegistry;
    }

    function changeDisputeTemplate(
        string memory _templateData,
        string memory _templateDataMappings
    ) external onlyByGovernor {
        templateId = templateRegistry.setDisputeTemplate("", _templateData, _templateDataMappings);
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @dev Create a transaction.
    /// @param _timeoutPayment Time after which a party can automatically execute the arbitrable transaction.
    /// @param _receiver The recipient of the transaction.
    /// @param _templateData The dispute template data.
    /// @param _templateDataMappings The dispute template data mappings.
    /// @return transactionID The index of the transaction.
    function createTransaction(
        uint256 _timeoutPayment,
        address payable _receiver,
        string memory _templateData,
        string memory _templateDataMappings
    ) external payable returns (uint256 transactionID) {
        Transaction storage transaction = transactions.push();
        transaction.sender = payable(msg.sender);
        transaction.receiver = _receiver;
        transaction.amount = msg.value;
        transaction.deadline = block.timestamp + _timeoutPayment;
        transaction.templateData = _templateData;
        transaction.templateDataMappings = _templateDataMappings;

        transactionID = transactions.length - 1;

        emit TransactionCreated(transactionID, msg.sender, _receiver, msg.value);
    }

    /// @dev Pay receiver. To be called if the good or service is provided.
    /// @param _transactionID The index of the transaction.
    /// @param _amount Amount to pay in wei.
    function pay(uint256 _transactionID, uint256 _amount) external {
        Transaction storage transaction = transactions[_transactionID];
        if (transaction.sender != msg.sender) revert SenderOnly();
        if (transaction.status != Status.NoDispute) revert TransactionDisputed();
        if (_amount > transaction.amount) revert MaximumPaymentAmountExceeded();

        transaction.receiver.send(_amount); // It is the user responsibility to accept ETH.
        transaction.amount -= _amount;

        emit Payment(_transactionID, _amount, msg.sender);
    }

    /// @dev Reimburse sender. To be called if the good or service can't be fully provided.
    /// @param _transactionID The index of the transaction.
    /// @param _amountReimbursed Amount to reimburse in wei.
    function reimburse(uint256 _transactionID, uint256 _amountReimbursed) external {
        Transaction storage transaction = transactions[_transactionID];
        if (transaction.receiver != msg.sender) revert ReceiverOnly();
        if (transaction.status != Status.NoDispute) revert TransactionDisputed();
        if (_amountReimbursed > transaction.amount) revert MaximumPaymentAmountExceeded();

        transaction.sender.send(_amountReimbursed); // It is the user responsibility to accept ETH.
        transaction.amount -= _amountReimbursed;

        emit Payment(_transactionID, _amountReimbursed, msg.sender);
    }

    /// @dev Transfer the transaction's amount to the receiver if the timeout has passed.
    /// @param _transactionID The index of the transaction.
    function executeTransaction(uint256 _transactionID) external {
        Transaction storage transaction = transactions[_transactionID];
        if (block.timestamp < transaction.deadline) revert DeadlineNotPassed();
        if (transaction.status != Status.NoDispute) revert TransactionDisputed();

        transaction.receiver.send(transaction.amount); // It is the user responsibility to accept ETH.
        transaction.amount = 0;
        transaction.status = Status.TransactionResolved;

        emit TransactionResolved(_transactionID, Resolution.TransactionExecuted);
    }

    /// @dev Pay the arbitration fee to raise a dispute. To be called by the sender.
    /// Note that the arbitrator can have createDispute throw, which will make
    ///      this function throw and therefore lead to a party being timed-out.
    ///      This is not a vulnerability as the arbitrator can rule in favor of one party anyway.
    /// @param _transactionID The index of the transaction.
    function payArbitrationFeeBySender(uint256 _transactionID) external payable {
        Transaction storage transaction = transactions[_transactionID];
        if (transaction.status >= Status.DisputeCreated) revert DisputeAlreadyCreatedOrTransactionAlreadyExecuted();
        if (msg.sender != transaction.sender) revert SenderOnly();

        transaction.senderFee += msg.value;
        uint256 arbitrationCost = arbitrator.arbitrationCost(arbitratorExtraData);
        if (transaction.senderFee < arbitrationCost) revert SenderFeeNotCoverArbitrationCosts();

        transaction.lastInteraction = block.timestamp;

        if (transaction.receiverFee < arbitrationCost) {
            // The receiver still has to pay. This can also happen if he has paid, but arbitrationCost has increased.
            transaction.status = Status.WaitingReceiver;
            emit HasToPayFee(_transactionID, Party.Receiver);
        } else {
            // The receiver has also paid the fee. We create the dispute.
            raiseDispute(_transactionID, arbitrationCost);
        }
    }

    /// @dev Pay the arbitration fee to raise a dispute. To be called by the receiver.
    /// Note that this function mirrors payArbitrationFeeBySender.
    /// @param _transactionID The index of the transaction.
    function payArbitrationFeeByReceiver(uint256 _transactionID) external payable {
        Transaction storage transaction = transactions[_transactionID];
        if (transaction.status >= Status.DisputeCreated) revert DisputeAlreadyCreatedOrTransactionAlreadyExecuted();
        if (msg.sender != transaction.receiver) revert ReceiverOnly();

        transaction.receiverFee += msg.value;
        uint256 arbitrationCost = arbitrator.arbitrationCost(arbitratorExtraData);
        if (transaction.receiverFee < arbitrationCost) revert ReceiverFeeNotCoverArbitrationCosts();

        transaction.lastInteraction = block.timestamp;

        if (transaction.senderFee < arbitrationCost) {
            // The sender still has to pay. This can also happen if he has paid, but arbitrationCost has increased.
            transaction.status = Status.WaitingSender;
            emit HasToPayFee(_transactionID, Party.Sender);
        } else {
            // The sender has also paid the fee. We create the dispute.
            raiseDispute(_transactionID, arbitrationCost);
        }
    }

    /// @dev Reimburse sender if receiver fails to pay the fee.
    /// @param _transactionID The index of the transaction.
    function timeOutBySender(uint256 _transactionID) external {
        Transaction storage transaction = transactions[_transactionID];
        if (transaction.status != Status.WaitingReceiver) revert NotWaitingForReceiverFees();
        if (block.timestamp - transaction.lastInteraction < feeTimeout) revert TimeoutNotPassed();

        if (transaction.receiverFee != 0) {
            transaction.receiver.send(transaction.receiverFee); // It is the user responsibility to accept ETH.
            transaction.receiverFee = 0;
        }
        executeRuling(_transactionID, uint256(Party.Sender));
        emit TransactionResolved(_transactionID, Resolution.TimeoutBySender);
    }

    /// @dev Pay receiver if sender fails to pay the fee.
    /// @param _transactionID The index of the transaction.
    function timeOutByReceiver(uint256 _transactionID) external {
        Transaction storage transaction = transactions[_transactionID];
        if (transaction.status != Status.WaitingSender) revert NotWaitingForSenderFees();
        if (block.timestamp - transaction.lastInteraction < feeTimeout) revert TimeoutNotPassed();

        if (transaction.senderFee != 0) {
            transaction.sender.send(transaction.senderFee); // It is the user responsibility to accept ETH.
            transaction.senderFee = 0;
        }

        executeRuling(_transactionID, uint256(Party.Receiver));
        emit TransactionResolved(_transactionID, Resolution.TimeoutByReceiver);
    }

    /// @dev Give a ruling for a dispute. Must be called by the arbitrator to enforce the final ruling.
    ///      The purpose of this function is to ensure that the address calling it has the right to rule on the contract.
    /// @param _disputeID ID of the dispute in the Arbitrator contract.
    /// @param _ruling Ruling given by the arbitrator. Note that 0 is reserved
    /// for "Refuse to arbitrate".
    function rule(uint256 _disputeID, uint256 _ruling) external override {
        if (msg.sender != address(arbitrator)) revert ArbitratorOnly();
        if (_ruling > AMOUNT_OF_CHOICES) revert InvalidRuling();

        uint256 transactionID = disputeIDtoTransactionID[_disputeID];
        Transaction storage transaction = transactions[transactionID];
        if (transaction.status != Status.DisputeCreated) revert DisputeAlreadyResolved();

        emit Ruling(arbitrator, _disputeID, _ruling);
        executeRuling(transactionID, _ruling);
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /// @dev Create a dispute.
    /// @param _transactionID The index of the transaction.
    /// @param _arbitrationCost Amount to pay the arbitrator.
    function raiseDispute(uint256 _transactionID, uint256 _arbitrationCost) internal {
        Transaction storage transaction = transactions[_transactionID];
        transaction.status = Status.DisputeCreated;
        transaction.disputeID = arbitrator.createDispute{value: _arbitrationCost}(
            AMOUNT_OF_CHOICES,
            arbitratorExtraData
        );
        disputeIDtoTransactionID[transaction.disputeID] = _transactionID;
        emit DisputeRequest(arbitrator, transaction.disputeID, _transactionID, templateId, "");

        // Refund sender if he overpaid.
        if (transaction.senderFee > _arbitrationCost) {
            uint256 extraFeeSender = transaction.senderFee - _arbitrationCost;
            transaction.senderFee = _arbitrationCost;
            transaction.sender.send(extraFeeSender); // It is the user responsibility to accept ETH.
        }

        // Refund receiver if he overpaid.
        if (transaction.receiverFee > _arbitrationCost) {
            uint256 extraFeeReceiver = transaction.receiverFee - _arbitrationCost;
            transaction.receiverFee = _arbitrationCost;
            transaction.receiver.send(extraFeeReceiver); // It is the user responsibility to accept ETH.
        }
    }

    /// @dev Execute a ruling of a dispute. It reimburses the fee to the winning party.
    /// @param _transactionID The index of the transaction.
    /// @param _ruling Ruling given by the arbitrator. 1 : Reimburse the receiver. 2 : Pay the sender.
    function executeRuling(uint256 _transactionID, uint256 _ruling) internal {
        Transaction storage transaction = transactions[_transactionID];
        // Give the arbitration fee back.
        // Note that we use send to prevent a party from blocking the execution.
        if (_ruling == uint256(Party.Sender)) {
            transaction.sender.send(transaction.senderFee + transaction.amount);
        } else if (_ruling == uint256(Party.Receiver)) {
            transaction.receiver.send(transaction.receiverFee + transaction.amount);
        } else {
            uint256 splitAmount = (transaction.senderFee + transaction.amount) / 2;
            transaction.sender.send(splitAmount);
            transaction.receiver.send(splitAmount);
        }

        transaction.amount = 0;
        transaction.senderFee = 0;
        transaction.receiverFee = 0;
        transaction.status = Status.TransactionResolved;

        emit TransactionResolved(_transactionID, Resolution.RulingEnforced);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @dev Getter to know the count of transactions.
    /// @return The count of transactions.
    function getCountTransactions() external view returns (uint256) {
        return transactions.length;
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error GovernorOnly();
    error SenderOnly();
    error ReceiverOnly();
    error ArbitratorOnly();
    error TransactionDisputed();
    error MaximumPaymentAmountExceeded();
    error DisputeAlreadyCreatedOrTransactionAlreadyExecuted();
    error DeadlineNotPassed();
    error SenderFeeNotCoverArbitrationCosts();
    error ReceiverFeeNotCoverArbitrationCosts();
    error NotWaitingForReceiverFees();
    error NotWaitingForSenderFees();
    error TimeoutNotPassed();
    error InvalidRuling();
    error DisputeAlreadyResolved();
}
