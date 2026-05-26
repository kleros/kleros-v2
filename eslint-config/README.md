# @kleros/kleros-v2-eslint-config

Shared ESLint configuration to be used across the Kleros v2 monorepo.

## Usage

Workspaces that don't need custom rules can use the default config with a one-line `eslint.config.mjs`:

```js
export { default } from "@kleros/kleros-v2-eslint-config/flat.config.mjs";
```

## Flat-config migration shim

ESLint 9 requires the flat config format (`eslint.config.*`) and no longer reads legacy `.eslintrc` files automatically. `flat.config.mjs` uses `FlatCompat` to translate the legacy `.eslintrc.js` into a flat config, so the existing rules continue to apply.

## What's in the config

### Parser & environments

- **Parser:** `@typescript-eslint/parser`
- **`parserOptions.ecmaVersion`:** `2020`
- **Environments enabled:** `browser`, `node`, `es6`, `es2020`, `mocha`

### Extended configs

- `eslint:recommended` — ESLint's built-in baseline rules
- `plugin:@typescript-eslint/recommended` — TypeScript-aware rules
- `plugin:prettier/recommended` — runs Prettier as an ESLint rule and disables conflicting style rules
- `plugin:import/recommended` — import/export hygiene

### Plugins

`@typescript-eslint`, `prettier`, `import`, `n` (Node).

### Custom rule overrides

| Rule                                  | Setting                                                 | Why                                                                                                                                                 |
| ------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `no-unused-vars`                      | `off`                                                   | Replaced by the TS-aware variant.                                                                                                                   |
| `@typescript-eslint/no-unused-vars`   | `error`, with `varsIgnorePattern` / `argsIgnorePattern` | Prefix a name with `_` (e.g. `_unused`, `_1`) or use an `ignored` / `Ignored` suffix to deliberately silence the rule for intentional placeholders. |
| `prettier/prettier`                   | `error`                                                 | Formatting violations fail lint.                                                                                                                    |
| `import/no-unresolved`                | `error`, `commonjs: true`                               | Catches imports that won't resolve at runtime, including CJS `require` paths.                                                                       |
| `n/no-unsupported-features/es-syntax` | `error`, `ignores: ["modules"]`                         | Flags ES syntax not supported by the configured Node target, but allows ES modules.                                                                 |
| `n/no-missing-import`                 | `off`                                                   | Resolution is handled by `import/no-unresolved` + the TS resolver.                                                                                  |

### Resolver settings

Imports are resolved via:

- `eslint-import-resolver-typescript` (uses each workspace's `tsconfig.json`)
- Node resolver, with extensions `.js`, `.jsx`, `.ts`, `.tsx`
