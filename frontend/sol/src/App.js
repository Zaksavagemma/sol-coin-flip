import React, { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import WalletConnectButton from "./WalletConnectButton";

import './App.css';
import '@solana/wallet-adapter-react-ui/styles.css'; // Default styles for wallet modal

function App() {
  // Solana network (e.g., devnet, mainnet-beta, testnet)
  const network = "localhost";
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Wallets to support
  const wallets = useMemo(
      () => [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
      ],
      []
  );

  return (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <div className="App">
              <header className="App-header">
                <h1>Solana Wallet Connection</h1>
                <WalletConnectButton />
              </header>
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
  );
}

export default App;
