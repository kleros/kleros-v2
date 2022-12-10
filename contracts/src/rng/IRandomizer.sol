// Randomizer protocol interface
interface IRandomizer {
    function request(uint256 callbackGasLimit) external returns (uint256);

    function clientWithdrawTo(address _to, uint256 _amount) external;
}
