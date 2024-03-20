const ethers = require("ethers");

const verifyMessage = ethers.utils ? ethers.utils.verifyMessage : null;
const hashMessage = ethers.utils ? ethers.utils.hashMessage : null;
const getAddress = ethers.utils ? ethers.utils.getAddress : null;

module.exports = {
  ...ethers,
  verifyMessage,
};
