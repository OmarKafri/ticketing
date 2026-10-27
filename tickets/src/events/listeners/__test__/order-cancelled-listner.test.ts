import { OrderCancelledEvent } from "@kafritickets/common";
import mongoose from "mongoose";

import { Ticket } from "../../../models/ticket";
import { OrderCancelledListener } from "../order-canceled-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: "sometitle",
    price: 10,
    userId: "dsdasdqw",
  });
  ticket.set({ orderId: orderId });
  await ticket.save();
  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { orderId, ticket, msg, listener, data };
};

it("updates the ticket, publishes an event, and acks the message", async () => {
  const { orderId, ticket, msg, listener, data } = await setup();
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
