import {
  OrderCancelledEvent,
  Listener,
  Subjects,
  OrderStatus,
} from "@kafritickets/common";
import { QUEUE_GROUP_NAME } from "../queue-gruop-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = QUEUE_GROUP_NAME;
  async onMessage(
    data: OrderCancelledEvent["data"],
    msg: Message,
  ): Promise<void> {
    let order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });
    if (!order) {
      throw new Error("Order Not Found!!");
    }
    order.set({ status: OrderStatus.cancelled });
    await order.save();
    msg.ack();
  }
}
