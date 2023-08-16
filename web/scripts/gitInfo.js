/* eslint-disable max-len */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const packageJson = require("../package.json");

const execSyncWrapper = (command) => {
  let stdout = null;
  try {
    stdout = execSync(command).toString().trim();
  } catch (error) {
    console.error(error);
  }
  return stdout;
};

const main = () => {
  let version = packageJson.version;
  let gitCommitHash = execSyncWrapper("git rev-parse HEAD");
  let gitCommitShortHash = execSyncWrapper("git rev-parse --short=7 HEAD");
  let gitBranch = execSyncWrapper("git rev-parse --abbrev-ref HEAD");
  let clean =
    execSyncWrapper(`[ -z "$(git status --short  | ggrep -v '^??')" ] && echo clean || echo dirty`) === "clean";

  const obj = {
    version,
    gitCommitHash,
    gitCommitShortHash,
    gitBranch,
    clean,
  };

  const filePath = path.resolve("src", "generatedGitInfo.json");
  const fileContents = JSON.stringify(obj, null, 2);

  fs.writeFileSync(filePath, fileContents);
  // console.log(`Wrote the following contents to ${filePath}\n${fileContents}`);
};

main();
