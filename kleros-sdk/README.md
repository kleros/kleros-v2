# @kleros/kleros-sdk

**The official TypeScript SDK for interacting with the Kleros V2 protocol.**

_This SDK is the successor to Archon and provides developers with a comprehensive set of tools to build applications on top of Kleros._

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Getting Started](#getting-started)
  - [Configuration](#configuration)
  - [Quick Start Example](#quick-start-example)
- [Core Concepts](#core-concepts)
  - [Public Client](#public-client)
  - [Data Mappings](#data-mappings)
  - [Requests](#requests)
- [API Documentation](#api-documentation)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Features

*   **Viem Integration**: Leverages the power and efficiency of [Viem](httpsa://viem.sh/) for Ethereum blockchain interactions.
*   **Type-Safe**: Fully written in TypeScript for robust type checking and improved developer experience.
*   **Dispute Resolution**: Tools to fetch dispute details, and interact with the Kleros arbitration process.
*   **Data Handling**: Utilities for working with Kleros-specific data structures and evidence.
*   **Subgraph Interaction**: Functionality to query Kleros subgraphs for indexed data.
*   **IPFS Support**: Helpers for fetching data stored on IPFS.

## Installation

You can install the Kleros SDK using npm or yarn:

```bash
# Using npm
npm install @kleros/kleros-sdk viem

# Using yarn
yarn add @kleros/kleros-sdk viem
```

**Note:** `@kleros/kleros-sdk` has `viem` as a peer dependency, so you need to install it separately in your project.

## Getting Started

### Configuration

Before you can use the SDK, you need to configure it with a `viem` Public Client instance. This client will be used for all blockchain interactions.

```typescript
import { configureSDK } from '@kleros/kleros-sdk';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains'; // Or your desired chain

// Create a viem public client
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(), // Replace with your preferred transport (e.g., Infura, Alchemy)
});

// Configure the Kleros SDK
configureSDK({ client: publicClient });

console.log('Kleros SDK configured!');
```

### Quick Start Example

Here's a simple example of how to fetch details for a specific dispute:

```typescript
import { configureSDK, KlerosSDK } from '@kleros/kleros-sdk'; // Assuming KlerosSDK is the main class or namespace
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

// Configure the SDK (as shown above)
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});
configureSDK({ client: publicClient });

// Example: Fetching dispute details (Illustrative - actual API might differ)
// Replace with actual SDK usage once API is fully explored
async function getDisputeExample(disputeId: string) {
  try {
    // Placeholder: Actual function to get dispute details needs to be identified
    // For now, we'll assume a function getDisputeDetails exists or similar
    // const disputeDetails = await KlerosSDK.getDisputeDetails(disputeId);
    // console.log('Dispute Details:', disputeDetails);

    console.log(`Fetching details for dispute ${disputeId}... (Illustrative)`);
    // This part will be updated once the actual API for fetching disputes is clear.
    // For now, we refer to functions that might exist based on file names like 'getDispute.ts' or 'fetchDisputeDetails.ts'
    // For example, if 'getDispute' is the correct function:
    // import { getDispute } from '@kleros/kleros-sdk';
    // const dispute = await getDispute(disputeId, publicClient); // publicClient might be implicitly used or passed
    // console.log(dispute);


  } catch (error) {
    console.error('Error fetching dispute details:', error);
  }
}

getDisputeExample('123'); // Replace '123' with an actual dispute ID
```
*Note: The Quick Start example is illustrative. The exact API usage, especially for fetching dispute details, will be refined as the SDK's public API is further clarified in subsequent steps.*

## Core Concepts

### Public Client

The SDK uses a `viem` Public Client for all on-chain interactions. You must provide this client during the SDK's configuration. This design gives you full control over the Ethereum connection (e.g., choice of RPC provider, chain).

### Data Mappings

The `dataMappings` module (found in `src/dataMappings`) is a powerful feature that allows for complex data retrieval and processing. It can execute a series of actions, such as:
*   Calling smart contract functions
*   Fetching JSON data from IPFS
*   Querying Kleros subgraphs
It uses a template-based system to populate data structures based on the results of these actions. This is particularly useful for constructing the `metaEvidence` and `evidence` associated with disputes.

### Requests

The `requests` module (found in `src/requests`) provides functions for making specific queries, often to Kleros subgraphs via GraphQL. For example, `fetchDisputeDetails.ts` likely uses this module to retrieve detailed information about a dispute.

## API Documentation

Detailed API documentation will be generated from TSDoc comments and made available separately. (This will be addressed in Step 2 of the improvement plan).

For now, developers can explore the exported functions and types directly within their IDEs, leveraging TypeScript's autocompletion features.

## Examples

Additional runnable examples demonstrating various SDK features will be added to the `examples/` directory within this package. (This will be addressed in a later step of the improvement plan).

## Contributing

Contributions are welcome! If you find a bug, have a feature request, or want to contribute to the codebase, please:

1.  Check the [issue tracker](https://github.com/kleros/kleros-v2/issues) for existing issues.
2.  Open a new issue if yours isn't listed.
3.  For code contributions, please fork the repository and submit a pull request to the `master` (or relevant development) branch.

We use ESLint for linting and Prettier for formatting. Please ensure your contributions adhere to these standards.

### Running Tests

To run the test suite (powered by Vitest):

```bash
# From the root of the kleros-v2 monorepo
yarn test packages/kleros-sdk

# Or, if you are inside the kleros-sdk package directory
yarn test
```

## License

This SDK is licensed under the [MIT License](./LICENSE).
