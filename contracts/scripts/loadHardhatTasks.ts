import path from "path";
import { pinActive } from "./contractPaths";

// When pinned, register the tag's Hardhat tasks/scripts (populate, etc.), not HEAD's.
const scriptsDir = pinActive ? path.join(__dirname, "../pin/scripts") : __dirname;

const loadTask = (name: string) => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require(path.join(scriptsDir, name));
};

loadTask("populatePolicyRegistry");
loadTask("populateCourts");
loadTask("changeOwner");
loadTask("getDisputeTemplate");
loadTask("compareStorageLayout");
loadTask("storage-layout");
