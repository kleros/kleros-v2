const ethers = require("ethers");
// explicity exporting ethers from here removes the error for siwe library.
module.exports = {
  ...ethers,
};
