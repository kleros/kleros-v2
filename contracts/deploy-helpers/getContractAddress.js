const { BN, Address, toChecksumAddress } = require("ethereumjs-util");

/**
 * Gets the address of a soon to be deployed contract.
 * @param {string} deployer The address of the deployer account.
 * @param {number|BN} nonce The current nonce for the deployer account.
 * @return {string} The address of a contract if it is deployed in the next transaction sent by the deployer account.
 */
function getContractAddress(deployer, nonce) {
  const deployAddress = Address.generate(Address.fromString(deployer), new BN(String(nonce)));
  return toChecksumAddress(deployAddress.toString());
}

module.exports = getContractAddress;
