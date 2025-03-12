# Marketplace Contracts

This repository contains the smart contracts for the Marketplace project.

## Installation

1. **Clone the repository**
   ```sh
   git clone git@github.com:gtala/marketplace-contracts.git
   cd marketplace-contracts
   ```

2. **Install dependencies**
   ```sh
   yarn install
   ```

## Compilation

Compile the smart contracts with Hardhat:
```sh
yarn compile
```

## Deployment

Deploy the smart contracts to the BSC Testnet:
```sh
yarn deploy
```

## Running Tests

To run the test suite:
```sh
yarn test
```

## Local Blockchain

Start a local Hardhat blockchain for testing:
```sh
yarn hardhat node
```

## Interacting with Contracts

Use the Hardhat console to interact with deployed contracts:
```sh
yarn hardhat console --network bsctestnet
```

## License

This project is licensed under the MIT License.