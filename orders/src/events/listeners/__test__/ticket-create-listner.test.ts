import { TicketCreatedEvent } from "@kafritickets/common";
import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);
  // create a fake data event
  const data: TicketCreatedEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "some ticket",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  // create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, msg, data };
};

it("create and saves a ticket", async () => {
  const { listener, data, msg } = await setup();

  // call the on onMessage function with data object and message object
  await listener.onMessage(data, msg);

  // make sure all the above works and ticket is created
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
});

it("acks the message", async () => {
    const {data,msg,listener}=await setup();
  // call the on onMessage function with data object and message object
  await listener.onMessage(data,msg)
  // make sure all the above works and ticket is created(msg.ack more precise)
  expect(msg.ack).toHaveBeenCalled()
});
