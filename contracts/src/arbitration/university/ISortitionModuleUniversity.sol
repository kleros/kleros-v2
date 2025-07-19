// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ISortitionModule} from "../interfaces/ISortitionModule.sol";

interface ISortitionModuleUniversity is ISortitionModule {
    function setTransientJuror(address _juror) external;
}
