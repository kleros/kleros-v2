import { Contract } from "@ethersproject/contracts";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { BigNumber } from "ethers";
import { getContractOrDeploy } from "./getContractOrDeploy";

export const deployERC20AndFaucet = async (
  hre: HardhatRuntimeEnvironment,
  deployer: string,
  ticker: string,
  faucetFundingAmount: BigNumber = hre.ethers.utils.parseUnits("100000")
): Promise<Contract> => {
  let erc20 = await hre.ethers.getContractOrNull(ticker);
  if (erc20) {
    return erc20;
  }
  erc20 = await getContractOrDeploy(hre, ticker, {
    from: deployer,
    contract: "TestERC20",
    args: [ticker, ticker],
    log: true,
  });
  const faucet = await getContractOrDeploy(hre, `${ticker}Faucet`, {
    from: deployer,
    contract: "Faucet",
    args: [erc20.address],
    log: true,
  });
  const faucetBalance = await erc20.balanceOf(faucet.address);
  const deployerBalance = await erc20.balanceOf(deployer);
  if (deployerBalance.gte(faucetFundingAmount) && faucetBalance.isZero()) {
    console.log(`funding ${ticker}Faucet with ${faucetFundingAmount}`);
    await erc20.transfer(faucet.address, faucetFundingAmount);
  }
  return erc20;
};
