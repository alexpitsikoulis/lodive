import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import React, { useEffect, useState } from "react";
import { AleoNetworkClient } from "@provablehq/sdk/mainnet.js";
import { useAppState } from "./AppState";

export const LatestBalance = () => {
  const { publicKey } = useWallet();
  const { gameLoading } = useAppState();

  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);

  const formatBalance = () => {
    const [whole, decimal] = balance.toString().split(".");
    
    return `${whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${decimal}`
  }

  useEffect(() => {
    if (gameLoading) {
      return;
    }
    // Create a network client using the explorer endpoint.
    const networkClient = new AleoNetworkClient("https://api.explorer.provable.com/v1");
    
    // Async function to fetch the balance.
    const fetchBalance = async () => {
      setBalanceLoading(true);
      try {
        // Query the mapping "credits.aleo" for the given address.
        // You may need to adjust the mapping key based on your deployed program.
        const public_balance = parseInt((await networkClient.getProgramMappingValue("credits.aleo", "account", publicKey)).replace("u64", "")) / 1_000_000;
        setBalance(public_balance);
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setBalanceLoading(false);
      }
    };

    if (publicKey) {
      fetchBalance();
    }
  }, [publicKey, gameLoading]);

  return (
    <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h3>💵 Current Balance</h3>
      {balanceLoading ? (
          <p>Loading balance...</p>
      ) : (
        <p>
          <strong>Balance:</strong> {formatBalance()} ALEO
        </p>
      )}
    </div>
  );
};
