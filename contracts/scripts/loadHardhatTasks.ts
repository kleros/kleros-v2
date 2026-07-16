import { existsSync } from "fs";
import path from "path";
import { pinActive } from "./contractPaths";

// When pinned, register the tag's Hardhat tasks/scripts (populate, etc.), not HEAD's.
const scriptsDir = pinActive ? path.join(__dirname, "../pin/scripts") : __dirname;
const loadTask = (name: string, optional = false) => {
  const moduleBase = path.join(scriptsDir, name);
  if (![".ts", ".js"].some((ext) => existsSync(`${moduleBase}${ext}`))) {
    if (optional || pinActive) return;
    throw new Error(`Missing Hardhat task module: ${moduleBase}`);
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require(moduleBase);
};

// These are always the task names on the HEAD, if any task has been added or renamed, it should be updated here too.
// If not done, an error would be thrown when hardhat.config.ts loads the tasks.
// NOTE: always add the older file name / task name to 'legacyTasks' list below after updating here, so pins work too.
const headTasks = [
  "populatePolicyRegistry",
  "populateCourts",
  "changeOwner",
  "getDisputeTemplate",
  "compareStorageLayout",
  "storage-layout",
] as const;

// Pin-only module names (not on HEAD) — load when present, never fail when absent.
// For example, if you updated a task name from above (changeOwner -> updateOwner),
// Update the task name to 'updateOwner' on headTasks and add 'changeOwner' in legacyTasks.
const legacyTasks = [] as const;

headTasks.forEach((name) => loadTask(name));
legacyTasks.forEach((name) => loadTask(name, true));
