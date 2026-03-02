---
name: changelog-contracts
description: Generate or update contracts/CHANGELOG.md from git history between two tags. Researches commits, filters non-user-facing changes, verifies every claim against source code, and produces Common Changelog output.
disable-model-invocation: true
user-invocable: true
allowed-tools: Read, Grep, Glob, Bash(git *), Bash(gh pr view *), Bash(gh pr list *)
argument-hint: "[from-tag..to-ref]"
---

# Contracts Changelog Generator

Generate a changelog section for `contracts/CHANGELOG.md` by researching the git history between two refs.

## Input

`$ARGUMENTS` is a git range like `@kleros/kleros-v2-contracts@2.0.0-rc.1..HEAD`.
If empty, auto-detect: find the latest `@kleros/kleros-v2-contracts@*` tag and use `<tag>..HEAD`.

## Step 1: Research — Commit-Level Analysis

Collect ALL commits touching `contracts/src/`:

```bash
# Individual commits (the actual work)
git log --oneline --no-merges <range> -- contracts/src/

# Merge commits (PR boundaries)
git log --oneline --merges <range> -- contracts/src/
```

For each non-merge commit, determine provenance:

- Find its first merge ancestor: `git log --ancestry-path --merges --oneline <hash>..HEAD | head -1`
- If a merge ancestor exists matching `Merge pull request #NNN` → commit belongs to that PR
- If no merge ancestor → direct push to branch, cite by commit hash

For each commit, inspect actual file changes:

```bash
git show <hash> --stat -- contracts/src/
```

Read the diff for each commit to understand what actually changed — do NOT rely on commit messages alone.

## Step 2: Filtering

**Include only:** changes to files under `contracts/src/`

**Exclude:**

- `contracts/src/test/` and `contracts/src/*/mock/` — test infrastructure
- `contracts/src/proxy/KlerosProxies.sol` — deployment addresses, not code
- `chore:` commits that only update deployed addresses or proxy configs
- `docs:` commits with NatSpec-only changes (no functional change)
- Merge commits themselves (they duplicate the individual commits)

## Step 3: Draft Entries

Group related commits into single changelog entries. Multiple commits for the same logical change (e.g., same audit finding, same feature across files) become one entry.

### Categorization (Common Changelog order)

1. **Changed** — modifications to existing behavior (especially breaking)
2. **Added** — new contracts, functions, interfaces, events
3. **Removed** — deleted contracts, functions, deprecated features
4. **Fixed** — bug fixes, security fixes

Omit empty sections.

### Entry format

```markdown
- **Breaking:** Description referencing `ExactContractName` and `exactFieldName` ([#NNN](https://github.com/kleros/kleros-v2/pull/NNN))
- Description ([`abc1234`](https://github.com/kleros/kleros-v2/commit/abc1234))
```

- Breaking changes: prefix with `**Breaking:**`
- PR references: `([#NNN](https://github.com/kleros/kleros-v2/pull/NNN))`
- Direct commit references: `([`short-hash`](https://github.com/kleros/kleros-v2/commit/full-hash))`
- If a commit is part of a PR but also has notable follow-up direct commits, cite both

## Step 4: Adversarial Verification (CRITICAL)

Before writing the final changelog, verify EVERY factual claim against the actual source code at HEAD. This step is mandatory — do not skip it.

### Contract names

- Every contract/interface name mentioned must exist as a `.sol` file in `contracts/src/` (recursively)
- Do NOT reference contracts that only exist in `src/*/migrations/` or `.tmp` files
- Use `find contracts/src -name "*.sol" -not -path "*/migrations/*"` to confirm

### Struct fields and function names

- For every `ContractName.fieldName` or `ContractName.functionName()` reference:
  - Read the actual contract file
  - Confirm the field/function exists AND belongs to that contract (not a parent or sibling)
  - Use exact names from source (e.g., `jurorsForCourtJump` not `jurorsForJump`, `maxStakePerJuror` not `maxStake`)

### Function ownership

- If claiming `ContractA.someFunction()`, grep to confirm `someFunction` is defined in ContractA, not in ContractB
- Common mistake: attributing a function to the contract that calls it rather than the one that defines it

### PR validation

- For each PR reference, run `gh pr view NNN --json title,state -q '.title'` to confirm it exists and the title is related

## Step 5: Write Output

Read the existing `contracts/CHANGELOG.md`. Insert the new version section:

- After the preamble ("The format is based on...")
- Before the first existing `## [version]` section
- Use today's date unless the user specified otherwise
- Add a reference-style link at the bottom with the other version links:
  ```
  [X.Y.Z]: https://github.com/kleros/kleros-v2/releases/tag/@kleros%2Fkleros-v2-contracts@X.Y.Z
  ```

## Common Pitfalls (learned from experience)

1. `KlerosCoreBase` was removed long ago — the contract is `KlerosCore`
2. `DisputeKitClassicBase.Round` and `KlerosCore.Round` are different structs — verify which one a field belongs to
3. `transferBySortitionModule()` is defined on `KlerosCore`, not on `SortitionModule`
4. Commit messages often use shorthand names — always verify against source
5. Some commits are direct pushes to dev after a PR merge — don't miss these
