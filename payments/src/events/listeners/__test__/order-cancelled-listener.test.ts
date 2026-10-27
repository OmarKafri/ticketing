import { OrderCancelledEvent, OrderStatus } from "@kafritickets/common";
import { OrderCancelledListener } from "../order-cancelled-listener";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    status: OrderStatus.Created,
    userId: "dasdasd",
    version: 0,
  });
  await order.save();

  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    ticket: { id: "dsad" },
    version: 1,
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { data, listener, msg, order };
};

it("updates the status of the order", async () => {
  const { listener, data, order, msg } = await setup();
  await listener.onMessage(data, msg);

  const updateOrder = await Order.findById(order.id);

  expect(updateOrder!.status).toEqual(OrderStatus.cancelled);
});

it("acks the message", async () => {
  const { listener, data, order, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
