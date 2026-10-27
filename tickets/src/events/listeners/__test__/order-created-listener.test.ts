import { OrderCreatedListner } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { OrderCreatedEvent, OrderStatus } from "@kafritickets/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

const setup = async () => {
  //create an instance of the listener
  const listener = new OrderCreatedListner(natsWrapper.client);

  //create and save a ticket
  const ticket = Ticket.build({
    title: "something",
    price: 10,
    userId: "sdsadasd",
  });
  await ticket.save();

  //create fake data event
  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: "assdsad",
    expiresAt: "sdasd",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { ticket, listener, data, msg };
};

it("sets the user id of the ticket", async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const updateTicket = await Ticket.findById(ticket.id);
  expect(updateTicket?.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  //@ts-ignore
  console.log(natsWrapper.client.publish.mock.calls);
  //@ts-ignore
  expect(JSON.parse(natsWrapper.client.publish.mock.calls[0][1]).orderId).toEqual(data.id)

});
