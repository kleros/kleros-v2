import { ClassicEvidenceGroup } from "../../generated/schema";
import { ZERO } from "../utils";

export function ensureClassicEvidenceGroup(id: string): ClassicEvidenceGroup {
  let classicEvidenceGroup = ClassicEvidenceGroup.load(id);

  if (!classicEvidenceGroup) {
    classicEvidenceGroup = new ClassicEvidenceGroup(id);
    classicEvidenceGroup.nextEvidenceIndex = ZERO;
    classicEvidenceGroup.save();
  }

  return classicEvidenceGroup;
}
