import { useAppState } from "../components/AppState";
import { Form, Input, Button, message, InputNumber } from 'antd';
import { Transaction, WalletAdapterNetwork } from "@demox-labs/aleo-wallet-adapter-base";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";

export default function VenueOwner() {
    const { publicKey, networkClient, bhp, stringToBits, DEPLOYED_PROGRAM_ID } = useAppState();
    const { wallet, adapter } = useWallet();

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
                        WalletAdapterNetwork.TestnetBeta,   // Chain ID (make sure it matches what the network expects)
                        DEPLOYED_PROGRAM_ID,                // Program ID exactly as deployed
                        "register_venue",                   // Function name to call
                        inputs,                             // Array of input strings
                        42150,                              // Fee amount
                        false                               // Fee is public (false)
                    );

                    // const txId = wallet.adapter.requestTransaction(tx).then(res => console.log(res));

                    // Do all the transaction stuff here
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