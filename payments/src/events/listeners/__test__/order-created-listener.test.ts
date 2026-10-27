import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import { OrderCreatedEvent, OrderStatus } from "@kafritickets/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";

const setup = async () => {
  let listener = new OrderCreatedListener(natsWrapper.client);
  let data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: "asda",
    userId: "sdasd",
    status: OrderStatus.Created,
    ticket: {
      id: "dsadasd",
      price: 10,
    },
  };
  //@ts-ignore
  let msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg };
};

it("replicates the order info", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order!.price).toEqual(data.ticket.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
