import { Button } from "antd";
import { LatestBalance } from "./LatestBalance";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react"

export const WalletDisplay = () => {
    const { disconnect, publicKey } = useWallet();

    return (
        <div style={{ margin: "20px 5% 0 5%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", overflowWrap: "break-word", width: "90%" }}>
        {publicKey ?
        <div>
            <h3>✅ Connected Wallet</h3>
            <p><strong>Wallet Address:</strong> <a href={`https://testnet.explorer.provable.com/address/${publicKey}`} target="_">{publicKey}</a></p>
            <Button style={{ marginTop: "1vh" }} onClick={disconnect}>Disconnect</Button>
            <LatestBalance userAddress={publicKey} />
        </div>
        :
        <p>🔴 Select a wallet to connect.</p>}
        </div>
    )
}