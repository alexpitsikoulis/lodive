import { useMemo } from "react";
import { WalletProvider } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletModalProvider } from "@demox-labs/aleo-wallet-adapter-reactui";
import {
    PuzzleWalletAdapter,
    FoxWalletAdapter,
    SoterWalletAdapter,
} from "aleo-adapters";
import {
    DecryptPermission,
    WalletAdapterNetwork,
} from "@demox-labs/aleo-wallet-adapter-base";
import { LeoWalletAdapter } from "@demox-labs/aleo-wallet-adapter-leo";
import "@demox-labs/aleo-wallet-adapter-reactui/styles.css";

// Configure the wallet options to be used in the application.
export const WalletWrapper = ({ children }) => {
    // Initialize wallets inside a functional component using useMemo.
    const wallets = useMemo(
        () => [
            new LeoWalletAdapter({
                appName: "lodive",
                appDescription: "A privacy-focused ticketing platform",
            }),
            new PuzzleWalletAdapter({
                programIdPermissions: {
                    [WalletAdapterNetwork.TestnetBeta]: [
                        "lodive_v0_1_0.aleo",
                    ],
                },
                appName: "lodive",
                appDescription: "A privacy-focused ticketing platform",
            }),
        ],
        []
    );

    return (
        <WalletProvider
            wallets={wallets}
            decryptPermission={DecryptPermission.OnChainHistory}
            network={WalletAdapterNetwork.TestnetBeta} // Change to 'MainnetBeta' or 'TestnetBeta' if needed
            autoConnect
        >
            <WalletModalProvider>
                {children}
            </WalletModalProvider>
        </WalletProvider>
    );
};