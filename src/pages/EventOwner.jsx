import { useAppState } from "../components/AppState";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { Transaction, WalletAdapterNetwork } from "@demox-labs/aleo-wallet-adapter-base";
import axios from "axios";
import { parse as yamlParse } from "yaml";
import { Plaintext } from "@provablehq/sdk";
import { useEffect } from "react";
import { Form, Input, Button, message, InputNumber } from 'antd';
export default function EventOwner() {
    const { networkClient, bhp, stringToBits, DEPLOYED_PROGRAM_ID, setEvents, setOwnedEvents, setOwnedVenues, ownedEvents} = useAppState();
    const { wallet, publicKey } = useWallet();

    useEffect(() => {
        if (publicKey) {
            axios.get("https://api.testnet.aleoscan.io/v2/mapping/list_program_mapping_values/lodive_v0_1_0.aleo/events")
            .then(res => {
                const events = res.data.result;
                const addressHash = bhp.hash(Plaintext.fromString(publicKey).toBitsLe());
                const ownedEvents = events
                    .filter(event => {
                        const eventOwner = yamlParse(event.value).event_owner;
                        return eventOwner === addressHash.toString();
                })
                .map(event => yamlParse(event.value));
                console.log(ownedEvents)
                setOwnedEvents(ownedEvents);
            })

            axios.get("https://api.testnet.aleoscan.io/v2/mapping/list_program_mapping_values/lodive_v0_1_0.aleo/venues")
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
            <Form
                layout="vertical"
                onFinish={(form) => {
                    const eventName = form.event_name;
                    const eventId = bhp.hash(stringToBits(eventName));
                    const eventVenue = form.event_venue;
                    const venueId = bhp.hash(stringToBits(eventVenue));
                    const ticketSupply = form.ticket_supply;
                    const ticketPrice = form.ticket_price;
                    const eventOwner = form.event_owner;
                    const ownerHash = bhp.hash(Plaintext.fromString(eventOwner).toBitsLe());

                    const inputs = [`${eventId}`, `${ticketSupply}u32`, `${ticketPrice}u64`, `${venueId}`, `${ownerHash}`];

                    const tx = Transaction.createTransaction(
                        publicKey,                          // Caller’s address
                        WalletAdapterNetwork.TestnetBeta,   // Chain ID (make sure it matches what the network expects)
                        DEPLOYED_PROGRAM_ID,                // Program ID exactly as deployed
                        "register_event",                   // Function name to call
                        inputs,                             // Array of input strings
                        82150,                              // Fee amount
                        false                               // Fee is public (false)
                    );

                    wallet.adapter.requestTransaction(tx).then(res => {
                        console.log(res);
                        alert("Event created");
                    })
                    .catch(err => {
                        console.log(err);
                        alert("Event creation failed");
                    });
                }}
            >
                <Form.Item label="Event Name" name="event_name">
                    <Input />
                </Form.Item>

                <Form.Item label="Event Venue" name="event_venue">
                    <Input />
                </Form.Item>

                <Form.Item label="Ticket Supply" name="ticket_supply">
                    <InputNumber />
                </Form.Item>

                <Form.Item label="Ticket Price" name="ticket_price">
                    <InputNumber min={1} />
                </Form.Item>
                
                <Form.Item label="Event Owner" name="event_owner">
                    <Input />
                </Form.Item>
                
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>

            <h1>My Events</h1>
            {ownedEvents.map(event => (
                <div style={{ border: "1px solid white", padding: "5px", borderRadius: "5px" }}>
                    <h2>{event.event_id}</h2>
                    <p>{event.venue_id}</p>
                    <p>{event.ticket_supply}</p>
                    <p>{event.ticket_price}</p>
                    <Button type="primary" onClick={() => {
                        const tx = Transaction.createTransaction(
                            publicKey,                          // Caller’s address
                            WalletAdapterNetwork.TestnetBeta,   // Chain ID (make sure it matches what the network expects)
                            DEPLOYED_PROGRAM_ID,                // Program ID exactly as deployed
                            "start_event",                   // Function name to call
                            [`${event.id}`],                             // Array of input strings
                            82150,                              // Fee amount
                            false                               // Fee is public (false)
                        );

                        wallet.adapter.requestTransaction(tx).then(res => {
                            console.log(res);
                            alert("Event started");
                        })
                        .catch(err => {
                            console.log(err);
                            alert("Event start failed");
                        });
                    }}>
                        {!event.is_started && !event.is_ended ? "Start Event" : "End Event"}
                    </Button>
                </div>
            ))}
        </div>
    )
}