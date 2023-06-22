// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../IArbitrable.sol";
import "../../evidence/IMetaEvidence.sol";

/// @title ArbitrableExample
/// An example of an arbitrable contract which connects to the arbitator that implements the updated interface.
contract ArbitrableExample is IArbitrable, IMetaEvidence {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct DisputeStruct {
        bool isRuled; // Whether the dispute has been ruled or not.
        uint256 ruling; // Ruling given by the arbitrator.
        uint256 numberOfRulingOptions; // The number of choices the arbitrator can give.
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public immutable governor;
    IArbitrator public arbitrator; // Arbitrator is set in constructor and never changed.
    IERC20 public immutable weth; // The WETH token.
    mapping(uint256 => uint256) public externalIDtoLocalID; // Maps external (arbitrator side) dispute IDs to local dispute IDs.
    DisputeStruct[] public disputes; // Stores the disputes' info. disputes[disputeID].

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @dev Constructor
    /// @param _arbitrator The arbitrator to rule on created disputes.
    /// @param _metaEvidenceID Unique identifier of meta-evidence.
    /// @param _metaEvidence The URI of the meta evidence object for evidence submissions requests.
    constructor(IArbitrator _arbitrator, uint256 _metaEvidenceID, string memory _metaEvidence, IERC20 _weth) {
        governor = msg.sender;
        arbitrator = _arbitrator;
        weth = _weth;
        emit MetaEvidence(_metaEvidenceID, _metaEvidence);
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    function changeMetaEvidence(uint256 _metaEvidenceID, string memory _metaEvidence) external {
        require(msg.sender == governor, "Not authorized: governor only.");
        emit MetaEvidence(_metaEvidenceID, _metaEvidence);
    }

    function changeArbitrator(IArbitrator _arbitrator) external {
        require(msg.sender == governor, "Not authorized: governor only.");
        arbitrator = _arbitrator;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @dev TRUSTED. Creates a dispute with the arbitrator and pays for the fees in the native currency, typically ETH.
    /// Note that we don’t need to check that msg.value is enough to pay arbitration fees as it’s the responsibility of the arbitrator contract.
    /// @param _numberOfRulingOptions Number of ruling options. Must be greater than 1, otherwise there is nothing to choose from.
    /// @param _arbitratorExtraData Extra data for the arbitrator.
    /// @param _metaEvidenceID Unique identifier of meta-evidence.
    /// @param _evidenceGroupID Unique identifier of the evidence group that is linked to this dispute.
    /// @return disputeID Dispute id (on arbitrator side) of the dispute created.
    function createDispute(
        uint256 _numberOfRulingOptions,
        bytes calldata _arbitratorExtraData,
        uint256 _metaEvidenceID,
        uint256 _evidenceGroupID
    ) external payable returns (uint256 disputeID) {
        require(_numberOfRulingOptions > 1, "Incorrect number of choices");

        uint256 localDisputeID = disputes.length;
        disputes.push(DisputeStruct({isRuled: false, ruling: 0, numberOfRulingOptions: _numberOfRulingOptions}));

        disputeID = arbitrator.createDispute{value: msg.value}(_numberOfRulingOptions, _arbitratorExtraData);
        externalIDtoLocalID[disputeID] = localDisputeID;

        emit Dispute(arbitrator, disputeID, _metaEvidenceID, _evidenceGroupID);
    }

    /// @dev TRUSTED. Creates a dispute with the arbitrator and pays for the fees in WETH token.
    /// Note that we don’t need to check that _feeInWeth is enough to pay arbitration fees as it’s the responsibility of the arbitrator contract.
    /// @param _numberOfRulingOptions Number of ruling options. Must be greater than 1, otherwise there is nothing to choose from.
    /// @param _arbitratorExtraData Extra data for the arbitrator.
    /// @param _metaEvidenceID Unique identifier of meta-evidence.
    /// @param _evidenceGroupID Unique identifier of the evidence group that is linked to this dispute.
    /// @param _feeInWeth Amount of fees in WETH for the arbitrator.
    /// @return disputeID Dispute id (on arbitrator side) of the dispute created.
    function createDispute(
        uint256 _numberOfRulingOptions,
        bytes calldata _arbitratorExtraData,
        uint256 _metaEvidenceID,
        uint256 _evidenceGroupID,
        uint256 _feeInWeth
    ) external payable returns (uint256 disputeID) {
        require(_numberOfRulingOptions > 1, "Incorrect number of choices");

        uint256 localDisputeID = disputes.length;
        disputes.push(DisputeStruct({isRuled: false, ruling: 0, numberOfRulingOptions: _numberOfRulingOptions}));

        require(_safeTransferFrom(weth, msg.sender, address(this), _feeInWeth), "Transfer failed");
        require(_increaseAllowance(weth, address(arbitrator), _feeInWeth), "Allowance increase failed");

        disputeID = arbitrator.createDispute(_numberOfRulingOptions, _arbitratorExtraData, weth, _feeInWeth);
        externalIDtoLocalID[disputeID] = localDisputeID;

        emit Dispute(arbitrator, disputeID, _metaEvidenceID, _evidenceGroupID);
    }

    /// @dev To be called by the arbitrator of the dispute, to declare the winning ruling.
    /// @param _externalDisputeID ID of the dispute in arbitrator contract.
    /// @param _ruling The ruling choice of the arbitration.
    function rule(uint256 _externalDisputeID, uint256 _ruling) external override {
        uint256 localDisputeID = externalIDtoLocalID[_externalDisputeID];
        DisputeStruct storage dispute = disputes[localDisputeID];
        require(msg.sender == address(arbitrator), "Only the arbitrator can execute this.");
        require(_ruling <= dispute.numberOfRulingOptions, "Invalid ruling.");
        require(dispute.isRuled == false, "This dispute has been ruled already.");

        dispute.isRuled = true;
        dispute.ruling = _ruling;

        emit Ruling(IArbitrator(msg.sender), _externalDisputeID, dispute.ruling);
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /// @dev Increases the allowance granted to `spender` by the caller.
    /// @param _token Token to transfer.
    /// @param _spender The address which will spend the funds.
    /// @param _addedValue The amount of tokens to increase the allowance by.
    function _increaseAllowance(IERC20 _token, address _spender, uint256 _addedValue) public virtual returns (bool) {
        _token.approve(_spender, _token.allowance(address(this), _spender) + _addedValue);
        return true;
    }

    /// @dev Calls transferFrom() without reverting.
    /// @param _token Token to transfer.
    /// @param _from Sender address.
    /// @param _to Recepient address.
    /// @param _value Amount transferred.
    /// @return Whether transfer succeeded or not.
    function _safeTransferFrom(IERC20 _token, address _from, address _to, uint256 _value) internal returns (bool) {
        (bool success, bytes memory data) = address(_token).call(
            abi.encodeCall(IERC20.transferFrom, (_from, _to, _value))
        );
        return (success && (data.length == 0 || abi.decode(data, (bool))));
    }
}
