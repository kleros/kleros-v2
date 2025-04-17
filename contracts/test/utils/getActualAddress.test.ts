import { expect } from "chai";
import { getActualAddress } from "./getActualAddress";

describe("getActualAddress", () => {
  it("should return the correct address for KlerosCore on arbitrumSepoliaDevnet", async () => {
    const address = await getActualAddress("arbitrumSepoliaDevnet", "KlerosCore");
    expect(address).to.match(/^0x[a-fA-F0-9]{40}$/);
    expect(address).to.not.equal("0x0000000000000000000000000000000000000000");
  });

  it("should throw error for non-existent network", async () => {
    await expect(getActualAddress("nonexistentNetwork", "KlerosCore")).to.be.rejectedWith(
      "No deployment file found for KlerosCore on nonexistentNetwork"
    );
  });

  it("should throw error for non-existent contract", async () => {
    await expect(getActualAddress("arbitrumSepoliaDevnet", "NonExistentContract")).to.be.rejectedWith(
      "No deployment file found for NonExistentContract on arbitrumSepoliaDevnet"
    );
  });
});
