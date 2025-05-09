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
        // Number of tickets initially available for the event.
        initial_ticket_supply: u32,
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
    // Mapping of event ids to the sums the event owners are owed.
    mapping payouts: field => u64;


    //////////////////////////////////
    /// Define the tickets record. ///
    //////////////////////////////////
    record Tickets {
        owner: address,
        // Unique identifier for the event.
        event_id: field,
        // Number of tickets purchased.
        num_tickets: u32,
        // Price per ticket in microcredits.
        ticket_price: u64,
    }

    // Struct representing a ticket holder for an event. To be hashed as the key for the `tickets_sold` mapping.
    struct TicketHolder {
        // Unique identifier for the event.
        event_id: field,
        // Hash of the address of the ticket holder.
        owner_hash: field,
    }

    // Mapping of TicketHolder to the number of tickets the records hold.
    mapping tickets_sold: TicketHolder => u32;

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
            initial_ticket_supply: ticket_supply,
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

    /////////////////////////////////
    /// Buy tickets for an event. ///
    /////////////////////////////////
    async transition buy_tickets(
        event_id: field,
        num_tickets: u32,
        ticket_price: u64,
        buyer_record: credits.aleo/credits,
    ) -> (Tickets, credits.aleo/credits, Future) {
        let (change, transfer_fut): (credits.aleo/credits, Future) = credits.aleo/transfer_private_to_public(
            buyer_record,
            lodive.aleo,
            ticket_price * num_tickets as u64,
        );

        let tickets: Tickets = Tickets {
            owner: self.caller,
            event_id,
            num_tickets,
            ticket_price,
        };

        return (tickets, change, finalize_buy_tickets(
            event_id,
            num_tickets,
            ticket_price,
            BHP1024::hash_to_field(self.caller),
            transfer_fut,
        ));
    }

    async function finalize_buy_tickets(
        event_id: field,
        num_tickets: u32,
        ticket_price: u64,
        caller_hash: field,
        transfer_fut: Future,
    ) {
        let event: Event = events.get(event_id);
        // Ensure the ticket price is correct.
        assert(event.ticket_price.eq(ticket_price));
        // Ensure the event has enough tickets remaining.
        assert(event.ticket_supply.gte(num_tickets));

        // Ensure the event has not already ended.
        assert(!event.is_ended);
        // Ensure the event has not already been refunded.
        assert(!event.is_refunded);

        // Ensure the buyer is not the event owner.
        assert_neq(caller_hash, BHP1024::hash_to_field(event.event_owner));

        let venue: Venue = venues.get(event.venue_id);
        // Esnure the buyer is not the venue owner.
        assert_eq(caller_hash, BHP1024::hash_to_field(venue.venue_owner));

        // Decrement the ticket supply.
        let new_ticket_supply: u32 = event.ticket_supply - num_tickets;

        events.set(event_id, Event {
            id: event.id,
            venue_id: event.venue_id,
            ticket_supply: new_ticket_supply,
            initial_ticket_supply: event.initial_ticket_supply,
            ticket_price: event.ticket_price,
            redeemed_tickets: event.redeemed_tickets,
            is_ended: event.is_ended,
            is_refunded: event.is_refunded,
            event_owner: event.event_owner,
        });

        // Await the transfer future.
        transfer_fut.await();

        // Add the amount owed to the event owner.
        let new_payout: u64 = payouts.get_or_use(event.id, 0u64) + (ticket_price * num_tickets as u64);
        payouts.set(event.event_owner, new_payout);

        let ticket_holder: TicketHolder = TicketHolder{
            event_id,
            owner_hash: caller_hash
        };

        // Update the number of tickets sold to for the event.
        let prev_tickets_sold: u32 = tickets_sold.get_or_use(ticket_holder, 0u32);
        tickets_sold.set(ticket_holder, prev_tickets_sold + num_tickets);
    }
}
