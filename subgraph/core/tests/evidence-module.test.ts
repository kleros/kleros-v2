import { afterEach, assert, clearStore, describe, test } from "matchstick-as/assembly/index";
import { handleEvidenceEvent } from "../src/EvidenceModule";
import { createEvidenceEvent } from "./utils/events";
import { seedDisputeInCourt } from "./utils/entities";
import { assertFieldUnset } from "./utils/assertions";
import { bi, DAY_1, JUROR_A } from "./utils/constants";

const party = JUROR_A.toHexString();

function submit(evidence: string): void {
  handleEvidenceEvent(createEvidenceEvent(bi(0), JUROR_A, evidence));
}

describe("EvidenceModule - handleEvidenceEvent", () => {
  afterEach(() => {
    clearStore();
  });

  test("stores the evidence with the fields parsed from its JSON", () => {
    seedDisputeInCourt("0");
    const json = '{"name":"Receipt","description":"Proof of payment","fileURI":"/ipfs/Qm1","fileTypeExtension":"pdf"}';
    submit(json);

    assert.fieldEquals("Dispute", "0", "evidenceCount", "1");
    assert.fieldEquals("ClassicEvidence", "0-1", "evidence", json);
    assert.fieldEquals("ClassicEvidence", "0-1", "evidenceIndex", "1");
    assert.fieldEquals("ClassicEvidence", "0-1", "dispute", "0");
    assert.fieldEquals("ClassicEvidence", "0-1", "sender", party);
    assert.fieldEquals("ClassicEvidence", "0-1", "senderAddress", party);
    assert.fieldEquals("ClassicEvidence", "0-1", "timestamp", DAY_1.toString());
    assert.fieldEquals("ClassicEvidence", "0-1", "name", "Receipt");
    assert.fieldEquals("ClassicEvidence", "0-1", "description", "Proof of payment");
    assert.fieldEquals("ClassicEvidence", "0-1", "fileURI", "/ipfs/Qm1");
    assert.fieldEquals("ClassicEvidence", "0-1", "fileTypeExtension", "pdf");
    assert.fieldEquals("User", party, "id", party);
  });

  test("numbers evidence per dispute", () => {
    seedDisputeInCourt("0");
    submit('{"name":"a"}');
    submit('{"name":"b"}');

    assert.entityCount("ClassicEvidence", 2);
    assert.fieldEquals("ClassicEvidence", "0-2", "name", "b");
    assert.fieldEquals("ClassicEvidence", "0-2", "evidenceIndex", "2");
  });

  test("fills missing name and description with a hyphen and leaves file fields unset", () => {
    seedDisputeInCourt("0");
    submit('{"other":true}');

    assert.fieldEquals("ClassicEvidence", "0-1", "name", "-");
    assert.fieldEquals("ClassicEvidence", "0-1", "description", "-");
    assertFieldUnset("ClassicEvidence", "0-1", "fileURI");
    assertFieldUnset("ClassicEvidence", "0-1", "fileTypeExtension");
  });

  test("keeps evidence that is not valid JSON without parsed fields", () => {
    seedDisputeInCourt("0");
    submit("/ipfs/QmPlainUri");

    assert.fieldEquals("ClassicEvidence", "0-1", "evidence", "/ipfs/QmPlainUri");
    assertFieldUnset("ClassicEvidence", "0-1", "name");
  });

  test("keeps evidence whose JSON is not an object without parsed fields", () => {
    seedDisputeInCourt("0");
    submit('["a","b"]');

    assert.entityCount("ClassicEvidence", 1);
    assertFieldUnset("ClassicEvidence", "0-1", "name");
  });

  test("ignores evidence for an unknown dispute", () => {
    submit('{"name":"x"}');

    assert.entityCount("ClassicEvidence", 0);
    assert.entityCount("User", 0);
  });
});
