import { Contract } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getContractOrDeploy } from "./getContractOrDeploy";
import { isMainnet } from ".";

export const deployERC20AndFaucet = async (
  hre: HardhatRuntimeEnvironment,
  deployer: string,
  ticker: string,
  faucetFundingAmount: bigint = hre.ethers.parseUnits("100000")
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
  faucetFundingAmount: bigint
): Promise<void> => {
  const faucet = await getContractOrDeploy(hre, `${ticker}Faucet`, {
    from: deployer,
    contract: "Faucet",
    args: [erc20.target],
    log: true,
  });

  const faucetBalance = await erc20.balanceOf(faucet.target);
  const deployerBalance = await erc20.balanceOf(deployer);
  if (deployerBalance >= faucetFundingAmount && faucetBalance < faucetFundingAmount / 5n) {
    // Fund the faucet if deployer has enough tokens and if the faucet has less than 20% of the faucetFundingAmount
    console.log(`funding ${ticker}Faucet with ${faucetFundingAmount}`);
    await erc20.transfer(faucet.target, faucetFundingAmount);
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
