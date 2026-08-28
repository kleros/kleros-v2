import { existsSync, readFileSync, writeFileSync } from "fs";
import ts from "typescript";

const OUTPUT = "pin/solidity.json";

if (existsSync("pin/solidity.config.json")) {
  const solidity = JSON.parse(readFileSync("pin/solidity.config.json", "utf8"));
  writeFileSync(OUTPUT, JSON.stringify({ solidity }, null, 2));
  process.exit(0);
}

// Legacy pins: literal-only AST extract from pin/hardhat.config.ts (no eval).
const sourcePath = "pin/hardhat.config.ts";
const sourceFile = ts.createSourceFile(sourcePath, readFileSync(sourcePath, "utf8"), ts.ScriptTarget.Latest, true);

// collect all const variables so we can use them later in tree traversal
const constInits = new Map<string, ts.Expression>();
const collectConsts = (node: ts.Node) => {
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
    constInits.set(node.name.text, node.initializer);
  }
  ts.forEachChild(node, collectConsts);
};
collectConsts(sourceFile);

let solidityExpr: ts.Expression | undefined;
const findSolidity = (node: ts.Node) => {
  if (solidityExpr) return;
  if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) && node.name.text === "solidity") {
    solidityExpr = node.initializer;
    return;
  }
  if (ts.isShorthandPropertyAssignment(node) && node.name.text === "solidity") {
    solidityExpr = node.name;
    return;
  }
  ts.forEachChild(node, findSolidity);
};
findSolidity(sourceFile);
if (!solidityExpr) throw new Error(`solidity not found in ${sourcePath}`);

const fail = (node: ts.Node) => {
  throw new Error(`unsupported solidity value in ${sourcePath}: ${node.getText(sourceFile)}`);
};

// This will recursively trace the tree to construct the JSON
const toJson = (expr: ts.Expression): unknown => {
  if (ts.isIdentifier(expr)) {
    const init = constInits.get(expr.text) ?? fail(expr);
    return toJson(init);
  }
  // will handle both property assignment {solidity: {...}} and shorthand assignment { solidity }
  if (ts.isObjectLiteralExpression(expr)) {
    return Object.fromEntries(
      expr.properties.map((prop) => {
        if (ts.isPropertyAssignment(prop)) {
          const key =
            ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name) || ts.isNumericLiteral(prop.name)
              ? prop.name.text
              : fail(prop.name);
          return [key, toJson(prop.initializer)];
        }
        if (ts.isShorthandPropertyAssignment(prop)) return [prop.name.text, toJson(prop.name)];
        return fail(prop);
      })
    );
  }
  if (ts.isArrayLiteralExpression(expr)) {
    return expr.elements.map((el) => (ts.isSpreadElement(el) || ts.isOmittedExpression(el) ? fail(el) : toJson(el)));
  }
  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) return expr.text;
  if (ts.isNumericLiteral(expr)) return Number(expr.text);
  if (expr.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (expr.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (expr.getText(sourceFile) === 'process.env.VIA_IR !== "false"') {
    return process.env.VIA_IR !== "false";
  }
  return fail(expr);
};

writeFileSync(OUTPUT, JSON.stringify({ solidity: toJson(solidityExpr) }, null, 2));
