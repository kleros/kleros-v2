<p align="center">
  <b style="font-size: 32px;">Kleros Court v2 </b>
</p>

<p align="center">
  <a href="https://app.netlify.com/sites/kleros-v2-neo/deploys"><img src="https://api.netlify.com/api/v1/badges/46f40014-ff00-4a9a-a1a2-4fefeeb1606a/deploy-status" alt="Netlify Build Status"> Beta</a>
  </br>
  <a href="https://app.netlify.com/sites/kleros-v2-testnet/deploys"><img src="https://api.netlify.com/api/v1/badges/86d94ae8-f655-46a4-a859-d68696173f3a/deploy-status" alt="Netlify Build Status"> Testnet / Devnet</a>
</p>

## Court Deployments

| Court             | URL                                        | Environment | Network          |
| ----------------- | ------------------------------------------ | ----------- | ---------------- |
| **Beta Court**    | https://v2.kleros.builders                 | Production  | Arbitrum One     |
| **Testnet Court** | https://v2-testnet.kleros.builders         | Staging     | Arbitrum Sepolia |
| **Devnet Court**  | https://dev--kleros-v2-testnet.netlify.app | Staging     | Arbitrum Sepolia |

## Contributing

### Pre-Requisites

If you haven't already, you need to follow all the previous steps of the **Contributing** section of the repo's [Contribution Guidelines](../CONTRIBUTING.md)

### Getting Started

#### Compile the contracts

```bash
$ cd kleros-v2/contracts
$ yarn build
```

#### Start the frontend

```bash
$ cd kleros-v2/web
$ yarn start
```
