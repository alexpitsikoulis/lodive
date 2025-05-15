import { useAppState } from "../components/AppState";
// import {RegisterEvent} from "../components/RegisterEvent";
import {EventToggleButton} from "../components/EventToggleButton";
import { Form, Input, Button, message, InputNumber } from 'antd';
import { Transaction, WalletAdapterNetwork } from "@demox-labs/aleo-wallet-adapter-base";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";

export default function EventOwner() {
    const { publicKey, networkClient, bhp, stringToBits, DEPLOYED_PROGRAM_ID } = useAppState();
    const { wallet, adapter } = useWallet();

    return (
        <div>
            <h1>Event Management</h1>
            <Form
                layout="vertical"
                onFinish={(form) => {
                    // 42150u64
                    const eventID = form.eventId;
                    const venueId = bhp.hash(stringToBits(venueName));
                    const inputs = [`${eventID}`,];

                    const tx = Transaction.createTransaction(
                        publicKey,                          // Caller’s address
                        WalletAdapterNetwork.TestnetBeta,   // Chain ID (make sure it matches what the network expects)
                        DEPLOYED_PROGRAM_ID,                // Program ID exactly as deployed
                        form.functionName,                   // Function name to call
                        inputs,                             // Array of input strings
                        42150,                              // Fee amount
                        false                               // Fee is public (false)
                    );

                    // const txId = wallet.adapter.requestTransaction(tx).then(res => console.log(res));

                    // Do all the transaction stuff here
                }}
                onFinishFailed={() => alert("Event Management Failed")}
            >
                <Form.Item
                    name="eventId"
                    label="Event ID"
                    rules={[{ required: true, message: 'Event ID is required' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="functionName"
                    label="Manage Event State"
                    rules={[{ required: true, message: 'Please toggle the event state' }]}
                >
                <EventToggleButton />
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