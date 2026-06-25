import { readFileSync, writeFileSync } from "fs";
import vm from "vm";
import ts from "typescript";

const sourcePath = "pin/hardhat.config.ts";
const source = readFileSync(sourcePath, "utf8");
const sourceFile = ts.createSourceFile(sourcePath, source, ts.ScriptTarget.Latest, true);

// We have solidity settings in hardhat.config.ts, when loading from a pinned version,
// we cannot run pinned hardhat.config.ts as it is, because we need to update the paths.
// Instead we pull in the solidity config from the pinned file and then use that in the Root hardhat.config.ts
const findSolidityInitializer = (node: ts.Node): ts.Expression | undefined => {
  if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) && node.name.text === "solidity") {
    return node.initializer;
  }
  let found: ts.Expression | undefined;
  ts.forEachChild(node, (child) => {
    found ??= findSolidityInitializer(child);
  });
  return found;
};

const initializer = findSolidityInitializer(sourceFile);
if (!initializer) {
  throw new Error(`solidity not found in ${sourcePath}`);
}

const { outputText } = ts.transpileModule(
  `const __solidity = ${initializer.getText(sourceFile)}; module.exports = __solidity;`,
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }
);

const sandbox = { module: { exports: {} as unknown }, exports: {} as unknown, process };
vm.runInNewContext(outputText, sandbox);

writeFileSync("pin/solidity.json", JSON.stringify({ solidity: sandbox.module.exports }, null, 2));
