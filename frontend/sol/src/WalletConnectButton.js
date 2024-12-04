import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const WalletConnectButton = () => {
    const { publicKey } = useWallet();

    return (
        <div>
            <WalletMultiButton />
            {publicKey && (
                <p>
                    Connected Wallet: <strong>{publicKey.toBase58()}</strong>
                </p>
            )}
        </div>
    );
};

export default WalletConnectButton;
