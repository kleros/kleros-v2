import { assert, describe, test, clearStore, afterEach, createMockedFunction } from "matchstick-as/assembly/index";
import { BigInt, Address, ethereum } from "@graphprotocol/graph-ts";
import {
  ensureFeeToken,
  updateFeeTokenRate,
  updateFeeTokenPaid,
  convertEthToTokenAmount,
  convertTokenAmountToEth,
} from "../src/entities/FeeToken";

const TOKEN_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";
const KLEROS_CORE_ADDRESS = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const RATES_CONVERTER_ADDRESS = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

function mockRatesConverterCalls(
  klerosCoreAddr: Address,
  ratesConverterAddr: Address,
  tokenAddr: Address,
  rateInEth: BigInt,
  rateDecimals: i32
): void {
  // Mock KlerosCore.ratesConverter() -> returns ratesConverter address
  createMockedFunction(klerosCoreAddr, "ratesConverter", "ratesConverter():(address)").returns([
    ethereum.Value.fromAddress(ratesConverterAddr),
  ]);

  // Mock RatesConverter.currencyRates(address) -> returns (uint64, uint8) tuple
  createMockedFunction(ratesConverterAddr, "currencyRates", "currencyRates(address):(uint64,uint8)")
    .withArgs([ethereum.Value.fromAddress(tokenAddr)])
    .returns([ethereum.Value.fromUnsignedBigInt(rateInEth), ethereum.Value.fromI32(rateDecimals)]);
}

describe("FeeToken - ensureFeeToken", () => {
  afterEach(() => {
    clearStore();
  });

  test("Creates a new FeeToken with correct default values", () => {
    const tokenAddress = Address.fromString(TOKEN_ADDRESS);
    const feeToken = ensureFeeToken(tokenAddress);
    feeToken.save();

    assert.entityCount("FeeToken", 1);
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "rateInEth", "0");
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "rateDecimals", "0");
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "totalPaid", "0");
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "totalPaidInETH", "0");
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "accepted", "false");
  });

  test("Returns existing FeeToken if already in store", () => {
    const tokenAddress = Address.fromString(TOKEN_ADDRESS);

    // Create and save an initial FeeToken with modified values
    const feeToken1 = ensureFeeToken(tokenAddress);
    feeToken1.rateInEth = BigInt.fromI32(5000);
    feeToken1.rateDecimals = 6;
    feeToken1.save();

    const feeToken2 = ensureFeeToken(tokenAddress);

    assert.bigIntEquals(BigInt.fromI32(5000), feeToken2.rateInEth);
    assert.i32Equals(6, feeToken2.rateDecimals);
  });

  test("Sets accepted to false by default (only AcceptedFeeToken handler sets it)", () => {
    const tokenAddress = Address.fromString(TOKEN_ADDRESS);
    const feeToken = ensureFeeToken(tokenAddress);
    feeToken.save();

    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "accepted", "false");
  });
});

describe("FeeToken - updateFeeTokenRate", () => {
  afterEach(() => {
    clearStore();
  });

  test("Updates rate from on-chain contract call", () => {
    const tokenAddress = Address.fromString(TOKEN_ADDRESS);
    const klerosCoreAddr = Address.fromString(KLEROS_CORE_ADDRESS);
    const ratesConverterAddr = Address.fromString(RATES_CONVERTER_ADDRESS);

    const onChainRate = BigInt.fromI32(2500);
    const onChainDecimals = 8;

    mockRatesConverterCalls(klerosCoreAddr, ratesConverterAddr, tokenAddress, onChainRate, onChainDecimals);

    let feeToken = ensureFeeToken(tokenAddress);
    feeToken.save();

    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "rateInEth", "0");
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "rateDecimals", "0");

    feeToken = updateFeeTokenRate(feeToken, klerosCoreAddr);

    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "rateInEth", "2500");
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "rateDecimals", "8");
  });

  test("Saves entity even when ratesConverter call reverts", () => {
    const tokenAddress = Address.fromString(TOKEN_ADDRESS);
    const klerosCoreAddr = Address.fromString(KLEROS_CORE_ADDRESS);

    createMockedFunction(klerosCoreAddr, "ratesConverter", "ratesConverter():(address)").reverts();

    let feeToken = ensureFeeToken(tokenAddress);
    feeToken.rateInEth = BigInt.fromI32(100);
    feeToken.save();

    feeToken = updateFeeTokenRate(feeToken, klerosCoreAddr);

    assert.entityCount("FeeToken", 1);
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "rateInEth", "100");
  });

  test("Saves entity even when currencyRates call reverts", () => {
    const tokenAddress = Address.fromString(TOKEN_ADDRESS);
    const klerosCoreAddr = Address.fromString(KLEROS_CORE_ADDRESS);
    const ratesConverterAddr = Address.fromString(RATES_CONVERTER_ADDRESS);

    createMockedFunction(klerosCoreAddr, "ratesConverter", "ratesConverter():(address)").returns([
      ethereum.Value.fromAddress(ratesConverterAddr),
    ]);

    createMockedFunction(ratesConverterAddr, "currencyRates", "currencyRates(address):(uint64,uint8)")
      .withArgs([ethereum.Value.fromAddress(tokenAddress)])
      .reverts();

    let feeToken = ensureFeeToken(tokenAddress);
    feeToken.rateInEth = BigInt.fromI32(200);
    feeToken.save();

    feeToken = updateFeeTokenRate(feeToken, klerosCoreAddr);

    assert.entityCount("FeeToken", 1);
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "rateInEth", "200");
  });
});

