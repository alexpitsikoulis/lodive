import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAppState } from "../components/AppState";

export default function Event() {
    const { name } = useParams();
    const { bhp, stringToBits } = useAppState();

    const [eventNameHash, setEventNameHash] = useState(name);

    useEffect(() => {
        const nameHash = bhp.hash(stringToBits(name)).toString();
        setEventNameHash(nameHash);
    }, [name]);

    return (
        <div>
            <h1>Event</h1>
            <p>{name}</p>
            <p>{eventNameHash}</p>
        </div>
    )
}