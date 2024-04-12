import { Contract } from "@ethersproject/contracts";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { BigNumber } from "ethers";
import { getContractOrDeploy } from "./getContractOrDeploy";
import { isMainnet } from ".";

export const deployERC20AndFaucet = async (
  hre: HardhatRuntimeEnvironment,
  deployer: string,
  ticker: string,
  faucetFundingAmount: BigNumber = hre.ethers.utils.parseUnits("100000")
): Promise<Contract> => {
  const erc20 = await deployERC20(hre, deployer, ticker);
  if (!isMainnet(hre.network)) {
    await deployFaucet(hre, deployer, ticker, erc20, faucetFundingAmount);
  }
  return erc20;
};

export const deployERC20 = async (
  hre: HardhatRuntimeEnvironment,
  deployer: string,
  ticker: string
): Promise<Contract> => {
  return await getContractOrDeploy(hre, ticker, {
    from: deployer,
    contract: "TestERC20",
    args: [ticker, ticker],
    log: true,
  });
};

export const deployFaucet = async (
  hre: HardhatRuntimeEnvironment,
  deployer: string,
  ticker: string,
  erc20: Contract,
  faucetFundingAmount: BigNumber
): Promise<void> => {
  const faucet = await getContractOrDeploy(hre, `${ticker}Faucet`, {
    from: deployer,
    contract: "Faucet",
    args: [erc20.address],
    log: true,
  });
  const faucetBalance = await erc20.balanceOf(faucet.address);
  const deployerBalance = await erc20.balanceOf(deployer);
  if (deployerBalance.gte(faucetFundingAmount) && faucetBalance.lt(faucetFundingAmount.div(5))) {
    // Fund the faucet if deployer has enough tokens and if the faucet has less than 20% of the faucetFundingAmount
    console.log(`funding ${ticker}Faucet with ${faucetFundingAmount}`);
    await erc20.transfer(faucet.address, faucetFundingAmount);
  }
};

export const deployERC721 = async (
  hre: HardhatRuntimeEnvironment,
  deployer: string,
  name: string,
  ticker: string
): Promise<Contract> => {
  return getContractOrDeploy(hre, ticker, {
    from: deployer,
    contract: "TestERC721",
    args: [name, ticker],
    log: true,
  });
};
