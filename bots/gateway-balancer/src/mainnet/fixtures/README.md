# Recorded deploy output (synthetic)

`deployments/{base,arbitrum}` mimics what `contracts/deploy/1x-veashi-*.ts` write under `contracts/deployments` when the
operator deploys: one hardhat-deploy JSON per deployment (trimmed to the fields the generator reads, `abi` emptied) and
the network's `.chainId`. Nothing here was deployed. The addresses are the CREATE addresses of a made-up deployer
(`0x78e1A05a2dA552905C1526ec3C631D48239981e8`, the last 20 bytes of
`keccak256("veashi mainnet deploy-output fixture deployer")`): on Base the ForeignGateway implementation (nonce 0)
and proxy (nonce 1); on Arbitrum the ruler implementation and proxy (nonces 0, 1), then the HomeGateway implementation
(nonce 2) and proxy (nonce 3).

`config/mainnet.example.json` is the generator's output for this deploy output (checked by `generate.test.ts`).
