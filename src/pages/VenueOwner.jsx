import { useAppState } from "../components/AppState";
import { Form, Input, Button, message, InputNumber } from 'antd';
import { Transaction, WalletAdapterNetwork } from "@demox-labs/aleo-wallet-adapter-base";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { Address, Plaintext } from "@provablehq/sdk/mainnet.js";
import axios from "axios";
import { useEffect } from "react";
import { parse as yamlParse } from "yaml";

export default function VenueOwner() {
    const { networkClient, bhp, stringToBits, DEPLOYED_PROGRAM_ID, setVenues, setOwnedVenues } = useAppState();
    const { wallet, connected, publicKey } = useWallet();

    useEffect(() => {
        if (publicKey) {
            axios.get("https://api.aleoscan.io/v2/mapping/list_program_mapping_values/lodive_v0_1_1.aleo/venues")
            .then(res => {
            const venues = res.data.result;
            const addressHash = bhp.hash(Plaintext.fromString(publicKey).toBitsLe());
            const ownedVenues = venues
                .filter(venue => {
                    const venueOwner = yamlParse(venue.value).venue_owner;
                    return venueOwner === addressHash.toString();
                })
                .map(venue => yamlParse(venue.value));
                console.log(ownedVenues)
                setOwnedVenues(ownedVenues);
            });
        }
    }, [publicKey]);

    return (
        <div>
            <h1>Venue Owner</h1>
            <Form
                layout="vertical"
                onFinish={(form) => {
                    // 42150u64
                    const venueName = form.venueName;
                    const commissionPercentage = form.commissionPercentage;
                    const venueId = bhp.hash(stringToBits(venueName));
                    const inputs = [`${venueId}`, `${commissionPercentage}u8`];

                    const tx = Transaction.createTransaction(
                        publicKey,                          // Caller’s address
                        WalletAdapterNetwork.MainnetBeta,   // Chain ID (make sure it matches what the network expects)
                        DEPLOYED_PROGRAM_ID,                // Program ID exactly as deployed
                        "register_venue",                   // Function name to call
                        inputs,                             // Array of input strings
                        82150,                              // Fee amount
                        false                               // Fee is public (false)
                    );

                    wallet.adapter.requestTransaction(tx).then(res => {
                        console.log(res);
                        alert("Venue created");
                    })
                    .catch(err => {
                        console.log(err);
                        alert("Venue creation failed");
                    });
                }}
                onFinishFailed={() => alert("Venue creation failed")}
            >
                <Form.Item
                    name="venueName"
                    label="Venue Name"
                    rules={[{ required: true, message: 'Venue name is required' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="commissionPercentage"
                    label="Commission Percentage"
                    rules={[
                        { required: true, message: 'Commission percentage is required' },
                        { type: 'number', min: 0, max: 100, message: 'Commission percentage must be between 0 and 100' }
                    ]}
                >
                    <InputNumber min={0} max={100} />
                </Form.Item>

                <Form.Item label={null}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}