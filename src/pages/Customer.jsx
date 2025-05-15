import { useEffect } from "react";
import { useAppState } from "../components/AppState";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import axios from "axios";

export default function Customer() {
    const { connected, publicKey, wallet } = useWallet();
    const { events, setEvents } = useAppState();

    useEffect(() => {
        console.log("Fetching events");
        axios.get("https://api.testnet.aleoscan.io/v2/mapping/list_program_mapping_values/lodive_v0_1_0.aleo/events")
            .then(res => {
                console.log(res)
                setEvents(res.data.result);
            })
            .catch(err => {
                console.log(err);
            });
    }, [connected]);

    return (
        <div>
            <h1>Customer</h1>
        </div>
    )
}