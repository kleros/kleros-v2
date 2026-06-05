# Changelog

All notable changes to this package will be documented in this file.

The format is based on [Common Changelog](https://common-changelog.org/).

## [Unreleased]

## [3.0.1] - 2026-06-05

### Fixed

- Republished with built `dist` artifacts; the `3.0.0` npm tarball was published without `dist` after the release script failed at `yarn npm login` and removed the build output on exit.

## [3.0.0] - 2026-06-05

> **Note:** The npm tarball for `3.0.0` was broken; use `3.0.1` or later.

### Added

- `deleteUser()` on `IAtlasProvider` and `deleteUser` GraphQL util: deletes the authenticated Atlas user and unsubscribes notification emails across all Kleros products (not only `signupProduct`).
- `isDeletingUser` loading flag on `IAtlasProvider`.

### Changed

- Split Atlas configuration into `signupProduct` (`SignupProduct`) and optional `ipfsProduct` (`IpfsProduct`) instead of a single `product` field.
- `addUser` and `updateEmail` always use `config.signupProduct`; per-call product overrides were removed.
- `uploadFile` requires `ipfsProduct` in config, always validates against role restrictions (with a retry fetch if the prefetch failed), and throws `IpfsProductNotConfigured` when IPFS is not configured.

### Removed

- `Products` enum (replaced by `SignupProduct` and `IpfsProduct`).

### Migration

```ts
// Before
<AtlasProvider config={{ uri, product: Products.CourtV2, wagmiConfig }} />

// After (apps that sign up and upload, e.g. Court)
<AtlasProvider
  config={{
    uri,
    signupProduct: SignupProduct.CourtV2,
    ipfsProduct: IpfsProduct.CourtV2,
    wagmiConfig,
  }}
/>
```
