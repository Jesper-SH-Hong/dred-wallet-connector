


# Wallet Connection & UI-State Sync

This project demonstrates a web3-style wallet connection UI using React and Tailwind CSS.

## Features

- Connect/disconnect MetaMask wallet
- Detect network changes (Ethereum, Polygon, etc.)
- UI updates for wallet connection / network changes
- Transaction lifecycle feedback (pending, confirmation, success, timeout, failed)

## How Network Change & UI Sync Works

- Uses `window.ethereum` events:
  - `chainChanged`: Updates network state and UI
- Transaction simulation updates UI with loaders, prompts

## Usage

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open in browser and connect your wallet
4. Try switching networks in MetaMask
5. Click "Invoke Transaction" to see transaction UI feedback

See `src/WalletConnector.jsx` for implementation details.

# Sepolia Wallet Demo

This app demonstrates wallet connection, network detection, and transaction UI sync using MetaMask and Sepolia testnet.

## Features

- **Wallet Connect/Disconnect**: Users can connect/disconnect their MetaMask wallet.
- **Network Detection**: UI shows current network and responds to network changes (Ethereum, Polygon, Sepolia).
- **Transaction Lifecycle**: UI updates for confirmation, pending, and completion states when sending a simple 0 ETH transaction.
- **UI Feedback**: Loader/spinner for pending, success/failure messages for transaction status.

## How Network Change & UI Sync Works

- Listens for `chainChanged` events from MetaMask.
- Updates UI with current address and network name.
- Transaction status is reflected in the UI at each step.

## Getting Sepolia Test ETH

To test transactions on Sepolia, you'll need some test ETH. You can get Sepolia test ETH from the Google Cloud faucet:

- [Google Cloud Sepolia Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)

Just connect your wallet and request test ETH for your Sepolia address.
