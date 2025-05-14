import React, { createContext, useContext, useEffect, useState } from "react";
import { Address, AleoNetworkClient, BHP1024 } from "@provablehq/sdk";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";

// Create the context with a default value
const DataContext = createContext({});

// Custom hook to use the context
export const useAppState = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
};

// Define the data structure
export const AppState = ({ children }) => {

    const { connected, publicKey } = useWallet();

    // Instantiate an AleoNetworkClient. Used in the case of this application to query program mappings.
    const networkClient = new AleoNetworkClient("https://api.explorer.provable.com/v1");
    // Instantiate a BHP256 hasher.
    const bhp = new BHP1024();

    const [appState, setAppState] = useState({
        adapterTxStatus: "",
        txStatus: "",
        transactionId: "",
    });

    const setAdapterTxStatus = (newStatus) => {
        setAppState(prevState => ({
            ...prevState,
            adapterTxStatus: newStatus,
        }))
    }

    const setTxStatus = (newStatus) => {
        setAppState(prevState => ({
            ...prevState,
            txStatus: newStatus,
        }))
    }

    const setTransactionId = (newTransactionId) => {
        setAppState(prevState => ({
            ...prevState,
            transactionId: newTransactionId,
        }))
    }

    const stringToBits = (str) =>  {
        let bitStr = Array.from(str)
            .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
            .join('');
        return Array.from(bitStr)
            .map(bit => bit === "1");
    }

    return (
        <DataContext.Provider
            value={{
                DEPLOYED_PROGRAM_ID: "lodive_v0_1_0.aleo",
                adapterTxStatus: appState.adapterTxStatus,
                setAdapterTxStatus,
                txStatus: appState.txStatus,
                setTxStatus,
                transactionId: appState.transactionId,
                setTransactionId,
                networkClient,
                bhp,
                stringToBits,
            }}
        >
            {children}
        </DataContext.Provider>
    )
}