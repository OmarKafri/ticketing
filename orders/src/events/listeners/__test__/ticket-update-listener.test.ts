import mongoose from "mongoose";
import { TicketUpdatedEvent } from "@kafritickets/common";
import { Message } from "node-nats-streaming";

import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { TicketUpdatedListner } from "../ticket-updated-lisenter";

const setup = async () => {
  // create a lisener
  const listener = new TicketUpdatedListner(natsWrapper.client);
  // create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "omar",
    price: 12,
  });
  await ticket.save();
  // create a fake data object
  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: "ssssssssssssssss",
    price: 20,
    userId: "whatever",
  };
  //create a fakse msg object
  //@ts-expect-error
  const msg: Message = {
    ack: jest.fn(),
  };
  // return all
  return { ticket, data, msg, listener };
};

it("finds,updates, and saves a ticket", async () => {
  const { msg, data, ticket, listener } = await setup();

  await listener.onMessage(data, msg);
  const updatedTikcet = await Ticket.findById(ticket.id);
  expect(updatedTikcet!.title).toEqual(data.title);
  expect(updatedTikcet!.price).toEqual(data.price);
  expect(updatedTikcet!.version).toEqual(data.version);
});

it("it acks the message", async () => {
  const { msg, data, ticket, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("doesnt call the ack function if the event has skipped version number", async () => {
  const { msg, ticket, data, listener } = await setup();

  data.version = 10; // far version number;
  try {
    await listener.onMessage(data, msg);
  } catch (error) {

  }
  expect(msg.ack).not.toHaveBeenCalled()
});
