import { assert, describe, test, clearStore, afterEach } from "matchstick-as/assembly/index";
import { BigInt, Address } from "@graphprotocol/graph-ts";
import { handleNewCurrencyRate } from "../src/RatesConverter";
import { createNewCurrencyRateEvent } from "./rates-converter-utils";

const TOKEN_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";

describe("RatesConverter - handleNewCurrencyRate", () => {
  afterEach(() => {
    clearStore();
  });

  test("Creates a new FeeToken entity on first NewCurrencyRate event", () => {
    const tokenAddress = Address.fromString(TOKEN_ADDRESS);
    const rateInEth = BigInt.fromI32(3000);
    const rateDecimals = 6;

    const event = createNewCurrencyRateEvent(tokenAddress, rateInEth, rateDecimals);
    handleNewCurrencyRate(event);

    assert.entityCount("FeeToken", 1);
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "rateInEth", "3000");
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "rateDecimals", "6");
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "accepted", "false");
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "totalPaid", "0");
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "totalPaidInETH", "0");
  });

  test("Updates rateInEth and rateDecimals on subsequent events for the same token", () => {
    const tokenAddress = Address.fromString(TOKEN_ADDRESS);

    const event1 = createNewCurrencyRateEvent(tokenAddress, BigInt.fromI32(3000), 6);
    handleNewCurrencyRate(event1);

    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "rateInEth", "3000");
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "rateDecimals", "6");

    const event2 = createNewCurrencyRateEvent(tokenAddress, BigInt.fromI32(5000), 8);
    handleNewCurrencyRate(event2);

    assert.entityCount("FeeToken", 1);
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "rateInEth", "5000");
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "rateDecimals", "8");
  });

  test("Does not overwrite totalPaid or totalPaidInETH on rate update", () => {
    const tokenAddress = Address.fromString(TOKEN_ADDRESS);

    const event = createNewCurrencyRateEvent(tokenAddress, BigInt.fromI32(3000), 6);
    handleNewCurrencyRate(event);

    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "totalPaid", "0");
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "totalPaidInETH", "0");
  });

  test("Handles multiple different tokens independently", () => {
    const tokenA = Address.fromString("0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    const tokenB = Address.fromString("0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");

    const eventA = createNewCurrencyRateEvent(tokenA, BigInt.fromI32(1000), 6);
    handleNewCurrencyRate(eventA);

    const eventB = createNewCurrencyRateEvent(tokenB, BigInt.fromI32(2000), 8);
    handleNewCurrencyRate(eventB);

    assert.entityCount("FeeToken", 2);

    assert.fieldEquals("FeeToken", "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "rateInEth", "1000");
    assert.fieldEquals("FeeToken", "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "rateDecimals", "6");

    assert.fieldEquals("FeeToken", "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", "rateInEth", "2000");
    assert.fieldEquals("FeeToken", "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", "rateDecimals", "8");
  });

  test("Accepted field stays false (only set by AcceptedFeeToken handler)", () => {
    const tokenAddress = Address.fromString(TOKEN_ADDRESS);

    const event = createNewCurrencyRateEvent(tokenAddress, BigInt.fromI32(3000), 6);
    handleNewCurrencyRate(event);

    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "accepted", "false");

    const event2 = createNewCurrencyRateEvent(tokenAddress, BigInt.fromI32(5000), 8);
    handleNewCurrencyRate(event2);

    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "accepted", "false");
  });

  test("Handles zero rate values", () => {
    const tokenAddress = Address.fromString(TOKEN_ADDRESS);

    const event = createNewCurrencyRateEvent(tokenAddress, BigInt.fromI32(0), 0);
    handleNewCurrencyRate(event);

    assert.entityCount("FeeToken", 1);
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "rateInEth", "0");
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "rateDecimals", "0");
  });

  test("Handles large rate values", () => {
    const tokenAddress = Address.fromString(TOKEN_ADDRESS);
    const largeRate = BigInt.fromString("1000000000000000000"); // 1e18

    const event = createNewCurrencyRateEvent(tokenAddress, largeRate, 18);
    handleNewCurrencyRate(event);

    assert.entityCount("FeeToken", 1);
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "rateInEth", "1000000000000000000");
    assert.fieldEquals("FeeToken", TOKEN_ADDRESS, "rateDecimals", "18");
  });
});
