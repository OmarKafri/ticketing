import {
  Listener,
  ExpirationCompleteEvent,
  Subjects,
  OrderStatus,
} from "@kafritickets/common";
import { QUEUE_GROUP_NAME } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";
import { natsWrapper } from "../../nats-wrapper";

export class ExpirtaionCompleteListener extends Listener<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  queueGroupName = QUEUE_GROUP_NAME;
  async onMessage(
    data: ExpirationCompleteEvent["data"],
    msg: Message,
  ): Promise<void> {
    const order = await Order.findById(data.orderId).populate("ticket");

    if (!order) {
      throw new Error("Order Not Found!");
    }
    if (order.status === OrderStatus.Complete) {
      return msg.ack();
    }
    order.set({
      status: OrderStatus.cancelled,
    });
    await order.save();

    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: { id: order.ticket.id },
    });
    msg.ack();
  }
}