describe("FeeToken - updateFeeTokenPaid", () => {
  afterEach(() => {
    clearStore();
  });

  test("Updates totalPaid and totalPaidInETH correctly", () => {
    const tokenAddress = Address.fromString(TOKEN_ADDRESS);
    const klerosCoreAddr = Address.fromString(KLEROS_CORE_ADDRESS);
    const ratesConverterAddr = Address.fromString(RATES_CONVERTER_ADDRESS);

    // rate: 2e6 means 1 token = 2e6 / 1e6 = 2 ETH (with 6 decimals)
    const rateInEth = BigInt.fromI32(2000000);
    const rateDecimals = 6;

    mockRatesConverterCalls(klerosCoreAddr, ratesConverterAddr, tokenAddress, rateInEth, rateDecimals);

    const amount = BigInt.fromI32(500);

    updateFeeTokenPaid(tokenAddress, klerosCoreAddr, amount);

    assert.entityCount("FeeToken", 1);
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "totalPaid", "500");

    // ethAmount = tokenAmount * rateInEth / 10^rateDecimals = 500 * 2000000 / 1000000 = 1000
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "totalPaidInETH", "1000");
  });

  test("Accumulates totalPaid across multiple calls", () => {
    const tokenAddress = Address.fromString(TOKEN_ADDRESS);
    const klerosCoreAddr = Address.fromString(KLEROS_CORE_ADDRESS);
    const ratesConverterAddr = Address.fromString(RATES_CONVERTER_ADDRESS);

    const rateInEth = BigInt.fromI32(1000000); // 1 ETH per token (with 6 decimals)
    const rateDecimals = 6;

    mockRatesConverterCalls(klerosCoreAddr, ratesConverterAddr, tokenAddress, rateInEth, rateDecimals);

    updateFeeTokenPaid(tokenAddress, klerosCoreAddr, BigInt.fromI32(100));

    mockRatesConverterCalls(klerosCoreAddr, ratesConverterAddr, tokenAddress, rateInEth, rateDecimals);

    updateFeeTokenPaid(tokenAddress, klerosCoreAddr, BigInt.fromI32(200));

    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "totalPaid", "300");
    // totalPaidInETH = (100 * 1000000 / 1000000) + (200 * 1000000 / 1000000) = 100 + 200 = 300
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "totalPaidInETH", "300");
  });
});

