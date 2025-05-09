import credits.aleo;
program lodive.aleo;

record Tickets:
    owner as address.private;
    event_id as field.private;
    num_tickets as u32.private;
    ticket_price as u64.private;

struct Venue:
    id as field;
    commission_rate as u8;
    venue_owner as field;

struct Event:
    id as field;
    venue_id as field;
    ticket_supply as u32;
    initial_ticket_supply as u32;
    ticket_price as u64;
    redeemed_tickets as u32;
    is_ended as boolean;
    is_refunded as boolean;
    event_owner as field;

mapping venues:
    key as field.public;
    value as Venue.public;

mapping events:
    key as field.public;
    value as Event.public;

mapping payouts:
    key as field.public;
    value as u64.public;

function register_venue:
    input r0 as field.private;
    input r1 as u8.private;
    hash.bhp1024 self.caller into r2 as field;
    cast r0 r1 r2 into r3 as Venue;
    async register_venue r3 into r4;
    output r4 as lodive.aleo/register_venue.future;

finalize register_venue:
    input r0 as Venue.public;
    contains venues[r0.id] into r1;
    not r1 into r2;
    assert.eq r2 true;
    set r0 into venues[r0.id];
    contains payouts[r0.venue_owner] into r3;
    not r3 into r4;
    branch.eq r4 false to end_then_0_0;
    set 0u64 into payouts[r0.venue_owner];
    branch.eq true true to end_otherwise_0_1;
    position end_then_0_0;
    position end_otherwise_0_1;

function register_event:
    input r0 as field.private;
    input r1 as u32.private;
    input r2 as u64.private;
    input r3 as field.private;
    input r4 as field.private;
    cast r0 r3 r1 r1 r2 0u32 false false r4 into r5 as Event;
    hash.bhp1024 self.caller into r6 as field;
    async register_event r5 r6 into r7;
    output r7 as lodive.aleo/register_event.future;

finalize register_event:
    input r0 as Event.public;
    input r1 as field.public;
    contains events[r0.id] into r2;
    not r2 into r3;
    assert.eq r3 true;
    set r0 into events[r0.id];
    get venues[r0.venue_id] into r4;
    assert.eq r1 r4.venue_owner;
    contains payouts[r0.event_owner] into r5;
    not r5 into r6;
    branch.eq r6 false to end_then_0_2;
    set 0u64 into payouts[r0.event_owner];
    branch.eq true true to end_otherwise_0_3;
    position end_then_0_2;
    position end_otherwise_0_3;

function buy_tickets:
    input r0 as field.private;
    input r1 as u32.private;
    input r2 as u64.private;
    input r3 as credits.aleo/credits.record;
    cast r1 into r4 as u64;
    mul r2 r4 into r5;
    call credits.aleo/transfer_private_to_public r3 lodive.aleo r5 into r6 r7;
    cast self.caller r0 r1 r2 into r8 as Tickets.record;
    hash.bhp1024 self.caller into r9 as field;
    async buy_tickets r0 r1 r2 r9 r7 into r10;
    output r8 as Tickets.record;
    output r6 as credits.aleo/credits.record;
    output r10 as lodive.aleo/buy_tickets.future;

finalize buy_tickets:
    input r0 as field.public;
    input r1 as u32.public;
    input r2 as u64.public;
    input r3 as field.public;
    input r4 as credits.aleo/transfer_private_to_public.future;
    get events[r0] into r5;
    is.eq r5.ticket_price r2 into r6;
    assert.eq r6 true;
    gte r5.ticket_supply r1 into r7;
    assert.eq r7 true;
    not r5.is_ended into r8;
    assert.eq r8 true;
    not r5.is_refunded into r9;
    assert.eq r9 true;
    hash.bhp1024 r5.event_owner into r10 as field;
    assert.neq r3 r10;
    get venues[r5.venue_id] into r11;
    hash.bhp1024 r11.venue_owner into r12 as field;
    assert.eq r3 r12;
    sub r5.ticket_supply r1 into r13;
    cast r5.id r5.venue_id r13 r5.initial_ticket_supply r5.ticket_price r5.redeemed_tickets r5.is_ended r5.is_refunded r5.event_owner into r14 as Event;
    set r14 into events[r0];
    await r4;
    get.or_use payouts[r5.id] 0u64 into r15;
    cast r1 into r16 as u64;
    mul r2 r16 into r17;
    add r15 r17 into r18;
    set r18 into payouts[r5.event_owner];
