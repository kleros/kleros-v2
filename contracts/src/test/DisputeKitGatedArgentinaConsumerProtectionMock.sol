// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {DisputeKitGatedArgentinaConsumerProtection} from "../arbitration/dispute-kits/DisputeKitGatedArgentinaConsumerProtection.sol";

/// @title DisputeKitGatedArgentinaConsumerProtectionMock
/// DisputeKitGatedArgentinaConsumerProtection with governance functions to use in the tests.
contract DisputeKitGatedArgentinaConsumerProtectionMock is DisputeKitGatedArgentinaConsumerProtection {
    /// @notice Changes the accredited professional token.
    /// @param _accreditedProfessionalToken The address of the accredited lawyer token.
    function changeAccreditedProfessionalToken(address _accreditedProfessionalToken) external {
        accreditedProfessionalToken = _accreditedProfessionalToken;
    }

    /// @notice Changes the accredited consumer protection lawyer token.
    /// @param _accreditedConsumerProtectionLawyerToken The address of the accredited consumer protection lawyer token.
    function changeAccreditedConsumerProtectionLawyerToken(address _accreditedConsumerProtectionLawyerToken) external {
        accreditedConsumerProtectionLawyerToken = _accreditedConsumerProtectionLawyerToken;
    }
}