describe("FeeToken - convertEthToTokenAmount", () => {
  afterEach(() => {
    clearStore();
  });

  test("Converts ETH to token amount using on-chain rate", () => {
    const tokenAddress = Address.fromString(TOKEN_ADDRESS);
    const klerosCoreAddr = Address.fromString(KLEROS_CORE_ADDRESS);
    const ratesConverterAddr = Address.fromString(RATES_CONVERTER_ADDRESS);

    // rate: 2000 with 6 decimals => 1 ETH = 10^6 / 2000 = 500 tokens
    const rateInEth = BigInt.fromI32(2000);
    const rateDecimals = 6;

    mockRatesConverterCalls(klerosCoreAddr, ratesConverterAddr, tokenAddress, rateInEth, rateDecimals);

    const ethAmount = BigInt.fromI32(1000);
    const tokenAmount = convertEthToTokenAmount(tokenAddress, ethAmount, klerosCoreAddr);

    // tokenAmount = eth * 10^rateDecimals / rateInEth = 1000 * 1000000 / 2000 = 500000
    assert.bigIntEquals(BigInt.fromI32(500000), tokenAmount);
  });

  test("Returns correct value with 1:1 rate", () => {
    const tokenAddress = Address.fromString(TOKEN_ADDRESS);
    const klerosCoreAddr = Address.fromString(KLEROS_CORE_ADDRESS);
    const ratesConverterAddr = Address.fromString(RATES_CONVERTER_ADDRESS);

    // 1:1 rate -> rateInEth = 10^decimals
    const rateDecimals = 6;
    const rateInEth = BigInt.fromI32(1000000); // 10^6

    mockRatesConverterCalls(klerosCoreAddr, ratesConverterAddr, tokenAddress, rateInEth, rateDecimals);

    const ethAmount = BigInt.fromI32(1234);
    const tokenAmount = convertEthToTokenAmount(tokenAddress, ethAmount, klerosCoreAddr);

    // tokenAmount = 1234 * 1000000 / 1000000 = 1234
    assert.bigIntEquals(BigInt.fromI32(1234), tokenAmount);
  });
});

describe("FeeToken - convertTokenAmountToEth", () => {
  afterEach(() => {
    clearStore();
  });

  test("Converts token amount to ETH using on-chain rate", () => {
    const tokenAddress = Address.fromString(TOKEN_ADDRESS);
    const klerosCoreAddr = Address.fromString(KLEROS_CORE_ADDRESS);
    const ratesConverterAddr = Address.fromString(RATES_CONVERTER_ADDRESS);

    // rateInEth = 2000 with 6 decimals
    const rateInEth = BigInt.fromI32(2000);
    const rateDecimals = 6;

    mockRatesConverterCalls(klerosCoreAddr, ratesConverterAddr, tokenAddress, rateInEth, rateDecimals);

    const tokenAmount = BigInt.fromI32(500000);
    const ethAmount = convertTokenAmountToEth(tokenAddress, tokenAmount, klerosCoreAddr);

    // ethAmount = tokenAmount * rateInEth / 10^rateDecimals = 500000 * 2000 / 1000000 = 1000
    assert.bigIntEquals(BigInt.fromI32(1000), ethAmount);
  });

  test("Returns correct value with 1:1 rate", () => {
    const tokenAddress = Address.fromString(TOKEN_ADDRESS);
    const klerosCoreAddr = Address.fromString(KLEROS_CORE_ADDRESS);
    const ratesConverterAddr = Address.fromString(RATES_CONVERTER_ADDRESS);

    const rateDecimals = 6;
    const rateInEth = BigInt.fromI32(1000000); // 10^6 -> 1:1

    mockRatesConverterCalls(klerosCoreAddr, ratesConverterAddr, tokenAddress, rateInEth, rateDecimals);

    const tokenAmount = BigInt.fromI32(5678);
    const ethAmount = convertTokenAmountToEth(tokenAddress, tokenAmount, klerosCoreAddr);

    // ethAmount = 5678 * 1000000 / 1000000 = 5678
    assert.bigIntEquals(BigInt.fromI32(5678), ethAmount);
  });

  test("Conversion is inverse of convertEthToTokenAmount", () => {
    const tokenAddress = Address.fromString(TOKEN_ADDRESS);
    const klerosCoreAddr = Address.fromString(KLEROS_CORE_ADDRESS);
    const ratesConverterAddr = Address.fromString(RATES_CONVERTER_ADDRESS);

    const rateInEth = BigInt.fromI32(3000);
    const rateDecimals = 6;

    mockRatesConverterCalls(klerosCoreAddr, ratesConverterAddr, tokenAddress, rateInEth, rateDecimals);

    const originalEth = BigInt.fromI32(600);
    const tokenAmount = convertEthToTokenAmount(tokenAddress, originalEth, klerosCoreAddr);

    mockRatesConverterCalls(klerosCoreAddr, ratesConverterAddr, tokenAddress, rateInEth, rateDecimals);

    const recoveredEth = convertTokenAmountToEth(tokenAddress, tokenAmount, klerosCoreAddr);

    // tokenAmount = 600 * 1000000 / 3000 = 200000
    // recoveredEth = 200000 * 3000 / 1000000 = 600
    assert.bigIntEquals(originalEth, recoveredEth);
  });
});
