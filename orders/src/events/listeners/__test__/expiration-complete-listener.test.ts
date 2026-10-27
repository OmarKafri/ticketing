import { OrderStatus, ExpirationCompleteEvent } from "@kafritickets/common";
import { ExpirtaionCompleteListener } from "../expirtation-complete-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { Order } from "../../../models/order";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new ExpirtaionCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "ds",
    price: 11,
  });
  await ticket.save();

  const order = Order.build({
    userId: "123123",
    status: OrderStatus.Created,
    expirexAt: new Date(),
    ticket: ticket,
  });

  await order.save();

  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, order, ticket, data, msg };
};

it("updates the order status to cancelled", async () => {
  const { listener, order, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.cancelled);
});

it("emits an OrderCancelled event", async () => {
  const { listener, order, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1],
  );
  expect(eventData.id).toEqual(order.id);
});

it("ack the message", async () => {
  const { listener, order, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);
  
  expect(msg.ack).toHaveBeenCalled();
});
