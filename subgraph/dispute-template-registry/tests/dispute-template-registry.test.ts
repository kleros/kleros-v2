import { afterEach, assert, clearStore, describe, newMockEvent, test } from "matchstick-as/assembly/index";
import { BigInt, ByteArray, Bytes, crypto, ethereum } from "@graphprotocol/graph-ts";
import { handleDisputeTemplate } from "../src/DisputeTemplateRegistry";
import { DisputeTemplate } from "../generated/DisputeTemplateRegistry/DisputeTemplateRegistry";

function createDisputeTemplateEvent(templateId: i32, tag: string, data: string, mappings: string): DisputeTemplate {
  const event = changetype<DisputeTemplate>(newMockEvent());
  // An indexed string is emitted as the keccak256 of its contents.
  const tagTopic = Bytes.fromByteArray(crypto.keccak256(ByteArray.fromUTF8(tag)));
  event.parameters = [
    new ethereum.EventParam("_templateId", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(templateId))),
    new ethereum.EventParam("_templateTag", ethereum.Value.fromFixedBytes(tagTopic)),
    new ethereum.EventParam("_templateData", ethereum.Value.fromString(data)),
    new ethereum.EventParam("_templateDataMappings", ethereum.Value.fromString(mappings)),
  ];
  return event;
}

describe("DisputeTemplateRegistry - handleDisputeTemplate", () => {
  afterEach(() => {
    clearStore();
  });

  test("stores the template data, mappings and the tag's topic hash", () => {
    handleDisputeTemplate(createDisputeTemplateEvent(3, "escrow", '{"title":"t"}', "[]"));

    const tagHash = crypto.keccak256(ByteArray.fromUTF8("escrow")).toHexString();
    assert.entityCount("DisputeTemplate", 1);
    assert.fieldEquals("DisputeTemplate", "3", "templateTag", tagHash);
    assert.fieldEquals("DisputeTemplate", "3", "templateData", '{"title":"t"}');
    assert.fieldEquals("DisputeTemplate", "3", "templateDataMappings", "[]");
  });

  test("keeps one entity per template id", () => {
    handleDisputeTemplate(createDisputeTemplateEvent(0, "a", "first", "[]"));
    handleDisputeTemplate(createDisputeTemplateEvent(1, "b", "second", "[]"));
    handleDisputeTemplate(createDisputeTemplateEvent(1, "b", "replaced", "[1]"));

    assert.entityCount("DisputeTemplate", 2);
    assert.fieldEquals("DisputeTemplate", "1", "templateData", "replaced");
    assert.fieldEquals("DisputeTemplate", "1", "templateDataMappings", "[1]");
  });
});
