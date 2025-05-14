import { createBrowserRouter } from "react-router-dom";
import Main from "./main.jsx";
import Customer from "./pages/Customer.jsx";
import EventOwner from "./pages/EventOwner.jsx";
import VenueOwner from "./pages/VenueOwner.jsx";
import Tickets from "./pages/Tickets.jsx";

export const router = createBrowserRouter([
    {
        element: <Main />,
        children: [
            {
                path: "/",
                element: (
                    <>
                        <Customer />
                    </>
                )
            },
            {
                path: "/event-management",
                element: (
                    <>
                        <EventOwner />
                    </>
                )
            },
            {
                path: "/venue-management",
                element: (
                    <>
                        <VenueOwner />
                    </>
                )
            },
            {
                path: "/my-tickets",
                element: (
                    <>
                        <Tickets />
                    </>
                )
            },
        ]
    },
]);
