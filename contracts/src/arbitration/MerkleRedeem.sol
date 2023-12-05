// SPDX-License-Identifier: MIT

/**
 * Original code taken from: https://github.com/balancer-labs/erc20-redeemable/blob/13d478a043ec7bfce7abefe708d027dfe3e2ea84/merkle/contracts/MerkleRedeem.sol
 * Only comments and events were added, some variable names changed for clarity and the compiler version was upgraded to 0.8.x.
 */
pragma solidity 0.8.18;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Distribution of tokens in a recurrent fashion.
contract MerkleRedeem is Ownable {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct Claim {
        uint week; // The week the claim is related to.
        uint balance; // The amount being claimed.
        bytes32[] merkleProof; // The merkle proof for the claim, sorted from the leaf to the root of the tree.
    }

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @dev To be emitted when a claim is made.
    /// @param _claimant The address of the claimant.
    /// @param _balance The amount being claimed.
    event Claimed(address _claimant, uint256 _balance);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    IERC20 public token; // The address of the token being distributed.
    mapping(uint => bytes32) public weekMerkleRoots; // The merkle roots of each week. weekMerkleRoots[week].
    mapping(uint => mapping(address => bool)) public claimed; // Keeps track of the claim status for the given period and claimant. claimed[period][claimant].

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @param _token The address of the token being distributed.
    constructor(address _token) {
        token = IERC20(_token);
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Seeds a new round for the airdrop.
    /// @dev Will transfer tokens from the owner to this contract.
    /// @param _week The airdrop week.
    /// @param _merkleRoot The merkle root of the claims for that period.
    /// @param _totalAllocation The amount of tokens allocated for the distribution.
    function seedAllocations(uint _week, bytes32 _merkleRoot, uint _totalAllocation) external onlyOwner {
        require(weekMerkleRoots[_week] == bytes32(0), "cannot rewrite merkle root");
        weekMerkleRoots[_week] = _merkleRoot;

        require(token.transferFrom(msg.sender, address(this), _totalAllocation), "ERR_TRANSFER_FAILED");
    }

    /// @notice Makes a claim for a given claimant in a week.
    /// @param _liquidityProvider The address of the claimant.
    /// @param _week The week for the claim.
    /// @param _claimedBalance The amount being claimed.
    /// @param _merkleProof The merkle proof for the claim, sorted from the leaf to the root of the tree.
    function claimWeek(
        address _liquidityProvider,
        uint _week,
        uint _claimedBalance,
        bytes32[] memory _merkleProof
    ) public {
        require(!claimed[_week][_liquidityProvider]);
        require(verifyClaim(_liquidityProvider, _week, _claimedBalance, _merkleProof), "Incorrect merkle proof");

        claimed[_week][_liquidityProvider] = true;
        disburse(_liquidityProvider, _claimedBalance);
    }

    /// @notice Makes multiple claims for a given claimant.
    /// @param _liquidityProvider The address of the claimant.
    /// @param claims An array of claims containing the week, balance and the merkle proof.
    function claimWeeks(address _liquidityProvider, Claim[] memory claims) public {
        uint totalBalance = 0;
        Claim memory claim;
        for (uint i = 0; i < claims.length; i++) {
            claim = claims[i];

            require(!claimed[claim.week][_liquidityProvider]);
            require(
                verifyClaim(_liquidityProvider, claim.week, claim.balance, claim.merkleProof),
                "Incorrect merkle proof"
            );

            totalBalance += claim.balance;
            claimed[claim.week][_liquidityProvider] = true;
        }
        disburse(_liquidityProvider, totalBalance);
    }

    /// @notice Gets the claim status for given claimant from `_begin` to `_end` weeks.
    /// @param _liquidityProvider The address of the claimant.
    /// @param _begin The week to start with (inclusive).
    /// @param _end The week to end with (inclusive).
    function claimStatus(address _liquidityProvider, uint _begin, uint _end) external view returns (bool[] memory) {
        uint size = 1 + _end - _begin;
        bool[] memory arr = new bool[](size);
        for (uint i = 0; i < size; i++) {
            arr[i] = claimed[_begin + i][_liquidityProvider];
        }
        return arr;
    }

    /// @notice Gets all merkle roots for from `_begin` to `_end` weeks.
    /// @param _begin The week to start with (inclusive).
    /// @param _end The week to end with (inclusive).
    function merkleRoots(uint _begin, uint _end) external view returns (bytes32[] memory) {
        uint size = 1 + _end - _begin;
        bytes32[] memory arr = new bytes32[](size);
        for (uint i = 0; i < size; i++) {
            arr[i] = weekMerkleRoots[_begin + i];
        }
        return arr;
    }

    /// @notice Verifies a claim.
    /// @param _liquidityProvider The address of the claimant.
    /// @param _week The week for the claim.
    /// @param _claimedBalance The amount being claimed.
    /// @param _merkleProof The merkle proof for the claim, sorted from the leaf to the root of the tree.
    function verifyClaim(
        address _liquidityProvider,
        uint _week,
        uint _claimedBalance,
        bytes32[] memory _merkleProof
    ) public view returns (bool valid) {
        bytes32 leaf = keccak256(abi.encodePacked(_liquidityProvider, _claimedBalance));
        return MerkleProof.verify(_merkleProof, weekMerkleRoots[_week], leaf);
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /// @dev Effectively pays a claimant.
    /// @param _liquidityProvider The address of the claimant.
    /// @param _balance The amount being claimed.
    function disburse(address _liquidityProvider, uint _balance) private {
        if (_balance > 0) {
            emit Claimed(_liquidityProvider, _balance);
            require(token.transfer(_liquidityProvider, _balance), "ERR_TRANSFER_FAILED");
        }
    }
}
