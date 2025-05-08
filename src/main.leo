import credits.aleo;

program lodive.aleo {

    ///////////////////////////////////////////////////////////////////
    /// Define the venue structure. A venue is made up of sections. ///
    ///////////////////////////////////////////////////////////////////
    struct Venue {
        // Unique identifier of the venue.
        id: field,
        // The percentage of ticket sales the venue is entitled to, represented as a whole-number percentage and restricted to 0-100.
        commission_rate: u8,
        // The hash of the address of the venue owner.
        venue_owner: field,
    }

    // Mapping of venues by id.
    mapping venues: field => Venue;

    ///////////////////////////////////
    /// Define the event structure. ///
    ///////////////////////////////////
    struct Event {
        // Unique identifier for the event.
        id: field,
        // ID of the venue hosting the event.
        venue_id: field,
        // Number of tickets available for the event.
        ticket_supply: u32,
        // Price per ticket in microcredits.
        ticket_price: u64,
        // Number of sold tickets which have been redeemed.
        redeemed_tickets: u32,
        // Boolean value denoting whether or not the event has ended.
        is_ended: bool,
        // Boolean value denoting whether or not a refund has been issued.
        is_refunded: bool,
        // Hash of the address of the owner of the event who will receive payment for purchased tickets.
        event_owner: field,
    }

    // Mapping of events by id.
    mapping events: field => Event;
    // Mapping of event owner address hashes to the sums they are owed.
    mapping payouts: field => u64;


    //////////////////////////////////
    /// Define the tickets record. ///
    //////////////////////////////////
    record Tickets {
        owner: address,
        event_id: field,
        num_tickets: u32,
        ticket_price: u64,
    }

    ///////////////////////////
    /// Initialize a venue. ///
    ///////////////////////////
    async transition register_venue(
        id: field,
        commission_rate: u8,
    ) -> Future {
        let venue: Venue = Venue {
            id,
            commission_rate,
            venue_owner: BHP1024::hash_to_field(self.caller),
        };
        return finalize_register_venue(venue);
    }

    async function finalize_register_venue(venue: Venue) {
        // Ensure the venue does not already exist in the mapping.
        assert(!venues.contains(venue.id));
        venues.set(venue.id, venue);

        // If the venue owner does not exist in the payouts mapping yet, add them.
        if !payouts.contains(venue.venue_owner) {
            payouts.set(venue.venue_owner, 0u64);
        }
    }

    ///////////////////////////////////////////////////////////////
    /// Initialize an event and add it to the `events` mapping. ///
    ///////////////////////////////////////////////////////////////
    async transition register_event(
        id: field,
        ticket_supply: u32,
        ticket_price: u64,
        venue_id: field,
        event_owner: field,
    ) -> Future {
        let event: Event = Event {
            id,
            ticket_supply,
            ticket_price,
            redeemed_tickets: 0u32,
            is_ended: false,
            is_refunded: false,
            event_owner,
            venue_id,
        };

        let caller_hash: field = BHP1024::hash_to_field(self.caller);

        return finalize_register_event(event, caller_hash);
    }

    async function finalize_register_event(event: Event, caller_hash: field) {
        // Ensure the event does not already exist in the mapping.
        assert(!events.contains(event.id));
        events.set(event.id, event);

        // Ensure the event is being created by the owner of its venue.
        let venue: Venue = venues.get(event.venue_id);
        assert_eq(caller_hash, venue.venue_owner);

        // If the event owner does not exist in the payouts mapping yet, add them.
        if !payouts.contains(event.event_owner) {
            payouts.set(event.event_owner, 0u64);
        }
    }
}
