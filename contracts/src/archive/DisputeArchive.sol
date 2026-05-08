// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title DisputeArchive
/// @notice Stores and emits archived dispute data ipfs cid
contract DisputeArchive {
    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /**
     * @param id Id of the archived dispute
     * @param cid Ipfs cid containing the populated dispute + dispute evidences + kleros core subgraph data
     */
    event ArchivedDispute(uint256 indexed id, string cid);

    /**
     * @param id Id of the amended archived dispute
     * @param cid Amended ipfs cid
     * @param reason Reason for the amendment
     */
    event ArchivedDisputeAmended(uint256 indexed id, string cid, string reason);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public owner;
    mapping(uint256 => string) public archivedDisputeToCid; // Maps disputeId to the latest archived data's ipfs cid.

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    constructor() {
        owner = msg.sender;
    }

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyOwner() {
        require(msg.sender == owner, OnlyOwner());
        _;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @notice Updates the owner address.
    /// @param newOwner The new owner address.
    function updateOwner(address newOwner) external onlyOwner {
        owner = newOwner;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Stores archived dispute's ipfs cid.
    /// @param id ID of dispute to be archived.
    /// @param cid Archived dispute data's ipfs cid.
    function register(uint256 id, string calldata cid) external onlyOwner {
        require(bytes(archivedDisputeToCid[id]).length == 0, DisputeAlreadyArchived());
        require(bytes(cid).length > 0, CIDCannotBeEmpty());

        archivedDisputeToCid[id] = cid;
        emit ArchivedDispute(id, cid);
    }

    /// @notice Amends archived dispute's ipfs cid.
    /// @param id ID of archived dispute to be amended.
    /// @param cid Amended dispute data's ipfs cid.
    /// @param reason Reason for the amendment.
    function amend(uint256 id, string calldata cid, string calldata reason) external onlyOwner {
        require(bytes(archivedDisputeToCid[id]).length > 0, DisputeNotInArchive());
        require(bytes(cid).length > 0, CIDCannotBeEmpty());

        archivedDisputeToCid[id] = cid;
        emit ArchivedDisputeAmended(id, cid, reason);
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error OnlyOwner();
    error DisputeNotInArchive();
    error DisputeAlreadyArchived();
    error CIDCannotBeEmpty();
}
